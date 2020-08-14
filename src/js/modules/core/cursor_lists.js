import FE from '../../editor.js'

FE.MODULES.cursorLists = function (editor) {
  const $ = editor.$

  /**
   * Find the first li parent.
   */
  function _firstParentLI(node) {
    let p_node = node

    while (p_node.tagName !== 'LI') {
      p_node = p_node.parentNode
    }

    return p_node
  }

  /**
   * Find the first list parent.
   */
  function _firstParentList(node) {
    let p_node = node

    while (!editor.node.isList(p_node)) {
      p_node = p_node.parentNode
    }

    return p_node
  }


  /**
   * Do enter at the beginning of a list item.
   */
  function _startEnter(marker) {
    const li = _firstParentLI(marker)

    // Get previous and next siblings.
    const next_li = li.nextSibling
    const prev_li = li.previousSibling
    const default_tag = editor.html.defaultTag()

    let ul

    // We are in a list item at the middle of the list or an list item that is not empty.
    if (editor.node.isEmpty(li, true) && next_li) {
      let o_str = ''
      let c_str = ''
      let p_node = marker.parentNode

      // Create open / close string.
      while (!editor.node.isList(p_node) && p_node.parentNode && (p_node.parentNode.tagName !== 'LI' || p_node.parentNode === li)) {
        o_str = editor.node.openTagString(p_node) + o_str
        c_str += editor.node.closeTagString(p_node)
        p_node = p_node.parentNode
      }

      o_str = editor.node.openTagString(p_node) + o_str
      c_str += editor.node.closeTagString(p_node)

      let str = ''

      if (p_node.parentNode && p_node.parentNode.tagName === 'LI') {
        str = `${c_str}<li>${FE.MARKERS}<br>${o_str}`
      }
      else if (default_tag) {
        str = `${c_str}<${default_tag}>${FE.MARKERS}<br></${default_tag}>${o_str}`
      }
      else {
        str = `${c_str + FE.MARKERS}<br>${o_str}`
      }

      while (['UL', 'OL'].indexOf(p_node.tagName) < 0 || p_node.parentNode && p_node.parentNode.tagName === 'LI') {
        p_node = p_node.parentNode
      }

      $(li).replaceWith('<span id="fr-break"></span>')
      let html = editor.node.openTagString(p_node) + $(p_node).html() + editor.node.closeTagString(p_node)
      html = html.replace(/<span id="fr-break"><\/span>/g, str)

      $(p_node).replaceWith(html)

      editor.$el.find('li:empty').remove()
    }
    else if (prev_li && next_li || !editor.node.isEmpty(li, true)) {

      let br_str = '<br>'
      let nd = marker.parentNode

      while (nd && nd.tagName !== 'LI') {
        br_str = editor.node.openTagString(nd) + br_str + editor.node.closeTagString(nd)
        nd = nd.parentNode
      }

      $(li).before(`<li>${br_str}</li>`)
      $(marker).remove()
    }

    // There is no previous list item so transform the current list item to an empty line.
    else if (!prev_li) {
      ul = _firstParentList(li)

      // We are in a nested list so add a new li before it.
      if (ul.parentNode && ul.parentNode.tagName === 'LI') {
        if (next_li) {
          $(ul.parentNode).before(`${editor.node.openTagString(li) + FE.MARKERS}<br></li>`)
        }
        else {
          $(ul.parentNode).after(`${editor.node.openTagString(li) + FE.MARKERS}<br></li>`)
        }
      }

      // We are in a normal list. Add a new line before.
      else if (default_tag) {
        $(ul).before(`<${default_tag}>${FE.MARKERS}<br></${default_tag}>`)
      }
      else {
        $(ul).before(`${FE.MARKERS}<br>`)
      }

      // Remove the current li.
      $(li).remove()
    }

    // There is no next_li item so transform the current list item to an empty line.
    else {
      ul = _firstParentList(li)

      let new_str = `${FE.MARKERS}<br>`
      let ndx = marker.parentNode

      while (ndx && ndx.tagName !== 'LI') {
        new_str = editor.node.openTagString(ndx) + new_str + editor.node.closeTagString(ndx)
        ndx = ndx.parentNode
      }

      // We are in a nested lists so add a new li after it.
      if (ul.parentNode && ul.parentNode.tagName === 'LI') {
        $(ul.parentNode).after(`<li>${new_str}</li>`)
      }

      // We are in a normal list. Add a new line after.
      else if (default_tag) {
        $(ul).after(`<${default_tag}>${new_str}</${default_tag}>`)
      }
      else {
        $(ul).after(new_str)
      }

      // Remove the current li.
      $(li).remove()
    }
  }

  /**
   * Enter at the middle of a list.
   */
  function _middleEnter(marker) {
    const li = _firstParentLI(marker)

    // Build the closing / opening list item string.
    let str = ''
    let node = marker
    let o_str = ''
    let c_str = ''
    let add_invisible = false

    while (node !== li) {
      node = node.parentNode

      const cls = node.tagName === 'A' && editor.cursor.isAtEnd(marker, node) ? 'fr-to-remove' : ''

      if (!add_invisible && node != li && !editor.node.isBlock(node)) {
        add_invisible = true
        o_str = o_str + FE.INVISIBLE_SPACE
      }

      o_str = editor.node.openTagString($(node).clone().addClass(cls).get(0)) + o_str
      c_str = editor.node.closeTagString(node) + c_str
    }

    // Add markers.
    str = c_str + str + o_str + FE.MARKERS + (editor.opts.keepFormatOnDelete ? FE.INVISIBLE_SPACE : '')

    // Build HTML.
    $(marker).replaceWith('<span id="fr-break"></span>')
    let html = editor.node.openTagString(li) + $(li).html() + editor.node.closeTagString(li)
    html = html.replace(/<span id="fr-break"><\/span>/g, str)

    // Replace the current list item.
    $(li).replaceWith(html)
  }

  /**
   * Enter at the end of a list item.
   */
  function _endEnter(marker) {
    const li = _firstParentLI(marker)

    let end_str = FE.MARKERS
    let start_str = ''
    let node = marker

    let add_invisible = false

    while (node !== li) {
      node = node.parentNode
      
      // https://github.com/froala-labs/froala-editor-js-2/issues/1864
      // For next sibling list item it was adding unnecessary div tag of elder sibling list.
      if(node.classList.contains('fr-img-space-wrap') || node.classList.contains('fr-img-space-wrap2')){
        continue
      }

      const cls = node.tagName === 'A' && editor.cursor.isAtEnd(marker, node) ? 'fr-to-remove' : ''

      if (!add_invisible && node !== li && !editor.node.isBlock(node)) {
        add_invisible = true
        start_str += FE.INVISIBLE_SPACE
      }

      start_str = editor.node.openTagString($(node).clone().addClass(cls).get(0)) + start_str
      end_str += editor.node.closeTagString(node)
    }

    const str = start_str + end_str

    $(marker).remove()
    $(li).after(str)
  }

  /**
   * Do backspace on a list item. This method is called only when wer are at the beginning of a LI.
   */
  function _backspace(marker) {
    const li = _firstParentLI(marker)

    // Get previous sibling.
    let prev_li = li.previousSibling

    // There is a previous li.
    if (prev_li) {

      // Get the li inside a nested list or inner block tags.
      prev_li = $(prev_li).find(editor.html.blockTagsQuery()).get(-1) || prev_li

      // Add markers.
      $(marker).replaceWith(FE.MARKERS)

      // Remove possible BR at the end of the previous list.
      let contents = editor.node.contents(prev_li)

      if (contents.length && contents[contents.length - 1].tagName === 'BR') {
        $(contents[contents.length - 1]).remove()
      }

      // Remove any nodes that might be wrapped.
      $(li).find(editor.html.blockTagsQuery()).not('ol, ul, table').each(function () {
        if (this.parentNode === li) {
          $(this).replaceWith($(this).html() + (editor.node.isEmpty(this) ? '' : '<br>'))
        }
      })

      // Append the current list item content to the previous one.
      let node = editor.node.contents(li)[0]
      let tmp

      while (node && !editor.node.isList(node)) {
        tmp = node.nextSibling
        $(prev_li).append(node)
        node = tmp
      }

      prev_li = li.previousSibling

      while (node) {
        tmp = node.nextSibling
        $(prev_li).append(node)
        node = tmp
      }

      // Remove ending BR.
      contents = editor.node.contents(prev_li)
      if (contents.length > 1 && contents[contents.length - 1].tagName === 'BR') {
        $(contents[contents.length - 1]).remove()
      }

      // Remove the current LI.
      $(li).remove()
    }

    // No previous li.
    else {
      const ul = _firstParentList(li)

      // Add markers.
      $(marker).replaceWith(FE.MARKERS)

      // Nested lists.
      if (ul.parentNode && ul.parentNode.tagName === 'LI') {
        const prev_node = ul.previousSibling

        // Previous node is block.
        if (editor.node.isBlock(prev_node)) {

          // Remove any nodes that might be wrapped.
          $(li).find(editor.html.blockTagsQuery()).not('ol, ul, table').each(function () {
            if (this.parentNode === li) {
              $(this).replaceWith($(this).html() + (editor.node.isEmpty(this) ? '' : '<br>'))
            }
          })

          $(prev_node).append($(li).html())
        }

        // Text right in li.
        else {
          $(ul).before($(li).html())
        }
      }

      // Normal lists. Add an empty li instead.
      else {
        const default_tag = editor.html.defaultTag()

        if (default_tag && $(li).find(editor.html.blockTagsQuery()).length === 0) {
          $(ul).before(`<${default_tag}>${$(li).html()}</${default_tag}>`)
        }
        else {
          $(ul).before($(li).html())
        }
      }

      // Remove the current li.
      $(li).remove()
      editor.html.wrap()

      // Remove the ul if it is empty.
      if ($(ul).find('li').length === 0) {
        $(ul).remove()
      }
    }
  }

  /**
   * Delete at the end of list item.
   */
  function _del(marker) {
    const li = _firstParentLI(marker)
    const next_li = li.nextSibling
    let contents

    // There is a next li.
    if (next_li) {

      // Remove possible BR at the beginning of the next LI.
      contents = editor.node.contents(next_li)

      if (contents.length && contents[0].tagName === 'BR') {
        $(contents[0]).remove()
      }

      // Unwrap content from the next node.
      $(next_li).find(editor.html.blockTagsQuery()).not('ol, ul, table').each(function () {
        if (this.parentNode === next_li) {
          $(this).replaceWith($(this).html() + (editor.node.isEmpty(this) ? '' : '<br>'))
        }
      })

      // Append the next LI to the current LI.
      let last_node = marker
      let node = editor.node.contents(next_li)[0]
      let tmp

      while (node && !editor.node.isList(node)) {
        tmp = node.nextSibling
        $(last_node).after(node)
        last_node = node
        node = tmp
      }

      // Append nested lists.
      while (node) {
        tmp = node.nextSibling
        $(li).append(node)
        node = tmp
      }

      // Replace marker with markers.
      $(marker).replaceWith(FE.MARKERS)

      // Remove next li.
      $(next_li).remove()
    }

    // No next li.
    else {

      // Search the next sibling in parents.
      let next_node = li

      while (!next_node.nextSibling && next_node !== editor.el) {
        next_node = next_node.parentNode
      }

      // We're right at the end.
      if (next_node === editor.el) {
        return false
      }

      // Get the next sibling.
      next_node = next_node.nextSibling

      // Next sibling is a block tag.
      if (editor.node.isBlock(next_node)) {

        // Check if we can do delete in it.
        if (FE.NO_DELETE_TAGS.indexOf(next_node.tagName) < 0) {

          // Add markers.
          $(marker).replaceWith(FE.MARKERS)

          // Remove any possible BR at the end of the LI.
          contents = editor.node.contents(li)

          if (contents.length && contents[contents.length - 1].tagName === 'BR') {
            $(contents[contents.length - 1]).remove()
          }

          // Append next node.
          $(li).append($(next_node).html())

          // Remove the next node.
          $(next_node).remove()
        }
      }

      // Append everything till the next block tag or BR.
      else {

        // Remove any possible BR at the end of the LI.
        contents = editor.node.contents(li)

        if (contents.length && contents[contents.length - 1].tagName === 'BR') {
          $(contents[contents.length - 1]).remove()
        }

        // var next_node = next_li;
        $(marker).replaceWith(FE.MARKERS)

        while (next_node && !editor.node.isBlock(next_node) && next_node.tagName !== 'BR') {
          $(li).append($(next_node))
          next_node = next_node.nextSibling
        }
      }
    }
  }

  return {
    _startEnter,
    _middleEnter,
    _endEnter,
    _backspace,
    _del
  }
}

