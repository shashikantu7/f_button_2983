import FE from '../index.js'

Object.assign(FE.DEFAULTS, {
  imageTUIOptions: {
    includeUI: {
      theme: {
        // main icons
        'menu.normalIcon.path': 'https://cdn.jsdelivr.net/npm/tui-image-editor@3.2.2/dist/svg/icon-d.svg',
        'menu.activeIcon.path': 'https://cdn.jsdelivr.net/npm/tui-image-editor@3.2.2/dist/svg/icon-b.svg',
        'menu.disabledIcon.path': 'https://cdn.jsdelivr.net/npm/tui-image-editor@3.2.2/dist/svg/icon-a.svg',
        'menu.hoverIcon.path': 'https://cdn.jsdelivr.net/npm/tui-image-editor@3.2.2/dist/svg/icon-c.svg',

        // submenu icons
        'submenu.normalIcon.path': 'https://cdn.jsdelivr.net/npm/tui-image-editor@3.2.2/dist/svg/icon-d.svg',
        'submenu.normalIcon.name': 'icon-d',
        'submenu.activeIcon.path': 'https://cdn.jsdelivr.net/npm/tui-image-editor@3.2.2/dist/svg/icon-c.svg',
        'submenu.activeIcon.name': 'icon-c'
      },
      initMenu: 'filter',
      menuBarPosition: 'left'
    }
  },
  tui: window.tui
})

FE.PLUGINS.imageTUI = function (editor) {
  const $ = editor.$
  let source = true
  // const current_image

  function _init() {
    const body = editor.o_doc.body

    const tuiContainer = editor.o_doc.createElement('div')
    tuiContainer.setAttribute('id', 'tuiContainer')
    tuiContainer.style.cssText = 'position: fixed; top: 0;left: 0;margin: 0;padding: 0;width: 100%;height: 100%;background: rgba(0,0,0,.5);z-index: 9998;display:none'
    body.appendChild(tuiContainer)
  }
  function launch(instance,callFromImagePlugin,index) {
    let current_image
    let current_image_src
    source = callFromImagePlugin
    if (typeof editor.opts.tui === 'object') {
      //const body = editor.o_doc.body
      const tuiEditorContainerDiv = editor.o_doc.createElement('div')
      tuiEditorContainerDiv.setAttribute('id', 'tuieditor')

      const popupContainer = editor.o_doc.getElementById('tuiContainer')
      popupContainer.appendChild(tuiEditorContainerDiv)
      popupContainer.style.display = 'block'
      if(callFromImagePlugin){
        current_image=  instance.image.get() 
        current_image_src=current_image[0].src
      }
      else{
        current_image= instance.filesManager.get()
          current_image_src = current_image.src; //current_image[0].src
      }
      
      const opts = editor.opts.imageTUIOptions
      opts.includeUI.loadImage = {
        path: current_image_src,
        name: ' '
      }
      const tuiEditorObject = new editor.opts.tui.ImageEditor(editor.o_doc.querySelector('#tuieditor'), opts)

      const canvasContainer = editor.o_doc.getElementById('tuieditor')
      canvasContainer.style.minHeight = (300 + 290) + 'px'
      canvasContainer.style.width = '94%'
      canvasContainer.style.height = '94%'
      canvasContainer.style.margin = 'auto'

      $('.tui-image-editor-header-buttons').html(
        '<button class="tui-editor-cancel-btn" data-cmd="cancel_tui_image">Cancel</button> <button class="tui-editor-save-btn">Save</button>'
      )

      $('.tui-editor-cancel-btn')[0].addEventListener('click', function (e) {
        destroyTuiEditor(popupContainer, instance)
      })

      $('.tui-editor-save-btn')[0].addEventListener('click',function (e) {
        if(index != null){
          saveTuiImage(tuiEditorObject, instance, current_image,callFromImagePlugin, index)  
        }
        else{
          saveTuiImage(tuiEditorObject, instance, current_image,callFromImagePlugin)
        }
        destroyTuiEditor(popupContainer, instance)
      })

    }

  }

  function destroyTuiEditor(container, instance) {
    $('#tuieditor').remove()
    container.style.display = 'none'
    if (!source  && instance !== undefined) {
      instance.filesManager.setChildWindowState(false)
    }
  }

  function saveTuiImage(tuiEditorObject, instance, current_image,callFromImagePlugin, index) {
    const savedImg = tuiEditorObject.toDataURL()
    const binary = atob(savedImg.split(',')[1])
    const array = []

    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i))
    }
    const upload_img = new Blob([new Uint8Array(array)], {
      type: 'image/png'
    })
    
    if (callFromImagePlugin) {
    instance.image.edit(current_image)
    instance.image.upload([upload_img])
    }
    else {
      instance.filesManager.saveImage([upload_img])
      if(index != null){
        instance.filesManager.upload(upload_img,[upload_img],null,index)
        instance.filesManager.getFileThumbnail(index, upload_img, true)
      }
      else {
        instance.filesManager.upload(upload_img,[upload_img],null,current_image)
      }
    }
  }

  return {
    _init: _init,
    launch: launch
  }

}

FE.DefineIcon('imageTUI', {
  NAME: 'sliders',
  FA5NAME: 'sliders-h',
  SVG_KEY: 'advancedImageEditor'
})

FE.RegisterCommand('imageTUI', {
  title: 'Advanced Edit',
  undo: false,
  focus: false,
  callback: function (cmd, val) {
    this.imageTUI.launch(this,true)
  },
  plugin: 'imageTUI'
})

// Look for image plugin.
if (!FE.PLUGINS.image) {
  throw new Error('TUI image editor plugin requires image plugin.')
}

FE.DEFAULTS.imageEditButtons.push('imageTUI')