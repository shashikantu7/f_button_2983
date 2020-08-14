import FE from '../index.js'
'use strict';

Object.assign(FE.POPUP_TEMPLATES, {
  'file.insert': '[_BUTTONS_][_UPLOAD_LAYER_][_PROGRESS_BAR_]'
})

// Extend defaults.
Object.assign(FE.DEFAULTS, {
  fileUpload: true,
  fileUploadURL: null,
  fileUploadParam: 'file',
  fileUploadParams: {},
  fileUploadToS3: false,
  fileUploadToAzure: false,
  fileUploadMethod: 'POST',
  fileMaxSize: 10 * 1024 * 1024,
  fileAllowedTypes: ['*'],
  fileInsertButtons: ['fileBack', '|'],
  fileUseSelectedText: false
})

FE.PLUGINS.file = function (editor) {
  const { $ } = editor
  const DEFAULT_FILE_UPLOAD_URL = 'https://i.froala.com/upload'

  const BAD_LINK = 1
  const MISSING_LINK = 2
  const ERROR_DURING_UPLOAD = 3
  const BAD_RESPONSE = 4
  const MAX_SIZE_EXCEEDED = 5
  const BAD_FILE_TYPE = 6
  const NO_CORS_IE = 7

  const error_messages = {}
  error_messages[BAD_LINK] = 'File cannot be loaded from the passed link.'
  error_messages[MISSING_LINK] = 'No link in upload response.'
  error_messages[ERROR_DURING_UPLOAD] = 'Error during file upload.'
  error_messages[BAD_RESPONSE] = 'Parsing response failed.'
  error_messages[MAX_SIZE_EXCEEDED] = 'File is too large.'
  error_messages[BAD_FILE_TYPE] = 'File file type is invalid.'
  error_messages[NO_CORS_IE] = 'Files can be uploaded only to same domain in IE 8 and IE 9.'

  function showInsertPopup() {
    const $btn = editor.$tb.find('.fr-command[data-cmd="insertFile"]')

    let $popup = editor.popups.get('file.insert')

    if (!$popup) $popup = _initInsertPopup()

    hideProgressBar()

    if (!$popup.hasClass('fr-active')) {
      editor.popups.refresh('file.insert')
      editor.popups.setContainer('file.insert', editor.$tb)

      if ($btn.isVisible) {
        const { left, top } = editor.button.getPosition($btn)
        editor.popups.show('file.insert', left, top, $btn.outerHeight())
      }
      else {
        editor.position.forSelection($popup)
        editor.popups.show('file.insert')
      }
    }
  }

  /**
   * Show progress bar.
   */
  function showProgressBar() {
    let $popup = editor.popups.get('file.insert')

    if (!$popup) $popup = _initInsertPopup()

    $popup.find('.fr-layer.fr-active').removeClass('fr-active').addClass('fr-pactive')
    $popup.find('.fr-file-progress-bar-layer').addClass('fr-active')
    $popup.find('.fr-buttons').hide()

    _setProgressMessage(editor.language.translate('Uploading'), 0)
  }

  /**
   * Hide progress bar.
   */
  function hideProgressBar(dismiss) {
    const $popup = editor.popups.get('file.insert')

    if ($popup) {
      $popup.find('.fr-layer.fr-pactive').addClass('fr-active').removeClass('fr-pactive')
      $popup.find('.fr-file-progress-bar-layer').removeClass('fr-active')
      $popup.find('.fr-buttons').show()

      if (dismiss) {
        editor.events.focus()
        editor.popups.hide('file.insert')
      }
    }
  }

  /**
   * Set a progress message.
   */
  function _setProgressMessage(message, progress) {
    const $popup = editor.popups.get('file.insert')

    if ($popup) {
      const $layer = $popup.find('.fr-file-progress-bar-layer')
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
    const $popup = editor.popups.get('file.insert')
    const $layer = $popup.find('.fr-file-progress-bar-layer')
    $layer.addClass('fr-error')
    const $message_header = $layer.find('h3')
    $message_header.text(message)
    editor.events.disableBlur()
    $message_header.focus()
  }

  /**
   * Insert the uploaded file.
   */
  function insert(link, text, response) {
    editor.edit.on()

    // Focus in the editor.
    editor.events.focus(true)
    editor.selection.restore()

    if (editor.opts.fileUseSelectedText && editor.selection.text().length) {
      text = editor.selection.text()
    }

    // Insert the link.
    editor.html.insert(`<a href="${link}" target="_blank" id="fr-inserted-file" class="fr-file">${text}</a>`)

    // Get the file.
    const $file = editor.$el.find('#fr-inserted-file')

    $file.removeAttr('id')

    editor.popups.hide('file.insert')

    editor.undo.saveStep()

    _syncFiles()

    editor.events.trigger('file.inserted', [$file, response])
  }

  /**
   * Parse file response.
   */
  function _parseResponse(response) {
    try {
      if (editor.events.trigger('file.uploaded', [response], true) === false) {
        editor.edit.on()

        return false
      }

      const resp = JSON.parse(response)

      if (resp.link) {

        return resp
      }
      else {

        // No link in upload request.
        _throwError(MISSING_LINK, response)

        return false
      }
    }
    catch (ex) {

      // Bad response.
      _throwError(BAD_RESPONSE, response)

      return false
    }
  }

  /**
   * Parse file response.
   */
  function _parseXMLResponse(response) {
    try {
      const link = $(response).find('Location').text()
      const key = $(response).find('Key').text()

      if (editor.events.trigger('file.uploadedToS3', [link, key, response], true) === false) {
        editor.edit.on()

        return false
      }

      return link
    }
    catch (ex) {

      // Bad response.
      _throwError(BAD_RESPONSE, response)

      return false
    }
  }

  /**
   * File was uploaded to the server and we have a response.
   */
  function _fileUploaded(text, url, key) {
    const { status } = this
    const { response } = this
    const { responseXML } = this
    const { responseText } = this

    try {
      if (editor.opts.fileUploadToS3 || editor.opts.fileUploadToAzure) {
        if (status === 201) {
          let link
          if(editor.opts.fileUploadToAzure) {
            if (editor.events.trigger('file.uploadedToAzure', [this.responseURL, key, response], true) === false) {
              editor.edit.on()
              return false
            }
            link = url
          } else {
            link = _parseXMLResponse(responseXML)
          }

          if (link) {
            insert(link, text, response || responseXML)
          }
        }
        else {
          _throwError(BAD_RESPONSE, response || responseXML)
        }
      }
      else {
        if (status >= 200 && status < 300) {
          const resp = _parseResponse(responseText)

          if (resp) {
            insert(resp.link, text, response || responseText)
          }
        }
        else {
          _throwError(ERROR_DURING_UPLOAD, response || responseText)
        }
      }
    }
    catch (ex) {

      // Bad response.
      _throwError(BAD_RESPONSE, response || responseText)
    }
  }

  /**
   * File upload error.
   */
  function _fileUploadError() {
    _throwError(BAD_RESPONSE, this.response || this.responseText || this.responseXML)
  }

  /**
   * File upload progress.
   */
  function _fileUploadProgress(e) {
    if (e.lengthComputable) {
      const complete = (e.loaded / e.total * 100 | 0)
      _setProgressMessage(editor.language.translate('Uploading'), complete)
    }
  }

  /**
   * Throw an file error.
   */
  function _throwError(code, response) {
    editor.edit.on()
    _showErrorMessage(editor.language.translate('Something went wrong. Please try again.'))

    editor.events.trigger('file.error', [{
      code: code,
      message: error_messages[code]
    }, response])
  }

  /**
   * File upload aborted.
   */
  function _fileUploadAborted() {
    editor.edit.on()
    hideProgressBar(true)
  }

  function _browserUpload(file) {
    const reader = new FileReader()

    reader.onload = function () {
      let { result : link } = reader

      // Convert image to local blob.
      const binary = atob(reader.result.split(',')[1])
      const array = []

      for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i))
      }

      // Get local image link.
      link = window.URL.createObjectURL(new Blob([new Uint8Array(array)], {
        type: file.type
      }))

      editor.file.insert(link, file.name, null)
    }

    showProgressBar()

    reader.readAsDataURL(file)
  }


  function upload(files) {

    // Make sure we have what to upload.
    if (typeof files !== 'undefined' && files.length > 0) {

      // Check if we should cancel the file upload.
      if (editor.events.trigger('file.beforeUpload', [files]) === false) {

        return false
      }


      const file = files[0]

      // Upload as blob for testing purposes.
      if ((editor.opts.fileUploadURL === null || editor.opts.fileUploadURL === DEFAULT_FILE_UPLOAD_URL) && !editor.opts.fileUploadToS3 && !editor.opts.fileUploadToAzure) {
        _browserUpload(file)

        return false
      }

      // Check file max size.
      if (file.size > editor.opts.fileMaxSize) {
        _throwError(MAX_SIZE_EXCEEDED)

        return false
      }

      // Check file types.
      if (editor.opts.fileAllowedTypes.indexOf('*') < 0 && editor.opts.fileAllowedTypes.indexOf(file.type.replace(/file\//g, '')) < 0) {
        _throwError(BAD_FILE_TYPE)

        return false
      }

      // Create form Data.
      let form_data

      if (editor.drag_support.formdata) {
        form_data = editor.drag_support.formdata ? new FormData() : null
      }

      // Prepare form data for request.
      if (form_data) {
        let key

        // Upload to S3.
        if (editor.opts.fileUploadToS3 !== false) {
          form_data.append('key', editor.opts.fileUploadToS3.keyStart + (new Date()).getTime() + '-' + (file.name || 'untitled'))
          form_data.append('success_action_status', '201')
          form_data.append('X-Requested-With', 'xhr')
          form_data.append('Content-Type', file.type)

          for (key in editor.opts.fileUploadToS3.params) {
            if (editor.opts.fileUploadToS3.params.hasOwnProperty(key)) {
              form_data.append(key, editor.opts.fileUploadToS3.params[key])
            }
          }
        }

        // Add upload params.
        for (key in editor.opts.fileUploadParams) {
          if (editor.opts.fileUploadParams.hasOwnProperty(key)) {
            form_data.append(key, editor.opts.fileUploadParams[key])
          }
        }

        // Set the file in the request.
        form_data.append(editor.opts.fileUploadParam, file)

        // Create XHR request.
        let { fileUploadURL : url } = editor.opts

        if (editor.opts.fileUploadToS3) {
          if (editor.opts.fileUploadToS3.uploadURL) {
            url = editor.opts.fileUploadToS3.uploadURL
          }
          else {
            url = `https://${editor.opts.fileUploadToS3.region}.amazonaws.com/${editor.opts.fileUploadToS3.bucket}`
          }
        }
        let fileURL
        let azureKey
        let fileUploadMethod = editor.opts.fileUploadMethod
        if (editor.opts.fileUploadToAzure) {
          if (editor.opts.fileUploadToAzure.uploadURL) {
            url = `${editor.opts.fileUploadToAzure.uploadURL}/${file.name}`
          } else {
            url = encodeURI(`https://${editor.opts.fileUploadToAzure.account}.blob.core.windows.net/${editor.opts.fileUploadToAzure.container}/${file.name}`)
          }
          fileURL = url
          if (editor.opts.fileUploadToAzure.SASToken) {
            url +=  editor.opts.fileUploadToAzure.SASToken
          }
          fileUploadMethod = 'PUT'
        }        
        
        const xhr = editor.core.getXHR(url, fileUploadMethod)

        if (editor.opts.fileUploadToAzure) {
          let uploadDate = new Date().toUTCString()
          if (!editor.opts.fileUploadToAzure.SASToken && editor.opts.fileUploadToAzure.accessKey) {
            let azureAccount = editor.opts.fileUploadToAzure.account
            let azureContainer = editor.opts.fileUploadToAzure.container
            if(editor.opts.fileUploadToAzure.uploadURL) {
              let urls = editor.opts.fileUploadToAzure.uploadURL.split('/')
              azureContainer = urls.pop()
              azureAccount = urls.pop().split('.')[0]
            }
            let headerResource = `x-ms-blob-type:BlockBlob\nx-ms-date:${uploadDate}\nx-ms-version:2019-07-07`
            let urlResource = encodeURI('/' + azureAccount + '/' + azureContainer + '/' + file.name)
            let stringToSign = fileUploadMethod + '\n\n\n' + file.size + '\n\n' + file.type + '\n\n\n\n\n\n\n' + headerResource + '\n' + urlResource
            let signatureBytes = editor.cryptoJSPlugin.cryptoJS.HmacSHA256(stringToSign, editor.cryptoJSPlugin.cryptoJS.enc.Base64.parse(editor.opts.fileUploadToAzure.accessKey))
            let signature = signatureBytes.toString(editor.cryptoJSPlugin.cryptoJS.enc.Base64)
            let authHeader = 'SharedKey ' + azureAccount + ':' + signature
            azureKey = signature
            xhr.setRequestHeader("Authorization", authHeader)
          }
          xhr.setRequestHeader("x-ms-version", "2019-07-07")
          xhr.setRequestHeader("x-ms-date", uploadDate)
          xhr.setRequestHeader("Content-Type", file.type)
          xhr.setRequestHeader("x-ms-blob-type", "BlockBlob")
          for (key in editor.opts.fileUploadParams) {
            if (editor.opts.fileUploadParams.hasOwnProperty(key)) {
              xhr.setRequestHeader(key, editor.opts.fileUploadParams[key])
            }
          }
          for (key in editor.opts.fileUploadToAzure.params) {
            if (editor.opts.fileUploadToAzure.params.hasOwnProperty(key)) {
              xhr.setRequestHeader(key, editor.opts.fileUploadToAzure.params[key])
            }
          }
        }
        // Set upload events.
        xhr.onload = function () {
          _fileUploaded.call(xhr, file.name, fileURL, azureKey)
        }
        xhr.onerror = _fileUploadError
        xhr.upload.onprogress = _fileUploadProgress
        xhr.onabort = _fileUploadAborted

        showProgressBar()

        // editor.edit.off()

        const $popup = editor.popups.get('file.insert')

        if ($popup) {
          $popup.off('abortUpload')
          $popup.on('abortUpload', function () {
            if (xhr.readyState !== 4) {
              xhr.abort()
            }
          })
        }

        // Send data.
      xhr.send(editor.opts.fileUploadToAzure ? file : form_data)   
      }
    }
  }

  function _bindInsertEvents($popup) {

    // Drag over the dropable area.
    editor.events.$on($popup, 'dragover dragenter', '.fr-file-upload-layer', function () {
      $(this).addClass('fr-drop')

      return false
    }, true)

    // Drag end.
    editor.events.$on($popup, 'dragleave dragend', '.fr-file-upload-layer', function () {
      $(this).removeClass('fr-drop')

      return false
    }, true)

    // Drop.
    editor.events.$on($popup, 'drop', '.fr-file-upload-layer', function (e) {
      e.preventDefault()
      e.stopPropagation()

      $(this).removeClass('fr-drop')

      const { dataTransfer : dt } = e.originalEvent

      if (dt && dt.files) {
        const inst = $popup.data('instance') || editor
        inst.file.upload(dt.files)
      }
    }, true)

    if (editor.helpers.isIOS()) {
      editor.events.$on($popup, 'touchstart', '.fr-file-upload-layer input[type="file"]', function () {
        $(this).trigger('click')
      })
    }

    editor.events.$on($popup, 'change', '.fr-file-upload-layer input[type="file"]', function () {
      if (this.files) {
        const inst = $popup.data('instance') || editor

        inst.events.disableBlur()
        $popup.find('input:focus').blur()
        inst.events.enableBlur()

        inst.file.upload(this.files)
      }

      // Else IE 9 case.

      // Chrome fix.
      $(this).val('')
    }, true)
  }

  function _hideInsertPopup() {
    hideProgressBar()
  }

  function _initInsertPopup(delayed) {
    if (delayed) {
      editor.popups.onHide('file.insert', _hideInsertPopup)

      return true
    }

    // Image buttons.
    let file_buttons = ''

    if (!editor.opts.fileUpload) {
      editor.opts.fileInsertButtons.splice(editor.opts.fileInsertButtons.indexOf('fileUpload'), 1)
    }

    file_buttons = `<div class="fr-buttons fr-tabs">${editor.button.buildList(editor.opts.fileInsertButtons)}</div>`

    // File upload layer.
    let upload_layer = ''

    if (editor.opts.fileUpload) {
      upload_layer = `<div class="fr-file-upload-layer fr-layer fr-active" id="fr-file-upload-layer-${editor.id}"><strong>${editor.language.translate('Drop file')}</strong><br>(${editor.language.translate('or click')})<div class="fr-form"><input type="file" name="${editor.opts.fileUploadParam}" accept="${(editor.opts.fileAllowedTypes.indexOf('*') >= 0 ? '/' : '')}${editor.opts.fileAllowedTypes.join(', ').toLowerCase()}" tabIndex="-1" aria-labelledby="fr-file-upload-layer-${editor.id}" role="button"></div></div>`
    }


    // Progress bar.
    const progress_bar_layer = '<div class="fr-file-progress-bar-layer fr-layer"><h3 tabIndex="-1" class="fr-message">Uploading</h3><div class="fr-loader"><span class="fr-progress"></span></div><div class="fr-action-buttons"><button type="button" class="fr-command fr-dismiss" data-cmd="fileDismissError" tabIndex="2" role="button">OK</button></div></div>'

    const template = {
      buttons: file_buttons,
      upload_layer: upload_layer,
      progress_bar: progress_bar_layer
    }

    // Set the template in the popup.
    const $popup = editor.popups.create('file.insert', template)

    _bindInsertEvents($popup)

    return $popup
  }

  function _onRemove(link) {
    if (editor.node.hasClass(link, 'fr-file')) {

      return
    }
  }

  function _drop(e) {

    // Check if we are dropping files.
    const { dataTransfer : dt } = e.originalEvent

    if (dt && dt.files && dt.files.length) {
      const file = dt.files[0]

      if (file && typeof file.type !== 'undefined') {

        // Dropped file is an file that we allow.
        if (file.type.indexOf('image') < 0) {
          if (!editor.opts.fileUpload) {
            e.preventDefault()
            e.stopPropagation()

            return false
          }


          editor.markers.remove()
          editor.markers.insertAtPoint(e.originalEvent)
          editor.$el.find('.fr-marker').replaceWith(FE.MARKERS)

          // Hide popups.
          editor.popups.hideAll()

          // Show the file insert popup.
          let $popup = editor.popups.get('file.insert')

          if (!$popup) $popup = _initInsertPopup()
          editor.popups.setContainer('file.insert', editor.$sc)
          editor.popups.show('file.insert', e.originalEvent.pageX, e.originalEvent.pageY)
          showProgressBar()

          // Upload files.
          upload(dt.files)

          // Cancel anything else.
          e.preventDefault()
          e.stopPropagation()

          return false
        }
      }
      else if (file.type.indexOf('image') < 0) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
  }

  function _initEvents() {

    // Drop inside the editor.
    editor.events.on('drop', _drop)

    editor.events.$on(editor.$win, 'keydown', function (e) {
      const key_code = e.which
      const $popup = editor.popups.get('file.insert')

      if ($popup && key_code === FE.KEYCODE.ESC) {
        $popup.trigger('abortUpload')
      }
    })

    editor.events.on('destroy', function () {
      const $popup = editor.popups.get('file.insert')

      if ($popup) {
        $popup.trigger('abortUpload')
      }
    })
  }

  function back() {
    editor.events.disableBlur()
    editor.selection.restore()
    editor.events.enableBlur()

    editor.popups.hide('file.insert')
    editor.toolbar.showInline()
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

  /*
   * Initialize.
   */
  function _init() {
    _initEvents()

    editor.events.on('link.beforeRemove', _onRemove)

    if (editor.$wp) {
      _syncFiles()
      editor.events.on('contentChanged', _syncFiles)
    }

    _initInsertPopup(true)
  }

  return {
    _init: _init,
    showInsertPopup: showInsertPopup,
    upload: upload,
    insert: insert,
    back: back,
    hideProgressBar: hideProgressBar
  }
}

// Insert file button.
FE.DefineIcon('insertFile', {
  NAME: 'file-o',
  FA5NAME: 'file',
  SVG_KEY: 'insertFile'
})
FE.RegisterCommand('insertFile', {
  title: 'Upload File',
  undo: false,
  focus: true,
  refreshAfterCallback: false,
  popup: true,
  callback: function () {
    if (!this.popups.isVisible('file.insert')) {
      this.file.showInsertPopup()
    }
    else {
      if (this.$el.find('.fr-marker').length) {
        this.events.disableBlur()
        this.selection.restore()
      }
      this.popups.hide('file.insert');
    }
  },
  plugin: 'file'
})

FE.DefineIcon('fileBack', { NAME: 'arrow-left', SVG_KEY: 'back' })
FE.RegisterCommand('fileBack', {
  title: 'Back',
  undo: false,
  focus: false,
  back: true,
  refreshAfterCallback: false,
  callback: function () {
    this.file.back()
  },
  refresh: function ($btn) {
    if (!this.opts.toolbarInline) {
      $btn.addClass('fr-hidden')
      $btn.next('.fr-separator').addClass('fr-hidden')
    }
    else {
      $btn.removeClass('fr-hidden')
      $btn.next('.fr-separator').removeClass('fr-hidden')
    }
  }
})

FE.RegisterCommand('fileDismissError', {
  title: 'OK',
  callback: function () {
    this.file.hideProgressBar(true)
  }
})
