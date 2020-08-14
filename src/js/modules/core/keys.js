import FE from '../../editor.js'

// Enter possible actions.
FE.ENTER_P = 0
FE.ENTER_DIV = 1
FE.ENTER_BR = 2

FE.KEYCODE = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  ESC: 27,
  SPACE: 32,
  ARROW_LEFT: 37,
  ARROW_UP: 38,
  ARROW_RIGHT: 39,
  ARROW_DOWN: 40,
  DELETE: 46,
  ZERO: 48,
  ONE: 49,
  TWO: 50,
  THREE: 51,
  FOUR: 52,
  FIVE: 53,
  SIX: 54,
  SEVEN: 55,
  EIGHT: 56,
  NINE: 57,
  FF_SEMICOLON: 59, // Firefox (Gecko) fires this for semicolon instead of 186
  FF_EQUALS: 61, // Firefox (Gecko) fires this for equals instead of 187
  QUESTION_MARK: 63, // needs localization
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  META: 91,
  NUM_ZERO: 96,
  NUM_ONE: 97,
  NUM_TWO: 98,
  NUM_THREE: 99,
  NUM_FOUR: 100,
  NUM_FIVE: 101,
  NUM_SIX: 102,
  NUM_SEVEN: 103,
  NUM_EIGHT: 104,
  NUM_NINE: 105,
  NUM_MULTIPLY: 106,
  NUM_PLUS: 107,
  NUM_MINUS: 109,
  NUM_PERIOD: 110,
  NUM_DIVISION: 111,

  F1: 112,
  F2: 113,
  F3: 114,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123,

  FF_HYPHEN: 173, // Firefox (Gecko) fires this for hyphen instead of 189s
  SEMICOLON: 186, // needs localization
  DASH: 189, // needs localization
  EQUALS: 187, // needs localization
  COMMA: 188, // needs localization
  HYPHEN: 189, // needs localization
  PERIOD: 190, // needs localization
  SLASH: 191, // needs localization
  APOSTROPHE: 192, // needs localization
  TILDE: 192, // needs localization
  SINGLE_QUOTE: 222, // needs localization
  OPEN_SQUARE_BRACKET: 219, // needs localization
  BACKSLASH: 220, // needs localization
  CLOSE_SQUARE_BRACKET: 221, // needs localization

  IME: 229
}

// Extend defaults.
Object.assign(FE.DEFAULTS, {
  enter: FE.ENTER_P,
  multiLine: true,
  tabSpaces: 0
})

