import FE from '../index.js'
'use strict';

// Extend defaults.
Object.assign(FE.DEFAULTS, {
  fontSize: ['8', '9', '10', '11', '12', '14', '18', '24', '30', '36', '48', '60', '72', '96'],
  fontSizeSelection: false,
  fontSizeDefaultSelection: '12',
  fontSizeUnit: 'px'
})

FE.PLUGINS.fontSize = function (editor) {

  const { $ } = editor

  function apply(val) {
    editor.format.applyStyle('font-size', val)
  }

  function refreshOnShow($btn, $dropdown) {
    let val = $(editor.selection.element()).css('font-size')

    if (editor.opts.fontSizeUnit === 'pt') {
      val = `${Math.round(parseFloat(val, 10) * 72 / 96)}pt`
    }

    $dropdown.find('.fr-command.fr-active').removeClass('fr-active').attr('aria-selected', false)
    $dropdown.find(`.fr-command[data-param1="${val}"]`).addClass('fr-active').attr('aria-selected', true)
  }

  function refresh($btn) {
    if (editor.opts.fontSizeSelection) {
      let val = editor.helpers.getPX($(editor.selection.element()).css('font-size'))

      if (editor.opts.fontSizeUnit === 'pt') {
        val = `${Math.round(parseFloat(val, 10) * 72 / 96)}pt`
      }

      $btn.find('> span').text(val)
    }
  }

  return {
    apply: apply,
    refreshOnShow: refreshOnShow,
    refresh: refresh
  }
}

// Register the font size command.
FE.RegisterCommand('fontSize', {
  type: 'dropdown',
  title: 'Font Size',
  displaySelection: function (editor) {
    return editor.opts.fontSizeSelection
  },
  displaySelectionWidth: 30,
  defaultSelection: function (editor) {
    return editor.opts.fontSizeDefaultSelection
  },
  html: function () {
    let c = '<ul class="fr-dropdown-list" role="presentation">'
    const { fontSize : options } = this.opts

    for (let i = 0; i < options.length; i++) {
      const val = options[i]
      c += `<li role="presentation"><a class="fr-command" tabIndex="-1" role="option" data-cmd="fontSize" data-param1="${val}${this.opts.fontSizeUnit}" title="${val}">${val}</a></li>`
    }
    c += '</ul>'

    return c
  },
  callback: function (cmd, val) {
    this.fontSize.apply(val)
  },
  refresh: function ($btn) {
    this.fontSize.refresh($btn)
  },
  refreshOnShow: function ($btn, $dropdown) {
    this.fontSize.refreshOnShow($btn, $dropdown)
  },
  plugin: 'fontSize'
})

// Add the font size icon.
FE.DefineIcon('fontSize', {
  NAME: 'text-height',
  SVG_KEY: 'fontSize'
})
