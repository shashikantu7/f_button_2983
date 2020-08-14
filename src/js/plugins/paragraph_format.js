import FE from '../index.js'

Object.assign(FE.DEFAULTS, {
  paragraphFormat: {
    N: 'Normal',
    H1: 'Heading 1',
    H2: 'Heading 2',
    H3: 'Heading 3',
    H4: 'Heading 4',
    PRE: 'Code'
  },
  paragraphFormatSelection: false,
  paragraphDefaultSelection: 'Paragraph Format'
})

FE.PLUGINS.paragraphFormat = function (editor) {
  const $ = editor.$

  /**
   * Style content inside LI when LI is selected.
   * This case happens only when the LI contains a nested list or when it has no block tag inside.
   */
  function _styleLiWithoutBlocks($li, val) {
    const defaultTag = editor.html.defaultTag()

    // If val is null or default tag already do nothing.
    if (val && val.toLowerCase() != defaultTag) {

      // Deal with nested lists.
      if ($li.find('ul, ol').length > 0) {
        const $el = $('<' + val + '>')
        $li.prepend($el)
        let node = editor.node.contents($li.get(0))[0]

        while (node && ['UL', 'OL'].indexOf(node.tagName) < 0) {
          const next_node = node.nextSibling
          $el.append(node)
          node = next_node
        }
      }

      // Wrap list content.
      else {
        $li.html('<' + val + '>' + $li.html() + '</' + val + '>')
      }
    }
  }

  /**
   * Style content inside LI.
   */
  function _styleLiWithBlocks($blk, val) {
    const defaultTag = editor.html.defaultTag()

    // Prepare a temp div.
    if (!val || val.toLowerCase() == defaultTag) val = 'div class="fr-temp-div"'

    $blk.replaceWith($('<' + val + '>').html($blk.html()))
  }

  /**
   * Style content inside TD.
   */
  function _styleTdWithBlocks($blk, val) {
    const defaultTag = editor.html.defaultTag()

    // Prepare a temp div.
    if (!val) val = 'div class="fr-temp-div"' + (editor.node.isEmpty($blk.get(0), true) ? ' data-empty="true"' : '')

    // Return to the regular case. We don't use P inside TD/TH.
    if (val.toLowerCase() == defaultTag) {

      // If node is not empty, then add a BR.
      if (!editor.node.isEmpty($blk.get(0), true)) {
        $blk.append('<br/>')
      }

      $blk.replaceWith($blk.html())
    }

    // Replace with the new tag.
    else {
      $blk.replaceWith($('<' + val + '>').html($blk.html()))
    }
  }

  /**
   * Basic style.
   */
  function _style($blk, val) {
    if (!val) val = 'div class="fr-temp-div"' + (editor.node.isEmpty($blk.get(0), true) ? ' data-empty="true"' : '')
    //1708 Paragraph Format
    if(val=="H1"||val=="H2"||val=="H3"||val=="H4"||val=="H5")
    {
       let $checkstyle=editor.node.attributes($blk.get(0));  
       if($checkstyle.includes("font-size:"))
      $blk.replaceWith($('<' + val + ' ' + editor.node.attributes($blk.get(0)).replace(/font-size:[0-9]+px;?/,"") + '>').html($blk.html()).removeAttr('data-empty'))
       else
       $blk.replaceWith($('<' + val + ' ' + editor.node.attributes($blk.get(0)) + '>').html($blk.html()).removeAttr('data-empty'))
    }
   else
    $blk.replaceWith($('<' + val + ' ' + editor.node.attributes($blk.get(0)) + '>').html($blk.html()).removeAttr('data-empty'))
  }

  /**
   * Apply style.
   */
  function apply(val) {

    // Normal.
    if (val == 'N') val = editor.html.defaultTag()

    // Wrap.
    editor.selection.save()
    editor.html.wrap(true, true, !editor.opts.paragraphFormat.BLOCKQUOTE, true, true)
    editor.selection.restore()

    // Get blocks.
    const blocks = editor.selection.blocks()

    // Save selection to restore it later.
    editor.selection.save()

    editor.$el.find('pre').attr('skip', true)

    // Go through each block and apply style to it.
    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i].tagName != val && !editor.node.isList(blocks[i])) {
        const $blk = $(blocks[i])

        // Style the content inside LI when there is selection right in LI.
        if (blocks[i].tagName == 'LI') {
          _styleLiWithoutBlocks($blk, val)
        }

        // Style the content inside LI when we have other tag in LI.
        else if (blocks[i].parentNode.tagName == 'LI' && blocks[i]) {
          _styleLiWithBlocks($blk, val)
        }

        // Style the content inside TD/TH.
        else if (['TD', 'TH'].indexOf(blocks[i].parentNode.tagName) >= 0) {
          _styleTdWithBlocks($blk, val)
        }

        // Regular case.
        else {
          _style($blk, val)
        }
      }
    }

    // Join PRE together.
    editor.$el.find('pre:not([skip="true"]) + pre:not([skip="true"])').each(function () {
      $(this).prev().append('<br>' + $(this).html())
      $(this).remove()
    })
    editor.$el.find('pre').removeAttr('skip')

    // Unwrap temp divs.
    editor.html.unwrap()

    // Restore selection.
    editor.selection.restore()
  }

  function refreshOnShow($btn, $dropdown) {
    const blocks = editor.selection.blocks()

    if (blocks.length) {
      const blk = blocks[0]
      let tag = 'N'
      const default_tag = editor.html.defaultTag()

      if (blk.tagName.toLowerCase() != default_tag && blk != editor.el) {
        tag = blk.tagName
      }

      $dropdown.find('.fr-command[data-param1="' + tag + '"]').addClass('fr-active').attr('aria-selected', true)
    }
    else {
      $dropdown.find('.fr-command[data-param1="N"]').addClass('fr-active').attr('aria-selected', true)
    }
  }

  function refresh($btn) {
    if (editor.opts.paragraphFormatSelection) {
      const blocks = editor.selection.blocks()

      if (blocks.length) {
        const blk = blocks[0]
        let tag = 'N'
        const default_tag = editor.html.defaultTag()

        if (blk.tagName.toLowerCase() != default_tag && blk != editor.el) {
          tag = blk.tagName
        }

        if (['LI', 'TD', 'TH'].indexOf(tag) >= 0) {
          tag = 'N'
        }

        $btn.find('>span').text(editor.language.translate(editor.opts.paragraphFormat[tag]))
      }
      else {
        $btn.find('>span').text(editor.language.translate(editor.opts.paragraphFormat.N))
      }
    }
  }

  return {
    apply: apply,
    refreshOnShow: refreshOnShow,
    refresh: refresh
  }
}

