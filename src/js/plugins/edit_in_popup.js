import FE from '../index.js';
'use strict';

Object.assign(FE.DEFAULTS, {
  editInPopup: false
})

FE.MODULES.editInPopup = function (editor) {
  function _initPopup() {

    // Image buttons.
    const txt = `<div id="fr-text-edit-${editor.id}" class="fr-layer fr-text-edit-layer"><div class="fr-input-line"><input type="text" placeholder="${editor.language.translate('Text')}" tabIndex="1"></div><div class="fr-action-buttons"><button type="button" class="fr-command fr-submit" data-cmd="updateText" tabIndex="2">${editor.language.translate('Update')}</button></div></div>`

    const template = {
      edit: txt
    }

    editor.popups.create('text.edit', template)
  }

  function _showPopup() {
    const $popup = editor.popups.get('text.edit')

    let text

    if (editor.el.tagName === 'INPUT') {
      text = editor.$el.attr('placeholder')
    }
    else {
      text = editor.$el.text()
    }

    $popup.find('input').val(text).trigger('change')
    editor.popups.setContainer('text.edit', editor.$sc)
    editor.popups.show('text.edit', editor.$el.offset().left + editor.$el.outerWidth() / 2, editor.$el.offset().top + editor.$el.outerHeight(), editor.$el.outerHeight())
  }

  function _initEvents() {

    // Show edit popup.
    editor.events.$on(editor.$el, editor._mouseup, () => {
      setTimeout(() => {
        _showPopup()
      }, 10)
    })
  }

  function update() {
    const $popup = editor.popups.get('text.edit')

    let new_text = $popup.find('input').val()

    if (new_text.length === 0) {
      new_text = editor.opts.placeholderText
    }

    if (editor.el.tagName === 'INPUT') {
      editor.$el.attr('placeholder', new_text)
    }
    else {
      editor.$el.text(new_text)
    }

    editor.events.trigger('contentChanged')

    editor.popups.hide('text.edit')
  }

  /**
   * Initialize.
   */
  const _init = () => {
    if (editor.opts.editInPopup) {
      _initPopup()
      _initEvents()
    }
  }

  return {
    _init,
    update
  }
}

FE.RegisterCommand('updateText', {
  focus: false,
  undo: false,
  callback() {
    this.editInPopup.update()
  }
})