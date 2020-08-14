import FE from '../../editor.js'

FE.MODULES.format = function (editor) {
  const $ = editor.$

  /**
   * Create open tag string.
   */
  function _openTag(tag, attrs) {
    let str = `<${tag}`

    for (const key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) {
        str += ` ${key}="${attrs[key]}"`
      }
    }

    str += '>'

    return str
  }

  /**
   * Create close tag string.
   */
  function _closeTag(tag) {
    return `</${tag}>`
  }

  /**
   * Create query for the current format.
   */
  function _query(tag, attrs) {
    let selector = tag

    for (const key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) {
        if (key === 'id') {
          selector += `#${attrs[key]}`
        }
        else if (key === 'class') {
          selector += `.${attrs[key]}`
        }
        else {
          selector += `[${key}="${attrs[key]}"]`
        }
      }
    }

    return selector
  }

  /**
   * Test matching element.
   */
  function _matches(el, selector) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) {
      return false
    }

    return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector)
  }

  /**
   * Apply format to the current node till we find a marker.
   */
  function _processNodeFormat(start_node, tag, attrs) {

    // No start node.
    if (!start_node) {
      return
    }

    // Skip comments.
    while (start_node.nodeType === Node.COMMENT_NODE) {
      start_node = start_node.nextSibling
    }

    // No start node.
    if (!start_node) {
      return
    }

    // If we are in a block process starting with the first child.
    if (editor.node.isBlock(start_node) && start_node.tagName !== 'HR') {
      if (editor.node.hasClass(start_node.firstChild, 'fr-marker')) {
        _processNodeFormat(start_node.firstChild.nextSibling, tag, attrs)
      }
      else {
        _processNodeFormat(start_node.firstChild, tag, attrs)
      }

      return false
    }

    // Create new element.
    let $span = $(editor.doc.createElement(tag))
    $span.attr(attrs)

    $span.insertBefore(start_node)

    // Start with the next sibling of the current node.
    let node = start_node

    // Search while there is a next node.
    // Next node is not marker.
    // Next node does not contain marker.
    // Next node is not an inner list.
    while (node && !$(node).is('.fr-marker') && $(node).find('.fr-marker').length === 0 && node.tagName !== 'UL' && node.tagName !== 'OL') {
      const tmp = node

      if (editor.node.isBlock(node) && start_node.tagName !== 'HR') {
        _processNodeFormat(node.firstChild, tag, attrs)
        return false
      }

      node = node.nextSibling
      $span.append(tmp)
    }

    // If there is no node left at the right look at parent siblings.
    if (!node) {
      let p_node = $span.get(0).parentNode

      while (p_node && !p_node.nextSibling && !editor.node.isElement(p_node)) {
        p_node = p_node.parentNode
      }

      if (p_node) {
        let sibling = p_node.nextSibling

        if (sibling) {

          // Parent sibling is block then look next.
          if (!editor.node.isBlock(sibling)) {
            _processNodeFormat(sibling, tag, attrs)
          }
          else if (sibling.tagName === 'HR') {
            _processNodeFormat(sibling.nextSibling, tag, attrs)
          }
          else {
            _processNodeFormat(sibling.firstChild, tag, attrs)
          }
        }
      }
    }

    // Start processing child nodes if there is a marker or an inner list.
    else if ($(node).find('.fr-marker').length || node.tagName === 'UL' || node.tagName === 'OL') {
      _processNodeFormat(node.firstChild, tag, attrs)
    }

    // https://github.com/froala/wysiwyg-editor/issues/3390
    // https://github.com/froala-labs/froala-editor-js-2/issues/1770
    else if (editor.browser.mozilla && editor.node.hasClass(node, 'fr-marker')) {
      const selections = editor.selection.blocks()
      const length = selections.length
      let i

      for (i = 0; i < length; i++) {
        if (selections[i] != node.parentNode && selections[i].childNodes.length && selections[i].childNodes[0] != node.parentNode) {
          node = selections[i].childNodes[1] || selections[i].childNodes[0]
          $span = $(_openTag(tag, attrs)).insertBefore(node)
          $span.append(node)
        }
      }
    }

    if ($span.is(':empty')) {
      $span.remove()
    }
  }

  /**
   * Apply tag format.
   */
  function apply(tag, attrs) {
    let i

    if (typeof attrs === 'undefined') {
      attrs = {}
    }

    if (attrs.style) {
      delete attrs.style
    }

    // Selection is collapsed.
    if (editor.selection.isCollapsed()) {
      editor.markers.insert()
      const $marker = editor.$el.find('.fr-marker')
      $marker.replaceWith(_openTag(tag, attrs) + FE.INVISIBLE_SPACE + FE.MARKERS + _closeTag(tag))
      editor.selection.restore()
    }

    // Selection is not collapsed.
    else {
      editor.selection.save()

      // Check if selection can be deleted.
      const start_marker = editor.$el.find('.fr-marker[data-type="true"]').length && editor.$el.find('.fr-marker[data-type="true"]').get(0).nextSibling

      _processNodeFormat(start_marker, tag, attrs)

      // Clean inner spans.
      let inner_spans

      do {
        inner_spans = editor.$el.find(`${_query(tag, attrs)} > ${_query(tag, attrs)}`)

        for (i = 0; i < inner_spans.length; i++) {
          inner_spans[i].outerHTML = inner_spans[i].innerHTML
        }
      } while (inner_spans.length)

      editor.el.normalize()

      // Have markers inside the new tag.
      const markers = editor.el.querySelectorAll('.fr-marker')

      for (i = 0; i < markers.length; i++) {
        const $mk = $(markers[i])

        if ($mk.data('type') === true) {
          if (_matches($mk.get(0).nextSibling, _query(tag, attrs))) {
            $mk.next().prepend($mk)
          }
        }
        else if (_matches($mk.get(0).previousSibling, _query(tag, attrs))) {
          $mk.prev().append($mk)
        }
      }

      editor.selection.restore()
    }
  }

  /**
   * Split at current node the parents with tag.
   */
  function _split($node, tag, attrs, collapsed) {
    if (!collapsed) {
      let changed = false

      if ($node.data('type') === true) {
        while (editor.node.isFirstSibling($node.get(0)) && !$node.parent().is(editor.$el) && !$node.parent().is('ol') && !$node.parent().is('ul')) {
          $node.parent().before($node)
          changed = true
        }
      }
      else if ($node.data('type') === false) {
        while (editor.node.isLastSibling($node.get(0)) && !$node.parent().is(editor.$el) && !$node.parent().is('ol') && !$node.parent().is('ul')) {
          $node.parent().after($node)
          changed = true
        }
      }

      if (changed) {
        return true
      }
    }

    // Check if current node has parents which match our tag.
    if ($node.parents(tag).length || typeof tag === 'undefined') {

      let close_str = ''
      let open_str = ''
      let $p_node = $node.parent()
      let p_html

      // Do not split when parent is block.
      if ($p_node.is(editor.$el) || editor.node.isBlock($p_node.get(0))) {
        return false
      }

      // Check undefined so that we.
      while (!editor.node.isBlock($p_node.parent().get(0)) && (typeof tag === 'undefined' || !_matches($p_node.get(0), _query(tag, attrs)))) {
        close_str += editor.node.closeTagString($p_node.get(0))
        open_str = editor.node.openTagString($p_node.get(0)) + open_str
        $p_node = $p_node.parent()
      }

      // Node STR.
      const node_str = $node.get(0).outerHTML

      // Replace node with marker.
      $node.replaceWith('<span id="mark"></span>')

      // Rebuild the HTML for the node.
      p_html = $p_node.html().replace(/<span id="mark"><\/span>/, close_str + editor.node.closeTagString($p_node.get(0)) + open_str + node_str + close_str + editor.node.openTagString($p_node.get(0)) + open_str);
      $p_node.replaceWith(editor.node.openTagString($p_node.get(0)) + p_html + editor.node.closeTagString($p_node.get(0)));

      return true
    }

    return false
  }

  /**
   * Process node remove.
   */
  function _processNodeRemove($node, should_remove, tag, attrs) {

    // Get contents.
    const contents = editor.node.contents($node.get(0))

    // Loop contents.
    for (let i = 0; i < contents.length; i++) {
      const node = contents[i]

      // https://github.com/froala-labs/froala-editor-js-2/issues/1954
      if(node.innerHTML && node.innerHTML.charCodeAt() == 8203 && node.tagName.toLocaleLowerCase()==tag) {
        node.outerHTML = node.innerHTML;
      }

      // We found a marker => change should_remove flag.
      if (editor.node.hasClass(node, 'fr-marker')) {
        should_remove = (should_remove + 1) % 2
      }

      // We should remove.
      else if (should_remove) {

        // Check if we have a marker inside it.
        if ($(node).find('.fr-marker').length > 0) {
          should_remove = _processNodeRemove($(node), should_remove, tag, attrs)
        }

        // Remove everything starting with the most inner nodes which match the current selector.
        else {

          const nodes = $(node).find(tag || '*:not(br)');

          for (let j = nodes.length - 1; j >= 0; j--) {
            const nd = nodes[j]

            if (!editor.node.isBlock(nd) && !editor.node.isVoid(nd) && (typeof tag === 'undefined' || _matches(nd, _query(tag, attrs)))) {
              if (!editor.node.hasClass(nd, 'fr-clone')) {
                nd.outerHTML = nd.innerHTML
              }
            }
            else if (editor.node.isBlock(nd) && typeof tag === 'undefined' && node.tagName !== 'TABLE') {
              editor.node.clearAttributes(nd)
            }
          }

          // Check inner nodes.
          if (typeof tag === 'undefined' && node.nodeType === Node.ELEMENT_NODE && !editor.node.isVoid(node) || _matches(node, _query(tag, attrs))) {
            if (!editor.node.isBlock(node)) {
              if (!editor.node.hasClass(node, 'fr-clone')) {
                node.outerHTML = node.innerHTML;
              }
            }
          }

          // Remove formatting from block nodes.
          else if (typeof tag === 'undefined' && node.nodeType === Node.ELEMENT_NODE && editor.node.isBlock(node) && node.tagName !== 'TABLE') {
            editor.node.clearAttributes(node)
          }
        }
      }
      else {

        // There is a marker.
        if ($(node).find('.fr-marker').length > 0) {
          should_remove = _processNodeRemove($(node), should_remove, tag, attrs)
        }
      }
    }

    return should_remove
  }

  /**
   * Remove tag.
   */
  function remove(tag, attrs) {
    if (typeof attrs === 'undefined') {
      attrs = {}
    }

    if (attrs.style) {
      delete attrs.style
    }

    const collapsed = editor.selection.isCollapsed()
    editor.selection.save()

    // Split at start and end marker.
    let reassess = true

    while (reassess) {
      reassess = false
      const markers = editor.$el.find('.fr-marker')

      for (let i = 0; i < markers.length; i++) {
        const $marker = $(markers[i])
        let $clone = null

        if (!$marker.attr('data-cloned') && !collapsed) {
          $clone = $marker.clone().removeClass('fr-marker').addClass('fr-clone')

          if ($marker.data('type') && $marker.data('type').toString() === 'true') {
            $marker.attr('data-cloned', true).after($clone)
          }
          else {
            $marker.attr('data-cloned', true).before($clone)
          }
        }

        if (_split($marker, tag, attrs, collapsed)) {
          reassess = true
          break
        }
      }
    }

    // Remove format between markers.
    _processNodeRemove(editor.$el, 0, tag, attrs)

    // Replace markers with their clones.
    if (!collapsed) {
      editor.$el.find('.fr-marker').remove()
      editor.$el.find('.fr-clone').removeClass('fr-clone').addClass('fr-marker')
    }

    // Selection is collapsed => add invisible spaces.
    if (collapsed) {
      editor.$el.find('.fr-marker').before(FE.INVISIBLE_SPACE).after(FE.INVISIBLE_SPACE)
    }

    editor.html.cleanEmptyTags()
    editor.el.normalize()
    editor.selection.restore()

    // https://github.com/froala-labs/froala-editor-js-2/issues/2168
    const anchorNode = editor.win.getSelection() && editor.win.getSelection().anchorNode

    if (anchorNode) {
      const blockParent = editor.node.blockParent(anchorNode)
      const multiSelection = anchorNode.textContent.replace(/\u200B/g, '').length ? true : false
      const { startOffset, endOffset} = editor.win.getSelection().getRangeAt(0)

      // Keep only one zero width space and remove all the other zero width spaces if selection consists of only zerowidth spaces.
      if (!editor.selection.text().replace(/\u200B/g, '').length) {
        removeZeroWidth(blockParent, anchorNode)
      }

      const range = editor.win.getSelection().getRangeAt(0)

      // Setting the range to the zerowidthspace index
      if (anchorNode.nodeType === Node.TEXT_NODE) {
        if (!multiSelection || (!editor.selection.text().length && startOffset === endOffset)) {
          const newOffset = anchorNode.textContent.search(/\u200B/g) + 1

          // Fix for IE browser
          if (editor.browser.msie) {
            const tmprange = editor.doc.createRange()
            editor.selection.get().removeAllRanges()
            tmprange.setStart(anchorNode, newOffset)
            tmprange.setEnd(anchorNode, newOffset)
            editor.selection.get().addRange(tmprange)
          } else {
            range.setStart(anchorNode, newOffset)
            range.setEnd(anchorNode, newOffset)
          }
        }
      } else {
        const txtNodeToFocus = $(anchorNode).contents().filter(function (tmpNode) {
          return (tmpNode.nodeType === Node.TEXT_NODE && tmpNode.textContent.search(/\u200B/g) >= 0)
        })
        if (txtNodeToFocus) {
          const newOffset = txtNodeToFocus.text().search(/\u200B/g) + 1
          range.setStart(txtNodeToFocus.get(0), newOffset)
          range.setEnd(txtNodeToFocus.get(0), newOffset)
        }
      }
    }
  }

  // Removes zerowidth spaces and keeps only one zero width space for the marker.
  function removeZeroWidth(blockParent, compareNode) {
    if (blockParent && compareNode) {
      if (blockParent.isSameNode(compareNode)) {
        
        // keeping only one zerowidth space if there are multiple
        blockParent.textContent = blockParent.textContent.replace(/\u200B(?=.*\u200B)/g, '')
      } else {
        if (blockParent.nodeType === Node.TEXT_NODE)
          blockParent.textContent = blockParent.textContent.replace(/\u200B/g, '')
      }
      if (!blockParent.childNodes.length) {
        return false
      } else if (Array.isArray(blockParent.childNodes)) {
        blockParent.childNodes.forEach(function (node) {
          removeZeroWidth(node, compareNode)
        })
      }
    }
  }

  /**
   * Toggle format.
   */
  function toggle(tag, attrs) {
    if (is(tag, attrs)) {
      remove(tag, attrs)
    }
    else {
      apply(tag, attrs)
    }
  }

  /**
   * Clean format.
   */
  function _cleanFormat(elem, prop) {
    const $elem = $(elem)
    $elem.css(prop, '')

    if ($elem.attr('style') === '') {
      $elem.replaceWith($elem.html())
    }
  }

  /**
   * Filter spans with specific property.
   */
  function _filterSpans(elem, prop) {
    return $(elem).attr('style').indexOf(`${prop}:`) === 0 || $(elem).attr('style').indexOf(`;${prop}:`) >= 0 || $(elem).attr('style').indexOf(`; ${prop}:`) >= 0
  }

  /**
   * Apply inline style.
   */
  function applyStyle(prop, val) {

    let i
    let $marker
    let $span = null

    // Selection is collapsed.
    if (editor.selection.isCollapsed()) {
      editor.markers.insert()
      $marker = editor.$el.find('.fr-marker')
      const $parent = $marker.parent()

      // https://github.com/froala/wysiwyg-editor/issues/1084
      if (editor.node.openTagString($parent.get(0)) === `<span style="${prop}: ${$parent.css(prop)};">`) {
        if (editor.node.isEmpty($parent.get(0))) {
          $span = $(editor.doc.createElement('span')).attr('style', `${prop}: ${val};`).html(`${FE.INVISIBLE_SPACE}${FE.MARKERS}`)
          $parent.replaceWith($span)
        }

        // We should get out of the current span with the same props.
        else {
          const x = {}
          x['style*'] = `${prop}:`
          _split($marker, 'span', x, true)
          $marker = editor.$el.find('.fr-marker')

          if (val) {
            $span = $(editor.doc.createElement('span')).attr('style', `${prop}: ${val};`).html(`${FE.INVISIBLE_SPACE}${FE.MARKERS}`)
            $marker.replaceWith($span)
          }
          else {
            $marker.replaceWith(FE.INVISIBLE_SPACE + FE.MARKERS)
          }
        }

        editor.html.cleanEmptyTags()
      }
      else if (editor.node.isEmpty($parent.get(0)) && $parent.is('span')) {
        $marker.replaceWith(FE.MARKERS)
        $parent.css(prop, val)
      }
      else {
        $span = $(`<span style="${prop}: ${val};">${FE.INVISIBLE_SPACE}${FE.MARKERS}</span>`)
        $marker.replaceWith($span)
      }

      // If we have a span, then split the parent nodes.
      if ($span) {
        _splitParents($span, prop, val)
      }
    }
    else {
      editor.selection.save()

      // When removing selection we should make sure we have selection outside of the first/last parent node.
      // We also need to do this for U tags.
      if (val === null || prop === 'color' && editor.$el.find('.fr-marker').parents('u, a').length > 0) {
        const markers = editor.$el.find('.fr-marker')

        for (i = 0; i < markers.length; i++) {
          $marker = $(markers[i])

          if ($marker.data('type') === true || $marker.data('type') === 'true') {
            while (editor.node.isFirstSibling($marker.get(0)) && !$marker.parent().is(editor.$el) && !editor.node.isElement($marker.parent().get(0)) && !editor.node.isBlock($marker.parent().get(0))) {
              $marker.parent().before($marker)
            }
          }
          else {
            while (editor.node.isLastSibling($marker.get(0)) && !$marker.parent().is(editor.$el) && !editor.node.isElement($marker.parent().get(0)) && !editor.node.isBlock($marker.parent().get(0))) {
              $marker.parent().after($marker)
            }
          }
        }
      }

      // Check if selection can be deleted.
      let start_marker = editor.$el.find('.fr-marker[data-type="true"]').get(0).nextSibling

      while (start_marker.firstChild) {	
        start_marker = start_marker.firstChild	
      }

      const attrs = {
        class: 'fr-unprocessed'
      }

      if (val) {
        attrs.style = `${prop}: ${val};`
      }
      _processNodeFormat(start_marker, 'span', attrs)

      editor.$el.find('.fr-marker + .fr-unprocessed').each(function () {
        $(this).prepend($(this).prev())
      })

      editor.$el.find('.fr-unprocessed + .fr-marker').each(function () {
        $(this).prev().append($(this))
      })

      // When em are being used keep them as the most inner props.
      if ((val || '').match(/\dem$/)) {
        editor.$el.find('span.fr-unprocessed').removeClass('fr-unprocessed')
      }

      while (editor.$el.find('span.fr-unprocessed').length > 0) {
        $span = editor.$el.find('span.fr-unprocessed').first().removeClass('fr-unprocessed')

        // Look at parent node to see if we can merge with it.
        $span.parent().get(0).normalize()

        if ($span.parent().is('span') && $span.parent().get(0).childNodes.length === 1) {
          $span.parent().css(prop, val)
          const $child = $span
          $span = $span.parent()
          $child.replaceWith($child.html())
        }

        // Replace in reverse order to take care of the inner spans first.
        const inner_spans = $span.find('span')

        for (i = inner_spans.length - 1; i >= 0; i--) {
          _cleanFormat(inner_spans[i], prop)
        }

        // Split parent nodes.
        _splitParents($span, prop, val)
      }
    }

    _normalize()
  }

  function _splitParents($span, prop, val) {
    let i

    // Look at parents with the same property.
    let $outer_span = $span.parentsUntil(editor.$el, 'span[style]')
    const to_remove = []

    for (i = $outer_span.length - 1; i >= 0; i--) {
      if (!_filterSpans($outer_span[i], prop)) {
        to_remove.push($outer_span[i])
      }
    }

    $outer_span = $outer_span.not(to_remove)

    if ($outer_span.length) {
      let c_str = ''
      let o_str = ''
      let ic_str = ''
      let io_str = ''
      let c_node = $span.get(0)

      do {
        c_node = c_node.parentNode

        $(c_node).addClass('fr-split')

        c_str += editor.node.closeTagString(c_node)
        o_str = editor.node.openTagString($(c_node).clone().addClass('fr-split').get(0)) + o_str

        // Inner close and open.
        if ($outer_span.get(0) !== c_node) {
          ic_str += editor.node.closeTagString(c_node)
          io_str = editor.node.openTagString($(c_node).clone().addClass('fr-split').get(0)) + io_str
        }
      } while ($outer_span.get(0) !== c_node)

      // Build breaking string.
      const str = `${c_str + editor.node.openTagString($($outer_span.get(0)).clone().css(prop, val || '').get(0)) + io_str + $span.css(prop, '').get(0).outerHTML + ic_str}</span>${o_str}`
      $span.replaceWith('<span id="fr-break"></span>')
      const html = $outer_span.get(0).outerHTML

      // Replace the outer node.
      $($outer_span.get(0)).replaceWith(html.replace(/<span id="fr-break"><\/span>/g, function () {

        return str;
      }));
    }
  }

  function _normalize() {
    let i

    while (editor.$el.find('.fr-split:empty').length > 0) {
      editor.$el.find('.fr-split:empty').remove()
    }

    editor.$el.find('.fr-split').removeClass('fr-split')

    editor.$el.find('[style=""]').removeAttr('style')
    editor.$el.find('[class=""]').removeAttr('class')

    editor.html.cleanEmptyTags()

    const $spans = editor.$el.find('span')
    for (let k = $spans.length - 1; k >= 0; k--) {
      const msp = $spans[k]

      if (!msp.attributes || msp.attributes.length === 0) {
        $(msp).replaceWith(msp.innerHTML)
      }
    }

    editor.el.normalize()

    // Join current spans together if they are one next to each other.
    const just_spans = editor.$el.find('span[style] + span[style]')

    for (i = 0; i < just_spans.length; i++) {
      const $x = $(just_spans[i])
      const $p = $(just_spans[i]).prev()

      if ($x.get(0).previousSibling === $p.get(0) && editor.node.openTagString($x.get(0)) === editor.node.openTagString($p.get(0))) {
        $x.prepend($p.html())
        $p.remove()
      }
    }

    // Check if we have span(font-size) inside span(background-color).
    // Then, make a split.
    editor.$el.find('span[style] span[style]').each(function () {
      if ($(this).attr('style').indexOf('font-size') >= 0) {
        const $parent = $(this).parents('span[style]')

        if ($parent.attr('style').indexOf('background-color') >= 0) {
          $(this).attr('style', `${$(this).attr('style')};${$parent.attr('style')}`)
          _split($(this), 'span[style]', {}, false)
        }
      }
    })

    editor.el.normalize()
    editor.selection.restore()
  }

  /**
   * Remove inline style.
   */
  function removeStyle(prop) {
    applyStyle(prop, null)
  }

  /**
   * Get the current state.
   */
  function is(tag, attrs) {
    if (typeof attrs === 'undefined') {
      attrs = {}
    }

    if (attrs.style) {
      delete attrs.style
    }

    const range = editor.selection.ranges(0)
    let el = range.startContainer

    if (el.nodeType === Node.ELEMENT_NODE) {

      // Search for node deeper.
      if (el.childNodes.length > 0 && el.childNodes[range.startOffset]) {
        el = el.childNodes[range.startOffset]
      }
    }

    // If we are at the end of text node, then check next elements.
    if (!range.collapsed && el.nodeType === Node.TEXT_NODE && range.startOffset === (el.textContent || '').length) {
      while (!editor.node.isBlock(el.parentNode) && !el.nextSibling) {
        el = el.parentNode
      }

      if (el.nextSibling) {
        el = el.nextSibling
      }
    }


    // Check first childs.
    let f_child = el

    while (f_child && f_child.nodeType === Node.ELEMENT_NODE && !_matches(f_child, _query(tag, attrs))) {
      f_child = f_child.firstChild
    }

    if (f_child && f_child.nodeType === Node.ELEMENT_NODE && _matches(f_child, _query(tag, attrs))) {
      return true
    }


    // Check parents.
    let p_node = el

    if (p_node && p_node.nodeType !== Node.ELEMENT_NODE) {
      p_node = p_node.parentNode
    }

    while (p_node && p_node.nodeType === Node.ELEMENT_NODE && p_node !== editor.el && !_matches(p_node, _query(tag, attrs))) {
      p_node = p_node.parentNode
    }

    if (p_node && p_node.nodeType === Node.ELEMENT_NODE && p_node !== editor.el && _matches(p_node, _query(tag, attrs))) {
      return true
    }

    return false
  }

  return {
    is,
    toggle,
    apply,
    remove,
    applyStyle,
    removeStyle
  }
}
