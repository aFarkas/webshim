(function($){
	$.support.validationMessage = 'shim';
	
	
	var validiyMessages;
	
	$.htmlExt.validityMessages = {
		de: {
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
		}
	};
	
	(function(){
		var defaultLang = 'de';
		
		$.htmlExt.setActiveValidityLang = function(lang){
			validiyMessages = $.htmlExt.validityMessages[lang] || $.htmlExt.validityMessages[defaultLang];
		};
		
	})();
	
	
	(function(){
		var uaLang = (navigator.browserLanguage || navigator.language || $('html').attr('lang') || '').split('-')[0];
		$.htmlExt.setActiveValidityLang(uaLang);
	})();
	
	
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