// Register the font size command.
FE.RegisterCommand('paragraphFormat', {
  type: 'dropdown',
  displaySelection: function (editor) {
    return editor.opts.paragraphFormatSelection
  },
  defaultSelection: function (editor) {
    return editor.language.translate(editor.opts.paragraphDefaultSelection)
  },
  displaySelectionWidth: 80,
  html: function () {
    let c = '<ul class="fr-dropdown-list" role="presentation">'
    const options = this.opts.paragraphFormat

    for (const val in options) {
      if (options.hasOwnProperty(val)) {
        let shortcut = this.shortcuts.get('paragraphFormat.' + val)

        if (shortcut) {
          shortcut = '<span class="fr-shortcut">' + shortcut + '</span>'
        }
        else {
          shortcut = ''
        }

        c += '<li role="presentation"><' + (val == 'N' ? this.html.defaultTag() || 'DIV' : val) + ' style="padding: 0 !important; margin: 0 !important;" role="presentation"><a class="fr-command" tabIndex="-1" role="option" data-cmd="paragraphFormat" data-param1="' + val + '" title="' + this.language.translate(options[val]) + '">' + this.language.translate(options[val]) + '</a></' + (val == 'N' ? this.html.defaultTag() || 'DIV' : val) + '></li>'
      }
    }
    c += '</ul>'

    return c
  },
  title: 'Paragraph Format',
  callback: function (cmd, val) {
    this.paragraphFormat.apply(val)
  },
  refresh: function ($btn) {
    this.paragraphFormat.refresh($btn)
  },
  refreshOnShow: function ($btn, $dropdown) {
    this.paragraphFormat.refreshOnShow($btn, $dropdown)
  },
  plugin: 'paragraphFormat'
})

// Add the font size icon.
FE.DefineIcon('paragraphFormat', {
  NAME: 'paragraph',
  SVG_KEY: 'paragraphFormat'
})
