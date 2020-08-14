import FE from '../index.js'
'use strict';

Object.assign(FE.POPUP_TEMPLATES, {
  'filesManager.insert': '[_BUTTONS_][_UPLOAD_LAYER_][_BY_URL_LAYER_][_EMBED_LAYER_][_UPLOAD_PROGRESS_LAYER_][_PROGRESS_BAR_]',
  'image.edit': '[_BUTTONS_]',
  'image.alt': '[_BUTTONS_][_ALT_LAYER_]',
  'image.size': '[_BUTTONS_][_SIZE_LAYER_]'
})

Object.assign(FE.DEFAULTS, {
  filesInsertButtons: ['imageBack', '|', 'filesUpload', 'filesByURL', 'filesEmbed'],
  filesInsertButtons2: ['deleteAll', 'insertAll', 'cancel', 'minimize'],
  imageEditButtons: ['imageReplace', 'imageAlign', 'imageCaption', 'imageRemove', 'imageLink', 'linkOpen', 'linkEdit', 'linkRemove', '-', 'imageDisplay', 'imageStyle', 'imageAlt', 'imageSize'],
  imageAltButtons: ['imageBack', '|'],
  imageSizeButtons: ['imageBack', '|'],
  imageUpload: true,
  filesManagerUploadURL: null,
  imageCORSProxy: 'https://cors-anywhere.froala.com',
  imageUploadRemoteUrls: true,
  filesManagerUploadParam: 'file',
  filesManagerUploadParams: {},
  googleOptions:{},
  filesManagerUploadToS3: false,
  filesManagerUploadToAzure: false,
  filesManagerUploadMethod: 'POST',
  filesManagerMaxSize: 10* 1024 * 1024,  
  filesManagerAllowedTypes: ['*'],
  imageResize: true,
  imageResizeWithPercent: false,
  imageRoundPercent: false,
  imageDefaultWidth: 300,
  imageDefaultAlign: 'center',
  imageDefaultDisplay: 'block',
  imageSplitHTML: false,
  imageStyles: {
    'fr-rounded': 'Rounded',
    'fr-bordered': 'Bordered',
    'fr-shadow': 'Shadow'
  },
  imageMove: true,
  imageMultipleStyles: true,
  imageTextNear: true,
  imagePaste: true,
  imagePasteProcess: false,
  imageMinWidth: 16,
  imageOutputSize: false,
  imageDefaultMargin: 5,
  imageAddNewLine: false
})

