webshims.register('form-validators', function($, webshims, window, document, undefined, options){
"use strict";

(function(){
	if(webshims.refreshCustomValidityRules){
		webshims.error("form-validators already included. please remove custom-validity.js");
	}
	
	var customValidityRules = {};
	var formReady = false;
	var blockCustom;
	var initTest;
	var onEventTest = function(e){
		webshims.refreshCustomValidityRules(e.target);
	};
	var noValidate = function(){
		return !noValidate.types[this.type];
	};
	noValidate.types = {
		hidden: 1,
		image: 1,
		button: 1,
		reset: 1,
		submit: 1
	};
	
	webshims.customErrorMessages = {};
	webshims.addCustomValidityRule = function(name, test, defaultMessage){
		customValidityRules[name] = test;
		if(!webshims.customErrorMessages[name]){
			webshims.customErrorMessages[name] = [];
			webshims.customErrorMessages[name][''] = defaultMessage || name;
		}
		if($.isReady && formReady){
			$('input, select, textarea')
				.filter(noValidate)
				.each(function(){
					testValidityRules(this);
				})
			;
		}
	};
	webshims.refreshCustomValidityRules = function(elem){
		if(initTest){return;}
		
		var data = $(elem).data() || $.data(elem, {});
		var customMismatchedRule = data.customMismatchedRule;
		var validity = $.prop(elem, 'validity') || {};
		var message = '';
		var setMessage = function(message, errorType){
			blockCustom = true;
			data.customMismatchedRule = message ?  errorType : '';
			
			if(typeof message != 'string'){
				message = $(elem).data('errormessage') || elem.getAttribute('x-moz-errormessage') || webshims.customErrorMessages[errorType][webshims.activeLang()] || webshims.customErrorMessages[errorType]['']; 
			}
			
			if(typeof message == 'object'){
				message = message[errorType] || message.customError || message.defaultMessage;
			}
			$(elem).setCustomValidity(message);
			blockCustom = false;
		};
		if(customMismatchedRule || !validity.customError){
			var val = $(elem).val();
			$.each(customValidityRules, function(name, test){
				message = test(elem, val, data, setMessage) || '';
				customMismatchedRule = name;
				if(message){
					return false;
				}
			});
			
			setMessage(message, customMismatchedRule);
		}
		
	};
	var testValidityRules = webshims.refreshCustomValidityRules;
	
	webshims.ready('forms form-validation', function(){
		
		$.propHooks.setCustomValidity = {
			get: function(elem){
				if(!blockCustom){
					$.data(elem, 'customMismatchedRule', '');
				}
				return null;
			}
		};
		
		
		setTimeout(function(){
			webshims.addReady(function(context, selfElement){
				initTest = true;
				$('input, select, textarea', context).add(selfElement.filter('input, select, textarea'))
					.filter(noValidate)
					.each(function(){
						testValidityRules(this);
					})
				;
				initTest = false;
				formReady = true;
			});
			$(document).on('refreshCustomValidityRules', onEventTest);
		}, 9);
		
	});
	
})();

/*
 * adds support for HTML5 constraint validation
 * 	- partial pattern: <input data-partial-pattern="RegExp" />
 *  - creditcard-validation: <input class="creditcard-input" />
 *  - several dependent-validation patterns (examples):
 *  	- <input type="email" id="mail" /> <input data-dependent-validation='mail' />
 *  	- <input type="date" id="start" data-dependent-validation='{"from": "end", "prop": "max"}' /> <input type="date" id="end" data-dependent-validation='{"from": "start", "prop": "min"}' />
 *  	- <input type="checkbox" id="check" /> <input data-dependent-validation='checkbox' />
 */
(function(){
	
	var addCustomValidityRule = $.webshims.addCustomValidityRule;
	var getId = function(name){
		return document.getElementById(name);
	};
	addCustomValidityRule('partialPattern', function(elem, val, pattern){
		pattern = pattern.partialPattern;
		if(!val || !pattern){return;}
		return !(new RegExp('(' + pattern + ')', 'i').test(val));
	}, 'This format is not allowed here.');
	
//	addCustomValidityRule('ajaxvalidate', function(elem, val, data, setMessage){
//		if(!val || !data.ajaxvalidate){return;}
//		var opts;
//		if(!data.remoteValidate){
//			if(typeof data.ajaxvalidate == 'string'){
//				data.ajaxvalidate = {url: data.ajaxvalidate, depends: $([])};
//			} else {
//				data.ajaxvalidate.depends = data.ajaxvalidate.depends ? $(data.ajaxvalidate.depends).map(getId) : $([]);
//			}
//			
//			data.ajaxvalidate.depends.on('refreshCustomValidityRules', function(){
//				webshims.refreshCustomValidityRules(elem);
//			});
//			
//			opts = data.ajaxvalidate;
//			
//			var remoteValidate = {
//				ajaxLoading: false,
//				restartAjax: false,
//				lastResponse: false,
//				lastString: '',
//				update: function(){
//					var dataStr;
//					var data = this.getData();
//					if(data){
//						try {
//							dataStr = JSON.stringify(data);
//						} catch(er){}
//						if(dataStr == this.lastString){return;}
//						this.lastString = dataStr;
//						remoteValidate.lastResponse = false;
//						if(this.ajaxLoading){
//							this.restartAjax = true;
//						} else {
//							this.restartAjax = false;
//							this.ajaxLoading = true;
//							$.ajax(
//									$.extend({}, opts, {
//										url: opts.url,
//										data: opts.fullForm ? 
//											$(elem).jProp('form').serializeArray() : 
//											data,
//										success: this.getResponse,
//										complete: this._complete
//									})
//							);
//						}
//					}
//				},
//				_complete: function(){
//					remoteValidate.ajaxLoading = false;
//					if(remoteValidate.restartAjax){
//						this.update();
//					}
//					remoteValidate.restartAjax = false;
//					
//				},
//				getResponse: function(data){
//					var old = webshims.refreshCustomValidityRules;
//					if(!data){
//						data = {message: '', valid: true};
//					}
//					remoteValidate.lastResponse = ('message' in data) ? data.message : !data.valid;
//					setMessage(remoteValidate.lastResponse, 'ajaxvalidate');
//					webshims.refreshCustomValidityRules = $.noop;
//					$(elem).trigger('refreshvalidityui');
//					webshims.refreshCustomValidityRules = old;
//				},
//				getData: function(){
//					var data;
//					if($(elem).is(':valid')){
//						data = {};
//						data[$.prop(elem, 'name') || $.prop(elem, 'id')] = $(elem).val();
//						opts.depends.each(function(){
//							if($(this).is(':invalid')){
//								data = false;
//								return false;
//							}
//							data[$.prop(this, 'name') || $.prop(this, 'id')]
//						});
//					}
//					return data;
//				}
//			};
//			data.remoteValidate = remoteValidate;
//		}
//		clearTimeout(data.remoteValidate.timer);
//		data.remoteValidate.timer = setTimeout(function(){
//			data.remoteValidate.update();
//		}, 9);
//		return false;
//	}, 'remote error');
	
	
	addCustomValidityRule('tooShort', function(elem, val, data){
		if(!val || !data.minlength){return;}
		return data.minlength > val.length;
	}, 'Entered value is too short.');
	
	var groupTimer = {};
	addCustomValidityRule('group-required', function(elem, val){
		var name = elem.name;
		if(!name || elem.type !== 'checkbox' || !$(elem).hasClass('group-required')){return;}
		var checkboxes = $( (elem.form && elem.form[name]) || document.getElementsByName(name));
		var isValid = checkboxes.filter(':checked:enabled');
		if(groupTimer[name]){
			clearTimeout(groupTimer[name]);
		}
		groupTimer[name] = setTimeout(function(){
			checkboxes
				.addClass('group-required')
				.unbind('click.groupRequired')
				.bind('click.groupRequired', function(){
					checkboxes.filter('.group-required').each(function(){
						$.webshims.refreshCustomValidityRules(this);
					});
				})
			;
		}, 9);
		
		return !(isValid[0]);
	}, 'Please check one of these checkboxes.');
	
	// based on https://sites.google.com/site/abapexamples/javascript/luhn-validation
	addCustomValidityRule('creditcard', function(elem, value){
		if(!value || !$(elem).hasClass('creditcard-input')){return;}
		value = value.replace(/\-/g, "");
		//if it's not numeric return true >- for invalid
		if(value != value * 1){return true;}
		var len = value.length;
		var sum = 0;
		var mul = 1;
		var ca;
	
		while (len--) {
			ca = parseInt(value.charAt(len),10) * mul;
			sum += ca - (ca>9)*9;// sum += ca - (-(ca>9))|9
			// 1 <--> 2 toggle.
			mul ^= 3; // (mul = 3 - mul);
		}
		return !((sum%10 === 0) && (sum > 0));
	}, 'Please enter a valid credit card number');
	
	var dependentDefaults = {
		//"from": "IDREF || UniqueNAMEREF", //required property: element 
		"prop": "value", //default: value||disabled	(last if "from-prop" is checked)
		"from-prop": "value", //default: value||checked (last if element checkbox or radio)
		"toggle": false
	};
	
	var getGroupElements = function(elem) {
		return $(elem.form[elem.name]).filter('[type="radio"]');
	};
	$.webshims.ready('form-validation', function(){
		if($.webshims.modules){
			getGroupElements = $.webshims.modules["form-core"].getGroupElements || getGroupElements;
		}
	});
	
	addCustomValidityRule('dependent', function(elem, val, data){
		data = data.dependentValidation;
		if( !data ){return;}
		
		var specialVal;
		if(!data){return;}
		var depFn = function(e){
			var val = $.prop(data.masterElement, data["from-prop"]);
			if(specialVal){
				val = $.inArray(val, specialVal) !== -1;
			}
			if(data.toggle){
				val = !val;
			}
			$.prop( elem, data.prop, val);
			if(e){
				$(elem).getShadowElement().filter('.user-error, .user-success').trigger('refreshvalidityui');
			}
		};
		
		if(!data._init || !data.masterElement){
			
			if(typeof data == 'string'){
				data = {"from": data};
			}
			
			
			data.masterElement = document.getElementById(data["from"]) || (document.getElementsByName(data["from"] || [])[0]);
			
			if (!data.masterElement || !data.masterElement.form) {return;}
			
			if(/radio|checkbox/i.test(data.masterElement.type)){
				if(!data["from-prop"]){
					data["from-prop"] = 'checked';
				}
				if(!data.prop && data["from-prop"] == 'checked'){
					data.prop = 'disabled';
				}
			} else if(!data["from-prop"]){
				data["from-prop"] = 'value';
			}
			
			if(data["from-prop"].indexOf('value:') === 0){
				specialVal = data["from-prop"].replace('value:', '').split('||');
				data["from-prop"] = 'value';
				
			}
			
			data = $.data(elem, 'dependentValidation', $.extend({_init: true}, dependentDefaults, data));

			if(data.prop !== "value" || specialVal){
				$(data.masterElement.type === 'radio' && getGroupElements(data.masterElement) || data.masterElement).bind('change', depFn);
			} else {
				$(data.masterElement).bind('change', function(){
					$.webshims.refreshCustomValidityRules(elem);
					$(elem).getShadowElement().filter('.user-error, .user-success').trigger('refreshvalidityui');
				});
			}
		}

		if(data.prop == "value" && !specialVal){
			return ($.prop(data.masterElement, 'value') != val);
		} else {
			depFn();
			return '';
		}
		
	}, 'The value of this field does not repeat the value of the other field');
})();

});
