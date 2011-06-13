(function($, window, document, undefined){
	"use strict";
	if(!$.webshims){
		var langs = [navigator.browserLanguage || navigator.language || '', $('html').attr('lang') || ''];
		$.webshims = {
			addReady: function(fn){$(function(){fn(document, $([]));});},
			ready: function(n, fn){fn();},
			activeLang: function(){return langs;}
		};
	} 
	var webshims = $.webshims;
	var customValidityRules = {};
	var oldProp = $.prop;
	var formReady = false;
	var blockCustom;
	var initTest;
	var onEventTest = function(e){
		webshims.refreshCustomValidityRules(e.target);
	};
	
	
	webshims.customErrorMessages = {};
	webshims.addCustomValidityRule = function(name, test, defaultMessage){
		customValidityRules[name] = test;
		if(!webshims.customErrorMessages[name]){
			webshims.customErrorMessages[name] = [];
			webshims.customErrorMessages[name][''] = defaultMessage || name;
		}
		if($.isReady && formReady){
			$('input, select, textarea').each(function(){
				testValidityRules(this);
			});
		}
	};
	webshims.refreshCustomValidityRules = function(elem){
		if(!elem.form || (!initTest && !$.prop(elem, 'willValidate')) ){return;}
		blockCustom = true;
		var customMismatchedRule = $.data(elem, 'customMismatchedRule');
		var validity = oldProp(elem, 'validity') || {};
		var message = '';
		if(customMismatchedRule || !validity.customError){
			var val = $(elem).val();
			$.each(customValidityRules, function(name, test){
				message = test(elem, val) || '';
				customMismatchedRule = name;
				if(message){
					if(typeof message != 'string'){
						message = elem.getAttribute('x-moz-errormessage') || elem.getAttribute('data-errormessage') || webshims.customErrorMessages[name][webshims.activeLang()[0]] || webshims.customErrorMessages[name][webshims.activeLang()[1]] || webshims.customErrorMessages[name]['']; 
					}
					return false;
				}
			});
			
			if(message){
				$.data(elem, 'customMismatchedRule', customMismatchedRule);
			}
			$(elem).setCustomValidity(message);
		}
		blockCustom = false;
	};
	var testValidityRules = webshims.refreshCustomValidityRules;
	
	webshims.ready('forms', function(){
		formReady = true;
		
		oldProp = $.prop;
				
		$.prop = function(elem, name){
			if(name == 'validity' && !blockCustom){
				testValidityRules(elem);
			}
			return oldProp.apply(this, arguments);
		};
		
		var oldCustomValidity = $.fn.setCustomValidity || function(message){
			return this.each(function(){
				if(this.setCustomValidity){
					this.setCustomValidity(message);
				}
			});
		};
		
		
		$.fn.setCustomValidity = function(message){
			if(!blockCustom){
				this.data('customMismatchedRule', '');
			}
			return oldCustomValidity.apply(this, arguments);
		};
		
		
		//if constraint validation is supported, we have to change validityState as soon as possible
		if(document.addEventListener && document.createElement('form').checkValidity){
			document.addEventListener('change', onEventTest, true);
		}
		
		webshims.addReady(function(context, selfElement){
			initTest = true;
			$('input, select, textarea', context).add(selfElement.filter('input, select, textarea')).each(function(){
				testValidityRules(this);
			});
			initTest = false;
		});
		$(document).bind('refreshCustomValidityRules', onEventTest);
		
	});
	
})(jQuery, window, document);

/*
 * adds support for HTML5 constraint validation
 * 	- partial pattern: <input data-partial-pattern="RegExp" />
 *  - creditcard-validation: <input class="creditcard-input" />
 *  - several dependent-validation patterns (examples):
 *  	- <input type="email" id="mail" /> <input data-dependent-validation='mail' />
 *  	- <input type="date" id="start" data-dependent-validation='{"from": "end", "prop": "max"}' /> <input type="date" id="end" data-dependent-validation='{"from": "start", "prop": "min"}' />
 *  	- <input type="checkbox" id="check" /> <input data-dependent-validation='checkbox' />
 */
(function($, window, document, undefined){
	"use strict";
	var addCustomValidityRule = $.webshims.addCustomValidityRule;
	addCustomValidityRule('partialPattern', function(elem, val){
		if(!val || !elem.getAttribute('data-partial-pattern')){return;}
		var pattern = $(elem).data('partial-pattern');
		if(!pattern){return;}
		return !(new RegExp('(' + pattern + ')', 'i').test(val));
	}, 'This format is not allowed here.');
	
	addCustomValidityRule('tooShort', function(elem, val){
		if(!val || !elem.getAttribute('data-minlength')){return;}
		return $(elem).data('minlength') > val.length;
	}, 'Entered value is too short.');
	
	var groupTimer = {};
	addCustomValidityRule('group-required', function(elem, val){
		var name = elem.name;
		if(!name || elem.type !== 'checkbox' || !$(elem).hasClass('group-required')){return;}
		var checkboxes = $( (elem.form && elem.form[name]) || document.getElementsByName(name));
		var isValid = checkboxes.filter(':checked');
		if(groupTimer[name]){
			clearTimeout(groupTimer[name]);
		}
		groupTimer[name] = setTimeout(function(){
			checkboxes
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
	
	//based on jörn zaefferes validiation plugin
	// http://docs.jquery.com/Plugins/Validation/Methods/creditcard
	// based on http://en.wikipedia.org/wiki/Luhn
	var dashDigit = /[^0-9-]+/;
	addCustomValidityRule('creditcard', function(elem, value){
		if(!value || !$(elem).hasClass('creditcard-input')){return;}
		if (!dashDigit.test(value)){				
			return true;
		}
		var nCheck = 0,
			nDigit = 0,
			bEven = false;

		value = value.replace(/\D/g, "");

		for (n = value.length - 1; n >= 0; n--) {
			var cDigit = value.charAt(n);
			nDigit = parseInt(cDigit, 10);
			if (bEven && (nDigit *= 2) > 9) {
				nDigit -= 9;
			}
			nCheck += nDigit;
			bEven = !bEven;
		}

		return (nCheck % 10) !== 0;
	}, 'Please enter a valid credit card number');
	
	var dependentDefaults = {
		//"from": "IDREF || UniqueNAMEREF", //required property: element 
		"prop": "value", //default: value||disabled	(last if "from-prop" is checked)
		"from-prop": "value", //default: value||checked (last if element checkbox or radio)
		"toggle": false
	};
	addCustomValidityRule('dependent', function(elem, val){
		
		if( !elem.getAttribute('data-dependent-validation') ){return;}
		
		var data = $(elem).data('dependentValidation');
		if(!data){return;}
		var depFn = function(e){
			var val = $.attr(data.masterElement, data["from-prop"]);
			if(data.toggle){
				val = !val;
			}
			$.prop( elem, data.prop, val);
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
			}
			
			data = $.data(elem, 'dependentValidation', $.extend({_init: true}, dependentDefaults, data));
			
			if(data.prop !== "value"){
				$(data.masterElement).bind('change', depFn);
			} else {
				$(data.masterElement).bind('change', function(){
					$.webshims.refreshCustomValidityRules(elem);
				});
			}
		}

		if(data.prop == "value"){
			return ($.prop(data.masterElement, 'value') != val);
		} else {
			depFn();
			return '';
		}
		
	}, 'The value of this field does not repeat the value of the other field');
})(jQuery, window, document);