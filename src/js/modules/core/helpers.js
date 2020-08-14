import FE from '../../editor.js'

//https://github.com/froala-labs/froala-editor-js-2/issues/1878
//Screen Size constants
FE.XS = 0
FE.SM = 1
FE.MD = 2
FE.LG = 3
const screenSm=768
const screenMd=992
const screenLg=1200

// Chars to allow.
const x = 'a-z\\u0080-\\u009f\\u00a1-\\uffff0-9-_\\.'

// Common regex to avoid double chars.
FE.LinkRegExCommon = `[${x}]{1,}`

// PORT:something_else.php
FE.LinkRegExEnd = '((:[0-9]{1,5})|)(((\\/|\\?|#)[a-z\\u00a1-\\uffff0-9@?\\|!^=%&amp;\\/~+#-\\\'*-_{}]*)|())'

// Common TLD
FE.LinkRegExTLD = `((${FE.LinkRegExCommon})(\\.(com|net|org|edu|mil|gov|co|biz|info|me|dev)))`

// Starts with HTTP.
FE.LinkRegExHTTP = `((ftp|http|https):\\/\\/${FE.LinkRegExCommon})`

// Authenticate with HTTP.
FE.LinkRegExAuth = `((ftp|http|https):\\/\\/[\\u0021-\\uffff]{1,}@${FE.LinkRegExCommon})`

// Starts with WWWW.
FE.LinkRegExWWW = `(www\\.${FE.LinkRegExCommon}\\.[a-z0-9-]{2,24})`

// Join.
FE.LinkRegEx =  `(${FE.LinkRegExTLD}|${FE.LinkRegExHTTP}|${FE.LinkRegExWWW}|${FE.LinkRegExAuth})${FE.LinkRegExEnd}`

// Link protocols.
FE.LinkProtocols = ['mailto', 'tel', 'sms', 'notes', 'data']

// https://davidcel.is/posts/stop-validating-email-addresses-with-regex/
FE.MAIL_REGEX = /.+@.+\..+/i

