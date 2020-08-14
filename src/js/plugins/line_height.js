import FE from '../index.js'
'use strict';

Object.assign(FE.DEFAULTS, {
  lineHeights: {
    Default: '',
    Single: '1',
    '1.15': '1.15',
    '1.5': '1.5',
    Double: '2'
  }
})

FE.PLUGINS.lineHeight = function (editor) {
  const { $ } = editor
  /**
   * Apply style.
   */
  function apply(val) {
    editor.selection.save() 
    editor.html.wrap(true, true, true, true) 
    editor.selection.restore() 

    const blocks = editor.selection.blocks() 

    if (blocks.length && $(blocks[0]).parent().is('td')) {
      editor.format.applyStyle('line-height', val.toString())
    }

    // Save selection to restore it later.
    editor.selection.save() 

    for (let i = 0; i < blocks.length; i++) {
      $(blocks[i]).css('line-height', val)

      if ($(blocks[i]).attr('style') === '') {
        $(blocks[i]).removeAttr('style') 
      }
    }

    // Unwrap temp divs.
    editor.html.unwrap() 

    // Restore selection.
    editor.selection.restore() 
  }

  function refreshOnShow($btn, $dropdown) {
    const blocks = editor.selection.blocks() 

    if (blocks.length) {
      const $blk = $(blocks[0]) 

      $dropdown.find('.fr-command').each(function () {
        const lineH = $(this).data('param1')
        const blkStyle = $blk.attr('style')
        let active = (blkStyle || '').indexOf('line-height: ' + lineH + ';') >= 0
        
        // Check if style contains line-height property, when text is pasted from other sources
        // If not make `default` text selected
        if (blkStyle) {
          const lineStyle = blkStyle.substring(blkStyle.indexOf('line-height'))
          const value  = lineStyle.substr(0, lineStyle.indexOf(';'))

          // get value of line-height
          const lineHeight = value && value.split(':')[1]

          if ((!lineHeight || !lineHeight.length) && $blk.text() === 'Default') {
            active = true
          }
        }

        // keep `default` text selected always
        if((!blkStyle || blkStyle.indexOf('line-height') === -1) && lineH === '') {
          active = true
        }

        $(this).toggleClass('fr-active', active).attr('aria-selected', active) 
      })
    }
  }

  const _init = () => {
  }

  return {
    _init: _init,
    apply: apply,
    refreshOnShow: refreshOnShow
  }
}

// Register the font size command.
FE.RegisterCommand('lineHeight', {
  type: 'dropdown',
  html: function () {
    let c = '<ul class="fr-dropdown-list" role="presentation">' 
    const { lineHeights : options } = this.opts 

    for (const val in options) {
      if (options.hasOwnProperty(val)) {
        c += `<li role="presentation"><a class="fr-command ${val}" tabIndex="-1" role="option" data-cmd="lineHeight" data-param1="${options[val]}" title="${this.language.translate(val)}">${this.language.translate(val)}</a></li>` 
      }
    }
    c += '</ul>' 

    return c 
  },
  title: 'Line Height',
  callback: function (cmd, val) {
    this.lineHeight.apply(val) 
  },
  refreshOnShow: function ($btn, $dropdown) {
    this.lineHeight.refreshOnShow($btn, $dropdown) 
  },
  plugin: 'lineHeight'
})

// Add the font size icon.
FE.DefineIcon('lineHeight', {
  NAME: 'arrows-v',
  FA5NAME: 'arrows-alt-v',
  SVG_KEY: 'lineHeight'
}) 
