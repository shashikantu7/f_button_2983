import FE from '../../editor.js'

FE.MODULES.data = function (editor) {
  const $ = editor.$

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const nolicense = 'sC-7OB2fwhVC4vsG-7ohPA4ZD4D-8f1J3stzB-11bFE2EE1MA2ND1KD1IE4cA-21pSD2D5ve1G3h1A8b1E5ZC3CD2FA16mC5OC5E1hpnG1NA10B1D7hkUD4I-7b2C3C5nXD2E3F3whidEC2EH3GI2mJE2E2bxci1WA10VC7pllSG2F3A7xd1A4ZC3DB2aaeGA2DE4H2E1j1ywD-13FD1A3VE4WA3D8C6wuc1A2hf1B5B7vnrrjA1B9ic1mpbD1oMB1iSB7rWC4RI4G-7upB6jd1A2F3H2EA4FD3kDF4A2moc1anJD1TD4VI4b2C7oeQF4c1E3XC7ZA3C3G3uDB2wGB6D1JC4D1JD4C1hTE6QC5pH4pD3C-22D7c1A3textAA4gdlB2mpozkmhNC1mrxA3yWA5edhg1I2H3B7ozgmvAI3I2B5GD1LD2RSNH1KA1XA5SB4PA3sA9tlmC-9tnf1G3nd1coBH4I2I2JC3C-16LE6A1tnUA3vbwQB1G3f1A20a3A8a1C6pxAB2eniuE1F3kH2lnjB2hB-16XA5PF1G4zwtYA5B-11mzTG2B9pHB3BE2hGH3B3B2cMD5C1F1wzPA8E7VG5H5vD3H-7C8tyvsVF2I1G2A5fE3bg1mgajoyxMA4fhuzSD8aQB2B4g1A20ukb1A4B3F3GG2CujjanIC1ObiB11SD1C5pWC1D4YB8YE5FE-11jXE2F-7jB4CC2G-10uLH4E1C2tA-13yjUH5d1H1A7sWD5E4hmjF-7pykafoGA16hDD4joyD-8OA33B3C2tC7cRE4SA31a1B8d1e2A4F4g1A2A22CC5zwlAC2C1A12=='
  let expired = 'sC-7OB2fwhVC4vsG-7ohPA4ZD4D-8f1J3stzB-11bFE2FC1A3NB2IF1HE1TH4WB8eB-11zVG2F3I3yYB5ZG4CB2DA15CC5AD3F1A1KG1oLA10B1A6wQF1H3vgale2C4F4XA2qc2A5D5B3pepmriKB3OE1HD1fUC10pjD-11E-11TB4YJ3bC-16zE-11yc1B2CE2BC3jhjKC1pdA-21OA6C1D5B-8vF4QA11pD6sqf1C3lldA-16BD4A2H3qoEA7bB-16rmNH5H1F1vSB7RE2A3TH4YC5A5b1A4d1B3whepyAC3AA2zknC3mbgf1SC4WH4PD8TC5ZB2C3H3jb2A5ZA2EF2aoFC5qqHC4B1H1zeGA7UA5RF4TA29TA6ZC4d1C3hyWA10A3rBB2E3decorationRD3QC10UD3E6E6ZD2F3F3fme2E5uxxrEC9C3E4fB-11azhHB1LD7D6VF4VVTPC6b1C4TYG3qzDD6B3B3AH4I2H2kxbHE1JD1yihfd1QD6WB1D4mhrc1B5rvFG3A14A7cDA2OC1AA1JB5zC-16KA6WB4C-8wvlTB5A5lkZB2C2C7zynBD2D2bI-7C-21d1HE2cubyvPC8A6VB3aroxxZE4C4F4e1I2BE1WjdifH1H4A14NA1GB1YG-10tWA3A14A9sVA2C5XH2A29b2A6gsleGG2jaED2D-13fhE1OA8NjwytyTD4e1sc1D-16ZC3B5C-9e1C2FB6EFF5B2C2JH4E1C2tdLE5A3UG4G-7b2D3B4fA-9oh1G3kqvB4AG3ibnjcAC6D2B1cDA9KC2QA6bRC4VA30RB8hYB2A4A-8h1A21A2B2=='
  const trial_expired = '7D4YH4fkhHB3pqDC3H2E1fkMD1IB1NF1D3QD9wB5rxqlh1A8c2B4ZA3FD2AA6FB5EB3jJG4D2J-7aC-21GB6PC5RE4TC11QD6XC4XE3XH3mlvnqjbaOA2OC2BE6A1fmI-7ujwbc1G5f1F3e1C11mXF4owBG3E1yD1E4F1D2D-8B-8C-7yC-22HD1MF5UE4cWA3D8D6a1B2C3H3a3I3sZA4B3A2akfwEB3xHD5D1F1wIC11pA-16xdxtVI2C9A6YC4a1A2F3B2GA6B4C3lsjyJB1eMA1D-11MF5PE4ja1D3D7byrf1C3e1C7D-16lwqAF3H2A1B-21wNE1MA1OG1HB2A-16tSE5UD4RB3icRA4F-10wtwzBB3E1C3CC2DA8LA2LA1EB1kdH-8uVB7decorg1J2B7B6qjrqGI2J1C6ijehIB1hkemC-13hqkrH4H-7QD6XF5XF3HLNAC3CB2aD2CD2KB10B4ycg1A-8KA4H4B11jVB5TC4yqpB-21pd1E4pedzGB6MD5B3ncB-7MA4LD2JB6PD5uH-8TB9C7YD5XD2E3I3jmiDB3zeimhLD8E2F2JC1H-9ivkPC5lG-10SB1D3H3A-21rc1A3d1E3fsdqwfGA2KA1OrC-22LA6D1B4afUB16SC7AitC-8qYA11fsxcajGA15avjNE2A-9h1hDB16B9tPC1C5F5UC1G3B8d2A5d1D4RnHJ3C3JB5D3ucMG1yzD-17hafjC-8VD3yWC6e1YD2H3ZE2C8C5oBA3H3D2vFA4WzJC4C2i1A-65fNB8afWA1H4A26mvkC-13ZB3E3h1A21BC4eFB2GD2AA5ghqND2A2B2=='
  const powered_by = 'qD2H-9G3ioD-17qA1tE1B-8qI3A4hA-13C-11E2C1njfldD1E6pg1C-8sC3hfbkcD2G3stC-22gqgB3G2B-7vtoA4nweeD1A31A15B9uC-16A1F5dkykdc1B8dE-11bA3F2D3A9gd1E7F2tlI-8H-7vtxB2A5B2C3B2F2B5A6ldbyC4iqC-22D-17E-13mA3D2dywiB3oxlvfC1H4C2TjqbzlnI3ntB4E3qA2zaqsC6D3pmnkoE3C6D5wvuE3bwifdhB6hch1E4xibD-17dmrC1rG-7pntnF6nB-8F1D2A11C8plrkmF2F3MC-16bocqA2WwA-21ayeA1C4d1isC-22rD-13D6DfjpjtC2E6hB2G2G4A-7D2=='
  const pages_id = 'MekC-11nB-8tIzpD7pewxvzC6mD-16xerg1=='

  const RD = 'vA1C7A6F6E1D4F4E1C10A6=='

  // Tests to be done:
  // foo.dev, foo.localhost, foo.edu | no key - ok
  // foo.com | no key - unlicensed
  // foo.com | key for foo.com - ok
  // foo.com | expired key for foo.com - expired
  // foo.com | key for wildcard - ok
  // foo.com | expired key for wildcard - expired

  let unlicensed_message = nolicense

  const domain = (function () {
    let i = 0
    let domain = document.domain
    const p = domain.split('.')
    const s = `_gd${(new Date()).getTime()}`

    while (i < p.length - 1 && document.cookie.indexOf(`${s}=${s}`) === -1) {
      domain = p.slice(0 - 1 - ++i).join('.')
      document.cookie = `${s}=${s};domain=${domain};`
    }

    document.cookie = `${s}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=${domain};`

    return (domain || '').replace(/(^\.*)|(\.*$)/g, '')
  }())

  function _foo(x) {
    return x
  }

  function _decrypt(str) {
    if (!str) {
      return str
    }

    let decrypted = ''
    const _bar = _foo('charCodeAt')
    const _car = _foo('fromCharCode')
    let key = chars.indexOf(str[0])

    for (let i = 1; i < str.length - 2; i++) {
      const ks = _sumDigits(++key)
      let charCode = str[_bar](i)

      // Find out how many times we added the sum of key digits.
      let t = ''

      while (/[0-9-]/.test(str[i + 1])) {
        t += str[++i]
      }
      t = parseInt(t, 10) || 0

      charCode = _fromRange(charCode, ks, t)
      charCode ^= key - 1 & 31
      decrypted += String[_car](charCode)
    }

    return decrypted
  }

  const d = _foo(_decrypt)

  function _sumDigits(number) {
    const str = number.toString()
    let sum = 0

    for (let i = 0; i < str.length; i++) {
      sum += parseInt(str.charAt(i), 10)
    }

    if (sum > 10) {
      return sum % 9 + 1
    }

    return sum
  }

  function _fromRange(charCode, ks, i) {

    // Get how many times we should substract.
    let p = Math.abs(i)

    while (p-- > 0) {
      charCode -= ks
    }

    // Add 123 if the index is negative.
    if (i < 0) {
      charCode += 123
    }

    return charCode
  }

  // Check if element has display block.
  function _is_hidden($el) {
    // Display was changed.
    if ($el && $el.css('display') !== 'block') {
      $el.remove();

      return true;
    }

    // Height was changed.
    if ($el && editor.helpers.getPX($el.css('height')) === 0) {
      $el.remove();

      return true;
    }

    // Position was changed.
    if ($el && ($el.css('position') === 'absolute' || $el.css('position') === 'fixed')) {
      $el.remove();

      return true;
    }

    return false;
  }

  // Check if element still in dom.
  function _not_in_dom($el) {
    return $el && editor.$box.find($el).length === 0
  }

  // Check if warning was removed.
  function _was_removed() {
    return _is_hidden($lb) || _is_hidden($ab) || _not_in_dom($lb) || _not_in_dom($ab)
  }

  let $lb
  let $ab
  let _ct = 0

  // Add unlicensed message.
  function _add() {
    if (_ct > 10) {
      editor[_foo(d('0ppecjvc=='))]()

      setTimeout(() => {
        $.FE = null
      }, 10)
    }

    if (!editor.$box) {
      return false
    }

    editor.$wp.prepend(d(_foo(d(unlicensed_message))))

    $lb = editor.$wp.find('> div').first()
    $ab = $lb.find('> a')

    if (editor.opts.direction === 'rtl') {
      $lb.css('left', 'auto').css('right', 0).attr('direction', 'rtl')
    }

    _ct++
  }

  // List of allowed subdomains.
  function _isAllowedSubdomain(st) {
    let x_localhost = d('9qqG-7amjlwq==')
    let x_127 = d('KA3B3C2A6D1D5H5H1A3==')
    let x_0000 = d('3B9B3B5F3C4G3E3==')
    let x_jshell = d('QzbzvxyB2yA-9m==')
    let x_codepen = d('ji1kacwmgG5bc==')
    let x_fiddle = d('nmA-13aogi1A3c1jd==')
    let x_edu = d('BA9ggq==')
    let x_sencha = d('emznbjbH3fij==')
    let x_froala = d('tkC-22d1qC-13sD1wzF-7==')
    let x_dev = d('tA3jjf==')
    let x_test = d('1D1brkm==')

    let x_domains = [
      x_localhost,
      x_127,
      x_0000,
      x_jshell,
      x_codepen,
      x_fiddle,
      x_edu,
      x_sencha,
      x_froala,
      x_dev,
      x_test
    ]

    for (let i = 0; i < x_domains.length; i++) {

      // IE 11 polyfill
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
      if (!String.prototype.endsWith) {
        String.prototype.endsWith = function (search, this_len) {
          if (typeof this_len === 'undefined' || this_len > this.length) {
            this_len = this.length
          }

          return this.substring(this_len - search.length, this_len) === search
        }
      }

      if (st.endsWith(x_domains[i])) {
        return true
      }
    }

    return false
  }

  // Parese key.
  function _parse(key) {
    const info = (d(key) || '').split('|')

    if (info.length === 4 && info[0] === 'V3') {
      return [info[1], info[3], info[2]]
    }

    return [null, null, '']
  }

  // Check if expired by date.
  function _isExpired(date) {
    // no date.
    if (date === null) {
      return true
    }

    // trial support.
    if (date.indexOf('TRIAL') == 0) {
      date = new Date(date.replace(/TRIAL/, ''))

      if (new Date(date) < new Date()) {
        expired = trial_expired

        return true
      }

      return false
    }

    // date expired.
    if (new Date(date) < new Date(d(RD))) {
      return true
    }

    return false
  }

  /**
   * check if editor is used in froala pages
   * If true, don't check for editor license
   */
  function _isFromPages() {
    const p_id = d(_foo(pages_id))
    const pages = 'tzgatD-13eD1dtdrvmF3c1nrC-7saQcdav=='
    const d_pages = d(_foo(pages)).split('.')

    return (window.parent.document.querySelector(p_id) && window[d_pages[1]][d_pages[2]])
  }

  function _init() {
    let ls = editor.opts.key || ['']

    const pt = d(_foo('ziRA1E3B9pA5B-11D-11xg1A3ZB5D1D4B-11ED2EG2pdeoC1clIH4wB-22yQD5uF4YE3E3A9=='))

    if (typeof ls === 'string') {
      ls = [ls]
    }

    // Assume unlicensed.
    editor.ul = true

    // Assume not expired.
    let is_expired = false

    // No user id.
    let usr_id = 0

    // Loop keys.
    for (let i = 0; i < ls.length; i++) {

      // Get info for keys.
      const info = _parse(ls[i])

      // License string.
      const st = info[2]

      // Wildcard.
      const x_oem = d(_foo(d('LGnD1KNZf1CPBYCAZB-8F3UDSLLSG1VFf1A3C2==')))

      // Wildcard.
      // Domain.
      // Allowed domains by default.
      if (st === x_oem || st.indexOf(domain, st.length - domain.length) >= 0 || _isAllowedSubdomain(domain) || _isFromPages()) {

        // Check if expired.
        if (_isExpired(info[1]) && (domain || '').length > 0 && !_isAllowedSubdomain(domain) && !_isFromPages()) {
          is_expired = true
          unlicensed_message = expired
          usr_id = info[0] || -1
        }

        // Is OK.
        else {
          editor.ul = false
          break
        }
      }
    }

    // Pixel tracking.
    const img = new Image()

    // Unlicensed.
    if (editor.ul === true) {
      _add()

      // Make a request over to us to track expired.
      if (is_expired) {
        img.src = `${_foo(d(pt))}e=${usr_id}`
      }

      // Make a request over to us to track unlicensed.
      else {
        img.src = `${_foo(d(pt))}u`
      }
    }

    // Check on contentchanged if they tried to hack us.
    if (editor.ul === true) {
      editor.events.on('contentChanged', () => {
        if (_was_removed()) {
          _add()
        }
      })

      // On get we add powered by.
      editor.events.on('html.get', function (html) {
        return html + d(powered_by);
      })
    }

    // On set we remove powered by.
    editor.events.on('html.set', function () {
      var pbf = editor.el.querySelector('[data-f-id="pbf"]');

      if (pbf) {
        $(pbf).remove();
      }
    })

    // Remove unlicense message on destroy.
    editor.events.on('destroy', () => {
      if ($lb && $lb.length) {
        $lb.remove()
      }
    }, true)
  }

  return {
    _init
  }
}
