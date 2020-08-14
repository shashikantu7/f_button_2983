import FE from '../../editor.js'

FE.MODULES.snapshot = function (editor) {
  /**
   * Get the index of a node inside it's parent.
   */
  function _getNodeIndex(node) {
    const childNodes = node.parentNode.childNodes
    let idx = 0
    let prevNode = null

    for (let i = 0; i < childNodes.length; i++) {
      if (prevNode) {

        // Current node is text and it is empty.
        const isEmptyText = childNodes[i].nodeType === Node.TEXT_NODE && childNodes[i].textContent === ''

        // Previous node is text, current node is text.
        const twoTexts = prevNode.nodeType === Node.TEXT_NODE && childNodes[i].nodeType === Node.TEXT_NODE

        // Empty prev node.
        var emptyPrevNode = (prevNode.nodeType === Node.TEXT_NODE && prevNode.textContent === '');

        if (!isEmptyText && !twoTexts && !emptyPrevNode) {
          idx++
        }
      }

      if (childNodes[i] === node) {
        return idx
      }

      prevNode = childNodes[i]
    }
  }

  /**
   * Determine the location of the node inside the element.
   */
  function _getNodeLocation(node) {
    const loc = []

    if (!node.parentNode) {
      return []
    }

    while (!editor.node.isElement(node)) {
      loc.push(_getNodeIndex(node))
      node = node.parentNode
    }

    return loc.reverse()
  }

  /**
   * Get the range offset inside the node.
   */
  function _getRealNodeOffset(node, offset) {
    while (node && node.nodeType === Node.TEXT_NODE) {
      const prevNode = node.previousSibling

      if (prevNode && prevNode.nodeType === Node.TEXT_NODE) {
        offset += prevNode.textContent.length
      }
      node = prevNode
    }

    return offset
  }

  /**
   * Codify each range.
   */
  function _getRange(range) {
    return {
      scLoc: _getNodeLocation(range.startContainer),
      scOffset: _getRealNodeOffset(range.startContainer, range.startOffset),
      ecLoc: _getNodeLocation(range.endContainer),
      ecOffset: _getRealNodeOffset(range.endContainer, range.endOffset)
    }
  }

  /**
   * Get the current snapshot.
   */
  function get() {
    const snapshot = {}

    editor.events.trigger('snapshot.before')

    snapshot.html = (editor.$wp ? editor.$el.html() : editor.$oel.get(0).outerHTML).replace(/ style=""/g, '')

    snapshot.ranges = []

    if (editor.$wp && editor.selection.inEditor() && editor.core.hasFocus()) {
      const ranges = editor.selection.ranges()

      for (let i = 0; i < ranges.length; i++) {
        snapshot.ranges.push(_getRange(ranges[i]))
      }
    }

    editor.events.trigger('snapshot.after', [snapshot])

    return snapshot
  }

  /**
   * Determine node by its location in the main element.
   */
  function _getNodeByLocation(loc) {
    let node = editor.el

    for (let i = 0; i < loc.length; i++) {
      node = node.childNodes[loc[i]]
    }

    return node
  }

  /**
   * Restore range from snapshot.
   */
  function _restoreRange(sel, range_snapshot) {
    try {

      // Get range info.
      const startNode = _getNodeByLocation(range_snapshot.scLoc)
      const startOffset = range_snapshot.scOffset
      const endNode = _getNodeByLocation(range_snapshot.ecLoc)
      const endOffset = range_snapshot.ecOffset

      // Restore range.
      const range = editor.doc.createRange()
      range.setStart(startNode, startOffset)
      range.setEnd(endNode, endOffset)

      sel.addRange(range)
    }
    catch (ex) {
      // continue regardless of error
    }
  }

  /**
   * Restore snapshot.
   */
  function restore(snapshot) {

    // Restore HTML.
    if (editor.$el.html() !== snapshot.html) {
      if (editor.opts.htmlExecuteScripts) {
        editor.$el.html(snapshot.html)
      }
      else {
        editor.el.innerHTML = snapshot.html
      }
    }

    // Get selection.
    const sel = editor.selection.get()

    // Make sure to clear current selection.
    editor.selection.clear()

    // Focus.
    editor.events.focus(true)

    // Restore Ranges.
    for (let i = 0; i < snapshot.ranges.length; i++) {
      _restoreRange(sel, snapshot.ranges[i])
    }
  }

  /**
   * Compare two snapshots.
   */
  function equal(s1, s2) {
    if (s1.html !== s2.html) {
      return false
    }

    if (editor.core.hasFocus() && JSON.stringify(s1.ranges) !== JSON.stringify(s2.ranges)) {
      return false
    }

    return true
  }

  return {
    get,
    restore,
    equal
  }
}
