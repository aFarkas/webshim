(function($){
	/* general modules */
	/* change path $.webshims.loader.modules[moduleName].src */
	$.webshims.loader.addModule('jquery-ui', {
		src: 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.5/jquery-ui.min.js',
		test: function(){
			return !!($.ui && $.widget && ($.fn.datepicker || $.fn.slider));
		}
	});
	
	$.webshims.loader.addModule('swfobject', {
		src: 'http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js',
		test: function(){
			return ('swfobject' in window);
		}
	});
	
	/* 
	 * polyfill-Modules 
	 */
	
	/* geolocation */
	$.support.geolocation = ('geolocation'  in navigator);
	$.webshims.addPolyfill('geolocation', {
		test: function(){
			return $.support.geolocation;
		},
		options: {destroyWrite: true},
		combination: ['combined-all', 'combined-x', 'combined-xx']
	});
	/* END: geolocation */
	
	/* canvas */
	$.support.canvas = ('getContext'  in $('<canvas />')[0]);
	$.webshims.addPolyfill('canvas', {
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
	
	/* html5 constraint validation */
	$.support.validity = ('checkValidity' in $('<form action="#" />')[0]);
	$.webshims.addPolyfill('validity', {
		feature: 'forms',
		test: function(){
			return $.support.validity;
		},
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
		options: {},
		combination: ['combined-all', 'combined-x', 'combined-xx', 'combined-forms']
	});
	
	
	if($.support.validity === true){
		//create bubbling-like invalid event
		$.webshims.capturingEvents(['invalid', 'input']);
	}
	
	/* bugfixes, validation-message + fieldset.checkValidity pack */
	(function(){
		$.webshims.validityMessages = [];
		$.webshims.inputTypes = {};
		var form = $('<form action="#"><fieldset><input name="a" required /></fieldset></form>');
		$.support.validationMessage = !!(form.find('input').attr('validationMessage'));
		$.support.fieldsetValidation = !!($('fieldset', form)[0].elements && $('fieldset', form)[0].checkValidity && 'disabled' in $('fieldset', form)[0] && !$('fieldset', form)[0].checkValidity() );
		$.webshims.addPolyfill('validation-base', {
			feature: 'forms',
			test: function(){
				//always load
				return false; //($.support.validationMessage && $.support.fieldsetValidation);
			},
			combination: ['combined-all', 'combined-x', 'combined-xx', 'combined-forms', 'combined-forms-x']
		});
	})();
	
	$.webshims.addPolyfill('implement-types', {
		feature: 'forms',
		test: function(){
			return !($.support.validity === true && ( $('<input type="datetime-local" />').attr('type') !== 'datetime-local' || $('<input type="range" />').attr('type') !== 'range' ) );
		},
		combination: ['combined-forms-x']
	});
	
	
	$.webshims.addPolyfill('number-date-type', {
		feature: 'forms',
		test: function(){
			return ($('<input type="datetime-local" />').attr('type') === 'datetime-local' && $('<input type="range" />').attr('type') === 'range');
		},
		combination: ['combined-all', 'combined-x', 'combined-xx', 'combined-forms', 'combined-forms-x'],
		options: {stepArrows: {number: 1, time: 1}}
	});
	
	/* placeholder */
	$.support.placeholder = ($('<input type="text" />').attr('placeholder') !== undefined);
	$.webshims.addPolyfill('placeholder', {
		feature: 'forms',
		test: function(){
			return $.support.placeholder;
		},
		combination: ['combined-all', 'combined-x', 'combined-xx', 'combined-forms']
	});
	/* END: placeholder */
	
	/* END: html5 constraint validation */
	
	/* json + loacalStorage */
	$.support.jsonStorage = ('JSON' in window && 'localStorage' in window && 'sessionStorage' in window);
	$.webshims.addPolyfill('json-storage', {
		test: function(){
			return $.support.jsonStorage;
		},
		noAutoCallback: true,
		combination: ['combined-all']
	});
	/* END: json + loacalStorage */
})(jQuery);
