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
		webshims.preloadHTCs.forEach(processPreload);
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
					if(support.objectAccessor && support.contentAttr){
						//ToDo: property on unknown element
						
						var proto  = webshims.getPrototypeOf(element);
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



