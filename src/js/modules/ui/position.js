import FE from '../../editor.js'

FE.MODULES.position = function (editor) {
  const $ = editor.$

  /**
  * Get bounding rect around selection.
  *
  */
  function getBoundingRect() {
    const range = editor.selection.ranges(0)
    let boundingRect = range.getBoundingClientRect()

    if (boundingRect.top === 0 && boundingRect.left === 0 && boundingRect.width === 0 || boundingRect.height === 0) {
      let remove = false

      if (editor.$el.find('.fr-marker').length === 0) {
        editor.selection.save()
        remove = true
      }

      const $marker = editor.$el.find('.fr-marker').first()
      $marker.css('display', 'inline')
      $marker.css('line-height', '')
      const offset = $marker.offset()
      const height = $marker.outerHeight()
      $marker.css('display', 'none')
      $marker.css('line-height', 0)

      boundingRect = {}
      boundingRect.left = offset && offset.left;
      boundingRect.width = 0
      boundingRect.height = height
      boundingRect.top = offset && offset.top - (editor.helpers.isMobile() && !editor.helpers.isIOS() || editor.opts.iframe ? 0 : editor.helpers.scrollTop())
      boundingRect.right = 1
      boundingRect.bottom = 1
      boundingRect.ok = true

      if (remove) {
        editor.selection.restore()
      }
    }

    return boundingRect
  }

  /**
   * Normalize top positioning.
   */
  function _topNormalized($el, top, obj_height) {
    const height = $el.outerHeight(true)

    if (!editor.helpers.isMobile() && editor.$tb && $el.parent().get(0) !== editor.$tb.get(0)) {
      // Get the parent of the element.
      let p_offset = $el.parent().offset().top
      const new_top = top - height - (obj_height || 0)

      // Parent is scrollable container.
      // Substract the top of the container.
      if ($el.parent().get(0) === editor.$sc.get(0)) {
        p_offset -= $el.parent().position().top
      }

      // Scrollable container height.
      const s_height = editor.$sc.get(0).clientHeight

      // 1. Parent offset + toolbar top + toolbar height > scrollableContainer height.
      // 2. Selection doesn't go above the screen.
      if (p_offset + top + height > editor.$sc.offset().top + s_height && $el.parent().offset().top + new_top > 0 && new_top > 0) {

        // Make sure we can display it.
        if (new_top > editor.$wp.scrollTop()) {
          top = new_top
          $el.addClass('fr-above')
        }
      }
      else {
        $el.removeClass('fr-above')
      }
    }

    return top
  }

  /**
   * Normalize left position.
   */
  function _leftNormalized($el, left) {
    const width = $el.outerWidth(true)

    // Normalize right.
    if (left + width > editor.$sc.get(0).clientWidth - 10) {
      left = editor.$sc.get(0).clientWidth - width - 10
    }

    // Normalize left.
    if (left < 0) {
      left = 10
    }

    return left
  }

  /**
   * Place editor below selection.
   */
  function forSelection($el) {
    const selection_rect = getBoundingRect()

    $el.css({
      top: 0,
      left: 0
    })

    let top = selection_rect.top + selection_rect.height
    const left = selection_rect.left + selection_rect.width / 2 - $el.get(0).offsetWidth / 2 + editor.helpers.scrollLeft()

    if (!editor.opts.iframe) {
      top += editor.helpers.scrollTop()
    }

    at(left, top, $el, selection_rect.height)
  }

  /**
   * Position element at the specified position.
   */
  function at(left, top, $el, obj_height) {
    const $container = $el.data('container')

    if ($container && ($container.get(0).tagName !== 'BODY' || $container.css('position') !== 'static')) {

      if (left) {
        left -= $container.offset().left
      }

      if (top) {
        top -= $container.offset().top
      }

      if ($container.get(0).tagName !== 'BODY') {
        if (left) {
          left += $container.get(0).scrollLeft
        }

        if (top) {
          top += $container.get(0).scrollTop
        }
      }
      else if ($container.css('position') === 'absolute') {
        if (left) {
          left += $container.position().left
        }

        if (top) {
          top += $container.position().top
        }
      }
    }

    // Apply iframe correction.
    if (editor.opts.iframe && $container && editor.$tb && $container.get(0) !== editor.$tb.get(0)) {
      const iframePaddingTop = editor.helpers.getPX(editor.$wp.find('.fr-iframe').css('padding-top'))
      const iframePaddingLeft = editor.helpers.getPX(editor.$wp.find('.fr-iframe').css('padding-left'))
      if (left) {
        left += editor.$iframe.offset().left + iframePaddingLeft
      }

      if (top) {
        top += editor.$iframe.offset().top + iframePaddingTop
      }
    }

    const new_left = _leftNormalized($el, left)

    if (left) {

      // Set the new left.
      $el.css('left', new_left)

    }

    if (top) {
      $el.css('top', _topNormalized($el, top, obj_height))
    }
  }

  /**
   * Special case for update sticky on iOS.
   */
  function _updateIOSSticky(el) {
    const $el = $(el)
    const is_on = $el.is('.fr-sticky-on')
    const prev_top = $el.data('sticky-top')
    const scheduled_top = $el.data('sticky-scheduled')

    // Create a dummy div that we show then sticky is on.
    if (typeof prev_top === 'undefined') {
      $el.data('sticky-top', 0)
      const $dummy = $(`<div class="fr-sticky-dummy" style="height: ${$el.outerHeight()}px;"></div>`)
      editor.$box.prepend($dummy)
    }
    else {
      editor.$box.find('.fr-sticky-dummy').css('height', $el.outerHeight())
    }

    // Position sticky doesn't work when the keyboard is on the screen.
    if (editor.core.hasFocus() || editor.$tb.findVisible('input:focus').length > 0) {

      // Get the current scroll.
      const x_scroll = editor.helpers.scrollTop()

      // Get the current top.
      // We make sure that we keep it within the editable box.
      const x_top = Math.min(Math.max(x_scroll - editor.$tb.parent().offset().top, 0), editor.$tb.parent().outerHeight() - $el.outerHeight())

      // Not the same top and different than the already scheduled.
      if (x_top !== prev_top && x_top !== scheduled_top) {

        // Clear any too soon change to avoid flickering.
        clearTimeout($el.data('sticky-timeout'))

        // Store the current scheduled top.
        $el.data('sticky-scheduled', x_top)

        // Hide the toolbar for a rich experience.
        if ($el.outerHeight() < x_scroll - editor.$tb.parent().offset().top) {
          $el.addClass('fr-opacity-0')
        }

        // Set the timeout for changing top.
        // Based on the test 100ms seems to be the best timeout.
        $el.data('sticky-timeout', setTimeout(() => {

          // Get the current top.
          const c_scroll = editor.helpers.scrollTop()
          let c_top = Math.min(Math.max(c_scroll - editor.$tb.parent().offset().top, 0), editor.$tb.parent().outerHeight() - $el.outerHeight())

          if (c_top > 0 && editor.$tb.parent().get(0).tagName === 'BODY') {
            c_top += editor.$tb.parent().position().top
          }

          // Don't update if it is not different than the prev top.
          if (c_top !== prev_top) {
            $el.css('top', Math.max(c_top, 0))

            $el.data('sticky-top', c_top)
            $el.data('sticky-scheduled', c_top)
          }

          // Show toolbar.
          $el.removeClass('fr-opacity-0')
        }, 100))
      }

      // Turn on sticky mode.
      if (!is_on) {
        const $parent = editor.$tb.parent()
        const parentBorderWidth = $parent.get(0).offsetWidth - $parent.get(0).clientWidth

        $el.css('top', '0')
        $el.width($parent.width() - parentBorderWidth)
        $el.addClass('fr-sticky-on')
        editor.$box.addClass('fr-sticky-box')
      }
    }

    // Turn off sticky mode.
    else {
      clearTimeout($(el).css('sticky-timeout'))
      $el.css('top', '0')
      $el.css('position', '')
      $el.css('width', '')
      $el.data('sticky-top', 0)
      $el.removeClass('fr-sticky-on')
      editor.$box.removeClass('fr-sticky-box')
    }
  }

  /**
   * Update sticky location for browsers that don't support sticky.
   * https://github.com/filamentgroup/fixed-sticky
   *
   * The MIT License (MIT)
   *
   * Copyright (c) 2013 Filament Group
   */
  function _updateSticky(el) {
    if (!el.offsetWidth) {
      return
    }

    const $el = $(el)
    const height = $el.outerHeight()

    let position = $el.data('sticky-position')

    // Viewport height.
    const viewport_height = $(editor.opts.scrollableContainer === 'body' ? editor.o_win : editor.opts.scrollableContainer).outerHeight()

    let scrollable_top = 0
    let scrollable_bottom = 0

    if (editor.opts.scrollableContainer !== 'body') {
      scrollable_top = editor.$sc.offset().top
      scrollable_bottom = $(editor.o_win).outerHeight() - scrollable_top - viewport_height
    }

    const offset_top = editor.opts.scrollableContainer === 'body' ? editor.helpers.scrollTop() : scrollable_top

    const is_on = $el.is('.fr-sticky-on')

    // Decide parent.
    if (!$el.data('sticky-parent')) {
      $el.data('sticky-parent', $el.parent())
    }
    const $parent = $el.data('sticky-parent')
    const parent_top = $parent.offset().top
    const parent_height = $parent.outerHeight()


    if (!$el.data('sticky-offset')) {
      $el.data('sticky-offset', true)
      $el.after(`<div class="fr-sticky-dummy" style="height: ${height}px;"></div>`)
    }
    else {
      editor.$box.find('.fr-sticky-dummy').css('height', `${height}px`)
    }

    // Detect position placement.
    if (!position) {

      // Some browsers require fixed/absolute to report accurate top/left values.
      const skip_setting_fixed = $el.css('top') !== 'auto' || $el.css('bottom') !== 'auto'

      // Set to position fixed for a split of second.
      if (!skip_setting_fixed) {
        $el.css('position', 'fixed')
      }

      // Find position.
      position = {
        top: editor.node.hasClass($el.get(0), 'fr-top'),
        bottom: editor.node.hasClass($el.get(0), 'fr-bottom')
      }

      // Remove position fixed.
      if (!skip_setting_fixed) {
        $el.css('position', '')
      }

      // Store position.
      $el.data('sticky-position', position)

      $el.data('top', editor.node.hasClass($el.get(0), 'fr-top') ? $el.css('top') : 'auto')
      $el.data('bottom', editor.node.hasClass($el.get(0), 'fr-bottom') ? $el.css('bottom') : 'auto')
    }

    const el_top = editor.helpers.getPX($el.data('top'))
    const el_bottom = editor.helpers.getPX($el.data('bottom'))

    // Detect if is OK to fix at the top.
    function isFixedToTop() {

      // 1. Top condition.
      // 2. Bottom condition.
      return parent_top < offset_top + el_top &&
              parent_top + parent_height - height >= offset_top + el_top
    }

    // Detect if it is OK to fix at the bottom.
    function isFixedToBottom() {
      return parent_top + height < offset_top + viewport_height - el_bottom &&
              parent_top + parent_height > offset_top + viewport_height - el_bottom
    }

    const at_top = position.top && isFixedToTop() && (editor.helpers.isInViewPort(editor.$sc.get(0)) || editor.opts.scrollableContainer === 'body')
    const at_bottom = position.bottom && isFixedToBottom()

    // Should be fixed.
    if (at_top || at_bottom) {

      // Account for parent border in calculating toolbar width
      const parentBorderWidth = $parent.get(0).offsetWidth - $parent.get(0).clientWidth
      $el.css('width', `${$parent.get(0).getBoundingClientRect().width - parentBorderWidth}px`);

      if (!is_on) {
        $el.addClass('fr-sticky-on')
        $el.removeClass('fr-sticky-off')

        if ($el.css('top')) {
          if ($el.data('top') !== 'auto') {
            $el.css('top', editor.helpers.getPX($el.data('top')) + scrollable_top)
          }
          else {
            $el.data('top', 'auto')
          }
        }

        if ($el.css('bottom')) {
          if ($el.data('bottom') !== 'auto') {
            $el.css('bottom', editor.helpers.getPX($el.data('bottom')) + scrollable_bottom)
          }
          else {
            $el.css('bottom', 'auto')
          }
        }
      }
    }

    // Shouldn't be fixed.
    else if (!editor.node.hasClass($el.get(0), 'fr-sticky-off')) {

      // Reset.
      $el.css('width', '')
      $el.removeClass('fr-sticky-on')
      $el.addClass('fr-sticky-off')

      if ($el.css('top') && $el.data('top') !== 'auto' && position.top) {
        $el.css('top', 0)
      }

      if ($el.css('bottom') && $el.data('bottom') !== 'auto' && position.bottom) {
        $el.css('bottom', 0)
      }
    }
  }

  /**
   * Test if browser supports sticky.
   */
  function _testSticky() {
    return false
  }

  // Use an animation frame to make sure we're always OK with the updates.
  function animate() {
    editor.helpers.requestAnimationFrame()(animate)

    if (editor.events.trigger('position.refresh') === false) {
      return
    }

    for (let i = 0; i < editor._stickyElements.length; i++) {
      _updateIOSSticky(editor._stickyElements[i])
    }
  }

  /**
   * Initialize sticky position.
   */
  function _initSticky() {
    if (!_testSticky()) {
      editor._stickyElements = []

      // iOS special case.
      if (editor.helpers.isIOS()) {
        animate()

        // Hide toolbar on touchmove. This is very useful on iOS versions < 8.
        editor.events.$on($(editor.o_win), 'scroll', () => {
          if (editor.core.hasFocus()) {
            for (let i = 0; i < editor._stickyElements.length; i++) {
              const $el = $(editor._stickyElements[i])
              const $parent = $el.parent()
              const c_scroll = editor.helpers.scrollTop()

              if ($el.outerHeight() < c_scroll - $parent.offset().top) {
                $el.addClass('fr-opacity-0')
                $el.data('sticky-top', -1)
                $el.data('sticky-scheduled', -1)
              }
            }
          }
        }, true)
      }

      // Default case. Do the updates on scroll.
      else {
        if (editor.opts.scrollableContainer !== 'body') {
          editor.events.$on($(editor.opts.scrollableContainer), 'scroll', refresh, true)
        }

        editor.events.$on($(editor.o_win), 'scroll', refresh, true)
        editor.events.$on($(editor.o_win), 'resize', refresh, true)

        editor.events.on('initialized', refresh)
        editor.events.on('focus', refresh)

        editor.events.$on($(editor.o_win), 'resize', 'textarea', refresh, true)
      }
    }

    editor.events.on('destroy', () => {
      editor._stickyElements = []
    })
  }

  function refresh() {
    if (editor._stickyElements) {
      for (let i = 0; i < editor._stickyElements.length; i++) {
        _updateSticky(editor._stickyElements[i])
      }
    }
  }

  /**
   * Mark element as sticky.
   */
  function addSticky($el) {
    $el.addClass('fr-sticky')

    if (editor.helpers.isIOS()) {
      $el.addClass('fr-sticky-ios')
    }

    if (!_testSticky()) {
      $el.removeClass('fr-sticky')
      editor._stickyElements.push($el.get(0))
    }
  }

  function _init() {
    _initSticky()
  }

  return {
    _init,
    forSelection,
    addSticky,
    refresh,
    at,
    getBoundingRect
  }
}
