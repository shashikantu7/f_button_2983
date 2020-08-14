import './language.js'

import FE from '../../../editor.js'

// Extend defaults.
Object.assign(FE.DEFAULTS, {
  placeholderText: 'Type something'
})

FE.MODULES.placeholder = function (editor) {
  const $ = editor.$

  /* Show placeholder. */
  function show() {
    if (!editor.$placeholder) {
      _add()
    }

    const margin_offset = editor.opts.iframe ? editor.$iframe.prev().outerHeight(true) : editor.$el.prev().outerHeight(true)

    // Determine the placeholder position based on the first element inside editor.
    let margin_top = 0
    let margin_left = 0
    let margin_right = 0
    let padding_top = 0
    let padding_left = 0
    let padding_right = 0
    const contents = editor.node.contents(editor.el)

    const alignment = $(editor.selection.element()).css('text-align')

    if (contents.length && contents[0].nodeType === Node.ELEMENT_NODE) {

      const $first_node = $(contents[0])

      if ((editor.$wp.prev().length > 0 || editor.$el.prev().length > 0) && editor.ready) {
        margin_top = editor.helpers.getPX($first_node.css('margin-top'))
        padding_top = editor.helpers.getPX($first_node.css('padding-top'))
        margin_left = editor.helpers.getPX($first_node.css('margin-left'))
        margin_right = editor.helpers.getPX($first_node.css('margin-right'))
        padding_left = editor.helpers.getPX($first_node.css('padding-left'))
        padding_right = editor.helpers.getPX($first_node.css('padding-right'))
      }

      editor.$placeholder.css('font-size', $first_node.css('font-size'))
      editor.$placeholder.css('line-height', $first_node.css('line-height'))
    }
    else {
      editor.$placeholder.css('font-size', editor.$el.css('font-size'))
      editor.$placeholder.css('line-height', editor.$el.css('line-height'))
    }

    editor.$wp.addClass('show-placeholder')
    editor.$placeholder
      .css({
        marginTop: Math.max(editor.helpers.getPX(editor.$el.css('margin-top')), margin_top) + (margin_offset ? margin_offset : 0),
        paddingTop: Math.max(editor.helpers.getPX(editor.$el.css('padding-top')), padding_top),
        paddingLeft: Math.max(editor.helpers.getPX(editor.$el.css('padding-left')), padding_left),
        marginLeft: Math.max(editor.helpers.getPX(editor.$el.css('margin-left')), margin_left),
        paddingRight: Math.max(editor.helpers.getPX(editor.$el.css('padding-right')), padding_right),
        marginRight: Math.max(editor.helpers.getPX(editor.$el.css('margin-right')), margin_right),
        textAlign: alignment
      })
      .text(editor.language.translate(editor.opts.placeholderText || editor.$oel.attr('placeholder') || ''))

    editor.$placeholder.html(editor.$placeholder.text().replace(/\n/g, '<br>'))
  }

  /* Hide placeholder. */
  function hide() {
    editor.$wp.removeClass('show-placeholder')
  }

  /* Check if placeholder is visible */
  function isVisible() {
    return !editor.$wp ? true : editor.node.hasClass(editor.$wp.get(0), 'show-placeholder')
  }

  /* Refresh placeholder. */
  function refresh() {
    if (!editor.$wp) {
      return false
    }

    if (editor.core.isEmpty()) {
      show()
    }
    else {
      hide()
    }
  }

  function _add() {
    editor.$placeholder = $(editor.doc.createElement('SPAN')).addClass('fr-placeholder')
    editor.$wp.append(editor.$placeholder)
  }

  /* Initialize. */
  function _init() {
    if (!editor.$wp) {
      return false
    }

    editor.events.on('init input keydown keyup contentChanged initialized', refresh)
  }

  return {
    _init,
    show,
    hide,
    refresh,
    isVisible
  }
}
