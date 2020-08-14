import './events.js'

import FE from '../../editor.js'

Object.assign(FE.DEFAULTS, {
  indentMargin: 20
})

FE.COMMANDS = {
  bold: {
    title: 'Bold',
    toggle: true,
    refresh($btn) {
      const format = this.format.is('strong')
      $btn.toggleClass('fr-active', format).attr('aria-pressed', format)
    }
  },
  italic: {
    title: 'Italic',
    toggle: true,
    refresh($btn) {
      const format = this.format.is('em')
      $btn.toggleClass('fr-active', format).attr('aria-pressed', format)
    }
  },
  underline: {
    title: 'Underline',
    toggle: true,
    refresh($btn) {
      const format = this.format.is('u')
      $btn.toggleClass('fr-active', format).attr('aria-pressed', format)
    }
  },
  strikeThrough: {
    title: 'Strikethrough',
    toggle: true,
    refresh($btn) {
      const format = this.format.is('s')
      $btn.toggleClass('fr-active', format).attr('aria-pressed', format)
    }
  },
  subscript: {
    title: 'Subscript',
    toggle: true,
    refresh($btn) {
      const format = this.format.is('sub')
      $btn.toggleClass('fr-active', format).attr('aria-pressed', format)
    }
  },
  superscript: {
    title: 'Superscript',
    toggle: true,
    refresh($btn) {
      const format = this.format.is('sup')
      $btn.toggleClass('fr-active', format).attr('aria-pressed', format)
    }
  },
  outdent: {
    title: 'Decrease Indent'
  },
  indent: {
    title: 'Increase Indent'
  },
  undo: {
    title: 'Undo',
    undo: false,
    forcedRefresh: true,
    disabled: true
  },
  redo: {
    title: 'Redo',
    undo: false,
    forcedRefresh: true,
    disabled: true
  },
  insertHR: {
    title: 'Insert Horizontal Line'
  },
  clearFormatting: {
    title: 'Clear Formatting'
  },
  selectAll: {
    title: 'Select All',
    undo: false
  },
  moreText: {
    title: 'More Text',
    undo: false
  },
  moreParagraph: {
    title: 'More Paragraph',
    undo: false
  },
  moreRich: {
    title: 'More Rich',
    undo: false
  },
  moreMisc: {
    title: 'More Misc',
    undo: false
  }
}

FE.RegisterCommand = function (name, info) {
  FE.COMMANDS[name] = info
}

