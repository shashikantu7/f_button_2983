
const passiveEvents = ['scroll', 'wheel', 'touchmove', 'touchstart', 'touchend']

// All possible prefixes of an event
const eventPrefixes = [ 'webkit', 'moz', 'ms', 'o' ]

// Events which are browser dependent
const irregularEvents = [ 'transitionend' ]

// List of all styles
const stylesList = document.createElement('div').style

// All possible prefixes of a css property
const cssPrefixes = [ 'Webkit', 'Moz', 'ms', 'O', 'css', 'style' ]

// Properties to be applied to get correct element styles
const cssShow = { visibility: 'hidden', display: 'block' }

// Special Events
const specialEvents = ['focus', 'blur', 'click']

// Map to cache computed correct style names
const correctStyleName = {}

var _getEvent = function (e, target) {
  return {
    altKey: e.altKey,
    bubbles: e.bubbles,
    cancelable: e.cancelable,
    changedTouches: e.changedTouches,
    ctrlKey: e.ctrlKey,
    detail: e.detail,
    eventPhase: e.eventPhase,
    metaKey: e.metaKey,
    pageX: e.pageX,
    pageY: e.pageY,
    shiftKey: e.shiftKey,
    view: e.view,
    'char': e.char,
    key: e.key,
    keyCode: e.keyCode,
    button: e.button,
    buttons: e.buttons,
    clientX: e.clientX,
    clientY: e.clientY,
    offsetX: e.offsetX,
    offsetY: e.offsetY,
    pointerId: e.pointerId,
    pointerType: e.pointerType,
    screenX: e.screenX,
    screenY: e.screenY,
    targetTouches: e.targetTouches,
    toElement: e.toElement,
    touches: e.touches,
    type: e.type,
    which: e.which,
    target: e.target,
    currentTarget: target,
    originalEvent: e,
    stopPropagation: function () { e.stopPropagation(); },
    stopImmediatePropagation: function () { e.stopImmediatePropagation(); },
    preventDefault: function () {
      if (passiveEvents.indexOf(e.type) === -1) { 
        e.preventDefault(); 
      }
    }
  }
}

var isPartOfDOM = function isPartOfDOM (target) {
  return ((target.ownerDocument && target.ownerDocument.body.contains(target)) || target.nodeName === '#document' || target.nodeName === 'HTML' || target === window)
}

var _getDelegator = function (fn, selector) {
  return function (e) {
    // Get the element the event was raised by.
    let target = e.target;

    // Loop parents.
    if (selector) {
      selector = _normalizeSelector(selector);

      while (target && target !== this) {

        // Check if the current target matches
        if (target.matches && target.matches(_normalizeSelector(selector))) {

          fn.call(target, _getEvent(e, target));
        }

        target = target.parentNode;
      }
    }
    else {
      if(isPartOfDOM(target)) {
        fn.call(target, _getEvent(e, target));
      }
    }
  }
}

var jQuery = function (selector, context) {
  return new init(selector, context);
}

var _normalizeSelector = function(selector) {
  if (selector && typeof selector == 'string') {
    // Modified the regex to handle the spaces before '>'
    return selector.replace(/^\s*>/g, ':scope >').replace(/,\s*>/g, ', :scope >');
  }
  return selector;
};

var isFunction = function isFunction(obj) {

  // Support: Chrome <=57, Firefox <=52
  // In some browsers, typeof returns "function" for HTML <object> elements
  // (i.e., `typeof document.createElement( "object" ) === "function"`).
  // We don't want to classify *any* DOM node as a function.
  return typeof obj === 'function' && typeof obj.nodeType !== 'number';
};

var $ = jQuery;

