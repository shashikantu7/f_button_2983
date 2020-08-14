import FE from '../../../editor.js'

// Extend defaults.
Object.assign(FE.DEFAULTS, {
  language: null
})

FE.LANGUAGE = {}

FE.MODULES.language = function (editor) {
  let lang

  /**
   * Translate.
   */
  function translate(str) {
    if (lang && lang.translation[str] && lang.translation[str].length) {
      return lang.translation[str]
    }

    return str

  }

  /* Initialize */
  function _init() {

    // Load lang.
    if (FE.LANGUAGE) {
      lang = FE.LANGUAGE[editor.opts.language]
    }

    // Set direction.
    if (lang && lang.direction) {
      editor.opts.direction = lang.direction
    }
  }

  return {
    _init,
    translate
  }
}

