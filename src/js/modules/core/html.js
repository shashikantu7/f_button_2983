import './edit.js'
import './dom/spaces.js'
import './dom/selection.js'
import './options/placeholder.js'

import FE from '../../editor.js'

FE.UNICODE_NBSP = String.fromCharCode(160)

// Void Elements http://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
FE.VOID_ELEMENTS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr']

FE.BLOCK_TAGS = ['address', 'article', 'aside', 'audio', 'blockquote', 'canvas', 'details', 'dd', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'li', 'main', 'nav', 'noscript', 'ol', 'output', 'p', 'pre', 'section', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul', 'video']

// Extend defaults.
Object.assign(FE.DEFAULTS, {
  htmlAllowedEmptyTags: ['textarea', 'a', 'iframe', 'object', 'video', 'style', 'script', '.fa', '.fr-emoticon', '.fr-inner', 'path', 'line', 'hr'],
  htmlDoNotWrapTags: ['script', 'style'],
  htmlSimpleAmpersand: false,
  htmlIgnoreCSSProperties: [],
  htmlExecuteScripts: true
})

FE.MODULES.html = function (editor) {
  const $ = editor.$

  /**
   * Determine the default block tag.
   */
  function defaultTag() {
    if (editor.opts.enter === FE.ENTER_P) {
      return 'p'
    }
    if (editor.opts.enter === FE.ENTER_DIV) {
      return 'div'
    }

    if (editor.opts.enter === FE.ENTER_BR) {
      return null
    }
  }

  /**
   * Tells if the node keeps text formating.
   */
  function isPreformatted(node, look_up) {
    // Stop condition.
    if (!node || node === editor.el) {
      return false
    }

    // Check only first level.
    if (!look_up) {
      // Is preformatted.
      return ['PRE', 'SCRIPT', 'STYLE'].indexOf(node.tagName) !== -1
    }
    else {
      if (['PRE', 'SCRIPT', 'STYLE'].indexOf(node.tagName) != -1) {
        return true
      }
      return isPreformatted(node.parentNode, look_up)
    }
  }

  /**
   * Get the empty blocs.
   */
  function emptyBlocks(around_markers) {

    const empty_blocks = []
    let i

    // Block tag elements.
    let els = []

    if (around_markers) {
      const markers = editor.el.querySelectorAll('.fr-marker')

      for (i = 0; i < markers.length; i++) {
        const p_node = editor.node.blockParent(markers[i]) || markers[i]

        if (p_node) {
          const next_node = p_node.nextSibling
          const prev_node = p_node.previousSibling

          // Push current node, prev and next one.
          if (p_node && els.indexOf(p_node) < 0 && editor.node.isBlock(p_node)) {
            els.push(p_node)
          }

          if (prev_node && editor.node.isBlock(prev_node) && els.indexOf(prev_node) < 0) {
            els.push(prev_node)
          }

          if (next_node && editor.node.isBlock(next_node) && els.indexOf(next_node) < 0) {
            els.push(next_node)
          }
        }
      }
    }
    else {
      els = editor.el.querySelectorAll(blockTagsQuery())
    }

    let qr = blockTagsQuery()
    qr += `,${FE.VOID_ELEMENTS.join(',')}`
    qr += ', .fr-inner'
    qr += `,${editor.opts.htmlAllowedEmptyTags.join(':not(.fr-marker),')}:not(.fr-marker)`

    // Check if there are empty block tags with markers.
    for (i = els.length - 1; i >= 0; i--) {

      // If the block tag has text content, ignore it.
      if (els[i].textContent && els[i].textContent.replace(/\u200B|\n/g, '').length > 0) {
        continue
      }

      if (els[i].querySelectorAll(qr).length > 0) {
        continue
      }

      // We're checking text from here on.
      const contents = editor.node.contents(els[i])

      let found = false

      for (let j = 0; j < contents.length; j++) {
        if (contents[j].nodeType === Node.COMMENT_NODE) {
          continue
        }

        // Text node that is not empty.
        if (contents[j].textContent && contents[j].textContent.replace(/\u200B|\n/g, '').length > 0) {
          found = true

          break
        }
      }

      // Make sure we don't add TABLE and TD at the same time for instance.
      if (!found) {
        empty_blocks.push(els[i])
      }
    }

    return empty_blocks
  }

  /**
   * Create jQuery query for empty block tags.
   */
  function emptyBlockTagsQuery() {

    return `${FE.BLOCK_TAGS.join(':empty, ')}:empty`
  }

  /**
   * Create jQuery query for selecting block tags.
   */
  function blockTagsQuery() {

    return FE.BLOCK_TAGS.join(', ')
  }

  /**
   * Remove empty elements that are not VOID elements.
   */
  function cleanEmptyTags(remove_blocks) {
    let els = $.merge([], FE.VOID_ELEMENTS)
    els = $.merge(els, editor.opts.htmlAllowedEmptyTags)

    if (typeof remove_blocks === 'undefined') {
      els = $.merge(els, FE.BLOCK_TAGS)
    }
    else {
      els = $.merge(els, FE.NO_DELETE_TAGS)
    }

    let elms
    let ok

    //https://github.com/froala-labs/froala-editor-js-2/issues/1938
    elms = editor.el.querySelectorAll(`*:empty:not(${els.join('):not(')}):not(.fr-marker):not(template)`)

    do {
      ok = false

      // Remove those elements that have no attributes.
      for (let i = 0; i < elms.length; i++) {
        if (elms[i].attributes.length === 0 || typeof elms[i].getAttribute('href') !== 'undefined') {
          elms[i].parentNode.removeChild(elms[i])
          ok = true
        }
      }

      //https://github.com/froala-labs/froala-editor-js-2/issues/1938
      elms = editor.el.querySelectorAll(`*:empty:not(${els.join('):not(')}):not(.fr-marker):not(template)`)
    } while (elms.length && ok)
  }

  /**
   * Wrap the content inside the element passed as argument.
   */
  function _wrapElement(el, temp) {
    let default_tag = defaultTag()

    if (temp) {
      default_tag = 'div'
    }

    if (default_tag) {

      // Rewrite the entire content.
      const main_doc = editor.doc.createDocumentFragment()

      // Anchor.
      let anchor = null

      // If we found anything inside the current anchor.
      let found = false

      let node = el.firstChild

      let changed = false

      // Loop through contents.
      while (node) {
        const next_node = node.nextSibling

        // Current node is a block node.
        // Or it is a do not wrap node and not a fr-marker.
        if (node.nodeType === Node.ELEMENT_NODE && (editor.node.isBlock(node) || editor.opts.htmlDoNotWrapTags.indexOf(node.tagName.toLowerCase()) >= 0 && !editor.node.hasClass(node, 'fr-marker'))) {
          anchor = null
          main_doc.appendChild(node.cloneNode(true))
        }

        // Other node types than element and text.
        else if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.TEXT_NODE) {
          anchor = null
          main_doc.appendChild(node.cloneNode(true))
        }

        // Current node is BR.
        else if (node.tagName === 'BR') {

          // There is no anchor.
          if (anchor === null) {
            anchor = editor.doc.createElement(default_tag)
            changed = true

            if (temp) {
              anchor.setAttribute('class', 'fr-temp-div')
              anchor.setAttribute('data-empty', true)
            }

            anchor.appendChild(node.cloneNode(true))

            main_doc.appendChild(anchor)
          }

          // There is anchor. Just remove BR.
          // There is nothing else except markers and BR inside the new formed tag.
          else if (found === false) {
            anchor.appendChild(editor.doc.createElement('br'))

            if (temp) {
              anchor.setAttribute('class', 'fr-temp-div')
              anchor.setAttribute('data-empty', true)
            }
          }

          anchor = null
        }

        // Text node or other node type.
        else {
          const txt = node.textContent

          // Node is not text node.
          // Node is text node and it doesn't contain only spaces and NL.
          // There are empty spaces but no new lines.
          if (node.nodeType !== Node.TEXT_NODE || (txt.replace(/\n/g, '').replace(/(^ *)|( *$)/g, '').length > 0 || (txt.replace(/(^ *)|( *$)/g, '').length && txt.indexOf('\n') < 0))) {

            // No anchor.
            if (anchor === null) {
              anchor = editor.doc.createElement(default_tag)
              changed = true

              if (temp) {
                anchor.setAttribute('class', 'fr-temp-div')
              }
              main_doc.appendChild(anchor)

              found = false
            }

            // Add node to anchor.
            anchor.appendChild(node.cloneNode(true))

            // Check if maybe we have a non empty node.
            if (!found && (!editor.node.hasClass(node, 'fr-marker') && !(node.nodeType === Node.TEXT_NODE && txt.replace(/ /g, '').length === 0))) {
              found = true
            }
          }
          else {
            changed = true;
          }

          // Else skip the node because it's empty.
        }

        node = next_node
      }

      if (changed) {
        el.innerHTML = ''
        el.appendChild(main_doc)
      }
    }
  }

  function _wrapElements(els, temp) {
    for (let i = els.length - 1; i >= 0; i--) {
      _wrapElement(els[i], temp)
    }
  }

  /**
   * Wrap the direct content inside the default block tag.
   */
  function _wrap(temp, tables, blockquote, inner, li) {
    if (!editor.$wp) {
      return false
    }

    if (typeof temp === 'undefined') {
      temp = false
    }

    if (typeof tables === 'undefined') {
      tables = false
    }

    if (typeof blockquote === 'undefined') {
      blockquote = false
    }

    if (typeof inner === 'undefined') {
      inner = false
    }

    if (typeof li === 'undefined') {
      li = false
    }

    // Wrap element.
    const wp_st = editor.$wp.scrollTop()

    _wrapElement(editor.el, temp)

    if (inner) {
      _wrapElements(editor.el.querySelectorAll('.fr-inner'), temp)
    }

    // Wrap table contents.
    if (tables) {
      _wrapElements(editor.el.querySelectorAll('td, th'), temp)
    }

    // Wrap table contents.
    if (blockquote) {
      _wrapElements(editor.el.querySelectorAll('blockquote'), temp)
    }

    if (li) {
      _wrapElements(editor.el.querySelectorAll('li'), temp)
    }

    if (wp_st !== editor.$wp.scrollTop()) {
      editor.$wp.scrollTop(wp_st)
    }
  }

  /**
   * Unwrap temporary divs.
   */
  function unwrap() {
    editor.$el.find('div.fr-temp-div').each(function () {
      if (this.previousSibling && this.previousSibling.nodeType === Node.TEXT_NODE) {
        $(this).before('<br>')
      }

      if ($(this).attr('data-empty') || !this.nextSibling || editor.node.isBlock(this.nextSibling) && !$(this.nextSibling).hasClass('fr-temp-div')) {
        $(this).replaceWith($(this).html())
      }
      else {
        $(this).replaceWith(`${$(this).html()}<br>`)
      }
    })

    // Remove temp class from other blocks.
    editor.$el.find('.fr-temp-div').removeClass('fr-temp-div').filter(function () {

      return $(this).attr('class') === ''
    }).removeAttr('class')
  }

  /**
   * Add BR inside empty elements.
   */
  function fillEmptyBlocks(around_markers) {
    const blocks = emptyBlocks(around_markers)

    if (editor.node.isEmpty(editor.el) && editor.opts.enter === FE.ENTER_BR) {
      blocks.push(editor.el)
    }

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]

      if (block.getAttribute('contenteditable') !== 'false' &&
          !block.querySelector(`${editor.opts.htmlAllowedEmptyTags.join(':not(.fr-marker),')}:not(.fr-marker)`) &&
          !editor.node.isVoid(block)) {
        if (block.tagName !== 'TABLE' && block.tagName !== 'TBODY' && block.tagName !== 'TR' && block.tagName !== 'UL' && block.tagName !== 'OL') {
          block.appendChild(editor.doc.createElement('br'))
        }
      }
    }

    // Fix for https://github.com/froala/wysiwyg-editor/issues/1166#issuecomment-204549406.
    if (editor.browser.msie && editor.opts.enter === FE.ENTER_BR) {
      const contents = editor.node.contents(editor.el)

      if (contents.length && contents[contents.length - 1].nodeType === Node.TEXT_NODE) {
        editor.$el.append('<br>')
      }
    }
  }

  /**
   * Get the blocks inside the editable area.
   */
  function blocks() {

    return editor.$el.get(0).querySelectorAll(blockTagsQuery())
  }

  /**
   * Clean the blank spaces between the block tags.
   */
  function cleanBlankSpaces(el) {
    if (typeof el === 'undefined') {
      el = editor.el
    }

    if (el && ['SCRIPT', 'STYLE', 'PRE'].indexOf(el.tagName) >= 0) {
      return false
    }

    const walker = editor.doc.createTreeWalker(el, NodeFilter.SHOW_TEXT, editor.node.filter((node) => node.textContent.match(/([ \n]{2,})|(^[ \n]{1,})|([ \n]{1,}$)/g) !== null), false)

    while (walker.nextNode()) {

      const node = walker.currentNode

      if (isPreformatted(node.parentNode, true)) {
        continue
      }

      const is_block_or_element = editor.node.isBlock(node.parentNode) || editor.node.isElement(node.parentNode)

      // Remove middle spaces.
      // Replace new lines with spaces.
      // Replace begin/end spaces.
      let txt = node.textContent
        .replace(/(?!^)( ){2,}(?!$)/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/^[ ]{2,}/g, ' ')
        .replace(/[ ]{2,}$/g, ' ')

      if (is_block_or_element) {
        const p_node = node.previousSibling
        const n_node = node.nextSibling

        if (p_node && n_node && txt === ' ') {
          if (editor.node.isBlock(p_node) && editor.node.isBlock(n_node)) {
            txt = ''
          }
          else {
            txt = ' '
          }
        }
        else {

          // No previous siblings.
          if (!p_node) {
            txt = txt.replace(/^ */, '')
          }

          // No next siblings.
          if (!n_node) {
            txt = txt.replace(/ *$/, '')
          }
        }
      }

      node.textContent = txt
    }
  }

  /**
   * Extract a specific match for a RegEx.
   */
  function _extractMatch(html, re, id) {
    const reg_exp = new RegExp(re, 'gi')
    const matches = reg_exp.exec(html)

    if (matches) {

      return matches[id]
    }

    return null
  }

  /**
   * Create new doctype.
   */
  function _newDoctype(string, doc) {
    const matches = string.match(/<!DOCTYPE ?([^ ]*) ?([^ ]*) ?"?([^"]*)"? ?"?([^"]*)"?>/i)

    if (matches) {

      return doc.implementation.createDocumentType(
        matches[1],
        matches[3],
        matches[4]
      )
    }


    return doc.implementation.createDocumentType('html')

  }

  /**
   * Get string doctype of a document.
   */
  function getDoctype(doc) {
    const node = doc.doctype
    let doctype = '<!DOCTYPE html>'

    if (node) {
      doctype = `<!DOCTYPE ${
        node.name
      }${node.publicId ? ` PUBLIC "${node.publicId}"` : ''
      }${!node.publicId && node.systemId ? ' SYSTEM' : ''
      }${node.systemId ? ` "${node.systemId}"` : ''
      }>`
    }

    return doctype
  }

  function _processBR(br) {
    const parent_node = br.parentNode

    if (parent_node && (editor.node.isBlock(parent_node) || editor.node.isElement(parent_node)) && ['TD', 'TH'].indexOf(parent_node.tagName) < 0) {
      let prev_node = br.previousSibling
      const next_node = br.nextSibling

      // Ignore non characters.
      while (prev_node && (prev_node.nodeType === Node.TEXT_NODE && prev_node.textContent.replace(/\n|\r/g, '').length === 0 || editor.node.hasClass(prev_node, 'fr-tmp'))) {
        prev_node = prev_node.previousSibling
      }

      if (next_node) {
        return false
      }

      // Previous node.
      // Previous node is not BR.
      // Previoues node is not block tag.
      // No next node.
      // Parent node has text.
      // Previous node has text.
      if (prev_node && parent_node && prev_node.tagName !== 'BR' && !editor.node.isBlock(prev_node) && !next_node && parent_node.textContent.replace(/\u200B/g, '').length > 0 && prev_node.textContent.length > 0 && !editor.node.hasClass(prev_node, 'fr-marker')) {
        // Fix for https://github.com/froala/wysiwyg-editor/issues/1166#issuecomment-204549406.
        if (!(editor.el === parent_node && !next_node && editor.opts.enter === FE.ENTER_BR && editor.browser.msie)) {
          br.parentNode.removeChild(br)
        }
      }
    }

    // Regular node.
    else if (parent_node && !(editor.node.isBlock(parent_node) || editor.node.isElement(parent_node))) {

      // Check if we have something else than BR.
      if (!br.previousSibling && !br.nextSibling && editor.node.isDeletable(br.parentNode)) {
        _processBR(br.parentNode)
      }
    }
  }

  function cleanBRs() {
    const brs = editor.el.getElementsByTagName('br')

    for (let i = 0; i < brs.length; i++) {
      _processBR(brs[i])
    }
  }

  /**
   * Normalize.
   */
  function _normalize() {
    if (!editor.opts.htmlUntouched) {

      // Remove empty tags.
      cleanEmptyTags()

      // Wrap possible text.
      _wrap()

      // Clean blank spaces.
      cleanBlankSpaces()

      // Normalize spaces.
      editor.spaces.normalize(null, true)

      // Add BR tag where it is necessary.
      editor.html.fillEmptyBlocks()

      // Clean lists.
      editor.clean.lists()

      // Clean tables.
      editor.clean.tables()

      // Convert to HTML5.
      editor.clean.toHTML5()

      // Remove unecessary brs.
      editor.html.cleanBRs()
    }

    // Restore selection.
    editor.selection.restore()

    // Check if editor is empty and add placeholder.
    checkIfEmpty()

    // Refresh placeholder.
    editor.placeholder.refresh()
  }

  function checkIfEmpty() {
    if (editor.node.isEmpty(editor.el)) {
      if (defaultTag() !== null) {

        // There is no block tag inside the editor.
        if (!editor.el.querySelector(blockTagsQuery()) &&
              !editor.el.querySelector(`${editor.opts.htmlDoNotWrapTags.join(':not(.fr-marker),')}:not(.fr-marker)`)) {
          if (editor.core.hasFocus()) {
            editor.$el.html(`<${defaultTag()}>${FE.MARKERS}<br/></${defaultTag()}>`)
            editor.selection.restore()
          }
          else {
            editor.$el.html(`<${defaultTag()}><br/></${defaultTag()}>`)
          }
        }
      }
      else {

        // There is nothing in the editor.
        if (!editor.el.querySelector('*:not(.fr-marker):not(br)')) {
          if (editor.core.hasFocus()) {
            editor.$el.html(`${FE.MARKERS}<br/>`)
            editor.selection.restore()
          }
          else {
            editor.$el.html('<br/>')
          }
        }
      }
    }
  }

  function extractNode(html, tag) {

    return _extractMatch(html, `<${tag}[^>]*?>([\\w\\W]*)</${tag}>`, 1)
  }

  function extractNodeAttrs(html, tag) {
    const $dv = $(`<div ${_extractMatch(html, `<${tag}([^>]*?)>`, 1) || ''}>`)

    return editor.node.rawAttributes($dv.get(0))
  }

  function extractDoctype(html) {

    return (_extractMatch(html, '<!DOCTYPE([^>]*?)>', 0) || '<!DOCTYPE html>').replace(/\n/g, ' ').replace(/ {2,}/g, ' ')
  }

  /*
   * Set html to node.
   */
  function _setHtml($node, html) {

    if (editor.opts.htmlExecuteScripts) {
      $node.html(html)
    }
    else {
      $node.get(0).innerHTML = html
    }
  }

  /**
   * Set HTML.
   */
  function set(html) {
    let cleaned_html = editor.clean.html((html || '').trim(), [], [], editor.opts.fullPage)

    // https://github.com/froala-labs/froala-editor-js-2/issues/2810 - issue 3
    // not using decodeURI since we don't want to decode any html content. This fix is specific to decoding : symbol in th url.
    let re = new RegExp('%3A//', 'g')
    const clean_html = cleaned_html.replace(re, '://')

    if (!editor.opts.fullPage) {
      _setHtml(editor.$el, clean_html)
    }
    else {

      // Get BODY data.
      const body_html = extractNode(clean_html, 'body') || (clean_html.indexOf('<body') >= 0 ? '' : clean_html)
      const body_attrs = extractNodeAttrs(clean_html, 'body')

      // Get HEAD data.
      let head_html = extractNode(clean_html, 'head') || '<title></title>'
      const head_attrs = extractNodeAttrs(clean_html, 'head')

      // Get HTML that might be in <head> other than meta tags.
      // https://github.com/froala/wysiwyg-editor/issues/1208
      const $dv = $('<div>')

      $dv.append(head_html)
        .contents().each(function () {
          if (this.nodeType === Node.COMMENT_NODE || ['BASE', 'LINK', 'META', 'NOSCRIPT', 'SCRIPT', 'STYLE', 'TEMPLATE', 'TITLE'].indexOf(this.tagName) >= 0) {
            this.parentNode.removeChild(this)
          }
        })

      const head_bad_html = $dv.html().trim()

      // Filter and keep only meta tags in <head>.
      // https://html.spec.whatwg.org/multipage/dom.html#metadata-content-2
      head_html = $('<div>')
        .append(head_html)
        .contents().map(function () {
          if (this.nodeType === Node.COMMENT_NODE) {

            return `<!--${this.nodeValue}-->`
          }
          else if (['BASE', 'LINK', 'META', 'NOSCRIPT', 'SCRIPT', 'STYLE', 'TEMPLATE', 'TITLE'].indexOf(this.tagName) >= 0) {
            return this.outerHTML
          }


          return ''

        }).toArray()
        .join('')

      // Get DOCTYPE.
      const doctype = extractDoctype(clean_html)

      // Get HTML attributes.
      const html_attrs = extractNodeAttrs(clean_html, 'html')

      _setHtml(editor.$el, `${head_bad_html}\n${body_html}`)
      editor.node.clearAttributes(editor.el)
      editor.$el.attr(body_attrs)
      editor.$el.addClass('fr-view')
      editor.$el.attr('spellcheck', editor.opts.spellcheck)
      editor.$el.attr('dir', editor.opts.direction)

      _setHtml(editor.$head, head_html)
      editor.node.clearAttributes(editor.$head.get(0))
      editor.$head.attr(head_attrs)

      editor.node.clearAttributes(editor.$html.get(0))

      editor.$html.attr(html_attrs)

      editor.iframe_document.doctype.parentNode.replaceChild(
        _newDoctype(doctype, editor.iframe_document),
        editor.iframe_document.doctype
      )
    }

    // Make sure the content is editable.
    const disabled = editor.edit.isDisabled()
    editor.edit.on()

    editor.core.injectStyle(editor.opts.iframeDefaultStyle + editor.opts.iframeStyle)

    _normalize()

    if (!editor.opts.useClasses) {

      // Restore orignal attributes if present.
      editor.$el.find('[fr-original-class]').each(function () {
        this.setAttribute('class', this.getAttribute('fr-original-class'))
        this.removeAttribute('fr-original-class')
      })

      editor.$el.find('[fr-original-style]').each(function () {
        this.setAttribute('style', this.getAttribute('fr-original-style'))
        this.removeAttribute('fr-original-style')
      })
    }

    if (disabled) {
      editor.edit.off()
    }

    editor.events.trigger('html.set')
    //https://github.com/froala-labs/froala-editor-js-2/issues/1920		
    editor.events.trigger('charCounter.update');
  }

  function _specifity(selector) {
    const idRegex = /(#[^\s+>~.[:]+)/g
    const attributeRegex = /(\[[^]]+\])/g
    const classRegex = /(\.[^\s+>~.[:]+)/g
    const pseudoElementRegex = /(::[^\s+>~.[:]+|:first-line|:first-letter|:before|:after)/gi
    const pseudoClassWithBracketsRegex = /(:[\w-]+\([^)]*\))/gi

    // A regex for other pseudo classes, which don't have brackets
    const pseudoClassRegex = /(:[^\s+>~.[:]+)/g
    const elementRegex = /([^\s+>~.[:]+)/g;

    // Remove the negation psuedo-class (:not) but leave its argument because specificity is calculated on its argument
    (function () {
      const regex = /:not\(([^)]*)\)/g

      if (regex.test(selector)) {
        selector = selector.replace(regex, '     $1 ')
      }
    }())

    let s = (selector.match(idRegex) || []).length * 100 +
            (selector.match(attributeRegex) || []).length * 10 +
            (selector.match(classRegex) || []).length * 10 +
            (selector.match(pseudoClassWithBracketsRegex) || []).length * 10 +
            (selector.match(pseudoClassRegex) || []).length * 10 +
            (selector.match(pseudoElementRegex) || []).length

    // Remove universal selector and separator characters
    selector = selector.replace(/[*\s+>~]/g, ' ')

    // Remove any stray dots or hashes which aren't attached to words
    // These may be present if the user is live-editing this selector
    selector = selector.replace(/[#.]/g, ' ')

    s += (selector.match(elementRegex) || []).length

    return s
  }

  /**
   * Do processing on the final html.
   */
  function _processOnGet(el) {
    editor.events.trigger('html.processGet', [el])

    // Remove class attribute when empty.
    if (el && el.getAttribute && el.getAttribute('class') === '') {
      el.removeAttribute('class')
    }

    if (el && el.getAttribute && el.getAttribute('style') === '') {
      el.removeAttribute('style')
    }

    // Look at inner nodes that have no class set.
    if (el && el.nodeType === Node.ELEMENT_NODE) {
      const els = el.querySelectorAll('[class=""],[style=""]')
      let i

      for (i = 0; i < els.length; i++) {
        const _el = els[i]

        if (_el.getAttribute('class') === '') {
          _el.removeAttribute('class')
        }

        if (_el.getAttribute('style') === '') {
          _el.removeAttribute('style')
        }
      }

      if (el.tagName === 'BR') {
        _processBR(el)
      }
      else {
        const brs = el.querySelectorAll('br')

        for (i = 0; i < brs.length; i++) {
          _processBR(brs[i])
        }
      }
    }
  }

  /**
   * Sort elements by spec.
   */
  function _sortElementsBySpec(a, b) {
    return a[3] - b[3]
  }

  /**
   * Sync inputs when getting the HTML.
   */
  function syncInputs() {
    const inputs = editor.el.querySelectorAll('input, textarea')

    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].type === 'checkbox' || inputs[i].type === 'radio') {
        if (inputs[i].checked) {
          inputs[i].setAttribute('checked', inputs[i].checked)
        } else {
          editor.$(inputs[i]).removeAttr('checked')
        }
      }

      /**
       * if the input type has value attribute then only updating the value atrribute.
       * Submit and Reset buttons default value is type names
       */ 
      if (inputs[i].getAttribute('value')) {
        inputs[i].setAttribute('value', inputs[i].value)
      }
    }
  }
  
  /**
   * Get HTML.
   */
  function get(keep_markers, keep_classes) {
    if (!editor.$wp) {

      return editor.$oel.clone()
        .removeClass('fr-view')
        .removeAttr('contenteditable')
        .get(0).outerHTML
    }

    let html = ''

    editor.events.trigger('html.beforeGet')

    // Convert STYLE from CSS files to inline style.
    const updated_elms = []
    const elms_info = {}
    let i
    let j
    const elems_specs = []

    syncInputs();

    if (!editor.opts.useClasses && !keep_classes) {
      const ignoreRegEx = new RegExp(`^${editor.opts.htmlIgnoreCSSProperties.join('$|^')}$`, 'gi')

      for (i = 0; i < editor.doc.styleSheets.length; i++) {
        let rules
        let head_style = 0

        try {
          rules = editor.doc.styleSheets[i].cssRules

          if (editor.doc.styleSheets[i].ownerNode && editor.doc.styleSheets[i].ownerNode.nodeType === 'STYLE') {
            head_style = 1
          }
        }
        catch (ex) {
          // keep empty.
        }

        if (rules) {
          for (let idx = 0, len = rules.length; idx < len; idx++) {
            if (rules[idx].selectorText) {
              if (rules[idx].style.cssText.length > 0) {
                const selector = rules[idx].selectorText.replace(/body |\.fr-view /g, '').replace(/::/g, ':')
                let elms

                try {
                  elms = editor.el.querySelectorAll(selector)
                }
                catch (ex) {
                  elms = []
                }

                for (j = 0; j < elms.length; j++) {

                  // Save original style.
                  if (!elms[j].getAttribute('fr-original-style') && elms[j].getAttribute('style')) {
                    elms[j].setAttribute('fr-original-style', elms[j].getAttribute('style'))
                    updated_elms.push(elms[j])
                  }
                  else if (!elms[j].getAttribute('fr-original-style')) {
                    elms[j].setAttribute('fr-original-style', '')
                    updated_elms.push(elms[j])
                  }

                  if (!elms_info[elms[j]]) {
                    elms_info[elms[j]] = {}
                  }

                  // Compute specification.
                  const spec = head_style * 1000 + _specifity(rules[idx].selectorText)

                  // Get CSS text of the rule.
                  const css_text = rules[idx].style.cssText.split(';')

                  // Get each rule.
                  for (let k = 0; k < css_text.length; k++) {

                    // Rule.
                    const rule = css_text[k].trim().split(':')[0]

                    if (!rule) {
                      continue
                    }

                    // Ignore the CSS rules we don't need.
                    if (rule.match(ignoreRegEx)) {
                      continue
                    }

                    if (!elms_info[elms[j]][rule]) {
                      elms_info[elms[j]][rule] = 0

                      if ((elms[j].getAttribute('fr-original-style') || '').indexOf(`${rule}:`) >= 0) {
                        elms_info[elms[j]][rule] = 10000
                      }
                    }

                    // Current spec is higher than the existing one.
                    if (spec >= elms_info[elms[j]][rule]) {
                      elms_info[elms[j]][rule] = spec

                      if (css_text[k].trim().length) {

                        const info = css_text[k].trim().split(':')
                        info.splice(0, 1)

                        // Add elements with css values and spec. This will be sorted later.
                        elems_specs.push([elms[j], rule.trim(), info.join(':').trim(), spec])
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      // Sort elements by spec.
      elems_specs.sort(_sortElementsBySpec)

      // Add style to elements in the order of specification.
      for (i = 0; i < elems_specs.length; i++) {
        const specs_elem = elems_specs[i]
        specs_elem[0].style[specs_elem[1]] = specs_elem[2]
      }

      // Save original class.
      for (i = 0; i < updated_elms.length; i++) {
        if (updated_elms[i].getAttribute('class')) {
          updated_elms[i].setAttribute('fr-original-class', updated_elms[i].getAttribute('class'))
          updated_elms[i].removeAttribute('class')
        }

        // Make sure that we have the inline style first.
        if ((updated_elms[i].getAttribute('fr-original-style') || '').trim().length > 0) {
          const original_rules = updated_elms[i].getAttribute('fr-original-style').split(';')

          for (j = 0; j < original_rules.length; j++) {
            if (original_rules[j].indexOf(':') > 0) {
              const splits = original_rules[j].split(':')
              const original_rule = splits[0]
              splits.splice(0, 1)

              updated_elms[i].style[original_rule.trim()] = splits.join(':').trim()
            }
          }
        }
      }
    }

    // If editor is not empty.
    if (!editor.node.isEmpty(editor.el)) {
      if (typeof keep_markers === 'undefined') {
        keep_markers = false
      }

      if (!editor.opts.fullPage) {
        html = editor.$el.html()
      }
      else {
        html = getDoctype(editor.iframe_document)
        editor.$el.removeClass('fr-view')
        const heightMin = editor.opts.heightMin
        const height = editor.opts.height;
        const heightMax = editor.opts.heightMax;
        editor.opts.heightMin = null
        editor.opts.height = null;
        editor.opts.heightMax = null;
        editor.size.refresh()
        html += `<html${editor.node.attributes(editor.$html.get(0))}>${editor.$html.html()}</html>`
        editor.opts.heightMin = heightMin
        editor.opts.height = height;
        editor.opts.heightMax = heightMax;
        editor.size.refresh()
        editor.$el.addClass('fr-view')
      }
    }
    else if (editor.opts.fullPage) {
      html = getDoctype(editor.iframe_document)
      html += `<html${editor.node.attributes(editor.$html.get(0))}>${editor.$html.find('head').get(0).outerHTML}<body></body></html>`
    }

    // Remove unwanted attributes.
    if (!editor.opts.useClasses && !keep_classes) {
      for (i = 0; i < updated_elms.length; i++) {
        if (updated_elms[i].getAttribute('fr-original-class')) {
          updated_elms[i].setAttribute('class', updated_elms[i].getAttribute('fr-original-class'))
          updated_elms[i].removeAttribute('fr-original-class')
        }

        if (updated_elms[i].getAttribute('fr-original-style') !== null && typeof updated_elms[i].getAttribute('fr-original-style') !== 'undefined') {
          if (updated_elms[i].getAttribute('fr-original-style').length !== 0) {
            updated_elms[i].setAttribute('style', updated_elms[i].getAttribute('fr-original-style'))
          }
          else {
            updated_elms[i].removeAttribute('style')
          }

          updated_elms[i].removeAttribute('fr-original-style')
        }
        else {
          updated_elms[i].removeAttribute('style')
        }
      }
    }

    // Clean helpers.
    if (editor.opts.fullPage) {
      html = html.replace(/<style data-fr-style="true">(?:[\w\W]*?)<\/style>/g, '')
      html = html.replace(/<link([^>]*)data-fr-style="true"([^>]*)>/g, '')
      html = html.replace(/<style(?:[\w\W]*?)class="firebugResetStyles"(?:[\w\W]*?)>(?:[\w\W]*?)<\/style>/g, '')
      html = html.replace(/<body((?:[\w\W]*?)) spellcheck="true"((?:[\w\W]*?))>((?:[\w\W]*?))<\/body>/g, '<body$1$2>$3</body>')
      html = html.replace(/<body((?:[\w\W]*?)) contenteditable="(true|false)"((?:[\w\W]*?))>((?:[\w\W]*?))<\/body>/g, '<body$1$3>$4</body>')

      html = html.replace(/<body((?:[\w\W]*?)) dir="([\w]*)"((?:[\w\W]*?))>((?:[\w\W]*?))<\/body>/g, '<body$1$3>$4</body>')
      html = html.replace(/<body((?:[\w\W]*?))class="([\w\W]*?)(fr-rtl|fr-ltr)([\w\W]*?)"((?:[\w\W]*?))>((?:[\w\W]*?))<\/body>/g, '<body$1class="$2$4"$5>$6</body>')
      html = html.replace(/<body((?:[\w\W]*?)) class=""((?:[\w\W]*?))>((?:[\w\W]*?))<\/body>/g, '<body$1$2>$3</body>')
    }

    // Ampersand fix.
    if (editor.opts.htmlSimpleAmpersand) {
      html = html.replace(/&amp;/gi, '&')
    }

    editor.events.trigger('html.afterGet')

    // Remove markers.
    if (!keep_markers) {
      html = html.replace(/<span[^>]*? class\s*=\s*["']?fr-marker["']?[^>]+>\u200b<\/span>/gi, '')
    }

    html = editor.clean.invisibleSpaces(html)

    html = editor.clean.exec(html, _processOnGet)

    const new_html = editor.events.chainTrigger('html.get', html)

    if (typeof new_html === 'string') {
      html = new_html
    }

    // Deal with pre.
    html = html.replace(/<pre(?:[\w\W]*?)>(?:[\w\W]*?)<\/pre>/g, (str) => str.replace(/<br>/g, '\n'))

    // Keep META.
    html = html.replace(/<meta((?:[\w\W]*?)) data-fr-http-equiv="/g, '<meta$1 http-equiv="')

    return html
  }

  /**
   * Get selected HTML.
   */
  function getSelected() {
    function wrapSelection(container, node) {
      while (node && (node.nodeType === Node.TEXT_NODE || !editor.node.isBlock(node)) && !editor.node.isElement(node) && !editor.node.hasClass(node, 'fr-inner')) {
        if (node && node.nodeType !== Node.TEXT_NODE) {
          $(container).wrapInner(editor.node.openTagString(node) + editor.node.closeTagString(node))
        }

        node = node.parentNode
      }
      // else if is for https://github.com/froala/wysiwyg-editor/issues/3352
      if (node && container.innerHTML === node.innerHTML) {
        container.innerHTML = node.outerHTML
      }
      else if (node.innerText.indexOf(container.innerHTML) != -1) {
        container.innerHTML = editor.node.openTagString(node) + node.innerHTML + editor.node.closeTagString(node);
      }
    }

    function selectionParent() {
      let parent = null
      let sel

      if (editor.win.getSelection) {
        sel = editor.win.getSelection()

        if (sel && sel.rangeCount) {
          parent = sel.getRangeAt(0).commonAncestorContainer

          if (parent.nodeType !== Node.ELEMENT_NODE) {
            parent = parent.parentNode
          }
        }
      }
      else if ((sel = editor.doc.selection) && sel.type !== 'Control') {
        parent = sel.createRange().parentElement()
      }

      if (parent !== null && ($(parent).parents().toArray().indexOf(editor.el) >= 0 || parent === editor.el)) {

        return parent
      }


      return null

    }

    let html = ''

    if (typeof editor.win.getSelection !== 'undefined') {

      // Multiple ranges hack.
      if (editor.browser.mozilla) {
        editor.selection.save()

        if (editor.$el.find('.fr-marker[data-type="false"]').length > 1) {
          editor.$el.find('.fr-marker[data-type="false"][data-id="0"]').remove()
          editor.$el.find('.fr-marker[data-type="false"]:last').attr('data-id', '0')
          editor.$el.find('.fr-marker').not('[data-id="0"]').remove()
        }
        editor.selection.restore()
      }

      const ranges = editor.selection.ranges()

      for (let i = 0; i < ranges.length; i++) {
        let container = document.createElement('div')
        container.appendChild(ranges[i].cloneContents())

        wrapSelection(container, selectionParent())

        // Fix for https://github.com/froala/wysiwyg-editor/issues/1010.
        if ($(container).find('.fr-element').length > 0) {
          container = editor.el
        }

        html += container.innerHTML
      }
    }
    else if (typeof editor.doc.selection !== 'undefined') {
      if (editor.doc.selection.type === 'Text') {
        html = editor.doc.selection.createRange().htmlText
      }
    }

    return html
  }

  function _hasBlockTags(html) {
    const tmp = editor.doc.createElement('div')
    tmp.innerHTML = html

    return tmp.querySelector(blockTagsQuery()) !== null
  }

  function _setCursorAtEnd(html) {
    const tmp = editor.doc.createElement('div')
    tmp.innerHTML = html

    editor.selection.setAtEnd(tmp, true)

    return tmp.innerHTML
  }

  function escapeEntities(str) {

    return str.replace(/</gi, '&lt;')
      .replace(/>/gi, '&gt;')
      .replace(/"/gi, '&quot;')
      .replace(/'/gi, '&#39;')
  }

  function _unwrapForLists(html) {
    if (!editor.html.defaultTag()) {
      return html
    }

    const tmp = editor.doc.createElement('div')
    tmp.innerHTML = html

    // https://github.com/froala/wysiwyg-editor/issues/1553. Unwrap default tags from lists.
    const default_tag_els = tmp.querySelectorAll(`:scope > ${editor.html.defaultTag()}`)

    for (let i = default_tag_els.length - 1; i >= 0; i--) {
      const el = default_tag_els[i]

      if (!editor.node.isBlock(el.previousSibling)) {

        // Check previous sibling in order to add br.
        if (el.previousSibling && !editor.node.isEmpty(el)) {
          $('<br>').insertAfter(el.previousSibling)
        }

        // Unwrap.
        el.outerHTML = el.innerHTML
      }
    }

    return tmp.innerHTML
  }

  /**
   * Insert HTML.
   */
  function insert(dirty_html, clean, do_split) {

    // There is no selection.
    if (!editor.selection.isCollapsed()) {
      editor.selection.remove()
    }

    let clean_html

    if (!clean) {
      clean_html = editor.clean.html(dirty_html)
    }
    else {
      clean_html = dirty_html
    }

    if (dirty_html.indexOf('class="fr-marker"') < 0) {
      clean_html = _setCursorAtEnd(clean_html)
    }

    // Editor is empty and there are block tags in the pasted HTML.
    if (editor.node.isEmpty(editor.el) && !editor.opts.keepFormatOnDelete && _hasBlockTags(clean_html)) {
      editor.el.innerHTML = clean_html
    }
    else {

      // Insert a marker.
      let marker = editor.markers.insert()

      if (!marker) {
        editor.el.innerHTML += clean_html
      }
      else {

        // Do not insert html inside emoticon.
        if (editor.node.isLastSibling(marker) && $(marker).parent().hasClass('fr-deletable')) {

          $(marker).insertAfter($(marker).parent())
        }

        // Check if HTML contains block tags and if so then break the current HTML.
        const block_parent = editor.node.blockParent(marker)

        if ((_hasBlockTags(clean_html) || do_split) && (editor.node.deepestParent(marker) || block_parent && block_parent.tagName === 'LI')) {
          if (block_parent && block_parent.tagName === 'LI') {
            clean_html = _unwrapForLists(clean_html)
          }

          marker = editor.markers.split()

          if (!marker) {
            return false
          }
          marker.outerHTML = clean_html
        }
        else {
          marker.outerHTML = clean_html
        }
      }
    }

    _normalize()
    editor.keys.positionCaret()

    editor.events.trigger('html.inserted')
  }

  /**
   * Clean those tags that have an invisible space inside.
   */
  function cleanWhiteTags(ignore_selection) {
    let current_el = null

    if (typeof ignore_selection === 'undefined') {
      current_el = editor.selection.element()
    }

    if (editor.opts.keepFormatOnDelete) {
      return false
    }

    const current_white = current_el ? (current_el.textContent.match(/\u200B/g) || []).length - current_el.querySelectorAll('.fr-marker').length : 0
    const total_white = (editor.el.textContent.match(/\u200B/g) || []).length - editor.el.querySelectorAll('.fr-marker').length

    if (total_white === current_white) {
      return false
    }

    let possible_elements
    let removed

    do {
      removed = false
      possible_elements = editor.el.querySelectorAll('*:not(.fr-marker)')

      for (let i = 0; i < possible_elements.length; i++) {
        const el = possible_elements[i]

        if (current_el === el) {
          continue
        }

        const text = el.textContent

        if (el.children.length === 0 && text.length === 1 && text.charCodeAt(0) === 8203 && el.tagName !== 'TD') {
          $(el).remove()
          removed = true
        }
      }
    } while (removed)
  }

  function _cleanTags() {
    cleanWhiteTags()

    if (editor.placeholder) {
      setTimeout(editor.placeholder.refresh, 0)
    }
  }

  /**
   * Initialization.
   */
  function _init() {
    editor.events.$on(editor.$el, 'mousemove', 'span.fr-word-select', function (e) {
      let selection = window.getSelection()
      selection = window.getSelection();
      let range = document.createRange();
      range.selectNodeContents(e.target);
      selection.removeAllRanges();
      selection.addRange(range);
    })
    if (editor.$wp) {
      editor.events.on('mouseup', _cleanTags)
      editor.events.on('keydown', _cleanTags)
      editor.events.on('contentChanged', checkIfEmpty)
    }
  }

  return {
    defaultTag,
    isPreformatted,
    emptyBlocks,
    emptyBlockTagsQuery,
    blockTagsQuery,
    fillEmptyBlocks,
    cleanEmptyTags,
    cleanWhiteTags,
    cleanBlankSpaces,
    blocks,
    getDoctype,
    set,
    syncInputs,
    get,
    getSelected,
    insert,
    wrap: _wrap,
    unwrap,
    escapeEntities,
    checkIfEmpty,
    extractNode,
    extractNodeAttrs,
    extractDoctype,
    cleanBRs,
    _init,
    _setHtml
  }
}

