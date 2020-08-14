import './polyfills.js'

import defaults from './defaults.js'

function FroalaEditor(selector, options, initCallback) {
  if (typeof selector === 'string') {
    let els = document.querySelectorAll(selector)
    if (options && options.iframe_document) {
      els = options.iframe_document.querySelectorAll(selector)
    }
    const inst = []
    for (let i = 0; i < els.length; i++) {
      let existing_instance = els[i]['data-froala.editor'];

      if (existing_instance) {
        console.warn('Froala Editor instance already exists.');
        inst.push(existing_instance);
      }
      else {
        inst.push(new FroalaEditor.Bootstrap(els[i], options, initCallback))
      }
    }

    // Only one element.
    if (inst.length == 1) {
      return inst[0]
    }

    return inst
  }

  return new FroalaEditor.Bootstrap(selector, options, initCallback)
}

FroalaEditor.RegisterPlugins = function (plgList) {
  for (let i = 0; i < plgList.length; i++) {
    plgList[i].call(FroalaEditor)
  }
}

Object.assign(FroalaEditor, defaults)

export default FroalaEditor