import FE from '../../editor.js'

FE.MODULES.modals = function (editor) {
  const $ = editor.$

  if (!editor.shared.modals) {
    editor.shared.modals = {}
  }
  let modals = editor.shared.modals
  let $overlay

  /**
   * Get the modal with the specific id.
   */
  function get(id) {
    return modals[id]
  }

  /*
   *  Get modal html
   */
  function _modalHTML(head, body) {

    // Modal wrapper.
    let html = `<div tabIndex="-1" class="fr-modal${editor.opts.theme ? ` ${editor.opts.theme}-theme` : ''}"><div class="fr-modal-wrapper">`

    // Modal title.
    const close_button = `<button title="${editor.language.translate('Cancel')}" class="fr-command fr-btn fr-modal-close"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 24 24"><path d="${FE.SVG.close}"/></svg></button>`
    html += `<div class="fr-modal-head">${head}${close_button}</div>`

    // Body.
    html += `<div tabIndex="-1" class="fr-modal-body">${body}</div>`

    // End Modal.
    html += '</div></div>'

    const $tmp = $(editor.doc.createElement('DIV'))
    $tmp.html(html)

    return $tmp.find('> .fr-modal')
  }

  /*
   * Create modal.
   */
  function create(id, head, body) {

    // Wrap all head elements inside a div
    head = `<div class="fr-modal-head-line">${head}</div>`

    // Build modal overlay.
    if (!editor.shared.$overlay) {
      editor.shared.$overlay = $(editor.doc.createElement('DIV')).addClass('fr-overlay')
      $('body').first().append(editor.shared.$overlay)
    }
    $overlay = editor.shared.$overlay

    if (editor.opts.theme) {
      $overlay.addClass(`${editor.opts.theme}-theme`)
    }

    // Build modal.
    if (!modals[id]) {
      const $modal = _modalHTML(head, body)
      modals[id] = {
        $modal,
        $head: $modal.find('.fr-modal-head'),
        $body: $modal.find('.fr-modal-body')
      }

      // Desktop or mobile device.
      if (!editor.helpers.isMobile()) {
        $modal.addClass('fr-desktop')
      }

      // Append modal to body.
      $('body').first().append($modal)

      // Click on close button.
      editor.events.$on($modal, 'click', '.fr-modal-close', () => {
        hide(id)
      }, true)

      modals[id].$body.css('margin-top', modals[id].$head.outerHeight())

      // Keydown handler.
      editor.events.$on($modal, 'keydown', (e) => {
        const keycode = e.which

        // Esc.
        if (keycode === FE.KEYCODE.ESC) {
          hide(id)
          editor.accessibility.focusModalButton($modal)

          return false
        }
        else if (!$(e.currentTarget).is('input[type=text], textarea') && keycode !== FE.KEYCODE.ARROW_UP && keycode !== FE.KEYCODE.ARROW_DOWN && !editor.keys.isBrowserAction(e)) {
          e.preventDefault()
          e.stopPropagation()

          return false
        }


        return true

      }, true)

      hide(id, true)
    }

    return modals[id]
  }

  /*
   * Destroy modals.
   */
  function destroy() {

    // Destroy all modals.
    for (const i in modals) {
      if (Object.prototype.hasOwnProperty.call(modals, i)) {
        const modalHash = modals[i]
        if (modalHash && modalHash.$modal) {
          modalHash.$modal.removeData().remove()
        }
      }
    }

    if ($overlay) {
      $overlay.removeData().remove()
    }

    modals = {}
  }

  /*
   * Show modal.
   */
  function show(id) {
    if (!modals[id]) {
      return
    }

    const $modal = modals[id].$modal

    // Set the current instance for the modal.
    $modal.data('instance', editor)

    // Show modal.
    $modal.show()
    $overlay.show()

    // Prevent scrolling in page.
    $(editor.o_doc).find('body').first().addClass('prevent-scroll')

    // Mobile device
    if (editor.helpers.isMobile()) {
      $(editor.o_doc).find('body').first().addClass('fr-mobile')
    }

    $modal.addClass('fr-active')

    editor.accessibility.focusModal($modal)
  }

  /*
   * Hide modal.
   */
  function hide(id, init) {
    if (!modals[id]) {
      return
    }

    const $modal = modals[id].$modal
    const inst = $modal.data('instance') || editor

    inst.events.enableBlur()
    $modal.hide()
    $overlay.hide()
    $(inst.o_doc).find('body').first().removeClass('prevent-scroll fr-mobile')

    $modal.removeClass('fr-active')

    if (!init) {

      // Restore selection.
      inst.accessibility.restoreSelection()

      inst.events.trigger('modals.hide')
    }
  }

  /**
   *  Resize modal according to its body or editor heights.
   */
  function resize(id) {
    if (!modals[id]) {
      return
    }

    const modalHash = modals[id]
    const $modal = modalHash.$modal
    const $body = modalHash.$body

    const height = editor.o_win.innerHeight

    // The wrapper object.
    const $wrapper = $modal.find('.fr-modal-wrapper')

    // Calculate max allowed height.
    const allWrapperHeight = $wrapper.outerHeight(true)
    const exteriorBodyHeight = $wrapper.height() - ($body.outerHeight(true) - $body.height())
    const maxHeight = height - allWrapperHeight + exteriorBodyHeight

    // Get body content height.
    const body_content_height = $body.get(0).scrollHeight

    // Calculate the new height.
    let newHeight = 'auto'

    if (body_content_height > maxHeight) {
      newHeight = maxHeight
    }

    $body.height(newHeight)
  }

  /**
   * Find visible modal.
   */
  function isVisible(id) {
    let $modal

    // By id.
    if (typeof id === 'string') {
      if (!modals[id]) {
        return
      }
      $modal = modals[id].$modal
    }

    // By modal object.
    else {
      $modal = id
    }

    return $modal && editor.node.hasClass($modal, 'fr-active') && editor.core.sameInstance($modal) || false
  }

  /**
   * Check if there is any modal visible.
   */
  function areVisible(new_instance) {
    for (const id in modals) {
      if (Object.prototype.hasOwnProperty.call(modals, id)) {
        if (isVisible(id) && (typeof new_instance === 'undefined' || modals[id].$modal.data('instance') === new_instance)) {
          return modals[id].$modal
        }
      }
    }

    return false
  }

  /**
   * Initialization.
   */
  function _init() {
    editor.events.on('shared.destroy', destroy, true)
  }

  return {
    _init,
    get,
    create,
    show,
    hide,
    resize,
    isVisible,
    areVisible
  }
}
