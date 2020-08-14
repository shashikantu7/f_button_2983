import FE from '../../editor.js'

// Extend defaults.
Object.assign(FE.DEFAULTS, {
  attribution: true,
  toolbarBottom: false,
  toolbarButtons: null,
  toolbarButtonsXS: null,
  toolbarButtonsSM: null,
  toolbarButtonsMD: null,
  toolbarContainer: null,
  toolbarInline: false,
  toolbarSticky: true,
  toolbarStickyOffset: 0,
  toolbarVisibleWithoutSelection: false
})

// Default toolbar buttons.
FE.TOOLBAR_BUTTONS = {
  'moreText': {
    'buttons': ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'textColor', 'backgroundColor', 'inlineClass', 'inlineStyle', 'clearFormatting']
  },
  'moreParagraph': {
    'buttons': ['alignLeft', 'alignCenter', 'formatOLSimple', 'alignRight', 'alignJustify', 'formatOL', 'formatUL', 'paragraphFormat', 'paragraphStyle', 'lineHeight', 'outdent', 'indent', 'quote']
  },
  'moreRich': {
    'buttons': ['insertLink', 'insertFiles', 'insertImage', 'insertVideo', 'insertTable', 'emoticons', 'fontAwesome', 'specialCharacters', 'embedly', 'insertFile', 'insertHR']
  },
  'moreMisc': {
    'buttons': ['undo', 'redo', 'fullscreen', 'print', 'getPDF', 'spellChecker', 'selectAll', 'html', 'help'],
    'align': 'right',
    'buttonsVisible': 2
  }
}

FE.TOOLBAR_BUTTONS_MD = null

FE.TOOLBAR_BUTTONS_SM = {}
FE.TOOLBAR_BUTTONS_SM.moreText = Object.assign({}, FE.TOOLBAR_BUTTONS.moreText, {'buttonsVisible': 2})
FE.TOOLBAR_BUTTONS_SM.moreParagraph = Object.assign({}, FE.TOOLBAR_BUTTONS.moreParagraph, {'buttonsVisible': 2})
FE.TOOLBAR_BUTTONS_SM.moreRich = Object.assign({}, FE.TOOLBAR_BUTTONS.moreRich, {'buttonsVisible': 2})
FE.TOOLBAR_BUTTONS_SM.moreMisc = Object.assign({}, FE.TOOLBAR_BUTTONS.moreMisc, {'buttonsVisible': 2})

FE.TOOLBAR_BUTTONS_XS = {}
FE.TOOLBAR_BUTTONS_XS.moreText = Object.assign({}, FE.TOOLBAR_BUTTONS.moreText, {'buttonsVisible': 0})
FE.TOOLBAR_BUTTONS_XS.moreParagraph = Object.assign({}, FE.TOOLBAR_BUTTONS.moreParagraph, {'buttonsVisible': 0})
FE.TOOLBAR_BUTTONS_XS.moreRich = Object.assign({}, FE.TOOLBAR_BUTTONS.moreRich, {'buttonsVisible': 0})
FE.TOOLBAR_BUTTONS_XS.moreMisc = Object.assign({}, FE.TOOLBAR_BUTTONS.moreMisc, {'buttonsVisible': 2})

