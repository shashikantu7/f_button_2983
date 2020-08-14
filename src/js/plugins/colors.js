import FE from '../index.js'
'use strict';

// Popup templates for both textColor and backgroundColor
Object.assign(FE.POPUP_TEMPLATES, {
  'textColor.picker': '[_BUTTONS_][_TEXT_COLORS_][_CUSTOM_COLOR_]',
  'backgroundColor.picker': '[_BUTTONS_][_BACKGROUND_COLORS_][_CUSTOM_COLOR_]'
})

// Extend defaults.
Object.assign(FE.DEFAULTS, {
  colorsText: [
    '#61BD6D', '#1ABC9C', '#54ACD2', '#2C82C9', '#9365B8', '#475577', '#CCCCCC',
    '#41A85F', '#00A885', '#3D8EB9', '#2969B0', '#553982', '#28324E', '#000000',
    '#F7DA64', '#FBA026', '#EB6B56', '#E25041', '#A38F84', '#EFEFEF', '#FFFFFF',
    '#FAC51C', '#F37934', '#D14841', '#B8312F', '#7C706B', '#D1D5D8', 'REMOVE'
  ],
  colorsBackground: [
    '#61BD6D', '#1ABC9C', '#54ACD2', '#2C82C9', '#9365B8', '#475577', '#CCCCCC',
    '#41A85F', '#00A885', '#3D8EB9', '#2969B0', '#553982', '#28324E', '#000000',
    '#F7DA64', '#FBA026', '#EB6B56', '#E25041', '#A38F84', '#EFEFEF', '#FFFFFF',
    '#FAC51C', '#F37934', '#D14841', '#B8312F', '#7C706B', '#D1D5D8', 'REMOVE'
  ],
  colorsStep: 7,
  colorsHEXInput: true,
  colorsButtons: ['colorsBack', '|', '-']
})