FE.VIDEO_PROVIDERS = [
  {
    test_regex: /^.*((youtu.be)|(youtube.com))\/((v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))?\??v?=?([^#\&\?]*).*/,
    url_regex: /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/)?([0-9a-zA-Z_\-]+)(.+)?/g,
    url_text: 'https://www.youtube.com/embed/$1?$2',
    html: '<iframe width="640" height="360" src="{url}&wmode=opaque" frameborder="0" allowfullscreen></iframe>',
    provider: 'youtube'
  },
  {
    test_regex: /^.*(?:vimeo.com)\/(?:channels(\/\w+\/)?|groups\/*\/videos\/​\d+\/|video\/|)(\d+)(?:$|\/|\?)/,
    url_regex: /(?:https?:\/\/)?(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?(\/[a-zA-Z0-9_\-]+)?/i,
    url_text: 'https://player.vimeo.com/video/$1',
    html: '<iframe width="640" height="360" src="{url}" frameborder="0" allowfullscreen></iframe>',
    provider: 'vimeo'
  },
  {
    test_regex: /^.+(dailymotion.com|dai.ly)\/(video|hub)?\/?([^_]+)[^#]*(#video=([^_&]+))?/,
    url_regex: /(?:https?:\/\/)?(?:www\.)?(?:dailymotion\.com|dai\.ly)\/(?:video|hub)?\/?(.+)/g,
    url_text: 'https://www.dailymotion.com/embed/video/$1',
    html: '<iframe width="640" height="360" src="{url}" frameborder="0" allowfullscreen></iframe>',
    provider: 'dailymotion'
  },
  {
    test_regex: /^.+(screen.yahoo.com)\/[^_&]+/,
    url_regex: '',
    url_text: '',
    html: '<iframe width="640" height="360" src="{url}?format=embed" frameborder="0" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true" allowtransparency="true"></iframe>',
    provider: 'yahoo'
  },
  {
    test_regex: /^.+(rutube.ru)\/[^_&]+/,
    url_regex: /(?:https?:\/\/)?(?:www\.)?(?:rutube\.ru)\/(?:video)?\/?(.+)/g,
    url_text: 'https://rutube.ru/play/embed/$1',
    html: '<iframe width="640" height="360" src="{url}" frameborder="0" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true" allowtransparency="true"></iframe>',
    provider: 'rutube'
  },
  {
    test_regex: /^(?:.+)vidyard.com\/(?:watch)?\/?([^.&/]+)\/?(?:[^_.&]+)?/,
    url_regex: /^(?:.+)vidyard.com\/(?:watch)?\/?([^.&/]+)\/?(?:[^_.&]+)?/g,
    url_text: 'https://play.vidyard.com/$1',
    html: '<iframe width="640" height="360" src="{url}" frameborder="0" allowfullscreen></iframe>',
    provider: 'vidyard'
  }
] 

FE.VIDEO_EMBED_REGEX = /^\W*((<iframe(.|\n)*>(\s|\n)*<\/iframe>)|(<embed(.|\n)*>))\W*$/i 
FE.IMAGE_EMBED_REGEX = /^\W*((<img(.|\n)*>(\s|\n)*))\W*$/i

FE.PLUGINS.filesManager = function (editor) {
  const { $ } = editor
  const DEFAULT_FILE_UPLOAD_URL = 'https://i.froala.com/upload'

  let $current_image
  let $current_image_index
  let current_index
  let $file_manager_dialog_open = false
  let $child_window_open = false
  let $image_resizer
  let $handler
  let $overlay
  let disableEdit 
  let mousedown = false
  let file_list = new Map();
  let file_list_values = new Map();
  let XMLHttpRequests = new Map()
  let fileUploads = new Map()
  let checked_files = new Map()
  let failedUploadFiles = new Map()
  let totalUploadPercent = 0
  let completedUploads = 0
  let fileKeys = []
  let imageEditIndex = -1
  let editImageValue
  let autoplayCheckbox=[]
  let fileListIndex = 0
  const requiredPlugins = ['file', 'image','imageTUI', 'video']
  const BAD_LINK = 1
  const MISSING_LINK = 2
  const ERROR_DURING_UPLOAD = 3
  const BAD_RESPONSE = 4
  const MAX_SIZE_EXCEEDED = 5
  const BAD_FILE_TYPE = 6
  const NO_CORS_IE = 7
  const CORRUPTED_IMAGE = 8
  const ERROR_LINK = 9
  const UPLOAD_CANCEL = 10

  const unsupported_file_types=['video/avi','video/mpeg','video/x-ms-wmv']
  const error_messages = {}
  error_messages[BAD_LINK] = 'File cannot be loaded from the passed link.',
  error_messages[MISSING_LINK] = 'No link in upload response.',
  error_messages[ERROR_DURING_UPLOAD] = 'Error during file upload.',
  error_messages[BAD_RESPONSE] = 'Parsing response failed.',
  error_messages[MAX_SIZE_EXCEEDED] = 'File is too large.',
  error_messages[BAD_FILE_TYPE] = 'File type is invalid.',
  error_messages[NO_CORS_IE] = 'Files can be uploaded only to same domain in IE 8 and IE 9.'
  error_messages[CORRUPTED_IMAGE] = 'File is corrupted.'
  error_messages[ERROR_LINK] = 'Error during file loading.'
  error_messages[UPLOAD_CANCEL] = 'File upload cancelled'

  var fileFormats = [
    ['png', 'PNG', 'jpg', 'JPG', 'jpeg', 'JPEG', 'gif', 'GIF', 'webp', 'WEBP'],
    ['docx', 'DOCX', 'xlsx'],
    ['mp4', 'avi', 'mov', 'url']
  ];

  /**
   * Refresh the image insert popup.
   */
    function _refreshInsertPopup() {
    const $popup = editor.popups.get('filesManager.insert')

    const $url_input = $popup.find('.fr-files-by-url-layer input')
    $url_input.val('')

    let $embed_area = $popup.find('.fr-files-embed-layer textarea')
    $embed_area.val('').trigger('change')

    $url_input.trigger('change')
  }

  /**
   * Show the image upload popup.
   */

  function showInsertPopup(rerender) {
    if(!editor.hasOwnProperty('imageTUI')){
      if(isImage){
        disableEdit = 'fr-disabled'
       }
    }
    $file_manager_dialog_open = true
    // removing all files with errors
    failedUploadFiles.forEach(function(errorMessage, index) {
      deleteFile(index)
    })
    let $popup
    // check for required plugins
    if(checkRequiredPlugins()){
      $popup = editor.popups.get('filesManager.insert')
      if (!$popup) $popup = _initInsertPopup()
    }
    else{
      $popup = editor.popups.get('filesManager.insert')
      if (!$popup) $popup = _initPluginErrorPopup()
    }
    const $btn = editor.$tb.find('.fr-command[data-cmd="insertFiles"]')
    hideProgressBar()   
    if (rerender || !$popup.hasClass('fr-active')) {      
      if(!rerender){
        resetAllFilesCheckbox()
      }
      editor.popups.refresh('filesManager.insert')
      editor.popups.setContainer('filesManager.insert', editor.$tb)     
      

      if ($btn.isVisible()) {
        const { left, top } = editor.button.getPosition($btn, file_list.size)
        editor.popups.show('filesManager.insert', left, top, $btn.outerHeight())
      }
      else {
        editor.position.forSelection($popup)
        editor.popups.show('filesManager.insert')        
      }
    }
    editor.popups.setPopupDimensions($popup)
    if(checkRequiredPlugins()){
      editor.popups.setFileListHeight($popup)
    }

    if($popup.find('.fr-upload-progress') && file_list.size == 0)
        $popup.find('.fr-upload-progress').addClass('fr-none')

  }

  function checkRequiredPlugins(){
    let plugins = true
    requiredPlugins.forEach(function(plugin){
      if(editor.opts.pluginsEnabled.indexOf(plugin) < 0){
        plugins = false
      }
    })
    return plugins
  }

  function addPlugins(){
    requiredPlugins.forEach(function(plugin){
      if(editor.opts.pluginsEnabled.indexOf(plugin) < 0){
        editor.opts.pluginsEnabled.push(plugin)
      }
    })
  }

  function loadPlugins(module_list){
    for (const m_name in module_list) {
      if(!editor[m_name]){
        if(FE.PLUGINS[m_name] && editor.opts.pluginsEnabled.indexOf(m_name) < 0){
          continue
        }
        editor[m_name] = new module_list[m_name](editor)
        if (editor[m_name]._init) {
          editor[m_name]._init()
        }
      }
    }
  }

  /**
   * Hide image upload popup.
   */

  function _hideInsertPopup() {
      hideProgressBar()
  }

  /**
   * Reposition resizer.
   */

  function _repositionResizer() {
    if (!$image_resizer) _initImageResizer()

    if (!$current_image) return false

    const $container = editor.$wp || editor.$sc

    $container.append($image_resizer)
    $image_resizer.data('instance', editor)

    let wrap_correction_top = $container.scrollTop() - (($container.css('position') != 'static' ? $container.offset().top : 0))
    let wrap_correction_left = $container.scrollLeft() - (($container.css('position') != 'static' ? $container.offset().left : 0))

    wrap_correction_left -= editor.helpers.getPX($container.css('border-left-width'))
    wrap_correction_top -= editor.helpers.getPX($container.css('border-top-width'))

    if (editor.$el.is('img') && editor.$sc.is('body')) {
      wrap_correction_top = 0
      wrap_correction_left = 0
    }

    let $el = getEl()

    if (hasCaption()) {
      $el = $el.find('.fr-img-wrap')
    }

    let iframePaddingTop = 0
    let iframePaddingLeft = 0
    if (editor.opts.iframe) {
      iframePaddingTop = editor.helpers.getPX(editor.$wp.find('.fr-iframe').css('padding-top'))
      iframePaddingLeft = editor.helpers.getPX(editor.$wp.find('.fr-iframe').css('padding-left'))
    }

    $image_resizer
      .css('top', (editor.opts.iframe ? $el.offset().top + iframePaddingTop : $el.offset().top + wrap_correction_top) - 1)
      .css('left', (editor.opts.iframe ? $el.offset().left + iframePaddingLeft : $el.offset().left + wrap_correction_left) - 1)
      .css('width', $el.get(0).getBoundingClientRect().width)
      .css('height', $el.get(0).getBoundingClientRect().height)
      .addClass('fr-active')
  }

  /**
   * Create resize handler.
   */

  function _getHandler(pos) {

    return `<div class="fr-handler fr-h${pos}"></div>`
  }

  /**
   * Set the image with
   */
  function _setWidth(width) {
    if (hasCaption()) {
      $current_image.parents('.fr-img-caption').css('width', width)
    }
    else {
      $current_image.css('width', width)
    }
  }

  /**
   * Mouse down to start resize.
   */
  function _handlerMousedown(e) {
    // Check if resizer belongs to current instance.
    if (!editor.core.sameInstance($image_resizer)) return true

    e.preventDefault()
    e.stopPropagation()

    if (editor.$el.find('img.fr-error').left) return false

    if (!editor.undo.canDo()) editor.undo.saveStep()

    // Get offset.
    let start_x = e.pageX || e.originalEvent.touches[0].pageX

    // Only on mousedown. This function could be called from keydown on accessibility.
    if (e.type == 'mousedown') {
      // See if the entire editor is inside iframe to adjust starting offset.
      const oel = editor.$oel.get(0)
      const doc = oel.ownerDocument
      const win = doc.defaultView || doc.parentWindow
      let editor_inside_iframe = false

      try {
        editor_inside_iframe = (win.location != win.parent.location && !(win.$ && win.$.FE))
      } catch (ex) { }

      if (editor_inside_iframe && win.frameElement) {
        start_x += editor.helpers.getPX($(win.frameElement).offset().left) + win.frameElement.clientLeft
      }
    }

    $handler = $(this)
    $handler.data('start-x', start_x)
    $handler.data('start-width', $current_image.width())
    $handler.data('start-height', $current_image.height())

    // Set current width.
    let width = $current_image.width()

    // Update width value if resizing with percent.
    if (editor.opts.imageResizeWithPercent) {
      const p_node = $current_image.parentsUntil(editor.$el, editor.html.blockTagsQuery()).get(0) || editor.el
      width = (width / $(p_node).outerWidth() * 100).toFixed(2) + '%'
    }
    // Set the image width.
    _setWidth(width)
    $overlay.show()
    editor.popups.hideAll()
    _unmarkExit()
  }

  function insertEmbed(code) {
    if (typeof code == 'undefined') {
      const $popup = editor.popups.get('filesManager.insert')
      code = $popup.find('.fr-files-embed-layer textarea').val() || ''
    }

    if (code.length === 0 || !(FE.VIDEO_EMBED_REGEX.test(code)||FE.IMAGE_EMBED_REGEX.test(code))) {
      _showErrorMessage(editor.language.translate('Something went wrong. Please try again.'));
      if(FE.VIDEO_EMBED_REGEX.test(code))
      {
        editor.events.trigger('video.codeError', [code])
      }
    }
    else {
      insertEmbeddedFile(code)
    }
  }

  /**
   * Do resize.
   */
  function _handlerMousemove(e) {
    // Check if resizer belongs to current instance.
    if (!editor.core.sameInstance($image_resizer)) return true
    let real_image_size

    if ($handler && $current_image) {
      e.preventDefault()

      if (editor.$el.find('img.fr-error').left) return false

      const c_x = e.pageX || (e.originalEvent.touches ? e.originalEvent.touches[0].pageX : null)

      if (!c_x) return false

      const s_x = $handler.data('start-x')
      let diff_x = c_x - s_x
      let width = $handler.data('start-width')

      if ($handler.hasClass('fr-hnw') || $handler.hasClass('fr-hsw')) {
        diff_x = 0 - diff_x
      }

      if (editor.opts.imageResizeWithPercent) {
        const p_node = $current_image.parentsUntil(editor.$el, editor.html.blockTagsQuery()).get(0) || editor.el
        width = ((width + diff_x) / $(p_node).outerWidth() * 100).toFixed(2)

        if (editor.opts.imageRoundPercent) width = Math.round(width)

        // Set the image width.
        _setWidth(`${width}%`)

        // Get the real image width after resize.
        if (hasCaption()) {
          real_image_size = (editor.helpers.getPX($current_image.parents('.fr-img-caption').css('width')) / $(p_node).outerWidth() * 100).toFixed(2)
        }
        else {
          real_image_size = (editor.helpers.getPX($current_image.css('width')) / $(p_node).outerWidth() * 100).toFixed(2)
        }

        // If the width is not contained within editor use the real image size.
        if (real_image_size !== width && !editor.opts.imageRoundPercent) {
          _setWidth(`${real_image_size}%`)
        }

        $current_image.css('height', '').removeAttr('height')
      }
      else {
        if (width + diff_x >= editor.opts.imageMinWidth) {
          // Set width for image parent node as well.
          _setWidth(width + diff_x)

          // Get the real image width after resize.
          if (hasCaption()) {
            real_image_size = editor.helpers.getPX($current_image.parents('.fr-img-caption').css('width'))
          }
          else {
            real_image_size = editor.helpers.getPX($current_image.css('width'))
          }
        }

        // If the width is not contained within editor use the real image size.
        if (real_image_size !== width + diff_x) {
          _setWidth(real_image_size)
        }

        // https://github.com/froala/wysiwyg-editor/issues/1963.
        if (($current_image.attr('style') || '').match(/(^height:)|(; *height:)/) || $current_image.attr('height')) {
          $current_image.css('height', $handler.data('start-height') * $current_image.width() / $handler.data('start-width'))
          $current_image.removeAttr('height')
        }
      }

      _repositionResizer()

      editor.events.trigger('image.resize', [get()])
    }
  }

  /**
   * Stop resize.
   */

  function _handlerMouseup(e) {

    // Check if resizer belongs to current instance.
    if (!editor.core.sameInstance($image_resizer)) return true

    if ($handler && $current_image) {
      if (e) e.stopPropagation()

      if (editor.$el.find('img.fr-error').left) return false

      $handler = null
      $overlay.hide()
      _repositionResizer()

      editor.undo.saveStep()

      editor.events.trigger('image.resizeEnd', [get()])
    }
    else { //https://github.com/froala-labs/froala-editor-js-2/issues/1916
      $image_resizer.removeClass('fr-active')
    }
  }

  function _disableInsertCheckbox () {
    failedUploadFiles.forEach(function(errorMessage, index) {
      const $popup = editor.popups.get('filesManager.insert')
      $popup.find('.fr-checkbox-file-'+index).get(0).disabled = true
      if(document.getElementById('fr-file-autoplay-button-' + index)){
        document.getElementById('fr-file-autoplay-button-' + index).disabled = true
        document.getElementById('fr-file-autoplay-button-' + index).parentElement.classList.add('fr-checkbox-disabled')
        document.getElementById('fr-file-autoplay-button-' + index).parentElement.classList.remove('fr-files-checkbox')
      }
            $popup.find('.fr-checkbox-'+index).get(0).classList.remove('fr-files-checkbox')
      $popup.find('.fr-checkbox-'+index).get(0).classList.add('fr-checkbox-disabled')
    })   
  }

  function _disableFileIcons () {
    failedUploadFiles.forEach(function(errorMessage, index) {
      const $popup = editor.popups.get('filesManager.insert')

      if(document.getElementById(`fr-file-edit-button-${index}`)){
        document.getElementById(`fr-file-edit-button-${index}`).classList.add('fr-disabled')
        document.getElementById(`fr-file-view-button-${index}`).classList.add('fr-disabled')
        document.getElementById(`fr-file-insert-button-${index}`).classList.add('fr-disabled')
      }
    })   
  }

  /**
   * Throw an image error.
   */

  function _throwError(code, response, $img, index) {
    editor.edit.on()
    if ($current_image) $current_image.addClass('fr-error')
    // https://github.com/froala/wysiwyg-editor/issues/3407
    if (error_messages[code]) {
       if(code == ERROR_DURING_UPLOAD || code == MISSING_LINK || code == BAD_RESPONSE){
         updateFileUploadingProgress(100, index, true)
       }
       failedUploadFiles.set(index, error_messages[code])
       _disableInsertCheckbox()
       _disableFileIcons()
      _showFileErrorMessage(editor.language.translate(error_messages[code]), index)
    }
    else {
      _showFileErrorMessage(editor.language.translate('Something went wrong. Please try again.'), index)
    }

    // Remove image if it exists.
    if (!$current_image && $img) remove($img)

    editor.events.trigger('filesManager.error', [{
      code: code,
      message: error_messages[code]
    },
    response,
    $img
    ])
  }

  /**
   * Init the image edit popup.
   */

  function _initEditPopup(delayed) {
    if (delayed) {
      if (editor.$wp) {
        editor.events.$on(editor.$wp, 'scroll.image-edit', function () {
          if ($current_image && editor.popups.isVisible('image.edit')) {
            editor.events.disableBlur()
          }
        })
      }

      return true
    }

    // Image buttons.
    let image_buttons = ''

    if (editor.opts.imageEditButtons.length > 0) {

      image_buttons += `<div class="fr-buttons"> 
        ${editor.button.buildList(editor.opts.imageEditButtons)}
        </div>`

      const template = {
        buttons: image_buttons
      }

      const $popup = editor.popups.create('image.edit', template)

      return $popup
    }

    return false
  }

    /**
   * Cancel File Insert.
   */

  function cancelFileInsert(){
    this.file_manager_dialog_open = false
    XMLHttpRequests.forEach(function(req, index){      
      if(req.readyState != 4){
        req.abort()
        deleteFile(index)
      }
    })
    const $popup = editor.popups.get('filesManager.insert')
    $popup.find('.fr-progress-bar').removeClass('fr-display-block').addClass('fr-none')
    $popup.find('.fr-command[data-cmd="filesUpload"]').removeClass('fr-disabled')
    $popup.find('.fr-command[data-cmd="filesByURL"]').removeClass('fr-disabled')
    $popup.find('.fr-command[data-cmd="filesEmbed"]').removeClass('fr-disabled')
    completedUploads = 0
    XMLHttpRequests = new Map()
    fileUploads = new Map()
    resetAllFilesCheckbox()
    editor.popups.hide('filesManager.insert')
  }

  /**
   * Cancel File Upload.
   */

  function cancelFileUpload(index){
    const $popup = editor.popups.get('filesManager.insert')
    const right = $popup.find('.fr-file-item-right-'+index)
    right.get(0).innerHTML = getFileActionButtons(index)
    XMLHttpRequests.get(index).abort()
    updateProgressBar(index, 100, true)
    $popup.find('.fr-checkbox-file-'+index).get(0).disabled = true
  }
  
  /**
   * Delete File Upload.
   */

  function deleteFileUpload(index){
    if(XMLHttpRequests.get(index).readyState != 0){
      XMLHttpRequests.get(index).abort()
      updateProgressBar(index, 100, true)
      XMLHttpRequests.delete(index)
    }
    deleteFile(index)
  }

  /** 
   * 
   */

  function checkInsertAllState() {
    const $popup = editor.popups.get('filesManager.insert') 
    let $btnInsert = $popup.find('.fr-command[data-cmd="insertAll"]'),
      $btnDelete = $popup.find('.fr-command[data-cmd="deleteAll"]'),
      isDisabled = true

    function addCheck(file, i, map) {
      if (checked_files.get(i)) {
        isDisabled = false
      }
    }
    checked_files.forEach(addCheck)
    isDisabled ? $btnInsert.addClass('fr-disabled') : $btnInsert.removeClass('fr-disabled')
    isDisabled ? $btnDelete.addClass('fr-disabled') : $btnDelete.removeClass('fr-disabled')
   }

  /**
   * Delete File.
   */

  function deleteFile(index){
    if(file_list_values.get(index) && file_list_values.get(index).link)
      editor.events.trigger('filesManager.removed', [file_list_values.get(index).link])
    const $popup = editor.popups.get('filesManager.insert')
    // https://github.com/froala-labs/froala-editor-js-2/issues/2848
    if ($popup.find('.fr-file-' + index).get(0) !== undefined) {
      $popup.find('.fr-file-' + index).get(0).outerHTML = ""
    }
    file_list_values.delete(index)
    file_list.delete(index)
    checked_files.delete(index)
    checkInsertAllState()
    if (file_list.size == 0) {
      fileListIndex = 0
    }
    failedUploadFiles.delete(index)
    editor.popups.setPopupDimensions($popup, true)
    if(editor.opts.toolbarBottom) 
      showInsertPopup(true)
    else
      editor.popups.setPopupDimensions($popup)

    if($popup.find('.fr-upload-progress') && file_list.size == 0)
        $popup.find('.fr-upload-progress').addClass('fr-none')

  }

  /**
   * Minimize popup.
   */

  function minimizePopup(current_index) {
    this.file_manager_dialog_open = false
    editor.popups.hide("filesManager.insert");
    resetAllFilesCheckbox(current_index)
    
  }

/**
   * Reset checkbox of all files.
   */

  function resetAllFilesCheckbox() {
    const $popup = editor.popups.get('filesManager.insert')
    let checked = $popup.find('.fr-insert-checkbox')
    for(let i = 0 ; i < checked.length ; i++){
      checked.get(i).children['target'].checked = false
      $popup.find('.fr-file-' + checked.get(i).id.split('-').pop()).get(0).classList.add('fr-unchecked')
    }
    if(current_index){
      if(document.getElementById(`fr-file-autoplay-button-${current_index}`))
        document.getElementById(`fr-file-autoplay-button-${current_index}`).checked=false
      autoplayCheckbox=autoplayCheckbox.filter(function(i){
        return i!=current_index
      })
    }else{
      let autoplay = $popup.find('.fr-file-autoplay-button')
      for(let i = 0 ; i < autoplay.length ; i++){
        autoplay.get(i).checked = false
      }
      autoplayCheckbox = []
    }
    checked_files = new Map()
    checkInsertAllState()
  }

  /**
   * Show progress bar.
   */

  function showProgressBar(no_message) {
    let $popup = editor.popups.get('filesManager.insert')

    if (!$popup) $popup = _initInsertPopup()

    $popup.find('.fr-layer.fr-active').removeClass('fr-active').addClass('fr-pactive')
    $popup.find('.fr-files-progress-bar-layer').addClass('fr-active')
    $popup.find('.fr-buttons').hide()

    if ($current_image) {
      const $el = getEl()

      editor.popups.setContainer('filesManager.insert', editor.$sc)
      const left = $el.offset().left
      const top = $el.offset().top + $el.height()

      editor.popups.show('filesManager.insert', left, top, $el.outerHeight())
    }

    if (typeof no_message == 'undefined') {
      _setProgressMessage(editor.language.translate('Uploading'), 0)
    }
  }

  /**
   * Hide progress bar.
   */
  function hideProgressBar(dismiss) {
    const $popup = editor.popups.get('filesManager.insert')

    if ($popup) {
      $popup.find('.fr-layer.fr-pactive').addClass('fr-active').removeClass('fr-pactive')
      $popup.find('.fr-files-progress-bar-layer').removeClass('fr-active')
      $popup.find('.fr-buttons').show()

      // Dismiss error message.
      if (dismiss || editor.$el.find('img.fr-error').length) {
        editor.events.focus()

        if (editor.$el.find('img.fr-error').length) {
          editor.$el.find('img.fr-error').remove()
          editor.undo.saveStep()
          editor.undo.run()
          editor.undo.dropRedo()
        }

        if (!editor.$wp && $current_image) {
          const $img = $current_image
          _exitEdit(true)
          editor.selection.setAfter($img.get(0))
          editor.selection.restore()
        }
        editor.popups.hide('filesManager.insert')
      }
    }
  }

  /**
   * Set a progress message.
   */

  function _setProgressMessage(message, progress) {
    const $popup = editor.popups.get('filesManager.insert')

    if ($popup) {
      const $layer = $popup.find('.fr-files-progress-bar-layer')
      $layer.find('h3').text(message + (progress ? ` ${progress}%` : ''))

      $layer.removeClass('fr-error')

      if (progress) {
        $layer.find('div').removeClass('fr-indeterminate')
        $layer.find('div > span').css('width', `${progress}%`)
      }
      else {
        $layer.find('div').addClass('fr-indeterminate')
      }
    }
  }

  /**
   * Show error message to the user.
   */

  function _showErrorMessage(message) {
    showProgressBar()
    const $popup = editor.popups.get('filesManager.insert')
    const $layer = $popup.find('.fr-files-progress-bar-layer')
    $layer.addClass('fr-error')
    const $message_header = $layer.find('h3')
    $message_header.text(message)
    editor.events.disableBlur()
    $message_header.focus()
  }


  /**
   * Show error message to the  user for file upload.
   */

  function _showFileErrorMessage(message, index) {
    const $popup = editor.popups.get('filesManager.insert')
    const $layer = $popup.find('.fr-upload-progress-layer')
    const $row = $popup.find(`.fr-file-${index}`)
    $layer.addClass('fr-error')
    const $message_header = $row.find('h5')
    $message_header.text(message)
  }

  /*
   * Drag and Drop Functions
   */

  let globalListClass = '',
    sortableLists,
    globalX, globalY

  function enableDragSort(listClass) {
    globalListClass = listClass;
    sortableLists = document.getElementsByClassName(listClass);
    Array.prototype.map.call(sortableLists, (list) => {
      enableDragItem(list)
    });
  }

  function enableDragItem(item) {
    item.addEventListener("dragover", function (event) {
      event.preventDefault();
      event.stopPropagation();
      globalX = event.pageX
      globalY = event.pageY
      let el = document.getElementById('filesList')
      if (globalY + 20 > el.getBoundingClientRect().bottom)
        scrollBy(el, 0, 10)
      if (globalY - 20 < el.getBoundingClientRect().top)
        scrollBy(el, 0, -10)
    }, false);

    if(editor.helpers.isMobile()){
    let el = item.getElementsByClassName('dot')
    el[0].addEventListener("touchmove", function (event) {
      event.preventDefault();
      event.stopPropagation();
      let sourceElement = event.target
      while (sourceElement && !sourceElement.classList.contains(globalListClass)) {
        sourceElement = sourceElement.parentElement
      }  

      let hoveredItem = document.elementFromPoint(event.targetTouches[0].clientX, event.targetTouches[0].clientY)
      while (hoveredItem && !hoveredItem.classList.contains(globalListClass)) {
        hoveredItem = hoveredItem.parentElement
      }     

      let elementsWithHoverClass = document.getElementsByClassName('fr-hovered-over-file')
      Array.prototype.forEach.call(elementsWithHoverClass, function(element) {
        element.classList.remove('fr-hovered-over-file')
    });
 
    if(hoveredItem && !sourceElement.classList.contains('fr-unchecked'))   
        hoveredItem.classList.add('fr-hovered-over-file')

      let el = document.getElementById('filesList')
        if (event.targetTouches[0].clientY + 5 > el.getBoundingClientRect().bottom)
          {
            scrollBy(el, 0, 5)
          }
        if (event.targetTouches[0].clientY - 5 < el.getBoundingClientRect().top)
          {
            scrollBy(el, 0, -5)
          }
    }, false);
  }

    item.ondrag = handleDrag;
    item.ondragend = handleDrop;
    if (editor.helpers.isMobile()) {  
      let el = item.getElementsByClassName('dot')
      el[0].addEventListener('touchmove', handleDrag, false);
      el[0].addEventListener('touchend', handleDrop, false);
    }
  }


  let selectedItem,
   selectedLocX,
   selectedLocY

   function scrollBy(el, x, y) {
    el.scrollLeft += x;
    el.scrollTop += y;
  }

  function handleDrag(item) {
    if (editor.helpers.isMobile()) {
      selectedLocX = event.touches[0].clientX
      selectedLocY = event.touches[0].clientY
    }
    selectedItem = item.target
    while (!selectedItem.classList.contains(globalListClass)) {
      selectedItem = selectedItem.parentElement
    }

    if(!selectedItem.classList.contains(globalListClass) || selectedItem.classList.contains('fr-unchecked')) {
      selectedItem = undefined
      return
    }
    if(editor.helpers.isMobile())
      selectedItem.classList.add('drag-sort-active')

    return
  }

  function handleDrop(item) {
    let droppedItem
    if (selectedItem === undefined) {
      return
    }

    let x, y

    if (editor.helpers.isMobile()) {
      x = selectedLocX
      y = selectedLocY
      droppedItem = event.target
      while (!droppedItem.classList.contains(globalListClass)) {
        droppedItem = droppedItem.parentElement
      }
    } else {
      x = event.clientX
      y = event.clientY
    }
    //Condition for Firefox and Safari MAC
    if ( !editor.helpers.isMobile() && ( editor.browser.safari || editor.browser.mozilla)) {
      x = globalX
      y = globalY
    }

    let swapItem = document.elementFromPoint(x, y)

    while (swapItem && !swapItem.classList.contains(globalListClass)) {
      swapItem = swapItem.parentElement
    }

    if(swapItem && !swapItem.classList.contains(globalListClass)) {
      swapItem = undefined
    }
    else if (swapItem && selectedItem !== swapItem) {
      swapNodes(selectedItem, swapItem)
    }
    
    if(editor.helpers.isMobile()) {   
      droppedItem.classList.remove('fr-hovered-over-file')
      swapItem.classList.remove('fr-hovered-over-file')
    }


  }

  function swapNodes(n1, n2) {
    var p1 = n1.parentNode;
    var p2 = n2.parentNode;
    var i1, i2;

    if ( !p1 || !p2 || p1.isEqualNode(n2) || p2.isEqualNode(n1) ) return;

    for (var i = 0; i < p1.children.length; i++) {
        if (p1.children[i].isEqualNode(n1)) {
            i1 = i;
        }
    }
    for (var i = 0; i < p2.children.length; i++) {
        if (p2.children[i].isEqualNode(n2)) {
            i2 = i;
        }
    }

    if ( p1.isEqualNode(p2) && i1 < i2 ) {
        i2++;
    }
    p1.insertBefore(n2, p1.children[i1]);
    p2.insertBefore(n1, p2.children[i2]);
}

  function showFileUploadProgressLayer(i) { 
      let $popup = editor.popups.get('filesManager.insert')    
      if(!$popup.find('.fr-upload-progress-layer').hasClass('fr-active')){
        $popup.find('.fr-upload-progress-layer').addClass('fr-active')
      }

      $popup.find('.fr-upload-progress').removeClass('fr-none')

      let file = file_list.get(i)
      let description = getFileDescription(new Date())
      let checkedClass = checked_files.get(i) ? '' : 'fr-unchecked '  
      const checkmark = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="10" height="10" viewBox="0 0 32 32"><path d="M27 4l-15 15-7-7-5 5 12 12 20-20z" fill="#FFF"></path></svg>'       
      let upload_progress_layer = `
        <div id='fr-file-${i}' class='fr-file-list-item fr-file-${i} ${checkedClass}' draggable = "${checkedClass ? false : true}" >
        <div class='fr-file-item-left' >

    
            <div class="fr-file-item-insert-checkbox fr-files-checkbox-line">
            ${editor.helpers.isMobile() ? `<div id='fr-pick-${i}}' class='dot'>
            </div>`:``}
            <div id="checkbox-key-${i}" class="fr-files-checkbox fr-insert-checkbox  fr-checkbox-${i}">
            <input name="target" class="fr-insert-attr fr-checkbox-file-${i} fr-file-insert-check" data-cmd="fileInsertCheckbox"
             data-checked="_blank" type="checkbox" id="fr-link-target-${editor.id}" tabIndex="0" />
            <span>${checkmark}
            </span>
        </div>
                <label id="fr-label-target-${editor.id}"></label>
            </div>
    
            <div class='fr-file-item-icon fr-file-item-icon-${i}' >
                <img src='https://secure.webtoolhub.com/static/resources/icons/set112/f2afb6f7.png' alt='Image preview' class='thumbnail-padding' height='36px' width='36px' />
            </div>

            <div class='fr-file-item-description' >
                <div class='fr-file-name fr-files-manager-tooltip'>
                   ${text_truncate(file.name,20)}
                      <span class="${ file.name.length > 20 ? 'tooltiptext':'fr-none'}">${file.name}
                      </span>
                 </div>
                 <div class='fr-file-details'>
                 <div class='fr-file-date'>${description}
                 </div>
 
                 <div class='fr-file-size'>
                     ${getFileSize(file.size)}
                 </div>
                 </div>

                  <div class='fr-file-error'>
                    <h5 class='fr-file-error-h5'></h5>
                 </div>
             </div>
    
        </div>

        <div class='fr-file-item-right fr-file-item-right-${i}'>` + getFileActionButtons(i) + `</div>
    </div>`;

    $popup.find('.fr-upload-progress-layer')[0].innerHTML = upload_progress_layer + $popup.find('.fr-upload-progress-layer')[0].innerHTML;
    // adding checked to already checked files
    function addCheck(file, i, map) {
      if (checked_files.get(i)) {
        $popup.find(`input.fr-insert-attr.fr-checkbox-file-${i}`)[0].setAttribute('checked', null)
      }
    }
    file_list.forEach(addCheck)
    autoplayCheckbox.forEach(function(index){
      document.getElementById('fr-file-autoplay-button-' + index).checked = true
    })
    getFileThumbnail(i, file)
    hideProgressBar()
    if(editor.opts.toolbarBottom) 
      showInsertPopup(true)
    else
      editor.popups.setPopupDimensions($popup)
      enableDragSort('fr-file-list-item')

  }

  function text_truncate(str, length, ending) {
    if (length == null) {
      length = 100;
    }
    if (ending == null) {
      ending = '...';
    }
    if (str.length > length) {
      return str.substring(0, length - ending.length) + ending;
    } else {
      return str;
    }
  }
  

function getFileThumbnailSrc(type){  
  switch (type){ 

    case 'application/msword': 
      return editor.icon.getFileIcon('docIcon')
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 
      return editor.icon.getFileIcon('docxIcon')
    case 'image/gif': 
      return editor.icon.getFileIcon('gifIcon')
    case 'image/jpeg': 
      return editor.icon.getFileIcon('jpegIcon')
    case 'image/jpeg': 
      return editor.icon.getFileIcon('jpgIcon')
    case 'type/text': 
      return editor.icon.getFileIcon('logIcon')
    case 'video/quicktime': 
      return editor.icon.getFileIcon('movIcon') 
    case 'audio/mp3': 
    case 'audio/mpeg':
      return editor.icon.getFileIcon('mp3Icon')
    case 'video/mp4': 
      return editor.icon.getFileIcon('mp4Icon')
    case 'audio/ogg': 
      return editor.icon.getFileIcon('oggIcon') 
    case 'video/ogg': 
      return editor.icon.getFileIcon('ogvIcon')
    case 'application/pdf': 
      return editor.icon.getFileIcon('pdfIcon')
    case 'image/png': 
      return editor.icon.getFileIcon('pngIcon') 
    case 'text/plain': 
      return editor.icon.getFileIcon('txtIcon')
    case 'video/webm': 
      return editor.icon.getFileIcon('webmIcon')
    case 'image/webp': 
      return editor.icon.getFileIcon('webpIcon')
    case 'video/x-ms-wmv': 
      return editor.icon.getFileIcon('wmvIcon')
    case 'application/vnd.ms-excel': 
      return editor.icon.getFileIcon('xlsIcon')
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 
      return editor.icon.getFileIcon('xlsxIcon')
    case 'application/x-zip-compressed': 
    case 'application/zip': 
      return editor.icon.getFileIcon('zipIcon')

    default:
     return editor.icon.getFileIcon('defaultIcon')
   }  
}
function getFileThumbnail(index, file, update){
    let $popup = editor.popups.get('filesManager.insert')
    let thumbnail = $popup.find('.fr-file-item-icon-' + index).get(0)
    if (isImage(_getFileType(file)) && _getFileType(file) != 'image/gif' && _getFileType(file) != 'image/webp') {
      if (thumbnail.children[0].localName != 'a') {
        thumbnail.innerHTML = `<a target='_blank' href=''>` + thumbnail.innerHTML + `</a>`
      }
      let thumbnailLink = $popup.find('.fr-file-item-icon-' + index).get(0).children[0]
      let thumbnailImage = thumbnailLink.children[0]
      let reader = new FileReader()
      if (update != null && update) {
        let oldImage = file_list.get(index)
        file.name = oldImage.name
        file_list.set(index, file)
      }
      reader.onloadend = function () {
        $popup.find('.fr-file-item-icon-' + index).get(0).children[0].children[0].src = reader.result
        const binary = atob(reader.result.split(',')[1])
        const array = []
        for (let i = 0; i < binary.length; i++) {
          array.push(binary.charCodeAt(i))
        }
        $popup.find('.fr-file-item-icon-' + index).get(0).children[0].href = window.URL.createObjectURL(new Blob([new Uint8Array(array)], {
          type: _getFileType(file)
        }))
        $popup.find('.fr-file-item-icon-' + index).get(0).classList.add('file-item-thumbnail-hover')
      }

      if (file) {
        reader.readAsDataURL(file);
      } else {
        let x = getFileThumbnailSrc(_getFileType(file))
        thumbnail.innerHTML = `<svg height="40px" width="40px" viewBox="0 0 55 5" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        ${x.path}
        </svg>`
      }
    } else {
      let x = getFileThumbnailSrc(_getFileType(file))
      thumbnail.innerHTML = `<svg height="40px" width="40px" viewBox="0 0 55 55" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      ${x.path}
      </svg>`
    }
}


  function getFileActionButtons(i) {
    let fileActionButtons = ''

    if(isVideo(_getFileType(file_list.get(i)))){
      let disableAutoplay = 'fr-files-checkbox'
      let disableAutoplayCheckBox = ''
      if(!isFormatSupported(_getFileType(file_list.get(i)))) {
        disableAutoplay = 'fr-checkbox-disabled'
        disableAutoplayCheckBox = 'disabled'

      }
      const checkmark = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="10" height="10" viewBox="0 0 32 32"><path d="M27 4l-15 15-7-7-5 5 12 12 20-20z" fill="#FFF"></path></svg>'  
      fileActionButtons = `
      <div class="fr-files-checkbox-line align-autoplay">
      <div id="checkbox-key-${i}" class="${disableAutoplay} fr-autoplay-checkbox  fr-checkbox-${i}">  
                   
      <input type="checkbox" id="fr-file-autoplay-button-${i}" class="fr-file-button-${i} fr-file-autoplay-button" data-title="Edit" data-param1="${i}" role="button" ${disableAutoplayCheckBox}/>

      <span>${checkmark} </span>
      </div>      
      <label  class='fr-autoplay-checkbox-label'>Autoplay </label>
      </div>`
    }

    let pdf = 'application/pdf'
    let txt = 'text/plain'
    let doc = 'application/msword'
    let docx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    let xlsx = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    let xls = 'application/vnd.ms-excel'
    let log = 'type/text'

   let disbleView = ''

   
   if(isAudio(_getFileType(file_list.get(i))) || !isFormatSupported(_getFileType(file_list.get(i)))){
    disableEdit = 'fr-disabled'
   }
    
   if(isVideo(_getFileType(file_list.get(i)))){
    disableEdit = 'fr-disabled'
   }
   
 
   if(isFile(_getFileType(file_list.get(i))))

   {
     disableEdit = 'fr-disabled'
    if(_getFileType(file_list.get(i)) == doc ||  _getFileType(file_list.get(i)) == docx )
    {
      if(editor.opts.googleOptions && !editor.helpers.isMobile())

        {
          if( editor.opts.googleOptions.API_KEY && editor.opts.googleOptions.CLIENT_ID ){
          disableEdit = ''
          }
        }
    } 
    
    if(_getFileType(file_list.get(i)) == txt ||  _getFileType(file_list.get(i)) == doc || _getFileType(file_list.get(i)) == pdf || _getFileType(file_list.get(i)) == docx || _getFileType(file_list.get(i)) == xlsx || _getFileType(file_list.get(i)) == xls || _getFileType(file_list.get(i)) == log)

    {
     disbleView = ''
    }
   }
   if (_getFileType(file_list.get(i)) === 'video/url') { 
     disableEdit = 'fr-disabled' 
   }
    fileActionButtons += `<div class='fr-file-item-action-buttons' >
                <button type="button" id="fr-file-insert-button-${i}" class=" fr-doc-edit-${i} fr-img-icon fr-btn fr-command fr-submit fr-file-action-icons 
                fr-file-button-${i} fr-file-insert-button-${i} fr-file-insert-button" data-cmd="imageInsertByUpload" data-title="Insert" data-param1="${i}" tabIndex="2" role="button">
                <svg style='margin:0px !important; opacity:0.9' class = "fr-svg" focusable="false" width="16px" height="16px" viewBox = "-5 0 28 28" xlmns = "http://w3.org/200/svg"><path d = 'M 9.25 12 L 6.75 12 C 6.335938 12 6 11.664062 6 11.25 L 6 6 L 3.257812 6 C 2.703125 6 2.425781 5.328125 2.820312 4.933594 L 7.570312 0.179688 C 7.804688 -0.0546875 8.191406 -0.0546875 8.425781 0.179688 L 13.179688 4.933594 C 13.574219 5.328125 13.296875 6 12.742188 6 L 10 6 L 10 11.25 C 10 11.664062 9.664062 12 9.25 12 Z M 16 11.75 L 16 15.25 C 16 15.664062 15.664062 16 15.25 16 L 0.75 16 C 0.335938 16 0 15.664062 0 15.25 L 0 11.75 C 0 11.335938 0.335938 11 0.75 11 L 5 11 L 5 11.25 C 5 12.214844 5.785156 13 6.75 13 L 9.25 13 C 10.214844 13 11 12.214844 11 11.25 L 11 11 L 15.25 11 C 15.664062 11 16 11.335938 16 11.75 Z M 12.125 14.5 C 12.125 14.15625 11.84375 13.875 11.5 13.875 C 11.15625 13.875 10.875 14.15625 10.875 14.5 C 10.875 14.84375 11.15625 15.125 11.5 15.125 C 11.84375 15.125 12.125 14.84375 12.125 14.5 Z M 14.125 14.5 C 14.125 14.15625 13.84375 13.875 13.5 13.875 C 13.15625 13.875 12.875 14.15625 12.875 14.5 C 12.875 14.84375 13.15625 15.125 13.5 15.125 C 13.84375 15.125 14.125 14.84375 14.125 14.5 Z M 14.125 14.5 '></path></svg>
                </button>

                <button type="button" id="fr-file-edit-button-${i}" class=" fr-doc-edit-${i} ${disableEdit} fr-img-icon fr-btn fr-command fr-submit 
                fr-file-action-icons fr-file-edit-button-${i} fr-file-button-${i} fr-file-edit-button" data-cmd="editImage" data-title="Edit" data-param1="${i}" role="button">
                <svg style='margin:0px !important; opacity:0.9' class = "fr-svg" focusable="false" width="16px" height="16px" viewBox = "0 4 25 25" xlmns = "http://w3.org/200/svg"><path d = 'M17,11.2L12.8,7L5,14.8V19h4.2L17,11.2z M7,16.8v-1.5l5.6-5.6l1.4,1.5l-5.6,5.6H7z M13.5,6.3l0.7-0.7c0.8-0.8,2.1-0.8,2.8,0  c0,0,0,0,0,0L18.4,7c0.8,0.8,0.8,2,0,2.8l-0.7,0.7L13.5,6.3z'></path></svg>
                </button>
                
                <span class="fr-file-view-${i}"><button type="button" id="fr-file-view-button-${i}" class=" fr-doc-edit-${i} ${disbleView} fr-img-icon fr-btn fr-command fr-submit fr-file-action-icons 
                fr-file-view-button-${i} fr-file-view-button" data-cmd="viewImage" data-title="View" data-param1="${i}" tabIndex="2" role="button">
                <svg style='margin:0px !important; opacity:0.9' class = "fr-svg" focusable="false" width="16px" height="16px" viewBox = "15 19 21 21" xlmns = "http://w3.org/200/svg"> <path style="fill:none;stroke-width:0.9077;stroke-linecap:round;stroke-linejoin:round;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 19.086094 16.541466 C 16.185625 16.541466 14.318281 19.447115 14.318281 19.447115 L 14.318281 19.555288 C 14.318281 19.555288 16.176719 22.475962 19.077187 22.475962 C 21.977656 22.475962 23.847969 19.576322 23.847969 19.576322 L 23.847969 19.465144 C 23.847969 19.465144 21.989531 16.541466 19.086094 16.541466 Z M 19.07125 21.024639 C 18.248906 21.024639 17.583906 20.357572 17.583906 19.53726 C 17.583906 18.716947 18.248906 18.04988 19.07125 18.04988 C 19.890625 18.04988 20.555625 18.716947 20.555625 19.53726 C 20.555625 20.357572 19.890625 21.024639 19.07125 21.024639 Z M 19.07125 21.024639 " transform="matrix(1.315789,0,0,1.3,0,0)"/></svg></button></span>

                <button type="button" id="fr-file-delete-button-${i}" class=" fr-doc-edit-${i} fr-img-icon fr-btn fr-command fr-submit fr-file-action-icons
                fr-file-button-${i} fr-file-delete-button" data-cmd="deleteImage" data-title="Delete" data-param1="${i}" role="button">
                <svg style='margin:0px !important; opacity:0.9' class = "fr-svg" focusable="false" width="16px" height="16px" viewBox = "-2 3 30 30" xlmns = "http://w3.org/200/svg"><path d = 'M15,10v8H9v-8H15 M14,4H9.9l-1,1H6v2h12V5h-3L14,4z M17,8H7v10c0,1.1,0.9,2,2,2h6c1.1,0,2-0.9,2-2V8z'></path></svg>
                </button>
                 
            </div>
            <div id="user_area-${i}" style="display: none;">
            
              <div id="file_container"></div>

              <div style='display:block;text-align: center; margin-left:50%; id='edit-file-loader' class='fr-file-loader'></div>

          </div> 
            `
  
    return fileActionButtons
  }
 
  function updateFileUploadingProgress(percent, index, loaded){
    const $popup = editor.popups.get('filesManager.insert')
    if(!loaded && percent <= 100){
      $popup.find('.fr-checkbox-file-'+index).get(0).disabled = true
      $popup.find('.fr-checkbox-'+index).get(0).classList.remove('fr-files-checkbox')
      $popup.find('.fr-checkbox-'+index).get(0).classList.add('fr-checkbox-disabled')
      const row = $popup.find('.fr-file-progress-circle-'+index)
      const progressCircle = $popup.find('.fr-file-upload-percent-'+index)
      if (percent > 50) {
        row.get(0).setAttribute('class', 'fr-file-progress-circle-'+index + ' progress-circle p' + Math.floor(percent) + ' over50');
        progressCircle.get(0).innerHTML = Math.floor(percent) + '%';
      } else {
        row.get(0).setAttribute('class', 'fr-file-progress-circle-'+index + ' progress-circle p' + Math.floor(percent));
        progressCircle.get(0).innerHTML = Math.floor(percent) + '%';
      }
      updateProgressBar(index, percent, loaded)
      return
    }
    if(loaded){
      $popup.find('.fr-checkbox-file-'+index).get(0).disabled = false
      $popup.find('.fr-checkbox-'+index).get(0).classList.remove('fr-checkbox-disabled')
      $popup.find('.fr-checkbox-'+index).get(0).classList.add('fr-files-checkbox')
      const right = $popup.find('.fr-file-item-right-'+index)
      right.get(0).innerHTML = getFileActionButtons(index)
      updateProgressBar(index, 100, loaded)
    }
  }

  function initialFileUploadStatus(index){
    if (isNaN(index)) {
      return
    }
    const $popup = editor.popups.get('filesManager.insert')
    const row = $popup.find('.fr-file-item-right-'+index)
    row.get(0).innerHTML = `<div class='fr-file-item-action-buttons' >
    <button type="button" id="fr-file-cancel-upload-button-${index}" class="fr-img-icon fr-btn fr-command fr-submit fr-file-action-icons 
    fr-file-button-${index} fr-file-cancel-upload-button" data-cmd="cancelUpload" data-title="Cancel" data-param1="${index}" role="button">
    <svg style='margin:0px !important; opacity:0.9' class = "fr-svg" focusable="false" width="16px" height="16px" viewBox = "-2 3 30 30" xlmns = "http://w3.org/200/svg"><path d = 'M13.4,12l5.6,5.6L17.6,19L12,13.4L6.4,19L5,17.6l5.6-5.6L5,6.4L6.4,5l5.6,5.6L17.6,5L19,6.4L13.4,12z'></path></svg>
    </button>

    <button type="button" id="fr-upload-delete-button-${index}" class="fr-img-icon fr-btn fr-command fr-submit fr-file-action-icons 
    fr-file-button-${index} fr-upload-delete-button" data-cmd="deleteUpload" data-title="Delete" data-param1="${index}" role="button">
    <svg style='margin:0px !important; opacity:0.9' class = "fr-svg" focusable="false" width="16px" height="16px" viewBox = "-2 3 30 30" xlmns = "http://w3.org/200/svg"><path d = 'M15,10v8H9v-8H15 M14,4H9.9l-1,1H6v2h12V5h-3L14,4z M17,8H7v10c0,1.1,0.9,2,2,2h6c1.1,0,2-0.9,2-2V8z'></path></svg>
    </button>

    <div class='progress-circle p0 fr-file-progress-circle-${index}'>
                  <span class='fr-file-upload-percent-${index} fr-file-upload-percent'>0%</span>
                  <div class='left-half-clipper'>
                    <div class='first50-bar'></div>
                    <div class='value-bar'></div>
                  </div>
                </div>
            </div>`
    
    fileUploads.set(index,0)
  }

  function updateProgressBar(index, percent, loaded){
    const $popup = editor.popups.get('filesManager.insert')

    $popup.find('.fr-progress-bar').removeClass('fr-none').addClass('fr-display-block')

    if($popup.find('.fr-upload-progress').hasClass('fr-height-set'))
      editor.popups.setFileListHeight($popup)
    
    let totalUploadPercent = 0;
    fileUploads.set(index, percent)
    fileUploads.forEach(function(value, index){
      totalUploadPercent += value
    })
    totalUploadPercent = totalUploadPercent/fileUploads.size
    if(percent == 100 && loaded){
      completedUploads++;
    }
    $popup.find('.fr-command[data-cmd="filesUpload"]').addClass('fr-disabled')
    $popup.find('.fr-command[data-cmd="filesByURL"]').addClass('fr-disabled')
    $popup.find('.fr-command[data-cmd="filesEmbed"]').addClass('fr-disabled')
    $popup.find('.fr-progress-bar').get(0).style.width = totalUploadPercent+'%'
    if(completedUploads == fileUploads.size){
      $popup.find('.fr-progress-bar').removeClass('fr-display-block').addClass('fr-none') 
      fileUploads = new Map()
      completedUploads = 0
      $popup.find('.fr-command[data-cmd="filesUpload"]').removeClass('fr-disabled')
      $popup.find('.fr-command[data-cmd="filesByURL"]').removeClass('fr-disabled')
      $popup.find('.fr-command[data-cmd="filesEmbed"]').removeClass('fr-disabled')
    }
  }

  /**
   * Insert image using URL callback.
   */
  function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }
  function insertByURL() {
    const $popup = editor.popups.get('filesManager.insert')
    const $input = $popup.find('.fr-files-by-url-layer input')
    let urls = $input.val().trim().split(/[ ,]+/)
    let $urls =[]
    let j=0
    for( let i=0; i<urls.length;i++)
    {
      
      if(validURL(urls[i]))
      {
        $urls[j]=urls[i]
        j++
      }
    }
    if($urls.length == 0)
    {
      _showErrorMessage(editor.language.translate('Url entered is invalid. Please try again.'));
      return
    }
    if ($input.val().trim().length > 0 && $urls.length > 0) {
      var files = []
      var files_index = []
      var initial_index = fileListIndex
      var validUrls = $urls.length
      $urls.forEach(function (url, index) {
        if (url.trim().length == 0){
          --validUrls
          if (fileListIndex == initial_index + validUrls) {
            addFilesToList(files, files_index)
          }
        }
        else {
          hideProgressBar()
          showProgressBar()
          _setProgressMessage(editor.language.translate('Loading file(s)'))

          const file_url = url.trim()

          // check if URL is a video
          let video = getVideoByURL(file_url)
          if (video) {
            let obj = {
              link: file_url,
              name: file_url,
              type: 'video/url',
              size: 2,
              video: video
            }
            file_list.set(initial_index + index, obj)
            showFileUploadProgressLayer(initial_index + index)
            hideProgressBar()
            showProgressBar()
            _setProgressMessage(editor.language.translate('Loading file(s)'))
            file_list_values.set(initial_index + index, obj)
            ++fileListIndex
            if (fileListIndex == initial_index + validUrls) {
              addFilesToList(files, files_index)
            }
          } else {
            const xhr = new XMLHttpRequest()
            xhr.onload = function () {

              if (this.status == 200) {
                let file = new Blob([this.response], {
                  type: this.response.type || ''
                })
                file.name = getUrlFileName(file_url)
                file.link = file_url
                if (isImage(this.response.type)) {
                  file.sanitize = true
                  file.existing_image = $current_image
                } else if (isFile(this.response.type)) {
                  file.text = getUrlFileName(file_url)
                }
                files.push(file)
                files_index.push(initial_index + index)
                file_list.set(initial_index + index, file)
                showFileUploadProgressLayer(initial_index + index)
                if(unsupported_file_types.indexOf(_getFileType(file)) > -1 || !_getFileType(file)){
                  _throwError(BAD_FILE_TYPE, null, null, initial_index + index)
                }
              } else {
                let file = new Blob([this.response], {
                  type: this.response.type || ' '
                })
                file.name = getUrlFileName(file_url)
                file.link = file_url
                file_list.set(initial_index + index, file)
                showFileUploadProgressLayer(initial_index + index)
                _throwError(BAD_LINK, this.response, $current_image, initial_index + index)
              }
              hideProgressBar()
              showProgressBar()
              _setProgressMessage(editor.language.translate('Loading file(s)'))
              ++fileListIndex
              if (fileListIndex == initial_index + validUrls) {
                addFilesToList(files, files_index)
              }
            }

            // If file couldn't be uploaded, insert as it is.
            xhr.onerror = function () {
              let obj = {
                link: file_url,
                name: getUrlFileName(file_url),
                size: 0,
                type: ''
              }
              _throwError(ERROR_LINK, this.response, $current_image, initial_index + index)
              let file_index = fileListIndex
              file_list.set(file_index, obj)
              showFileUploadProgressLayer(file_index)
              hideProgressBar()
              showProgressBar()
              _setProgressMessage(editor.language.translate('Loading file(s)'))
              ++fileListIndex
              if (fileListIndex == initial_index + validUrls) {
                addFilesToList(files, files_index)
              }
            }

            xhr.open('GET', `${editor.opts.imageCORSProxy}/${file_url}`, true)
            xhr.responseType = 'blob'

            xhr.send()
          }
        }
      });
      $input.val('')
      $input.blur()
    }
  }
    
  function addFilesToList(files, files_index) {
    hideProgressBar()
    let $popup = editor.popups.get('filesManager.insert')
    $popup.find('.fr-upload-progress-layer').addClass('fr-active')
    files.forEach(function (file, i) {
      // If image needs to be uploaded
      if (isImage(_getFileType(file)) && editor.opts.imageUploadRemoteUrls && editor.opts.imageCORSProxy && editor.opts.imageUpload) {
        upload(file, files, $current_image, files_index[i])
      } else {
        file_list_values.set(files_index[i], file)
      }
    })
  }

  function getVideoByURL(link) {
    if (typeof link == 'undefined') {
      return link
    }

    let video = null

    if (!/^http/.test(link)) {
      link = `https://${link}`
    }

    if (editor.helpers.isURL(link)) {
      for (let i = 0; i < FE.VIDEO_PROVIDERS.length; i++) {
        const vp = FE.VIDEO_PROVIDERS[i]

        // Check if video provider is allowed.
        if (vp.test_regex.test(link) && (new RegExp(editor.opts.videoAllowedProviders.join('|'))).test(vp.provider)) {
          video = link.replace(vp.url_regex, vp.url_text)
          video = vp.html.replace(/\{url\}/, video)
          break
        }
      }
    }
    return video
  }

  function _editImg($img) {
    _edit.call($img.get(0))
  }

  function viewImage(index) {
    if(!isFormatSupported(_getFileType(file_list_values.get(index)))){
      let link = file_list_values.get(index).link
      let text = file_list_values.get(index).link
      if(file_list.get(index) && file_list.get(index).name){
        text = file_list.get(index).name
      } else if(file_list_values.get(index).text){
        text = file_list_values.get(index).text
      }
      if(link.indexOf('blob:') === 0 && editor.browser.msie && window.navigator && window.navigator.msSaveBlob){
        window.navigator.msSaveBlob(file_list.get(index), text);
      }
      else{
        let el = document.createElement('a');
        el.href = link;
        el.download = text;
        el.click()
      }
      return false
    }
    let $popup = editor.popups.get('filesManager.insert')
    if ($popup.find('.fr-file-view-image-' + index).length > 0) {
      $popup.find('.fr-file-view-image-' + index)[0].remove()
    } else {
      const viewImages = $popup.find('.fr-file-view')
      for (let i = 0; i < viewImages.length; i++) {
        viewImages.get(i).remove()
      }
      let imageView = $popup.find('.fr-file-view-' + index)

      if (isImage(_getFileType(file_list_values.get(index)))) {

        let image = `<div class="fr-file-view-modal">
              <div class="fr-file-view-modal-content">
              <div class="fr-file-view-close">&times;</div> 
                <img src="` + file_list_values.get(index).link + `" class ='fr-file-view-image'/>
                </div>
              </div>`
        imageView[0].innerHTML = image + imageView[0].innerHTML

      } else if (isVideo(_getFileType(file_list_values.get(index)))) {

        let image
        if (file_list_values.get(index).hasOwnProperty('video')) {
          let videoIframe = file_list_values.get(index).video.substring(file_list_values.get(index).video.indexOf('src') + 3)
          let url = videoIframe.substring(videoIframe.indexOf('"') + 1)
          url = url.substring(0, url.indexOf('"'))
          let autoplayURL = url + '&autoplay=1'
          image = `<div class="fr-file-view-modal">
        <div class="fr-file-view-modal-content ">
          <div class="fr-file-view-close">&times;</div> 
          <iframe width="640" height="360" src="${autoplayURL}" frameborder="0" class = "fr-file-view-image"></iframe>
        </div>
      </div>`
        } else {
          image = `<div class="fr-file-view-modal">
          <div class="fr-file-view-modal-content ">
            <div class="fr-file-view-close">&times;</div> 
            <video controls src="` + file_list_values.get(index).link + `"  class ='fr-file-view-image' autoplay></video>
          </div>
        </div>`
        }
        imageView[0].innerHTML = image + imageView[0].innerHTML

      } else if (isAudio(_getFileType(file_list_values.get(index)))) {

        let image = `<div class="fr-file-view-modal">
        <div class="fr-file-view-modal-content ">
          <div  class="fr-file-view-close">&times;</div> 
          <audio controls="controls"  class ='fr-file-view-image' autoplay>

          <source src="${file_list_values.get(index).link}" type="${_getFileType(file_list_values.get(index))}" />

            Your browser does not support the audio element.
          </audio>
        </div>
      </div>`
        imageView[0].innerHTML = image + imageView[0].innerHTML

      } else if (isFile(_getFileType(file_list_values.get(index)))) {

        let link = file_list_values.get(index).link
        let text = file_list_values.get(index).text
        if (link.endsWith('.pdf') || link.endsWith('.txt')) {
          let image = `<div class="fr-file-view-modal">	
              <div class="fr-file-view-modal-content " >	
              <div class="fr-file-view-close">&times;</div> 	
              <iframe src="${link}" style='background-color: white;' height='50%' width='50%' title="${text}" class="fr-file fr-file-view-image"></iframe>	
            </div>	
            </div>`
          imageView[0].innerHTML = image + imageView[0].innerHTML
        } else {
          if(link.indexOf('blob:') === 0 && editor.browser.msie && window.navigator && window.navigator.msSaveBlob){
            window.navigator.msSaveBlob(file_list.get(index), text);
          }
          else{
            let el = document.createElement('a');
            el.href = link;
            el.download = text;
            el.click()
          }
        }
      }
    }
  }

  function _loadedCallback() {
    const $img = $(this)

    $img.removeClass('fr-uploading')

    // Select the image.
    if ($img.next().is('br')) {
      $img.next().remove()
    }

    if(fileKeys.length == 0 || (fileKeys.length > 0 && fileKeys.length == imageEditIndex)){
      editImageValue = $img
    }
    if($img.get(0).tagName == 'VIDEO' || $img.get(0).tagName == 'AUDIO') {
      editor.selection.setAfter($img.parent())
    }
    else {
      editor.selection.setAfter($img)
    }

    editor.undo.saveStep()
    editor.events.trigger('filesManager.loaded', [$img])
    insertFiles(fileKeys)
  }

   /**
   * Keep videos in sync when content changed.
   */
  let videos 

  function _syncVideos() {

    // Get current videos.
    const c_videos = Array.prototype.slice.call(editor.el.querySelectorAll('video, .fr-video > *')) 

    // Current videos src.
    const video_srcs = [] 
    let i 

    for (i = 0; i < c_videos.length; i++) {
      video_srcs.push(c_videos[i].getAttribute('src')) 

      $(c_videos[i]).toggleClass('fr-draggable', editor.opts.videoMove) 

      if (c_videos[i].getAttribute('class') === '') c_videos[i].removeAttribute('class') 

      if (c_videos[i].getAttribute('style') === '') c_videos[i].removeAttribute('style') 
    }

    // Loop previous videos and check their src.
    if (videos) {
      for (i = 0; i < videos.length; i++) {
        if (video_srcs.indexOf(videos[i].getAttribute('src')) < 0) {
          editor.events.trigger('video.removed', [$(videos[i])]) 
        }
      }
    }

    // Current videos are the old ones.
    videos = c_videos 
  }


  let files

  function _syncFiles() {

    // Get current files.
    const c_files = Array.prototype.slice.call(editor.el.querySelectorAll('a.fr-file'))

    // Current files src.
    const file_srcs = []
    let i

    for (i = 0; i < c_files.length; i++) {
      file_srcs.push(c_files[i].getAttribute('href'))
    }

    // Loop previous files and check their src.
    if (files) {
      for (i = 0; i < files.length; i++) {
        if (file_srcs.indexOf(files[i].getAttribute('href')) < 0) {
          editor.events.trigger('file.unlink', [files[i]])
        }
      }
    }

    // Current files are the old ones.
    files = c_files
  }

  /**
   * Insert all files into the editor.
   */

   function insertAllFiles()
   {
    fileKeys = []
    const $popup = editor.popups.get('filesManager.insert')  
    function insertMapElements(el, index, map) {      
      if(el.children['target'].checked)
        {
          fileKeys.push(parseInt(el.id.split('-').pop()))
          if(isImage(file_list_values.get(parseInt(el.id.split('-').pop())).type) && imageEditIndex == -1){
            imageEditIndex = index
          }
        }
     }
     imageEditIndex = -1
     editImageValue = null
     $popup.find('.fr-insert-checkbox').toArray().forEach(insertMapElements)
     insertFiles(fileKeys)
    checkInsertAllState()
  }

   /**
   * Delete all files.
   */

  function deleteAllFiles()
  {
   const $popup = editor.popups.get('filesManager.insert')  
   function deleteMapElements(el, index, map) {
     if(el.children['target'].checked)
       {
         let fileIndex = parseInt(el.id.split('-').pop())
         if(XMLHttpRequests.has(fileIndex)){
          XMLHttpRequests.delete(fileIndex)
         }
         deleteFile(fileIndex)
       }
    }
    $popup.find('.fr-insert-checkbox').toArray().forEach(deleteMapElements)
    checkInsertAllState()
  }

   function insertFiles(fileKeys){
     if(fileKeys != null){
     if(fileKeys.length == 0){
       if(editImageValue != null){
         if(editImageValue.get(0).tagName == 'VIDEO'){
           editor.video._editVideo(editImageValue.parent())
         }
         else if(editImageValue.get(0).tagName == 'IMG'){
          editor.image.edit(editImageValue)
         }
         else{
           editImageValue.trigger('click')
         }
         editor.toolbar.disable()
        } 
        return
      }
        let index = fileKeys.shift()
        insert(index, fileKeys)
      }
    }
    
  function isChildWindowOpen() {
    return $child_window_open
  }

  function setChildWindowState(childWindowState) {
    if(childWindowState !== undefined) {
      $child_window_open = childWindowState
    }    
  }
 // file edit task starts

 var docEditor;  

 function loadScripts(array,callback){
   var loader = function(src,handler){
       var script = document.createElement("script");
       script.src = src;
       script.onload = function() { 
         this.onload=function(){};docEditor.handleClientLoad();
       }
       script.onreadystatechange = function(){
         if (this.readyState === 'complete') this.onload();
       }
       var head = document.getElementsByTagName("head")[0];
       (head || document.body).appendChild( script );
   };
   (function run(){
       if(array.length!=0){
           loader(array.shift(), run);
       }else{
           callback && callback();
       }
   })();
}

  /**
   * Edit Image
   */
  function editImage(index) {
    let isChildWindowTriggered = false

    if (isVideo(_getFileType(file_list_values.get(index)))) {
      editor.trimVideoPlugin.trimVideo(file_list.get(index), index,file_list);
      isChildWindowTriggered = true
    }else if(isImage(_getFileType(file_list_values.get(index)))){

      let src = file_list_values.get(index).link;
      const image = editor.o_doc.createElement('img');
      image.src = src;
      $current_image = image;
      $current_image_index = index;
      editor.imageTUI.launch(editor, false, index);
      isChildWindowTriggered = true

    }else if(isFile(_getFileType(file_list_values.get(index)))){

      
    var options={
      apiKey: editor.opts.googleOptions.API_KEY, // google developer console API Key
      clientId:editor.opts.googleOptions.CLIENT_ID, // google developer client ID
      authorizeButton: `authorize_button-${index}`, // authorize in Google button element ID
      signoutButton: 'signout_button', // sign out button element ID
      userArea: `user_area-${index}`, // authorized user HTML container element ID 
      fileInput: 'file_input', // file upload input ID
      fileIndex: index, // created
      file: file_list.get(index), // created//, type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      fileContainer: 'file_container', // HTML container ID for file editor 
      loadingText: 'File is being uploaded...', // text that shown while file is loaded
      events: {
        onInvalidFile: function(text){console.log(text);}, // fired if file is not uploaded or not supported (supported files are .DOC and .DOCX)
        onError: function(error){console.log(error);} // fired in case of any other errors
      }
   }   
    docEditor = googleDocEditor(options);
         loadScripts([
        "https://apis.google.com/js/api.js"
     ],function(){
         console.log('All things are loaded');
     });
    }
    if (isChildWindowTriggered) {
      $child_window_open = true
    } 
  }

  /**GoogleDocEdit Code */
  function googleDocEditor(options){

    // Array of API discovery doc URLs for APIs used by the quickstart
    var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v2/rest"];
    // Authorization scopes required by the API; multiple scopes can be
    // included, separated by spaces.
    var SCOPES = 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata';
    var DEFAULT_FIELDS = 'id,title,mimeType,userPermission,editable,copyable,shared,fileSize';
    var BOUNDARY = '-------314159265358979323846';
    var DELIMITER = "\r\n--" + BOUNDARY + "\r\n";
    var CLOSE_DELIMITER = "\r\n--" + BOUNDARY + "--";
    var ALLOWED_FILES = ['doc', 'docx'];
    var authorizeButton = document.getElementById(options.authorizeButton);
    var userArea = document.getElementById(options.userArea);
    var fileIndex = fileIndex; //created
    var responseFileId; //created
    
    if (!options.events) {
      options.events = {};
    }
    
    options.events.onInvalidFile = options.events.onInvalidFile || function(text){console.log(text);};
    options.events.onError = options.events.onError || function(text){console.log(text);};
    /**
        *  Initializes the API client library and sets up sign-in state
        *  listeners.
        */
    function initClient() {
      gapi.client.init({
        apiKey: options.apiKey,
        clientId: options.clientId,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
          }).then(function () {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
            // Handle the initial sign-in state.
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            handleAuthClick();
          }, function(error) {
          options.events.onError(error);
          });
      }

  /**
       *  Called when the signed in status changes, to update the UI
       *  appropriately. After a sign-in, the API is called.
       */
    function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
         userArea.style.display = 'block';
        } 
      }

    /**
      *  Sign in the user upon button click.
      */
    function handleAuthClick(event) {
      if(!gapi.auth2.getAuthInstance().isSignedIn.get() || (gapi.auth.getToken() !== undefined && gapi.auth.getToken().access_token === undefined)){ 
        Promise.resolve(gapi.auth2.getAuthInstance().signIn()).then(function(){
        handleFileUpload();
      })}
      else{
        handleFileUpload();
      }
     
    }

    /**
      *  Sign out the user upon button click.
      */
    function handleSignoutClick(event) {
      var accessToken = gapi.auth.getToken().access_token;
      var id = responseFileId;
      var url = "https://docs.google.com/feeds/download/documents/export/Export?id=" + id + "&format=docx&access_token=" + accessToken;
      var xhr = new XMLHttpRequest();
      xhr.open('get', url);
      xhr.responseType = "arraybuffer";
      xhr.onload = function() {   
        var link =new Blob([new Uint8Array(this.response)], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });

        const currentFile=file_list.get(options.fileIndex)
        link.name = currentFile.name;
        link.lastModified = currentFile.lastModified;
        link.lastModifiedDate = currentFile.lastModifiedDate;
        file_list.set(options.fileIndex, link);
        editor.filesManager.upload(
          link,
          file_list_values,
          $current_image,
          options.fileIndex
          ); 
          closeEditDocContainer();
        };
      xhr.send();
    return
  }
    
    /**
      * Handles file uploaded event
      */
    function handleFileUpload(event) {
      disableOnEdit(options.fileIndex)
      var file = options.file; //created
      if (!file) {
        options.events.onInvalidFile("File is not selected");
        return;
      }
      saveSingleFile(file, showEditableDoc);
    };
  
    /**
      * Shows google doc in iframe
      */
    function showEditableDoc(doc) {
      responseFileId = doc.id; //created
      var googleDocUrl = 'https://docs.google.com/document/d/' + doc.id +'/edit';     
      const body = editor.o_doc.body;
      const editDocContainer = editor.o_doc.createElement('div');
      editDocContainer.setAttribute('id', 'editDocContainer');
      editDocContainer.style.cssText ='position: fixed; top: 0;left: 0;padding: 0;width: 100%;height: 100%;background: rgba(255,255,255,1);z-index: 9998;display:block';
     // margin-top is given for wordpress-framework
      editDocContainer.innerHTML = '<div style="margin-top:25px; text-align:center"><label>Sign Out : </label><input type="checkbox" id ="markSignOut" role="button"/>  <button id="signout_button"  class="fr-trim-button" >Save </button> <button id="cancel_file_edit" class="fr-trim-button">Cancel</button></div>  <iframe title="Edit your file" frameBorder="0" width="100%" height="700px" src="' + googleDocUrl + '"></iframe>';
      body.appendChild(editDocContainer);     
      document.getElementById('signout_button').onclick=handleSignoutClick;
      document.getElementById('cancel_file_edit').onclick=closeEditDocContainer;
     
    }
    function closeEditDocContainer(){
      document.getElementById('markSignOut').checked && gapi.auth2.getAuthInstance().signOut().then(function(){ 
        if (gapi.auth.getToken()) {
          gapi.auth.getToken().access_token = undefined;
          }
         });
      let container = document.getElementById('editDocContainer');
      container.parentNode.removeChild(container);
      if(document.getElementById(`user_area-${options.fileIndex}`))
       document.getElementById(`user_area-${options.fileIndex}`).style.display = 'none';
      enableAfterEdit(options.fileIndex);

    }
      /**
      * Saves file to google drive
      */	
    function saveSingleFile(file, callback) {
      var reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = function(e) {
        var contentType = 'application/vnd.google-apps.document';
        var metadata = {
          'title': file.name,
          'mimeType': contentType
        };
        var binary = '';
          var bytes = new Uint8Array( reader.result );
          var len = bytes.byteLength;
          for (var i = 0; i < len; i++) {
              binary += String.fromCharCode(bytes[i]);
          }
        var base64Data = btoa(binary);
        var multipartRequestBody =
          DELIMITER +
          'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
          JSON.stringify(metadata) +
          DELIMITER +
          'Content-Type: ' + 'application/octet-stream' + '\r\n' +				
          'Content-Transfer-Encoding: base64\r\n' +
          '\r\n' +
          base64Data +
          CLOSE_DELIMITER;
                
        var request = gapi.client.request({
          'path': '/upload/drive/v2/files',
          'method': 'POST',
          'params': {
            'uploadType': 'multipart',
            'fields': DEFAULT_FIELDS
          },
          'headers': {
            'Content-Type': 'multipart/related; boundary="' + BOUNDARY + '"',
            'Content-Length': multipartRequestBody.Length
          },
          'body': multipartRequestBody
        });
        if (!callback) {
          callback = function(file) {
            console.log(file);
          };
        }
        request.execute(function(doc, resp) {
          if (!doc.error) {
            callback(doc);
          } else {
            options.events.onError(doc.error);
          }
          
        });
      }
      };
      
    var docEditor = {};
    docEditor.handleClientLoad = function() {
      gapi.load('client:auth2', initClient);
       };
    return docEditor;
  }

  function disableOnEdit(index){
    const buttons = document.getElementsByClassName(`fr-doc-edit-${index}`);
    for(var i = 0; i < buttons.length; i++){
      buttons[i].setAttribute('disabled',true)
      buttons[i].classList.add('fr-disabled')
    }
  }

  function enableAfterEdit(index){

    const buttons = document.getElementsByClassName(`fr-doc-edit-${index}`);
    for(var i = 0; i < buttons.length; i++){
      buttons[i].removeAttribute('disabled')
      buttons[i].classList.remove('fr-disabled')
    }
  }
 

  function saveImage($img) {
    let obj = file_list_values.get($current_image_index);
    obj.link = window.URL.createObjectURL(
      new Blob($img, { type: 'image/png' })
    );
    file_list_values.set($current_image_index, obj);
  }

  /*
  * Get file.type for machines which do not return type by default.
  */
  function _getFileType (file)
  {

    let fileTypeMap = [['.doc', 'application/msword'], ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], ['.gif', 'image/gif'], ['.jpeg', 'image/jpeg'], ['.jpg', 'image/jpeg'], ['.txt', 'text/plain'], ['.log', 'type/text'], ['.mov', 'video/quicktime'], ['.mp3', 'audio/mpeg'], ['.mp4', 'video/mp4'], ['.ogg', 'audio/ogg'], ['.ogv', 'video/ogg'], ['.pdf', 'application/pdf'], ['.png', 'image/png'], ['.webm', 'video/webm'], ['.webp', 'image/webp'], ['.wmv', 'video/x-ms-wmv'], ['.xls', 'application/vnd.ms-excel'], ['.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'], ['.zip', 'application/x-zip-compressed']];


    if(file.type == "")
    {
      let re = /(?:\.([^.]+))?$/;
      let ext = re.exec(file.name)[1];
      let fileType
      fileTypeMap.forEach(function(value, index){
        if(value[0] == `.${ext}`){
          fileType = value[1];
        }
      })
      return fileType
    }
    return file.type
  }

  /**
   * Insert image into the editor.
   */

  function insert(index, fileKeys) {
    if (isFile(_getFileType(file_list_values.get(index))) || !isFormatSupported(_getFileType(file_list_values.get(index)))) {
      let link = file_list_values.get(index).link
      let text = file_list_values.get(index).text
      if(!text && file_list.get(index) && file_list.get(index).name){
        text = file_list.get(index).name
      }
       let response = file_list_values.get(index).response
      editor.edit.on()

      // Focus in the editor.
      editor.events.focus(true)
      editor.selection.restore()

      if (editor.opts.fileUseSelectedText && editor.selection.text().length) {
        text = editor.selection.text()
      }

      if (link.endsWith('.pdf') || link.endsWith('.txt')) {
        let code = `<iframe src="${link}" title="${text}" width="”100%”" height="”100%”" class="fr-file"></iframe>`
        insertEmbeddedFile(code, true)
      } else {
        editor.html.insert(`<a href="${link}" target="_blank" id="fr-inserted-file" class="fr-file">${text}</a>`)
      }
      // Get the file.
      const $file = editor.$el.find('#fr-inserted-file')

      $file.removeAttr('id')

      editor.undo.saveStep()

      _syncFiles()
      editor.selection.clear()
      editor.selection.setAfter($file)

      editor.events.trigger('file.inserted', [$file, response])    
      insertFiles(fileKeys)
    }


    if (isImage(_getFileType(file_list_values.get(index))) && isFormatSupported(_getFileType(file_list_values.get(index)))) {

      let link = file_list_values.get(index).link;
      let sanitize = file_list_values.get(index).sanitize;
      let data = file_list_values.get(index).data;
      let $existing_img = file_list_values.get(index).$existing_img;
      let response = file_list_values.get(index).response;

    if ($existing_img && typeof $existing_img === 'string') {
      $existing_img = editor.$($existing_img)
    }

    editor.edit.off()
    _setProgressMessage(editor.language.translate('Loading image'))

    if (sanitize) link = editor.helpers.sanitizeURL(link)

    const image = new Image()

    image.onload = function () {
      let $img
      let attr

      if ($existing_img) {
        if (!editor.undo.canDo() && !$existing_img.hasClass('fr-uploading')) editor.undo.saveStep()

        let old_src = $existing_img.data('fr-old-src')

        if ($existing_img.data('fr-image-pasted')) {
          old_src = null
        }

        if (editor.$wp) {

          // Clone existing image.
          $img = $existing_img.clone()
            .removeData('fr-old-src')
            .removeClass('fr-uploading')
            .removeAttr('data-fr-image-pasted')

          // Remove load event.
          $img.off('load')

          // Set new SRC.
          if (old_src) $existing_img.attr('src', old_src)

          // Replace existing image with its clone.
          $existing_img.replaceWith($img)

        }
        else {
          $img = $existing_img
        }

        // Remove old data.
        const atts = $img.get(0).attributes

        for (let i = 0; i < atts.length; i++) {
          const att = atts[i]

          if (att.nodeName.indexOf('data-') === 0) {
            $img.removeAttr(att.nodeName)
          }
        }

        // Set new data.
        if (typeof data != 'undefined') {
          for (attr in data) {
            if (data.hasOwnProperty(attr)) {
              if (attr != 'link') {
                $img.attr(`data-${attr}`, data[attr])
              }
            }
          }
        }

        $img.on('load', _loadedCallback)
        $img.attr('src', link)
        editor.edit.on()
        editor.undo.saveStep()

        // Cursor will not appear if we don't make blur.
        editor.events.disableBlur()
        editor.$el.blur()
        editor.events.trigger(old_src ? 'image.replaced' : 'image.inserted', [$img, response])
      }
      else {
        $img = _addImage(link, data, _loadedCallback)
        editor.undo.saveStep()

        // Cursor will not appear if we don't make blur.
        editor.events.disableBlur()
        editor.$el.blur()
        editor.events.trigger('image.inserted', [$img, response])
      }
    }

    image.onerror = function () {
      _throwError(BAD_LINK, null, null, index)
      insertFiles(fileKeys)
    }
    image.src = link
    }


    if ((isVideo(_getFileType(file_list_values.get(index))) || isAudio(_getFileType(file_list_values.get(index)))) && isFormatSupported(_getFileType(file_list_values.get(index)))) {
      current_index=index
      if (_getFileType(file_list_values.get(index)) == 'video/url') {


        let video_autoplay = false
        if (document.getElementById('fr-file-autoplay-button-' + index) !== undefined) {
          video_autoplay = document.getElementById('fr-file-autoplay-button-' + index).checked
        }
        if (video_autoplay && file_list_values.get(index) !== undefined && file_list_values.get(index).video.indexOf('iframe') > -1 
          && file_list_values.get(index).video.indexOf('autoplay=1') < 0) {
        
          let url = file_list_values.get(index).video.substring(file_list_values.get(index).video.indexOf('src') + 3)
          url = url.substring(url.indexOf('"') + 1)
          url = url.substring(0, url.indexOf('"'))
          let appendSymbol = '&'
          if (url.indexOf('?') < 0) {
            appendSymbol = '?'
          }

          file_list_values.get(index).video = file_list_values.get(index).video.replace(url, (url += appendSymbol + 'autoplay=1'))             
        }
        else if(!video_autoplay && file_list_values.get(index).video.indexOf('iframe' > -1)) {
          if (file_list_values.get(index).video.indexOf('&autoplay=1') > -1) {
            file_list_values.get(index).video = file_list_values.get(index).video.replace('&autoplay=1', '')
          }

          if (file_list_values.get(index).video.indexOf('?autoplay=1') > -1) {
            file_list_values.get(index).video = file_list_values.get(index).video.replace('?autoplay=1', '')
          }
        }

        // Make sure we have focus.
        editor.events.focus(true)
        editor.selection.restore()

        editor.html.insert(`<span contenteditable="false" draggable="true" class="fr-jiv fr-video fr-deletable">${file_list_values.get(index).video}</span>`, false, editor.opts.videoSplitHTML)
        
        editor.popups.hide('filesManager.insert')

        const $video = editor.$el.find('.fr-jiv')
        $video.removeClass('fr-jiv')
        $video.toggleClass('fr-rv', editor.opts.videoResponsive)

        _setVideoStyle($video, editor.opts.videoDefaultDisplay, editor.opts.videoDefaultAlign)

        $video.toggleClass('fr-draggable', editor.opts.videoMove)
        
        editor.events.trigger('video.inserted', [$video])
        _loadedCallback.call($video)
      }
        else {
          let link = file_list_values.get(index).link;
          let sanitize = file_list_values.get(index).sanitize;
          let data = file_list_values.get(index).data;
          let $existing_video = file_list_values.get(index).$existing_img;
          let response = file_list_values.get(index).response;
          editor.edit.off()
    
          if (sanitize) link = editor.helpers.sanitizeURL(link)
    
          const _add = function () {
            let $video
            let attr
    
            if ($existing_video) {
              if (!editor.undo.canDo() && !$existing_video.find('video').hasClass('fr-uploading')) editor.undo.saveStep()
    
              const old_src = $existing_video.find('video').data('fr-old-src')
    
              const replaced = $existing_video.data('fr-replaced')
              $existing_video.data('fr-replaced', false)
    
              if (editor.$wp) {
    
                // Clone existing video.
                $video = $existing_video.clone(true)
                $video.find('video').removeData('fr-old-src').removeClass('fr-uploading')
    
                // Remove load event.
                $video.find('video').off('canplay')
    
                // Set new SRC.
                if (old_src) $existing_video.find('video').attr('src', old_src)
    
                // Replace existing video with its clone.
                $existing_video.replaceWith($video)
              }
              else {
                $video = $existing_video
              }
    
              // Remove old data.
              const atts = $video.find('video').get(0).attributes
    
              for (let i = 0; i < atts.length; i++) {
                const att = atts[i]
    
                if (att.nodeName.indexOf('data-') === 0) {
                  $video.find('video').removeAttr(att.nodeName)
                }
              }
    
              // Set new data.
              if (typeof data != 'undefined') {
                for (attr in data) {
                  if (data.hasOwnProperty(attr)) {
                    if (attr != 'link') {
                      $video.find('video').attr(`data-${attr}`, data[attr])
                    }
                  }
                }
              }
    
              $video.find('video').on('canplay', _loadedCallback)
              $video.find('video').attr('src', link)
              editor.edit.on()
              _syncVideos()
              editor.undo.saveStep()
    
              // Cursor will not appear if we don't make blur.
              editor.$el.blur()
    
              editor.events.trigger(replaced ? 'video.replaced' : 'video.inserted', [$video, response])
            }
            else {

              $video = _addVideo(link, data, _loadedCallback, _getFileType(file_list_values.get(index)) ,index)

              _syncVideos()
              editor.undo.saveStep()
              editor.events.trigger('video.inserted', [$video, response])
              }
          }
          _add()
        }
    }
    editor.popups.hide('filesManager.insert')
    checked_files.delete(index)
    const $popup = editor.popups.get('filesManager.insert')
    $popup.find(`input.fr-insert-attr.fr-checkbox-file-${index}`)[0].checked = false
    $popup.find(`.fr-file-` + index).get(0).classList.add('fr-unchecked')
    checkInsertAllState();
    if (document.getElementById('fr-file-autoplay-button-' + index)) {
      document.getElementById('fr-file-autoplay-button-' + index).checked = false
    }
    autoplayCheckbox = autoplayCheckbox.filter(function (i){
      return i != index
    })
  }

  function _setVideoStyle($video, _display, _align) {
    if (!editor.opts.htmlUntouched && editor.opts.useClasses) {
      $video.removeClass('fr-fvl fr-fvr fr-dvb fr-dvi') 
      $video.addClass(`fr-fv${_align[0]} fr-dv${_display[0]}`) 
    }
    else {
      if (_display == 'inline') {
        $video.css({
          display: 'inline-block'
        })

        if (_align == 'center') {
          $video.css({
            'float': 'none'
          })
        }
        else if (_align == 'left') {
          $video.css({
            'float': 'left'
          })
        }
        else {
          $video.css({
            'float': 'right'
          })
        }
      }
      else {
        $video.css({
          display: 'block',
          clear: 'both'
        })

        if (_align == 'left') {
          $video.css({
            textAlign: 'left'
          })
        }
        else if (_align == 'right') {
          $video.css({
            textAlign: 'right'
          })
        }
        else {
          $video.css({
            textAlign: 'center'
          })
        }
      }
    }
  }


  /* insert Embed 
  */

 function insertEmbeddedFile(embedded_code, file) {
   let type
   let fileSplitHTML
   if (FE.VIDEO_EMBED_REGEX.test(embedded_code)) {
     type = 'video'
     fileSplitHTML = editor.opts.videoSplitHTML
   } else if (FE.IMAGE_EMBED_REGEX.test(embedded_code)) {
     type = 'image'
     fileSplitHTML = editor.opts.imageSplitHTML
   }
   // Make sure we have focus.
   editor.events.focus(true)
   editor.selection.restore()

   // Flag to tell if the video is replaced.
   let replaced = false

   // If current video found we have to replace it.
   if ($current_image) {

     // Remove the old video.
     remove()

     // Mark that the video is replaced.
     replaced = true
   }
   editor.html.insert(`<span id="fr-inserted-file" contenteditable="true" draggable="true" class="fr-${type} fr-jiv fr-deletable">${embedded_code}</span>`, false, fileSplitHTML)

   // add the below code for image as well
   editor.popups.hide('filesManager.insert')

   const $file = editor.$el.find('.fr-jiv')
   $file.removeClass('fr-jiv')

   if (type == 'video') {

     $file.toggleClass('fr-rv', editor.opts.videoResponsive)

     _setStyleVideo($file, editor.opts.videoDefaultDisplay, editor.opts.videoDefaultAlign)

     $file.toggleClass('fr-draggable', editor.opts.videoMove)

     editor.events.trigger(replaced ? 'video.replaced' : 'video.inserted', [$file])
   }

   if (type == 'image') {

     _setStyleImage($file, editor.opts.imageDefaultDisplay, editor.opts.imageDefaultAlign)

     $file.find('img').removeClass('fr-dii')

     $file.find('img').addClass('fr-dib')

     $file.toggleClass('fr-draggable', editor.opts.imageMove)

     editor.events.trigger(replaced ? 'image.replaced' : 'image.inserted', [$file])
   }
   if(file)
   {
    editImageValue = $file
    editor.selection.clear()
    editor.toolbar.disable()
    editor.video._editVideo(editImageValue)
   }   
 }

  function _addVideo(link, data, loadCallback, type,index) {

    // Build video data string.
    let data_str = ''
    let attr

    if (data && typeof data != 'undefined') {
      for (attr in data) {
        if (data.hasOwnProperty(attr)) {
          if (attr != 'link') {
            data_str += ` data-${attr}="${data[attr]}"`
          }
        }
      }
    }

    let { videoDefaultWidth: width } = editor.opts

    if (width && width != 'auto') {
      width = `${width}px`
    }
    let $video
    if (isAudio(type)) {
      // https://github.com/froala-labs/froala-editor-js-2/issues/2810
      // Create audio object and set the load event.
      $video = $(document.createElement('span')).attr('contenteditable', 'false').attr('draggable', 'true').attr('class', 'fr-video fr-dv' + (editor.opts.videoDefaultDisplay[0]) + (editor.opts.videoDefaultAlign != 'center' ? ' fr-fv' + editor.opts.videoDefaultAlign[0] : '')).html('<audio src="' + link + '" ' + data_str + ' controls>' + editor.language.translate('Your browser does not support HTML5 video.') + '</audio>')
    }
    else {
      let autoplay=''
      let video_autoplay=document.getElementById('fr-file-autoplay-button-' + index).checked
      if(video_autoplay){
        autoplay="autoplay"
      }
      // Create video object and set the load event.
      $video = $(document.createElement('span')).attr('contenteditable', 'false').attr('draggable', 'true').attr('class', 'fr-video fr-dv' + (editor.opts.videoDefaultDisplay[0]) + (editor.opts.videoDefaultAlign != 'center' ? ' fr-fv' + editor.opts.videoDefaultAlign[0] : '')).html('<video src="' + link + '" ' + data_str + (width ? ' style="width: ' + width + ';" ' : '')+ autoplay + '  controls>' + editor.language.translate('Your browser does not support HTML5 video.') + '</video>')
    }

    $video.toggleClass('fr-draggable', editor.opts.videoMove)

    // Make sure we have focus.
    // Call the event.
    editor.edit.on()
    editor.events.focus(true)
    editor.selection.restore()

    editor.undo.saveStep()

    // Insert marker and then replace it with the video.
    if (editor.opts.videoSplitHTML) {
      editor.markers.split()
    }
    else {
      editor.markers.insert()
    }

    editor.html.wrap()
    const $marker = editor.$el.find('.fr-marker')

    // Do not insert video inside emoticon.
    if (editor.node.isLastSibling($marker) && $marker.parent().hasClass('fr-deletable')) {

      $marker.insertAfter($marker.parent())
    }

    $marker.replaceWith($video)

    let typeVar = ''
     isAudio(type) ?  typeVar= 'audio' :  typeVar = 'video'
     if ($video.find(typeVar).get(0).readyState > $video.find(typeVar).get(0).HAVE_FUTURE_DATA || editor.helpers.isIOS()) {
      loadCallback.call($video.find(typeVar).get(0))
    }
    else {
      $video.find(typeVar).on('canplaythrough load', loadCallback)
      $video.find(typeVar).on('error', loadCallback)
    }
    return $video
  }


  /**
   * Parse image response.
   */

  function _parseResponse(response, index) {
    try {
      if (editor.events.trigger('filesManager.uploaded', [response], true) === false) {
        editor.edit.on()

        return false
      }
      const resp = JSON.parse(response)

      if (resp.link) {

        return resp
      }
      else {

        // No link in upload request.
        _throwError(MISSING_LINK, response, null, index)

        return false
      }
    } catch (ex) {

      // Bad response.
      _throwError(BAD_RESPONSE, response, null, index)

      return false
    }
  }

  /**
   * Parse image response.
   */

  function _parseXMLResponse(response, index) {
    try {
      const link = $(response).find('Location').text()
      const key = $(response).find('Key').text()

      if (editor.events.trigger('filesManager.uploadedToS3', [link, key, response], true) === false) {
        editor.edit.on()

        return false
      }

      return link
    } catch (ex) {

      // Bad response.
      _throwError(BAD_RESPONSE, response, null, index)

      return false
    }
  }

  /**
   * Image was uploaded to the server and we have a response.
   */

  function _fileUploaded(text, index, type, url, key) {
    const { status } = this
    const { response } = this
    const { responseXML } = this
    const { responseText } = this

    try {
      if (editor.opts.filesManagerUploadToS3 || editor.opts.filesManagerUploadToAzure) {
        if (status === 201) {
          let link
          if(editor.opts.filesManagerUploadToAzure){
            if (editor.events.trigger('filesManager.uploadedToAzure', [this.responseURL, key, response], true) === false) {
              editor.edit.on()
              return false
            }
            link = url
          } else {
            link = _parseXMLResponse(responseXML, index)
          }
          if (link) {
            let obj =
            {
              link: link,
              text: text,
              response: response,
              type: type
            }
            file_list_values.set(index, obj)
          }
        }
        else {
          _throwError(BAD_RESPONSE, response || responseXML, null, index)
        }
      }
      else {
        if (status >= 200 && status < 300) {
          const resp = _parseResponse(responseText, index)

          if (resp) {
            let obj =
            {
              link: resp.link,
              text: text,
              response: response,
              type: type
            }
            file_list_values.set(index, obj)
          }
        }
        else {
          _throwError(ERROR_DURING_UPLOAD, response || responseText, null, index)
        }
      }
    }
    catch (ex) {

      // Bad response.
      _throwError(BAD_RESPONSE, response || responseText, null, index)
    }
  }

  function _imageUploaded($image_placeholder, index, type, url, key) {
    const { status } = this
    const { response } = this
    const { responseXML } = this
    const { responseText } = this

    try {
      if (editor.opts.filesManagerUploadToS3 || editor.opts.filesManagerUploadToAzure) {
        if (status == 201) {
          let link
          if(editor.opts.filesManagerUploadToAzure){
            if (editor.events.trigger('filesManager.uploadedToAzure', [this.responseURL, key, response], true) === false) {
              editor.edit.on()
              return false
            }
            link = url
          } else {
            link = _parseXMLResponse(responseXML, index)
          }
          if (link) {
            let obj = {
              link: link,
              sanitize: false,
              data: [],
              $existing_img: $image_placeholder,
              response: response || responseXML,
              type: type
            }
            file_list_values.set(index, obj)
          }
        }
        else {
          _throwError(BAD_RESPONSE, response || responseXML, $image_placeholder, index)
        }
      }
      else {
        if (status >= 200 && status < 300) {
          const resp = _parseResponse(responseText, index)

          if (resp) {
            let obj = {
              link: resp.link,
              sanitize: false,
              data: resp,
              $existing_img: $image_placeholder,
              response: response || responseXML,
              type: type
            }
            file_list_values.set(index, obj)
          }
        }
        else {
          _throwError(ERROR_DURING_UPLOAD, response || responseText, $image_placeholder, index)
        }
      }
    } catch (ex) {

      // Bad response.
      _throwError(BAD_RESPONSE, response || responseText, $image_placeholder, index)
    }
  }

  /**
   * Image upload error.
   */

  function _fileUploadError() {
    _throwError(BAD_RESPONSE, this.response || this.responseText || this.responseXML)
  }

  /**
   * Image upload progress.
   */

  function _fileUploadProgress(e, index) {
    if (e.lengthComputable) {
      const complete = (e.loaded / e.total * 100 | 0)
      updateFileUploadingProgress(complete, index, false)
    }
  }

  function _addImage(link, data, loadCallback) {

    // Build image data string.
    let data_str = ''
    let attr
    const $img = $(document.createElement('img')).attr('src', link)

    if (data && typeof data != 'undefined') {
      for (attr in data) {
        if (data.hasOwnProperty(attr)) {
          if (attr != 'link') {
            data_str += ` data-${attr}="${data[attr]}"`
            // https://github.com/froala-labs/froala-editor-js-2/issues/2649
            $img.attr(`data-${attr}`, data[attr])
          }
        }
      }
    }

    let width = editor.opts.imageDefaultWidth

    if (width && width != 'auto') {
      width = (editor.opts.imageResizeWithPercent ? '100%' : `${width}px`)
    }

    // Create image object and set the load event.
    $img.attr('style', (width ? `width: ${width};` : ''))
    _setStyleImage($img, editor.opts.imageDefaultDisplay, editor.opts.imageDefaultAlign)

    $img.on('load', loadCallback)

    // Image might be corrupted. Continue upload flow.
    $img.on('error', loadCallback)

    // Make sure we have focus.
    // Call the event.
    editor.edit.on()
    editor.events.focus(true)
    editor.selection.restore()
    editor.undo.saveStep()

    // Insert marker and then replace it with the image.
    if (editor.opts.imageSplitHTML) {
      editor.markers.split()
    }
    else {
      editor.markers.insert()
    }

    editor.html.wrap()
    const $marker = editor.$el.find('.fr-marker')

    if ($marker.length) {

      // Do not insert image in HR.
      if ($marker.parent().is('hr')) {
        $marker.parent().after($marker)
      }

      // Do not insert image inside emoticon.
      if (editor.node.isLastSibling($marker) && $marker.parent().hasClass('fr-deletable')) {

        $marker.insertAfter($marker.parent())
      }

      $marker.replaceWith($img)
    }
    else {
      editor.$el.append($img)
    }

    return $img
  }

  /**
   * Image upload aborted.
   */
  function _fileUploadAborted(index, e) {
    _throwError(UPLOAD_CANCEL, e, $current_image, index)
  }

  function _browserUpload(index, file, $image_placeholder) {
    const reader = new FileReader()

    reader.onload = function () {
      let link = reader.result

      if (reader.result.indexOf('svg+xml') < 0) {

        // Convert file to local blob.
        const binary = atob(reader.result.split(',')[1])
        const array = []

        for (let i = 0; i < binary.length; i++) {
          array.push(binary.charCodeAt(i))
        }

        // Get local image link.
        link = window.URL.createObjectURL(new Blob([new Uint8Array(array)], {
          type: _getFileType(file)
        }))

        if (isImage(_getFileType(file))) {
          let obj = {
            link: link,
            sanitize: false,
            data: null,
            $existing_img: $image_placeholder,
            response: null,
            type: _getFileType(file)
          }
          file_list_values.set(index, obj)
        }

        if (isFile(_getFileType(file))) {
          let obj = {
            link: link,
            text: file.name,
            response: null,
            type: _getFileType(file)
          }
          file_list_values.set(index, obj)
        }

        if (isVideo(_getFileType(file)) || isAudio(_getFileType(file))) {
          let obj = {
            link: link,
            sanitize: false,
            data: null,
            $existing_img: $image_placeholder,
            type: _getFileType(file)
          }
          file_list_values.set(index, obj)
        }
      }
    }
    reader.readAsDataURL(file)
  }

  function upload(file, files, $image_placeholder, index) {
    if(unsupported_file_types.indexOf(_getFileType(file)) > -1 || !_getFileType(file)){

      _throwError(BAD_FILE_TYPE, null, null, index)
      return false
    }
    // Check if we should cancel the image upload.
    if (editor.events.trigger('filesManager.beforeUpload', [files]) === false) {
      return false
    }

    if ((editor.opts.filesManagerUploadURL === null || editor.opts.filesManagerUploadURL == DEFAULT_FILE_UPLOAD_URL) && !editor.opts.filesManagerUploadToS3 && !editor.opts.filesManagerUploadToAzure) {
      _browserUpload(index, file)
      return false
    }

    if(isImage(_getFileType(file))) {
      if (!file.name) {
        file.name = (new Date()).getTime() + '.' + (_getFileType(file) || 'image/jpeg').replace(/image\//g, '')
      }
    }

    if (file.size > editor.opts.filesManagerMaxSize) {
      _throwError(MAX_SIZE_EXCEEDED, null, null, index)
      return false
    }

    if (editor.opts.filesManagerAllowedTypes.indexOf('*') < 0 && editor.opts.filesManagerAllowedTypes.indexOf(_getFileType(file)) < 0) {
      _throwError(BAD_FILE_TYPE, null, null, index)
        return false
    }

    initialFileUploadStatus(index)
    // Create form Data.
    let form_data

    if (editor.drag_support.formdata) {
      form_data = editor.drag_support.formdata ? new FormData() : null
    }

    // Prepare form data for request.
    if (form_data) {      
      let key
      // Upload to S3.
      if (editor.opts.filesManagerUploadToS3 !== false) {
        form_data.append('key', editor.opts.filesManagerUploadToS3.keyStart + (new Date()).getTime() + '-' + (file.name || 'untitled'))
        form_data.append('success_action_status', '201')
        form_data.append('X-Requested-With', 'xhr')
        form_data.append('Content-Type', _getFileType(file))

        for (key in editor.opts.filesManagerUploadToS3.params) {
          if (editor.opts.filesManagerUploadToS3.params.hasOwnProperty(key)) {
            form_data.append(key, editor.opts.filesManagerUploadToS3.params[key])
          }
        }
      }

      // Add upload params.
      for (key in editor.opts.filesManagerUploadParams) {
        if (editor.opts.filesManagerUploadParams.hasOwnProperty(key)) {
          form_data.append(key, editor.opts.filesManagerUploadParams[key])
        }
      }

      // Set the image in the request.
      form_data.append(editor.opts.filesManagerUploadParam, file, file.name)
     
      // Create XHR request.
      let url = editor.opts.filesManagerUploadURL
      let fileURL
      let azureKey

      if (editor.opts.filesManagerUploadToS3) {
        if (editor.opts.filesManagerUploadToS3.uploadURL) {
          url = editor.opts.filesManagerUploadToS3.uploadURL
        } else {
          url = `https://${editor.opts.filesManagerUploadToS3.region}.amazonaws.com/${editor.opts.filesManagerUploadToS3.bucket}`
        }
      }
      
      if (editor.opts.filesManagerUploadToAzure) {
        if (editor.opts.filesManagerUploadToAzure.uploadURL) {
          url = `${editor.opts.filesManagerUploadToAzure.uploadURL}/${file.name}`
        } else {
          url = encodeURI(`https://${editor.opts.filesManagerUploadToAzure.account}.blob.core.windows.net/${editor.opts.filesManagerUploadToAzure.container}/${file.name}`)
        }
        fileURL = url
        if (editor.opts.filesManagerUploadToAzure.SASToken) {
          url += editor.opts.filesManagerUploadToAzure.SASToken
        }
        editor.opts.filesManagerUploadMethod = 'PUT'
      }
      
      const xhr = editor.core.getXHR(url, editor.opts.filesManagerUploadMethod)

      if (editor.opts.filesManagerUploadToAzure) {
        let uploadDate = new Date().toUTCString()
        if (!editor.opts.filesManagerUploadToAzure.SASToken && editor.opts.filesManagerUploadToAzure.accessKey) {
          let azureAccount = editor.opts.filesManagerUploadToAzure.account
          let azureContainer = editor.opts.filesManagerUploadToAzure.container
          if(editor.opts.filesManagerUploadToAzure.uploadURL) {
            let urls = editor.opts.filesManagerUploadToAzure.uploadURL.split('/')
            azureContainer = urls.pop()
            azureAccount = urls.pop().split('.')[0]
          }
          let headerResource = `x-ms-blob-type:BlockBlob\nx-ms-date:${uploadDate}\nx-ms-version:2019-07-07`
          let urlResource = encodeURI('/' + azureAccount + '/' + azureContainer + '/' + file.name)
          let stringToSign = editor.opts.filesManagerUploadMethod + '\n\n\n' + file.size + '\n\n' + _getFileType(file) + '\n\n\n\n\n\n\n' + headerResource + '\n' + urlResource
          let signatureBytes = editor.cryptoJSPlugin.cryptoJS.HmacSHA256(stringToSign, editor.cryptoJSPlugin.cryptoJS.enc.Base64.parse(editor.opts.filesManagerUploadToAzure.accessKey))
          let signature = signatureBytes.toString(editor.cryptoJSPlugin.cryptoJS.enc.Base64)
          let authHeader = 'SharedKey ' + azureAccount + ':' + signature
          azureKey = signature
          xhr.setRequestHeader("Authorization", authHeader)
        }
        xhr.setRequestHeader("x-ms-version", "2019-07-07")
        xhr.setRequestHeader("x-ms-date", uploadDate)
        xhr.setRequestHeader("Content-Type", _getFileType(file))
        xhr.setRequestHeader("x-ms-blob-type", "BlockBlob")
        for (key in editor.opts.filesManagerUploadParams) {
          if (editor.opts.filesManagerUploadParams.hasOwnProperty(key)) {
            xhr.setRequestHeader(key, editor.opts.filesManagerUploadParams[key])
          }
        }
        for (key in editor.opts.filesManagerUploadToAzure.params) {
          if (editor.opts.filesManagerUploadToAzure.params.hasOwnProperty(key)) {
            xhr.setRequestHeader(key, editor.opts.filesManagerUploadToAzure.params[key])
          }
        }
      }

      xhr.onload = function () {
        if (isFile(_getFileType(file))) {
          _fileUploaded.call(xhr, file.name, index, _getFileType(file), fileURL, azureKey)        
        } else {
          _imageUploaded.call(xhr, $current_image, index, _getFileType(file), fileURL, azureKey)
        }
        if(!failedUploadFiles.has(index)){
          updateFileUploadingProgress(100, index, true) 
        }
      }
      xhr.onerror =   function _fileUploadError() {
        _throwError(BAD_RESPONSE, this.response || this.responseText || this.responseXML, null, index)
      }
      xhr.upload.onprogress =  function (e) {
        _fileUploadProgress(e, index)
      }
      xhr.onabort = function(e) {
        _fileUploadAborted(index, e)
      }
      xhr.send(editor.opts.filesManagerUploadToAzure ? file : form_data)
      XMLHttpRequests.set(index, xhr)
    }
  }

  /**
   * Image drop inside the upload zone.
   */

  function _bindInsertEvents($popup) {

    //disable keypad launch on click in mobile
    editor.events.$on($popup, 'click', '.fr-upload-progress-layer', function (e) {
      if (editor.helpers.isMobile()) {
        e.stopPropagation()
        return false
      }
    }, true)

    //preventing Drag over on file list in filesManager popup
    editor.events.$on($popup, 'dragover dragenter', '.fr-upload-progress-layer', function (e) {
      e.preventDefault()
      for (var i = 0; i < e.originalEvent.dataTransfer.types.length; i++) {
        if (e.originalEvent.dataTransfer.types[i] == "Files") {
          e.originalEvent.dataTransfer.dropEffect = "none"
        }
    }      
      return false
    }, true)


    //preventing Drag end on file list in filesManager popup
    editor.events.$on($popup, 'dragleave dragend', '.fr-upload-progress-layer', function (e) {
      e.preventDefault()
      return false
    }, true)


    // Drag over the dropable area.
    editor.events.$on($popup, 'dragover dragenter', '.fr-files-upload-layer', function (e) {
      $(this).addClass('fr-drop')

      if (editor.browser.msie || editor.browser.edge) {
        e.preventDefault()
      }

      return false
    }, true)

    // Drag end.
    editor.events.$on($popup, 'dragleave dragend', '.fr-files-upload-layer', function (e) {
      $(this).removeClass('fr-drop')

      if (editor.browser.msie || editor.browser.edge) {
        e.preventDefault()
      }

      return false
    }, true)

    editor.events.$on($popup, 'click', '.fr-insert-checkbox', function (e){
      if(this.classList.contains('fr-checkbox-disabled')){
        this.children['target'].disabled = true
        this.children['target'].checked = false
        return
      }
      let index = parseInt(this.id.split('-').pop())
      checked_files.set(index,this.children['target'].checked)
      let $btnInsert = $popup.find('.fr-command[data-cmd="insertAll"]')
      let $btnDelete = $popup.find('.fr-command[data-cmd="deleteAll"]')
      const check_inputs = $popup.find('input.fr-file-insert-check[type="checkbox"]')
      let size = check_inputs.length
      let isDisabled = true
      for(let i = 0; i< size; i++)
      {
        if(check_inputs[i].checked == true)
        {
          isDisabled=false
        } 
      }
      isDisabled?$btnInsert.addClass('fr-disabled'):$btnInsert.removeClass('fr-disabled')
      isDisabled?$btnDelete.addClass('fr-disabled'):$btnDelete.removeClass('fr-disabled')

      if(this.children['target'].checked){
        $popup.find(`.fr-file-` + this.id.split('-').pop()).get(0).setAttribute('draggable' , 'true')
        $popup.find(`.fr-file-` + this.id.split('-').pop()).get(0).classList.remove('fr-unchecked')
      }
      else{
        let id = this.id.split('-').pop()
        $popup.find(`.fr-file-` + this.id.split('-').pop()).get(0).setAttribute('draggable' , 'false')
        $popup.find(`.fr-file-` + this.id.split('-').pop()).get(0).classList.add('fr-unchecked')
      }
    })

    editor.events.$on($popup, 'click', '.fr-file-insert-button', function (e){
      if(this.classList.contains('fr-disabled')){
        return
      }
      let index = parseInt(this.id.split('-').pop())
      insert(index)
    })
    
    editor.events.$on($popup, 'click', '.fr-file-autoplay-button', function (e){
      if(this.parentNode.classList.contains('fr-checkbox-disabled')){
        this.disabled = true
        this.checked = false
        return
      }
            let index = parseInt(this.id.split('-').pop())
      checkAutoplay(index)
    })

    editor.events.$on($popup, 'click', '.fr-file-edit-button', function (e){
      let index = parseInt(this.id.split('-').pop())
      if(!$popup.find(`.fr-file-edit-button-${index}`).hasClass('fr-disabled'))
          editImage(index);
    })

    editor.events.$on($popup, 'click', '.fr-file-view-button', function (e){
      let index = parseInt(this.id.split('-').pop())
      if(!$popup.find(`.fr-file-view-button-${index}`).hasClass('fr-disabled'))
          viewImage(index)
      
    })

    editor.events.$on($popup, 'click', '.fr-file-delete-button', function (e){
      let index = parseInt(this.id.split('-').pop())
      deleteFile(index)
    })

    editor.events.$on($popup, 'click', '.fr-file-cancel-upload-button', function (e){
      let index = parseInt(this.id.split('-').pop())
      cancelFileUpload(index)
    })

    editor.events.$on($popup, 'click', '.fr-upload-delete-button', function (e){
      let index = parseInt(this.id.split('-').pop())
      deleteFileUpload(index)
    })

    editor.events.$on($popup, 'click', '.fr-file-view-close', function (e){
      $popup.find('.fr-file-view-modal').get(0).outerHTML = ''
    })

    editor.events.$on($popup, 'click', '.fr-plugins-enable', function (e){
      addPlugins()
      loadPlugins(FE.PLUGINS)
      editor.popups.get('filesManager.insert').get(0).outerHTML = ''
      _initInsertPopup()
      showInsertPopup(true)
    })

    editor.events.$on($popup, 'click', '.fr-plugins-cancel', function (e){
      editor.popups.hide('filesManager.insert')
    })

    // preventing drop on file list in filesManager popup
    editor.events.$on($popup, 'drop', '.fr-upload-progress', function (e) {
      e.preventDefault()
      e.stopPropagation()
    })
    // Drop.
    editor.events.$on($popup, 'drop', '.fr-files-upload-layer', function (e) {
      e.preventDefault()
      e.stopPropagation()
      $(this).removeClass('fr-drop')
      const dt = e.originalEvent.dataTransfer

      if (dt && dt.files) {
        const inst = $popup.data('instance') || editor
        inst.events.disableBlur()
        let indexes = []
        for (let i = 0; i < dt.files.length; i++) {
          let j = fileListIndex
          file_list.set(j, dt.files[i])
          showFileUploadProgressLayer(j)
          checked_files.set(j,false)
          indexes.push(j)
          fileListIndex++
        }
        for(let i = 0 ; i < indexes.length ; i++){
          inst.filesManager.upload(file_list.get(indexes[i]), dt.files, $current_image, indexes[i])
        }
        inst.events.enableBlur()
      }
      }, true)

      if (editor.helpers.isIOS()) {
        editor.events.$on($popup, 'touchstart', '.fr-files-upload-layer input[type="file"]', function () {
          $(this).trigger('click')
        }, true)
      }

      editor.events.$on($popup, 'change', '.fr-files-upload-layer input[type="file"]', function () {
            if (this.files) {
              const inst = $popup.data('instance') || editor

              inst.events.disableBlur()
              $popup.find('input:focus').blur()
              inst.events.enableBlur()
              let indexes = []
              // Make sure we have what to upload.
              if (typeof this.files != 'undefined' && this.files.length > 0) {
                for (let i = 0; i < this.files.length; i++) {
                  let j = fileListIndex
                  file_list.set(j, this.files[i])
                  showFileUploadProgressLayer(j)
                  checked_files.set(j,false)
                  ++fileListIndex
                  indexes.push(j)
                }
                for(let i = 0 ; i < indexes.length ; i++){
                  inst.filesManager.upload(file_list.get(indexes[i]), this.files, $current_image, indexes[i])
                }
              }

            }

      // Else IE 9 case.
      // Chrome fix.
      $(this).val('')
    }, true)
  }
  function checkAutoplay(index){
    const checkbox=document.getElementById('fr-file-autoplay-button-' + index).checked
    if(checkbox){
      autoplayCheckbox.push(index)
    }else {
      autoplayCheckbox = autoplayCheckbox.filter(function (i){
        return i!=index
      })
    }

  }
  function isImage(type)
  {
    return type && type.split('/')[0] === 'image';
    
  }

  function isFile(type)
  {
    return (type && type.split('/')[0] != 'image')&&(type && type.split('/')[0] != 'video')&&(type && type.split('/')[0] != 'audio');
  }

  function isVideo(type)
  {
    return type && type.split('/')[0] === 'video';
  }

  function isAudio(type)
  {
    return type && type.split('/')[0] === 'audio';
  }

  function isFormatSupported(type)
  {
    let webp = 'image/webp'
    let webm = 'video/webm'
    let ogg = 'audio/ogg'
    let ogv = 'video/ogg'
    if(type == ogg || type == ogv || type == webp || type == webm) {
      if(editor.browser.msie || editor.browser.edge || editor.browser.safari){  
        return false
      }
      if(editor.helpers.isMobile()){
        if(type == ogg || type == ogv){
          return false
        }
        if(!editor.helpers.isAndroid() && !editor.browser.chrome){
          return false
        }
      }
    }
    return true
  }

  function _beforeElementDrop($el) {
    if ($el.is('img') && $el.parents('.fr-img-caption').length > 0) {
      return $el.parents('.fr-img-caption')
    }
  }

  function _initEvents() {
    if (editor.helpers.isMobile()) {
      editor.events.$on($(editor.o_win), 'orientationchange', function () {
        setTimeout(function () {
          showInsertPopup(true)
        }, 100)
      })
    }

    // Mouse down on image. It might start move.
    editor.events.$on(editor.$el, editor._mousedown, editor.el.tagName == 'IMG' ? null : 'img:not([contenteditable="false"])', function (e) {
      if ($(this).parents('contenteditable').not('.fr-element').not('.fr-img-caption').not('body').first().attr('contenteditable') == 'false') return true

      if (!editor.helpers.isMobile()) editor.selection.clear()

      mousedown = true

      if (editor.popups.areVisible()) editor.events.disableBlur()

      // Prevent the image resizing.
      if (editor.browser.msie) {
        editor.events.disableBlur()
        editor.$el.attr('contenteditable', false)
      }

      if (!editor.draggable && e.type != 'touchstart') e.preventDefault()

      e.stopPropagation()
    })
    editor.events.$on(editor.$el, editor._mousedown, '.fr-img-caption .fr-inner', function (e) {

      if (!editor.core.hasFocus()) {
        editor.events.focus()
      }

      e.stopPropagation()
    })
    editor.events.$on(editor.$el, 'paste', '.fr-img-caption .fr-inner', function (e) {

      editor.toolbar.hide()
   
      e.stopPropagation()
    })

    // Mouse up on an image prevent move.
    editor.events.$on(editor.$el, editor._mouseup, editor.el.tagName == 'IMG' ? null : 'img:not([contenteditable="false"])', function (e) {
      if ($(this).parents('contenteditable').not('.fr-element').not('.fr-img-caption').not('body').first().attr('contenteditable') == 'false') return true

      if (mousedown) {
        mousedown = false

        // Remove moving class.
        e.stopPropagation()

        if (editor.browser.msie) {
          editor.$el.attr('contenteditable', true)
          editor.events.enableBlur()
        }
      }
    })

    // Show image popup when it was selected.
    editor.events.on('keyup', function (e) {
      if (e.shiftKey && editor.selection.text().replace(/\n/g, '') === '' && editor.keys.isArrow(e.which)) {
        const s_el = editor.selection.element()
        const e_el = editor.selection.endElement()

        if (s_el && s_el.tagName == 'IMG') {
          _editImg($(s_el))
        }
        else if (e_el && e_el.tagName == 'IMG') {
          _editImg($(e_el))
        }
      }
    }, true)

    // https://github.com/froala-labs/froala-editor-js-2/issues/1916
    editor.events.on('window.mousedown', _markExit)
    editor.events.on('window.touchmove', _unmarkExit)

    editor.events.on('mouseup window.mouseup', function () {
      if ($current_image) {
        _exitEdit()

        return false
      }

      _unmarkExit()
    })
    editor.events.on('commands.mousedown', function ($btn) {
      if ($btn.parents('.fr-toolbar').length > 0) {
        _exitEdit()
      }
    })
    editor.events.on('image.resizeEnd', function () {
      if (editor.opts.iframe) {
        editor.size.syncIframe()
      }
    })

    editor.events.on('blur image.hideResizer commands.undo commands.redo element.dropped', function () {
      mousedown = false
      _exitEdit(true)
    })

    editor.events.on('modals.hide', function () {
      if ($current_image) {
        editor.selection.clear()
      }
    })

    editor.events.on('image.resizeEnd', function () {
      if (editor.win.getSelection) {
        _editImg($current_image)
      }
    })

    // Add new line after image is inserted.
    if (editor.opts.imageAddNewLine) {
      editor.events.on('image.inserted', function ($img) {
        let lastNode = $img.get(0)

        // Ignore first BR after image.
        if (lastNode.nextSibling && lastNode.nextSibling.tagName === 'BR') lastNode = lastNode.nextSibling;

        // Look upper nodes.
        while (lastNode && !editor.node.isElement(lastNode)) {
          if (!editor.node.isLastSibling(lastNode)) {
            lastNode = null;
          }
          else {
            lastNode = lastNode.parentNode;
          }
        }

        // If node is element, then image is last element.
        if (editor.node.isElement(lastNode)) {

          // ENTER_BR mode.
          if (editor.opts.enter === FE.ENTER_BR) {
            $img.after('<br>');
          }
          else {
            let $parent = $(editor.node.blockParent($img.get(0)));

            $parent.after(`<${editor.html.defaultTag()}><br></${editor.html.defaultTag()}>`);
          }
        }
      })
    }
  }

  /**
   * Init the image upload popup.
   */

  function _initInsertPopup(delayed) {
    if (delayed) {
      editor.popups.onRefresh('filesManager.insert', _refreshInsertPopup)
      editor.popups.onHide('filesManager.insert', _hideInsertPopup)

      return true
    }

    let active
    let $popup

    // Image buttons.
    let image_buttons = ''

    // https://github.com/froala/wysiwyg-editor/issues/2987

    if (!editor.opts.imageUpload && editor.opts.filesInsertButtons.indexOf('filesUpload') !== -1) {
      editor.opts.imageInsertButtons.splice(editor.opts.filesInsertButtons.indexOf('filesUpload'), 1)
    }

    const buttonList = editor.button.buildList(editor.opts.filesInsertButtons)
    const buttonList2 = editor.button.buildList(editor.opts.filesInsertButtons2)

    if (buttonList !== '') {
      image_buttons = `<div class="fr-buttons fr-tabs">${buttonList}<span class="fr-align-right">${buttonList2}</span></div>`
    }

    const uploadIndex = editor.opts.filesInsertButtons.indexOf('filesUpload')
    const urlIndex = editor.opts.filesInsertButtons.indexOf('filesByURL')
    const embedIndex = editor.opts.filesInsertButtons.indexOf('filesEmbed')

    // Image upload layer.
    let upload_layer = ''

    if (uploadIndex >= 0) {
      active = ' fr-active'

      if (urlIndex >= 0 && uploadIndex > urlIndex) {
        active = ''
      }
       upload_layer = `<div class="fr-files-upload-layer${active} fr-layer " id="fr-files-upload-layer-${editor.id}"><div style="display:flex"><div class="fr-upload-section"><div class = 'fr-blue-decorator'><div class = 'fr-cloud-icon'><svg class = "fr-svg" focusable="false" width="26px" height="26px" viewBox = "0 0 24 24" xlmns = "http://w3.org/200/svg"><path d = 'M12 6.66667a4.87654 4.87654 0 0 1 4.77525 3.92342l0.29618 1.50268 1.52794 0.10578a2.57021 2.57021 0 0 1 -0.1827 5.13478H6.5a3.49774 3.49774 0 0 1 -0.3844 -6.97454l1.06682 -0.11341L7.678 9.29387A4.86024 4.86024 0 0 1 12 6.66667m0 -2A6.871 6.871 0 0 0 5.90417 8.37 5.49773 5.49773 0 0 0 6.5 19.33333H18.41667a4.57019 4.57019 0 0 0 0.32083 -9.13A6.86567 6.86567 0 0 0 12 4.66667Zm0.99976 7.2469h1.91406L11.99976 9 9.08618 11.91357h1.91358v3H11V16h2V14h-0.00024Z'></path></svg></div>Drag & Drop One or More Files<br><div class="decorated"><span> OR </span></div> Click Browse Files </div> </div><div class="fr-form"><input type="file" accept="${editor.opts.filesManagerAllowedTypes.join(',').toLowerCase()}" tabIndex="-1" aria - labelledby="fr-files-upload-layer-${editor.id}"role="button" multiple></div> </div></div>`    }

    // File embed layer.
    let embed_layer = ''
    if (embedIndex >= 0) {
      active = ' fr-active'

      if ((embedIndex > uploadIndex && uploadIndex >= 0) || (embedIndex > urlIndex && urlIndex >= 0)) {
        active = ''
      }


      embed_layer = `<div class="fr-files-embed-layer fr-layer${active}" id="fr-files-embed-layer-${editor.id}"><div class="fr-input-line padding-top-15"><textarea data-gramm_editor="false" style='height:60px' id="fr-files-embed-layer-text${editor.id}" type="text" placeholder="${editor.language.translate('Embedded Code')}" tabIndex="1" aria-required="true" rows="5"></textarea></div><div class="fr-action-buttons"><button type="button" class="fr-command fr-submit" data-cmd="insertEmbed" tabIndex="2" role="button">${editor.language.translate('Insert')}</button></div></div>`

    }

    // Image by url layer.
    let by_url_layer = ''

    if (urlIndex >= 0) {
      active = ' fr-active'

      if (uploadIndex >= 0 && urlIndex > uploadIndex) {
        active = ''
      }

      by_url_layer = `<div class="fr-files-by-url-layer${active} fr-layer" id="fr-files-by-url-layer-${editor.id}"><div class="fr-input-line fr-by-url-padding"><input id="fr-files-by-url-layer-text-${editor.id}" type="text" placeholder="http://" tabIndex="1" aria-required="true"></div><div class="fr-action-buttons"><button type="button" class="fr-command fr-submit" data-cmd="filesInsertByURL" tabIndex="2" role="button">${editor.language.translate('Add')}</button></div></div>`
    }

    let upload_progress_layer = ''
    

    upload_progress_layer = `<div class = ' fr-margin-16 fr-upload-progress' id="fr-upload-progress-layer-${editor.id}" ><div  class='fr-progress-bar-style'><div class='fr-progress-bar fr-none'></div></div><div id='filesList' class = 'fr-upload-progress-layer fr-layer'></div></div>`



    // Progress bar.
    const progress_bar_layer = '<div class="fr-files-progress-bar-layer fr-layer"><h3 tabIndex="-1" class="fr-message">Uploading</h3><div class="fr-loader"><span class="fr-progress"></span></div><div class="fr-action-buttons"><button type="button" class="fr-command fr-dismiss" data-cmd="filesDismissError" tabIndex="2" role="button">OK</button></div></div>'

    const template = {
      buttons: image_buttons,
      upload_layer: upload_layer,
      by_url_layer: by_url_layer,
      embed_layer: embed_layer,
      upload_progress_layer: upload_progress_layer,
      progress_bar: progress_bar_layer
    }

    // Set the template in the popup.
    if (editor.opts.imageInsertButtons.length >= 1) {
      $popup = editor.popups.create('filesManager.insert', template)
    }

    if (editor.$wp) {
      editor.events.$on(editor.$wp, 'scroll', function () {
        if ($current_image && editor.popups.isVisible('filesManager.insert')) {
          replace()
        }
      })
    }

    _bindInsertEvents($popup)
    editor.popups.setPopupDimensions($popup)
    return $popup
  }

  function _initPluginErrorPopup(){
    const file_buttons = `<div class="fr-buttons fr-tabs">${editor.button.buildList(editor.opts.fileInsertButtons)}</div>`
    const message_layer = `<div style= 'padding:10px'>
    <div class = 'fr-message'><h3 style ='font-size: 16px; margin: 10px 10px;font-weight: normal;'>${editor.language.translate( getMissingPluginsText() + ' not enabled. Do you want to enable?')}</h3></div>
    <div style='text-align:right;'>
      <button class='fr-trim-button fr-plugins-enable'>${editor.language.translate('Enable')}</button>               
      <button class='fr-trim-button fr-plugins-cancel'>${editor.language.translate('Cancel')}</button>
    </div>`
    const template = {
      buttons: file_buttons,
      upload_layer: message_layer,
      by_url_layer: '',
      embed_layer: '',
      upload_progress_layer: '',
      progress_bar: ''
    }
    // Set the template in the popup.
    const $popup = editor.popups.create('filesManager.insert', template)
    _bindInsertEvents($popup)
    return $popup
  }

  function getMissingPluginsText() {
    let missingPlugins = ''
    let plugins = getMissingPlugins()
    missingPlugins = plugins.join(', ')
    if(plugins.length > 1){
      missingPlugins += ' plugin are'
    }
    else{
      missingPlugins += ' plugin is'
    }
    return missingPlugins
  }

  function getMissingPlugins() {
    let files = []
    requiredPlugins.forEach(function(file){
      if(editor.opts.pluginsEnabled.indexOf(file) < 0){
        files.push(file.charAt(0).toUpperCase() + file.slice(1))
      }
    })
    return files
  }

  function getFileDescription(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let  dateFormat
    try{
      dateFormat = date.toLocaleDateString(editor.opts.language ? editor.opts.language : undefined, options)  
    }
    catch(err)
    {
      dateFormat = date.toLocaleDateString(undefined, options)  
    } 
    return dateFormat+''
  }

  function getFileSize(size) {
    if(size == 0)
      return '0 Bytes'
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    var i = Math.floor(Math.log(size) / Math.log(1024));
    return ' | ' + (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + sizes[i];
  }

 // Get file name from url
function getUrlFileName(url){
  let fileName = url.split('/').pop()
  if(fileName.split('.').length < 2){
  let date = new Date()
  return fileName + '-' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()
  }
  return fileName
  }


  /**
   * Refresh the ALT popup.
   */

  function _refreshAltPopup() {
    if ($current_image) {
      const $popup = editor.popups.get('image.alt')
      $popup.find('input').val($current_image.attr('alt') || '').trigger('change')
    }
  }

  /**
   * Show the ALT popup.
   */

  function showAltPopup() {
    let $popup = editor.popups.get('image.alt')

    if (!$popup) $popup = _initAltPopup()
    hideProgressBar()
    editor.popups.refresh('image.alt')
    editor.popups.setContainer('image.alt', editor.$sc)

    let $el = getEl()

    if (hasCaption()) {
      $el = $el.find('.fr-img-wrap')
    }

    let left = $el.offset().left + $el.outerWidth() / 2
    const top = $el.offset().top + $el.outerHeight()

    editor.popups.show('image.alt', left, top, $el.outerHeight(), true)
  }

  /**
   * Init the image upload popup.
   */

  function _initAltPopup(delayed) {
    if (delayed) {
      editor.popups.onRefresh('image.alt', _refreshAltPopup)

      return true
    }

    // Image buttons.
    let image_buttons = ''
    image_buttons = `<div class="fr-buttons fr-tabs">${editor.button.buildList(editor.opts.imageAltButtons)}</div>`

    // Image by url layer.
    let alt_layer = ''
    alt_layer = `<div class="fr-image-alt-layer fr-layer fr-active" id="fr-image-alt-layer-${editor.id}"><div class="fr-input-line"><input id="fr-image-alt-layer-text-${editor.id}" type="text" placeholder="${editor.language.translate('Alternative Text')}" tabIndex="1"></div><div class="fr-action-buttons"><button type="button" class="fr-command fr-submit" data-cmd="imageSetAlt" tabIndex="2" role="button">${editor.language.translate('Update')}</button></div></div>`

    const template = {
      buttons: image_buttons,
      alt_layer: alt_layer
    }

    // Set the template in the popup.
    const $popup = editor.popups.create('image.alt', template)

    if (editor.$wp) {
      editor.events.$on(editor.$wp, 'scroll.image-alt', function () {
        if ($current_image && editor.popups.isVisible('image.alt')) {
          showAltPopup()
        }
      })
    }

    return $popup
  }

  /**
   * Set ALT based on the values from the popup.
   */

  function setAlt(alt) {
    if ($current_image) {
      const $popup = editor.popups.get('image.alt')
      $current_image.attr('alt', alt || $popup.find('input').val() || '')
      $popup.find('input:focus').blur()
      _editImg($current_image)
    }
  }

  /**
   * Refresh the size popup.
   */

  // Issue 2845

  function _refreshSizePopup() {
    const $popup = editor.popups.get('image.size')

    if ($current_image) {

      if (hasCaption()) {
        let $el = $current_image.parent()

        if (!($el.get(0).style.width)) {
          $el = $current_image.parent().parent()
        }
        $popup.find('input[name="width"]').val($el.get(0).style.width).trigger('change')
        $popup.find('input[name="height"]').val($el.get(0).style.height).trigger('change')
      }
      else {
        $popup.find('input[name="width"]').val($current_image.get(0).style.width).trigger('change')
        $popup.find('input[name="height"]').val($current_image.get(0).style.height).trigger('change')
      }
    }
  }

  /**
   * Show the size popup.
   */

  function showSizePopup() {
    let $popup = editor.popups.get('image.size')

    if (!$popup) $popup = _initSizePopup()
    hideProgressBar()
    editor.popups.refresh('image.size')
    editor.popups.setContainer('image.size', editor.$sc)

    let $el = getEl()

    if (hasCaption()) {
      $el = $el.find('.fr-img-wrap')
    }

    let left = $el.offset().left + $el.outerWidth() / 2
    const top = $el.offset().top + $el.outerHeight()

    editor.popups.show('image.size', left, top, $el.outerHeight(), true)
  }

  /**
   * Init the image upload popup.
   */

  function _initSizePopup(delayed) {
    if (delayed) {
      editor.popups.onRefresh('image.size', _refreshSizePopup)

      return true
    }

    // Image buttons.
    let image_buttons = ''
    image_buttons = `<div class="fr-buttons fr-tabs">${editor.button.buildList(editor.opts.imageSizeButtons)}</div>`

    // Size layer.
    let size_layer = ''
    size_layer = `<div class="fr-image-size-layer fr-layer fr-active" id="fr-image-size-layer-${editor.id}"><div class="fr-image-group"><div class="fr-input-line"><input id="fr-image-size-layer-width-'${editor.id}" type="text" name="width" placeholder="${editor.language.translate('Width')}" tabIndex="1"></div><div class="fr-input-line"><input id="fr-image-size-layer-height${editor.id}" type="text" name="height" placeholder="${editor.language.translate('Height')}" tabIndex="1"></div></div><div class="fr-action-buttons"><button type="button" class="fr-command fr-submit" data-cmd="imageSetSize" tabIndex="2" role="button">${editor.language.translate('Update')}</button></div></div>`

    const template = {
      buttons: image_buttons,
      size_layer: size_layer
    }

    // Set the template in the popup.
    const $popup = editor.popups.create('image.size', template)

    if (editor.$wp) {
      editor.events.$on(editor.$wp, 'scroll.image-size', function () {
        if ($current_image && editor.popups.isVisible('image.size')) {
          showSizePopup()
        }
      })
    }

    return $popup
  }

  /**
   * Set size based on the current image size.
   */

  function setSize(width, height) {
    if ($current_image) {
      const $popup = editor.popups.get('image.size')
      width = width || $popup.find('input[name="width"]').val() || ''
      height = height || $popup.find('input[name="height"]').val() || ''
      const regex = /^[\d]+((px)|%)*$/g

      $current_image.removeAttr('width').removeAttr('height')

      if (width.match(regex)) $current_image.css('width', width)
      else $current_image.css('width', '')

      if (height.match(regex)) $current_image.css('height', height)
      else $current_image.css('height', '')

      if (hasCaption()) {
        $current_image.parents('.fr-img-caption').removeAttr('width').removeAttr('height')

        if (width.match(regex)) $current_image.parents('.fr-img-caption').css('width', width)
        else $current_image.parents('.fr-img-caption').css('width', '')

        if (height.match(regex)) $current_image.parents('.fr-img-caption').css('height', height)
        else $current_image.parents('.fr-img-caption').css('height', '')
      }

      if ($popup) $popup.find('input:focus').blur()
      _editImg($current_image)
    }
  }

  /**
   * Show the image upload layer.
   */

  function showLayer(name) {
    const $popup = editor.popups.get('filesManager.insert')

    let left
    let top

    // Click on the button from the toolbar without image selected.
    if (!$current_image && !editor.opts.toolbarInline) {
      const $btn = editor.$tb.find('.fr-command[data-cmd="insertFiles"]')
      left = $btn.offset().left
      top = $btn.offset().top + (editor.opts.toolbarBottom ? 10 : $btn.outerHeight() - 10)
    }

    // Image is selected.
    else if ($current_image) {

      let $el = getEl()

      if (hasCaption()) {
        $el = $el.find('.fr-img-wrap')
      }

      // Set the top to the bottom of the image.
      top = $el.offset().top + $el.outerHeight()
      left = $el.offset().left
    }

    // Image is selected and we are in inline mode.
    if (!$current_image && editor.opts.toolbarInline) {

      // Set top to the popup top.
      top = $popup.offset().top - editor.helpers.getPX($popup.css('margin-top'))

      // If the popup is above apply height correction.
      if ($popup.hasClass('fr-above')) {
        top += $popup.outerHeight()
      }
    }

    // Show the new layer.
    $popup.find('.fr-layer').removeClass('fr-active')
    $popup.find(`.fr-${name}-layer`).addClass('fr-active')
    $popup.find(`.fr-upload-progress-layer`).addClass('fr-active')
    editor.popups.show('filesManager.insert', left, top, ($current_image ? $current_image.outerHeight() : 0))
    editor.accessibility.focusPopup($popup)
  }

  /**
   * Refresh the upload image button.
   */

  function refreshUploadButton($btn) {
    const $popup = editor.popups.get('filesManager.insert')
    if ($popup && $popup.find('.fr-files-upload-layer').hasClass('fr-active')) {
      $btn.addClass('fr-active').attr('aria-pressed', true)
    }
  }

  /**
   * Refresh the insert by url button.
   */

  function refreshByURLButton($btn) {
    const $popup = editor.popups.get('filesManager.insert')
    if ($popup && $popup.find('.fr-files-by-url-layer').hasClass('fr-active')) {
      $btn.addClass('fr-active').attr('aria-pressed', true)
    }
  }

  function _resizeImage(e, initPageX, direction, step) {
    e.pageX = initPageX
    _handlerMousedown.call(this, e)
    e.pageX = e.pageX + direction * Math.floor(Math.pow(1.1, step))
    _handlerMousemove.call(this, e)
    _handlerMouseup.call(this, e)

    return ++step
  }

  /**
   * Init image resizer.
   */
  function _initImageResizer() {
    let doc

    // No shared image resizer.
    if (!editor.shared.$image_resizer) {

      // Create shared image resizer.
      editor.shared.$image_resizer = $(document.createElement('div')).attr('class', 'fr-image-resizer')
      $image_resizer = editor.shared.$image_resizer

      // Bind mousedown event shared.
      editor.events.$on($image_resizer, 'mousedown', function (e) {
        e.stopPropagation()
      }, true)

      // Image resize is enabled.
      if (editor.opts.imageResize) {
        $image_resizer.append(_getHandler('nw') + _getHandler('ne') + _getHandler('sw') + _getHandler('se'))

        // Add image resizer overlay and set it.
        editor.shared.$img_overlay = $(document.createElement('div')).attr('class', 'fr-image-overlay')
        $overlay = editor.shared.$img_overlay
        doc = $image_resizer.get(0).ownerDocument
        $(doc).find('body').first().append($overlay)
      }
    }
    else {
      $image_resizer = editor.shared.$image_resizer
      $overlay = editor.shared.$img_overlay

      editor.events.on('destroy', function () {
        $('body').first().append($image_resizer.removeClass('fr-active'))
      }, true)
    }

    // Shared destroy.
    editor.events.on('shared.destroy', function () {
      $image_resizer.html('').removeData().remove()
      $image_resizer = null

      if (editor.opts.imageResize) {
        $overlay.remove()
        $overlay = null
      }
    }, true)

    // Window resize. Exit from edit.
    if (!editor.helpers.isMobile()) {
      editor.events.$on($(editor.o_win), 'resize', function () {
        if ($current_image && !$current_image.hasClass('fr-uploading')) {
          _exitEdit(true)
        }
        else if ($current_image) {
          _repositionResizer()
          replace()
          showProgressBar(false)
        }
      })
    }

    // Image resize is enabled.
    if (editor.opts.imageResize) {
      doc = $image_resizer.get(0).ownerDocument
      editor.events.$on($image_resizer, editor._mousedown, '.fr-handler', _handlerMousedown)
      editor.events.$on($(doc), editor._mousemove, _handlerMousemove)
      editor.events.$on($(doc.defaultView || doc.parentWindow), editor._mouseup, _handlerMouseup)
      editor.events.$on($overlay, 'mouseleave', _handlerMouseup)

      // Accessibility.

      // Used for keys holing.
      let step = 1
      let prevKey = null
      let prevTimestamp = 0

      // Keydown event.
      editor.events.on('keydown', function (e) {
        if ($current_image) {
          const ctrlKey = navigator.userAgent.indexOf('Mac OS X') != -1 ? e.metaKey : e.ctrlKey
          const keycode = e.which

          if (keycode !== prevKey || e.timeStamp - prevTimestamp > 200) {
            step = 1

            // Reset step. Known browser issue: Keyup does not trigger when ctrl is pressed.
          }

          // Increase image size.
          if ((keycode == FE.KEYCODE.EQUALS || (editor.browser.mozilla && keycode == FE.KEYCODE.FF_EQUALS)) && ctrlKey && !e.altKey) {
            step = _resizeImage.call(this, e, 1, 1, step)
          }

          // Decrease image size.
          else if ((keycode == FE.KEYCODE.HYPHEN || (editor.browser.mozilla && keycode == FE.KEYCODE.FF_HYPHEN)) && ctrlKey && !e.altKey) {
            step = _resizeImage.call(this, e, 2, -1, step)
          }
          else if (!editor.keys.ctrlKey(e) && keycode == FE.KEYCODE.ENTER) {
            $current_image.before('<br>')
            _editImg($current_image)
          }

          // Save key code.
          prevKey = keycode

          // Save timestamp.
          prevTimestamp = e.timeStamp
        }
      }, true)

      // Reset the step on key up event.
      editor.events.on('keyup', function () {
        step = 1
      })
    }
  }

  /**
   * Remove the current image.
   */
  function remove($img) {
    $img = $img || getEl()

    if ($img) {
      if (editor.events.trigger('image.beforeRemove', [$img]) !== false) {
        editor.popups.hideAll()
        _exitEdit(true)

        if (!editor.undo.canDo()) editor.undo.saveStep()

        if ($img.get(0) == editor.el) {
          $img.removeAttr('src')
        }
        else {
          if ($img.get(0).parentNode && $img.get(0).parentNode.tagName == 'A') {
            editor.selection.setBefore($img.get(0).parentNode) || editor.selection.setAfter($img.get(0).parentNode) || $img.parent().after(FE.MARKERS)
            $($img.get(0).parentNode).remove()
          }
          else {
            editor.selection.setBefore($img.get(0)) || editor.selection.setAfter($img.get(0)) || $img.after(FE.MARKERS)
            $img.remove()
          }

          editor.html.fillEmptyBlocks()
          editor.selection.restore()
        }

        editor.undo.saveStep()
      }
    }
  }

  function _editorKeydownHandler(e) {
    const key_code = e.which

    if ($current_image && (key_code == FE.KEYCODE.BACKSPACE || key_code == FE.KEYCODE.DELETE)) {
      e.preventDefault()
      e.stopPropagation()
      remove()

      return false
    }
    else if ($current_image && key_code == FE.KEYCODE.ESC) {
      const $img = $current_image
      _exitEdit(true)
      editor.selection.setAfter($img.get(0))
      editor.selection.restore()
      e.preventDefault()

      return false
    }

    // Move cursor if left and right arrows are used.
    else if ($current_image && (key_code == FE.KEYCODE.ARROW_LEFT || key_code == FE.KEYCODE.ARROW_RIGHT)) {
      const img = $current_image.get(0)
      _exitEdit(true)

      if (key_code == FE.KEYCODE.ARROW_LEFT) {
        editor.selection.setBefore(img)
      }
      else {
        editor.selection.setAfter(img)
      }

      editor.selection.restore()
      e.preventDefault()

      return false
    }
    else if ($current_image && key_code === FE.KEYCODE.TAB) {
      e.preventDefault()
      e.stopPropagation()
      _exitEdit(true)

      return false
    }
    else if ($current_image && key_code != FE.KEYCODE.F10 && !editor.keys.isBrowserAction(e)) {
      e.preventDefault()
      e.stopPropagation()

      return false
    }
  }

  /**
   * Do some cleanup on images.
   */
  function _cleanOnGet(el) {

    // Tag is image.
    if (el && el.tagName == 'IMG') {

      // Remove element if it has class fr-uploading or fr-error.
      if (editor.node.hasClass(el, 'fr-uploading') || editor.node.hasClass(el, 'fr-error')) {
        el.parentNode.removeChild(el)
      }

      // Remove class if it is draggable.
      else if (editor.node.hasClass(el, 'fr-draggable')) {
        el.classList.remove('fr-draggable')
      }

      if (el.parentNode && el.parentNode.parentNode && editor.node.hasClass(el.parentNode.parentNode, 'fr-img-caption')) {
        const p_node = el.parentNode.parentNode
        p_node.removeAttribute('contenteditable')
        p_node.removeAttribute('draggable')
        p_node.classList.remove('fr-draggable')

        const n_node = el.nextSibling

        if (n_node) {
          n_node.removeAttribute('contenteditable')
        }
      }
    }

    // Look for inner nodes that might be in a similar case.
    else if (el && el.nodeType == Node.ELEMENT_NODE) {
      const imgs = el.querySelectorAll('img.fr-uploading, img.fr-error, img.fr-draggable')

      for (let i = 0; i < imgs.length; i++) {
        _cleanOnGet(imgs[i])
      }
    }
  }

  /**
   * Initialization.
   */
  function _init() {
    _initEvents()

    // Init on image.
    if (editor.el.tagName == 'IMG') {
      editor.$el.addClass('fr-view')
    }

    if (editor.helpers.isMobile()) {
      editor.events.$on(editor.$el, 'touchstart', editor.el.tagName == 'IMG' ? null : 'img:not([contenteditable="false"])', function () {
        touchScroll = false
      })

      editor.events.$on(editor.$el, 'touchmove', function () {
        touchScroll = true
      })
    }

    if (editor.$wp) {
      editor.events.on('window.keydown keydown', _editorKeydownHandler, true)

      editor.events.on('keyup', function (e) {
        if ($current_image && e.which == FE.KEYCODE.ENTER) {

          return false
        }
      }, true)

      // Prevent typing in image caption DOM structure.
      editor.events.$on(editor.$el, 'keydown', function () {
        let el = editor.selection.element()

        // Parent node of the current element.
        if (el.nodeType === Node.TEXT_NODE || (el.tagName == 'BR' && editor.node.isLastSibling(el))) {
          el = el.parentNode
        }

        if (!editor.node.hasClass(el, 'fr-inner')) {
          if (!editor.node.hasClass(el, 'fr-img-caption')) {
            el = $(el).parents('.fr-img-caption').get(0)
          }

          // Check if we are in image caption.
          if (editor.node.hasClass(el, 'fr-img-caption')) {
            $(el).after(FE.INVISIBLE_SPACE + FE.MARKERS);
            editor.selection.restore();
          }
        }
      })
    }
    else {
      editor.events.$on(editor.$win, 'keydown', _editorKeydownHandler)
    }

    // ESC from accessibility.
    editor.events.on('toolbar.esc', function () {
      if ($current_image) {
        if (editor.$wp) {
          editor.events.disableBlur()
          editor.events.focus()
        }
        else {
          const $img = $current_image
          _exitEdit(true)
          editor.selection.setAfter($img.get(0))
          editor.selection.restore()
        }

        return false
      }
    }, true)

    // focusEditor from accessibility.
    editor.events.on('toolbar.focusEditor', function () {
      if ($current_image) {

        return false
      }
    }, true)

    // Copy/cut image.
    editor.events.on('window.cut window.copy', function (e) {
      // Do copy only if image.edit popups is visible and not focused.
      if ($current_image && editor.popups.isVisible('image.edit') && !editor.popups.get('image.edit').find(':focus').length) {

        const $el = getEl()

        if (hasCaption()) {
          $el.before(FE.START_MARKER)
          $el.after(FE.END_MARKER)
          editor.selection.restore()
          editor.paste.saveCopiedText($el.get(0).outerHTML, $el.text())
        }
        else {
          editor.paste.saveCopiedText($current_image.get(0).outerHTML, $current_image.attr('alt'))
        }

        if (e.type == 'copy') {
          setTimeout(function () {
            _editImg($current_image)
          })
        }
        else {
          _exitEdit(true)
          editor.undo.saveStep()
          setTimeout(function () {
            editor.undo.saveStep()
          }, 0)
        }
      }
    }, true)

    // Fix IE copy not working when selection is collapsed.
    if (editor.browser.msie) {
      editor.events.on('keydown', function (e) {
        // Selection is collapsed and we have an image.
        if (!(editor.selection.isCollapsed() && $current_image)) return true

        const key_code = e.which

        // Copy.
        if (key_code == FE.KEYCODE.C && editor.keys.ctrlKey(e)) {
          editor.events.trigger('window.copy')
        }

        // Cut.
        else if (key_code == FE.KEYCODE.X && editor.keys.ctrlKey(e)) {
          editor.events.trigger('window.cut')
        }
      })
    }

    // Do not leave page while uploading.
    editor.events.$on($(editor.o_win), 'keydown', function (e) {
      const key_code = e.which

      if ($current_image && key_code == FE.KEYCODE.BACKSPACE) {
        e.preventDefault()

        return false
      }
    })

    // Check if image is uploading to abort it.
    editor.events.$on(editor.$win, 'keydown', function (e) {
      const key_code = e.which

      if ($current_image && $current_image.hasClass('fr-uploading') && key_code == FE.KEYCODE.ESC) {
        $current_image.trigger('abortUpload')
      }
    })

    editor.events.on('destroy', function () {
      if ($current_image && $current_image.hasClass('fr-uploading')) {
        $current_image.trigger('abortUpload')
      }
    })

    editor.events.on('paste.before', _clipboardPaste)
    editor.events.on('paste.beforeCleanup', _clipboardPasteCleanup)
    editor.events.on('paste.after', _uploadPastedImages)

    // Remove any fr-uploading / fr-error images.
    editor.events.on('html.processGet', _cleanOnGet)

    if (editor.opts.imageOutputSize) {
      let imgs

      editor.events.on('html.beforeGet', function () {
        imgs = editor.el.querySelectorAll('img')
        for (let i = 0; i < imgs.length; i++) {
          const width = imgs[i].style.width || $(imgs[i]).width()
          const height = imgs[i].style.height || $(imgs[i]).height()

          if (width) imgs[i].setAttribute('width', (`${width}`).replace(/px/, ''))

          if (height) imgs[i].setAttribute('height', (`${height}`).replace(/px/, ''))
        }
      })
    }

    if (editor.opts.iframe) {
      editor.events.on('image.loaded', editor.size.syncIframe)
    }

    editor.events.$on($(editor.o_win), 'orientationchange.image', function () {
      setTimeout(function () {
        if ($current_image) {
          _editImg($current_image)
        }
      }, 100)
    })

    _initEditPopup(true)
    _initInsertPopup(true)
    _initSizePopup(true)
    _initAltPopup(true)

    editor.events.on('node.remove', function ($node) {
      if ($node.get(0).tagName == 'IMG') {
        remove($node)

        return false
      }
    })

    editor.events.on('popups.hide.filesManager.insert', function ($node) {
      editor.filesManager.minimizePopup(current_index)
    })
  }

  function _processPastedImage(img) {
    if (editor.events.trigger('image.beforePasteUpload', [img]) === false) {

      return false
    }

    // Show the progress bar.
    $current_image = $(img)
    _repositionResizer()
    replace()
    showProgressBar()

    $current_image.on('load', function () {
      let loadEvents = []

      _repositionResizer()
      // https://github.com/froala/wysiwyg-editor/issues/3407
      if ($(editor.popups.get('filesManager.insert').get(0)).find('div.fr-active.fr-error').length < 1) {
        showProgressBar()
      }

      // https://github.com/froala-labs/froala-editor-js-2/issues/1866
      $(this).data('events').find(function(event) {
        if (event[0] === 'load') {
          loadEvents.push(event)
        }
      })
      
      // turn off the event if it is registered only once
      loadEvents.length <= 1 && $(this).off('load')
    })

    const splitSrc = $(img).attr('src').split(',')

    // Convert image to blob.
    const binary = atob(splitSrc[1])
    const array = []

    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i))
    }

    const upload_img = new Blob([new Uint8Array(array)], {
      type: splitSrc[0].replace(/data\:/g, '').replace(/;base64/g, '')
    })

    upload([upload_img], $current_image)
  }

  function _uploadPastedImages() {
    if (!editor.opts.imagePaste) {
      editor.$el.find('img[data-fr-image-pasted]').remove()
    }
    else {

      // Safari won't work https://bugs.webkit.org/show_bug.cgi?id=49141
      editor.$el.find('img[data-fr-image-pasted]').each(function (index, img) {
        if (editor.opts.imagePasteProcess) {
          let width = editor.opts.imageDefaultWidth

          if (width && width != 'auto') {
            width = width + (editor.opts.imageResizeWithPercent ? '%' : 'px')
          }
          $(img)
            .css('width', width)
            .removeClass('fr-dii fr-dib fr-fir fr-fil')

          _setStyleImage($(img), editor.opts.imageDefaultDisplay, editor.opts.imageDefaultAlign)
        }

        // Data images.
        if (img.src.indexOf('data:') === 0) {
          _processPastedImage(img)
        }

        // New way Safari is pasting images.
        else if (img.src.indexOf('blob:') === 0 || (img.src.indexOf('http') === 0 && editor.opts.imageUploadRemoteUrls && editor.opts.imageCORSProxy)) {
          const _img = new Image()
          _img.crossOrigin = 'Anonymous'
          _img.onload = function () {
            // Create canvas.
            const canvas = editor.o_doc.createElement('CANVAS')
            const context = canvas.getContext('2d')

            // Set height.
            canvas.height = this.naturalHeight
            canvas.width = this.naturalWidth

            // Draw image.
            context.drawImage(this, 0, 0)

            // pushing the execution at end of the stack
            setTimeout(function () {
              _processPastedImage(img)
            }, 0)

            let imgExt

            if (this.naturalWidth > 2000 || this.naturalHeight > 1500) {
              imgExt = 'jpeg' // if images are too large
            }
            else {
              imgExt = 'png'
            }
            // Update image and process it.
            img.src = canvas.toDataURL(`image/${imgExt}`)
          }
          _img.src = (img.src.indexOf('blob:') === 0 ? '' : (`${editor.opts.imageCORSProxy}/`)) + img.src
        }

        // Images without http (Safari ones.).
        else if (img.src.indexOf('http') !== 0 || img.src.indexOf('https://mail.google.com/mail') === 0) {
          editor.selection.save()
          $(img).remove()
          editor.selection.restore()
        }
        else {
          $(img).removeAttr('data-fr-image-pasted')
        }
      })
    }
  }

  function _clipboardImageLoaded(e) {
    const result = e.target.result

    // Default width.
    let width = editor.opts.imageDefaultWidth

    if (width && width != 'auto') {
      width = width + (editor.opts.imageResizeWithPercent ? '%' : 'px')
    }

    editor.undo.saveStep()

    editor.html.insert(`<img data-fr-image-pasted="true" src="${result}"${(width ? ` style="width: ${width};"` : '')}>`)

    const $img = editor.$el.find('img[data-fr-image-pasted="true"]')

    if ($img) {
      _setStyleImage($img, editor.opts.imageDefaultDisplay, editor.opts.imageDefaultAlign)
    }

    editor.events.trigger('paste.after')
  }

  function _processsClipboardPaste(file) {
    const reader = new FileReader()
    reader.onload = _clipboardImageLoaded
    reader.readAsDataURL(file)
  }

  function _clipboardPaste(e) {
    if (e && e.clipboardData && e.clipboardData.items) {

      let file = null

      if (!((e.clipboardData.types && [].indexOf.call(e.clipboardData.types, 'text/rtf') != -1) || e.clipboardData.getData('text/rtf'))) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          file = e.clipboardData.items[i].getAsFile()

          if (file) {
            break
          }
        }
      }
      else {
        file = e.clipboardData.items[0].getAsFile()
      }

      if (file) {
        _processsClipboardPaste(file)

        return false
      }
    }
  }

  function _clipboardPasteCleanup(clipboard_html) {
    clipboard_html = clipboard_html.replace(/<img /gi, '<img data-fr-image-pasted="true" ')

    return clipboard_html
  }

  /**
   * Start edit.
   */
  let touchScroll

  function _edit(e) {
    if ($(this).parents('[contenteditable]').not('.fr-element').not('.fr-img-caption').not('body').first().attr('contenteditable') == 'false') return true

    if (e && e.type == 'touchend' && touchScroll) {

      return true
    }

    if (e && editor.edit.isDisabled()) {
      e.stopPropagation()
      e.preventDefault()

      return false
    }

    // Hide resizer for other instances.
    for (let i = 0; i < FE.INSTANCES.length; i++) {
      if (FE.INSTANCES[i] != editor) {
        FE.INSTANCES[i].events.trigger('image.hideResizer')
      }
    }

    editor.toolbar.disable()

    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }

    // Hide keyboard.
    if (editor.helpers.isMobile()) {
      editor.events.disableBlur()
      editor.$el.blur()
      editor.events.enableBlur()
    }

    if (editor.opts.iframe) {
      editor.size.syncIframe()
    }

    // Store current image.
    $current_image = $(this)

    // Reposition resizer.
    _repositionResizer()

    // Issue 2801
    if (editor.browser.msie) {
      if (editor.popups.areVisible()) {
        editor.events.disableBlur()
      }

      if (editor.win.getSelection) {
        editor.win.getSelection().removeAllRanges()
        editor.win.getSelection().addRange(editor.doc.createRange())
      }
    }
    else {
      editor.selection.clear()
    }

    // Fix for image remaining selected.
    if (editor.helpers.isIOS()) {
      editor.events.disableBlur()
      editor.$el.blur()
    }

    // Refresh buttons.
    editor.button.bulkRefresh()
    editor.events.trigger('video.hideResizer')
  }

  /**
   * Exit edit.
   */

  function _exitEdit(force_exit) {
    if ($current_image && (_canExit() || force_exit === true)) {
      editor.toolbar.enable()
      $image_resizer && $image_resizer.removeClass('fr-active')
      editor.popups.hide('image.edit')
      $current_image = null
      _unmarkExit()

      $handler = null

      if ($overlay) {
        $overlay.hide()
      }
    }
  }

  let img_exit_flag = false

  function _markExit() {
    img_exit_flag = true
  }

  function _unmarkExit() {
    img_exit_flag = false
  }

  function _canExit() {

    return img_exit_flag
  }

  function _setStyleVideo($video, _display, _align) {
    if (!editor.opts.htmlUntouched && editor.opts.useClasses) {
      $video.removeClass('fr-fvl fr-fvr fr-dvb fr-dvi') 
      $video.addClass(`fr-fv${_align[0]} fr-dv${_display[0]}`) 
    }
    else {
      if (_display == 'inline') {
        $video.css({
          display: 'inline-block'
        })

        if (_align == 'center') {
          $video.css({
            'float': 'none'
          })
        }
        else if (_align == 'left') {
          $video.css({
            'float': 'left'
          })
        }
        else {
          $video.css({
            'float': 'right'
          })
        }
      }
      else {
        $video.css({
          display: 'block',
          clear: 'both'
        })

        if (_align == 'left') {
          $video.css({
            textAlign: 'left'
          })
        }
        else if (_align == 'right') {
          $video.css({
            textAlign: 'right'
          })
        }
        else {
          $video.css({
            textAlign: 'center'
          })
        }
      }
    }
  }


  /**
   * Set style for image.
   */
  function _setStyleImage($img, _display, _align) {

    if (!editor.opts.htmlUntouched && editor.opts.useClasses) {
      $img.removeClass('fr-fil fr-fir fr-dib fr-dii')

      if (_align) {
        $img.addClass(`fr-fi${_align[0]}`)
      }

      if (_display) {
        $img.addClass(`fr-di${_display[0]}`)
      }
    }
    else {
      if (_display == 'inline') {
        $img.css({
          display: 'inline-block',
          verticalAlign: 'bottom',
          margin: editor.opts.imageDefaultMargin
        })

        if (_align == 'center') {
          $img.css({
            'float': 'none',
            marginBottom: '',
            marginTop: '',
            maxWidth: `calc(100% - ${(2 * editor.opts.imageDefaultMargin)}px)`,
            textAlign: 'center'
          })
        }
        else if (_align == 'left') {
          $img.css({
            'float': 'left',
            marginLeft: 0,
            maxWidth: `calc(100% - ${editor.opts.imageDefaultMargin}px)`,
            textAlign: 'left'
          })
        }
        else {
          $img.css({
            'float': 'right',
            marginRight: 0,
            maxWidth: `calc(100% - ${editor.opts.imageDefaultMargin}px)`,
            textAlign: 'right'
          })
        }
      }
      else if (_display == 'block') {
        $img.css({
          display: 'block',
          'float': 'none',
          verticalAlign: 'top',
          margin: `${editor.opts.imageDefaultMargin}px auto`,
          textAlign: 'center'
        })

        if (_align == 'left') {
          $img.css({
            marginLeft: 0,
            textAlign: 'left'
          })
        }
        else if (_align == 'right') {
          $img.css({
            marginRight: 0,
            textAlign: 'right'
          })
        }
      }
    }
  }
 
  /**
   * Get the current image.
   */

  function get() {

    return $current_image
  }

  function getEl() {
    return hasCaption() ? $current_image.parents('.fr-img-caption').first() : $current_image
  }

  /**
   * Apply specific style.
   */

  function applyStyle(val, imageStyles, multipleStyles) {
    if (typeof imageStyles == 'undefined') imageStyles = editor.opts.imageStyles

    if (typeof multipleStyles == 'undefined') multipleStyles = editor.opts.imageMultipleStyles

    if (!$current_image) return false

    const $img = getEl()

    // Remove multiple styles.
    if (!multipleStyles) {
      const styles = Object.keys(imageStyles)
      styles.splice(styles.indexOf(val), 1)
      $img.removeClass(styles.join(' '))
    }

    if (typeof imageStyles[val] == 'object') {
      $img.removeAttr('style')
      $img.css(imageStyles[val].style)
    }
    else {
      $img.toggleClass(val)
    }

    _editImg($current_image)
  }

  function hasCaption() {
    if ($current_image) {
      return $current_image.parents('.fr-img-caption').length > 0
    }

    return false
  }

  function refreshEmbedButton($btn) {
    const $popup = editor.popups.get('filesManager.insert')
    if ($popup && $popup.find('.fr-files-embed-layer').hasClass('fr-active')) {
      $btn.addClass('fr-active').attr('aria-pressed', true)
    }
  }

  function toggleCaption() {
    let $el

    if ($current_image && !hasCaption()) {
      $el = $current_image

      // Check if there is a link wrapping the image.
      if ($current_image.parent().is('a')) {
        $el = $current_image.parent()
      }

      // code start https://github.com/froala-labs/froala-editor-js-2/issues/1864

      // check the li placement
      var $listParent = $current_image.parents('ul') && $current_image.parents('ul').length > 0 ? $current_image.parents('ul') : $current_image.parents('ol') && $current_image.parents('ol').length > 0 ? $current_image.parents('ol') : [];
      if ($listParent.length > 0) {
        var totLi = $listParent.find('li').length,
          $currLi = $current_image.parents('li'),
          $newLi = document.createElement("li");;
        
        if ((totLi - 1) === $currLi.index()) { // if li placement last then add one extra li
          $listParent.append($newLi);
          $newLi.innerHTML = '&nbsp;';
        }
      }

      let splitAttrs
      let oldWidth

      if ($el.attr('style')) {
        splitAttrs = $el.attr('style').split(':')
        oldWidth = splitAttrs.indexOf('width') > -1 ? splitAttrs[splitAttrs.indexOf('width') + 1].replace(';', '') : ''
      }

      // Issue 2861
      const current_width = editor.opts.imageResizeWithPercent ? (oldWidth.indexOf('px') > -1 ? null : oldWidth) || '100%' : $current_image.width() + 'px'
  
      // https://github.com/froala-labs/froala-editor-js-2/issues/1864
      $el.wrap('<div class="fr-img-space-wrap"><span ' + (!editor.browser.mozilla ? 'contenteditable="false"' : '') + 'class="fr-img-caption ' + $current_image.attr('class') + '" style="' + (!editor.opts.useClasses ? $el.attr('style') : '') + '" draggable="false"></span><p class="fr-img-space-wrap2">&nbsp;</p></div>')
      $el.wrap('<span class="fr-img-wrap"></span>')
      $current_image.after(`<span class="fr-inner"${(!editor.browser.mozilla ? ' contenteditable="true"' : '')}>${FE.START_MARKER}${editor.language.translate('Image Caption')}${FE.END_MARKER}</span>`)
      $current_image.removeAttr('class').removeAttr('style').removeAttr('width')

      $current_image.parents('.fr-img-caption').css('width', current_width);

      _exitEdit(true)

      editor.selection.restore()
    }
    else {
      $el = getEl()
      $current_image.insertAfter($el)
      $current_image
        .attr('class', $el.attr('class').replace('fr-img-caption', ''))
        .attr('style', $el.attr('style'))
      $el.remove()

      _editImg($current_image)
    }
  }

  return {
    _init: _init,
    showInsertPopup: showInsertPopup,
    showLayer: showLayer,
    refreshUploadButton: refreshUploadButton,
    refreshByURLButton: refreshByURLButton,
    upload: upload,
    insertByURL: insertByURL,
    insertAllFiles: insertAllFiles,
    deleteAllFiles: deleteAllFiles,
    get: get,
    getEl: getEl,
    insert: insert,
    showProgressBar: showProgressBar,
    remove: remove,
    hideProgressBar: hideProgressBar,
    applyStyle: applyStyle,
    showAltPopup: showAltPopup,
    showSizePopup: showSizePopup,
    setAlt: setAlt,
    setSize: setSize,
    toggleCaption: toggleCaption,
    refreshEmbedButton: refreshEmbedButton,
    insertEmbed: insertEmbed,
    hasCaption: hasCaption,
    exitEdit: _exitEdit,
    edit: _editImg,
    cancelFileInsert: cancelFileInsert,
    minimizePopup: minimizePopup,
    editImage: editImage,
    saveImage: saveImage,
    _showErrorMessage: _showErrorMessage,
    _showFileErrorMessage: _showFileErrorMessage,
    getFileThumbnail: getFileThumbnail,
    deleteFile:deleteFile,
    checkAutoplay:checkAutoplay,
    checkInsertAllState:checkInsertAllState,
    _disableInsertCheckbox:_disableInsertCheckbox,
    _getFileType: _getFileType,
    isChildWindowOpen: isChildWindowOpen,
    setChildWindowState: setChildWindowState,
    resetAllFilesCheckbox: resetAllFilesCheckbox
  }
}

