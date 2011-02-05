// html5shiv MIT @rem remysharp.com/html5-enabling-script
// iepp v1.5.1 MIT @jon_neal iecss.com/print-protector
(function(p,e){if(!p.attachEvent || window.Modernizr){return;}var q=e.createElement("div");q.innerHTML="<z>i</z>";q.childNodes.length!==1&&function(){function r(a,b){if(g[a])g[a].styleSheet.cssText+=b;else{var c=s[l],d=e[j]("style");d.media=a;c.insertBefore(d,c[l]);g[a]=d;r(a,b)}}function t(a,b){for(var c=new RegExp("\\b("+m+")\\b(?!.*[;}])","gi"),d=function(k){return".iepp_"+k},h=-1;++h<a.length;){b=a[h].media||b;t(a[h].imports,b);r(b,a[h].cssText.replace(c,d))}}for(var s=e.documentElement,i=e.createDocumentFragment(),g={},m="abbr article aside audio canvas details figcaption figure footer header hgroup mark meter nav output progress section summary time video".replace(/ /g, '|'),
n=m.split("|"),f=[],o=-1,l="firstChild",j="createElement";++o<n.length;){e[j](n[o]);i[j](n[o])}i=i.appendChild(e[j]("div"));p.attachEvent("onbeforeprint",function(){for(var a,b=e.getElementsByTagName("*"),c,d,h=new RegExp("^"+m+"$","i"),k=-1;++k<b.length;)if((a=b[k])&&(d=a.nodeName.match(h))){c=new RegExp("^\\s*<"+d+"(.*)\\/"+d+">\\s*$","i");i.innerHTML=a.outerHTML.replace(/\r|\n/g," ").replace(c,a.currentStyle.display=="block"?"<div$1/div>":"<span$1/span>");c=i.childNodes[0];c.className+=" iepp_"+
d;c=f[f.length]=[a,c];a.parentNode.replaceChild(c[1],c[0])}t(e.styleSheets,"all")});p.attachEvent("onafterprint",function(){for(var a=-1,b;++a<f.length;)f[a][1].parentNode.replaceChild(f[a][0],f[a][1]);for(b in g)s[l].removeChild(g[b]);g={};f=[]})}()})(this,document);
(function($){
	var doc = document;
	var b;
	var d;
	var rtagName = /<([\w:]+)/;
	var wrapMap = {
		option: 1,
		optgroup: 1,
		legend: 1,
		thead: 1,
		tr: 1,
		td: 1,
		col: 1,
		area: 1
	};
	
	$.webshims.fixHTML5 = function(h) {
			if(typeof h != 'string' || wrapMap[ (rtagName.exec(h) || ["", ""])[1].toLowerCase() ]){return h;}
			if (!d) {
				b = doc.body;
				if(!b){return h;}
				d = doc.createElement('div');
				d.style.display = 'none';
			}
			var e = d.cloneNode(false);
			b.appendChild(e);
			e.innerHTML = h;
			b.removeChild(e);
			return e.childNodes;
		}
	;
})(jQuery);
// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License
// -- tlrobinson Tom Robinson
// -- dantman Daniel Friesen
// -- aFarkas Alexander Farkas

/*!
    Copyright (c) 2009, 280 North Inc. http://280north.com/
    MIT License. http://github.com/280north/narwhal/blob/master/README.md
*/
(function(){
// this is often accessed, so avoid multiple dereference costs universally
var has = Object.prototype.hasOwnProperty;
var otoString = Object.prototype.toString;
//
// Array
// =====
//

// ES5 15.4.3.2 
if (!Array.isArray) {
    Array.isArray = function(obj) {
        return otoString.call(obj) == "[object Array]";
    };
}
	
//
// Object
// ======
//

// ES5 15.2.3.14
// http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
if (!Object.keys) {

    var hasDontEnumBug = true,
        dontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    for (var key in {"toString": null})
        hasDontEnumBug = false;

    Object.keys = function (object) {

        if (
            typeof object !== "object" && typeof object !== "function"
            || object === null
        )
            throw new TypeError("Object.keys called on a non-object");

        var keys = [];
        for (var name in object) {
            if (has.call(object, name)) {
                keys.push(name);
            }
        }

        if (hasDontEnumBug) {
            for (var i = 0, ii = dontEnumsLength; i < ii; i++) {
                var dontEnum = dontEnums[i];
                if (has.call(object, dontEnum)) {
                    keys.push(dontEnum);
                }
            }
        }

        return keys;
    };

} 



if((!Modernizr.advancedObjectProperties || !Object.create || !Object.defineProperties || !Object.getOwnPropertyDescriptor  || !Object.defineProperty) && window.jQuery && jQuery.webshims){
	var shims = jQuery.webshims;
	shims.objectCreate = function(proto, props, opts){
		var o;
		var f = function(){};
		
		f.prototype = proto;
		o = new f();
		if(props){
			shims.defineProperties(o, props);
		}
		
		if(opts){
			o.options = jQuery.extend(true, {}, o.options || {}, opts);
			opts = o.options;
		}
		
		if(o._create && jQuery.isFunction(o._create)){
			o._create(opts);
		}
		return o;
	};
	
	shims.defineProperties = function(object, props){
		for (var name in props) {
			if (has.call(props, name)) {
				shims.defineProperty(object, name, props[name]);
			}
		}
		return object;
	};
	
	var descProps = ['configurable', 'enumerable', 'writable'];
	shims.defineProperty = function(proto, property, descriptor){
		if(typeof descriptor != "object"){return proto;}
		
		
		if(Object.defineProperty){
			for(var i = 0; i < 3; i++){
				if(!(descProps[i] in descriptor) && (descProps[i] !== 'writable' || descriptor.value !== undefined)){
					descriptor[descProps[i]] = true;
				}
			}
			try{
				Object.defineProperty(proto, property, descriptor);
				return;
			} catch(e){}
		}
		if(has.call(descriptor, "value")){
			proto[property] = descriptor.value;
			return proto;
		}
		
		if(proto.__defineGetter__){
            if (typeof descriptor.get == "function") {
				proto.__defineGetter__(property, descriptor.get);
			}
            if (typeof descriptor.set == "function"){
                proto.__defineSetter__(property, descriptor.set);
			}
        }
		return proto;
	};
	
	shims.getPrototypeOf = function (object) {
        return Object.getPrototypeOf && Object.getPrototypeOf(object) || object.__proto__ || object.constructor && object.constructor.prototype;
    };
	
	//based on http://www.refactory.org/s/object_getownpropertydescriptor/view/latest 
	shims.getOwnPropertyDescriptor = function(obj, prop){
		if (typeof obj !== "object" && typeof obj !== "function" || obj === null){
            throw new TypeError("Object.getOwnPropertyDescriptor called on a non-object");
		}
		var descriptor;
		if(Object.defineProperty && Object.getOwnPropertyDescriptor){
			try{
				descriptor = Object.getOwnPropertyDescriptor(obj, prop);
				return descriptor;
			} catch(e){}
		}
        descriptor = {
            configurable: true,
            enumerable: true,
            writable: true,
            value: undefined
        };
		var getter = obj.__lookupGetter__ && obj.__lookupGetter__(prop), 
			setter = obj.__lookupSetter__ && obj.__lookupSetter__(prop)
		;
        
        if (!getter && !setter) { // not an accessor so return prop
        	if(!has.call(obj, prop)){
				return;
			}
            descriptor.value = obj[prop];
            return descriptor;
        }
        
        // there is an accessor, remove descriptor.writable; populate descriptor.get and descriptor.set
        delete descriptor.writable;
        delete descriptor.value;
        descriptor.get = descriptor.set = undefined;
        
        if(getter){
			descriptor.get = getter;
		}
        
        if(setter){
            descriptor.set = setter;
		}
        
        return descriptor;
    };

}




//
// Date
// ====
//


// 15.9.4.2 Date.parse (string)
// 15.9.1.15 Date Time String Format
// Date.parse
// based on work shared by Daniel Friesen (dantman)
// http://gist.github.com/303249
if (isNaN(Date.parse("T00:00"))) {
    // XXX global assignment won't work in embeddings that use
    // an alternate object for the context.
    Date = (function(NativeDate) {

        // Date.length === 7
        var Date = function(Y, M, D, h, m, s, ms) {
            var length = arguments.length;
            if (this instanceof NativeDate) {
                var date = length === 1 && String(Y) === Y ? // isString(Y)
                    // We explicitly pass it through parse:
                    new NativeDate(Date.parse(Y)) :
                    // We have to manually make calls depending on argument
                    // length here
                    length >= 7 ? new NativeDate(Y, M, D, h, m, s, ms) :
                    length >= 6 ? new NativeDate(Y, M, D, h, m, s) :
                    length >= 5 ? new NativeDate(Y, M, D, h, m) :
                    length >= 4 ? new NativeDate(Y, M, D, h) :
                    length >= 3 ? new NativeDate(Y, M, D) :
                    length >= 2 ? new NativeDate(Y, M) :
                    length >= 1 ? new NativeDate(Y) :
                                  new NativeDate();
                // Prevent mixups with unfixed Date object
                date.constructor = Date;
                return date;
            }
            return NativeDate.apply(this, arguments);
        };

        // 15.9.1.15 Date Time String Format
        var isoDateExpression = new RegExp("^" +
            "(?:" + // optional year-month-day
                "(" + // year capture
                    "(?:[+-]\\d\\d)?" + // 15.9.1.15.1 Extended years
                    "\\d\\d\\d\\d" + // four-digit year
                ")" +
                "(?:-" + // optional month-day
                    "(\\d\\d)" + // month capture
                    "(?:-" + // optional day
                        "(\\d\\d)" + // day capture
                    ")?" +
                ")?" +
            ")?" + 
            "(?:T" + // hour:minute:second.subsecond
                "(\\d\\d)" + // hour capture
                ":(\\d\\d)" + // minute capture
                "(?::" + // optional :second.subsecond
                    "(\\d\\d)" + // second capture
                    "(?:\\.(\\d\\d\\d))?" + // milisecond capture
                ")?" +
            ")?" +
            "(?:" + // time zone
                "Z|" + // UTC capture
                "([+-])(\\d\\d):(\\d\\d)" + // timezone offset
                // capture sign, hour, minute
            ")?" +
        "$");

        // Copy any custom methods a 3rd party library may have added
        for (var key in NativeDate)
            Date[key] = NativeDate[key];

        // Copy "native" methods explicitly; they may be non-enumerable
        Date.now = NativeDate.now;
        Date.UTC = NativeDate.UTC;
        Date.prototype = NativeDate.prototype;
        Date.prototype.constructor = Date;

        // Upgrade Date.parse to handle the ISO dates we use
        // TODO review specification to ascertain whether it is
        // necessary to implement partial ISO date strings.
        Date.parse = function(string) {
            var match = isoDateExpression.exec(string);
            if (match) {
                match.shift(); // kill match[0], the full match
                // recognize times without dates before normalizing the
                // numeric values, for later use
                var timeOnly = match[0] === undefined;
                // parse numerics
                for (var i = 0; i < 10; i++) {
                    // skip + or - for the timezone offset
                    if (i === 7)
                        continue;
                    // Note: parseInt would read 0-prefix numbers as
                    // octal.  Number constructor or unary + work better
                    // here:
                    match[i] = +(match[i] || (i < 3 ? 1 : 0));
                    // match[1] is the month. Months are 0-11 in JavaScript
                    // Date objects, but 1-12 in ISO notation, so we
                    // decrement.
                    if (i === 1)
                        match[i]--;
                }
                // if no year-month-date is provided, return a milisecond
                // quantity instead of a UTC date number value.
                if (timeOnly)
                    return ((match[3] * 60 + match[4]) * 60 + match[5]) * 1000 + match[6];

                // account for an explicit time zone offset if provided
                var offset = (match[8] * 60 + match[9]) * 60 * 1000;
                if (match[6] === "-")
                    offset = -offset;

                return NativeDate.UTC.apply(this, match.slice(0, 7)) + offset;
            }
            return NativeDate.parse.apply(this, arguments);
        };

        return Date;
    })(Date);
}


// 
// Function
// ========
// 

// ES-5 15.3.4.5
// http://www.ecma-international.org/publications/files/drafts/tc39-2009-025.pdf
var slice = Array.prototype.slice;
if (!Function.prototype.bind) {
    Function.prototype.bind = function (that) { // .length is 1
        // 1. Let Target be the this value.
        var target = this;
        // 2. If IsCallable(Target) is false, throw a TypeError exception.
        // XXX this gets pretty close, for all intents and purposes, letting 
        // some duck-types slide
        if (typeof target.apply != "function" || typeof target.call != "function")
            return new TypeError();
        // 3. Let A be a new (possibly empty) internal list of all of the
        //   argument values provided after thisArg (arg1, arg2 etc), in order.
        var args = slice.call(arguments);
        // 4. Let F be a new native ECMAScript object.
        // 9. Set the [[Prototype]] internal property of F to the standard
        //   built-in Function prototype object as specified in 15.3.3.1.
        // 10. Set the [[Call]] internal property of F as described in
        //   15.3.4.5.1.
        // 11. Set the [[Construct]] internal property of F as described in
        //   15.3.4.5.2.
        // 12. Set the [[HasInstance]] internal property of F as described in
        //   15.3.4.5.3.
        // 13. The [[Scope]] internal property of F is unused and need not
        //   exist.
        var bound = function () {

            if (this instanceof bound) {
                // 15.3.4.5.2 [[Construct]]
                // When the [[Construct]] internal method of a function object,
                // F that was created using the bind function is called with a
                // list of arguments ExtraArgs the following steps are taken:
                // 1. Let target be the value of F's [[TargetFunction]]
                //   internal property.
                // 2. If target has no [[Construct]] internal method, a
                //   TypeError exception is thrown.
                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.

                var self = Object.create(target.prototype);
                target.apply(self, args.concat(slice.call(arguments)));
                return self;

            } else {
                // 15.3.4.5.1 [[Call]]
                // When the [[Call]] internal method of a function object, F,
                // which was created using the bind function is called with a
                // this value and a list of arguments ExtraArgs the following
                // steps are taken:
                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 2. Let boundThis be the value of F's [[BoundThis]] internal
                //   property.
                // 3. Let target be the value of F's [[TargetFunction]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the list
                //   boundArgs in the same order followed by the same values as
                //   the list ExtraArgs in the same order. 5.  Return the
                //   result of calling the [[Call]] internal method of target
                //   providing boundThis as the this value and providing args
                //   as the arguments.

                // equiv: target.call(this, ...boundArgs, ...args)
                return target.call.apply(
                    target,
                    args.concat(slice.call(arguments))
                );

            }

        };
        // 5. Set the [[TargetFunction]] internal property of F to Target.
        // extra:
        bound.bound = target;
        // 6. Set the [[BoundThis]] internal property of F to the value of
        // thisArg.
        // extra:
        bound.boundTo = that;
        // 7. Set the [[BoundArgs]] internal property of F to A.
        // extra:
        bound.boundArgs = args;
        bound.length = (
            // 14. If the [[Class]] internal property of Target is "Function", then
            typeof target == "function" ?
            // a. Let L be the length property of Target minus the length of A.
            // b. Set the length own property of F to either 0 or L, whichever is larger.
            Math.max(target.length - args.length, 0) :
            // 15. Else set the length own property of F to 0.
            0
        )
        // 16. The length own property of F is given attributes as specified in
        //   15.3.5.1.
        // TODO
        // 17. Set the [[Extensible]] internal property of F to true.
        // TODO
        // 18. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "caller", PropertyDescriptor {[[Value]]: null,
        //   [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]:
        //   false}, and false.
        // TODO
        // 19. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "arguments", PropertyDescriptor {[[Value]]: null,
        //   [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]:
        //   false}, and false.
        // TODO
        // NOTE Function objects created using Function.prototype.bind do not
        // have a prototype property.
        // XXX can't delete it in pure-js.
        return bound;
    };
}
})();
// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License
// -- tlrobinson Tom Robinson
// -- dantman Daniel Friesen

/*!
    Copyright (c) 2009, 280 North Inc. http://280north.com/
    MIT License. http://github.com/280north/narwhal/blob/master/README.md
*/

