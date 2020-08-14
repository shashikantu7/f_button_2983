import FE from '../index.js'
'use strict';

FE.PLUGINS.align = function (editor) {

  const { $ } =  editor

  function apply(val) {

    const el = editor.selection.element()

    if ($(el).parents('.fr-img-caption').length) {
      $(el).css('text-align', val)
    }
    else {
      // Wrap.
      editor.selection.save()
      editor.html.wrap(true, true, true, true)
      editor.selection.restore()

      const blocks = editor.selection.blocks()

      for (let i = 0; i < blocks.length; i++) {

        // https://github.com/froala-labs/froala-editor-js-2/issues/674

        $(blocks[i]).css('text-align', val).removeClass('fr-temp-div')

        if ($(blocks[i]).attr('class') === '') $(blocks[i]).removeAttr('class')

        if ($(blocks[i]).attr('style') === '') $(blocks[i]).removeAttr('style')
      }

      editor.selection.save()
      editor.html.unwrap()
      editor.selection.restore()
    }
  }

  function refresh($btn) {
    const blocks = editor.selection.blocks()

    if (blocks.length) {
      const alignment = editor.helpers.getAlignment($(blocks[0]))

      $btn.find('> *').first().replaceWith(editor.icon.create(`align-${alignment}`))
    }
  }

  function refreshOnShow($btn, $dropdown) {
    const blocks = editor.selection.blocks()

    if (blocks.length) {
      const alignment = editor.helpers.getAlignment($(blocks[0]))

      $dropdown.find(`a.fr-command[data-param1="${alignment}"]`).addClass('fr-active').attr('aria-selected', true)
    }
  }

  function refreshForToolbar($btn) {
    const blocks = editor.selection.blocks()

    if (blocks.length) {
      let alignment = editor.helpers.getAlignment($(blocks[0]))

      // Capitalize.
      alignment = alignment.charAt(0).toUpperCase() + alignment.slice(1)

      if (`align${alignment}` === $btn.attr('data-cmd')) {
        $btn.addClass('fr-active')
      }
    }
  }

  return {
    apply: apply,
    refresh: refresh,
    refreshOnShow: refreshOnShow,
    refreshForToolbar: refreshForToolbar
  }
}

FE.DefineIcon('align', { NAME: 'align-left', SVG_KEY: 'alignLeft' })
FE.DefineIcon('align-left', { NAME: 'align-left', SVG_KEY: 'alignLeft' })
FE.DefineIcon('align-right', { NAME: 'align-right', SVG_KEY: 'alignRight' })
FE.DefineIcon('align-center', { NAME: 'align-center', SVG_KEY: 'alignCenter' })
FE.DefineIcon('align-justify', { NAME: 'align-justify', SVG_KEY: 'alignJustify' })
FE.RegisterCommand('align', {
  type: 'dropdown',
  title: 'Align',
  options: {
    left: 'Align Left',
    center: 'Align Center',
    right: 'Align Right',
    justify: 'Align Justify'
  },
  html: function () {
    let c = '<ul class="fr-dropdown-list" role="presentation">'
    const { options } = FE.COMMANDS.align

    for (const val in options) {
      if (options.hasOwnProperty(val)) {
        c += `<li role="presentation"><a class="fr-command fr-title" tabIndex="-1" role="option" data-cmd="align"data-param1="
        ${val}" title="${this.language.translate(options[val])}">${this.icon.create(`align-${val}`)}<span class="fr-sr-only">
        ${this.language.translate(options[val])}</span></a></li>`
      }
    }
    c += '</ul>'

    return c
  },
  callback: function (cmd, val) {
    this.align.apply(val)
  },
  refresh: function ($btn) {
    this.align.refresh($btn)
  },
  refreshOnShow: function ($btn, $dropdown) {
    this.align.refreshOnShow($btn, $dropdown)
  },
  plugin: 'align'
})

FE.RegisterCommand('alignLeft', {
  type: 'button',
  icon: 'align-left',
  title: 'Align Left',
  callback: function () {
    this.align.apply('left')
  },
  refresh: function ($btn) {
    this.align.refreshForToolbar($btn)
  },
  plugin: 'align'
})

FE.RegisterCommand('alignRight', {
  type: 'button',
  icon: 'align-right',
  title: 'Align Right',
  callback: function () {
    this.align.apply('right')
  },
  refresh: function ($btn) {
    this.align.refreshForToolbar($btn)
  },
  plugin: 'align'
})

FE.RegisterCommand('alignCenter', {
  type: 'button',
  icon: 'align-center',
  title: 'Align Center',
  callback: function () {
    this.align.apply('center')
  },
  refresh: function ($btn) {
    this.align.refreshForToolbar($btn)
  },
  plugin: 'align'
})

FE.RegisterCommand('alignJustify', {
  type: 'button',
  icon: 'align-justify',
  title: 'Align Justify',
  callback: function () {
    this.align.apply('justify')
  },
  refresh: function ($btn) {
    this.align.refreshForToolbar($btn)
  },
  plugin: 'align'
})
