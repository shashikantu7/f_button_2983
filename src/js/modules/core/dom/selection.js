import './markers.js'

import FE from '../../../editor.js'

FE.MODULES.selection = function (editor) {
  const $ = editor.$

  /**
   * Get selection text.
   */
  function text() {
    let text = ''

    if (editor.win.getSelection) {
      text = editor.win.getSelection()
    }
    else if (editor.doc.getSelection) {
      text = editor.doc.getSelection()
    }
    else if (editor.doc.selection) {
      text = editor.doc.selection.createRange().text
    }

    return text.toString()
  }

  /**
   * Get the selection object.
   */
  function get() {
    let selection = ''

    if (editor.win.getSelection) {
      selection = editor.win.getSelection()
    }
    else if (editor.doc.getSelection) {
      selection = editor.doc.getSelection()
    }
    else {
      selection = editor.doc.selection.createRange()
    }

    return selection
  }

  /**
   * Get the selection ranges or a single range at a specified index.
   */
  function ranges(index) {
    const sel = get()
    let ranges = []

    // Get ranges.
    if (sel && sel.getRangeAt && sel.rangeCount) {
      ranges = []

      for (let i = 0; i < sel.rangeCount; i++) {
        ranges.push(sel.getRangeAt(i))
      }
    }
    else if (editor.doc.createRange) {
      ranges = [editor.doc.createRange()]
    }
    else {
      ranges = []
    }

    return typeof index !== 'undefined' ? ranges[index] : ranges
  }

  /**
   * Clear selection.
   */
  function clear() {
    const sel = get()

    try {
      if (sel.removeAllRanges) {
        sel.removeAllRanges()
      }
      else if (sel.empty) { // IE?
        sel.empty()
      }
      else if (sel.clear) {
        sel.clear()
      }
    }
    catch (ex) {
      // ok.
    }
  }

  /**
   * Selection element.
   */
  function element() {
    const sel = get()

    try {
      if (sel.rangeCount) {
        const range = ranges(0)
        let node = range.startContainer
        let child

        // When selection starts in element, look deeper.
        if (editor.node.isElement(node) && range.startOffset === 0 && node.childNodes.length) {
          while (node.childNodes.length && node.childNodes[0].nodeType === Node.ELEMENT_NODE) {
            node = node.childNodes[0];
          }
        }

        // https://github.com/froala/wysiwyg-editor/issues/1399.
        if (node.nodeType === Node.TEXT_NODE && range.startOffset === (node.textContent || '').length && node.nextSibling) {
          node = node.nextSibling
        }

        // Get parrent if node type is not DOM.
        if (node.nodeType === Node.ELEMENT_NODE) {
          let node_found = false

          // Search for node deeper.
          if (node.childNodes.length > 0 && node.childNodes[range.startOffset]) {
            child = node.childNodes[range.startOffset]

            // Ignore empty elements.
            while (child && child.nodeType === Node.TEXT_NODE && child.textContent.length === 0) {
              child = child.nextSibling
            }

            if (child && child.textContent.replace(/\u200B/g, '') === text().replace(/\u200B/g, '')) {
              node = child
              node_found = true
            }

            // Look back maybe me missed something.
            if (!node_found && node.childNodes.length > 1 && range.startOffset > 0 && node.childNodes[range.startOffset - 1]) {
              child = node.childNodes[range.startOffset - 1]

              while (child && child.nodeType === Node.TEXT_NODE && child.textContent.length === 0) {
                child = child.nextSibling
              }

              if (child && child.textContent.replace(/\u200B/g, '') === text().replace(/\u200B/g, '')) {
                node = child
                node_found = true
              }
            }
          }

          // Selection starts just at the end of the node.
          else if (!range.collapsed && node.nextSibling && node.nextSibling.nodeType === Node.ELEMENT_NODE) {
            child = node.nextSibling

            if (child && child.textContent.replace(/\u200B/g, '') === text().replace(/\u200B/g, '')) {
              node = child
              node_found = true
            }
          }

          if (!node_found && node.childNodes.length > 0 && $(node.childNodes[0]).text().replace(/\u200B/g, '') === text().replace(/\u200B/g, '') && ['BR', 'IMG', 'HR'].indexOf(node.childNodes[0].tagName) < 0) {
            node = node.childNodes[0]
          }
        }

        while (node.nodeType !== Node.ELEMENT_NODE && node.parentNode) {
          node = node.parentNode
        }

        // Make sure the node is in editor.
        let p = node

        while (p && p.tagName !== 'HTML') {
          if (p === editor.el) {
            return node
          }

          p = $(p).parent()[0]
        }
      }
    }
    catch (ex) {
      // ok.
    }

    return editor.el
  }

  /**
   * Selection element.
   */
  function endElement() {
    const sel = get()

    try {
      if (sel.rangeCount) {
        const range = ranges(0)
        let node = range.endContainer
        let child

        // Get parrent if node type is not DOM.
        if (node.nodeType === Node.ELEMENT_NODE) {
          let node_found = false

          // Search for node deeper.
          if (node.childNodes.length > 0 && node.childNodes[range.endOffset] && $(node.childNodes[range.endOffset]).text() === text()) {
            node = node.childNodes[range.endOffset]
            node_found = true
          }

          // Selection starts just at the end of the node.
          else if (!range.collapsed && node.previousSibling && node.previousSibling.nodeType === Node.ELEMENT_NODE) {
            child = node.previousSibling

            if (child && child.textContent.replace(/\u200B/g, '') === text().replace(/\u200B/g, '')) {
              node = child
              node_found = true
            }
          }

          // Browser sees selection at the beginning of the next node.
          else if (!range.collapsed && node.childNodes.length > 0 && node.childNodes[range.endOffset]) {
            child = node.childNodes[range.endOffset].previousSibling

            if (child.nodeType === Node.ELEMENT_NODE) {

              if (child && child.textContent.replace(/\u200B/g, '') === text().replace(/\u200B/g, '')) {
                node = child
                node_found = true
              }
            }
          }

          if (!node_found && node.childNodes.length > 0 && $(node.childNodes[node.childNodes.length - 1]).text() === text() && ['BR', 'IMG', 'HR'].indexOf(node.childNodes[node.childNodes.length - 1].tagName) < 0) {
            node = node.childNodes[node.childNodes.length - 1]
          }
        }

        if (node.nodeType === Node.TEXT_NODE && range.endOffset === 0 && node.previousSibling && node.previousSibling.nodeType === Node.ELEMENT_NODE) {
          node = node.previousSibling
        }

        while (node.nodeType !== Node.ELEMENT_NODE && node.parentNode) {
          node = node.parentNode
        }

        // Make sure the node is in editor.
        let p = node

        while (p && p.tagName !== 'HTML') {

          if (p === editor.el) {
            return node
          }

          p = $(p).parent()[0]
        }
      }
    }
    catch (ex) {
      // ok.
    }

    return editor.el
  }

  /**
   * Get the ELEMENTS node where the selection starts.
   * By default TEXT node might be selected.
   */
  function rangeElement(rangeContainer, offset) {
    let node = rangeContainer

    if (node.nodeType === Node.ELEMENT_NODE) {

      // Search for node deeper.
      if (node.childNodes.length > 0 && node.childNodes[offset]) {
        node = node.childNodes[offset]
      }
    }

    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentNode
    }

    return node
  }

  /**
   * Search for the current selected blocks.
   */
  function blocks() {
    const blks = []
    let i
    let block_parent

    const sel = get()

    // Selection must be inside editor.
    if (inEditor() && sel.rangeCount) {

      // Loop through ranges.
      const rngs = ranges()

      for (i = 0; i < rngs.length; i++) {
        const range = rngs[i]

        // Get start node and end node for range.
        const start_node = rangeElement(range.startContainer, range.startOffset)
        const end_node = rangeElement(range.endContainer, range.endOffset)

        // Add the start node.
        if ((editor.node.isBlock(start_node) || editor.node.hasClass(start_node, 'fr-inner')) && blks.indexOf(start_node) < 0) {
          blks.push(start_node)
        }

        // Check for the parent node of the start node.
        block_parent = editor.node.blockParent(start_node)

        if (block_parent && blks.indexOf(block_parent) < 0) {
          blks.push(block_parent)
        }

        // Do not add nodes where we've been once.
        const was_into = []

        // Loop until we reach end.
        let next_node = start_node

        while (next_node !== end_node && next_node !== editor.el) {

          // Get deeper into the current node.
          if (was_into.indexOf(next_node) < 0 && next_node.children && next_node.children.length) {
            was_into.push(next_node)
            next_node = next_node.children[0]
          }

          // Get next sibling.
          else if (next_node.nextSibling) {
            next_node = next_node.nextSibling
          }

          // Get parent node.
          else if (next_node.parentNode) {
            next_node = next_node.parentNode
            was_into.push(next_node)
          }

          // Add node to the list.
          if (editor.node.isBlock(next_node) && was_into.indexOf(next_node) < 0 && blks.indexOf(next_node) < 0) {
            if (next_node !== end_node || range.endOffset > 0) {
              blks.push(next_node)
            }
          }
        }

        // Add the end node.
        if (editor.node.isBlock(end_node) && blks.indexOf(end_node) < 0 && range.endOffset > 0) {
          blks.push(end_node)
        }

        // Check for the parent node of the end node.
        block_parent = editor.node.blockParent(end_node)

        if (block_parent && blks.indexOf(block_parent) < 0) {
          blks.push(block_parent)
        }
      }
    }

    // Remove blocks that we don't need.
    for (i = blks.length - 1; i > 0; i--) {
      // Nodes that contain another node. Don't do it for LI, but remove them if there is a single child and has format.
      if ($(blks[i]).find(blks).length) {
        blks.splice(i, 1)
      }
    }

    return blks
  }

  /**
   * Save selection.
   */
  function save() {
    if (editor.$wp) {
      editor.markers.remove()

      const rgs = ranges()
      const new_ranges = []
      let range
      let i

      for (i = 0; i < rgs.length; i++) {

        // 2nd condition is for https://github.com/froala/wysiwyg-editor/issues/1750.
        if (rgs[i].startContainer !== editor.doc || editor.browser.msie) {
          range = rgs[i]

          const collapsed = range.collapsed

          const start_m = editor.markers.place(range, true, i) // Start.
          const end_m = editor.markers.place(range, false, i) // End.

          // Put selection at the end when there is no marker.
          if ((typeof start_m === 'undefined' || !start_m) && collapsed) {
            $('.fr-marker').remove()
            editor.selection.setAtEnd(editor.el)
          }

          // https://github.com/froala/wysiwyg-editor/issues/1398.
          editor.el.normalize()

          if (editor.browser.safari && !collapsed) {
            try {
              range = editor.doc.createRange()
              range.setStartAfter(start_m)
              range.setEndBefore(end_m)
              new_ranges.push(range)
            }
            catch (ex) {
              // Leave this empty.
            }
          }
        }
      }

      if (editor.browser.safari && new_ranges.length) {
        editor.selection.clear()

        for (i = 0; i < new_ranges.length; i++) {
          editor.selection.get().addRange(new_ranges[i])
        }
      }
    }
  }

  /**
   * Restore selection.
   */
  function restore() {
    let i

    // Get markers.
    const markers = editor.el.querySelectorAll('.fr-marker[data-type="true"]')

    if (!editor.$wp) {
      editor.markers.remove()

      return false
    }

    // No markers.
    if (markers.length === 0) {

      return false
    }

    if (editor.browser.msie || editor.browser.edge) {
      for (i = 0; i < markers.length; i++) {
        markers[i].style.display = 'inline-block'
      }
    }

    // Focus.
    if (!editor.core.hasFocus() && !editor.browser.msie && !editor.browser.webkit) {
      editor.$el.focus()
    }

    clear()
    const sel = get()

    // Add ranges.
    for (i = 0; i < markers.length; i++) {
      const id = $(markers[i]).data('id')
      let start_marker = markers[i]
      const range = editor.doc.createRange()
      let end_marker = editor.$el.find(`.fr-marker[data-type="false"][data-id="${id}"]`)

      if (editor.browser.msie || editor.browser.edge) {
        end_marker.css('display', 'inline-block')
      }

      let ghost = null

      // Make sure there is an start marker.
      if (end_marker.length > 0) {
        end_marker = end_marker[0]

        try {
          // If we have markers one next to each other inside text, then we should normalize text by joining it.
          let special_case = false

          // Clear empty text nodes.
          let s_node = start_marker.nextSibling

          let tmp = null
          while (s_node && s_node.nodeType === Node.TEXT_NODE && s_node.textContent.length === 0) {
            tmp = s_node
            s_node = s_node.nextSibling
            $(tmp).remove()
          }

          let e_node = end_marker.nextSibling

          while (e_node && e_node.nodeType === Node.TEXT_NODE && e_node.textContent.length === 0) {
            tmp = e_node
            e_node = e_node.nextSibling
            $(tmp).remove()
          }

          if (start_marker.nextSibling === end_marker || end_marker.nextSibling === start_marker) {

            // Decide which is first and which is last between markers.
            const first_node = start_marker.nextSibling === end_marker ? start_marker : end_marker
            const last_node = first_node === start_marker ? end_marker : start_marker

            // Previous node.
            let prev_node = first_node.previousSibling

            while (prev_node && prev_node.nodeType === Node.TEXT_NODE && prev_node.length === 0) {
              tmp = prev_node
              prev_node = prev_node.previousSibling
              $(tmp).remove()
            }

            // Normalize text before.
            if (prev_node && prev_node.nodeType === Node.TEXT_NODE) {

              while (prev_node && prev_node.previousSibling && prev_node.previousSibling.nodeType === Node.TEXT_NODE) {
                prev_node.previousSibling.textContent += prev_node.textContent
                prev_node = prev_node.previousSibling
                $(prev_node.nextSibling).remove()
              }
            }

            // Next node.
            let next_node = last_node.nextSibling

            while (next_node && next_node.nodeType === Node.TEXT_NODE && next_node.length === 0) {
              tmp = next_node
              next_node = next_node.nextSibling
              $(tmp).remove()
            }

            // Normalize text after.
            if (next_node && next_node.nodeType === Node.TEXT_NODE) {

              while (next_node && next_node.nextSibling && next_node.nextSibling.nodeType === Node.TEXT_NODE) {
                next_node.nextSibling.textContent = next_node.textContent + next_node.nextSibling.textContent
                next_node = next_node.nextSibling
                $(next_node.previousSibling).remove()
              }
            }

            if (prev_node && (editor.node.isVoid(prev_node) || editor.node.isBlock(prev_node))) {
              prev_node = null
            }

            if (next_node && (editor.node.isVoid(next_node) || editor.node.isBlock(next_node))) {
              next_node = null
            }

            // Previous node and next node are both text.
            if (prev_node && next_node && prev_node.nodeType === Node.TEXT_NODE && next_node.nodeType === Node.TEXT_NODE) {

              // Remove markers.
              $(start_marker).remove()
              $(end_marker).remove()

              // Save cursor position.
              const len = prev_node.textContent.length
              prev_node.textContent += next_node.textContent
              $(next_node).remove()

              // Normalize spaces.
              if (!editor.opts.htmlUntouched) {
                editor.spaces.normalize(prev_node)
              }

              // Restore position.
              range.setStart(prev_node, len)
              range.setEnd(prev_node, len)

              special_case = true
            }
            else if (!prev_node && next_node && next_node.nodeType === Node.TEXT_NODE) {

              // Remove markers.
              $(start_marker).remove()
              $(end_marker).remove()

              // Normalize spaces.
              if (!editor.opts.htmlUntouched) {
                editor.spaces.normalize(next_node)
              }

              ghost = $(editor.doc.createTextNode('\u200B')).get(0)
              $(next_node).before(ghost)

              // Restore position.
              range.setStart(next_node, 0)
              range.setEnd(next_node, 0)
              special_case = true
            }
            else if (!next_node && prev_node && prev_node.nodeType === Node.TEXT_NODE) {

              // Remove markers.
              $(start_marker).remove()
              $(end_marker).remove()

              // Normalize spaces.
              if (!editor.opts.htmlUntouched) {
                editor.spaces.normalize(prev_node)
              }

              ghost = $(editor.doc.createTextNode('\u200B')).get(0)
              $(prev_node).after(ghost)

              // Restore position.
              range.setStart(prev_node, prev_node.textContent.length)
              range.setEnd(prev_node, prev_node.textContent.length)

              special_case = true
            }
          }

          if (!special_case) {
            let x
            let y

            // DO NOT TOUCH THIS OR IT WILL BREAK!!!
            if ((editor.browser.chrome || editor.browser.edge) && start_marker.nextSibling === end_marker) {
              x = _normalizedMarker(end_marker, range, true) || range.setStartAfter(end_marker)
              y = _normalizedMarker(start_marker, range, false) || range.setEndBefore(start_marker)
            }
            else {
              if (start_marker.previousSibling === end_marker) {
                start_marker = end_marker
                end_marker = start_marker.nextSibling
              }

              // https://github.com/froala/wysiwyg-editor/issues/759
              if (!(end_marker.nextSibling && end_marker.nextSibling.tagName === 'BR') &&
                !(!end_marker.nextSibling && editor.node.isBlock(start_marker.previousSibling)) &&
                !(start_marker.previousSibling && start_marker.previousSibling.tagName === 'BR')) {
                start_marker.style.display = 'inline'
                end_marker.style.display = 'inline'
                ghost = $(editor.doc.createTextNode('\u200B')).get(0)
              }

              // https://github.com/froala/wysiwyg-editor/issues/1120 . TODO Check again the below statement on which !editor.opts.enter === FE.ENTER_BR is returing false always.
              // var p_node = start_marker.previousSibling;
              // if (p_node && p_node.style && editor.win.getComputedStyle(p_node).display === 'block' && !editor.opts.enter === FE.ENTER_BR) {
              //   range.setEndAfter(p_node);
              //   range.setStartAfter(p_node);
              // }
              // else {
              //   x = _normalizedMarker(start_marker, range, true) || ($(start_marker).before(ghost) && range.setStartBefore(start_marker));
              //   y = _normalizedMarker(end_marker, range, false) || ($(end_marker).after(ghost) && range.setEndAfter(end_marker));
              // }
              x = _normalizedMarker(start_marker, range, true) || $(start_marker).before(ghost) && range.setStartBefore(start_marker)
              y = _normalizedMarker(end_marker, range, false) || $(end_marker).after(ghost) && range.setEndAfter(end_marker)
            }

            if (typeof x === 'function') {
              x()
            }

            if (typeof y === 'function') {
              y()
            }
          }
        }
        catch (ex) {
          console.warn('RESTORE RANGE', ex)
        }
      }

      if (ghost) {
        $(ghost).remove()
      }

      try {
        sel.addRange(range)
      }
      catch (ex) {
        console.warn('ADD RANGE', ex)
      }
    }

    // Remove used markers.
    editor.markers.remove()
  }

  /**
   * Normalize marker when restoring selection.
   */
  function _normalizedMarker(marker, range, start) {
    let len
    const prev_node = marker.previousSibling
    const next_node = marker.nextSibling

    // Prev and next node are both text nodes.
    if (prev_node && next_node && prev_node.nodeType === Node.TEXT_NODE && next_node.nodeType === Node.TEXT_NODE) {
      len = prev_node.textContent.length

      if (start) {
        next_node.textContent = prev_node.textContent + next_node.textContent
        $(prev_node).remove()
        $(marker).remove()

        if (!editor.opts.htmlUntouched) {
          editor.spaces.normalize(next_node)
        }

        return function () {
          range.setStart(next_node, len)
        }
      }

      prev_node.textContent += next_node.textContent
      $(next_node).remove()
      $(marker).remove()

      if (!editor.opts.htmlUntouched) {
        editor.spaces.normalize(prev_node)
      }

      return function () {
        range.setEnd(prev_node, len)
      }

    }

    // Prev node is text node.
    else if (prev_node && !next_node && prev_node.nodeType === Node.TEXT_NODE) {
      len = prev_node.textContent.length

      if (start) {
        if (!editor.opts.htmlUntouched) {
          editor.spaces.normalize(prev_node)
        }

        return function () {
          range.setStart(prev_node, len)
        }
      }

      if (!editor.opts.htmlUntouched) {
        editor.spaces.normalize(prev_node)
      }

      return function () {
        range.setEnd(prev_node, len)
      }

    }

    // Next node is text node.
    else if (next_node && !prev_node && next_node.nodeType === Node.TEXT_NODE) {

      if (start) {
        if (!editor.opts.htmlUntouched) {
          editor.spaces.normalize(next_node)
        }

        return function () {
          range.setStart(next_node, 0)
        }
      }

      if (!editor.opts.htmlUntouched) {
        editor.spaces.normalize(next_node)
      }

      return function () {
        range.setEnd(next_node, 0)
      }

    }

    return false
  }

  /**
   * Determine if we can do delete.
   */
  function _canDelete() {

    // Check if there are markers inside conteneditable="false".
    const markers = editor.$el.find('.fr-marker')

    for (let i = 0; i < markers.length; i++) {
      if ($(markers[i]).parentsUntil('.fr-element, [contenteditable="true"]', '[contenteditable="false"]').length) {
        return false
      }
    }

    return true
  }

  /**
   * Check if selection is collapsed.
   */
  function isCollapsed() {
    const rgs = ranges()

    for (let i = 0; i < rgs.length; i++) {
      if (!rgs[i].collapsed) {
        return false
      }
    }

    return true
  }

  // From: http://www.coderexception.com/0B1B33z1NyQxUQSJ/contenteditable-div-how-can-i-determine-if-the-cursor-is-at-the-start-or-end-of-the-content
  function info(el) {
    let atStart = false
    let atEnd = false
    let selRange
    let testRange

    if (editor.win.getSelection) {
      const sel = editor.win.getSelection()

      if (sel.rangeCount) {
        selRange = sel.getRangeAt(0)
        testRange = selRange.cloneRange()

        testRange.selectNodeContents(el)
        testRange.setEnd(selRange.startContainer, selRange.startOffset)
        atStart = selection(testRange)

        testRange.selectNodeContents(el)
        testRange.setStart(selRange.endContainer, selRange.endOffset)

        atEnd = selection(testRange)
      }
    }
    else if (editor.doc.selection && editor.doc.selection.type !== 'Control') {
      selRange = editor.doc.selection.createRange()
      testRange = selRange.duplicate()

      testRange.moveToElementText(el)
      testRange.setEndPoint('EndToStart', selRange)
      atStart = selection(testRange)

      testRange.moveToElementText(el)
      testRange.setEndPoint('StartToEnd', selRange)
      atEnd = selection(testRange)
    }

    return {
      atStart,
      atEnd
    }
  }

  // https://github.com/froala-labs/froala-editor-js-2/issues/1935
  function selection(sel) {
    const result = sel.toString().replace(/[\u200B-\u200D\uFEFF]/g, '')

    return  result === ''
  }

  /**
   * Check if everything is selected inside the editor.
   */
  function isFull() {
    if (isCollapsed()) {
      return false
    }

    editor.selection.save()

    // https://github.com/froala/wysiwyg-editor/issues/710
    let els = editor.el.querySelectorAll('td, th, img, br')
    let i

    for (i = 0; i < els.length; i++) {
      if (els[i].nextSibling || els[i].tagName === 'IMG') {
        // Invisible space character was getting replaced within the "selection" method.
        // So replaced it with "&nbsp;" as a solution.
        els[i].innerHTML = `<span class="fr-mk" style="display: none;">&nbsp;</span>${els[i].innerHTML}`
      }
    }

    let full = false
    const inf = info(editor.el)

    if (inf.atStart && inf.atEnd) {
      full = true
    }

    // https://github.com/froala/wysiwyg-editor/issues/710
    els = editor.el.querySelectorAll('.fr-mk')

    for (i = 0; i < els.length; i++) {
      els[i].parentNode.removeChild(els[i])
    }

    editor.selection.restore()

    return full
  }

  /**
   * Remove HTML from inner nodes when we deal with keepFormatOnDelete option.
   */
  function _emptyInnerNodes(node, first) {
    if (typeof first === 'undefined') {
      first = true
    }

    // Remove invisible spaces.
    const h = $(node).html()

    if (h && h.replace(/\u200b/g, '').length !== h.length) {
      $(node).html(h.replace(/\u200b/g, ''))
    }

    // Loop contents.
    const contents = editor.node.contents(node)

    for (let j = 0; j < contents.length; j++) {

      // Remove text nodes.
      if (contents[j].nodeType !== Node.ELEMENT_NODE) {
        $(contents[j]).remove()
      }

      // Empty inner nodes further.
      else {

        // j === 0 determines if the node is the first one and we should keep format.
        _emptyInnerNodes(contents[j], j === 0)

        // There are inner nodes, ignore the current one.
        if (j === 0) {
          first = false
        }
      }
    }

    // First node is a text node, so replace it with a span.
    if (node.nodeType === Node.TEXT_NODE) {
      const span = $(document.createElement('span')).attr('data-first', 'true').attr('data-text', 'true')
      $(node)[0].replaceWith(span[0])
    }

    // Add the first node marker so that we add selection in it later on.
    else if (first) {
      $(node).attr('data-first', true)
    }
  }

  /**
   * TODO: check again this function because it will always return true because fr-inner tag does not exist.
   */
  function _filterFrInner() {
    return $(this).find('fr-inner').length === 0
  }

  /**
   * Process deleting nodes.
   */
  function _processNodeDelete($node, should_delete) {
    const contents = editor.node.contents($node.get(0))

    // Node is TD or TH.
    if (['TD', 'TH'].indexOf($node.get(0).tagName) >= 0 && $node.find('.fr-marker').length === 1 && (editor.node.hasClass(contents[0], 'fr-marker') || (contents[0].tagName == 'BR' && editor.node.hasClass(contents[0].nextElementSibling, 'fr-marker')))) {
      $node.attr('data-del-cell', true)
    }

    for (let i = 0; i < contents.length; i++) {
      const node = contents[i]

      // We found a marker.
      if (editor.node.hasClass(node, 'fr-marker')) {
        should_delete = (should_delete + 1) % 2
      }
      else if (should_delete) {

        // Check if we have a marker inside it.
        if ($(node).find('.fr-marker').length > 0) {
          should_delete = _processNodeDelete($(node), should_delete)
        }
        else {

          // TD, TH or inner, then go further.
          if (['TD', 'TH'].indexOf(node.tagName) < 0 && !editor.node.hasClass(node, 'fr-inner')) {

            if (!editor.opts.keepFormatOnDelete || editor.$el.find('[data-first]').length > 0 || editor.node.isVoid(node)) {
              $(node).remove()
            }
            else {
              _emptyInnerNodes(node)
            }
          }
          else if (editor.node.hasClass(node, 'fr-inner')) {
            if ($(node).find('.fr-inner').length === 0) {
              $(node).html('<br>')
            }
            else {
              $(node).find('.fr-inner').filter(_filterFrInner).html('<br>')
            }
          }
          else {
            $(node).empty()
            $(node).attr('data-del-cell', true)
          }
        }
      }
      else if ($(node).find('.fr-marker').length > 0) {
        should_delete = _processNodeDelete($(node), should_delete)
      }
    }

    return should_delete
  }

  /**
   * Determine if selection is inside the editor.
   */
  function inEditor() {
    try {
      if (!editor.$wp) {
        return false
      }

      const range = ranges(0)
      let container = range.commonAncestorContainer

      while (container && !editor.node.isElement(container)) {
        container = container.parentNode
      }

      if (editor.node.isElement(container)) {
        return true
      }

      return false
    }
    catch (ex) {
      return false
    }
  }

  /**
   * Remove the current selection html.
   */
  function remove() {
    if (isCollapsed()) {
      return true
    }

    let i

    save()

    // Get the previous sibling normalized.
    function _prevSibling(node) {
      let prev_node = node.previousSibling

      while (prev_node && prev_node.nodeType === Node.TEXT_NODE && prev_node.textContent.length === 0) {
        const tmp = prev_node
        prev_node = prev_node.previousSibling
        $(tmp).remove()
      }

      return prev_node
    }

    // Get the next sibling normalized.
    function _nextSibling(node) {
      let next_node = node.nextSibling

      while (next_node && next_node.nodeType === Node.TEXT_NODE && next_node.textContent.length === 0) {
        const tmp = next_node
        next_node = next_node.nextSibling
        $(tmp).remove()
      }

      return next_node
    }

    // Normalize start markers.
    let start_markers = editor.$el.find('.fr-marker[data-type="true"]')

    for (i = 0; i < start_markers.length; i++) {
      const sm = start_markers[i]

      while (!_prevSibling(sm) && !editor.node.isBlock(sm.parentNode) && !editor.$el.is(sm.parentNode) && !editor.node.hasClass(sm.parentNode, 'fr-inner')) {
        $(sm.parentNode).before(sm)
      }
    }

    // Normalize end markers.
    const end_markers = editor.$el.find('.fr-marker[data-type="false"]')

    for (i = 0; i < end_markers.length; i++) {
      const em = end_markers[i]

      while (!_nextSibling(em) && !editor.node.isBlock(em.parentNode) && !editor.$el.is(em.parentNode) && !editor.node.hasClass(em.parentNode, 'fr-inner')) {
        $(em.parentNode).after(em)
      }

      // Last node is empty and has a BR in it.
      if (em.parentNode && editor.node.isBlock(em.parentNode) && editor.node.isEmpty(em.parentNode) && !editor.$el.is(em.parentNode) && !editor.node.hasClass(em.parentNode, 'fr-inner') && editor.opts.keepFormatOnDelete) {
        $(em.parentNode).after(em)
      }
    }

    // Check if selection can be deleted.
    if (_canDelete()) {
      _processNodeDelete(editor.$el, 0)

      // Look for selection marker.
      const $first_node = editor.$el.find('[data-first="true"]')

      if ($first_node.length) {

        // Remove markers.
        editor.$el.find('.fr-marker').remove()

        // Add markers in the node that we marked as the first one.
        $first_node
          .append(FE.INVISIBLE_SPACE + FE.MARKERS)
          .removeAttr('data-first')

        // Remove span with data-text if there is one.
        if ($first_node.attr('data-text')) {
          $first_node.replaceWith($first_node.html())
        }
      }
      else {
        // Remove tables.
        editor.$el.find('table').filter(function () {
          const ok = $(this).find('[data-del-cell]').length > 0 && $(this).find('[data-del-cell]').length === $(this).find('td, th').length

          return ok
        }).remove()
        editor.$el.find('[data-del-cell]').removeAttr('data-del-cell')

        // Merge contents between markers.
        start_markers = editor.$el.find('.fr-marker[data-type="true"]')

        for (i = 0; i < start_markers.length; i++) {

          // Get start marker.
          const start_marker = start_markers[i]

          // Get the next node after start marker.
          let next_node = start_marker.nextSibling

          // Get the end node.
          let end_marker = editor.$el.find(`.fr-marker[data-type="false"][data-id="${$(start_marker).data('id')}"]`).get(0)

          if (end_marker) {

            // Markers are not next to other.
            if (start_marker && !(next_node && next_node === end_marker)) {

              // Get the parents of the nodes.
              let start_parent = editor.node.blockParent(start_marker)
              let end_parent = editor.node.blockParent(end_marker)

              // https://github.com/froala/wysiwyg-editor/issues/1233
              let list_start = false
              let list_end = false

              if (start_parent && ['UL', 'OL'].indexOf(start_parent.tagName) >= 0) {
                start_parent = null
                list_start = true
              }

              if (end_parent && ['UL', 'OL'].indexOf(end_parent.tagName) >= 0) {
                end_parent = null
                list_end = true
              }

              // Move end marker next to start marker.
              $(start_marker).after(end_marker)

              // The block parent of the start marker is the element itself. We're not in the same parent or moving marker is not enough.
              if (start_parent !== end_parent) {
                if (start_parent === null && !list_start) {
                  const deep_parent = editor.node.deepestParent(start_marker)

                  // There is a parent for the marker. Move the end html to it.
                  if (deep_parent) {
                    $(deep_parent).after($(end_parent).html())
                    $(end_parent).remove()
                  }

                  // There is no parent for the marker.
                  else if ($(end_parent).parentsUntil(editor.$el, 'table').length === 0) {
                    $(start_marker).next().after($(end_parent).html())
                    $(end_parent).remove()
                  }
                }

                // End marker is inside element. We don't merge in table.
                else if (end_parent === null && !list_end && $(start_parent).parentsUntil(editor.$el, 'table').length === 0) {

                  // Get the node that has a next sibling.
                  next_node = start_parent

                  while (!next_node.nextSibling && next_node.parentNode !== editor.el) {
                    next_node = next_node.parentNode
                  }
                  next_node = next_node.nextSibling

                  // Join HTML inside the start node.
                  while (next_node && next_node.tagName !== 'BR') {
                    const tmp_node = next_node.nextSibling
                    $(start_parent).append(next_node)
                    next_node = tmp_node
                  }

                  if (next_node && next_node.tagName === 'BR') {
                    $(next_node).remove()
                  }
                }

                // Join end block with start block.
                else if (start_parent && end_parent && $(start_parent).parentsUntil(editor.$el, 'table').length === 0 && $(end_parent).parentsUntil(editor.$el, 'table').length === 0 && !$(start_parent).contains(end_parent) && !$(end_parent).contains(start_parent)) {
                  $(start_parent).append($(end_parent).html())
                  $(end_parent).remove()
                }
              }
            }
          }
          else {
            end_marker = $(start_marker).clone().attr('data-type', false)
            $(start_marker).after(end_marker)
          }
        }
      }
    }

    // Remove remaining empty lists.
    editor.$el.find('li:empty').remove()

    if (!editor.opts.keepFormatOnDelete) {
      editor.html.fillEmptyBlocks()
    }

    editor.html.cleanEmptyTags(true)

    if (!editor.opts.htmlUntouched) {
      editor.clean.lists()
      editor.$el.find('li:empty').append('<br>')
      editor.spaces.normalize()
    }

    // https://github.com/froala/wysiwyg-editor/issues/1379 &&

    const last_marker = editor.$el.find('.fr-marker').last().get(0)
    const first_marker = editor.$el.find('.fr-marker').first().get(0)

    // https://github.com/froala-labs/froala-editor-js-2/issues/491
    if (typeof last_marker !== 'undefined' && typeof first_marker !== 'undefined' && !last_marker.nextSibling && first_marker.previousSibling && first_marker.previousSibling.tagName === 'BR' && editor.node.isElement(last_marker.parentNode) && editor.node.isElement(first_marker.parentNode)) {

      editor.$el.append('<br>')
    }

    restore()
  }

  function setAtStart(node, deep) {
    if (!node || node.getElementsByClassName('fr-marker').length > 0) {
      return false
    }

    let child = node.firstChild

    while (child && (editor.node.isBlock(child) || deep && !editor.node.isVoid(child) && child.nodeType === Node.ELEMENT_NODE)) {
      node = child
      child = child.firstChild
    }

    node.innerHTML = FE.MARKERS + node.innerHTML
  }

  function setAtEnd(node, deep) {
    if (!node || node.getElementsByClassName('fr-marker').length > 0) {
      return false
    }

    let child = node.lastChild

    while (child && (editor.node.isBlock(child) || deep && !editor.node.isVoid(child) && child.nodeType === Node.ELEMENT_NODE)) {
      node = child
      child = child.lastChild
    }

    const span = editor.doc.createElement('SPAN')
    span.setAttribute('id', 'fr-sel-markers')
    span.innerHTML = FE.MARKERS

    // https://github.com/froala/wysiwyg-editor/issues/3078
    while (node.parentNode && editor.opts.htmlAllowedEmptyTags && editor.opts.htmlAllowedEmptyTags.indexOf(node.tagName.toLowerCase()) >= 0) {
      node = node.parentNode;
    }

    node.appendChild(span)
    const nd = node.querySelector('#fr-sel-markers')
    nd.outerHTML = nd.innerHTML
  }

  function setBefore(node, use_current_node) {
    if (typeof use_current_node === 'undefined') {
      use_current_node = true
    }

    // Check if there is any previous sibling by skipping the empty text ones.
    let prev_node = node.previousSibling

    while (prev_node && prev_node.nodeType === Node.TEXT_NODE && prev_node.textContent.length === 0) {
      prev_node = prev_node.previousSibling
    }

    // There is a previous node.
    if (prev_node) {

      // Previous node is block so set the focus at the end of it.
      if (editor.node.isBlock(prev_node)) {
        setAtEnd(prev_node)
      }

      // Previous node is BR, so place markers before it.
      else if (prev_node.tagName === 'BR') {
        $(prev_node).before(FE.MARKERS)
      }

      // Just place marker.
      else {
        $(prev_node).after(FE.MARKERS)
      }

      return true
    }

    // Use current node.
    else if (use_current_node) {

      // Current node is block, set selection at start.
      if (editor.node.isBlock(node)) {
        setAtStart(node)
      }

      // Just place markers.
      else {
        $(node).before(FE.MARKERS)
      }

      return true
    }


    return false

  }

  function setAfter(node, use_current_node) {
    if (typeof use_current_node === 'undefined') {
      use_current_node = true
    }

    // Check if there is any previous sibling by skipping the empty text ones.
    let next_node = node.nextSibling

    while (next_node && next_node.nodeType === Node.TEXT_NODE && next_node.textContent.length === 0) {
      next_node = next_node.nextSibling
    }

    // There is a next node.
    if (next_node) {

      // Next node is block so set the focus at the end of it.
      if (editor.node.isBlock(next_node)) {
        setAtStart(next_node)
      }

      // Just place marker.
      else {
        $(next_node).before(FE.MARKERS)
      }

      return true
    }

    // Use current node.
    else if (use_current_node) {

      // Current node is block, set selection at end.
      if (editor.node.isBlock(node)) {
        setAtEnd(node)
      }

      // Just place markers.
      else {
        $(node).after(FE.MARKERS)
      }

      return true
    }


    return false

  }

  return {
    text,
    get,
    ranges,
    clear,
    element,
    endElement,
    save,
    restore,
    isCollapsed,
    isFull,
    inEditor,
    remove,
    blocks,
    info,
    setAtEnd,
    setAtStart,
    setBefore,
    setAfter,
    rangeElement
  }
}