// Insert image button.
FE.DefineIcon('insertFiles', {
  NAME: 'image',
  SVG_KEY: 'fileManager'
})
FE.RegisterShortcut(FE.KEYCODE.P, 'insertFiles', null, 'P')
FE.RegisterCommand('insertFiles', {
  title: 'Insert Files',
  undo: false,
  focus: true,
  refreshAfterCallback: false,
  popup: true,
  callback: function () {
    if (!this.popups.isVisible('filesManager.insert')) {
      this.filesManager.showInsertPopup()
    }
    else {
      if (this.$el.find('.fr-marker').length) {
        this.events.disableBlur()
        this.selection.restore()
      }
      this.popups.hide('filesManager.insert')
    }
  },
  plugin: 'filesManager'
})


FE.DefineIcon('cloudIcon', {
  NAME: 'cloudIcon',
  SVG_KEY: 'uploadFiles'
})

// Image upload button inside the insert image popup.
FE.DefineIcon('filesUpload', {
  NAME: 'uploadFiles',
  SVG_KEY: 'uploadFiles'
})
FE.RegisterCommand('filesUpload', {
  title: 'Upload Files',
  undo: false,
  focus: false,
  toggle: true,
  callback: function () {
    this.filesManager.showLayer('files-upload')
  },
  refresh: function ($btn) {
    this.filesManager.refreshUploadButton($btn)
  }
})

