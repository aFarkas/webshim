(function($){
if($.support.validity){
	return;
}

//some helper-functions
var getNames = function(elem){
		return (elem.form && elem.name) ? elem.form[elem.name] : [];
	},
	isNumber = function(string){
		return (typeof string == 'number' || (string && string == string * 1));
	},
	checkTypes = {
		radio: 1,
		checkbox: 1		
	},
	getType = function(elem){
		return (elem.getAttribute('type') || '').toLowerCase();
	}
;

//API to add new input types
var typeModels = {};
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
				if(ret){return ret;}
				val.replace(/\u0A/g, function(){
					len++;
				});
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
			if(!e.isDefaultPrevented()){
				if(!unhandledInvalids){
					$.webshims.validityAlert.showFor(jElm);
				}
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
		if( e.type != 'submit' || !$.nodeName(e.target, 'form') || $.attr(e.target, 'novalidate') ){return;}
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
			return !!( elem.name && elem.form && !elem.disabled && !elem.readonly && !types[elem.type] && !$.attr(elem.form, 'novalidate') );
		};
	})()
});

// add support for new input-types

$.webshims.attr('type', {
	elementNames: ['input'],
	getter: function(elem, fn){
		var type = getType(elem);
		return (typeModels[type]) ? type : elem.type || elem.getAttribute('type');
	},
	//don't change setter
	setter: true
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

$.webshims.addReady(function(context){
	//start constrain-validation
	$('form', context).bind('invalid', $.noop);
});


})(jQuery);

(function($){
	
if($.support.validity === true){
	return;
}
$.support.validity = 'shim';
$.support.fieldsetValidation = 'shim';

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
})(jQuery);

