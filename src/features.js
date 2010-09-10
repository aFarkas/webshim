(function($){
	
	/* combinator */
	//all: good for IE8-
	//$.htmlExt.addCombination('combined-all', ['geolocation', 'canvas', 'placeholder', 'validity', 'validation-message']);
	//
	//good for FF 3.6-
	//$.htmlExt.addCombination('combined-forms', ['placeholder', 'validity', 'validation-message']);
	/* geolocation */
	$.support.geolocation = ('geolocation'  in navigator);
	$.htmlExt.addModule('geolocation', {
		test: function(){
			return $.support.geolocation;
		},
		options: {
			destroyWrite: true
		}
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
		]
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
		css: 'shim.css'
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
			stepArrows: {number: true, time: true},
			recalcWidth: true
		}
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
	
	
	/* validation-message pack */
	$.support.validationMessage = !!($('<form action="#"><input name="a" required /></form>').find('input').attr('validationMessage'));
	$.htmlExt.addModule('validation-message', {
		test: function(){
			return $.support.validationMessage;
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
				if ($.support.validity === true && form){
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
			this.createAlert();
			elem = $(elem);
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
	$.htmlExt.addModule('json-storage', {test: function(){
		return $.support.jsonStorage;
	}});
	/* END: json + loacalStorage */
})(jQuery);
