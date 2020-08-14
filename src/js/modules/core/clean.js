import './dom/node.js'

import FE from '../../editor.js'

// Extend defaults.
Object.assign(FE.DEFAULTS, {

  // Tags that describe head from HEAD http://www.w3schools.com/html/html_head.asp.
  htmlAllowedTags: ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'queue', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'style', 'section', 'select', 'small', 'source', 'span', 'strike', 'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr'],
  htmlRemoveTags: ['script', 'style'],
  htmlAllowedAttrs: ['accept', 'accept-charset', 'accesskey', 'action', 'align', 'allowfullscreen', 'allowtransparency', 'alt', 'async', 'autocomplete', 'autofocus', 'autoplay', 'autosave', 'background', 'bgcolor', 'border', 'charset', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'color', 'cols', 'colspan', 'content', 'contenteditable', 'contextmenu', 'controls', 'coords', 'data', 'data-.*', 'datetime', 'default', 'defer', 'dir', 'dirname', 'disabled', 'download', 'draggable', 'dropzone', 'enctype', 'for', 'form', 'formaction', 'frameborder', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'http-equiv', 'icon', 'id', 'ismap', 'itemprop', 'keytype', 'kind', 'label', 'lang', 'language', 'list', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'mozallowfullscreen', 'multiple', 'muted', 'name', 'novalidate', 'open', 'optimum', 'pattern', 'ping', 'placeholder', 'playsinline', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'reversed', 'rows', 'rowspan', 'sandbox', 'scope', 'scoped', 'scrolling', 'seamless', 'selected', 'shape', 'size', 'sizes', 'span', 'src', 'srcdoc', 'srclang', 'srcset', 'start', 'step', 'summary', 'spellcheck', 'style', 'tabindex', 'target', 'title', 'type', 'translate', 'usemap', 'value', 'valign', 'webkitallowfullscreen', 'width', 'wrap'],
  htmlAllowedStyleProps: ['.*'],
  htmlAllowComments: true,
  htmlUntouched: false,
  fullPage: false // Will also turn iframe on.
})

FE.HTML5Map = {
  B: 'STRONG',
  I: 'EM',
  STRIKE: 'S'
}

