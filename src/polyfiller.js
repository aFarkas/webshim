(function($, window, document, undefined){
	"use strict";
	
	var special = $.event.special;
	var emptyJ = $([]);
	var Modernizr = window.Modernizr;
	var modernizrInputAttrs = Modernizr.input;
	var modernizrInputTypes = Modernizr.inputtypes;
	var browserVersion = parseFloat($.browser.version, 10);
	var Object = window.Object;
	var defineProperty = 'defineProperty';
	var formvalidation = 'formvalidation';
	var addTest = Modernizr.addTest;
	var slice = Array.prototype.slice;
	
	//new Modernizrtests
	if(!('details' in Modernizr)){
		addTest('details', function(){
			return ('open' in document.createElement('details'));
		});
	}
	
	Modernizr.genericDOM = !!($('<video><div></div></video>')[0].innerHTML);
	
	Modernizr.advancedObjectProperties = Modernizr.objectAccessor = Modernizr.ES5 = !!('create' in Object && 'seal' in Object);
		
	
	if (!window.iepp && $.browser.msie && browserVersion < 9 && !$.isReady) {
		$.each(['datalist', 'source', 'video', 'audio', 'details', 'summary', 'canvas', 'output'], function(i, name){
			document.createElement(name);
		});
	}
	
	
	$.webshims = $.sub();
	
	$.extend($.webshims, {
		version: '1.8.2beta1',
		cfg: {
			useImportantStyles: true,
			//			removeFOUC: false,
			//			addCacheBuster: false,
			waitReady: true,
			extendNative: true,
			loader: {
				sssl: function(src, complete){
					sssl(src, complete);
				},
				require: function(src, complete){
					require([src], complete);
				},
				yepnope: function(src, complete){
					if (yepnope.injectJs) {
						yepnope.injectJs(src, complete);
					}
					else {
						yepnope({
							load: src,
							callback: complete
						});
					}
				}
			},
			comboOptions: {
				seperator: ',',
				base: '/min/f=',
				maxFiles: 10,
				
				fn: function(base, scriptPath, seperator, srces){
					return base +
					$.map(srces, function(src){
						return scriptPath + src;
					}).join(seperator);
				}
			},
			basePath: (function(){
				var script = $('script').filter('[src*="polyfiller.js"]');
				var path;
				script = script[0] || script.end()[script.end().length - 1];
				path = ( ($.support.hrefNormalized) ? script.src : script.getAttribute("src", 4) ).split('?')[0];
				path = path.slice(0, path.lastIndexOf("/") + 1) + 'shims/';
				return path;
			})()
		},
		browserVersion: browserVersion,
		/*
		 * some data
		 */
		modules: {},
		features: {},
		featureList: [],
		profiles: {
			lightweight: ['es5', 'json-storage', 'canvas', 'geolocation', 'forms']
		},
		setOptions: function(name, opts){
			if (typeof name == 'string' && opts !== undefined) {
				webCFG[name] = (!$.isPlainObject(opts)) ? opts : $.extend(true, webCFG[name] || {}, opts);
				
			}
			else 
				if (typeof name == 'object') {
					$.extend(true, webCFG, name);
				}
		},
		addPolyfill: function(name, cfg){
			cfg = cfg || {};
			var feature = cfg.feature || name;
			if (!webshimsFeatures[feature]) {
				webshimsFeatures[feature] = [];
				webshims.featureList.push(feature);
				webCFG[feature] = {};
			}
			webshimsFeatures[feature].push(name);
			cfg.options = $.extend(webCFG[feature], cfg.options);
			
			addModule(name, cfg);
			if (cfg.methodNames) {
				$.each(cfg.methodNames, function(i, methodName){
					webshims.addMethodName(methodName);
				});
			}
		},
		
		polyfill: (function(){
			var firstPolyfillCall = function(features){
				var addClass = [];
				var onReadyEvts = features;
				var timer;
				
				
				var removeLoader = function(){
					if($('html').hasClass('long-loading-polyfills')){
						webshims.warn('Polyfilling takes a little bit long');
					}
					$('html').removeClass('loading-polyfills long-loading-polyfills');
					$(window).unbind('.lP');
					clearTimeout(timer);
				};
				
				if (!$.isReady) {
					
					addClass.push('loading-polyfills');
					$(window).bind('load.lP polyfillloaderror.lP  error.lP', removeLoader);
					timer = setTimeout(function(){
						$('html').addClass('long-loading-polyfills');
					}, 600);
					
				} else {
					webshims.warn('You should call $.webshims.polyfill before DOM-Ready');
				}
				onReady(features, removeLoader);
				if (webCFG.useImportantStyles) {
					addClass.push('polyfill-important');
				}
				if (addClass[0]) {
					$('html').addClass(addClass.join(' '));
				}
				
				loader.loadCSS('styles/shim.css');
				//remove function
				firstPolyfillCall = $.noop;
			};
			
			return function(features, combo){
				if (features && (features === true || $.isPlainObject(features))) {
					combo = features;
					features = undefined;
				}
				var toLoadFeatures = [];
				
				features = features || webshims.featureList;
				
				if (typeof features == 'string') {
					features = webshims.profiles[features] || features.split(' ');
				}
				
				if (webCFG.waitReady) {
					$.readyWait++;
					onReady(features, function(){
						$.ready(true);
					});
				}
				
				$.each(features, function(i, feature){
					if(!webshimsFeatures[feature]){
						webshims.warn("could not find webshims-feature (aborted): "+ feature);
						isReady(feature, true);
						return;
					}
					if (feature !== webshimsFeatures[feature][0]) {
						onReady(webshimsFeatures[feature], function(){
							isReady(feature, true);
						});
					}
					toLoadFeatures = toLoadFeatures.concat(webshimsFeatures[feature]);
				});
				
				firstPolyfillCall(features);
				loadList(toLoadFeatures, combo);
				
			};
		})(),
		
		/*
		 * handle ready modules
		 */
		isReady: function(name, _set){
		
			name = name + 'Ready';
			if (_set) {
				if (special[name] && special[name].add) {
					return true;
				}
				
				special[name] = $.extend(special[name] || {}, {
					add: function(details){
						details.handler.call(this, name);
					}
				});
				$.event.trigger(name);
			}
			return !!(special[name] && special[name].add) || false;
		},
		ready: function(events, fn /*, _created*/){
			var _created = arguments[2];
			var evt = events;
			if (typeof events == 'string') {
				events = events.split(' ');
			}
			
			if (!_created) {
				events = $.map($.grep(events, function(evt){
					return !isReady(evt);
				}), function(evt){
					return evt + 'Ready';
				});
			}
			if (!events.length) {
				fn($, webshims, window, document);
				return;
			}
			var readyEv = events.shift(), readyFn = function(){
				onReady(events, fn, true);
			};
			
			$(document).one(readyEv, readyFn);
		},
		
		/*
		 * basic DOM-/jQuery-Helpers
		 */
		
		fixHTML5: function(h){
			return h;
		},
		capturingEvents: function(names, _maybePrevented){
			if (!document.addEventListener) {
				return;
			}
			if (typeof names == 'string') {
				names = [names];
			}
			$.each(names, function(i, name){
				var handler = function(e){
					e = $.event.fix(e);
					if (_maybePrevented && !e._isPolyfilled) {
						var isDefaultPrevented = e.isDefaultPrevented;
						var preventDefault = e.preventDefault;
						e.preventDefault = function(){
							clearTimeout($.data(e.target, e.type + 'DefaultPrevented'));
							$.data(e.target, e.type + 'DefaultPrevented', setTimeout(function(){
								$.removeData(e.target, e.type + 'DefaultPrevented');
							}, 30));
							return preventDefault.apply(this, arguments);
						};
						e.isDefaultPrevented = function(){
							return !!(isDefaultPrevented.apply(this, arguments) || $.data(e.target, e.type + 'DefaultPrevented') || false);
						};
						e._isPolyfilled = true;
					}
					return $.event.handle.call(this, e);
				};
				special[name] = special[name] || {};
				if (special[name].setup || special[name].teardown) {
					return;
				}
				$.extend(special[name], {
					setup: function(){
						this.addEventListener(name, handler, true);
					},
					teardown: function(){
						this.removeEventListener(name, handler, true);
					}
				});
			});
		},
		register: function(name, fn){
			var module = modules[name];
			if (!module) {
				webshims.warn("can't find module: " + name);
				return;
			}
			if (module.noAutoCallback) {
				var ready = function(){
					fn($, webshims, window, document, undefined, module.options);
					isReady(name, true);
				};
				if (module.dependencies) {
					onReady(module.dependencies, ready);
				}
				else {
					ready();
				}
			}
		},
		
		/*
		 * loader
		 */
		loader: {
		
			addModule: function(name, ext){
				modules[name] = ext;
				ext.name = ext.name || name;
			},
			
			loadList: (function(){
			
				var loadedModules = [];
				
				var loadScript = function(src, names){
					if (typeof names == 'string') {
						names = [names];
					}
					$.merge(loadedModules, names);
					loader.loadScript(src, false, names);
				};
				
				var noNeedToLoad = function(name, list){
					if (isReady(name) || $.inArray(name, loadedModules) != -1) {
						return true;
					}
					var module = modules[name];
					var cfg = webCFG[module.feature || name] || {};
					var supported;
					if (module) {
						supported = (module.test && $.isFunction(module.test)) ? module.test(list) : module.test;
						if (supported) {
							isReady(name, true);
							return true;
						}
						else {
							return false;
						}
					}
					return true;
				};
				
				var setDependencies = function(module, list){
					if (module.dependencies && module.dependencies.length) {
						var addDependency = function(i, dependency){
							if (!noNeedToLoad(dependency, list) && $.inArray(dependency, list) == -1) {
								list.push(dependency);
							}
						};
						$.each(module.dependencies, function(i, dependeny){
							if (modules[dependeny]) {
								addDependency(i, dependeny);
							}
							else 
								if (webshimsFeatures[dependeny]) {
									$.each(webshimsFeatures[dependeny], addDependency);
									onReady(webshimsFeatures[dependeny], function(){
										isReady(dependeny, true);
									});
								}
						});
						if (!module.noAutoCallback) {
							module.noAutoCallback = true;
						}
					}
				};
				
				var excludeCombo = /\.\/|\/\//;
				var loadAsCombo = function(toLoad, combo){
					var fPart = [];
					var combiNames = [];
					var len = 0;
					
					combo = $.extend({}, webCFG.comboOptions, typeof combo == 'object' ? combo : {});
					
					$.each(toLoad, function(i, loadName){
						if ($.inArray(loadName, loadedModules) == -1) {
							var src = (modules[loadName].src || loadName);
							
							if (src.indexOf('.') == -1) {
								src += '.js';
							}
							if (!excludeCombo.test(src)) {
								len++;
								fPart.push(src);
								combiNames.push(loadName);
								if (len >= combo.maxFiles || (len > 9 && fPart.join(',,,,').length > 200)) {
									loadScript(combo.fn(combo.base, combo.scriptPath, combo.seperator, fPart), combiNames);
									fPart = [];
									combiNames = [];
									len = 0;
								}
							}
							else {
								loadScript(src, loadName);
							}
						}
					});
					if (fPart.length) {
						loadScript(combo.fn(combo.base, combo.scriptPath, combo.seperator, fPart), combiNames);
					}
				};
				
				return function(list, combo){
					var module;
					var loadCombos = [];
					//length of list is dynamically
					for (var i = 0; i < list.length; i++) {
						module = modules[list[i]];
						if (!module || noNeedToLoad(module.name, list)) {
							if (!module) {
								webshims.warn('could not find: ' + list[i]);
							}
							continue;
						}
						if (module.css) {
							loader.loadCSS(module.css);
						}
						
						if (module.loadInit) {
							module.loadInit();
						}
						module.loaded = true;
						setDependencies(module, list);
						if (combo) {
							loadCombos.push(module.name);
						}
						else {
							loadScript(module.src || module.name, module.name);
						}
					}
					if (combo) {
						loadAsCombo(loadCombos, combo);
					}
				};
			})(),
			
			makePath: function(src){
				if (src.indexOf('//') != -1 || src.indexOf('/') === 0) {
					return src;
				}
				
				if (src.indexOf('.') == -1) {
					src += '.js';
				}
				if (webCFG.addCacheBuster) {
					src += webCFG.addCacheBuster;
				}
				return webCFG.basePath + src;
			},
			
			loadCSS: (function(){
				var parent, loadedSrcs = [];
				return function(src){
					src = this.makePath(src);
					if ($.inArray(src, loadedSrcs) != -1) {
						return;
					}
					parent = parent || $('link, style')[0] || $('script')[0];
					loadedSrcs.push(src);
					$('<link rel="stylesheet" />').insertBefore(parent).attr({
						href: src
					});
				};
			})(),
			
			loadScript: (function(){
				var loadedSrcs = [];
				var scriptLoader;
				return function(src, callback, name){
				
					src = loader.makePath(src);
					if ($.inArray(src, loadedSrcs) != -1) {
						return;
					}
					var script = emptyJ;
					var errorTimer;
					var error = function(){
						$(window).triggerHandler('polyfillloaderror');
						webshims.warn('Error: could not find "' + src + '" | configure polyfill-path: $.webshims.setOptions("basePath", "path/to/shims-folder"');
						complete();
					};
					var complete = function(){
						clearTimeout(errorTimer);
						if(script && script[0]){
							script.unbind('error', error);
						}
						complete = null;
						error = null;
						script = null;
						if (callback) {
							callback();
						}
						
						if (name) {
							if (typeof name == 'string') {
								name = name.split(' ');
							}
							$.each(name, function(i, name){
								if (!modules[name]) {
									return;
								}
								if (modules[name].afterLoad) {
									modules[name].afterLoad();
								}
								isReady(!modules[name].noAutoCallback ? name : name + 'FileLoaded', true);
							});
							
						}
					};
					
					loadedSrcs.push(src);
					if (!scriptLoader) {
						$.each(webCFG.loader, function(name, fn){
							if (window[name]) {
								scriptLoader = fn;
								return false;
							}
						});
					}
					if (scriptLoader) {
						scriptLoader(src, complete);
						if (webshims.debug !== false) {
							setTimeout(function(){
								script = $('script[src="' + src + '"]').bind('error', error);
							}, 0);
							errorTimer = setTimeout(error, 15000);
						}
					}
					else {
						webshims.error("include a scriptloader: Modernizr.load/yepnope or requireJS");
					}
				};
			})()
		}
	});
	
	/*
	 * shortcuts
	 */
	var webshims = $.webshims;
	var protocol = (location.protocol == 'https:') ? 'https://' : 'http://';
	var googleAPIs = protocol + 'ajax.googleapis.com/ajax/libs/';
	var uiLib = googleAPIs + 'jqueryui/1.8.16/';
	var webCFG = webshims.cfg;
	var webshimsFeatures = webshims.features;
	var isReady = webshims.isReady;
	var onReady = webshims.ready;
	var addPolyfill = webshims.addPolyfill;
	var modules = webshims.modules;
	var loader = webshims.loader;
	var loadList = loader.loadList;
	var addModule = loader.addModule;
	var importantLogs = {
		warn: 1,
		error: 1
	};
	webshims.addMethodName = function(name){
		name = name.split(':');
		var prop = name[1];
		if (name.length == 1) {
			prop = name[0];
			name = name[0];
		} else {
			name = name[0];
		}
		
		$.fn[name] = function(){
			return this.callProp(prop, arguments);
		};
	};
	$.fn.callProp = function(prop, args){
		var ret;
		if(!args){
			args = args; 
		}
		this.each(function(){
			var fn = $.prop(this, prop);
			
			if (fn && fn.apply) {
				ret = fn.apply(this, args);
				if (ret !== undefined) {
					return false;
				}
			} else {
				webshims.warn(prop+ " is not a method of "+ this);
			}
		});
		return (ret !== undefined) ? ret : this;
	};
	
	var xhrPreloadOption = {
		cache: true,
		dataType: 'text',
		error: function(data, text){
			webshims.warn('error with: ' + this.url + ' | ' + text);
		}
	};
	webshims.xhrPreloadOption = xhrPreloadOption;
	
	//activeLang will be overridden

	
	//	set current Lang:
	//		- webshims.activeLang(lang:string);
	//	get current lang
	//		- webshims.activeLang();
	//		- webshims.activeLang({
	//			module: moduleName:string,
	//			callback: callback:function,
	//			langObj: languageObj:array/object
	//		});

	webshims.activeLang = (function(){
		var curLang = navigator.browserLanguage || navigator.language || '';
		onReady('webshimLocalization', function(){
			webshims.activeLang(curLang);
			
		});
		return function(lang){
			if(lang){
				if (typeof lang == 'string' ) {
					curLang = lang;
				} else if(typeof lang == 'object'){
					var args = arguments;
					var that = this;
					onReady('webshimLocalization', function(){
						webshims.activeLang.apply(that, args);
					});
				}
				loadList(['dom-extend']);
			}
			return curLang;
		};
	})();
	
	$.each(['log', 'error', 'warn', 'info'], function(i, fn){
		webshims[fn] = function(message){
			if(( (importantLogs[fn] && webshims.debug !== false) || webshims.debug) && window.console && console.log){
				return console[(console[fn]) ? fn : 'log'](message);
			}
		};
	});
		
	
	//Overwrite DOM-Ready and implement a new ready-method
	(function(){
		$.isDOMReady = $.isReady;
		if(!$.isDOMReady){
			var $Ready = $.ready;
			$.ready = function(unwait){
				if(unwait !== true && !$.isDOMReady){
					if(document.body){
						$.isDOMReady = true;
						isReady('DOM', true);
						$.ready = $Ready;
					} else {
						setTimeout(function(){
							$.ready(unwait);
						}, 13);
					}
				}
				return $Ready.apply(this, arguments);
			};
		} else {
			isReady('DOM', true);
		}
		$(window).load(function(){
			isReady('WINDOWLOAD', true);
		});
	})();
	
	/*
	 * jQuery-plugins for triggering dom updates can be also very usefull in conjunction with non-HTML5 DOM-Changes (AJAX)
	 * Example:
	 * $.webshims.addReady(function(context, insertedElement){
	 * 		$('div.tabs', context).add(insertedElement.filter('div.tabs')).tabs();
	 * });
	 * 
	 * $.ajax({
	 * 		success: function(html){
	 * 			$('#main').htmlWebshim(html);
	 * 		}
	 * });
	 */
	
	(function(){
		var readyFns = [];
		$.extend(webshims, {
			addReady: function(fn){
				var readyFn = function(context, elem){
					webshims.ready('DOM', function(){fn(context, elem);});
				};
				readyFns.push(readyFn);
				readyFn(document, emptyJ);
			},
			triggerDomUpdate: function(context){
				if(!context || !context.nodeType){
					if(context && context.jquery){
						context.each(function(){
							webshims.triggerDomUpdate(this);
						});
					}
					return;
				}
				var type = context.nodeType;
				if(type != 1 && type != 9){return;}
				var elem = (context !== document) ? $(context) : emptyJ;
				$.each(readyFns, function(i, fn){
					fn(context, elem);
				});
			}
		});
		
		$.fn.htmlWebshim = $.fn.htmlPolyfill = function(a){
			var ret = $.fn.html.call(this, (a) ? webshims.fixHTML5(a) : a);
			if(ret === this && $.isDOMReady){
				this.each(function(){
					if(this.nodeType == 1){
						webshims.triggerDomUpdate(this);
					}
				});
			}
			return ret;
		};
		
		
		if(webshims.fn) {
			webshims.fn.html = $.fn.htmlWebshim;
		}
		$.each(['after', 'before', 'append', 'prepend', 'replaceWith'], function(i, name){
			webshims.fn[name] = $.fn[name+'Polyfill'] = $.fn[name+'Webshim'] = function(a){
				var elems = $(webshims.fixHTML5(a));
				$.fn[name].call(this, elems);
				if($.isDOMReady){
					elems.each(function(){
						if (this.nodeType == 1) {
							webshims.triggerDomUpdate(this);
						}
					});
				}
				return this;
			};
			
		});
		
		$.each(['insertAfter', 'insertBefore', 'appendTo', 'prependTo', 'replaceAll'], function(i, name){
			webshims.fn[name] = $.fn[name.replace(/[A-Z]/, function(c){return "Polyfill"+c;})] = function(){
				$.fn[name].apply(this, arguments);
				webshims.triggerDomUpdate(this);
				return this;
			};
		});
		
		$.fn.updatePolyfill = function(){
			webshims.triggerDomUpdate(this);
			return this;
		};
		
		$.each(['getNativeElement', 'getShadowElement', 'getShadowFocusElement'], function(i, name){
			$.fn[name] = function(){
				return this;
			};
		});
		
	})();
	
	//this might be extended by ES5 shim feature
	(function(){
		var has = Object.prototype.hasOwnProperty;
		var descProps = ['configurable', 'enumerable', 'writable'];
		var extendUndefined = function(prop){
			for(var i = 0; i < 3; i++){
				if(prop[descProps[i]] === undefined && (descProps[i] !== 'writable' || prop.value !== undefined)){
					prop[descProps[i]] = true;
				}
			}
		};
		var extendProps = function(props){
			if(props){
				for(var i in props){
					if(has.call(props, i)){
						extendUndefined(props[i]);
					}
				}
			}
		};
		if(Object.create){
			webshims.objectCreate = function(proto, props, opts){
				extendProps(props);
				var o = Object.create(proto, props);
				if(opts){
					o.options = $.extend(true, {}, o.options  || {}, opts);
					opts = o.options;
				}
				if(o._create && $.isFunction(o._create)){
					o._create(opts);
				}
				return o;
			};
		}
		if(Object[defineProperty]){
			webshims[defineProperty] = function(obj, prop, desc){
				extendUndefined(desc);
				return Object[defineProperty](obj, prop, desc);
			};
		}
		if(Object.defineProperties){
			webshims.defineProperties = function(obj, props){
				extendProps(props);
				return Object.defineProperties(obj, props);
			};
		}
		webshims.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
		
		webshims.getPrototypeOf = Object.getPrototypeOf;
	})();
	
	

	
	/*
	 * Start Features 
	 */
	
	/* general modules */
	/* change path $.webshims.modules[moduleName].src */
	
	addModule('jquery-ui', {
		src: uiLib+'jquery-ui.min.js',
		test: function(){return !!($.widget && $.Widget);}
	});
	
	addModule('input-widgets', {
		src: '',
		test: function(){
			return !this.src || !($.widget && !($.fn.datepicker || $.fn.slider));
		}
	});
	
	addModule('swfobject', {
		src: googleAPIs+'swfobject/2.2/swfobject.js',
		test: function(){return ('swfobject' in window);}
	});
	
		
	/* 
	 * polyfill-Modules 
	 */
	
	// webshims lib uses a of http://github.com/kriskowal/es5-shim/ to implement
	addPolyfill('es5', {
		test: function(){
			//from https://raw.github.com/kriskowal/ added here instead of es5 shim, so iOS5 hasn't to load so much
			// ES-5 15.3.4.5
			// http://www.ecma-international.org/publications/files/drafts/tc39-2009-025.pdf
			
			if (!Function.prototype.bind) {
				var call = Function.prototype.call;
				
			    Function.prototype.bind = function bind(that) { // .length is 1
			        // 1. Let Target be the this value.
			        var target = this;
			        // 2. If IsCallable(Target) is false, throw a TypeError exception.
			        if (typeof target != "function")
			            throw new TypeError(); // TODO message
			        // 3. Let A be a new (possibly empty) internal list of all of the
			        //   argument values provided after thisArg (arg1, arg2 etc), in order.
			        // XXX slicedArgs will stand in for "A" if used
			        var args = slice.call(arguments, 1); // for normal call
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
			
			                var F = function(){};
			                F.prototype = target.prototype;
			                var self = new F;
			
			                var result = target.apply(
			                    self,
			                    args.concat(slice.call(arguments))
			                );
			                if (result !== null && Object(result) === result)
			                    return result;
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
			                return target.apply(
			                    that,
			                    args.concat(slice.call(arguments))
			                );
			
			            }
			
			        };
			        // XXX bound.length is never writable, so don't even try
			        //
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
			return Modernizr.ES5;
		}
	});
	
	addPolyfill('dom-extend', {
		feature: 'dom-support',
		noAutoCallback: true,
		dependencies: ['es5']
	});
		
	/* json + loacalStorage */
	
	if('localstorage' in Modernizr) {
		addPolyfill('json-storage', {
			test: Modernizr.localstorage && 'sessionStorage' in window && 'JSON' in window,
			loadInit: function(){
				loadList(['swfobject']);
			},
			noAutoCallback: true
		});
	}
	
	/* END: json + loacalStorage */
	
	/* geolocation */
	if('geolocation' in Modernizr){
		addPolyfill('geolocation', {
			test: Modernizr.geolocation,
			options: {
				destroyWrite: true
	//			,confirmText: ''
			},
			dependencies: ['json-storage']
		});
	}
	/* END: geolocation */
	
	/* canvas */
	(function(){
		if('canvas' in Modernizr) {
			var flashCanvas;
			addPolyfill('canvas', {
				src: 'excanvas',
				test: Modernizr.canvas,
				options: {type: 'excanvas'}, //excanvas | flash | flashpro
				noAutoCallback: true,
				loadInit: function(){
					var type = this.options.type;
					var src;
					if(type && type.indexOf('flash') !== -1 && (!window.swfobject || swfobject.hasFlashPlayerVersion('9.0.0'))){
						window.FlashCanvasOptions = window.FlashCanvasOptions || {};
						flashCanvas = FlashCanvasOptions;
						if(type == 'flash'){
							$.extend(flashCanvas, {
								swfPath: webCFG.basePath + 'FlashCanvas/'
							});
							this.src = 'FlashCanvas/flashcanvas';
							src = flashCanvas.swfPath + 'flashcanvas.swf';
						} else {
							$.extend(flashCanvas, {swfPath: webCFG.basePath + 'FlashCanvasPro/'});
							this.src = 'FlashCanvasPro/flashcanvas';
							//assume, that the user has flash10+
							src = flashCanvas.swfPath + 'flash10canvas.swf';
						}
						//todo: implement cachbuster for flashcanvas
	//					if(webCFG.addCacheBuster){
	//						src += webCFG.addCacheBuster;
	//					}
					}
				},
				afterLoad: function(){
					webshims.addReady(function(context, elem){
						$('canvas', context).add(elem.filter('canvas')).each(function(){
							var hasContext = this.getContext;
							if(!hasContext){
								G_vmlCanvasManager.initElement(this);
							}
						});
						if(context == document){
							isReady('canvas', true);
						}
					});
				},
				methodNames: ['getContext'],
				dependencies: ['es5', 'dom-support']
			});
		}
	})();
	
	/* END: canvas */
	
	/*
	 * HTML5 FORM-Features
	 */
	
	/* html5 constraint validation */
	if(modernizrInputAttrs && modernizrInputTypes){
		//using hole modernizr api
		addTest(formvalidation, function(){
			return !!(modernizrInputAttrs.required && 'checkValidity' in document.createElement('form'));
		});
		
		addTest('datalist', function(){
			return !!(modernizrInputAttrs.list && window.HTMLDataListElement);
		});
		
		
		addTest('output', function(){
			return (Modernizr[formvalidation] && 'value' in document.createElement('output'));
		});
		
		webshims.validationMessages = webshims.validityMessages = [];
		webshims.inputTypes = {};
				
		addPolyfill('form-core', {
			feature: 'forms',
			dependencies: ['es5'],
			loadInit: function(){
				if(this.options.customMessages){
					loadList(["dom-extend"]);
				}
			},
			options: {
				placeholderType: 'value'
	//			,customMessages: false,
	//			overrideMessages: false,
	//			replaceValidationUI: false
			},
			methodNames: ['setCustomValidity','checkValidity']
		});
				
		if(Modernizr[formvalidation]){
			//create delegatable-like events
			webshims.capturingEvents(['input']);
			webshims.capturingEvents(['invalid'], true);
			
			//ToDo merge this with form-core (to minimize small requests)
			addPolyfill('form-extend', {
				feature: 'forms',
				src: 'form-native-extend',
				test: function(toLoad){
					return ((modules['forms-ext'].test(toLoad) || $.inArray('forms-ext', toLoad) == -1) && !this.options.overrideMessages );
				},
				dependencies: ['form-core', 'dom-support']
			});
					
			addPolyfill('form-output-datalist', {
				feature: 'forms',
				test: Modernizr.output && Modernizr.datalist && modernizrInputAttrs.list,
				dependencies: ['dom-support']
			});
			
		} else {
			
			//ToDo merge this with form-core:
			addPolyfill('form-extend', {
				feature: 'forms',
				src: 'form-shim-all',
				dependencies: ['form-core', 'dom-support']
			});
		}
		
		
		addPolyfill('forms-ext', {
			src: 'form-number-date',
			uiTest: function(){return (modernizrInputTypes.range && modernizrInputTypes.date && !this.options.replaceUI);},
			test: function(){return (this.uiTest());},
			noAutoCallback: true,
			dependencies: ['forms'],
			loadInit: function(){
				if(this.uiTest()){return;}
				loadList(['jquery-ui']);
				if(modules['input-widgets'].src){
					loadList(['input-widgets']);
				}
			},
			options: {
				stepArrows: {number: 1, time: 1}, 
				calculateWidth: true,
				slider: {},
				datepicker: {},
				langSrc: uiLib+'i18n/jquery.ui.datepicker-',
				recalcWidth: true
	//			,lazyDate: undefined // true for IE8- false for fast browser 
	//			,replaceUI: false
			}
		});
	}
		
	/* END: html5 forms */
	
	addPolyfill('details', {
		test: Modernizr.details,
		dependencies: ['dom-support'],
		options: {
//			animate: false,
			text: 'Details'
		}
	});
	if ('audio' in Modernizr && 'video' in Modernizr){
		webshims.mediaelement = {};
		var swfOptions = {
			
			options: {
				hasToPlay: 'any',
				preferFlash: false,
				jwVars: {},
				jwParams: {},
				jwAttrs: {},
				changeJW: $.noop
			},
			methodNames: ['play', 'pause', 'canPlayType', 'mediaLoad:load'],
			dependencies: ['swfobject', 'dom-support']
		};
		if(Modernizr.audio && Modernizr.video){
			addPolyfill('mediaelement-core', {
				feature: 'mediaelement',
				test: function(){
					var swfModule = modules['mediaelement-swf'];
					if (swfModule.test) {
						return !swfModule.test.apply(swfModule, arguments);
					}
					return false;
				},
				noAutoCallback: true,
				
				dependencies: ['swfobject','dom-support']
			});
			addPolyfill('mediaelement-swf', $.extend({
				feature: 'mediaelement',
				
				test: function(){
					var options = this.options;
					var hasToPlay = options.hasToPlay;
					if ( (!window.swfobject || window.swfobject.hasFlashPlayerVersion('9.0.115')) && (options.preferFlash || (hasToPlay != 'any' && !Modernizr.video[hasToPlay] && !Modernizr.audio[hasToPlay]))) {
						this.src = 'mediaelement-native-all';
						return false;
					}
					return true;
				}
			}, swfOptions));
		} else {
			addPolyfill('mediaelement-swf', $.extend({
				feature: 'mediaelement',
				src: 'mediaelement-shim-all'
			}, swfOptions));
		}
	}


	$('script')
		.filter('[data-polyfill-cfg]')
		.each(function(){
			try {
				webshims.setOptions( $(this).data('polyfillCfg') );
			} catch(e){
				webshims.warn('error parsing polyfill cfg: '+e);
			}
		})
		.end()
		.filter(function(){
			return this.getAttribute('data-polyfill') != null;
		})
		.each(function(){
			webshims.polyfill( $.trim( $(this).data('polyfill') || '' ) );
		})
	;
	//set script path for comboOptions
	var l = location;
	webCFG.comboOptions.scriptPath = webCFG.basePath.replace(l.protocol + '//' + l.host + '/', '');
})(jQuery, this, this.document);
