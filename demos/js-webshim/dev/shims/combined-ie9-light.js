(function($){
	if(navigator.geolocation){return;}
	$.support.geolocation = 'shim';
	var domWrite = function(){
			setTimeout(function(){
				throw('document.write is overwritten by geolocation shim. This method is incompatibel with this plugin');
			}, 1);
		},
		id = 0
	;
	navigator.geolocation = (function(){
		var createCoords = function(){
				if(coords || !window.google || !google.loader || !google.loader.ClientLocation){return;}
				var cl = google.loader.ClientLocation;
	            coords = {
	                latitude: cl.latitude,
	                longitude: cl.longitude,
	                altitude: null,
	                accuracy: 43000,
	                altitudeAccuracy: null,
	                heading: parseInt('NaN', 10),
	                velocity: null
	            };
			},
			coords
		;
		var api = {
			getCurrentPosition: function(success, error, opts){
				var callback = function(){
						clearTimeout(timer);
						createCoords();
						if(coords){
							success({coords: coords, timestamp: new Date().getTime()});
						} else if(error) {
							error({ code: 2, message: "POSITION_UNAVAILABLE"});
						}
					},
					timer
				;
				if(!window.google || !google.loader){
					//destroys document.write!!!
					if($.webshims.modules.geolocation.options.destroyWrite){
						document.write = domWrite;
						document.writeln = domWrite;
					}
					$(document).one('google-loaderReady', callback);
					$.webshims.loader.loadScript('http://www.google.com/jsapi', false, 'google-loader');
				} else {
					setTimeout(callback, 1);
					return;
				}
				if(opts && opts.timeout){
					timer = setTimeout(function(){
						$(document).unbind('google-loader', callback);
						if(error) {
							error({ code: 3, message: "TIMEOUT"});
						}
					}, opts.timeout);
				}
			},
			clearWatch: $.noop
		};
		api.watchPosition = function(a, b, c){
			api.getCurrentPosition(a, b, c);
			id++;
			return id;
		};
		return api;
	})();
})(jQuery);
/* fix chrome 5/6 and safari 5 implemenation + add some usefull custom invalid event called firstinvalid */
jQuery.webshims.ready('es5', function($){
	
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
	
	/* some extra validation UI */
	$.webshims.validityAlert = (function(){
		
		var api = {
			hideDelay: 5000,
			showFor: function(elem, hideOnBlur){
				elem = $(elem);
				var visual = (elem.data('inputUIReplace') || {visual: elem}).visual;
				createAlert();
				api.clear();
				alert.attr('for', visual.attr('id'));
				this.getMessage(elem);
				this.position(visual);
				this.show();
				
				if(this.hideDelay){
					hideTimer = setTimeout(boundHide, this.hideDelay);
				}
				if(!hideOnBlur){
					visual.focus();
					$(document).bind('focusout.validityalert', boundHide);
				}
			},
			getMessage: function(elem){
				$('> span', alert).html(elem.attr('validationMessage'));
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
				$(document).unbind('focusout.validityalert');
				alert.stop().removeAttr('for');
			},
			alert: $('<label class="validity-alert" role="alert"><span class="va-box" /></label>').css({position: 'absolute', display: 'none'})
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
	$.webshims.validityMessages['en'] = $.webshims.validityMessages['en'] || $.webshims.validityMessages['en-US'] || {
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
	
	$.webshims.validityMessages['en-US'] = $.webshims.validityMessages['en-US'] || $.webshims.validityMessages['en'];
	$.webshims.validityMessages[''] = $.webshims.validityMessages[''] || $.webshims.validityMessages['en'];
	
	$.webshims.validityMessages['de'] = $.webshims.validityMessages['de'] || {
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
	
	var currentValidationMessage =  $.webshims.validityMessages[''];
	$(document).bind('htmlExtLangChange', function(){
		$.webshims.activeLang($.webshims.validityMessages, 'validation-base', function(langObj){
			currentValidationMessage = langObj;
		});
	});
	
	$.webshims.createValidationMessage = function(elem, name){
		var message = currentValidationMessage[name];
		if(message && typeof message !== 'string'){
			message = message[ (elem.getAttribute('type') || '').toLowerCase() ] || message.defaultMessage;
		}
		if(message){
			$.each(['value', 'min', 'max', 'title', 'maxlength', 'label'], function(i, attr){
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
		
	$.each(($.support.validationMessage) ? ['customValidationMessage'] : ['customValidationMessage', 'validationMessage'], function(i, fn){
		$.webshims.attr(fn, {
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
					message = $.webshims.createValidationMessage(elem, name);
					if(message){
						return false;
					}
				});
				
				return message || '';
			}
		});
	} );
	
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
		if($.support.validity === true && window.addEventListener && !window.noHTMLExtFixes){
			window.addEventListener('submit', function(e){
				if(e.target.checkValidity && $.attr(e.target, 'novalidate') === undefined && !e.target.checkValidity()){
					invalidTriggeredBySubmit = true;
				}
			}, true);
		}
		$(document).bind('invalid', function(e){
			if(!firstEvent){
				//webkitfix 
				//chrome 6/safari5.0 submits an invalid form, if you prevent all invalid events
				//this also prevents opera from throwing a submit event if form isn't valid
				form = e.target.form;
				if ($.support.validity === true && form && !window.noHTMLExtFixes){
					var submitEvents = $(form)
						.bind('submit.preventInvalidSubmit', function(submitEvent){
							if( $.attr(form, 'novalidate') === undefined ){
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
			//prevent doubble invalids
			if($.support.validity !== true || $.inArray(e.target, invalids) == -1){
				invalids.push(e.target);
			} else if(!window.noHTMLExtFixes) {
				doubled = true;
				e.stopImmediatePropagation();
			}
			e.extraData = 'fix'; 
			clearTimeout(stopSubmitTimer);
			stopSubmitTimer = setTimeout(function(){
				var lastEvent = {type: 'lastinvalid', cancelable: false, invalidlist: $(invalids)};
				//if events aren't dubled, we have a bad implementation, if the event isn't prevented and the first invalid elemenet isn't focused we show custom bubble
				if( invalidTriggeredBySubmit && !doubled && firstEvent.target !== document.activeElement && document.activeElement && !$.data(firstEvent.target, 'maybePreventedinvalid') ){
					$.webshims.validityAlert.showFor(firstEvent.target);
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
		if($.support.validity !== true || $.support.fieldsetValidation || window.noHTMLExtFixes){
			return;
		}
		$.support.fieldsetValidation = 'shim';
		$.webshims.addMethod('checkValidity', function(error){
			if($.nodeName(this, 'fieldset')){
				var ret = true;
				$(this.elements || 'input, textarea, select', this)
					.each(function(){
						 if(this.checkValidity){
							if(!this.checkValidity()){
								ret = false;
							}
						}
					})
				;
				return ret;
			} else if(this.checkValidity){
				return this.checkValidity();
			}
		});
	})();
	
	$.support.validationMessage = $.support.validationMessage || 'shim';
	
	$.webshims.createReadyEvent('validation-base');
}, true, true);


jQuery.webshims.ready('validation-base', function($){
if($.support.validity){
	return;
}

$.webshims.inputTypes = $.webshims.inputTypes || {};
//some helper-functions
var getNames = function(elem){
		return (elem.form && elem.name) ? elem.form[elem.name] : [];
	},
	isNumber = function(string){
		return (typeof string == 'number' || (string && string == string * 1));
	},
	typeModels = $.webshims.inputTypes,
	checkTypes = {
		radio: 1,
		checkbox: 1		
	},
	getType = function(elem){
		return (elem.getAttribute('type') || '').toLowerCase();
	}
;

//API to add new input types
$.webshims.addInputType = function(type, obj){
	typeModels[type] = obj;
};

//contsrain-validation-api
var validiyPrototype = {
	customError: false,

	typeMismatch: false,
	rangeUnderflow: false,
	rangeOverflow: false,
	stepMismatch: false,
	tooLong: false,
	patternMismatch: false,
	valueMissing: false,
	
	valid: true
};

var validityRules = {
		valueMissing: function(input, val){
			if(!input.attr('required')){
				return false;
			}
			return ( checkTypes[input[0].type] ) ? !$(getNames(input[0])).filter(':checked')[0] : !(val);
		},
		tooLong: function(input, val){
			if(val === ''){return false;}
			var maxLen 	= input.attr('maxlength'),
				ret 	= false,
				len 	= val.length	
			;
			if(len && maxLen >= 0 && val.replace && isNumber(maxLen)){
				ret = (len > maxLen);
			}
			return ret;
		},
		typeMismatch: function (input, val, cache){
			if(val === ''){return false;}
			var ret = false;
			if(!('type' in cache)){
				cache.type = getType(input[0]);
			}
			
			if(typeModels[cache.type] && typeModels[cache.type].mismatch){
				ret = typeModels[cache.type].mismatch(val, input);
			}
			return ret;
		},
		patternMismatch: function(input, val) {
			if(val === ''){return false;}
			var pattern = input.attr('pattern');
			if(!pattern){return false;}
			return !(new RegExp('^(?:' + pattern + ')$').test(val));
		}
	}
;

$.webshims.addValidityRule = function(type, fn){
	validityRules[type] = fn;
};

$.webshims.addMethod('checkValidity', (function(){
	var unhandledInvalids;
	var testValidity = function(elem){
		
		var e,
			v = $.attr(elem, 'validity')
		;
		if(v){
			$.data(elem, 'cachedValidity', v);
		} else {
			v = {valid: true};
		}
		if( !v.valid ){
			e = $.Event('invalid');
			var jElm = $(elem).trigger(e);
			if(!unhandledInvalids && !e.isDefaultPrevented()){
				$.webshims.validityAlert.showFor(jElm);
				unhandledInvalids = true;
			}
		}
		$.data(elem, 'cachedValidity', false);
		return v.valid;
	};
	return function(){
		unhandledInvalids = false;
		if($.nodeName(this, 'form') || $.nodeName(this, 'fieldset')){
			var ret = true,
				elems = this.elements || $( 'input, textarea, select', this);
			
			for(var i = 0, len = elems.length; i < len; i++){
				if( !testValidity(elems[i]) ){
					ret = false;
				}
			}
			
			return ret;
		} else if(this.form){
			return testValidity(this);
		} else {
			return true;
		}

	};
})());

$.event.special.invalid = {
	add: function(){
		if( !$.data(this, 'invalidEventShim') ){
			$.event.special.invalid.setup.call(this);
		}
	},
	setup: function(){
		$(this)
			.bind('submit', $.event.special.invalid.handler)
			.data('invalidEventShim', true)
		;
		var submitEvents = $(this).data('events').submit;
		if(submitEvents && submitEvents.length > 1){
			submitEvents.unshift( submitEvents.pop() );
		}
	},
	teardown: function(){
		$(this)
			.unbind('submit', $.event.special.invalid.handler)
			.data('invalidEventShim', false)
		;
	},
	handler: function(e, d){
		if( e.type != 'submit' || !$.nodeName(e.target, 'form') || $.attr(e.target, 'novalidate') !== undefined || $.data(e.target, 'novalidate') ){return;}
		var notValid = !($(e.target).checkValidity());
		if(notValid){
			if(!e.originalEvent && !window.debugValidityShim && window.console && console.log){
				console.log('submit');
			}
			e.stopImmediatePropagation();
			return false;
		}
	}
};

// IDLs for constrain validation API
$.webshims.attr('validity', {
	elementNames: ['input', 'select', 'textarea'],
	getter: function(elem){
		var validityState = $.data(elem, 'cachedValidity');
		if(validityState){
			return validityState;
		}
		validityState 	= $.extend({}, validiyPrototype);
		
		if( !$.attr(elem, 'willValidate') ){
			return validityState;
		}
		var jElm 			= $(elem),
			val				= jElm.val(),
			cache 			= {}
		;
		
		validityState.customError = !!($.data(elem, 'customvalidationMessage'));
		if( validityState.customError ){
			validityState.valid = false;
		}
		
		//select
		if(	(elem.nodeName || '').toLowerCase() == 'select' ){
			return validityState;
		}
		
		$.each(validityRules, function(rule, fn){
			if (fn(jElm, val, cache)) {
				validityState[rule] = true;
				validityState.valid = false;
			}
		});
		return validityState;
	}
});

$.webshims.addMethod('setCustomValidity', function(error){
	$.data(this, 'customvalidationMessage', ''+error);
});

//this will be extended
$.webshims.attr('validationMessage', {
	elementNames: ['input', 'select', 'textarea'],
	getter: function(elem, fn){
		var message = fn() || $.data(elem, 'customvalidationMessage');
		return (!message || !$.attr(elem, 'willValidate')) ? 
			'' :
			message
		;
	}
});

$.webshims.createBooleanAttrs('required', ['input', 'textarea']);

$.webshims.attr('willValidate', {
	elementNames: ['input', 'select', 'textarea'],
	getter: (function(){
		var types = {
				button: 1,
				reset: 1,
				add: 1,
				remove: 1,
				'move-up': 1,
				'move-down': 1,
				hidden: 1,
				submit: 1
			}
		;
		return function(elem){
			return !!( elem.name && elem.form && !elem.disabled && !elem.readOnly && !types[elem.type] && $.attr(elem.form, 'novalidate') === undefined );
		};
	})()
});

$.webshims.addInputType('email', {
	mismatch: (function(){
		//taken from scott gonzales
		var test = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|(\x22((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?\x22))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
		return function(val){
			return !test.test(val);
		};
	})()
});

$.webshims.addInputType('url', {
	mismatch: (function(){
		//taken from scott gonzales
		var test = /^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
		return function(val){
			//taken from scott gonzales
			return !test.test(val);
		};
	})()
});

var noValidate = function(){
		var elem = this;
		if(!elem.form){return;}
		$.data(elem.form, 'novalidate', true);
		setTimeout(function(){
			$.data(elem.form, 'novalidate', false);
		}, 1);
	}, 
	submitterTypes = {submit: 1, button: 1}
;

$(document).bind('click', function(e){
	if(e.target && e.target.form && submitterTypes[e.target.type] && $.attr(e.target, 'formnovalidate') !== undefined){
		noValidate.call(e.target);
	}
});

$.webshims.addReady(function(context){
	//start constrain-validation
	$('form', context)
		.bind('invalid', $.noop)
		.find('button[formnovalidate]')
		.bind('click', noValidate)
	;
});

(function(){
	
if($.support.validity === true){
	return;
}
$.support.validity = 'shim';
	var elements = {
			input: 1,
			textarea: 1
		},
		noInputTypes = {
			radio: 1,
			checkbox: 1,
			submit: 1,
			button: 1,
			image: 1,
			reset: 1
			
			//pro forma
			,color: 1,
			range: 1
		},
		observe = function(input){
			var timer,
				type 	= input[0].getAttribute('type'),
				lastVal = input.val(),
				trigger = function(e){
					//input === null
					if(!input){return;}
					var newVal = input.val();
					
					if(newVal !== lastVal){
						lastVal = newVal;
						if(!e || e.type != 'input'){
							input.trigger('input');
						}
					}
				},
				unbind = function(){
					input.unbind('focusout', unbind).unbind('input', trigger);
					clearInterval(timer);
					trigger();
					input = null;
				}
			;
			
			clearInterval(timer);
			timer = setInterval(trigger, 150);
			setTimeout(trigger, 9);
			input.bind('focusout', unbind).bind('input', trigger);
		}
	;
	$(document)
		.bind('focusin', function(e){
			if( e.target && e.target.type && !e.target.readonly && !e.target.readOnly && !e.target.disabled && elements[(e.target.nodeName || '').toLowerCase()] && !noInputTypes[e.target.type] ){
				observe($(e.target));
			}
		})
	;
})();

$.webshims.createReadyEvent('validity');

}, true, true); //webshims.ready end



/*
 * HTML5 placeholder-enhancer
 * version: 2.0.2
 * including a11y-name fallback
 * 
 * 
 */


(function($){
	if($.support.placeholder){
		return;
	}
	$.support.placeholder = 'shim';
	var changePlaceholderVisibility = function(elem, value, placeholderTxt, data, type){
			if(!data){
				data = $.data(elem, 'placeHolder');
				if(!data){return;}
			}
			if(type == 'focus'){
				data.box.removeClass('placeholder-visible');
				return;
			}
			if(value === false){
				value = $.attr(elem, 'value');
			}
			if(value){
				data.box.removeClass('placeholder-visible');
				return;
			}
			if(placeholderTxt === false){
				placeholderTxt = $.attr(elem, 'placeholder');
			}
			
			data.box[(placeholderTxt && !value) ? 'addClass' : 'removeClass']('placeholder-visible');
		},
		placeholderID 	= 0,
		createPlaceholder = function(elem){
			elem = $(elem);
			var id 			= elem.attr('id'),
				hasLabel	= !!(elem.attr('title') || elem.attr('aria-labeledby')),
				pHolderTxt
			;
			if(!hasLabel && id){
				hasLabel = !!($('label[for='+ id +']', elem[0].form)[0]);
			} else if(!id){
				placeholderID++;
				id = 'input-placeholder-id-'+ placeholderID;
				elem.attr('id', id);
			}
			return $((hasLabel) ? '<span class="placeholder-text"></span>' : '<label for="'+ id +'" class="placeholder-text"></label>');
		},
		pHolder = (function(){
			var delReg 	= /\n|\r|\f|\t/g,
				allowedPlaceholder = {
					text: 1,
					search: 1,
					url: 1,
					email: 1,
					password: 1,
					tel: 1
				}
			;
			
			return {
				create: function(elem){
					var data = $.data(elem, 'placeHolder');
					if(data){return data;}
					data = $.data(elem, 'placeHolder', {
						text: createPlaceholder(elem)
					});
					data.box = $(elem)
						.wrap('<span class="placeholder-box placeholder-box-'+ (elem.nodeName || '').toLowerCase() +'" />')
						.bind('focus.placeholder blur.placeholder', function(e){
							changePlaceholderVisibility(this, false, false, data, e.type );
						})
						.parent()
					;

					data.text
						.insertAfter(elem)
						.bind('mousedown.placeholder', function(){
							changePlaceholderVisibility(this, false, false, data, 'focus' );
							elem.focus();
							return false;
						})
					;
					
					
	
					$.each(['Left', 'Top'], function(i, side){
						var size = (parseInt($.curCSS(elem, 'padding'+ side), 10) || 0) + Math.max((parseInt($.curCSS(elem, 'margin'+ side), 10) || 0), 0) + (parseInt($.curCSS(elem, 'border'+ side +'Width'), 10) || 0);
						data.text.css('padding'+ side, size);
					});
					var lineHeight 	= $.curCSS(elem, 'lineHeight'),
						dims 		= {
							width: $(elem).width() || parseInt($.curCSS(elem, 'width'), 10),
							height: $(elem).height() || parseInt($.curCSS(elem, 'height'), 10)
						},
						cssFloat 		= $.curCSS(elem, 'float')
					;
					if(data.text.css('lineHeight') !== lineHeight){
						data.text.css('lineHeight', lineHeight);
					}
					if(dims.width && dims.height){
						data.text.css(dims);
					}
					if(cssFloat !== 'none'){
						data.box.addClass('placeholder-box-'+cssFloat);
					}
					
					return data;
				},
				update: function(elem, val){
					if(!allowedPlaceholder[$.attr(elem, 'type')] && !$.nodeName(elem, 'textarea')){return;}
					if($.nodeName(elem, 'input')){
						val = val.replace(delReg, '');
					}
					var data = pHolder.create(elem);
					elem.setAttribute('placeholder', val);
					data.text.text(val);
					changePlaceholderVisibility(elem, false, val, data);
				}
			};
		})()
	;
	
	
	$.webshims.attr('placeholder', {
		elementNames: ['input', 'textarea'],
		setter: function(elem, val){
			pHolder.update(elem, val);
		},
		getter: function(elem){
			return elem.getAttribute('placeholder') || '';
		}
	});
		
	var value = {
		elementNames: ['input', 'textarea'],
		setter: function(elem, value, oldFn){
			var placeholder = elem.getAttribute('placeholder');
			if(placeholder && 'value' in elem){
				changePlaceholderVisibility(elem, value, placeholder);
			}
			oldFn();
		},
		getter: true
	};
	
	$.webshims.attr('value', value);
	
	var oldVal = $.fn.val;
	$.fn.val = function(val){
		if(val !== undefined){
			this.each(function(){
				if( this.nodeType === 1 ){
					value.setter(this, val, $.noop);
				}
			});
		}
		return oldVal.apply(this, arguments);
	};
			
	$.webshims.addReady(function(context){
		$('input[placeholder], textarea[placeholder]', context).attr('placeholder', function(i, holder){
			return holder;
		});
	});
})(jQuery);