(function () {

/**
 * Brings an environment as close to ECMAScript 5 compliance
 * as is possible with the facilities of erstwhile engines.
 *
 * ES5 Draft
 * http://www.ecma-international.org/publications/files/drafts/tc39-2009-050.pdf
 *
 * NOTE: this is a draft, and as such, the URL is subject to change.  If the
 * link is broken, check in the parent directory for the latest TC39 PDF.
 * http://www.ecma-international.org/publications/files/drafts/
 *
 * Previous ES5 Draft
 * http://www.ecma-international.org/publications/files/drafts/tc39-2009-025.pdf
 * This is a broken link to the previous draft of ES5 on which most of the
 * numbered specification references and quotes herein were taken.  Updating
 * these references and quotes to reflect the new document would be a welcome
 * volunteer project.
 * 
 * @module
 */

/*whatsupdoc*/

// this is often accessed, so avoid multiple dereference costs universally
var has = Object.prototype.hasOwnProperty;

//
// Array
// =====
//

// ES5 15.4.4.18
if (!Array.prototype.forEach) {
    Array.prototype.forEach =  function(block, thisObject) {
        var len = this.length >>> 0;
        for (var i = 0; i < len; i++) {
            if (i in this) {
                block.call(thisObject, this[i], i, this);
            }
        }
    };
}
// ES5 15.4.4.19
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
if (!Array.prototype.map) {
    Array.prototype.map = function(fun /*, thisp*/) {
        var len = this.length >>> 0;
        if (typeof fun != "function")
          throw new TypeError();

        var res = new Array(len);
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this)
                res[i] = fun.call(thisp, this[i], i, this);
        }

        return res;
    };
}

// ES5 15.4.4.20
if (!Array.prototype.filter) {
    Array.prototype.filter = function (block /*, thisp */) {
        var values = [];
        var thisp = arguments[1];
        for (var i = 0; i < this.length; i++)
            if (block.call(thisp, this[i]))
                values.push(this[i]);
        return values;
    };
}

// ES5 15.4.4.16
if (!Array.prototype.every) {
    Array.prototype.every = function (block /*, thisp */) {
        var thisp = arguments[1];
        for (var i = 0; i < this.length; i++)
            if (!block.call(thisp, this[i]))
                return false;
        return true;
    };
}

// ES5 15.4.4.17
if (!Array.prototype.some) {
    Array.prototype.some = function (block /*, thisp */) {
        var thisp = arguments[1];
        for (var i = 0; i < this.length; i++)
            if (block.call(thisp, this[i]))
                return true;
        return false;
    };
}

// ES5 15.4.4.21
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function(fun /*, initial*/) {
        var len = this.length >>> 0;
        if (typeof fun != "function")
            throw new TypeError();

        // no value to return if no initial value and an empty array
        if (len == 0 && arguments.length == 1)
            throw new TypeError();

        var i = 0;
        if (arguments.length >= 2) {
            var rv = arguments[1];
        } else {
            do {
                if (i in this) {
                    rv = this[i++];
                    break;
                }

                // if array contains no values, no initial value to return
                if (++i >= len)
                    throw new TypeError();
            } while (true);
        }

        for (; i < len; i++) {
            if (i in this)
                rv = fun.call(null, rv, this[i], i, this);
        }

        return rv;
    };
}

// ES5 15.4.4.22
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
if (!Array.prototype.reduceRight) {
    Array.prototype.reduceRight = function(fun /*, initial*/) {
        var len = this.length >>> 0;
        if (typeof fun != "function")
            throw new TypeError();

        // no value to return if no initial value, empty array
        if (len == 0 && arguments.length == 1)
            throw new TypeError();

        var i = len - 1;
        if (arguments.length >= 2) {
            var rv = arguments[1];
        } else {
            do {
                if (i in this) {
                    rv = this[i--];
                    break;
                }

                // if array contains no values, no initial value to return
                if (--i < 0)
                    throw new TypeError();
            } while (true);
        }

        for (; i >= 0; i--) {
            if (i in this)
                rv = fun.call(null, rv, this[i], i, this);
        }

        return rv;
    };
}

// ES5 15.4.4.14
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (value /*, fromIndex */ ) {
        var length = this.length;
        if (!length)
            return -1;
        var i = arguments[1] || 0;
        if (i >= length)
            return -1;
        if (i < 0)
            i += length;
        for (; i < length; i++) {
            if (!has.call(this, i))
                continue;
            if (value === this[i])
                return i;
        }
        return -1;
    };
}

// ES5 15.4.4.15
if (!Array.prototype.lastIndexOf) {
    Array.prototype.lastIndexOf = function (value /*, fromIndex */) {
        var length = this.length;
        if (!length)
            return -1;
        var i = arguments[1] || length;
        if (i < 0)
            i += length;
        i = Math.min(i, length - 1);
        for (; i >= 0; i--) {
            if (!has.call(this, i))
                continue;
            if (value === this[i])
                return i;
        }
        return -1;
    };
}

//
// Date
// ====
//

// ES5 15.9.5.43
// Format a Date object as a string according to a subset of the ISO-8601 standard.
// Useful in Atom, among other things.
if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function() {
        return (
            this.getFullYear() + "-" +
            (this.getMonth() + 1) + "-" +
            this.getDate() + "T" +
            this.getHours() + ":" +
            this.getMinutes() + ":" +
            this.getSeconds() + "Z"
        ); 
    }
}

// ES5 15.9.4.4
if (!Date.now) {
    Date.now = function () {
        return new Date().getTime();
    };
}

// ES5 15.9.5.44
if (!Date.prototype.toJSON) {
    Date.prototype.toJSON = function (key) {
        // This function provides a String representation of a Date object for
        // use by JSON.stringify (15.12.3). When the toJSON method is called
        // with argument key, the following steps are taken:

        // 1.  Let O be the result of calling ToObject, giving it the this
        // value as its argument.
        // 2. Let tv be ToPrimitive(O, hint Number).
        // 3. If tv is a Number and is not finite, return null.
        // XXX
        // 4. Let toISO be the result of calling the [[Get]] internal method of
        // O with argument "toISOString".
        // 5. If IsCallable(toISO) is false, throw a TypeError exception.
        if (typeof this.toISOString != "function")
            throw new TypeError();
        // 6. Return the result of calling the [[Call]] internal method of
        // toISO with O as the this value and an empty argument list.
        return this.toISOString();

        // NOTE 1 The argument is ignored.

        // NOTE 2 The toJSON function is intentionally generic; it does not
        // require that its this value be a Date object. Therefore, it can be
        // transferred to other kinds of objects for use as a method. However,
        // it does require that any such object have a toISOString method. An
        // object is free to use the argument key to filter its
        // stringification.
    };
}

//
// String
// ======
//

