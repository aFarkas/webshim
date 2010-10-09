(function($){
	
	if($.support.validity === true && $('<input type="datetime-local" />')[0].type == 'datetime-local' && $('<input type="range" />')[0].type == 'range' ){return;}
	
	//prepare for ff4 have not testet yet
	var typeModels = $.webshims.inputTypes;
	$.webshims.addInputType = function(type, obj){
		typeModels[type] = obj;
	};
	
	var validityRules = {};
	$.webshims.addValidityRule = function(type, fn){
		validityRules[type] = fn;
	};
	
	$.webshims.addValidityRule('typeMismatch',function (input, val, cache){
		if(val === ''){return false;}
		var ret = false;
		if(!('type' in cache)){
			cache.type = (input[0].getAttribute('type') || '').toLowerCase();
		}
		
		if(typeModels[cache.type] && typeModels[cache.type].mismatch){
			ret = typeModels[cache.type].mismatch(val, input);
		}
		return ret;
	});
	
	var validityProps = ['customError','typeMismatch','rangeUnderflow','rangeOverflow','stepMismatch','tooLong','patternMismatch','valueMissing','valid'];
	var oldVal = $.fn.val;
	var testValidity = function(elem){
		if(!typeModels[(elem.getAttribute && elem.getAttribute('type') || '').toLowerCase()]){return;}
		$.attr(elem, 'validity');
	};
	var oldAttr = $.attr;
	var validityChanger = {value: 1, val: 1, min: 1, max: 1, step: 1};
	$.attr = function(elem, prop, value){
		var ret = oldAttr.apply(this, arguments);
		if(validityChanger[prop] && value !== undefined){
			testValidity(elem);
		}
		return ret;
	};
	
	$.webshims.attr('validity', {
		elementNames: ['input'],
		getter: function(elem){
			var validity 	= elem.validity,
				cache 		= {}
			;
			if(!validity){
				return validity;
			}
			var validityState = {};
			$.each(validityProps, function(i, prop){
				validityState[prop] = validity[prop];
			});
			
			if( !$.attr(elem, 'willValidate') ){
				return validityState;
			}
			cache.type = (elem.getAttribute && elem.getAttribute('type') || '').toLowerCase();
			if(!typeModels[cache.type]){return validityState;}
			var jElm 			= $(elem),
				val				= oldVal.call(jElm),
				customError 	= !!($.data(elem, 'hasCustomError'))
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
			
			//select
			if(	(elem.nodeName || '').toLowerCase() == 'select' ){
				return validityState;
			}
			
			$.each(validityRules, function(rule, fn){
				var message;
				validityState[rule] = fn(jElm, val, cache);
				if(validityState[rule] && validityState.valid) {
					message = $.webshims.createValidationMessage(elem, rule);
					elem.setCustomValidity(message);
					validityState.valid = false;
				}
			});
			if(validityState.valid){
				elem.setCustomValidity('');
			}
			return validityState;
		}
	});
	
	$.webshims.addMethod('setCustomValidity', function(error){
		error = error+'';
		this.setCustomValidity(error);
		$.data(this, 'hasCustomError', !!(error));
		testValidity(this);
	});
		
	
	$.fn.val = function(val){
		var ret = oldVal.apply(this, arguments);
		this.each(function(){
			testValidity(this);
		});
		return ret;
	};
	
	if(document.addEventListener){
		document.addEventListener('change', function(e){
			testValidity(e.target);
		}, true);
	}
	$.webshims.readyModules('number-date-type', function(){
		$.webshims.addReady(function(context){
			$('input', context).each(function(){
				testValidity(this);
			});
		});
	}, true, true);
	
})(jQuery);
