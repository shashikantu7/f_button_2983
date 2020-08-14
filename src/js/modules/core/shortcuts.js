import FE from '../../editor.js'

Object.assign(FE.DEFAULTS, {
  shortcutsEnabled: [],
  shortcutsHint: true
})

FE.SHORTCUTS_MAP = {}

FE.RegisterShortcut = function (key, cmd, val, letter, shift, option) {
  FE.SHORTCUTS_MAP[(shift ? '^' : '') + (option ? '@' : '') + key] = {
    cmd,
    val,
    letter,
    shift,
    option
  }

  FE.DEFAULTS.shortcutsEnabled.push(cmd)
}

FE.RegisterShortcut(FE.KEYCODE.E, 'show', null, 'E', false, false)
FE.RegisterShortcut(FE.KEYCODE.B, 'bold', null, 'B', false, false)
FE.RegisterShortcut(FE.KEYCODE.I, 'italic', null, 'I', false, false)
FE.RegisterShortcut(FE.KEYCODE.U, 'underline', null, 'U', false, false)
FE.RegisterShortcut(FE.KEYCODE.S, 'strikeThrough', null, 'S', false, false)
FE.RegisterShortcut(FE.KEYCODE.CLOSE_SQUARE_BRACKET, 'indent', null, ']', false, false)
FE.RegisterShortcut(FE.KEYCODE.OPEN_SQUARE_BRACKET, 'outdent', null, '[', false, false)
FE.RegisterShortcut(FE.KEYCODE.Z, 'undo', null, 'Z', false, false)
FE.RegisterShortcut(FE.KEYCODE.Z, 'redo', null, 'Z', true, false)
FE.RegisterShortcut(FE.KEYCODE.Y, 'redo', null, 'Y', false, false)

FE.MODULES.shortcuts = function (editor) {
  let inverse_map = null

  function get(cmd) {
    if (!editor.opts.shortcutsHint) {
      return null
    }

    if (!inverse_map) {
      inverse_map = {}

      for (const key in FE.SHORTCUTS_MAP) {
        if (Object.prototype.hasOwnProperty.call(FE.SHORTCUTS_MAP, key) && editor.opts.shortcutsEnabled.indexOf(FE.SHORTCUTS_MAP[key].cmd) >= 0) {
          inverse_map[`${FE.SHORTCUTS_MAP[key].cmd}.${FE.SHORTCUTS_MAP[key].val || ''}`] = {
            shift: FE.SHORTCUTS_MAP[key].shift,
            option: FE.SHORTCUTS_MAP[key].option,
            letter: FE.SHORTCUTS_MAP[key].letter
          }
        }
      }
    }

    const srct = inverse_map[cmd]

    if (!srct) {
      return null
    }

    return (editor.helpers.isMac() ? String.fromCharCode(8984) : `${editor.language.translate('Ctrl')}+`) +
            (srct.shift ? editor.helpers.isMac() ? String.fromCharCode(8679) : `${editor.language.translate('Shift')}+` : '') +
            (srct.option ? editor.helpers.isMac() ? String.fromCharCode(8997) : `${editor.language.translate('Alt')}+` : '') +
            srct.letter
  }

  let active = false

  /**
   * Execute shortcut.
   */
  function exec(e) {
    if (!editor.core.hasFocus()) {
      return true
    }

    const keycode = e.which

    const ctrlKey = navigator.userAgent.indexOf('Mac OS X') !== -1 ? e.metaKey : e.ctrlKey

    if (e.type === 'keyup' && active) {
      if (keycode !== FE.KEYCODE.META) {
        active = false

        return false
      }
    }

    if (e.type === 'keydown') {
      active = false
    }

    // Build shortcuts map.
    const map_key = (e.shiftKey ? '^' : '') + (e.altKey ? '@' : '') + keycode
    let deep_parent = editor.node.blockParent(editor.selection.blocks()[0])

    // https://github.com/froala-labs/froala-editor-js-2/issues/1571
    if (deep_parent && deep_parent.tagName == 'TR' && deep_parent.getAttribute('contenteditable') == undefined) {
      deep_parent = deep_parent.closest('table')
    }

    // https://github.com/CelestialSystem/froala-editor-js-2/tree/1303
    // Check for content editable:false node and do not allow short-cuts
    if (ctrlKey && FE.SHORTCUTS_MAP[map_key] && !(deep_parent && deep_parent.getAttribute('contenteditable') === 'false')) {
      const cmd = FE.SHORTCUTS_MAP[map_key].cmd

      // Check if shortcut is enabled.
      if (cmd && editor.opts.shortcutsEnabled.indexOf(cmd) >= 0) {
        const val = FE.SHORTCUTS_MAP[map_key].val

        if (editor.events.trigger('shortcut', [e, cmd, val]) !== false) {
          // Search for command.
          if (cmd && (editor.commands[cmd] || FE.COMMANDS[cmd] && FE.COMMANDS[cmd].callback)) {
            e.preventDefault()
            e.stopPropagation()

            if (e.type === 'keydown') {
              (editor.commands[cmd] || FE.COMMANDS[cmd].callback)()
              active = true
            }

            return false
          }
        }
        else {
          active = true;

          return false;
        }
      }
    }
  }

  /**
   * Initialize.
   */
  function _init() {
    editor.events.on('keydown', exec, true)
    editor.events.on('keyup', exec, true)
  }

  return {
    _init,
    get
  }
}
