import './core/clean.js'
import './core/commands.js'
import './core/cursor_lists.js'
import './core/cursor.js'
import './core/data.js'
import './core/edit.js'
import './core/events.js'
import './core/format.js'
import './core/helpers.js'
import './core/html.js'
import './core/keys.js'
import './core/paste.js'
import './core/shortcuts.js'
import './core/snapshot.js'
import './core/undo.js'
import './core/dom/markers.js'
import './core/dom/node.js'
import './core/dom/selection.js'
import './core/dom/spaces.js'
import './core/options/language.js'
import './core/options/size.js'

import FE from '../editor.js'

// Extend defaults.
Object.assign(FE.DEFAULTS, {
  documentReady: false,
  editorClass: null,
  typingTimer: 500,
  iframe: false,
  requestWithCORS: true,
  requestWithCredentials: false,
  requestHeaders: {},
  useClasses: true,
  spellcheck: true,
  iframeDefaultStyle: 'html{margin:0px;height:auto;}body{height:auto;padding:20px;background:transparent;color:#000000;position:relative;z-index: 2;-webkit-user-select:auto;margin:0px;overflow:hidden;min-height:20px;}body:after{content:"";display:block;clear:both;}body::-moz-selection{background:#b5d6fd;color:#000;}body::selection{background:#b5d6fd;color:#000;}',
  iframeStyle: '',
  iframeStyleFiles: [],
  direction: 'auto',
  zIndex: 1,
  tabIndex: null,
  disableRightClick: false,
  scrollableContainer: 'body',
  keepFormatOnDelete: false,
  theme: null
})

