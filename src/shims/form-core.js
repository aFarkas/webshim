//todo use $.globalEval?
jQuery.webshims.gcEval = function(){
	with(arguments[1] && arguments[1].form || window) {
		with(arguments[1] || window){
			return (function(){eval( arguments[0] );}).call(arguments[1] || window, arguments[0]);
		}
	}
};
jQuery.webshims.register('form-core', function($, webshims, window, document, undefined, options){
	"use strict";
	
	//additional tests for partial implementation of forms features
	(function(){
		var Modernizr = window.Modernizr;
		if(!Modernizr.formvalidation){return;}
		var modernizrInputAttrs = Modernizr.input || {};
		var modernizrInputTypes = Modernizr.inputtypes || {};
		var formvalidation = 'formvalidation';
		var valueAsNumber = 'valueAsNumber';
		var validationmessage = 'validationmessage';
		var addTest = Modernizr.addTest;
		var form = $('<form action="#"><select /><input type="date" required name="a" /></form>');
		var dateElem = $('input', form);
		
		//the form has to be connected in FF4
		form.appendTo('head');
		
		Modernizr[validationmessage] = !!(dateElem.prop('validationMessage'));
		Modernizr.requiredSelect = !!('required' in $('select', form)[0]);
		
		//bugfree means interactive formvalidation including correct submit-invalid event handling (this can't be detected, we can just guess)
		Modernizr.bugfreeformvalidation = Modernizr[formvalidation] && Modernizr.requiredSelect && Modernizr[validationmessage] && (!$.browser.webkit || (navigator.userAgent.indexOf('hrome') != -1 && webshims.browserVersion > 534.19)) && !window.testGoodWithFix;
		
		
		modernizrInputAttrs[valueAsNumber] = false;
		modernizrInputAttrs.valueAsNumberSet = false;
		modernizrInputAttrs.valueAsDate = false;
		
		
		modernizrInputAttrs[valueAsNumber] = (valueAsNumber in dateElem[0]);
		if (modernizrInputAttrs[valueAsNumber]) {
			dateElem[0][valueAsNumber] = 0;
			modernizrInputAttrs.valueAsNumberSet = (dateElem[0].value == '1970-01-01');
			
		}
		modernizrInputAttrs.valueAsDate = ('valueAsDate' in dateElem[0]);
		
		
		if (modernizrInputAttrs[valueAsNumber] && !modernizrInputAttrs.valueAsNumberSet) {
			Modernizr.bugfreeformvalidation = false;
		}
		
		form.remove();
		form = dateElem = null;
		
		
		if(!Modernizr.bugfreeformvalidation){
			var toLoad = ['form-native-fix'];
			webshims.addPolyfill('form-native-fix', {
				feature: 'forms',
				test: Modernizr.bugfreeformvalidation,
				dependencies: ['form-extend']
			});
			//remove form-extend readyness
			webshims.modules["form-extend"].test = false;
			if($.event.special["form-extendReady"]){
				delete $.event.special["form-extendReady"];
			}
			webshims.modules["forms-ext"].test = false;
			if($.event.special["forms-extReady"]){
				delete $.event.special["forms-extReady"];
				toLoad.push('forms-ext');
			}
			webshims.loader.loadList(toLoad);
			if(webshims.cfg.waitReady){
				$.readyWait++;
				webshims.ready(toLoad, function(){
					$.ready(true);
				});
			}
		}
		
	})();
	
	var groupTypes = {radio: 1};
	var checkTypes = {checkbox: 1, radio: 1};
	var emptyJ = $([]);
	var getGroupElements = function(elem){
		elem = $(elem);
		var name = elem[0].name;
		return (groupTypes[elem[0].type] && name) ? $((elem[0].form && elem[0].form[name]) || document.getElementsByName(name)).not(elem[0]) : emptyJ;
	};
	var getContentValidationMessage;
	
	/*
	 * Selectors for all browsers
	 */
	var rangeTypes = {number: 1, range: 1, date: 1, time: 1, 'datetime-local': 1, datetime: 1, month: 1, week: 1};
	$.extend($.expr.filters, {
		"valid-element": function(elem){
			return !!($.prop(elem, 'willValidate') && ($.prop(elem, 'validity') || {valid: 1}).valid);
		},
		"invalid-element": function(elem){
			return !!($.prop(elem, 'willValidate') && !isValid(elem));
		},
		"required-element": function(elem){
			return !!($.prop(elem, 'willValidate') && $.prop(elem, 'required'));
		},
		"optional-element": function(elem){
			return !!($.prop(elem, 'willValidate') && $.prop(elem, 'required') === false);
		},
		"in-range": function(elem){
			if(!rangeTypes[$.prop(elem, 'type')] || !$.prop(elem, 'willValidate')){
				return false;
			}
			var val = $.prop(elem, 'validity');
			return !!(val && !val.rangeOverflow && !val.rangeUnderflow);
		},
		"out-of-range": function(elem){
			if(!rangeTypes[$.prop(elem, 'type')] || !$.prop(elem, 'willValidate')){
				return false;
			}
			var val = $.prop(elem, 'validity');
			return !!(val && (val.rangeOverflow || val.rangeUnderflow));
		}
		
	});
	//better you use the selectors above
	['valid', 'invalid', 'required', 'optional'].forEach(function(name){
		$.expr.filters[name] = $.expr.filters[name+"-element"];
	});
	
	var isValid = function(elem){
		return ($.prop(elem, 'validity') || {valid: 1}).valid;
	};
	
	
	//ToDo needs testing
	var oldAttr = $.prop;
	var changeVals = {selectedIndex: 1, value: 1, checked: 1, disabled: 1, readonly: 1};
	$.prop = function(elem, name, val){
		var ret = oldAttr.apply(this, arguments);
		if(elem && 'form' in elem && changeVals[name] && val !== undefined && $(elem).hasClass('form-ui-invalid')){
			if(isValid(elem)){
				$(elem).getShadowElement().removeClass('form-ui-invalid');
				if(name == 'checked' && val) {
					getGroupElements(elem).removeClass('form-ui-invalid').removeAttr('aria-invalid');
				}
			}
		}
		return ret;
	};
	
	var switchValidityClass = function(e){
		if(!e.target || e.target.type == 'submit' || !$.prop(e.target, 'willValidate')){return;}
		var timer = $.data(e.target, 'webshimsswitchvalidityclass');
		if(timer){
			clearTimeout(timer);
		}
		$.data(e.target, 'webshimsswitchvalidityclass', setTimeout(function(){
			
			var elem = $(e.target).getNativeElement()[0];
			var shadowElem = $(elem).getShadowElement();
			var addClass, removeClass, trigger;
			
			if(isValid(elem)){
				if(!shadowElem.hasClass('form-ui-valid')){
					addClass = 'form-ui-valid';
					removeClass = 'form-ui-invalid';
					trigger = 'changedvalid';
					if(checkTypes[elem.type] && elem.checked){
						getGroupElements(elem).removeClass(removeClass).addClass(addClass).removeAttr('aria-invalid');
					}
				}
			} else {
				if(!shadowElem.hasClass('form-ui-invalid')){
					addClass = 'form-ui-invalid';
					removeClass = 'form-ui-valid';
					if (checkTypes[elem.type] && !elem.checked) {
						getGroupElements(elem).removeClass(removeClass).addClass(addClass);
					}
					trigger = 'changedinvalid';
				}
			}
			if(addClass){
				shadowElem.addClass(addClass).removeClass(removeClass);
				//jQuery 1.6.1 IE9 bug (doubble trigger bug)
				setTimeout(function(){
					$(elem).trigger(trigger);
				}, 0);
			}
			
			$.removeData(e.target, 'webshimsswitchvalidityclass')
			
		}, 9));
	};
	
	$(document).bind('focusout change refreshvalidityui', switchValidityClass);
	
	
	
	webshims.triggerInlineForm = function(elem, event){
		if(elem.jquery){
			elem = elem[0];
		}
		var onEvent = 'on'+event;
		var attr = elem[onEvent] || elem.getAttribute(onEvent) || '';
		var removed;
		var ret;
		event = $.Event({
			type: event,
			target: elem,
			currentTarget: elem
		});
		
		if(attr && typeof attr == 'string'){
			ret = webshims.gcEval(attr, elem);
			if(elem[onEvent]){
				removed = true;
				elem[onEvent] = false;
			}
			
		}
		if(ret === false){
			event.stopPropagation();
			event.preventDefault();
		}
		$(elem).trigger(event);
		if(removed){
			elem[onEvent] = attr;
		}
		return ret;
	};
	
	
	var setRoot = function(){
		webshims.scrollRoot = ($.browser.webkit || document.compatMode == 'BackCompat') ?
			$(document.body) : 
			$(document.documentElement)
		;
	};
	setRoot();
	webshims.ready('DOM', setRoot);
	
	/* some extra validation UI */
	webshims.validityAlert = (function(){
		var alertElem = (!$.browser.msie || parseInt($.browser.version, 10) > 7) ? 'span' : 'label';
		var bodyOffset = {top: 0, left: 0};
		var api = {
			hideDelay: 5000,
			getBodyOffset: function(){
				bodyOffset = errorBubble.offset();
			},
			showFor: function(elem, message, noFocusElem, noBubble){
				elem = $(elem);
				var visual = $(elem).getShadowElement();
				var offset = api.getOffsetFromBody(visual);
				if(noBubble){
					this.hide();
				} else {
					api.clear();
					this.getMessage(elem, message);
					this.position(visual, offset);
					errorBubble.css({
						fontSize: elem.css('fontSize'),
						fontFamily: elem.css('fontFamily')
					});
					this.show();
					if(this.hideDelay){
						hideTimer = setTimeout(boundHide, this.hideDelay);
					}
				}
				
				if(!noFocusElem){
					this.setFocus(visual, offset);
				}
			},
			getOffsetFromBody: function(elem){
				var offset = $(elem).offset();
				$.swap(errorBubble[0], {visibility: 'hidden', display: 'inline-block', left: 0, top: 0}, api.getBodyOffset);
				offset.top -= bodyOffset.top;
				offset.left -= bodyOffset.left;
				return offset;
			},
			setFocus: function(visual, offset){
				var focusElem = $(visual).getShadowFocusElement();
				var scrollTop = webshims.scrollRoot.scrollTop();
				var elemTop = ((offset || focusElem.offset()).top) - 30;
				var smooth;
				
				if(webshims.getID && alertElem == 'label'){
					errorBubble.attr('for', webshims.getID(focusElem));
				}
				
				if(scrollTop > elemTop){
					webshims.scrollRoot.animate(
						{scrollTop: elemTop - 5}, 
						{
							queue: false, 
							duration: Math.max( Math.min( 600, (scrollTop - elemTop) * 1.5 ), 80 )
						}
					);
					smooth = true;
				}
				try {
					focusElem[0].focus();
				} catch(e){}
				if(smooth){
					webshims.scrollRoot.scrollTop(scrollTop);
					setTimeout(function(){
						webshims.scrollRoot.scrollTop(scrollTop);
					}, 0);
				}
				setTimeout(function(){
					$(document).bind('focusout.validityalert', boundHide);
				}, 10);
			},
			getMessage: function(elem, message){
				$('> span.va-box', errorBubble).text(message || getContentValidationMessage(elem[0]) || elem.prop('validationMessage'));
			},
			position: function(elem, offset){
				offset = offset ? $.extend({}, offset) : api.getOffsetFromBody(elem);
				offset.top += elem.outerHeight();
				errorBubble.css(offset);
			},
			show: function(){
				if(errorBubble.css('display') === 'none'){
					errorBubble.css({opacity: 0}).show();
				}
				errorBubble.fadeTo(400, 1);
			},
			hide: function(){
				api.clear();
				errorBubble.fadeOut();
			},
			clear: function(){
				clearTimeout(focusTimer);
				clearTimeout(hideTimer);
				$(document).unbind('focusout.validityalert');
				errorBubble.stop().removeAttr('for');
			},
			errorBubble: $('<'+alertElem+' class="validity-alert" role="alert"><span class="va-arrow"><span class="va-arrow-box"></span></span><span class="va-box"></span></'+alertElem+'>').css({position: 'absolute', display: 'none'})
		};
		
		var errorBubble = api.errorBubble;
		var hideTimer = false;
		var focusTimer = false;
		var boundHide = $.proxy(api, 'hide');
		webshims.ready('DOM', function(){
			errorBubble.appendTo('body');
			if($.fn.bgIframe && $.browser.msie && parseInt($.browser.version, 10) < 7){
				errorBubble.bgIframe();
			}
		});
		return api;
	})();
	
	
	/* extension, but also used to fix native implementation workaround/bugfixes */
	(function(){
		var firstEvent,
			invalids = [],
			stopSubmitTimer,
			form
		;
		
		$(document).bind('invalid', function(e){
			if(e.wrongWebkitInvalid){return;}
			var jElm = $(e.target);
			var shadowElem = jElm.getShadowElement();
			if(!shadowElem.hasClass('form-ui-invalid')){
				shadowElem.addClass('form-ui-invalid').removeClass('form-ui-valid');
				setTimeout(function(){
					$(e.target).trigger('changedinvalid');
				}, 0);
			}
			
			if(!firstEvent){
				//trigger firstinvalid
				firstEvent = $.Event('firstinvalid');
				firstEvent.isInvalidUIPrevented = e.isDefaultPrevented;
				var firstSystemInvalid = $.Event('firstinvalidsystem');
				$(document).triggerHandler(firstSystemInvalid, {element: e.target, form: e.target.form, isInvalidUIPrevented: e.isDefaultPrevented});
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
				$(e.target).trigger(lastEvent, lastEvent);
			}, 9);
			jElm = null;
			shadowElem = null;
		});
	})();
	
	if(options.replaceValidationUI){
		webshims.ready('DOM', function(){
			$(document).bind('firstinvalid', function(e){
				if(!e.isInvalidUIPrevented()){
					e.preventDefault();
					$.webshims.validityAlert.showFor( e.target, $(e.target).prop('customValidationMessage') ); 
				}
			});
		});
	}
	
	
	
	/* form message */
	
	(function(){
		
		
		var validityMessages = webshims.validityMessages;
		var implementProperties = (options.overrideMessages || options.customMessages) ? ['customValidationMessage'] : [];
	
		validityMessages['en'] = validityMessages['en'] || validityMessages['en-US'] || {
			typeMismatch: {
				email: 'Please enter an email address.',
				url: 'Please enter a URL.'
			},
			
			tooLong: 'Please enter at most {%maxlength} character(s). You entered {%valueLen}.',
			
			patternMismatch: 'Invalid input. {%title}',
			valueMissing: {
				defaultMessage: 'Please fill out this field.',
				checkbox: 'Please check this box if you want to proceed.'
			}
		};
		
		
		['select', 'radio'].forEach(function(type){
			validityMessages['en'].valueMissing[type] = 'Please select an option.';
		});
		
		validityMessages['en-US'] = validityMessages['en-US'] || validityMessages['en'];
		validityMessages[''] = validityMessages[''] || validityMessages['en-US'];
		
		validityMessages['de'] = validityMessages['de'] || {
			typeMismatch: {
				email: '{%value} ist keine zulässige E-Mail-Adresse',
				url: '{%value} ist keine zulässige Webadresse'
			},
			tooLong: 'Der eingegebene Text ist zu lang! Sie haben {%valueLen} Buchstaben eingegeben, dabei sind {%maxlength} das Maximum.',
			patternMismatch: '{%value} hat für dieses Eingabefeld ein falsches Format! {%title}',
			valueMissing: {
				defaultMessage: 'Bitte geben Sie einen Wert ein',
				checkbox: 'Bitte aktivieren Sie das Kästchen'
			}
		};
		
		['select', 'radio'].forEach(function(type){
			validityMessages['de'].valueMissing[type] = 'Bitte wählen Sie eine Option aus';
		});
		
		var currentValidationMessage =  validityMessages[''];
		webshims.activeLang({
			langObj: validityMessages, 
			module: 'form-core', 
			callback: function(langObj){
				currentValidationMessage = langObj;
			}
		});
		
		webshims.createValidationMessage = function(elem, name){
			var message = currentValidationMessage[name];
			if(message && typeof message !== 'string'){
				message = message[ $.prop(elem, 'type') ] || message[ (elem.nodeName || '').toLowerCase() ] || message[ 'defaultMessage' ];
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
		
		
		if(!Modernizr.validationmessage || !Modernizr.formvalidation){
			implementProperties.push('validationMessage');
		}
		webshims.getContentValidationMessage = function(elem, validity){
			var message = elem.getAttribute('x-moz-errormessage') || elem.getAttribute('data-errormessage') || '';
			if(message && message.indexOf('{') != -1){
				try {
					message = jQuery.parseJSON(message);
				} catch(er){
					return message;
				}
				if(typeof message == 'object'){
					validity = validity || $.prop(elem, 'validity') || {valid: 1};
					if(!validity.valid){
						$.each(validity, function(name, prop){
							if(prop && name != 'valid' && message[name]){
								message = message[name];
								return false;
							}
						});
					}
				}
				webshims.data(elem, 'contentErrorMessage', message);
				if(typeof message == 'object'){
					message = message.defaultMessage;
				}
			}
			return message || '';
		};
		
		getContentValidationMessage = webshims.getContentValidationMessage;
		
		webshims.ready('dom-support', function($, webshims, window, document, undefined){
			
			//options only return options, if option-elements are rooted: but this makes this part of HTML5 less backwards compatible
			if(Modernizr.datalist && !($('<datalist><select><option></option></select></datalist>').prop('options') || []).length ){
				webshims.defineNodeNameProperty('datalist', 'options', {
					prop: {
						writeable: false,
						get: function(){
							var options = this.options || [];
							if(!options.length){
								var elem = this;
								var select = $('select', elem);
								if(select[0] && select[0].options && select[0].options.length){
									options = select[0].options;
								}
							}
							return options;
						}
					}
				});
			}
			
			
			
			implementProperties.forEach(function(messageProp){
				webshims.defineNodeNamesProperty(['fieldset', 'output', 'button'], messageProp, {
					prop: {
						value: '',
						writeable: false
					}
				});
				['input', 'select', 'textarea'].forEach(function(nodeName){
					var desc = webshims.defineNodeNameProperty(nodeName, messageProp, {
						prop: {
							get: function(){
								var elem = this;
								var message = '';
								if(!$.prop(elem, 'willValidate')){
									return message;
								}
								
								var validity = $.prop(elem, 'validity') || {valid: 1};
								
								if(validity.valid){return message;}
								message = getContentValidationMessage(elem, validity);
								
								if(message){return message;}
								
								if(validity.customError && elem.nodeName){
									message = (Modernizr.validationmessage && desc.prop._supget) ? desc.prop._supget.call(elem) : webshims.data(elem, 'customvalidationMessage');
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
							writeable: false
						}
					});
				});
				
			});
			
			// add support for new input-types
			webshims.defineNodeNameProperty('input', 'type', {
				prop: {
					get: function(){
						var elem = this;
						var type = (elem.getAttribute('type') || '').toLowerCase();
						return (webshims.inputTypes[type]) ? type : elem.type;
					}
				}
			});
			
		});
	})();
});



