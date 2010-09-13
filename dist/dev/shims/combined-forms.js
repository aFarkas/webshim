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
		var showPlaceholder = function(){
				if(!this.value){
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
			delReg 	= /\n|\r|\f|\t/g
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
					input.addClass('placeholder-visible');
					elem.value = val;
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
	
	
	$.htmlExt.attr('placeholder', {
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
	
	$.htmlExt.attr('value', value);
	
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
			
	$.htmlExt.addReady(function(context){
		$('input[placeholder], textarea[placeholder]', context).attr('placeholder', function(i, holder){
			return holder;
		});
	});
	
})(jQuery);
(function($){
if($.support.validity){
	return;
}

//some helper-functions
var getNames = function(elem){
		return (elem.form && elem.name) ? elem.form[elem.name] : [];
	},
	nan = parseInt('a', 10),
	isNumber = function(string){
		return (typeof string == 'number' || (string && string == string * 1));
	},
	isDateTimePart = function(string){
		return (isNumber(string) || (string && string == '0' + (string * 1)));
	},
	checkTypes = {
		radio: 1,
		checkbox: 1		
	},
	getType = function(elem){
		return (elem.getAttribute('type') || '').toLowerCase();
	},
	//why no step IDL?
	getStep = function(elem, type){
		var step = $.attr(elem, 'step');
		if(step === 'any'){
			return step;
		}
		type = type || getType(elem);
		if(!typeModels[type] || !typeModels[type].step){
			return step;
		}
		step = typeModels.number.asNumber(step);
		return ((!isNaN(step) && step > 0) ? step : typeModels[type].step) * typeModels[type].stepScaleFactor;
	},
	//why no min/max IDL?
	addMinMaxNumberToCache = function(attr, elem, cache){
		if (!(attr+'AsNumber' in cache)) {
			cache[attr+'AsNumber'] = typeModels[cache.type].asNumber(elem.attr(attr));
			if(isNaN(cache[attr+'AsNumber']) && (attr+'Default' in typeModels[cache.type])){
				cache[attr+'AsNumber'] = typeModels[cache.type][attr+'Default'];
			}
		}
	},
	addleadingZero = function(val, len){
		val = ''+val;
		len = len - val.length;
		for(var i = 0; i < len; i++){
			val = '0'+val;
		}
		return val;
	},
	EPS = 1e-7,
	throwDOMException = (function(){
		var codes = {
			11: "INVALID_STATE_ERR"
		};
		return function(code){
			var error = {
				code: code,
				name: codes[code],
				message: codes[code] +": DOM Exception "+ code
			};
			throw(error);
		}; 
	})()
;

//API to add new input types
var typeModels = {};
$.htmlExt.addInputType = function(type, obj){
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
		stepMismatch: function(input, val, cache){
			if(val === ''){return false;}
			if(!('type' in cache)){
				cache.type = getType(input[0]);
			}
			//stepmismatch with date is computable, but it would be a typeMismatch (performance)
			if(cache.type == 'date'){
				return false;
			}
			var ret = false, base;
			if(typeModels[cache.type] && typeModels[cache.type].step){
				if( !('step' in cache) ){
					cache.step = getStep(input[0], cache.type);
				}
				
				if(cache.step == 'any'){return false;}
				
				if(!('valueAsNumber' in cache)){
					cache.valueAsNumber = typeModels[cache.type].asNumber( val );
				}
				if(isNaN(cache.valueAsNumber)){return false;}
				
				addMinMaxNumberToCache('min', input, cache);
				base = cache.minAsNumber;
				if(isNaN(base)){
					base = typeModels[cache.type].stepBase || 0;
				}
				
				ret =  Math.abs((cache.valueAsNumber - base) % cache.step);
								
				ret = !(  ret <= EPS || Math.abs(ret - cache.step) <= EPS  );
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

$.each([{name: 'rangeOverflow', attr: 'max', factor: 1}, {name: 'rangeUnderflow', attr: 'min', factor: -1}], function(i, data){
	validityRules[data.name] = function(input, val, cache) {
		var ret = false;
		if(val === ''){return ret;}
		if (!('type' in cache)) {
			cache.type = getType(input[0]);
		}
		if (typeModels[cache.type] && typeModels[cache.type].asNumber) {
			if(!('valueAsNumber' in cache)){
				cache.valueAsNumber = typeModels[cache.type].asNumber( val );
			}
			if(isNaN(cache.valueAsNumber)){
				return false;
			}
			
			addMinMaxNumberToCache(data.attr, input, cache);
			
			if(isNaN(cache[data.attr+'AsNumber'])){
				return ret;
			}
			
			ret = ( cache[data.attr+'AsNumber'] * data.factor <=  cache.valueAsNumber * data.factor - EPS );
		}
		return ret;
	};
});



$.htmlExt.addMethod('checkValidity', (function(){
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
					$.htmlExt.validityAlert.showFor(jElm);
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
$.htmlExt.attr('validity', {
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

$.htmlExt.addMethod('setCustomValidity', function(error){
	$.data(this, 'customvalidationMessage', ''+error);
});

//this will be extended
$.htmlExt.attr('validationMessage', {
	elementNames: ['input', 'select', 'textarea'],
	getter: function(elem, fn){
		var message = fn() || $.data(elem, 'customvalidationMessage');
		return (!message || !$.attr(elem, 'willValidate')) ? 
			'' :
			message
		;
	}
});

$.htmlExt.createBooleanAttrs('required', ['input', 'textarea']);

$.htmlExt.attr('willValidate', {
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

//IDLs and methods, that aren't part of constrain validation, but strongly tight to it

$.htmlExt.attr('valueAsNumber', {
	elementNames: ['input'],
	getter: function(elem, fn){
		var type = getType(elem);
		return (typeModels[type] && typeModels[type].asNumber) ? 
			typeModels[type].asNumber($.attr(elem, 'value')) :
			nan;
	},
	setter: function(elem, val, fn){
		var type = getType(elem);
		if(typeModels[type] && typeModels[type].numberToString){
			var set = typeModels[type].numberToString(val);
			if(set !==  false){
				$.attr(elem, 'value', set);
			}
		} else {
			fn();
		}
	}
});

$.htmlExt.attr('valueAsDate', {
	elementNames: ['input'],
	getter: function(elem, fn){
		var type = getType(elem);
		return (typeModels[type] && typeModels[type].asDate && !typeModels[type].noAsDate) ? 
			typeModels[type].asDate($.attr(elem, 'value')) :
			null;
	},
	setter: function(elem, value, fn){
		var type = getType(elem);
		if(typeModels[type] && typeModels[type].dateToString){
			var set = typeModels[type].dateToString(value);
			if(set !== false){
				$.attr(elem, 'value', set);
			}
		} else {
			fn();
		}
	}
});

// add support for new input-types

$.htmlExt.attr('type', {
	elementNames: ['input'],
	getter: function(elem, fn){
		var type = getType(elem);
		return (typeModels[type]) ? type : elem.type || elem.getAttribute('type');
	},
	//don't change setter
	setter: true
});

$.htmlExt.addInputType('email', {
	mismatch: (function(){
		//taken from scott gonzales
		var test = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|(\x22((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?\x22))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
		return function(val){
			return !test.test(val);
		};
	})()
});

$.htmlExt.addInputType('url', {
	mismatch: (function(){
		//taken from scott gonzales
		var test = /^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
		return function(val){
			//taken from scott gonzales
			return !test.test(val);
		};
	})()
});

$.htmlExt.addInputType('number', {
	mismatch: function(val){
		return !(isNumber(val));
	},
	step: 1,
	//stepBase: 0, 0 = default
	stepScaleFactor: 1,
	asNumber: function(str){
		return (isNumber(str)) ? str * 1 : nan;
	},
	numberToString: function(num){
		return (isNumber(num)) ? num : false;
	}
});


$.htmlExt.addInputType('range', $.extend({}, typeModels.number, {
	minDefault: 0,
	maxDefault: 100
}));

$.htmlExt.addInputType('date', {
	mismatch: function(val){
		if(!val || !val.split || !(/\d$/.test(val))){return true;}
		var valA = val.split(/\u002D/);
		if(valA.length !== 3){return true;}
		var ret = false;
		$.each(valA, function(i, part){
			if(!isDateTimePart(part)){
				ret = true;
				return false;
			}
		});
		if(ret){return ret;}
		if(valA[0].length !== 4 || valA[1].length != 2 || valA[1] > 12 || valA[2].length != 2 || valA[2] > 33){
			ret = true;
		}
		return (val !== this.dateToString( this.asDate(val, true) ) );
	},
	step: 1,
	//stepBase: 0, 0 = default
	stepScaleFactor:  86400000,
	asDate: function(val, _noMismatch){
		if(!_noMismatch && this.mismatch(val)){
			return null;
		}
		val = val.split(/\u002D/);
		
		var date = new Date();
		date.setUTCMilliseconds(0);
		date.setUTCSeconds(0);
		date.setUTCMinutes(0);
		date.setUTCHours(0);
		date.setUTCDate(val[2]);
		date.setUTCMonth(val[1] - 1);
		date.setUTCFullYear(val[0]);
		return date;
	},
	asNumber: function(str){
		str = this.asDate(str);
		return (str === null) ? nan : str.getTime();
	},
	numberToString: function(num){
		return (isNumber(num)) ? this.dateToString(new Date(num)) : false;
	},
	dateToString: function(date){
		return (date && date.getUTCFullYear) ? date.getUTCFullYear() +'-'+ addleadingZero(date.getUTCMonth()+1, 2) +'-'+ addleadingZero(date.getUTCDate(), 2) : false;
	}
});

$.htmlExt.addInputType('time', $.extend({}, typeModels.date, 
	{
		mismatch: function(val, _getParsed){
			if(!val || !val.split || !(/\d$/.test(val))){return true;}
			val = val.split(/\u003A/);
			if(val.length < 2 || val.length > 3){return true;}
			var ret = false,
				sFraction;
			if(val[2]){
				val[2] = val[2].split(/\u002E/);
				sFraction = val[2][1];
				val[2] = val[2][0];
			}
			$.each(val, function(i, part){
				if(!isDateTimePart(part) || part.length !== 2){
					ret = true;
					return false;
				}
			});
			if(ret){return true;}
			if(val[0] > 23 || val[0] < 0 || val[1] > 59 || val[1] < 0){
				return true;
			}
			if(val[2] && (val[2] > 59 || val[2] < 0 )){
				return true;
			}
			if(sFraction && !isNumber(sFraction)){
				return true;
			}
			return (_getParsed === true) ? [val, sFraction] : false;
		},
		step: 60,
		stepBase: 0,
		stepScaleFactor:  1000,
		asDate: function(val){
			val = this.mismatch(val, true);
			if(val === true){
				return null;
			}
			var date = new Date();
			date.setUTCMilliseconds(val[1] || 0);
			date.setUTCSeconds(val[0][2] || 0);
			date.setUTCMinutes(val[0][1]);
			date.setUTCHours(val[0][0]);
			date.setUTCDate('1');
			date.setUTCMonth(0);
			date.setUTCFullYear('1970');
			return date;
		},
		dateToString: function(date){
			if(date && date.getUTCHours){
				var str = addleadingZero(date.getUTCHours(), 2) +':'+ addleadingZero(date.getUTCMinutes(), 2),
					tmp = date.getUTCSeconds()
				;
				if(tmp != "0"){
					str += ':'+ addleadingZero(tmp, 2);
				}
				tmp = date.getUTCMilliseconds();
				if(tmp != "0"){
					str += '.'+ addleadingZero(tmp, 3);
				}
				return str;
			} else {
				return false;
			}
		}
	})
);

$.htmlExt.addInputType('datetime-local', $.extend({}, typeModels.time, 
	{
		mismatch: function(val, _getParsed){
			if(!val || !val.split || (val+'special').split(/\u0054/).length !== 2){return true;}
			val = val.split(/\u0054/);
			return ( typeModels.date.mismatch(val[0]) || typeModels.time.mismatch(val[1], _getParsed) );
		},
		noAsDate: true,
		asDate: function(val){
			var time = this.mismatch(val, true);
			if(time === true){
				return null;
			}
			
			var date = new Date();
			
			date.setUTCMilliseconds(time[1] || 0);
			date.setUTCSeconds(time[0][2] || 0);
			date.setUTCMinutes(time[0][1]);
			date.setUTCHours(time[0][0]);
			
			val = val.split(/\u0054/)[0].split(/\u002D/);
			date.setUTCDate(val[2]);
			date.setUTCMonth(val[1] - 1);
			date.setUTCFullYear(val[0]);
			
			return date;
		},
		dateToString: function(date, _getParsed){
			return typeModels.date.dateToString(date) +'T'+ typeModels.time.dateToString(date, _getParsed);
		}
		
	})
);


(function(){
	var options = $.htmlExt.loader.modules.validity.options;
	var getNextStep = function(input, upDown, cache){
		
		cache = cache || {};
		
		if( !('type' in cache) ){
			cache.type = getType(input);
		}
		if( !('step' in cache) ){
			cache.step = getStep(input, cache.type);
		}
		if( !('valueAsNumber' in cache) ){
			cache.valueAsNumber = typeModels[cache.type].asNumber($.attr(input, 'value'));
		}
		var delta = (cache.step == 'any') ? typeModels[cache.type].step * typeModels[cache.type].stepScaleFactor : cache.step,
			ret
		;
		addMinMaxNumberToCache('min', $(input), cache);
		addMinMaxNumberToCache('max', $(input), cache);
		
		if(isNaN(cache.valueAsNumber)){
			//ToDo: make this more usable
			cache.valueAsNumber = typeModels[cache.type].stepBase || 0;
			
		}
		//make a valid step
		if(cache.step !== 'any'){
			cache.valueAsNumber = Math.round( ( cache.valueAsNumber - ((cache.valueAsNumber - (cache.minAsnumber || 0)) % cache.step)) * 1e7) / 1e7;
		}
		ret = cache.valueAsNumber + (delta * upDown);
		if(ret < cache.minAsNumber){
			ret = (cache.valueAsNumber > cache.minAsNumber) ? cache.minAsNumber : cache.maxAsNumber;
		} else if(ret > cache.maxAsNumber){
			ret = (cache.valueAsNumber < cache.maxAsNumber) ? cache.maxAsNumber : cache.minAsNumber;
		}
		return ret;
	};
	var doSteps = function(input, type, control){
		if(input.disabled || input.readOnly || $(control).hasClass('step-controls')){return;}
		$.attr(input, 'value',  typeModels[type].numberToString(getNextStep(input, ($(control).hasClass('step-up')) ? 1 : -1, {type: type})));
		$(input).unbind('blur.stepeventshim').trigger('input');
		if( document.activeElement ){
			if(document.activeElement !== input){
				try {input.focus();} catch(e){}
			}
			setTimeout(function(){
				if(document.activeElement !== input){
					try {input.focus();} catch(e){}
				}
				$(input)
					.one('blur.stepeventshim', function(){
						$(input).trigger('change');
					})
				;
			}, 0);
			
		}
	};
	
	
	if(options.stepArrows){
		var disabledReadonly = {
			elementNames: ['input'],
			// don't change getter
			setter: function(elem, value, fn){
				fn();
				var stepcontrols = $.data(elem, 'step-controls');
				if(stepcontrols){
					stepcontrols[ (elem.disabled || elem.readonly) ? 'addClass' : 'removeClass' ]('disabled-step-control');
				}
			}
		};
		$.htmlExt.attr('disabled', disabledReadonly);
		$.htmlExt.attr('readonly', disabledReadonly);
		
	}
	
	$.htmlExt.addReady(function(context){
		//start constrain-validation
		$('form', context).bind('invalid', $.noop);
		
		//ui for numeric values
		if(options.stepArrows){
			$('input', context).each(function(){
				var type = getType(this);
				if(!typeModels[type] || !typeModels[type].asNumber || !options.stepArrows || (options.stepArrows !== true && !options.stepArrows[type])){return;}
				var elem = this,
					dir 	= ($(this).css('direction') == 'rtl') ? 
						{
							action: 'insertBefore',
							side: 'Left',
							otherSide: 'right'
						} :
						{
							action: 'insertAfter',
							side: 'Right',
							otherSide: 'left'
						}
				;
				var controls = $('<span class="step-controls" unselectable><span class="step-up" tabindex="-1" /><span class="step-down" tabindex="-1" /></span>')	
					[dir.action](this)
					.bind('mousedown mousepress', function(e){
						doSteps(elem, type, e.target);
						return false;
					})
				;
				
				$(this)
					.addClass('has-step-controls')
					.data('step-controls', controls)
					.attr({
						readonly: this.readOnly,
						disabled: this.disabled
					})
				;
				
				if(options.recalcWidth){
					var padding = controls.outerWidth(true) + (parseInt($(this).css('padding'+dir.side), 10) || 0),
						border	= parseInt($(this).css('border'+dir.side+'width'), 10) || 0
					;
					controls.css(dir.otherSide, (border + padding) * -1);
					padding++;
					$(this).css('width', $(this).width() - padding).css('padding'+dir.side, padding);
				}
			});
		}
		
		
	});
})();


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

(function($){
	if($.support.validationMessage){
		return;
	}
	$.support.validationMessage = 'shim';
	
	
	$.htmlExt.validityMessages = [];
	
	$.htmlExt.validityMessages['de'] = {
		typeMismatch: {
			email: '{%value} ist keine zulässige E-Mail-Adresse',
			url: '{%value} ist keine zulässige Webadresse',
			number: '{%value}  ist keine Nummer!',
			date: '{%value} ist kein Datum',
			time: '{%value} ist keine Uhrzeit',
			range: '{%value}  ist keine Nummer!',
			"datetime-local": '{%value} ist kein Datum-Uhrzeit Format.'
		},
		rangeUnderflow: '{%value} ist zu niedrig. {%min} ist der unterste Wert, den Sie benutzen können.',
		rangeOverflow: '{%value} ist zu hoch. {%max} ist der oberste Wert, den Sie benutzen können.',
		stepMismatch: 'Der Wert {%value} ist in diesem Feld nicht zulässig. Hier sind nur bestimmte Werte zulässig. {%title}',
		tooLong: 'Der eingegebene Text ist zu lang! Sie haben {%valueLen} Buchstaben eingegeben, dabei sind {%maxlength} das Maximum.',
		
		patternMismatch: '{%value} hat für diese Seite ein falsches Format! {%title}',
		valueMissing: 'Sie müssen einen Wert eingeben'
	};
	
	$.htmlExt.validityMessages[''] = $.htmlExt.validityMessages['de'];
	
	var validiyMessages;
	$(document).bind('htmlExtLangChange', function(){
		$.htmlExt.activeLang($.htmlExt.validityMessages, 'validation-message', function(langObj){
			validiyMessages = langObj;
		});
	});
	
	$.htmlExt.attr('validationMessage', {
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
					message = message[ (elem.getAttribute('type') || '').toLowerCase() ];
				}
				if(message){
					return false;
				}
			});
			if(message){
				$.each(['value', 'min', 'max', 'title', 'maxlength'], function(i, attr){
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
	$.htmlExt.addMethod('checkValidity', function(error){
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
(function($){
	$.support.inputUI = 'shim';
	
	var options = $.htmlExt.loader.modules['input-ui'].options;
	options.availabeLangs = 'af ar az bg bs cs da de el en-GB eo es et eu fa fi fo fr fr-CH he hr hu hy id is it ja ko it lt lv ms nl no pl pt-BR ro ru sk sl sq sr sr-SR sv ta th tr uk vi zh-CN zh-HK zh-TW'.split(' ');
	
	if(options.juiSrc && (!$.fn.slider || !!$.fn.datepicker)){
		$.htmlExt.loader.loadScript(options.juiSrc, false, 'jquery-ui');
	} else {
		$.htmlExt.createReadyEvent('jquery-ui');
	}
	
	var replaceInputUI = function(context){
		$('input', context).each(function(){
			var type = $.attr(this, 'type');
			if(replaceInputUI[type]){
				replaceInputUI[type]($(this));
			}
		});
	};
	
	replaceInputUI.common = function(orig, shim, methods){
		if(options.nativeIsReplaced){
			orig.bind('invalid', function(e){
				setTimeout(function(){
					if(!e.isDefaultPrevented()){
						throw('you have to handle invalid events, if you replace native input-widgets.');
					}
				}, 0);
			});
		}
		
		var attr = {
			css: {
				marginRight: orig.css('marginRight'),
				marginLeft: orig.css('marginLeft')
			},
			outerWidth: orig.outerWidth()
		};
		shim.addClass(orig[0].className).data('html5element', orig);
		orig
			.after(shim)
			.data('inputUIReplace', {visual: shim, methods: methods})
			.hide()
		;
		
		return attr;
	};
	
	replaceInputUI.date = function(elem){
		var date = $('<input type="text" class="input-date" />'),
			attr  = this.common(elem, date, replaceInputUI.date.attrs)
		;
		
		if(attr.css){
			date.css(attr.css);
			if(attr.outerWidth){
				date.outerWidth(attr.outerWidth);
			}
		}
		date
			.datepicker($.extend({}, options.date, {
				onSelect: function(val, ui){
					replaceInputUI.date.blockAttr = true;
					elem.attr('value', $.datepicker.formatDate( 'yy-mm-dd', date.datepicker('getDate') ));
					replaceInputUI.date.blockAttr = false;
					elem.trigger('change');
				}
			}))
			.data('datepicker')
			.dpDiv
			.addClass('input-date-datepicker-control')
		;
		$.each(['disabled', 'min', 'max', 'value'], function(i, name){
			elem.attr(name, function(i, value){return value || '';});
		});
	};
	
	replaceInputUI.date.attrs = {
		disabled: function(orig, shim, value){
			shim.datepicker( "option", "disabled", !!value );
		},
		min: function(orig, shim, value){
			try {
				value = $.datepicker.parseDate('yy-mm-dd', value );
			} catch(e){value = false;}
			if(value){
				shim.datepicker( 'option', 'minDate', value );
			}
		},
		max: function(orig, shim, value){
			try {
				value = $.datepicker.parseDate('yy-mm-dd', value );
			} catch(e){value = false;}
			if(value){
				shim.datepicker( 'option', 'maxDate', value );
			}
		},
		value: function(orig, shim, value){
			if(!replaceInputUI.date.blockAttr){
				try {
					var dateValue = $.datepicker.parseDate('yy-mm-dd', value );
				} catch(e){var dateValue = false;}
				if(dateValue){
					shim.datepicker( "setDate", dateValue );
				} else {
					shim.attr( "value", value );
				}
			}
		}
	};
	
	replaceInputUI.range = function(elem){
		var range = $('<span class="input-range" />'),
			attr  = this.common(elem, range, replaceInputUI.range.attrs)
		;
		
		if(attr.css){
			range.css(attr.css);
			if(attr.outerWidth){
				range.outerWidth(attr.outerWidth);
			}
		}
		range.slider($.extend(options.slider, {
			change: function(e, ui){
				if(e.originalEvent){
					replaceInputUI.range.blockAttr = true;
					elem.attr('value', ui.value);
					replaceInputUI.range.blockAttr = false;
					elem.trigger('change');
				}
			}
		}));
		
		$.each(['disabled', 'min', 'max', 'value', 'step'], function(i, name){
			elem.attr(name, function(i, value){return value || '';});
		});
	};
	
	replaceInputUI.range.attrs = {
		disabled: function(orig, shim, value){
			shim.slider( "option", "disabled", !!value );
		},
		min: function(orig, shim, value){
			value = (value) ? value * 1 || 0 : 0;
			shim.slider( "option", "min", value );
		},
		max: function(orig, shim, value){
			value = (value || value === 0) ? value * 1 || 100 : 100;
			shim.slider( "option", "max", value );
		},
		value: function(orig, shim, value){
			value = $(orig).attr('valueAsNumber');
			if(isNaN(value)){
				value = (shim.slider('option', 'max') - shim.slider('option', 'min')) / 2;
				orig.value = value;
			}
			if(!replaceInputUI.range.blockAttr){
				shim.slider( "option", "value", value );
			}
		},
		step: function(orig, shim, value){
			value = (value) ? value * 1 || 1 : 1;
			shim.slider( "option", "step", value );
		}
	};
	
	$.each(['disabled', 'min', 'max', 'value', 'step'], function(i, attr){
		$.htmlExt.attr(attr, {
			elementNames: ['input'],
			setter: function(elem, val, fn){
				var widget = $.data(elem, 'inputUIReplace');
				fn();
				if(widget && widget.methods[attr]){
					val = widget.methods[attr](elem, widget.visual, val);
				}
			},
			getter: true
		});
	});
	
	
	(function($){
		
		var changeDefaults = function(langObj){
			if(!langObj){return;}
			var opts = $.extend({}, langObj, options.date);
			$('input.input-date.hasDatepicker').datepicker('option', opts).each(function(){
				var orig = $.data(this, 'html5element');
				if(orig){
					$.each(['disabled', 'min', 'max', 'value'], function(i, name){
						orig.attr(name, function(i, value){return value || '';});
					});
				}
			});
			$.datepicker.setDefaults(opts);
		};
		
		$(document).one('jquery-uiReady', function(){
			$(document).bind('htmlExtLangChange', function(){
				$.htmlExt.activeLang($.datepicker.regional, 'input-ui', changeDefaults);
			});
		});
	})(jQuery);
	
	$.htmlExt.addReady(function(context){
		$(document).bind('jquery-uiReady', function(){
			replaceInputUI(context);
		});
	});
})(jQuery);
