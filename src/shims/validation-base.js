/* fix chrome 5/6 and safari 5 implemenation + add some usefull custom invalid event called firstinvalid */
(function($){
	var firstEvent,
		invalids = [],
		stopSubmitTimer,
		form
	;
	
	//opera fix
	//opera throws a submit-event and then the invalid events,
	//the following code will trigger the invalid events first and webkitfix will stopImmediatePropagation of submit event
	if($.support.validity === true && document.addEventListener && !window.noHTMLExtFixes && window.opera){
		document.addEventListener('submit', function(e){
			if(e.target.checkValidity){
				e.target.checkValidity();
			}
		}, true);
	}
	$(document).bind('invalid', function(e){
		if(!firstEvent){
			//webkitfix 
			//chrome/safari submits an invalid form, if you prevent all invalid events
			//this also prevents opera from throwing a submit event if form isn't valid
			form = e.target.form;
			if ($.support.validity === true && form && !window.noHTMLExtFixes){
				var submitEvents = $(form)
					.bind('submit.preventInvalidSubmit', function(submitEvent){
						if( $.attr(form, 'novalidate') === undefined ){
							submitEvent.stopImmediatePropagation();
							return false;
						}
					})
					.data('events').submit
				;
				//add this handler as first executing handler
				if (submitEvents && submitEvents.length > 1) {
					submitEvents.unshift(submitEvents.pop());
				}
			}
			
			//trigger firstinvalid
			firstEvent = $.Event('firstinvalid');
			$(e.target).trigger(firstEvent);
		}
		//if firstinvalid was prevented all invalids will be also prevented
		if( firstEvent && firstEvent.isDefaultPrevented() ){
			e.preventDefault();
		}
		invalids.push(e.target);
		clearTimeout(stopSubmitTimer);
		stopSubmitTimer = setTimeout(function(){
			var lastEvent = {type: 'lastinvalid', cancelable: false, invalidlist: $(invalids)};
			//reset firstinvalid
			firstEvent = false;
			//remove webkitfix
			$(form).unbind('submit.preventInvalidSubmit');
			invalids = [];
			$(e.target).trigger(lastEvent, lastEvent);
		}, 9);
		
	});
	
	
	/* some extra validation UI */
	var ValidityAlert = function(){this._create();};
	
	ValidityAlert.prototype = {
		_create: function(){
			this.alert = $('<div class="validity-alert" role="alert"><div class="va-box" /></div>').css({position: 'absolute', display: 'none'});
			this.hideTimer = false;
			this.boundHide = $.proxy(this, 'hide');
		},
		hideDelay: 5000,
		createAlert: function(){
			if(this.created){return;}
			this.created = true;
			var that = this;
			$(function(){that.alert.appendTo('body');});
		},
		showFor: function(elem, noFocus){
			elem = $(elem);
			var widget = elem.data('inputUIReplace');
			if(widget){
				elem = widget.visual;
			}
			this.createAlert();
			this.clear();
			this.getMessage(elem);
			this.position(elem);
			this.show();
			if(!noFocus){
				elem.focus();
			}
			this.hideTimer = setTimeout(this.boundHide, this.hideDelay);
			$(document).bind('focusout.validityalert', this.boundHide);
		},
		getMessage: function(elem){
			$('> div', this.alert).html(elem.attr('validationMessage'));
		},
		position: function(elem){
			var offset = elem.offset();
			offset.top += elem.outerHeight();
			this.alert.css(offset);
		},
		clear: function(){
			clearTimeout(this.hideTimer);
			$(document).unbind('focusout.validityalert');
			this.alert.stop().css({opacity: ''});
		},
		show: function(){
			this.alert.fadeIn();
		},
		hide: function(){
			this.clear();
			this.alert.fadeOut();
		}
	};
	$.webshims.validityAlert = new ValidityAlert();
	
	$.webshims.validityMessages[''] = {
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
	
	$.webshims.validityMessages['de'] = {
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
		$.webshims.activeLang($.webshims.validityMessages, 'validation-base', function(langObj){
			validiyMessages = langObj;
		});
	});
		
	$.each(($.support.validationMessage) ? ['customValidationMessage'] : ['customValidationMessage', 'validationMessage'], function(i, fn){
		$.webshims.attr(fn, {
			elementNames: ['input', 'select', 'textarea'],
			getter: function(elem){
				var message = '';
				if(!$.attr(elem, 'willValidate')){
					return message;
				}
				
				var validity = $.attr(elem, 'validity') || {valid: 1};
				if(validity.valid){return message;}
				if(validity.customError || fn === 'validationMessage'){
					message = ('validationMessage' in elem) ? elem.validationMessage : $.data(elem, 'customvalidationMessage');
					if(message){return message;}
				}
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
					$.each(['value', 'min', 'max', 'title', 'maxlength', 'label'], function(i, attr){
						if(message.indexOf('%'+attr) === -1){return;}
						var val = ((attr == 'label') ? $.trim($('label[for='+ elem.id +']', elem.form).text()).replace(/\*$/, '') : $.attr(elem, attr)) || '';
						message = message.replace('{%'+ attr +'}', val);
						if('value' == attr){
							message = message.replace('{%valueLen}', val.length);
						}
					});
				}
				return message || '';
			}
		});
	} );
	
	
	$.support.validationMessage = 'shim';
})(jQuery);

(function($){
	if($.support.validity !== true || $.support.fieldsetValidation || window.noHTMLExtFixes){
		return;
	}
	$.support.fieldsetValidation = 'shim';
	$.webshims.addMethod('checkValidity', function(error){
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
