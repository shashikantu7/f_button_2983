import FE from '../../editor.js'

FE.MODULES.refresh = function (editor) {
  const $ = editor.$

  function undo($btn) {
    _setDisabled($btn, !editor.undo.canDo())
  }

  function redo($btn) {
    _setDisabled($btn, !editor.undo.canRedo())
  }

  function indent($btn) {
    if (editor.node.hasClass($btn.get(0), 'fr-no-refresh')) {
      return false
    }

    const blocks = editor.selection.blocks()

    for (let i = 0; i < blocks.length; i++) {
      let p_node = blocks[i].previousSibling

      while (p_node && p_node.nodeType === Node.TEXT_NODE && p_node.textContent.length === 0) {
        p_node = p_node.previousSibling
      }

      if (blocks[i].tagName === 'LI' && !p_node) {
        _setDisabled($btn, true)
      }
      else {
        _setDisabled($btn, false)

        return true
      }
    }
  }

  function outdent($btn) {
    if (editor.node.hasClass($btn.get(0), 'fr-no-refresh')) {
      return false
    }

    const blocks = editor.selection.blocks()

    for (let i = 0; i < blocks.length; i++) {
      const prop = editor.opts.direction === 'rtl' || $(blocks[i]).css('direction') === 'rtl' ? 'margin-right' : 'margin-left'

      if (blocks[i].tagName === 'LI' || blocks[i].parentNode.tagName === 'LI') {
        _setDisabled($btn, false)

        return true
      }

      if (editor.helpers.getPX($(blocks[i]).css(prop)) > 0) {
        _setDisabled($btn, false)

        return true
      }
    }

    _setDisabled($btn, true)
  }

  /**
   * Disable/enable buton.
   */
  function _setDisabled($btn, disabled) {
    $btn.toggleClass('fr-disabled', disabled).attr('aria-disabled', disabled)
  }

  /**
   * Apply styles to button groups
   */
  function more($moreButton) {
    // Align the hidden toolbar with respect to its corresponding more button
    // Set its width to cover the complete editor width
    const $moreToolbar = editor.$tb.find(`.fr-more-toolbar[data-name="${$moreButton.attr('data-group-name')}"]`)

    let offset = _computeMoreToolbarPosition($moreButton, $moreToolbar)

    // Position hidden toolbar w.r.t. more button
    if (editor.opts.direction === 'rtl') {
      $moreToolbar.css('padding-right', offset)
    }
    else {
      $moreToolbar.css('padding-left', offset)
    }

  }

  /**
   * Compute more toolbar new position w.r.t more button
   */
  function _computeMoreToolbarPosition($moreButton, $moreToolbar) {

    // Compute total buttons width in the more toolbar
    let totalButtonWidth = 0
    const $moreToolbarBtns = $moreToolbar.find('> .fr-command, > .fr-btn-wrap')
    $moreToolbarBtns.each((index, btn) => {
      totalButtonWidth += $(btn).outerWidth()
    })

    // Calculate the position to place the hidden toolbar w.r.t. its more button
    const buttonMarginLeft = editor.helpers.getPX($($moreToolbarBtns[0]).css('margin-left'))
    const buttonMarginRight = editor.helpers.getPX($($moreToolbarBtns[0]).css('margin-right'))

    let offset
    if (editor.opts.direction === 'rtl') {
      offset = editor.$tb.outerWidth() - $moreButton.offset().left + editor.$tb.offset().left - (totalButtonWidth + $moreButton.outerWidth() + $moreToolbarBtns.length * (buttonMarginLeft + buttonMarginRight)) / 2
    }
    else {
      offset = $moreButton.offset().left - editor.$tb.offset().left - (totalButtonWidth - $moreButton.outerWidth() + $moreToolbarBtns.length * (buttonMarginLeft + buttonMarginRight)) / 2
    }
    
    // Handle right side going outside the editor
    if (offset + totalButtonWidth + $moreToolbarBtns.length * (buttonMarginLeft + buttonMarginRight) > editor.$tb.outerWidth()) {
      offset -= (totalButtonWidth + $moreToolbarBtns.length * (buttonMarginLeft + buttonMarginRight) - $moreButton.outerWidth()) / 2
    }
    
    // Handle left side going outside the editor
    if (offset < 0) {
      offset = 0
    }

    return offset
  }

  return {
    undo,
    redo,
    outdent,
    indent,
    moreText: more,
    moreParagraph: more,
    moreMisc: more,
    moreRich: more
  }
}
