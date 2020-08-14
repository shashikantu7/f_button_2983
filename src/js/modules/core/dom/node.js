import FE from '../../../editor.js'

FE.MODULES.node = function (editor) {
  const $ = editor.$

  function getContents(node) {
    if (!node || node.tagName === 'IFRAME') {
      return []
    }

    return Array.prototype.slice.call(node.childNodes || [])
  }

  /**
   * Determine if the node is a block tag.
   */
  function isBlock(node) {
    if (!node) {
      return false
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return false
    }

    return FE.BLOCK_TAGS.indexOf(node.tagName.toLowerCase()) >= 0
  }

  /**
   * Determine if the node is a link tag.
   */
  function isLink(node) {
    if (!node) {
      return false
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return false
    }

    return node.tagName.toLowerCase() === 'a'
  }

  /**
   * Check if a DOM element is empty.
   */
  function isEmpty(el, ignore_markers) {
    if (!el) {
      return true
    }

    if (el.querySelector('table')) {
      return false
    }

    // Get element contents.
    let contents = getContents(el)

    // Check if there is a block tag.
    if (contents.length === 1 && isBlock(contents[0])) {
      contents = getContents(contents[0])
    }

    let has_br = false

    for (let i = 0; i < contents.length; i++) {
      const node = contents[i]

      if (ignore_markers && editor.node.hasClass(node, 'fr-marker')) {
        continue
      }

      if (node.nodeType === Node.TEXT_NODE && node.textContent.length === 0) {
        continue
      }

      if (node.tagName !== 'BR' && (node.textContent || '').replace(/\u200B/gi, '').replace(/\n/g, '').length > 0) {
        return false
      }

      if (has_br) {
        return false
      }
      else if (node.tagName === 'BR') {
        has_br = true
      }
    }

    // Look for void nodes.
    if (el.querySelectorAll(FE.VOID_ELEMENTS.join(',')).length - el.querySelectorAll('br').length) {
      return false
    }

    // Look for empty allowed tags.
    if (el.querySelector(`${editor.opts.htmlAllowedEmptyTags.join(':not(.fr-marker),')}:not(.fr-marker)`)) {
      return false
    }

    // Look for block tags.
    if (el.querySelectorAll(FE.BLOCK_TAGS.join(',')).length > 1) {
      return false
    }

    // Look for do not wrap tags.
    if (el.querySelector(`${editor.opts.htmlDoNotWrapTags.join(':not(.fr-marker),')}:not(.fr-marker)`)) {
      return false
    }


    return true
  }

  /**
   * Get the block parent.
   */
  function blockParent(node) {
    while (node && node.parentNode !== editor.el && !(node.parentNode && editor.node.hasClass(node.parentNode, 'fr-inner'))) {
      node = node.parentNode

      if (isBlock(node)) {
        return node
      }
    }

    return null
  }

  /**
   * Get deepest parent till the element.
   */
  function deepestParent(node, until, simple_enter) {
    if (typeof until === 'undefined') {
      until = []
    }

    if (typeof simple_enter === 'undefined') {
      simple_enter = true
    }
    until.push(editor.el)

    if (until.indexOf(node.parentNode) >= 0 || node.parentNode && editor.node.hasClass(node.parentNode, 'fr-inner') || node.parentNode && FE.SIMPLE_ENTER_TAGS.indexOf(node.parentNode.tagName) >= 0 && simple_enter) {
      return null
    }

    // 1. Before until.
    // 2. Parent node doesn't has class fr-inner.
    // 3. Parent node is not a simple enter tag or quote.
    // 4. Parent node is not a block tag
    while (until.indexOf(node.parentNode) < 0 && node.parentNode && !editor.node.hasClass(node.parentNode, 'fr-inner') && (FE.SIMPLE_ENTER_TAGS.indexOf(node.parentNode.tagName) < 0 || !simple_enter) && !(isBlock(node) && !isBlock(node.parentNode)) && (!(isBlock(node) && isBlock(node.parentNode)) || !simple_enter)) {
      node = node.parentNode
    }

    return node
  }

  function rawAttributes(node) {
    const attrs = {}

    const atts = node.attributes

    if (atts) {
      for (let i = 0; i < atts.length; i++) {
        const att = atts[i]
        attrs[att.nodeName] = att.value
      }
    }

    return attrs
  }

  /**
   * Get attributes for a node as a string.
   */
  function attributes(node) {
    let str = ''
    const atts = rawAttributes(node)

    const keys = Object.keys(atts).sort()

    for (let i = 0; i < keys.length; i++) {
      const nodeName = keys[i]
      let value = atts[nodeName]

      // Double quote + no single quote. (")
      if (value.indexOf('\'') < 0 && value.indexOf('"') >= 0) {
        str += ` ${nodeName}='${value}'`
      }

      // Double quote + single quote. ("')
      else if (value.indexOf('"') >= 0 && value.indexOf('\'') >= 0) {
        value = value.replace(/"/g, '&quot;')
        str += ` ${nodeName}="${value}"`
      }

      // Single quote or no quote at all.
      else {
        str += ` ${nodeName}="${value}"`
      }
    }

    return str
  }

  function clearAttributes(node) {
    const atts = node.attributes

    for (let i = atts.length - 1; i >= 0; i--) {
      const att = atts[i]
      node.removeAttribute(att.nodeName)
    }
  }

  /**
   * Open string for a node.
   */
  function openTagString(node) {
    return `<${node.tagName.toLowerCase()}${attributes(node)}>`
  }

  /**
   * Close string for a node.
   */
  function closeTagString(node) {
    return `</${node.tagName.toLowerCase()}>`
  }

  /**
   * Determine if the node has any left sibling.
   */
  function isFirstSibling(node, ignore_markers) {
    if (typeof ignore_markers === 'undefined') {
      ignore_markers = true
    }
    let sibling = node.previousSibling

    while (sibling && ignore_markers && editor.node.hasClass(sibling, 'fr-marker')) {
      sibling = sibling.previousSibling
    }

    if (!sibling) {
      return true
    }

    if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent === '') {
      return isFirstSibling(sibling)
    }

    return false
  }

  /**
   * Determine if the node has any right sibling.
   */
  function isLastSibling(node, ignore_markers) {
    if (typeof ignore_markers === 'undefined') {
      ignore_markers = true
    }
    let sibling = node.nextSibling

    while (sibling && ignore_markers && editor.node.hasClass(sibling, 'fr-marker')) {
      sibling = sibling.nextSibling
    }

    if (!sibling) {
      return true
    }

    if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent === '') {
      return isLastSibling(sibling)
    }

    return false
  }

  function isVoid(node) {
    return node && node.nodeType === Node.ELEMENT_NODE && FE.VOID_ELEMENTS.indexOf((node.tagName || '').toLowerCase()) >= 0
  }

  /**
   * Check if the node is a list.
   */
  function isList(node) {
    if (!node) {
      return false
    }

    return ['UL', 'OL'].indexOf(node.tagName) >= 0
  }

  /**
   * Check if the node is the editable element.
   */
  function isElement(node) {
    return node === editor.el
  }

  /**
   * Check if the node is the editable element.
   */
  function isDeletable(node) {
    return node && node.nodeType === Node.ELEMENT_NODE && node.getAttribute('class') && (node.getAttribute('class') || '').indexOf('fr-deletable') >= 0
  }

  /**
   * Check if the node has focus.
   */
  function hasFocus(node) {
    return node === editor.doc.activeElement && (!editor.doc.hasFocus || editor.doc.hasFocus()) && Boolean(isElement(node) || node.type || node.href || ~node.tabIndex)
  }

  function isEditable(node) {
    return (!node.getAttribute || node.getAttribute('contenteditable') !== 'false')
              && ['STYLE', 'SCRIPT'].indexOf(node.tagName) < 0
  }

  function hasClass(el, cls) {
    if (el instanceof $) {
      el = el.get(0)
    }

    return el && el.classList && el.classList.contains(cls)
  }

  function filter(callback) {
    if (editor.browser.msie) {

      return callback
    }


    return {
      acceptNode: callback
    }

  }

  return {
    isBlock,
    isEmpty,
    blockParent,
    deepestParent,
    rawAttributes,
    attributes,
    clearAttributes,
    openTagString,
    closeTagString,
    isFirstSibling,
    isLastSibling,
    isList,
    isLink,
    isElement,
    contents: getContents,
    isVoid,
    hasFocus,
    isEditable,
    isDeletable,
    hasClass,
    filter
  }
}
