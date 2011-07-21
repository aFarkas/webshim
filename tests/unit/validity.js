(function($){

$.expr.filters.willValidate = function(elem){
	return $.prop(elem, 'willValidate');
};

module("validity");



asyncTest("general validity Modul", function(){
	QUnit.reset();
	
	var form1 = $('#form-1');
	
	
	/*
	 * novalidate
	 */
	//novalidate getter
	strictEqual( form1.attr('novalidate'), undefined, 'novalidate is undefined' );
	strictEqual( $('#form-2').attr('novalidate'), "", 'novalidate is not undefined' );
	
	//novalidate setter
	
	
	webshimtest.reflectAttr(form1.find('#name'), 'required', true, 'boolean');
	
	//willValidate
	var willValidate = $('#form-1 input:willValidate'),
		total = willValidate.length
	;
	
	willValidate.filter(':eq(0)').prop('disabled', true);
	equals( $('#form-1 input:willValidate').length, total - 1, 'willValidate disabled' );
	willValidate.filter(':eq(0)').prop('disabled', false);
	equals( $('#form-1 input:willValidate').length, total, 'willValidate enabled' );

	
	form1.find('#name').prop('readonly', true);
	equals( $('#form-1 input:willValidate').length, total - 1, 'willValidate: false with readonly' );
	form1.find('#name').prop('readonly', false);
	
	//invalid
	if(omitTests.requiredSelect){
		$('#select2').prop('disabled', true);
	}
	var invalid = $('input, textarea, select', form1).filter(':invalid-element');
	equals( invalid.length, 7, 'total invalid using filter' );
	
	equals( $(':invalid-element', form1).length, 7, 'total invalid' );
	
	equals( invalid.filter('[type=radio]').length, 3, 'radio invalid' );
	invalid.filter('[type=radio]:last').prop('checked', true);
	equals( invalid.filter('[type=radio]:invalid-element').length, 0, 'radio changed valid' );
	invalid.filter('[type=radio]:last').prop('checked', false);
	
	equals(form1.find('#name').is(':invalid-element'), true, 'name is invalid');
	form1.find('#name').prop('required', false);
	equals(form1.find('#name').prop('required'), false, "name isn't required");
	equals(form1.find('#name').is(':invalid-element'), false, 'name is valid');
	form1.find('#name').prop('required', true);
	
	ok($('#select').prop('validity').valid, 'select is valid');
	$('#select').prop('required', true);
	ok($('#select').prop('validity').valueMissing, 'required select with first option selected and empty value is invalid');
	$('#select').removeAttr('required');
	ok(!$('#select').prop('validity').valueMissing, 'remove required works');
	$('#select').attr('required', 'required');
	if (!omitTests.requiredSelect) {
	
		
		$('#select').prop('selectedIndex', 1);
		ok($('#select').prop('validity').valid, 'required select with empty value and second option selected is valid');
		
		ok(!$('#select4').prop('validity').valid, 'required multiple select with no option selected is invalid');
		$('#select4').prop({
			'selectedIndex': 0,
			size: 1
		});
		ok($('#select4').prop('validity').valid, 'required multiple select with first option selected and empty value is valid');
		
		
		ok($('#select2').prop('validity').valid, 'required select with first option selected, in an optgroup and empty value is valid');
		
		
		ok(!$('#select3').prop('validity').valid, 'required select with no option selected is invalid');
		ok($('#select3').prop('selectedIndex', 0).prop('validity').valid, 'required select with first option selected and empty value, but size > 1 is valid');
	}
		
	//validityState
	//what is the problem here?
	if(navigator.userAgent.indexOf('Chrome') === -1){
		same($('#email').prop('validity'), {
			typeMismatch: false,
			rangeUnderflow: false,
			rangeOverflow: false,
			stepMismatch: false,
			tooLong: false,
			patternMismatch: false,
			valueMissing: true,
			customError: false,
			valid: false
		}, 'email required');
		
		$('#email').val('some input');
		same($('#email').prop('validity'), {
			typeMismatch: true,
			rangeUnderflow: false,
			rangeOverflow: false,
			stepMismatch: false,
			tooLong: false,
			patternMismatch: false,
			valueMissing: false,
			customError: false,
			valid: false
		}, 'email required');
	}
	$('#email').val('some input');
	ok($('#email').prop('validity').typeMismatch, 'typeMismatch is true for email and value: some input');
	
	$.each({
		'info@c-t.de': 'valid-element', 
		'INFO@CTE.DE': 'valid-element', 
		'info@c-t.museum': 'valid-element',
		'info@c123t.museum': 'valid-element',
		'info@3com.com': 'valid-element',
		'in-f+a{t$o@cpt.de': 'valid-element',
		'in\@fo@3com.com': 'valid-element',
		'in@fo@3com.com': 'invalid-element',
		'info.de': 'invalid-element'
		//we are too lax, but better too lax, then too strict :-)
//		,'info@des': 'invalid-element',
//		'info@des.ä': 'invalid-element'
	}, function(val, state){
		$('#email').val(val);
		ok($('#email').is(':'+state), val+' is '+state+' mail');
	});
	if(!omitTests.validity){
		$.each({
			'info@cät.de': 'valid-element',
			'"in@fo"@3com.com': 'valid-element'
		}, function(val, state){
			$('#email').val(val);
			ok($('#email').is(':'+state), val+' is '+state+' mail');
		});
	}
	
	
	$.webshims.ready('forms DOM', function(){
		start();
	});
});

asyncTest('email, url, pattern, maxlength', function(){
	$.each({
		'http://bla.de': 'valid-element', 
		'http://www.bla.de': 'valid-element', 
		'http://www.bla.museum': 'valid-element',
		'https://www.bla.museum:800': 'valid-element',
		'https://www.bla.museum:800/': 'valid-element',
		'https://www.bla.co.uk:800/': 'valid-element',
		'https://www.3blä.de:800': 'valid-element',
		'ftp://www.3blä.de:800': 'valid-element',
		//ok, almost everything is valid here
		'htstp//dff': 'invalid-element'
	}, function(val, state){
		$('#url').val(val);
		ok($('#url').is(':'+state), val+' is '+state+' url');
	});
	
	
	//maxlength
	var ti = 0;
	$.each({
		
		'Lorem ipsum dolor sit amet, consetetur sadipscing elitr,  sed diam nonumy eirmod tempor invidunt ut ': 'valid-element'
		//don't know
		,'Lorem ipsum dolor sit amet, consetetur sadipscing elitr\n,  sed diam nonumy eirmod tempor invidunt u': 'valid-element',
		'Lorem ipsum d\tor s\t amet, c\nsetetur sadipscing elitr\n,  sed ddm nonumdeirmod tempor invidunt u': 'valid-element'
		
	}, function(val, state){
		$('#maxlength').val(val);
		if(val == $('#maxlength').val()){
			ok($('#maxlength').is(':'+state), val.length+' is '+state+' maxlength');
		}
	});
	
	if(!omitTests.validity){
		$.each({
			'Lorem ipsum dolor sit amet, consetetur sadipscing elitr,  sed diam nonumy eirmod tempor invidunt ut labore et dolore mag': 'invalid-element', 
			'Lorem ittum dolor sit amet, consetetur s\nipscing elit\n,  sed diam nonumy eittod tempor invidunt ut ': 'valid-element',
			'Lorem ipsum ddddor sddd amet, c\nsetetur sadipscing elitr\n,  sed dddm nonumddeirmod tempor invidunt ut': 'invalid-element'
		}, function(val, state){
			$('#maxlength').val(val);
			if(val == $('#maxlength').val()){
				ok($('#maxlength').is(':'+state), val.length+' is '+state+' maxlength');
			}
		});
	}
	
	$('#maxlength').attr('maxlength', 30);
	
	$.each({
		
		'Lorem ipsum dolor sit amet, co': 'valid-element'
	}, function(val, state){
		
		$('#maxlength').val(val);
		if (val == $('#maxlength').val()) {
			ok($('#maxlength').is(':' + state), val.length + ' is ' + state + ' maxlength');
		}
	});
	
	if(!omitTests.validity){
		$.each({
			'Lorem ipsum dolor sit amet, con': 'invalid-element'
		}, function(val, state){
			$('#maxlength').val(val);
			if(val == $('#maxlength').val()){
				ok($('#maxlength').is(':'+state), val.length+' is '+state+' maxlength');
			}
		});
	}
	
	//pattern
	$('#pattern').val('test');
	ok($('#pattern').is(':invalid-element'), 'test is invalid pattern');
	$('#pattern').val('1DHT');
	ok($('#pattern').is(':valid-element'), '1DHT is valid pattern');
	
	$.webshims.ready('forms DOM', function(){
		start();
	});
});

asyncTest('validationMessage/setCustomValidity', function(){
	var firstInvalid = $('#name').attr('value', '');
	var lang = $.webshims.activeLang()[0];
	//select + customValidity
	ok($('#select').is(':valid-element'), 'select is valid');
	$('#select').setCustomValidity('has an error');
	ok($('#select').is(':invalid-element'), 'select is set invalid');
	ok($('#select').prop('validity').customError, 'select has customerror');
	equals($('#select').prop('validationMessage'), 'has an error', 'custom error message set');
	if($.webshims.cfg.forms.overrideMessages){
		equals(firstInvalid.prop('validationMessage'), firstInvalid.prop('customValidationMessage'), 'custom message equals native message if messages are overridden');
		$.webshims.activeLang('en');
		equals(firstInvalid.prop('validationMessage'), firstInvalid.prop('customValidationMessage'), 'switched message to en');
		$.webshims.activeLang('de');
		equals(firstInvalid.prop('validationMessage'), firstInvalid.prop('customValidationMessage'), 'switched message to de');
		$.webshims.activeLang(lang);
		equals(firstInvalid.prop('validationMessage'), firstInvalid.prop('customValidationMessage'), 'switched message to '+ lang);
	}
	if($.webshims.cfg.forms.overrideMessages || $.webshims.cfg.forms.customMessages){
		$.webshims.activeLang('en');
		var enMessage = firstInvalid.prop('customValidationMessage');
		$.webshims.activeLang('de');
		var deMessage = firstInvalid.prop('customValidationMessage');
		ok(enMessage != deMessage, 'customMessage for en is not equal to customMessage for de');
		$.webshims.activeLang(lang);
	}
	
	equals($('#select').prop('disabled', true).prop('validationMessage'), '', 'custom error message is empty, if control is disabled');
	$('#select').prop('disabled', false).setCustomValidity('');
	ok(( $('#select').is(':valid-element') && $('#select').prop('willValidate') ), 'select is set valid again');
	if($.webshims.cfg.extendNative){
		$('#select')[0].setCustomValidity('has an error2');
		ok($('#select').prop('validity').customError, 'select has customerror with native method');
		$('#select')[0].setCustomValidity('');
	}
	ok(!!($('input').filter(':invalid-element').prop('validationMessage')), 'validationMessage is a getter for all invalid elements');
	$.webshims.ready('forms DOM', function(){
		start();
	});
});


asyncTest('output test', function(){
	QUnit.reset();
	
	equals($('foobar').prop('value'), 'jo da foobar', 'same props on multiple unknwon elements work right');
	equals($('foobarbaz').prop('value'), undefined, "unknown extension don't pollute other unknowns");
	
	equals($('output').prop('value'), 'jo', 'first output has initial value');
	$('output:first').prop('value', 'hello');
	equals($('output').prop('value'), 'hello', 'first output has changed value');
	
	
	
	$('#labeled-output').prop('value', 'somecontent');
	if( !omitTests.output ){
		equals($('output:first').text(), 'hello', 'shim shows value');
		equals($('#labeled-output').text(), 'somecontent', 'shim shows value');
		ok(/&outputtest=somecontent&/.test($('form').serialize()), 'finds output serialized in shim');
	}
	
	$('#rangeId').attr('value', 30);
	
	$.webshims.triggerInlineForm($('input.oninput-test')[0], 'input');
	
	equals(window.globalInput, '30:30', 'globalInput value was set on trigger');
	
	$($('#form-1')[0]['outputtest']).prop('value', 'value');
	equals($('#labeled-output').prop('value'), 'value', 'value is set through form elements');
	$.webshims.ready('forms DOM', function(){
		start();
	});
});

//we split checkValidity test, because invalid workaround for chrome produces error || this error is negligible
asyncTest('checkValidity/invalid event I', function(){
	QUnit.reset();
	var invalids = 0;
	$('#form-1').bind('invalid', function(){
		invalids++;
	});

	if(omitTests.requiredSelect){
		$('#select2').prop('disabled', true);
	}
	webshimtest.hasMethod($('#form-1'), 'checkValidity');
	ok(!$('#form-1').checkValidity(), 'validity is false for form-element (form)');
	equals(invalids, 7, 'there were 7 invalid events (form)');
	strictEqual($('#email-outside').checkValidity(), false, 'email outside of form will be validated');
	$.webshims.ready('forms DOM', function(){
		start();
	});
});

asyncTest('checkValidity/invalid event III', function(){
	QUnit.reset();
	var invalids = 0;
	$('#form-1').bind('invalid', function(){
		invalids++;
	});
	
	webshimtest.hasMethod($('#name'), 'checkValidity');
	ok(!$('#name').checkValidity(), 'validity is false for #name (element)');
	equals(invalids, 1, 'there was 1 invalid event (element)');
		
	$.webshims.ready('forms DOM', function(){
		setTimeout(start, 16);
	});
});

if($.webshims.cfg.extendNative){
	asyncTest('native checkValidity/invalid event III', function(){
		QUnit.reset();
		var invalids = 0;
		$('#form-1').bind('invalid', function(){
			invalids++;
		});
		ok(!$('#name')[0].checkValidity(), 'validity is false for #name (element)');
		equals(invalids, 1, 'there was 1 invalid event (element)');
			
		$.webshims.ready('forms DOM', function(){
			setTimeout(start, 16);
		});
	});
}


asyncTest('checkValidity/invalid event IV', function(){
	QUnit.reset();
	var invalids = 0;
	$('#form-1').bind('invalid', function(e){
		invalids++;
	});
	
	
	$.each(['#name', '#email','#email','#field6-1', '#select3', '#select4', '#select2'], function(i, id){
		var elem = $(id);
		if(elem.prop('type') == 'radio'){
			elem.prop('checked', true);
		} else {
			elem.prop('disabled', true);
		}
	});
	ok($('#form-1').checkValidity(), 'validity is true for form-element');
	equals(invalids, 0, 'there were 0 invalid events');
	
	$.webshims.ready('forms DOM', function(){
		setTimeout(start, 32);
	});
});


})(jQuery);