FE.PLUGINS.colors = function (editor) {

  const { $ } = editor
  const custom_color_template = `<div class="fr-color-hex-layer fr-active fr-layer" id="fr-color-hex-layer- 
  ${editor.id}"><div class="fr-input-line"><input maxlength="7" id="[ID]"
  type="text" placeholder="${editor.language.translate('HEX Color')}" 
  tabIndex="1" aria-required="true"></div><div class="fr-action-buttons"><button 
  type="button" class="fr-command fr-submit" data-cmd="[COMMAND]" tabIndex="2" role="button">
  ${editor.language.translate('OK')}</button></div></div>`

  /*
   * Show the colors popup.
   */
  function _showColorsPopup(cmd_type) {
    const $btn = editor.$tb.find(`.fr-command[data-cmd="${cmd_type}"]`)

    // Get color picker based on command type
    let $popup = editor.popups.get(`${cmd_type}.picker`) 

    if (!$popup) $popup = _initColorsPopup(cmd_type)

    if (!$popup.hasClass('fr-active')) {

      // Colors popup
      editor.popups.setContainer(`${cmd_type}.picker`, editor.$tb)

      // Refresh colors in the current popup
      if (cmd_type === 'textColor') {
        _refreshColor('text')
      }
      else {
        _refreshColor('background')
      }

      // Colors popup left and top position.
      if ($btn.isVisible()) {
        const { left, top } = editor.button.getPosition($btn)
        editor.popups.show(`${cmd_type}.picker`, left, top, $btn.outerHeight())
      }
      else {
        editor.position.forSelection($popup)
        editor.popups.show(`${cmd_type}.picker`)
      }
    }
  }

  /**
   * Init the colors popup.
   */
  function _initColorsPopup(cmd_type) {
    
    let colors_buttons = ''
    
    if (editor.opts.toolbarInline) {

      // Colors buttons.
      if (editor.opts.colorsButtons.length > 0) {
        colors_buttons += `<div class="fr-buttons fr-colors-buttons fr-tabs">
        ${editor.button.buildList(editor.opts.colorsButtons)}
        </div>`
      }
    }

    // Custom HEX.
    let custom_color = ''

    let template
    if (cmd_type === 'textColor') {

      if (editor.opts.colorsHEXInput) {
        custom_color = custom_color_template.replace(/\[ID\]/g, `fr-color-hex-layer-text-${editor.id}`)
          .replace(/\[COMMAND\]/g, 'customTextColor')
      }

      // Template for textColor picker
      template = {
        buttons: colors_buttons,
        text_colors: _colorPickerHTML('text'),
        custom_color: custom_color
      }
    } 
    else {

      if (editor.opts.colorsHEXInput) {
        custom_color = custom_color_template.replace(/\[ID\]/g, `fr-color-hex-layer-background-${editor.id}`)
          .replace(/\[COMMAND\]/g, 'customBackgroundColor')
      }

      // Template for backgroundColor picker
      template = {
        buttons: colors_buttons,
        background_colors: _colorPickerHTML('background'),
        custom_color: custom_color
      }
    }
    // Create a popup and add accessibility to it
    let $popup = editor.popups.create(`${cmd_type}.picker`, template)
    _addAccessibility($popup, `${cmd_type}.picker`)

    return $popup
  }

  /*
   * HTML for the color picker colors.
   */
  function _colorPickerHTML(tab) {

    // Get colors according to tab name.
    const colors = (tab === 'text' ? editor.opts.colorsText : editor.opts.colorsBackground)

    // Create colors html.
    let colors_html = `<div class="fr-color-set fr-${tab}-color fr-selected-set">`

    // Add colors.
    for (let i = 0; i < colors.length; i++) {
      if (i !== 0 && i % editor.opts.colorsStep === 0) {
        colors_html += '<br>'
      }

      if (colors[i] !== 'REMOVE') {
        colors_html += `<span class="fr-command fr-select-color" style="background:${colors[i]};" 
        tabIndex="-1" aria-selected="false" role="button" data-cmd="apply${tab}Color" 
        data-param1="${colors[i]}"><span class="fr-sr-only"> ${editor.language.translate('Color')}${colors[i]} 
        &nbsp;&nbsp;&nbsp;</span></span>`
      }

      else {
        colors_html += `<span class="fr-command fr-select-color" data-cmd="apply${tab}Color"
         tabIndex="-1" role="button" data-param1="REMOVE" 
         title="${editor.language.translate('Clear Formatting')}">${editor.icon.create('remove')} 
        <span class="fr-sr-only"> ${editor.language.translate('Clear Formatting')} </span></span>`
      }
    }

    return `${colors_html}</div>`
  }

  /*
   * Register keyboard events.
   */
  function _addAccessibility($popup, popupName) {

    // Register popup event.
    editor.events.on('popup.tab', function (e) {
      const $focused_item = $(e.currentTarget)

      // Skip if popup is not visible or focus is elsewere.
      if (!editor.popups.isVisible(popupName) || !$focused_item.is('span')) {
        return true
      }
      const key_code = e.which
      let status = true

      // Tabbing.
      if (FE.KEYCODE.TAB === key_code) {
        const $tb = $popup.find('.fr-buttons')

        // Focus back the popup's toolbar if exists.
        status = !editor.accessibility.focusToolbar($tb, (e.shiftKey ? true : false))
      }

      // Arrows.
      else if (FE.KEYCODE.ARROW_UP === key_code || FE.KEYCODE.ARROW_DOWN === key_code 
        || FE.KEYCODE.ARROW_LEFT === key_code || FE.KEYCODE.ARROW_RIGHT === key_code) {
        if ($focused_item.is('span.fr-select-color')) {

          // Get all current colors.
          const $colors = $focused_item.parent().find('span.fr-select-color')

          // Get focused item position.
          const index = $colors.index($focused_item)

          // Get color matrix dimensions.
          const columns = editor.opts.colorsStep
          const lines = Math.floor($colors.length / columns)

          // Get focused item coordinates.
          const column = index % columns
          const line = Math.floor(index / columns)

          let nextIndex = line * columns + column
          const dimension = lines * columns

          // Calculate next index. Go to the other opposite site of the matrix if there is no next adjacent element.
          // Up/Down: Traverse matrix lines.
          // Left/Right: Traverse the matrix as it is a vector.
          if (FE.KEYCODE.ARROW_UP === key_code) {
            nextIndex = (((nextIndex - columns) % dimension) + dimension) % dimension // Javascript negative modulo bug.
          }
          else if (FE.KEYCODE.ARROW_DOWN === key_code) {
            nextIndex = (nextIndex + columns) % dimension
          }
          else if (FE.KEYCODE.ARROW_LEFT === key_code) {
            nextIndex = (((nextIndex - 1) % dimension) + dimension) % dimension // Javascript negative modulo bug.
          }
          else if (FE.KEYCODE.ARROW_RIGHT === key_code) {
            nextIndex = (nextIndex + 1) % dimension
          }

          // Get the next element based on the new index.
          const $el = $($colors.get(nextIndex))

          // Focus.
          editor.events.disableBlur()
          $el.focus()

          status = false
        }
      }

      // ENTER or SPACE.
      else if (FE.KEYCODE.ENTER === key_code) {

        editor.button.exec($focused_item)
        status = false
      }

      // Prevent propagation.
      if (status === false) {
        e.preventDefault()
        e.stopPropagation()
      }

      return status
    }, true)
  }

  /*
   * Show the current selected color.
   */
  function _refreshColor(tab) {
    const $popup = editor.popups.get(`${tab}Color.picker`)
    let $element = $(editor.selection.element())

    // The color css property.
    let color_type

    if (tab === 'background') {
      color_type = 'background-color'
    }
    else {
      color_type = 'color'
    }

    const $current_color = $popup.find(`.fr-${tab}-color .fr-select-color`)

    // Remove current color selection.

    $current_color.find('.fr-selected-color').remove()
    $current_color.removeClass('fr-active-item')
    $current_color.not('[data-param1="REMOVE"]').attr('aria-selected', false)

    // Find the selected color.
    while ($element.get(0) !== editor.el) {

      // Transparent or black.
      if ($element.css(color_type) === 'transparent' || $element.css(color_type) === 'rgba(0, 0, 0, 0)') {
        $element = $element.parent()
      }

      // Select the correct color.
      else {
        const $select_color = $popup.find(`.fr-${tab}-color .fr-select-color[data-param1="${editor.helpers.RGBToHex($element.css(color_type))}"]`)

        // Add checked icon.
        $select_color.append('<span class="fr-selected-color" aria-hidden="true">\uf00c</span>')
        $select_color.addClass('fr-active-item').attr('aria-selected', true)
        break
      }
    }

    _updateColor(tab)
  }

  function _updateColor(val) {
    const $popup = editor.popups.get(`${val}Color.picker`)
    let $selectionColor = $popup.find(`.fr-${val}-color .fr-active-item`).attr('data-param1')
    const $input = $popup.find('.fr-color-hex-layer input')

    if (!$selectionColor) {
      $selectionColor = ''
    }

    if ($input.length) {
      $($input.val($selectionColor).input).trigger('change')
    }
  }

  /*
   * Change background color.
   */
  function background(val) {

    // Set background  color.
    if (val !== 'REMOVE') {
      editor.format.applyStyle('background-color', editor.helpers.HEXtoRGB(val))
    }

    // Remove background color.
    else {
      editor.format.removeStyle('background-color')
    }

    editor.popups.hide('backgroundColor.picker')
  }

  /*
   * Change text color.
   */
  function text(val) {

    // Set text color.
    if (val !== 'REMOVE') {
      editor.format.applyStyle('color', editor.helpers.HEXtoRGB(val))
    }

    // Remove text color.
    else {
      editor.format.removeStyle('color')
    }

    editor.popups.hide('textColor.picker')
  }

  /*
   * Go back to the inline editor.
   */
  function back() {
    editor.popups.hide('textColor.picker')
    editor.popups.hide('backgroundColor.picker')
    editor.toolbar.showInline()
  }

  function customColor(tab) {
    const $popup = editor.popups.get(`${tab}Color.picker`)

    const $input = $popup.find('.fr-color-hex-layer input')

    if ($input.length) {
      const color = $input.val()

      // Set custom color
      if (tab === 'background') {
        background(color)
      }
      else {
        text(color)
      }
    }
  }

  return {
    showColorsPopup: _showColorsPopup,
    background: background,
    customColor: customColor,
    text: text,
    back: back
  }
}

