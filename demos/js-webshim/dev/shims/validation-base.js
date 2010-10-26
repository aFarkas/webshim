/* fix chrome 5/6 and safari 5 implemenation + add some usefull custom invalid event called firstinvalid */
jQuery.webshims.ready('es5', function($){
	var webshims = $.webshims;
	var validityMessages = webshims.validityMessages;
	var support = $.support;
	var fixNative = false;
	var doc = document;
	var undefined;
	if(support.validity === true){
		fixNative = !window.noHTMLExtFixes;
	}
	/*
	 * Selectors for all browsers
	 */
	$.extend($.expr.filters, {
		valid: function(elem){
			return ($.attr(elem, 'validity') || {valid: true}).valid;
		},
		invalid: function(elem){
			return !$.expr.filters.valid(elem);
		},
		willValidate: function(elem){
			return $.attr(elem, 'willValidate');
		}
	});
	
	webshims.triggerInlineForm = (function(){
		var stringify = function(id){
			if(typeof id != 'string' || id.indexOf('-') !== -1 || id.indexOf('.') !== -1 || id.indexOf('"') !== -1){return '';}
			return 'var '+ id +' = this.form["'+ id +'"];';
		};
		return function(elem, event){
			var attr = elem['on'+event] || elem.getAttribute('on'+event) || '';
			event = $.Event({
				type: event,
				target: elem[0],
				currentTarget: elem[0]
			});
			if(attr && typeof attr == 'string' && elem.form && elem.form.elements){
				var scope = '';
				$(elem.form.elements).each(function(){
					var name = this.name;
					var id = this.id;
					if(!id && !name){return;}
					if(name){
						scope += stringify(name);
					}
					if(id && id !== name){
						scope += stringify(id);
					}
				});
				(function(){eval( scope + attr );}).call(elem, event);
			}
			$(elem).trigger(event);
		};
	})();
	
	/* some extra validation UI */
	webshims.validityAlert = (function(){
		var alertElem = (!$.browser.msie || parseInt($.browser.version, 10) > 7) ? 'span' : 'label';
		var api = {
			hideDelay: 5000,
			showFor: function(elem, message, hideOnBlur){
				elem = $(elem);
				var visual = (elem.data('inputUIReplace') || {visual: elem}).visual;
				createAlert();
				api.clear();
				this.getMessage(elem, message);
				this.position(visual);
				this.show();
				
				if(this.hideDelay){
					hideTimer = setTimeout(boundHide, this.hideDelay);
				}
				if(!hideOnBlur){
					var focusElem = $('input, select, textarea, .ui-slider-handle', visual).filter(':visible:first');
					if(!focusElem[0]){
						focusElem = visual;
					}
					alert.attr('for', webshims.getID(focusElem));
					focusElem.focus();
					$(doc).bind('focusout.validityalert', boundHide);
				}
			},
			getMessage: function(elem, message){
				$('> span', alert).html(message || elem.attr('validationMessage'));
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
			alert: $('<'+alertElem+' class="validity-alert" role="alert"><span class="va-box" /></'+alertElem+'>').css({position: 'absolute', display: 'none'})
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
	
	/* implements validationMessage and customValidationMessage */
	
	validityMessages['en'] = validityMessages['en'] || validityMessages['en-US'] || {
		typeMismatch: {
			email: '{%value} is not a legal email address',
			url: '{%value} is not a valid web address',
			number: '{%value} is not a number!',
			date: '{%value} is not a date',
			time: '{%value} is not a time',
			range: '{%value} is not a number!',
			"datetime-local": '{%value} is not a correct date-time format.'
		},
		rangeUnderflow: '{%value} is too low. The lowest value you can use is {%min}.',
		rangeOverflow: '{%value}  is too high. The highest value you can use is {%max}.',
		stepMismatch: 'The value {%value} is not allowed for this form.',
		tooLong: 'The entered text is too large! You used {%valueLen} letters and the limit is {%maxlength}.',
		
		patternMismatch: '{%value} is not in the format this page requires! {%title}',
		valueMissing: 'You have to specify a value'
	};
	
	validityMessages['en-US'] = validityMessages['en-US'] || validityMessages['en'];
	validityMessages[''] = validityMessages[''] || validityMessages['en'];
	
	validityMessages['de'] = validityMessages['de'] || {
		typeMismatch: {
			email: '{%value} ist keine zulässige E-Mail-Adresse',
			url: '{%value} ist keine zulässige Webadresse',
			number: '{%value} ist keine Nummer!',
			date: '{%value} ist kein Datum',
			time: '{%value} ist keine Uhrzeit',
			range: '{%value} ist keine Nummer!',
			"datetime-local": '{%value} ist kein Datum-Uhrzeit Format.'
		},
		rangeUnderflow: '{%value} ist zu niedrig. {%min} ist der unterste Wert, den Sie benutzen können.',
		rangeOverflow: '{%value} ist zu hoch. {%max} ist der oberste Wert, den Sie benutzen können.',
		stepMismatch: 'Der Wert {%value} ist in diesem Feld nicht zulässig. Hier sind nur bestimmte Werte zulässig. {%title}',
		tooLong: 'Der eingegebene Text ist zu lang! Sie haben {%valueLen} Buchstaben eingegeben, dabei sind {%maxlength} das Maximum.',
		
		patternMismatch: '{%value} hat für diese Seite ein falsches Format! {%title}',
		valueMissing: 'Sie müssen einen Wert eingeben'
	};
	
	
	/* ugly workaround/bugfixes */
	(function(){
		var firstEvent,
			invalids = [],
			stopSubmitTimer,
			form,
			invalidTriggeredBySubmit,
			doubled
		;
		
		
		//opera/chrome fix (this will double all invalid events, we have to stop them!)
		//opera throws a submit-event and then the invalid events,
		//chrome7 has disabled invalid events, this brings them back
		if(fixNative && window.addEventListener){
			var formnovalidate = {
				timer: undefined,
				prevented: false
			};
			window.addEventListener('submit', function(e){
				if(!formnovalidate.prevented && e.target.checkValidity && $.attr(e.target, 'novalidate') == null && !e.target.checkValidity()){
					invalidTriggeredBySubmit = true;
				}
			}, true);
			var preventValidityTest = function(e){
				if($.attr(e.target, 'formnovalidate') == null){return;}
				if(formnovalidate.timer){
					clearTimeout(formnovalidate.timer);
				}
				formnovalidate.prevented = true;
				formnovalidate.timer = setTimeout(function(){
					formnovalidate.prevented = false;
				}, 20);
			};
			window.addEventListener('click', preventValidityTest, true);
			window.addEventListener('touchstart', preventValidityTest, true);
			window.addEventListener('touchend', preventValidityTest, true);
		}
		$(doc).bind('invalid', function(e){
			//safari 5.0.2 has some serious issues
			if(fixNative && $.attr(e.target, 'validity').valid){
				e.stopImmediatePropagation();
			}
			if(!firstEvent){
				//webkitfix 
				//chrome 6/safari5.0 submits an invalid form, if you prevent all invalid events
				//this also prevents opera from throwing a submit event if form isn't valid
				form = e.target.form;
				if (form && fixNative){
					
					var submitEvents = $(form)
						.bind('submit.preventInvalidSubmit', function(submitEvent){
							if( $.attr(form, 'novalidate') == null ){
								submitEvent.stopImmediatePropagation();
								return false;
							}
						})
						.data('events').submit
					;
					//add this handler as first executing handler
					if (submitEvents && submitEvents.length > 1) {
						submitEvents.unshift(submitEvents.pop());
					}
				}
				
				//trigger firstinvalid
				firstEvent = $.Event('firstinvalid');
				$(e.target).trigger(firstEvent);
			}
			//if firstinvalid was prevented all invalids will be also prevented
			if( firstEvent && firstEvent.isDefaultPrevented() ){
				e.preventDefault();
			}
			
			//prevent doubble invalids + fix safari bug, where checkValdity returns false
			if(support.validity !== true || invalids.indexOf(e.target) == -1){
				invalids.push(e.target);
			} else if(fixNative) {
				doubled = true;
				e.stopImmediatePropagation();
			}
			e.extraData = 'fix'; 
			clearTimeout(stopSubmitTimer);
			stopSubmitTimer = setTimeout(function(){
				var lastEvent = {type: 'lastinvalid', cancelable: false, invalidlist: $(invalids)};
				//if events aren't dubled, we have a bad implementation, if the event isn't prevented and the first invalid elemenet isn't focused we show custom bubble
				if( invalidTriggeredBySubmit && !doubled && firstEvent.target !== doc.activeElement && doc.activeElement && !$.data(firstEvent.target, 'maybePreventedinvalid') ){
					webshims.validityAlert.showFor(firstEvent.target);
				}
				//reset firstinvalid
				doubled = false;
				firstEvent = false;
				invalidTriggeredBySubmit = false;
				invalids = [];
				//remove webkit/operafix
				$(form).unbind('submit.preventInvalidSubmit');
				$(e.target).trigger(lastEvent, lastEvent);
			}, 0);
			
		});
	})();
	
	(function(){
		if(!fixNative){return;}
		support.fieldsetValidation = support.fieldsetValidation || 'shim';
		//safari 5.0.2 has serious issues with checkValidity in combination with setCustomValidity so we mimic checkValidity using validity-property
		var checkValidity = function(elem){
			var valid = ($.attr(elem, 'validity') || {valid: true}).valid;
			if(!valid && elem.checkValidity()){
				$(elem).trigger('invalid');
			}			
			return valid;
		};
		
		//no current browser supports checkValidity on fieldset
		webshims.addMethod('checkValidity', function(){
			if(this.elements || $.nodeName(this, 'fieldset')){
				var ret = true;
				$(this.elements || 'input, textarea, select', this)
					.each(function(){
						 if(!checkValidity(this)){
							ret = false;
						}
					})
				;
				return ret;
			} else if(this.checkValidity){
				return checkValidity(this);
			}
		});
	})();
	
	//implements validationMessage in uncapable browser and adds unknown types/attributes in capable browsers/overrides validationMessage in capable browsers
	(function(){
		var overrideNativeMessages = ( support.validity === true && webshims.overrideValidationMessages );
		var supportRequiredSelect = true;
		var supportNumericDate = true;
		if(support.validity === true){
			supportRequiredSelect = !!( ('required' in doc.createElement('select')) || window.noHTMLExtFixes );
			supportNumericDate = !!(($('<input type="datetime-local" />')[0].type == 'datetime-local' && $('<input type="range" />')[0].type == 'range') );
		}
		var overrideValidity = (!supportRequiredSelect || !supportNumericDate || overrideNativeMessages);
		var typeModels = webshims.inputTypes;
		var validityRules = {};
		var validityProps = ['customError','typeMismatch','rangeUnderflow','rangeOverflow','stepMismatch','tooLong','patternMismatch','valueMissing','valid'];
		var oldAttr = $.attr;
		var oldVal = $.fn.val;
		var validityChanger = (overrideNativeMessages)? {value: 1, checked: 1} : {value: 1};
		var validityElements = (overrideNativeMessages) ? ['textarea'] : [];
		var checkTypes = {radio:1,checkbox:1};
		var testValidity = function(elem, init){
			if(!elem.form){return;}
			var type = (elem.getAttribute && elem.getAttribute('type') || elem.type || '').toLowerCase();
			
			if(!overrideNativeMessages){
				if(!(!supportRequiredSelect && type == 'select-one') && !typeModels[type]){return;}
			}
			
			if(overrideNativeMessages && !init && checkTypes[type] && elem.name){
				$(doc.getElementsByName( elem.name )).each(function(){
					$.attr(this, 'validity');
				});
			} else {
				$.attr(elem, 'validity');
				
			}
		};
		
		if(!supportRequiredSelect || overrideNativeMessages){
			$.extend(validityChanger, {
				required: 1,
				size: 1,
				multiple: 1,
				selectedIndex: 1
			});
			validityElements.push('select');
		}
		if(!supportNumericDate || overrideNativeMessages){
			$.extend(validityChanger, {
				min: 1, max: 1, step: 1
			});
			validityElements.push('input');
		}
		
		select = null;
		
		var currentValidationMessage =  validityMessages[''];
		$(doc).bind('htmlExtLangChange', function(){
			webshims.activeLang(validityMessages, 'validation-base', function(langObj){
				currentValidationMessage = langObj;
			});
		});
		
		webshims.createValidationMessage = function(elem, name){
			var message = currentValidationMessage[name];
			if(message && typeof message !== 'string'){
				message = message[ (elem.getAttribute('type') || '').toLowerCase() ] || message.defaultMessage;
			}
			if(message){
				['value', 'min', 'max', 'title', 'maxlength', 'label'].forEach(function(attr){
					if(message.indexOf('{%'+attr) === -1){return;}
					var val = ((attr == 'label') ? $.trim($('label[for='+ elem.id +']', elem.form).text()).replace(/\*$|:$/, '') : $.attr(elem, attr)) || '';
					message = message.replace('{%'+ attr +'}', val);
					if('value' == attr){
						message = message.replace('{%valueLen}', val.length);
					}
				});
			}
			return message || '';
		};
		$.each((support.validationMessage) ? ['customValidationMessage'] : ['customValidationMessage', 'validationMessage'], function(i, fn){
			webshims.attr(fn, {
				elementNames: ['input', 'select', 'textarea'],
				getter: function(elem){
					var message = '';
					if(!$.attr(elem, 'willValidate')){
						return message;
					}
					
					var validity = $.attr(elem, 'validity') || {valid: 1};
					if(validity.valid){return message;}
					if(validity.customError || fn === 'validationMessage'){
						message = ('validationMessage' in elem) ? elem.validationMessage : $.data(elem, 'customvalidationMessage');
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
				}
			});
		});
		support.validationMessage = support.validationMessage || 'shim';
		
		
		webshims.addMethod('setCustomValidity', function(error){
			error = error+'';
			if(this.setCustomValidity){
				this.setCustomValidity(error);
				if(overrideValidity){
					$.data(this, 'hasCustomError', !!(error));
					testValidity(this);
				}
			} else {
				$.data(this, 'customvalidationMessage', ''+error);
			}
		});
		
		if(support.validity === true){
			webshims.addInputType = function(type, obj){
				typeModels[type] = obj;
			};
			
			webshims.addValidityRule = function(type, fn){
				validityRules[type] = fn;
			};
			
			webshims.addValidityRule('typeMismatch',function (input, val, cache, validityState){
				if(val === ''){return false;}
				var ret = validityState.typeMismatch;
				if(!('type' in cache)){
					cache.type = (input[0].getAttribute('type') || '').toLowerCase();
				}
				
				if(typeModels[cache.type] && typeModels[cache.type].mismatch){
					ret = typeModels[cache.type].mismatch(val, input);
				}
				return ret;
			});
		}
		
		if(!supportRequiredSelect){
			webshims.createBooleanAttrs('required', ['select']);
			
			webshims.addValidityRule('valueMissing', function(jElm, val, cache, validityState){
				
				if(cache.nodeName == 'select' && !val && jElm.attr('required') && jElm[0].size < 2){
					if(!cache.type){
						cache.type = jElm[0].type;
					}
					
					if(cache.type == 'select-one' && $('> option:first-child:not(:disabled)', jElm).attr('selected')){
						return true;
					}
				}
				return validityState.valueMissing;
			});
		}
		
		if(overrideValidity){
			webshims.attr('validity', {
				elementNames: validityElements,
				getter: function(elem){
					var validity 	= elem.validity;
					if(!validity){
						return validity;
					}
					var validityState = {};
					validityProps.forEach(function(prop){
						validityState[prop] = validity[prop];
					});
					
					if( !$.attr(elem, 'willValidate') ){
						return validityState;
					}
					var jElm 			= $(elem),
						cache 			= {type: (elem.getAttribute && elem.getAttribute('type') || '').toLowerCase(), nodeName: (elem.nodeName || '').toLowerCase()},
						val				= oldVal.call(jElm),
						customError 	= !!($.data(elem, 'hasCustomError')),
						setCustomMessage
					;
					
					validityState.customError = customError;
										
					if( validityState.valid && validityState.customError ){
						validityState.valid = false;
					} else if(!validityState.valid) {
						var allFalse = true;
						$.each(validityState, function(name, prop){
							if(prop){
								allFalse = false;
								return false;
							}
						});
						
						if(allFalse){
							validityState.valid = true;
						}
						
					}
					
					$.each(validityRules, function(rule, fn){
						validityState[rule] = fn(jElm, val, cache, validityState);
						if( validityState[rule] && (validityState.valid || (!setCustomMessage && overrideNativeMessages)) ) {
							elem.setCustomValidity(webshims.createValidationMessage(elem, rule));
							validityState.valid = false;
							setCustomMessage = true;
						}
					});
					if(validityState.valid){
						elem.setCustomValidity('');
					}
					return validityState;
				}
			});
						
			
			$.fn.val = function(val){
				var ret = oldVal.apply(this, arguments);
				this.each(function(){
					testValidity(this);
				});
				return ret;
			};
			
			$.attr = function(elem, prop, value){
				var ret = oldAttr.apply(this, arguments);
				if(validityChanger[prop] && value !== undefined && elem.form){
					testValidity(elem);
				}
				return ret;
			};
			
			if(doc.addEventListener){
				doc.addEventListener('change', function(e){
					testValidity(e.target);
				}, true);
				if (!supportNumericDate) {
					doc.addEventListener('input', function(e){
						testValidity(e.target);
					}, true);
				}
			}
						
			webshims.addReady(function(context){
				
				if(context === doc){
					$(validityElements.join(',')).each(function(){
						testValidity(this, true);
					});
				} else {
					$(validityElements.join(','), context).each(function(){
						testValidity(this, true);
					});
				}
			});
			
		} //end: overrideValidity -> (!supportRequiredSelect || !supportNumericDate || overrideNativeMessages)
		
	})();
	
	webshims.createReadyEvent('validation-base');
}, true);