FE.MODULES.commands = function (editor) {
  const $ = editor.$

  function _createDefaultTag(empty) {
    if (editor.html.defaultTag()) {
      empty = `<${editor.html.defaultTag()}>${empty}</${editor.html.defaultTag()}>`
    }

    return empty
  }

  const mapping = {
    bold() {
      _execCommand('bold', 'strong')
    },

    subscript() {

      // Remove sup.
      if (editor.format.is('sup')) {
        editor.format.remove('sup')
      }

      _execCommand('subscript', 'sub')
    },

    superscript() {

      // Remove sub.
      if (editor.format.is('sub')) {
        editor.format.remove('sub')
      }

      _execCommand('superscript', 'sup')
    },

    italic() {
      _execCommand('italic', 'em')
    },

    strikeThrough() {
      _execCommand('strikeThrough', 's')
    },

    underline() {
      _execCommand('underline', 'u')
    },

    undo() {
      editor.undo.run()
    },

    redo() {
      editor.undo.redo()
    },

    indent() {
      _processIndent(1)
    },

    outdent() {
      _processIndent(-1)
    },

    show() {
      if (editor.opts.toolbarInline) {
        editor.toolbar.showInline(null, true)
      }
    },

    insertHR() {
      editor.selection.remove()

      let empty = ''

      if (editor.core.isEmpty()) {
        empty = '<br>'
        empty = _createDefaultTag(empty)
      }

      editor.html.insert(`<hr id="fr-just" class="fr-just">${empty}`)
      const $hr = editor.$el.find('hr#fr-just').length ? editor.$el.find('hr#fr-just') : editor.$el.find('.fr-just')
      $hr.removeAttr('id')
      $hr.removeAttr('class')
      let check

      // Make sure we can type after HR.
      if ($hr.next().length === 0) {
        const default_tag = editor.html.defaultTag()

        if (default_tag) {
          $hr.after($(editor.doc.createElement(default_tag)).append('<br>').get(0))
        }
        else {
          $hr.after('<br>')
        }
      }

      if ($hr.prev().is('hr')) {
        check = editor.selection.setAfter($hr.get(0), false)
      }
      else if ($hr.next().is('hr')) {
        check = editor.selection.setBefore($hr.get(0), false)
      }
      else {
        if (!editor.selection.setAfter($hr.get(0), false)) {
          editor.selection.setBefore($hr.get(0), false)
        }
      }

      // Added fix for this issue https://github.com/froala-labs/froala-editor-js-2/issues/384
      if (!check && typeof check !== 'undefined') {
        empty = `${FE.MARKERS}<br>`
        empty = _createDefaultTag(empty)
        $hr.after(empty)
      }

      editor.selection.restore()
    },

    clearFormatting() {
      editor.format.remove()
    },

    selectAll() {
      editor.doc.execCommand('selectAll', false, false)
    },

    moreText(cmd) {
      _moreExec(cmd)
    },

    moreParagraph(cmd) {
      _moreExec(cmd)
    },

    moreRich(cmd) {
      _moreExec(cmd)
    },

    moreMisc(cmd) {
      _moreExec(cmd)
    }
  }

  /**
   * Executes more button commands
   */
  function _moreExec(cmd) {
    let $btn = editor.$tb.find(`[data-cmd=${cmd}]`)

    // Toggle more button in the toolbar
    _toggleMoreButton($btn)

    // Set the height of all more toolbars
    editor.toolbar.setMoreToolbarsHeight()
  }

  /**
   * Display/Hide the toolbar buttons on clicking the more button
   */
  function _toggleMoreButton($btn) {

    // Get the corresponding button group for that more button
    const $buttonGroup = editor.$tb.find(`.fr-more-toolbar[data-name="${$btn.attr('data-group-name')}"]`)

    // Hide all button groups before opening any one
    editor.$tb.find('.fr-open').not($btn).removeClass('fr-open')
    $btn.toggleClass('fr-open')

    // Make sure we hide height properly.
    editor.$tb.find('.fr-more-toolbar').removeClass('fr-overflow-visible')

    // We already have a more toolbar expanded.
    if (editor.$tb.find('.fr-expanded').not($buttonGroup).length) {
      // Toggle existing toolbar.
      editor.$tb.find('.fr-expanded').toggleClass('fr-expanded')

      // Open the new toolbar.
      $buttonGroup.toggleClass('fr-expanded')
    }
    else {
      // Open toolbar.
      $buttonGroup.toggleClass('fr-expanded')

      editor.$box.toggleClass('fr-toolbar-open')
      editor.$tb.toggleClass('fr-toolbar-open')
    }
  }

  /**
   * Exec command.
   */
  function exec(cmd, params) {
    // Trigger before command to see if to execute the default callback.
    if (editor.events.trigger('commands.before', $.merge([cmd], params || [])) !== false) {

      // Get the callback.
      const callback = FE.COMMANDS[cmd] && FE.COMMANDS[cmd].callback || mapping[cmd]

      let focus = true
      let accessibilityFocus = false

      if (FE.COMMANDS[cmd]) {
        if (typeof FE.COMMANDS[cmd].focus !== 'undefined') {
          focus = FE.COMMANDS[cmd].focus
        }

        if (typeof FE.COMMANDS[cmd].accessibilityFocus !== 'undefined') {
          accessibilityFocus = FE.COMMANDS[cmd].accessibilityFocus
        }
      }

      // Make sure we have focus.
      if (
        !editor.core.hasFocus() && focus && !editor.popups.areVisible() ||
        !editor.core.hasFocus() && accessibilityFocus && editor.accessibility.hasFocus()
      ) {

        // Focus in the editor at any position.
        editor.events.focus(true)
      }

      // Callback.
      // Save undo step.
      if (FE.COMMANDS[cmd] && FE.COMMANDS[cmd].undo !== false) {
        if (editor.$el.find('.fr-marker').length) {
          editor.events.disableBlur()
          editor.selection.restore()
        }

        editor.undo.saveStep()
      }

      if (callback) {
        callback.apply(editor, $.merge([cmd], params || []))
      }

      // Trigger after command.
      editor.events.trigger('commands.after', $.merge([cmd], params || []))

      // Save undo step again.
      if (FE.COMMANDS[cmd] && FE.COMMANDS[cmd].undo !== false) {
        editor.undo.saveStep()
      }
    }
  }

  /**
   * Exex default.
   */
  function _execCommand(cmd, tag) {
    editor.format.toggle(tag)
  }

  function _processIndent(indent) {
    editor.selection.save()
    editor.html.wrap(true, true, true, true)
    editor.selection.restore()

    const blocks = editor.selection.blocks()

    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i].tagName !== 'LI' || blocks[i].parentNode.tagName !== 'LI') {
        let $block = $(blocks[i]);
        if (blocks[i].tagName != 'LI' && blocks[i].parentNode.tagName == 'LI') {
          $block = $(blocks[i].parentNode);
        }
        const prop = editor.opts.direction === 'rtl' || $block.css('direction') === 'rtl' ? 'margin-right' : 'margin-left'

        const margin_left = editor.helpers.getPX($block.css(prop))

        // Do not allow text to go out of the editor view.
        if ($block.width() < 2 * editor.opts.indentMargin && indent > 0) {
          continue
        }

        $block.css(prop, Math.max(margin_left + indent * editor.opts.indentMargin, 0) || '')
        $block.removeClass('fr-temp-div')
      }
    }

    editor.selection.save()
    editor.html.unwrap()
    editor.selection.restore()
  }

  function callExec(k) {
    return function () {
      exec(k)
    }
  }

  const resp = {}

  for (const k in mapping) {
    if (Object.prototype.hasOwnProperty.call(mapping, k)) {
      resp[k] = callExec(k)
    }
  }

  function _init() {

    // Prevent typing in HR.
    editor.events.on('keydown', (e) => {
      const el = editor.selection.element()

      if (el && el.tagName === 'HR' && !editor.keys.isArrow(e.which)) {
        e.preventDefault()

        return false
      }
    })

    editor.events.on('keyup', (e) => {
      const el = editor.selection.element()

      if (el && el.tagName === 'HR') {
        if (e.which === FE.KEYCODE.ARROW_LEFT || e.which === FE.KEYCODE.ARROW_UP) {
          if (el.previousSibling) {
            if (!editor.node.isBlock(el.previousSibling)) {
              $(el).before(FE.MARKERS)
            }
            else {
              editor.selection.setAtEnd(el.previousSibling)
            }

            editor.selection.restore()

            return false
          }
        }
        else if (e.which === FE.KEYCODE.ARROW_RIGHT || e.which === FE.KEYCODE.ARROW_DOWN) {
          if (el.nextSibling) {
            if (!editor.node.isBlock(el.nextSibling)) {
              $(el).after(FE.MARKERS)
            }
            else {
              editor.selection.setAtStart(el.nextSibling)
            }

            editor.selection.restore()

            return false
          }
        }
      }
    })

    // Do not allow mousedown on HR.
    editor.events.on('mousedown', (e) => {
      if (e.target && e.target.tagName === 'HR') {
        e.preventDefault()
        e.stopPropagation()

        return false
      }
    })

    // If somehow focus gets in HR remove it.
    editor.events.on('mouseup', () => {
      const s_el = editor.selection.element()
      const e_el = editor.selection.endElement()

      if (s_el === e_el && s_el && s_el.tagName === 'HR') {
        if (s_el.nextSibling) {
          if (!editor.node.isBlock(s_el.nextSibling)) {
            $(s_el).after(FE.MARKERS)
          }
          else {
            editor.selection.setAtStart(s_el.nextSibling)
          }
        }

        editor.selection.restore()
      }
    })
  }

  return Object.assign(resp, {
    exec,
    _init
  })
}
