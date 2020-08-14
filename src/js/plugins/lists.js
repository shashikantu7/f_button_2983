import FE from '../index.js'
'use strict';

Object.assign(FE.DEFAULTS, {
  listAdvancedTypes: true
})

FE.PLUGINS.lists = function (editor) {

  const { $ } = editor

  function _openFlag(tag_name) {
    return `<span class="fr-open-${tag_name.toLowerCase()}"></span>`
  }

  function _closeFlag(tag_name) {
    return `<span class="fr-close-${tag_name.toLowerCase()}"></span>`
  }

  /**
   * Replace list type.
   */
  function _replace(blocks, tag_name) {
    const lists = []

    for (let i = 0; i < blocks.length; i++) {
      const { parentNode : parent_node } = blocks[i]

      if (blocks[i].tagName == 'LI' && parent_node.tagName != tag_name && lists.indexOf(parent_node) < 0) {
        lists.push(parent_node)
      }
    }

    for (let i = lists.length - 1; i >= 0; i--) {
      const $l = $(lists[i])
      $l.replaceWith(`<${tag_name.toLowerCase()} ${editor.node.attributes($l.get(0))}>${$l.html()}</${tag_name.toLowerCase()}>`)
    }
  }

  /**
   * Format blocks.
   */
  function _format(blocks, tag_name) {
    _replace(blocks, tag_name)

    // Format those blocks that are not LI.
    const default_tag = editor.html.defaultTag()

    let start_margin = null

    let prop

    if (blocks.length) prop = (editor.opts.direction == 'rtl' || $(blocks[0]).css('direction') == 'rtl') ? 'margin-right' : 'margin-left'

    for (let i = 0; i < blocks.length; i++) {

      // Ignore table tags.
      if (blocks[i].tagName == 'TD' || blocks[i].tagName == 'TH') {
        continue;
      }

      if (blocks[i].tagName != 'LI') {

        // Get margin left and unset it.
        let margin_left = editor.helpers.getPX($(blocks[i]).css(prop)) || 0
        blocks[i].style.marginLeft = null

        // Start indentation relative to the first element.
        if (start_margin === null) start_margin = margin_left

        //https://github.com/froala-labs/froala-editor-js-2/issues/2435
        // Update open tag.
        let open_tag = start_margin > 0 ? `<${tag_name} style="${prop}: ${start_margin}px ">` : `<${tag_name}>`
        let end_tag = `</${tag_name}>`

        // Subsctract starting.
        margin_left = margin_left - start_margin

        // Keep wrapping.
        while (margin_left / editor.opts.indentMargin > 0) {
          open_tag += `</${tag_name}>`
          end_tag += end_tag
          margin_left = margin_left - editor.opts.indentMargin
        }

        // Default tag.
        if (default_tag && blocks[i].tagName.toLowerCase() == default_tag) {
          $(blocks[i]).replaceWith(`${open_tag}<li${editor.node.attributes(blocks[i])}>${$(blocks[i]).html()}</li>${end_tag}`)
        }
        else {
          $(blocks[i]).wrap(`${open_tag}<li></li>${end_tag}`)
        }
      }
    }

    editor.clean.lists()
  }

  /**
   * Unformat.
   */
  function _unformat(blocks) {
    let i
    let j

    // If there are LI that have parents selected, then remove them.
    for (i = blocks.length - 1; i >= 0; i--) {
      for (j = i - 1; j >= 0; j--) {
        if ($(blocks[j]).find(blocks[i]).length || blocks[j] == blocks[i]) {
          blocks.splice(i, 1)
          break
        }
      }
    }

    // Unwrap remaining LI.
    const lists = []

    for (i = 0; i < blocks.length; i++) {
      const $li = $(blocks[i])
      let { parentNode : parent_node } = blocks[i]
      const li_class = $li.attr('class')

      $li.before(_closeFlag(parent_node.tagName))

      // Nested case.
      if (parent_node.parentNode.tagName == 'LI') {
        $li.before(_closeFlag('LI'))
        $li.after(_openFlag('LI'))
      }
      else {
        let li_attrs = ''

        // https://github.com/froala/wysiwyg-editor/issues/1765 .
        if (li_class) {
          li_attrs += ` class="${li_class}"`
        }

        const prop = (editor.opts.direction == 'rtl' || $li.css('direction') == 'rtl') ? 'margin-right' : 'margin-left'

        if (editor.helpers.getPX($(parent_node).css(prop)) && ($(parent_node).attr('style') || '').indexOf(`${prop}:`) >= 0) {
          li_attrs += ` style="${prop}:${editor.helpers.getPX($(parent_node).css(prop))}px;"`
        }

        // When we have a default tag.
        if (editor.html.defaultTag()) {

          // If there are no inner block tags, put everything in a default tag.
          if ($li.find(editor.html.blockTagsQuery()).length === 0) {
            $li.wrapInner(editor.html.defaultTag() + li_attrs)
          }
        }

        // Append BR if the node is not empty.
        if (!editor.node.isEmpty($li.get(0), true) && $li.find(editor.html.blockTagsQuery()).length === 0) {
          $li.append('<br>')
        }
        $li.append(_openFlag('LI'))
        $li.prepend(_closeFlag('LI'))
      }

      $li.after(_openFlag(parent_node.tagName))

      // Nested case. We should look for an upper parent.
      if (parent_node.parentNode.tagName == 'LI') {
        ({ parentNode : parent_node } = parent_node.parentNode );
      }

      if (lists.indexOf(parent_node) < 0) {
        lists.push(parent_node)
      }
    }

    // Replace the open and close tags.
    for (i = 0; i < lists.length; i++) {
      const $l = $(lists[i])
      let html = $l.html()
      html = html.replace(/<span class="fr-close-([a-z]*)"><\/span>/g, '</$1>')
      html = html.replace(/<span class="fr-open-([a-z]*)"><\/span>/g, '<$1>')
      $l.replaceWith(editor.node.openTagString($l.get(0)) + html + editor.node.closeTagString($l.get(0)))
    }

    // Clean empty lists.
    editor.$el.find('li:empty').remove()
    editor.$el.find('ul:empty, ol:empty').remove()

    editor.clean.lists()
    editor.html.wrap()
  }

  /**
   * Check if should unformat lists.
   */
  function _shouldUnformat(blocks, tag_name) {
    let do_unformat = true

    for (let i = 0; i < blocks.length; i++) {

      // Something else than LI is selected.
      if (blocks[i].tagName != 'LI') {
        return false
      }

      // There is a different kind of list selected. Replace is the appropiate action.
      if (blocks[i].parentNode.tagName != tag_name) {
        do_unformat = false
      }
    }

    return do_unformat
  }

  /**
   * Call the list actions.
   */
  function format(tag_name, list_type) {
    let i
    let blocks

    editor.html.syncInputs()
    
    // Wrap.
    editor.selection.save()
    editor.html.wrap(true, true, true, true)
    editor.selection.restore()

    blocks = editor.selection.blocks()

    // Normalize nodes by keeping the LI.
    // <li><h1>foo<h1></li> will return h1.
    for (i = 0; i < blocks.length; i++) {
      if (blocks[i].tagName != 'LI' && blocks[i].parentNode.tagName == 'LI') {
        blocks[i] = blocks[i].parentNode
      }
    }

    // Save selection so that we can play at wish.
    editor.selection.save()

    // Decide if to format or unformat list.
    if (_shouldUnformat(blocks, tag_name)) {
      if (!list_type) {
        _unformat(blocks)
      }
    }
    else {
      _format(blocks, tag_name, list_type)
    }

    // Unwrap.
    editor.html.unwrap()

    // Restore the selection.
    editor.selection.restore()

    list_type = list_type || 'default'

    if (list_type) {
      blocks = editor.selection.blocks()

      for (i = 0; i < blocks.length; i++) {
        if (blocks[i].tagName != 'LI' && blocks[i].parentNode.tagName == 'LI') {
          blocks[i] = blocks[i].parentNode
        }
      }

      for (i = 0; i < blocks.length; i++) {
        // Something else than LI is selected.
        if (blocks[i].tagName != 'LI') {
          continue
        }

        // There is a different kind of list selected. Replace is the appropiate action.
        $(blocks[i].parentNode).css('list-style-type', list_type === 'default' ? '' : list_type)

        if (($(blocks[i].parentNode).attr('style') || '').length === 0) {
          $(blocks[i].parentNode).removeAttr('style')
        }
      }
    }
  }

  /**
   * Refresh list buttons.
   */
  function refresh($btn, tag_name) {
    const $el = $(editor.selection.element())

    if ($el.get(0) != editor.el) {
      let li = $el.get(0)

      if (li.tagName != 'LI' && li.firstElementChild && li.firstElementChild.tagName != 'LI') {
        li = $el.parents('li').get(0)
      }
      else if (li.tagName != 'LI' && !li.firstElementChild) {
        li = $el.parents('li').get(0)
      }
      else if (li.firstElementChild && li.firstElementChild.tagName == 'LI') {
        li = $el.get(0).firstChild
      }
      else {
        li = $el.get(0)
      }

      if (li && li.parentNode.tagName == tag_name && editor.el.contains(li.parentNode)) {
        $btn.addClass('fr-active')
      }
    }
  }

  /**
   * Indent selected list items.
   */
  function _indent(blocks) {
    editor.selection.save()

    for (let i = 0; i < blocks.length; i++) {

      // There should be a previous li.
      const prev_li = blocks[i].previousSibling

      if (prev_li) {
        const nl = $(blocks[i]).find('> ul, > ol').last().get(0)

        // Current LI has a nested list.
        if (nl) {

          // Build a new list item and prepend it to the list.
          const $li = $(document.createElement('li'))
          $(nl).prepend($li)

          // Get first node of the list item.
          let node = editor.node.contents(blocks[i])[0]

          // While node and it is not a list, append to the new list item.
          while (node && !editor.node.isList(node)) {
            const tmp = node.nextSibling
            $li.append(node)
            node = tmp
          }

          // Append current list to the previous node.
          $(prev_li).append($(nl))
          $(blocks[i]).remove()
        }
        else {
          const prev_nl = $(prev_li).find('> ul, > ol').last().get(0)

          if (prev_nl) {
            $(prev_nl).append($(blocks[i]))
          }
          else {
            const $new_nl = $(`<${blocks[i].parentNode.tagName}>`)
            $(prev_li).append($new_nl)
            $new_nl.append($(blocks[i]))
          }
        }
      }
    }

    editor.clean.lists()
    editor.selection.restore()
  }

  /**
   * Outdent selected list items.
   */
  function _outdent(blocks) {
    editor.selection.save()
    _unformat(blocks)
    editor.selection.restore()
  }

  /**
   * Hook into the indent/outdent events.
   */
  function _afterCommand(cmd) {
    if (cmd == 'indent' || cmd == 'outdent') {
      let do_indent = false
      const blocks = editor.selection.blocks()
      const blks = []
      let parentBlk = blocks[0].previousSibling || blocks[0].parentElement

      if (cmd == 'outdent') {
        if (parentBlk.tagName == 'LI' || parentBlk.parentNode.tagName != 'LI') {

          return;
        }
      }
      else {

        if (!blocks[0].previousSibling || blocks[0].previousSibling.tagName != 'LI') {

          return;
        }
      }

      for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].tagName == 'LI') {
          do_indent = true
          blks.push(blocks[i])
        }
        else if (blocks[i].parentNode.tagName == 'LI') {
          do_indent = true
          blks.push(blocks[i].parentNode)
        }
      }

      if (do_indent) {
        if (cmd == 'indent') _indent(blks)
        else _outdent(blks)
      }
    }
  }

  /**
   * Init.
   */
  function _init() {
    editor.events.on('commands.after', _afterCommand)

    // TAB key in lists.
    editor.events.on('keydown', function (e) {
      if (e.which == FE.KEYCODE.TAB) {
        const blocks = editor.selection.blocks()
        const blks = []

        for (let i = 0; i < blocks.length; i++) {
          if (blocks[i].tagName == 'LI') {
            blks.push(blocks[i])
          }
          else if (blocks[i].parentNode.tagName == 'LI') {
            blks.push(blocks[i].parentNode)
          }
        }

        // There is more than one list item selected.
        // Selection is at the beginning of the selected list item.
        if (blks.length > 1 || (blks.length && (editor.selection.info(blks[0]).atStart || editor.node.isEmpty(blks[0])))) {
          e.preventDefault()
          e.stopPropagation()

          if (!e.shiftKey) _indent(blks)
          else _outdent(blks)

          return false
        }
      }
    }, true)
  }

  return {
    _init: _init,
    format: format,
    refresh: refresh
  }
}

