import FE from '../index.js'
'use strict';

// Extend defaults.
Object.assign(FE.DEFAULTS, {
  helpSets: [
    {
      title: 'Inline Editor',
      commands: [
        { val: 'OSkeyE', desc: 'Show the editor' }
      ]
    },
    {
      title: 'Common actions',
      commands: [
        { val: 'OSkeyC', desc: 'Copy' },
        { val: 'OSkeyX', desc: 'Cut' },
        { val: 'OSkeyV', desc: 'Paste' },
        { val: 'OSkeyZ', desc: 'Undo' },
        { val: 'OSkeyShift+Z', desc: 'Redo' },
        { val: 'OSkeyK', desc: 'Insert Link' },
        { val: 'OSkeyP', desc: 'Insert Image' }
      ]
    },
    {
      title: 'Basic Formatting',
      commands: [
        { val: 'OSkeyA', desc: 'Select All' },
        { val: 'OSkeyB', desc: 'Bold' },
        { val: 'OSkeyI', desc: 'Italic' },
        { val: 'OSkeyU', desc: 'Underline' },
        { val: 'OSkeyS', desc: 'Strikethrough' },
        { val: 'OSkey]', desc: 'Increase Indent' },
        { val: 'OSkey[', desc: 'Decrease Indent' }
      ]
    },
    {
      title: 'Quote',
      commands: [
        { val: 'OSkey\'', desc: 'Increase quote level' },
        { val: 'OSkeyShift+\'', desc: 'Decrease quote level' }
      ]
    },
    {
      title: 'Image / Video',
      commands: [
        { val: 'OSkey+', desc: 'Resize larger' },
        { val: 'OSkey-', desc: 'Resize smaller' }
      ]
    },
    {
      title: 'Table',
      commands: [
        { val: 'Alt+Space', desc: 'Select table cell' },
        { val: 'Shift+Left/Right arrow', desc: 'Extend selection one cell' },
        { val: 'Shift+Up/Down arrow', desc: 'Extend selection one row' }
      ]
    },
    {
      title: 'Navigation',
      commands: [
        { val: 'OSkey/', desc: 'Shortcuts' },
        { val: 'Alt+F10', desc: 'Focus popup / toolbar' },
        { val: 'Esc', desc: 'Return focus to previous position' }
      ]
    }
  ]
})

FE.PLUGINS.help = function (editor) {
  const { $ } = editor 
  let $modal
  const modal_id = 'help'


  /*
   * Init Help.
   */
  const _init = () => {

  }

  /*
   * Build html body.
   */
  function _buildBody() {

    // Begin body.
    let body = '<div class="fr-help-modal">'

    for (let i = 0; i < editor.opts.helpSets.length; i++) {
      const set = editor.opts.helpSets[i]

      // Set shortcuts table.
      // Begin Table.
      let group = '<table>'

      // Set title.
      group += `<thead><tr><th>${editor.language.translate(set.title)}</th></tr></thead>`
      group += '<tbody>'

      // Build commands table.
      for (let j = 0; j < set.commands.length; j++) {
        const command = set.commands[j]
        group += '<tr>'

        group += `<td>${editor.language.translate(command.desc)}</td>`
        group += `<td>${command.val.replace('OSkey', editor.helpers.isMac() ? '&#8984;' : 'Ctrl+')}</td>`

        group += '</tr>'
      }

      // End table.
      group += '</tbody></table>'

      // Append group to body.
      body += group
    }

    // End body.
    body += '</div>'

    return body
  }

  /*
   * Show help.
   */
  function show() {
    if (!$modal) {
      const head = `<h4>${editor.language.translate('Shortcuts')}</h4>`
      const body = _buildBody()

      const modalHash = editor.modals.create(modal_id, head, body)
      $modal = modalHash.$modal

      // Resize help modal on window resize.
      editor.events.$on($(editor.o_win), 'resize', function () {
        editor.modals.resize(modal_id)
      })
    }

    // Show modal.
    editor.modals.show(modal_id)

    // Modal may not fit window size.
    editor.modals.resize(modal_id)
  }

  /*
   * Hide help.
   */
  const hide = () => {
    editor.modals.hide(modal_id)
  }

  return {
    _init: _init,
    show: show,
    hide: hide
  }
}

FE.DefineIcon('help', { NAME: 'question', SVG_KEY: 'help' })

FE.RegisterShortcut(FE.KEYCODE.SLASH, 'help', null, '/')

FE.RegisterCommand('help', {
  title: 'Help',
  icon: 'help',
  undo: false,
  focus: false,
  modal: true,
  callback: function () {
    this.help.show()
  },
  plugin: 'help',
  showOnMobile: false
})
