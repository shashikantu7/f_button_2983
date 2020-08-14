import FE from '../index.js'
'use strict';

FE.PLUGINS.quote = function (editor) {

  const { $ } = editor

  function _deepestParent(node) {
    while (node.parentNode && node.parentNode != editor.el) {
      node = node.parentNode 
    }

    return node 
  }

  function _increase() {

    // Get blocks.
    const blocks = editor.selection.blocks() 
    let i 

    // Normalize blocks.
    for (i = 0; i < blocks.length; i++) {
      blocks[i] = _deepestParent(blocks[i]) 
    }

    // Save selection to restore it later.
    editor.selection.save() 

    const $quote = $(document.createElement('blockquote')) 
    $quote.insertBefore(blocks[0]) 

    for (i = 0; i < blocks.length; i++) {
      $quote.append(blocks[i]) 
    }

    // Unwrap temp divs.
    editor.html.unwrap() 

    editor.selection.restore() 
  }

  function _decrease() {

    // Get blocks.
    const blocks = editor.selection.blocks() 
    let i 

    for (i = 0; i < blocks.length; i++) {
      if (blocks[i].tagName != 'BLOCKQUOTE') {
        blocks[i] = $(blocks[i]).parentsUntil(editor.$el, 'BLOCKQUOTE').get(0) 
      }
    }

    editor.selection.save() 

    for (i = 0; i < blocks.length; i++) {
      if (blocks[i]) {
        $(blocks[i]).replaceWith(blocks[i].innerHTML) 
      }
    }

    // Unwrap temp divs.
    editor.html.unwrap() 

    editor.selection.restore() 
  }

  function apply(val) {

    // Wrap.
    editor.selection.save() 
    editor.html.wrap(true, true, true, true) 
    editor.selection.restore() 

    if (val == 'increase') {
      _increase() 
    }
    else if (val == 'decrease') {
      _decrease() 
    }


  }

  return {
    apply: apply
  }
}

// Register the quote command.
FE.RegisterShortcut(FE.KEYCODE.SINGLE_QUOTE, 'quote', 'increase', '\'') 
FE.RegisterShortcut(FE.KEYCODE.SINGLE_QUOTE, 'quote', 'decrease', '\'', true) 
FE.RegisterCommand('quote', {
  title: 'Quote',
  type: 'dropdown',
  html: function () {
    let c = '<ul class="fr-dropdown-list" role="presentation">' 
    const options = {
      increase: 'Increase',
      decrease: 'Decrease'
    } 

    for (const val in options) {
      if (options.hasOwnProperty(val)) {
        const shortcut = this.shortcuts.get(`quote.${val}`) 

        c += `<li role="presentation"><a class="fr-command fr-active ${val}" tabIndex="-1" role="option" data-cmd="quote" data-param1="${val}" title="${options[val]}">${this.language.translate(options[val])}${(shortcut ? `<span class="fr-shortcut">${shortcut}</span>`: '')}</a></li>`
      }
    }
    c += '</ul>' 

    return c 
  },
  callback: function (cmd, val) {
    this.quote.apply(val) 
  },
  plugin: 'quote'
})

// Add the quote icon.
FE.DefineIcon('quote', {
  NAME: 'quote-left',
  SVG_KEY: 'blockquote'
}) 
