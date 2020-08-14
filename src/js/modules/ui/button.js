import './tooltip.js'

import FE from '../../editor.js'

FE.TOOLBAR_VISIBLE_BUTTONS = 3

FE.MODULES.button = function (editor) {
  const $ = editor.$

  let buttons = []

  if (editor.opts.toolbarInline || editor.opts.toolbarContainer) {
    if (!editor.shared.buttons) {
      editor.shared.buttons = []
    }
    buttons = editor.shared.buttons
    console.log("123--", buttons);
  }

  let popup_buttons = []

  if (!editor.shared.popup_buttons) {
    editor.shared.popup_buttons = []
  }
  popup_buttons = editor.shared.popup_buttons

  /**
   * Add a new button to the buttons list
   */
  function addButtons($btns) {
    if($btns){
      console.log("buttons0----",$btns.length);
      for (let i = 0; i < $btns.length; i++) {
        buttons.push($btns)
      }
      //return buttons;
    }
    
  }

  /*
   * Filter buttons based on a specified selector.
   */
  function _filterButtons(butons_list, selector, search_dropdowns) {

    let $filtered_buttons = $()

    for (let i = 0; i < butons_list.length; i++) {
      const $button = $(butons_list[i])

      if ($button.is(selector)) {
        $filtered_buttons = $filtered_buttons.add($button)
      }

      // Search for dropdowns menuitems
      if (search_dropdowns && $button.is('.fr-dropdown')) {
        const $dropdown_menu_items = $button.next().find(selector)
        $filtered_buttons = $filtered_buttons.add($dropdown_menu_items)
      }
    }

    return $filtered_buttons
  }

  /*
   * Get all buttons from page based on a specified selector.
   */
  function getButtons(selector, search_dropdowns) {
   
    let $buttons = $()
    let id

    if (!selector) {

      return $buttons
    }

    // Search all toolbar buttons.
    $buttons = $buttons.add(_filterButtons(buttons, selector, search_dropdowns))

    // Search all popups buttons.
    $buttons = $buttons.add(_filterButtons(popup_buttons, selector, search_dropdowns))

    // Look in popup's content.
    for (id in editor.shared.popups) {

      if (Object.prototype.hasOwnProperty.call(editor.shared.popups, id)) {
        const $popup = editor.shared.popups[id]
        const $popup_buttons = $popup.children().find(selector)
        $buttons = $buttons.add($popup_buttons)
      }
    }

    // Look in modal's content.
    for (id in editor.shared.modals) {

      if (Object.prototype.hasOwnProperty.call(editor.shared.modals, id)) {
        const $modal_hash = editor.shared.modals[id]
        const $modal_buttons = $modal_hash.$modal.find(selector)
        $buttons = $buttons.add($modal_buttons)
      }
    }

    return $buttons
  }

  /*
  To get popup position with respect to element
  */
  function getPosition($elm) {
    const left = $elm.offset().left
    const toolbarBottomOffset = 10
    const topOffset = (editor.opts.toolbarBottom ? toolbarBottomOffset : $elm.outerHeight() - toolbarBottomOffset)
    const top = $elm.offset().top + topOffset
    return { left, top }
  }

  /**
   * Expands the dropdown
   */
  function _expandDropdown($dropdownWrapper, height, maxHeight) {
    // Show scroll only when height of the dropdown is more than max height
    if (height >= maxHeight) {
      $dropdownWrapper.parent().css('overflow', 'auto')
    }

    // Height of the dropdown is minimum of its content height and dropdown max height
    $dropdownWrapper.css('height', Math.min(height, maxHeight))
  }

  /**
   * Click was made on a dropdown button.
   */
  function _dropdownButtonClick($btn) {
    const $dropdown = $btn.next()

    const active = editor.node.hasClass($btn.get(0), 'fr-active')

    const $active_dropdowns = getButtons('.fr-dropdown.fr-active').not($btn)

    const inst = $btn.parents('.fr-toolbar, .fr-popup').data('instance') || editor

    // Hide keyboard. We need the entire space.
    if (inst.helpers.isIOS() && !inst.el.querySelector('.fr-marker')) {
      inst.selection.save()
      inst.selection.clear()
      inst.selection.restore()
    }

    $dropdown.parents('.fr-more-toolbar').addClass('fr-overflow-visible')

    let ht = 0
    let dropdownMaxHeight = 0
    let $dropdownWrapper = $dropdown.find('> .fr-dropdown-wrapper')

    // Dropdown is not active.
    if (!active) {
      // Call refresh on show.
      const cmd = $btn.data('cmd')
      $dropdown.find('.fr-command').removeClass('fr-active').attr('aria-selected', false)

      if (FE.COMMANDS[cmd] && FE.COMMANDS[cmd].refreshOnShow) {
        FE.COMMANDS[cmd].refreshOnShow.apply(inst, [$btn, $dropdown])
      }

      $dropdown.css('left', $btn.offset().left - $btn.parents('.fr-btn-wrap, .fr-toolbar, .fr-buttons').offset().left - (editor.opts.direction === 'rtl' ? $dropdown.width() - $btn.outerWidth() : 0))

      // Test height.
      $dropdown.addClass('test-height')
      ht = $dropdown.outerHeight()
      dropdownMaxHeight = editor.helpers.getPX($dropdownWrapper.css('max-height'))
      $dropdown.removeClass('test-height')

      // Reset top and bottom.
      $dropdown.css('top', '').css('bottom', '')

      // Just to overlap the button with the dropdown by a bit
      const dropdownOffsetTop = $btn.outerHeight() / 10

      // Toolbar top or dropdown is exceeding the window.
      if (!editor.opts.toolbarBottom && $dropdown.offset().top + $btn.outerHeight() + ht < $(editor.o_doc).height()) {
        $dropdown.css('top', $btn.position().top + $btn.outerHeight() - dropdownOffsetTop)
      }
      else {
        let moreToolbarHeight = 0
        const $moreToolbar = $btn.parents('.fr-more-toolbar')
        if ($moreToolbar.length > 0) {
          moreToolbarHeight = $moreToolbar.first().height()
        }
        $dropdown.css('bottom', $btn.parents('.fr-popup, .fr-toolbar').first().height() - moreToolbarHeight - $btn.position().top)
      }
    }

    // Blink and activate.
    $btn.addClass('fr-blink').toggleClass('fr-active')

    if ($btn.hasClass('fr-options')) {
      const $prevBtn = $btn.prev()
      $prevBtn.toggleClass('fr-expanded')
    }

    if ($btn.hasClass('fr-active')) {
      $dropdown.attr('aria-hidden', false)
      $btn.attr('aria-expanded', true)
      
      // Expand the dropdown
      _expandDropdown($dropdownWrapper, ht, dropdownMaxHeight)
    }
    else {
      $dropdown.attr('aria-hidden', true).css('overflow', '')
      $btn.attr('aria-expanded', false)

      // Close active dropdowns
      $dropdownWrapper.css('height', '')
    }

    setTimeout(() => {
      $btn.removeClass('fr-blink')
    }, 300)

    // Reset left margin for dropdown.
    $dropdown.css('margin-left', '')

    // Check if it exceeds window on the right.
    if ($dropdown.offset().left + $dropdown.outerWidth() > editor.$sc.offset().left + editor.$sc.width()) {
      $dropdown.css('margin-left', -($dropdown.offset().left + $dropdown.outerWidth() - editor.$sc.offset().left - editor.$sc.width()))
    }

    // Check if it exceeds window on the left.
    if ($dropdown.offset().left < editor.$sc.offset().left && editor.opts.direction === 'rtl') {
      $dropdown.css('margin-left', editor.$sc.offset().left)
    }

    // Hide dropdowns that might be active.
    // Close active dropdowns
    $active_dropdowns.removeClass('fr-active').attr('aria-expanded', false).next().attr('aria-hidden', true).css('overflow', '').find('> .fr-dropdown-wrapper').css('height', '')
    $active_dropdowns.prev('.fr-expanded').removeClass('fr-expanded')
    $active_dropdowns.parents('.fr-toolbar:not(.fr-inline)').css('zIndex', '')

    if ($btn.parents('.fr-popup').length === 0 && !editor.opts.toolbarInline) {
      if (editor.node.hasClass($btn.get(0), 'fr-active')) {
        editor.$tb.css('zIndex', (editor.opts.zIndex || 1) + 4)
      }
      else {
        editor.$tb.css('zIndex', '')
      }
    }

    // Focus the active element or the dropdown button to enable accessibility.
    const $active_element = $dropdown.find('a.fr-command.fr-active').first()

    // We do not need to focus on mobile.
    if (!editor.helpers.isMobile()) {

      if ($active_element.length) {
        editor.accessibility.focusToolbarElement($active_element)

        // Scroll the selected element to the middle
        $dropdownWrapper.scrollTop(Math.abs($active_element.parents('.fr-dropdown-content').offset().top - $active_element.offset().top) - $active_element.offset().top)
      }
      else {
        editor.accessibility.focusToolbarElement($btn)
        $dropdownWrapper.scrollTop(0)
      }
    }
  }

  function exec($btn) {

    // Blink.
    $btn.addClass('fr-blink')
    setTimeout(() => {
      $btn.removeClass('fr-blink')
    }, 500)

    // Get command, value and additional params.
    const cmd = $btn.data('cmd')
    const params = []

    while (typeof $btn.data(`param${params.length + 1}`) !== 'undefined') {
      params.push($btn.data(`param${params.length + 1}`))
    }

    // Hide dropdowns that might be active including the current one.
    const $active_dropdowns = getButtons('.fr-dropdown.fr-active')

    if ($active_dropdowns.length) {
      $active_dropdowns.removeClass('fr-active').attr('aria-expanded', false).next().attr('aria-hidden', true).css('overflow', '').find('> .fr-dropdown-wrapper').css('height', '')
      $active_dropdowns.prev('.fr-expanded').removeClass('fr-expanded')
      $active_dropdowns.parents('.fr-toolbar:not(.fr-inline)').css('zIndex', '')
    }

    // Call the command.
    $btn.parents('.fr-popup, .fr-toolbar').data('instance').commands.exec(cmd, params)
  }

  /**
   * Click was made on a command button.
   */
  function _commandButtonClick($btn) {
    exec($btn)
  }

  function click($btn) {
    // Get current editor instance
    const inst = $btn.parents('.fr-popup, .fr-toolbar').data('instance')

    // Active popup button only if it is not active
    if ($btn.parents('.fr-popup').length === 0 && $btn.data('popup') && !$btn.hasClass('fr-btn-active-popup')) {
      $btn.addClass('fr-btn-active-popup')
    }

    if ($btn.parents('.fr-popup').length === 0 && !$btn.data('popup')) {
      inst.popups.hideAll()
    }

    // Popups are visible, but not in the current instance.
    if (inst.popups.areVisible() && !inst.popups.areVisible(inst)) {

      // Hide markers in other instances.
      for (let i = 0; i < FE.INSTANCES.length; i++) {
        if (FE.INSTANCES[i] !== inst && FE.INSTANCES[i].popups && FE.INSTANCES[i].popups.areVisible()) {
          FE.INSTANCES[i].$el.find('.fr-marker').remove()
        }
      }

      inst.popups.hideAll()
    }

    // Dropdown button.
    if (editor.node.hasClass($btn.get(0), 'fr-dropdown')) {
      _dropdownButtonClick($btn)
    }

    // Regular button.
    else {
      _commandButtonClick($btn)

      if (FE.COMMANDS[$btn.data('cmd')] && FE.COMMANDS[$btn.data('cmd')].refreshAfterCallback !== false) {
        inst.button.bulkRefresh()
      }
    }
  }

  function _click(e) {
    const $btn = $(e.currentTarget)
    click($btn)
  }

  function hideActiveDropdowns($el) {
    const $active_dropdowns = $el.find('.fr-dropdown.fr-active')

    if ($active_dropdowns.length) {
      $active_dropdowns.removeClass('fr-active').attr('aria-expanded', false).next().attr('aria-hidden', true).css('overflow', '').find('> .fr-dropdown-wrapper').css('height', '')

      $active_dropdowns.parents('.fr-toolbar:not(.fr-inline)').css('zIndex', '')
      $active_dropdowns.prev().removeClass('fr-expanded')
    }
  }

  /**
   * Click in the dropdown menu.
   */
  function _dropdownMenuClick(e) {
    e.preventDefault()
    e.stopPropagation()
  }

  /**
   * Click on the dropdown wrapper.
   */
  function _dropdownWrapperClick(e) {
    e.stopPropagation()

    // Prevent blurring.
    if (!editor.helpers.isMobile()) {
      return false
    }
  }

  /**
   * Bind callbacks for commands.
   */
  function bindCommands($el, tooltipAbove) {
    editor.events.bindClick($el, '.fr-command:not(.fr-disabled)', _click)

    // Click on the dropdown menu.
    editor.events.$on($el, `${editor._mousedown} ${editor._mouseup} ${editor._move}`, '.fr-dropdown-menu', _dropdownMenuClick, true)

    // Click on the dropdown wrapper.
    editor.events.$on($el, `${editor._mousedown} ${editor._mouseup} ${editor._move}`, '.fr-dropdown-menu .fr-dropdown-wrapper', _dropdownWrapperClick, true)

    // Hide dropdowns that might be active.
    const _document = $el.get(0).ownerDocument
    const _window = 'defaultView' in _document ? _document.defaultView : _document.parentWindow

    function hideDropdowns(e) {
      if (!e || e.type === editor._mouseup && e.target !== $('html').get(0) || e.type === 'keydown' && (editor.keys.isCharacter(e.which) && !editor.keys.ctrlKey(e) || e.which === FE.KEYCODE.ESC)) {
        hideActiveDropdowns($el)
      }
    }
    editor.events.$on($(_window), `${editor._mouseup} resize keydown`, hideDropdowns, true)

    if (editor.opts.iframe) {
      editor.events.$on(editor.$win, editor._mouseup, hideDropdowns, true)
    }

    // Add refresh.
    if (editor.node.hasClass($el.get(0), 'fr-popup')) {
      $.merge(popup_buttons, $el.find('.fr-btn').toArray())
    }
    else {
      $.merge(buttons, $el.find('.fr-btn').toArray())
    }

    // Assing tooltips to buttons.
    editor.tooltip.bind($el, '.fr-btn, .fr-title', tooltipAbove)
  }

  /**
   * Create the content for dropdown.
   */
  function _content(command, info) {
    let c = ''

    if (info.html) {
      if (typeof info.html === 'function') {
        c += info.html.call(editor)
      }
      else {
        c += info.html
      }
    }
    else {
      let options = info.options

      if (typeof options === 'function') {
        options = options()
      }

      c += '<ul class="fr-dropdown-list" role="presentation">'

      for (const val in options) {
        if (Object.prototype.hasOwnProperty.call(options, val)) {
          let shortcut = editor.shortcuts.get(`${command}.${val}`)

          if (shortcut) {
            shortcut = `<span class="fr-shortcut">${shortcut}</span>`
          }
          else {
            shortcut = ''
          }

          c += `<li role="presentation"><a class="fr-command" tabIndex="-1" role="option" data-cmd="${(info.type === 'options' ? command.replace(/Options/g, '') : command)}" data-param1="${val}" title="${options[val]}">${editor.language.translate(options[val])}</a></li>`
        }
      }
      c += '</ul>'
    }

    return c
  }

  /**
   * Create button.
   */
  function build(command, info = {}, visible) {
    if (editor.helpers.isMobile() && info.showOnMobile === false) {
      return ''
    }

    let display_selection = info.displaySelection

    if (typeof display_selection === 'function') {
      display_selection = display_selection(editor)
    }

    let icon = ''

    if (info.type !== 'options') {
      if (display_selection) {
        const default_selection = typeof info.defaultSelection === 'function' ? info.defaultSelection(editor) : info.defaultSelection
        icon = `<span style="width:${info.displaySelectionWidth || 100}px">${editor.language.translate(default_selection || info.title)}</span>`
      }
      else {
        icon = editor.icon.create(info.icon || command)

        // Used instead of aria-label. The advantage is that it also display text when the css is disabled.
        icon += `<span class="fr-sr-only">${editor.language.translate(info.title) || ''}</span>`
      }
    }

    const popup = info.popup ? ' data-popup="true"' : ''

    const modal = info.modal ? ' data-modal="true"' : ''

    let shortcut = editor.shortcuts.get(`${command}.`)

    if (shortcut) {
      shortcut = ` (${shortcut})`
    }
    else {
      shortcut = ''
    }

    // Add custom id if present
    const button_id = `${command}-${editor.id}`

    const dropdown_id = `dropdown-menu-${button_id}`

    let btn = `<button id="${button_id}"${info.more_btn ? ` data-group-name="${button_id}" `: ''}type="button" tabIndex="-1" role="button"${info.toggle ? ' aria-pressed="false"' : ''}${info.type === 'dropdown' || info.type === 'options' ? ` aria-controls="${dropdown_id}" aria-expanded="false" aria-haspopup="true"` : ''}${info.disabled ? ' aria-disabled="true"' : ''} title="${editor.language.translate(info.title) || ''}${shortcut}" class="fr-command fr-btn${info.type === 'dropdown' || info.type == 'options' ? ' fr-dropdown' : ''}${(info.type == 'options' ? ' fr-options' : '')}${(info.type == 'more' ? ' fr-more' : '')}${info.displaySelection ? ' fr-selection' : ''}${info.back ? ' fr-back' : ''}${info.disabled ? ' fr-disabled' : ''}${!visible ? ' fr-hidden' : ''}" data-cmd="${command}"${popup}${modal}>${icon}</button>`

    if (info.type === 'dropdown' || info.type === 'options') {

      // Build dropdown.
      let dropdown = `<div id="${dropdown_id}" class="fr-dropdown-menu" role="listbox" aria-labelledby="${button_id}" aria-hidden="true"><div class="fr-dropdown-wrapper" role="presentation"><div class="fr-dropdown-content" role="presentation">`

      dropdown += _content(command, info)

      dropdown += '</div></div></div>'

      btn += dropdown
    }

    if (info.hasOptions && info.hasOptions.apply(editor)) {
      btn = `<div class="fr-btn-wrap">${btn} ${build(command + 'Options', Object.assign({}, info, { type: 'options', hasOptions: false }), visible)}  </div>`
    }

    return btn
  }

  function buildList(buttons, visible_buttons) {
    let str = ''

    for (let i = 0; i < buttons.length; i++) {
      const cmd_name = buttons[i]
      const cmd_info = FE.COMMANDS[cmd_name]

      if (cmd_info && typeof cmd_info.plugin !== 'undefined' && editor.opts.pluginsEnabled.indexOf(cmd_info.plugin) < 0) {
        continue
      }

      if (cmd_info) {
        const visible = typeof visible_buttons !== 'undefined' ? visible_buttons.indexOf(cmd_name) >= 0 : true
        str += build(cmd_name, cmd_info, visible)
      }
      else if (cmd_name === '|') {
        str += '<div class="fr-separator fr-vs" role="separator" aria-orientation="vertical"></div>'
      }
      else if (cmd_name === '-') {
        str += '<div class="fr-separator fr-hs" role="separator" aria-orientation="horizontal"></div>'
      }
    }

    return str
  }

  /**
   * Build button groups html
   */
  function buildGroup(buttonGroups){

    // Toolbar Groups HTML
    let mainToolbarGroupsHTML = ''
    let moreToolbarGroupsHTML = ''

    for (const groupName in buttonGroups) {

      let buttonGroup = buttonGroups[groupName]

      // Ignore non-button groups
      if (!buttonGroup.buttons) {
        continue
      }

      // Current button group Details
      let mainToolbarButtonsHTML = ''
      let moreToolbarButtonsHTML = ''
      let buttonCount = 0
      let alignment = 'left'
      let visibleButtons = FE.TOOLBAR_VISIBLE_BUTTONS

      for(let i = 0; i < buttonGroup.buttons.length; i++) {

        // Get command name
        const cmdName = buttonGroup.buttons[i]

        // Get command details
        const cmdInfo = FE.COMMANDS[cmdName]

        if (!cmdInfo) {
          if (cmdName == '|') {
            mainToolbarButtonsHTML += '<div class="fr-separator fr-vs" role="separator" aria-orientation="vertical"></div>'
          }
          else if (cmdName == '-') {
            mainToolbarButtonsHTML += '<div class="fr-separator fr-hs" role="separator" aria-orientation="horizontal"></div>'
          }
        }

        if (!cmdInfo || (cmdInfo && typeof cmdInfo.plugin !== 'undefined' && editor.opts.pluginsEnabled.indexOf(cmdInfo.plugin) < 0)) {
          continue
        }

        // If alignment of group is provided then use it
        if (buttonGroups[groupName].align !== undefined) {
          alignment = buttonGroups[groupName].align
        }

        // If buttonsVisible is provided then use it
        if (buttonGroups[groupName].buttonsVisible !== undefined) {
          visibleButtons = buttonGroups[groupName].buttonsVisible
        }

        // Build button groups from command details
        if (buttonGroups.showMoreButtons && buttonCount >= visibleButtons) {
          moreToolbarButtonsHTML += build(cmdName, cmdInfo, true)
        }
        else {
          mainToolbarButtonsHTML += build(cmdName, cmdInfo, true)
        }

        buttonCount++
      }

      // If atleast one hidden group exists then add its corresponding more button
      if (buttonGroups.showMoreButtons && buttonCount > visibleButtons) {
        const cmdName = groupName
        const cmdInfo = FE.COMMANDS[cmdName]
        cmdInfo.more_btn = true
        mainToolbarButtonsHTML += build(cmdName, cmdInfo, true)
      }

      // Add toolbar buttons html to the groups html
      mainToolbarGroupsHTML += `<div class="fr-btn-grp fr-float-${alignment}">${mainToolbarButtonsHTML}</div>`
      if (buttonGroups.showMoreButtons && moreToolbarButtonsHTML.length > 0) {
        moreToolbarGroupsHTML += `<div class="fr-more-toolbar" data-name="${groupName + '-' + editor.id}">${moreToolbarButtonsHTML}</div>`
      }

    }

    // Return toolbar button groups html
    if (editor.opts.toolbarBottom) {
      return `${moreToolbarGroupsHTML}<div class="fr-newline"></div>${mainToolbarGroupsHTML}`
    }
    return `${mainToolbarGroupsHTML}<div class="fr-newline"></div>${moreToolbarGroupsHTML}`
  }

  function refresh($btn) {
    const inst = $btn.parents('.fr-popup, .fr-toolbar').data('instance') || editor

    const cmd = $btn.data('cmd')

    let $dropdown

    if (!editor.node.hasClass($btn.get(0), 'fr-dropdown')) {
      $btn.removeClass('fr-active')

      if ($btn.attr('aria-pressed')) {
        $btn.attr('aria-pressed', false)
      }
    }
    else {
      $dropdown = $btn.next()
    }

    if (FE.COMMANDS[cmd] && FE.COMMANDS[cmd].refresh) {
      FE.COMMANDS[cmd].refresh.apply(inst, [$btn, $dropdown])
    }
    else if (editor.refresh[cmd]) {
      inst.refresh[cmd]($btn, $dropdown)
    }
    
  }

  function _bulkRefresh(btns) {
    const inst = editor.$tb ? editor.$tb.data('instance') || editor : editor

    // Check the refresh event.
    if (editor.events.trigger('buttons.refresh') === false) {
      return true
    }

    setTimeout(() => {
      const focused = inst.selection.inEditor() && inst.core.hasFocus()

      for (let i = 0; i < btns.length; i++) {
        const $btn = $(btns[i])
        const cmd = $btn.data('cmd')

        if ($btn.parents('.fr-popup').length === 0) {
          if (focused || FE.COMMANDS[cmd] && FE.COMMANDS[cmd].forcedRefresh) {
            inst.button.refresh($btn)
          }
          else if (!editor.node.hasClass($btn.get(0), 'fr-dropdown')) {
            $btn.removeClass('fr-active')

            if ($btn.attr('aria-pressed')) {
              $btn.attr('aria-pressed', false)
            }
          }
        }
        else if ($btn.parents('.fr-popup').isVisible()) {
          inst.button.refresh($btn)
        }
      }
    }, 0)
  }

  /**
   * Do buttons refresh.
   */
  function bulkRefresh() {
    _bulkRefresh(buttons)
    _bulkRefresh(popup_buttons)
  }

  function _destroy() {
    buttons = []
    popup_buttons = []
  }

  let refresh_timeout = null

  function delayedBulkRefresh() {
    clearTimeout(refresh_timeout)
    refresh_timeout = setTimeout(bulkRefresh, 50)
  }

  /**
   * Initialize.
   */
  function _init() {
    // Assign refresh and do refresh.
    addButtons();
    if (editor.opts.toolbarInline) {
      editor.events.on('toolbar.show', bulkRefresh)
    }
    else {
      editor.events.on('mouseup', delayedBulkRefresh)
      editor.events.on('keyup', delayedBulkRefresh)
      editor.events.on('blur', delayedBulkRefresh)
      editor.events.on('focus', delayedBulkRefresh)
      editor.events.on('contentChanged', delayedBulkRefresh)

      if (editor.helpers.isMobile()) {
        editor.events.$on(editor.$doc, 'selectionchange', bulkRefresh)
      }
    }
    editor.events.on('shared.destroy', _destroy)
  }

  return {
    _init,
    build,
    buildList,
    buildGroup,
    bindCommands,
    refresh,
    bulkRefresh,
    exec,
    click,
    hideActiveDropdowns,
    addButtons,
    getButtons,
    getPosition
  }
}
