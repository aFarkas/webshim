(function($){
	
	/* geolocation */
	$.support.geolocation = ('geolocation'  in navigator);
	$.htmlExt.addModule('geolocation', {
		test: function(){
			return $.support.geolocation;
		},
		options: {
			destroyWrite: true
		},
		combination: ['combined-all', 'combined-x']
	});
	/* END: geolocation */
	
	/* canvas */
	$.support.canvas = ('getContext'  in $('<canvas />')[0]);
	$.htmlExt.addModule('canvas', {
		test: function(){
			return $.support.canvas;
		},
		methodNames: [
			{
				name: 'getContext',
				elementNames: ['canvas']
			}
		],
		combination: ['combined-all', 'combined-x']
	});
	/* END: canvas */
	
	/*
	 * HTML5 FORM-Features
	 */
	/* placeholder */
	$.support.placeholder = ('placeholder'  in $('<input type="text" />')[0]);
	$.htmlExt.addModule('placeholder', {
		test: function(){
			return $.support.placeholder;
		},
		css: 'shim.css',
		combination: ['combined-all', 'combined-x', 'combined-forms']
	});
	/* END: placeholder */
	
	/* html5 constraint validation */
	$.support.validity = ('checkValidity' in $('<form action="#" />')[0]);
	$.htmlExt.addModule('validity', {
		test: function(){
			return $.support.validity;
		},
		css: 'shim.css',
		methodNames: [
			{
				name: 'setCustomValidity',
				elementNames: ['input', 'select', 'textarea']
			},
			{
				name: 'checkValidity',
				elementNames: ['form', 'fieldset', 'input', 'select', 'textarea']
			}
		],
		options: {
			stepArrows: {number: true, time: true
			//temp
			//,date: true
			, 'datetime-local': true
			},
			recalcWidth: false
		},
		combination: ['combined-all', 'combined-x', 'combined-forms']
	});
	
	
	if($.support.validity === true){
		//create bubbling-like invalid event
		$.htmlExt.capturingEvents(['invalid', 'input']);
	}
	
	$.extend($.expr.filters, {
		valid: function(elem){
			return ($.attr(elem, 'validity') || {valid: true}).valid;
		},
		invalid: function(elem){
			return !$.expr.filters.valid(elem);
		},
		willValidate: function(elem){
			return $.attr(elem, 'willValidate');
		}
	});
	
	$.htmlExt.createBooleanAttrs('novalidate', 'form');
	
	
	/* validation-message + fieldset.checkValidity pack */
	(function(){
		var form = $('<form action="#"><fieldset><input name="a" required /></fieldset></form>');
		$.support.validationMessage = !!(form.find('input').attr('validationMessage'));
		$.support.fieldsetValidation = !!($('fieldset', form)[0].elements && $('fieldset', form).checkValidity() === false);
		$.htmlExt.addModule('validation-message', {
			test: function(){
				return ($.support.validationMessage && $.support.fieldsetValidation);
			},
			combination: ['combined-all', 'combined-x', 'combined-forms']
		});
	})();
	
	$.support.inputUI = ($('<input type="range" />')[0].type == 'range' && $('<input type="date" />')[0].type == 'date');
	$.htmlExt.addModule('input-ui', {
		test: function(){return $.support.inputUI;},
		combination: ['combined-all', 'combined-x', 'combined-forms'],
		options: {
			slider: {},
			date: {},
			juiSrc: 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.4/jquery-ui.min.js',
			langSrc: 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.4/i18n/jquery.ui.datepicker-',
			recalcWidth: true,
			nativeIsReplaced: false,
			replaceNative: function(replace){
				this.nativeIsReplaced = replace;
				if(replace){
					$.htmlExt.loader.modules['input-ui'].test = function(){
						return false;
					};
				} else {
					$.htmlExt.loader.modules['input-ui'].test = function(){
						return $.support.inputUI;
					};
				}
			}
		}
	});
	
	/* fix chrome 5/6 and safari 5 implemenation + add some usefull custom invalid event called firstinvalid */
	(function(){
		var firstEvent,
			stopSubmitTimer,
			form
		;
		$(document).bind('invalid', function(e){
			if(!firstEvent){
				//webkitfix
				form = e.target.form;
				if ($.support.validity === true && form && !window.noHTMLExtFixes){
					var submitEvents = $(form)
						.bind('submit.preventInvalidSubmit', function(){
							if( !$.attr(form, 'novalidate') ){
								e.stopImmediatePropagation();
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
			
			clearTimeout(stopSubmitTimer);
			stopSubmitTimer = setTimeout(function(){
				//reset firstinvalid
				firstEvent = false;
				//remove webkitfix
				$(form).unbind('submit.preventInvalidSubmit');
			}, 9);
			
		});
	})();
	
	/* some extra validation UI */
	var ValidityAlert = function(){this._create();};
	
	ValidityAlert.prototype = {
		_create: function(){
			this.alert = $('<div class="validity-alert"><div class="va-box" /></div>').css({position: 'absolute', display: 'none'});
			this.hideTimer = false;
			this.hideDelay = 5000;
			this.boundHide = $.proxy(this, 'hide');
		},
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
	$.htmlExt.validityAlert = new ValidityAlert();
	
	/* END: html5 constraint validation */
	
	/* json + loacalStorage */
	$.support.jsonStorage = ('JSON' in window && 'localStorage' in window && 'sessionStorage' in window);
	$.htmlExt.addModule('json-storage', 
		{test: function(){
			return $.support.jsonStorage;
		},
		combination: ['combined-all']
	});
	/* END: json + loacalStorage */
})(jQuery);