// ES5 15.5.4.20
if (!String.prototype.trim) {
    // http://blog.stevenlevithan.com/archives/faster-trim-javascript
    var trimBeginRegexp = /^\s\s*/;
    var trimEndRegexp = /\s\s*$/;
    String.prototype.trim = function () {
        return String(this).replace(trimBeginRegexp, '').replace(trimEndRegexp, '');
    };
}

})();
//DOM-Extension helper
jQuery.webshims.ready('es5', function($, webshims, window, document, undefined){
	//shortcus
	var support = $.support;
	var modules = webshims.modules;
	var has = Object.prototype.hasOwnProperty;
	var unknown = $.webshims.getPrototypeOf(document.createElement('foobar'));
	var htcTest;
	
	
	//proxying attribute
	var oldAttr = $.attr;
	var extendedProps = {};
	var modifyProps = {};
		
	$.attr = function(elem, name, value, arg1, arg3){
		var nodeName = (elem.nodeName || '').toLowerCase();
		if(!nodeName || elem.nodeType !== 1){return oldAttr(elem, name, value, arg1, arg3);}
		var desc = extendedProps[nodeName];
		var ret;
//		var getSetData;
						
		if(desc){
			desc = desc[name];
		}
		if(!desc){
			desc = extendedProps['*'];
			if(desc){
				desc = desc[name];
			}
		}
		
		// we got a winner
		if(desc){
			//getSetData is used for IE8-, to block infinite loops + autointit of DHTML behaviors 
//			getSetData = $.data(elem, '_polyfillblockProperty') || $.data(elem, '_polyfillblockProperty', {get: {}, set: {}, contentInit: {}});
			if(value === undefined){
//				if(getSetData.get[name]){return;}
//				getSetData.get[name] = true;
//				getSetData.get[name] = false;
				return (desc.get) ? desc.get.call(elem) : desc.value;
			} else if(desc.set) {
//				if(getSetData.set[name]){return;}
//				getSetData.set[name] = true;
//				if(elem.readyState === 'loading' && !getSetData.contentInit && !getSetData.get[name] && desc.get && value === webshims.contentAttr(elem, name)){
//					getSetData.contentInit = true;
//					value = desc.get.call(elem);
//				}
				ret = desc.set.call(elem, value);
//				getSetData.set[name] = false;
			}
		} else {
			ret = oldAttr(elem, name, value, arg1, arg3);
		}
		if(value !== undefined && modifyProps[nodeName] && modifyProps[nodeName][name]){
			$.each(modifyProps[nodeName][name], function(i, fn){
				fn.call(elem, value);
			});
		}
		return ret;
	};
	
	var extendQAttr =  function(nodeName, prop, desc){
		if(!extendedProps[nodeName]){
			extendedProps[nodeName] = {};
		}
		var oldDesc = extendedProps[nodeName][prop];
		var getSup = function(propType, descriptor, oDesc){
			if(descriptor && descriptor[propType]){
				return descriptor[propType];
			}
			if(oDesc && oDesc[propType]){
				return oDesc[propType];
			}
			return function(value){
				return oldAttr(this, prop, value);
			};
		};
		extendedProps[nodeName][prop] = desc;
		if(desc.value === undefined){
			if(!desc.set){
				desc.set = desc.writeable ? getSup('set', desc, oldDesc) : function(){throw(prop +'is readonly on '+ nodeName);};
			}
			if(!desc.get){
				desc.get = getSup('get', desc, oldDesc);
			}
			
		}
		
		$.each(['value', 'get', 'set'], function(i, descProp){
			if(desc[descProp]){
				desc['_sup'+descProp] = getSup(descProp, oldDesc);
			}
		});
	};
	

/*
 * Native extension feature
 */	
//	(function(){
//		var preloadElem = document.createElement('span');
//		var preloadStyle = preloadElem.style;
//		var preloaded = {};
//		
//		var processPreload = function(preload){
//			preload.props.forEach(function(htcFile){
//				if(preloaded[htcFile]){return;}
//				preloaded[htcFile] = true;
//				preloadStyle.behavior += ', '+htcFile;
//				if(preload.feature && preloadElem.readyState != 'complete'){
//					webshims.waitReady(preload.feature);
//					$(preloadElem).one('readystatechange', function(){
//						webshims.unwaitReady(preload.feature);
//					});
//				}
//			});
//		};
//		webshims.preloadHTCs = {push: processPreload};
//	})();
/*
 * END: Native extension feature
 */
	
	var initProp = (function(){
		
		var initProps = {};
		
		var isReady;
		webshims.addReady(function(context, contextElem){
			var nodeNameCache = {};
			var getElementsByName = function(name){
				if(!nodeNameCache[name]){
					nodeNameCache[name] = $(context.getElementsByTagName(name));
					if(contextElem[0] && $.nodeName(contextElem[0], name)){
						nodeNameCache[name] = nodeNameCache[name].add(contextElem);
					}
				}
			};
			
			
			$.each(initProps, function(name, fns){
				getElementsByName(name);
				fns.forEach(function(fn){
					nodeNameCache[name].each(fn);
				});
			});
			nodeNameCache = null;
			isReady = true;
		});
		

		var createNodeNameInit = function(nodeName, fn){
			if(!initProps[nodeName]){
				initProps[nodeName] = [fn];
			} else {
				initProps[nodeName].push(fn);
			}
			if(isReady){
				$( document.getElementsByTagName(nodeName) ).each(fn);
			}
		};
		
		var elementExtends = {};
		var loadedDHTMLFiles = {};
		return {
			/*
			 * Native extension feature
			 */
//			extend: function(nodeName, prop, desc){
//				if(!elementExtends[prop]){
//					elementExtends[prop] = 0;
//				}
//				elementExtends[prop]++;
//				transformDescriptor(document.createElement(nodeName), prop, desc, '_sup'+ prop + elementExtends[prop]);
//				createNodeNameInit(nodeName, function(){
//					transformDescriptor(this, prop, desc, '_sup'+ prop + elementExtends[prop], true);
//					webshims.defineProperty(this, prop, desc);
//				});
//			},
//			extendDHTML: function(nodeName, htcFile, prop, feature){
//				webshims.preloadHTCs.push({feature: feature, props: [htcFile]});
//				if(!loadedDHTMLFiles[nodeName]){
//					loadedDHTMLFiles[nodeName] = '';
//				}
//				if(loadedDHTMLFiles[nodeName].indexOf(htcFile) != -1){return;}
//				loadedDHTMLFiles[nodeName] += htcFile;
//				createNodeNameInit(nodeName, function(){
//					var behavior = this.style.behavior;
//					this.style.behavior += behavior ? ', '+htcFile : htcFile;
//				});
//			},
			/*
			 * END: Native extension feature
			 */
			init: function(nodeName, prop, all){
				createNodeNameInit(nodeName, function(){
					var jElm = $(this);
					if(all !== 'all'){
						jElm = jElm.filter('['+ prop +']');
					}
					jElm.attr(prop, function(i, val){
						return val;
					});
				});
			}
		};
	})();
	
	/*
	 * Native extension feature
	 */
//	var transformDescriptor = function(proto, prop, desc, elementID, wasExtended){
//		var oDesc;
//		
//		var getSup = function(descriptor, accessType){
//			if(descriptor && descriptor[accessType]){
//				return descriptor[accessType];
//			}
//			
//			if(descriptor.value !== undefined){
//				//if original is a value, but we use an accessor
//				if(accessType == 'set'){
//					return(elementID) ? function(val){$.data(proto, elementID).value = val;} : function(val){descriptor.value = val;};
//				}
//				if(accessType == 'get'){
//					return (elementID) ? function(){return $.data(proto, elementID).value;} : function(){return descriptor.value;};
//				}
//			}
//			return function(value){
//				return webshims.contentAttr(this, prop, value);
//			};
//		};
//		
//		if(proto && prop){
//			
//			while(proto && prop in proto && !has.call(proto, prop)){
//				proto = webshims.getPrototypeOf(proto);
//			}
//			
//			oDesc = webshims.getOwnPropertyDescriptor(proto, prop) || {configurable: true};
//			
//			if(!oDesc.configurable && !oDesc.writeable){return false;}
//			if(elementID){
//				$.data(proto, elementID, oDesc);
//			}
//			if(!wasExtended){
//				if(desc.get){
//					desc._supget = getSup(oDesc, 'get');
//				}
//				if(desc.set){
//					desc._supset = getSup(oDesc, 'set');
//				}
//				if(desc.value || oDesc.value !== undefined){
//					desc._supvalue = oDesc.value;
//				}
//			}
//		}
//		
//		if(desc.value === undefined){
//			if(!desc.set){
//				desc.set =  desc._supset || (!desc.writeable) ? function(){throw(prop +'is readonly on '+ this.nodeName);} : getSup(desc, 'set');
//			}
//			if(!desc.get){
//				desc.get = desc._supget || getSup(desc, 'get');
//			}
//		}
//		
//		return true;
//	};
//	
//	var extendContentAttr = (function(){
//		var extendedAttr = {};
//		var contentMethods = {};
//		var slice = Array.prototype.slice;
//		return function(nodeName, prop, desc){
//			if(!desc.remove && desc.defaultValue !== undefined && desc.set){
//				desc.remove = function(){
//					return desc.set.call(this, desc.defaultValue);
//				};
//			}
//			if(!extendedAttr[nodeName]){
//				var attrDesc = {};
//				extendedAttr[nodeName] = {};
//				contentMethods[nodeName] = {};
//				['set', 'get', 'remove'].forEach(function(type){
//					attrDesc[type] = webshims.defineNodeNameProperty(nodeName, type+'Attribute', {
//						value: function(name){
//							if(extendedAttr[nodeName][name] && extendedAttr[nodeName][name][type]){
//								var args = slice.call(arguments, 1);
//								return extendedAttr[nodeName][name][type].apply(this, args);
//							}
//							return attrDesc[type]._supvalue.apply(this, arguments);
//						}
//					}, true);
//					
//					contentMethods[nodeName][type] = attrDesc[type]._supvalue;
//				});
//				desc.content = contentMethods[nodeName];
//			} else {
//				desc.content = contentMethods[nodeName];
//			}
//			extendedAttr[nodeName][prop] = desc;
//		};
//	})();
	/*
	 * END: Native extension feature
	 */
	
	$.extend(webshims, {
		/*
		 * Native extension feature
		 */
//		waitReady: function(name){
//			webshims.waitReadys[name] = webshims.waitReadys[name] || 0;
//			webshims.waitReadys[name]++;
//		},
//		unwaitReady: function(name){
//			webshims.waitReadys[name] = webshims.waitReadys[name] || 1;
//			webshims.waitReadys[name]--;
//			if(webshims.waitReadys[name+'ReadyCall'] && !webshims.waitReadys[name]){
//				webshims.isReady(name, true);
//			}
//		},
		/*
		 * END: Native extension feature
		 */
		defineNodeNameProperty: function(nodeName, prop, desc, extend, htc, feature){
			desc = $.extend({writeable: true, idl: true}, desc);
			
			
			/*
			 * Native extension feature
			 */
			var extendedNative = false;
			var htcHandled;
//			var oDesc;
//			
//			if(webshims.cfg.extendNative && extend){
//				(function(){
//					if(desc.content && prop == 'placeholder'){
//						extendContentAttr(nodeName, prop, desc);
//					}
//					var element = document.createElement(nodeName);
//					if(support.objectAccessor && support.contentAttr && unknown){
//						//ToDo extend property on all elements
//						
//						var proto  = webshims.getPrototypeOf(element);
//						
//						//extend property on unknown elements
//						if(unknown === proto){
//							initProp.extend(nodeName, prop, desc);
//							extendedNative = true;
//							return;
//						}
//						
//						//extend unknown property on known elements prototype
//						if(!(prop in element)){
//							transformDescriptor(false, false, desc);
//							webshims.defineProperty(proto, prop, desc);
//							extendedNative = true;
//							return;
//						}
//						//extend known property on element itself
//						if(has.call(element, prop)){
//							oDesc = webshims.getOwnPropertyDescriptor(element, prop);
//							
//							//abort can not extend native!
//							if(!oDesc.configurable){return;}
//							
//							initProp.extend(nodeName, prop, desc);
//							extendedNative = true;
//							return;
//						}
//						
//						//abort can not extend native!
//						if(!transformDescriptor(proto, prop, desc)){return;}
//						//extend known property on known elements prototype
//						webshims.defineProperty(proto, prop, desc);
//						extendedNative = true;
//						return;
//					} else if(desc.value !== undefined){
//						initProp.extend(nodeName, prop, desc);
//						extendedNative = true;
//						return;
//					} 
//					if(htc && support.dhtmlBehavior && !(prop in element)){
//						extendedNative = true;
//						htcHandled = true;
//						extendQAttr(nodeName, prop, desc);
//						initProp.extendDHTML(nodeName, 'url('+webshims.loader.makePath( 'htc/'+ (typeof htc == 'string' ? htc : prop) +'.htc') +')' , prop, feature);
//						return;
//					}
//				})();
//			}
			/*
			 * END: Native extension feature
			 */
			if(!extendedNative){
				if(extend && webshims.cfg.extendNative){
					webshims.log("could not extend "+ nodeName +"["+ prop +"] fallback to jQuery extend");
				}
				extendQAttr(nodeName, prop, desc);
			}
			/*
			 * Native extension feature
			 */
//			if(!htcTest && webshims.debug && extend && webshims.cfg.extendNative && htc){
//				htcTest = true;
//				$.ajax({
//					url: webshims.loader.makePath( 'htc/'+ (typeof htc == 'string' ? htc : prop) +'.htc'),
//					complete: function(xhr){
//						if(xhr.getResponseHeader){
//							var type = xhr.getResponseHeader('Content-Type') || '';
//							if(type != 'text/x-component'){
//								webshims.warn('content-type of htc-files should be "text/x-component", but was "'+ type +'"');
//								webshims.info('you should also let the client cache htc-files. use a proper expire header for htc-files');
//							}
//							if(type.indexOf('text/') !== 0){
//								webshims.warn('Error: content-type of htc-files is not text, this can not work in IE');
//							}
//						}
//					}
//				});
//			}
			/*
			 * END: Native extension feature
			 */
			if(desc.init){
				webshims.warn('Error: '+ nodeName +'['+ prop +'] uses desc.init');
			}
			if((desc.content && !htcHandled) || desc.init){
				initProp.init(nodeName, prop);
			}
			return desc;
		},
		defineNodeNamesProperty: function(names, prop, desc, extend, htc, feature){
			if(typeof names == 'string'){
				names = names.split(/\s*,\s*/);
			}
			names.forEach(function(nodeName){
				webshims.defineNodeNameProperty(nodeName, prop, desc, extend, htc, feature);
			});
		},
		onNodeNamesPropertyModify: function(nodeNames, prop, desc){
			if(typeof nodeNames == 'string'){
				nodeNames = nodeNames.split(/\s*,\s*/);
			}
			if($.isFunction(desc)){
				desc = {set: desc};
			}
			nodeNames.forEach(function(name){
				if(!modifyProps[name]){
					modifyProps[name] = {};
				}
				if(!modifyProps[name][prop]){
					modifyProps[name][prop] = [];
				}
				if(desc.set){
					modifyProps[name][prop].push(desc.set);
				}
				if(desc.init){
					webshims.warn('Error: '+ nodeName +'['+ prop +'] uses desc.init');
				}
				if(desc.content || desc.init){
					initProp.init(name, prop);
				}
			});
		},
		defineNodeNamesBooleanProperty: function(elementNames, prop, setDesc, extend, htc, feature){
			var desc = {
				set: function(val){
					var elem = this;
					if(elem.readyState === 'loading' && typeof val == 'string' && val === webshims.contentAttr(this, prop)){
						val = true;
					} else {
						val = !!val;
					}
					webshims.contentAttr(elem, prop, val);
					if(setDesc){
						setDesc.set.call(elem, val);
					}
					
					return val;
				},
				get: function(){
					return webshims.contentAttr(this, prop) != null;
				}
			};
			webshims.defineNodeNamesProperty(elementNames, prop, desc, extend, htc, feature);
		},
		contentAttr: function(elem, name, val){
			if(!elem.nodeName){return;}
			if(val === undefined){
				val = (elem.attributes[name] || {}).value;
				return (val == null) ? undefined : val;
			}
			
			if(typeof val == 'boolean'){
				if(!val){
					elem.removeAttribute(name);
				} else {
					elem.setAttribute(name, name);
				}
			} else {
				elem.setAttribute(name, val);
			}
		},
				
		activeLang: (function(){
			var langs = [navigator.browserLanguage || navigator.language || ''];
			var paLang = $('html').attr('lang');
			var timer;
			
			if(paLang){
				langs.push(paLang);
			}
			return function(lang, module, fn){
				if(lang){
					if(!module || !fn){
						if(lang !== langs[0]){
							langs[0] = lang;
							clearTimeout(timer);
							timer = setTimeout(function(){
								$(document).triggerHandler('webshimLocalizationReady', langs);
							}, 0);
						}
					} else {
						module = modules[module].options;
						var langObj = lang,
							remoteLangs = module && module.availabeLangs,
							loadRemoteLang = function(lang){
								if($.inArray(lang, remoteLangs) !== -1){
									webshims.loader.loadScript(module.langSrc+lang+'.js', function(){
										if(langObj[lang]){
											fn(langObj[lang]);
										}
									});
									return true;
								}
								return false;
							}
						;
						
						$.each(langs, function(i, lang){
							var shortLang = lang.split('-')[0];
							if(langObj[lang] || langObj[shortLang]){
								fn(langObj[lang] || langObj[shortLang]);
								return false;
							}
							if(remoteLangs && module.langSrc && (loadRemoteLang(lang) || loadRemoteLang(shortLang))){
								return false;
							}
						});
					}
				}
				return langs;
			};
		})()
	});
	
		
	webshims.isReady('webshimLocalization', true);
	webshims.isReady('dom-extend', true);
});(function($){
	if(navigator.geolocation){return;}
	var domWrite = function(){
			setTimeout(function(){
				throw('document.write is overwritten by geolocation shim. This method is incompatibel with this plugin');
			}, 1);
		},
		id = 0
	;
	var geoOpts = $.webshims.cfg.geolocation.options || {};
	navigator.geolocation = (function(){
		var pos;
		var api = {
			getCurrentPosition: function(success, error, opts){
				var locationAPIs = 2,
					errorTimer,
					googleTimer,
					calledEnd,
					endCallback = function(){
						if(calledEnd){return;}
						if(pos){
							calledEnd = true;
							success($.extend({timestamp: new Date().getTime()}, pos));
							resetCallback();
							if(window.JSON && window.sessionStorage){
								try{
									sessionStorage.setItem('storedGeolocationData654321', JSON.stringify(pos));
								} catch(e){}
							}
						} else if(error && !locationAPIs) {
							calledEnd = true;
							resetCallback();
							error({ code: 2, message: "POSITION_UNAVAILABLE"});
						}
					},
					googleCallback = function(){
						locationAPIs--;
						getGoogleCoords();
						endCallback();
					},
					resetCallback = function(){
						$(document).unbind('google-loader', resetCallback);
						clearTimeout(googleTimer);
						clearTimeout(errorTimer);
					},
					getGoogleCoords = function(){
						if(pos || !window.google || !google.loader || !google.loader.ClientLocation){return false;}
						var cl = google.loader.ClientLocation;
			            pos = {
							coords: {
								latitude: cl.latitude,
				                longitude: cl.longitude,
				                altitude: null,
				                accuracy: 43000,
				                altitudeAccuracy: null,
				                heading: parseInt('NaN', 10),
				                velocity: null
							},
			                //extension similiar to FF implementation
							address: $.extend({streetNumber: '', street: '', premises: '', county: '', postalCode: ''}, cl.address)
			            };
						return true;
					},
					getInitCoords = function(){
						if(pos){return;}
						getGoogleCoords();
						if(pos || !window.JSON || !window.sessionStorage){return;}
						try{
							pos = sessionStorage.getItem('storedGeolocationData654321');
							pos = (pos) ? JSON.parse(pos) : false;
							if(!pos.coords){pos = false;} 
						} catch(e){
							pos = false;
						}
					}
				;
				
				getInitCoords();
				
				if(!pos){
					if(geoOpts.confirmText && !confirm(geoOpts.confirmText.replace('{location}', location.hostname))){
						if(error){
							error({ code: 1, message: "PERMISSION_DENIED"});
						}
						return;
					}
					$.ajax({
						url: 'http://freegeoip.net/json/',
						dataType: 'jsonp',
						cache: true,
						jsonp: 'callback',
						success: function(data){
							locationAPIs--;
							if(!data){return;}
							pos = pos || {
								coords: {
									latitude: data.latitude,
					                longitude: data.longitude,
					                altitude: null,
					                accuracy: 43000,
					                altitudeAccuracy: null,
					                heading: parseInt('NaN', 10),
					                velocity: null
								},
				                //extension similiar to FF implementation
								address: {
									city: data.city,
									country: data.country_name,
									countryCode: data.country_code,
									county: "",
									postalCode: data.zipcode,
									premises: "",
									region: data.region_name,
									street: "",
									streetNumber: ""
								}
				            };
							endCallback();
						},
						error: function(){
							locationAPIs--;
							endCallback();
						}
					});
					clearTimeout(googleTimer);
					if (!window.google || !window.google.loader) {
						googleTimer = setTimeout(function(){
							//destroys document.write!!!
							if (geoOpts.destroyWrite) {
								document.write = domWrite;
								document.writeln = domWrite;
							}
							$(document).one('google-loader', googleCallback);
							$.webshims.loader.loadScript('http://www.google.com/jsapi', false, 'google-loader');
						}, 800);
					} else {
						locationAPIs--;
					}
				} else {
					setTimeout(endCallback, 1);
					return;
				}
				if(opts && opts.timeout){
					errorTimer = setTimeout(function(){
						resetCallback();
						if(error) {
							error({ code: 3, message: "TIMEOUT"});
						}
					}, opts.timeout);
				} else {
					errorTimer = setTimeout(function(){
						locationAPIs = 0;
						endCallback();
					}, 10000);
				}
			},
			clearWatch: $.noop
		};
		api.watchPosition = function(a, b, c){
			api.getCurrentPosition(a, b, c);
			id++;
			return id;
		};
		return api;
	})();
})(jQuery);
//todo use $.globalEval?
jQuery.webshims.gcEval = function(){
	with(arguments[1] && arguments[1].form || window) {
		with(arguments[1] || window){
			return (function(){eval( arguments[0] );}).call(arguments[1] || window, arguments[0]);
		}
	}
};
jQuery.webshims.ready('es5', function($, webshims, window, doc, undefined){
	"use strict";
	webshims.getVisualInput = function(elem){
		elem = $(elem);
		return (elem.data('inputUIReplace') || {visual: elem}).visual;
	};
	var getVisual = webshims.getVisualInput;
	var groupTypes = {checkbox: 1, radio: 1};
	var emptyJ = $([]);
	var getGroupElements = function(elem){
		elem = $(elem);
		return (groupTypes[elem[0].type] && elem[0].name) ? $(doc.getElementsByName(elem[0].name)).not(elem[0]) : emptyJ;
	};
	
	/*
	 * Selectors for all browsers
	 */
	var rangeTypes = {number: 1, range: 1, date: 1, time: 1, 'datetime-local': 1, datetime: 1, month: 1, week: 1};
	$.extend($.expr.filters, {
		"valid-element": function(elem){
			return !!($.attr(elem, 'willValidate') && ($.attr(elem, 'validity') || {valid: true}).valid);
		},
		"invalid-element": function(elem){
			return !!($.attr(elem, 'willValidate') && !isValid(elem));
		},
		"required-element": function(elem){
			return !!($.attr(elem, 'willValidate') && $.attr(elem, 'required') === true);
		},
		"optional-element": function(elem){
			return !!($.attr(elem, 'willValidate') && $.attr(elem, 'required') === false);
		},
		"in-range": function(elem){
			if(!rangeTypes[$.attr(elem, 'type')] || !$.attr(elem, 'willValidate')){
				return false;
			}
			var val = $.attr(elem, 'validity');
			return !!(val && !val.rangeOverflow && !val.rangeUnderflow);
		},
		"out-of-range": function(elem){
			if(!rangeTypes[$.attr(elem, 'type')] || !$.attr(elem, 'willValidate')){
				return false;
			}
			var val = $.attr(elem, 'validity');
			return !!(val && (val.rangeOverflow || val.rangeUnderflow));
		}
		
	});
	//better you use the selectors above
	['valid', 'invalid', 'required', 'optional'].forEach(function(name){
		$.expr.filters[name] = $.expr.filters[name+"-element"];
	});
	
	var isValid = function(elem){
		return ($.attr(elem, 'validity') || {valid: true}).valid;
	};
	
	
	//ToDo needs testing
	var oldAttr = $.attr;
	var changeVals = {selectedIndex: 1, value: 1, checked: 1, disabled: 1, readonly: 1};
	var stopUIRefresh;
	$.attr = function(elem, name, val){
		if(elem.form && changeVals[name] && val !== undefined && $(elem).hasClass('form-ui-invalid')){
			var ret = oldAttr.apply(this, arguments);
			if(isValid(elem)){
				getVisual(elem).removeClass('form-ui-invalid');
				if(name == 'checked' && val) {
					getGroupElements(elem).removeClass('form-ui-invalid').removeAttr('aria-invalid');
				}
			}
			return ret;
		}
		return oldAttr.apply(this, arguments);
	};
	$(document).bind('focusout change refreshValidityStyle', function(e){
		if(stopUIRefresh || !e.target || !e.target.form || e.target.type == 'submit'){return;}
		
		var elem = $.attr(e.target, 'html5element') || e.target;
		if(!$.attr(elem, 'willValidate')){
			getVisual(elem).removeClass('form-ui-invalid form-ui-valid');
			return;
		}
		var addClass, removeClass;
		if(isValid(e.target)){
			addClass = 'form-ui-valid';
			removeClass = 'form-ui-invalid';
			if(groupTypes[e.target.type] && e.target.checked){
				getGroupElements(elem).removeClass(removeClass).removeAttr('aria-invalid');
			}
		} else {
			addClass = 'form-ui-invalid';
			removeClass = 'form-ui-valid';
			if(groupTypes[e.target.type] && !e.target.checked){
				getGroupElements(elem).removeClass(removeClass);
			}
		}
		getVisual(elem).addClass(addClass).removeClass(removeClass);
		
		stopUIRefresh = true;
		setTimeout(function(){
			stopUIRefresh = false;
		}, 9);
	});
	
	
	
	webshims.triggerInlineForm = function(elem, event){
		var attr = elem['on'+event] || elem.getAttribute('on'+event) || '';
		var ret;
		event = $.Event({
			type: event,
			target: elem[0],
			currentTarget: elem[0]
		});
		
		if(attr && typeof attr == 'string'){
			ret = webshims.gcEval(attr, elem);
		}
		if(ret === false){
			event.stopPropagation();
			event.preventDefault();
		}
		$(elem).trigger(event);
		return ret;
	};
	
	
	var setRoot = function(){
		webshims.scrollRoot = ($.browser.webkit || doc.compatMode == 'BackCompat') ?
			$(doc.body) : 
			$(doc.documentElement)
		;
	};
	setRoot();
	$(setRoot);
	
	/* some extra validation UI */
	webshims.validityAlert = (function(){
		var alertElem = (!$.browser.msie || parseInt($.browser.version, 10) > 7) ? 'span' : 'label';
		var api = {
			hideDelay: 5000,
			showFor: function(elem, message, hideOnBlur){
				elem = $(elem);
				var visual = getVisual(elem);
				createAlert();
				api.clear();
				this.getMessage(elem, message);
				this.position(visual);
				alert.css({
					fontSize: elem.css('fontSize'),
					fontFamily: elem.css('fontFamily')
				});
				this.show();
				
				if(this.hideDelay){
					hideTimer = setTimeout(boundHide, this.hideDelay);
				}
				
				if(!hideOnBlur){
					this.setFocus(visual, elem[0]);
				}
			},
			setFocus: function(visual, elem){
				var focusElem = $('input, select, textarea, .ui-slider-handle', visual).filter(':visible:first');
				if(!focusElem[0]){
					focusElem = visual;
				}
				var scrollTop = webshims.scrollRoot.scrollTop();
				var elemTop = focusElem.offset().top;
				var labelOff;
				var smooth;
				alert.attr('for', webshims.getID(focusElem));
				
				if(scrollTop > elemTop){
					labelOff = elem.id && $('label[for="'+elem.id+'"]', elem.form).offset();
					if(labelOff && labelOff.top < elemTop){
						elemTop = labelOff.top;
					}
					webshims.scrollRoot.animate(
						{scrollTop: elemTop - 5}, 
						{
							queue: false, 
							duration: Math.max( Math.min( 450, (scrollTop - elemTop) * 2 ), 140 )
						}
					);
					smooth = true;
				}
				try {
					focusElem[0].focus();
				} catch(e){}
				if(smooth){
					webshims.scrollRoot.scrollTop(scrollTop);
				}
				$(doc).bind('focusout.validityalert', boundHide);
			},
			getMessage: function(elem, message){
				$('> span.va-box', alert).text(message || elem.attr('x-moz-errormessage') || elem.attr('data-errormessage') || elem.attr('validationMessage'));
			},
			position: function(elem){
				var offset = elem.offset();
				offset.top += elem.outerHeight();
				alert.css(offset);
			},
			show: function(){
				if(alert.css('display') === 'none'){
					alert.fadeIn();
				} else {
					alert.fadeTo(400, 1);
				}
			},
			hide: function(){
				api.clear();
				alert.fadeOut();
			},
			clear: function(){
				clearTimeout(hideTimer);
				$(doc).unbind('focusout.validityalert');
				alert.stop().removeAttr('for');
			},
			alert: $('<'+alertElem+' class="validity-alert" role="alert"><span class="va-arrow"><span class="va-arrow-box" /></span><span class="va-box" /></'+alertElem+'>').css({position: 'absolute', display: 'none'})
		};
		
		var alert = api.alert;
		var hideTimer = false;
		var boundHide = $.proxy(api, 'hide');
		var created = false;
		var createAlert = function(){
			if(created){return;}
			created = true;
			$(function(){alert.appendTo('body');});
		};
		return api;
	})();
	
	
	/* extension, but also used to fix native implementation workaround/bugfixes */
	(function(){
		var firstEvent,
			invalids = [],
			stopSubmitTimer,
			form
		;
		
		$(doc).bind('invalid', function(e){
			var jElm = $(e.target).addClass('form-ui-invalid').removeClass('form-ui-valid');
			if(!firstEvent){
				//trigger firstinvalid
				firstEvent = $.Event('firstinvalid');
				jElm.trigger(firstEvent);
			}
			
			//if firstinvalid was prevented all invalids will be also prevented
			if( firstEvent && firstEvent.isDefaultPrevented() ){
				e.preventDefault();
			}
			invalids.push(e.target);
			e.extraData = 'fix'; 
			clearTimeout(stopSubmitTimer);
			stopSubmitTimer = setTimeout(function(){
				var lastEvent = {type: 'lastinvalid', cancelable: false, invalidlist: $(invalids)};
				//reset firstinvalid
				firstEvent = false;
				invalids = [];
				//remove webkit/operafix
				$(form).unbind('submit.preventInvalidSubmit');
				jElm.trigger(lastEvent, lastEvent);
			}, 9);
			
		});
	})();
	
	webshims.isReady('form-core', true);
});



