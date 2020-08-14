import FE from '../index.js'
'use strict';

Object.assign(FE.DEFAULTS, {
  inlineClasses: {
    'fr-class-code': 'Code',
    'fr-class-highlighted': 'Highlighted',
    'fr-class-transparency': 'Transparent'
  }
})

FE.PLUGINS.inlineClass = function (editor) {
  const { $ } = editor
  function apply(val) {
    editor.format.toggle('span', { 'class': val })
  }

  function refreshOnShow($btn, $dropdown) {
    $dropdown.find('.fr-command').each(function () {
      const val = $(this).data('param1')
      const active = editor.format.is('span', { 'class': val })
      $(this).toggleClass('fr-active', active).attr('aria-selected', active)
    })
  }

  return {
    apply: apply,
    refreshOnShow: refreshOnShow
  }
}

// Register the inlineClass size command.
FE.RegisterCommand('inlineClass', {
  type: 'dropdown',
  title: 'Inline Class',
  html: function () {
    let c = '<ul class="fr-dropdown-list" role="presentation">'
    const { inlineClasses : options } = this.opts

    for (const val in options) {
      if (options.hasOwnProperty(val)) {
        c += `<li role="presentation"><a class="fr-command" tabIndex="-1" role="option" data-cmd="inlineClass" data-param1="${val}" title="${options[val]}">${options[val]}</a></li>`
      }
    }
    c += '</ul>'

    return c
  },
  callback: function (cmd, val) {
    this.inlineClass.apply(val)
  },
  refreshOnShow: function ($btn, $dropdown) {
    this.inlineClass.refreshOnShow($btn, $dropdown)
  },
  plugin: 'inlineClass'
})

// Add the inlineClass icon.
FE.DefineIcon('inlineClass', {
  NAME: 'tag',
  SVG_KEY: 'inlineClass'
})
