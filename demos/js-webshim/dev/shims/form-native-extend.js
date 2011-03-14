jQuery.webshims.register('form-extend', function($, webshims, window, doc, undefined){
	"use strict";
	if(!Modernizr.formvalidation){return;}
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
	
	var overrideNativeMessages = webshims.cfg.forms.overrideMessages;	
	
	var overrideValidity = (!Modernizr.requiredSelect || !Modernizr.input.valueAsDate || overrideNativeMessages);
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
			if(!(!Modernizr.requiredSelect && type == 'select-one') && !typeModels[type]){return;}
		}
		
		if(overrideNativeMessages && !init && checkTypes[type] && elem.name){
			$(doc.getElementsByName( elem.name )).each(function(){
				$.attr(this, 'validity');
			});
		} else {
			$.attr(elem, 'validity');
		}
	};
	
	var oldSetCustomValidity = {};
	['input', 'textarea', 'select'].forEach(function(name){
		var desc = webshims.defineNodeNameProperty(name, 'setCustomValidity', {
			value: function(error){
				error = error+'';
				desc._supvalue.call(this, error);
				if(!Modernizr.validationmessage){
					$.data(this, 'customvalidationMessage', error);
				}
				if(overrideValidity){
					$.data(this, 'hasCustomError', !!(error));
					testValidity(this);
				}
			}
		});
		oldSetCustomValidity[name] = desc._supvalue;
	});
		
	if((!window.noHTMLExtFixes && !Modernizr.requiredSelect) || overrideNativeMessages){
		$.extend(validityChanger, {
			required: 1,
			size: 1,
			multiple: 1,
			selectedIndex: 1
		});
		validityElements.push('select');
	}
	if(!Modernizr.input.valueAsNumber || overrideNativeMessages){
		$.extend(validityChanger, {
			min: 1, max: 1, step: 1
		});
		validityElements.push('input');
	}
	
	if(overrideValidity){
		
		validityElements.forEach(function(nodeName){
			
			var oldDesc = webshims.defineNodeNameProperty(nodeName, 'validity', {
				get: function(){
					var elem = this;
					var validity = oldDesc._supget.call(this);
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
						
						if( validityState[rule] && (validityState.valid || !setCustomMessage) ) {
							oldSetCustomValidity[nodeName].call(elem, webshims.createValidationMessage(elem, rule));
							validityState.valid = false;
							setCustomMessage = true;
						}
					});
					if(validityState.valid){
						oldSetCustomValidity[nodeName].call(elem, '');
						$.data(elem, 'hasCustomError', false);
					} else if(overrideNativeMessages && !setCustomMessage && !customError){
						$.each(validityState, function(name, prop){
							if(name !== 'valid' && prop){
								oldSetCustomValidity[nodeName].call(elem, webshims.createValidationMessage(elem, name));
								return false;
							}
						});
					}
					return validityState;
				},
				set: $.noop
				
			});
		});
							
		$.fn.val = function(val){
			var ret = oldVal.apply(this, arguments);
			if(val !== undefined){
				this.each(function(){
					testValidity(this);
				});
			}
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
			if (!Modernizr.input.valueAsNumber) {
				doc.addEventListener('input', function(e){
					testValidity(e.target);
				}, true);
			}
		}
		
		var validityElementsSel = validityElements.join(',');	
		
		webshims.addReady(function(context, elem){
			$(validityElementsSel, context).add(elem.filter(validityElementsSel)).each(function(){
				$.attr(this, 'validity');
			});
		});
		
	} //end: overrideValidity
});