FE.MODULES.clean = function (editor) {
  const $ = editor.$

  let allowedTagsRE
  let removeTagsRE
  let allowedAttrsRE
  let allowedStylePropsRE

  function _removeInvisible(node) {
    if (node.nodeType === Node.ELEMENT_NODE && node.getAttribute('class') && node.getAttribute('class').indexOf('fr-marker') >= 0) {
      return false
    }

    // Get node contents.
    let contents = editor.node.contents(node)
    let markers = []
    let i

    // Loop through contents.
    for (i = 0; i < contents.length; i++) {

      // If node is not void.
      if (contents[i].nodeType === Node.ELEMENT_NODE && !editor.node.isVoid(contents[i])) {

        // There are invisible spaces.
        if (contents[i].textContent.replace(/\u200b/g, '').length !== contents[i].textContent.length) {

          // Do remove invisible spaces.
          _removeInvisible(contents[i])
        }
      }

      // If node is text node, replace invisible spaces.
      else if (contents[i].nodeType === Node.TEXT_NODE) {
        contents[i].textContent = contents[i].textContent.replace(/\u200b/g, '')

        // .replace(/&/g, '&amp;');
      }
    }

    // Reasess contents after cleaning invisible spaces.
    if (node.nodeType === Node.ELEMENT_NODE && !editor.node.isVoid(node)) {
      node.normalize()
      contents = editor.node.contents(node)
      markers = node.querySelectorAll('.fr-marker')

      // All we have left are markers.
      if (contents.length - markers.length === 0) {

        // Make sure contents are all markers.
        for (i = 0; i < contents.length; i++) {
          if (contents[i].nodeType === Node.ELEMENT_NODE && (contents[i].getAttribute('class') || '').indexOf('fr-marker') < 0) {

            return false
          }
        }

        for (i = 0; i < markers.length; i++) {
          node.parentNode.insertBefore(markers[i].cloneNode(true), node)
        }
        node.parentNode.removeChild(node)

        return false
      }
    }
  }

  function _toHTML(el, is_pre) {
    if (el.nodeType === Node.COMMENT_NODE) {
      return `<!--${el.nodeValue}-->`
    }

    if (el.nodeType === Node.TEXT_NODE) {

      if (is_pre) {

        return el.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      }

      return el.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\u00A0/g, '&nbsp;').replace(/\u0009/g, '')
    }

    if (el.nodeType !== Node.ELEMENT_NODE) {
      return el.outerHTML
    }

    if (el.nodeType === Node.ELEMENT_NODE && ['STYLE', 'SCRIPT', 'NOSCRIPT'].indexOf(el.tagName) >= 0) {
      return el.outerHTML
    }

    if (el.nodeType === Node.ELEMENT_NODE && el.tagName === 'svg') {
      const temp = document.createElement('div')
      const node_clone = el.cloneNode(true)
      temp.appendChild(node_clone)

      return temp.innerHTML
    }

    if (el.tagName === 'IFRAME') {
      return el.outerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    }

    const contents = el.childNodes

    if (contents.length === 0) {
      return el.outerHTML
    }

    let str = ''

    for (let i = 0; i < contents.length; i++) {

      if (el.tagName === 'PRE') {
        is_pre = true
      }

      str += _toHTML(contents[i], is_pre)
    }


    return editor.node.openTagString(el) + str + editor.node.closeTagString(el)
  }

  let scripts = []

  function _encode(dirty_html) {

    // Replace script tag with comments.
    scripts = []

    dirty_html = dirty_html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, (str) => {
      scripts.push(str)

      return `[FROALA.EDITOR.SCRIPT ${scripts.length - 1}]`

    })

    dirty_html = dirty_html.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, (str) => {
      scripts.push(str)

      return `[FROALA.EDITOR.NOSCRIPT ${scripts.length - 1}]`
    })

    dirty_html = dirty_html.replace(/<meta((?:[\w\W]*?)) http-equiv="/g, '<meta$1 data-fr-http-equiv="')

    dirty_html = dirty_html.replace(/<img((?:[\w\W]*?)) src="/g, '<img$1 data-fr-src="')

    return dirty_html
  }

  function _decode(dirty_html) {

    // Replace script comments with the original script.
    dirty_html = dirty_html.replace(/\[FROALA\.EDITOR\.SCRIPT ([\d]*)\]/gi, (str, a1) => {
      if (editor.opts.htmlRemoveTags.indexOf('script') >= 0) {
        return ''
      }

      return scripts[parseInt(a1, 10)]

    })

    dirty_html = dirty_html.replace(/\[FROALA\.EDITOR\.NOSCRIPT ([\d]*)\]/gi, (str, a1) => {
      if (editor.opts.htmlRemoveTags.indexOf('noscript') >= 0) {
        return ''
      }

      return scripts[parseInt(a1, 10)].replace(/&lt;/g, '<').replace(/&gt;/g, '>')

    })

    dirty_html = dirty_html.replace(/<img((?:[\w\W]*?)) data-fr-src="/g, '<img$1 src="')

    return dirty_html
  }

  /*
   * Clean style attribute.
   */
  function _cleanStyle(style) {
    let cleaned_style = style.replace(/;;/gi, ';')
    cleaned_style = cleaned_style.replace(/^;/gi, '')

    if (cleaned_style.charAt(cleaned_style.length) !== ';') {
      cleaned_style += ';'
    }

    return cleaned_style
  }

  function _cleanAttrs(attrs) {
    let nm

    for (nm in attrs) {

      if (Object.prototype.hasOwnProperty.call(attrs, nm)) {

        // Check if attr is allowed.
        const is_attr_allowed = nm.match(allowedAttrsRE)

        // Check for allowed style properties.
        let allowed_style_props_matches = null

        // There are allowed style props.
        if (nm === 'style' && editor.opts.htmlAllowedStyleProps.length) {
          allowed_style_props_matches = attrs[nm].match(allowedStylePropsRE)
        }

        // Attribute is allowed and there are style matches.
        if (is_attr_allowed && allowed_style_props_matches) {

          // Override attr value with only the allowed properties.
          attrs[nm] = _cleanStyle(allowed_style_props_matches.join(';'))
        }
        else if (!is_attr_allowed || nm === 'style' && !allowed_style_props_matches) {
          delete attrs[nm]
        }
      }
    }

    let str = ''
    const keys = Object.keys(attrs).sort()

    for (let i = 0; i < keys.length; i++) {
      nm = keys[i]

      // Make sure we don't break any HTML.
      if (attrs[nm].indexOf('"') < 0) {
        str += ` ${nm}="${attrs[nm]}"`
      }
      else {
        str += ` ${nm}='${attrs[nm]}'`
      }
    }

    return str
  }

  function _rebuild(body_html, head_html, original_html) {
    if (editor.opts.fullPage) {

      // Get DOCTYPE.
      const doctype = editor.html.extractDoctype(original_html)

      // Get HTML attributes.
      const html_attrs = _cleanAttrs(editor.html.extractNodeAttrs(original_html, 'html'))

      // Get HEAD data.
      head_html = head_html === null ? editor.html.extractNode(original_html, 'head') || '<title></title>' : head_html
      const head_attrs = _cleanAttrs(editor.html.extractNodeAttrs(original_html, 'head'))

      // Get BODY attributes.
      const body_attrs = _cleanAttrs(editor.html.extractNodeAttrs(original_html, 'body'))

      return `${doctype}<html${html_attrs}><head${head_attrs}>${head_html}</head><body${body_attrs}>${body_html}</body></html>`
    }

    return body_html
  }

  function _process(html, func) {
    let i

    const doc  = document.implementation.createHTMLDocument('Froala DOC')
    const el = doc.createElement('DIV')
    $(el).append(html)

    let new_html = ''

    if (el) {
      let els = editor.node.contents(el)

      for (i = 0; i < els.length; i++) {
        func(els[i])
      }

      els = editor.node.contents(el)

      for (i = 0; i < els.length; i++) {
        new_html += _toHTML(els[i])
      }
    }

    return new_html
  }

  function exec(html, func, parse_head) {
    html = _encode(html)
    let b_html = html
    let h_html = null

    if (editor.opts.fullPage) {

      // Get BODY data.
      b_html = editor.html.extractNode(html, 'body') || (html.indexOf('<body') >= 0 ? '' : html)

      if (parse_head) {
        h_html = editor.html.extractNode(html, 'head') || ''
      }
    }

    b_html = _process(b_html, func)

    if (h_html) {
      h_html = _process(h_html, func)
    }

    const new_html = _rebuild(b_html, h_html, html)

    return _decode(new_html)
  }

  function invisibleSpaces(dirty_html) {
    if (dirty_html.replace(/\u200b/g, '').length === dirty_html.length) {
      return dirty_html
    }

    return editor.clean.exec(dirty_html, _removeInvisible)
  }

  function toHTML5() {
    const els = editor.el.querySelectorAll(Object.keys(FE.HTML5Map).join(','))

    if (els.length) {
      let sel_saved = false

      if (!editor.el.querySelector('.fr-marker')) {
        editor.selection.save()
        sel_saved = true
      }

      for (let i = 0; i < els.length; i++) {
        if (editor.node.attributes(els[i]) === '') {
          $(els[i]).replaceWith(`<${FE.HTML5Map[els[i].tagName]}>${els[i].innerHTML}</${FE.HTML5Map[els[i].tagName]}>`)
        }
      }

      if (sel_saved) {
        editor.selection.restore()
      }
    }
  }

  // Fixes paths coming as HTML entities which are later on converted to their coresponding chars.
  function _convertHref(href) {
    const div = editor.doc.createElement('DIV')
    div.innerText = href

    return div.textContent
  }

  function _node(node) {

    // Skip when we're dealing with markers.
    if (node.tagName === 'SPAN' && (node.getAttribute('class') || '').indexOf('fr-marker') >= 0) {
      return false
    }

    if (node.tagName === 'PRE') {
      _cleanPre(node)
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.getAttribute('data-fr-src') && node.getAttribute('data-fr-src').indexOf('blob:') !== 0) {
        node.setAttribute('data-fr-src', editor.helpers.sanitizeURL(_convertHref(node.getAttribute('data-fr-src'))))
      }

      if (node.getAttribute('href')) {
        node.setAttribute('href', editor.helpers.sanitizeURL(_convertHref(node.getAttribute('href'))))
      }

      if (node.getAttribute('src')) {
        node.setAttribute('src', editor.helpers.sanitizeURL(_convertHref(node.getAttribute('src'))))
      }

      if (['TABLE', 'TBODY', 'TFOOT', 'TR'].indexOf(node.tagName) >= 0) {
        node.innerHTML = node.innerHTML.trim()
      }
    }

    // Remove local images if option they are not allowed.
    if (!editor.opts.pasteAllowLocalImages && node.nodeType === Node.ELEMENT_NODE && node.tagName === 'IMG' && node.getAttribute('data-fr-src') && node.getAttribute('data-fr-src').indexOf('file://') === 0) {
      node.parentNode.removeChild(node)

      return false
    }

    if (node.nodeType === Node.ELEMENT_NODE && FE.HTML5Map[node.tagName] && editor.node.attributes(node) === '') {
      const tg = FE.HTML5Map[node.tagName]
      const new_node = `<${tg}>${node.innerHTML}</${tg}>`
      node.insertAdjacentHTML('beforebegin', new_node)
      node = node.previousSibling
      node.parentNode.removeChild(node.nextSibling)
    }

    if (!editor.opts.htmlAllowComments && node.nodeType === Node.COMMENT_NODE) {

      // Do not remove FROALA.EDITOR comments.
      if (node.data.indexOf('[FROALA.EDITOR') !== 0) {
        node.parentNode.removeChild(node)
      }
    }

    // Remove completely tags in denied tags.
    else if (node.tagName && node.tagName.match(removeTagsRE)) {

      // https://github.com/froala-labs/froala-editor-js-2/issues/1787
      // adding styles from style tag to inline styles
      if (node.tagName == 'STYLE' && editor.helpers.isMac()) {
        let styleString = node.innerHTML.trim()
        let classValues = []
        let rxp = /{([^}]+)}/g
        let curMatch
        styleString = styleString.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*|<!--[\s\S]*?-->$/, "");

        // eslint-disable-next-line no-cond-assign
        while(curMatch = rxp.exec( styleString )) {
          classValues.push( curMatch[1] );
        }
        for (let i = 0; styleString.indexOf('{') != -1; i++) {
          let className = styleString.substring(0, styleString.indexOf('{')).trim();
          node.parentNode.querySelectorAll(className).forEach(function (item) {
            item.removeAttribute('class')
            item.setAttribute('style', classValues[i])
          })
          styleString = styleString.substring(styleString.indexOf('}') + 1);
        }
      }

      node.parentNode.removeChild(node)
    }

    // Unwrap tags not in allowed tags.
    else if (node.tagName && !node.tagName.match(allowedTagsRE)) {

      // https://github.com/froala/wysiwyg-editor/issues/1711 . If svg is not allowed then remove it because it is a leaf node.
      if (node.tagName === 'svg') {
        node.parentNode.removeChild(node)
      }

      // Ignore path tag nodes that are inside a svg tag node.
      else if (!(editor.browser.safari && node.tagName === 'path' && node.parentNode && node.parentNode.tagName === 'svg')) {
        node.outerHTML = node.innerHTML
      }

    }

    // Check denied attributes.
    else {
      const attrs = node.attributes

      if (attrs) {

        for (let i = attrs.length - 1; i >= 0; i--) {
          const attr = attrs[i]

          // Check if attr is allowed.
          const is_attr_allowed = attr.nodeName.match(allowedAttrsRE)

          // Check for allowed style properties.
          let allowed_style_props_matches = null

          // There are allowed style props.
          if (attr.nodeName === 'style' && editor.opts.htmlAllowedStyleProps.length) {
            allowed_style_props_matches = attr.value.match(allowedStylePropsRE)
          }

          // Attribute is allowed and there are style matches.
          if (is_attr_allowed && allowed_style_props_matches) {

            // Override attr value with only the allowed properties.
            attr.value = _cleanStyle(allowed_style_props_matches.join(';'))
          }
          else if (!is_attr_allowed || attr.nodeName === 'style' && !allowed_style_props_matches) {
            node.removeAttribute(attr.nodeName)
          }
        }
      }
    }
  }

  function _run(node) {
    const contents = editor.node.contents(node)

    for (let i = 0; i < contents.length; i++) {
      if (contents[i].nodeType !== Node.TEXT_NODE) {
        _run(contents[i])
      }
    }

    _node(node)
  }

  /**
   * Clean pre.
   */
  function _cleanPre(pre) {
    const content = pre.innerHTML

    if (content.indexOf('\n') >= 0) {
      pre.innerHTML = content.replace(/\n/g, '<br>')
    }
  }

  /**
   * Clean the html input.
   */
  function html(dirty_html, denied_tags, denied_attrs, full_page) {
    if (typeof denied_tags === 'undefined') {
      denied_tags = []
    }

    if (typeof denied_attrs === 'undefined') {
      denied_attrs = []
    }

    if (typeof full_page === 'undefined') {
      full_page = false
    }

    // Empty spaces after BR always collapse.
    // dirty_html = dirty_html.replace(/<br> */g, '<br>');

    // Build the allowed tags array.
    const allowed_tags = $.merge([], editor.opts.htmlAllowedTags)
    let i

    for (i = 0; i < denied_tags.length; i++) {
      if (allowed_tags.indexOf(denied_tags[i]) >= 0) {
        allowed_tags.splice(allowed_tags.indexOf(denied_tags[i]), 1)
      }
    }

    // Build the allowed attrs array.
    const allowed_attrs = $.merge([], editor.opts.htmlAllowedAttrs)

    for (i = 0; i < denied_attrs.length; i++) {
      if (allowed_attrs.indexOf(denied_attrs[i]) >= 0) {
        allowed_attrs.splice(allowed_attrs.indexOf(denied_attrs[i]), 1)
      }
    }

    // We should allow data-fr.
    allowed_attrs.push('data-fr-.*')
    allowed_attrs.push('fr-.*')

    // Generate cleaning RegEx.
    allowedTagsRE = new RegExp(`^${allowed_tags.join('$|^')}$`, 'gi')
    allowedAttrsRE = new RegExp(`^${allowed_attrs.join('$|^')}$`, 'gi')
    removeTagsRE = new RegExp(`^${editor.opts.htmlRemoveTags.join('$|^')}$`, 'gi')

    if (editor.opts.htmlAllowedStyleProps.length) {
      allowedStylePropsRE = new RegExp(`((^|;|\\s)${editor.opts.htmlAllowedStyleProps.join(':.+?(?=;|$))|((^|;|\\s)')}:.+?(?=(;)|$))`, 'gi')
    }
    else {
      allowedStylePropsRE = null
    }

    dirty_html = exec(dirty_html, _run, true)

    return dirty_html
  }

  function _tablesWrapTHEAD() {
    const trs = editor.el.querySelectorAll('tr')

    // Make sure the TH lives inside thead.
    for (let i = 0; i < trs.length; i++) {

      // Search for th inside tr.
      const children = trs[i].children
      let ok = true

      for (let j = 0; j < children.length; j++) {
        if (children[j].tagName !== 'TH') {
          ok = false
          break
        }
      }

      // If there is something else than TH.
      if (ok === false || children.length === 0) {
        continue
      }

      let tr = trs[i]

      while (tr && tr.tagName !== 'TABLE' && tr.tagName !== 'THEAD') {
        tr = tr.parentNode
      }

      let thead = tr

      if (thead.tagName !== 'THEAD') {
        thead = editor.doc.createElement('THEAD')
        tr.insertBefore(thead, tr.firstChild)
      }

      thead.appendChild(trs[i])
    }
  }

  /**
   * Clean tables.
   */
  function tables() {
    _tablesWrapTHEAD()
  }

  function _listsWrapMissplacedLI() {

    // Find missplaced list items.
    let lis = []
    function filterListItem(li) {

      return !editor.node.isList(li.parentNode)
    }

    do {
      if (lis.length) {
        let li = lis[0]
        const ul = editor.doc.createElement('ul')
        li.parentNode.insertBefore(ul, li)

        do {
          const tmp = li
          li = li.nextSibling
          ul.appendChild(tmp)
        } while (li && li.tagName === 'LI')
      }

      lis = []
      const li_sel = editor.el.querySelectorAll('li')

      for (let i = 0; i < li_sel.length; i++) {
        if (filterListItem(li_sel[i])) {
          lis.push(li_sel[i])
        }
      }
    } while (lis.length > 0)
  }

  function _listsJoinSiblings() {

    // Join lists.
    const sibling_lists = editor.el.querySelectorAll('ol + ol, ul + ul')

    for (let k = 0; k < sibling_lists.length; k++) {
      const list = sibling_lists[k]

      if (editor.node.isList(list.previousSibling) && editor.node.openTagString(list) === editor.node.openTagString(list.previousSibling)) {
        const childs = editor.node.contents(list)

        for (let i = 0; i < childs.length; i++) {
          list.previousSibling.appendChild(childs[i])
        }
        list.parentNode.removeChild(list)
      }
    }
  }

  function _listsRemoveEmpty() {

    let i

    // Remove empty lists.
    let do_remove

    function removeEmptyList(lst) {
      if (!lst.querySelector('LI')) {
        do_remove = true
        lst.parentNode.removeChild(lst)
      }
    }

    do {
      do_remove = false

      // Remove empty li.
      const empty_lis = editor.el.querySelectorAll('li:empty')

      for (i = 0; i < empty_lis.length; i++) {
        empty_lis[i].parentNode.removeChild(empty_lis[i])
      }

      // Remove empty ul and ol.
      const remaining_lists = editor.el.querySelectorAll('ul, ol')

      for (i = 0; i < remaining_lists.length; i++) {
        removeEmptyList(remaining_lists[i])
      }
    } while (do_remove === true)
  }

  function _listsWrapLists() {

    // Do not allow list directly inside another list.
    const direct_lists = editor.el.querySelectorAll('ul > ul, ol > ol, ul > ol, ol > ul')

    for (let i = 0; i < direct_lists.length; i++) {
      const list = direct_lists[i]
      const prev_li = list.previousSibling

      if (prev_li) {
        if (prev_li.tagName === 'LI') {
          prev_li.appendChild(list)
        }
        else {
          $(list).wrap('<li></li>')
        }
      }
    }
  }

  function _listsNoTagAfterNested() {

    // Check if nested lists don't have HTML after them.
    const nested_lists = editor.el.querySelectorAll('li > ul, li > ol')

    for (let i = 0; i < nested_lists.length; i++) {
      const lst = nested_lists[i]

      if (lst.nextSibling) {
        let node = lst.nextSibling
        const $new_li = $(editor.doc.createElement('LI'))
        $(lst.parentNode).after($new_li.get(0))

        do {
          const tmp = node
          node = node.nextSibling
          $new_li.append(tmp)
        } while (node)
      }
    }
  }

  function _listsTypeInNested() {

    // Make sure we can type in nested list.
    const nested_lists = editor.el.querySelectorAll('li > ul, li > ol')

    for (let i = 0; i < nested_lists.length; i++) {
      const lst = nested_lists[i]

      // List is the first in the LI.
      if (editor.node.isFirstSibling(lst)) {
        $(lst).before('<br/>')
      }

      // Make sure we don't leave BR before list.
      else if (lst.previousSibling && lst.previousSibling.tagName === 'BR') {
        let prev_node = lst.previousSibling.previousSibling

        // Skip markers.
        while (prev_node && editor.node.hasClass(prev_node, 'fr-marker')) {
          prev_node = prev_node.previousSibling
        }

        // Remove BR only if there is something else than BR.
        if (prev_node && prev_node.tagName !== 'BR') {
          $(lst.previousSibling).remove()
        }
      }
    }
  }

  function _listsRemoveEmptyLI() {

    // Remove empty li.
    const empty_lis = editor.el.querySelectorAll('li:empty')

    for (let i = 0; i < empty_lis.length; i++) {
      $(empty_lis[i]).remove()
    }
  }

  function _listsFindMissplacedText() {
    const lists = editor.el.querySelectorAll('ul, ol')

    for (let i = 0; i < lists.length; i++) {
      const contents = editor.node.contents(lists[i])
      let $li = null

      for (let j = contents.length - 1; j >= 0; j--) {

        // https://github.com/froala/wysiwyg-editor/issues/3033
        if (contents[j].tagName !== 'LI' && contents[j].tagName != 'UL' && contents[j].tagName != 'OL' ) {
          if (!$li) {
            $li = $(editor.doc.createElement('LI'))
            $li.insertBefore(contents[j])
          }

          $li.prepend(contents[j])
        }
        else {
          $li = null
        }
      }
    }
  }

  /**
   * Clean lists.
   */
  function lists() {
    _listsWrapMissplacedLI()

    _listsJoinSiblings()

    _listsFindMissplacedText()

    _listsRemoveEmpty()

    _listsWrapLists()

    _listsNoTagAfterNested()

    _listsTypeInNested()

    _listsRemoveEmptyLI()
  }

  /**
   * Initialize
   */
  function _init() {

    // If fullPage is on allow head and title.
    if (editor.opts.fullPage) {
      $.merge(editor.opts.htmlAllowedTags, ['head', 'title', 'style', 'link', 'base', 'body', 'html', 'meta'])
    }
  }

  return {
    _init,
    html,
    toHTML5,
    tables,
    lists,
    invisibleSpaces,
    exec
  }
}
