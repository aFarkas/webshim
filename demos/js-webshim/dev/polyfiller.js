(function($, window, document, undefined){
	"use strict";
	
	document.createElement('datalist');
	
	var special = $.event.special;
	var modernizrInputAttrs = Modernizr.input || {};
	var modernizrInputTypes = Modernizr.inputtypes || {};
	var browserVersion = parseFloat($.browser.version, 10);
	
	
	//new Modernizrtests
	(function(){
		var addTest = Modernizr.addTest;
		var form = $('<form action="#"><input name="a" required /><select><option>y</option></select><input required id="date-input-test" type="date" /></form>');
		var dateElem;
		
		//using hole modernizr api
		addTest('formvalidation', function(){
			return !!('checkValidity' in form[0]);
		});
		
		addTest('datalist', function(){
			return !!(modernizrInputAttrs.list && window.HTMLDataListElement);
		});
		
		addTest('validationmessage', function(){
			if(!Modernizr.formvalidation){
				return false;
			}
			//the form has to be connected in FF4
			form.appendTo('head');
			return !!($('input', form).attr('validationMessage'));
		});
		
		addTest('output', function(){
			return (Modernizr.formvalidation && 'value' in document.createElement('output'));
		});
		
		addTest('details', function(){
			return ('open' in document.createElement('details'));
		});
		
		Modernizr.genericDOM =  !!($('<video><div></div></video>')[0].innerHTML);
		
		Modernizr.textareaPlaceholder = !!('placeholder' in $('<textarea />')[0]);
		
		//using only property api
		Modernizr.requiredSelect = !!(Modernizr.formvalidation && 'required' in $('select', form)[0]);
		
		//bugfree means interactive formvalidation including correct submit-invalid event handling (this can't be detected, we can just guess)
		Modernizr.bugfreeformvalidation = Modernizr.formvalidation && Modernizr.requiredSelect && Modernizr.validationmessage && (!$.browser.webkit || browserVersion > 534.19);
		
		
		modernizrInputAttrs.valueAsNumber = false;
		modernizrInputAttrs.valueAsDate = false;
		
		if(Modernizr.formvalidation){
			dateElem = $('#date-input-test', form)[0];
			modernizrInputAttrs.valueAsNumber = ('valueAsNumber' in  dateElem);
			modernizrInputAttrs.valueAsDate = ('valueAsDate' in dateElem);
			dateElem = null;
		}
		
		if (Modernizr.formvalidation) {
			form.remove();
		}
		form = null;
		
		Modernizr.ES5base = !!(String.prototype.trim && Date.now && Date.prototype.toISOString);
		Modernizr.ES5extras = !!(Array.isArray && Object.keys && Object.create && Function.prototype.bind && Object.defineProperties);// && !isNaN( Date.parse("T00:00") )
		
		if(Modernizr.ES5base){
			$.each(['filter', 'map', 'every', 'reduce', 'reduceRight', 'lastIndexOf'], function(i, name){
				if(!Array.prototype[name]){
					Modernizr.ES5base = false;
					return false;
				}
			});
		}
		
		
		
		var advancedObjectProperties = !!(Object.create && Object.defineProperties && Object.getOwnPropertyDescriptor);
		//safari5 has defineProperty-interface, but it can't be used on dom-object
		//only do this test in non-IE browsers, because this hurts dhtml-behavior in some IE8 versions
		if(!$.browser.msie && Object.defineProperty && Object.prototype.__defineGetter__){
			(function(){
				try {
					var foo = document.createElement('foo');
					Object.defineProperty(foo, 'bar', {get: function(){return true;}});
					advancedObjectProperties = !!foo.bar;	
				}catch(e){
					advancedObjectProperties = false;
				}
				foo = null;
			})();
		}
		
		Modernizr.ES5 = (Modernizr.ES5base && Modernizr.ES5extras && advancedObjectProperties);
		Modernizr.objectAccessor = !!( (advancedObjectProperties || (Object.prototype.__defineGetter__ && Object.prototype.__lookupSetter__)) && (!$.browser.opera || browserVersion >= 11) );
		Modernizr.domAccessor = !!( Modernizr.objectAccessor || (Object.defineProperty && Object.getOwnPropertyDescriptor));
		Modernizr.advancedObjectProperties = advancedObjectProperties;
	})();
	
	
	$.webshims = $.sub();
	
	$.extend($.webshims, {
		version: 'pre1.6.0',
		cfg: {
			useImportantStyles: true,
			removeFOUC: false,
			waitReady: true,
			extendNative: true,
			addCacheBuster: false
		},
		/*
		 * some data
		 */
		modules: {}, features: {}, featureList: [],
		profiles: {
			lightweight: ['es5', 'canvas', 'geolocation', 'forms', 'json-storage'],
			xlightweight: ['es5', 'canvas', 'geolocation', 'json-storage']
		},
		setOptions: function(name, opts){
			if(typeof name == 'string' && opts !== undefined && name in webCFG){
				if(typeof opts != 'object'){
					webCFG[name] = opts;
				} else {
					$.extend(true, webCFG[name], opts);
				}
			} else if(typeof name == 'object') {
				$.extend(true, webCFG, name);
			}
		},
		addPolyfill: function(name, cfg){
			cfg = cfg || {};
			var feature = cfg.feature || name;
			if(!webshims.features[feature]){
				webshims.features[feature] = [];
				webshims.featureList.push(feature);
				webshims.cfg[feature] = {};
			}
			webshims.features[feature].push(name);
			cfg.options = $.extend(webshims.cfg[feature], cfg.options);
			
			addModule(name, cfg);
			if(cfg.methodNames){
				if (!$.isArray(cfg.methodNames)) {
					cfg.methodNames = [cfg.methodNames];
				}
				
				$.each(cfg.methodNames, function(i, methodName){
					webshims.addMethodName(methodName);
				});
			}
		},
		
		polyfill: (function(){
			var firstPolyfillCall = function(features){
				var loadingTimer;
				var addClass = [];
				var onReadyEvts = features;
				
				var removeLoader = function(){
					$('html').removeClass('loading-polyfills long-loading-polyfills polyfill-remove-fouc');
					$(window).unbind('.loadingPolyfills');
					clearTimeout(loadingTimer);
				};
				
				if(!$.isReady){
					if(webshims.cfg.removeFOUC){
						if(webshims.cfg.waitReady){
							onReadyEvts = onReadyEvts.concat(['DOM']);
						}
						addClass.push('polyfill-remove-fouc');
					}
					addClass.push('loading-polyfills');
					$(window).bind('load.loadingPolyfills polyfillloaderror.loadingPolyfills  error.loadingPolyfills', removeLoader);
					loadingTimer = setTimeout(function(){
						$('html').addClass('long-loading-polyfills');
					}, 600);
				} else {
					webshims.warn('You should call $.webshims.polyfill before DOM-Ready');
				}
				onReady(features, removeLoader);
				if(webshims.cfg.useImportantStyles){
					addClass.push('polyfill-important');
				}
				if(addClass[0]){
					$('html').addClass(addClass.join(' '));
				}
				$(function(){
					loader.loadList(['html5a11y', 'html5shiv']);
				});
				loader.loadCSS('shim.css');
				//remove function
				firstPolyfillCall = $.noop;
			};
			
			return function(features){
				var toLoadFeatures = [];
				
				features = features || webshims.featureList;
				
				if (typeof features == 'string') {
					features = webshims.profiles[features] || features.split(' ');
				}
				
				if(webshims.cfg.waitReady){
					$.readyWait++;
					onReady(features, function(){
						$.ready(true);
					});
				}
				
				$.each(features, function(i, feature){
					if(feature !== webshims.features[feature][0]){
						onReady(webshims.features[feature], function(){
							isReady(feature, true);
						});
					}
					toLoadFeatures = toLoadFeatures.concat(webshims.features[feature]);
				});
				
				firstPolyfillCall(features);
				loader.loadList(toLoadFeatures);
				
			};
		})(),
				
		/*
		 * handle ready modules
		 */
		
		isReady: function(name, _set){
			
			name = name+'Ready';
			if(_set){
				if(special[name] && special[name].add){
					return true;
				}
					
				special[name] = $.extend(special[name] || {}, {
					add: function( details ) {
						details.handler.call(this, $.Event(name));
					}
				});
				$.event.trigger(name);
			}
			return !!(special[name] && special[name].add) || false;
		},
		ready: function(events, fn /*, _created*/){
			var _created = arguments[2];
			var evt = events;
			if(typeof events == 'string'){
				events = events.split(' ');
			}
			
			if(!_created){
				events = $.map(
					$.grep(events, function(evt){
						return !isReady(evt);
					}), function(evt){
						return evt +'Ready';
					}
				);
			}
			if(!events.length){
				fn($, webshims, window, document);
				return;
			}
			var readyEv = events.shift(),
				readyFn = function(){
					onReady(events, fn, true);
				}
			;
			
			$(document).one(readyEv, readyFn);
		},
		
		/*
		 * basic DOM-/jQuery-Helpers
		 */
		addMethodName: function(name){
			if($.fn[name] && 'shim' in $.fn[name]){return;}
			$.fn[name] = function(){
				var args = arguments,
					ret
				;
				this.each(function(){
					var fn = $.attr(this, name);
					if(fn && fn.apply){
						ret = fn.apply(this, args);
						if(ret !== undefined){
							return false;
						}
					}
				});
				return (ret !== undefined) ? ret : this;
			};
		},
		
		fixHTML5: function(h){return h;},
		capturingEvents: function(names, _maybePrevented){
			if(!document.addEventListener){return;}
			if(typeof names == 'string'){
				names = [names];
			}
			$.each(names, function(i, name){
				var handler = function( e ) {
					e = $.event.fix( e );
					if(_maybePrevented && !e._isPolyfilled){
						var isDefaultPrevented = e.isDefaultPrevented;
						var preventDefault = e.preventDefault;
						e.preventDefault = function(){
							clearTimeout($.data(e.target, e.type +'-defaultPrevented'));
							$.data(e.target, e.type +'-defaultPrevented', setTimeout(function(){
								$.removeData(e.target, e.type +'-defaultPrevented');
							}, 30));
							return preventDefault.apply(this, arguments);
						};
						e.isDefaultPrevented = function(){
							return !!(isDefaultPrevented.apply(this, arguments) || $.data(e.target, e.type +'-defaultPrevented') || false);
						};
						e._isPolyfilled = true;
					}
					return $.event.handle.call( this, e );
				};
				special[name] = special[name] || {};
				if(special[name].setup || special[name].teardown){return;}
				$.extend(special[name], {
					setup: function() {
						this.addEventListener(name, handler, true);
					}, 
					teardown: function() { 
						this.removeEventListener(name, handler, true);
					}
				});
			});
		},
		register: function(name, fn){
			var module = modules[name];
			if(!module){
				webshims.warn("can't find module: "+ name);
				return;
			}
			if(module.noAutoCallback){
				var ready = function(){
					fn($, webshims, window, document, undefined, module.options);
					isReady(name, true);
				};
				if(module.dependencies){
					onReady(module.dependencies, ready);
				} else {
					ready();
				}
			}
		},
		
		/*
		 * loader
		 */
		loader: {
			
			basePath: (function(){
				var path = $('meta[name="polyfill-path"]').attr('content');
				if(!path){
					var script = $('script');
					script = script[script.length - 1];
					path = ((!$.browser.msie || document.documentMode >= 8) ? script.src : script.getAttribute("src", 4)).split('?')[0];
					path = path.slice(0, path.lastIndexOf("/") + 1) + 'shims/';
				}
				return path;
			})(),
			
			
			addModule: function(name, ext){
				modules[name] = ext;
				ext.name = ext.name || name;
			},
			
			loadList: (function(){
				
				var loadedModules = [];
				
				var loadScript = function(src, names){
					if(typeof names == 'string'){
						names = [names];
					}
					$.merge(loadedModules, names);
					loader.loadScript(src, false, names);
				};
				
				var noNeedToLoad = function(name, list){
					if(isReady(name) || $.inArray(name, loadedModules) != -1){
						return true;
					}
					var module = modules[name];
					var cfg = webshims.cfg[module.feature || name] || {};
					var supported;
					if(module){
						supported = (module.test && $.isFunction(module.test)) ?
							module.test(list) :
							module.test
						;
						if (supported) {
							isReady(name, true);
							return true;
						}  else {
							return false;
						}
					}
					return true;
				};
				
				var setDependencies = function(module, list){
					if(module.dependencies && module.dependencies.length){
						var addDependency = function(i, dependency){
							if(!noNeedToLoad(dependency, list) && $.inArray(dependency, list) == -1){
								list.push(dependency);
							}
						};
						$.each(module.dependencies , function(i, dependeny){
							if(modules[dependeny]){
								addDependency(i, dependeny);
							} else if(webshims.features[dependeny]){
								$.each(webshims.features[dependeny], addDependency);
								onReady(webshims.features[dependeny], function(){
									isReady(dependeny, true);
								});
							}
						});
						if(!module.noAutoCallback){
							module.noAutoCallback = true;
						}
					}
				};
				
				return function(list){
					var module;
					//length of list is dynamically
					for(var i = 0; i < list.length; i++){
						module = modules[list[i]];
						if (noNeedToLoad(module.name, list)) {
							continue;
						}
						if (module.css) {
							loader.loadCSS(module.css);
						}
						
						if(module.loadInit){
							module.loadInit();
						}
										
						setDependencies(module, list, list);
						
						loadScript(module.src || module.name, module.name);
					}
					
					
					
				};
			})(),
			
			makePath: function(src){
				if(src.indexOf('//') != -1 || src.indexOf('/') === 0){
					return src;
				}
				
				if(src.indexOf('.') == -1){
					src += '.js';
				}
				if(webCFG.addCacheBuster){
					src += webCFG.addCacheBuster;
				}
				return loader.basePath + src;
			},
			
			loadCSS: (function(){
				var parent, 
					loadedSrcs = []
				;
				return function(src){
					src = this.makePath(src);
					if($.inArray(src, loadedSrcs) != -1){
						return;
					}
					parent = parent || document.getElementsByTagName('script')[0];
					loadedSrcs.push(src);
					$('<link rel="stylesheet" />')
						.insertBefore(parent)
						.attr({href: src})
					;
				};
			})(),
			
			loadScript: (function(){
				var parent, 
					loadedSrcs = []
				;
				return function(src, callback, name){
					
					src = loader.makePath(src);
					if($.inArray(src, loadedSrcs) != -1){
						return;
					}
					parent = parent || document.getElementsByTagName('script')[0];
										
					var script = document.createElement('script'),
						timer,
						onLoad = function(e){
							if(e && e.type === 'error'){
								$(window).triggerHandler('polyfillloaderror');
								webshims.warn('Error: could not find script @'+src +'| configure polyfill-path: $.webshims.loader.basePath = "path/to/shims-folder" or by using markup: <meta name="polyfill-path" content="path/to/shims-folder/" />');
							}
							if(!this){return;}
							if(!this.readyState ||
										this.readyState == "loaded" || this.readyState == "complete"){
								script.onload =  null;
								script.onreadystatechange = null;
								if(callback){
									callback(e, this);
								}
								
								if(name){
									if(typeof name == 'string'){
										name = name.split(' ');
									}
									$.each(name, function(i, name){
										if(!modules[name]){return;}
										if(modules[name].afterLoad){
											modules[name].afterLoad();
										}
										isReady(!modules[name].noAutoCallback ? name : name + 'FileLoaded', true);
									});
									
								}
								$(script).unbind('error.polyfillerror', onLoad);
								script = null;
								clearTimeout(timer);
							}
						}
					;
					script.setAttribute('async', 'async');
					
					timer = setTimeout(function(){
						onLoad({type: 'error'});
					}, 20000);
					script.onload = onLoad;
					$(script).one('error.polyfillerror', onLoad);
					script.onreadystatechange = onLoad;
					script.src = src;
					parent.parentNode.insertBefore(script, parent);
					script.async = true;
					
					loadedSrcs.push(src);
				};
			})()
		}
	});
	
	/*
	 * shortcuts
	 */
	var webshims = $.webshims;
	var protocol = (location.protocol == 'https:') ? 'https://' : 'http://';
	var webCFG = webshims.cfg;
	var isReady = webshims.isReady;
	var onReady = webshims.ready;
	var addPolyfill = webshims.addPolyfill;
	var modules = webshims.modules;
	var loader = webshims.loader;
	var addModule = loader.addModule;
	var importantLogs = {warn: 1, error: 1};
	var xhrPreloadOption = {
		cache: true, 
		dataType: 'text', 
		error: function(data, text){
			webshims.warn('error with: '+ this.url +' | '+ text);
		}
	};
	
	//activeLang will be overridden
	webshims.activeLang = (function(){
		var args;
		var that;
		onReady('webshimLocalization', function(){
			if(args && that){
				webshims.activeLang.apply(that, args);
			}
		});
		return function(){
			that = this;
			args = arguments;
		};
	})();
	
	
	$.each(['log', 'error', 'warn', 'info'], function(i, fn){
		webshims[fn] = function(message){
			if((importantLogs[fn] || webshims.debug) && window.console && console.log){
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
				if(unwait !== true && !$.isDOMReady && document.body){
					$.isDOMReady = true;
					isReady('DOM', true);
					$.ready = $Ready;
				}
				return $Ready.apply(this, arguments);
			};
		} else {
			isReady('DOM', true);
		}
		
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
		var emptyJ = $([]);
		$.extend(webshims, {
			addReady: function(fn){
				var readyFn = function(context, elem){
					webshims.ready('DOM', function(){fn(context, elem);});
				};
				readyFns.push(readyFn);
				readyFn(document, emptyJ);
			},
			triggerDomUpdate: function(context){
				if(!context || !context.nodeType){return;}
				var type = context.nodeType;
				if(type != 1 && type != 9){return;}
				var elem = (context !== document) ? $(context) : emptyJ;
				$.each(readyFns, function(i, fn){
					fn(context, elem);
				});
			}
		});
		
		$.fn.htmlWebshim = function(a){
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
		webshims.fn.html = $.fn.htmlWebshim;
		
		$.each(['after', 'before', 'append', 'prepend', 'replaceWith'], function(i, name){
			$.fn[name+'Webshim'] = function(a){
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
			webshims.fn[name] = $.fn[name+'Webshim'];
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
		if(Object.defineProperty){
			webshims.defineProperty = function(obj, prop, desc){
				extendUndefined(desc);
				return Object.defineProperty(obj, prop, desc);
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
	addModule('html5a11y', {
		src: 'html5a11y',
		test: !(($.browser.msie && browserVersion < 9 && browserVersion > 7) || ($.browser.mozilla && browserVersion < 2) || ($.browser.webkit && browserVersion < 535))
	});
	
	addModule('jquery-ui', {
		src: protocol+'ajax.googleapis.com/ajax/libs/jqueryui/1.8.11/jquery-ui.min.js',
		test: function(){return !!($.widget && $.Widget);}
	});
	
	addModule('input-widgets', {
		src: '',
		test: function(){
			//ToDo: add spinner
			var test = !($.widget && !($.fn.datepicker || $.fn.slider));
			if(!this.src){
				if(!test){
					webshims.warn('jQuery UI Widget factory is already included, but not datepicker or slider. configure src of $.webshims.modules["input-widgets"].src');
				}
				return true;
			}
			return test;
		}
	});
	
	addModule('swfobject', {
		src: protocol+'ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js',
		test: function(){return ('swfobject' in window);}
	});
	
		
	/* 
	 * polyfill-Modules 
	 */
	
	// webshims lib uses a of http://github.com/kriskowal/es5-shim/ to implement
	addPolyfill('es5', {
		test: Modernizr.ES5
	});
	
	addPolyfill('dom-extend', {
		feature: 'dom-support',
		noAutoCallback: true,
		dependencies: ['es5']
	});
	
	
	addPolyfill('html5shiv', {
		feature: 'dom-support',
		test: Modernizr.genericDOM
	});
	
	/* geolocation */
	addPolyfill('geolocation', {
		test: Modernizr.geolocation,
		options: {destroyWrite: true, confirmText: ''},
		dependencies: ['json-storage']
	});
	/* END: geolocation */
	
	/* canvas */
	(function(){
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
					flashCanvas = window.FlashCanvasOptions;
					if(type == 'flash'){
						$.extend(flashCanvas, {swfPath: loader.basePath + 'FlashCanvas/'});
						this.src = 'FlashCanvas/flashcanvas';
						src = flashCanvas.swfPath + 'flashcanvas.swf';
					} else {
						$.extend(flashCanvas, {swfPath: loader.basePath + 'FlashCanvasPro/'});
						this.src = 'FlashCanvasPro/flashcanvas';
						//assume, that the user has flash10+
						src = flashCanvas.swfPath + 'flash10canvas.swf';
					}
					//todo: implement cachbuster for flashcanvas
//					if(webCFG.addCacheBuster){
//						src += webCFG.addCacheBuster;
//					}
					//preload swf
					if(src){
						$.ajax(src, xhrPreloadOption);
					}
				}
			},
			afterLoad: function(){
				webshims.ready('dom-extend', function($, webshims, window, doc){
					webshims.addReady(function(context, elem){
						$('canvas', context).add(elem.filter('canvas')).each(function(){
							var hasContext = this.getContext;
							if(!hasContext){
								G_vmlCanvasManager.initElement(this);
							}
						});
					});
					isReady('canvas', true);
				});
			},
			methodNames: ['getContext'],
			dependencies: ['es5', 'dom-support']
		});
	})();
	
	/* END: canvas */
	
	/*
	 * HTML5 FORM-Features
	 */
	
	/* html5 constraint validation */
	
	webshims.validityMessages = [];
	webshims.validationMessages = webshims.validityMessages;
	webshims.inputTypes = {};
			
	addPolyfill('form-core', {
		feature: 'forms',
		dependencies: ['es5'],
		loadInit: function(){
			if(this.options.customMessages || !Modernizr.validationmessage){
				loader.loadList(["dom-extend"]);
			}
		},
		options: {
			placeholderType: 'value',
			customMessages: false,
			overrideMessages: false,
			textareaPlaceholder: false
		}
	});
			
	if(Modernizr.formvalidation){
		//create delegatable-like events
		webshims.capturingEvents(['input']);
		webshims.capturingEvents(['invalid'], true);
		
		addPolyfill('form-extend', {
			feature: 'forms',
			src: 'form-native-extend',
			test: function(toLoad){
				return (Modernizr.requiredSelect && Modernizr.validationmessage && ((modernizrInputAttrs.valueAsNumber && modernizrInputAttrs.valueAsDate) || $.inArray('forms-ext', toLoad) == -1) && !this.options.overrideMessages );
			},
			dependencies: ['form-core', 'dom-support'],
			methodNames: ['setCustomValidity','checkValidity']
		});
		
		addPolyfill('form-native-fix', {
			feature: 'forms',
			test: Modernizr.bugfreeformvalidation,
			dependencies: ['dom-support'],
			combination: ['combined-webkit']
		});
		
		//this implements placeholder in old opera
		addPolyfill('placeholder', {
			feature: 'forms',
			test: function(){
				return modernizrInputAttrs.placeholder && (!this.options.textareaPlaceholder || Modernizr.textareaPlaceholder);
			},
			src: 'form-shim-extend'
		});
		
	} else {
		//this also serves as base for non capable browsers
		addPolyfill('form-extend', {
			feature: 'forms',
			src: 'form-shim-extend',
			methodNames: ['setCustomValidity','checkValidity'],
			dependencies: ['form-core', 'dom-extend']
		});
	}
	
	
	addPolyfill('form-output-datalist', {
		feature: 'forms',
		test: function(){
			var result = Modernizr.datalist && modernizrInputAttrs.list;
			if(result && $(document.createElement('input')).attr('list') === null){
				var oAttr = $.attr;
				$.attr = function(elem, name, value){
					if(name == 'list' && elem && (elem.nodeName || '').toLowerCase() == 'input' ){
						if(value !== undefined){
							elem.setAttribute(name, value);
						} else {
							return elem.getAttribute(name);
						}
					}
					return oAttr.apply(this, arguments);
				};
			}
			return Modernizr.output && result;
		},
		dependencies: ['dom-support', 'json-storage']
	});
	
	addPolyfill('forms-ext', {
		src: 'form-number-date',
		test: function(){return (modernizrInputTypes.range && modernizrInputTypes.date && !this.options.replaceUI);},
		noAutoCallback: true,
		dependencies: ['form-extend'],
		loadInit: function(){
			loader.loadList(['jquery-ui']);
			if(modules['input-widgets'].src){
				loader.loadList(['input-widgets']);
			}
		},
		options: {
			stepArrows: {number: 1, time: 1}, 
			calculateWidth: true,
			slider: {},
			datepicker: {},
			langSrc: protocol+'ajax.googleapis.com/ajax/libs/jqueryui/1.8.11/i18n/jquery.ui.datepicker-',
			availabeLangs: 'af ar ar-DZ az bg bs ca cs da de el en-AU en-GB en-NZ eo es et eu fa fi fo fr fr-CH gl he hr hu hy id is it ja ko kz lt lv ml ms nl no pl pt-BR rm ro ru sk sl sq sr sr-SR sv ta th tr uk vi zh-CN zh-HK zh-TW'.split(' '),
			recalcWidth: true,
			replaceUI: false
		}
	});
		
	/* END: html5 forms */
	
	/* json + loacalStorage */
	
	addPolyfill('json-storage', {
		test: Modernizr.localstorage && 'sessionStorage' in window && 'JSON' in window,
		loadInit: function(){
			loader.loadList(['swfobject']);
		},
		noAutoCallback: true
	});
	
	/* END: json + loacalStorage */
	addPolyfill('details', {
		test: Modernizr.details,
		dependencies: ['dom-support'],
		options: {
			animate: false,
			text: 'Details'
		}
	});
})(jQuery, this, this.document);