jQuery.fn = jQuery.prototype = {
  constructor: jQuery,

  // The default length of a jQuery object is 0
  length: 0,

  contains: function (obj) {
    if (!obj) return false;

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        if (this.contains(obj[i]) && this != obj[i]) return true;
      }

      return false;
    }


    for (let i = 0; i < this.length; i++) {
      let node = obj;

      while (node) {
        if (node == this[i] || (node[0] && node[0].isEqualNode(this[i]))) {
          return true
        }

        node = node.parentNode
      }
    }

    return false;
  },

  findVisible: function (selector) {
    const $els = this.find(selector);

    for (let i = $els.length - 1; i >= 0; i--) {
      if (!$($els[i]).isVisible()) {
        $els.splice(i, 1);
      }
    }

    return $els;
  },

  // Encode URL parameters
  formatParams: function ( params ){
    var formattedParams = `${Object
      .keys(params)
      .map(function(key){
        return `${key}=${encodeURIComponent(params[key])}`
      })
      .join('&')}`

    return formattedParams ? formattedParams : '';
  },

  // Takes a request object for making http requests using XMLHttpRequest
  ajax: function (request) {

    const xhr = new XMLHttpRequest()
    const data = this.formatParams(request.data)

    // Add request params to the URL for GET request 
    if(request.method.toUpperCase() === 'GET'){
      request.url = data ? request.url + '?' + data : request.url
    }

    // Make it async.
    xhr.open(request.method, request.url, true)

    // Set with credentials.
    if (request.withCredentials) {
      xhr.withCredentials = true
    }

    // Set with CORS
    if (request.crossDomain) {
      xhr.setRequestHeader('Access-Control-Allow-Origin', '*')
    }

    // Set headers.
    for (const header in request.headers) {
      if (Object.prototype.hasOwnProperty.call(request.headers, header)) {
        xhr.setRequestHeader(header, request.headers[header])
      }
    }

    if(!Object.prototype.hasOwnProperty.call(request.headers, 'Content-Type')) {
      // Set json data type
      if (request.dataType === 'json') {
        xhr.setRequestHeader('Content-Type', 'application/json')
      } else {
        //Set deafult Content-Type
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
      }
    }

    // Set events.
    xhr.onload = function () {
      if (xhr.status == 200) {
        let data = xhr.responseText
        if (request.dataType === 'json') {
          data = JSON.parse(data)
        }
        request.done(data, xhr.status, xhr)  
      } else {
        request.fail(xhr)
      }
    }

    // Send data.
    xhr.send(data)
  },

  // Get all previous siblings of an element
  prevAll: function() {
    const res = $()
    if (!this[0]) {
      return res
    }

    let elem = this[0]
    while (elem && elem.previousSibling) {
      elem = elem.previousSibling
      res.push(elem)
    }
    return res
  },

  // Determine the position of an element within the set
  index: function( elem ) {

    // No argument, return index in parent
    if ( !elem ) {
      return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
    }

    // Index in selector
    if ( typeof elem === 'string' ) {
      return [].indexOf.call( $( elem ), this[ 0 ] );
    }

    // Locate the position of the desired element
    return [].indexOf.call( this,

      // If it receives a jQuery object, the first element is used
      elem.length ? elem[ 0 ] : elem
    );
  },

  isVisible: function () {
    if(!this[0]){
      return false
    }
    return !!(this[0].offsetWidth || this[0].offsetHeight || this[0].getClientRects().length)
  },

  toArray: function () {
    return [].slice.call(this);
  },

  // Get the Nth element in the matched element set OR
  // Get the whole matched element set as a clean array
  get: function (num) {

    // Return all the elements in a clean array
    if (num == null) {
      return [].slice.call(this);
    }

    // Return just the one element from the set
    return num < 0 ? this[num + this.length] : this[num];
  },

  // Take an array of elements and push it onto the stack
  // (returning the new matched element set)
  pushStack: function (elems) {

    // Build a new jQuery matched element set
    const ret = jQuery.merge(this.constructor(), elems);

    // Add the old object onto the stack (as a reference)
    ret.prevObject = this;

    // Return the newly-formed element set
    return ret;
  },

  wrapAll: function (html) {
    let wrap;

    if (this[0]) {
      if (isFunction(html)) {
        html = html.call(this[0]);
      }

      // The elements to wrap the target around
      wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);

      if (this[0].parentNode) {
        wrap.insertBefore(this[0]);
      }

      wrap.map(function () {
        let elem = this;

        while (elem.firstElementChild) {
          elem = elem.firstElementChild;
        }

        return elem;
      }).append(this);
    }

    return this;
  },

  wrapInner: function(wrapper) {
    if (typeof wrapper === 'string') {
      const wrapperProps = wrapper.split(' ')
      let i = 0

      // Remove all empty props
      while (i < wrapperProps.length && wrapperProps[i].trim().length === 0) i++

      // First non-empty property is the element itself
      if (i < wrapperProps.length) {

        // https://github.com/froala-labs/froala-editor-js-2/issues/1928
        if ($(wrapper).length && wrapperProps[i].trim() === $(wrapper)[0].tagName) {
          wrapper = document.createElement(wrapperProps[i].trim())
        }

        i++
      }

      // Make sure it is re-initialized
      if (typeof wrapper !== 'string') {
        
        // Add all wrapper attributes
        const $wrapper = $(wrapper)
        for (; i < wrapperProps.length; i++) {
          wrapperProps[i] = wrapperProps[i].trim()
          const attr = wrapperProps[i].split('=')
          $wrapper.attr(attr[0], attr[1].replace('"', ''))
        }
      }
    }

    while(!this[0].firstChild && this[0].firstChild !== wrapper) {
      wrapper.appendChild(this[0].firstChild)
    }
  },

  wrap: function (html) {
    const htmlIsFunction = isFunction(html);

    return this.each(function (i) {
      $(this).wrapAll(htmlIsFunction ? html.call(this, i) : html);
    });
  },

  unwrap: function() {

    return this.parent().each( function() {
      if ( !(this.nodeName && this.nodeName.toLowerCase() === name.toLowerCase())) {
        jQuery( this ).replaceWith( this.childNodes );
      }
    } );

  },

  grep: function (elems, callback, invert) {
    let callbackInverse,
      matches = [],
      i = 0,
      length = elems.length,
      callbackExpect = !invert;

    // Go through the array, only saving the items
    // that pass the validator function
    for (; i < length; i++) {
      callbackInverse = !callback(elems[i], i);
      if (callbackInverse !== callbackExpect) {
        matches.push(elems[i]);
      }
    }

    return matches;
  },

  map: function (callback) {
    return this.pushStack(jQuery.map(this, function (elem, i) {
      return callback.call(elem, i, elem);
    }));
  },

  slice: function () {
    return this.pushStack([].slice.apply(this, arguments));
  },

  each: function (fn) {
    if (this.length) {
      for (let i = 0; i < this.length; i++) {
        if (fn.call(this[i], i, this[i]) === false) {
          break;
        }
      }
    }

    return this;
  },

  first: function () {
    return this.eq(0);
  },

  last: function () {
    return this.eq(-1);
  },

  eq: function (i) {
    const len = this.length,
      j = +i + (i < 0 ? len : 0);
    return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
  },

  empty: function () {
    for (let i = 0; i < this.length; i++) {
      this[i].innerHTML = ''
    }
  },

  

  contents: function () {
    const ret = $();

    for (let i = 0; i < this.length; i++) {
      const cldrn = this[i].childNodes;
      for (let j = 0; j < cldrn.length; j++) {
        ret.push(cldrn[j]);
      }
    }

    return ret;
  },

  attr: function (name, val) {
    if (typeof name === 'object') {
      for (let k in name) {
        if (Object.prototype.hasOwnProperty.call(name, k)) {
          if(name[k] !== null) {
            this.attr(k, name[k])
          }
        } 
      }

      return this;
    }

    if (typeof val !== 'undefined') {

      if(name === 'checked') {
        for(let i = 0; i < this.length; i++) { 
          this[i].checked = val
        }
      }
      else if (name === 'tagName') {
        for(let i = 0; i < this.length; i++) { 
          this[i].tagName = val
        }
      }
      else {
        for (let i = 0; i < this.length; i++) {
          this[i].setAttribute(name, val);
        }
      }

      // Chain.
      return this;
    }
    else {
      if (this.length === 0 || !(this[0].getAttribute || name === 'checked')) {
        return undefined;
      }

      if(name === 'checked') {
        return this[0].checked
      }
      else if (name === 'tagName') {
        return this[0].tagName
      }

      return this[0].getAttribute(name);
    }
  },

  removeAttr: function (name) {
    for (let i = 0; i < this.length; i++) {
      if (this[i].removeAttribute) this[i].removeAttribute(name);
    }

    return this;
  },

  hide: function () {
    this.css('display', 'none');

    return this;
  },

  show: function () {
    this.css('display', 'block');

    return this;
  },

  focus: function () {
    if (this.length) {
      this[0].focus();
    }

    return this;
  },

  blur: function () {
    if (this.length) {
      this[0].blur();
    }

    return this;
  },

  data: function (name, val) {
    // Object.
    if (typeof val !== 'undefined') {
      for (let i = 0; i < this.length; i++) {
        this[i]['data-' + name] = val;

        if (typeof val !== 'object' && typeof val !== 'function') {
          if(this[i].setAttribute) {
            this[i].setAttribute('data-' + name, val);
          }
        }
      }

      // Chain.
      return this;
    }
    else {
      if (typeof val !== 'undefined') {
        return this.attr('data-' + name, val);
      }
      else {
        if (this.length === 0) return undefined;

        for (let i = 0; i < this.length; i++) {
          let dt = this[i]['data-' + name];

          if (typeof dt === 'undefined' || dt === null) {
            if (this[i].getAttribute) {
              dt = this[i].getAttribute('data-' + name);
            }
          }

          if (typeof dt != 'undefined' && dt != null) {
            return dt;
          }
        }

        return undefined;
      }
    }
  },

  removeData: function (name) {
    for (let i = 0; i < this.length; i++) {
      if (this[i].removeAttribute) this[i].removeAttribute('data-' + name);
      this[i]['data-' + name] = null;
    }

    return this;
  },

  getCorrectStyleName: function (name) {
    // Compute only if not computed before
    if (!correctStyleName[name]) {
      let finalName
      
      // If a style with same name exists then it is the original name
      if (name in stylesList) {
        finalName = name
      }
      
      // Make first letter capital
      let capName = name[0].toUpperCase() + name.slice(1)

      // Try attaching the prefixes and checking if it is a valid style name
      let i = cssPrefixes.length
      while (i--) {
        name = cssPrefixes[i] + capName;
        if (name in stylesList) {
          finalName = name
        }
      }

      // Store for future use
      correctStyleName[name] = finalName
    }
    return correctStyleName[name]
  },

  css: function (name, val) {

    if (typeof val !== 'undefined') {
      if (this.length === 0) return this;

      if (((typeof val === 'string' && val.trim() !== '' && !isNaN(val)) || typeof val === 'number') && /(margin)|(padding)|(height)|(width)|(top)|(left)|(right)|(bottom)/gi.test(name) && !/(line-height)/gi.test(name)) {
        val = val + 'px'
      }

      for (let i = 0; i < this.length; i++) {
        // Make sure the style name is correct
        name = $(this).getCorrectStyleName(name)
        this[i].style[name] = val;
      }

      return this;
    }
    else if (typeof name == 'string') {
      if (this.length === 0) return undefined;

      const doc = this[0].ownerDocument || document;
      const win = doc.defaultView || doc.parentWindow;

      // Make sure the style name is correct
      name = $(this).getCorrectStyleName(name)
      
      return win.getComputedStyle(this[0])[name];
    }
    else {
      for (let key in name) {
        if (Object.prototype.hasOwnProperty.call(name, key)) {
          this.css(key, name[key]);
        }
      }

      return this;
    }
  },

  toggleClass: function (name, val) {
    if (name.split(' ').length > 1) {
      const names = name.split(' ');
      for (let i = 0; i < names.length; i++) {
        this.toggleClass(names[i], val);
      }

      return this;
    }

    for (let i = 0; i < this.length; i++) {
      if (typeof val === 'undefined') {
        if(this[i].classList.contains(name)){
          this[i].classList.remove(name)
        }
        else {
          this[i].classList.add(name)
        }
      } 
      else {
        if (val) {
          if(!this[i].classList.contains(name)){
            this[i].classList.add(name)
          }
        }
        else {
          if(this[i].classList.contains(name)){
            this[i].classList.remove(name)
          }
        }
      }
    }

    return this;
  },

  addClass: function (name) {
    if (name.length === 0) return this;

    if (name.split(' ').length > 1) {
      const names = name.split(' ');
      for (let i = 0; i < names.length; i++) {
        this.addClass(names[i]);
      }

      return this;
    }

    for (let i = 0; i < this.length; i++) {
      this[i].classList.add(name);
    }

    return this;
  },

  removeClass: function (name) {
    if (name.split(' ').length > 1) {
      const names = name.split(' ');
      for (let i = 0; i < names.length; i++) {
        names[i] = names[i].trim();

        if (names[i].length) {
          this.removeClass(names[i]);
        }
      }

      return this;
    }

    for (let i = 0; i < this.length; i++) {
      if (name.length) {
        this[i].classList.remove(name);
      }
    }

    return this;
  },

  
  getClass: function getClass( elem ) {
    return elem.getAttribute && elem.getAttribute( 'class' ) || '';
  },

  stripAndCollapse: function stripAndCollapse( value ) {
    const rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );
    const tokens = value.match( rnothtmlwhite ) || [];
    return tokens.join( ' ' );
  },

  hasClass: function( selector ) {
    let className, elem,
      i = 0;

    className = ' ' + selector + ' ';
    while ( ( elem = this[ i++ ] ) ) {
      if ( elem.nodeType === 1 &&
				( ' ' + $(this).stripAndCollapse( $(this).getClass( elem ) ) + ' ' ).indexOf( className ) > -1 ) {
        return true;
      }
    }

    return false;
  },

  scrollTop: function (val) {
    if (typeof val !== 'undefined') {

      for (let i = 0; i < this.length; i++) {
        if (this[i] === document) {
          window.scrollTo(document.documentElement.scrollLeft, val)
        } 
        else {
          this[i].scrollTop = val
        }
      }
    }
    else {

      if (this.length === 0) return undefined

      if (this[0] === document) {
        return document.documentElement.scrollTop
      }

      return this[0].scrollTop
    }
  },

  scrollLeft: function (val) {
    if (typeof val !== 'undefined') {

      for (let i = 0; i < this.length; i++) {
        if (this[i] === document) {
          window.scrollTo(val, document.documentElement.scrollTop)
        } 
        else {
          this[i].scrollLeft = val
        }
      }
    }
    else {

      if (this.length === 0) return undefined

      if (this[0] === document) {
        return document.documentElement.scrollLeft
      }

      return this[0].scrollLeft
    }
  },


  on: function (eventName, selector, fn) {
    if (eventName.split(' ').length > 1) {
      const events = eventName.split(' ');
      for (let i = 0; i < events.length; i++) {
        // If it is a browser dependent or irregular event
        if (irregularEvents.indexOf(eventName) !== -1) {
          // Bind all events created by attaching all possible prefixes
          for (let j = 0; j < eventPrefixes.length; j++) {
            this.on(eventPrefixes[j] + eventName[0].toUpperCase() + eventName.slice(1), selector, fn)
          }
        }
        else {
          this.on(events[i], selector, fn)
        }
      }

      // Chain.
      return this;
    }

    if (typeof selector === 'function') {
      fn = _getDelegator(selector, null);
    }
    else {
      fn = _getDelegator(fn, selector);
    }

    for (let i = 0; i < this.length; i++) {
      const $el = $(this[i]);

      if (!$el.data('events')) {
        $el.data('events', []);
      }

      const eventHandlers = $el.data('events');

      eventHandlers.push([eventName, fn]);

      let domEvent = eventName.split('.');
      domEvent = domEvent[0];

      if (passiveEvents.indexOf(domEvent) >= 0) {
        $el.get(0).addEventListener(domEvent, fn, { passive: true })
      } 
      else {
        $el.get(0).addEventListener(domEvent, fn)
      }
    }
  },

  off: function (eventName) {
    if (eventName.split(' ').length > 1) {
      const events = eventName.split(' ');
      for (let i = 0; i < events.length; i++) {
        this.off(events[i]);
      }

      // Chain.
      return this;
    }

    for (let i = 0; i < this.length; i++) {
      const $el = $(this[i]);

      const eventHandlers = $el.data('events');

      if (eventHandlers) {
        let domEvent = eventName.split('.');
        domEvent = domEvent[0];

        const eventHandlers = $el.data('events') || [];

        for (let k = eventHandlers.length - 1; k >= 0; k--) {
          const eventHandler = eventHandlers[k];

          if (eventHandler[0] == eventName) {
            $el.get(0).removeEventListener(domEvent, eventHandler[1]);

            eventHandlers.splice(k, 1);
          }
        }
      }
    }
  },

  trigger: function (type) {
    for(let i = 0; i < this.length; i++) {
      let event;
      // If it is a mouse event
      if (typeof(Event) === 'function') {
        if (type.search(/^mouse/g) >= 0) {
          event = new MouseEvent(type, { view: window, cancelable: true, bubbles: true })
        }
        else {
          event = new Event(type)
        }
      }
      else {
        // If it is a mouse event
        if (type.search(/^mouse/g) >= 0) {
          event = document.createEvent('MouseEvents')
          event.initMouseEvent(type, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        }
        else {
          event = document.createEvent('Event')
          event.initEvent(type, true, true)
        }
      }
      // Handle special events separately
      if (specialEvents.indexOf(type) >= 0 && typeof this[i][type] === 'function') {
        this[i][type]()
      } 
      else {
        this[i].dispatchEvent(event)
      }
    }
  },

  triggerHandler: function () {
  },

  val: function (new_val) {
    if (typeof new_val != 'undefined') {
      for (let i = 0; i < this.length; i++) {
        this[i].value = new_val;
      }

      return this;
    }
    else {
      return this[0].value;
    }
  },

  siblings: function () {
    return $(this[0]).parent().children().not(this);
  },

  find: function (selector) {
    
    const ret = $();

    if(typeof selector !== 'string') {
      for (let i = 0; i < selector.length; i++) {
        for (let j = 0; j < this.length; j++ ) {
          if ( this[j] !== selector[i] && $(this[j]).contains( selector[i]) ) {
            ret.push(selector[i])
            break
          }
        }
      }
      return ret
    }

    
    const isElement = function (o) {
      return (
        typeof HTMLElement === 'object' ? o instanceof HTMLElement : //DOM2
          o && typeof o === 'object' && o !== null && o.nodeType === 1 && typeof o.nodeName === 'string'
      )
    }

    selector = _normalizeSelector(selector);

    for (let i = 0; i < this.length; i++) {
      if (this[i].querySelectorAll) {
        let els = []
        if (selector && typeof selector == 'string') {
          els = this[i].querySelectorAll(selector);
        } else if (isElement(selector)) {
          els = [selector];
        }
        for (let j = 0; j < els.length; j++) {
          ret.push(els[j]);
        }
      }
    }

    return ret;
  },

  children: function () {
    const ret = $();

    for (let i = 0; i < this.length; i++) {
      const cldrn = this[i].children;
      for (let j = 0; j < cldrn.length; j++) {
        ret.push(cldrn[j]);
      }
    }

    return ret;
  },

  not: function (selector) {
    if (typeof selector === 'string') {
      for (let i = this.length - 1; i >= 0; i--) {
        if (this[i].matches(selector)) {
          this.splice(i, 1);
        }
      }
    }
    else {
      if (selector instanceof jQuery) {
        for (let i = this.length - 1; i >= 0; i--) {
          for (let j = 0; j < selector.length; j++) {
            if (this[i] === selector[j]) {
              this.splice(i, 1);
              break;
            }
          }
        }
      }
      else {
        for (let i = this.length - 1; i >= 0; i--) {
          if (this[i] === selector[0]) {
            this.splice(i, 1);
          }
        }
      }
    }

    return this;
  },

  add: function (ary) {
    for (let i = 0; i < ary.length; i++) {
      this.push(ary[i]);
    }

    return this;
  },

  closest: function (selector) {
    for (let i = 0; i < this.length; i++) {
      const clst = this[i].closest && this[i].closest(selector);

      if (clst) return $(clst);
    }

    return $();
  },

  html: function (str) {
    if (typeof str == 'undefined') {
      if (this.length === 0) return undefined;

      return this[0].innerHTML;
    }

    if (typeof str === 'string') {
      for (let i = 0; i < this.length; i++) {
        this[i].innerHTML = str;

        // If any of the child nodes are scripts then run them
        let children = this[i].children
        let doc = this[i].ownerDocument || document
        for (let j = 0; j < children.length; j++) {
          if (children[j].tagName === 'SCRIPT') {
            const script = doc.createElement('script')
            script.innerHTML = children[j].innerHTML
            doc.head.appendChild( script ).parentNode.removeChild( script )
          }
        }
      }
    }
    else {
      this[0].innerHTML = '';

      this.append(str[0]);

      // Execute if it is script tag
      let doc = this[0].ownerDocument || document
      if (str[0].tagName === 'SCRIPT') {
        const script = doc.createElement('script')
        script.innerHTML = str[0].innerHTML
        doc.head.appendChild( script ).parentNode.removeChild( script )
      }
    }

    return this;
  },

  text: function (content) {
    if (content) {
      for (let i = 0; i < this.length; i++) {
        this[i].textContent = content;
      }
    }
    else {
      if (!this.length) return '';

      return this[0].textContent;
    }
  },

  after: function (content) {
    if (content) {
      if (typeof content == 'string') {
        for (let i = 0; i < this.length; i++) {
          const after = this[i];

          if (after.nodeType != Node.ELEMENT_NODE) {
            const doc = after.ownerDocument;
            const tmp = doc.createElement('SPAN');

            $(after).after(tmp);
            $(tmp).after(content).remove();
          }
          else {
            after.insertAdjacentHTML('afterend', content);
          }
        }
      }
      else {
        const after = this[0];

        if (after.nextSibling) {
          if (content instanceof jQuery) {
            for (let i = 0; i < content.length; i++) {
              after.nextSibling.parentNode.insertBefore(content[i], after.nextSibling)
            }
          }
          else {
            after.nextSibling.parentNode.insertBefore(content, after.nextSibling)
          }
        }
        else {
          $(after.parentNode).append(content);
        }
      }
    }

    return this;
  },

  clone: function (deep) {
    const ret = $();

    for (let i = 0; i < this.length; i++) {
      ret.push(this[i].cloneNode(deep));
    }

    return ret;
  },

  replaceWith: function (content) {
    if (typeof content === 'string') {
      for (let i = 0; i < this.length; i++) {
        if (this[i].parentNode) {
          this[i].outerHTML = content
        }
      }
    }
    else if (content.length) {
      for (let i = 0; i < this.length; i++) {
        this.replaceWith(content[i]);
      }
    }
    else {
      this.after(content).remove();
    }
  },

  insertBefore: function (el) {
    $(el).before(this[0]);

    return this;
  },

  before: function (content) {
    if (content instanceof jQuery) {
      for (let i = 0; i < content.length; i++) {
        this.before(content[i]);
      }

      return this;
    }

    if (content) {
      if (typeof content == 'string') {
        for (let i = 0; i < this.length; i++) {
          const before = this[i];

          if (before.nodeType != Node.ELEMENT_NODE) {
            const doc = before.ownerDocument;
            const tmp = doc.createElement('SPAN')

            $(before).before(tmp);
            $(tmp).before(content).remove();
          }
          else {
            if(before.parentNode) {
              before.insertAdjacentHTML('beforebegin', content);
            }
          }
        }
      } else {
        const before = this[0];
        if(before.parentNode) {
          if (content instanceof jQuery) {
            for (let i = 0; i < content.length; i++) {
              before.parentNode.insertBefore(content[i], before)
            }
          }
          else {
            before.parentNode.insertBefore(content, before)
          }
        }
      } 
    }

    return this;
  },

  append: function (content) {
    if (this.length == 0) return this;

    if (typeof content == 'string') {
      for (let i = 0; i < this.length; i++) {
        const parent = this[i];
        const doc = parent.ownerDocument;
        const tmp = doc.createElement('SPAN');

        $(parent).append(tmp);
        $(tmp).after(content).remove();
      }
    }
    else {
      if (content instanceof jQuery || Array.isArray(content)) {
        for (let i = 0; i < content.length; i++) {
          this.append(content[i]);
        }
      }
      else {
        if (typeof content !== 'function') {
          this[0].appendChild(content);
        }
      }
    }

    return this;
  },
  
  prepend: function (content) {
    if (this.length == 0) return this;

    if (typeof content == 'string') {
      for (let i = 0; i < this.length; i++) {
        const parent = this[i];

        const doc = parent.ownerDocument;
        const tmp = doc.createElement('SPAN')

        $(parent).prepend(tmp);
        $(tmp).before(content).remove();
      }
    }
    else {
      if (content instanceof jQuery) {
        for (let i = 0; i < content.length; i++) {
          this.prepend(content[i]);
        }
      }
      else {
        const parent = this[0];

        if (!parent.firstChild) {
          $(parent).append(content);
        }
        else {
          if (parent.firstChild) {
            parent.insertBefore(content, parent.firstChild);
          }
          else {
            parent.appendChild(content);
          }
        }
      }
    }

    return this;
  },

  remove: function () {
    for (let i = 0; i < this.length; i++) {
      if (this[i].parentNode) {
        this[i].parentNode.removeChild(this[i]);
      }
    }

    return this;
  },

  prev: function () {
    // replicate the jQuery behavior
    if (this.length && this[0].previousElementSibling) {
      return $(this[0].previousElementSibling);
    }
    else {
      return $();
    }
  },

  next: function () {
    if (this.length && this[0].nextElementSibling) {
      return $(this[0].nextElementSibling);
    }
    else {
      return $();
    }
  },

  //https://github.com/froala-labs/froala-editor-js-2/issues/1874
  nextAllVisible: function () {
    return this.next();
  },

  //https://github.com/froala-labs/froala-editor-js-2/issues/1874
  prevAllVisible: function () {
    return this.prev();
  },

  outerHeight: function (margin) {
    if (this.length === 0) return undefined

    const el = this[0]
    
    if (el === el.window) {
      return el.innerHeight
    }

    // Remember the old values, and insert the new ones
    const old = {}
    const isVisible = this.isVisible()
    if (!isVisible) {
      for (const name in cssShow ) {
        old[ name ] = el.style[ name ]
        el.style[ name ] = cssShow[ name ]
      }
    }

    let height = el.offsetHeight
    if (margin) {
      height += parseInt($(el).css('marginTop')) + parseInt($(el).css('marginBottom'))
    }

    // Revert the old values
    if (!isVisible) {
      for (const name in cssShow ) {
        el.style[ name ] = old[ name ]
      }
    }

    return height
  },

  outerWidth: function (margin) {
    if (this.length === 0) return undefined

    const el = this[0]

    if (el === el.window) {
      return el.outerWidth
    }

    // Remember the old values, and insert the new ones
    const old = {}
    const isVisible = this.isVisible()
    if (!isVisible) {
      for (const name in cssShow ) {
        old[ name ] = el.style[ name ]
        el.style[ name ] = cssShow[ name ]
      }
    }

    let width = el.offsetWidth
    if (margin) {
      width += parseInt($(el).css('marginLeft')) + parseInt($(el).css('marginRight'))
    }

    // Revert the old values
    if (!isVisible) {
      for (const name in cssShow ) {
        el.style[ name ] = old[ name ]
      }
    }

    return width
  },

  width: function (newWidth) {
    if(newWidth === undefined){
      if (this[0] instanceof HTMLDocument) {
        return this[0].body.offsetWidth
      }

      return this[0].offsetWidth
    }
    else {
      this[0].style.width = newWidth + 'px'
    }
  },

  height: function (newHeight) {
    const elem = this[0]
    if(newHeight === undefined){
      if (elem instanceof HTMLDocument) {
        const doc = elem.documentElement
        return Math.max(elem.body.scrollHeight, doc.scrollHeight,
          elem.body.offsetHeight, doc.offsetHeight,
          doc.clientHeight);
      }
  
      return elem.offsetHeight;
    }
    else {
      elem.style.height = newHeight + 'px'
    }
    
  },

  is: function (el) {
    if (this.length === 0) return false;

    if (typeof el == 'string' && this[0].matches) {
      return this[0].matches(el);
    }
    else if (el instanceof jQuery) {
      return this[0] == el[0];
    }
    else {
      return this[0] == el;
    }
  },

  parent: function () {
    if (this.length === 0) return $();

    return $(this[0].parentNode);
  },

  parents: function (selector) {
    const ret = $();

    for (let i = 0; i < this.length; i++) {
      let el = this[i].parentNode;

      while (el && el != document && el.matches) {
        if (selector) {

          if (el.matches(selector)) {
            ret.push(el);
          }
        }
        else {
          ret.push(el);
        }

        el = el.parentNode;
      }
    }

    return ret;
  },

  parentsUntil: function (until, selector) {
    const ret = $();
    
    if (until instanceof jQuery && until.length > 0) {
      until = until[0]
    }
    
    for (let i = 0; i < this.length; i++) {
      let el = this[i].parentNode;

      while (el && el != document && el.matches && el != until && this[i] != until && !(typeof until == 'string' && el.matches(until))) {
        if (selector) {
          if (el.matches(selector)) {
            ret.push(el);
          }
        }
        else {
          ret.push(el);
        }

        el = el.parentNode;
      }
    }

    return ret;
  },

  insertAfter: function(elem) {
    const parentNode = elem.parent()[0]
    if ( parentNode ) {
      parentNode.insertBefore(this[0], elem[0].nextElementSibling)
    }
  },

  filter: function (fn) {
    const ret = $();

    if (typeof fn === 'function') {
      for (let i = 0; i < this.length; i++) {
        if (fn.call(this[i], this[i])) {
          ret.push(this[i]);
        }
      }
    }
    else if (typeof fn === 'string') {
      for (let i = 0; i < this.length; i++) {
        if (this[i].matches(fn)) {
          ret.push(this[i]);
        }
      }
    }

    return ret;
  },

  offset: function () {
    const rect = this[0].getBoundingClientRect();
    const win = this[0].ownerDocument.defaultView;

    return {
      top: rect.top + win.pageYOffset,
      left: rect.left + win.pageXOffset
    }
  },

  position: function () {
    return {
      left: this[0].offsetLeft,
      top: this[0].offsetTop
    }
  },

  // For internal use only.
  // Behaves like an Array's method, not like a jQuery method.
  push: [].push,
  splice: [].splice
};

