(function($){
	if($.support.validity === true && ( $('<input type="datetime-local" />')[0].type !== 'datetime-local' || $('<input type="range" />')[0].type !== 'range' )){return;}
	//prepare for ff4 have not testet yet
	var typeModels = $.webshims.inputTypes;
	$.webshims.addInputType = function(type, obj){
		typeModels[type] = obj;
	};
	
	var validityRules = {};
	$.webshims.addValidityRule = function(type, fn){
		validityRules[type] = fn;
	};
	var validityProps = ['customError','typeMismatch','rangeUnderflow','rangeOverflow','stepMismatch','tooLong','patternMismatch','valueMissing','valid'];
	
	$.webshims.attr('validity', {
		elementNames: ['input'],
		getter: function(elem){
			var validity = elem.validity;
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
			
			var jElm 			= $(elem),
				val				= jElm.val(),
				cache 			= {}
			;
			
			validityState.customError = !!($.data(elem, 'hasCustomError'));
			if( validityState.customError ){
				validityState.valid = false;
			}
			
			//select
			if(	(elem.nodeName || '').toLowerCase() == 'select' ){
				return validityState;
			}
			
			$.each(validityRules, function(rule, fn){
				var message;
				if (fn(jElm, val, cache)) {
					validityState[rule] = true;
					if(validityState.valid){
						message = $.webshims.activeValidationMessages[rule];
						if(message && typeof message !== 'string'){
							message = message[ cache.type || (elem.getAttribute('type') || '').toLowerCase() ] || message.defaultMessage || rule;
						}
						elem.setCustomValidity(message);
					}
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
	});
	
	
	var testValidity = function(elem){
		if(!typeModels[(elem.getAttribute && this.getAttribute('type') || '').toLowerCase()]){return;}
		$.attr(elem, 'validity');
	};
	$.webshims.attr('value', {
		elementNames: ['input'],
		setter: function(elem, value, oldEval){
			oldEval();
			testValidity(elem);
		},
		getter: true
	});
	
	var oldVal = $.fn.val;
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
	
	$.webshims.addReady(function(context){
		$('input', context).each(function(){
			testValidity(this);
		});
	});
	
})(jQuery);
