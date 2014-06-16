(function($){
jQuery('#form-1 > fieldset').prop('disabled', true)	;
module("additional form features");

asyncTest("field[form]", function(){
	//more [form] tests are in form-submitters.js
	equals($('form.no-id').prop('elements').length, 4, "form.no-id has 4 elements");
	equals($('form.no-id').prop('id', 'some-id-'+(new Date().getTime())).prop('elements').length, 4, "form.no-id with id has 4 elements");
	strictEqual($('form.no-id').empty().updatePolyfill().prop('elements').length, 0, "emptied form.no-id with id has 0 elements");
	strictEqual($('form.no-id').prop('id', '').empty().prop('elements').length, 0, "emptied form.no-id has 0 elements");
	$.webshims.ready('forms DOM', function(){
		start();
	});
});

asyncTest("fieldset[disabled]", function(){
	var curDisabled, newFieldset;
	var fieldset = $('#form-1 > fieldset');
	var initiallyDisabled = $('input:disabled', fieldset);
	
	ok($(':invalid', fieldset).length > 0, "Found some invalid elements");
	
	fieldset.prop('disabled', true);
	ok($(':invalid', fieldset).length === 0, "Found no invalid elements");
	
	curDisabled = $('input:disabled', fieldset);
	ok(curDisabled.length == $('input', fieldset).length, "All inputs are disabled");
	equals(curDisabled.filter(':disabled').length, $('input', fieldset).length, ":disabled filter works");
	
	ok(curDisabled.is(':disabled'), "is :disabled works");
	
	ok(!curDisabled.prop('disabled'), "$.prop disabled returns false for fieldset[disabled] elements");
	
	curDisabled.eq(0).prop('disabled', true);
	
	newFieldset = $('<fieldset><input disabled /><input /><textarea />').appendPolyfillTo(fieldset);
	
	equals($('input, textarea', newFieldset).filter(':disabled').length, 3, "Found 3 disabled elements in fieldset");
	
	newFieldset.prop('disabled', true);
	fieldset.removeAttr('disabled');
	
	ok(curDisabled.eq(0).prop('disabled') && curDisabled.is(':disabled'), "disabled Element stays disabled on enabling a fieldset");
	
	equals($('input, textarea', newFieldset).filter(':disabled').length, 3, "nested fieldset elements stay disabled on enabling parent fieldset");
	
	newFieldset.prop('disabled', false);
	equals($('input, textarea', newFieldset).filter(':disabled').length, 1, "enabling nested fieldset works");
	
	$.webshims.ready('forms DOM', function(){
		start();
	});
});

})(jQuery);
