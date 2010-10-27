(function($){
	"use strict";
	var doc = document;
	var support = $.support;
	var undefined;
	//simple shiv
	//http://code.google.com/p/html5shim/
	'polyfillspan abbr article aside audio canvas details figcaption figure footer header hgroup mark meter nav output progress section source summary time track video'.replace(/\w+/g,function(n){doc.createElement(n);});
	support.dynamicHTML5 =  !!($('<video><div></div></video>')[0].innerHTML);
	

	
	$.webshims = {
		
		version: '1.0.0',
		
		fixHTML5: (function(){
			var d, b;
			return (support.dynamicHTML5) ? 
				function(h){return h;} :
				function(h) {
					if (!d) {
						b = doc.body;
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
		})(),
		
		createReadyEvent: (function(){
			var makeReady = function(triggerName, name, noForce){
				
				if(modules[name] || webshims.features[name]){
					triggerName = triggerName +'Ready';
				}
				
				if($.event.special[triggerName] && $.event.special[triggerName].add){return;}
				
				$.event.special[triggerName] = $.extend($.event.special[triggerName] || {}, {
					add: function( details ) {
						details.handler.call(this, $.Event(triggerName));
					}
				});
				$.event.trigger(triggerName);
			};
			return function(names){
				var noForce = arguments[1];
				if(!names){return;}
				if(!$.isArray(names)){
					names = [names];
				}
				
				$.each(names, function(i, name){
					if(noForce && modules[name] && modules[name].noAutoCallback ){return;}
					makeReady(name+'SYS', name, noForce);
					makeReady(name, name, noForce);
				});
			};
		})(),
		
		moduleList: [],
		
		modules: {},
		
		features: {},
		
		featureList: [],
		
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
						if ('test' in module && module.test()) {
							isReady(name);
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
				
				if(src.indexOf('.js') == -1 && src.indexOf('.css') == -1){
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
					parent = parent || doc.getElementsByTagName('head')[0] || doc.body;
					loadedSrcs.push(src);
					$('<link rel="stylesheet" href="'+src+'" />')
						.prependTo(parent)
						.attr({
							href: src,
							rel: 'stylesheet'
						})
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
					parent = parent || doc.getElementsByTagName('head')[0] || doc.body;
					if(!parent || !parent.appendChild){
						setTimeout(function(){
							loader.loadScript(src, callback);
						}, 10);
						return;
					}
					
					var script = doc.createElement('script'),
						onLoad = function(e){
							
							if(!this.readyState ||
										this.readyState == "loaded" || this.readyState == "complete"){
								script.onload =  null;
								script.onerror = null;
								script.onreadystatechange = null;
								if(callback){
									callback(e, this);
								}
								isReady(name, true);
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
		},
		
		ready: function(events, fn /*, _notQueued, _created*/){
			var _created = arguments[3],
				_notQueued 	= arguments[2]
			;
			if(typeof events == 'string'){
				events = events.split(' ');
			}
			
			if(!_created){
				events = $.map(events, function(e){
					var evt = e;
					if(_notQueued && evt != 'ready'){
						evt += 'SYS';
					}
					if(modules[e] || webshims.features[e]){
						evt += 'Ready';
					}
					return evt;
				});
			}
			
			if(!events.length){
				fn($, webshims, window, document);
				return;
			}
			var readyEv = events.shift(),
				readyFn = function(){
					webshims.ready(events, fn, _notQueued, true);
				}
			;
			
			if(readyEv == 'ready'){
				$(readyFn);
			} else {
				$(doc).one(readyEv, readyFn);
			}
		},
		
		capturingEvents: function(names/*, _maybePrevented */){
			if(!doc.addEventListener){return;}
			var _maybePrevented = arguments[1];
			if(typeof names == 'string'){
				names = [names];
			}
			$.each(names, function(i, name){
				var handler = function( e ) { 
					e = $.event.fix( e );
					if(_maybePrevented){
						var preventDefault = e.preventDefault;
						e.preventDefault =  function(){
							preventDefault.apply(this, arguments);
							var timer = $.data(e.target, 'maybePrevented'+e.type);
							if(timer){
								clearTimeout(timer);
							}
							$.data(e.target, 'maybePrevented'+e.type, setTimeout(function(){
								$.removeData(e.target, 'maybePrevented'+e.type);
							}, 90));
							
						};
					}
					return $.event.handle.call( this, e );
				};
				$.event.special[name] = $.event.special[name] || {};
				$.extend($.event.special[name], {
					setup: function() {
						this.addEventListener(name, handler, true);
					}, 
					teardown: function() { 
						this.removeEventListener(name, handler, true);
					}
				});
			});
		},
		
		attr: (function(){
			var attrFns = [{}];
			var undefined;
			var generateAttr = function(attrNames){
				var oldAttr = $.attr;
				$.attr = function(elem, name, value, pass, extra){
					if( !attrNames[name] || elem.nodeType !== 1 || (attrNames[name].elementNames[0] !== '*' && $.inArray( (elem.nodeName || '').toLowerCase(), attrNames[name].elementNames ) === -1) ){
						return oldAttr(elem, name, value, pass, extra);
					}
					var oldEval = function(){
						if(value === undefined){
							var ret = oldAttr(elem, name, value, pass, extra);
							return ret;
						}
						return oldAttr(elem, name, value, pass, extra);
					};
					if(value === undefined){
						return attrNames[name].getter(elem, oldEval, value, pass, extra);
					}
					attrNames[name].setter(elem, value, oldEval, pass, extra);
				};
			};
			
			generateAttr(attrFns[0]);
			return function(name, ext) {
				ext.elementNames = ext.elementNames || ['*'];
				if(!ext.setter){
					ext.setter = function(){
						throw(name + ' is readonly');
					};
				} else if( !$.isFunction( ext.setter ) ) {
					ext.setter = function(elem, value, oldEval){
						return oldEval();
					};
				}
				if( !ext.getter || !$.isFunction( ext.getter ) ) {
					ext.getter = function(elem, oldEval){
						return oldEval();
					};
				}
				if( typeof ext.elementNames == 'string' ){
					ext.elementNames = [ext.elementNames];
				}
				
				
				var found = false;
				$.each(attrFns, function(i, attrFn){
					if(!attrFn[name]){
						attrFn[name] = ext;
						found = true;
						return false;
					}
				});
				
				if(!found){
					var attrFn = {};
					attrFn[name] = ext;
					generateAttr(attrFn);
					attrFns.push(attrFn);
				}
			};
		})(),
		
		createBooleanAttrs: function(names, elementNames){
			if(typeof name === 'string'){
				names = [names];
			}
			
			$.each(names, function(i, name){
				
				webshims.attr(name, {
					elementNames: elementNames,
					getter: function(elem){
						return (typeof elem[name] == 'boolean') ? elem[name] : !!( (elem.attributes[name] || {}).specified );
					},
					setter: function(elem, val){
						val = !!val;
						if(!val){
							elem.removeAttribute(name);
						} else {
							elem.setAttribute(name, name);
						}
						elem[name] = val;
					}
				});
			});
		},
		
		addMethod: function(name, fn){
			var elementNames = $.fn[name].elementNames || ['*'];
			if( typeof elementNames == 'string' ){
				elementNames = [ext.elementNames];
			}
			$.fn[name] = function(){
				var args = arguments,
					ret
				;
				this.each(function(){
					if (elementNames[0] == '*' || $.inArray((this.nodeName || '').toLowerCase(), elementNames) !== -1) {
						ret = fn.apply(this, args);
						return (ret !== undefined);
					}
				});
				return (ret === undefined) ? this : ret;
			};
			$.fn[name].elementNames = elementNames;
			$.fn[name].shim = true;
		},
		
		addMethodName: function(name, elementNames){
			if($.fn[name] && 'shim' in $.fn[name]){return;}
			$.fn[name] = function(){
				var args = arguments,
					ret
				;
				this.each(function(){
					if(this[name]){
						ret = this[name].apply(this, args);
						if(ret !== undefined){
							return false;
						}
					}
				});
				return (ret !== undefined) ? ret : this;
			};
			$.fn[name].shim = false; 
			$.fn[name].elementNames = elementNames;
			
		},
		
		addPolyfill: function(name, cfg){
			cfg = cfg || {};
			var feature 		= cfg.feature || name,
				shims 			= webshims
			;
			if(!shims.features[feature]){
				shims.features[feature] = [];
				shims.featureList.push(feature);
			}
			shims.features[feature].push(name);
			loader.addModule(name, cfg);
			shims.moduleList.push(name);
			$.each(cfg.combination || [], function(i, combi){
				if(!combinations[combi]){
					combinations[combi] = [name];
				} else {
					combinations[combi].push(name);
				}
			});
			if(cfg.methodNames) {
				if (!$.isArray(cfg.methodNames)) {
					cfg.methodNames = [cfg.methodNames];
				}
				
				$.each(cfg.methodNames, function(i, methodName){
					webshims.addMethodName(methodName.name, methodName.elementNames);
				});
			}
		},
		
		polyfill: function(features){
			var shims 	= this,
				loader 	= shims.loader,
				toLoadFeatures = []
			;
			features = features || shims.featureList;
			if(features == 'lightweight'){
				features = webshims.light;
			}
			if (typeof features == 'string') {
				features = features.split(' ');
			}
			
			$.each(features, function(i, feature){
				if(feature !== shims.features[feature][0]){
					shims.ready(shims.features[feature], function(){
						isReady(feature);
					}, true);
				}
				toLoadFeatures = toLoadFeatures.concat(shims.features[feature]);
			});
			loader.loadCSS('shim.css');
			loader.loadList(toLoadFeatures);
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
								$(doc).triggerHandler('htmlExtLangChange', langs);
							}, 9);
						}
					} else {
						module = modules[module].options;
						var langObj = lang,
							loadRemoteLang = function(lang){
								if($.inArray(lang, remoteLangs) !== -1){
									loader.loadScript(module.langSrc+lang+'.js', function(){
										if(langObj[lang]){
											fn(langObj[lang]);
										}
									});
									return true;
								}
								return false;
							},
							remoteLangs = module && module.availabeLangs
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
	};
	
	var webshims 		= $.webshims,
		isReady 		= webshims.createReadyEvent,
		loader 			= webshims.loader,
		modules 		= webshims.modules,
		combinations 	= loader.combinations,
		addPolyfill 	= webshims.addPolyfill
	;
	
	(function(){
		var readyFns = [];
		$.extend(webshims, {
			addReady: function(fn){
				var readyFn = function(context){
					$(function(){fn(context);});
				};
				readyFns.push(readyFn);
				readyFn(doc);
			},
			triggerDomUpdate: function(context){
				if(!context){return;}
				$.each(readyFns, function(i, fn){
					fn(context);
				});
			}
		});
		
	})();
	
	$.fn.htmlWebshim = function(a){
		var ret = this.html((a) ? webshims.fixHTML5(a) : a);
		if(ret === this && $.isReady){
			this.each(function(){
				webshims.triggerDomUpdate(this);
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
					webshims.triggerDomUpdate(this);
				});
			}
			return this;
		};
	});
	
	$.each({'height': ['height', 'innerHeight', 'outerHeight'], 'width': ['width', 'innerWidth', 'outerWidth']}, function(prop, fns){
		$.each(fns, function(i, fn){
			$.fn['get'+ fn] = function(){
				if(!this[0]){return false;}
				var ret = $.fn[fn].apply(this, arguments),
					add
				;
				if(!this[0].offsetHeight && !this[0].offsetWidth){
					add = parseInt(this.css(prop), 10);
					if(!add){
						return false;
					}
					ret += add;
				}
				return ret;
			};
		});
	});
	
	isReady('htmlExtLangChange', true);
	
	/*
	 * Start Features 
	 */
	
	/* general modules */
	/* change path $.webshims.modules[moduleName].src */
	
	
	loader.addModule('jquery-ui', {
		src: 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.5/jquery-ui.min.js',
		test: function(){return !!($.widget && $.Widget);}
	});
	
	loader.addModule('swfobject', {
		src: 'http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js',
		test: function(){return ('swfobject' in window);}
	});
	
	/* 
	 * polyfill-Modules 
	 */
	addPolyfill('html5shiv', {
		test: function(){
			return support.dynamicHTML5;
		},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie7-light', 'combined-ie8-light']
	});
	// webshims lib uses a of http://github.com/kriskowal/es5-shim/ to implement
	support.es5 = !!(String.prototype.trim && Function.prototype.bind && !isNaN(Date.parse("T00:00")) && Date.now && Date.prototype.toISOString);
	if(support.es5){
		$.each(['filter', 'map', 'every', 'reduce', 'reduceRight', 'lastIndexOf'], function(i, name){
			if(!Array.prototype[name]){
				support.es5 = false;
				return false;
			}
		});
	}
	if(support.es5){
		$.each(['keys', 'isExtensible', 'isFrozen', 'isSealed', 'preventExtensions', 'defineProperties', 'create', 'getOwnPropertyNames'], function(i, name){
			if(!Object[name]){
				$.support.es5 = false;
				return false;
			}
		});
	}
	
	addPolyfill('es5', {
		test: function(){
			return support.es5;
		},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ff3', 'combined-ie7-light', 'combined-ie8-light', 'combined-ff3-light']
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
		methodNames: [
			{
				name: 'getContext',
				elementNames: ['canvas']
			}
		],
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie7-light', 'combined-ie8-light']
	});
	/* END: canvas */
	
	/*
	 * HTML5 FORM-Features
	 */
	
	/* html5 constraint validation */
	support.validity = ('checkValidity' in $('<form action="#" />')[0]);
	
	/* bugfixes, validation-message + fieldset.checkValidity pack */
	
	(function(){
		webshims.validityMessages = [];
		webshims.inputTypes = {};
		var form = $('<form action="#"><fieldset><input name="a" required /></fieldset></form>'),
			field = $('fieldset', form)[0]
		;
		support.validationMessage = !!(form.find('input').attr('validationMessage'));
		support.fieldsetValidation = !!(field.elements && field.checkValidity && 'disabled' in field && !field.checkValidity() );
		addPolyfill('validation-base', {
			feature: 'forms',
			noAutoCallback: true,
			test: function(){
				//always load
				return false; //($.support.validationMessage && $.support.fieldsetValidation);
			},
			combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ff4', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light', 'combined-ff3-light']
		});
	})();
	
	addPolyfill('output', {
			feature: 'forms',
			noAutoCallback: true,
			test: function(){
				return ( 'value' in doc.createElement('output') );
			},
			combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light', 'combined-ff3-light']
		});
	
	
	addPolyfill('validity', {
		feature: 'forms',
		noAutoCallback: true,
		test: function(){
			return support.validity;
		},
		methodNames: [
			{
				name: 'setCustomValidity',
				elementNames: ['input', 'select', 'textarea']
			},
			{
				name: 'checkValidity',
				elementNames: ['form', 'fieldset', 'input', 'select', 'textarea']
			}
		],
		options: {},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light', 'combined-ff3-light']
	});
	
	
	if(support.validity === true){
		//create delegatable-like events
		webshims.capturingEvents(['input']);
		webshims.capturingEvents(['invalid'], true);
	}
		
	
	addPolyfill('number-date-type', {
		feature: 'forms-ext',
		noAutoCallback: true,
		test: function(){
			return ($('<input type="datetime-local" />').attr('type') === 'datetime-local' && $('<input type="range" />').attr('type') === 'range');
		},
		
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ff4'],
		options: {stepArrows: {number: 1, time: 1}, calculateWidth: true}
	});
	
	support.inputUI = ($('<input type="range" />')[0].type == 'range' && $('<input type="date" />')[0].type == 'date');
	addPolyfill('inputUI', {
		feature: 'forms-ext',
		test: function(){return (support.inputUI && !modules.inputUI.options.replaceNative);},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ff4'],
		noAutoCallback: true,
		loadInit: function(){
			loader.loadList(['jquery-ui']);
		},
		options: {
			slider: {},
			date: {},
			langSrc: 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.5/i18n/jquery.ui.datepicker-',
			availabeLangs: 'af ar az bg bs cs da de el en-GB eo es et eu fa fi fo fr fr-CH he hr hu hy id is it ja ko it lt lv ms nl no pl pt-BR ro ru sk sl sq sr sr-SR sv ta th tr uk vi zh-CN zh-HK zh-TW'.split(' '),
			recalcWidth: true,
			replaceNative: false
		}
	});
	
	
	/* placeholder */
	
	support.placeholder = ($('<input type="text" />').attr('placeholder') != null);
	addPolyfill('placeholder', {
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
	
	
	/* END: json + loacalStorage */
	//predefined list without input type number/date/time etc.
	webshims.light = ['html5shiv', 'es5', 'canvas', 'forms', 'json-storage'];
	
})(jQuery);
