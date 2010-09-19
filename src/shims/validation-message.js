(function($){
	if($.support.validationMessage){
		return;
	}
	$.support.validationMessage = 'shim';
	
	
	$.htmlExt.validityMessages = [];
	
	$.htmlExt.validityMessages[''] = {
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
	
	$.htmlExt.validityMessages['de'] = {
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
