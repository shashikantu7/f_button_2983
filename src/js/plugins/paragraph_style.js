import FE from '../index.js'
'use strict';

Object.assign(FE.DEFAULTS, {
  paragraphStyles: {
    'fr-text-gray': 'Gray',
    'fr-text-bordered': 'Bordered',
    'fr-text-spaced': 'Spaced',
    'fr-text-uppercase': 'Uppercase'
  },
  paragraphMultipleStyles: true
})

FE.PLUGINS.paragraphStyle = function (editor) {
  const { $ } = editor
  /**
   * Apply style.
   */
  function apply(val, paragraphStyles, paragraphMultipleStyles) {
    if (typeof paragraphStyles === 'undefined') paragraphStyles = editor.opts.paragraphStyles

    if (typeof paragraphMultipleStyles === 'undefined') paragraphMultipleStyles = editor.opts.paragraphMultipleStyles

    let styles = ''

    // Remove multiple styles.
    if (!paragraphMultipleStyles) {
      styles = Object.keys(paragraphStyles)
      styles.splice(styles.indexOf(val), 1)
      styles = styles.join(' ')
    }
    editor.selection.save()
    editor.html.wrap(true, true, true, true)
    editor.selection.restore()

    const blocks = editor.selection.blocks()

    // Save selection to restore it later.
    editor.selection.save()

    const hasClass = $(blocks[0]).hasClass(val)

    for (let i = 0; i < blocks.length; i++) {
      $(blocks[i]).removeClass(styles).toggleClass(val, !hasClass)

      if ($(blocks[i]).hasClass('fr-temp-div')) $(blocks[i]).removeClass('fr-temp-div')

      if ($(blocks[i]).attr('class') === '') $(blocks[i]).removeAttr('class')
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
        const cls = $(this).data('param1')
        const active = $blk.hasClass(cls)
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
FE.RegisterCommand('paragraphStyle', {
  type: 'dropdown',
  html: function () {
    let c = '<ul class="fr-dropdown-list" role="presentation">'
    const { paragraphStyles : options } = this.opts

    for (const val in options) {
      if (options.hasOwnProperty(val)) {
        c += `<li role="presentation"><a class="fr-command ${val}" tabIndex="-1" role="option" data-cmd="paragraphStyle" data-param1="${val}" title="${this.language.translate(options[val])}">${this.language.translate(options[val])}</a></li>`
      }
    }
    c += '</ul>'

    return c
  },
  title: 'Paragraph Style',
  callback: function (cmd, val) {
    this.paragraphStyle.apply(val)
  },
  refreshOnShow: function ($btn, $dropdown) {
    this.paragraphStyle.refreshOnShow($btn, $dropdown)
  },
  plugin: 'paragraphStyle'
})

// Add the font size icon.
FE.DefineIcon('paragraphStyle', {
  NAME: 'magic',
  SVG_KEY: 'paragraphStyle'
})
