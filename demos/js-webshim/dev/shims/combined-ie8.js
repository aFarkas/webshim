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

var supportDefineDOMProp = true;
if(Object.defineProperty && Object.prototype.__defineGetter__){
	(function(){
		try {
			var foo = document.createElement('foo');
			Object.defineProperty(foo, 'bar', {get: function(){return true;}});
			supportDefineDOMProp = !!foo.bar;	
		}catch(e){
			supportDefineDOMProp = false;
		}
		if(!supportDefineDOMProp){
			jQuery.support.advancedObjectProperties = false;
		}
	})();
}

if((!supportDefineDOMProp || !Object.create || !Object.defineProperties || !Object.getOwnPropertyDescriptor  || !Object.defineProperty) && window.jQuery && jQuery.webshims){
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
        return object.__proto__ || object.constructor.prototype;
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
(function($){
	if(navigator.geolocation){return;}
	var domWrite = function(){
			setTimeout(function(){
				throw('document.write is overwritten by geolocation shim. This method is incompatibel with this plugin');
			}, 1);
		},
		id = 0
	;
	var geoOpts = $.webshims.modules.geolocation.options || {};
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
					if(geoOpts.confirmText && !confirm(geoOpts.confirmText.replace('{location}', location.hostname))){return;}
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
	"use strict";
	return (function(){eval( arguments[0] );}).call(arguments[1] || window, arguments[0]);
};
jQuery.webshims.ready('es5', function($, webshims, window, doc, undefined){
	"use strict";
	webshims.getVisualInput = function(elem){
		elem = $(elem);
		return (elem.data('inputUIReplace') || {visual: elem}).visual;
	};
	var support = $.support;
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
	
	
	
	webshims.triggerInlineForm = (function(){
		var stringify = function(id){
			if(typeof id != 'string' || id.indexOf('-') !== -1 || id.indexOf('.') !== -1 || id.indexOf('"') !== -1){return '';}
			return 'var '+ id +' = this.form["'+ id +'"];';
		};
		return function(elem, event){
			var attr = elem['on'+event] || elem.getAttribute('on'+event) || '';
			var ret;
			event = $.Event({
				type: event,
				target: elem[0],
				currentTarget: elem[0]
			});
			
			if(attr && typeof attr == 'string' && elem.form && elem.form.elements){
				var scope = '';
				for(var i = 0, elems = elem.form.elements, len = elems.length; i < len; i++ ){
					var name = elems[i].name;
					var id = elems[i].id;
					if(name){
						scope += stringify(name);
					}
					if(id && id !== name){
						scope += stringify(id);
					}
				}
				ret = webshims.gcEval(scope + attr, elem);
			}
			if(ret === false){
				event.stopPropagation();
				event.preventDefault();
			}
			$(elem).trigger(event);
			return ret;
		};
	})();
	
	
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
				$('> span.va-box', alert).text(message || elem.attr('customValidationMessage') || elem.attr('validationMessage'));
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
	
	(function(){
		if(!support.validity || window.noHTMLExtFixes || support.fieldsetValidation){return;}
		//safari 5.0.2 has serious issues with checkValidity in combination with setCustomValidity so we mimic checkValidity using validity-property (webshims.fix.checkValidity)
		var checkValidity = function(elem){
			var valid = ($.attr(elem, 'validity') || {valid: true}).valid;
			if(!valid && elem.checkValidity && elem.checkValidity()){
				$(elem).trigger('invalid');
			}			
			return valid;
		};
		var checkElems = ['fieldset'];
		//safari has a stupid bug ToDo: make proper test for safari bug
		if(!support.output){
			checkElems = ['input', 'textarea', 'select', 'form', 'fieldset'];
		}
		
		webshims.defineNodeNamesProperty(checkElems, 'checkValidity', {
			value: function(){
				if(this.elements || $.nodeName(this, 'fieldset')){
					var ret = true;
					$(this.elements || 'input, textarea, select', this)
						.each(function(){
							 if(!checkValidity(this)){
								ret = false;
							}
						})
					;
					return ret;
				} else if(this.checkValidity){
					return checkValidity(this);
				}
			}
		});
		
	})();
	
	
	webshims.isReady('form-core', true);
});



jQuery.webshims.ready('form-core', function($, webshims, window, doc, undefined){
	"use strict";
	var validityMessages = webshims.validityMessages;
	var support = $.support;
	
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
	
	var implementProperties = (webshims.overrideValidationMessages || webshims.implement.customValidationMessage) ? ['customValidationMessage'] : [];
	if((!window.noHTMLExtFixes && !support.validationMessage) || !support.validity){
		implementProperties.push('validationMessage');
	}
	
	$.each(implementProperties, function(i, messageProp){
		webshims.defineNodeNamesProperty(['input', 'select', 'textarea', 'fieldset', 'output'], messageProp, {
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
					message = ('validationMessage' in elem) ? elem.validationMessage : $.data(elem, 'customvalidationMessage');
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
		});
		
	});
});jQuery.webshims.ready('form-core', function($, webshims, window){
if($.support.validity){
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
			if($.nodeName(this, 'form') || $.nodeName(this, 'fieldset')){
				var ret = true,
					elems = this.elements || $( 'input, textarea, select', this);
				
				for(var i = 0, len = elems.length; i < len; i++){
					if( !testValidity(elems[i]) ){
						ret = false;
					}
				}
				return ret;
			} else if(this.form){
				return testValidity(this);
			} else {
				return true;
			}
		};
	})()
});

webshims.defineNodeNamesProperty(['input', 'textarea', 'select'], 'setCustomValidity', {
	value: function(error){
		$.data(this, 'customvalidationMessage', ''+error);
	}
});


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

// IDLs for constrain validation API
['input', 'select', 'textarea'].forEach(function(nodeName){
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
	}, true);
});


