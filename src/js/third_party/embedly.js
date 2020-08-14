import FE from '../index.js'

Object.assign(FE.POPUP_TEMPLATES, {
  'embedly.insert': '[_BUTTONS_][_URL_LAYER_]',
  'embedly.edit': '[_BUTTONS_]'
})

Object.assign(FE.DEFAULTS, {
  embedlyKey: null,
  embedlyInsertButtons: ['embedlyBack', '|'],
  embedlyEditButtons: ['embedlyRemove'],
  embedlyScriptPath: 'https://cdn.embedly.com/widgets/platform.js'
})

FE.PLUGINS.embedly = function (editor) {
  const $ = editor.$

  function _doInit(embedlyInitialized) {
    // Remove any fr-uploading / fr-error images.
    editor.events.on('html.processGet', _cleanOnGet)

    // https://github.com/froala-labs/froala-editor-js-2/issues/1994
    // set html after it is formatted by _cleanOnget method
    if(embedlyInitialized){
      editor.html._setHtml(editor.$el,editor.html.get())
    }

    editor.events.$on(editor.$el, 'click touchend', 'div.fr-embedly', _edit)

    editor.events.on('mousedown window.mousedown', _markExit)
    editor.events.on('window.touchmove', _unmarkExit)
    editor.events.on('mouseup window.mouseup', _exitEdit)

    editor.events.on('commands.mousedown', function ($btn) {
      if ($btn.parents('.fr-toolbar').length > 0) {
        _exitEdit()
      }
    })

    editor.events.on('blur video.hideResizer commands.undo commands.redo element.dropped', function () {
      _exitEdit(true)
    })

    editor.events.on('element.beforeDrop', function ($el) {
      if ($el.hasClass('fr-embedly')) {
        $el.html($el.attr('data-original-embed'))
        return $el
      }
    })

    editor.events.on('keydown', function (e) {
      const key_code = e.which

      if ($current_embed && (key_code == FE.KEYCODE.BACKSPACE || key_code == FE.KEYCODE.DELETE)) {
        e.preventDefault()
        remove()

        return false
      }

      if ($current_embed && key_code == FE.KEYCODE.ESC) {
        _exitEdit(true)
        e.preventDefault()

        return false
      }

      if ($current_embed && key_code != FE.KEYCODE.F10 && !editor.keys.isBrowserAction(e)) {
        e.preventDefault()

        return false
      }
    }, true)

    // ESC from accessibility.
    editor.events.on('toolbar.esc', function () {
      if ($current_embed) {
        editor.events.disableBlur()
        editor.events.focus()

        return false
      }
    }, true)

    // focusEditor from accessibility.
    editor.events.on('toolbar.focusEditor', function () {
      if ($current_embed) {

        return false
      }
    }, true)

    // Keep Embedly structure in undo stack.
    editor.events.on('snapshot.after', function (snapshot) {
      const div = editor.doc.createElement('div')
      div.innerHTML = snapshot.html
      _cleanOnGet(div)

      snapshot.html = div.innerHTML
    })

    // Update card size.
    if (editor.win.embedly) {
      editor.win.embedly('on', 'card.rendered', function (iframe) {
        _setEmbedlyCardsize(iframe)
      })

      editor.win.embedly('on', 'card.resize', function (iframe) {
        _setEmbedlyCardsize(iframe)
      })
    }

    _initInsertPopup(true)
  }

  function _init() {
    if (!editor.$wp) return false

    if (typeof embedly !== 'undefined') {
      _doInit(true)
    }
    else {
      if (!editor.shared.embedlyLoaded) {
        editor.shared.embedlyLoaded = true
        editor.shared.embedlyCallbacks = []
        editor.shared.embedlyCallbacks.push(_doInit)

        // Init SCAYT.
        const script = editor.doc.createElement('script')
        script.type = 'text/javascript'
        script.src = editor.opts.embedlyScriptPath
        script.innerText = ''
        script.onload = function () {
          /*global SCAYT */
          if (editor.shared.embedlyCallbacks) {
            for (let i = 0; i < editor.shared.embedlyCallbacks.length; i++) {
              editor.shared.embedlyCallbacks[i]()
            }
          }
        }

        editor.doc.getElementsByTagName('head')[0].appendChild(script)
      }
      else {
        editor.shared.embedlyCallbacks.push(_doInit)
      }
    }
  }

  function _setEmbedlyCardsize(iframe) {
    const $card = $(iframe)
    const $card_parent = $card.parents('.fr-embedly')

    $card_parent
      .attr('contenteditable', false)
      .attr('draggable', true)
      .addClass('fr-draggable')
      .css('height', $card.height())
      .addClass('fr-draggable')

    if (editor.opts.iframe) {
      editor.size.syncIframe()
    }
  }

  let $current_embed
  function _edit(e) {
    $current_embed = $(this)

    _repositionResizer()
    _showEditPopup()
  }

  function _normalize() {
    // Make it draggable.
    const els = editor.el.querySelectorAll('.fr-embedly')
    for (let i = 0; i < els.length; i++) {
      if (!editor.node.hasClass(els[i], 'fr-draggable')) {
        els[i].className += ' fr-draggable'
      }
      els[i].setAttribute('contenteditable', false)
      els[i].setAttribute('draggable', true)
    }
  }

  let $embedly_resizer
  let $overlay

  function _initEditPopup() {
    // embedly buttons.
    let embedly_buttons = ''

    if (editor.opts.embedlyEditButtons.length > 0) {
      embedly_buttons += `<div class="fr-buttons">
      ${editor.button.buildList(editor.opts.embedlyEditButtons)}
      </div>`

      const template = {
        buttons: embedly_buttons
      }

      const $popup = editor.popups.create('embedly.edit', template)

      editor.events.$on(editor.$wp, 'scroll.emebdly-edit', function () {
        if ($current_embed && editor.popups.isVisible('embedly.edit')) {

          editor.events.disableBlur()
          _editEmbed($current_embed)
        }
      })

      return $popup
    }

    return false
  }

  function _editEmbed($embed) {
    _edit.call($embed.get(0))
  }

  /**
   * Show the embedly edit popup.
   */
  function _showEditPopup() {
    let $popup = editor.popups.get('embedly.edit')

    if (!$popup) $popup = _initEditPopup()

    if ($popup) {
      editor.popups.setContainer('embedly.edit', editor.$sc)
      editor.popups.refresh('embedly.edit')

      let left = $current_embed.offset().left + $current_embed.outerWidth() / 2
      let top = $current_embed.offset().top + $current_embed.outerHeight()

      editor.popups.show('embedly.edit', left, top, $current_embed.outerHeight())
    }
  }

  function _initResizer() {
    let doc

    // No shared embedly resizer.
    if (!editor.shared.$embedly_resizer) {

      // Create shared embedly resizer.
      editor.shared.$embedly_resizer = $(document.createElement('div')).attr('class', 'fr-embedly-resizer')
      $embedly_resizer = editor.shared.$embedly_resizer

      // Bind mousedown event shared.
      editor.events.$on($embedly_resizer, 'mousedown', function (e) {
        e.stopPropagation()
      }, true)
    }
    else {
      $embedly_resizer = editor.shared.$embedly_resizer
      $overlay = editor.shared.$embedly_overlay

      editor.events.on('destroy', function () {
        $('body').first().append($embedly_resizer)
      }, true)
    }

    // Shared destroy.
    editor.events.on('shared.destroy', function () {
      $embedly_resizer.html('').removeData().remove()
      $embedly_resizer = null
    }, true)
  }

  /**
   * Reposition resizer.
   */
  function _repositionResizer() {
    if (!$embedly_resizer) {
      _initResizer()
    }

    (editor.$wp || editor.$sc).append($embedly_resizer)
    $embedly_resizer.data('instance', editor)

    let iframePaddingLeft = 0
    let iframePaddingTop = 0
    if (editor.opts.iframe) {
      iframePaddingTop = editor.helpers.getPX(editor.$wp.find('.fr-iframe').css('padding-top'))
      iframePaddingLeft = editor.helpers.getPX(editor.$wp.find('.fr-iframe').css('padding-left'))
    }
    
    $embedly_resizer
      .css('top', (editor.opts.iframe ? $current_embed.offset().top + iframePaddingTop - 1 + editor.$iframe.position().top : $current_embed.offset().top - editor.$wp.offset().top - 1) + editor.$wp.scrollTop())
      .css('left', (editor.opts.iframe ? $current_embed.offset().left + iframePaddingLeft - 1 : $current_embed.offset().left - editor.$wp.offset().left - 1) + editor.$wp.scrollLeft())
      .css('width', $current_embed.outerWidth())
      .css('height', $current_embed.height())
      .addClass('fr-active')
  }

  function _cleanOnGet(el) {
    // Tag is image.
    if (el && editor.node.hasClass(el, 'fr-embedly')) {
      el.innerHTML = el.getAttribute('data-original-embed')
      el.removeAttribute('draggable')
      el.removeAttribute('contenteditable')
      el.setAttribute('class', (el.getAttribute('class') || '').replace('fr-draggable', ''))
    }

    // Look for inner nodes that might be in a similar case.
    else if (el && el.nodeType == Node.ELEMENT_NODE) {
      const els = el.querySelectorAll('.fr-embedly')

      for (let i = 0; i < els.length; i++) {
        _cleanOnGet(els[i])
      }
    }
  }

  function _initInsertPopup(delayed) {
    if (delayed) {
      editor.popups.onRefresh('embedly.insert', _refreshInsertPopup)

      return true
    }

    let buttons = ''

    if (editor.opts.embedlyInsertButtons.length > 0) {
      buttons += '<div class="fr-buttons fr-tabs">'
      buttons += editor.button.buildList(editor.opts.embedlyInsertButtons)
      buttons += '</div>'
    }

    // Image by url layer.
    let url_layer = ''
    url_layer = '<div class="fr-embedly-layer fr-active fr-layer" id="fr-embedly-layer-' + editor.id + '"><div class="fr-input-line"><input id="fr-embedly-layer-text-' + editor.id + '" type="text" placeholder="' + editor.language.translate('Paste in a URL to embed') + '" tabIndex="1" aria-required="true"></div><div class="fr-action-buttons"><button type="button" class="fr-command fr-submit" data-cmd="embedlyInsert" tabIndex="2" role="button">' + editor.language.translate('Insert') + '</button></div></div>'

    const template = {
      buttons: buttons,
      url_layer: url_layer
    }

    // Set the template in the popup.
    const $popup = editor.popups.create('embedly.insert', template)

    return $popup
  }

  /**
   * Refresh the video insert popup.
   */
  function _refreshInsertPopup() {
    const $popup = editor.popups.get('embedly.insert')

    const $url_input = $popup.find('.fr-embedly-layer input')
    $url_input.val('').trigger('change')
  }

  function showInsertPopup() {
    const $btn = editor.$tb.find('.fr-command[data-cmd="embedly"]')

    let $popup = editor.popups.get('embedly.insert')

    if (!$popup) $popup = _initInsertPopup()

    if (!$popup.hasClass('fr-active')) {
      editor.popups.refresh('embedly.insert')
      editor.popups.setContainer('embedly.insert', editor.$tb)

      if ($btn.isVisible()) {
        const { left, top } = editor.button.getPosition($btn)
        editor.popups.show('embedly.insert', left, top, $btn.outerHeight())
      }
      else {
        editor.position.forSelection($popup)
        editor.popups.show('embedly.insert')
      }
    }
  }

  function insert() {
    const $popup = editor.popups.get('embedly.insert')
    const $input = $popup.find('.fr-embedly-layer input')

    add($input.val())
  }

  function add(url) {
    if (url.length) {
      const embed = '<a href=\'' + url + '\' data-card-branding=\'0\' class=\'embedly-card\'' + (editor.opts.embedlyKey ? ' data-card-key=\'' + editor.opts.embedlyKey + '\'' : '') + '></a>'

      editor.html.insert('<div class="fr-embedly fr-draggable" draggable="true" contenteditable="false" data-original-embed="' + embed + '">' + embed + '</div>')

      editor.popups.hideAll()
    }
  }

  function remove() {
    if ($current_embed) {
      if (editor.events.trigger('embedly.beforeRemove', [$current_embed]) !== false) {
        const $embed = $current_embed
        editor.popups.hideAll()

        _exitEdit(true)

        editor.selection.setBefore($embed.get(0)) || editor.selection.setAfter($embed.get(0))
        $embed.remove()
        editor.selection.restore()

        editor.html.fillEmptyBlocks()

        editor.undo.saveStep()

        editor.events.trigger('video.removed', [$embed])
      }
    }
  }

  /**
   * Exit edit.
   */
  function _exitEdit(force_exit) {
    if ($current_embed && (_canExit() || force_exit === true)) {
      $embedly_resizer.removeClass('fr-active')

      editor.toolbar.enable()

      $current_embed.removeClass('fr-active')
      $current_embed = null

      _unmarkExit()
    }
  }

  editor.shared.embedly_exit_flag = false

  function _markExit() {
    editor.shared.embedly_exit_flag = true
  }

  function _unmarkExit() {
    editor.shared.embedly_exit_flag = false
  }

  function _canExit() {

    return editor.shared.embedly_exit_flag
  }

  function get() {
    return $current_embed
  }

  function back() {
    if ($current_embed) {
      editor.events.disableBlur()
      $current_embed.trigger('click')
    }
    else {
      editor.events.disableBlur()
      editor.selection.restore()
      editor.events.enableBlur()

      editor.popups.hide('embedly.insert')
      editor.toolbar.showInline()
    }
  }

  return {
    _init: _init,
    showInsertPopup: showInsertPopup,
    insert: insert,
    remove: remove,
    get: get,
    add: add,
    back: back
  }
}