FE.MODULES.core = function (editor) {
  const $ = editor.$

  function injectStyle(style) {
    if (editor.opts.iframe) {
      editor.$head.find('style[data-fr-style], link[data-fr-style]').remove()
      editor.$head.append(`<style data-fr-style="true">${style}</style>`)

      for (let i = 0; i < editor.opts.iframeStyleFiles.length; i++) {
        const $link = $(`<link data-fr-style="true" rel="stylesheet" href="${editor.opts.iframeStyleFiles[i]}">`)

        // Listen to the load event in order to sync iframe.
        $link.get(0).addEventListener('load', editor.size.syncIframe)

        // Append to the head.
        editor.$head.append($link)
      }
    }
  }

  function _initElementStyle() {
    if (!editor.opts.iframe) {
      editor.$el.addClass('fr-element fr-view')
    }
  }

  /**
   * Init the editor style.
   */

  function _initStyle() {
    editor.$box.addClass(`fr-box${editor.opts.editorClass ? ` ${editor.opts.editorClass}` : ''}`)
    editor.$box.attr('role', 'application')
    editor.$wp.addClass('fr-wrapper')

    if (editor.opts.documentReady) {
      editor.$box.addClass('fr-document');
    }

    _initElementStyle()

    if (editor.opts.iframe) {
      editor.$iframe.addClass('fr-iframe')
      editor.$el.addClass('fr-view')

      for (let i = 0; i < editor.o_doc.styleSheets.length; i++) {
        let rules

        try {
          rules = editor.o_doc.styleSheets[i].cssRules
        }
        catch (ex) {
          // ok.
        }

        if (rules) {
          for (let idx = 0, len = rules.length; idx < len; idx++) {
            if (rules[idx].selectorText && (rules[idx].selectorText.indexOf('.fr-view') === 0 || rules[idx].selectorText.indexOf('.fr-element') === 0)) {
              if (rules[idx].style.cssText.length > 0) {
                if (rules[idx].selectorText.indexOf('.fr-view') === 0) {
                  editor.opts.iframeStyle += `${rules[idx].selectorText.replace(/\.fr-view/g, 'body')}{${rules[idx].style.cssText}}`
                }
                else {
                  editor.opts.iframeStyle += `${rules[idx].selectorText.replace(/\.fr-element/g, 'body')}{${rules[idx].style.cssText}}`
                }
              }
            }
          }
        }
      }
    }

    if (editor.opts.direction !== 'auto') {
      editor.$box.removeClass('fr-ltr fr-rtl').addClass(`fr-${editor.opts.direction}`)
    }
    editor.$el.attr('dir', editor.opts.direction)
    editor.$wp.attr('dir', editor.opts.direction)

    if (editor.opts.zIndex > 1) {
      editor.$box.css('z-index', editor.opts.zIndex)
    }

    if (editor.opts.theme) {
      editor.$box.addClass(`${editor.opts.theme}-theme`)
    }

    // Set tabIndex option.
    editor.opts.tabIndex = editor.opts.tabIndex || editor.$oel.attr('tabIndex')

    if (editor.opts.tabIndex) {
      editor.$el.attr('tabIndex', editor.opts.tabIndex)
    }
  }

  /**
   * Determine if the editor is empty.
   */

  function isEmpty() {
    return editor.node.isEmpty(editor.el)
  }

  /**
   * Check if the browser allows drag and init it.
   */

  function _initDrag() {

    // Drag and drop support.
    editor.drag_support = {
      filereader: typeof FileReader !== 'undefined',
      formdata: Boolean(editor.win.FormData),
      progress: 'upload' in new XMLHttpRequest()
    }
  }

  /**
   * Return an XHR object.
   */

  function getXHR(url, method) {
    const xhr = new XMLHttpRequest()

    // Make it async.
    xhr.open(method, url, true)

    // Set with credentials.
    if (editor.opts.requestWithCredentials) {
      xhr.withCredentials = true
    }

    // Set headers.
    for (const header in editor.opts.requestHeaders) {
      if (Object.prototype.hasOwnProperty.call(editor.opts.requestHeaders, header)) {
        xhr.setRequestHeader(header, editor.opts.requestHeaders[header])
      }
    }

    return xhr
  }

  function _destroy(html) {
    if (editor.$oel.get(0).tagName === 'TEXTAREA') {
      editor.$oel.val(html)
    }

    if (editor.$box) {
      editor.$box.removeAttr('role')
    }

    if (editor.$wp) {
      if (editor.$oel.get(0).tagName === 'TEXTAREA') {
        editor.$el.html('')
        editor.$wp.html('')
        editor.$box.replaceWith(editor.$oel)
        editor.$oel.show()
      }
      else {
        editor.$wp.replaceWith(html)
        editor.$el.html('')
        editor.$box.removeClass(`fr-view fr-ltr fr-box ${editor.opts.editorClass || ''}`)

        if (editor.opts.theme) {
          editor.$box.addClass(`${editor.opts.theme}-theme`)
        }
      }
    }

    this.$wp = null
    this.$el = null
    this.el = null
    this.$box = null
  }

  function hasFocus() {
    if (editor.browser.mozilla && editor.helpers.isMobile()) {
      return editor.selection.inEditor()
    }

    return editor.node.hasFocus(editor.el) || editor.$el.find('*:focus').length > 0
  }

  function sameInstance($obj) {
    if (!$obj) {
      return false
    }

    const inst = $obj.data('instance')

    return inst ? inst.id === editor.id : false
  }

  /**
   * Tear up.
   */

  function _init() {
    FE.INSTANCES.push(editor)

    _initDrag()

    // Call initialization methods.
    if (editor.$wp) {
      _initStyle()
      editor.html.set(editor._original_html)

      // Set spellcheck.
      editor.$el.attr('spellcheck', editor.opts.spellcheck)

      // Disable autocomplete.
      if (editor.helpers.isMobile()) {
        editor.$el.attr('autocomplete', editor.opts.spellcheck ? 'on' : 'off')
        editor.$el.attr('autocorrect', editor.opts.spellcheck ? 'on' : 'off')
        editor.$el.attr('autocapitalize', editor.opts.spellcheck ? 'on' : 'off')
      }

      // Disable right click.
      if (editor.opts.disableRightClick) {
        editor.events.$on(editor.$el, 'contextmenu', (e) => {
          if (e.button === 2) {

            // https://github.com/froala-labs/froala-editor-js-2/issues/2150
            e.preventDefault()
            e.stopPropagation()
            
            return false
          }
        })
      }

      try {
        editor.doc.execCommand('styleWithCSS', false, false)
      }
      catch (ex) {
        // ok.
      }
    }

    if (editor.$oel.get(0).tagName === 'TEXTAREA') {

      // Sync on contentChanged.
      editor.events.on('contentChanged', () => {
        editor.$oel.val(editor.html.get())
      })

      // Set HTML on form submit.
      editor.events.on('form.submit', () => {
        editor.$oel.val(editor.html.get())
      })

      editor.events.on('form.reset', () => {
        editor.html.set(editor._original_html)
      })

      editor.$oel.val(editor.html.get())
    }

    // iOS focus fix.
    if (editor.helpers.isIOS()) {
      editor.events.$on(editor.$doc, 'selectionchange', () => {
        if (!editor.$doc.get(0).hasFocus()) {
          editor.$win.get(0).focus()
        }
      })
    }

    editor.events.trigger('init')

    // Autofocus.
    if (editor.opts.autofocus && !editor.opts.initOnClick && editor.$wp) {
      editor.events.on('initialized', () => {
        editor.events.focus(true)
      })
    }
  }

  return {
    _init,
    destroy: _destroy,
    isEmpty,
    getXHR,
    injectStyle,
    hasFocus,
    sameInstance
  }
}
