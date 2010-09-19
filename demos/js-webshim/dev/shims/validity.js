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
			//is NaN a number?
			if(isNaN(val)){
				$.attr(elem, 'value', '');
				return;
			}
			var set = typeModels[type].numberToString(val);
			if(set !==  false){
				$.attr(elem, 'value', set);
			} else {
				throw('INVALID_STATE_ERR: DOM Exception 11');
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
			if(value === null){
				$.attr(elem, 'value', '');
				return;
			}
			var set = typeModels[type].dateToString(value);
			if(set !== false){
				$.attr(elem, 'value', set);
			} else {
				throw('INVALID_STATE_ERR: DOM Exception 11');
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

var transformDate = function(date){
	var offset = date.getTimezoneOffset();
	return new Date(date.getTime() + offset + 3600060);
};

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
		return new Date(this.asNumber(val, true));
	},
	asNumber: function(str, _noMismatch){
		var ret = nan;
		if(_noMismatch || !this.mismatch(str)){
			str = str.split(/\u002D/);
			ret = Date.UTC(str[0], str[1] - 1, str[2]);
		}
		return ret;
	},
	numberToString: function(num){
		return (isNumber(num)) ? this.dateToString(new Date(num)) : false;
	},
	dateToString: function(date){
		return (date && date.getFullYear) ? date.getUTCFullYear() +'-'+ addleadingZero(date.getUTCMonth()+1, 2) +'-'+ addleadingZero(date.getUTCDate(), 2) : false;
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
				sFraction = parseInt(val[2][1], 10);
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
			if(sFraction && isNaN(sFraction)){
				return true;
			}
			if(sFraction){
				if(sFraction < 100){
					sFraction *= 100;
				} else if(sFraction < 10){
					sFraction *= 10;
				}
			}
			return (_getParsed === true) ? [val, sFraction] : false;
		},
		step: 60,
		stepBase: 0,
		stepScaleFactor:  1000,
		asDate: function(val){
			val = new Date(this.asNumber(val));
			return (isNaN(val)) ? null : val;
		},
		asNumber: function(val){
			var ret = nan;
			val = this.mismatch(val, true);
			if(val !== true){
				ret = Date.UTC('1970', 0, 1, val[0][0], val[0][1], val[0][2] || 0);
				if(val[1]){
					ret += val[1];
				}
			}
			return ret;
		},
		dateToString: function(date){
			if(date && date.getUTCHours){
				var str = addleadingZero(date.getUTCHours(), 2) +':'+ addleadingZero(date.getUTCMinutes(), 2),
					tmp = date.getSeconds()
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
			val = new Date(this.asNumber(val));
			
			return (isNaN(val)) ? null : val;
		},
		asNumber: function(val){
			var ret = nan;
			var time = this.mismatch(val, true);
			if(time !== true){
				val = val.split(/\u0054/)[0].split(/\u002D/);
				ret = Date.UTC(val[2], val[1] - 1, val[0], time[0][0], time[0][1], time[0][2] || 0);
				if(time[1]){
					ret += time[1];
				}
			}
			return ret;
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

