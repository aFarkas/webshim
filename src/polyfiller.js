(function($, window, document, undefined){
	"use strict";
	
//	$.each(['jQuery', 'Modernizr', 'yepnope'], function(i, dependcy){
//		if(!window[dependcy]){
//			throw("you have to include "+ dependcy +" before webshims lib");
//		}
//	});
	
	
	document.createElement('datalist');
	
	var special = $.event.special;
	
	
	$.webshims = {
		
		version: 'pre1.5.0',
		cfg: {
			useImportantStyles: true,
			removeFOUC: true,
			waitReady: true,
			extendNative: false
		},
		implement: {},
		/*
		 * some data
		 */
		modules: {}, features: {}, featureList: [],
		addPolyfill: function(name, cfg){
			cfg = cfg || {};
			var feature = cfg.feature || name;
			if(!webshims.features[feature]){
				webshims.features[feature] = [];
				webshims.featureList.push(feature);
			}
			webshims.features[feature].push(name);
			
			loader.addModule(name, cfg);
			$.each(cfg.combination || [], function(i, combi){
				if(!combinations[combi]){
					combinations[combi] = [name];
				} else {
					combinations[combi].push(name);
				}
			});
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
				var removeLoader = function(){
					$('html').removeClass('loading-polyfills long-loading-polyfills polyfill-remove-fouc');
					$(window).unbind('load.loadingPolyfills error.loadingPolyfills');
					clearTimeout(loadingTimer);
				};
				if(!$.isReady){
					if(webshims.cfg.removeFOUC){
						addClass.push('polyfill-remove-fouc');
					}
					addClass.push('loading-polyfills');
					$(window).bind('load.loadingPolyfills error.loadingPolyfills', removeLoader);
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
				$(window).load(function(){
					loader.loadList(['html5a11y']);
				});
				loader.loadCSS('shim.css');
				//remove function
				firstPolyfillCall = $.noop;
			};
			
			return function(features, fn){
				var toLoadFeatures = [];
				
				features = features || webshims.featureList;
				if(features == 'lightweight'){
					features = webshims.light;
				}
				if (typeof features == 'string') {
					features = features.split(' ');
				}
				
				
				if(fn || webshims.cfg.waitReady){
					if(webshims.cfg.waitReady){
						$.readyWait++;
					}
					onReady(features, function(){
						if(webshims.cfg.waitReady){
							$.ready(true);
						}
						if(fn){
							fn($, webshims, window, document);
						}
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
			if(_set && webshims.waitReadys[name]){
				webshims.waitReadys[name+'ReadyCall'] = true;
				return false;
			}
			name = name+'Ready';
			if(_set){
				if(special[name] && special[name].add){return true;}
					
					special[name] = $.extend(special[name] || {}, {
						add: function( details ) {
							details.handler.call(this, $.Event(name));
						}
					});
					$.event.trigger(name);
			}
			return !!(special[name] && special[name].add) || false;
		},
		waitReadys: {}, 
		ready: function(events, fn /*, _created*/){
			var _created = arguments[2];
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
		getID: (function(){
			var ID = new Date().getTime();
			return function(elem){
				elem = $(elem);
				var id = elem.attr('id');
				if(!id){
					ID++;
					id = 'elem-id-'+ ID;
					elem.attr('id', id);
				}
				return id;
			};
		})(),
		fixHTML5: function(h){return h;},
		capturingEvents: function(names/*, _maybePrevented */){
			if(!document.addEventListener){return;}
			var _maybePrevented = arguments[1];
			if(typeof names == 'string'){
				names = [names];
			}
			$.each(names, function(i, name){
				var handler = function( e ) { 
					e = $.event.fix( e );
					
					//this can be removed with jQuery 1.5
					if(_maybePrevented){
						var preventDefault = e.preventDefault;
						e.preventDefault =  function(){
							preventDefault.apply(this, arguments);
							clearTimeout($.data(e.target, 'maybePrevented'+e.type));
							$.data(e.target, 'maybePrevented'+e.type, setTimeout(function(){
								$.removeData(e.target, 'maybePrevented'+e.type);
							}, 90));
							
						};
					}
					//END: this can be removed with jQuery 1.5
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
		
		/*
		 * loader
		 */
		loader: {
			
			basePath: (function(){
				var path = $('meta[name="polyfill-path"]').attr('content');
				if(path){return path;}
				var script = $('script');
				
				script = script[script.length - 1];
				path = ((!$.browser.msie || document.documentMode >= 8) ? script.src : script.getAttribute("src", 4)).split('?')[0];
				return path.slice(0, path.lastIndexOf("/") + 1) +'shims/';
			})(),
			
			combinations: {},
			
			addModule: function(name, ext){
				modules[name] = ext;
			},
			
			loadList: (function(){
				var loadedModules = [];
				var moduleReady = function(name, list, toLoad){
					if(isReady(name)){
						return true;
					}
					var module = modules[name];
					if(module){
						if ('test' in module && module.test(list)) {
							isReady(name, true);
							return true;
						} else if(toLoad && !isReady(name) && $.inArray(name, toLoad) == -1 && $.inArray(name, list) == -1){
							toLoad.push(name);
							return false;
						}
						return isReady(name);
					} else if(webshims.features[name] && toLoad && name !== webshims.features[name][0]) {
						onReady(webshims.features[name], function(){
							isReady(name, true);
						});
						$.each(webshims.features[name], function(i, dependency){
							if(!moduleReady(dependency, list) && $.inArray(dependency, toLoad) == -1 && $.inArray(dependency, list) == -1){
								toLoad.push(dependency);
							}
						});
					}
					return true;
				};
				return function(list){
					var toLoad = [];
					
					$.each(list, function(i, name){
						var module = modules[name];
						if (moduleReady(name, list)) {
							return;
						}
						if (module.css) {
							loader.loadCSS(module.css);
						}
						toLoad.push(name);
						(module.dependencies &&
							$.each(module.dependencies, function(i, dependency){
								moduleReady(dependency, list, toLoad);
							})
						);
						
						if(module.loadInit){
							module.loadInit();
						}
						
					});
					
					if(!webshims.debug){
						$.each(loader.combinations || [], function(combi, combiModules){
							
							var loadCombi = true;
							$.each(combiModules, function(i, combinedModule){
								if ($.inArray(combinedModule, toLoad) === -1 || $.inArray(combinedModule, loadedModules) !== -1) {
									loadCombi = false;
									return false;
								}
							});
							
							if(loadCombi){
								loadedModules = loadedModules.concat(combiModules);
								loader.loadScript(combi, false, combiModules);
								return false;
							}
						});
					}
					
					$.each(toLoad, function(i, loadName){
						if ($.inArray(loadName, loadedModules) == -1) {
							loader.loadScript(modules[loadName].src || loadName, false, loadName);
						}
					});
				};
			})(),
			
			makePath: function(src){
				if(src.indexOf('://') != -1 || src.indexOf('/') === 0){
					return src;
				}
				
				if(src.indexOf('.') == -1){
					src += '.js';
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
					parent = parent || document.getElementsByTagName('head')[0] || document.body;
					loadedSrcs.push(src);
					$('<link rel="stylesheet" />')
						.prependTo(parent)
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
					parent = parent || document.getElementsByTagName('head')[0] || document.body;
					if(!parent || !parent.appendChild){
						setTimeout(function(){
							loader.loadScript(src, callback, name);
						}, 9);
						return;
					}
					
					var script = document.createElement('script'),
						timer,
						onLoad = function(e){
							if(e && e.type === 'error'){
								webshims.warn('Error: could not find script @'+src +'| configure polyfill-path "$.webshims.loader.basePath" or by using markup: <meta name="polyfill-path" content="path/to/shimsfolder/" />');
							}
							if(!this.readyState ||
										this.readyState == "loaded" || this.readyState == "complete"){
								script.onload =  null;
								$(script).onerror = null;
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
										if(!modules[name].noAutoCallback){
											isReady(name, true);
										} 
									});
									
								}
								script = null;
								clearTimeout(timer);
							}
						}
					;
					script.setAttribute('async', 'async');
					script.src = src;
					timer = setTimeout(function(){
						onLoad({type: 'error'});
					}, 20000);
					script.onload = onLoad;
					$(script).one('error', onLoad);
					script.onreadystatechange = onLoad;
					parent.appendChild(script);
					script.async = true;
					
					loadedSrcs.push(src);
				};
			})()
		}
	};
	
	/*
	 * shortcuts
	 */
	var webshims = $.webshims;
	var isReady = webshims.isReady;
	var onReady = webshims.ready;
	var addPolyfill = webshims.addPolyfill;
	var modules = webshims.modules;
	var loader = webshims.loader;
	var combinations = loader.combinations;
	var support = $.support;
	
	$.each(['log', 'error', 'warn', 'info'], function(i, fn){
		webshims[fn] = function(message){
			if(webshims.debug && window.console && console.log){
				return console[(console[fn]) ? fn : 'log'](message);
			}
		};
	});
	
	
	 
	
	
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
					onReady('DOM', function(){fn(context, elem);});
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
			var ret = this.html((a) ? webshims.fixHTML5(a) : a);
			if(ret === this && $.isReady){
				this.each(function(){
					if(this.nodeType == 1){
						webshims.triggerDomUpdate(this);
					}
				});
			}
			return ret;
		};
		
		$.each(['after', 'before', 'append', 'prepend'], function(i, name){
			$.fn[name+'Webshim'] = function(a){
				var elems = $(webshims.fixHTML5(a));
				this[name](elems);
				if($.isReady){
					elems.each(function(){
						if (this.nodeType == 1) {
							webshims.triggerDomUpdate(this);
						}
					});
				}
				return this;
			};
		});
		
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
		webshims.defineProperty = function(obj, prop, desc){
			extendUndefined(desc);
			return Object.defineProperty(obj, prop, desc);
		};
		webshims.defineProperties = function(obj, props){
			extendProps(props);
			return Object.defineProperties(obj, props);
		};
		webshims.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
		
		webshims.getPrototypeOf = Object.getPrototypeOf;
	})();
	
	

	
	/*
	 * Start Features 
	 */
	
	/* general modules */
	/* change path $.webshims.modules[moduleName].src */
	var browserVersion = parseFloat($.browser.version, 10);
	var httpProtocol = (location.protocol == 'https:') ? 'https:' : 'http:';
	loader.addModule('html5a11y', {
		src: 'html5a11y',
		test: function(){
			return !(($.browser.msie && browserVersion < 10 && browserVersion > 7) || ($.browser.mozilla && browserVersion < 2) || ($.browser.webkit && browserVersion < 540));
		}
	});
	
	loader.addModule('jquery-ui', {
		src: httpProtocol+'//ajax.googleapis.com/ajax/libs/jqueryui/1.8.5/jquery-ui.min.js',
		test: function(){return !!($.widget && $.Widget);}
	});
	
	loader.addModule('input-widgets', {
		src: '',
		test: function(){
			//ToDo: add spinner
			return !($.widget && !($.fn.datepicker || $.fn.slider));
		}
	});
	
	loader.addModule('swfobject', {
		src: httpProtocol+'//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js',
		test: function(){return ('swfobject' in window);}
	});
	
		
	var testElem = $('<div />')[0];
	
	/* 
	 * polyfill-Modules 
	 */
	
	// webshims lib uses a of http://github.com/kriskowal/es5-shim/ to implement
	var es5 = [];
	es5.push( !!(Array.isArray && Object.keys && Object.create && Function.prototype.bind && Object.defineProperties && !isNaN( Date.parse("T00:00") )) );
	es5.push( !!(String.prototype.trim && Date.now && Date.prototype.toISOString) );
	
	if(es5[1]){
		$.each(['filter', 'map', 'every', 'reduce', 'reduceRight', 'lastIndexOf'], function(i, name){
			if(!Array.prototype[name]){
				es5[1] = false;
				return false;
			}
		});
	}
	support.es5 = (es5[0] && es5[1]);
	
	support.advancedObjectProperties = !!(Object.create && Object.defineProperties && Object.getOwnPropertyDescriptor);
	support.objectAccessor = !!( support.advancedObjectProperties || (Object.prototype.__defineGetter__ && Object.prototype.__lookupSetter__));
	support.domAccessor = !!( support.advancedObjectProperties || (Object.prototype.__defineGetter__ && Object.prototype.__lookupSetter__) ||  (Object.defineProperty && Object.getOwnPropertyDescriptor));
	support.dhtmlBehavior = !!(testElem.addBehavior);
	testElem.setAttribute('dataContentAttr', ':-)');
	support.contentAttr = !(testElem.dataContentAttr);
	
	addPolyfill('es5-1', {
		feature: 'es5',
		test: function(){
			return (es5[1] && es5[0]);
		},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ff3', 'combined-ie7-light', 'combined-ie8-light', 'combined-ff3-light', 'combined-webkit']
	});
	
	addPolyfill('es5-2', {
		feature: 'es5',
		test: function(){
			return es5[1];
		},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie7-light', 'combined-ie8-light']
	});
	
	
	addPolyfill('dom-extend', {
		feature: 'dom-support',
		noAutoCallback: true,
		dependencies: ['es5'],
		//no test = always load
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ff4', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light', 'combined-ff3-light', 'combined-webkit']
	});
	
	//ToDo: This should be part of dom-extend
	support.dynamicHTML5 =  !!($('<video><div></div></video>')[0].innerHTML);
	addPolyfill('html5shiv', {
		feature: 'dom-support',
		test: function(){
			return support.dynamicHTML5;
		},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie7-light', 'combined-ie8-light']
	});
	
	/* geolocation */
	support.geolocation = ('geolocation'  in navigator);
	addPolyfill('geolocation', {
		test: function(){
			return support.geolocation;
		},
		options: {destroyWrite: true},
		dependencies: ['json-storage'],
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light']
	});
	/* END: geolocation */
	
	/* canvas */
	support.canvas = ('getContext'  in $('<canvas />')[0]);
	
	addPolyfill('canvas', {
		src: 'excanvas',
		test: function(){
			return false && support.canvas;
		},
		noAutoCallback: true,
		loadInit: function(){
			var mod = this;
			if($.webshims.canvasImplementation == 'flash'){
				window.FlashCanvas = $.extend(window.FlashCanvas || {}, {swfPath: loader.basePath + 'FlashCanvas/'});
				mod.src = 'FlashCanvas/flashcanvas';
			}
			
		},
		afterLoad: function(){
			
			webshims.ready('dom-extend', function($, webshims, window, doc){
				webshims.defineNodeNameProperty('canvas', 'getContext', {
					value: function(ctxName){
						if(!this.getContext){
							G_vmlCanvasManager.initElement(this);
						}
						return this.getContext(ctxName);
					}
				});
						
				webshims.addReady(function(context, elem){
					if(doc === context){
						$('canvas').each(function(){
							if(!this.getContext){
								window.G_vmlCanvasManager && G_vmlCanvasManager.initElement(this);
							} else {
								return false;
							}
						});
						console.log('isready')
						isReady('canvas', true);
						return;
					}
					$('canvas', context).add(elem.filter('canvas')).each(function(){
						if(!this.getContext){
							G_vmlCanvasManager.initElement(this);
						}
					});
				});
			});
		},
		methodNames: ['getContext'],
		dependencies: ['es5', 'dom-support']
	});
	
	/* END: canvas */
	
	/*
	 * HTML5 FORM-Features
	 */
	
	/* html5 constraint validation */
	
	webshims.validityMessages = [];
	webshims.inputTypes = {};
	
	(function(){
		var form = $('<form action="#"><input name="a" required /><select><option>y</option></select></form>'),
			range = $('<input type="range" />')[0],
			date = $('<input type="date" />')[0]
		;
		
		support.validity = ('checkValidity' in form[0]);
		if(support.validity){
			form.appendTo('head');
		}
		support.validationMessage = !!($('input', form).attr('validationMessage'));
		
		support.output = !!(support.validity && 'value' in document.createElement('output') );
		support.requiredSelect = (support.validity && 'required' in $('select', form)[0]);
		support.datalistProp = (support.validity && 'list' in $('input', form)[0] && 'options' in document.createElement('datalist'));
		support.datalist = !!(support.datalistProp && window.HTMLDataListElement);
		support.numericDateProps = (support.validity && range.type == 'range' && date.type == 'date');
		
		
		support.rangeUI = support.numericDateProps && Modernizr.inputtypes.range;
		support.dateUI = support.numericDateProps && Modernizr.inputtypes.date;
		
		if(support.validity){
			form.remove();
		}
		form = null;
		range = null;
		date = null;
	})();
		
	addPolyfill('form-core', {
		feature: 'forms',
		noAutoCallback: true,
		dependencies: ['es5'],
		//no test = always load
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ff4', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light', 'combined-ff3-light', 'combined-webkit']
	});
	
	addPolyfill('form-message', {
		feature: 'forms',
		test: function(toLoad){
			return (support.validationMessage && !webshims.implement.customValidationMessage && modules['form-extend'].test(toLoad) );
		},
		options: {},
		dependencies: ['dom-support'],
		noAutoCallback: true,
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ff4', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light', 'combined-ff3-light', 'combined-webkit']
	});
	
	if(support.validity){
		//create delegatable-like events
		webshims.capturingEvents(['input']);
		webshims.capturingEvents(['invalid'], true);
		
		addPolyfill('form-extend', {
			feature: 'forms',
			src: 'form-native-extend',
			noAutoCallback: true,
			test: function(toLoad){
				return (support.requiredSelect && support.validationMessage && (support.numericDateProps || $.inArray('form-number-date', toLoad) == -1) && !webshims.overrideValidationMessages );
			},
			dependencies: ['dom-support'],
			methodNames: ['setCustomValidity','checkValidity'],
			combination: ['combined-ff4', 'combined-webkit']
		});
		
		addPolyfill('form-native-fix', {
			feature: 'forms',
			test: function(){return support.requiredSelect && support.validationMessage && support.output && support.datalist;},
			dependencies: ['dom-support'],
			combination: ['combined-webkit']
		});
		
	} else {
		//this also serves as base for non capable browsers
		addPolyfill('form-extend', {
			feature: 'forms',
			src: 'form-shim-extend',
			noAutoCallback: true,
			methodNames: ['setCustomValidity','checkValidity'],
			dependencies: ['dom-support'],
			combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light', 'combined-ff3-light']
		});
	}
	
	
	addPolyfill('form-output-datalist', {
		feature: 'forms',
		noAutoCallback: true,
		test: function(){
			return support.output && support.datalist;
		},
		dependencies: ['dom-support', 'json-storage'],
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light', 'combined-ff3-light']
	});
	
	addPolyfill('form-number-date', {
		feature: 'forms-ext',
		noAutoCallback: true,
		dependencies: ['es5', 'forms', 'json-storage', 'dom-support'],
		test: function(){
			return support.numericDateProps;
		},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ff4'],
		options: {stepArrows: {number: 1, time: 1}, calculateWidth: true}
	});
	
	
			
	addPolyfill('inputUI', {
		feature: 'forms-ext',
		src: 'form-date-range-ui',
		test: function(){return (support.rangeUI && support.dateUI && !modules.inputUI.options.replaceNative);},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ff4'],
		noAutoCallback: true,
		dependencies: ['es5', 'forms','dom-support'],
		loadInit: function(){
			loader.loadList(['jquery-ui']);
			if(modules['input-widgets'].src){
				loader.loadList(['input-widgets']);
			}
		},
		options: {
			slider: {},
			datepicker: {},
			langSrc: 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.5/i18n/jquery.ui.datepicker-',
			availabeLangs: 'af ar az bg bs cs da de el en-GB eo es et eu fa fi fo fr fr-CH he hr hu hy id is it ja ko it lt lv ms nl no pl pt-BR ro ru sk sl sq sr sr-SR sv ta th tr uk vi zh-CN zh-HK zh-TW'.split(' '),
			recalcWidth: true,
			replaceNative: false
		}
	});
	
	
	if($.support.datalistProp){
		onReady('dom-extend', function(){
			$.webshims.defineNodeNameProperty('input', 'list', {
				set: function(value){
					var elem = this;
					if(value && value.getAttribute){
						value = $.webshims.getID(value);
					}
					elem.setAttribute('list', value);
				}
			});
		});
	}
	
	/* placeholder */
	
	support.placeholder = ($('<input type="text" />').attr('placeholder') != null);
	addPolyfill('form-placeholder', {
		feature: 'forms',
		test: function(){
			return support.placeholder;
		},
		noAutoCallback: true,
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light', 'combined-ff3-light']
	});
	/* END: placeholder */
	
	/* END: html5 forms */
	
	/* json + loacalStorage */
	
	support.jsonStorage = ('JSON' in window && 'localStorage' in window && 'sessionStorage' in window);
	addPolyfill('json-storage', {
		test: function(){
			return support.jsonStorage;
		},
		loadInit: function(){
			loader.loadList(['swfobject']);
		},
		noAutoCallback: true,
		combination: ['combined-ie7', 'combined-ie7-light']
	});
	
	/* END: json + loacalStorage */
	//predefined list without input type number/date/time etc.
	webshims.light = ['es5', 'canvas', 'geolocation', 'forms', 'json-storage'];
	
})(jQuery, this, this.document);
