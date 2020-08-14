import FE from '../../editor.js'

FE.MODULES.undo = function (editor) {
  /**
   * Disable the default browser undo.
   */
  function _disableBrowserUndo(e) {
    const keyCode = e.which
    const ctrlKey = editor.keys.ctrlKey(e)

    // Ctrl Key.
    if (ctrlKey) {
      if (keyCode === FE.KEYCODE.Z && e.shiftKey) {
        e.preventDefault()
      }

      if (keyCode === FE.KEYCODE.Z) {
        e.preventDefault()
      }
    }
  }

  function canDo() {
    if (editor.undo_stack.length === 0 || editor.undo_index <= 1) {
      return false
    }

    return true
  }

  function canRedo() {
    if (editor.undo_index === editor.undo_stack.length) {
      return false
    }

    return true
  }

  let last_html = null

  function saveStep(snapshot) {
    if (!editor.undo_stack || editor.undoing || editor.el.querySelector('.fr-marker')) {
      return
    }

    if (typeof snapshot === 'undefined') {
      snapshot = editor.snapshot.get()

      if (!editor.undo_stack[editor.undo_index - 1] || !editor.snapshot.equal(editor.undo_stack[editor.undo_index - 1], snapshot)) {
        dropRedo()
        editor.undo_stack.push(snapshot)
        editor.undo_index++

        if (snapshot.html !== last_html) {
          editor.events.trigger('contentChanged')
          last_html = snapshot.html
        }
      }
    }
    else {
      dropRedo()

      if (editor.undo_index > 0) {
        editor.undo_stack[editor.undo_index - 1] = snapshot
      }
      else {
        editor.undo_stack.push(snapshot)
        editor.undo_index++
      }
    }
  }

  function dropRedo() {
    if (!editor.undo_stack || editor.undoing) {
      return
    }

    while (editor.undo_stack.length > editor.undo_index) {
      editor.undo_stack.pop()
    }
  }

  function _do() {
    if (editor.undo_index > 1) {
      editor.undoing = true

      // Get snapshot.
      const snapshot = editor.undo_stack[--editor.undo_index - 1]

      // Clear any existing content changed timers.
      clearTimeout(editor._content_changed_timer)

      // Restore snapshot.
      editor.snapshot.restore(snapshot)
      last_html = snapshot.html

      // Hide popups.
      editor.popups.hideAll()

      // Enable toolbar.
      editor.toolbar.enable()

      // Call content changed.
      editor.events.trigger('contentChanged')

      editor.events.trigger('commands.undo')

      editor.undoing = false
    }
  }

  function _redo() {
    if (editor.undo_index < editor.undo_stack.length) {
      editor.undoing = true

      // Get snapshot.
      const snapshot = editor.undo_stack[editor.undo_index++]

      // Clear any existing content changed timers.
      clearTimeout(editor._content_changed_timer)

      // Restore snapshot.
      editor.snapshot.restore(snapshot)
      last_html = snapshot.html

      // Hide popups.
      editor.popups.hideAll()

      // Enable toolbar.
      editor.toolbar.enable()

      // Call content changed.
      editor.events.trigger('contentChanged')

      editor.events.trigger('commands.redo')

      editor.undoing = false
    }
  }

  function reset() {
    editor.undo_index = 0
    editor.undo_stack = []
  }

  function _destroy() {
    editor.undo_stack = []
  }

  /**
   * Initialize
   */
  function _init() {
    reset()
    editor.events.on('initialized', () => {
      last_html = (editor.$wp ? editor.$el.html() : editor.$oel.get(0).outerHTML).replace(/ style=""/g, '')
    })

    editor.events.on('blur', () => {
      if (!editor.el.querySelector('.fr-dragging')) {
        editor.undo.saveStep()
      }
    })

    editor.events.on('keydown', _disableBrowserUndo)

    editor.events.on('destroy', _destroy)
  }

  return {
    _init,
    run: _do,
    redo: _redo,
    canDo,
    canRedo,
    dropRedo,
    reset,
    saveStep
  }
}
