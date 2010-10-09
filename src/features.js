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
	
	// webshims lib uses a of http://github.com/kriskowal/es5-shim/ to implement
	$.support.es5 = !!(String.prototype.trim && Function.prototype.bind && !isNaN(Date.parse("T00:00")) && Date.now && Date.prototype.toISOString);
	if($.support.es5){
		$.each(['filter', 'map', 'every', 'reduce', 'reduceRight', 'lastIndexOf'], function(i, name){
			if(!Array.prototype[name]){
				$.support.es5 = false;
				return false;
			}
		});
	}
	if($.support.es5){
		$.each(['keys', 'isExtensible', 'isFrozen', 'isSealed', 'preventExtensions', 'defineProperties', 'create', 'getOwnPropertyNames'], function(i, name){
			if(!Object[name]){
				$.support.es5 = false;
				return false;
			}
		});
	}
	$.webshims.addPolyfill('es5', {
		test: function(){
			return $.support.es5;
		},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ff3', 'combined-ie7-light', 'combined-ie8-light', 'combined-ff3-light']
	});

	
	/* geolocation */
	$.support.geolocation = ('geolocation'  in navigator);
	$.webshims.addPolyfill('geolocation', {
		test: function(){
			return $.support.geolocation;
		},
		options: {destroyWrite: true},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light']
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
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie7-light', 'combined-ie8-light']
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
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light', 'combined-ff3-light']
	});
	
	
	if($.support.validity === true){
		//create delegatable-like events
		$.webshims.capturingEvents(['input']);
		$.webshims.capturingEvents(['invalid'], true);
	}
	
	/* bugfixes, validation-message + fieldset.checkValidity pack */
	
	(function(){
		$.webshims.validityMessages = [];
		$.webshims.inputTypes = {};
		var form = $('<form action="#"><fieldset><input name="a" required /></fieldset></form>'),
			field = $('fieldset', form)[0]
		;
		$.support.validationMessage = !!(form.find('input').attr('validationMessage'));
		$.support.fieldsetValidation = !!(field.elements && field.checkValidity && 'disabled' in field && !field.checkValidity() );
		$.webshims.addPolyfill('validation-base', {
			feature: 'forms',
			test: function(){
				//always load
				return false; //($.support.validationMessage && $.support.fieldsetValidation);
			},
			combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ff4', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light', 'combined-ff3-light']
		});
	})();
	
	
	$.webshims.addPolyfill('implement-types', {
		feature: 'forms',
		test: function(){
			return !($.support.validity === true && ( $('<input type="datetime-local" />').attr('type') !== 'datetime-local' || $('<input type="range" />').attr('type') !== 'range' ) );
		},
		combination: ['combined-ff4']
	});
	
	
	$.webshims.addPolyfill('number-date-type', {
		feature: 'forms',
		test: function(){
			return ($('<input type="datetime-local" />').attr('type') === 'datetime-local' && $('<input type="range" />').attr('type') === 'range');
		},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ff4'],
		options: {stepArrows: {number: 1, time: 1}}
	});
	
	
	/* placeholder */
	
	$.support.placeholder = ($('<input type="text" />').attr('placeholder') !== undefined);
	$.webshims.addPolyfill('placeholder', {
		feature: 'forms',
		test: function(){
			return $.support.placeholder;
		},
		combination: ['combined-ie7', 'combined-ie8', 'combined-ie9', 'combined-ff3', 'combined-ie7-light', 'combined-ie8-light', 'combined-ie9-light', 'combined-ff3-light']
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
		combination: ['combined-ie7', 'combined-ie7-light']
	});
	/* END: json + loacalStorage */
	//predefined list without input type number/date/time etc.
	$.webshims.light = ['es5', 'canvas', 'validity', 'validation-base', 'placeholder', 'json-storage'];
})(jQuery);