FE.MODULES.helpers = function (editor) {
  const $ = editor.$

  /**
   * Get the IE version.
   */
  function _ieVersion() {

    /* global navigator */
    let rv = -1
    let ua
    let re

    if (navigator.appName === 'Microsoft Internet Explorer') {
      ua = navigator.userAgent
      re = new RegExp('MSIE ([0-9]{1,}[\\.0-9]{0,})')

      if (re.exec(ua) !== null) {
        rv = parseFloat(RegExp.$1)
      }
    }
    else if (navigator.appName === 'Netscape') {
      ua = navigator.userAgent
      re = new RegExp('Trident/.*rv:([0-9]{1,}[\\.0-9]{0,})')

      if (re.exec(ua) !== null) {
        rv = parseFloat(RegExp.$1)
      }
    }

    return rv
  }

  /**
   * Determine the browser.
   */
  function _browser() {
    const browser = {}
    const ie_version = _ieVersion()

    if (ie_version > 0) {
      browser.msie = true
    }
    else {
      const ua = navigator.userAgent.toLowerCase()

      const match =
          /(edge)[ /]([\w.]+)/.exec(ua) ||
          /(chrome)[ /]([\w.]+)/.exec(ua) ||
          /(webkit)[ /]([\w.]+)/.exec(ua) ||
          /(opera)(?:.*version|)[ /]([\w.]+)/.exec(ua) ||
          /(msie) ([\w.]+)/.exec(ua) ||
          ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
          []

      const matched = {
        browser: match[1] || '',
        version: match[2] || '0'
      }

      if (match[1]) {
        browser[matched.browser] = true
      }

      // Chrome is Webkit, but Webkit is also Safari.
      if (browser.chrome) {
        browser.webkit = true
      }
      else if (browser.webkit) {
        browser.safari = true
      }
    }

    if (browser.msie) {
      browser.version = ie_version
    }

    return browser
  }

  function isIOS() {

    return /(iPad|iPhone|iPod)/g.test(navigator.userAgent) && !isWindowsPhone()
  }

  function isAndroid() {

    return /(Android)/g.test(navigator.userAgent) && !isWindowsPhone()
  }

  function isBlackberry() {

    return /(Blackberry)/g.test(navigator.userAgent)
  }

  function isWindowsPhone() {

    return /(Windows Phone)/gi.test(navigator.userAgent)
  }

  function isMobile() {

    return isAndroid() || isIOS() || isBlackberry()
  }

  function requestAnimationFrame() {

    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||

        function (callback) {
          window.setTimeout(callback, 1000 / 60)
        }
  }

  function getPX(val) {

    return parseInt(val, 10) || 0
  }

  //https://github.com/froala-labs/froala-editor-js-2/issues/1878
  //ScreenSize calculation on the fr-box class
  function screenSize() {
    try {
      const width = $('.fr-box').width();

      if(width < screenSm)
      {
        return FE.XS
      }
      if(width >= screenSm && width < screenMd)
      {
        return FE.SM
      }
      if(width >= screenMd && width < screenLg)
      {
        return FE.MD
      }
      if(width >= screenLg)
      {
        return FE.LG
      }
    }
    catch (ex) {
      return FE.LG
    }
  }

  function isTouch() {

    return 'ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch
  }

  function isURL(url) {
    // Check if it starts with http.
    if (!/^(https?:|ftps?:|)\/\//i.test(url)) {
      return false
    }

    url = String(url)
      .replace(/</g, '%3C')
      .replace(/>/g, '%3E')
      .replace(/"/g, '%22')
      .replace(/ /g, '%20')

    const test_reg = new RegExp(`^${FE.LinkRegExHTTP}${FE.LinkRegExEnd}$`, 'gi')

    return test_reg.test(url)
  }

  function isEmail(url) {
    if (/^(https?:|ftps?:|)\/\//i.test(url)) {
      return false
    }

    return FE.MAIL_REGEX.test(url)
  }

  // Sanitize URL.
  function sanitizeURL(url) {
    const local_path = /^([A-Za-z]:(\\){1,2}|[A-Za-z]:((\\){1,2}[^\\]+)+)(\\)?$/i

    if (/^(https?:|ftps?:|)\/\//i.test(url)) {
      return url
    }
    else if (local_path.test(url)) {
      return url
    }
    else if (new RegExp(`^(${FE.LinkProtocols.join('|')}):`, 'i').test(url)) {
      return url
    }

    url = encodeURIComponent(url)
      .replace(/%23/g, '#')
      .replace(/%2F/g, '/')
      .replace(/%25/g, '%')
      .replace(/mailto%3A/gi, 'mailto:')
      .replace(/file%3A/gi, 'file:')
      .replace(/sms%3A/gi, 'sms:')
      .replace(/tel%3A/gi, 'tel:')
      .replace(/notes%3A/gi, 'notes:')
      .replace(/data%3Aimage/gi, 'data:image')
      .replace(/blob%3A/gi, 'blob:')
      .replace(/%3A(\d)/gi, ':$1')
      .replace(/webkit-fake-url%3A/gi, 'webkit-fake-url:')
      .replace(/%3F/g, '?')
      .replace(/%3D/g, '=')
      .replace(/%26/g, '&')
      .replace(/&amp;/g, '&')
      .replace(/%2C/g, ',')
      .replace(/%3B/g, ';')
      .replace(/%2B/g, '+')
      .replace(/%40/g, '@')
      .replace(/%5B/g, '[')
      .replace(/%5D/g, ']')
      .replace(/%7B/g, '{')
      .replace(/%7D/g, '}')

    return url
  }

  function isArray(obj) {

    return obj && !Object.prototype.propertyIsEnumerable.call(obj, 'length') &&

        typeof obj === 'object' && typeof obj.length === 'number'
  }

  /*
   * Transform RGB color to hex value.
   */
  function RGBToHex(rgb) {
    function hex(x) {

      return `0${parseInt(x, 10).toString(16)}`.slice(-2)
    }

    try {

      if (!rgb || rgb === 'transparent') {
        return ''
      }

      if (/^#[0-9A-F]{6}$/i.test(rgb)) {
        return rgb
      }

      rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)

      return `#${hex(rgb[1])}${hex(rgb[2])}${hex(rgb[3])}`.toUpperCase()
    }
    catch (ex) {

      return null
    }
  }

  function HEXtoRGB(hex) {

    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i

    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b)

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

    return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : ''
  }

  /*
   * Get block alignment.
   */
  let default_alignment

  function getAlignment($block) {
    if (!$block.css) {
      $block = $($block)
    }

    let alignment = ($block.css('text-align') || '').replace(/-(.*)-/g, '')

    // Detect rtl.
    if (['left', 'right', 'justify', 'center'].indexOf(alignment) < 0) {
      if (!default_alignment) {
        const $div = $(`<div dir="${editor.opts.direction === 'rtl' ? 'rtl' : 'auto'}" style="text-align: ${editor.$el.css('text-align')}; position: fixed; left: -3000px;"><span id="s1">.</span><span id="s2">.</span></div>`)
        $('body').first().append($div)

        const l1 = $div.find('#s1').get(0).getBoundingClientRect().left
        const l2 = $div.find('#s2').get(0).getBoundingClientRect().left

        $div.remove()

        default_alignment = l1 < l2 ? 'left' : 'right'
      }

      alignment = default_alignment
    }

    return alignment
  }

  /**
   * Check if is mac.
   */
  let is_mac = null

  function isMac() {
    if (is_mac === null) {
      is_mac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    }

    return is_mac
  }

  function scrollTop() {

    // Firefox, Chrome, Opera, Safari
    if (editor.o_win.pageYOffset) {
      return editor.o_win.pageYOffset
    }

    // Internet Explorer 6 - standards mode
    if (editor.o_doc.documentElement && editor.o_doc.documentElement.scrollTop) {
      return editor.o_doc.documentElement.scrollTop
    }

    // Internet Explorer 6, 7 and 8
    if (editor.o_doc.body.scrollTop) {
      return editor.o_doc.body.scrollTop
    }

    return 0
  }

  function scrollLeft() {

    // Firefox, Chrome, Opera, Safari
    if (editor.o_win.pageXOffset) {
      return editor.o_win.pageXOffset
    }

    // Internet Explorer 6 - standards mode
    if (editor.o_doc.documentElement && editor.o_doc.documentElement.scrollLeft) {
      return editor.o_doc.documentElement.scrollLeft
    }

    // Internet Explorer 6, 7 and 8
    if (editor.o_doc.body.scrollLeft) {
      return editor.o_doc.body.scrollLeft
    }

    return 0
  }

  // https://stackoverflow.com/a/7557433/1806855
  function isInViewPort(el) {
    let rect = el.getBoundingClientRect()

    // Round for FF.
    rect = {
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom)
    }

    return (
      rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) || // Top is higher than 0 and bottom is smaller than the window height.
        rect.top <= 0 && rect.bottom >= (window.innerHeight || document.documentElement.clientHeight) // Top is smaller than 0 and bottom is higher than window height.
    )
  }

  /**
   * Tear up.
   */
  function _init() {
    editor.browser = _browser()
  }

  return {
    _init,
    isIOS,
    isMac,
    isAndroid,
    isBlackberry,
    isWindowsPhone,
    isMobile,
    isEmail,
    requestAnimationFrame,
    getPX,
    screenSize,
    isTouch,
    sanitizeURL,
    isArray,
    RGBToHex,
    HEXtoRGB,
    isURL,
    getAlignment,
    scrollTop,
    scrollLeft,
    isInViewPort
  }
}