FE.MODULES.keys = function (editor) {
  const $ = editor.$

  let IME = false

  /**
   * ENTER.
   */
  function _enter(e) {
    if (!editor.opts.multiLine) {
      e.preventDefault()
      e.stopPropagation()
    }

    // Not iOS.
    else {

      // Do not prevent default on IOS.
      if (!editor.helpers.isIOS()) {
        e.preventDefault()
        e.stopPropagation()
      }

      if (!editor.selection.isCollapsed()) {
        editor.selection.remove()
      }

      editor.cursor.enter()
    }
  }

  /**
   * SHIFT ENTER.
   */
  function _shiftEnter(e) {
    e.preventDefault()
    e.stopPropagation()

    if (editor.opts.multiLine) {
      if (!editor.selection.isCollapsed()) {
        editor.selection.remove()
      }

      editor.cursor.enter(true)
    }
  }
  /**
   * Control/Command Backspace.
   */
  function _ctlBackspace() {

    setTimeout(() => {
      editor.events.disableBlur()
      editor.events.focus()
    }, 0)
  }

  /**
   * BACKSPACE.
   */
  function _backspace(e) {

    // There is no selection.
    if (editor.selection.isCollapsed()) {
      if (['INPUT','BUTTON','TEXTAREA'].indexOf(e.target && e.target.tagName) < 0) {
        editor.cursor.backspace()
      }

      if (editor.helpers.isIOS()) {
        const range = editor.selection.ranges(0)
        range.deleteContents()
        range.insertNode(document.createTextNode('\u200B'))

        const sel = editor.selection.get()
        sel.modify('move', 'forward', 'character')
      }
      else {
        if (['INPUT','BUTTON','TEXTAREA'].indexOf(e.target && e.target.tagName) < 0) {
          e.preventDefault()
        }

        e.stopPropagation()
      }
    }

    // We have text selected.
    else {
      e.preventDefault()
      e.stopPropagation()

      editor.selection.remove()
    }

    editor.placeholder.refresh()
  }

  /**
   * DELETE
   */
  function _del(e) {
    if (['INPUT','BUTTON','TEXTAREA'].indexOf(e.target && e.target.tagName) < 0) {
      e.preventDefault()
    }

    e.stopPropagation()

    // There is no selection or only image selection.
    // https://github.com/froala/wysiwyg-editor/issues/3342
    if (editor.selection.text() === '' && (editor.selection.isCollapsed() || editor.selection.element().tagName != 'IMG')) {
      editor.cursor.del();
    }

    // We have text selected.
    else {
      editor.selection.remove()
    }

    editor.placeholder.refresh()
  }

  /**
   * SPACE
   */
  function _space(e) {
    const el = editor.selection.element()

    // Do nothing on mobile.
    // Browser is Mozilla or we're inside a link tag.
    if (!editor.helpers.isMobile() && (el && el.tagName === 'A')) {
      e.preventDefault()
      e.stopPropagation()

      if (!editor.selection.isCollapsed()) {
        editor.selection.remove()
      }
      const marker = editor.markers.insert()

      if (marker) {
        const prev_node = marker.previousSibling
        const next_node = marker.nextSibling

        if (!next_node && marker.parentNode && marker.parentNode.tagName === 'A') {
          marker.parentNode.insertAdjacentHTML('afterend', `&nbsp;${FE.MARKERS}`)
          marker.parentNode.removeChild(marker)
        }
        else {
          if (prev_node && prev_node.nodeType === Node.TEXT_NODE && prev_node.textContent.length === 1 && prev_node.textContent.charCodeAt(0) === 160) {
            prev_node.textContent += ' '
          }
          else {
            marker.insertAdjacentHTML('beforebegin', '&nbsp;')
          }

          marker.outerHTML = FE.MARKERS
        }

        editor.selection.restore()
      }
    }
  }

  /**
   * Handle typing in Korean for FF.
   */
  function _input() {

    // Select is collapsed and we're not using IME.
    if (editor.browser.mozilla && editor.selection.isCollapsed() && !IME) {
      const range = editor.selection.ranges(0)
      const start_container = range.startContainer
      const start_offset = range.startOffset

      // Start container is text and last char before cursor is space.
      if (start_container && start_container.nodeType === Node.TEXT_NODE && start_offset <= start_container.textContent.length && start_offset > 0 && start_container.textContent.charCodeAt(start_offset - 1) === 32) {
        editor.selection.save()
        editor.spaces.normalize()
        editor.selection.restore()
      }
    }
  }

  /**
   * Cut.
   */
  function _cut() {
    if (editor.selection.isFull()) {
      setTimeout(() => {
        const default_tag = editor.html.defaultTag()

        if (default_tag) {
          editor.$el.html(`<${default_tag}>${FE.MARKERS}<br/></${default_tag}>`)
        }
        else {
          editor.$el.html(`${FE.MARKERS}<br/>`)
        }
        editor.selection.restore()

        editor.placeholder.refresh()
        editor.button.bulkRefresh()
        editor.undo.saveStep()
      }, 0)
    }
  }

  /**
   * Tab.
   */
  function _tab(e) {
    if (editor.opts.tabSpaces > 0) {
      if (editor.selection.isCollapsed()) {
        editor.undo.saveStep()

        e.preventDefault()
        e.stopPropagation()

        let str = ''

        for (let i = 0; i < editor.opts.tabSpaces; i++) {
          str += '&nbsp;'
        }
        editor.html.insert(str)
        editor.placeholder.refresh()

        editor.undo.saveStep()
      }
      else {
        e.preventDefault()
        e.stopPropagation()

        if (!e.shiftKey) {
          editor.commands.indent()
        }
        else {
          editor.commands.outdent()
        }
      }
    }
  }

  /**
   * Map keyPress actions.
   */
  function _mapKeyPress() {
    IME = false
  }

  function _clearIME() {
    IME = false
  }

  /**
   * If is IME.
   */
  function isIME() {
    return IME
  }

  let key_down_code

  function _empty() {
    const default_tag = editor.html.defaultTag()

    if (default_tag) {
      editor.$el.html(`<${default_tag}>${FE.MARKERS}<br/></${default_tag}>`)
    }
    else {
      editor.$el.html(`${FE.MARKERS}<br/>`)
    }

    editor.selection.restore()
  }
    
  /**
   * https://github.com/froala-labs/froala-editor-js-2/issues/1864
   * Extra Space after Image in list (ul, ol).
   */

  function ImageCaptionSpace(sel_el,e){
    if(sel_el.innerHTML.indexOf('<span') > -1 || sel_el.parentElement.innerHTML.indexOf('<span') > -1 || sel_el.parentElement.parentElement.innerHTML.indexOf('<span') > -1){
      if (sel_el.classList.contains('fr-img-space-wrap') || sel_el.parentElement.classList.contains('fr-img-space-wrap') || sel_el.parentElement.parentElement.classList.contains('fr-img-space-wrap')){
        if($(sel_el.parentElement).is('p')){
          let strHTML = sel_el.parentElement.innerHTML
          strHTML = strHTML.replace(/<br>/g, '')
          if(strHTML.length < 1){
            sel_el.parentElement.insertAdjacentHTML('afterbegin', '&nbsp;');
          }
          else if(strHTML != '&nbsp;' && strHTML != ' ' && e.key == 'Backspace'){
            _backspace(e)
          }
          else if(strHTML != '&nbsp;' && strHTML != ' ' && e.key == 'Delete'){
            _del(e)
          }
          return true
        }
        else if($(sel_el).is('p')){
          let orgStr = sel_el.innerHTML
          let strHTML = orgStr.replace(/<br>/g, '')
          if(strHTML.length < 1){
            sel_el.insertAdjacentHTML('afterbegin', '&nbsp;');
          }
          else if(strHTML != '&nbsp;' && strHTML != ' ' && e.key == 'Backspace'){
            _backspace(e)
          }
          else if (strHTML != '&nbsp;' && strHTML != ' ' && e.key == 'Delete'){
            _del(e)
          }
          return true
        }
      }
    }
    return false
  }

  /**
   * Map keyDown actions.
   */
  function _mapKeyDown(e) {
    const sel_el = editor.selection.element()

    if (sel_el && ['INPUT', 'TEXTAREA'].indexOf(sel_el.tagName) >= 0) {
      return true
    }

    if (e && isArrow(e.which)) {
      return true
    }

    editor.events.disableBlur()

    const key_code = e.which

    if (key_code === 16) {
      return true
    }

    key_down_code = key_code

    // Handle Japanese typing.
    if (key_code === FE.KEYCODE.IME) {
      IME = true

      return true
    }

    IME = false


    const char_key = isCharacter(key_code) && !ctrlKey(e) && !e.altKey
    const del_key = key_code === FE.KEYCODE.BACKSPACE || key_code === FE.KEYCODE.DELETE

    // 1. Selection is full.
    // 2. Del key is hit, editor is empty and there is keepFormatOnDelete.
    if (editor.selection.isFull() && !editor.opts.keepFormatOnDelete && !editor.placeholder.isVisible() || del_key && editor.placeholder.isVisible() && editor.opts.keepFormatOnDelete) {
      if (char_key || del_key) {
        _empty()

        if (!isCharacter(key_code)) {
          e.preventDefault()

          return true
        }
      }
    }

    // ENTER.
    if (key_code === FE.KEYCODE.ENTER) {
      //code edited https://github.com/froala-labs/froala-editor-js-2/issues/1864
      // added code for fr-inner class check
      if (e.shiftKey || sel_el.classList.contains('fr-inner') || sel_el.parentElement.classList.contains('fr-inner')){
        _shiftEnter(e)
      }
      else {
        _enter(e)
      }
    }

    // Ctrl/Command Backspace.
    else if (key_code === FE.KEYCODE.BACKSPACE && (e.metaKey || e.ctrlKey)) {
      _ctlBackspace()
    }

    // Backspace.
    else if (key_code === FE.KEYCODE.BACKSPACE && !ctrlKey(e) && !e.altKey) {
      // https://github.com/froala-labs/froala-editor-js-2/issues/1864
      if(ImageCaptionSpace(sel_el, e)){
        e.preventDefault()
        e.stopPropagation()
        return
      }
      
      if (!editor.placeholder.isVisible()) {
        _backspace(e)
      }
      else {
        if (!editor.opts.keepFormatOnDelete) {
          _empty()
        }

        e.preventDefault()
        e.stopPropagation()
      }
    }

    // Delete.
    else if (key_code === FE.KEYCODE.DELETE && !ctrlKey(e) && !e.altKey && !e.shiftKey) {
      // https://github.com/froala-labs/froala-editor-js-2/issues/1864
      if(ImageCaptionSpace(sel_el, e)){
        e.preventDefault()
        e.stopPropagation()
        return
      }
      
      if (!editor.placeholder.isVisible()) {
        _del(e)
      }
      else {
        if (!editor.opts.keepFormatOnDelete) {
          _empty()
        }

        e.preventDefault()
        e.stopPropagation()
      }
    }

    // Space.
    else if (key_code === FE.KEYCODE.SPACE) {
      _space(e)
    }

    // Tab.
    else if (key_code === FE.KEYCODE.TAB) {
      _tab(e)
    }

    // Char key.
    else if (!ctrlKey(e) && isCharacter(e.which) && !editor.selection.isCollapsed() && !e.ctrlKey && !e.altKey) {
      editor.selection.remove()
    }

    editor.events.enableBlur()
  }

  /**
   * Remove U200B.
   */
  function _replaceU200B(el) {
    const walker = editor.doc.createTreeWalker(el, NodeFilter.SHOW_TEXT, editor.node.filter((node) => /\u200B/gi.test(node.textContent)), false)

    while (walker.nextNode()) {
      const node = walker.currentNode

      node.textContent = node.textContent.replace(/\u200B/gi, '')
    }
  }

  function positionCaret() {
    if (!editor.$wp) {
      return true
    }

    let info

    if (!editor.opts.height && !editor.opts.heightMax) {

      // Make sure we scroll bottom.
      info = editor.position.getBoundingRect()
        .top

      // https://github.com/froala/wysiwyg-editor/issues/834.
      if (editor.opts.toolbarBottom) {
        info += editor.opts.toolbarStickyOffset
      }

      if (editor.helpers.isIOS() || editor.helpers.isAndroid()) {
        info -= editor.helpers.scrollTop()
      }

      if (editor.opts.iframe) {
        info += editor.$iframe.offset()
          .top

        // https://github.com/froala-labs/froala-editor-js-2/issues/432 . getBoundingRect will return different results in iframe because the viewport.
        info -= editor.helpers.scrollTop()
      }

      info += editor.opts.toolbarStickyOffset

      if (info > editor.o_win.innerHeight - 20) {
        $(editor.o_win)
          .scrollTop(info + editor.helpers.scrollTop() - editor.o_win.innerHeight + 20)
      }

      // Make sure we scroll top.
      info = editor.position.getBoundingRect()
        .top

      // https://github.com/froala/wysiwyg-editor/issues/834.
      if (!editor.opts.toolbarBottom) {
        info -= editor.opts.toolbarStickyOffset
      }

      if (editor.helpers.isIOS() || editor.helpers.isAndroid()) {
        info -= editor.helpers.scrollTop()
      }

      if (editor.opts.iframe) {
        info += editor.$iframe.offset()
          .top

        // https://github.com/froala-labs/froala-editor-js-2/issues/432 . getBoundingRect will return different results in iframe because the viewport.
        info -= editor.helpers.scrollTop()
      }

      if (info < 100) {
        $(editor.o_win)
          .scrollTop(info + editor.helpers.scrollTop() - 100)
      }
    }
    else {

      // Make sure we scroll bottom.
      info = editor.position.getBoundingRect()
        .top

      if (editor.helpers.isIOS() || editor.helpers.isAndroid()) {
        info -= editor.helpers.scrollTop()
      }

      if (editor.opts.iframe) {
        info += editor.$iframe.offset()
          .top
      }

      if (info > editor.$wp.offset()
        .top - editor.helpers.scrollTop() + editor.$wp.height() - 20) {
        editor.$wp.scrollTop(info + editor.$wp.scrollTop() - (editor.$wp.height() + editor.$wp.offset()
          .top) + editor.helpers.scrollTop() + 20)
      }
    }
  }

  /**
   * Map keyUp actions.
   */
  function _mapKeyUp(e) {
    const sel_el = editor.selection.element()

    if (sel_el && ['INPUT', 'TEXTAREA'].indexOf(sel_el.tagName) >= 0) {
      return true
    }

    // When using iOS soft keyboard, in keyup we get 0 for keycode,
    // therefore, we are using the one we got on keydown.
    if (e && e.which === 0 && key_down_code) {
      e.which = key_down_code
    }

    if (editor.helpers.isAndroid() && editor.browser.mozilla) {

      return true
    }

    // IME IE.
    if (IME) {
      return false
    }

    // Revert ios default ENTER.
    if (e && editor.helpers.isIOS() && e.which === FE.KEYCODE.ENTER) {
      editor.doc.execCommand('undo')
    }

    if (!editor.selection.isCollapsed()) {
      return true
    }

    if (e && (e.which === FE.KEYCODE.META || e.which === FE.KEYCODE.CTRL)) {
      return true
    }

    if (e && isArrow(e.which)) {
      return true
    }

    if (e && !editor.helpers.isIOS() && (e.which === FE.KEYCODE.ENTER || e.which === FE.KEYCODE.BACKSPACE || e.which >= 37 && e.which <= 40 && !editor.browser.msie)) {
      try {
        positionCaret()
      }
      catch (ex) {
        // ok.
      }
    }

    // Remove invisible space where possible.
    function has_invisible(node) {
      if (!node) {
        return false
      }

      let text = node.innerHTML
      text = text.replace(/<span[^>]*? class\s*=\s*["']?fr-marker["']?[^>]+>\u200b<\/span>/gi, '')

      if (text && /\u200B/.test(text) && text.replace(/\u200B/gi, '')
        .length > 0) {
        return true
      }

      return false
    }

    function ios_CJK(el) {
      const CJKRegEx = /[\u3041-\u3096\u30A0-\u30FF\u4E00-\u9FFF\u3130-\u318F\uAC00-\uD7AF]/gi

      return !editor.helpers.isIOS() || ((el.textContent || '')
        .match(CJKRegEx) || [])
        .length === 0
    }

    // Get the selection element.
    const el = editor.selection.element()

    if (has_invisible(el) && !editor.node.hasClass(el, 'fr-marker') && el.tagName !== 'IFRAME' && ios_CJK(el)) {
      editor.selection.save()
      _replaceU200B(el)
      editor.selection.restore()
    }
  }

  // Check if we should consider that CTRL key is pressed.
  function ctrlKey(e) {
    if (navigator.userAgent.indexOf('Mac OS X') !== -1) {
      if (e.metaKey && !e.altKey) {
        return true
      }
    }
    else if (e.ctrlKey && !e.altKey) {
      return true
    }

    return false
  }

  function isArrow(key_code) {
    if (key_code >= FE.KEYCODE.ARROW_LEFT && key_code <= FE.KEYCODE.ARROW_DOWN) {

      return true
    }
  }

  function isCharacter(key_code) {
    if (key_code >= FE.KEYCODE.ZERO &&
      key_code <= FE.KEYCODE.NINE) {

      return true
    }

    if (key_code >= FE.KEYCODE.NUM_ZERO &&
      key_code <= FE.KEYCODE.NUM_MULTIPLY) {

      return true
    }

    if (key_code >= FE.KEYCODE.A &&
      key_code <= FE.KEYCODE.Z) {

      return true
    }

    // Safari sends zero key code for non-latin characters.
    if (editor.browser.webkit && key_code === 0) {

      return true
    }

    switch (key_code) {
    case FE.KEYCODE.SPACE:
    case FE.KEYCODE.QUESTION_MARK:
    case FE.KEYCODE.NUM_PLUS:
    case FE.KEYCODE.NUM_MINUS:
    case FE.KEYCODE.NUM_PERIOD:
    case FE.KEYCODE.NUM_DIVISION:
    case FE.KEYCODE.SEMICOLON:
    case FE.KEYCODE.FF_SEMICOLON:
    case FE.KEYCODE.DASH:
    case FE.KEYCODE.EQUALS:
    case FE.KEYCODE.FF_EQUALS:
    case FE.KEYCODE.COMMA:
    case FE.KEYCODE.PERIOD:
    case FE.KEYCODE.SLASH:
    case FE.KEYCODE.APOSTROPHE:
    case FE.KEYCODE.SINGLE_QUOTE:
    case FE.KEYCODE.OPEN_SQUARE_BRACKET:
    case FE.KEYCODE.BACKSLASH:
    case FE.KEYCODE.CLOSE_SQUARE_BRACKET:

      return true
    default:

      return false
    }

  }

  let _typing_timeout
  let _temp_snapshot

  function _typingKeyDown(e) {
    const keycode = e.which

    if (ctrlKey(e) || keycode >= 37 && keycode <= 40 || !isCharacter(keycode) && keycode !== FE.KEYCODE.DELETE && keycode !== FE.KEYCODE.BACKSPACE && keycode !== FE.KEYCODE.ENTER && keycode !== FE.KEYCODE.IME) {
      return true
    }

    if (!_typing_timeout) {
      _temp_snapshot = editor.snapshot.get()

      if (!editor.undo.canDo()) {
        editor.undo.saveStep()
      }
    }

    clearTimeout(_typing_timeout)
    _typing_timeout = setTimeout(() => {
      _typing_timeout = null
      editor.undo.saveStep()
    }, Math.max(250, editor.opts.typingTimer))
  }

  function _typingKeyUp(e) {
    const keycode = e.which

    if (ctrlKey(e) || keycode >= 37 && keycode <= 40) {
      return true
    }

    if (_temp_snapshot && _typing_timeout) {
      editor.undo.saveStep(_temp_snapshot)
      _temp_snapshot = null
    }

    // iOS choosing suggestion.
    else if ((typeof keycode === 'undefined' || keycode === 0) && !_temp_snapshot && !_typing_timeout) {
      editor.undo.saveStep()
    }
  }

  function forceUndo() {
    if (_typing_timeout) {
      clearTimeout(_typing_timeout)
      editor.undo.saveStep()
      _temp_snapshot = null
    }
  }

  /**
   * Check if key event is part of browser accessibility.
   */
  function isBrowserAction(e) {
    const keycode = e.which

    return ctrlKey(e) || keycode === FE.KEYCODE.F5
  }

  // Node doesn't have a BR or text inside it.
  function _isEmpty(node) {
    if (node && node.tagName === 'BR') {
      return false
    }

    // No text and no BR.
    // Special case for image caption / video.
    try {
      return (node.textContent || '').length === 0 && node.querySelector && !node.querySelector(':scope > br') ||
        node.childNodes && node.childNodes.length === 1 && node.childNodes[0].getAttribute && (node.childNodes[0].getAttribute('contenteditable') === 'false' || editor.node.hasClass(node.childNodes[0], 'fr-img-caption'))
    }
    catch (ex) {
      return false
    }
  }

  /**
   * Allow typing after/before last element.
   */
  function _allowTypingOnEdges(e) {
    const childs = editor.el.childNodes
    const dt = editor.html.defaultTag()
    let deep_parent = editor.node.blockParent(editor.selection.blocks()[0])

    // https://github.com/froala-labs/froala-editor-js-2/issues/1571
    if (deep_parent && deep_parent.tagName == 'TR' && deep_parent.getAttribute('contenteditable') == undefined) {
      deep_parent = deep_parent.closest('table')
    }

    // https://github.com/CelestialSystem/froala-editor-js-2/tree/1303
    // get the selected text block parent as deep_parent
    // Check for content editable:false node and disable toolbar
    if (!editor.node.isEditable(e.target) || (deep_parent && deep_parent.getAttribute('contenteditable') === 'false')) {
      editor.toolbar.disable()
    }
    else {
      editor.toolbar.enable()
    }

    if (e.target && e.target !== editor.el) {
      return true
    }

    // No childs.
    if (childs.length === 0) {
      return true
    }

    // At the bottom.
    // https://github.com/froala/wysiwyg-editor/issues/3397
    if ((childs[0].offsetHeight + childs[0].offsetTop) <= e.offsetY) {
      if (_isEmpty(childs[childs.length - 1])) {
        if (dt) {
          editor.$el.append(`<${dt}>${FE.MARKERS}<br></${dt}>`)
        }
        else {
          editor.$el.append(`${FE.MARKERS}<br>`)
        }

        // Restore selection and scroll.
        editor.selection.restore()
        positionCaret()
      }
    }

    // At the top
    else if (e.offsetY <= 10) {
      if (_isEmpty(childs[0])) {
        if (dt) {
          editor.$el.prepend(`<${dt}>${FE.MARKERS}<br></${dt}>`)
        }
        else {
          editor.$el.prepend(`${FE.MARKERS}<br>`)
        }

        // Restore selection and scroll.
        editor.selection.restore()
        positionCaret()
      }
    }
  }

  function _clearTypingTimer() {
    if (_typing_timeout) {
      clearTimeout(_typing_timeout)
    }
  }

  /**
   * Tear up.
   */
  function _init() {
    editor.events.on('keydown', _typingKeyDown)
    editor.events.on('input', _input)
    editor.events.on('mousedown', _clearIME)
    editor.events.on('keyup input', _typingKeyUp)

    // Register for handling.
    editor.events.on('keypress', _mapKeyPress)
    editor.events.on('keydown', _mapKeyDown)
    editor.events.on('keyup', _mapKeyUp)
    editor.events.on('destroy', _clearTypingTimer)

    editor.events.on('html.inserted', _mapKeyUp)

    // Handle cut.
    editor.events.on('cut', _cut)

    // Click in editor at beginning / end.
    if (editor.opts.multiLine) {
      editor.events.on('click', _allowTypingOnEdges);
    }
  }

  return {
    _init,
    ctrlKey,
    isCharacter,
    isArrow,
    forceUndo,
    isIME,
    isBrowserAction,
    positionCaret
  }
}