// Image by URL button inside the insert image popup.
FE.DefineIcon('filesByURL', {
  NAME: 'link',
  SVG_KEY: 'insertLink'
})
FE.RegisterCommand('filesByURL', {
  title: 'By URL',
  undo: false,
  focus: false,
  toggle: true,
  callback: function () {
    this.filesManager.showLayer('files-by-url')
  },
  refresh: function ($btn) {
    this.filesManager.refreshByURLButton($btn)
  }
})

// image
// Video embed button inside the insert video popup.
FE.DefineIcon('filesEmbed', { NAME: 'code', SVG_KEY: 'codeView' })
FE.RegisterCommand('filesEmbed', {
  title: 'Embedded Code',
  undo: false,
  focus: false,
  toggle: true,
  callback: function () {
    this.filesManager.showLayer('files-embed')
  },
  refresh: function ($btn) {
    this.filesManager.refreshEmbedButton($btn)
  }
})

FE.DefineIcon('insertAll', { NAME: 'insertAll', SVG_KEY: 'fileInsert' })
FE.RegisterCommand('insertAll', {
  title: 'Insert',
  undo: false,
  focus: false,
  toggle: true,
  disabled: true,
  callback: function () {
    this.filesManager.insertAllFiles()
  }
})

FE.DefineIcon('deleteAll', { NAME: 'remove', SVG_KEY: 'remove' })
FE.RegisterCommand('deleteAll', {
  title: 'Delete',
  undo: false,
  focus: false,
  toggle: true,
  disabled: true,
  callback: function () {
    this.filesManager.deleteAllFiles()
  }
})

