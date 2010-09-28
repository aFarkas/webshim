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
	$.webshims.addModule('geolocation', {
		test: function(){
			return $.support.geolocation;
		},
		options: {destroyWrite: true},
		combination: ['combined-all', 'combined-x', 'combined-xx']
	});
	/* END: geolocation */
	
	/* canvas */
	$.support.canvas = ('getContext'  in $('<canvas />')[0]);
	$.webshims.addModule('canvas', {
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
	$.webshims.addModule('validity', {
		feature: 'form2',
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
		options: {},
		combination: ['combined-all', 'combined-x', 'combined-xx', 'combined-forms']
	});
	
	
	if($.support.validity === true){
		//create bubbling-like invalid event
		$.webshims.capturingEvents(['invalid', 'input']);
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
	
	
	/* bugfixes, validation-message + fieldset.checkValidity pack */
	(function(){
		$.webshims.validityMessages = [];
		$.webshims.inputTypes = {};
		var form = $('<form action="#"><fieldset><input name="a" required /></fieldset></form>');
		$.support.validationMessage = !!(form.find('input').attr('validationMessage'));
		$.support.fieldsetValidation = !!($('fieldset', form)[0].elements && $('fieldset', form)[0].checkValidity && 'disabled' in $('fieldset', form)[0] && !$('fieldset', form)[0].checkValidity() );
		$.webshims.addModule('validation-base', {
			feature: 'form2',
			test: function(){
				//always load
				return false; //($.support.validationMessage && $.support.fieldsetValidation);
			},
			combination: ['combined-all', 'combined-x', 'combined-xx', 'combined-forms']
		});
	})();
	
	$.webshims.addModule('implement-types', {
		feature: 'form2',
		test: function(){
			return !($.support.validity === true && ( $('<input type="datetime-local" />').attr('type') !== 'datetime-local' || $('<input type="range" />').attr('type') !== 'range' ) );
		},
		combination: ['combined-forms-x']
	});
	
	
	$.webshims.addModule('number-date-type', {
		feature: 'form2',
		test: function(){
			return ($('<input type="datetime-local" />').attr('type') === 'datetime-local' && $('<input type="range" />').attr('type') === 'range');
		},
		combination: ['combined-all', 'combined-x', 'combined-xx', 'combined-forms'],
		options: {stepArrows: {number: 1, time: 1}}
	});
	
	/* placeholder */
	$.support.placeholder = ('placeholder'  in $('<input type="text" />')[0]);
	$.webshims.addModule('placeholder', {
		feature: 'form2',
		test: function(){
			return $.support.placeholder;
		},
		css: 'shim.css',
		combination: ['combined-all', 'combined-x', 'combined-xx', 'combined-forms']
	});
	/* END: placeholder */
	
	/* END: html5 constraint validation */
	
	/* json + loacalStorage */
	$.support.jsonStorage = ('JSON' in window && 'localStorage' in window && 'sessionStorage' in window);
	$.webshims.addModule('json-storage', {
		test: function(){
			return $.support.jsonStorage;
		},
		noAutoCallback: true,
		combination: ['combined-all']
	});
	/* END: json + loacalStorage */
})(jQuery);
