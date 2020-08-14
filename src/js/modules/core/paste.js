import FE from '../../editor.js'

Object.assign(FE.DEFAULTS, {
  pastePlain: false,
  pasteDeniedTags: ['colgroup', 'col', 'meta'],
  pasteDeniedAttrs: ['class', 'id'],
  pasteAllowedStyleProps: ['.*'],
  pasteAllowLocalImages: false
})

FE.MODULES.paste = function (editor) {
  const $ = editor.$

  let clipboard_html
  let clipboard_rtf
  let $paste_div
  let snapshot

  function saveCopiedText(html, plain) {
    try {
      editor.win.localStorage.setItem('fr-copied-html', html)
      editor.win.localStorage.setItem('fr-copied-text', plain)
    }
    catch (ex) {
      // do no matter what
    }
  }

  /**
   * Handle copy and cut.
   */
  function _handleCopy(e) {
    const copied_html = editor.html.getSelected()
    saveCopiedText(copied_html, $(editor.doc.createElement('div')).html(copied_html).text())

    if (e.type === 'cut') {
      editor.undo.saveStep()

      setTimeout(() => {
        editor.selection.save()
        editor.html.wrap()
        editor.selection.restore()
        editor.events.focus()
        editor.undo.saveStep()
      }, 0)
    }
  }

  /**
   * Handle pasting.
   */
  let stop_paste = false

  function _handlePaste(e) {

    // if content is copied in input tag do the normal paste.
    if (e.target.nodeName === 'INPUT' && e.target.type === 'text') {
      return true
    }

    if (editor.edit.isDisabled()) {
      return false
    }

    // https://github.com/froala-labs/froala-editor-js-2/issues/2067
    if (isContetnEditable(e.target)) {
      return false
    }

    if (stop_paste) {

      return false
    }

    if (e.originalEvent) {
      e = e.originalEvent
    }

    if (editor.events.trigger('paste.before', [e]) === false) {
      e.preventDefault()

      return false
    }

    // Read data from clipboard.
    if (e && e.clipboardData && e.clipboardData.getData) {
      let types = ''
      const clipboard_types = e.clipboardData.types

      if (editor.helpers.isArray(clipboard_types)) {
        for (let i = 0; i < clipboard_types.length; i++) {
          types += `${clipboard_types[i]};`
        }
      }
      else {
        types = clipboard_types
      }

      clipboard_html = ''

      // Get rtf clipboard.
      if (/text\/rtf/.test(types)) {
        clipboard_rtf = e.clipboardData.getData('text/rtf')
      }

      // HTML.
      if (/text\/html/.test(types) && !editor.browser.safari) {
        clipboard_html = e.clipboardData.getData('text/html')
      }

      // Safari HTML.
      else if (/text\/rtf/.test(types) && editor.browser.safari) {
        clipboard_html = clipboard_rtf
      }

      // Safari HTML for iOS.
      else if (/public.rtf/.test(types) && editor.browser.safari) {
        clipboard_html = e.clipboardData.getData('text/rtf')
      }

      if (clipboard_html !== '') {
        _processPaste()

        if (e.preventDefault) {
          e.stopPropagation()
          e.preventDefault()
        }

        return false
      }

      clipboard_html = null

    }

    // Normal paste.
    _beforePaste()

    return false
  }

  /**
   * check for contentEditable.
   */
  function isContetnEditable (el) {
    return el && el.contentEditable === 'false'
  }

  /**
   * Handle dropping content in the editor.
   */
  function _dropPaste(e) {
    if (e.originalEvent) {
      e = e.originalEvent
    }

    // https://github.com/froala-labs/froala-editor-js-2/issues/2067
    if (isContetnEditable(e.target)) {
      return false
    }

    // Read data from clipboard.
    if (e && e.dataTransfer && e.dataTransfer.getData) {
      let types = ''
      const clipboard_types = e.dataTransfer.types

      if (editor.helpers.isArray(clipboard_types)) {
        for (let i = 0; i < clipboard_types.length; i++) {
          types += `${clipboard_types[i]};`
        }
      }
      else {
        types = clipboard_types
      }

      clipboard_html = ''

      // Get rtf clipboard.
      if (/text\/rtf/.test(types)) {
        clipboard_rtf = e.dataTransfer.getData('text/rtf')
      }

      // HTML.
      if (/text\/html/.test(types)) {
        clipboard_html = e.dataTransfer.getData('text/html')
      }

      // Safari HTML.
      else if (/text\/rtf/.test(types) && editor.browser.safari) {
        clipboard_html = clipboard_rtf
      }
      else if (/text\/plain/.test(types) && !this.browser.mozilla) {
        clipboard_html = editor.html.escapeEntities(e.dataTransfer.getData('text/plain')).replace(/\n/g, '<br>')
      }

      if (clipboard_html !== '') {
        editor.keys.forceUndo()
        snapshot = editor.snapshot.get()

        // Save selection, but change markers class so that we can restore it later.
        editor.selection.save()
        editor.$el.find('.fr-marker').removeClass('fr-marker').addClass('fr-marker-helper')

        // Insert marker point helper and change class to restore it later.
        const ok = editor.markers.insertAtPoint(e)
        editor.$el.find('.fr-marker').removeClass('fr-marker').addClass('fr-marker-placeholder')

        // Restore selection and remove it.
        editor.$el.find('.fr-marker-helper').addClass('fr-marker').removeClass('fr-marker-helper')
        editor.selection.restore()
        editor.selection.remove()

        // Restore marker point helper.
        editor.$el.find('.fr-marker-placeholder').addClass('fr-marker').removeClass('fr-marker-placeholder')

        if (ok !== false) {
          // Insert markers.
          const marker = editor.el.querySelector('.fr-marker')

          $(marker).replaceWith(FE.MARKERS)
          editor.selection.restore()

          _processPaste()

          if (e.preventDefault) {
            e.stopPropagation()
            e.preventDefault()
          }

          return false
        }
      }
      else {
        clipboard_html = null
      }
    }
  }

  /**
   * Before starting to paste.
   */
  function _beforePaste() {

    // Save selection
    editor.selection.save()
    editor.events.disableBlur()

    // Set clipboard HTML.
    clipboard_html = null

    // Remove and store the editable content
    if (!$paste_div) {
      $paste_div = $('<div contenteditable="true" style="position: fixed; top: 0; left: -9999px; height: 100%; width: 0; word-break: break-all; overflow:hidden; z-index: 2147483647; line-height: 140%; -moz-user-select: text; -webkit-user-select: text; -ms-user-select: text; user-select: text;" tabIndex="-1"></div>')

      // Sketch app fix. https://github.com/froala/wysiwyg-editor/issues/2042
      // Also: when using iframe Safari needs to have focus in the same window.
      if (editor.browser.webkit || editor.browser.mozilla) {
        $paste_div.css('top', editor.$sc.scrollTop())
        editor.$el.after($paste_div)
      }
      else if (editor.browser.edge && editor.opts.iframe) {
        editor.$el.append($paste_div)
      }
      else {
        editor.$box.after($paste_div)
      }

      editor.events.on('destroy', () => {
        $paste_div.remove()
      })
    }
    else {
      $paste_div.html('')

      if (editor.browser.edge && editor.opts.iframe) {
        editor.$el.append($paste_div)
      }
    }

    let st;

    // Prevent iOS scroll.
    if (editor.helpers.isIOS() && editor.$sc) {
      st = editor.$sc.scrollTop();
    }

    // Focus on the pasted div.
    if (editor.opts.iframe) {
      editor.$el.attr('contenteditable', 'false')
    }
    $paste_div.focus()

    // Prevent iOS scroll.
    if (editor.helpers.isIOS() && editor.$sc) {
      editor.$sc.scrollTop(st);
    }

    // Process paste soon.
    editor.win.setTimeout(_processPaste, 1)
  }

  /**
   * Clean HTML that was pasted from Word.
   */
  function _wordClean(html) {

    let i

    // Single item list.
    html = html.replace(
      /<p(.*?)class="?'?MsoListParagraph"?'? ([\s\S]*?)>([\s\S]*?)<\/p>/gi,
      '<ul><li>$3</li></ul>'
    )
    html = html.replace(
      /<p(.*?)class="?'?NumberedText"?'? ([\s\S]*?)>([\s\S]*?)<\/p>/gi,
      '<ol><li>$3</li></ol>'
    )

    // List start.
    html = html.replace(
      /<p(.*?)class="?'?MsoListParagraphCxSpFirst"?'?([\s\S]*?)(level\d)?([\s\S]*?)>([\s\S]*?)<\/p>/gi,
      '<ul><li$3>$5</li>'
    )
    html = html.replace(
      /<p(.*?)class="?'?NumberedTextCxSpFirst"?'?([\s\S]*?)(level\d)?([\s\S]*?)>([\s\S]*?)<\/p>/gi,
      '<ol><li$3>$5</li>'
    )

    // List middle.
    html = html.replace(
      /<p(.*?)class="?'?MsoListParagraphCxSpMiddle"?'?([\s\S]*?)(level\d)?([\s\S]*?)>([\s\S]*?)<\/p>/gi,
      '<li$3>$5</li>'
    )
    html = html.replace(
      /<p(.*?)class="?'?NumberedTextCxSpMiddle"?'?([\s\S]*?)(level\d)?([\s\S]*?)>([\s\S]*?)<\/p>/gi,
      '<li$3>$5</li>'
    )
    html = html.replace(
      /<p(.*?)class="?'?MsoListBullet"?'?([\s\S]*?)(level\d)?([\s\S]*?)>([\s\S]*?)<\/p>/gi,
      '<li$3>$5</li>'
    )

    // List end.
    html = html.replace(
      /<p(.*?)class="?'?MsoListParagraphCxSpLast"?'?([\s\S]*?)(level\d)?([\s\S]*?)>([\s\S]*?)<\/p>/gi,
      '<li$3>$5</li></ul>'
    )
    html = html.replace(
      /<p(.*?)class="?'?NumberedTextCxSpLast"?'?([\s\S]*?)(level\d)?([\s\S]*?)>([\s\S]*?)<\/p>/gi,
      '<li$3>$5</li></ol>'
    )

    // Clean list bullets.
    html = html.replace(/<span([^<]*?)style="?'?mso-list:Ignore"?'?([\s\S]*?)>([\s\S]*?)<span/gi, '<span><span')

    // Webkit clean list bullets.
    html = html.replace(/<!--\[if !supportLists\]-->([\s\S]*?)<!--\[endif\]-->/gi, '')
    html = html.replace(/<!\[if !supportLists\]>([\s\S]*?)<!\[endif\]>/gi, '')

    // Remove mso classes.
    html = html.replace(/(\n|\r| class=(")?Mso[a-zA-Z0-9]+(")?)/gi, ' ')

    // Remove comments.
    html = html.replace(/<!--[\s\S]*?-->/gi, '')

    // Remove tags but keep content.
    html = html.replace(/<(\/)*(meta|link|span|\\?xml:|st1:|o:|font)(.*?)>/gi, '')

    // Remove no needed tags.
    const word_tags = ['style', 'script', 'applet', 'embed', 'noframes', 'noscript']

    for (i = 0; i < word_tags.length; i++) {
      const regex = new RegExp(`<${word_tags[i]}.*?${word_tags[i]}(.*?)>`, 'gi')
      html = html.replace(regex, '')
    }

    // Remove spaces.
    html = html.replace(/&nbsp;/gi, ' ')

    // Keep empty TH and TD.
    html = html.replace(/<td([^>]*)><\/td>/g, '<td$1><br></td>')
    html = html.replace(/<th([^>]*)><\/th>/g, '<th$1><br></th>')

    // Remove empty tags.
    let oldHTML

    do {
      oldHTML = html
      html = html.replace(/<[^/>][^>]*><\/[^>]+>/gi, '')
    } while (html !== oldHTML)

    // Process list indentation.
    html = html.replace(/<lilevel([^1])([^>]*)>/gi, '<li data-indent="true"$2>')
    html = html.replace(/<lilevel1([^>]*)>/gi, '<li$1>')

    // Clean HTML.
    html = editor.clean.html(html, editor.opts.pasteDeniedTags, editor.opts.pasteDeniedAttrs)

    // Clean empty links.
    html = html.replace(/<a>(.[^<]+)<\/a>/gi, '$1')

    // https://github.com/froala/wysiwyg-editor/issues/1364.
    html = html.replace(/<br> */g, '<br>')

    // Process list indent.
    const div = editor.o_doc.createElement('div')
    div.innerHTML = html

    const lis = div.querySelectorAll('li[data-indent]')

    for (i = 0; i < lis.length; i++) {
      const li = lis[i]

      const p_li = li.previousElementSibling

      if (p_li && p_li.tagName === 'LI') {
        let list = p_li.querySelector(':scope > ul, :scope > ol')

        if (!list) {
          list = document.createElement('ul')
          p_li.appendChild(list)
        }

        list.appendChild(li)
      }
      else {
        li.removeAttribute('data-indent')
      }
    }

    editor.html.cleanBlankSpaces(div)

    html = div.innerHTML

    return html
  }

  /**
   * Plain clean.
   */
  function _plainPasteClean(html) {

    let el = null
    let i
    const div = editor.doc.createElement('div')
    div.innerHTML = html

    let els = div.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, pre, blockquote')

    for (i = 0; i < els.length; i++) {
      el = els[i]
      el.outerHTML = `<${editor.html.defaultTag() || 'DIV'}>${el.innerHTML}</${editor.html.defaultTag() || 'DIV'}>`
    }

    els = div.querySelectorAll(`*:not(${'p, div, h1, h2, h3, h4, h5, h6, pre, blockquote, ul, ol, li, table, tbody, thead, tr, td, br, img'.split(',').join('):not(')})`)

    for (i = els.length - 1; i >= 0; i--) {
      el = els[i]
      el.outerHTML = el.innerHTML
    }

    // Remove comments.
    function cleanComments(node) {
      const contents = editor.node.contents(node)

      for (let i = 0; i < contents.length; i++) {
        if (contents[i].nodeType !== Node.TEXT_NODE && contents[i].nodeType !== Node.ELEMENT_NODE) {
          contents[i].parentNode.removeChild(contents[i])
        }
        else {
          cleanComments(contents[i])
        }
      }
    }

    cleanComments(div)

    return div.innerHTML
  }

  /**
   * Process the pasted HTML.
   */
  function _processPaste() {
    if (editor.opts.iframe) {
      editor.$el.attr('contenteditable', 'true')
    }
    if (editor.browser.edge && editor.opts.iframe) {
      editor.$box.after($paste_div)
    }

    // Save undo snapshot.
    if (!snapshot) {
      editor.keys.forceUndo()
      snapshot = editor.snapshot.get()
    }

    // Cannot read from clipboard.
    if (!clipboard_html) {
      clipboard_html = $paste_div.get(0).innerHTML

      editor.selection.restore()
      editor.events.enableBlur()
    }

    const is_word = clipboard_html.match(/(class="?Mso|class='?Mso|class="?Xl|class='?Xl|class=Xl|style="[^"]*\bmso-|style='[^']*\bmso-|w:WordDocument|LibreOffice)/gi)

    // Trigger chain cleanp.
    const response = editor.events.chainTrigger('paste.beforeCleanup', clipboard_html)

    if (response && typeof response === 'string') {
      clipboard_html = response
    }

    // Clean non-word or word if no plugin processed the paste.
    if (!is_word || is_word && editor.events.trigger('paste.wordPaste', [clipboard_html]) !== false) {
      clean(clipboard_html, is_word)
    }
  }

  /**
   * Check if pasted content comes from the editor.
   */
  function _isFromEditor(clipboard_html) {
    let possible_text = null

    try {
      possible_text = editor.win.localStorage.getItem('fr-copied-text')
    }
    catch (ex) {
      // continue no matter what.a
    }

    // Updated to handle the whitespace mismatches while comparing.
    if (possible_text && ($('<div>').html(clipboard_html).text().replace(/\u00A0/gi, ' ').replace(/\r|\n/gi, '') === possible_text.replace(/\u00A0/gi, ' ').replace(/\r|\n/gi, '') || $('<div>').html(clipboard_html).text().replace(/\s/g, '') === possible_text.replace(/\s/g, ''))) {
      return true
    }

    return false
  }

  function _buildTabs(len) {
    let tabs = ''
    let i = 0

    while (i++ < len) {
      tabs += '&nbsp;'
    }

    return tabs
  }

  /**
   * Clean clipboard html.
   */
  function clean(clipboard_html, is_word, keep_formatting) {
    let els = null
    let el = null
    let i

    // Keep only body if there is.
    if (clipboard_html.toLowerCase().indexOf('<body') >= 0) {
      let style = ''

      if (clipboard_html.indexOf('<style') >= 0) {
        style = clipboard_html.replace(/[.\s\S\w\W<>]*(<style[^>]*>[\s]*[.\s\S\w\W<>]*[\s]*<\/style>)[.\s\S\w\W<>]*/gi, '$1')
      }

      clipboard_html = style + clipboard_html.replace(/[.\s\S\w\W<>]*<body[^>]*>[\s]*([.\s\S\w\W<>]*)[\s]*<\/body>[.\s\S\w\W<>]*/gi, '$1')
      clipboard_html = clipboard_html.replace(/ \n/g, ' ').replace(/\n /g, ' ').replace(/([^>])\n([^<])/g, '$1 $2')
    }

    // Google Docs paste.
    let is_gdocs = false

    if (clipboard_html.indexOf('id="docs-internal-guid') >= 0) {
      clipboard_html = clipboard_html.replace(/^[\w\W\s\S]* id="docs-internal-guid[^>]*>([\w\W\s\S]*)<\/b>[\w\W\s\S]*$/g, '$1')
      is_gdocs = true
    }

    if (clipboard_html.indexOf('content="Sheets"') >= 0) {
      clipboard_html = clipboard_html.replace(/width:0px;/g, '')
    }

    // Not word paste.
    let is_editor_content = false

    if (!is_word) {
      is_editor_content = _isFromEditor(clipboard_html)

      // Remove pasting token.
      if (is_editor_content) {
        clipboard_html = editor.win.localStorage.getItem('fr-copied-html')
      }

      if (!is_editor_content) {
        // Remove comments.
        const htmlAllowedStylePropsCopy = editor.opts.htmlAllowedStyleProps
        editor.opts.htmlAllowedStyleProps = editor.opts.pasteAllowedStyleProps
        editor.opts.htmlAllowComments = false

        // Pasting from Apple Notes.
        clipboard_html = clipboard_html.replace(/<span class="Apple-tab-span">\s*<\/span>/g, _buildTabs(editor.opts.tabSpaces || 4))
        clipboard_html = clipboard_html.replace(/<span class="Apple-tab-span" style="white-space:pre">(\t*)<\/span>/g, (str, x) => _buildTabs(x.length * (editor.opts.tabSpaces || 4)))

        // Pasting from other sources with tabs.
        clipboard_html = clipboard_html.replace(/\t/g, _buildTabs(editor.opts.tabSpaces || 4))

        clipboard_html = editor.clean.html(clipboard_html, editor.opts.pasteDeniedTags, editor.opts.pasteDeniedAttrs)

        editor.opts.htmlAllowedStyleProps = htmlAllowedStylePropsCopy
        editor.opts.htmlAllowComments = true

        // Remove empty tags.
        clipboard_html = cleanEmptyTagsAndDivs(clipboard_html)

        // Do not keep entities that are not HTML compatible.
        clipboard_html = clipboard_html.replace(/\r/g, '')

        // Trail ending and starting spaces.
        clipboard_html = clipboard_html.replace(/^ */g, '').replace(/ *$/g, '')
      }
      else {
        clipboard_html = editor.clean.html(clipboard_html, editor.opts.pasteDeniedTags, editor.opts.pasteDeniedAttrs);
      }
    }

    // Word paste cleanup when word plugin is not used.
    if (is_word && (!editor.wordPaste || !keep_formatting)) {

      // Strip spaces at the beginning.
      clipboard_html = clipboard_html.replace(/^\n*/g, '').replace(/^ /g, '')

      // Firefox paste.
      if (clipboard_html.indexOf('<colgroup>') === 0) {
        clipboard_html = `<table>${clipboard_html}</table>`
      }

      clipboard_html = _wordClean(clipboard_html)

      clipboard_html = cleanEmptyTagsAndDivs(clipboard_html)
    }

    // Do plain paste cleanup.
    if (editor.opts.pastePlain && !is_editor_content) {
      clipboard_html = _plainPasteClean(clipboard_html)
    }

    // After paste cleanup event.
    const response = editor.events.chainTrigger('paste.afterCleanup', clipboard_html)

    if (typeof response === 'string') {
      clipboard_html = response
    }

    // Check if there is anything to clean.
    if (clipboard_html !== '') {
      // Normalize spaces.
      const tmp = editor.o_doc.createElement('div')
      tmp.innerHTML = clipboard_html

      // https://github.com/froala/wysiwyg-editor/issues/2632.
      if (clipboard_html.indexOf('<body>') >= 0) {
        editor.html.cleanBlankSpaces(tmp)
        editor.spaces.normalize(tmp, true)
      }
      else {
        editor.spaces.normalize(tmp)
      }

      // Remove all spans.
      const spans = tmp.getElementsByTagName('span')

      for (i = spans.length - 1; i >= 0; i--) {
        const span = spans[i]

        if (span.attributes.length === 0) {
          span.outerHTML = span.innerHTML
        }
      }

      // Check for a tags linkAlwaysBlank.
      if (editor.opts.linkAlwaysBlank === true) {

        let aTags = tmp.getElementsByTagName('a');

        for (i = aTags.length - 1; i >= 0; i--) {
          let aTag = aTags[i];

          if (!aTag.getAttribute('target')) {
            aTag.setAttribute('target', '_blank');
          }
        }
      }

      // Check if we're inside a list.
      const selection_el = editor.selection.element()
      let in_list = false

      if (selection_el && $(selection_el).parentsUntil(editor.el, 'ul, ol').length) {
        in_list = true
      }

      // Unwrap lists if they are the only thing in the pasted HTML.
      if (in_list) {
        const list = tmp.children

        if (list.length === 1 && ['OL', 'UL'].indexOf(list[0].tagName) >= 0) {
          list[0].outerHTML = list[0].innerHTML
        }
      }

      // Remove unecessary new_lines.
      if (!is_gdocs) {
        const brs = tmp.getElementsByTagName('br')

        for (i = brs.length - 1; i >= 0; i--) {
          const br = brs[i]

          if (editor.node.isBlock(br.previousSibling)) {
            br.parentNode.removeChild(br)
          }
        }
      }

      // https://github.com/froala/wysiwyg-editor/issues/1493
      if (editor.opts.enter === FE.ENTER_BR) {
        els = tmp.querySelectorAll('p, div')

        for (i = els.length - 1; i >= 0; i--) {
          el = els[i]

          // Fixes https://github.com/froala/wysiwyg-editor/issues/1895.
          if (el.attributes.length === 0) {
            el.outerHTML = el.innerHTML + (el.nextSibling && !editor.node.isEmpty(el) ? '<br>' : '')
          }
        }
      }
      else if (editor.opts.enter === FE.ENTER_DIV) {

        els = tmp.getElementsByTagName('p')

        for (i = els.length - 1; i >= 0; i--) {
          el = els[i]

          if (el.attributes.length === 0) {
            el.outerHTML = `<div>${el.innerHTML}</div>`
          }
        }
      }
      else if (editor.opts.enter === FE.ENTER_P) {
        if (tmp.childNodes.length === 1 && tmp.childNodes[0].tagName === 'P' && tmp.childNodes[0].attributes.length === 0) {
          tmp.childNodes[0].outerHTML = tmp.childNodes[0].innerHTML
        }
      }

      clipboard_html = tmp.innerHTML

      if (is_editor_content) {
        clipboard_html = removeEmptyTags(clipboard_html)
      }

      // Insert HTML.
      editor.html.insert(clipboard_html, true)
    }

    _afterPaste()

    editor.undo.saveStep(snapshot)
    snapshot = null
    editor.undo.saveStep()
  }

  /**
   * After pasting.
   */
  function _afterPaste() {
    editor.events.trigger('paste.after')
  }

  /*
   * Get clipboard in RTF format.
   */
  function getRtfClipboard() {

    return clipboard_rtf
  }

  /*
   * Remove those nodes with attrs.
   */
  function _filterNoAttrs(arry) {
    for (let t = arry.length - 1; t >= 0; t--) {
      if (arry[t].attributes && arry[t].attributes.length) {
        arry.splice(t, 1)
      }
    }

    return arry
  }

  function cleanEmptyTagsAndDivs(html) {
    let i
    const div = editor.o_doc.createElement('div')
    div.innerHTML = html

    // Workaround for Nodepad paste.
    let divs = _filterNoAttrs(Array.prototype.slice.call(div.querySelectorAll(':scope > div:not([style]), td > div:not([style]), th > div:not([style]), li > div:not([style])')))

    while (divs.length) {
      const dv = divs[divs.length - 1]

      if (editor.html.defaultTag() && editor.html.defaultTag() !== 'div') {

        // If we have nested block tags unwrap them.
        if (dv.querySelector(editor.html.blockTagsQuery())) {
          dv.outerHTML = dv.innerHTML
        }
        else {
          dv.outerHTML = `<${editor.html.defaultTag()}>${dv.innerHTML}</${editor.html.defaultTag()}>`
        }
      }
      else {
        const els = dv.querySelectorAll('*')

        // Node has some other content than BR.
        if (!els.length || els[els.length - 1].tagName !== 'BR' && dv.innerText.length === 0) {
          dv.outerHTML = dv.innerHTML + (dv.nextSibling ? '<br>' : '');
        }
        // Last node is not BR.
        else if (!(els.length && els[els.length - 1].tagName === 'BR' && !els[els.length - 1].nextSibling)) {
          dv.outerHTML = dv.innerHTML + (dv.nextSibling ? '<br>' : '');
        }
        else {
          dv.outerHTML = dv.innerHTML
        }
      }

      divs = _filterNoAttrs(Array.prototype.slice.call(div.querySelectorAll(':scope > div:not([style]), td > div:not([style]), th > div:not([style]), li > div:not([style])')))
    }

    // Remove divs.
    divs = _filterNoAttrs(Array.prototype.slice.call(div.querySelectorAll('div:not([style])')))

    while (divs.length) {
      for (i = 0; i < divs.length; i++) {
        const el = divs[i]
        const text = el.innerHTML.replace(/\u0009/gi, '').trim()

        el.outerHTML = text
      }

      divs = _filterNoAttrs(Array.prototype.slice.call(div.querySelectorAll('div:not([style])')))
    }

    return div.innerHTML
  }

  /**
   * Remove possible empty tags in pasted HTML.
   */
  function removeEmptyTags(html) {

    let i
    const div = editor.o_doc.createElement('div')
    div.innerHTML = html

    // Clean empty tags.
    let empty_tags = div.querySelectorAll(`*:empty:not(td):not(th):not(tr):not(iframe):not(svg):not(${FE.VOID_ELEMENTS.join('):not(')}):not(${editor.opts.htmlAllowedEmptyTags.join('):not(')})`)

    while (empty_tags.length) {
      for (i = 0; i < empty_tags.length; i++) {
        empty_tags[i].parentNode.removeChild(empty_tags[i])
      }

      empty_tags = div.querySelectorAll(`*:empty:not(td):not(th):not(tr):not(iframe):not(svg):not(${FE.VOID_ELEMENTS.join('):not(')}):not(${editor.opts.htmlAllowedEmptyTags.join('):not(')})`)
    }

    return div.innerHTML
  }

  /**
   * Initialize.
   */
  function _init() {
    editor.el.addEventListener('copy', _handleCopy)
    editor.el.addEventListener('cut', _handleCopy)
    editor.el.addEventListener('paste', _handlePaste, {
      capture: true
    })

    editor.events.on('drop', _dropPaste)

    if (editor.browser.msie && editor.browser.version < 11) {
      editor.events.on('mouseup', (e) => {
        if (e.button === 2) {
          setTimeout(() => {
            stop_paste = false
          }, 50)
          stop_paste = true
        }
      }, true)

      editor.events.on('beforepaste', _handlePaste)
    }

    editor.events.on('destroy', _destroy)
  }

  function _destroy() {
    editor.el.removeEventListener('copy', _handleCopy)
    editor.el.removeEventListener('cut', _handleCopy)
    editor.el.removeEventListener('paste', _handlePaste)
  }

  return {
    _init,
    cleanEmptyTagsAndDivs,
    getRtfClipboard,
    saveCopiedText,
    clean
  }
}
