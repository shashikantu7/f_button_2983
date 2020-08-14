import FE from '../../../editor.js'

FE.INVISIBLE_SPACE = '&#8203;'
FE.START_MARKER = `<span class="fr-marker" data-id="0" data-type="true" style="display: none; line-height: 0;">${FE.INVISIBLE_SPACE}</span>`
FE.END_MARKER = `<span class="fr-marker" data-id="0" data-type="false" style="display: none; line-height: 0;">${FE.INVISIBLE_SPACE}</span>`
FE.MARKERS = FE.START_MARKER + FE.END_MARKER

FE.MODULES.markers = function (editor) {
  const $ = editor.$

  /**
   * Build marker element.
   */
  function _build(marker, id) {
    const $span = $(editor.doc.createElement('SPAN'))
    $span
      .addClass('fr-marker')
      .attr('data-id', id)
      .attr('data-type', marker)
      .attr('style', `display: ${editor.browser.safari ? 'none' : 'inline-block'}; line-height: 0;`)
      .html(FE.INVISIBLE_SPACE)

    return $span.get(0)
  }

  /**
   * Place marker.
   */
  function place(range, marker, id) {
    let mk
    let contents
    let sibling

    try {
      const boundary = range.cloneRange()
      boundary.collapse(marker)

      boundary.insertNode(_build(marker, id))

      if (marker === true) {
        mk = editor.$el.find(`span.fr-marker[data-type="true"][data-id="${id}"]`).get(0)
        sibling = mk.nextSibling

        // Clean empty spaces.
        while (sibling && sibling.nodeType === Node.TEXT_NODE && sibling.textContent.length === 0) {
          $(sibling).remove()
          sibling = mk.nextSibling
        }
      }

      if (marker === true && !range.collapsed) {

        // Move markers outside of something like this:
        // <p><strong>fooM</strong>bar</p>
        while (!editor.node.isElement(mk.parentNode) && !sibling) {
          $(mk.parentNode).after(mk)
          sibling = mk.nextSibling
        }

        if (sibling && sibling.nodeType === Node.ELEMENT_NODE && editor.node.isBlock(sibling) && sibling.tagName !== 'HR') {

          // Place the marker deep inside the block tags.
          contents = [sibling]

          do {
            sibling = contents[0]
            contents = editor.node.contents(sibling)
          } while (contents[0] && editor.node.isBlock(contents[0]))

          $(sibling).prepend($(mk))
        }
      }

      if (marker === false && !range.collapsed) {
        mk = editor.$el.find(`span.fr-marker[data-type="false"][data-id="${id}"]`).get(0)
        sibling = mk.previousSibling

        if (sibling && sibling.nodeType === Node.ELEMENT_NODE && editor.node.isBlock(sibling) && sibling.tagName !== 'HR') {

          // Place the marker deep inside the block tags.
          contents = [sibling]

          do {
            sibling = contents[contents.length - 1]
            contents = editor.node.contents(sibling)
          } while (contents[contents.length - 1] && editor.node.isBlock(contents[contents.length - 1]))

          $(sibling).append($(mk))
        }

        // https://github.com/froala/wysiwyg-editor/issues/705
        // https://github.com/froala-labs/froala-editor-js-2/issues/854
        if (mk.parentNode && ['TD', 'TH'].indexOf(mk.parentNode.tagName) >= 0 || (!mk.previousSibling && editor.node.isBlock(mk.parentElement))) {
          if (mk.parentNode.previousSibling && !mk.previousSibling) {
            $(mk.parentNode.previousSibling).append(mk)
          }
        }
      }

      const dom_marker = editor.$el.find(`span.fr-marker[data-type="${marker}"][data-id="${id}"]`).get(0)

      // If image is at the top of the editor in an empty P
      // and floated to right, the text will be pushed down
      // when trying to insert an image.
      if (dom_marker) {
        dom_marker.style.display = 'none'
      }

      return dom_marker
    }
    catch (ex) {
      return null
    }
  }

  /**
   * Insert a single marker.
   */
  function insert() {
    if (!editor.$wp) {
      return null
    }

    try {
      const range = editor.selection.ranges(0)
      const container = range.commonAncestorContainer

      // Check if selection is inside editor.
      if (container !== editor.el && !editor.$el.contains(container)) {
        return null
      }

      const boundary = range.cloneRange()
      const original_range = range.cloneRange()
      boundary.collapse(true)

      let mk = $(editor.doc.createElement('SPAN'))
        .addClass('fr-marker')
        .attr('style', 'display: none; line-height: 0;')
        .html(FE.INVISIBLE_SPACE)
        .get(0)

      boundary.insertNode(mk)

      mk = editor.$el.find('span.fr-marker').get(0)

      if (mk) {
        let sibling = mk.nextSibling

        while (sibling && sibling.nodeType === Node.TEXT_NODE && sibling.textContent.length === 0) {
          $(sibling).remove()
          sibling = editor.$el.find('span.fr-marker').get(0).nextSibling
        }

        // Keep original selection.
        editor.selection.clear()
        editor.selection.get().addRange(original_range)

        return mk
      }

      return null

    }
    catch (ex) {
      console.warn('MARKER', ex)
    }
  }

  /**
   * Split HTML at the marker position.
   */
  function split() {
    if (!editor.selection.isCollapsed()) {
      editor.selection.remove()
    }

    let marker = editor.$el.find('.fr-marker').get(0)

    if (!marker) {
      marker = insert()
    }

    if (!marker) {
      return null
    }

    let deep_parent = editor.node.deepestParent(marker)

    if (!deep_parent) {
      deep_parent = editor.node.blockParent(marker)

      if (deep_parent && deep_parent.tagName !== 'LI') {
        deep_parent = null
      }
    }

    if (deep_parent) {
      if (editor.node.isBlock(deep_parent) && editor.node.isEmpty(deep_parent)) {

        // https://github.com/froala/wysiwyg-editor/issues/1730.
        // https://github.com/froala/wysiwyg-editor/issues/1970.
        if (deep_parent.tagName === 'LI' && (deep_parent.parentNode.firstElementChild === deep_parent && !editor.node.isEmpty(deep_parent.parentNode))) {
          $(deep_parent).append('<span class="fr-marker"></span>')
        }
        else {
          $(deep_parent).replaceWith('<span class="fr-marker"></span>')
        }
      }
      else if (editor.cursor.isAtStart(marker, deep_parent)) {
        $(deep_parent).before('<span class="fr-marker"></span>')
        $(marker).remove()
      }
      else if (editor.cursor.isAtEnd(marker, deep_parent)) {
        $(deep_parent).after('<span class="fr-marker"></span>')
        $(marker).remove()
      }
      else {
        let node = marker
        let close_str = ''
        let open_str = ''

        do {
          node = node.parentNode
          close_str += editor.node.closeTagString(node)
          open_str = editor.node.openTagString(node) + open_str
        } while (node !== deep_parent)

        $(marker).replaceWith('<span id="fr-break"></span>')
        let h = editor.node.openTagString(deep_parent) + $(deep_parent).html() + editor.node.closeTagString(deep_parent)
        h = h.replace(/<span id="fr-break"><\/span>/g, `${close_str}<span class="fr-marker"></span>${open_str}`)

        $(deep_parent).replaceWith(h)
      }
    }

    return editor.$el.find('.fr-marker').get(0)
  }

  /**
   * Insert marker at point from event.
   *
   * http://stackoverflow.com/questions/11191136/set-a-selection-range-from-a-to-b-in-absolute-position
   * https://developer.mozilla.org/en-US/docs/Web/API/this.document.caretPositionFromPoint
   */
  function insertAtPoint(e) {
    const x = e.clientX
    const y = e.clientY

    // Clear markers.
    remove()

    let start
    let range = null

    // Default.
    if (typeof editor.doc.caretPositionFromPoint !== 'undefined') {
      start = editor.doc.caretPositionFromPoint(x, y)
      range = editor.doc.createRange()

      range.setStart(start.offsetNode, start.offset)
      range.setEnd(start.offsetNode, start.offset)
    }

    // Webkit.
    else if (typeof editor.doc.caretRangeFromPoint !== 'undefined') {
      start = editor.doc.caretRangeFromPoint(x, y)
      range = editor.doc.createRange()

      range.setStart(start.startContainer, start.startOffset)
      range.setEnd(start.startContainer, start.startOffset)
    }

    // Set ranges.
    if (range !== null && typeof editor.win.getSelection !== 'undefined') {
      const sel = editor.win.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
    }

    // MSIE.
    else if (typeof editor.doc.body.createTextRange !== 'undefined') {
      try {
        range = editor.doc.body.createTextRange()
        range.moveToPoint(x, y)
        const end_range = range.duplicate()
        end_range.moveToPoint(x, y)
        range.setEndPoint('EndToEnd', end_range)
        range.select()
      }
      catch (ex) {
        return false
      }
    }

    insert()
  }

  /**
   * Remove markers.
   */
  function remove() {
    editor.$el.find('.fr-marker').remove()
  }

  return {
    place,
    insert,
    split,
    insertAtPoint,
    remove
  }
}
