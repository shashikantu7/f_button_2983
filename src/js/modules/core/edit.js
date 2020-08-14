import FE from '../../editor.js'

FE.MODULES.edit = function (editor) {

  /**
   * Disable editing design.
   */
  function disableDesign() {
    if (editor.browser.mozilla) {
      try {
        editor.doc.execCommand('enableObjectResizing', false, 'false')
        editor.doc.execCommand('enableInlineTableEditing', false, 'false')
      }
      catch (ex) {
        // ok.
      }
    }

    if (editor.browser.msie) {
      try {
        editor.doc.body.addEventListener('mscontrolselect', (e) => {

          // Add focus to the element when clicked
          e.srcElement.focus()
          return false
        })
      }
      catch (ex) {
        // ok.
      }
    }
  }

  let disabled = false

  /**
   * Add contneteditable attribute.
   */
  function on() {
    if (editor.$wp) {
      editor.$el.attr('contenteditable', true)
      editor.$el.removeClass('fr-disabled').attr('aria-disabled', false)

      disableDesign()
    }
    else if (editor.$el.is('a')) {
      editor.$el.attr('contenteditable', true)
    }

    editor.events.trigger('edit.on', [], true)
    disabled = false
  }

  /**
   * Remove contenteditable attribute.
   */
  function off() {
    editor.events.disableBlur()

    if (editor.$wp) {
      editor.$el.attr('contenteditable', false)
      editor.$el.addClass('fr-disabled').attr('aria-disabled', true)
    }
    else if (editor.$el.is('a')) {
      editor.$el.attr('contenteditable', false)
    }

    editor.events.trigger('edit.off')

    editor.events.enableBlur()
    disabled = true
  }

  function isDisabled() {
    return disabled
  }

  function _init() {
    // When there are multiple editor instances and shared toolbar make sure we can edit.
    editor.events.on('focus', () => {
      if (isDisabled()) {
        editor.edit.off()
      }
      else {
        editor.edit.on()
      }
    })
  }

  return {
    _init,
    on,
    off,
    disableDesign,
    isDisabled
  }
}
