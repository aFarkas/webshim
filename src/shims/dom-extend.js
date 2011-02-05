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
});