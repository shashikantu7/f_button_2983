import FE from '../../editor.js'

// Do not merge with the previous one.
FE.NO_DELETE_TAGS = ['TH', 'TD', 'TR', 'TABLE', 'FORM']

// Do simple enter.
FE.SIMPLE_ENTER_TAGS = ['TH', 'TD', 'LI', 'DL', 'DT', 'FORM']

FE.MODULES.cursor = function (editor) {
  const $ = editor.$

  /**
   * Check if node is at the end of a block tag.
   */
  function _atEnd(node) {
    if (!node) {
      return false
    }

    if (editor.node.isBlock(node)) {
      return true
    }

    if (node.nextSibling && node.nextSibling.nodeType === Node.TEXT_NODE && node.nextSibling.textContent.replace(/\u200b/g, '').length === 0) {
      return _atEnd(node.nextSibling)
    }

    if (node.nextSibling && !(node.previousSibling && node.nextSibling.tagName === 'BR' && !node.nextSibling.nextSibling)) {
      return false
    }

    return _atEnd(node.parentNode)
  }

  /**
   * Check if node is at the start of a block tag.
   */
  function _atStart(node) {
    if (!node) {
      return false
    }

    if (editor.node.isBlock(node)) {
      return true
    }

    if (node.previousSibling && node.previousSibling.nodeType === Node.TEXT_NODE && node.previousSibling.textContent.replace(/\u200b/g, '').length === 0) {
      return _atStart(node.previousSibling)
    }

    if (node.previousSibling) {
      return false
    }

    if (!node.previousSibling && editor.node.hasClass(node.parentNode, 'fr-inner')) {
      return true
    }

    return _atStart(node.parentNode)
  }

  /**
   * Check if node is a the start of the container.
   */
  function _isAtStart(node, container) {
    if (!node) {
      return false
    }

    if (node === editor.$wp.get(0)) {
      return false
    }

    if (node.previousSibling && node.previousSibling.nodeType === Node.TEXT_NODE && node.previousSibling.textContent.replace(/\u200b/g, '').length === 0) {
      return _isAtStart(node.previousSibling, container)
    }

    if (node.previousSibling) {
      return false
    }

    if (node.parentNode === container) {
      return true
    }

    return _isAtStart(node.parentNode, container)
  }

  /**
   * Check if node is a the start of the container.
   */
  function _isAtEnd(node, container) {
    if (!node) {
      return false
    }

    if (node === editor.$wp.get(0)) {
      return false
    }

    if (node.nextSibling && node.nextSibling.nodeType === Node.TEXT_NODE && node.nextSibling.textContent.replace(/\u200b/g, '').length === 0) {

      return _isAtEnd(node.nextSibling, container)
    }

    if (node.nextSibling && !(node.previousSibling && node.nextSibling.tagName === 'BR' && !node.nextSibling.nextSibling)) {
      return false
    }

    if (node.parentNode === container) {
      return true
    }

    return _isAtEnd(node.parentNode, container)
  }

  /**
   * Check if the node is inside a LI.
   */
  function _inLi(node) {
    return $(node).parentsUntil(editor.$el, 'LI').length > 0 && $(node).parentsUntil('LI', 'TABLE').length === 0
  }

  /**
   * Get the length of the first or last character from text. Note: A special character can contain 1, 2 or 4 javascript 16bits characters.
   */
  function _getExtremityCharacterLength(text, first) {

    const special_chars_regex = new RegExp(`${first ? '^' : ''}(([\\uD83C-\\uDBFF\\uDC00-\\uDFFF]+\\u200D)*[\\uD83C-\\uDBFF\\uDC00-\\uDFFF]{2})${first ? '' : '$'}`, 'i')
    const matches = text.match(special_chars_regex)

    // No matches means there is a normal character.
    if (!matches) {
      return 1
    }

    // Special character match. Can be 1, 2 or 4 characters.


    return matches[0].length

  }

  /**
   * Do backspace at the start of a block tag.
   */
  function _startBackspace(marker) {
    const quote = $(marker).parentsUntil(editor.$el, 'BLOCKQUOTE').length > 0
    let deep_parent = editor.node.deepestParent(marker, [], !quote)
    let current_block = deep_parent

    // Check for nested block tags if no previous element.
    while (deep_parent && !deep_parent.previousSibling && deep_parent.tagName !== 'BLOCKQUOTE' && deep_parent.parentElement !== editor.el && !editor.node.hasClass(deep_parent.parentElement, 'fr-inner') && FE.SIMPLE_ENTER_TAGS.indexOf(deep_parent.parentElement.tagName) < 0) {
      deep_parent = deep_parent.parentElement
    }


    if (deep_parent && deep_parent.tagName === 'BLOCKQUOTE') {
      const m_parent = editor.node.deepestParent(marker, [$(marker).parentsUntil(editor.$el, 'BLOCKQUOTE').get(0)])

      if (m_parent && m_parent.previousSibling) {
        deep_parent = m_parent
        current_block = m_parent
      }
    }

    // Deepest parent is not the main element.
    if (deep_parent !== null) {
      let prev_node = deep_parent.previousSibling
      let contents

      // We are inside a block tag.
      if (editor.node.isBlock(deep_parent) && editor.node.isEditable(deep_parent)) {

        // There is a previous node.
        if (prev_node && FE.NO_DELETE_TAGS.indexOf(prev_node.tagName) < 0) {
          if (editor.node.isDeletable(prev_node)) {
            $(prev_node).remove()
            $(marker).replaceWith(FE.MARKERS)
          }
          else {
            // Previous node is a block tag.
            if (editor.node.isEditable(prev_node)) {
              if (editor.node.isBlock(prev_node)) {
                if (editor.node.isEmpty(prev_node) && !editor.node.isList(prev_node)) {
                  $(prev_node).remove()

                  // https://github.com/froala/wysiwyg-editor/issues/1877.
                  $(marker).after(editor.opts.keepFormatOnDelete ? FE.INVISIBLE_SPACE : '')
                }
                else {
                  if (editor.node.isList(prev_node)) {
                    prev_node = $(prev_node).find('li').last().get(0)
                  }

                  // Remove last BR.
                  contents = editor.node.contents(prev_node)

                  if (contents.length && contents[contents.length - 1].tagName === 'BR') {
                    $(contents[contents.length - 1]).remove()
                  }

                  // Prev node is blockquote but the current one isn't.
                  if (prev_node.tagName === 'BLOCKQUOTE' && deep_parent.tagName !== 'BLOCKQUOTE') {
                    contents = editor.node.contents(prev_node)

                    while (contents.length && editor.node.isBlock(contents[contents.length - 1])) {
                      prev_node = contents[contents.length - 1]
                      contents = editor.node.contents(prev_node)
                    }
                  }

                  // Prev node is not blockquote, but the current one is.
                  else if (prev_node.tagName !== 'BLOCKQUOTE' && current_block.tagName === 'BLOCKQUOTE') {
                    contents = editor.node.contents(current_block)

                    while (contents.length && editor.node.isBlock(contents[0])) {
                      current_block = contents[0]
                      contents = editor.node.contents(current_block)
                    }
                  }

                  // When current node is empty place the cursor at the end of the prev node.
                  if (editor.node.isEmpty(deep_parent)) {
                    $(marker).remove()
                    editor.selection.setAtEnd(prev_node, true)
                  }

                  // Replace marker with markers.
                  else {
                    $(marker).replaceWith(FE.MARKERS)

                    // Previous node may have only block children.
                    const prev_children = prev_node.childNodes

                    // Append to prev node current HTML
                    if (!editor.node.isBlock(prev_children[prev_children.length - 1])) {
                      $(prev_node).append(current_block.innerHTML)
                    }
                    else {
                      // Append the HTML to the last child of the previous node.
                      $(prev_children[prev_children.length - 1]).append(current_block.innerHTML)
                    }
                  }

                  // Remove current block.
                  $(current_block).remove()

                  // Remove current deep parent if empty.
                  if (editor.node.isEmpty(deep_parent)) {
                    $(deep_parent).remove()
                  }
                }
              }
              else {
                $(marker).replaceWith(FE.MARKERS)

                if (deep_parent.tagName === 'BLOCKQUOTE' && prev_node.nodeType === Node.ELEMENT_NODE) {
                  $(prev_node).remove()
                }
                else {
                  $(prev_node).after(editor.node.isEmpty(deep_parent) ? '' : $(deep_parent).html())
                  $(deep_parent).remove()

                  if (prev_node.tagName === 'BR') {
                    $(prev_node).remove()
                  }
                }
              }
            }
          }
        }
        else if (!prev_node) {
          if (deep_parent && deep_parent.tagName === 'BLOCKQUOTE' && $(deep_parent).text().replace(/\u200B/g, '').length === 0) {
            $(deep_parent).remove();
          }
          else {
            // https://github.com/froala-labs/froala-editor-js-2/issues/1304
            if (editor.node.isEmpty(deep_parent) && deep_parent.parentNode && editor.node.isEditable(deep_parent.parentNode)) {
              // check for the editor el
              if (deep_parent.parentNode != editor.el) {
                $(deep_parent.parentNode).remove();
              }
            }
          }
        }
      }

      // No block tag.
      /* jshint ignore:start */
      /* jscs:disable */
      else {
        // This should never happen.
      }
      /* jshint ignore:end */
      /* jscs:enable */
    }
  }

  /**
   * Do backspace at the middle of a block tag.
   */
  function _middleBackspace(marker) {
    let prev_node = marker

    // Get the parent node that has a prev sibling.
    while (!prev_node.previousSibling) {
      prev_node = prev_node.parentNode

      if (editor.node.isElement(prev_node)) {
        return false
      }
    }
    prev_node = prev_node.previousSibling

    // Not block tag.
    let contents

    if (!editor.node.isBlock(prev_node) && editor.node.isEditable(prev_node)) {
      contents = editor.node.contents(prev_node)

      // Previous node is text.
      while (prev_node.nodeType !== Node.TEXT_NODE && !editor.node.isDeletable(prev_node) && contents.length && editor.node.isEditable(prev_node)) {
        prev_node = contents[contents.length - 1]
        contents = editor.node.contents(prev_node)
      }

      if (prev_node.nodeType === Node.TEXT_NODE) {
        const txt = prev_node.textContent
        let len = txt.length

        // We have a \n character.
        if (txt.length && txt[txt.length - 1] === '\n') {
          prev_node.textContent = txt.substring(0, len - 2)

          if (prev_node.textContent.length === 0) {
            prev_node.parentNode.removeChild(prev_node)
          }

          return _middleBackspace(marker)
        }

        // Tab UNDO.
        if (editor.opts.tabSpaces && txt.length >= editor.opts.tabSpaces) {
          const tab_str = txt.substr(txt.length - editor.opts.tabSpaces, txt.length - 1)

          if (tab_str.replace(/ /g, '').replace(new RegExp(FE.UNICODE_NBSP, 'g'), '').length === 0) {
            len = txt.length - editor.opts.tabSpaces + 1
          }
        }

        prev_node.textContent = txt.substring(0, len - _getExtremityCharacterLength(txt))

        // https://github.com/froala/wysiwyg-editor/issues/3034
        if (editor.opts.htmlUntouched && !marker.nextSibling && prev_node.textContent.length && prev_node.textContent[prev_node.textContent.length - 1] === ' ') {
          prev_node.textContent = prev_node.textContent.substring(0, prev_node.textContent.length - 1) + FE.UNICODE_NBSP;
        }

        const deleted = txt.length !== prev_node.textContent.length

        // Remove nodwhile (!editor.node.isElement(preve if empty.
        if (prev_node.textContent.length === 0) {

          // Here we check to see if we should keep the current formatting.
          if (deleted && editor.opts.keepFormatOnDelete) {
            $(prev_node).after(FE.INVISIBLE_SPACE + FE.MARKERS)
          }
          else {
            if (txt.length === 0 || !editor.node.isBlock(prev_node.parentNode)) {
              // Condition prev_node.parentNode.childNodes.length == 1 is from https://github.com/froala/wysiwyg-editor/issues/1855 .
              if (((prev_node.parentNode.childNodes.length == 2 && prev_node.parentNode == marker.parentNode) || prev_node.parentNode.childNodes.length == 1) && !editor.node.isBlock(prev_node.parentNode) && !editor.node.isElement(prev_node.parentNode) && editor.node.isDeletable(prev_node.parentNode)) {
                $(prev_node.parentNode).after(FE.MARKERS)
                $(prev_node.parentNode).remove()
              }
              else {
                // https://github.com/froala/wysiwyg-editor/issues/2626.
                while (!editor.node.isElement(prev_node.parentNode) && editor.node.isEmpty(prev_node.parentNode) && FE.NO_DELETE_TAGS.indexOf(prev_node.parentNode.tagName) < 0) {
                  const t_node = prev_node
                  prev_node = prev_node.parentNode
                  t_node.parentNode.removeChild(t_node)
                }

                $(prev_node).after(FE.MARKERS)

                // https://github.com/froala/wysiwyg-editor/issues/1379.
                if (editor.node.isElement(prev_node.parentNode) && !marker.nextSibling && prev_node.previousSibling && prev_node.previousSibling.tagName === 'BR') {
                  $(marker).after('<br>')
                }

                prev_node.parentNode.removeChild(prev_node)
              }
            }
            else {
              $(prev_node).after(FE.MARKERS);
            }
          }
        }
        else {
          $(prev_node).after(FE.MARKERS)
        }
      }
      else if (editor.node.isDeletable(prev_node)) {
        $(prev_node).after(FE.MARKERS)
        $(prev_node).remove()
      }
      else if (marker.nextSibling && marker.nextSibling.tagName === 'BR' && editor.node.isVoid(prev_node) && prev_node.tagName !== 'BR') {
        $(marker.nextSibling).remove()
        $(marker).replaceWith(FE.MARKERS)
      }
      else if (editor.events.trigger('node.remove', [$(prev_node)]) !== false) {
        $(prev_node).after(FE.MARKERS)
        $(prev_node).remove()
      }
    }

    // Block tag but we are allowed to delete it.
    else if (FE.NO_DELETE_TAGS.indexOf(prev_node.tagName) < 0 && (editor.node.isEditable(prev_node) || editor.node.isDeletable(prev_node))) {
      if (editor.node.isDeletable(prev_node)) {
        $(marker).replaceWith(FE.MARKERS)
        $(prev_node).remove()
      }
      else if (editor.node.isEmpty(prev_node) && !editor.node.isList(prev_node)) {
        $(prev_node).remove()
        $(marker).replaceWith(FE.MARKERS)
      }
      else {

        // List correction.
        if (editor.node.isList(prev_node)) {
          prev_node = $(prev_node).find('li').last().get(0)
        }

        contents = editor.node.contents(prev_node)

        if (contents && contents[contents.length - 1].tagName === 'BR') {
          $(contents[contents.length - 1]).remove()
        }

        contents = editor.node.contents(prev_node)

        while (contents && editor.node.isBlock(contents[contents.length - 1])) {
          prev_node = contents[contents.length - 1]
          contents = editor.node.contents(prev_node)
        }

        $(prev_node).append(FE.MARKERS)

        let next_node = marker

        while (!next_node.previousSibling) {
          next_node = next_node.parentNode
        }

        while (next_node && next_node.tagName !== 'BR' && !editor.node.isBlock(next_node)) {
          const copy_node = next_node
          next_node = next_node.nextSibling
          $(prev_node).append(copy_node)
        }

        // Remove BR.
        if (next_node && next_node.tagName === 'BR') {
          $(next_node).remove()
        }

        $(marker).remove()
      }
    }
    else if (marker.nextSibling && marker.nextSibling.tagName === 'BR') {
      $(marker.nextSibling).remove()
    }

    return true;
  }

  /**
   * Do backspace.
   */
  function backspace() {
    let do_default = false

    // Add a marker in HTML.
    const marker = editor.markers.insert()

    if (!marker) {
      return true
    }

    // Do not allow edit inside contenteditable="false".
    let p_node = marker.parentNode

    while (p_node && !editor.node.isElement(p_node)) {
      if (p_node.getAttribute('contenteditable') === 'false') {
        $(marker).replaceWith(FE.MARKERS)
        editor.selection.restore()

        return false
      }

      // https://github.com/froala-labs/froala-editor-js-2/issues/2070
      // Break the loop if node has no content and it is editable
      else if (p_node.innerText.length && p_node.getAttribute('contenteditable') === 'true') {
        break
      }

      p_node = p_node.parentNode
    }

    editor.el.normalize()

    // We should remove invisible space first of all.
    const prev_node = marker.previousSibling

    if (prev_node) {
      const txt = prev_node.textContent

      // Check if we have an invisible space before the marker.
      if (txt && txt.length && txt.charCodeAt(txt.length - 1) === 8203) {
        if (txt.length === 1) {
          $(prev_node).remove()
        }
        else {
          prev_node.textContent = prev_node.textContent.substr(0, txt.length - _getExtremityCharacterLength(txt))
        }
      }
    }

    // Delete at end.
    if (_atEnd(marker)) {
      if (_inLi(marker) && _isAtStart(marker, $(marker).parents('li').first().get(0))) {
        editor.cursorLists._backspace(marker);
      }
      else {
        do_default = _middleBackspace(marker);
      }
    }

    // Delete at start.
    else if (_atStart(marker)) {
      if (_inLi(marker) && _isAtStart(marker, $(marker).parents('li').first().get(0))) {
        editor.cursorLists._backspace(marker)
      }
      else {
        _startBackspace(marker)
      }
    }

    // Delete at middle.
    else {
      do_default = _middleBackspace(marker)
    }

    $(marker).remove()

    _cleanEmptyBlockquotes()
    editor.html.fillEmptyBlocks(true)

    if (!editor.opts.htmlUntouched) {
      editor.html.cleanEmptyTags()
      editor.clean.lists()
      editor.spaces.normalizeAroundCursor()
    }

    editor.selection.restore()

    return do_default
  }

  /**
   * Delete at the end of a block tag.
   */
  function _endDel(marker) {
    const quote = $(marker).parentsUntil(editor.$el, 'BLOCKQUOTE').length > 0
    let deep_parent = editor.node.deepestParent(marker, [], !quote)

    if (deep_parent && deep_parent.tagName === 'BLOCKQUOTE') {
      const m_parent = editor.node.deepestParent(marker, [$(marker).parentsUntil(editor.$el, 'BLOCKQUOTE').get(0)])

      if (m_parent && m_parent.nextSibling) {
        deep_parent = m_parent
      }
    }

    // Deepest parent is not the main element.
    if (deep_parent !== null) {
      let next_node = deep_parent.nextSibling
      let contents

      // We are inside a block tag.
      if (editor.node.isBlock(deep_parent) && (editor.node.isEditable(deep_parent) || editor.node.isDeletable(deep_parent))) {

        // There is a next node.
        if (next_node && FE.NO_DELETE_TAGS.indexOf(next_node.tagName) < 0) {
          if (editor.node.isDeletable(next_node)) {
            $(next_node).remove()
            $(marker).replaceWith(FE.MARKERS)
          }
          else {

            // Next node is a block tag.
            if (editor.node.isBlock(next_node) && editor.node.isEditable(next_node)) {

              // Next node is a list.
              if (editor.node.isList(next_node)) {

                // Current block tag is empty.
                if (editor.node.isEmpty(deep_parent, true)) {
                  $(deep_parent).remove()

                  $(next_node).find('li').first().prepend(FE.MARKERS)
                }
                else {
                  const $li = $(next_node).find('li').first()

                  if (deep_parent.tagName === 'BLOCKQUOTE') {
                    contents = editor.node.contents(deep_parent)

                    if (contents.length && editor.node.isBlock(contents[contents.length - 1])) {
                      deep_parent = contents[contents.length - 1]
                    }
                  }

                  // There are no nested lists.
                  if ($li.find('ul, ol').length === 0) {
                    $(marker).replaceWith(FE.MARKERS)

                    // Remove any nodes that might be wrapped.
                    $li.find(editor.html.blockTagsQuery()).not('ol, ul, table').each(function () {
                      if (this.parentNode === $li.get(0)) {
                        $(this).replaceWith($(this).html() + (editor.node.isEmpty(this) ? '' : '<br>'))
                      }
                    })

                    $(deep_parent).append(editor.node.contents($li.get(0)))
                    $li.remove()

                    if ($(next_node).find('li').length === 0) {
                      $(next_node).remove()
                    }
                  }
                }
              }
              else {

                // Remove last BR.
                contents = editor.node.contents(next_node)

                if (contents.length && contents[0].tagName === 'BR') {
                  $(contents[0]).remove()
                }

                if (next_node.tagName !== 'BLOCKQUOTE' && deep_parent.tagName === 'BLOCKQUOTE') {
                  contents = editor.node.contents(deep_parent)

                  while (contents.length && editor.node.isBlock(contents[contents.length - 1])) {
                    deep_parent = contents[contents.length - 1]
                    contents = editor.node.contents(deep_parent)
                  }
                }
                else if (next_node.tagName === 'BLOCKQUOTE' && deep_parent.tagName !== 'BLOCKQUOTE') {
                  contents = editor.node.contents(next_node)

                  while (contents.length && editor.node.isBlock(contents[0])) {
                    next_node = contents[0]
                    contents = editor.node.contents(next_node)
                  }
                }

                $(marker).replaceWith(FE.MARKERS)
                $(deep_parent).append(next_node.innerHTML)
                $(next_node).remove()
              }
            }
            else {
              $(marker).replaceWith(FE.MARKERS)

              // var next_node = next_node.nextSibling;
              while (next_node && next_node.tagName !== 'BR' && !editor.node.isBlock(next_node) && editor.node.isEditable(next_node)) {
                const copy_node = next_node
                next_node = next_node.nextSibling
                $(deep_parent).append(copy_node)
              }

              if (next_node && next_node.tagName === 'BR' && editor.node.isEditable(next_node)) {
                $(next_node).remove()
              }
            }
          }
        }
      }

      // No block tag.
      /* jshint ignore:start */
      /* jscs:disable */
      else {
        // This should never happen.
      }
      /* jshint ignore:end */
      /* jscs:enable */
    }
  }

  /**
   * Delete at the middle of a block tag.
   */
  function _middleDel(marker) {
    let next_node = marker

    // Get the parent node that has a next sibling.
    while (!next_node.nextSibling) {
      next_node = next_node.parentNode

      if (editor.node.isElement(next_node)) {
        return false
      }
    }
    next_node = next_node.nextSibling

    // Handle the case when the next node is a BR.
    if (next_node.tagName === 'BR' && editor.node.isEditable(next_node)) {

      // There is a next sibling.
      if (next_node.nextSibling) {
        if (editor.node.isBlock(next_node.nextSibling) && editor.node.isEditable(next_node.nextSibling)) {
          if (FE.NO_DELETE_TAGS.indexOf(next_node.nextSibling.tagName) < 0) {
            next_node = next_node.nextSibling
            $(next_node.previousSibling).remove()
          }
          else {
            $(next_node).remove()

            return
          }
        }
      }

      // No next sibling. We should check if BR is at the end.
      else if (_atEnd(next_node)) {
        if (_inLi(marker)) {
          editor.cursorLists._del(marker)
        }
        else {
          const deep_parent = editor.node.deepestParent(next_node)

          if (deep_parent) {
            if (!editor.node.isEmpty(editor.node.blockParent(next_node)) || (editor.node.blockParent(next_node).nextSibling && FE.NO_DELETE_TAGS.indexOf(editor.node.blockParent(next_node).nextSibling.tagName)) < 0) {
              $(next_node).remove()
            }

            _endDel(marker)
          }
        }

        return
      }
    }

    // Not block tag.
    let contents

    if (!editor.node.isBlock(next_node) && editor.node.isEditable(next_node)) {
      contents = editor.node.contents(next_node)

      // Next node is text.
      while (next_node.nodeType !== Node.TEXT_NODE && contents.length && !editor.node.isDeletable(next_node) && editor.node.isEditable(next_node)) {
        next_node = contents[0]
        contents = editor.node.contents(next_node)
      }

      if (next_node.nodeType === Node.TEXT_NODE) {
        $(next_node).before(FE.MARKERS)

        if (next_node.textContent.length) {
          next_node.textContent = next_node.textContent.substring(_getExtremityCharacterLength(next_node.textContent, true), next_node.textContent.length)
        }
      }
      else if (editor.node.isDeletable(next_node)) {
        $(next_node).before(FE.MARKERS)
        $(next_node).remove()
      }
      else if (editor.events.trigger('node.remove', [$(next_node)]) !== false) {
        $(next_node).before(FE.MARKERS)
        $(next_node).remove()
      }

      $(marker).remove()
    }

    // Block tag.
    else if (FE.NO_DELETE_TAGS.indexOf(next_node.tagName) < 0 && (editor.node.isEditable(next_node) || editor.node.isDeletable(next_node))) {
      if (editor.node.isDeletable(next_node)) {
        $(marker).replaceWith(FE.MARKERS)
        $(next_node).remove()
      }
      else if (editor.node.isList(next_node)) {

        // There is a previous sibling.
        if (marker.previousSibling) {
          $(next_node).find('li').first().prepend(marker)
          editor.cursorLists._backspace(marker)
        }

        // No previous sibling.
        else {
          $(next_node).find('li').first().prepend(FE.MARKERS)
          $(marker).remove()
        }
      }
      else {
        contents = editor.node.contents(next_node)

        if (contents && contents[0].tagName === 'BR') {
          $(contents[0]).remove()
        }

        // Deal with blockquote.
        if (contents && next_node.tagName === 'BLOCKQUOTE') {
          let node = contents[0]
          $(marker).before(FE.MARKERS)

          while (node && node.tagName !== 'BR') {
            const tmp = node
            node = node.nextSibling
            $(marker).before(tmp)
          }

          if (node && node.tagName === 'BR') {
            $(node).remove()
          }
        }
        else {
          $(marker)
            .after($(next_node).html())
            .after(FE.MARKERS)

          $(next_node).remove()
        }
      }
    }
  }

  /**
   * Delete.
   */
  function del() {
    const marker = editor.markers.insert()

    if (!marker) {
      return false
    }

    editor.el.normalize()

    // Delete at end.
    if (_atEnd(marker)) {
      if (_inLi(marker)) {
        if ($(marker).parents('li').first().find('ul, ol').length === 0) {
          editor.cursorLists._del(marker)
        }
        else {
          let $li = $(marker).parents('li').first()
            .find('ul, ol')
            .first()
            .find('li')
            .first()
          $li = $li.find(editor.html.blockTagsQuery()).get(-1) || $li

          $li.prepend(marker)
          editor.cursorLists._backspace(marker)
        }
      }
      else {
        _endDel(marker)
      }
    }

    // Delete at start.
    else if (_atStart(marker)) {
      _middleDel(marker)
    }

    // Delete at middle.
    else {
      _middleDel(marker)
    }

    $(marker).remove()
    _cleanEmptyBlockquotes()
    editor.html.fillEmptyBlocks(true)

    if (!editor.opts.htmlUntouched) {
      editor.html.cleanEmptyTags()
      editor.clean.lists()
    }

    editor.spaces.normalizeAroundCursor()
    editor.selection.restore()
  }

  function _cleanEmptyBlockquotes() {
    const blks = editor.el.querySelectorAll('blockquote:empty')

    for (let i = 0; i < blks.length; i++) {
      blks[i].parentNode.removeChild(blks[i])
    }
  }

  function _cleanNodesToRemove() {
    editor.$el.find('.fr-to-remove').each(function () {
      const contents = editor.node.contents(this)

      for (let i = 0; i < contents.length; i++) {
        if (contents[i].nodeType === Node.TEXT_NODE) {
          contents[i].textContent = contents[i].textContent.replace(/\u200B/g, '')
        }
      }

      $(this).replaceWith(this.innerHTML)
    })
  }

  /**
   * Enter at the end of a block tag.
   */
  function _endEnter(marker, shift, quote) {
    const deep_parent = editor.node.deepestParent(marker, [], !quote)
    let default_tag

    if (deep_parent && deep_parent.tagName === 'BLOCKQUOTE') {
      if (_isAtEnd(marker, deep_parent)) {
        default_tag = editor.html.defaultTag()

        if(!shift) {
          if (default_tag) {
            $(deep_parent).after(`<${default_tag}>${FE.MARKERS}<br></${default_tag}>`)
          }
          else {
            $(deep_parent).after(`${FE.MARKERS}<br>`)
          }
        }
        else {
          $(marker).replaceWith('<br>' + FE.MARKERS);
        }

        $(marker).remove()

        return false
      }

      _middleEnter(marker, shift, quote)

      return false

    }

    // We are right in the main element.
    if (deep_parent === null) {
      default_tag = editor.html.defaultTag()

      if (!default_tag || !editor.node.isElement(marker.parentNode)) {
        if (marker.previousSibling && !$(marker.previousSibling).is('br') && !marker.nextSibling) {
          $(marker).replaceWith(`<br>${FE.MARKERS}<br>`)
        }
        else {
          $(marker).replaceWith(`<br>${FE.MARKERS}`)
        }
      }
      else {
        $(marker).replaceWith(`<${default_tag}>${FE.MARKERS}<br></${default_tag}>`)
      }
    }

    // There is a parent.
    else {

      // Block tag parent.
      let c_node = marker
      let str = ''

      if (deep_parent.tagName == 'PRE' && !marker.nextSibling) {
        shift = true;
      }

      if (!editor.node.isBlock(deep_parent) || shift) {
        str = '<br/>'
      }

      let c_str = ''
      let o_str = ''

      default_tag = editor.html.defaultTag()
      let open_default_tag = ''
      let close_default_tag = ''

      if (default_tag && editor.node.isBlock(deep_parent)) {
        open_default_tag = `<${default_tag}>`
        close_default_tag = `</${default_tag}>`

        if (deep_parent.tagName === default_tag.toUpperCase()) {
          open_default_tag = editor.node.openTagString($(deep_parent).clone().removeAttr('id').get(0))
        }
      }

      do {
        c_node = c_node.parentNode

        // Shift condition.
        if (!shift || c_node !== deep_parent || shift && !editor.node.isBlock(deep_parent)) {
          c_str += editor.node.closeTagString(c_node)

          // Open str when there is a block parent.
          if (c_node === deep_parent && editor.node.isBlock(deep_parent)) {
            o_str = open_default_tag + o_str
          }
          else {
            const cls = (c_node.tagName === 'A' || editor.node.hasClass(c_node, 'fa')) && _isAtEnd(marker, c_node) ? 'fr-to-remove' : ''
            o_str = editor.node.openTagString($(c_node).clone().addClass(cls).get(0)) + o_str
          }
        }
      } while (c_node !== deep_parent)

      // Add BR if deep parent is block tag.
      str = c_str + str + o_str + (marker.parentNode === deep_parent && editor.node.isBlock(deep_parent) ? '' : FE.INVISIBLE_SPACE) + FE.MARKERS

      if (editor.node.isBlock(deep_parent) && !$(deep_parent).find('*').last().is('br')) {
        $(deep_parent).append('<br/>')
      }

      $(marker).after('<span id="fr-break"></span>')
      $(marker).remove()

      // Add a BR after to make sure we display the last line.
      if ((!deep_parent.nextSibling || editor.node.isBlock(deep_parent.nextSibling)) && !editor.node.isBlock(deep_parent)) {
        $(deep_parent).after('<br>')
      }

      let html

      // No shift.
      if (!shift && editor.node.isBlock(deep_parent)) {
        html = editor.node.openTagString(deep_parent) + $(deep_parent).html() + close_default_tag
      }
      else {
        html = editor.node.openTagString(deep_parent) + $(deep_parent).html() + editor.node.closeTagString(deep_parent)
      }

      html = html.replace(/<span id="fr-break"><\/span>/g, str)

      $(deep_parent).replaceWith(html)
    }
  }

  /**
   * Start at the beginning of a block tag.
   */
  function _startEnter(marker, shift, quote) {
    const deep_parent = editor.node.deepestParent(marker, [], !quote)
    let default_tag

    // https://github.com/froala-labs/froala-editor-js-2/issues/320
    if (deep_parent && deep_parent.tagName === 'TABLE') {
      $(deep_parent).find('td, th').first().prepend(marker)

      return _startEnter(marker, shift, quote)
    }

    if (deep_parent && deep_parent.tagName === 'BLOCKQUOTE') {
      if (_isAtStart(marker, deep_parent)) {
        if(!shift) {
          default_tag = editor.html.defaultTag()

          if (default_tag) {
            $(deep_parent).before(`<${default_tag}>${FE.MARKERS}<br></${default_tag}>`)
          }
          else {
            $(deep_parent).before(`${FE.MARKERS}<br>`)
          }

          $(marker).remove()

          return false
        }
      }
      else if (_isAtEnd(marker, deep_parent)) {
        _endEnter(marker, shift, true)
      }
      else {
        _middleEnter(marker, shift, true)
      }
    }

    // We are right in the main element.
    if (deep_parent === null) {
      default_tag = editor.html.defaultTag()

      if (!default_tag || !editor.node.isElement(marker.parentNode)) {
        $(marker).replaceWith(`<br>${FE.MARKERS}`)
      }
      else {
        $(marker).replaceWith(`<${default_tag}>${FE.MARKERS}<br></${default_tag}>`)
      }
    }
    else {
      if (editor.node.isBlock(deep_parent)) {
        if (deep_parent.tagName === 'PRE') {
          shift = true
        }

        if (shift) {
          $(marker).remove()
          $(deep_parent).prepend(`<br>${FE.MARKERS}`)
        }
        else if ((marker.nextSibling && marker.nextSibling.tagName == 'IMG') || (marker.nextSibling && marker.nextSibling.nextElementSibling && marker.nextSibling.nextElementSibling == 'IMG')) {
          $(marker).replaceWith('<' + editor.html.defaultTag() + '>' + FE.MARKERS + '<br></' + editor.html.defaultTag() + '>');
        }
        else if (editor.node.isEmpty(deep_parent, true)) {

          return _endEnter(marker, shift, quote)
        }
        else if (!editor.opts.keepFormatOnDelete) {
          $(deep_parent).before(`${editor.node.openTagString($(deep_parent).clone().removeAttr('id').get(0))}<br>${editor.node.closeTagString(deep_parent)}`)
        }
        else {
          let tmp = marker
          let str = FE.INVISIBLE_SPACE

          // Look up to all parents.
          while (tmp !== deep_parent && !editor.node.isElement(tmp)) {
            tmp = tmp.parentNode
            str = editor.node.openTagString(tmp) + str + editor.node.closeTagString(tmp)
          }

          $(deep_parent).before(str)
        }
      }
      else {
        $(deep_parent).before('<br>')
      }

      $(marker).remove()
    }
  }

  /**
   * Enter at the middle of a block tag.
   */
  function _middleEnter(marker, shift, quote) {
    const deep_parent = editor.node.deepestParent(marker, [], !quote)

    // We are right in the main element.
    if (deep_parent === null) {

      // Default tag is not enter.
      if (editor.html.defaultTag() && marker.parentNode === editor.el) {
        $(marker).replaceWith(`<${editor.html.defaultTag()}>${FE.MARKERS}<br></${editor.html.defaultTag()}>`)
      }
      else {

        // Add a BR after to make sure we display the last line.
        if (!marker.nextSibling || editor.node.isBlock(marker.nextSibling)) {
          $(marker).after('<br>')
        }

        $(marker).replaceWith(`<br>${FE.MARKERS}`)
      }
    }

    // https://github.com/froala/wysiwyg-editor/issues/3392
    else if ((marker.previousSibling && marker.previousSibling.tagName == 'IMG') || (marker.nextSibling && marker.nextSibling.tagName == 'IMG')) {
      $(marker).replaceWith('<' + editor.html.defaultTag() + '>' + FE.MARKERS + '<br></' + editor.html.defaultTag() + '>');
    }
    // There is a parent.
    else {

      // Block tag parent.
      let c_node = marker
      let str = ''

      if (deep_parent.tagName === 'PRE') {
        shift = true
      }

      if (!editor.node.isBlock(deep_parent) || shift) {
        str = '<br>'
      }

      let c_str = ''
      let o_str = ''

      do {
        const tmp = c_node
        c_node = c_node.parentNode

        // Move marker after node it if is empty and we are in quote.
        if (deep_parent.tagName === 'BLOCKQUOTE' && editor.node.isEmpty(tmp) && !editor.node.hasClass(tmp, 'fr-marker')) {
          if ($(tmp).contains(marker)) {
            $(tmp).after(marker)
          }
        }

        // If not at end or start of element in quote.
        if (!(deep_parent.tagName === 'BLOCKQUOTE' && (_isAtEnd(marker, c_node) || _isAtStart(marker, c_node)))) {

          // 1. No shift.
          // 2. c_node is not deep parent.
          // 3. Shift and deep parent is not block tag.
          if (!shift || c_node !== deep_parent || shift && !editor.node.isBlock(deep_parent)) {
            c_str += editor.node.closeTagString(c_node)

            const cls = ((c_node.tagName == 'A' && _isAtEnd(marker, c_node)) || editor.node.hasClass(c_node, 'fa')) ? 'fr-to-remove' : ''
            o_str = editor.node.openTagString($(c_node).clone().addClass(cls).removeAttr('id').get(0)) + o_str
          }
          else if (deep_parent.tagName == 'BLOCKQUOTE' && shift) {
            c_str = '';
            o_str = '';
          }
        }
      } while (c_node !== deep_parent)

      // We should add an invisible space if:
      // 1. parent node is not deep parent and block tag.
      // 2. marker has no next sibling.
      const add =
        deep_parent === marker.parentNode && editor.node.isBlock(deep_parent) ||
        marker.nextSibling


      if (deep_parent.tagName === 'BLOCKQUOTE') {
        if (marker.previousSibling && editor.node.isBlock(marker.previousSibling) && marker.nextSibling && marker.nextSibling.tagName === 'BR') {
          $(marker.nextSibling).after(marker)

          if (marker.nextSibling && marker.nextSibling.tagName === 'BR') {
            $(marker.nextSibling).remove()
          }
        }
        if (shift) {
          str = c_str + str + FE.MARKERS + o_str;
        }
        else {
          const default_tag = editor.html.defaultTag()
          str = `${c_str + str + (default_tag ? `<${default_tag}>` : '') + FE.MARKERS}<br>${default_tag ? `</${default_tag}>` : ''}${o_str}`
        }
      }
      else {
        str = c_str + str + o_str + (add ? '' : FE.INVISIBLE_SPACE) + FE.MARKERS
      }

      $(marker).replaceWith('<span id="fr-break"></span>')
      let html = editor.node.openTagString(deep_parent) + $(deep_parent).html() + editor.node.closeTagString(deep_parent)
      html = html.replace(/<span id="fr-break"><\/span>/g, str)

      $(deep_parent).replaceWith(html)
    }
  }

  /**
   * Do enter.
   */
  function enter(shift) {
    // Add a marker in HTML.
    const marker = editor.markers.insert()

    if (!marker) {
      return true
    }

    // Do not allow edit inside contenteditable="false".
    var p_node = marker.parentNode;

    while (p_node && !editor.node.isElement(p_node)) {
      if (p_node.getAttribute('contenteditable') === 'false') {
        $(marker).replaceWith(FE.MARKERS);
        editor.selection.restore();
        return false;
      }
      else if (p_node.getAttribute('contenteditable') === 'true') {
        break;
      }
      p_node = p_node.parentNode;
    }

    editor.el.normalize()

    let quote = false

    if ($(marker).parentsUntil(editor.$el, 'BLOCKQUOTE').length > 0) {
      //shift = false
      quote = true
    }

    if ($(marker).parentsUntil(editor.$el, 'TD, TH').length) {
      quote = false
    }

    // At the end.
    if (_atEnd(marker)) {

      // Enter in list.
      if (_inLi(marker) && !shift && !quote) {
        editor.cursorLists._endEnter(marker)
      }
      else {
        _endEnter(marker, shift, quote)
      }
    }

    // At start.
    else if (_atStart(marker)) {

      // Enter in list.
      if (_inLi(marker) && !shift && !quote) {
        editor.cursorLists._startEnter(marker)
      }
      else {
        _startEnter(marker, shift, quote)
      }
    }

    // At middle.
    else {

      // Enter in list.
      if (_inLi(marker) && !shift && !quote) {
        editor.cursorLists._middleEnter(marker)
      }
      else {
        _middleEnter(marker, shift, quote)
      }
    }

    _cleanNodesToRemove()
    editor.html.fillEmptyBlocks(true)

    if (!editor.opts.htmlUntouched) {
      editor.html.cleanEmptyTags()
      editor.clean.lists()
      editor.spaces.normalizeAroundCursor()
    }

    editor.selection.restore()
  }

  return {
    enter,
    backspace,
    del,
    isAtEnd: _isAtEnd,
    isAtStart: _isAtStart
  }
}