// Register the font size command.
FE.DefineIcon('formatOLSimple', { NAME: 'list-ol', SVG_KEY: 'orderedList' })
FE.RegisterCommand('formatOLSimple', {
  title: 'Ordered List',
  type: 'button',
  options: {
    'default': 'Default',
    circle: 'Circle',
    disc: 'Disc',
    square: 'Square'
  },
  refresh: function ($btn) {
    this.lists.refresh($btn, 'OL')
  },
  callback: function (cmd, param) {
    this.lists.format('OL', param)
  },
  plugin: 'lists'
})

// Register the font size command.
FE.RegisterCommand('formatUL', {
  title: 'Unordered List',
  type: 'button',
  hasOptions: function () {
    return this.opts.listAdvancedTypes
  },
  options: {
    'default': 'Default',
    circle: 'Circle',
    disc: 'Disc',
    square: 'Square'
  },
  refresh: function ($btn) {
    this.lists.refresh($btn, 'UL')
  },
  callback: function (cmd, param) {
    this.lists.format('UL', param)
  },
  plugin: 'lists'
})

// Register the font size command.
FE.RegisterCommand('formatOL', {
  title: 'Ordered List',
  hasOptions: function () {
    return this.opts.listAdvancedTypes
  },
  options: {
    'default': 'Default',
    'lower-alpha': 'Lower Alpha',
    'lower-greek': 'Lower Greek',
    'lower-roman': 'Lower Roman',
    'upper-alpha': 'Upper Alpha',
    'upper-roman': 'Upper Roman'
  },
  refresh: function ($btn) {
    this.lists.refresh($btn, 'OL')
  },
  callback: function (cmd, param) {
    this.lists.format('OL', param)
  },
  plugin: 'lists'
})

// Add the list icons.
FE.DefineIcon('formatUL', {
  NAME: 'list-ul',
  SVG_KEY: 'unorderedList'
})

FE.DefineIcon('formatOL', {
  NAME: 'list-ol',
  SVG_KEY: 'orderedList'
})
