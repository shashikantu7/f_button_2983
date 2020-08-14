import FE from '../../editor.js'

// Extend defaults.
Object.assign(FE.DEFAULTS, {
  tooltips: true
})

FE.MODULES.tooltip = function (editor) {
  const $ = editor.$

  function hide() {
    if (editor.helpers.isMobile()) {
      return
    }

    // Position fixed for: https://github.com/froala/wysiwyg-editor/issues/1247.
    if (editor.$tooltip) {
      editor.$tooltip.removeClass('fr-visible').css('left', '-3000px').css('position', 'fixed')
    }
  }

  function to($el, above) {
    if (editor.helpers.isMobile()) {
      return
    }

    if (!$el.data('title')) {
      $el.data('title', $el.attr('title'))
    }

    if (!$el.data('title')) {
      return
    }

    if (!editor.$tooltip) {
      _init()
    }

    $el.removeAttr('title')
    editor.$tooltip.text(editor.language.translate($el.data('title')))
    editor.$tooltip.addClass('fr-visible')

    let left = $el.offset().left + ($el.outerWidth() - editor.$tooltip.outerWidth()) / 2

    // Normalize screen position.
    if (left < 0) {
      left = 0
    }

    if (left + editor.$tooltip.outerWidth() > $(editor.o_win).width()) {
      left = $(editor.o_win).width() - editor.$tooltip.outerWidth()
    }

    if (typeof above === 'undefined') {
      above = editor.opts.toolbarBottom
    }

    if ((($el.offset().top - $(window).scrollTop()) + $el.outerHeight() + 10) >= $(window).height()) {
      above = true
    }

    const top = !above ? $el.offset().top + $el.outerHeight() : $el.offset().top - editor.$tooltip.height()

    editor.$tooltip.css('position', '')
    editor.$tooltip.css('left', left)
    editor.$tooltip.css('top', Math.ceil(top))

    if ($(editor.o_doc).find('body').first().css('position') !== 'static') {
      editor.$tooltip.css('margin-left', -$(editor.o_doc).find('body').first().offset().left)
      editor.$tooltip.css('margin-top', -$(editor.o_doc).find('body').first().offset().top)
    }
    else {
      editor.$tooltip.css('margin-left', '')
      editor.$tooltip.css('margin-top', '')
    }
  }

  function bind($el, selector, above) {
    if (editor.opts.tooltips && !editor.helpers.isMobile()) {
      editor.events.$on($el, 'mouseover', selector, (e) => {
        if (!editor.node.hasClass(e.currentTarget, 'fr-disabled') && !editor.edit.isDisabled()) {
          to($(e.currentTarget), above)
        }
      }, true)

      editor.events.$on($el, `mouseout ${editor._mousedown} ${editor._mouseup}`, selector, () => {
        hide()
      }, true)
    }
  }

  function _init() {
    if (editor.opts.tooltips && !editor.helpers.isMobile()) {
      if (!editor.shared.$tooltip) {
        editor.shared.$tooltip = $(editor.doc.createElement('DIV')).addClass('fr-tooltip')

        editor.$tooltip = editor.shared.$tooltip

        if (editor.opts.theme) {
          editor.$tooltip.addClass(`${editor.opts.theme}-theme`)
        }

        $(editor.o_doc).find('body').first().append(editor.$tooltip)
      }
      else {
        editor.$tooltip = editor.shared.$tooltip
      }

      editor.events.on('shared.destroy', () => {
        editor.$tooltip.html('').removeData().remove()
        editor.$tooltip = null
      }, true)
    }
  }

  return {
    hide,
    to,
    bind
  }
}
