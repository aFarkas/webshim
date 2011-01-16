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
		var handeld;
		var ret;
		var getSetData;
						
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
			getSetData = $.data(elem, '_polyfillblockProperty') || $.data(elem, '_polyfillblockProperty', {get: {}, set: {}, contentInit: {}});
			if(value === undefined){
				if(getSetData.get[name]){return;}
				getSetData.get[name] = true;
				ret = (desc.get) ? desc.get.call(elem) : desc.value;
				getSetData.get[name] = false;
				return ret;
			} else if(desc.set) {
				if(getSetData.set[name]){return;}
				getSetData.set[name] = true;
				if(elem.readyState === 'loading' && !getSetData.contentInit && !getSetData.get[name] && desc.get && value === webshims.contentAttr(elem, name)){
					getSetData.contentInit = true;
					value = desc.get.call(elem);
				}
				ret = desc.set.call(elem, value);
				handeld = true;
				getSetData.set[name] = false;
			}
		}
		if(!handeld){
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
	
	(function(){
		var preloadElem = document.createElement('span');
		var preloadStyle = preloadElem.style;
		var preloaded = {};
		
		var processPreload = function(preload){
			preload.props.forEach(function(htcFile){
				if(preloaded[htcFile]){return;}
				preloaded[htcFile] = true;
				preloadStyle.behavior += ', '+htcFile;
				if(preload.feature && preloadElem.readyState != 'complete'){
					webshims.waitReady(preload.feature);
					$(preloadElem).one('readystatechange', function(){
						webshims.unwaitReady(preload.feature);
					});
				}
			});
		};
//		webshims.preloadHTCs.forEach(processPreload);
		webshims.preloadHTCs = {push: processPreload};
	})();
	
	// resetting properties with magic content attributes
	var initProp = (function(){
		var nodeNameCache = {};
		var initProps = {};
		
		var isReady;
		webshims.addReady(function(context, contextElem){
			var getElementsByName = function(name){
				if(!nodeNameCache[name]){
					nodeNameCache[name] = $(context.getElementsByTagName(name));
					if(contextElem[0] && $.nodeName(contextElem[0], name)){
						nodeNameCache[name] = nodeNameCache[name].add(contextElem);
					}
				}
			};
			nodeNameCache = {};
			
			$.each(initProps, function(name, fns){
				getElementsByName(name);
				fns.forEach(function(fn){
					nodeNameCache[name].each(fn);
				});
			});
			isReady = true;
		});
		

		var createNodeNameInit = function(nodeName, fn){
			if(!initProps[nodeName]){
				initProps[nodeName] = [fn];
			} else {
				initProps[nodeName].push(fn);
			}
			if(isReady){
				nodeNameCache[nodeName] = nodeNameCache[nodeName] || $( document.getElementsByTagName(nodeName) );
				nodeNameCache[nodeName].each(fn);
			}
		};
		
		var elementExtends = {};
		var loadedDHTMLFiles = {};
		return {
			extend: function(nodeName, prop, desc){
				if(!elementExtends[prop]){
					elementExtends[prop] = 0;
				}
				elementExtends[prop]++;
				createNodeNameInit(nodeName, function(){
					transformDescriptor(this, prop, desc, '_sup'+ prop + elementExtends[prop]);
					webshims.defineProperty(this, prop, desc);
				});
			},
			extendDHTML: function(nodeName, htcFile, prop, feature){
				webshims.preloadHTCs.push({feature: feature, props: [htcFile]});
				if(!loadedDHTMLFiles[nodeName]){
					loadedDHTMLFiles[nodeName] = '';
				}
				if(loadedDHTMLFiles[nodeName].indexOf(htcFile) != -1){return;}
				loadedDHTMLFiles[nodeName] += htcFile;
				createNodeNameInit(nodeName, function(){
					var behavior = this.style.behavior;
					this.style.behavior += behavior ? ', '+htcFile : htcFile;
				});
			},
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
	
	
	var transformDescriptor = function(proto, prop, desc, elementID){
		var oDesc;
		
		var getSup = function(descriptor, accessType){
			if(descriptor && descriptor[accessType]){
				return descriptor[accessType];
			}
			
			if(descriptor.value !== undefined){
				//if original is a value, but we use an accessor
				if(accessType == 'set'){
					return(elementID) ? function(val){$.data(proto, elementID).value = val;} : function(val){descriptor.value = val;};
				}
				if(accessType == 'get'){
					return (elementID) ? function(){return $.data(proto, elementID).value;} : function(){return descriptor.value;};
				}
			}
			return function(value){
				return webshims.contentAttr(this, prop, value);
			};
		};
		
		if(proto && prop){
			
			while(proto && prop in proto && !has.call(proto, prop)){
				proto = webshims.getPrototypeOf(proto);
			}
			
			oDesc = webshims.getOwnPropertyDescriptor(proto, prop) || {configurable: true};
			
			if(!oDesc.configurable && !oDesc.writeable){return false;}
			if(elementID){
				$.data(proto, elementID, oDesc);
			}
			if(desc.get){
				desc._supget = getSup(oDesc, 'get');
			}
			if(desc.set){
				desc._supset = getSup(oDesc, 'set');
			}
			if(desc.value || oDesc.value !== undefined){
				desc._supvalue = oDesc.value;
			}
		}
		
		if(desc.value === undefined){
			if(!desc.set){
				desc.set =  desc._supset || (!desc.writeable) ? function(){throw(prop +'is readonly on '+ this.nodeName);} : getSup(desc, 'set');
			}
			if(!desc.get){
				desc.get = desc._supget || getSup(desc, 'get');
			}
		}
		
		
		return true;
	};
	
	$.extend(webshims, {
		waitReady: function(name){
			webshims.waitReadys[name] = webshims.waitReadys[name] || 0;
			webshims.waitReadys[name]++;
		},
		unwaitReady: function(name){
			webshims.waitReadys[name] = webshims.waitReadys[name] || 1;
			webshims.waitReadys[name]--;
			if(webshims.waitReadys[name+'ReadyCall'] && !webshims.waitReadys[name]){
				webshims.isReady(name, true);
			}
		},
		defineNodeNameProperty: function(nodeName, prop, desc, extend, htc, feature){
			desc = $.extend({writeable: true}, desc);
			var oDesc;
			var extendedNative = false;
			var htcHandled;
			if(webshims.cfg.extendNative && extend){
				(function(){
					var element = document.createElement(nodeName);
					if(support.objectAccessor && support.contentAttr && unknown){
						//ToDo extend property on all elements
						
						var proto  = webshims.getPrototypeOf(element);
						
						
						
						//extend property on unknown elements
						if(unknown === proto){
							initProp.extend(nodeName, prop, desc);
							extendedNative = true;
							return;
						}
						
						//extend unknown property on known elements prototype
						if(!(prop in element)){
							transformDescriptor(false, false, desc);
							webshims.defineProperty(proto, prop, desc);
							extendedNative = true;
							return;
						}
						//extend known property on element itself
						if(has.call(element, prop)){
							oDesc = webshims.getOwnPropertyDescriptor(element, prop);
							
							//abort can not extend native!
							if(!oDesc.configurable){return;}
							
							initProp.extend(nodeName, prop, desc);
							extendedNative = true;
							return;
						}
						
						//abort can not extend native!
						if(!transformDescriptor(proto, prop, desc)){return;}
						//extend known property on known elements prototype
						webshims.defineProperty(proto, prop, desc);
						extendedNative = true;
						return;
					} else if(desc.value !== undefined){
						initProp.extend(nodeName, prop, desc);
						extendedNative = true;
						return;
					} 
					if(htc && support.dhtmlBehavior && !(prop in element)){
						extendedNative = true;
						htcHandled = true;
						extendQAttr(nodeName, prop, desc);
						initProp.extendDHTML(nodeName, 'url('+webshims.loader.makePath( 'htc/'+ (typeof htc == 'string' ? htc : prop) +'.htc') +')' , prop, feature);
						return;
					}
				})();
			}
			if(!extendedNative){
				if(extend && webshims.cfg.extendNative){
					webshims.log("could not extend "+ nodeName +"["+ prop +"] fallback to jQuery extend");
				}
				extendQAttr(nodeName, prop, desc);
			}
			if(!htcTest && webshims.debug && extend && webshims.cfg.extendNative && htc){
				htcTest = true;
				$.ajax({
					url: webshims.loader.makePath( 'htc/'+ (typeof htc == 'string' ? htc : prop) +'.htc'),
					complete: function(xhr){
						if(xhr.getResponseHeader){
							var type = xhr.getResponseHeader('Content-Type') || '';
							if(type != 'text/x-component'){
								webshims.warn('content-type of htc-files should be "text/x-component", but was "'+ type +'"');
								webshims.info('you should also let the client cache htc-files. use a proper expire header for htc-files');
							}
							if(type.indexOf('text/') !== 0){
								webshims.warn('Error: content-type of htc-files is not text, this can not work in IE');
							}
						}
					}
				});
			}
			if((desc.contentAttr && !htcHandled) || desc.init){
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
});//todo use $.globalEval?
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
	
	webshims.isReady('form-core', true);
});



jQuery.webshims.ready('form-core dom-extend', function($, webshims, window, doc, undefined){
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
						message = (support.validationMessage && desc._supget) ? desc._supget.call(elem) : $.data(elem, 'customvalidationMessage');
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
});jQuery.webshims.ready('form-message form-core', function($, webshims, window, doc, undefined){
//	"use strict";
	var support = $.support;
	if(!support.validity){return;}
		
	var typeModels = webshims.inputTypes;
	var validityRules = {};
	
	webshims.addInputType = function(type, obj){
		typeModels[type] = obj;
	};
	
	webshims.addValidityRule = function(type, fn){
		validityRules[type] = fn;
	};
	
	webshims.addValidityRule('typeMismatch',function (input, val, cache, validityState){
		if(val === ''){return false;}
		var ret = validityState.typeMismatch;
		if(!('type' in cache)){
			cache.type = (input[0].getAttribute('type') || '').toLowerCase();
		}
		
		if(typeModels[cache.type] && typeModels[cache.type].mismatch){
			ret = typeModels[cache.type].mismatch(val, input);
		}
		return ret;
	});
	
	var overrideNativeMessages = webshims.overrideValidationMessages;	
	var overrideValidity = (!support.requiredSelect || !support.numericDateProps || overrideNativeMessages);
	var validityProps = ['customError','typeMismatch','rangeUnderflow','rangeOverflow','stepMismatch','tooLong','patternMismatch','valueMissing','valid'];
	var oldAttr = $.attr;
	var oldVal = $.fn.val;
	var validityChanger = (overrideNativeMessages)? {value: 1, checked: 1} : {value: 1};
	var validityElements = (overrideNativeMessages) ? ['textarea'] : [];
	var checkTypes = {radio:1,checkbox:1};
	var testValidity = function(elem, init){
		if(!elem.form){return;}
		var type = (elem.getAttribute && elem.getAttribute('type') || elem.type || '').toLowerCase();
		
		if(!overrideNativeMessages){
			if(!(!support.requiredSelect && type == 'select-one') && !typeModels[type]){return;}
		}
		
		if(overrideNativeMessages && !init && checkTypes[type] && elem.name){
			$(doc.getElementsByName( elem.name )).each(function(){
				$.attr(this, 'validity');
			});
		} else {
			$.attr(elem, 'validity');
		}
	};
	
	
	webshims.defineNodeNamesProperty(['input', 'textarea', 'select'], 'setCustomValidity', {
		value: function(error){
			error = error+'';
			this.setCustomValidity(error);
			if(overrideValidity){
				$.data(this, 'hasCustomError', !!(error));
				testValidity(this);
			}
		}
	});
		
	if((!window.noHTMLExtFixes && !support.requiredSelect) || overrideNativeMessages){
		$.extend(validityChanger, {
			required: 1,
			size: 1,
			multiple: 1,
			selectedIndex: 1
		});
		validityElements.push('select');
	}
	if(!support.numericDateProps || overrideNativeMessages){
		$.extend(validityChanger, {
			min: 1, max: 1, step: 1
		});
		validityElements.push('input');
	}
	
	
	if(overrideValidity){
		
		validityElements.forEach(function(nodeName){
			
			var oldDesc = webshims.defineNodeNameProperty(nodeName, 'validity', {
				get: function(){
					var elem = this;
					var validity = oldDesc._supget.call(this);
					if(!validity){
						return validity;
					}
					var validityState = {};
					validityProps.forEach(function(prop){
						validityState[prop] = validity[prop];
					});
					
					if( !$.attr(elem, 'willValidate') ){
						return validityState;
					}
					var jElm 			= $(elem),
						cache 			= {type: (elem.getAttribute && elem.getAttribute('type') || '').toLowerCase(), nodeName: (elem.nodeName || '').toLowerCase()},
						val				= oldVal.call(jElm),
						customError 	= !!($.data(elem, 'hasCustomError')),
						setCustomMessage
					;
					
					validityState.customError = customError;
										
					if( validityState.valid && validityState.customError ){
						validityState.valid = false;
					} else if(!validityState.valid) {
						var allFalse = true;
						$.each(validityState, function(name, prop){
							if(prop){
								allFalse = false;
								return false;
							}
						});
						
						if(allFalse){
							validityState.valid = true;
						}
						
					}
					
					$.each(validityRules, function(rule, fn){
						validityState[rule] = fn(jElm, val, cache, validityState);
						if( validityState[rule] && (validityState.valid || (!setCustomMessage && overrideNativeMessages)) ) {
							elem.setCustomValidity(webshims.createValidationMessage(elem, rule));
							validityState.valid = false;
							setCustomMessage = true;
						}
					});
					if(validityState.valid){
						elem.setCustomValidity('');
					}
					return validityState;
				},
				set: $.noop
				
			}, true);
		});
							
		$.fn.val = function(val){
			var ret = oldVal.apply(this, arguments);
			this.each(function(){
				testValidity(this);
			});
			return ret;
		};
		
		$.attr = function(elem, prop, value){
			var ret = oldAttr.apply(this, arguments);
			if(validityChanger[prop] && value !== undefined && elem.form){
				testValidity(elem);
			}
			return ret;
		};
		
		if(doc.addEventListener){
			doc.addEventListener('change', function(e){
				testValidity(e.target);
			}, true);
			if (!support.numericDateProps) {
				doc.addEventListener('input', function(e){
					testValidity(e.target);
				}, true);
			}
		}
		
		var validityElementsSel = validityElements.join(',');		
		webshims.addReady(function(context, elem){
			$(validityElementsSel, context).add(elem.filter(validityElementsSel)).attr('validity');
		});
		
	} //end: overrideValidity -> (!supportRequiredSelect || !supportNumericDate || overrideNativeMessages)
	webshims.isReady('form-extend', true);
});/* https://github.com/aFarkas/webshim/issues#issue/16 */
jQuery.webshims.ready('dom-extend', function($, webshims, window, doc, undefined){
	var support = $.support;
	
	if(!support.validity || window.noHTMLExtFixes){return;}
	
	
	var advancedForm = ( 'value' in doc.createElement('output') && 'list' in doc.createElement('input') ),
		invalids = [],
		form
	;
	
	//opera/chrome fix (this will double all invalid events, we have to stop them!)
	//opera throws a submit-event and then the invalid events,
	//chrome7/safari5.02 has disabled invalid events, this brings them back
	//safari 5.02 reports false invalid events, if setCustomValidity was used
	if(window.addEventListener){
		var formnovalidate = {
			timer: undefined,
			prevented: false
		};
		window.addEventListener('submit', function(e){
			if(!formnovalidate.prevented && e.target.checkValidity && $.attr(e.target, 'novalidate') == null){
				$(e.target).checkValidity();
			}
		}, true);
		var preventValidityTest = function(e){
			if($.attr(e.target, 'formnovalidate') == null){return;}
			if(formnovalidate.timer){
				clearTimeout(formnovalidate.timer);
			}
			formnovalidate.prevented = true;
			formnovalidate.timer = setTimeout(function(){
				formnovalidate.prevented = false;
			}, 20);
		};
		window.addEventListener('click', preventValidityTest, true);
		window.addEventListener('touchstart', preventValidityTest, true);
		window.addEventListener('touchend', preventValidityTest, true);
	}
	
	$(document)
		.bind('firstinvalid', function(e){
			form = e.target.form;
			if(!form){return;}
			var submitEvents = $(form)
				.unbind('submit.preventInvalidSubmit')
				.bind('submit.preventInvalidSubmit', function(submitEvent){
					if( $.attr(form, 'novalidate') == null ){
						submitEvent.stopImmediatePropagation();
						return false;
					}
				})
				.data('events').submit
			;
			//add this handler as first executing handler
			if (submitEvents && submitEvents.length > 1) {
				submitEvents.unshift(submitEvents.pop());
			}
		})
		.bind('invalid', function(e){
			if(invalids.indexOf(e.target) == -1){
				invalids.push(e.target);
			} else {
				e.stopImmediatePropagation();
			}
		})
		.bind('lastinvalid', function(e, data){
			var firstTarget = data.invalidlist[0];
			if( firstTarget && !advancedForm && document.activeElement && firstTarget !== document.activeElement && !$.data(firstTarget, 'maybePreventedinvalid') ){
				webshims.validityAlert.showFor(firstTarget);
			}
			invalids = [];
			//remove webkit/operafix
			if(!form){return;}
			$(form).unbind('submit.preventInvalidSubmit');
		})
	;
		
	(function(){
		//safari 5.0.2/5.0.3 has serious issues with checkValidity in combination with setCustomValidity so we mimic checkValidity using validity-property (webshims.fix.checkValidity)
		if(!$.browser.webkit || parseInt($.browser.version, 10) > 533){return;}
		var checkValidity = function(elem){
			var valid = ($.attr(elem, 'validity') || {valid: true}).valid;
			if(!valid && elem.checkValidity && elem.checkValidity()){
				$(elem).trigger('invalid');
			}			
			return valid;
		};
		
		webshims.defineNodeNamesProperty(['input', 'textarea', 'select', 'form'], 'checkValidity', {
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
	if(!support.requiredSelect){
		webshims.ready('form-extend', function(){
			webshims.defineNodeNamesBooleanProperty(['select'], 'required', {
				set: function(value){
					this.setAttribute('aria-required', (value) ? 'true' : 'false');
				},
				contentAttr: true
			}, true);
			
			webshims.addValidityRule('valueMissing', function(jElm, val, cache, validityState){
				
				if(cache.nodeName == 'select' && !val && jElm.attr('required') && jElm[0].size < 2){
					if(!cache.type){
						cache.type = jElm[0].type;
					}
					
					if(cache.type == 'select-one' && $('> option:first-child:not(:disabled)', jElm).attr('selected')){
						return true;
					}
				}
				return validityState.valueMissing;
			});
			//trigger validity test
			webshims.ready('DOM', function(){
				$('select[required]').attr('validity');
			});
		});
	}
});