jQuery.extend = function (new_obj) {
  new_obj = new_obj || {};

  // Loop arguments.
  for (let i = 1; i < arguments.length; i++) {
    if (!arguments[i])
      continue;

    for (let key in arguments[i]) {
      if (Object.prototype.hasOwnProperty.call(arguments[i], key))
        new_obj[key] = arguments[i][key];
    }
  }

  return new_obj;
}

jQuery.merge = function (first, second) {
  let len = +second.length,
    j = 0,
    i = first.length;

  for (; j < len; j++) {
    first[i++] = second[j];
  }

  first.length = i;

  return first;
}

jQuery.map = function (elems, callback, arg) {
  let length, value,
    i = 0,
    ret = [];

  // Go through the array, translating each of the items to their new values
  if (Array.isArray(elems)) {
    length = elems.length;
    for (; i < length; i++) {
      value = callback(elems[i], i, arg);

      if (value != null) {
        ret.push(value);
      }
    }

    // Go through every key on the object,
  } else {
    for (i in elems) {
      value = callback(elems[i], i, arg);

      if (value != null) {
        ret.push(value);
      }
    }
  }

  // Flatten any nested arrays
  return [].concat.apply([], ret);
}

var init = function (selector, context) {
  if (!selector) {
    return this;
  }

  if (typeof selector == 'string' && selector[0] === '<') {
    const tmp = document.createElement('DIV')
    tmp.innerHTML = selector

    return $(tmp.firstElementChild);
  }

  context = context instanceof jQuery ? context[0] : context;

  if (typeof selector == 'string') {

    selector = _normalizeSelector(selector);

    const els = (context || document).querySelectorAll(selector);

    for (let i = 0; i < els.length; i++) {
      this[i] = els[i];
    }

    this.length = els.length;

    return this;
  }
  else {
    if (!(selector instanceof jQuery)) {
      this[0] = selector;
      this.length = 1;
      return this;
    }
    return selector;
  }
}

init.prototype = jQuery.prototype;

export default jQuery;