FE.DefineIcon('embedly', { NAME: 'share-alt', SVG_KEY: 'insertEmbed' })
FE.RegisterCommand('embedly', {
  undo: true,
  focus: true,
  title: 'Embed URL',
  popup: true,
  callback: function () {
    if (!this.popups.isVisible('embedly.insert')) {
      this.embedly.showInsertPopup()
    }
    else {
      if (this.$el.find('.fr-marker').length) {
        this.events.disableBlur()
        this.selection.restore()
      }
      this.popups.hide('embedly.insert');
    }
  },
  plugin: 'embedly'
})

FE.RegisterCommand('embedlyInsert', {
  undo: true,
  focus: true,
  callback: function () {
    this.embedly.insert()
  }
})

// Video remove.
FE.DefineIcon('embedlyRemove', { NAME: 'trash', SVG_KEY: 'remove' })
FE.RegisterCommand('embedlyRemove', {
  title: 'Remove',
  undo: false,
  callback: function () {
    this.embedly.remove()
  }
})

// Video back.
FE.DefineIcon('embedlyBack', { NAME: 'arrow-left', SVG_KEY: 'back' })
FE.RegisterCommand('embedlyBack', {
  title: 'Back',
  undo: false,
  focus: false,
  back: true,
  callback: function () {
    this.embedly.back()
  },
  refresh: function ($btn) {
    const $current_emebed = this.embedly.get()

    if (!$current_emebed && !this.opts.toolbarInline) {
      $btn.addClass('fr-hidden')
      $btn.next('.fr-separator').addClass('fr-hidden')
    }
    else {
      $btn.removeClass('fr-hidden')
      $btn.next('.fr-separator').removeClass('fr-hidden')
    }
  }
})
