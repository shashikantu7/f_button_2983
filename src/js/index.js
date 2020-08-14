import './modules/core.js';
import './modules/ui.js';

import $ from './$.js'
import FroalaEditor from './editor'
const FE = FroalaEditor

function init(e) {
  if (e.type === 'touchend' && !this.$el.data('touched')) {
    return true
  }

  if (e.which === 1 || !e.which) {
    this.$el.off('mousedown.init touchstart.init touchmove.init touchend.init dragenter.init focus.init')

    this.load(FE.MODULES)
    this.load(FE.PLUGINS)

    const target = e.originalEvent && e.originalEvent.originalTarget

    if (target && target.tagName === 'IMG') {
      $(target).trigger('mousedown')
    }

    if (typeof this.ul === 'undefined') {
      this.destroy()
    }

    if (e.type === 'touchend' && this.image && e.originalEvent && e.originalEvent.target && $(e.originalEvent.target).is('img')) {
      const that = this

      setTimeout(() => {
        that.image.edit($(e.originalEvent.target))
      }, 100)
    }

    this.ready = true
    this.events.trigger('initialized')
  }
}

function doInit() {
  this.doc = this.$el.get(0).ownerDocument
  this.win = 'defaultView' in this.doc ? this.doc.defaultView : this.doc.parentWindow
  this.$doc = $(this.doc)
  this.$win = $(this.win)

  if (!this.opts.pluginsEnabled) {
    this.opts.pluginsEnabled = Object.keys(FE.PLUGINS)
  }

  if (this.opts.initOnClick) {
    this.load(FE.MODULES)

    // https://github.com/froala/wysiwyg-editor/issues/1207.
    this.$el.on('touchstart.init', function () {
      $(this).data('touched', true)
    })

    this.$el.on('touchmove.init', function () {
      $(this).removeData('touched')
    })

    this.$el.on('mousedown.init touchend.init dragenter.init focus.init', init.bind(this))

    this.events.trigger('initializationDelayed')
  }
  else {
    this.load(FE.MODULES)
    this.load(FE.PLUGINS)

    $(this.o_win).scrollTop(this.c_scroll)

    if (typeof this.ul === 'undefined') {
      this.destroy()
    }

    this.ready = true
    this.events.trigger('initialized')
  }
}