FE.POWERED_BY = '<a id="logo" href="https://froala.com/wysiwyg-editor" target="_blank" title="Froala WYSIWYG HTML Editor"><span>Powered by</span><svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 822.8 355.33"><defs><style>.fr-logo{fill:#b1b2b7;}</style></defs><title>Froala</title><path class="fr-logo" d="M123.58,78.65A16.16,16.16,0,0,0,111.13,73H16.6C7.6,73,0,80.78,0,89.94V128.3a16.45,16.45,0,0,0,32.9,0V104.14h78.5A15.63,15.63,0,0,0,126.87,91.2,15.14,15.14,0,0,0,123.58,78.65Z"/><path class="fr-logo" d="M103.54,170a16.05,16.05,0,0,0-11.44-4.85H15.79A15.81,15.81,0,0,0,0,180.93v88.69a16.88,16.88,0,0,0,5,11.92,16,16,0,0,0,11.35,4.7h.17a16.45,16.45,0,0,0,16.41-16.6v-73.4H92.2A15.61,15.61,0,0,0,107.89,181,15.1,15.1,0,0,0,103.54,170Z"/><path class="fr-logo" d="M233,144.17c-5.29-6.22-16-7.52-24.14-7.52-16.68,0-28.72,7.71-36.5,23.47v-5.67a16.15,16.15,0,1,0-32.3,0v115.5a16.15,16.15,0,1,0,32.3,0v-38.7c0-19.09,3.5-63.5,35.9-63.5a44.73,44.73,0,0,1,5.95.27h.12c12.79,1.2,20.06-2.73,21.6-11.69C236.76,151.48,235.78,147.39,233,144.17Z"/><path class="fr-logo" d="M371.83,157c-13.93-13.11-32.9-20.33-53.43-20.33S279,143.86,265.12,157c-14.67,13.88-22.42,32.82-22.42,54.77,0,21.68,8,41.28,22.4,55.2,13.92,13.41,32.85,20.8,53.3,20.8s39.44-7.38,53.44-20.79c14.55-13.94,22.56-33.54,22.56-55.21S386.39,170.67,371.83,157Zm-9.73,54.77c0,25.84-18.38,44.6-43.7,44.6s-43.7-18.76-43.7-44.6c0-25.15,18.38-43.4,43.7-43.4S362.1,186.59,362.1,211.74Z"/><path class="fr-logo" d="M552.7,138.14a16.17,16.17,0,0,0-16,16.3v1C526.41,143.85,509,136.64,490,136.64c-19.83,0-38.19,7.24-51.69,20.4C424,171,416.4,190,416.4,212c0,21.61,7.78,41.16,21.9,55,13.56,13.33,31.92,20.67,51.7,20.67,18.83,0,36.29-7.41,46.7-19.37v1.57a16.15,16.15,0,1,0,32.3,0V154.44A16.32,16.32,0,0,0,552.7,138.14Zm-16.3,73.6c0,30.44-22.81,44.3-44,44.3-24.57,0-43.1-19-43.1-44.3s18.13-43.4,43.1-43.4C513.73,168.34,536.4,183.55,536.4,211.74Z"/><path class="fr-logo" d="M623.5,61.94a16.17,16.17,0,0,0-16,16.3v191.7a16.15,16.15,0,1,0,32.3,0V78.24A16.32,16.32,0,0,0,623.5,61.94Z"/><path class="fr-logo" d="M806.5,138.14a16.17,16.17,0,0,0-16,16.3v1c-10.29-11.63-27.74-18.84-46.7-18.84-19.83,0-38.19,7.24-51.69,20.4-14.33,14-21.91,33-21.91,55,0,21.61,7.78,41.16,21.9,55,13.56,13.33,31.92,20.67,51.7,20.67,18.83,0,36.29-7.41,46.7-19.37v1.57a16.15,16.15,0,1,0,32.3,0V154.44A16.32,16.32,0,0,0,806.5,138.14Zm-16.3,73.6c0,30.44-22.81,44.3-44,44.3-24.57,0-43.1-19-43.1-44.3s18.13-43.4,43.1-43.4C767.53,168.34,790.2,183.55,790.2,211.74Z"/></svg></a>'

