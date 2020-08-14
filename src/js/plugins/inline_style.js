import FE from '../index.js'
'use strict';

Object.assign(FE.DEFAULTS, {
  inlineStyles: {
    'Big Red': 'font-size: 20px; color: red;',
    'Small Blue': 'font-size: 14px; color: blue;'
  }
})

FE.PLUGINS.inlineStyle = function (editor) {
  function apply(val) {
    // https://github.com/froala-labs/froala-editor-js-2/issues/1934
    const splits = val.split(';')

    for (let i = 0; i < splits.length; i++) {
      const new_split = splits[i].split(':')

      if (splits[i].length && new_split.length == 2) {
        editor.format.applyStyle(new_split[0].trim(), new_split[1].trim())
      }
    }
  }

  return {
    apply: apply
  }
}

// Register the inline style command.
FE.RegisterCommand('inlineStyle', {
  type: 'dropdown',
  html: function () {
    let c = '<ul class="fr-dropdown-list" role="presentation">'
    const options = this.opts.inlineStyles

    for (const val in options) {
      if (options.hasOwnProperty(val)) {
        const inlineStyle = options[val] + (options[val].indexOf('display:block;') === -1 ? ' display:block;' : '')
        c += `<li role="presentation"><span style="${inlineStyle}" role="presentation"><a class="fr-command" tabIndex="-1" role="option" data-cmd="inlineStyle" data-param1="${options[val]}" title="${this.language.translate(val)}">${this.language.translate(val)}</a></span></li>`
      }
    }
    c += '</ul>'

    return c
  },
  title: 'Inline Style',
  callback: function (cmd, val) {
    this.inlineStyle.apply(val)
  },
  plugin: 'inlineStyle'
})

// Add the font size icon.
FE.DefineIcon('inlineStyle', {
  NAME: 'paint-brush',
  SVG_KEY: 'inlineStyle'
})