FE.Bootstrap = function (element, options, initCallback) {
  this.id = ++FE.ID
  this.$ = $

  let presets = {}

  // If init callback is passed and no options.
  if (typeof options == 'function') {
    initCallback = options
    options = {}
  }

  if (initCallback) {
    if (!options.events) options.events = {}
    options.events.initialized = initCallback
  }

  if (options && options.documentReady) {
    presets.toolbarButtons = [ ['fullscreen', 'undo', 'redo', 'getPDF', 'print'], ['bold', 'italic', 'underline', 'textColor', 'backgroundColor', 'clearFormatting'], ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify'], ['formatOL', 'formatUL', 'indent', 'outdent'], ['paragraphFormat'], ['fontFamily'], ['fontSize'], ['insertLink', 'insertImage', 'quote'] ]
    presets.paragraphFormatSelection = true
    presets.fontFamilySelection = true
    presets.fontSizeSelection = true
    presets.placeholderText = ''
    presets.quickInsertEnabled = false
    presets.charCounterCount = false
  }

  this.opts = Object.assign({}, Object.assign({}, FE.DEFAULTS, presets, typeof options === 'object' && options))
  const opts_string = JSON.stringify(this.opts)

  FE.OPTS_MAPPING[opts_string] = FE.OPTS_MAPPING[opts_string] || this.id
  this.sid = FE.OPTS_MAPPING[opts_string]
  FE.SHARED[this.sid] = FE.SHARED[this.sid] || {}
  this.shared = FE.SHARED[this.sid]
  this.shared.count = (this.shared.count || 0) + 1

  this.$oel = $(element)
  this.$oel.data('froala.editor', this)

  this.o_doc = element.ownerDocument
  this.o_win = 'defaultView' in this.o_doc ? this.o_doc.defaultView : this.o_doc.parentWindow
  this.c_scroll = $(this.o_win).scrollTop()

  this._init()
}

FE.Bootstrap.prototype._init = function () {

  // Get the tag name of the original element.
  const tag_name = this.$oel.get(0).tagName

  if (this.$oel.closest('label').length >= 1) {
    //
    console.warn('Note! It is not recommended to initialize the Froala Editor within a label tag.')
  }

  const initOnDefault = function () {
    if (tag_name !== 'TEXTAREA') {
      this._original_html = this._original_html || this.$oel.html()
    }

    this.$box = this.$box || this.$oel

    // Turn on iframe if fullPage is on.
    if (this.opts.fullPage) {
      this.opts.iframe = true
    }

    if (!this.opts.iframe) {
      this.$el = $(this.o_doc.createElement('DIV'))
      this.el = this.$el.get(0)
      this.$wp = $(this.o_doc.createElement('DIV')).append(this.$el)
      this.$box.html(this.$wp)

      setTimeout(doInit.bind(this), 0)
    }
    else {
      this.$iframe = $('<iframe src="about:blank" frameBorder="0">')
      this.$wp = $('<div></div>')
      this.$box.html(this.$wp)
      this.$wp.append(this.$iframe)
      this.$iframe.get(0).contentWindow.document.open()
      this.$iframe.get(0).contentWindow.document.write('<!DOCTYPE html>')
      this.$iframe.get(0).contentWindow.document.write('<html><head></head><body></body></html>')
      this.$iframe.get(0).contentWindow.document.close()

      this.iframe_document = this.$iframe.get(0).contentWindow.document

      this.$el = $(this.iframe_document.querySelector('body'))
      this.el = this.$el.get(0)
      this.$head = $(this.iframe_document.querySelector('head'))
      this.$html = $(this.iframe_document.querySelector('html'))

      setTimeout(doInit.bind(this), 0)
    }
  }.bind(this)

  const initOnTextarea = function () {
    this.$box = $('<div>')
    this.$oel.before(this.$box).hide()

    this._original_html = this.$oel.val()

    // Before submit textarea do a sync.
    const that = this

    this.$oel.parents('form').on(`submit.${this.id}`, () => {
      that.events.trigger('form.submit')
    })

    this.$oel.parents('form').on(`reset.${this.id}`, () => {
      that.events.trigger('form.reset')
    })

    initOnDefault()
  }.bind(this)

  const initOnA = function () {
    this.$el = this.$oel
    this.el = this.$el.get(0)
    this.$el.attr('contenteditable', true).css('outline', 'none').css('display', 'inline-block')
    this.opts.multiLine = false
    this.opts.toolbarInline = false

    setTimeout(doInit.bind(this), 0)
  }.bind(this)

  const initOnImg = function () {
    this.$el = this.$oel
    this.el = this.$el.get(0)
    this.opts.toolbarInline = false

    setTimeout(doInit.bind(this), 0)
  }.bind(this)

  const editInPopup = function () {
    this.$el = this.$oel
    this.el = this.$el.get(0)
    this.opts.toolbarInline = false

    this.$oel.on('click.popup', (e) => {
      e.preventDefault()
    })

    setTimeout(doInit.bind(this), 0)
  }.bind(this)

  // Check on what element it was initialized.
  if (this.opts.editInPopup) {
    editInPopup()
  }
  else if (tag_name === 'TEXTAREA') {
    initOnTextarea()
  }
  else if (tag_name === 'A') {
    initOnA()
  }
  else if (tag_name === 'IMG') {
    initOnImg()
  }
  else if (tag_name === 'BUTTON' || tag_name === 'INPUT') {
    this.opts.editInPopup = true
    this.opts.toolbarInline = false
    editInPopup()
  }
  else {
    initOnDefault()
  }
}

FE.Bootstrap.prototype.load = function (module_list) {
  // Bind modules to the current instance and tear them up.
  for (const m_name in module_list) {
    if (Object.prototype.hasOwnProperty.call(module_list, m_name)) {
      if (this[m_name]) {
        continue
      }

      // Do not include plugin.
      if (FE.PLUGINS[m_name] && this.opts.pluginsEnabled.indexOf(m_name) < 0) {
        continue
      }

      this[m_name] = new module_list[m_name](this)

      if (this[m_name]._init) {
        this[m_name]._init()

        if (this.opts.initOnClick && m_name === 'core') {

          return false
        }
      }
    }
  }
}

FE.Bootstrap.prototype.destroy = function () {
  this.destrying = true

  this.shared.count--

  this.events && this.events.$off()

  // HTML.
  const html = this.html && this.html.get()

  // Focus main frame.
  if (this.opts.iframe) {
    this.events.disableBlur()
    this.win.focus()
    this.events.enableBlur()
  }

  if(this.events) {
    this.events.trigger('destroy', [], true)
    this.events.trigger('shared.destroy', [], true)
  }

  // Remove shared.
  if (this.shared.count === 0) {
    for (const k in this.shared) {
      if (Object.prototype.hasOwnProperty.call(this.shared, k)) {
        this.shared[k] = null
        FE.SHARED[this.sid][k] = null
      }
    }

    delete FE.SHARED[this.sid]
  }

  this.$oel.parents('form').off(`.${this.id}`)
  this.$oel.off('click.popup')
  this.$oel.removeData('froala.editor')

  this.$oel.off('froalaEditor')

  // Destroy editor basic elements.
  if (this.core) {
    this.core.destroy(html)
  }

  FE.INSTANCES.splice(FE.INSTANCES.indexOf(this), 1)
}

export default FroalaEditor