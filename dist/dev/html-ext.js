(function($){
	var doc = document;
	//simple shiv
	'abbr article aside audio canvas details figcaption figure footer header hgroup mark meter nav output progress section source summary time track video'.replace(/\w+/g,function(n){doc.createElement(n);});
	$.support.dynamicHTML5 =  !!($('<video><div></div></video>')[0].innerHTML);
	
	var isReady = function(names, noReady){
		if(!names){return;}
		if(!$.isArray(names)){
			names = [names];
		}
		$.each(names, function(i, name){
			if(!noReady){
				name = name +'Ready';
			}
			$.event.trigger(name);
			$.event.special[name] = {
				add: function( details ) {
					details.handler.call(this, $.Event(name));
				}
			};
		});
	};
	$.htmlExt = {
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
			addModule: function(name, ext){
				this.moduleList.push(name);
				this.modules[name] = ext;
			},
			loadList: (function(){
				var loadedModules = [];
				return function(list){
					list = list || this.moduleList;
					if (typeof list == 'string') {
						list = [list];
					}
					var toLoad = [],
						loader = $.htmlExt.loader
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
					
					
					$.each(loader.combinations, function(combi, combiModules){
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
							loader.loadScript(loadName, false, loadName);
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
				return $.htmlExt.loader.basePath + src;
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
					$('<link />', {
						href: src,
						rel: 'stylesheet'
					}).prependTo(parent);
				};
			})(),
			loadScript: (function(){
				var parent, 
					loadedSrcs = []
				;
				return function(src, callback, name){
					
					src = $.htmlExt.loader.makePath(src);
					if($.inArray(src, loadedSrcs) != -1){
						return;
					}
					parent = parent || doc.getElementsByTagName('head')[0] || doc.body;
					if(!parent || !parent.appendChild){
						setTimeout(function(){
							$.htmlExt.loader.loadScript(src, callback);
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
								isReady(name);
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
//		event: function(name, obj){
//			var e = $.event.special[name];
//			if(!e){
//				$.event.special[name] = obj;
//				return;
//			}
//			
//			$.each(obj, function(n, fn){
//				var oFn = e[n];
//				e[n] = (!oFn) ? fn : function(){
//					oFn.apply(this, arguments);
//					return fn.apply(this, arguments);
//				};
//			});
//		},
		readyModules: function(events, fn){
			if(typeof events == 'string'){
				events = $.map(events.split(' '), function(e){
					return ($.htmlExt.loader.modules[e]) ? e +'Ready' : e;
				});
			}
			if(!events.length){
				fn();
				return;
			}
			
			$(doc).one(events.shift(), function(){
				$.htmlExt.readyModules(events, fn);
			});
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
						module = $.htmlExt.loader.modules[module].options;
						var langObj = lang,
							loadRemoteLang = function(lang){
								if($.inArray(lang, remoteLangs) !== -1){
									$.htmlExt.loader.loadScript(module.langSrc+lang+'.js', function(){
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
		})(),
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
				$.htmlExt.event(name, {
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
				
				$.htmlExt.attr(name, {
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
				
				$.htmlExt.loader.addModule(name, cfg);
				
				$(doc).one(name + 'Ready', function(){
					$('html').addClass(name +'-ready');
				});
				var combinations = $.htmlExt.loader.combinations;
				$.each(cfg.combination || [], function(i, combi){
//					;;;return;;;;
					if(!combinations[combi]){
						combinations[combi] = [name];
					} else {
						$.htmlExt.loader.combinations[combi].push(name);
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
		})()
	};
	
	(function(){
		var readyFns = [];
		$.extend($.htmlExt, {
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
		$.htmlExt.loader.loadScript('http://html5shim.googlecode.com/svn/trunk/html5.js');
	}
	
	isReady('htmlExtLangChange', true);
})(jQuery);