jQuery.webshims.ready('form-core dom-extend', function($, webshims, window, doc, undefined){
	"use strict";
	var validityMessages = webshims.validityMessages;
	var cfg = webshims.cfg.forms;
	var implementProperties = (cfg.overrideMessages || cfg.customMessages) ? ['customValidationMessage'] : [];
	
	validityMessages['en'] = validityMessages['en'] || validityMessages['en-US'] || {
		typeMismatch: {
			email: '{%value} is not a legal email address',
			url: '{%value} is not a valid web address',
			number: '{%value} is not a number!',
			date: '{%value} is not a date',
			time: '{%value} is not a time',
			range: '{%value} is not a number!',
			"datetime-local": '{%value} is not a correct date-time format.'
		},
		rangeUnderflow: '{%value} is too low. The lowest value you can use is {%min}.',
		rangeOverflow: '{%value}  is too high. The highest value you can use is {%max}.',
		stepMismatch: 'The value {%value} is not allowed for this form.',
		tooLong: 'The entered text is too large! You used {%valueLen} letters and the limit is {%maxlength}.',
		
		patternMismatch: '{%value} is not in the format this page requires! {%title}',
		valueMissing: 'You have to specify a value'
	};
	
	validityMessages['en-US'] = validityMessages['en-US'] || validityMessages['en'];
	validityMessages[''] = validityMessages[''] || validityMessages['en-US'];
	
	validityMessages['de'] = validityMessages['de'] || {
		typeMismatch: {
			email: '{%value} ist keine zulässige E-Mail-Adresse',
			url: '{%value} ist keine zulässige Webadresse',
			number: '{%value} ist keine Nummer!',
			date: '{%value} ist kein Datum',
			time: '{%value} ist keine Uhrzeit',
			range: '{%value} ist keine Nummer!',
			"datetime-local": '{%value} ist kein Datum-Uhrzeit Format.'
		},
		rangeUnderflow: '{%value} ist zu niedrig. {%min} ist der unterste Wert, den Sie benutzen können.',
		rangeOverflow: '{%value} ist zu hoch. {%max} ist der oberste Wert, den Sie benutzen können.',
		stepMismatch: 'Der Wert {%value} ist in diesem Feld nicht zulässig. Hier sind nur bestimmte Werte zulässig. {%title}',
		tooLong: 'Der eingegebene Text ist zu lang! Sie haben {%valueLen} Buchstaben eingegeben, dabei sind {%maxlength} das Maximum.',
		
		patternMismatch: '{%value} hat für diese Seite ein falsches Format! {%title}',
		valueMissing: 'Sie müssen einen Wert eingeben'
	};
	
	var currentValidationMessage =  validityMessages[''];
	$(doc).bind('webshimLocalizationReady', function(){
		webshims.activeLang(validityMessages, 'form-message', function(langObj){
			currentValidationMessage = langObj;
		});
	});
	
	webshims.createValidationMessage = function(elem, name){
		var message = currentValidationMessage[name];
		if(message && typeof message !== 'string'){
			message = message[ (elem.getAttribute('type') || '').toLowerCase() ] || message.defaultMessage;
		}
		if(message){
			['value', 'min', 'max', 'title', 'maxlength', 'label'].forEach(function(attr){
				if(message.indexOf('{%'+attr) === -1){return;}
				var val = ((attr == 'label') ? $.trim($('label[for="'+ elem.id +'"]', elem.form).text()).replace(/\*$|:$/, '') : $.attr(elem, attr)) || '';
				message = message.replace('{%'+ attr +'}', val);
				if('value' == attr){
					message = message.replace('{%valueLen}', val.length);
				}
			});
		}
		return message || '';
	};
	
	
	if((!window.noHTMLExtFixes && !Modernizr.validationmessage) || !Modernizr.formvalidation){
		implementProperties.push('validationMessage');
	}
	
	implementProperties.forEach(function(messageProp){
		['input', 'select', 'textarea', 'fieldset', 'output', 'button'].forEach(function(nodeName){
			var desc = webshims.defineNodeNameProperty(nodeName, messageProp, {
				get: function(){
					var elem = this;
					var message = '';
					if(!$.attr(elem, 'willValidate')){
						return message;
					}
					var validity = $.attr(elem, 'validity') || {valid: 1};
					if(validity.valid){return message;}
					message = elem.getAttribute('x-moz-errormessage') || elem.getAttribute('data-errormessage') || '';
					if(message){return message;}
					if(validity.customError && elem.nodeName){
						message = (Modernizr.validationmessage && desc._supget) ? desc._supget.call(elem) : $.data(elem, 'customvalidationMessage');
						if(message){return message;}
					}
					$.each(validity, function(name, prop){
						if(name == 'valid' || !prop){return;}
						message = webshims.createValidationMessage(elem, name);
						if(message){
							return false;
						}
					});
					return message || '';
				},
				set: $.noop
			}, (messageProp == 'validationMessage'), 'validity-base', 'form-message');
		});
		
	});
	webshims.isReady('form-message', true);
});jQuery.webshims.ready('form-core dom-extend', function($, webshims, window){
if(Modernizr.formvalidation){
	return;
}

webshims.inputTypes = webshims.inputTypes || {};
//some helper-functions
var getNames = function(elem){
		return (elem.form && elem.name) ? elem.form[elem.name] : [];
	},
	isNumber = function(string){
		return (typeof string == 'number' || (string && string == string * 1));
	},
	typeModels = webshims.inputTypes,
	checkTypes = {
		radio: 1,
		checkbox: 1		
	},
	getType = function(elem){
		return (elem.getAttribute('type') || elem.type || '').toLowerCase();
	}
;

//API to add new input types
webshims.addInputType = function(type, obj){
	typeModels[type] = obj;
};

//contsrain-validation-api
var validiyPrototype = {
	customError: false,

	typeMismatch: false,
	rangeUnderflow: false,
	rangeOverflow: false,
	stepMismatch: false,
	tooLong: false,
	patternMismatch: false,
	valueMissing: false,
	
	valid: true
};

var validityRules = {
		valueMissing: function(input, val, cache){
			if(!input.attr('required')){
				return false;
			}
			var ret = false;
			if(!('type' in cache)){
				cache.type = getType(input[0]);
			}
			if(cache.nodeName == 'select'){
				ret = (!val && input[0].type == 'select-one' && input[0].size < 2 && $('> option:first-child:not(:disabled)', input).attr('selected'));
			} else if(checkTypes[cache.type]){
				ret = !$(getNames(input[0])).filter(':checked')[0];
			} else {
				ret = !(val);
			}
			return ret;
		},
		tooLong: function(input, val, cache){
			if(val === '' || cache.nodeName == 'select'){return false;}
			var maxLen 	= input.attr('maxlength'),
				ret 	= false,
				len 	= val.length	
			;
			if(len && maxLen >= 0 && val.replace && isNumber(maxLen)){
				ret = (len > maxLen);
			}
			return ret;
		},
		typeMismatch: function (input, val, cache){
			if(val === '' || cache.nodeName == 'select'){return false;}
			var ret = false;
			if(!('type' in cache)){
				cache.type = getType(input[0]);
			}
			
			if(typeModels[cache.type] && typeModels[cache.type].mismatch){
				ret = typeModels[cache.type].mismatch(val, input);
			}
			return ret;
		},
		patternMismatch: function(input, val, cache) {
			if(val === '' || cache.nodeName == 'select'){return false;}
			var pattern = input.attr('pattern');
			if(!pattern){return false;}
			return !(new RegExp('^(?:' + pattern + ')$').test(val));
		}
	}
;

webshims.addValidityRule = function(type, fn){
	validityRules[type] = fn;
};

webshims.defineNodeNamesProperty(['input', 'textarea', 'select', 'form', 'fieldset'], 'checkValidity', {
	value: (function(){
		var unhandledInvalids;
		var testValidity = function(elem){
			
			var e,
				v = $.attr(elem, 'validity')
			;
			if(v){
				$.data(elem, 'cachedValidity', v);
			} else {
				return true;
			}
			if( !v.valid ){
				e = $.Event('invalid');
				var jElm = $(elem).trigger(e);
				if(!unhandledInvalids && !e.isDefaultPrevented()){
					webshims.validityAlert.showFor(jElm);
					unhandledInvalids = true;
				}
			}
			$.data(elem, 'cachedValidity', false);
			return v.valid;
		};
		return function(){
			unhandledInvalids = false;
			if($.nodeName(this, 'form')){
				var ret = true,
					elems = this.elements || $( 'input, textarea, select', this);
				
				for(var i = 0, len = elems.length; i < len; i++){
					if( !testValidity(elems[i]) ){
						ret = false;
					}
				}
				return ret;
			} else if(this.form && !$.nodeName(this, 'fieldset')){
				return testValidity(this);
			} else {
				return true;
			}
		};
	})()
}, true);

webshims.defineNodeNamesProperty(['input', 'textarea', 'select', 'fieldset', 'button', 'output'], 'setCustomValidity', {
	value: function(error){
		$.data(this, 'customvalidationMessage', ''+error);
	}
}, true);


$.event.special.invalid = {
	add: function(){
		if( !$.data(this, 'invalidEventShim') ){
			$.event.special.invalid.setup.call(this);
		}
	},
	setup: function(){
		$(this)
			.bind('submit', $.event.special.invalid.handler)
			.data('invalidEventShim', true)
		;
		var submitEvents = $(this).data('events').submit;
		if(submitEvents && submitEvents.length > 1){
			submitEvents.unshift( submitEvents.pop() );
		}
	},
	teardown: function(){
		$(this)
			.unbind('submit', $.event.special.invalid.handler)
			.data('invalidEventShim', false)
		;
	},
	handler: function(e, d){
		
		if( e.type != 'submit' || !$.nodeName(e.target, 'form') || $.attr(e.target, 'novalidate') != null || $.data(e.target, 'novalidate') ){return;}
		var notValid = !($(e.target).checkValidity());
		if(notValid){
			//ToDo
			if(!e.originalEvent && window.console && console.log){
				console.log('submit');
			}
			e.stopImmediatePropagation();
			return false;
		}
	}
};


webshims.addInputType('email', {
	mismatch: (function(){
		//taken from scott gonzales
		var test = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|(\x22((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?\x22))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
		return function(val){
			return !test.test(val);
		};
	})()
});

webshims.addInputType('url', {
	mismatch: (function(){
		//taken from scott gonzales
		var test = /^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
		return function(val){
			return !test.test(val);
		};
	})()
});

// IDLs for constrain validation API
webshims.defineNodeNamesProperty(['input', 'select', 'textarea', 'fieldset', 'button', 'output'], 'willValidate', {
	get: (function(){
		var types = {
				button: 1,
				reset: 1,
				add: 1,
				remove: 1,
				'move-up': 1,
				'move-down': 1,
				hidden: 1
			}
		;
		var barredElems = {fieldset: 1, button: 1, output: 1};
		return function(){
			var elem = this;
			//elem.name && <- we don't use to make it easier for developers
			return !!( elem.form && !elem.disabled && !elem.readOnly && !types[elem.type] && !barredElems[(elem.nodeName || '').toLowerCase()] && $.attr(elem.form, 'novalidate') == null );
		};
	})()
}, true, 'validity-base', 'form-extend');

webshims.defineNodeNamesBooleanProperty(['input', 'textarea', 'select'], 'required', {
	set: function(value){
		var elem = this;
		elem.setAttribute('aria-required', (value) ? 'true' : 'false');
	},
	content: true
}, true, true, 'form-extend');

['input', 'select', 'textarea', 'fieldset', 'button', 'output'].forEach(function(nodeName){
	webshims.defineNodeNameProperty(nodeName, 'validity', {
		set: $.noop,
		get: function(){
			var elem = this;
			var validityState = $.data(elem, 'cachedValidity');
			if(validityState){
				return validityState;
			}
			validityState 	= $.extend({}, validiyPrototype);
			
			if( !$.attr(elem, 'willValidate') || elem.type == 'submit' ){
				return validityState;
			}
			var jElm 			= $(elem),
				val				= jElm.val(),
				cache 			= {nodeName: elem.nodeName.toLowerCase()},
				ariaInvalid 	= elem.getAttribute('aria-invalid')
			;
			
			validityState.customError = !!($.data(elem, 'customvalidationMessage'));
			if( validityState.customError ){
				validityState.valid = false;
			}
							
			$.each(validityRules, function(rule, fn){
				if (fn(jElm, val, cache)) {
					validityState[rule] = true;
					validityState.valid = false;
				}
			});
			elem.setAttribute('aria-invalid',  validityState.valid ? 'false' : 'true');
			return validityState;
		}
	}, true, 'validity-base', 'form-extend');
});

var noValidate = function(){
		var elem = this;
		if(!elem.form){return;}
		$.data(elem.form, 'novalidate', true);
		setTimeout(function(){
			$.data(elem.form, 'novalidate', false);
		}, 1);
	}, 
	submitterTypes = {submit: 1, button: 1}
;

$(document).bind('click', function(e){
	if(e.target && e.target.form && submitterTypes[e.target.type] && $.attr(e.target, 'formnovalidate') != null){
		noValidate.call(e.target);
	}
});

webshims.addReady(function(context, contextElem){
	//start constrain-validation
	var form = $('form', context)
		.add(contextElem.filter('form'))
		.bind('invalid', $.noop)
		.find('button[formnovalidate]')
		.bind('click', noValidate)
		.end()
	;
	
	setTimeout(function(){
		if (!document.activeElement || !document.activeElement.form) {
			var first = true;
			$('input, select, textarea', form).each(function(i){
				if(!first){return false;}
				if(this.getAttribute('autofocus') == null){return;}	
				first = false;
				var elem = webshims.getVisualInput(this);
				var focusElem = $('input, select, textarea, .ui-slider-handle', elem).filter(':visible:first');
				if (!focusElem[0]) {
					focusElem = elem;
				}
				try {
					focusElem[0].focus();
				} catch (e) {}
			});
		}
	}, 9);
	
});

webshims.isReady('form-extend', true);

}); //webshims.ready end



jQuery.webshims.ready('form-extend', function($, webshims, window){
	"use strict";
	//why no step IDL?
	webshims.getStep = function(elem, type){
		var step = $.attr(elem, 'step');
		if(step === 'any'){
			return step;
		}
		type = type || getType(elem);
		if(!typeModels[type] || !typeModels[type].step){
			return step;
		}
		step = typeProtos.number.asNumber(step);
		return ((!isNaN(step) && step > 0) ? step : typeModels[type].step) * typeModels[type].stepScaleFactor;
	};
	//why no min/max IDL?
	webshims.addMinMaxNumberToCache = function(attr, elem, cache){
		if (!(attr+'AsNumber' in cache)) {
			cache[attr+'AsNumber'] = typeModels[cache.type].asNumber(elem.attr(attr));
			if(isNaN(cache[attr+'AsNumber']) && (attr+'Default' in typeModels[cache.type])){
				cache[attr+'AsNumber'] = typeModels[cache.type][attr+'Default'];
			}
		}
	};
	
	var nan = parseInt('NaN', 10),
		doc = document,
		typeModels = webshims.inputTypes,
		isNumber = function(string){
			return (typeof string == 'number' || (string && string == string * 1));
		},
		supportsType = function(type){
			return (Modernizr.input.valueAsNumber && $('<input type="'+type+'" />').attr('type') === type);
		},
		getType = function(elem){
			return (elem.getAttribute('type') || '').toLowerCase();
		},
		isDateTimePart = function(string){
			return (isNumber(string) || (string && string == '0' + (string * 1)));
		},
		addMinMaxNumberToCache = webshims.addMinMaxNumberToCache,
		addleadingZero = function(val, len){
			val = ''+val;
			len = len - val.length;
			for(var i = 0; i < len; i++){
				val = '0'+val;
			}
			return val;
		},
		EPS = 1e-7
	;
	
	webshims.addValidityRule('stepMismatch', function(input, val, cache){
		if(val === ''){return false;}
		if(!('type' in cache)){
			cache.type = getType(input[0]);
		}
		//stepmismatch with date is computable, but it would be a typeMismatch (performance)
		if(cache.type == 'date'){
			return false;
		}
		var ret = false, base;
		if(typeModels[cache.type] && typeModels[cache.type].step){
			if( !('step' in cache) ){
				cache.step = webshims.getStep(input[0], cache.type);
			}
			
			if(cache.step == 'any'){return false;}
			
			if(!('valueAsNumber' in cache)){
				cache.valueAsNumber = typeModels[cache.type].asNumber( val );
			}
			if(isNaN(cache.valueAsNumber)){return false;}
			
			addMinMaxNumberToCache('min', input, cache);
			base = cache.minAsNumber;
			if(isNaN(base)){
				base = typeModels[cache.type].stepBase || 0;
			}
			
			ret =  Math.abs((cache.valueAsNumber - base) % cache.step);
							
			ret = !(  ret <= EPS || Math.abs(ret - cache.step) <= EPS  );
		}
		return ret;
	});
	
	
	
	[{name: 'rangeOverflow', attr: 'max', factor: 1}, {name: 'rangeUnderflow', attr: 'min', factor: -1}].forEach(function(data, i){
		webshims.addValidityRule(data.name, function(input, val, cache) {
			var ret = false;
			if(val === ''){return ret;}
			if (!('type' in cache)) {
				cache.type = getType(input[0]);
			}
			if (typeModels[cache.type] && typeModels[cache.type].asNumber) {
				if(!('valueAsNumber' in cache)){
					cache.valueAsNumber = typeModels[cache.type].asNumber( val );
				}
				if(isNaN(cache.valueAsNumber)){
					return false;
				}
				
				addMinMaxNumberToCache(data.attr, input, cache);
				
				if(isNaN(cache[data.attr+'AsNumber'])){
					return ret;
				}
				ret = ( cache[data.attr+'AsNumber'] * data.factor <  cache.valueAsNumber * data.factor - EPS );
			}
			return ret;
		});
	});
	
	//IDLs and methods, that aren't part of constrain validation, but strongly tight to it
	var valueAsNumberDescriptor = webshims.defineNodeNameProperty('input', 'valueAsNumber', {
		get: function(){
			var elem = this;
			var type = getType(elem);
			return (typeModels[type] && typeModels[type].asNumber) ? 
				typeModels[type].asNumber($.attr(elem, 'value')) :
				nan;
		},
		set: function(val){
			var elem = this;
			var type = getType(elem);
			if(typeModels[type] && typeModels[type].numberToString){
				//is NaN a number?
				if(isNaN(val)){
					$.attr(elem, 'value', '');
					return;
				}
				var set = typeModels[type].numberToString(val);
				if(set !==  false){
					$.attr(elem, 'value', set);
				} else {
					throw('INVALID_STATE_ERR: DOM Exception 11');
				}
			} else {
				valueAsNumberDescriptor._supset && valueAsNumberDescriptor._supset.call(elem, arguments);
			}
		}
	}, true, 'input-date-number', 'form-number-date');
	
	var valueAsDateDescriptor = webshims.defineNodeNameProperty('input', 'valueAsDate', {
		get: function(){
			var elem = this;
			var type = getType(elem);
			return (typeModels[type] && typeModels[type].asDate && !typeModels[type].noAsDate) ? 
				typeModels[type].asDate($.attr(elem, 'value')) :
				valueAsDateDescriptor._supget && valueAsDateDescriptor._supget.call(elem);
		},
		set: function(value){
			var elem = this;
			var type = getType(elem);
			if(typeModels[type] && typeModels[type].dateToString){
				if(!window.noHTMLExtFixes) {
					throw("there are some serious issues in opera's implementation. don't use!");
				}
				if(value === null){
					$.attr(elem, 'value', '');
					return '';
				}
				var set = typeModels[type].dateToString(value);
				if(set !== false){
					$.attr(elem, 'value', set);
					return set;
				} else {
					throw('INVALID_STATE_ERR: DOM Exception 11');
				}
			} else {
				return valueAsDateDescriptor._supset && valueAsDateDescriptor._supset(elem, arguments) || null;
			}
		}
	}, true, 'input-date-number', 'form-number-date');
	
	var typeProtos = {
		
		number: {
			mismatch: function(val){
				return !(isNumber(val));
			},
			step: 1,
			//stepBase: 0, 0 = default
			stepScaleFactor: 1,
			asNumber: function(str){
				return (isNumber(str)) ? str * 1 : nan;
			},
			numberToString: function(num){
				return (isNumber(num)) ? num : false;
			}
		},
		
		range: {
			minDefault: 0,
			maxDefault: 100
		},
		
		date: {
			mismatch: function(val){
				if(!val || !val.split || !(/\d$/.test(val))){return true;}
				var valA = val.split(/\u002D/);
				if(valA.length !== 3){return true;}
				var ret = false;
				$.each(valA, function(i, part){
					if(!isDateTimePart(part)){
						ret = true;
						return false;
					}
				});
				if(ret){return ret;}
				if(valA[0].length !== 4 || valA[1].length != 2 || valA[1] > 12 || valA[2].length != 2 || valA[2] > 33){
					ret = true;
				}
				return (val !== this.dateToString( this.asDate(val, true) ) );
			},
			step: 1,
			//stepBase: 0, 0 = default
			stepScaleFactor:  86400000,
			asDate: function(val, _noMismatch){
				if(!_noMismatch && this.mismatch(val)){
					return null;
				}
				return new Date(this.asNumber(val, true));
			},
			asNumber: function(str, _noMismatch){
				var ret = nan;
				if(_noMismatch || !this.mismatch(str)){
					str = str.split(/\u002D/);
					ret = Date.UTC(str[0], str[1] - 1, str[2]);
				}
				return ret;
			},
			numberToString: function(num){
				return (isNumber(num)) ? this.dateToString(new Date( num * 1)) : false;
			},
			dateToString: function(date){
				return (date && date.getFullYear) ? date.getUTCFullYear() +'-'+ addleadingZero(date.getUTCMonth()+1, 2) +'-'+ addleadingZero(date.getUTCDate(), 2) : false;
			}
		},
		
		time: {
			mismatch: function(val, _getParsed){
				if(!val || !val.split || !(/\d$/.test(val))){return true;}
				val = val.split(/\u003A/);
				if(val.length < 2 || val.length > 3){return true;}
				var ret = false,
					sFraction;
				if(val[2]){
					val[2] = val[2].split(/\u002E/);
					sFraction = parseInt(val[2][1], 10);
					val[2] = val[2][0];
				}
				$.each(val, function(i, part){
					if(!isDateTimePart(part) || part.length !== 2){
						ret = true;
						return false;
					}
				});
				if(ret){return true;}
				if(val[0] > 23 || val[0] < 0 || val[1] > 59 || val[1] < 0){
					return true;
				}
				if(val[2] && (val[2] > 59 || val[2] < 0 )){
					return true;
				}
				if(sFraction && isNaN(sFraction)){
					return true;
				}
				if(sFraction){
					if(sFraction < 100){
						sFraction *= 100;
					} else if(sFraction < 10){
						sFraction *= 10;
					}
				}
				return (_getParsed === true) ? [val, sFraction] : false;
			},
			step: 60,
			stepBase: 0,
			stepScaleFactor:  1000,
			asDate: function(val){
				val = new Date(this.asNumber(val));
				return (isNaN(val)) ? null : val;
			},
			asNumber: function(val){
				var ret = nan;
				val = this.mismatch(val, true);
				if(val !== true){
					ret = Date.UTC('1970', 0, 1, val[0][0], val[0][1], val[0][2] || 0);
					if(val[1]){
						ret += val[1];
					}
				}
				return ret;
			},
			dateToString: function(date){
				if(date && date.getUTCHours){
					var str = addleadingZero(date.getUTCHours(), 2) +':'+ addleadingZero(date.getUTCMinutes(), 2),
						tmp = date.getSeconds()
					;
					if(tmp != "0"){
						str += ':'+ addleadingZero(tmp, 2);
					}
					tmp = date.getUTCMilliseconds();
					if(tmp != "0"){
						str += '.'+ addleadingZero(tmp, 3);
					}
					return str;
				} else {
					return false;
				}
			}
		},
		
		'datetime-local': {
			mismatch: function(val, _getParsed){
				if(!val || !val.split || (val+'special').split(/\u0054/).length !== 2){return true;}
				val = val.split(/\u0054/);
				return ( typeModels.date.mismatch(val[0]) || typeModels.time.mismatch(val[1], _getParsed) );
			},
			noAsDate: true,
			asDate: function(val){
				val = new Date(this.asNumber(val));
				
				return (isNaN(val)) ? null : val;
			},
			asNumber: function(val){
				var ret = nan;
				var time = this.mismatch(val, true);
				if(time !== true){
					val = val.split(/\u0054/)[0].split(/\u002D/);
					
					ret = Date.UTC(val[0], val[1] - 1, val[2], time[0][0], time[0][1], time[0][2] || 0);
					if(time[1]){
						ret += time[1];
					}
				}
				return ret;
			},
			dateToString: function(date, _getParsed){
				return typeModels.date.dateToString(date) +'T'+ typeModels.time.dateToString(date, _getParsed);
			}
		}
	};
	
	if(!supportsType('number')){
		webshims.addInputType('number', typeProtos.number);
	}
	
	if(!supportsType('range')){
		webshims.addInputType('range', $.extend({}, typeProtos.number, typeProtos.range));
	}
	if(!supportsType('date')){
		webshims.addInputType('date', typeProtos.date);
	}
	if(!supportsType('time')){
		webshims.addInputType('time', $.extend({}, typeProtos.date, typeProtos.time));
	}
	
	if(!supportsType('datetime-local')){
		webshims.addInputType('datetime-local', $.extend({}, typeProtos.date, typeProtos.time, typeProtos['datetime-local']));
	}
	
	// add support for new input-types
	webshims.defineNodeNameProperty('input', 'type', {
		get: function(){
			var elem = this;
			var type = getType(elem);
			return (webshims.inputTypes[type]) ? type : elem.type || elem.getAttribute('type');
		},
		set: $.noop
	});
	
	webshims.isReady('form-number-date', true);
	
});
/* number-date-ui */
/* https://github.com/aFarkas/webshim/issues#issue/23 */
jQuery.webshims.ready('form-number-date dom-extend', function($, webshims, window, document){
	"use strict";
	var triggerInlineForm = webshims.triggerInlineForm;
	var modernizrInputTypes = Modernizr.inputtypes;
	var adjustInputWithBtn = function(input, button){
		var inputDim = {
			w: input.width()
		};
		if(!inputDim.w){return;}
		var controlDim = {
			mL: (parseInt(button.css('marginLeft'), 10) || 0),
			w: button.outerWidth()
		};
		inputDim.mR = (parseInt(input.css('marginRight'), 10) || 0);
		if(inputDim.mR){
			input.css('marginRight', 0);
		}
		//is inside
		if( controlDim.mL <= (controlDim.w * -1) ){
			button.css('marginRight',  Math.floor(Math.abs(controlDim.w + controlDim.mL) + inputDim.mR));
			input.css('paddingRight', (parseInt(input.css('paddingRight'), 10) || 0) + Math.abs(controlDim.mL));
			input.css('width', Math.floor(inputDim.w + controlDim.mL));
		} else {
			button.css('marginRight', inputDim.mR);
			input.css('width',  Math.floor(inputDim.w - controlDim.mL - controlDim.w));
		}
	};
		
	var options = $.webshims.cfg['forms-ext'];
	var globalInvalidTimer;
	var labelID = 0;
	var emptyJ = $([]);
	var replaceInputUI = function(context, elem){
		$('input', context).add(elem.filter('input')).each(function(){
			var type = $.attr(this, 'type');
			if(replaceInputUI[type]  && !$.data(this, 'inputUIReplace')){
				replaceInputUI[type]($(this));
			}
		});
	};
	
	replaceInputUI.common = function(orig, shim, methods){
		if(options.replaceNative){
			(function(){
				var events = [];
				var timer;
				var throwError = function(e){
					if(!$.data(e.target, 'maybePreventedinvalid') && (!events[0] || !events[0].isDefaultPrevented()) && (!events[1] || !events[1].isDefaultPrevented()) ){
						var elem = e.target;
						var name = elem.nodeName;
						if(elem.id){
							name += '#'+elem.id;
						}
						if(elem.name){
							name += '[name="'+ elem.name +'"]';
						}
						if(elem.className){
							name += '.'+ (elem.className.split(' ').join('.'));
						}
						throw(name +' can not be focused. handle the invalid event.');
					}
				};
				orig.bind('firstinvalid', function(e){
					clearTimeout(timer);
					events.push(e);
					timer = setTimeout(function(){
						throwError(e);
						events = [];
					}, 30);
				});
			})();
		} else if(Modernizr.formvalidation){
			orig.bind('firstinvalid', function(e){
				clearTimeout(globalInvalidTimer);
				globalInvalidTimer = setTimeout(function(){
					if(!$.data(e.target, 'maybePreventedinvalid') && !e.isDefaultPrevented()){
						webshims.validityAlert.showFor( e.target ); 
					}
				}, 30);
			});
		}
		var id = orig.attr('id'),
			attr = {
				css: {
					marginRight: orig.css('marginRight'),
					marginLeft: orig.css('marginLeft')
				},
				outerWidth: orig.outerWidth(),
				label: (id) ? $('label[for="'+ id +'"]', orig[0].form) : emptyJ
			},
			curLabelID =  webshims.getID(attr.label)
		;
		shim.addClass(orig[0].className).data('html5element', orig);
		orig
			.after(shim)
			.data('inputUIReplace', {visual: shim, methods: methods})
			.hide()
		;
		
		if(shim.length == 1 && !$('*', shim)[0]){
			shim.attr('aria-labeledby', curLabelID);
			attr.label.bind('click', function(){
				shim.focus();
				return false;
			});
		}
		return attr;
	};
	
	//date and datetime-local implement if we have to replace
	if(!Modernizr.inputtypes.dateUI || options.replaceUI){
		var datetimeFactor = {
			trigger: [0.65,0.35],
			normal: [0.6,0.4]
		};
		var subPixelCorrect = (!$.browser.msie || parseInt($.browser.version, 10) > 6) ? 0 : 0.45;
		replaceInputUI['datetime-local'] = function(elem){
			if(!$.fn.datepicker){return;}
			var date = $('<span role="group" class="input-datetime-local"><input type="text" class="input-datetime-local-date" /><input type="time" class="input-datetime-local-time" /></span>'),
				attr  = this.common(elem, date, replaceInputUI['datetime-local'].attrs),
				datePicker = $('input.input-datetime-local-date', date),
				data = datePicker
					.datepicker($.extend({}, options.datepicker, elem.data('datepicker')))
					.bind('change', function(e){
						
						var value = datePicker.attr('value'), 
							timeVal = $('input.input-datetime-local-time', date).attr('value')
						;
						if(value){
							try {
								value = $.datepicker.parseDate(datePicker.datepicker('option', 'dateFormat'), value);
								value = (value) ? $.datepicker.formatDate('yy-mm-dd', value) : datePicker.attr('value');
							} catch (e) {value = datePicker.attr('value');}
							if (!timeVal) {
								timeVal = '00:00';
								$('input.input-datetime-local-time', date).attr('value', timeVal);
							}
						} 
						value = (!value && !timeVal) ? '' : value + 'T' + timeVal;
						replaceInputUI['datetime-local'].blockAttr = true;
						elem.attr('value', value);
						replaceInputUI['datetime-local'].blockAttr = false;
						e.stopImmediatePropagation();
						triggerInlineForm(elem[0], 'input');
						triggerInlineForm(elem[0], 'change');
					})
					.data('datepicker')
			;
			
			data.dpDiv
				.addClass('input-date-datepicker-control')
				.css({
					fontSize: datePicker.css('fontSize'),
					fontFamily: datePicker.css('fontFamily')
				})
			;
			$('input.input-datetime-local-time', date).bind('change', function(e){
				var timeVal = $.attr(this, 'value');
				var val = elem.attr('value').split('T');
				if(timeVal && (val.length < 2 || !val[0])){
					val[0] = $.datepicker.formatDate('yy-mm-dd', new Date());
				}
				val[1] = timeVal;
				
				if (timeVal) {
					try {
						datePicker.attr('value', $.datepicker.formatDate(datePicker.datepicker('option', 'dateFormat'), $.datepicker.parseDate('yy-mm-dd', val[0])));
					} catch (e) {}
				}
				val = (!val[0] && !val[1]) ? '' : val.join('T');
				replaceInputUI['datetime-local'].blockAttr = true;
				elem.attr('value', val);
				replaceInputUI['datetime-local'].blockAttr = false;
				e.stopImmediatePropagation();
				triggerInlineForm(elem[0], 'input');
				triggerInlineForm(elem[0], 'change');
			});
			
			$('input', date).data('html5element', $.data(date[0], 'html5element'));
			
			date.attr('aria-labeledby', attr.label.attr('id'));
			attr.label.bind('click', function(){
				datePicker.focus();
				return false;
			});
			
			if(attr.css){
				date.css(attr.css);
				if(attr.outerWidth){
					date.outerWidth(attr.outerWidth);
					var width = date.width();
					var widthFac = (data.trigger[0]) ? datetimeFactor.trigger : datetimeFactor.normal;
					datePicker.outerWidth(Math.floor((width * widthFac[0]) - subPixelCorrect), true);
					$('input.input-datetime-local-time', date).outerWidth(Math.floor((width * widthFac[1]) - subPixelCorrect), true);
					if(data.trigger[0]){
						adjustInputWithBtn(datePicker, data.trigger);
					}
				}
			}
			
			webshims.triggerDomUpdate(date[0]);
			
			$.each(['disabled', 'min', 'max', 'value', 'step'], function(i, name){
				elem.attr(name, function(i, value){return value || '';});
			});
		};
		
		replaceInputUI['datetime-local'].attrs = {
			disabled: function(orig, shim, value){
				$('input.input-datetime-local-date', shim).datepicker('option', 'disabled', !!value);
				$('input.input-datetime-local-time', shim).attr('disabled', !!value);
			},
			step: function(orig, shim, value){
				$('input.input-datetime-local-time', shim).attr('step', value);
			},
			//ToDo: use min also on time
			min: function(orig, shim, value){
				value = (value.split) ? value.split('T') : [];
				try {
					value = $.datepicker.parseDate('yy-mm-dd', value[0]);
				} catch(e){value = false;}
				if(value){
					$('input.input-datetime-local-date', shim).datepicker('option', 'minDate', value);
				}
			},
			//ToDo: use max also on time
			max: function(orig, shim, value){
				value = (value.split) ? value.split('T') : [];
				try {
					value = $.datepicker.parseDate('yy-mm-dd', value[0]);
				} catch(e){value = false;}
				if(value){
					$('input.input-datetime-local-date', shim).datepicker('option', 'maxDate', value);
				}
			},
			value: function(orig, shim, value){
				if(!replaceInputUI['datetime-local'].blockAttr){
					var dateValue;
					value = (value.split) ? value.split('T') : [];
					try {
						dateValue = $.datepicker.parseDate('yy-mm-dd', value[0]);
					} catch(e){dateValue = false;}
					if(dateValue){
						$('input.input-datetime-local-date', shim).datepicker('setDate', dateValue);
						$('input.input-datetime-local-time', shim).attr('value', value[1] || '00:00');
					} else {
						$('input.input-datetime-local-date', shim).attr('value', value[0] || '');
						$('input.input-datetime-local-time', shim).attr('value', value[1] || '');
					}
					
				}
			}
		};
		
		replaceInputUI.date = function(elem){
			if(!$.fn.datepicker){return;}
			var date = $('<input type="text" class="input-date" />'),
				attr  = this.common(elem, date, replaceInputUI.date.attrs),
				change = function(e){
					replaceInputUI.date.blockAttr = true;
					var value;
					try {
						value = $.datepicker.parseDate(date.datepicker('option', 'dateFormat'), date.attr('value') );
						value = (value) ? $.datepicker.formatDate( 'yy-mm-dd', value ) : date.attr('value');
					} catch(e){
						value = date.attr('value');
					}
					elem.attr('value', value);
					replaceInputUI.date.blockAttr = false;
					e.stopImmediatePropagation();
					triggerInlineForm(elem[0], 'input');
					triggerInlineForm(elem[0], 'change');
				},
				data = date
					.datepicker($.extend({}, options.datepicker, elem.data('datepicker')))
					.bind('change', change)
					.data('datepicker')
					
			
			;
			data.dpDiv
				.addClass('input-date-datepicker-control')
				.css({
					fontSize: date.css('fontSize'),
					fontFamily: date.css('fontFamily')
				})
			;
			if(attr.css){
				date.css(attr.css);
				if(attr.outerWidth){
					date.outerWidth(attr.outerWidth);
				}
				if(data.trigger[0]){
					adjustInputWithBtn(date, data.trigger);
				}
			}
			
			$.each(['disabled', 'min', 'max', 'value'], function(i, name){
				elem.attr(name, function(i, value){return value || '';});
			});
		};
		
		replaceInputUI.date.attrs = {
			disabled: function(orig, shim, value){
				shim.datepicker('option', 'disabled', !!value);
			},
			min: function(orig, shim, value){
				try {
					value = $.datepicker.parseDate('yy-mm-dd', value);
				} catch(e){value = false;}
				if(value){
					shim.datepicker('option', 'minDate', value);
				}
			},
			max: function(orig, shim, value){
				try {
					value = $.datepicker.parseDate('yy-mm-dd', value);
				} catch(e){value = false;}
				if(value){
					shim.datepicker('option', 'maxDate', value);
				}
			},
			value: function(orig, shim, value){
				if(!replaceInputUI.date.blockAttr){
					try {
						var dateValue = $.datepicker.parseDate('yy-mm-dd', value);
					} catch(e){var dateValue = false;}
					if(dateValue){
						shim.datepicker('setDate', dateValue);
					} else {
						shim.attr('value', value);
					}
				}
			}
		};
	}
	
	if (!modernizrInputTypes.date || !modernizrInputTypes.range || options.replaceUI) {
		replaceInputUI.range = function(elem){
			if(!$.fn.slider){return;}
			var range = $('<span class="input-range"><span class="ui-slider-handle" role="slider" tabindex="0" /></span>'),
				attr  = this.common(elem, range, replaceInputUI.range.attrs),
				change = function(e, ui){
					if(e.originalEvent){
						replaceInputUI.range.blockAttr = true;
						elem.attr('value', ui.value);
						replaceInputUI.range.blockAttr = false;
						if(e.type == 'slidechange'){
							triggerInlineForm(elem[0], 'change');
						} else {
							triggerInlineForm(elem[0], 'input');
						}
					}
				}
			;
			
			$('span', range).attr('aria-labeledby', attr.label.attr('id'));
			attr.label.bind('click', function(){
				$('span', range).focus();
				return false;
			});
			
			if(attr.css){
				range.css(attr.css);
				if(attr.outerWidth){
					range.outerWidth(attr.outerWidth);
				}
			}
			range.slider($.extend({}, options.slider, elem.data('slider'), {
				change: change,
				slide: change
			}));
			
			$.each(['disabled', 'min', 'max', 'value', 'step'], function(i, name){
				elem.attr(name, function(i, value){return value || '';});
			});
		};
		
		replaceInputUI.range.attrs = {
			disabled: function(orig, shim, value){
				value = !!value;
				shim.slider( "option", "disabled", value );
				$('span', shim)
					.attr({
						'aria-disabled': value+'',
						'tabindex': (value) ? '-1' : '0'
					})
				;
			},
			min: function(orig, shim, value){
				value = (value) ? value * 1 || 0 : 0;
				shim.slider( "option", "min", value );
				$('span', shim).attr({'aria-valuemin': value});
			},
			max: function(orig, shim, value){
				value = (value || value === 0) ? value * 1 || 100 : 100;
				shim.slider( "option", "max", value );
				$('span', shim).attr({'aria-valuemax': value});
			},
			value: function(orig, shim, value){
				value = $(orig).attr('valueAsNumber');
				if(isNaN(value)){
					value = (shim.slider('option', 'max') - shim.slider('option', 'min')) / 2;
					orig.value = value;
				}
				if(!replaceInputUI.range.blockAttr){
					shim.slider( "option", "value", value );
				}
				$('span', shim).attr({'aria-valuenow': value, 'aria-valuetext': value});
			},
			step: function(orig, shim, value){
				value = (value && $.trim(value)) ? value * 1 || 1 : 1;
				shim.slider( "option", "step", value );
			}
		};
	}
	
	$.each(['disabled', 'min', 'max', 'value', 'step'], function(i, attr){
		webshims.onNodeNamesPropertyModify('input', attr, {
			set: function(elem, val){
				var widget = $.data(elem, 'inputUIReplace');
				if(widget && widget.methods[attr]){
					widget.methods[attr](elem, widget.visual, val);
				}
			}
		});
	});
	
		
	var changeDefaults = function(langObj){
		if(!langObj){return;}
		var opts = $.extend({}, langObj, options.datepicker);
		$('input.hasDatepicker').filter('.input-date, .input-datetime-local-date').datepicker('option', opts).each(function(){
			var orig = $.data(this, 'html5element');
			if(orig){
				$.each(['disabled', 'min', 'max', 'value'], function(i, name){
					orig.attr(name, function(i, value){return value || '';});
				});
			}
		});
		$.datepicker.setDefaults(opts);
	};
	
	$(document).bind('jquery-uiReady.langchange input-widgetsReady.langchange', function(){
		if(!$.datepicker){return;}
		$(document)
			.bind('webshimLocalizationReady', function(){
				webshims.activeLang($.datepicker.regional, 'inputUI', changeDefaults);
			})
			.unbind('jquery-uiReady.langchange input-widgetsReady.langchange')
		;
	});
	
	webshims.addReady(function(context, elem){
		
		$(document).bind('jquery-uiReady.initinputui input-widgetsReady.initinputui', function(){
			if($.datepicker || $.fn.slider){
				replaceInputUI(context, elem);
			}
			
			if($.datepicker && $.fn.slider){
				$(document).unbind('jquery-uiReady.initinputui input-widgetsReady.initinputui');
			}
			if(context === document){
				webshims.isReady('inputUI', true);
			}
		});
	});
	
	
	//implement set/arrow controls
(function(){
	if(Modernizr.input.valueAsNumber || !webshims.modules['form-number-date']){return;}
	var doc = document;
	var options = webshims.modules['form-number-date'].options;
	var typeModels = webshims.inputTypes;
	var getNextStep = function(input, upDown, cache){
		
		cache = cache || {};
		
		if( !('type' in cache) ){
			cache.type = $.attr(input, 'type');
		}
		if( !('step' in cache) ){
			cache.step = webshims.getStep(input, cache.type);
		}
		if( !('valueAsNumber' in cache) ){
			cache.valueAsNumber = typeModels[cache.type].asNumber($.attr(input, 'value'));
		}
		var delta = (cache.step == 'any') ? typeModels[cache.type].step * typeModels[cache.type].stepScaleFactor : cache.step,
			ret
		;
		webshims.addMinMaxNumberToCache('min', $(input), cache);
		webshims.addMinMaxNumberToCache('max', $(input), cache);
		
		if(isNaN(cache.valueAsNumber)){
			cache.valueAsNumber = typeModels[cache.type].stepBase || 0;
		}
		//make a valid step
		if(cache.step !== 'any'){
			ret = Math.round( ((cache.valueAsNumber - (cache.minAsnumber || 0)) % cache.step) * 1e7 ) / 1e7;
			if(ret &&  Math.abs(ret) != cache.step){
				cache.valueAsNumber = cache.valueAsNumber - ret;
			}
		}
		ret = cache.valueAsNumber + (delta * upDown);
		//using NUMBER.MIN/MAX is really stupid | ToDo: either use disabled state or make this more usable
		if(!isNaN(cache.minAsNumber) && ret < cache.minAsNumber){
			ret = (cache.valueAsNumber * upDown  < cache.minAsNumber) ? cache.minAsNumber : isNaN(cache.maxAsNumber) ? Number.MAX_VALUE : cache.maxAsNumber;
		} else if(!isNaN(cache.maxAsNumber) && ret > cache.maxAsNumber){
			ret = (cache.valueAsNumber * upDown > cache.maxAsNumber) ? cache.maxAsNumber : isNaN(cache.minAsNumber) ? Number.MIN_VALUE : cache.minAsNumber;
		}
		return Math.round( ret * 1e7)  / 1e7;
	};
	
	webshims.modules['form-number-date'].getNextStep = getNextStep;
	
	var doSteps = function(input, type, control){
		if(input.disabled || input.readOnly || $(control).hasClass('step-controls')){return;}
		$.attr(input, 'value',  typeModels[type].numberToString(getNextStep(input, ($(control).hasClass('step-up')) ? 1 : -1, {type: type})));
		$(input).unbind('blur.stepeventshim');
		triggerInlineForm(input, 'input');
		
		
		if( doc.activeElement ){
			if(doc.activeElement !== input){
				try {input.focus();} catch(e){}
			}
			setTimeout(function(){
				if(doc.activeElement !== input){
					try {input.focus();} catch(e){}
				}
				$(input)
					.one('blur.stepeventshim', function(){
						triggerInlineForm(input, 'change');
					})
				;
			}, 0);
			
		}
	};
	
	
	if(options.stepArrows){
		
		webshims.onNodeNamesPropertyModify('input', 'disabled', {
			// don't change getter
			set: function(elem, value){
				var stepcontrols = $.data(elem, 'step-controls');
				if(stepcontrols){
					stepcontrols[ (elem.disabled || elem.readonly) ? 'addClass' : 'removeClass' ]('disabled-step-control');
				}
			}
		});
		webshims.onNodeNamesPropertyModify('input', 'readonly', {
			// don't change getter
			set: function(elem, value){
				var stepcontrols = $.data(elem, 'step-controls');
				if(stepcontrols){
					stepcontrols[ (elem.disabled || elem.readonly) ? 'addClass' : 'removeClass' ]('disabled-step-control');
				}
			}
		});
	}
	var stepKeys = {
		38: 1,
		40: -1
	};
	webshims.addReady(function(context, contextElem){
		//ui for numeric values
		if(options.stepArrows){
			$('input', context).add(contextElem.filter('input')).each(function(){
				var type = $.attr(this, 'type');
				if(!typeModels[type] || !typeModels[type].asNumber || !options.stepArrows || (options.stepArrows !== true && !options.stepArrows[type]) || $(this).hasClass('has-step-controls')){return;}
				var elem = this;
				var controls = $('<span class="step-controls" unselectable="on"><span class="step-up" /><span class="step-down" /></span>')	
					.insertAfter(this)
					.bind('selectstart dragstart', function(){return false;})
					.bind('mousedown mousepress', function(e){
						doSteps(elem, type, e.target);
						return false;
					})
				;
				var jElm = $(this)
					.addClass('has-step-controls')
					.data('step-controls', controls)
					.attr({
						readonly: this.readOnly,
						disabled: this.disabled,
						autocomplete: 'off',
						role: 'spinbutton'
					})
					.bind(($.browser.msie) ? 'keydown' : 'keypress', function(e){
						if(this.disabled || this.readOnly || !stepKeys[e.keyCode]){return;}
						$.attr(this, 'value',  typeModels[type].numberToString(getNextStep(this, stepKeys[e.keyCode], {type: type})));
						triggerInlineForm(this, 'input');
						return false;
					})
				;
				
				if(options.calculateWidth){
					adjustInputWithBtn(jElm, controls);
					controls.css('marginTop', (jElm.outerHeight() - controls.outerHeight())  / 2 );
				}
			});
		}
	});
})();
	
});

/*
 * HTML5 placeholder-enhancer
 * version: 2.0.2
 * including a11y-name fallback
 * 
 * 
 */


jQuery.webshims.ready('dom-extend', function($, webshims, window, doc, undefined){
	if(Modernizr.input.placeholder){return;}
	var isOver = (webshims.cfg.forms.placeholderType == 'over');
	var hidePlaceholder = function(elem, data, value){
			if(!isOver && elem.type != 'password'){
				if(value === false){
					value = $.attr(elem, 'value');
				}
				elem.value = value;
			}
			data.box.removeClass('placeholder-visible');
		},
		showPlaceholder = function(elem, data, placeholderTxt){
			if(placeholderTxt === false){
				placeholderTxt = $.attr(elem, 'placeholder') || '';
			}
			
			if(!isOver && elem.type != 'password'){
				elem.value = placeholderTxt;
			}
			data.box.addClass('placeholder-visible');
		},
		changePlaceholderVisibility = function(elem, value, placeholderTxt, data, type){
			if(!data){
				data = $.data(elem, 'placeHolder');
				if(!data){return;}
			}
			if(type == 'focus' || (!type && elem === document.activeElement)){
				if(elem.type == 'password' || isOver || $(elem).hasClass('placeholder-visible')){
					hidePlaceholder(elem, data, '');
				}
				return;
			}
			if(value === false){
				value = $.attr(elem, 'value');
			}
			if(value){
				hidePlaceholder(elem, data, value);
				return;
			}
			if(placeholderTxt === false){
				placeholderTxt = $.attr(elem, 'placeholder') || '';
			}
			if(placeholderTxt && !value){
				showPlaceholder(elem, data, placeholderTxt);
			} else {
				hidePlaceholder(elem, data, value);
			}
		},
		createPlaceholder = function(elem){
			elem = $(elem);
			var id 			= elem.attr('id'),
				hasLabel	= !!(elem.attr('title') || elem.attr('aria-labeledby')),
				pHolderTxt
			;
			if(!hasLabel && id){
				hasLabel = !!( $('label[for="'+ id +'"]', elem[0].form)[0] );
			}
			return $( hasLabel ? '<span class="placeholder-text"></span>' : '<label for="'+ (id || $.webshims.getID(elem)) +'" class="placeholder-text"></label>');
		},
		pHolder = (function(){
			var delReg 	= /\n|\r|\f|\t/g,
				allowedPlaceholder = {
					text: 1,
					search: 1,
					url: 1,
					email: 1,
					password: 1,
					tel: 1
				}
			;
			
			return {
				create: function(elem){
					var data = $.data(elem, 'placeHolder');
					if(data){return data;}
					data = $.data(elem, 'placeHolder', {
						text: createPlaceholder(elem)
					});
					
					$(elem).bind('focus.placeholder blur.placeholder', function(e){
						changePlaceholderVisibility(this, false, false, data, e.type );
					});
					if(elem.form){
						$(elem.form).bind('reset.placeholder', function(e){
							setTimeout(function(){
								changePlaceholderVisibility(elem, false, false, data, e.type );
							}, 0);
						});
					}
					
					if(elem.type == 'password' || isOver){
						data.box = $(elem)
							.wrap('<span class="placeholder-box placeholder-box-'+ (elem.nodeName || '').toLowerCase() +'" />')
							.parent()
						;
	
						data.text
							.insertAfter(elem)
							.bind('mousedown.placeholder', function(){
								changePlaceholderVisibility(this, false, false, data, 'focus');
								elem.focus();
								return false;
							})
						;
						
						
		
						$.each(['Left', 'Top'], function(i, side){
							var size = (parseInt($.curCSS(elem, 'padding'+ side), 10) || 0) + Math.max((parseInt($.curCSS(elem, 'margin'+ side), 10) || 0), 0) + (parseInt($.curCSS(elem, 'border'+ side +'Width'), 10) || 0);
							data.text.css('padding'+ side, size);
						});
						var lineHeight 	= $.curCSS(elem, 'lineHeight'),
							dims 		= {
								width: $(elem).width(),
								height: $(elem).height()
							},
							cssFloat 		= $.curCSS(elem, 'float')
						;
						$.each(['lineHeight', 'fontSize', 'fontFamily', 'fontWeight'], function(i, style){
							var prop = $.curCSS(elem, style);
							if(data.text.css(style) != prop){
								data.text.css(style, prop);
							}
						});
						
						if(dims.width && dims.height){
							data.text.css(dims);
						}
						if(cssFloat !== 'none'){
							data.box.addClass('placeholder-box-'+cssFloat);
						}
					} else {
						var reset = function(e){
							if($(elem).hasClass('placeholder-visible')){
								hidePlaceholder(elem, data, '');
								if(e && e.type == 'submit'){
									setTimeout(function(){
										if(e.isDefaultPrevented()){
											changePlaceholderVisibility(elem, false, false, data );
										}
									}, 9);
								}
							}
						};
						if($.nodeName(data.text[0], 'label')){
							//if label is dynamically set after we ensure that our label isn't exposed anymore
							//ie always exposes last label and ff always first
							data.text.hide()[$.browser.msie ? 'insertBefore' : 'insertAfter'](elem);
						}
						$(window).one('beforeunload', reset);
						data.box = $(elem);
						if(elem.form){
							$(elem.form).submit(reset);
						}
					}
					
					return data;
				},
				update: function(elem, val){
					if(!allowedPlaceholder[$.attr(elem, 'type')] && !$.nodeName(elem, 'textarea')){return;}
					
					var data = pHolder.create(elem);
					
					data.text.text(val);
					
					changePlaceholderVisibility(elem, false, val, data);
				}
			};
		})()
	;
	
	$.webshims.publicMethods = {
		pHolder: pHolder
	};
	['input', 'textarea'].forEach(function(nodeName){
		var desc = webshims.defineNodeNameProperty(nodeName, 'placeholder', {
			set: function(val){
				var elem = this;
				webshims.contentAttr(elem, 'placeholder', val);
				pHolder.update(elem, val);
			},
			get: function(){
				return webshims.contentAttr(this, 'placeholder') || '';
			},
			content: true
		}, true, true, 'form-placeholder');
	});
			
	$.each(['input', 'textarea'], function(i, name){
		var desc = webshims.defineNodeNameProperty(name, 'value', {
			set: function(val){
				var elem = this;
				var placeholder = webshims.contentAttr(elem, 'placeholder');
				if(placeholder && 'value' in elem){
					changePlaceholderVisibility(elem, val, placeholder);
				}
				return desc._supset.call(elem, val);
			},
			get: function(){
				var elem = this;
				return $(elem).hasClass('placeholder-visible') ? '' : desc._supget.call(elem);
			}
		});
	});
	
	
	
	var oldVal = $.fn.val;
	$.fn.val = function(val){
		if(val !== undefined){
			var process = (val === '') ? 
				function(){
					if( this.nodeType === 1 ){
						var placeholder = this.getAttribute('placeholder');
						if($.nodeName(this, 'select') || !placeholder){
							oldVal.call($(this), '');
							return;
						}
						if(placeholder && 'value' in this){
							changePlaceholderVisibility(this, val, placeholder);
						}
						if(this.type == 'password' || isOver){
							oldVal.call($(this), '');
						}
					}
				} : 
				function(){
					if( this.nodeType === 1 ){
						var placeholder = this.getAttribute('placeholder');
						if(placeholder && 'value' in this){
							changePlaceholderVisibility(this, val, placeholder);
						}
					}
				}
			;
			this.each(process);
			if(val === ''){return this;}
		} else if(this[0] && this[0].nodeType == 1 && this.hasClass('placeholder-visible')) {
			return '';
		}
		return oldVal.apply(this, arguments);
	};
	webshims.isReady('form-placeholder', true);
});
jQuery.webshims.ready('form-core dom-extend', function($, webshims, window, document, undefined){
	var doc = document;	
	
	(function(){
		var elements = {
				input: 1,
				textarea: 1
			},
			noInputTriggerEvts = {updateInput: 1, input: 1},
			noInputTypes = {
				radio: 1,
				checkbox: 1,
				submit: 1,
				button: 1,
				image: 1,
				reset: 1
				
				//pro forma
				,color: 1
				//,range: 1
			},
			observe = function(input){
				var timer,
					lastVal = input.attr('value'),
					trigger = function(e){
						//input === null
						if(!input){return;}
						var newVal = input.attr('value');
						
						if(newVal !== lastVal){
							lastVal = newVal;
							if(!e || !noInputTriggerEvts[e.type]){
								webshims.triggerInlineForm(input[0], 'input');
							}
						}
					},
					unbind = function(){
						input.unbind('focusout', unbind).unbind('input', trigger).unbind('updateInput', trigger);
						clearInterval(timer);
						trigger();
						input = null;
					}
				;
				
				clearInterval(timer);
				timer = setInterval(trigger, ($.browser.mozilla) ? 250 : 111);
				setTimeout(trigger, 9);
				input.bind('focusout', unbind).bind('input updateInput', trigger);
			}
		;
			
		
		$(doc)
			.bind('focusin', function(e){
				if( e.target && e.target.type && !e.target.readonly && !e.target.readOnly && !e.target.disabled && elements[(e.target.nodeName || '').toLowerCase()] && !noInputTypes[e.target.type] ){
					observe($(e.target));
				}
			})
		;
	})();
	
	(function(){
		if( 'value' in document.createElement('output') ){return;}
		var outputCreate = function(elem){
			if(elem.getAttribute('aria-live')){return;}
			elem = $(elem);
			var value = (elem.text() || '').trim();
			var	id 	= elem.attr('id');
			var	htmlFor = elem.attr('for');
			var shim = $('<input class="output-shim" type="hidden" name="'+ (elem.attr('name') || '')+'" value="'+value+'" style="display: none" />').insertAfter(elem);
			var form = shim[0].form || doc;
			var setValue = function(val){
				shim[0].value = val;
				val = shim[0].value;
				elem.text(val);
				webshims.contentAttr(elem[0], 'value', val);
			};
			
			elem[0].defaultValue = value;
			webshims.contentAttr(elem[0], 'value', value);
			
			elem.attr({'aria-live': 'polite'});
			if(id){
				shim.attr('id', id);
				elem.attr('aria-labeldby', webshims.getID($('label[for="'+id+'"]', form)));
			}
			if(htmlFor){
				id = webshims.getID(elem);
				htmlFor.split(' ').forEach(function(control){
					control = form.getElementById(control);
					if(control){
						control.setAttribute('aria-controls', id);
					}
				});
			}
			elem.data('outputShim', setValue );
			shim.data('outputShim', setValue );
			return setValue;
		};
		
		webshims.defineNodeNameProperty('output', 'value', {
			set: function(value){
				var elem = this;
				var setVal = $.data(elem, 'outputShim');
				if(!setVal){
					setVal = outputCreate(elem);
				}
				setVal(value);
			},
			get: function(){
				var elem = this;
				return webshims.contentAttr(elem, 'value') || $(elem).text() || '';
			}
		}, true, 'output-props', 'form-output-datalist');
				
		webshims.addReady(function(context, contextElem){
			$('output', context).add(contextElem.filter('output')).each(function(){
				outputCreate(this);
			});
		});
	})();
	
	(function(){
		if(Modernizr.datalist){return;}
		var listidIndex = 0;
		
		var noDatalistSupport = {
			submit: 1,
			button: 1,
			reset: 1, 
			hidden: 1,
			
			//ToDo
			range: 1,
			date: 1
		};
		var noMin = ($.browser.msie && parseInt($.browser.version, 10) < 7);
		
		var getStoredOptions = function(name){
			if(!name){return [];}
			var data;
			try {
				data = JSON.parse(localStorage.getItem('storedDatalistOptions'+name));
			} catch(e){}
			return data || [];
		};
		var storeOptions = function(name, val){
			if(!name){return;}
			val = val || [];
			try {
				localStorage.setItem( 'storedDatalistOptions'+name, JSON.stringify(val) );
			} catch(e){}
		};
		var getType = function(elem){
			return (elem.getAttribute('type') || '').toLowerCase() || elem.type;
		};
		var getText = function(elem){
			return (elem.textContent || elem.innerText || $.text([ elem ]) || '');
		};
		
		//ToDo: It's a little bit to complex, maintainability isn't good		
		var dataListProto = {
			_create: function(opts){
				var datalist = opts.datalist || opts.id && document.getElementById(opts.id);
				if(noDatalistSupport[getType(opts.input)]){return;}
				var data = $.data(opts.input, 'datalistWidget');
				if(datalist && data && (data.datalist !== datalist)){
					data.datalist = datalist;
					data.id = opts.id;
					data._resetListCached();
					return;
				} else if(!datalist){
					if(data){
						data.destroy();
					}
					return;
				}
				listidIndex++;
				var that = this;
				this.timedHide = function(){
					clearTimeout(that.hideTimer);
					that.hideTimer = setTimeout($.proxy(that, 'hideList'), 9);
				};
				this.datalist = datalist;
				this.id = opts.id;
				this.lazyIDindex = listidIndex;
				this.hasViewableData = true;
				this._autocomplete = $.attr(opts.input, 'autocomplete');
				$.data(opts.input, 'datalistWidget', this);
				this.shadowList = $('<div class="datalist-polyfill" />').appendTo('body');
				this.index = -1;
				this.input = opts.input;
				this.arrayOptions = [];
				
				
				this.shadowList
					.delegate('li', 'mouseover.datalistWidget mousedown.datalistWidget click.datalistWidget', function(e){
						var items = $('li:not(.hidden-item)', that.shadowList);
						var select = (e.type == 'mousedown' || e.type == 'click');
						that.markItem(items.index(e.target), select, items);
						if(e.type == 'click'){
							that.hideList();
						}
						return (e.type != 'mousedown');
					})
					.bind('focusout', this.timedHide)
				;
				
				opts.input.setAttribute('autocomplete', 'off');
				
				$(opts.input)
					.attr({
						//role: 'combobox',
						'aria-haspopup': 'true'
					})
					.bind('input.datalistWidget', $.proxy(this, 'showHideOptions'))
					.bind('keydown.datalistWidget', function(e){
						var keyCode = e.keyCode;
						var items;
						if(keyCode == 40 && !that.showList()){
							that.markItem(that.index + 1, true);
							return false;
						}
						 
						if(!that.isListVisible){return;}
						
						 
						if(keyCode == 38){
							that.markItem(that.index - 1, true);
							return false;
						} 
						if(!e.shiftKey && (keyCode == 33 || keyCode == 36)){
							that.markItem(0, true);
							return false;
						} 
						if(!e.shiftKey && (keyCode == 34 || keyCode == 35)){
							items = $('li:not(.hidden-item)', that.shadowList);
							that.markItem(items.length - 1, true, items);
							return false;
						} 
						if(keyCode == 13 || keyCode == 27){
							that.hideList();
							return false;
						}
		
					})
					.bind('blur.datalistWidget', this.timedHide)
				;
				
				$(this.datalist)
					.unbind('updateDatalist.datalistWidget')
					.bind('updateDatalist.datalistWidget', $.proxy(this, '_resetListCached'))
				;
				
				this._resetListCached();
				
				if(opts.input.form && opts.input.id){
					$(opts.input.form).bind('submit.datalistWidget'+opts.input.id, function(){
						var val = $.attr(opts.input, 'value');
						that.storedOptions = that.storedOptions || getStoredOptions(opts.input.name || opts.input.id);
						if(val && $.inArray(val, that.storedOptions) == -1){
							that.storedOptions.push(val);
							storeOptions(opts.input.name || opts.input.id, that.storedOptions );
						}
					});
				}
			},
			destroy: function(){
				var autocomplete = $.attr(this.input, 'autocomplete');
				$(this.input)
					.unbind('.datalistWidget')
					.removeData('datalistWidget')
				;
				this.shadowList.remove();
				$(document).unbind('.datalist'+this.id);
				if(this.input.form && this.input.id){
					$(this.input.form).unbind('submit.datalistWidget'+this.input.id);
				}
				this.input.removeAttribute('aria-haspopup');
				if(autocomplete === undefined){
					this.input.removeAttribute('autocomplete');
				} else {
					$(this.input).attr('autocomplete', autocomplete);
				}
			},
			_resetListCached: function(){
				var that = this;
				this.needsUpdate = true;
				this.lastUpdatedValue = false;
				this.lastUnfoundValue = '';
				
				
				clearTimeout(this.updateTimer);
				this.updateTimer = setTimeout(function(){
					that.updateListOptions();
				}, this.isListVisible ? 0 : 20 * this.lazyIDindex);
			},
			updateListOptions: function(){
				this.needsUpdate = false;
				clearTimeout(this.updateTimer);
				this.shadowList.css({
					fontSize: $.curCSS(this.input, 'fontSize'),
					fontFamily: $.curCSS(this.input, 'fontFamily')
				});
				var list = '<ul role="list" class="'+ (this.datalist.className || '') +'">';
				
				var values = [];
				var allOptions = [];
				$('option', this.datalist).each(function(i){
					if(this.disabled){return;}
					var item = {
						value: $(this).val(),
						text: $.trim($.attr(this, 'label') || getText(this)),
						className: this.className || '',
						style: $.attr(this, 'style') || ''
					};
					if(!item.text){
						item.text = item.value;
					}
					values[i] = item.value;
					allOptions[i] = item;
				});
				this.storedOptions = this.storedOptions || getStoredOptions(this.input.name || this.input.id);
				this.storedOptions.forEach(function(val, i){
					if($.inArray(val, values) == -1){
						allOptions.push({value: val, text: val, className: '', style: ''});
					}
				});
				
				allOptions.forEach(function(item, i){
					list += '<li data-value="'+item.value+'" class="'+ item.className +'" style="'+ item.style +'" tabindex="-1" role="listitem">'+ item.text +'</li>';
				});
				
				list += '</ul>';
				this.arrayOptions = allOptions;
				this.shadowList.html(list);
				if(this.isListVisible){
					this.showHideOptions();
				}
			},
			showHideOptions: function(){
				var value = $.attr(this.input, 'value').toLowerCase();
				//first check prevent infinite loop, second creates simple lazy optimization
				if(value === this.lastUpdatedValue || (this.lastUnfoundValue && value.indexOf(this.lastUnfoundValue) === 0)){
					return;
				}
				this.lastUpdatedValue = value;
				var found = false;
				var lis = $('li', this.shadowList);
				if(value){
					this.arrayOptions.forEach(function(item, i){
						if(!('lowerText' in item)){
							item.lowerText = item.text.toLowerCase();
							item.lowerValue = item.value.toLowerCase();
						}
						
						if(item.lowerText.indexOf(value) !== -1 || item.lowerValue.indexOf(value) !== -1){
							$(lis[i]).removeClass('hidden-item');
							found = true;
						} else {
							$(lis[i]).addClass('hidden-item');
						}
					});
				} else {
					lis.removeClass('hidden-item');
					found = true;
				}
				
				this.hasViewableData = found;
				
				if(found){
					this.showList();
				} else {
					this.lastUnfoundValue = value;
					this.hideList();
				}
			},
			showList: function(){
				if(this.isListVisible){return false;}
				if(this.needsUpdate){
					this.updateListOptions();
				}
				this.showHideOptions();
				if(!this.hasViewableData){return false;}
				var that = this;
				var css = $(this.input).offset();
				css.top += $(this.input).outerHeight();
				
				css.width = $(this.input).outerWidth() - (parseInt(this.shadowList.css('borderLeftWidth'), 10)  || 0) - (parseInt(this.shadowList.css('borderRightWidth'), 10)  || 0);
				
				if(noMin){
					this.shadowList.css('height', 'auto');
					if(this.shadowList.height() > 250){
						this.shadowList.css('height', 220);
					}
				}
				this.shadowList.css(css).addClass('datalist-visible');
				this.isListVisible = true;
				//todo
				$(document).bind('mousedown.datalist'+this.id +' focusin.datalist'+this.id, function(e){
					if(e.target === that.input ||  that.shadowList[0] === e.target || $.contains( that.shadowList[0], e.target )){
						clearTimeout(that.hideTimer);
						setTimeout(function(){
							clearTimeout(that.hideTimer);
						}, 0);
					} else {
						that.timedHide();
					}
				});
				return true;
			},
			hideList: function(){
				if(!this.isListVisible){return false;}
				this.shadowList
					.removeClass('datalist-visible list-item-active')
					.scrollTop(0)
					.find('li.active-item').removeClass('active-item')
				;
				this.index = -1;
				this.isListVisible = false;
				$(this.input).removeAttr('aria-activedescendant');
				$(document).unbind('.datalist'+this.id);
				return true;
			},
			scrollIntoView: function(elem){
				var ul = $('> ul', this.shadowList);
				var elemPos = elem.position();
				var containerHeight;
				elemPos.top -=  (parseInt(ul.css('paddingTop'), 10) || 0) + (parseInt(ul.css('marginTop'), 10) || 0) + (parseInt(ul.css('borderTopWidth'), 10) || 0);
				if(elemPos.top < 0){
					this.shadowList.scrollTop( this.shadowList.scrollTop() + elemPos.top - 2);
					return;
				}
				elemPos.top += elem.outerHeight();
				containerHeight = this.shadowList.height();
				if(elemPos.top > containerHeight){
					this.shadowList.scrollTop( this.shadowList.scrollTop() + (elemPos.top - containerHeight) + 2);
				}
			},
			markItem: function(index, doValue, items){
				if(index < 0){return;}
				var activeItem;
				var goesUp;
				items = items || $('li:not(.hidden-item)', this.shadowList);
				if(index >= items.length){return;}
				items.removeClass('active-item');
				this.shadowList.addClass('list-item-active');
				activeItem = items.filter(':eq('+ index +')').addClass('active-item');
				
				if(doValue){
					$.attr(this.input, 'value', activeItem.attr('data-value'));
					$.attr(this.input, 'aria-activedescendant', $.webshims.getID(activeItem));
					this.scrollIntoView(activeItem);
				}
				this.index = index;
			}
		};
		
		
		webshims.defineNodeNameProperty('input', 'list', {
			get: function(){
				var elem = this;
				var val = webshims.contentAttr(elem, 'list');
				if(typeof val == 'string'){
					val = document.getElementById(val);
				}
				return val || null;
			},
			set: function(value){
				var elem = this;
				var dom;
				if(value && value.getAttribute){
					dom = value;
					value = webshims.getID(value);
				}
				webshims.contentAttr(elem, 'list', value);
				if(dataListProto){
					webshims.objectCreate(dataListProto, undefined, {input: elem, id: value, datalist: dom});
				}
			},
			content: true
		}, true, 'input-datalist', 'form-output-datalist');
		
		webshims.defineNodeNameProperty('input', 'selectedOption', {
			get: function(){
				var elem = this;
				var list = $.attr(elem, 'list');
				var ret = null;
				var value, options;
				if(!list){return ret;}
				value = $.attr(elem, 'value');
				if(!value){return ret;}
				options = $.attr(list, 'options');
				if(!options.length){return ret;}
				$.each(options, function(i, option){
					if(value == $.attr(option, 'value')){
						ret = option;
						return false;
					}
				});
				return ret;
			}
		}, true, 'input-datalist', 'form-output-datalist');
			
		webshims.defineNodeNameProperty('input', 'autocomplete', {
			get: function(){
				var elem = this;
				var data = $.data(elem, 'datalistWidget');
				if(data){
					return data._autocomplete;
				}
				return ('autocomplete' in elem) ? elem.autocomplete : elem.getAttribute('autocomplete');
			},
			set: function(value){
				var elem = this;
				var data = $.data(elem, 'datalistWidget');
				if(data){
					data._autocomplete = value;
					if(value == 'off'){
						data.hideList();
					}
				} else {
					if('autocomplete' in elem){
						elem.autocomplete = value;
					} else {
						elem.setAttribute('autocomplete', value);
					}
				}
			}
		});
		
		
		webshims.defineNodeNameProperty('datalist', 'options', {
			get: function(){
				var elem = this;
				var select = $('select', elem);
				return (select[0]) ? select[0].options : [];
			}
		}, true, 'datalist-props', 'form-output-datalist');
		
		
		webshims.addReady(function(context, contextElem){
			contextElem.filter('select, option').each(function(){
				var parent = this.parentNode;
				if(parent && !$.nodeName(parent, 'datalist')){
					parent = parent.parentNode;
				}
				if(parent && $.nodeName(parent, 'datalist')){
					$(parent).triggerHandler('updateDatalist');
				}
			});
		});
		
	})();
	
	
	webshims.isReady('form-output-datalist', true);
});
//JSON
(function(){
if('JSON'in window && JSON.stringify && JSON.parse){return;}


if(!this.JSON){this.JSON={};}(function(){function f(n){return n<10?'0'+n:n;}if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+f(this.getUTCMonth()+1)+'-'+f(this.getUTCDate())+'T'+f(this.getUTCHours())+':'+f(this.getUTCMinutes())+':'+f(this.getUTCSeconds())+'Z':null;};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf();};}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+string+'"';}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key);}if(typeof rep==='function'){value=rep.call(holder,key,value);}switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null';}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null';}v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v;}if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){k=rep[i];if(typeof k==='string'){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}else{for(k in value){if(Object.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v;}}if(typeof JSON.stringify!=='function'){JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' ';}}else if(typeof space==='string'){indent=space;}rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}return str('',{'':value});};}if(typeof JSON.parse!=='function'){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}return reviver.call(holder,key,value);}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);});}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j;}throw new SyntaxError('JSON.parse');};}}());