FE.MODULES.toolbar = function (editor) {

  const $ = editor.$

  // Create a button map for each screen size.
  const _buttons_map = []
  _buttons_map[FE.XS] = _normalizeButtons(editor.opts.toolbarButtonsXS || editor.opts.toolbarButtons || FE.TOOLBAR_BUTTONS_XS || FE.TOOLBAR_BUTTONS || [])
  _buttons_map[FE.SM] = _normalizeButtons(editor.opts.toolbarButtonsSM || editor.opts.toolbarButtons || FE.TOOLBAR_BUTTONS_SM || FE.TOOLBAR_BUTTONS || [])
  _buttons_map[FE.MD] = _normalizeButtons(editor.opts.toolbarButtonsMD || editor.opts.toolbarButtons || FE.TOOLBAR_BUTTONS_MD || FE.TOOLBAR_BUTTONS || [])
  _buttons_map[FE.LG] = _normalizeButtons(editor.opts.toolbarButtons || FE.TOOLBAR_BUTTONS || [])

  // Store previous screen size for resizing optimization
  let previousScreenSize

  /**
   * Normalize buttons for regular structure.
   */
  function _normalizeButtons (buttons) {
    // All this method should do is to change the structure of the _buttons_map to be inline with the specs for buttons in V3.
    // Buttons is an array
    let buttonGroups = {}
    if (Array.isArray(buttons)) {

      // Convert from old button list to new button list
      if (!Array.isArray(buttons[0])) {

        let toolbarButtonGroups = []
        let currentButtonGroup = []
        for (let i = 0; i < buttons.length; i++) {
          // If the value is of type separator then add the currentButtonGroup to the toolbarButtonGroups
          // Re-initialize the currentButtonGroup for new group
          if (buttons[i] === '|' || buttons[i] === '-') {
            if (currentButtonGroup.length > 0) {
              toolbarButtonGroups.push(currentButtonGroup)
            }
            currentButtonGroup = []
          }
          // Otherwise add the button to the currentButtonGroup
          else {
            currentButtonGroup.push(buttons[i])
          }
        }

        // If there are buttons in the currentButtonGroup then add the group to the toolbar button groups
        if (currentButtonGroup.length > 0) {
          toolbarButtonGroups.push(currentButtonGroup)
        }

        buttons = toolbarButtonGroups
      }

      // Create a button group object from button group array
      buttons.forEach((button, index) => {
        buttonGroups[`group${index + 1}`] = { buttons: button }
      })

      // Don't show more buttons when input buttons is a list
      buttonGroups.showMoreButtons = false

    }
    // Button is an Object with group name and buttons info
    else if (typeof buttons === 'object' && !Array.isArray(buttons)) {
      buttonGroups = buttons

      // Show more buttons when input is more button groups
      buttonGroups.showMoreButtons = true
    }

    return buttonGroups
  }

  /**
   * Add buttons to the toolbar.
   */
  function _addButtons() {
    const buttons_list = editor.button.buildGroup(_screenButtons())
    editor.$tb.append(buttons_list)

    // Set the height of all more toolbars
    setMoreToolbarsHeight()

    editor.button.bindCommands(editor.$tb)
  }

  /**
   * The buttons that should be visible on the current screen size.
   */
  function _screenButtons() {
    const screen_size = editor.helpers.screenSize()

    // Update previous screen size
    previousScreenSize = screen_size

    return _buttons_map[screen_size]
  }

  /**
   * Remove button group wrappers
   */
  function _removeButtonGroupWrappers() {
    // Remove all wrapper button groups
    let $buttonGroups = editor.$tb.find('.fr-btn-grp, .fr-more-toolbar')
    for (let index = 0; index < $buttonGroups.length; index++) {
      // Remove parent wrapper
      const $buttonGroup = $($buttonGroups[index])
      $buttonGroup.children().each((index, $btn) => {
        $buttonGroup.before($btn)
      })
      $buttonGroup.remove()
    }
  }

  /**
   * Sets the more toolbar height
   */
  function setMoreToolbarsHeight() {
    const $moreToolbars = editor.$tb.find('.fr-more-toolbar')
    let toolbarPaddingBottom = ''
    for (let i = 0; i < $moreToolbars.length; i++) {
      const $moreToolbar = $($moreToolbars[i])

      // Do only if more toolbar is expanded
      if ($moreToolbar.hasClass('fr-expanded')) {

        // More toolbar left padding
        let moreToolbarWidth = editor.helpers.getPX($moreToolbar.css('padding-left'))

        // Get all more toolbar buttons
        const $moreToolbarBtns = $moreToolbar.find('> .fr-command, > .fr-btn-wrap')
        const $moreToolbarBtn = $($moreToolbarBtns[0])

        // Compute button margins if any
        const buttonMarginLeft = editor.helpers.getPX($moreToolbarBtn.css('margin-left'))
        const buttonMarginRight = editor.helpers.getPX($moreToolbarBtn.css('margin-right'))
        const buttonMarginTop = editor.helpers.getPX($moreToolbarBtn.css('margin-top'))
        const buttonMarginBottom = editor.helpers.getPX($moreToolbarBtn.css('margin-bottom'))

        // Compute more toolbar content width
        $moreToolbarBtns.each((index, btn) => {
          moreToolbarWidth += ($(btn).outerWidth() + buttonMarginLeft + buttonMarginRight)
        })

        // Compute complete toolbar width
        const toolbarWidth = editor.$tb.outerWidth()

        // If all the more toolbar buttons can't be accomodated in one row
        if (moreToolbarWidth > toolbarWidth) {

          // Compute no of rows required to accomodate all more toolbar buttons
          let moreToolbarRows = Math.floor(moreToolbarWidth / editor.$tb.outerWidth())
          moreToolbarWidth += (moreToolbarRows * (moreToolbarWidth / $moreToolbar[0].childElementCount))
          moreToolbarRows = Math.ceil(moreToolbarWidth / editor.$tb.outerWidth())

          // Set more toolbar height
          const moreToolbarHeight = (editor.helpers.getPX($moreToolbarBtn.css('height')) + buttonMarginTop + buttonMarginBottom) * moreToolbarRows
          $moreToolbar.css('height', moreToolbarHeight)
          toolbarPaddingBottom = moreToolbarHeight
        }
      }
      // Otherwise reset the properties
      else {
        $moreToolbar.css('height', '')
      }
    }
    // Shift the editor area by the new toolbar height
    editor.$tb.css('padding-bottom', toolbarPaddingBottom)
  }

  /**
   * Reorder the toolbar buttons on resize
   */
  function _showScreenButtons() {

    // Update the toolbar only if screen size is changed
    if (previousScreenSize !== editor.helpers.screenSize()) {

      // Get screen button groups
      let buttonGroups = _screenButtons()

      // Toolbar groups
      let mainToolbarButtonGroups = $()
      let moreToolbarButtonGroups = $()

      // Hide all buttons
      editor.$tb.find('.fr-btn-grp > .fr-command, .fr-more-toolbar > .fr-command, .fr-btn-grp > .fr-btn-wrap > .fr-command, .fr-more-toolbar > .fr-btn-wrap > .fr-command').addClass('fr-hidden')

      // Remove wrapper div from button groups
      _removeButtonGroupWrappers()

      for (const groupName in buttonGroups) {

        // Current button group
        let buttonGroup = buttonGroups[groupName]

        // Ignore non-button groups
        if (!buttonGroup.buttons) {
          continue
        }

        // Current button group Details
        let moreToolbarButtons
        let buttonCount = 0
        let visibleButtons = 3
        const mainToolbarButtons = $(`<div class="fr-btn-grp fr-float-${buttonGroups[groupName].align ? buttonGroups[groupName].align : 'left'}"></div>`)
        if (buttonGroups.showMoreButtons) {
          moreToolbarButtons = $('<div class="fr-more-toolbar"></div>').data('name', `${groupName}-${editor.id}`)
        }

        for (let i = 0; i < buttonGroup.buttons.length; i++) {

          // If buttonVisible is provided then use it
          if (buttonGroup.buttonsVisible !== undefined) {
            visibleButtons = buttonGroup.buttonsVisible
          }

          // Get the button for the command
          let $btn = editor.$tb.find('> .fr-command[data-cmd="' + buttonGroup.buttons[i] + '"], > div.fr-btn-wrap > .fr-command[data-cmd="' + buttonGroup.buttons[i] + '"]')
          let $dropdown = null

          // If it is a dropdown button
          if (editor.node.hasClass($btn.next().get(0), 'fr-dropdown-menu')) {
            $dropdown = $btn.next()
          }

          // If it is a button with options
          if (editor.node.hasClass($btn.next().get(0), 'fr-options')) {
            $btn.removeClass('fr-hidden')
            $btn.next().removeClass('fr-hidden')
            $btn = $btn.parent()
          }

          // Show the buttons in the toolbar
          $btn.removeClass('fr-hidden')

          // Wrap the buttons in a button group
          if (buttonGroups.showMoreButtons && buttonCount >= visibleButtons) {
            moreToolbarButtons.append($btn)
            if ($dropdown) {
              moreToolbarButtons.append($dropdown)
            }
          }
          else {
            mainToolbarButtons.append($btn)
            if ($dropdown) {
              mainToolbarButtons.append($dropdown)
            }
          }

          buttonCount++
        }

        // Add more button if buttons in group are more than 'buttonsVisible'
        if (buttonGroups.showMoreButtons && buttonCount > visibleButtons) {
          let $moreButton = editor.$tb.find(`.fr-command[data-cmd="${groupName}"]`)
          if ($moreButton.length > 0) {
            $moreButton.removeClass('fr-hidden fr-open')
          }
          else {
            // Create a new more button if not present already
            const cmdName = groupName
            const cmdInfo = FE.COMMANDS[cmdName]
            cmdInfo.more_btn = true
            $moreButton = $(editor.button.build(cmdName, cmdInfo, true))

            // Register the more button
            editor.button.addButtons($moreButton)
          }
          mainToolbarButtons.append($moreButton)
        }

        // Append visible buttons on the main toolbar
        mainToolbarButtonGroups.push(mainToolbarButtons)

        // Append more toolbar buttons
        if (buttonGroups.showMoreButtons) {
          moreToolbarButtonGroups.push(moreToolbarButtons)
        }
      }

      // Append button groups to the editor
      if (editor.opts.toolbarBottom) {
        editor.$tb.append(moreToolbarButtonGroups)
        editor.$tb.find('.fr-newline').remove()
        editor.$tb.append('<div class="fr-newline"></div>')
        editor.$tb.append(mainToolbarButtonGroups)
      }
      else {
        editor.$tb.append(mainToolbarButtonGroups)
        editor.$tb.find('.fr-newline').remove()
        editor.$tb.append('<div class="fr-newline"></div>')
        editor.$tb.append(moreToolbarButtonGroups)
      }

      // Close the more toolbar
      editor.$tb.removeClass('fr-toolbar-open')
      editor.$box.removeClass('fr-toolbar-open')

      // Switch to normal view if in code view
      editor.events.trigger('codeView.toggle')
    }

    // Refresh more toolbar height on resize
    setMoreToolbarsHeight()
  }

  /**
   * Set the buttons visibility based on screen size.
   */
  function _setVisibility() {
    editor.events.$on($(editor.o_win), 'resize', _showScreenButtons)
    editor.events.$on($(editor.o_win), 'orientationchange', _showScreenButtons)
  }

  function showInline(e, force) {
    setTimeout(() => {

      // https://github.com/froala-labs/froala-editor-js-2/issues/1571
      // Condition added to avoid showing toolbar when the table has contenteditable:false
      if ((!e || e.which != FE.KEYCODE.ESC) && editor.selection.inEditor() && editor.core.hasFocus() && !editor.popups.areVisible() && $(editor.selection.blocks()[0]).closest('table').attr('contenteditable') != 'false') {
        if (editor.opts.toolbarVisibleWithoutSelection || !editor.selection.isCollapsed() && !editor.keys.isIME() || force) {
          editor.$tb.data('instance', editor)

          // Check if we should actually show the toolbar.
          if (editor.events.trigger('toolbar.show', [e]) === false) {
            return
          }

          editor.$tb.show()

          if (!editor.opts.toolbarContainer) {
            editor.position.forSelection(editor.$tb)
          }

          if (editor.opts.zIndex > 1) {
            editor.$tb.css('z-index', editor.opts.zIndex + 1)
          }
          else {
            editor.$tb.css('z-index', null)
          }
        }
      }
    }, 0)
  }

  function hide(e) {

    // Prevent hiding the editor toolbar when changing the window.
    if (e && e.type === 'blur' && document.activeElement === editor.el) {
      return false
    }

    // Do not hide toolbar if we press CTRL.
    if (e && e.type === 'keydown' && editor.keys.ctrlKey(e)) {
      return true
    }

    // Prevent hiding when dropdown is active and we scoll in it.
    // https://github.com/froala/wysiwyg-editor/issues/1290
    const $active_dropdowns = editor.button.getButtons('.fr-dropdown.fr-active')

    if ($active_dropdowns.next().find(editor.o_doc.activeElement).length) {
      return true
    }

    // Check if we should actually hide the toolbar.
    if (editor.events.trigger('toolbar.hide') !== false) {
      editor.$tb.hide()
    }
  }

  function show() {

    // Check if we should actually hide the toolbar.
    if (editor.events.trigger('toolbar.show') === false) {
      return false
    }

    editor.$tb.show()
  }

  let tm = null

  function _showInlineWithTimeout(e) {
    clearTimeout(tm)

    if (!e || e.which !== FE.KEYCODE.ESC) {
      tm = setTimeout(showInline, editor.opts.typingTimer)
    }
  }

  /**
   * Set the events for show / hide toolbar.
   */
  function _initInlineBehavior() {

    // Window mousedown.
    editor.events.on('window.mousedown', hide)

    // Element keydown.
    editor.events.on('keydown', hide)

    // Element blur.
    editor.events.on('blur', hide)

    // Position the toolbar after expanding the more toolbar completely if toolbar is inline
    editor.events.$on(editor.$tb, 'transitionend', '.fr-more-toolbar', function() {
      editor.position.forSelection(editor.$tb)
    })

    // Window mousedown.
    if (!editor.helpers.isMobile()) {
      editor.events.on('window.mouseup', showInline)
    }

    if (editor.helpers.isMobile()) {
      if (!editor.helpers.isIOS()) {
        editor.events.on('window.touchend', showInline)

        if (editor.browser.mozilla) {
          setInterval(showInline, 200)
        }
      }
    }
    else {
      editor.events.on('window.keyup', _showInlineWithTimeout)
    }

    // Hide editor on ESC.
    editor.events.on('keydown', (e) => {
      if (e && e.which === FE.KEYCODE.ESC) {
        hide()
      }
    })

    // Enable accessibility shortcut.
    editor.events.on('keydown', (e) => {
      if (e.which === FE.KEYCODE.ALT) {
        e.stopPropagation()

        return false
      }
    }, true)

    editor.events.$on(editor.$wp, 'scroll.toolbar', showInline)
    editor.events.on('commands.after', showInline)

    if (editor.helpers.isMobile()) {
      editor.events.$on(editor.$doc, 'selectionchange', _showInlineWithTimeout)
      editor.events.$on(editor.$doc, 'orientationchange', showInline)
    }
  }


  function _initPositioning() {

    // Toolbar is inline.
    if (editor.opts.toolbarInline) {

      // Mobile should handle this as regular.
      editor.$sc.append(editor.$tb)

      // Add toolbar to body.
      editor.$tb.data('container', editor.$sc)

      // Add inline class.
      editor.$tb.addClass('fr-inline')


      // Init mouse behavior.
      _initInlineBehavior()

      editor.opts.toolbarBottom = false
    }

    // Toolbar is normal.
    else {

      // Won't work on iOS.
      if (editor.opts.toolbarBottom && !editor.helpers.isIOS()) {
        editor.$box.append(editor.$tb)
        editor.$tb.addClass('fr-bottom')
        editor.$box.addClass('fr-bottom')
      }
      else {
        editor.opts.toolbarBottom = false
        editor.$box.prepend(editor.$tb)
        editor.$tb.addClass('fr-top')
        editor.$box.addClass('fr-top')
      }

      editor.$tb.addClass('fr-basic')

      if (editor.opts.toolbarSticky) {
        if (editor.opts.toolbarStickyOffset) {
          if (editor.opts.toolbarBottom) {
            editor.$tb.css('bottom', editor.opts.toolbarStickyOffset)
          }
          else {
            editor.$tb.css('top', editor.opts.toolbarStickyOffset)
          }
        }

        editor.position.addSticky(editor.$tb)
      }
    }
  }

  /**
   * Destroy.
   */
  function _sharedDestroy() {
    editor.$tb.html('').removeData().remove()
    editor.$tb = null

    if (editor.$second_tb) {
      editor.$second_tb.html('').removeData().remove()
      editor.$second_tb = null
    }
  }

  function _destroy() {
    editor.$box.removeClass('fr-top fr-bottom fr-inline fr-basic')
    editor.$box.find('.fr-sticky-dummy').remove()
  }

  function _setDefaults() {
    if (editor.opts.theme) {
      editor.$tb.addClass(`${editor.opts.theme}-theme`)
    }

    if (editor.opts.zIndex > 1) {
      editor.$tb.css('z-index', editor.opts.zIndex + 1)
    }

    // Set direction.
    if (editor.opts.direction !== 'auto') {
      editor.$tb.removeClass('fr-ltr fr-rtl').addClass(`fr-${editor.opts.direction}`)
    }

    // Mark toolbar for desktop / mobile.
    if (!editor.helpers.isMobile()) {
      editor.$tb.addClass('fr-desktop')
    }
    else {
      editor.$tb.addClass('fr-mobile')
    }

    // Set the toolbar specific position inline / normal.
    if (!editor.opts.toolbarContainer) {
      _initPositioning()
    }
    else {
      if (editor.opts.toolbarInline) {
        _initInlineBehavior()
        hide()
      }

      if (editor.opts.toolbarBottom) {
        editor.$tb.addClass('fr-bottom')
      }
      else {
        editor.$tb.addClass('fr-top')
      }
    }

    // Add buttons to the toolbar.
    // Set their visibility for different screens.
    // Asses commands to the butttons.
    _addButtons()
    _setVisibility()

    editor.accessibility.registerToolbar(editor.$tb)

    // Make sure we don't trigger blur.
    editor.events.$on(editor.$tb, `${editor._mousedown} ${editor._mouseup}`, (e) => {
      const originalTarget = e.originalEvent ? e.originalEvent.target || e.originalEvent.originalTarget : null

      if (originalTarget && originalTarget.tagName !== 'INPUT' && !editor.edit.isDisabled()) {
        e.stopPropagation()
        e.preventDefault()

        return false
      }
    }, true)

    // https://github.com/froala-labs/froala-editor-js-2/issues/1972
    if (editor.helpers.isMobile()) {
      editor.events.$on(editor.$tb,'click',() =>{
        editor.$el.focus();
      })
    }

    // Refresh the screen size if in fullscreen mode after the more toolbar expands completely
    editor.events.$on(editor.$tb, 'transitionend', '.fr-more-toolbar', () => {
      if (editor.$box.hasClass('fr-fullscreen')) {
        editor.opts.height = editor.o_win.innerHeight - (editor.opts.toolbarInline ? 0 : editor.$tb.outerHeight() + (editor.$second_tb ? editor.$second_tb.outerHeight() : 0))
        editor.size.refresh()
      }
    })
  }

  /**
   * Initialize
   */
  function _init() {
    editor.$sc = $(editor.opts.scrollableContainer).first()

    if (!editor.$wp) {
      return false
    }

    // Add second toolbar
    if (!editor.opts.toolbarInline && !editor.opts.toolbarBottom) {
      editor.$second_tb = $(editor.doc.createElement('div')).attr('class', 'second-toolbar')
      editor.$box.append(editor.$second_tb)

      // Add powered by attribution.
      if (!(editor.ul === false && !editor.opts.attribution)) {
        editor.$second_tb.prepend(FE.POWERED_BY)
      }
    }

    // Container for toolbar.
    if (editor.opts.toolbarContainer) {

      // Shared toolbar.
      if (!editor.shared.$tb) {
        editor.shared.$tb = $(editor.doc.createElement('DIV'))
        editor.shared.$tb.addClass('fr-toolbar')
        editor.$tb = editor.shared.$tb
        $(editor.opts.toolbarContainer).append(editor.$tb)
        _setDefaults()
        editor.$tb.data('instance', editor)
      }
      else {
        editor.$tb = editor.shared.$tb

        if (editor.opts.toolbarInline) {
          _initInlineBehavior()
        }
      }

      if (editor.opts.toolbarInline) {

        // Update box.
        editor.$box.addClass('fr-inline')
      }
      else {
        editor.$box.addClass('fr-basic')
      }

      // On focus set the current instance.
      editor.events.on('focus', () => {
        editor.$tb.data('instance', editor)
      }, true)

      editor.opts.toolbarInline = false
    }
    else if (editor.opts.toolbarInline) {
      // Update box.
      editor.$box.addClass('fr-inline')

      // Check for shared toolbar.
      if (!editor.shared.$tb) {
        editor.shared.$tb = $(editor.doc.createElement('DIV'))
        editor.shared.$tb.addClass('fr-toolbar')
        editor.$tb = editor.shared.$tb
        _setDefaults()
      }
      else {
        editor.$tb = editor.shared.$tb

        // Init mouse behavior.
        _initInlineBehavior()
      }
    }
    else {
      editor.$box.addClass('fr-basic')
      editor.$tb = $(editor.doc.createElement('DIV'))
      editor.$tb.addClass('fr-toolbar')
      _setDefaults()

      editor.$tb.data('instance', editor)
    }

    // Destroy.
    editor.events.on('destroy', _destroy, true)
    editor.events.on(!editor.opts.toolbarInline && !editor.opts.toolbarContainer ? 'destroy' : 'shared.destroy', _sharedDestroy, true)

    // Bind edit on /off events.
    editor.events.on('edit.on', function () {
      editor.$tb.removeClass('fr-disabled').removeAttr('aria-disabled')
    })

    editor.events.on('edit.off', function () {
      editor.$tb.addClass('fr-disabled').attr('aria-disabled', true)
    })

    _initShortcuts();
  }

  function _initShortcuts() {
    editor.events.on('shortcut', function (e, cmd, val) {
      // Search for button.
      let $btn

      if (cmd && !val) {
        $btn = editor.$tb.find(`.fr-command[data-cmd="${cmd}"]`)
      }
      else if (cmd && val) {
        $btn = editor.$tb.find(`.fr-command[data-cmd="${cmd}"][data-param1="${val}"]`)
      }

      // Button found.
      if ($btn.length) {
        e.preventDefault()
        e.stopPropagation()

        $btn.parents('.fr-toolbar').data('instance', editor)

        if (e.type === 'keydown') {
          editor.button.exec($btn)

          return false
        }
      }
    })
  }

  let disabled = false

  function disable() {
    if (!disabled && editor.$tb) {
      // Toolbar Button is two level down from toolbar div
      editor.$tb.find('.fr-btn-grp > .fr-command, .fr-more-toolbar > .fr-command').addClass('fr-disabled fr-no-refresh').attr('aria-disabled', true)
      disabled = true
    }
  }

  function enable() {
    if (disabled && editor.$tb) {
      // Toolbar Button is two level down from toolbar div
      editor.$tb.find('.fr-btn-grp > .fr-command, .fr-more-toolbar > .fr-command').removeClass('fr-disabled fr-no-refresh').attr('aria-disabled', false)
      disabled = false
    }

    editor.button.bulkRefresh()
  }

  return {
    _init,
    hide,
    show,
    showInline,
    disable,
    enable,
    setMoreToolbarsHeight
  }
}
