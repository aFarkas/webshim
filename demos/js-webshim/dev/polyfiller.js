(function($, window, document, undefined){
	"use strict";
	
//	$.each(['jQuery', 'Modernizr', 'yepnope'], function(i, dependcy){
//		if(!window[dependcy]){
//			throw("you have to include "+ dependcy +" before webshims lib");
//		}
//	});
	
	
	
	
	var special = $.event.special;
	
	$.webshims = {
		
		version: 'pre1.5.0',
		cfg: {
			useImportantStyles: true,
			removeFOUC: false,
			waitReady: true,
			extendNative: false
		},
		implement: {},
		/*
		 * some data
		 */
		modules: {}, features: {}, featureList: [],
		log: function(message1, message2){
			if(webshims.debug && window.console && console.log){
				return console.log.apply(this, arguments);
			}
		},
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
					}, 400);
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
				
				
				if(fn){
					onReady(features, function(){
						fn($, webshims, window, document);
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
				if(special[name] && special[name].add){return true;}
					
					special[name] = $.extend(special[name] || {}, {
						add: function( details ) {
							details.handler.call(this, $.Event(name));
						}
					});
					$.event.trigger(name);
			}
			return special[name] && special[name].add || false;
		},
		
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
			
			if(readyEv == 'readyReady'){
				$(readyFn);
			} else {
				$(document).one(readyEv, readyFn);
			}
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
				var scripts = $('script'),
					path 	= scripts[scripts.length - 1].src.split('?')[0]
				;
				return path.slice(0, path.lastIndexOf("/") + 1);
			})(),
			
			combinations: {},
			
			addModule: function(name, ext){
				modules[name] = ext;
			},
			
			loadList: (function(){
				var loadedModules = [];
				return function(list){
					var toLoad = [];
					
					$.each(list, function(i, name){
						var module = modules[name];
						if ('test' in module && module.test(list)) {
							isReady(name, true);
							return;
						}
						if (module.css) {
							loader.loadCSS(module.css);
						}
						toLoad.push(name);
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
						onLoad = function(e){
							
							if(!this.readyState ||
										this.readyState == "loaded" || this.readyState == "complete"){
								script.onload =  null;
								script.onerror = null;
								script.onreadystatechange = null;
								if(callback){
									callback(e, this);
								}
								
								if(name){
									if(typeof name == 'string'){
										name = name.split(' ');
									}
									$.each(name, function(i, name){
										
										if(modules[name] && !modules[name].noAutoCallback){
											isReady(name, true);
										}
									});
									
								}
								
								script = null;
							}
						}
					;
					script.setAttribute('async', 'async');
					script.src = src;
					script.onload = onLoad;
					script.onerror = onLoad;
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
					$(function(){fn(context, elem);});
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
			return !($.widget && !($.datepicker || $.fn.slider));
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
	
	/* geolocation */
	support.geolocation = ('geolocation'  in navigator);
	addPolyfill('geolocation', {
		test: function(){
			return support.geolocation;
		},
		options: {destroyWrite: true},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light']
	});
	/* END: geolocation */
	
	/* canvas */
	support.canvas = ('getContext'  in $('<canvas />')[0]);
	
	addPolyfill('canvas', {
		test: function(){
			return support.canvas;
		},
		noAutoCallback: true,
		methodNames: ['getContext'],
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie7-light', 'combined-ie8-light']
	});
	/* END: canvas */
	
	/*
	 * HTML5 FORM-Features
	 */
	
	/* html5 constraint validation */
	
	
	/* bugfixes, validation-message + fieldset.checkValidity pack */
	webshims.validityMessages = [];
	webshims.inputTypes = {};
	
	(function(){
		var form = $('<form action="#"><fieldset><input name="a" required /><select><option>y</option></select></fieldset></form>'),
			field = $('fieldset', form)[0],
			range = $('<input type="range" />')[0],
			date = $('<input type="date" />')[0]
		;
		
		support.validity = ('checkValidity' in form[0]);
		support.validationMessage = !!($('input', form).attr('validationMessage'));
		support.fieldsetValidation = !!(field.elements && field.checkValidity && 'disabled' in field && !field.checkValidity() );
		support.output = !!( 'value' in document.createElement('output') );
		support.datalistProp = ('list' in $('input', form)[0] && 'options' in document.createElement('datalist'));
		support.datalist = (support.datalistProp && window.HTMLDataListElement);
		support.numericDateProps = (range.type == 'range' && date.type == 'date');
		support.requiredSelect = ('required' in $('select', form)[0]);
		
		support.rangeUI = support.numericDateProps;
		support.dateUI = support.numericDateProps;
		if(window.Modernizr){
			support.rangeUI = Modernizr.inputtypes.range;
			support.dateUI = Modernizr.inputtypes.date;
		}
		
		form = null;
		field = null;
		range = null;
		date = null;
	})();
	
	
	addPolyfill('form-core', {
		feature: 'forms',
		noAutoCallback: true,
		loadInit: function(){
			setTimeout(function(){
				webshims.polyfill(['es5']);
			}, 0);
		},
		//no test = always load
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ff4', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light', 'combined-ff3-light', 'combined-webkit']
	});
	
	addPolyfill('form-message', {
		feature: 'forms',
		test: function(toLoad){
			return (support.validationMessage && !webshims.implement.customValidationMessage && modules['form-extend'].test(toLoad) );
		},
		options: {},
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
			loadInit: function(){
				setTimeout(function(){
					loader.loadList(['form-message']);
				}, 0);
			},
			methodNames: ['setCustomValidity','checkValidity'],
			combination: ['combined-ff4', 'combined-webkit']
		});
		
		addPolyfill('form-native-fix', {
			feature: 'forms',
			test: function(){return support.requiredSelect && support.validationMessage && support.output && support.datalist;},
			combination: ['combined-webkit']
		});
		
	} else {
		//this also serves as base for non capable browsers
		addPolyfill('form-extend', {
			feature: 'forms',
			src: 'form-shim-extend',
			noAutoCallback: true,
			test: function(){
				return false;
			},
			methodNames: ['setCustomValidity','checkValidity'],
			combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light', 'combined-ff3-light']
		});
	}
	
	addPolyfill('form-number-date', {
		feature: 'forms-ext',
		noAutoCallback: true,
		
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
	
	
	addPolyfill('form-output-datalist', {
		feature: 'forms',
		noAutoCallback: true,
		test: function(){
			return support.output && support.datalist;
		},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light', 'combined-ff3-light']
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
	
	support.dynamicHTML5 =  !!($('<video><div></div></video>')[0].innerHTML);
	addPolyfill('html5shiv', {
		test: function(){
			return support.dynamicHTML5;
		},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie7-light', 'combined-ie8-light']
	});
	/* END: json + loacalStorage */
	//predefined list without input type number/date/time etc.
	webshims.light = ['es5', 'html5shiv', 'canvas', 'geolocation', 'forms', 'json-storage'];
	
})(jQuery, this, this.document);

//DOM-Extension helper
jQuery.webshims.ready('es5', function($, webshims, window, document, undefined){
	//shortcus
	var support = $.support;
	var modules = webshims.modules;
	var has = Object.prototype.hasOwnProperty;
	
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
			if(value === undefined){
				return (desc.get) ? desc.get.call(elem) : desc.value; 
			} else if(desc.set) {
				ret = desc.set.call(elem, value);
				handeld = true;
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
		var getSup = function(propType, descriptor){
			if(descriptor && descriptor[propType]){
				return descriptor[propType];
			}
			return function(value){
				return oldAttr(this, prop, value);
			};
		};
		extendedProps[nodeName][prop] = desc;
		if(desc.value === undefined){
			if(!desc.set){
				desc.set = desc.writeable ? getSup('set', desc) : function(){throw(prop +'is readonly on '+ nodeName);};
			}
			if(!desc.get){
				desc.get = getSup('get', desc);
			}
			
		}
		
		$.each(['value', 'get', 'set'], function(i, descProp){
			if(desc[descProp]){
				desc['_sup'+descProp] = getSup(descProp, oldDesc);
			}
		});
	};
	
	// resetting properties with magic content attributes
	var initProp = (function(){
		var nodeNameCache = {};
		var initProps = {};
		var initExtendProps = {};
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
			
			
			$.each(initExtendProps, function(name, props){
				getElementsByName(name);
				$.each(props, function(prop, desc){
					nodeNameCache[name].each(function(){
						transformDescriptor(this, prop, desc);
						webshims.defineProperty(this, prop, desc);
					});
				});
			});
			
			$.each(initProps, function(name, props){
				getElementsByName(name);
				props.forEach(function(prop){
					nodeNameCache[name].filter('['+ prop +']').attr(prop, function(i, val){
						return val;
					});
				});
			});
			
			isReady = true;
		});
		return {
			extend: function(nodeName, prop, desc){
				if(!initExtendProps[nodeName]){
					initExtendProps[nodeName] = {};
				} 
				initExtendProps[nodeName][prop] = desc;
				if(isReady){
					nodeNameCache[nodeName] = nodeNameCache[nodeName] || $( document.getElementsByTagName(nodeName) );
					nodeNameCache[nodeName].each(function(){
						transformDescriptor(this, prop, desc);
						webshims.defineProperty(this, prop, desc);
					});
				}
			},
			init: function(nodeName, prop){
				if(!initProps[nodeName]){
					initProps[nodeName] = [prop];
				} else {
					initProps[nodeName].push(prop);
				}
				if(isReady){
					nodeNameCache[nodeName] = nodeNameCache[nodeName] || $( document.getElementsByTagName(nodeName) );
					nodeNameCache[nodeName].filter('['+ prop +']').attr(prop, function(i, val){
						return val;
					});
				}
			}
		};
	})();
	
	
	var transformDescriptor = function(proto, prop, desc){
		var oDesc;
		var getSup = function(descriptor, accessType){
			if(descriptor && descriptor[accessType]){
				return descriptor[accessType];
			}
			
			if(descriptor.value !== undefined){
				//if original is a value, but we use an accessor
				if(accessType == 'set'){
					return function(val){descriptor.value = val;};
				}
				if(accessType == 'get'){
					return function(){return descriptor.value;};
				}
			}
			return function(value){
				return webshims.contentAttr(this, prop, value);
			};
		};
		if(desc.value === undefined){
			if(!desc.set){
				desc.set =  (!desc.writeable) ? function(){throw(prop +'is readonly on '+ this.nodeName);} : getSup(desc, 'set');
			}
			if(!desc.get){
				desc.get = getSup(desc, 'get');
			}
		}
		
		if(proto && prop){
			
			while(proto && prop in proto && !has.call(proto, prop)){
				proto = webshims.getPrototypeOf(proto);
			}
			
			oDesc = webshims.getOwnPropertyDescriptor(proto, prop) || {configurable: true};
			
			if(!oDesc.configurable && !oDesc.writeable){return false;}
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
		return true;
	};
	
	$.extend(webshims, {
		defineNodeNameProperty: function(nodeName, prop, desc, extend, htc){
			desc = $.extend({writeable: true}, desc);
			var oDesc;
			var extendedNative = false;
			if(webshims.cfg.extendNative && extend){
				(function(){
					var element = document.createElement(nodeName);
					if(support.objectAccessor && support.contentAttr){
						//ToDo: property on unknown element
						
						var proto  = webshims.getPrototypeOf(element);
						//extend unknown property on known element
						if(!(prop in element)){
							transformDescriptor(false, false, desc);
							webshims.defineProperty(proto, prop, desc);
							extendedNative = true;
							return;
						}
						//extend element itself
						if(has.call(element, prop)){
							oDesc = webshims.getOwnPropertyDescriptor(element, prop);
							if(!oDesc.configurable && !oDesc.writeable){return false;}
							initProp.extend(nodeName, prop, desc);
							extendedNative = true;
							return;
						}
						
						if(!transformDescriptor(proto, prop, desc)){return;}
						webshims.defineProperty(proto, prop, desc);
						extendedNative = true;
						return;
					} else if(htc && support.dhtmlBehavior && !(prop in element)){
						
					}
				})();
			}
			if(!extendedNative){
				if(extend && webshims.cfg.extendNative){
					webshims.log("could not extend "+ nodeName +"["+ prop +"] fallback to jQuery extend");
				}
				extendQAttr(nodeName, prop, desc);
			}
			if(desc.init){
				initProp.init(nodeName, prop);
			}
			return desc;
		},
		defineNodeNamesProperty: function(names, prop, desc){
			if(typeof names == 'string'){
				names = names.split(/\s*,\s*/);
			}
			$.each(names, function(i, nodeName){
				webshims.defineNodeNameProperty(nodeName, prop, desc);
			});
		},
		onNodeNamesPropertyModify: function(nodeNames, prop, desc){
			if(typeof nodeNames == 'string'){
				nodeNames = nodeNames.split(/\s*,\s*/);
			}
			if($.isFunction(desc)){
				desc = {set: desc};
			}
			$.each(nodeNames, function(i, name){
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
		defineNodeNamesBooleanProperty: function(elementNames, prop, setDesc){
			
			var desc = {
				set: function(val){
					var elem = this;
					val = !!val;
					elem[prop] = val;
					webshims.contentAttr(elem, prop, val);
					return val;
				},
				get: function(){
					var val;
					var elem = this;
					if(support.contentAttr && prop in elem){
						val = !!elem[prop];
					} else {
						val = (webshims.contentAttr(elem, prop) != null);
					}
					return val;
				}
			};
			webshims.defineNodeNamesProperty(elementNames, prop, desc);
			if(setDesc){
				webshims.onNodeNamesPropertyModify(elementNames, prop, setDesc);
			}
		},
		contentAttr: function(elem, name, val){
			if(!elem.nodeName){return;}
			if(!support.contentAttr && webshims.cfg.extendNative){
				if(val === undefined){
					val = $.data(elem, 'polyfilledProp-'+name);
					if(val !== undefined){return val;}
					return elem.attributes[name] && elem.attributes[name].value;
				} else {
					$.data(elem, 'polyfilledProp-'+name, val);
				}
				return;
			}
			
			if(val === undefined){
				val = elem.getAttribute(name);
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
});
