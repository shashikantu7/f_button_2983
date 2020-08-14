import FE from '../index.js'
'use strict';

FE.URLRegEx = `(^| |\\u00A0)(${FE.LinkRegEx}|([a-z0-9+-_.]{1,}@[a-z0-9+-_.]{1,}\\.[a-z0-9+\-_]{1,}))$`

FE.PLUGINS.url = function (editor) {

  const { $ } = editor
  let rel = null 

  /*
   * Transform string into a hyperlink.
   */
  function _linkReplaceHandler(match, p1, p2) {
    let dots = '' 

    while (p2.length && p2[p2.length - 1] == '.') {
      dots += '.' 
      p2 = p2.substring(0, p2.length - 1) 
    }

    let link = p2 

    // Convert email.
    if (editor.opts.linkConvertEmailAddress) {
      if (editor.helpers.isEmail(link) && !/^mailto:.*/i.test(link)) {
        link = `mailto:${link}` 
      }
    }
    else if (editor.helpers.isEmail(link)) {
      return p1 + p2 
    }

    if (!/^((http|https|ftp|ftps|mailto|tel|sms|notes|data)\:)/i.test(link)) {
      link = `//${link}` 
    }

    return (p1 ? p1 : '') + `<a${(editor.opts.linkAlwaysBlank ? ' target="_blank"' : '')}${(rel ? (` rel="${rel}"`) : '')} data-fr-linked="true" href="${link}">${p2.replace(/&amp;/g, '&').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</a>${dots}`
  }

  const _getRegEx = () => new RegExp(FE.URLRegEx, 'gi')

  /*
   * Convert link paterns from html into hyperlinks.
   */
  function _convertToLink(html) {

    if (editor.opts.linkAlwaysNoFollow) {
      rel = 'nofollow' 
    }

    // https://github.com/froala/wysiwyg-editor/issues/1576.
    if (editor.opts.linkAlwaysBlank) {
      if (editor.opts.linkNoOpener) {
        if (!rel) rel = 'noopener' 
        else rel += ' noopener' 
      }

      if (editor.opts.linkNoReferrer) {
        if (!rel) rel = 'noreferrer' 
        else rel += ' noreferrer' 
      }
    }

    return html.replace(_getRegEx(), _linkReplaceHandler) 
  }

  function _isA(node) {
    if (!node) return false 

    if (node.tagName === 'A') return true 

    if (node.parentNode && node.parentNode != editor.el) return _isA(node.parentNode) 

    return false 
  }

  function _lastPart(text) {
    const splits = text.split(' ') 

    return splits[splits.length - 1] 
  }

  function _inlineType() {
    const range = editor.selection.ranges(0) 
    const { startContainer : node } = range 

    if (!node || node.nodeType !== Node.TEXT_NODE || range.startOffset !== (node.textContent || '').length) return false 

    if (_isA(node)) return false 

    if (_getRegEx().test(_lastPart(node.textContent))) {
      $(node).before(_convertToLink(node.textContent)) 

      // Get linked link.
      const $link = $(node.parentNode).find('a[data-fr-linked]') 
      $link.removeAttr('data-fr-linked') 

      node.parentNode.removeChild(node) 

      // Trigger link event.
      editor.events.trigger('url.linked', [$link.get(0)]) 
    }
    else if (node.textContent.split(' ').length <= 2 && node.previousSibling && node.previousSibling.tagName === 'A') {
      const text = node.previousSibling.innerText + node.textContent 

      if (_getRegEx().test(_lastPart(text))) {
        /**
         * Using DOMParser to parse and get the nodes from string data and replacing respective nodes in existing DOM.
         */
        const domParser = new DOMParser()
        const childNodes = domParser.parseFromString(_convertToLink(text), 'text/html').body.childNodes

        node.parentNode.replaceChild(childNodes[0], node.previousSibling)

        //replacechild will change reference to the node so checking for length
        if (childNodes.length) {
          $(node).before(childNodes[0])
        }

        node.parentNode.removeChild(node)
      }
    }
  }

  /*
   * Initialize.
   */
  function _init() {
    // Handle special keys.
    editor.events.on('keypress', function (e) {
      if (editor.selection.isCollapsed() && (e.key == '.' || e.key == ')' || e.key == '(')) {
        _inlineType() 
      }
    }, true) 

    // Handle ENTER and SPACE.
    editor.events.on('keydown', function (e) {
      const { which : keycode } = e 

      if (editor.selection.isCollapsed() && (keycode == FE.KEYCODE.ENTER || keycode == FE.KEYCODE.SPACE)) {
        _inlineType() 
      }
    }, true) 

    // Handle pasting.
    editor.events.on('paste.beforeCleanup', function (html) {
      if (editor.helpers.isURL(html)) {
        let rel_attr = null 

        if (editor.opts.linkAlwaysBlank) {
          if (editor.opts.linkNoOpener) {
            if (!rel_attr) rel_attr = 'noopener' 
            else rel_attr += ' noopener' 
          }

          if (editor.opts.linkNoReferrer) {
            if (!rel_attr) rel_attr = 'noreferrer' 
            else rel_attr += ' noreferrer' 
          }
        }

        return `<a${(editor.opts.linkAlwaysBlank ? ' target="_blank"' : '')}${(rel_attr ? (` rel="${rel_attr}"`) : '')} href="${html}" >${html}</a>` 
      }
    })
  }

  return {
    _init: _init
  }
}