//todo
webshims.defineNodeNamesBooleanProperty(['input', 'textarea', 'select'], 'required', {
	set: function(value){
		var elem = this;
		elem.setAttribute('aria-required', (value) ? 'true' : 'false');
	},
	init: true
});

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
});


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
			return ($('<input type="'+type+'" />').attr('type') === type);
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
	
	var valueAsNumberDescriptor = {
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
				valueAsNumberDescriptor._supset.call(elem, arguments);
			}
		}
	};
	
	var valueAsDateDescriptor = {
		get: function(){
			var elem = this;
			var type = getType(elem);
			return (typeModels[type] && typeModels[type].asDate && !typeModels[type].noAsDate) ? 
				typeModels[type].asDate($.attr(elem, 'value')) :
				valueAsDateDescriptor._supget.call(elem);
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
				return valueAsDateDescriptor._supset(elem, arguments);
			}
		}
	};
	
	webshims.defineNodeNameProperty('input', 'valueAsNumber', valueAsNumberDescriptor);
	webshims.defineNodeNameProperty('input', 'valueAsDate', valueAsDateDescriptor);
	
	
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
jQuery.webshims.ready('form-number-date', function($, webshims, window, document){
	"use strict";
	var triggerInlineForm = webshims.triggerInlineForm;
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
		
	var options = $.webshims.modules.inputUI.options;
	var globalInvalidTimer;
	var labelID = 0;
	var emptyJ = $([]);
	var support = $.support;
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
		} else if(support.validity){
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
	if(!support.dateUI || options.replaceNative){
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
	
	if (!support.rangeUI || options.replaceNative) {
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
		var opts = $.extend({}, langObj, options.date);
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
	if(support.numericDateProps || !webshims.modules['form-number-date']){return;}
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


jQuery.webshims.ready('es5', function($, webshims, window, doc, undefined){
	if($.support.placeholder){return;}
	var hidePlaceholder = function(elem, data, value){
			if(elem.type != 'password'){
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
			
			if(elem.type != 'password'){
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
				if(elem.type == 'password' || $(elem).hasClass('placeholder-visible')){
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
					
					if(elem.type == 'password'){
						data.box = $(elem)
							.wrap('<span class="placeholder-box placeholder-box-'+ (elem.nodeName || '').toLowerCase() +'" />')
							.parent()
						;
	
						data.text
							.insertAfter(elem)
							.bind('mousedown.placeholder', function(){
								changePlaceholderVisibility(this, false, false, data, 'focus' );
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
						var reset = function(){
							hidePlaceholder(elem, data, '');
						};
						if($.nodeName(data.text[0], 'label')){
							//if label is dynamically set after we ensure that our label isn't exposed anymore
							//ie always exposes last label and ff always first
							data.text.hide()[$.browser.msie ? 'insertBefore' : 'insertAfter'](elem);
						}
						$(window).unload(reset);
						data.box = $(elem);
						if(elem.form){
							$(elem.form).submit(reset);
						}
					}
					
					return data;
				},
				update: function(elem, val){
					if(!allowedPlaceholder[$.attr(elem, 'type')] && !$.nodeName(elem, 'textarea')){return;}
					if($.nodeName(elem, 'input')){
						val = val.replace(delReg, '');
					}
					var data = pHolder.create(elem);
					if(webshims.contentAttr(elem, 'placeholder') != val){
						webshims.contentAttr(elem, 'placeholder', val);
					}
					data.text.text(val);
					
					changePlaceholderVisibility(elem, false, val, data);
				}
			};
		})()
	;
	
	$.webshims.publicMethods = {
		pHolder: pHolder
	};
	
	webshims.defineNodeNamesProperty(['input', 'textarea'], 'placeholder', {
		set: function(val){
			var elem = this;
			pHolder.update(elem, val);
		},
		get: function(elem){
			return webshims.contentAttr(this, 'placeholder') || '';
		},
		init: true
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
						if(this.type == 'password'){
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
	
});
jQuery.webshims.ready('form-core', function($, webshims, window, document, undefined){
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
		});
		
		webshims.onNodeNamesPropertyModify('input', 'value', {
			set: function(value){
				var elem = this;
				var setVal = $.data(elem, 'outputShim');
				if(setVal){
					setVal(value);
					return value;
				}
				$(elem).triggerHandler('updateInput');
			}
		
		});
		
		webshims.addReady(function(context, contextElem){
			$('output', context).add(contextElem.filter('output')).each(function(){
				outputCreate(this);
			});
		});
	})();
	
	(function(){
		if($.support.datalist){return;}
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
			init: true
		});
		
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
		});
			
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
		});
		
		
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
});// Copyright 2006 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


//some modification for webshims lib based on excanvas r73


// Known Issues:
//
// * Patterns only support repeat.
// * Radial gradient are not implemented. The VML version of these look very
//   different from the canvas one.
// * Clipping paths are not implemented.
// * Coordsize. The width and height attribute have higher priority than the
//   width and height style values which isn't correct.
// * Painting mode isn't implemented.
// * Canvas width/height should is using content-box by default. IE in
//   Quirks mode will draw the canvas using border-box. Either change your
//   doctype to HTML5
//   (http://www.whatwg.org/specs/web-apps/current-work/#the-doctype)
//   or use Box Sizing Behavior from WebFX
//   (http://webfx.eae.net/dhtml/boxsizing/boxsizing.html)
// * Non uniform scaling does not correctly scale strokes.
// * Optimize. There is always room for speed improvements.

// Only add this code if we do not already have a canvas implementation
if (!document.createElement('canvas').getContext) {

(function() {

  // alias some functions to make (compiled) code shorter
  var m = Math;
  var mr = m.round;
  var ms = m.sin;
  var mc = m.cos;
  var abs = m.abs;
  var sqrt = m.sqrt;

  // this is used for sub pixel precision
  var Z = 10;
  var Z2 = Z / 2;

  var IE_VERSION = +navigator.userAgent.match(/MSIE ([\d.]+)?/)[1];

  /**
   * This funtion is assigned to the <canvas> elements as element.getContext().
   * @this {HTMLElement}
   * @return {CanvasRenderingContext2D_}
   */
  function getContext() {
    return this.context_ ||
        (this.context_ = new CanvasRenderingContext2D_(this));
  }

  var slice = Array.prototype.slice;

  /**
   * Binds a function to an object. The returned function will always use the
   * passed in {@code obj} as {@code this}.
   *
   * Example:
   *
   *   g = bind(f, obj, a, b)
   *   g(c, d) // will do f.call(obj, a, b, c, d)
   *
   * @param {Function} f The function to bind the object to
   * @param {Object} obj The object that should act as this when the function
   *     is called
   * @param {*} var_args Rest arguments that will be used as the initial
   *     arguments when the function is called
   * @return {Function} A new function that has bound this
   */
  function bind(f, obj, var_args) {
    var a = slice.call(arguments, 2);
    return function() {
      return f.apply(obj, a.concat(slice.call(arguments)));
    };
  }

  function encodeHtmlAttribute(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  }

  function addNamespace(doc, prefix, urn) {
    if (!doc.namespaces[prefix]) {
      doc.namespaces.add(prefix, urn, '#default#VML');
    }
  }

  function addNamespacesAndStylesheet(doc) {
    addNamespace(doc, 'g_vml_', 'urn:schemas-microsoft-com:vml');
    addNamespace(doc, 'g_o_', 'urn:schemas-microsoft-com:office:office');

    // Setup default CSS.  Only add one style sheet per document
    if (!doc.styleSheets['ex_canvas_']) {
      var ss = doc.createStyleSheet();
      ss.owningElement.id = 'ex_canvas_';
      ss.cssText = 'canvas{display:inline-block;overflow:hidden;' +
          // default size is 300x150 in Gecko and Opera
          'text-align:left;width:300px;height:150px}';
    }
  }

  // Add namespaces and stylesheet at startup.
  addNamespacesAndStylesheet(document);

  var G_vmlCanvasManager_ = {
    init: function(opt_doc) {
      var doc = opt_doc || document;
      // Create a dummy element so that IE will allow canvas elements to be
      // recognized.
      doc.createElement('canvas');
//      doc.attachEvent('onreadystatechange', bind(this.init_, this, doc));
	  //webshims lib modification
		var that = this;
		setTimeout(function(){
			jQuery(bind(that.init_, that, doc));
		}, 0);
    },

    init_: function(doc) {
      // find all canvas elements
      var els = doc.getElementsByTagName('canvas');
      for (var i = 0; i < els.length; i++) {
        this.initElement(els[i]);
      }
    },

    /**
     * Public initializes a canvas element so that it can be used as canvas
     * element from now on. This is called automatically before the page is
     * loaded but if you are creating elements using createElement you need to
     * make sure this is called on the element.
     * @param {HTMLElement} el The canvas element to initialize.
     * @return {HTMLElement} the element that was created.
     */
    initElement: function(el) {
      if (!el.getContext) {
        el.getContext = getContext;

        // Add namespaces and stylesheet to document of the element.
        addNamespacesAndStylesheet(el.ownerDocument);

        // Remove fallback content. There is no way to hide text nodes so we
        // just remove all childNodes. We could hide all elements and remove
        // text nodes but who really cares about the fallback content.
        el.innerHTML = '';

        // do not use inline function because that will leak memory
        el.attachEvent('onpropertychange', onPropertyChange);
        el.attachEvent('onresize', onResize);

        var attrs = el.attributes;
        if (attrs.width && attrs.width.specified) {
          // TODO: use runtimeStyle and coordsize
          // el.getContext().setWidth_(attrs.width.nodeValue);
          el.style.width = attrs.width.nodeValue + 'px';
        } else {
          el.width = el.clientWidth;
        }
        if (attrs.height && attrs.height.specified) {
          // TODO: use runtimeStyle and coordsize
          // el.getContext().setHeight_(attrs.height.nodeValue);
          el.style.height = attrs.height.nodeValue + 'px';
        } else {
          el.height = el.clientHeight;
        }
        //el.getContext().setCoordsize_()
      }
      return el;
    }
  };

  function onPropertyChange(e) {
    var el = e.srcElement;
	//webshims lib modification
	if(!el.getContext || !('clearRect' in el.getContext())){return;}
    switch (e.propertyName) {
      case 'width':
        el.getContext().clearRect();
        el.style.width = el.attributes.width.nodeValue + 'px';
        // In IE8 this does not trigger onresize.
        el.firstChild.style.width =  el.clientWidth + 'px';
        break;
      case 'height':
        el.getContext().clearRect();
        el.style.height = el.attributes.height.nodeValue + 'px';
        el.firstChild.style.height = el.clientHeight + 'px';
        break;
    }
  }

  function onResize(e) {
    var el = e.srcElement;
    if (el.firstChild) {
      el.firstChild.style.width =  el.clientWidth + 'px';
      el.firstChild.style.height = el.clientHeight + 'px';
    }
  }

  G_vmlCanvasManager_.init();

  // precompute "00" to "FF"
  var decToHex = [];
  for (var i = 0; i < 16; i++) {
    for (var j = 0; j < 16; j++) {
      decToHex[i * 16 + j] = i.toString(16) + j.toString(16);
    }
  }

  function createMatrixIdentity() {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
  }

  function matrixMultiply(m1, m2) {
    var result = createMatrixIdentity();

    for (var x = 0; x < 3; x++) {
      for (var y = 0; y < 3; y++) {
        var sum = 0;

        for (var z = 0; z < 3; z++) {
          sum += m1[x][z] * m2[z][y];
        }

        result[x][y] = sum;
      }
    }
    return result;
  }

  function copyState(o1, o2) {
    o2.fillStyle     = o1.fillStyle;
    o2.lineCap       = o1.lineCap;
    o2.lineJoin      = o1.lineJoin;
    o2.lineWidth     = o1.lineWidth;
    o2.miterLimit    = o1.miterLimit;
    o2.shadowBlur    = o1.shadowBlur;
    o2.shadowColor   = o1.shadowColor;
    o2.shadowOffsetX = o1.shadowOffsetX;
    o2.shadowOffsetY = o1.shadowOffsetY;
    o2.strokeStyle   = o1.strokeStyle;
    o2.globalAlpha   = o1.globalAlpha;
    o2.font          = o1.font;
    o2.textAlign     = o1.textAlign;
    o2.textBaseline  = o1.textBaseline;
    o2.arcScaleX_    = o1.arcScaleX_;
    o2.arcScaleY_    = o1.arcScaleY_;
    o2.lineScale_    = o1.lineScale_;
  }

  var colorData = {
    aliceblue: '#F0F8FF',
    antiquewhite: '#FAEBD7',
    aquamarine: '#7FFFD4',
    azure: '#F0FFFF',
    beige: '#F5F5DC',
    bisque: '#FFE4C4',
    black: '#000000',
    blanchedalmond: '#FFEBCD',
    blueviolet: '#8A2BE2',
    brown: '#A52A2A',
    burlywood: '#DEB887',
    cadetblue: '#5F9EA0',
    chartreuse: '#7FFF00',
    chocolate: '#D2691E',
    coral: '#FF7F50',
    cornflowerblue: '#6495ED',
    cornsilk: '#FFF8DC',
    crimson: '#DC143C',
    cyan: '#00FFFF',
    darkblue: '#00008B',
    darkcyan: '#008B8B',
    darkgoldenrod: '#B8860B',
    darkgray: '#A9A9A9',
    darkgreen: '#006400',
    darkgrey: '#A9A9A9',
    darkkhaki: '#BDB76B',
    darkmagenta: '#8B008B',
    darkolivegreen: '#556B2F',
    darkorange: '#FF8C00',
    darkorchid: '#9932CC',
    darkred: '#8B0000',
    darksalmon: '#E9967A',
    darkseagreen: '#8FBC8F',
    darkslateblue: '#483D8B',
    darkslategray: '#2F4F4F',
    darkslategrey: '#2F4F4F',
    darkturquoise: '#00CED1',
    darkviolet: '#9400D3',
    deeppink: '#FF1493',
    deepskyblue: '#00BFFF',
    dimgray: '#696969',
    dimgrey: '#696969',
    dodgerblue: '#1E90FF',
    firebrick: '#B22222',
    floralwhite: '#FFFAF0',
    forestgreen: '#228B22',
    gainsboro: '#DCDCDC',
    ghostwhite: '#F8F8FF',
    gold: '#FFD700',
    goldenrod: '#DAA520',
    grey: '#808080',
    greenyellow: '#ADFF2F',
    honeydew: '#F0FFF0',
    hotpink: '#FF69B4',
    indianred: '#CD5C5C',
    indigo: '#4B0082',
    ivory: '#FFFFF0',
    khaki: '#F0E68C',
    lavender: '#E6E6FA',
    lavenderblush: '#FFF0F5',
    lawngreen: '#7CFC00',
    lemonchiffon: '#FFFACD',
    lightblue: '#ADD8E6',
    lightcoral: '#F08080',
    lightcyan: '#E0FFFF',
    lightgoldenrodyellow: '#FAFAD2',
    lightgreen: '#90EE90',
    lightgrey: '#D3D3D3',
    lightpink: '#FFB6C1',
    lightsalmon: '#FFA07A',
    lightseagreen: '#20B2AA',
    lightskyblue: '#87CEFA',
    lightslategray: '#778899',
    lightslategrey: '#778899',
    lightsteelblue: '#B0C4DE',
    lightyellow: '#FFFFE0',
    limegreen: '#32CD32',
    linen: '#FAF0E6',
    magenta: '#FF00FF',
    mediumaquamarine: '#66CDAA',
    mediumblue: '#0000CD',
    mediumorchid: '#BA55D3',
    mediumpurple: '#9370DB',
    mediumseagreen: '#3CB371',
    mediumslateblue: '#7B68EE',
    mediumspringgreen: '#00FA9A',
    mediumturquoise: '#48D1CC',
    mediumvioletred: '#C71585',
    midnightblue: '#191970',
    mintcream: '#F5FFFA',
    mistyrose: '#FFE4E1',
    moccasin: '#FFE4B5',
    navajowhite: '#FFDEAD',
    oldlace: '#FDF5E6',
    olivedrab: '#6B8E23',
    orange: '#FFA500',
    orangered: '#FF4500',
    orchid: '#DA70D6',
    palegoldenrod: '#EEE8AA',
    palegreen: '#98FB98',
    paleturquoise: '#AFEEEE',
    palevioletred: '#DB7093',
    papayawhip: '#FFEFD5',
    peachpuff: '#FFDAB9',
    peru: '#CD853F',
    pink: '#FFC0CB',
    plum: '#DDA0DD',
    powderblue: '#B0E0E6',
    rosybrown: '#BC8F8F',
    royalblue: '#4169E1',
    saddlebrown: '#8B4513',
    salmon: '#FA8072',
    sandybrown: '#F4A460',
    seagreen: '#2E8B57',
    seashell: '#FFF5EE',
    sienna: '#A0522D',
    skyblue: '#87CEEB',
    slateblue: '#6A5ACD',
    slategray: '#708090',
    slategrey: '#708090',
    snow: '#FFFAFA',
    springgreen: '#00FF7F',
    steelblue: '#4682B4',
    tan: '#D2B48C',
    thistle: '#D8BFD8',
    tomato: '#FF6347',
    turquoise: '#40E0D0',
    violet: '#EE82EE',
    wheat: '#F5DEB3',
    whitesmoke: '#F5F5F5',
    yellowgreen: '#9ACD32'
  };


  function getRgbHslContent(styleString) {
    var start = styleString.indexOf('(', 3);
    var end = styleString.indexOf(')', start + 1);
    var parts = styleString.substring(start + 1, end).split(',');
    // add alpha if needed
    if (parts.length != 4 || styleString.charAt(3) != 'a') {
      parts[3] = 1;
    }
    return parts;
  }

  function percent(s) {
    return parseFloat(s) / 100;
  }

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function hslToRgb(parts){
    var r, g, b, h, s, l;
    h = parseFloat(parts[0]) / 360 % 360;
    if (h < 0)
      h++;
    s = clamp(percent(parts[1]), 0, 1);
    l = clamp(percent(parts[2]), 0, 1);
    if (s == 0) {
      r = g = b = l; // achromatic
    } else {
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hueToRgb(p, q, h + 1 / 3);
      g = hueToRgb(p, q, h);
      b = hueToRgb(p, q, h - 1 / 3);
    }

    return '#' + decToHex[Math.floor(r * 255)] +
        decToHex[Math.floor(g * 255)] +
        decToHex[Math.floor(b * 255)];
  }

  function hueToRgb(m1, m2, h) {
    if (h < 0)
      h++;
    if (h > 1)
      h--;

    if (6 * h < 1)
      return m1 + (m2 - m1) * 6 * h;
    else if (2 * h < 1)
      return m2;
    else if (3 * h < 2)
      return m1 + (m2 - m1) * (2 / 3 - h) * 6;
    else
      return m1;
  }

  var processStyleCache = {};

  function processStyle(styleString) {
    if (styleString in processStyleCache) {
      return processStyleCache[styleString];
    }

    var str, alpha = 1;

    styleString = String(styleString);
    if (styleString.charAt(0) == '#') {
      str = styleString;
    } else if (/^rgb/.test(styleString)) {
      var parts = getRgbHslContent(styleString);
      var str = '#', n;
      for (var i = 0; i < 3; i++) {
        if (parts[i].indexOf('%') != -1) {
          n = Math.floor(percent(parts[i]) * 255);
        } else {
          n = +parts[i];
        }
        str += decToHex[clamp(n, 0, 255)];
      }
      alpha = +parts[3];
    } else if (/^hsl/.test(styleString)) {
      var parts = getRgbHslContent(styleString);
      str = hslToRgb(parts);
      alpha = parts[3];
    } else {
      str = colorData[styleString] || styleString;
    }
    return processStyleCache[styleString] = {color: str, alpha: alpha};
  }

  var DEFAULT_STYLE = {
    style: 'normal',
    variant: 'normal',
    weight: 'normal',
    size: 10,
    family: 'sans-serif'
  };

  // Internal text style cache
  var fontStyleCache = {};

  function processFontStyle(styleString) {
    if (fontStyleCache[styleString]) {
      return fontStyleCache[styleString];
    }

    var el = document.createElement('div');
    var style = el.style;
    try {
      style.font = styleString;
    } catch (ex) {
      // Ignore failures to set to invalid font.
    }

    return fontStyleCache[styleString] = {
      style: style.fontStyle || DEFAULT_STYLE.style,
      variant: style.fontVariant || DEFAULT_STYLE.variant,
      weight: style.fontWeight || DEFAULT_STYLE.weight,
      size: style.fontSize || DEFAULT_STYLE.size,
      family: style.fontFamily || DEFAULT_STYLE.family
    };
  }

  function getComputedStyle(style, element) {
    var computedStyle = {};

    for (var p in style) {
      computedStyle[p] = style[p];
    }

    // Compute the size
    var canvasFontSize = parseFloat(element.currentStyle.fontSize),
        fontSize = parseFloat(style.size);

    if (typeof style.size == 'number') {
      computedStyle.size = style.size;
    } else if (style.size.indexOf('px') != -1) {
      computedStyle.size = fontSize;
    } else if (style.size.indexOf('em') != -1) {
      computedStyle.size = canvasFontSize * fontSize;
    } else if(style.size.indexOf('%') != -1) {
      computedStyle.size = (canvasFontSize / 100) * fontSize;
    } else if (style.size.indexOf('pt') != -1) {
      computedStyle.size = fontSize / .75;
    } else {
      computedStyle.size = canvasFontSize;
    }

    // Different scaling between normal text and VML text. This was found using
    // trial and error to get the same size as non VML text.
    computedStyle.size *= 0.981;

    return computedStyle;
  }

  function buildStyle(style) {
    return style.style + ' ' + style.variant + ' ' + style.weight + ' ' +
        style.size + 'px ' + style.family;
  }

  var lineCapMap = {
    'butt': 'flat',
    'round': 'round'
  };

  function processLineCap(lineCap) {
    return lineCapMap[lineCap] || 'square';
  }

  /**
   * This class implements CanvasRenderingContext2D interface as described by
   * the WHATWG.
   * @param {HTMLElement} canvasElement The element that the 2D context should
   * be associated with
   */
  function CanvasRenderingContext2D_(canvasElement) {
    this.m_ = createMatrixIdentity();

    this.mStack_ = [];
    this.aStack_ = [];
    this.currentPath_ = [];

    // Canvas context properties
    this.strokeStyle = '#000';
    this.fillStyle = '#000';

    this.lineWidth = 1;
    this.lineJoin = 'miter';
    this.lineCap = 'butt';
    this.miterLimit = Z * 1;
    this.globalAlpha = 1;
    this.font = '10px sans-serif';
    this.textAlign = 'left';
    this.textBaseline = 'alphabetic';
    this.canvas = canvasElement;

    var cssText = 'width:' + canvasElement.clientWidth + 'px;height:' +
        canvasElement.clientHeight + 'px;overflow:hidden;position:absolute';
    var el = canvasElement.ownerDocument.createElement('div');
    el.style.cssText = cssText;
    canvasElement.appendChild(el);

    var overlayEl = el.cloneNode(false);
    // Use a non transparent background.
    overlayEl.style.backgroundColor = 'red';
    overlayEl.style.filter = 'alpha(opacity=0)';
    canvasElement.appendChild(overlayEl);

    this.element_ = el;
    this.arcScaleX_ = 1;
    this.arcScaleY_ = 1;
    this.lineScale_ = 1;
  }

  var contextPrototype = CanvasRenderingContext2D_.prototype;
  contextPrototype.clearRect = function() {
    if (this.textMeasureEl_) {
      this.textMeasureEl_.removeNode(true);
      this.textMeasureEl_ = null;
    }
    this.element_.innerHTML = '';
  };

  contextPrototype.beginPath = function() {
    // TODO: Branch current matrix so that save/restore has no effect
    //       as per safari docs.
    this.currentPath_ = [];
  };

  contextPrototype.moveTo = function(aX, aY) {
    var p = getCoords(this, aX, aY);
    this.currentPath_.push({type: 'moveTo', x: p.x, y: p.y});
    this.currentX_ = p.x;
    this.currentY_ = p.y;
  };

  contextPrototype.lineTo = function(aX, aY) {
    var p = getCoords(this, aX, aY);
    this.currentPath_.push({type: 'lineTo', x: p.x, y: p.y});

    this.currentX_ = p.x;
    this.currentY_ = p.y;
  };

  contextPrototype.bezierCurveTo = function(aCP1x, aCP1y,
                                            aCP2x, aCP2y,
                                            aX, aY) {
    var p = getCoords(this, aX, aY);
    var cp1 = getCoords(this, aCP1x, aCP1y);
    var cp2 = getCoords(this, aCP2x, aCP2y);
    bezierCurveTo(this, cp1, cp2, p);
  };

  // Helper function that takes the already fixed cordinates.
  function bezierCurveTo(self, cp1, cp2, p) {
    self.currentPath_.push({
      type: 'bezierCurveTo',
      cp1x: cp1.x,
      cp1y: cp1.y,
      cp2x: cp2.x,
      cp2y: cp2.y,
      x: p.x,
      y: p.y
    });
    self.currentX_ = p.x;
    self.currentY_ = p.y;
  }

  contextPrototype.quadraticCurveTo = function(aCPx, aCPy, aX, aY) {
    // the following is lifted almost directly from
    // http://developer.mozilla.org/en/docs/Canvas_tutorial:Drawing_shapes

    var cp = getCoords(this, aCPx, aCPy);
    var p = getCoords(this, aX, aY);

    var cp1 = {
      x: this.currentX_ + 2.0 / 3.0 * (cp.x - this.currentX_),
      y: this.currentY_ + 2.0 / 3.0 * (cp.y - this.currentY_)
    };
    var cp2 = {
      x: cp1.x + (p.x - this.currentX_) / 3.0,
      y: cp1.y + (p.y - this.currentY_) / 3.0
    };

    bezierCurveTo(this, cp1, cp2, p);
  };

  contextPrototype.arc = function(aX, aY, aRadius,
                                  aStartAngle, aEndAngle, aClockwise) {
    aRadius *= Z;
    var arcType = aClockwise ? 'at' : 'wa';

    var xStart = aX + mc(aStartAngle) * aRadius - Z2;
    var yStart = aY + ms(aStartAngle) * aRadius - Z2;

    var xEnd = aX + mc(aEndAngle) * aRadius - Z2;
    var yEnd = aY + ms(aEndAngle) * aRadius - Z2;

    // IE won't render arches drawn counter clockwise if xStart == xEnd.
    if (xStart == xEnd && !aClockwise) {
      xStart += 0.125; // Offset xStart by 1/80 of a pixel. Use something
                       // that can be represented in binary
    }

    var p = getCoords(this, aX, aY);
    var pStart = getCoords(this, xStart, yStart);
    var pEnd = getCoords(this, xEnd, yEnd);

    this.currentPath_.push({type: arcType,
                           x: p.x,
                           y: p.y,
                           radius: aRadius,
                           xStart: pStart.x,
                           yStart: pStart.y,
                           xEnd: pEnd.x,
                           yEnd: pEnd.y});

  };

  contextPrototype.rect = function(aX, aY, aWidth, aHeight) {
    this.moveTo(aX, aY);
    this.lineTo(aX + aWidth, aY);
    this.lineTo(aX + aWidth, aY + aHeight);
    this.lineTo(aX, aY + aHeight);
    this.closePath();
  };

  contextPrototype.strokeRect = function(aX, aY, aWidth, aHeight) {
    var oldPath = this.currentPath_;
    this.beginPath();

    this.moveTo(aX, aY);
    this.lineTo(aX + aWidth, aY);
    this.lineTo(aX + aWidth, aY + aHeight);
    this.lineTo(aX, aY + aHeight);
    this.closePath();
    this.stroke();

    this.currentPath_ = oldPath;
  };

  contextPrototype.fillRect = function(aX, aY, aWidth, aHeight) {
    var oldPath = this.currentPath_;
    this.beginPath();

    this.moveTo(aX, aY);
    this.lineTo(aX + aWidth, aY);
    this.lineTo(aX + aWidth, aY + aHeight);
    this.lineTo(aX, aY + aHeight);
    this.closePath();
    this.fill();

    this.currentPath_ = oldPath;
  };

  contextPrototype.createLinearGradient = function(aX0, aY0, aX1, aY1) {
    var gradient = new CanvasGradient_('gradient');
    gradient.x0_ = aX0;
    gradient.y0_ = aY0;
    gradient.x1_ = aX1;
    gradient.y1_ = aY1;
    return gradient;
  };

  contextPrototype.createRadialGradient = function(aX0, aY0, aR0,
                                                   aX1, aY1, aR1) {
    var gradient = new CanvasGradient_('gradientradial');
    gradient.x0_ = aX0;
    gradient.y0_ = aY0;
    gradient.r0_ = aR0;
    gradient.x1_ = aX1;
    gradient.y1_ = aY1;
    gradient.r1_ = aR1;
    return gradient;
  };

  contextPrototype.drawImage = function(image, var_args) {
    var dx, dy, dw, dh, sx, sy, sw, sh;

    // to find the original width we overide the width and height
    var oldRuntimeWidth = image.runtimeStyle.width;
    var oldRuntimeHeight = image.runtimeStyle.height;
    image.runtimeStyle.width = 'auto';
    image.runtimeStyle.height = 'auto';

    // get the original size
    var w = image.width;
    var h = image.height;

    // and remove overides
    image.runtimeStyle.width = oldRuntimeWidth;
    image.runtimeStyle.height = oldRuntimeHeight;

    if (arguments.length == 3) {
      dx = arguments[1];
      dy = arguments[2];
      sx = sy = 0;
      sw = dw = w;
      sh = dh = h;
    } else if (arguments.length == 5) {
      dx = arguments[1];
      dy = arguments[2];
      dw = arguments[3];
      dh = arguments[4];
      sx = sy = 0;
      sw = w;
      sh = h;
    } else if (arguments.length == 9) {
      sx = arguments[1];
      sy = arguments[2];
      sw = arguments[3];
      sh = arguments[4];
      dx = arguments[5];
      dy = arguments[6];
      dw = arguments[7];
      dh = arguments[8];
    } else {
      throw Error('Invalid number of arguments');
    }

    var d = getCoords(this, dx, dy);

    var w2 = sw / 2;
    var h2 = sh / 2;

    var vmlStr = [];

    var W = 10;
    var H = 10;

    // For some reason that I've now forgotten, using divs didn't work
    vmlStr.push(' <g_vml_:group',
                ' coordsize="', Z * W, ',', Z * H, '"',
                ' coordorigin="0,0"' ,
                ' style="width:', W, 'px;height:', H, 'px;position:absolute;');

    // If filters are necessary (rotation exists), create them
    // filters are bog-slow, so only create them if abbsolutely necessary
    // The following check doesn't account for skews (which don't exist
    // in the canvas spec (yet) anyway.

    if (this.m_[0][0] != 1 || this.m_[0][1] ||
        this.m_[1][1] != 1 || this.m_[1][0]) {
      var filter = [];

      // Note the 12/21 reversal
      filter.push('M11=', this.m_[0][0], ',',
                  'M12=', this.m_[1][0], ',',
                  'M21=', this.m_[0][1], ',',
                  'M22=', this.m_[1][1], ',',
                  'Dx=', mr(d.x / Z), ',',
                  'Dy=', mr(d.y / Z), '');

      // Bounding box calculation (need to minimize displayed area so that
      // filters don't waste time on unused pixels.
      var max = d;
      var c2 = getCoords(this, dx + dw, dy);
      var c3 = getCoords(this, dx, dy + dh);
      var c4 = getCoords(this, dx + dw, dy + dh);

      max.x = m.max(max.x, c2.x, c3.x, c4.x);
      max.y = m.max(max.y, c2.y, c3.y, c4.y);

      vmlStr.push('padding:0 ', mr(max.x / Z), 'px ', mr(max.y / Z),
                  'px 0;filter:progid:DXImageTransform.Microsoft.Matrix(',
                  filter.join(''), ", sizingmethod='clip');");

    } else {
      vmlStr.push('top:', mr(d.y / Z), 'px;left:', mr(d.x / Z), 'px;');
    }

    vmlStr.push(' ">' ,
                '<g_vml_:image src="', image.src, '"',
                ' style="width:', Z * dw, 'px;',
                ' height:', Z * dh, 'px"',
                ' cropleft="', sx / w, '"',
                ' croptop="', sy / h, '"',
                ' cropright="', (w - sx - sw) / w, '"',
                ' cropbottom="', (h - sy - sh) / h, '"',
                ' />',
                '</g_vml_:group>');

    this.element_.insertAdjacentHTML('BeforeEnd', vmlStr.join(''));
  };

  contextPrototype.stroke = function(aFill) {
    var lineStr = [];
    var lineOpen = false;

    var W = 10;
    var H = 10;

    lineStr.push('<g_vml_:shape',
                 ' filled="', !!aFill, '"',
                 ' style="position:absolute;width:', W, 'px;height:', H, 'px;"',
                 ' coordorigin="0,0"',
                 ' coordsize="', Z * W, ',', Z * H, '"',
                 ' stroked="', !aFill, '"',
                 ' path="');

    var newSeq = false;
    var min = {x: null, y: null};
    var max = {x: null, y: null};

    for (var i = 0; i < this.currentPath_.length; i++) {
      var p = this.currentPath_[i];
      var c;

      switch (p.type) {
        case 'moveTo':
          c = p;
          lineStr.push(' m ', mr(p.x), ',', mr(p.y));
          break;
        case 'lineTo':
          lineStr.push(' l ', mr(p.x), ',', mr(p.y));
          break;
        case 'close':
          lineStr.push(' x ');
          p = null;
          break;
        case 'bezierCurveTo':
          lineStr.push(' c ',
                       mr(p.cp1x), ',', mr(p.cp1y), ',',
                       mr(p.cp2x), ',', mr(p.cp2y), ',',
                       mr(p.x), ',', mr(p.y));
          break;
        case 'at':
        case 'wa':
          lineStr.push(' ', p.type, ' ',
                       mr(p.x - this.arcScaleX_ * p.radius), ',',
                       mr(p.y - this.arcScaleY_ * p.radius), ' ',
                       mr(p.x + this.arcScaleX_ * p.radius), ',',
                       mr(p.y + this.arcScaleY_ * p.radius), ' ',
                       mr(p.xStart), ',', mr(p.yStart), ' ',
                       mr(p.xEnd), ',', mr(p.yEnd));
          break;
      }


      // TODO: Following is broken for curves due to
      //       move to proper paths.

      // Figure out dimensions so we can do gradient fills
      // properly
      if (p) {
        if (min.x == null || p.x < min.x) {
          min.x = p.x;
        }
        if (max.x == null || p.x > max.x) {
          max.x = p.x;
        }
        if (min.y == null || p.y < min.y) {
          min.y = p.y;
        }
        if (max.y == null || p.y > max.y) {
          max.y = p.y;
        }
      }
    }
    lineStr.push(' ">');

    if (!aFill) {
      appendStroke(this, lineStr);
    } else {
      appendFill(this, lineStr, min, max);
    }

    lineStr.push('</g_vml_:shape>');

    this.element_.insertAdjacentHTML('beforeEnd', lineStr.join(''));
  };

  function appendStroke(ctx, lineStr) {
    var a = processStyle(ctx.strokeStyle);
    var color = a.color;
    var opacity = a.alpha * ctx.globalAlpha;
    var lineWidth = ctx.lineScale_ * ctx.lineWidth;

    // VML cannot correctly render a line if the width is less than 1px.
    // In that case, we dilute the color to make the line look thinner.
    if (lineWidth < 1) {
      opacity *= lineWidth;
    }

    lineStr.push(
      '<g_vml_:stroke',
      ' opacity="', opacity, '"',
      ' joinstyle="', ctx.lineJoin, '"',
      ' miterlimit="', ctx.miterLimit, '"',
      ' endcap="', processLineCap(ctx.lineCap), '"',
      ' weight="', lineWidth, 'px"',
      ' color="', color, '" />'
    );
  }

  function appendFill(ctx, lineStr, min, max) {
    var fillStyle = ctx.fillStyle;
    var arcScaleX = ctx.arcScaleX_;
    var arcScaleY = ctx.arcScaleY_;
    var width = max.x - min.x;
    var height = max.y - min.y;
    if (fillStyle instanceof CanvasGradient_) {
      // TODO: Gradients transformed with the transformation matrix.
      var angle = 0;
      var focus = {x: 0, y: 0};

      // additional offset
      var shift = 0;
      // scale factor for offset
      var expansion = 1;

      if (fillStyle.type_ == 'gradient') {
        var x0 = fillStyle.x0_ / arcScaleX;
        var y0 = fillStyle.y0_ / arcScaleY;
        var x1 = fillStyle.x1_ / arcScaleX;
        var y1 = fillStyle.y1_ / arcScaleY;
        var p0 = getCoords(ctx, x0, y0);
        var p1 = getCoords(ctx, x1, y1);
        var dx = p1.x - p0.x;
        var dy = p1.y - p0.y;
        angle = Math.atan2(dx, dy) * 180 / Math.PI;

        // The angle should be a non-negative number.
        if (angle < 0) {
          angle += 360;
        }

        // Very small angles produce an unexpected result because they are
        // converted to a scientific notation string.
        if (angle < 1e-6) {
          angle = 0;
        }
      } else {
        var p0 = getCoords(ctx, fillStyle.x0_, fillStyle.y0_);
        focus = {
          x: (p0.x - min.x) / width,
          y: (p0.y - min.y) / height
        };

        width  /= arcScaleX * Z;
        height /= arcScaleY * Z;
        var dimension = m.max(width, height);
        shift = 2 * fillStyle.r0_ / dimension;
        expansion = 2 * fillStyle.r1_ / dimension - shift;
      }

      // We need to sort the color stops in ascending order by offset,
      // otherwise IE won't interpret it correctly.
      var stops = fillStyle.colors_;
      stops.sort(function(cs1, cs2) {
        return cs1.offset - cs2.offset;
      });

      var length = stops.length;
      var color1 = stops[0].color;
      var color2 = stops[length - 1].color;
      var opacity1 = stops[0].alpha * ctx.globalAlpha;
      var opacity2 = stops[length - 1].alpha * ctx.globalAlpha;

      var colors = [];
      for (var i = 0; i < length; i++) {
        var stop = stops[i];
        colors.push(stop.offset * expansion + shift + ' ' + stop.color);
      }

      // When colors attribute is used, the meanings of opacity and o:opacity2
      // are reversed.
      lineStr.push('<g_vml_:fill type="', fillStyle.type_, '"',
                   ' method="none" focus="100%"',
                   ' color="', color1, '"',
                   ' color2="', color2, '"',
                   ' colors="', colors.join(','), '"',
                   ' opacity="', opacity2, '"',
                   ' g_o_:opacity2="', opacity1, '"',
                   ' angle="', angle, '"',
                   ' focusposition="', focus.x, ',', focus.y, '" />');
    } else if (fillStyle instanceof CanvasPattern_) {
      if (width && height) {
        var deltaLeft = -min.x;
        var deltaTop = -min.y;
        lineStr.push('<g_vml_:fill',
                     ' position="',
                     deltaLeft / width * arcScaleX * arcScaleX, ',',
                     deltaTop / height * arcScaleY * arcScaleY, '"',
                     ' type="tile"',
                     // TODO: Figure out the correct size to fit the scale.
                     //' size="', w, 'px ', h, 'px"',
                     ' src="', fillStyle.src_, '" />');
       }
    } else {
      var a = processStyle(ctx.fillStyle);
      var color = a.color;
      var opacity = a.alpha * ctx.globalAlpha;
      lineStr.push('<g_vml_:fill color="', color, '" opacity="', opacity,
                   '" />');
    }
  }

  contextPrototype.fill = function() {
    this.stroke(true);
  };

  contextPrototype.closePath = function() {
    this.currentPath_.push({type: 'close'});
  };

  function getCoords(ctx, aX, aY) {
    var m = ctx.m_;
    return {
      x: Z * (aX * m[0][0] + aY * m[1][0] + m[2][0]) - Z2,
      y: Z * (aX * m[0][1] + aY * m[1][1] + m[2][1]) - Z2
    };
  };

  contextPrototype.save = function() {
    var o = {};
    copyState(this, o);
    this.aStack_.push(o);
    this.mStack_.push(this.m_);
    this.m_ = matrixMultiply(createMatrixIdentity(), this.m_);
  };

  contextPrototype.restore = function() {
    if (this.aStack_.length) {
      copyState(this.aStack_.pop(), this);
      this.m_ = this.mStack_.pop();
    }
  };

  function matrixIsFinite(m) {
    return isFinite(m[0][0]) && isFinite(m[0][1]) &&
        isFinite(m[1][0]) && isFinite(m[1][1]) &&
        isFinite(m[2][0]) && isFinite(m[2][1]);
  }

  function setM(ctx, m, updateLineScale) {
    if (!matrixIsFinite(m)) {
      return;
    }
    ctx.m_ = m;

    if (updateLineScale) {
      // Get the line scale.
      // Determinant of this.m_ means how much the area is enlarged by the
      // transformation. So its square root can be used as a scale factor
      // for width.
      var det = m[0][0] * m[1][1] - m[0][1] * m[1][0];
      ctx.lineScale_ = sqrt(abs(det));
    }
  }

  contextPrototype.translate = function(aX, aY) {
    var m1 = [
      [1,  0,  0],
      [0,  1,  0],
      [aX, aY, 1]
    ];

    setM(this, matrixMultiply(m1, this.m_), false);
  };

  contextPrototype.rotate = function(aRot) {
    var c = mc(aRot);
    var s = ms(aRot);

    var m1 = [
      [c,  s, 0],
      [-s, c, 0],
      [0,  0, 1]
    ];

    setM(this, matrixMultiply(m1, this.m_), false);
  };

  contextPrototype.scale = function(aX, aY) {
    this.arcScaleX_ *= aX;
    this.arcScaleY_ *= aY;
    var m1 = [
      [aX, 0,  0],
      [0,  aY, 0],
      [0,  0,  1]
    ];

    setM(this, matrixMultiply(m1, this.m_), true);
  };

  contextPrototype.transform = function(m11, m12, m21, m22, dx, dy) {
    var m1 = [
      [m11, m12, 0],
      [m21, m22, 0],
      [dx,  dy,  1]
    ];

    setM(this, matrixMultiply(m1, this.m_), true);
  };

  contextPrototype.setTransform = function(m11, m12, m21, m22, dx, dy) {
    var m = [
      [m11, m12, 0],
      [m21, m22, 0],
      [dx,  dy,  1]
    ];

    setM(this, m, true);
  };

  /**
   * The text drawing function.
   * The maxWidth argument isn't taken in account, since no browser supports
   * it yet.
   */
  contextPrototype.drawText_ = function(text, x, y, maxWidth, stroke) {
    var m = this.m_,
        delta = 1000,
        left = 0,
        right = delta,
        offset = {x: 0, y: 0},
        lineStr = [];

    var fontStyle = getComputedStyle(processFontStyle(this.font),
                                     this.element_);

    var fontStyleString = buildStyle(fontStyle);

    var elementStyle = this.element_.currentStyle;
    var textAlign = this.textAlign.toLowerCase();
    switch (textAlign) {
      case 'left':
      case 'center':
      case 'right':
        break;
      case 'end':
        textAlign = elementStyle.direction == 'ltr' ? 'right' : 'left';
        break;
      case 'start':
        textAlign = elementStyle.direction == 'rtl' ? 'right' : 'left';
        break;
      default:
        textAlign = 'left';
    }

    // 1.75 is an arbitrary number, as there is no info about the text baseline
    switch (this.textBaseline) {
      case 'hanging':
      case 'top':
        offset.y = fontStyle.size / 1.75;
        break;
      case 'middle':
        break;
      default:
      case null:
      case 'alphabetic':
      case 'ideographic':
      case 'bottom':
        offset.y = -fontStyle.size / 2.25;
        break;
    }

    switch(textAlign) {
      case 'right':
        left = delta;
        right = 0.05;
        break;
      case 'center':
        left = right = delta / 2;
        break;
    }

    var d = getCoords(this, x + offset.x, y + offset.y);

    lineStr.push('<g_vml_:line from="', -left ,' 0" to="', right ,' 0.05" ',
                 ' coordsize="100 100" coordorigin="0 0"',
                 ' filled="', !stroke, '" stroked="', !!stroke,
                 '" style="position:absolute;width:1px;height:1px;">');

    if (stroke) {
      appendStroke(this, lineStr);
    } else {
      // TODO: Fix the min and max params.
      appendFill(this, lineStr, {x: -left, y: 0},
                 {x: right, y: fontStyle.size});
    }

    var skewM = m[0][0].toFixed(3) + ',' + m[1][0].toFixed(3) + ',' +
                m[0][1].toFixed(3) + ',' + m[1][1].toFixed(3) + ',0,0';

    var skewOffset = mr(d.x / Z) + ',' + mr(d.y / Z);

    lineStr.push('<g_vml_:skew on="t" matrix="', skewM ,'" ',
                 ' offset="', skewOffset, '" origin="', left ,' 0" />',
                 '<g_vml_:path textpathok="true" />',
                 '<g_vml_:textpath on="true" string="',
                 encodeHtmlAttribute(text),
                 '" style="v-text-align:', textAlign,
                 ';font:', encodeHtmlAttribute(fontStyleString),
                 '" /></g_vml_:line>');

    this.element_.insertAdjacentHTML('beforeEnd', lineStr.join(''));
  };

  contextPrototype.fillText = function(text, x, y, maxWidth) {
    this.drawText_(text, x, y, maxWidth, false);
  };

  contextPrototype.strokeText = function(text, x, y, maxWidth) {
    this.drawText_(text, x, y, maxWidth, true);
  };

  contextPrototype.measureText = function(text) {
    if (!this.textMeasureEl_) {
      var s = '<span style="position:absolute;' +
          'top:-20000px;left:0;padding:0;margin:0;border:none;' +
          'white-space:pre;"></span>';
      this.element_.insertAdjacentHTML('beforeEnd', s);
      this.textMeasureEl_ = this.element_.lastChild;
    }
    var doc = this.element_.ownerDocument;
    this.textMeasureEl_.innerHTML = '';
    this.textMeasureEl_.style.font = this.font;
    // Don't use innerHTML or innerText because they allow markup/whitespace.
    this.textMeasureEl_.appendChild(doc.createTextNode(text));
    return {width: this.textMeasureEl_.offsetWidth};
  };

  /******** STUBS ********/
  contextPrototype.clip = function() {
    // TODO: Implement
  };

  contextPrototype.arcTo = function() {
    // TODO: Implement
  };

  contextPrototype.createPattern = function(image, repetition) {
    return new CanvasPattern_(image, repetition);
  };

  // Gradient / Pattern Stubs
  function CanvasGradient_(aType) {
    this.type_ = aType;
    this.x0_ = 0;
    this.y0_ = 0;
    this.r0_ = 0;
    this.x1_ = 0;
    this.y1_ = 0;
    this.r1_ = 0;
    this.colors_ = [];
  }

  CanvasGradient_.prototype.addColorStop = function(aOffset, aColor) {
    aColor = processStyle(aColor);
    this.colors_.push({offset: aOffset,
                       color: aColor.color,
                       alpha: aColor.alpha});
  };

  function CanvasPattern_(image, repetition) {
    assertImageIsValid(image);
    switch (repetition) {
      case 'repeat':
      case null:
      case '':
        this.repetition_ = 'repeat';
        break
      case 'repeat-x':
      case 'repeat-y':
      case 'no-repeat':
        this.repetition_ = repetition;
        break;
      default:
        throwException('SYNTAX_ERR');
    }

    this.src_ = image.src;
    this.width_ = image.width;
    this.height_ = image.height;
  }

  function throwException(s) {
    throw new DOMException_(s);
  }

  function assertImageIsValid(img) {
    if (!img || img.nodeType != 1 || img.tagName != 'IMG') {
      throwException('TYPE_MISMATCH_ERR');
    }
    if (img.readyState != 'complete') {
      throwException('INVALID_STATE_ERR');
    }
  }

  function DOMException_(s) {
    this.code = this[s];
    this.message = s +': DOM Exception ' + this.code;
  }
  var p = DOMException_.prototype = new Error;
  p.INDEX_SIZE_ERR = 1;
  p.DOMSTRING_SIZE_ERR = 2;
  p.HIERARCHY_REQUEST_ERR = 3;
  p.WRONG_DOCUMENT_ERR = 4;
  p.INVALID_CHARACTER_ERR = 5;
  p.NO_DATA_ALLOWED_ERR = 6;
  p.NO_MODIFICATION_ALLOWED_ERR = 7;
  p.NOT_FOUND_ERR = 8;
  p.NOT_SUPPORTED_ERR = 9;
  p.INUSE_ATTRIBUTE_ERR = 10;
  p.INVALID_STATE_ERR = 11;
  p.SYNTAX_ERR = 12;
  p.INVALID_MODIFICATION_ERR = 13;
  p.NAMESPACE_ERR = 14;
  p.INVALID_ACCESS_ERR = 15;
  p.VALIDATION_ERR = 16;
  p.TYPE_MISMATCH_ERR = 17;

  // set up externs
  G_vmlCanvasManager = G_vmlCanvasManager_;
  CanvasRenderingContext2D = CanvasRenderingContext2D_;
  CanvasGradient = CanvasGradient_;
  CanvasPattern = CanvasPattern_;
  DOMException = DOMException_;
})();
/*
*webshims-Extensions 
*/
jQuery.webshims.ready('es5', function($, webshims, window, doc){
	if (!doc.styleSheets || !doc.namespaces){
		return;
	}
	
	webshims.defineNodeNameProperty('canvas', 'getContext', {
		value: function(ctxName){
			if(!this.getContext){
				G_vmlCanvasManager.initElement(this);
			}
			return this.getContext(ctxName);
		}
	});
			
	webshims.addReady(function(context, elem){
		if(doc === context){return;}
		$('canvas', context).add(elem.filter('canvas')).each(function(){
			if(!this.getContext){
				G_vmlCanvasManager.initElement(this);
			}
		});
	});
	$(function(){
		setTimeout(function(){
			webshims.isReady('canvas', true);
		}, 9);
	});
});
} // if
