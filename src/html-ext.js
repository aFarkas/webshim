(function($){
	var doc = document;
	//simple shiv
	'abbr article aside audio canvas details figcaption figure footer header hgroup mark meter nav output progress section source summary time track video'.replace(/\w+/g,function(n){doc.createElement(n);});
	$.support.dynamicHTML5 =  !!($('<video><div></div></video>')[0].innerHTML);
	
	var isReady = function(names, noReady, noForce){
		if(!names){return;}
		if(!$.isArray(names)){
			names = [names];
		}
		$.each(names, function(i, name){
			if(noForce && $.webshims.loader.modules[name] && $.webshims.loader.modules[name].noAutoCallback ){return;}
			if(!noReady){
				name = name +'Ready';
			}
			if($.event.special[name] && $.event.special[name].add){return;}
			$.event.trigger(name);
			$.event.special[name] = {
				add: function( details ) {
					details.handler.call(this, $.Event(name));
				}
			};
		});
	};
	$.webshims = {
		version: 'not versioned yet',
		fixHTML5: (function(){
			var d, b;
			return ($.support.dynamicHTML5) ? 
				function(h){return h;} :
				function(h) {
					if (!d) {
						b = document.body;
						d = document.createElement('div');
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
		createReadyEvent: isReady,
		loader: {
			basePath: (function(){
				var scripts = $('script'),
					path 	= scripts[scripts.length - 1].src.split('?')[0]
				;
				return path.slice(0, path.lastIndexOf("/") + 1);
			})(),
			combinations: {},
			moduleList: [],
			modules: {},
			features: {},
			featureList: [],
			addModule: function(name, ext){
				this.modules[name] = ext;
			},
			loadList: (function(){
				var loadedModules = [];
				return function(list){
					var toLoad = [],
						loader = $.webshims.loader
					;
					$.each(list, function(i, name){
						var module = loader.modules[name];
						if ('test' in module && module.test()) {
							isReady(name);
							return;
						}
						if (module.css) {
							loader.loadCSS(module.css);
						}
						toLoad.push(name);
					});
					
					
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
					$.each(toLoad, function(i, loadName){
						if ($.inArray(loadName, loadedModules) == -1) {
							loader.loadScript(loader.modules[loadName].src || loadName, false, loadName);
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
				return $.webshims.loader.basePath + src;
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
					$(doc.createElement('link'))
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
					
					src = $.webshims.loader.makePath(src);
					if($.inArray(src, loadedSrcs) != -1){
						return;
					}
					parent = parent || doc.getElementsByTagName('head')[0] || doc.body;
					if(!parent || !parent.appendChild){
						setTimeout(function(){
							$.webshims.loader.loadScript(src, callback);
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
								isReady(name, false, true);
								script = null;
							}
						}
					;
					script.src = src;
					script.onload = onLoad;
					script.onerror = onLoad;
					script.onreadystatechange = onLoad;
					parent.appendChild(script);
					loadedSrcs.push(src);
				};
			})()
		},
		readyModules: function(events, fn, _create){
			if(typeof events == 'string'){
				events = events.split(' ');
				_create = true;
			}
			if(_create){
				events = $.map(events, function(e){
					return ($.webshims.loader.modules[e] || $.webshims.loader.features[e]) ? e +'Ready' : e;
				});
			}
			if(!events.length){
				fn();
				return;
			}
			
			$(doc).one(events.shift(), function(){
				$.webshims.readyModules(events, fn);
			});
		},
		capturingEvents: function(names){
			if(!doc.addEventListener){return;}
			if(typeof names == 'string'){
				names = [names];
			}
			$.each(names, function(i, name){
				var handler = function( e ) { 
					e = $.event.fix( e );
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
				
				$.webshims.attr(name, {
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
		addModule: (function(){
			var addMethodName = function(moduleName, name, elementNames, bugFix){
							
				var fn = bugFix || function(elem, args){
					if(elem[name]){
						return elem[name].apply(elem, args);
					}
				};
				
				$.fn[name] = function(){
					var args = arguments,
						ret
					;
					this.each(function(){
						ret = fn(this, args);
						if(ret !== undefined){
							return false;
						}
					});
					return (ret !== undefined) ? ret : this;
				};
				$.fn[name].shim = false; 
				$.fn[name].elementNames = elementNames;
				
			};
			return function(name, cfg){
				cfg = cfg || {};
				var feature 		= cfg.feature || name,
					loader 			= $.webshims.loader,
					combinations 	= loader.combinations
				;
				if(!loader.features[feature]){
					loader.features[feature] = [];
					loader.featureList.push(feature);
				}
				loader.features[feature].push(name);
				loader.addModule(name, cfg);
				loader.moduleList.push(name);
				$.each(cfg.combination || [], function(i, combi){
					if(!combinations[combi]){
						combinations[combi] = [name];
					} else {
						loader.combinations[combi].push(name);
					}
				});
				if(cfg.methodNames) {
					if (!$.isArray(cfg.methodNames)) {
						cfg.methodNames = [cfg.methodNames];
					}
					$.each(cfg.methodNames, function(i, methodName){
						addMethodName(name, methodName.name, methodName.elementNames, methodName.bugFix);
					});
				}
			};
		})(),
		
		polyfill: function(features){
			var loader 	= $.webshims.loader,
				toLoadFeatures = []
			;
			features = features || loader.featureList;
			if (typeof features == 'string') {
				features = features.split(' ');
			}
			
			$.each(features, function(i, feature){
				if(feature !== loader.features[feature][0]){
					$.webshims.readyModules(loader.features[feature], function(){
						isReady(feature);
					}, true);
				}
				toLoadFeatures = toLoadFeatures.concat(loader.features[feature]);
			});
			loader.loadList(toLoadFeatures);
		},
		activeLang: (function(){
			var langs = [navigator.browserLanguage || navigator.language || ''];
			if(langs[0] == 'en-US'){
				langs[0] = 'en';
			}
			var paLang = $('html').attr('lang');
			if(paLang){
				langs.push(paLang);
			}
			return function(lang, module, fn){
				if(lang){
					if(!module || !fn){
						lang = (lang == 'en-US') ? '' : lang;
						langs[0] = lang;
						$(doc).triggerHandler('htmlExtLangChange', langs);
					} else {
						module = $.webshims.loader.modules[module].options;
						var langObj = lang,
							loadRemoteLang = function(lang){
								if($.inArray(lang, remoteLangs) !== -1){
									$.webshims.loader.loadScript(module.langSrc+lang+'.js', function(){
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
							if(remoteLangs && module.langSrc !== undefined && (loadRemoteLang(lang) || loadRemoteLang(shortLang))){
								return false;
							}
						});
					}
				}
				return langs;
			};
		})()
	};
	
	(function(){
		var readyFns = [];
		$.extend($.webshims, {
			addReady: function(fn){
				var readyFn = function(context){
					$(function(){fn(context);});
				};
				readyFns.push(readyFn);
				readyFn(document);
			},
			triggerDomUpdate: function(context){
				if(!context){return;}
				$.each(readyFns, function(i, fn){
					fn(context);
				});
			}
		});
		
	})();
	if(!$.support.dynamicHTML5 && document.attachEvent){
		$.webshims.loader.loadScript('http://html5shim.googlecode.com/svn/trunk/html5.js');
	}
	
	$.fn.htmlWebshim = function(a){
		var ret = this.html((a) ? $.webshims.fixHTML5(a) : a);
		if(ret === this && $.isReady){
			this.each(function(){
				$.webshims.triggerDomUpdate(this);
			});
		}
		return ret;
	};
	
	$.each(['after', 'before', 'append', 'prepend'], function(i, name){
		$.fn[name+'Webshim'] = function(a){
			var elems = $($.webshims.fixHTML5(a));
			this[name](elems);
			if($.isReady){
				elems.each(function(){
					$.webshims.triggerDomUpdate(this);
				});
			}
			return this;
		};
	});
	
	isReady('htmlExtLangChange', true);
})(jQuery);
