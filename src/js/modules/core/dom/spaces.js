import FE from '../../../editor.js'

FE.MODULES.spaces = function (editor) {

  function _normalizeNode(node, browser_way) {
    const p_node = node.previousSibling
    const n_node = node.nextSibling
    let txt = node.textContent
    const parent_node = node.parentNode
    const enterTags = ['P', 'DIV', 'BR']
    const tagOptsValues = [FE.ENTER_P, FE.ENTER_DIV, FE.ENTER_BR]

    if (editor.html.isPreformatted(parent_node)) {
      return
    }

    if (browser_way) {
      txt = txt.replace(/[\f\n\r\t\v ]{2,}/g, ' ')

      // No node after.
      if ((!n_node || n_node.tagName === 'BR' || editor.node.isBlock(n_node)) && (editor.node.isBlock(parent_node) || editor.node.isLink(parent_node) && !parent_node.nextSibling || editor.node.isElement(parent_node))) {
        txt = txt.replace(/[\f\n\r\t\v ]{1,}$/g, '')
      }

      if ((!p_node || p_node.tagName === 'BR' || editor.node.isBlock(p_node)) && (editor.node.isBlock(parent_node) || editor.node.isLink(parent_node) && !parent_node.previousSibling || editor.node.isElement(parent_node))) {
        txt = txt.replace(/^[\f\n\r\t\v ]{1,}/g, '')
      }

      // https://github.com/froala/wysiwyg-editor/issues/3099
      if (editor.node.isBlock(n_node) || editor.node.isBlock(p_node)) {
        txt = txt.replace(/^[\f\n\r\t\v ]{1,}/g, '');
      }

      // https://github.com/froala/wysiwyg-editor/issues/1767 .
      if (txt === ' ' && ((p_node && editor.node.isVoid(p_node)) || (n_node && editor.node.isVoid(n_node))) && !((p_node && n_node && editor.node.isVoid(p_node)) || (n_node && p_node && editor.node.isVoid(n_node)))) {
        txt = ''
      }
    }

    // Collapse spaces when we have nested blocks.
    if ((!p_node && editor.node.isBlock(n_node) || !n_node && editor.node.isBlock(p_node)) && editor.node.isBlock(parent_node) && parent_node !== editor.el) {
      txt = txt.replace(/^[\f\n\r\t\v ]{1,}/g, '')
    }

    // Convert all non breaking to breaking spaces.
    if (!browser_way) {
      txt = txt.replace(new RegExp(FE.UNICODE_NBSP, 'g'), ' ')
    }

    let new_text = ''

    for (let t = 0; t < txt.length; t++) {

      // Do not use unicodes next to void tags.
      if (txt.charCodeAt(t) == 32 && (t === 0 || new_text.charCodeAt(t - 1) == 32) && ((editor.opts.enter === FE.ENTER_BR || editor.opts.enter === FE.ENTER_DIV) && (p_node && p_node.tagName === 'BR' || n_node && n_node.tagName === 'BR') || !((p_node && n_node && editor.node.isVoid(p_node)) || (p_node && n_node && editor.node.isVoid(n_node))))) {
        new_text += FE.UNICODE_NBSP
      }
      else {
        new_text += txt[t]
      }
    }

    // Ending spaces should be NBSP or spaces before block tags.
    // 1. No node after. (and the parent node is block tag.)
    // 2. Next block is block tag.
    // 3. Next element has display block.
    if (!n_node || n_node && editor.node.isBlock(n_node) || n_node && n_node.nodeType === Node.ELEMENT_NODE && editor.win.getComputedStyle(n_node) && editor.win.getComputedStyle(n_node).display === 'block') {

      // OR(||) condition is for https://github.com/froala-labs/froala-editor-js-2/issues/1949
      if (!editor.node.isVoid(p_node) || (p_node && enterTags.indexOf(p_node.tagName) !== -1 && tagOptsValues.indexOf(editor.opts.enter) !== -1)) {
        new_text = new_text.replace(/ $/, FE.UNICODE_NBSP)
      }
    }

    // Previous sibling is not void or block.
    if (p_node && !editor.node.isVoid(p_node) && !editor.node.isBlock(p_node)) {
      new_text = new_text.replace(/^\u00A0([^ $])/, ' $1')

      // https://github.com/froala/wysiwyg-editor/issues/1355.
      if (new_text.length === 1 && new_text.charCodeAt(0) === 160 && n_node && !editor.node.isVoid(n_node) && !editor.node.isBlock(n_node)) {
        // https://github.com/froala-labs/froala-editor-js-2/issues/683
        // if new text is not surrounded by markers
        if (!(editor.node.hasClass(p_node, 'fr-marker') && editor.node.hasClass(n_node, 'fr-marker'))) {
          new_text = ' ';
        }
      }
    }

    // Convert middle nbsp to spaces.
    if (!browser_way) {
      new_text = new_text.replace(/([^ \u00A0])\u00A0([^ \u00A0])/g, '$1 $2')
    }

    if (node.textContent !== new_text) {
      node.textContent = new_text
    }
  }

  function normalize(el, browser_way) {
    if (typeof el === 'undefined' || !el) {
      el = editor.el
    }

    if (typeof browser_way === 'undefined') {
      browser_way = false
    }

    // Ignore contenteditable.
    if (el.getAttribute && el.getAttribute('contenteditable') === 'false') {
      return
    }

    if (el.nodeType === Node.TEXT_NODE) {
      _normalizeNode(el, browser_way)
    }
    else if (el.nodeType === Node.ELEMENT_NODE) {
      const walker = editor.doc.createTreeWalker(el, NodeFilter.SHOW_TEXT, editor.node.filter((node) => {

        // Store the current parent node.
        let temp_node = node.parentNode

        // Loop through the nodes to see if it is PRE tag, go to the highest parent until editable element.
        while (temp_node && temp_node !== editor.el) {

          if (temp_node.tagName === 'STYLE' || temp_node.tagName === 'IFRAME') {
            return false
          }

          if (temp_node.tagName !== 'PRE') {

            // Check next parent.
            temp_node = temp_node.parentNode
          }
          else {

            // If inside a PRE tag return false and move to next element.
            return false
          }
        }

        // If not PRE tag start matching for chars that need to be removed from all other html tags.
        return node.textContent.match(/([ \u00A0\f\n\r\t\v]{2,})|(^[ \u00A0\f\n\r\t\v]{1,})|([ \u00A0\f\n\r\t\v]{1,}$)/g) !== null && !editor.node.hasClass(node.parentNode, 'fr-marker')
      }), false)

      while (walker.nextNode()) {
        _normalizeNode(walker.currentNode, browser_way)
      }
    }
  }

  function normalizeAroundCursor() {
    const nodes = []
    const markers = editor.el.querySelectorAll('.fr-marker')

    // Get the deep parent node of each marker.
    for (let i = 0; i < markers.length; i++) {
      let node = null
      const p_node = editor.node.blockParent(markers[i])

      if (p_node) {
        node = p_node
      }
      else {
        node = markers[i]
      }

      let next_node = node.nextSibling
      let prev_node = node.previousSibling

      while (next_node && next_node.tagName === 'BR') {
        next_node = next_node.nextSibling
      }

      while (prev_node && prev_node.tagName === 'BR') {
        prev_node = prev_node.previousSibling
      }

      // Push current node, prev and next one.
      if (node && nodes.indexOf(node) < 0) {
        nodes.push(node)
      }

      if (prev_node && nodes.indexOf(prev_node) < 0) {
        nodes.push(prev_node)
      }

      if (next_node && nodes.indexOf(next_node) < 0) {
        nodes.push(next_node)
      }
    }

    for (let j = 0; j < nodes.length; j++) {
      normalize(nodes[j])
    }
  }

  return {
    normalize,
    normalizeAroundCursor
  }
}
