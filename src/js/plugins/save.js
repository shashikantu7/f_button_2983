import FE from '../index.js'
'use strict';

Object.assign(FE.DEFAULTS, {
  saveInterval: 10000,
  saveURL: null,
  saveParams: {},
  saveParam: 'body',
  saveMethod: 'POST'
})

FE.PLUGINS.save = function (editor) {
  const { $ } = editor
  let _timeout = null
  let _last_html = null
  let _force = false

  const BAD_LINK = 1
  const ERROR_ON_SERVER = 2

  const error_messages = {}
  error_messages[BAD_LINK] = 'Missing saveURL option.'
  error_messages[ERROR_ON_SERVER] = 'Something went wrong during save.'

  /**
   * Throw an image error.
   */
  function _throwError(code, response) {
    editor.events.trigger('save.error', [{
      code: code,
      message: error_messages[code]
    }, response])
  }

  function save(html) {
    if (typeof html == 'undefined') html = editor.html.get()

    const original_html = html

    // Trigger before save event.
    const event_returned_value = editor.events.trigger('save.before', [html])

    if (event_returned_value === false) return false
    else if (typeof event_returned_value == 'string') html = event_returned_value

    if (editor.opts.saveURL) {
      const params = {}

      for (const key in editor.opts.saveParams) {
        if (editor.opts.saveParams.hasOwnProperty(key)) {
          const param = editor.opts.saveParams[key]

          if (typeof (param) == 'function') {
            params[key] = param.call(this)
          }
          else {
            params[key] = param
          }
        }
      }

      const dt = {}
      dt[editor.opts.saveParam] = html

      // Make request to save
      $(this).ajax({
        method: editor.opts.saveMethod,
        url: editor.opts.saveURL,
        data: Object.assign(dt, params),
        crossDomain: editor.opts.requestWithCORS,
        withCredentials: editor.opts.requestWithCredentials,
        headers: editor.opts.requestHeaders,
        done: function (data, status, xhr) {
          _last_html = original_html

          // data
          editor.events.trigger('save.after', [data])
        },
        fail: function (xhr) {
          // (error)
          _throwError(ERROR_ON_SERVER, xhr.response || xhr.responseText)
        }
      })
      
    }
    else {

      // (error)
      _throwError(BAD_LINK)
    }
  }

  function _mightSave() {
    clearTimeout(_timeout)

    // Added 0 seconds as to get the timeoutid so that for if there is another request the previous pending request will get cleared out. 
    _timeout = setTimeout(function () {
      const html = editor.html.get()

      if (_last_html != html || _force) {
        _last_html = html
        _force = false

        save(html)
      }
    }, 0)
  }

  /**
   * Reset the saving interval.
   */
  function reset() {
    _mightSave()
    _force = false
  }

  /**
   * Force saving at the end of the current interval.
   */
  function force() {
    _force = true
  }

  /*
   * Initialize.
   */
  function _init() {
    if(editor.opts.letteringClass)
    {
      let selectionClass = editor.opts.letteringClass
      let length = editor.$el.find(`.${selectionClass}`).length
      for( let i = 0; i < length; i++){
        editor.$el.find(`.${selectionClass}`)[i].innerHTML = editor.$el.find(`.${selectionClass}`)[i].innerText.replace(/([\w'-]+|[?.",])/g, `<span class = 'fr-word-select'>$1</span>`)
      }
    }
    if (editor.opts.saveInterval) {
      _last_html = editor.html.get()
      editor.events.on('contentChanged', function () {
        // Added timeinterval which user has entered else default will be 10000ms. 
        setTimeout(_mightSave, editor.opts.saveInterval)
      })
      editor.events.on('keydown destroy', function () {
        clearTimeout(_timeout)
      })
    }
  }

  return {
    _init: _init,
    save: save,
    reset: reset,
    force: force
  }
}

FE.DefineIcon('save', {
  NAME: 'floppy-o',
  FA5NAME: 'save'
})
FE.RegisterCommand('save', {
  title: 'Save',
  undo: false,
  focus: false,
  refreshAfterCallback: false,
  callback: function () {
    this.save.save()
  },
  plugin: 'save'
}) 