// Select text color command.
FE.DefineIcon('textColor', { NAME: 'tint', SVG_KEY: 'textColor' })
FE.RegisterCommand('textColor', {
  title: 'Text Color',
  undo: false,
  focus: true,
  refreshOnCallback: false,
  popup: true,
  callback: function () {
    if (!this.popups.isVisible('textColor.picker')) {
      this.colors.showColorsPopup('textColor')
    }
    else {
      if (this.$el.find('.fr-marker').length) {
        this.events.disableBlur()
        this.selection.restore()
      }
      this.popups.hide('textColor.picker')
    }
  }
})
// Command to apply text color from the available colors
FE.RegisterCommand('applytextColor', {
  undo: true,
  callback: function (cmd, val) {
    this.colors.text(val)
  }
})
// Command to set custom text color
FE.RegisterCommand('customTextColor', {
  title: 'OK',
  undo: true,
  callback: function () {
    this.colors.customColor('text')
  }
})

// Select background color command.
FE.DefineIcon('backgroundColor', { NAME: 'paint-brush', SVG_KEY: 'backgroundColor' })
FE.RegisterCommand('backgroundColor', {
  title: 'Background Color',
  undo: false,
  focus: true,
  refreshOnCallback: false,
  popup: true,
  callback: function () {
    if (!this.popups.isVisible('backgroundColor.picker')) {
      this.colors.showColorsPopup('backgroundColor')
    }
    else {
      if (this.$el.find('.fr-marker').length) {
        this.events.disableBlur()
        this.selection.restore()
      }
      this.popups.hide('backgroundColor.picker')
    }
  }
})
// Command to apply background color from the available colors
FE.RegisterCommand('applybackgroundColor', {
  undo: true,
  callback: function (cmd, val) {
    this.colors.background(val)
  }
})
// Command to set custom background color
FE.RegisterCommand('customBackgroundColor', {
  title: 'OK',
  undo: true,
  callback: function () {
    this.colors.customColor('background')
  }
})

// Colors back.
FE.DefineIcon('colorsBack', { NAME: 'arrow-left', SVG_KEY: 'back' })
FE.RegisterCommand('colorsBack', {
  title: 'Back',
  undo: false,
  focus: false,
  back: true,
  refreshAfterCallback: false,
  callback: function () {
    this.colors.back()
  }
})

FE.DefineIcon('remove', { NAME: 'eraser', SVG_KEY: 'remove' })
