import '../ui/popups.js'

import FE from '../../editor.js'

FE.MODULES.accessibility = function (editor) {
  const $ = editor.$

  // Flag to tell if mouseenter can blur popup elements with tabindex. This is in case that popup shows over the cursor so mouseenter should not blur immediately.
  // FireFox issue.
  let can_blur = true

  /*
   * Focus an element.
   */
  function focusToolbarElement($el) {
    const contenteditableEl = editor.$el.find('[contenteditable="true"]')
    let focusedEditableEl = false
    let ind = 0
    // Check if there is a contenteditable element in focus.
    while (contenteditableEl.get(ind)) {
      if ($(contenteditableEl.get(ind)).is(':focus')) {
        focusedEditableEl = true
      }
      ind++
    }
    // Check if it is empty.
    // https://github.com/froala/wysiwyg-editor/issues/2427.
    if (!$el || !$el.length || focusedEditableEl) {
      return
    }

    // Add blur event handler on the element that do not reside on a popup.
    if (!$el.data('blur-event-set') && !$el.parents('.fr-popup').length) {

      // Set shared event for blur on element because it resides in a popup.
      editor.events.$on($el, 'blur', () => {

        // Get current instance.
        const inst = $el.parents('.fr-toolbar, .fr-popup').data('instance') || editor

        // Check if we should actually trigger blur.
        if (inst.events.blurActive()  && !editor.core.hasFocus()) {
          inst.events.trigger('blur')
        }

        // Allow blur.
        // IE hack.
        setTimeout(() => {
          inst.events.enableBlur()
        }, 100)
      }, true)

      $el.data('blur-event-set', true)
    }

    // Get current instance.
    const inst = $el.parents('.fr-toolbar, .fr-popup').data('instance') || editor

    // Do not allow blur on the editor until element focus.
    inst.events.disableBlur()
    $el.get(0).focus()

    // Store it as the current focused element.
    editor.shared.$f_el = $el
  }

  /*
   * Focus first or last toolbar button.
   */
  function focusToolbar($tb, last) {
    const position = last ? 'last' : 'first'
    // Get all toobar buttons.
    // Re-order the toolbar buttons
    const $btn = _reorderToolbarButtons(_getVisibleToolbarButtons($tb))[position]()

    if ($btn.length) {
      focusToolbarElement($btn)

      return true
    }
  }

  /*
   * Focus a popup content element.
   */
  function focusContentElement($el) {

    // Save editor selection only if the element we want to focus is input text or textarea.
    if ($el.is('input, textarea, select')) {
      saveSelection()
    }

    editor.events.disableBlur()
    $el.get(0).focus()

    return true
  }

  /*
   * Focus popup's content.
   */
  function focusContent($content, backward) {

    // First input.
    let $first_input = $content.find('input, textarea, button, select').filter(function () {
      return $(this).isVisible()
    }).not(':disabled')

    $first_input = backward ? $first_input.last() : $first_input.first()

    if ($first_input.length) {
      return focusContentElement($first_input)
    }

    if (editor.shared.with_kb) {

      // Active item.
      const $active_item = $content.findVisible('.fr-active-item').first()

      if ($active_item.length) {
        return focusContentElement($active_item)
      }

      // First element with tabindex.
      const $first_tab_index = $content.findVisible('[tabIndex]').first()

      if ($first_tab_index.length) {
        return focusContentElement($first_tab_index)
      }
    }
  }

  function saveSelection() {
    if (editor.$el.find('.fr-marker').length === 0 && editor.core.hasFocus()) {
      editor.selection.save()
    }
  }

  function restoreSelection() {

    // Restore selection.
    if (editor.$el.find('.fr-marker').length) {
      editor.events.disableBlur()
      editor.selection.restore()
      editor.events.enableBlur()
    }
  }

  /*
   * Focus popup.
   */
  function focusPopup($popup) {

    // Get popup content without fr-buttons toolbar.
    const $popup_content = $popup.children().not('.fr-buttons')

    // Blur popup on mouseenter.
    if (!$popup_content.data('mouseenter-event-set')) {
      editor.events.$on($popup_content, 'mouseenter', '[tabIndex]', (e) => {
        const inst = $popup.data('instance') || editor

        // FireFox issue.
        if (!can_blur) {

          // Popup showed over the cursor.
          e.stopPropagation()
          e.preventDefault()

          return
        }
        const $focused_item = $popup_content.find(':focus').first()

        if ($focused_item.length && !$focused_item.is('input, button, textarea, select')) {
          inst.events.disableBlur()
          $focused_item.blur()
          inst.events.disableBlur()
          inst.events.focus()
        }
      })

      $popup_content.data('mouseenter-event-set', true)
    }

    // Focus content if possible, else focus toolbar if the popup is opened with keyboard.
    if (!focusContent($popup_content) && editor.shared.with_kb) {
      focusToolbar($popup.find('.fr-buttons'))
    }
  }

  /*
   * Focus modal.
   */
  function focusModal($modal) {

    // Make sure we have focus on editing area.
    if (!editor.core.hasFocus()) {
      editor.events.disableBlur()
      editor.events.focus()
    }

    // Save selection.
    editor.accessibility.saveSelection()
    editor.events.disableBlur()

    // Blur editor and clear selection to enable arrow keys scrolling.
    editor.el.blur()
    editor.selection.clear()

    editor.events.disableBlur()

    if (editor.shared.with_kb) {
      $modal.find('.fr-command[tabIndex], [tabIndex]').first().focus()
    }
    else {
      $modal.find('[tabIndex]').first().focus()
    }
  }

  /*
   * Focus popup toolbar or main toolbar.
   */
  function focusToolbars() {

    // Look for active popup.
    const $popup = editor.popups.areVisible()

    if ($popup) {
      const $tb = $popup.find('.fr-buttons')

      if (!$tb.find('button:focus, .fr-group span:focus').length) {
        return !focusToolbar($tb)
      }

      return !focusToolbar($popup.data('instance').$tb)

    }

    // Focus main toolbar if no others were found.
    return !focusToolbar(editor.$tb)
  }

  /*
   * Get the dropdown button that is active and is focused or is active and its commands are focused.
   */
  function _getActiveFocusedDropdown() {
    let $activeDropdown = null

    // Is active and focused.
    if (editor.shared.$f_el.is('.fr-dropdown.fr-active')) {
      $activeDropdown = editor.shared.$f_el
    }

    // Is active and its commands are focused. editor.shared.$f_el is a dropdown command.
    else if (editor.shared.$f_el.closest('.fr-dropdown-menu').prev().is('.fr-dropdown.fr-active')) {
      $activeDropdown = editor.shared.$f_el.closest('.fr-dropdown-menu').prev()
    }

    return $activeDropdown
  }

  /**
   * Insert the more toolbar buttons after its corresponding more button
   */
  function _reorderToolbarButtons($buttons) {

    // Get the more button position
    let moreBtnIndex = -1
    for (let i = 0; i < $buttons.length; i++) {
      if ($($buttons[i]).hasClass('fr-open')) {
        moreBtnIndex = i
      }
    }

    // Get first open more toolbar button position
    let firstMoreToolbarBtnIndex = $buttons.index(editor.$tb.find('.fr-more-toolbar.fr-expanded > button.fr-command').first())

    // If atleast one more toolbar is expanded
    if (firstMoreToolbarBtnIndex > 0 && moreBtnIndex !== -1) {
      // Insert the more toolbar buttons after its more button
      const $moreToolbarBtns = $buttons.slice(firstMoreToolbarBtnIndex, $buttons.length)
      $buttons = $buttons.slice(0, firstMoreToolbarBtnIndex)
      const left = $buttons.slice(0, moreBtnIndex + 1)
      const right = $buttons.slice(moreBtnIndex + 1, $buttons.length)
      
      $buttons = left
      
      for (let i = 0; i < $moreToolbarBtns.length; i++) {
        $buttons.push($moreToolbarBtns[i])
      }

      for (let i = 0; i < right.length; i++) {
        $buttons.push(right[i])
      }
    }

    return $buttons
  }
  
  /**
   * Returns the visible toolbar buttons
   */
  function _getVisibleToolbarButtons($tb) {
    return $tb.findVisible('button:not(.fr-disabled), .fr-group span.fr-command').filter((btn) => {
      const $moreToolbar = $(btn).parents('.fr-more-toolbar')
      // Remove all the buttons which are not part of the open more toolbar
      return ($moreToolbar.length === 0 || ($moreToolbar.length > 0 && $moreToolbar.hasClass('fr-expanded')))
    })
  }

  function _moveHorizontally($tb, tab_key, forward) {
    if (editor.shared.$f_el) {
      const $activeDropdown = _getActiveFocusedDropdown()

      // A focused active dropdown button.
      if ($activeDropdown) {

        // Unclick.
        editor.button.click($activeDropdown)
        editor.shared.$f_el = $activeDropdown
      }

      // Focus the next/previous button.

      // Get all toobar buttons.
      // Re-order the toolbar buttons
      const $buttons = _reorderToolbarButtons(_getVisibleToolbarButtons($tb))

      // Get focused button position.
      let index = $buttons.index(editor.shared.$f_el)
      
      // Last or first button reached.
      if (index === 0 && !forward || index === $buttons.length - 1 && forward) {
        let status

        // Focus content if last or first toolbar button is reached.
        if (tab_key) {
          if ($tb.parent().is('.fr-popup')) {
            const $popup_content = $tb.parent().children().not('.fr-buttons')
            status = !focusContent($popup_content, !forward)
          }

          if (status === false) {
            editor.shared.$f_el = null
          }
        }

        // Arrow used or popup listeners were not active.
        if (!tab_key || status !== false) {

          // Focus to the opposite side button of the toolbar.
          focusToolbar($tb, !forward)
        }
      }
      else {

        // Focus next or previous button.
        focusToolbarElement($($buttons.get(index + (forward ? 1 : -1))))
      }

      return false
    }
  }

  function moveForward($tb, tab_key) {
    return _moveHorizontally($tb, tab_key, true)
  }

  function moveBackward($tb, tab_key) {
    return _moveHorizontally($tb, tab_key)
  }

  function _moveVertically(down) {
    if (editor.shared.$f_el) {

      let $destination

      // Dropdown button.
      if (editor.shared.$f_el.is('.fr-dropdown.fr-active')) {

        // Focus the first/last dropdown command.
        if (down) {
          $destination = editor.shared.$f_el.next().find('.fr-command:not(.fr-disabled)').first()
        }
        else {
          $destination = editor.shared.$f_el.next().find('.fr-command:not(.fr-disabled)').last()
        }

        focusToolbarElement($destination)

        return false
      }

      // Dropdown command.
      else if (editor.shared.$f_el.is('a.fr-command')) {

        // Focus the previous/next dropdown command.
        if (down) {
          $destination = editor.shared.$f_el.closest('li').nextAllVisible().first().find('.fr-command:not(.fr-disabled)').first()
        }
        else {
          $destination = editor.shared.$f_el.closest('li').prevAllVisible().first().find('.fr-command:not(.fr-disabled)').first()
        }

        // Last or first button reached: Focus to the opposite side element of the dropdown.
        if (!$destination.length) {
          if (down) {
            $destination = editor.shared.$f_el.closest('.fr-dropdown-menu').find('.fr-command:not(.fr-disabled)').first()
          }
          else {
            $destination = editor.shared.$f_el.closest('.fr-dropdown-menu').find('.fr-command:not(.fr-disabled)').last()
          }
        }

        focusToolbarElement($destination)

        return false
      }
    }
  }

  function moveDown() {

    // Also enable dropdown opening on arrow down.
    if (editor.shared.$f_el && editor.shared.$f_el.is('.fr-dropdown:not(.fr-active)')) {
      return enter()
    }

    return _moveVertically(true)

  }

  function moveUp() {
    return _moveVertically()
  }

  function enter() {
    if (editor.shared.$f_el) {

      // Check if the focused element is a dropdown button.
      if (editor.shared.$f_el.hasClass('fr-dropdown')) {

        // Do click and focus the first dropdown item.
        editor.button.click(editor.shared.$f_el)
      }
      else if (editor.shared.$f_el.is('button.fr-back')) {
        if (editor.opts.toolbarInline) {
          editor.events.disableBlur()
          editor.events.focus()
        }
        const $popup = editor.popups.areVisible(editor)

        // Previous popup will show up so we need to not default focus the popup because back popup button have to be focused.
        if ($popup) {
          editor.shared.with_kb = false
        }

        editor.button.click(editor.shared.$f_el)

        // Focus back popup button.
        focusPopupButton($popup)
      }
      else {
        editor.events.disableBlur()
        editor.button.click(editor.shared.$f_el)

        // If it is a more button
        if (editor.shared.$f_el.attr('data-group-name')) {
          // Focus the first active button in the more toolbar only if the more toolbar is open
          const $moreToolbar = editor.$tb.find(`.fr-more-toolbar[data-name="${editor.shared.$f_el.attr('data-group-name')}"]`)
          let $btn = editor.shared.$f_el
          if ($moreToolbar.hasClass('fr-expanded')) {
            $btn = $moreToolbar.findVisible('button:not(.fr-disabled)')['first']()
          }
          if ($btn) {
            focusToolbarElement($btn)
          }
        }
        else if (editor.shared.$f_el.attr('data-popup')) {

          // Attach button to visible popup.
          const $visible_popup = editor.popups.areVisible(editor)

          if ($visible_popup) {
            $visible_popup.data('popup-button', editor.shared.$f_el)
          }
        }
        else if (editor.shared.$f_el.attr('data-modal')) {

          // Attach button to visible modal.
          const $visible_modal = editor.modals.areVisible(editor)

          if ($visible_modal) {
            $visible_modal.data('modal-button', editor.shared.$f_el)
          }
        }

        editor.shared.$f_el = null
      }

      return false
    }
  }

  function focusEditor() {
    if (editor.shared.$f_el) {
      editor.events.disableBlur()
      editor.shared.$f_el.blur()
      editor.shared.$f_el = null
    }

    // Trigger custom behavior.
    if (editor.events.trigger('toolbar.focusEditor') === false) {
      return
    }

    editor.events.disableBlur()
    editor.$el.get(0).focus()
    editor.events.focus()
  }

  function esc($tb) {
    if (editor.shared.$f_el) {
      const $activeDropdown = _getActiveFocusedDropdown()

      // Active focused dropdown.
      if ($activeDropdown) {

        // Unclick.
        editor.button.click($activeDropdown)

        // Focus the unactive dropdown.
        focusToolbarElement($activeDropdown)
      }

      // Toolbar contains a back button.
      else if ($tb.parent().findVisible('.fr-back').length) {
        editor.shared.with_kb = false

        if (editor.opts.toolbarInline) {

          // Toolbar inline needs focus in order to show up.
          editor.events.disableBlur()
          editor.events.focus()
        }
        editor.button.exec($tb.parent().findVisible('.fr-back')).first()

        // Focus back popup button.
        focusPopupButton($tb.parent())
      }

      // A toolbar that gets opened from the editable area.
      else if (editor.shared.$f_el.is('button, .fr-group span')) {
        if ($tb.parent().is('.fr-popup')) {

          // Restore selection.
          editor.accessibility.restoreSelection()
          editor.shared.$f_el = null

          // Trigger custom behaviour.
          if (editor.events.trigger('toolbar.esc') !== false) {

            // Default behaviour.
            // Hide popup.
            editor.popups.hide($tb.parent())

            // Show inline toolbar.
            if (editor.opts.toolbarInline) {
              editor.toolbar.showInline(null, true)
            }

            // Focus back popup button.
            focusPopupButton($tb.parent())
          }
        }
        else {
          focusEditor()
        }
      }

      return false
    }
  }

  /*
   * Execute shortcut.
   */
  function exec(e, $tb) {
    const ctrlKey = navigator.userAgent.indexOf('Mac OS X') !== -1 ? e.metaKey : e.ctrlKey

    const keycode = e.which

    let status = false

    // Tab.
    if (keycode === FE.KEYCODE.TAB && !ctrlKey && !e.shiftKey && !e.altKey) {
      status = moveForward($tb, true)
    }

    // Arrow right -> .
    else if (keycode === FE.KEYCODE.ARROW_RIGHT && !ctrlKey && !e.shiftKey && !e.altKey) {
      status = moveForward($tb)
    }

    // Shift + Tab.
    else if (keycode === FE.KEYCODE.TAB && !ctrlKey && e.shiftKey && !e.altKey) {
      status = moveBackward($tb, true)
    }

    // Arrow left <- .
    else if (keycode === FE.KEYCODE.ARROW_LEFT && !ctrlKey && !e.shiftKey && !e.altKey) {
      status = moveBackward($tb)
    }

    // Arrow up.
    else if (keycode === FE.KEYCODE.ARROW_UP && !ctrlKey && !e.shiftKey && !e.altKey) {
      status = moveUp()
    }

    // Arrow down.
    else if (keycode === FE.KEYCODE.ARROW_DOWN && !ctrlKey && !e.shiftKey && !e.altKey) {
      status = moveDown()
    }

    // Enter.
    else if ((keycode === FE.KEYCODE.ENTER || keycode === FE.KEYCODE.SPACE) && !ctrlKey && !e.shiftKey && !e.altKey) {
      status = enter()
    }

    // Esc.
    else if (keycode === FE.KEYCODE.ESC && !ctrlKey && !e.shiftKey && !e.altKey) {
      status = esc($tb)
    }

    // Alt + F10.
    else if (keycode === FE.KEYCODE.F10 && !ctrlKey && !e.shiftKey && e.altKey) {
      status = focusToolbars()
    }

    // No focused element and no action done. Eg: popup is opened.
    if (!editor.shared.$f_el && typeof status === 'undefined') {
      status = true
    }

    // Check if key event is a browser action. Eg: Ctrl + R.
    if (!status && editor.keys.isBrowserAction(e)) {
      status = true
    }

    // Propagate to the next key listeners.
    if (status) {
      return true
    }

    e.preventDefault()
    e.stopPropagation()

    return false

  }

  /*
   * Register a toolbar to keydown event.
   */
  function registerToolbar($tb) {
    if (!$tb || !$tb.length) {
      return
    }

    // Hitting keydown on toolbar.
    editor.events.$on($tb, 'keydown', (e) => {
      // Allow only buttons.fr-command.
      if (!$(e.target).is('a.fr-command, button.fr-command, .fr-group span.fr-command')) {
        return true
      }

      // Get the current editor instance for the popup.
      const inst = $tb.parents('.fr-popup').data('instance') || $tb.data('instance') || editor

      // Keyboard used.
      editor.shared.with_kb = true
      const status = inst.accessibility.exec(e, $tb)
      editor.shared.with_kb = false

      return status
    }, true)

    // Unfocus the toolbar on mouseenter.
    editor.events.$on($tb, 'mouseenter', '[tabIndex]', (e) => {
      const inst = $tb.parents('.fr-popup').data('instance') || $tb.data('instance') || editor

      // FireFox issue.
      if (!can_blur) {

        // Popup showed over the cursor.
        e.stopPropagation()
        e.preventDefault()

        return
      }

      const $hovered_el = $(e.currentTarget)

      if (inst.shared.$f_el && inst.shared.$f_el.not($hovered_el)) {
        inst.accessibility.focusEditor()
      }

    }, true)

    // Update the focused shared variable after every transition
    if (editor.$tb) {
      editor.events.$on(editor.$tb, 'transitionend', '.fr-more-toolbar', function() {
        editor.shared.$f_el = $(document.activeElement)
      })
    }
  }

  /*
   * Register a popup to a keydown event.
   */
  function registerPopup(id) {
    const $popup = editor.popups.get(id)
    const ev = _getPopupEvents(id)

    // Register popup toolbar.
    registerToolbar($popup.find('.fr-buttons'))

    // Clear popup button on mouseenter.
    editor.events.$on($popup, 'mouseenter', 'tabIndex', ev._tiMouseenter, true)

    // Keydown handler on every element that has tabIndex.
    editor.events.$on($popup.children().not('.fr-buttons'), 'keydown', '[tabIndex]', ev._tiKeydown, true)

    // Restore selection on popups hide for the current active popup.
    editor.popups.onHide(id, () => {
      const inst = $popup.data('instance') || editor
      inst.accessibility.restoreSelection()
    })

    // FireFox issue: Prevent immediate popup bluring. Popup could show up over the cursor.
    editor.popups.onShow(id, () => {
      can_blur = false
      setTimeout(() => {
        can_blur = true
      }, 0)
    })
  }

  /*
   * Get popup events.
   */
  function _getPopupEvents(id) {
    const $popup = editor.popups.get(id)

    return {
      /**
       * Keydown on an input.
       */
      _tiKeydown(e) {
        const inst = $popup.data('instance') || editor

        // See if plugins listeners are active.
        if (inst.events.trigger('popup.tab', [e]) === false) {
          return false
        }

        const key_code = e.which

        const $focused_item = $popup.find(':focus').first()

        // Tabbing.
        if (FE.KEYCODE.TAB === key_code) {
          e.preventDefault()

          // Focus next/previous input.
          const $popup_content = $popup.children().not('.fr-buttons')
          const inputs = $popup_content.findVisible('input, textarea, button, select').not('.fr-no-touch input, .fr-no-touch textarea, .fr-no-touch button, .fr-no-touch select, :disabled').toArray()
          const idx = inputs.indexOf(this) + (e.shiftKey ? -1 : 1)

          if (idx >= 0 && idx < inputs.length) {
            inst.events.disableBlur()
            $(inputs[idx]).focus()

            e.stopPropagation()

            return false
          }

          // Focus toolbar.
          const $tb = $popup.find('.fr-buttons')

          if ($tb.length && focusToolbar($tb, Boolean(e.shiftKey))) {
            e.stopPropagation()

            return false
          }

          // Focus content.
          if (focusContent($popup_content)) {
            e.stopPropagation()

            return false
          }
        }

        // ENTER.
        else if (FE.KEYCODE.ENTER === key_code && e.target && e.target.tagName !== 'TEXTAREA') {
          let $active_button = null

          if ($popup.findVisible('.fr-submit').length > 0) {
            $active_button = $popup.findVisible('.fr-submit').first()
          }
          else if ($popup.findVisible('.fr-dismiss').length) {
            $active_button = $popup.findVisible('.fr-dismiss').first()
          }

          if ($active_button) {
            e.preventDefault()
            e.stopPropagation()
            inst.events.disableBlur()
            inst.button.exec($active_button)
          }
        }

        // ESC.
        else if (FE.KEYCODE.ESC === key_code) {
          e.preventDefault()
          e.stopPropagation()

          // Restore selection.
          inst.accessibility.restoreSelection()

          if (inst.popups.isVisible(id) && $popup.findVisible('.fr-back').length) {
            if (inst.opts.toolbarInline) {

              // Toolbar inline needs focus in order to show up.
              inst.events.disableBlur()
              inst.events.focus()
            }
            inst.button.exec($popup.findVisible('.fr-back').first())

            // Focus back popup button.
            focusPopupButton($popup)
          }
          else if (inst.popups.isVisible(id) && $popup.findVisible('.fr-dismiss').length) {
            inst.button.exec($popup.findVisible('.fr-dismiss').first())
          }
          else {
            inst.popups.hide(id)

            if (inst.opts.toolbarInline) {
              inst.toolbar.showInline(null, true)
            }

            // Focus back popup button.
            focusPopupButton($popup)
          }

          return false
        }

        // Allow space.
        else if (FE.KEYCODE.SPACE === key_code && ($focused_item.is('.fr-submit') || $focused_item.is('.fr-dismiss'))) {
          e.preventDefault()
          e.stopPropagation()
          inst.events.disableBlur()
          inst.button.exec($focused_item)

          return true
        }

        // Other KEY. Stop propagation to the window.
        else {

          // Check if key event is a browser action. Eg: Ctrl + R.
          if (inst.keys.isBrowserAction(e)) {
            e.stopPropagation()

            return
          }

          if ($focused_item.is('input[type=text], textarea')) {
            e.stopPropagation()

            return
          }

          if (FE.KEYCODE.SPACE === key_code && ($focused_item.is('.fr-link-attr') || $focused_item.is('input[type=file]'))) {
            e.stopPropagation()

            return
          }
          e.stopPropagation()
          e.preventDefault()

          return false
        }
      },

      _tiMouseenter() {
        const inst = $popup.data('instance') || editor

        _clearPopupButton(inst)
      }
    }
  }

  /*
   * Focus the button from which the popup was showed.
   */
  function focusPopupButton($popup) {
    const $popup_button = $popup.data('popup-button')

    if ($popup_button) {
      setTimeout(() => {
        focusToolbarElement($popup_button)
        $popup.data('popup-button', null)
      }, 0)
    }
  }

  /*
   * Focus the button from which the modal was showed.
   */
  function focusModalButton($modal) {
    const $modal_button = $modal.data('modal-button')

    if ($modal_button) {
      setTimeout(() => {
        focusToolbarElement($modal_button)
        $modal.data('modal-button', null)
      }, 0)
    }
  }

  function hasFocus() {
    return editor.shared.$f_el !== null
  }

  function _clearPopupButton(inst) {
    const $visible_popup = editor.popups.areVisible(inst)

    if ($visible_popup) {
      $visible_popup.data('popup-button', null)
    }
  }

  function _editorKeydownHandler(e) {
    const ctrlKey = navigator.userAgent.indexOf('Mac OS X') !== -1 ? e.metaKey : e.ctrlKey
    const keycode = e.which

    // Alt + F10.
    if (keycode === FE.KEYCODE.F10 && !ctrlKey && !e.shiftKey && e.altKey) {

      // Keyboard used.
      editor.shared.with_kb = true

      // Focus active popup content inside the current editor if possible, else focus an available toolbar.
      const $visible_popup = editor.popups.areVisible(editor)
      let focused_content = false

      if ($visible_popup) {
        focused_content = focusContent($visible_popup.children().not('.fr-buttons'))
      }

      if (!focused_content) {
        focusToolbars()
      }

      editor.shared.with_kb = false

      e.preventDefault()
      e.stopPropagation()

      return false
    }

    return true
  }

  /**
   * Initialize.
   */
  function _init() {

    // Key down on the editing area.
    if (editor.$wp) {
      editor.events.on('keydown', _editorKeydownHandler, true)
    }
    else {
      editor.events.$on(editor.$win, 'keydown', _editorKeydownHandler, true)
    }

    // Mousedown on the editing area.
    editor.events.on('mousedown', (e) => {
      _clearPopupButton(editor)

      if (editor.shared.$f_el && editor.el.isSameNode(editor.shared.$f_el[0])) {
        editor.accessibility.restoreSelection()
        e.stopPropagation()
        editor.events.disableBlur()
        editor.shared.$f_el = null
      }
    }, true)

    // Blur on the editing area.
    editor.events.on('blur', () => {
      editor.shared.$f_el = null
      _clearPopupButton(editor)
    }, true)
  }

  return {
    _init,
    registerPopup,
    registerToolbar,
    focusToolbarElement,
    focusToolbar,
    focusContent,
    focusPopup,
    focusModal,
    focusEditor,
    focusPopupButton,
    focusModalButton,
    hasFocus,
    exec,
    saveSelection,
    restoreSelection
  }
}
