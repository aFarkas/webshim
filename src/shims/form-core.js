//todo use $.globalEval?
jQuery.webshims.gcEval = function(){
	with(arguments[1] && arguments[1].form || window) {
		with(arguments[1] || window){
			return (function(){eval( arguments[0] );}).call(arguments[1] || window, arguments[0]);
		}
	}
};
jQuery.webshims.register('form-core', function($, webshims, window, doc, undefined, options){
	"use strict";
	webshims.getVisualInput = function(elem){
		elem = $(elem);
		return (elem.data('inputUIReplace') || {visual: elem}).visual;
	};
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
		if(elem && 'form' in elem && changeVals[name] && val !== undefined && $(elem).hasClass('form-ui-invalid')){
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
		
		var elem = ($.data(e.target, 'html5element') || [])[0] || e.target;
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
	
	
	
	webshims.triggerInlineForm = function(elem, event){
		var attr = elem['on'+event] || elem.getAttribute('on'+event) || '';
		var ret;
		event = $.Event({
			type: event,
			target: elem[0],
			currentTarget: elem[0]
		});
		
		if(attr && typeof attr == 'string'){
			ret = webshims.gcEval(attr, elem);
		}
		if(ret === false){
			event.stopPropagation();
			event.preventDefault();
		}
		$(elem).trigger(event);
		return ret;
	};
	
	
	var setRoot = function(){
		webshims.scrollRoot = ($.browser.webkit || doc.compatMode == 'BackCompat') ?
			$(doc.body) : 
			$(doc.documentElement)
		;
	};
	setRoot();
	webshims.ready('DOM', setRoot);
	
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
				errorBubble.css({
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
				
				if(webshims.getID && alertElem == 'label'){
					errorBubble.attr('for', webshims.getID(focusElem));
				}
				
				if(scrollTop > elemTop){
					labelOff = elem.id && $('label[for="'+elem.id+'"]', elem.form).offset();
					if(labelOff && labelOff.top < elemTop){
						elemTop = labelOff.top;
					}
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
					$(doc).bind('focusout.validityalert', boundHide);
				}, 10);
			},
			getMessage: function(elem, message){
				$('> span.va-box', errorBubble).text(message || elem.attr('x-moz-errormessage') || elem.attr('data-errormessage') || elem.attr('validationMessage'));
			},
			position: function(elem){
				var offset = elem.offset();
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
				$(doc).unbind('focusout.validityalert');
				errorBubble.stop().removeAttr('for');
			},
			errorBubble: $('<'+alertElem+' class="validity-alert" role="alert"><span class="va-arrow"><span class="va-arrow-box"></span></span><span class="va-box"></span></'+alertElem+'>').css({position: 'absolute', display: 'none'})
		};
		
		var errorBubble = api.errorBubble;
		var hideTimer = false;
		var focusTimer = false;
		var boundHide = $.proxy(api, 'hide');
		var created = false;
		var createAlert = function(){
			if(created){return;}
			created = true;
			
			$(function(){
				errorBubble.appendTo('body');
				if($.fn.bgIframe && $.browser.msie && parseInt($.browser.version, 10) < 7){
					errorBubble.bgIframe();
				}
			});
		};
		createAlert();
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
			var jElm = $(e.target).addClass('form-ui-invalid').removeClass('form-ui-valid');
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
				jElm.trigger(lastEvent, lastEvent);
			}, 9);
			
		});
	})();
	
	if(options.replaceValidationUI){
		$(function(){
			$(document).bind('firstinvalid', function(e){
				if(!e.isInvalidUIPrevented()){
					e.preventDefault();
					$.webshims.validityAlert.showFor( e.target, $(e.target).attr('customValidationMessage') ); 
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
				url: 'Please enter a URL.',
				number: 'Please enter a number.',
				date: 'Please enter a date.',
				time: 'Please enter a time.',
				range: 'Invalid input.',
				"datetime-local": 'Please enter a datetime.'
			},
			rangeUnderflow: 'Value must be greater than or equal to {%min}.',
			rangeOverflow: 'Value must be less than or equal to {%max}.',
			stepMismatch: 'Invalid input.',
			tooLong: 'Please enter at most {%maxlength} character(s). You entered {%valueLen}.',
			
			patternMismatch: 'Invalid input. {%title}',
			valueMissing: {
				defaultMessage: 'Please fill out this field.',
				checkbox: 'Please check this box if you want to proceed.'
			}
		};
		
		['date', 'time', 'datetime-local'].forEach(function(type){
			validityMessages['en'].rangeUnderflow[type] = 'Value must be at or after {%min}.';
		});
		['date', 'time', 'datetime-local'].forEach(function(type){
			validityMessages['en'].rangeOverflow[type] = 'Value must be at or before {%max}.';
		});
		['select-one', 'radio'].forEach(function(type){
			validityMessages['en'].valueMissing[type] = 'Please select an option.';
		});
		
		validityMessages['en-US'] = validityMessages['en-US'] || validityMessages['en'];
		validityMessages[''] = validityMessages[''] || validityMessages['en-US'];
		
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
			rangeUnderflow: {
				defaultMessage: '{%value} ist zu niedrig. {%min} ist der unterste Wert, den Sie benutzen können.'
			},
			rangeOverflow: {
				defaultMessage: '{%value} ist zu hoch. {%max} ist der oberste Wert, den Sie benutzen können.'
			},
			stepMismatch: 'Der Wert {%value} ist in diesem Feld nicht zulässig. Hier sind nur bestimmte Werte zulässig. {%title}',
			tooLong: 'Der eingegebene Text ist zu lang! Sie haben {%valueLen} Buchstaben eingegeben, dabei sind {%maxlength} das Maximum.',
			
			patternMismatch: '{%value} hat für dieses Eingabefeld ein falsches Format! {%title}',
			valueMissing: {
				defaultMessage: 'Bitte geben Sie einen Wert ein',
				checkbox: 'Bitte aktivieren Sie das Kästchen'
			}
		};
		['date', 'time', 'datetime-local'].forEach(function(type){
			validityMessages['de'].rangeUnderflow[type] = '{%value} ist zu früh. {%min} ist die früheste Zeit, die Sie benutzen können.';
		});
		['date', 'time', 'datetime-local'].forEach(function(type){
			validityMessages['de'].rangeOverflow[type] = '{%value} ist zu spät. {%max} ist die späteste Zeit, die Sie benutzen können.';
		});
		['select-one', 'radio'].forEach(function(type){
			validityMessages['de'].valueMissing[type] = 'Bitte wählen Sie eine Option aus';
		});
		
		var currentValidationMessage =  validityMessages[''];
		$(doc).bind('webshimLocalizationReady', function(){
			webshims.activeLang(validityMessages, 'form-core', function(langObj){
				currentValidationMessage = langObj;
			});
		});
		
		webshims.createValidationMessage = function(elem, name){
			var message = currentValidationMessage[name];
			if(message && typeof message !== 'string'){
				message = message[ (elem.getAttribute('type') || '').toLowerCase() || elem.type || 'defaultMessage' ] || message.defaultMessage;
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
		
		
		if((!window.noHTMLExtFixes && !Modernizr.validationmessage) || !Modernizr.formvalidation){
			implementProperties.push('validationMessage');
		}
		jQuery.webshims.ready('dom-support', function($, webshims, window, doc, undefined){
			implementProperties.forEach(function(messageProp){
				['input', 'select', 'textarea', 'fieldset', 'output', 'button'].forEach(function(nodeName){
					var desc = webshims.defineNodeNameProperty(nodeName, messageProp, {
						get: function(){
							var elem = this;
							var message = '';
							if(!$.attr(elem, 'willValidate')){
								return message;
							}
							
							var validity = $.attr(elem, 'validity') || {valid: 1};
							
							if(validity.valid){return message;}
							message = elem.getAttribute('x-moz-errormessage') || elem.getAttribute('data-errormessage') || '';
							
							if(message){return message;}
							
							if(validity.customError && elem.nodeName){
								message = (Modernizr.validationmessage && desc._supget) ? desc._supget.call(elem) : $.data(elem, 'customvalidationMessage');
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
						set: $.noop
					});
				});
				
			});
		});
	})();
});



