jQuery.webshims.ready('form-message form-core', function($, webshims, window, doc, undefined){
//	"use strict";
	var support = $.support;
	if(!support.validity){return;}
		
	var typeModels = webshims.inputTypes;
	var validityRules = {};
	
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
	
	var overrideNativeMessages = webshims.overrideValidationMessages;	
	var overrideValidity = (!support.requiredSelect || !support.numericDateProps || overrideNativeMessages);
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
			if(!(!support.requiredSelect && type == 'select-one') && !typeModels[type]){return;}
		}
		
		if(overrideNativeMessages && !init && checkTypes[type] && elem.name){
			$(doc.getElementsByName( elem.name )).each(function(){
				$.attr(this, 'validity');
			});
		} else {
			$.attr(elem, 'validity');
		}
	};
	
	var setCustomValidityDescriptor = {
		value: function(error){
			error = error+'';
			setCustomValidityDescriptor.value._polyfilled[this.nodeName.toLowerCase()].call(this, error);
			if(overrideValidity){
				$.data(this, 'hasCustomError', !!(error));
				testValidity(this);
			}
		}
	};
	
	webshims.defineNodeNamesProperty(['input', 'textarea', 'select'], 'setCustomValidity', setCustomValidityDescriptor, true);
		
	if((!window.noHTMLExtFixes && !support.requiredSelect) || overrideNativeMessages){
		$.extend(validityChanger, {
			required: 1,
			size: 1,
			multiple: 1,
			selectedIndex: 1
		});
		validityElements.push('select');
	}
	if(!support.numericDateProps || overrideNativeMessages){
		$.extend(validityChanger, {
			min: 1, max: 1, step: 1
		});
		validityElements.push('input');
	}
			
	if(!support.requiredSelect){
		webshims.defineNodeNamesBooleanProperty(['select'], 'required', true);
		
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
		var valididyDescriptor =  {
			get: function(){
				
				var validity = valididyDescriptor.get._polyfilled[this.nodeName.toLowerCase()].apply(this, arguments);
				if(!validity){
					return validity;
				}
				var validityState = {};
				validityProps.forEach(function(prop){
					validityState[prop] = validity[prop];
				});
				
				if( !$.attr(this, 'willValidate') ){
					return validityState;
				}
				var jElm 			= $(this),
					elem 			= this,
					cache 			= {type: (elem.getAttribute && elem.getAttribute('type') || '').toLowerCase(), nodeName: (elem.nodeName || '').toLowerCase()},
					val				= oldVal.call(jElm),
					customError 	= !!($.data(elem, 'hasCustomError')),
					setCustomValidity = setCustomValidityDescriptor.value._polyfilled[elem.nodeName.toLowerCase()] || elem.setCustomValidity,
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
						
						setCustomValidity.call(elem, webshims.createValidationMessage(elem, rule));
						validityState.valid = false;
						setCustomMessage = true;
					}
				});
				if(validityState.valid){
					setCustomValidity.call(elem, '');
				}
				return validityState;
			},
			set: $.noop
			
		};
		webshims.defineNodeNamesProperty(validityElements, 'validity', valididyDescriptor, true);
							
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
			if (!support.numericDateProps) {
				doc.addEventListener('input', function(e){
					testValidity(e.target);
				}, true);
			}
		}
		
		var validityElementsSel = validityElements.join(',');		
		webshims.addReady(function(context, elem){
			$(validityElementsSel, context).add(elem.filter(validityElementsSel)).attr('validity');
		});
		
	} //end: overrideValidity -> (!supportRequiredSelect || !supportNumericDate || overrideNativeMessages)
	webshims.createReadyEvent('form-extend');
}, true);