/* fix chrome 5/6 and safari 5 implemenation + add some usefull custom invalid event called firstinvalid */
(function($){
	var firstEvent,
		stopSubmitTimer,
		form
	;
	
	//opera fix
	//opera thorws a submit-event and then the invalid events,
	//the following code will trigger the invalid events first and webkitfix will stopImmediatePropagation of submit event
	if($.support.validity === true && document.addEventListener && !window.noHTMLExtFixes && window.opera){
		document.addEventListener('submit', function(e){
			if(e.target.checkValidity){
				e.target.checkValidity();
			}
		}, true);
	}
	$(document).bind('invalid', function(e){
		if(!firstEvent){
			//webkitfix 
			//chrome/safari submits an invalid form, if you prevent all invalid events
			//this also prevents opera from throwing a submit event if form isn't valid
			form = e.target.form;
			if ($.support.validity === true && form && !window.noHTMLExtFixes){
				var submitEvents = $(form)
					.bind('submit.preventInvalidSubmit', function(submitEvent){
						if( !$.attr(form, 'novalidate') ){
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
		
		clearTimeout(stopSubmitTimer);
		stopSubmitTimer = setTimeout(function(){
			//reset firstinvalid
			firstEvent = false;
			//remove webkitfix
			$(form).unbind('submit.preventInvalidSubmit');
		}, 9);
		
	});
	
	
	/* some extra validation UI */
	var ValidityAlert = function(){this._create();};
	
	ValidityAlert.prototype = {
		_create: function(){
			this.alert = $('<div class="validity-alert"><div class="va-box" /></div>').css({position: 'absolute', display: 'none'});
			this.hideTimer = false;
			this.boundHide = $.proxy(this, 'hide');
		},
		hideDelay: 5000,
		createAlert: function(){
			if(this.created){return;}
			this.created = true;
			var that = this;
			$(function(){that.alert.appendTo('body');});
		},
		showFor: function(elem, noFocus){
			elem = $(elem);
			var widget = elem.data('inputUIReplace');
			if(widget){
				elem = widget.visual;
			}
			this.createAlert();
			this.clear();
			this.getMessage(elem);
			this.position(elem);
			this.show();
			if(!noFocus){
				elem.focus();
			}
			this.hideTimer = setTimeout(this.boundHide, this.hideDelay);
			$(document).bind('focusout.validityalert', this.boundHide);
		},
		getMessage: function(elem){
			$('> div', this.alert).html(elem.attr('validationMessage'));
		},
		position: function(elem){
			var offset = elem.offset();
			offset.top += elem.outerHeight();
			this.alert.css(offset);
		},
		clear: function(){
			clearTimeout(this.hideTimer);
			$(document).unbind('focusout.validityalert');
			this.alert.stop().css({opacity: ''});
		},
		show: function(){
			this.alert.fadeIn();
		},
		hide: function(){
			this.clear();
			this.alert.fadeOut();
		}
	};
	$.webshims.validityAlert = new ValidityAlert();
})(jQuery);

(function($){
	if($.support.validationMessage){
		return;
	}
	$.support.validationMessage = 'shim';
	
	
	$.webshims.validityMessages = [];
	
	$.webshims.validityMessages[''] = {
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
		stepMismatch: 'The value {%value} is not allowed for this form. Only certain values are allowed for this field. {%title}',
		tooLong: 'The entered text is too large! You used {%valueLen} letters and the limit is {%maxlength}.',
		
		patternMismatch: '{%value} is not in the format this page requires! {%title}',
		valueMissing: 'You have to specify a value'
	};
	
	$.webshims.validityMessages['de'] = {
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
	
	
	
	var validiyMessages;
	$(document).bind('htmlExtLangChange', function(){
		$.webshims.activeLang($.webshims.validityMessages, 'validation-base', function(langObj){
			validiyMessages = langObj;
		});
	});
	
	$.webshims.attr('validationMessage', {
		elementNames: ['input', 'select', 'textarea'],
		getter: function(elem){
			var message = '';
			if(!$.attr(elem, 'willValidate')){
				return message;
			}
			message = ('validationMessage' in elem) ? elem.validationMessage : $.data(elem, 'customvalidationMessage');
			if(message){return message;}
			var validity = $.attr(elem, 'validity') || {valid: 1};
			if(validity.valid){return '';}
			$.each(validity, function(name, prop){
				if(name == 'valid' || !prop){return;}
				message = validiyMessages[name];
				if(message && typeof message !== 'string'){
					message = message[ (elem.getAttribute('type') || '').toLowerCase() ] || message.defaultMessage;
				}
				if(message){
					return false;
				}
			});
			if(message){
				$.each(['value', 'min', 'max', 'title', 'maxlength'], function(i, attr){
					if(message.indexOf('%'+attr) === -1){return;}
					var val = $.attr(elem, attr) || '';
					message = message.replace('{%'+ attr +'}', val);
					if('value' == attr){
						message = message.replace('{%valueLen}', val.length);
					}
				});
			}
			return message || '';
		}
	});
})(jQuery);

(function($){
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
})(jQuery);
/*
 * HTML5 placeholder-enhancer
 * version: 2.0.2
 * including a11y-name fallback
 * 
 * Simply use the HTML5 placeholder attribute 
 * <input type="text" id="birthday" placeholder="dd.mm.yyyy" />
 * 
 * http://www.protofunc.com/2009/08/16/meinung-zu-html5/, 
 * http://robertnyman.com/2010/06/17/adding-html5-placeholder-attribute-support-through-progressive-enhancement/
 * 
 */


(function($){
	if($.support.placeholder){
		return;
	}
	$.support.placeholder = 'shim';
	
	var pHolder = (function(){
		var showPlaceholder = function(force){
				if(!this.value || force === true){
					$(this).addClass('placeholder-visible');
					this.value = this.getAttribute('placeholder') || '';
				}
			},
			hidePlaceHolder = function(){
				if( $(this).hasClass('placeholder-visible') ){
					this.value = '';
					$(this).removeClass('placeholder-visible');
				}
			},
			placeholderID 	= 0,
			delReg 	= /\n|\r|\f|\t/g,
			allowedPlaceholder = {
				text: 1,
				search: 1,
				url: 1,
				email: 1,
				password: 1,
				tel: 1,
				url: 1
			}
		;
		
		return {
			create: function(elem){
				
				if($.data(elem, 'placeHolder')){return;}
				var remove = function(){
					hidePlaceHolder.apply(elem);
				};
				placeholderID++;
				$.data(elem, 'placeHolder', placeholderID);
				$(elem)
					.bind('blur', showPlaceholder)
					.bind('focus', hidePlaceHolder)
				;
				$(window).bind('unload.id-'+placeholderID, remove);
				$(elem.form).bind('submit.id-'+placeholderID, remove);
			},
			changesValidity: function(elem, val){
				if($.support.validity === true && $.attr(elem, 'willValidate')){
					if( $.attr(elem, 'required') ){return true;}
					var oldVal 	= $.attr(elem, 'value'),
						ret 	= false
					;
					$.attr(elem, 'value', val);
					ret = !($.attr(elem, 'validity') || {valid: true}).valid;
					$.attr(elem, 'value', oldVal);
				}
				return false;
			},
			update: function(elem, val){
				var type = $.attr(elem, 'type');
				if(!allowedPlaceholder[type] && !$.nodeName(elem, 'textarea')){return;}
				if(!val){
					pHolder.destroy(elem);
					elem.removeAttribute('placeholder');
					return;
				}
				
				var input = $(elem);
				val = val.replace(delReg, '');
				elem.setAttribute('placeholder', val);
				
				if( pHolder.changesValidity(elem, val) ){
					pHolder.destroy(elem);
					return;
				}
				pHolder.create(elem);
				if(!input.val()){
					showPlaceholder.call(elem, true);
				}
			},
			destroy: function(elem){
				var id = $.data(elem, 'placeHolder');
				if(!id){return;}
				$.data(elem, 'placeHolder', false);
				$(elem)
					.unbind('blur', showPlaceholder)
					.unbind('focus', hidePlaceHolder)
				;
				$(window).unbind('unload.id-'+id);
				$(elem.form).unbind('submit.id-'+id);
				hidePlaceHolder.apply(this);
			}
		};
	})();
	
	
	$.webshims.attr('placeholder', {
		elementNames: ['input', 'textarea'],
		setter: function(elem, val){
			pHolder.update(elem, val);
		},
		getter: function(elem){
			return elem.getAttribute('placeholder');
		}
	});
		
	var value = {
		elementNames: ['input', 'textarea'],
		setter: function(elem, value, oldFn){
			var placeholder = elem.getAttribute('placeholder');
			if(placeholder && 'value' in elem){
				if(value){
					$(elem).removeClass('placeholder-visible');
				} else {
					pHolder.update(elem, placeholder);
				}
			}
			oldFn();
		},
		getter: function(elem, oldFn){
			if($(elem).hasClass('placeholder-visible')){
				return '';
			}
			return oldFn();
		}
	};
	
	$.webshims.attr('value', value);
	
	var oldVal = $.fn.val;
	$.fn.val = function(val){
		if(val === undefined){
			if(this[0] && $(this[0]).hasClass('placeholder-visible')){
				return '';
			}
			return oldVal.apply(this, arguments);
		} else {
			var that 	= this,
				ret 	= oldVal.apply(this, arguments)
			;
			this.each(function(){
				if( this.nodeType === 1 && this.getAttribute('placeholder') ){
					value.setter(this, val, $.noop);
				}
			});
			return ret;
		}
	};
			
	$.webshims.addReady(function(context){
		$('input[placeholder], textarea[placeholder]', context).attr('placeholder', function(i, holder){
			return holder;
		});
	});
	
})(jQuery);