var $ = jQuery;
if(window.localStorage && window.sessionStorage){
	$.webshims.isReady('json-storage', true);
}
})();

//modified version from http://gist.github.com/350433
//using window.name for sessionStorage and cookies for localStorage

(function () {
if (window.localStorage && window.sessionStorage) {
	return;
}
var $ = jQuery;	
var storageNameError = function(name){
	if(name && name.indexOf && name.indexOf(';') != -1){
		setTimeout(function(){
			throw("Bad key for localStorage: ; in localStorage. name was: "+ name);
		}, 0);
	}
};
var winData;
var selfWindow = false;
$.each(['opener', 'top', 'parent'], function(i, name){
	try {
		winData = window[name];
		if(winData && 'name' in winData){
			var test = winData.name;
			return false;
		} else {
			winData = false;
		}
	} catch(e){
		winData = false;
	}
});
if(!winData){
	winData = window;
	selfWindow = true;
}
var setWindowData = function(data){
	if(!selfWindow){
		try {
			window.name = data;
		} catch(e){}
	}
	try {
		winData.name = data;
	} catch(e){
		winData = window;
		selfWindow = true;
	}
};
var getWindowData = function(){
	var data;
	if(!selfWindow){
		try {
			data = window.name;
		} catch(e){}
	}
	if(!data){
		try {
			data = winData.name;
		} catch(e){
			winData = window;
			selfWindow = true;
		}
	}
	return data;
};
var Storage = function (type) {
	function createCookie(name, value, days) {
		var date, expires;
		
		if (days) {
			date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			expires = "; expires="+date.toGMTString();
		} else {
			expires = "";
		}
		document.cookie = name+"="+value+expires+"; path=/";
	}
	
	function readCookie(name) {
		var nameEQ = name + "=",
			ca = document.cookie.split(';'),
			i, c;
		
		for (i=0; i < ca.length; i++) {
			c = ca[i];
			while (c.charAt(0)==' ') {
				c = c.substring(1,c.length);
			}
			
			if (c.indexOf(nameEQ) === 0) {
				return c.substring(nameEQ.length,c.length);
			}
		}
		return null;
	}
	
	function setData(data) {
		data = JSON.stringify(data);
		if (type == 'session') {
			setWindowData(data);
		} else {
			createCookie('localStorage', data, 365);
		}
	}
	
	function clearData() {
		if (type == 'session') {
			setWindowData('');
		} else {
			createCookie('localStorage', '', 365);
		}
	}
	
	function getData() {
		var data;
		if(type == 'session'){
			data = getWindowData();
		} else {
			data = readCookie('localStorage');
		}
		if(data){
			try {
				data = JSON.parse(data);
			} catch(e){
				data = {};
			}
		}
		return data || {};
	}
	
	
	// initialise if there's already data
	var data = getData();
	
	return {
		clear: function () {
			data = {};
			clearData();
		},
		getItem: function (key) {
			return (key in data) ? data[key] : null;
		},
		key: function (i) {
			// not perfect, but works
			var ctr = 0;
			for (var k in data) {
				if (ctr == i) {
					return k;
				} else {
					ctr++;
				}
			}
			return null;
		},
		removeItem: function (key) {
			delete data[key];
			setData(data);
		},
		setItem: function (key, value) {
			storageNameError(key);
			data[key] = value+''; // forces the value to a string
			setData(data);
		}
	};
};

if (!window.sessionStorage) {window.sessionStorage = new Storage('session');}




(function(){
	var swfTimer;
	var emptyString = '(empty string)+1287520303738';
	
	var localStorageSwfCallback = function(type){
		clearTimeout(swfTimer);
		if(window.localStorage){
			$.webshims.isReady('json-storage', true);
			return;
		}
		
		if(type === 'swf'){
			var shim = document.getElementById('swflocalstorageshim');
			//brute force flash getter
			if( !shim || typeof shim.GetVariable == 'undefined' ){
				shim = document.swflocalstorageshim;
			}
			if( !shim || typeof shim.GetVariable == 'undefined'){
				shim = window.localstorageshim;
			}
			if(shim && typeof shim.GetVariable !== 'undefined'){
				window.localStorage = {};
				$.each(['key', 'removeItem', 'clear'], function(i, fn){
					window.localStorage[fn] = shim[fn];
				});
				window.localStorage.setItem = function(name, val){
					storageNameError(name);
					val += '';
					if(!val){
						val = emptyString;
					}
					shim.setItem(name, val);
				};
				window.localStorage.getItem = function(name){
					var val = shim.getItem(name, val);
					if(val == emptyString){
						val = '';
					}
					return val;
				};
			}
		}
		if(!window.localStorage){
			window.localStorage = new Storage('local');
		}
		$.webshims.isReady('json-storage', true);
	};
	var storageCFG = $.webshims.cfg['json-storage'];
	$.webshims.swfLocalStorage = {
		show: function(){
			if(storageCFG.exceededMessage){
				$('#swflocalstorageshim-wrapper').prepend('<div class="polyfill-exceeded-message">'+ storageCFG.exceededMessage +'</div>');
			}
			$('#swflocalstorageshim-wrapper').css({
				top: $(window).scrollTop() + 20,
				left: ($(window).width() / 2) - ($('#swflocalstorageshim-wrapper').outerWidth() / 2)
			});
			
		},
		hide: function(success){
			$('#swflocalstorageshim-wrapper')
				.css({top: '', left: ''})
				.find('div.polyfill-exceeded-message')
				.remove()
			;
			if(!success){
				var err = new Error('DOMException: QUOTA_EXCEEDED_ERR');
				err.code = 22;
				err.name = 'DOMException';
				throw(err);
			}
		}
	};
	
	
	$.webshims.ready('DOM swfobject', function(){
		if(window.swfobject && swfobject.hasFlashPlayerVersion('8.0.0')){
			
			$('body')[$.browser.mozilla ? 'after' : 'append']('<div id="swflocalstorageshim-wrapper"><div id="swflocalstorageshim" /></div>');
			swfobject.embedSWF($.webshims.loader.basePath +'localStorage.swf', 'swflocalstorageshim', '215', '138', '8.0.0', '', {allowscriptaccess: 'always'}, {name: 'swflocalstorageshim'}, function(e){
				if(!e.success && !window.localStorage){
					localStorageSwfCallback();
				}
			});
			swfTimer = setTimeout(function(){
				$.webshims.warn('Add your development-directory to the local-trusted security sandbox: http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html');
				localStorageSwfCallback();
			}, (location.protocol.indexOf('file') === 0) ? 500 : 9999);
		} else {
			localStorageSwfCallback();
		}
	}, true);
})();


})();