FE.DefineIcon('cancel', { NAME: 'cancel', SVG_KEY: 'cancel' })
FE.RegisterCommand('cancel', {
  title: 'Cancel',
  undo: false,
  focus: false,
  toggle: true,
  callback: function () {
    this.filesManager.cancelFileInsert() 
  },
  refresh: function ($btn) {
  }
})

FE.DefineIcon('minimize', { NAME: 'minimize', SVG_KEY: 'minimize' })
FE.RegisterCommand('minimize', {
  title: 'Minimize',
  undo: false,
  focus: false,
  toggle: true,
  callback: function () {
    this.filesManager.minimizePopup("image.insert", true);
  },
  refresh: function ($btn) {
    this.filesManager.refreshEmbedButton($btn)
  }
})


// Insert image button inside the insert by URL layer.
FE.RegisterCommand('filesInsertByURL', {
  title: 'Insert Image',
  undo: true,
  refreshAfterCallback: false,
  callback: function () {
    this.filesManager.insertByURL()
  },
  refresh: function ($btn) {
      $btn.text(this.language.translate('Add'))
  }
})

// Insert image button inside the insert by upload layer.
FE.RegisterCommand('imageInsertByUpload', {
  title: 'Insert',
  undo: true,
  refreshAfterCallback: false,
  callback: function (cmd, val) {
  },
  refresh: function ($btn) {
  }
})

// View image
FE.RegisterCommand('viewImage', {
  title: 'View Image',
  undo: true,
  refreshAfterCallback: false,
  callback: function (cmd, val) {
    
  },
  refresh: function ($btn) {
  }
})

// Embed Insert
FE.RegisterCommand('insertEmbed', {	
  undo: true,
  focus: true,
  callback: function () {
    this.filesManager.insertEmbed()
    this.popups.get('filesManager.insert').find('textarea')[0].value=''
    this.popups.get('filesManager.insert').find('textarea').removeClass('fr-not-empty')
  }	
})

FE.RegisterCommand('filesDismissError', {
  title: 'OK',
  undo: false,
  callback: function () {	
    this.filesManager.hideProgressBar(true)	
  }	
})
