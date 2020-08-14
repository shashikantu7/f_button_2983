// Closest polyfill.
if (!Element.prototype.matches)
    Element.prototype.matches = Element.prototype.msMatchesSelector ||
                                Element.prototype.webkitMatchesSelector;

if (!Element.prototype.closest)
  Element.prototype.closest = function(s) {
    var el = this;
    if (!document.documentElement.contains(el)) return null;
    do {
        if (el.matches(s)) return el;
        el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
};

// Matches polyfill.
if (!Element.prototype.matches) {
    Element.prototype.matches =
        Element.prototype.matchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        function(s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;
        };
}

// isArray polyfill.
if (!Array.isArray) {
  Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}


// Object.assign
if (typeof Object.assign != 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) { // .length of function is 2
      'use strict';
      if (target == null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) { // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
};

// https://github.com/lazd/scopedQuerySelectorShim/blob/master/src/scopedQuerySelectorShim.js
(function _scopeShim() {
  // Match usage of scope
  const scopeRE = /^\s*:scope/gi
  const scopeREComma = /,\s*:scope/gi

  // A temporary element to query against for elements not currently in the DOM
  // We'll also use this element to test for :scope support
  const container = document.createElement('div')

  // Overrides
  function overrideNodeMethod(prototype, methodName) {

    // Store the old method for use later
    const oldMethod = prototype[methodName]

    // Override the method
    prototype[methodName] = function (query) {
      let nodeList
      let gaveId = false
      let gaveContainer = false

      if (query && !Array.isArray(query) && (query.match(scopeRE) || query.match(scopeREComma))) {

        if (!this.parentNode) {

          // Add to temporary container
          container.appendChild(this)
          gaveContainer = true
        }

        const parentNode = this.parentNode

        if (!this.id) {

          // Give temporary ID
          this.id = `rootedQuerySelector_id_${(new Date()).getTime()}`
          gaveId = true
        }

        // Find elements against parent node
        // Replace :scope with node's id
        nodeList = oldMethod.call(parentNode, query.replace(scopeRE, `#${this.id}`).replace(scopeREComma, `,#${this.id}`))

        // Reset the ID
        if (gaveId) {
          this.id = ''
        }

        // Remove from temporary container
        if (gaveContainer) {
          container.removeChild(this)
        }

        return nodeList
      }


      // No immediate child selector used

      return oldMethod.call(this, query)

    }
  }

  // Check if the browser supports :scope
  try {

    // Browser supports :scope, do nothing
    const nodeColl = container.querySelectorAll(':scope *')

    if (!nodeColl || Array.isArray(nodeColl)) {
      throw 'error'
    }
  }
  catch (e) {
    // Browser doesn't support :scope, add polyfill
    overrideNodeMethod(Element.prototype, 'querySelector')
    overrideNodeMethod(Element.prototype, 'querySelectorAll')
    overrideNodeMethod(HTMLElement.prototype, 'querySelector')
    overrideNodeMethod(HTMLElement.prototype, 'querySelectorAll')
  }
})();

//classlist library code
/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */
"document" in self && ("classList" in document.createElement("_") && (!document.createElementNS || "classList" in document.createElementNS("http://www.w3.org/2000/svg", "g")) || ! function (t) {
  "use strict";
  if ("Element" in t) {
    var e = "classList",
      n = "prototype",
      i = t.Element[n],
      s = Object,
      r = String[n].trim || function () {
        return this.replace(/^\s+|\s+$/g, "")
      },
      o = Array[n].indexOf || function (t) {
        for (var e = 0, n = this.length; n > e; e++)
          if (e in this && this[e] === t) return e;
        return -1
      },
      c = function (t, e) {
        this.name = t, this.code = DOMException[t], this.message = e
      },
      a = function (t, e) {
        if ("" === e) throw new c("SYNTAX_ERR", "The token must not be empty.");
        if (/\s/.test(e)) throw new c("INVALID_CHARACTER_ERR", "The token must not contain space characters.");
        return o.call(t, e)
      },
      l = function (t) {
        for (var e = r.call(t.getAttribute("class") || ""), n = e ? e.split(/\s+/) : [], i = 0, s = n.length; s > i; i++) this.push(n[i]);
        this._updateClassName = function () {
          t.setAttribute("class", this.toString())
        }
      },
      u = l[n] = [],
      h = function () {
        return new l(this)
      };
    if (c[n] = Error[n], u.item = function (t) {
        return this[t] || null
      }, u.contains = function (t) {
        return ~a(this, t + "")
      }, u.add = function () {
        var t, e = arguments,
          n = 0,
          i = e.length,
          s = !1;
        do t = e[n] + "", ~a(this, t) || (this.push(t), s = !0); while (++n < i);
        s && this._updateClassName()
      }, u.remove = function () {
        var t, e, n = arguments,
          i = 0,
          s = n.length,
          r = !1;
        do
          for (t = n[i] + "", e = a(this, t); ~e;) this.splice(e, 1), r = !0, e = a(this, t); while (++i < s);
        r && this._updateClassName()
      }, u.toggle = function (t, e) {
        var n = this.contains(t),
          i = n ? e !== !0 && "remove" : e !== !1 && "add";
        return i && this[i](t), e === !0 || e === !1 ? e : !n
      }, u.replace = function (t, e) {
        var n = a(t + "");
        ~n && (this.splice(n, 1, e), this._updateClassName())
      }, u.toString = function () {
        return this.join(" ")
      }, s.defineProperty) {
      var f = {
        get: h,
        enumerable: !0,
        configurable: !0
      };
      try {
        s.defineProperty(i, e, f)
      } catch (p) {
        void 0 !== p.number && -2146823252 !== p.number || (f.enumerable = !1, s.defineProperty(i, e, f))
      }
    } else s[n].__defineGetter__ && i.__defineGetter__(e, h)
  }
}(self), function () {
  "use strict";
  var t = document.createElement("_");
  if (t.classList.add("c1", "c2"), !t.classList.contains("c2")) {
    var e = function (t) {
      var e = DOMTokenList.prototype[t];
      DOMTokenList.prototype[t] = function (t) {
        var n, i = arguments.length;
        for (n = 0; i > n; n++) t = arguments[n], e.call(this, t)
      }
    };
    e("add"), e("remove")
  }
  if (t.classList.toggle("c3", !1), t.classList.contains("c3")) {
    var n = DOMTokenList.prototype.toggle;
    DOMTokenList.prototype.toggle = function (t, e) {
      return 1 in arguments && !this.contains(t) == !e ? e : n.call(this, t)
    }
  }
  "replace" in document.createElement("_").classList || (DOMTokenList.prototype.replace = function (t, e) {
    var n = this.toString().split(" "),
      i = n.indexOf(t + "");
    ~i && (n = n.slice(i), this.remove.apply(this, n), this.add(e), this.add.apply(this, n.slice(1)))
  }), t = null
}());