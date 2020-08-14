import FE from '../index.js'
'use strict';

// Extend defaults.
Object.assign(FE.DEFAULTS, {
  charCounterMax: -1,
  charCounterCount: true
})

FE.PLUGINS.charCounter = function (editor) {
  const { $ } =  editor
  let $counter

  /**
   * Get the char number.
   */
  const count = () => (editor.el.textContent || '').replace(/\u200B/g, '').length

  /**
   * Check chars on typing.
   */
  function _checkCharNumber(e) {

    // Continue if infinite characters.
    if (editor.opts.charCounterMax < 0) return true

    // Continue if enough characters.
    if (count() < editor.opts.charCounterMax) return true

    // Stop if the key will produce a new char.
    const keyCode = e.which

    if ((!editor.keys.ctrlKey(e) && editor.keys.isCharacter(keyCode)) || (keyCode === FE.KEYCODE.IME)) {
      e.preventDefault()
      e.stopPropagation()
      editor.events.trigger('charCounter.exceeded')

      return false
    }

    return true
  }

  /**
   * Check chars on paste.
   */
  function _checkCharNumberOnPaste(html) {
    if (editor.opts.charCounterMax < 0) return html

    const len = $('<div>').html(html).text().length

    if (len + count() <= editor.opts.charCounterMax) return html

    editor.events.trigger('charCounter.exceeded')

    return ''
  }

  /**
   * Update the char counter.
   */
  function _updateCharNumber() {
    if (editor.opts.charCounterCount) {
      const chars = count() + (editor.opts.charCounterMax > 0 ? '/' + editor.opts.charCounterMax : '')

      $counter.text(`${editor.language.translate('Characters')} : ${chars}`)

      if (editor.opts.toolbarBottom) {
        $counter.css('margin-bottom', editor.$tb.outerHeight(true))
      }

      // Scroll size correction.
      const scroll_size = editor.$wp.get(0).offsetWidth - editor.$wp.get(0).clientWidth

      if (scroll_size >= 0) {
        if (editor.opts.direction == 'rtl') {
          $counter.css('margin-left', scroll_size)
        }
        else {
          $counter.css('margin-right', scroll_size)
        }
      }
    }
  }

  /*
   * Initialize.
   */
  function _init() {
    if (!editor.$wp) return false

    if (!editor.opts.charCounterCount) return false

    $counter = $(document.createElement('span')).attr('class', 'fr-counter')
    $counter.css('bottom', editor.$wp.css('border-bottom-width'))

    // Append char counter only if second toolbar exists
    if (editor.$second_tb) {
      editor.$second_tb.append($counter)
    }

    editor.events.on('keydown', _checkCharNumber, true)
    editor.events.on('paste.afterCleanup', _checkCharNumberOnPaste)
    editor.events.on('keyup contentChanged input', function () {
      editor.events.trigger('charCounter.update')
    })

    editor.events.on('charCounter.update', _updateCharNumber)
    editor.events.trigger('charCounter.update')

    editor.events.on('destroy', function () {
      $(editor.o_win).off(`resize.char${editor.id}`)
      $counter.removeData().remove()
      $counter = null
    })
  }

  return {
    _init: _init,
    count: count
  }
}
