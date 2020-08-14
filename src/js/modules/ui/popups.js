import FE from '../../editor.js'

FE.POPUP_TEMPLATES = {
  'text.edit': '[_EDIT_]'
}

FE.RegisterTemplate = function (name, template) {
  FE.POPUP_TEMPLATES[name] = template
}

FE.MODULES.popups = function (editor) {
  const $ = editor.$
  let screenHeightofBrowser

  if (!editor.shared.popups) {
    editor.shared.popups = {}
  }
  let popups = editor.shared.popups

  // To store active popup buttons
  let $btnActivePopups

  function setContainer(id, $container) {
    if (!$container.isVisible()) {
      $container = editor.$sc
    }

    if (!$container.is(popups[id].data('container'))) {
      popups[id].data('container', $container)
      $container.append(popups[id])
    }
  }


  function setFileListHeight($popup) {
    $popup.find('.fr-upload-progress').addClass('fr-height-set')
    $popup.find('.fr-upload-progress').removeClass('fr-height-auto')
    editor.popups.get('filesManager.insert').removeClass('fr-height-auto')
    let activeLayerIndex
    $popup.find('.fr-files-upload-layer').hasClass('fr-active') ? activeLayerIndex = 1 : ''  
    $popup.find('.fr-files-by-url-layer').hasClass('fr-active') ? activeLayerIndex = 2 : ''
    $popup.find('.fr-files-embed-layer').hasClass('fr-active') ? activeLayerIndex = 3 : ''

    if($popup.find('.fr-upload-progress-layer').get(0).clientHeight + 10 < $popup.find('.fr-upload-progress').get(0).clientHeight)
    {
      $popup.find('.fr-upload-progress').addClass('fr-height-auto')
    }

    if($popup[0].clientHeight > 400)
      $popup[0].childNodes[4].style.height = `${$popup[0].clientHeight - ($popup[0].childNodes[0].clientHeight + $popup[0].childNodes[activeLayerIndex].clientHeight)-80}px`

  }

  let prevHeight = 2000
  function setPopupDimensions($popup, isDelete) {
    if (isDelete && $popup.find('.fr-upload-progress-layer').get(0).clientHeight < prevHeight) {
      $popup.find('.fr-upload-progress').addClass('fr-height-auto')
      editor.popups.get('filesManager.insert').addClass('fr-height-auto')
      $popup.find('.fr-upload-progress').removeClass('fr-height-set')
      prevHeight = 2000
    }
    if ($popup.get(0).clientHeight > window.innerHeight / 2) {
      if (window.innerWidth < 500) {
        if ($popup.get(0).clientHeight > screenHeightofBrowser * 0.6) {


          setFileListHeight($popup)
        }
      } else {
        if ($popup.get(0).clientHeight > 400) {


          setFileListHeight($popup)
        }
      }

      prevHeight = $popup.find('.fr-upload-progress-layer').get(0).clientHeight
    }
    let width = window.innerWidth
    switch (true) {
    case (width <= 320):
      $popup.width(200)
      break;
    case (width <= 420):
      $popup.width(250)
      break;
    case (width <= 520):
      $popup.width(300)
      break;
    case (width <= 720):
      $popup.width(400)
      break;
    case (width > 720):
      $popup.width(530)
      break;
    }
  }

  function refreshContainer(id, $container) {
    if (!$container.isVisible()) {
      $container = editor.$sc
    }

    if (!$container.contains([popups[id].get(0)])) {
      $container.append(popups[id])
    }
  }

  /**
 * Handles focus event on input boxes
 */
  function _inputRefreshEmptyOnFocus() {
    $(this).toggleClass('fr-not-empty', true)
  }

  /**
 * Handles blur event on input boxes
 */
  function _inputRefreshEmptyOnBlur() {
    const $elm = $(this)
    $elm.toggleClass('fr-not-empty', $elm.val() !== '')
  }

  /**
 * Remove placeholder and attach label next to input box for focus and blur transitions
 */
  function _addLabel($inputElms) {
    for (let i = 0; i < $inputElms.length; i++) {
      const elm = $inputElms[i]
      const $elm = $(elm)

      // Attach a label in place of placeholder for input box transition
      const $label = $elm.next()
      if ($label.length === 0 && $elm.attr('placeholder')) {
        $elm.after(`<label for="${$elm.attr('id')}">${$elm.attr('placeholder')}</label>`)

        // Remove placeholder
        $elm.attr('placeholder', '')
      }
    }
  }


  /**
   * Show popup at a specific position.
   */
  function show(id, left, top, obj_height, applyLeftOffset) {

    // Restore selection on show if it is there.
    if (!isVisible(id)) {
      if (areVisible() && editor.$el.find('.fr-marker').length > 0) {
        editor.events.disableBlur()
        editor.selection.restore()
      }
      else if (!areVisible()) {

        // We must have focus into editor because we may want to save selection.
        editor.events.disableBlur()
        editor.events.focus()
        editor.events.enableBlur()
      }
    }

    hideAll([id])

    if (!popups[id]) {
      return false
    }

    // Hide active dropdowns.
    const $active_dropdowns = editor.button.getButtons('.fr-dropdown.fr-active')
    $active_dropdowns.removeClass('fr-active').attr('aria-expanded', false).parents('.fr-toolbar').css('zIndex', '').find('> .fr-dropdown-wrapper').css('height', '')
    $active_dropdowns.next().attr('aria-hidden', true).css('overflow', '').find('> .fr-dropdown-wrapper').css('height', '')

    // Set the current instance for the popup.
    popups[id].data('instance', editor)

    if (editor.$tb) {
      editor.$tb.data('instance', editor)
    }

    const is_visible = isVisible(id)
    popups[id].addClass('fr-active').removeClass('fr-hidden').find('input, textarea').removeAttr('disabled')

    let $container = popups[id].data('container')

    refreshContainer(id, $container)

    // Inline mode when container is toolbar.
    if (editor.opts.toolbarInline && $container && editor.$tb && $container.get(0) === editor.$tb.get(0)) {
      setContainer(id, editor.$sc)
      top = editor.$tb.offset().top - editor.helpers.getPX(editor.$tb.css('margin-top'))
      left = editor.$tb.offset().left + editor.$tb.outerWidth() / 2

      if (editor.node.hasClass(editor.$tb.get(0), 'fr-above') && top) {
        top += editor.$tb.outerHeight()
      }

      obj_height = 0
    }

    // Apply iframe correction.
    $container = popups[id].data('container')

    if (editor.opts.iframe && !obj_height && !is_visible) {
      const iframePaddingTop = editor.helpers.getPX(editor.$wp.find('.fr-iframe').css('padding-top'))
      const iframePaddingLeft = editor.helpers.getPX(editor.$wp.find('.fr-iframe').css('padding-left'))
      if (left) {
        left -= editor.$iframe.offset().left + iframePaddingLeft
      }

      if (top) {
        top -= editor.$iframe.offset().top + iframePaddingTop
      }
    }

    // If container is toolbar then increase zindex.
    if ($container.is(editor.$tb)) {
      editor.$tb.css('zIndex', (editor.opts.zIndex || 1) + 4)
    }
    else {
      popups[id].css('zIndex', (editor.opts.zIndex || 1) + 3)
    }

    // Toolbar at the bottom and container is toolbar.
    if (editor.opts.toolbarBottom && $container && editor.$tb && $container.get(0) === editor.$tb.get(0)) {
      popups[id].addClass('fr-above')

      if (top) {
        top -= popups[id].outerHeight()
      }
    }

    // Add popup offset left offset based on the popup width
    if (applyLeftOffset) {
      left -= popups[id].width() / 2
    }
    
    // Check if it exceeds window on the right.
    if (left + popups[id].outerWidth() > editor.$sc.offset().left + editor.$sc.width()) {
      left -= (left + popups[id].outerWidth() - editor.$sc.offset().left - editor.$sc.width())
    }

    // Check if it exceeds window on the left.
    if (left < editor.$sc.offset().left && editor.opts.direction === 'rtl') {
      left = editor.$sc.offset().left
    }

    // Position editor.
    popups[id].removeClass('fr-active')
    editor.position.at(left, top, popups[id], obj_height || 0)
    popups[id].addClass('fr-active')

    if (!is_visible) {
      editor.accessibility.focusPopup(popups[id])
    }

    if (editor.opts.toolbarInline) {
      editor.toolbar.hide()
    }

    // Update the button for active popup
    if (editor.$tb) {
      $btnActivePopups = editor.$tb.find('.fr-btn-active-popup')
    }
    editor.events.trigger(`popups.show.${id}`)

    // https://github.com/froala/wysiwyg-editor/issues/1248
    _events(id)._repositionPopup()

    _unmarkExit()
  }

  function onShow(id, callback) {
    editor.events.on(`popups.show.${id}`, callback)
  }

  /**
   * Find visible popup.
   */
  function isVisible(id) {
    return popups[id] && editor.node.hasClass(popups[id], 'fr-active') && editor.core.sameInstance(popups[id]) || false
  }

  /**
   * Check if there is any popup visible.
   */
  function areVisible(new_instance) {
    for (const id in popups) {
      if (Object.prototype.hasOwnProperty.call(popups, id)) {
        if (isVisible(id) && (typeof new_instance === 'undefined' || popups[id].data('instance') === new_instance)) {
          return popups[id]
        }
      }
    }

    return false
  }

  /**
   * Hide popup.
   */
  function hide(id) {
    let $popup = null

    if (typeof id !== 'string') {
      $popup = id
    }
    else {
      $popup = popups[id]
    }

    if(id === 'filesManager.insert' && (editor.filesManager !== undefined) && editor.filesManager.isChildWindowOpen()){
      return false
    }

    if ($popup && editor.node.hasClass($popup, 'fr-active')) {
      $popup.removeClass('fr-active fr-above')
      editor.events.trigger(`popups.hide.${id}`)

      // Reset toolbar zIndex.
      if (editor.$tb) {
        if (editor.opts.zIndex > 1) {
          editor.$tb.css('zIndex', editor.opts.zIndex + 1)
        }
        else {
          editor.$tb.css('zIndex', '')
        }
      }

      editor.events.disableBlur()
      $popup.find('input, textarea, button').each(function () {
        if (this === this.ownerDocument.activeElement) {
          this.blur()
        }
      })

      // Mark the input boxes as empty
      $popup.find('input, textarea').attr('disabled', 'disabled')

      // Remove styling from active popup buttons when popup is closed
      if ($btnActivePopups) {
        for (let index = 0; index < $btnActivePopups.length; index++) {
          $($btnActivePopups[index]).removeClass('fr-btn-active-popup')
        }
      }
    }
  }

  /**
   * Assign an event for hiding.
   */
  function onHide(id, callback) {
    editor.events.on(`popups.hide.${id}`, callback)
  }

  /**
   * Get the popup with the specific id.
   */
  function get(id) {
    const $popup = popups[id]

    if ($popup && !$popup.data(`inst${editor.id}`)) {
      const ev = _events(id)
      _bindInstanceEvents(ev, id)
    }

    return $popup
  }

  function onRefresh(id, callback) {
    editor.events.on(`popups.refresh.${id}`, callback)
  }

  /**
   * Refresh content inside the popup.
   */
  function refresh(id) {
    // Set the instance id for the popup.
    popups[id].data('instance', editor)

    editor.events.trigger(`popups.refresh.${id}`)

    const btns = popups[id].find('.fr-command')

    for (let i = 0; i < btns.length; i++) {
      const $btn = $(btns[i])

      if ($btn.parents('.fr-dropdown-menu').length === 0) {
        editor.button.refresh($btn)
      }
    }
  }

  /**
   * Hide all popups.
   */
  function hideAll(except) {
    if (typeof except === 'undefined') {
      except = []
    }

    for (const id in popups) {
      if (Object.prototype.hasOwnProperty.call(popups, id)) {
        if (except.indexOf(id) < 0) {
          hide(id)
        }
      }
    }
  }

  editor.shared.exit_flag = false

  function _markExit() {
    editor.shared.exit_flag = true
  }

  function _unmarkExit() {
    editor.shared.exit_flag = false
  }

  function _canExit() {
    return editor.shared.exit_flag
  }

  function _buildTemplate(id, template) {

    // Load template.
    let html = FE.POPUP_TEMPLATES[id]

    if (!html) {
      return null
    }

    if (typeof html === 'function') {
      html = html.apply(editor)
    }

    for (const nm in template) {
      if (Object.prototype.hasOwnProperty.call(template, nm)) {
        html = html.replace(`[_${nm.toUpperCase()}_]`, template[nm])
      }
    }

    return html
  }

  function _build(id, template) {
    let $container
    const html = _buildTemplate(id, template)

    const $popup = $(editor.doc.createElement('DIV'))
    if (!html) {
      
      if (id === 'filesManager.insert') {
        $popup.addClass('fr-popup fr-files-manager fr-empty')
      } else {
        $popup.addClass('fr-popup fr-empty')
      }

      $container = $('body').first()
      $container.append($popup)
      $popup.data('container', $container)

      popups[id] = $popup

      return $popup
    }

    if (id === 'filesManager.insert') {
      $popup.addClass(`fr-popup fr-files-manager${editor.helpers.isMobile() ? ' fr-mobile' : ' fr-desktop'}${editor.opts.toolbarInline ? ' fr-inline' : ''}`)
    } else {
      $popup.addClass(`fr-popup${editor.helpers.isMobile() ? ' fr-mobile' : ' fr-desktop'}${editor.opts.toolbarInline ? ' fr-inline' : ''}`)
    }

    $popup.html(html)

    if (editor.opts.theme) {
      $popup.addClass(`${editor.opts.theme}-theme`)
    }

    if (editor.opts.zIndex > 1) {
      if (!editor.opts.editInPopup && editor.$tb) {
        editor.$tb.css('z-index', editor.opts.zIndex + 2)
      }
      else {
        $popup.css('z-index', editor.opts.zIndex + 2)
      }
    }

    if (editor.opts.direction !== 'auto') {
      $popup.removeClass('fr-ltr fr-rtl').addClass(`fr-${editor.opts.direction}`)
    }

    $popup.find('input, textarea').attr('dir', editor.opts.direction).attr('disabled', 'disabled')

    $container = $('body').first()
    $container.append($popup)
    $popup.data('container', $container)

    popups[id] = $popup

    const $colorHexLayer = $popup.find('.fr-color-hex-layer')
    if ($colorHexLayer.length > 0) {
      const spanWidth = editor.helpers.getPX($popup.find('.fr-color-set > span').css('width'))
      const paddingLeft = editor.helpers.getPX($colorHexLayer.css('paddingLeft'))
      const paddingRight = editor.helpers.getPX($colorHexLayer.css('paddingRight'))
      $colorHexLayer.css('width', spanWidth * editor.opts.colorsStep + paddingLeft + paddingRight)
    }

    // Bind commands from the popup.
    editor.button.bindCommands($popup, false)

    return $popup
  }

  function _events(id) {
    const $popup = popups[id]

    return {
      /**
       * Resize window.
       */
      _windowResize() {
        const inst = $popup.data('instance') || editor
        if (!inst.helpers.isMobile() && $popup.isVisible()) {
          inst.events.disableBlur()
          inst.popups.hide(id)
          inst.events.enableBlur()
        }
      },

      /**
       * Focus on an input.
       */
      _inputFocus(e) {
        const inst = $popup.data('instance') || editor

        const $target = $(e.currentTarget)

        if ($target.is('input:file')) {
          $target.closest('.fr-layer').addClass('fr-input-focus')
        }

        e.preventDefault()
        e.stopPropagation()

        // IE workaround.
        setTimeout(() => {
          inst.events.enableBlur()
        }, 100)

        // Reposition scroll on mobile to the original one.
        if (inst.helpers.isMobile()) {
          const t = $(inst.o_win).scrollTop()
          setTimeout(() => {
            $(inst.o_win).scrollTop(t)
          }, 0)
        }
      },

      /**
       * Blur on an input.
       */
      _inputBlur(e) {
        const inst = $popup.data('instance') || editor

        const $target = $(e.currentTarget)

        if ($target.is('input:file')) {
          $target.closest('.fr-layer').removeClass('fr-input-focus')
        }

        // Do not do blur on window change.
        if (document.activeElement !== this && $(this).isVisible()) {
          if (inst.events.blurActive()) {
            inst.events.trigger('blur')
          }

          inst.events.enableBlur()
        }
      },

      /**
       * Editor keydown.
       */
      _editorKeydown(e) {
        const inst = $popup.data('instance') || editor

        // ESC.
        if (!inst.keys.ctrlKey(e) && e.which !== FE.KEYCODE.ALT && e.which !== FE.KEYCODE.ESC) {
          if (isVisible(id) && $popup.findVisible('.fr-back').length) {
            inst.button.exec($popup.findVisible('.fr-back').first())
          }
          // Don't hide if alt alone is pressed to allow Alt + F10 shortcut for accessibility.
          else if (e.which !== FE.KEYCODE.ALT) {
            inst.popups.hide(id)
          }
        }
      },

      /**
       * Handling hitting the popup elements with the mouse.
       */
      _preventFocus(e) {
        const inst = $popup.data('instance') || editor

        // Get the original target.
        const originalTarget = e.originalEvent ? e.originalEvent.target || e.originalEvent.originalTarget : null

        // Do not disable blur on mouseup because it is the last event in the chain.
        if (e.type !== 'mouseup' && !$(originalTarget).is(':focus')) {
          inst.events.disableBlur()
        }

        // Hide popup's active dropdowns on mouseup.
        if (e.type === 'mouseup' && !($(originalTarget).hasClass('fr-command') || $(originalTarget).parents('.fr-command').length > 0) && !$(originalTarget).hasClass('fr-dropdown-content')) {
          editor.button.hideActiveDropdowns($popup)
        }

        // https://github.com/froala/wysiwyg-editor/issues/1733
        // https://github.com/froala/wysiwyg-editor/issues/1838 . Firefox: with Jquery > 2 $(originalTarget).is(':focus') returns the oposite to Jquery < 2.
        if ((editor.browser.safari || editor.browser.mozilla) && e.type === 'mousedown' && $(originalTarget).is('input[type=file]')) {
          inst.events.disableBlur()
        }

        // Define the input selector.
        const input_selector = 'input, textarea, button, select, label, .fr-command'

        // Click was not made inside an input.
        if (originalTarget && !$(originalTarget).is(input_selector) && $(originalTarget).parents(input_selector).length === 0) {
          e.stopPropagation()

          return false
        }

        // Click was made on another input inside popup. Prevent propagation of the event.
        else if (originalTarget && $(originalTarget).is(input_selector)) {
          e.stopPropagation()
        }

        _unmarkExit()
      },

      /**
       * Mouseup inside the editor.
       */
      _editorMouseup() {

        // Check if popup is visible and we can exit.
        if ($popup.isVisible() && _canExit()) {

          // If we have an input focused, then disable blur.
          if ($popup.findVisible('input:focus, textarea:focus, button:focus, select:focus').length > 0) {
            editor.events.disableBlur()
          }
        }
      },

      /**
       * Mouseup on window.
       */
      _windowMouseup(e) {
        if (!editor.core.sameInstance($popup)) {
          return true
        }

        const inst = $popup.data('instance') || editor

        if ($popup.isVisible() && _canExit()) {
          e.stopPropagation()
          inst.markers.remove()
          inst.popups.hide(id)

          _unmarkExit()
        }
      },

      /**
       * Keydown on window.
       */
      _windowKeydown(e) {
        if (!editor.core.sameInstance($popup)) {
          return true
        }

        const inst = $popup.data('instance') || editor

        const key_code = e.which

        // ESC.
        if (FE.KEYCODE.ESC === key_code) {
          if (inst.popups.isVisible(id) && inst.opts.toolbarInline) {
            e.stopPropagation()

            if (inst.popups.isVisible(id)) {
              if ($popup.findVisible('.fr-back').length) {
                inst.button.exec($popup.findVisible('.fr-back').first())

                // Focus back popup button.
                inst.accessibility.focusPopupButton($popup)
              }
              else if ($popup.findVisible('.fr-dismiss').length) {
                inst.button.exec($popup.findVisible('.fr-dismiss').first())
              }
              else {
                inst.popups.hide(id)
                inst.toolbar.showInline(null, true)

                // Focus back popup button.
                inst.accessibility.focusPopupButton($popup)
              }
            }

            return false
          }
          else if (inst.popups.isVisible(id)) {
            if ($popup.findVisible('.fr-back').length) {
              inst.button.exec($popup.findVisible('.fr-back').first)

              // Focus back popup button.
              inst.accessibility.focusPopupButton($popup)
            }
            else if ($popup.findVisible('.fr-dismiss').length) {
              inst.button.exec($popup.findVisible('.fr-dismiss').first())
            }
            else {
              inst.popups.hide(id)

              // Focus back popup button.
              inst.accessibility.focusPopupButton($popup)
            }

            return false
          }
        }
      },

      /**
       * Reposition popup.
       */
      _repositionPopup() {

        // No height set or toolbar inline.
        if (!(editor.opts.height || editor.opts.heightMax) || editor.opts.toolbarInline) {
          return true
        }

        if (editor.$wp && isVisible(id) && $popup.parent().get(0) === editor.$sc.get(0)) {

          // Popup top - wrapper top.
          let p_top = $popup.offset().top - editor.$wp.offset().top

          // Wrapper height.
          const w_height = editor.$wp.outerHeight()

          if (editor.node.hasClass($popup.get(0), 'fr-above')) {
            p_top += $popup.outerHeight()
          }

          // 1. Popup top > w_height.
          // 2. Popup top + popup height < 0.
          if (p_top > w_height || p_top < 0) {
            $popup.addClass('fr-hidden')
          }
          else {
            $popup.removeClass('fr-hidden')
          }
        }
      }
    }
  }

  function _bindInstanceEvents(ev, id) {

    // Editor mouseup.
    editor.events.on('mouseup', ev._editorMouseup, true)

    if (editor.$wp) {
      editor.events.on('keydown', ev._editorKeydown)
    }

    // Remove popup class on focus as pop up will be hidden on focus of editor
    editor.events.on('focus', () => {
      popups[id].removeClass('focused');
    })

    // Hide all popups on blur.
    editor.events.on('blur', () => {
      if (areVisible()) {
        editor.markers.remove()
      }
      
      // https://github.com/froala-labs/froala-editor-js-2/issues/2044
      if (editor.helpers.isMobile()) {

        if (popups[id].hasClass('focused')) {
          hideAll()
          popups[id].removeClass('focused')
        } else {
          popups[id].addClass('focused')
        }
      } else {

        // https://github.com/froala-labs/froala-editor-js-2/issues/858
        if (!popups[id].find('iframe').length) {
          hideAll()
        }
      }
    })

    // Update the position of the popup.
    if (editor.$wp && !editor.helpers.isMobile()) {
      editor.events.$on(editor.$wp, `scroll.popup${id}`, ev._repositionPopup)
    }

    editor.events.on('window.mouseup', ev._windowMouseup, true)
    editor.events.on('window.keydown', ev._windowKeydown, true)

    popups[id].data(`inst${editor.id}`, true)

    editor.events.on('destroy', () => {
      if (editor.core.sameInstance(popups[id])) {
        $('body').first().append(popups[id])
        popups[id].removeClass('fr-active')
      }
    }, true)
  }

  /**
   * Handles a checkbox label click event
   */
  function _checkboxLabelClick() {
    // Get checkbox next to the label
    const $checkbox = $(this).prev().children().first()

    // Toggle the checkbox
    $checkbox.attr('checked', !$checkbox.attr('checked'))
  }

  /**
   * Create a popup.
   */
  function create(id, template) {
    const $popup = _build(id, template)

    // Build events.
    const ev = _events(id)

    // Events binded here should be assigned in every instace.
    _bindInstanceEvents(ev, id)

    // Input Focus / Blur / Keydown.
    editor.events.$on($popup, 'mousedown mouseup touchstart touchend touch', '*', ev._preventFocus, true)
    editor.events.$on($popup, 'focus', 'input, textarea, button, select', ev._inputFocus, true)
    editor.events.$on($popup, 'blur', 'input, textarea, button, select', ev._inputBlur, true)

    // Attach focus and blur events for transitions
    let $labelElms = $popup.find('input, textarea')
    _addLabel($labelElms)

    editor.events.$on($labelElms, 'focus', _inputRefreshEmptyOnFocus)
    editor.events.$on($labelElms, 'blur change', _inputRefreshEmptyOnBlur)

    // Toggle the checkbox on click on label
    editor.events.$on($popup, 'click', '.fr-checkbox + label', _checkboxLabelClick)

    // Register popup to handle keyboard accessibility.
    editor.accessibility.registerPopup(id)

    // Toggle checkbox.
    if (editor.helpers.isIOS()) {
      editor.events.$on($popup, 'touchend', 'label', function () {
        $(`#${$(this).attr('for')}`).prop('checked', (i, val) => !val)
      }, true)
    }

    // Window mouseup.
    editor.events.$on($(editor.o_win), 'resize', ev._windowResize, true)

    if (id === 'filesManager.insert') {
      popups['filesManager.insert'].css('zIndex', 2147483641)
    }
    return $popup
  }

  /**
   * Destroy.
   */
  function _destroy() {
    for (const id in popups) {
      if (Object.prototype.hasOwnProperty.call(popups, id)) {
        const $popup = popups[id]

        if ($popup) {
          $popup.html('').removeData().remove()
          popups[id] = null
        }
      }
    }

    popups = []
  }

  /**
   * Initialization.
   */
  function _init() {
    screenHeightofBrowser = window.innerHeight
    editor.events.on('shared.destroy', _destroy, true)

    editor.events.on('window.mousedown', _markExit)
    editor.events.on('window.touchmove', _unmarkExit)

    // Prevent hiding popups while we scroll.
    editor.events.$on($(editor.o_win), 'scroll', _unmarkExit)

    editor.events.on('mousedown', (e) => {
      if (areVisible()) {
        e.stopPropagation()

        // Remove markers.
        editor.$el.find('.fr-marker').remove()

        // Prepare for exit.
        _markExit()

        // Disable blur.
        editor.events.disableBlur()
      }
    })
  }

  return {
    _init,
    create,
    get,
    show,
    hide,
    onHide,
    hideAll,
    setContainer,
    refresh,
    onRefresh,
    onShow,
    isVisible,
    setFileListHeight,
    areVisible,
    setPopupDimensions
  }
}
