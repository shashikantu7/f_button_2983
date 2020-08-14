import FE from '../../../editor.js'

// Extend defaults.
Object.assign(FE.DEFAULTS, {
  height: null,
  heightMax: null,
  heightMin: null,
  width: null
})

FE.MODULES.size = function (editor) {

  function syncIframe() {
    refresh()

    if (editor.opts.height) {
      editor.$el.css('minHeight', editor.opts.height - editor.helpers.getPX(editor.$el.css('padding-top')) - editor.helpers.getPX(editor.$el.css('padding-bottom')))
    }

    editor.$iframe.height(editor.$el.outerHeight(true))
  }

  function refresh() {
    if (editor.opts.heightMin) {
      editor.$el.css('minHeight', editor.opts.heightMin)
    }
    else {
      editor.$el.css('minHeight', '')
    }

    if (editor.opts.heightMax) {
      editor.$wp.css('maxHeight', editor.opts.heightMax)
      editor.$wp.css('overflow', 'auto')
    }
    else {
      editor.$wp.css('maxHeight', '')
      editor.$wp.css('overflow', '')
    }

    // Set height.
    if (editor.opts.height) {
      editor.$wp.css('height', editor.opts.height)
      editor.$wp.css('overflow', 'auto')
      editor.$el.css('minHeight', editor.opts.height - editor.helpers.getPX(editor.$el.css('padding-top')) - editor.helpers.getPX(editor.$el.css('padding-bottom')))
    }
    else {
      editor.$wp.css('height', '')

      if (!editor.opts.heightMin) {
        editor.$el.css('minHeight', '')
      }

      if (!editor.opts.heightMax) {
        editor.$wp.css('overflow', '')
      }
    }

    if (editor.opts.width) {
      editor.$box.width(editor.opts.width)
    }
  }

  function _init() {
    if (!editor.$wp) {
      return false
    }

    refresh()

    // Sync iframe height.
    if (editor.$iframe) {
      editor.events.on('keyup keydown', () => {
        setTimeout(syncIframe, 0)
      }, true)

      editor.events.on('commands.after html.set init initialized paste.after', syncIframe)
    }
  }

  return {
    _init,
    syncIframe,
    refresh
  }
}
