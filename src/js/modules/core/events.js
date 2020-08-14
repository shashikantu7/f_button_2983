import './helpers.js'

import FE from '../../editor.js'

FE.MODULES.events = function (editor) {
  const $ = editor.$

  const _events = {}
  let _do_blur

  function _assignEvent($el, evs, handler) {
    $on($el, evs, handler)
  }

  function _forPaste() {
    _assignEvent(editor.$el, 'cut copy paste beforepaste', (e) => {
      trigger(e.type, [e])
    })
  }

  function _forElement() {
    _assignEvent(editor.$el, 'click mouseup mousemove mousedown touchstart touchend dragenter dragover dragleave dragend drop dragstart', (e) => {
      trigger(e.type, [e])
    })

    on('mousedown', () => {
      for (let i = 0; i < FE.INSTANCES.length; i++) {
        if (FE.INSTANCES[i] !== editor && FE.INSTANCES[i].popups && FE.INSTANCES[i].popups.areVisible()) {
          FE.INSTANCES[i].$el.find('.fr-marker').remove()
        }
      }
    })
  }

  function _forKeys() {

    // Map events.
    _assignEvent(editor.$el, 'keydown keypress keyup input', (e) => {
      trigger(e.type, [e])
    })
  }

  function _forWindow() {
    _assignEvent(editor.$win, editor._mousedown, (e) => {
      trigger('window.mousedown', [e])
      enableBlur()
    })

    _assignEvent(editor.$win, editor._mouseup, (e) => {
      trigger('window.mouseup', [e])
    })

    _assignEvent(editor.$win, 'cut copy keydown keyup touchmove touchend', (e) => {
      trigger(`window.${e.type}`, [e])
    })
  }

  function _forDocument() {
    _assignEvent(editor.$doc, 'dragend drop', (e) => {
      trigger(`document.${e.type}`, [e])
    })
  }

  function focus(do_focus) {
    let info

    if (typeof do_focus === 'undefined') {
      do_focus = true
    }

    if (!editor.$wp) {
      return false
    }

    // Focus the editor window.
    if (editor.helpers.isIOS()) {
      editor.$win.get(0).focus()
    }

    // If there is focus, stop.
    if (editor.core.hasFocus()) {
      return false
    }

    // If there is no focus, then force focus.
    if (!editor.core.hasFocus() && do_focus) {
      const st = editor.$win.scrollTop()

      // Hack to prevent scrolling IE.
      if (editor.browser.msie && editor.$box) {
        editor.$box.css('position', 'fixed')
      }

      // hack to prevent scrolling.
      if (editor.browser.msie && editor.$wp) {
        editor.$wp.css('overflow', 'visible')
      }

      if (editor.browser.msie && editor.$sc) editor.$sc.css('position', 'fixed');

      disableBlur()
      editor.el.focus()
      editor.events.trigger('focus')
      enableBlur()

      // Revert position IE.
      if (editor.browser.msie && editor.$sc) editor.$sc.css('position', '');

      // Revert position.
      if (editor.browser.msie && editor.$box) {
        editor.$box.css('position', '')
      }

      // Revert scroll.
      if (editor.browser.msie && editor.$wp) {
        editor.$wp.css('overflow', 'auto')
      }

      if (st !== editor.$win.scrollTop()) {
        editor.$win.scrollTop(st)
      }

      info = editor.selection.info(editor.el)

      // If selection is at start, we should make sure we're in the first block tag.
      if (!info.atStart) {
        return false
      }
    }

    // Don't go further if we haven't focused or there are markers.
    if (!editor.core.hasFocus() || editor.$el.find('.fr-marker').length > 0) {

      return false
    }

    info = editor.selection.info(editor.el)

    if (info.atStart && editor.selection.isCollapsed()) {
      if (editor.html.defaultTag() !== null) {
        const marker = editor.markers.insert()

        if (marker && !editor.node.blockParent(marker)) {
          $(marker).remove()

          const element = editor.$el.find(editor.html.blockTagsQuery()).get(0)

          if (element) {
            $(element).prepend(FE.MARKERS)
            editor.selection.restore()
          }
        }
        else if (marker) {
          $(marker).remove()
        }
      }
    }
  }

  let focused = false

  function _forFocus() {
    _assignEvent(editor.$el, 'focus', (e) => {
      if (blurActive()) {
        focus(false)

        if (focused === false) {
          trigger(e.type, [e])
        }
      }
    })

    _assignEvent(editor.$el, 'blur', (e) => {
      if (blurActive() /* && document.activeElement !== this */) {
        if (focused === true) {
          trigger(e.type, [e])
          enableBlur()
        }
      }
    })

    // Prevent blur when clicking contenteditable.
    $on(editor.$el, 'mousedown', '[contenteditable="true"]', function () {
      disableBlur();
      editor.$el.blur();
    })

    on('focus', () => {
      focused = true
    })

    on('blur', () => {
      focused = false
    })
  }

  function _forMouse() {
    if (editor.helpers.isMobile()) {
      editor._mousedown = 'touchstart'
      editor._mouseup = 'touchend'
      editor._move = 'touchmove'
      editor._mousemove = 'touchmove'
    }
    else {
      editor._mousedown = 'mousedown'
      editor._mouseup = 'mouseup'
      editor._move = ''
      editor._mousemove = 'mousemove'
    }
  }

  function _buttonMouseDown(e) {
    const $btn = $(e.currentTarget)

    if (editor.edit.isDisabled() || editor.node.hasClass($btn.get(0), 'fr-disabled')) {
      e.preventDefault()

      return false
    }

    // Not click button.
    if (e.type === 'mousedown' && e.which !== 1) {
      return true
    }

    // Scroll in list.
    if (!editor.helpers.isMobile()) {
      e.preventDefault()
    }

    if ((editor.helpers.isAndroid() || editor.helpers.isWindowsPhone()) && $btn.parents('.fr-dropdown-menu').length === 0) {
      e.preventDefault()
      e.stopPropagation()
    }

    // Simulate click.
    $btn.addClass('fr-selected')

    editor.events.trigger('commands.mousedown', [$btn])
  }

  function _buttonMouseUp(e, handler) {
    const $btn = $(e.currentTarget)

    if (editor.edit.isDisabled() || editor.node.hasClass($btn.get(0), 'fr-disabled')) {
      e.preventDefault()

      return false
    }

    if (e.type === 'mouseup' && e.which !== 1) {
      return true
    }

    // https://github.com/froala-labs/froala-editor-js-2/issues/1877
    // when you click the button and drag to the other button, current target would be different than clicked button
    if (editor.button.getButtons('.fr-selected', true).get(0) == $btn.get(0) && !editor.node.hasClass($btn.get(0), 'fr-selected')) {
      return true
    }

    if (e.type !== 'touchmove') {
      e.stopPropagation()
      e.stopImmediatePropagation()
      e.preventDefault()

      // Simulate click.
      if (!editor.node.hasClass($btn.get(0), 'fr-selected')) {
        editor.button.getButtons('.fr-selected', true).removeClass('fr-selected')

        return false
      }
      editor.button.getButtons('.fr-selected', true).removeClass('fr-selected')

      if ($btn.data('dragging') || $btn.attr('disabled')) {
        $btn.removeData('dragging')

        return false
      }

      const timeout = $btn.data('timeout')

      if (timeout) {
        clearTimeout(timeout)
        $btn.removeData('timeout')
      }

      handler.apply(editor, [e])
    }
    else if (!$btn.data('timeout')) {
      $btn.data('timeout', setTimeout(() => {
        $btn.data('dragging', true)
      }, 100))
    }
  }

  function enableBlur() {
    _do_blur = true
  }

  function disableBlur() {
    _do_blur = false
  }

  function blurActive() {
    return _do_blur
  }

  /**
   * Bind click on an element.
   */
  function bindClick($element, selector, handler) {
    $on($element, editor._mousedown, selector, (e) => {
      if (!editor.edit.isDisabled()) {
        _buttonMouseDown(e)
      }
    }, true)

    $on($element, `${editor._mouseup} ${editor._move}`, selector, (e) => {
      if (!editor.edit.isDisabled()) {
        _buttonMouseUp(e, handler)
      }
    }, true)

    $on($element, 'mousedown click mouseup', selector, (e) => {
      if (!editor.edit.isDisabled()) {
        e.stopPropagation()
      }
    }, true)

    on('window.mouseup', () => {
      if (!editor.edit.isDisabled()) {
        $element.find(selector).removeClass('fr-selected')
        enableBlur()
      }
    })

    $on($element, 'mouseover', selector, function () {
      if ($(this).hasClass('fr-options')) {
        $(this).prev('.fr-btn').addClass('fr-btn-hover')
      }

      if ($(this).next('.fr-btn').hasClass('fr-options')) {
        $(this).next('.fr-btn').addClass('fr-btn-hover')
      }
    })

    $on($element, 'mouseout', selector, function () {
      if ($(this).hasClass('fr-options')) {
        $(this).prev('.fr-btn').removeClass('fr-btn-hover')
      }

      if ($(this).next('.fr-btn').hasClass('fr-options')) {
        $(this).next('.fr-btn').removeClass('fr-btn-hover')
      }
    })
  }

  /**
   * Add event.
   */
  function on(name, callback, first) {
    const names = name.split(' ')

    if (names.length > 1) {
      for (let i = 0; i < names.length; i++) {
        on(names[i], callback, first)
      }

      return true
    }

    if (typeof first === 'undefined') {
      first = false
    }

    let callbacks

    if (name.indexOf('shared.') !== 0) {
      _events[name] = _events[name] || []
      callbacks = _events[name]
    }
    else {
      editor.shared._events[name] = editor.shared._events[name] || []
      callbacks = editor.shared._events[name]
    }

    if (first) {
      callbacks.unshift(callback)
    }
    else {
      callbacks.push(callback)
    }
  }

  let $_events = []

  function $on($el, evs, selector, callback, shared) {
    if (typeof selector === 'function') {
      shared = callback
      callback = selector
      selector = false
    }

    const ary = !shared ? $_events : editor.shared.$_events
    const id = !shared ? editor.id : editor.sid

    const eventName = `${evs.trim().split(' ').join(`.ed${id} `)}.ed${id}`

    if (!selector) {
      $el.on(eventName, callback)
    }
    else {
      $el.on(eventName, selector, callback)
    }

    ary.push([$el, eventName])
  }

  function _$off(evs) {
    for (let i = 0; i < evs.length; i++) {
      evs[i][0].off(evs[i][1])
    }
  }

  function $off() {
    _$off($_events)
    $_events = []

    if (editor.shared.count === 0) {
      _$off(editor.shared.$_events)
      editor.shared.$_events = []
    }
  }

  /**
   * Trigger an event.
   */
  function trigger(name, args, force) {
    if (!editor.edit.isDisabled() || force) {
      let callbacks

      if (name.indexOf('shared.') !== 0) {
        callbacks = _events[name]
      }
      else {
        if (editor.shared.count > 0) {
          return false
        }

        callbacks = editor.shared._events[name]
      }

      let val

      if (callbacks) {
        for (let i = 0; i < callbacks.length; i++) {
          val = callbacks[i].apply(editor, args)

          if (val === false) {
            return false
          }
        }
      }

      if (editor.opts.events && editor.opts.events[name]) {
        val = editor.opts.events[name].apply(editor, args)

        if (val === false) {
          return false
        }
      }

      return val
    }
  }

  function chainTrigger(name, param, force) {
    if (!editor.edit.isDisabled() || force) {
      let callbacks

      if (name.indexOf('shared.') !== 0) {
        callbacks = _events[name]
      }
      else {
        if (editor.shared.count > 0) {
          return false
        }
        callbacks = editor.shared._events[name]
      }

      let resp

      if (callbacks) {
        for (let i = 0; i < callbacks.length; i++) {

          // Get the callback response.
          resp = callbacks[i].apply(editor, [param])

          // If callback response is defined then assign it to param.
          if (typeof resp !== 'undefined') {
            param = resp
          }
        }
      }

      if (editor.opts.events && editor.opts.events[name]) {
        resp = editor.opts.events[name].apply(editor, [param])

        if (typeof resp !== 'undefined') {
          param = resp
        }
      }

      return param
    }
  }

  /**
   * Destroy
   */
  function _destroy() {

    // Clear the events list.
    for (const k in _events) {
      if (Object.prototype.hasOwnProperty.call(_events, k)) {
        delete _events[k]
      }
    }
  }

  function _sharedDestroy() {
    for (const k in editor.shared._events) {
      if (Object.prototype.hasOwnProperty.call(editor.shared._events, k)) {
        delete editor.shared._events[k]
      }
    }
  }

  /**
   * Tear up.
   */
  function _init() {
    editor.shared.$_events = editor.shared.$_events || []
    editor.shared._events = {}

    _forMouse()

    _forElement()
    _forWindow()
    _forDocument()
    _forKeys()

    _forFocus()
    enableBlur()

    _forPaste()

    on('destroy', _destroy)
    on('shared.destroy', _sharedDestroy)
  }

  return {
    _init,
    on,
    trigger,
    bindClick,
    disableBlur,
    enableBlur,
    blurActive,
    focus,
    chainTrigger,
    $on,
    $off
  }
}
