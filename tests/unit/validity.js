(function($){

$.expr.filters.willValidate = function(elem){
	return $.attr(elem, 'willValidate');
};

module("validity");



asyncTest("general validity Modul", function(){
	QUnit.reset();
	
	var form1 = $('#form-1');
	
	
	/*
	 * novalidate
	 */
	//novalidate getter
	equals( form1.attr('novalidate'), undefined, 'novalidate is undefined' );
	ok($('#form-2').attr('novalidate') !== undefined, 'novalidate is not undefined' );
	
	//novalidate setter
	
	
	equals(form1.find('#name').attr('required'), true, 'name is required');
	
	//willValidate
	var willValidate = $('#form-1 input:willValidate'),
		total = willValidate.length
	;
	
	willValidate.filter(':eq(2)').attr('disabled', true);
	equals( $('#form-1 input:willValidate').length, total - 1, 'willValidate disabled' );
	willValidate.filter(':eq(2)').attr('disabled', false);
	equals( $('#form-1 input:willValidate').length, total, 'willValidate enabled' );
//	form1.find('#name').removeAttr('name');
//	equals( $('#form-1 input:willValidate').length, total - 1, 'willValidate: false without name (negligible in native)' );
//	form1.find('#name').attr('name', 'name');
	
	form1.find('#name').attr('readonly', true);
	equals( $('#form-1 input:willValidate').length, total - 1, 'willValidate: false with readonly' );
	form1.find('#name').attr('readonly', false);
	
	//invalid
	var invalid = $('input, textarea, select', form1).filter(':invalid-element');
	equals( invalid.length, 5, 'total invalid' );
	
	equals( $(':invalid-element', form1).length, 5, 'total invalid' );
	
	equals( invalid.filter('[type=radio]').length, 3, 'radio invalid' );
	invalid.filter('[type=radio]:last').attr('checked', true);
	equals( invalid.filter('[type=radio]:invalid-element').length, 0, 'radio changed valid' );
	invalid.filter('[type=radio]:last').attr('checked', false);
	
	equals(form1.find('#name').is(':invalid-element'), true, 'name is invalid');
	form1.find('#name').attr('required', false);
	equals(form1.find('#name').attr('required'), false, "name isn't required");
	equals(form1.find('#name').is(':invalid-element'), false, 'name is valid');
	form1.find('#name').attr('required', true);
	
	ok($('#select').attr('validity').valid, 'select is valid');
	$('#select').attr('required', true);
	ok($('#select').attr('validity').valueMissing, 'required select with first option selected and empty value is invalid');
	
	$('#select option:first').attr('disabled', true);
	ok($('#select').attr('validity').valid, 'required select with first disabled option selected and empty value is valid');
	
	$('#select option:first').attr('disabled', false);
	$('#select').attr('selectedIndex', 1);
	ok($('#select').attr('validity').valid, 'required select with empty value and second option selected is valid');
	$('#select4').attr({
		'selectedIndex': 0,
		size: 1
	});
	ok($('#select4').attr('validity').valid, 'required multiple select with first option selected and empty value is valid');
	
	ok($('#select2').attr('validity').valid, 'required select with first option selected, in an optgroup and empty value is valid');
	
	ok($('#select3').attr('selectedIndex', 0).attr('validity').valid, 'required select with first option selected and empty value, but size > 1 is valid');
	
		
	//validityState
	//what is the problem here?
	if(navigator.userAgent.indexOf('Chrome') === -1){
		same($('#email').attr('validity'), {
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
		same($('#email').attr('validity'), {
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
	ok($('#email').attr('validity').typeMismatch, 'typeMismatch is true for email and value: some input');
	
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
	
	
	$.webshims.ready('forms ready', function(){
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
	$.each({
		'Lorem ipsum dolor sit amet, consetetur sadipscing elitr,  sed diam nonumy eirmod tempor invidunt ut labore et dolore mag': 'invalid-element', 
		'Lorem ipsum dolor sit amet, consetetur sadipscing elitr,  sed diam nonumy eirmod tempor invidunt ut ': 'valid-element'
		//don't know
		,'Lorem ipsum dolor sit amet, consetetur sadipscing elitr\n,  sed diam nonumy eirmod tempor invidunt u': 'valid-element',
		'Lorem ipsum d\tor s\t amet, c\nsetetur sadipscing elitr\n,  sed ddm nonumdeirmod tempor invidunt u': 'valid-element',
		'Lorem ipsum ddddor sddd amet, c\nsetetur sadipscing elitr\n,  sed dddm nonumddeirmod tempor invidunt ut': 'invalid-element'
	}, function(val, state){
		$('#maxlength').val(val);
		if(val == $('#maxlength').val()){
			ok($('#maxlength').is(':'+state), val.length+' is '+state+' maxlength');
		}
	});
	
	if(!omitTests.validity){
		$.each({
			'Lorem ittum dolor sit amet, consetetur s\nipscing elit\n,  sed diam nonumy eittod tempor invidunt ut ': 'valid-element'
		}, function(val, state){
			$('#maxlength').val(val);
			if(val == $('#maxlength').val()){
				ok($('#maxlength').is(':'+state), val.length+' is '+state+' maxlength');
			}
		});
	}
	
	$('#maxlength').attr('maxlength', 30);
	
	$.each({
		'Lorem ipsum dolor sit amet, con': 'invalid-element', 
		'Lorem ipsum dolor sit amet, co': 'valid-element'
	}, function(val, state){
		
		$('#maxlength').val(val);
		if (val == $('#maxlength').val()) {
			ok($('#maxlength').is(':' + state), val.length + ' is ' + state + ' maxlength');
		}
	});
		
	
	//pattern
	$('#pattern').val('test');
	ok($('#pattern').is(':invalid-element'), 'test is invalid pattern');
	$('#pattern').val('1DHT');
	ok($('#pattern').is(':valid-element'), '1DHT is valid pattern');
	
	$.webshims.ready('forms ready', function(){
		start();
	});
});

asyncTest('validationMessage/setCustomValidity', function(){
	//select + customValidity
	ok($('#select').is(':valid-element'), 'select is valid');
	$('#select').setCustomValidity('has an error');
	ok($('#select').is(':invalid-element'), 'select is set invalid');
	ok($('#select').attr('validity').customError, 'select has customerror');
	equals($('#select').attr('validationMessage'), 'has an error', 'custom error message set');
	equals($('#select').attr('disabled', true).attr('validationMessage'), '', 'custom error message is empty, if control is disabled');
	$('#select').attr('disabled', false).setCustomValidity('');
	ok(( $('#select').is(':valid-element') && $('#select').attr('willValidate') ), 'select is set valid again');
	ok(!!($('input').filter(':invalid-element').attr('validationMessage')), 'validationMessage is a getter for all invalid elements');
	$.webshims.ready('forms ready', function(){
		start();
	});
});


asyncTest('output test', function(){
	QUnit.reset();
	
	equals($('foobar').attr('value'), 'jo da foobar', 'same props on multiple unknwon elements work right');
	equals($('foobarbaz').attr('value'), undefined, "unknown extension don't pollute other unknowns");
	
	equals($('output').attr('value'), 'jo', 'first output has initial value');
	$('output:first').attr('value', 'hello');
	equals($('output').attr('value'), 'hello', 'first output has changed value');
	
	
	
	$('#labeled-output').attr('value', 'somecontent');
	if( !omitTests.output ){
		equals($('output:first').text(), 'hello', 'shim shows value');
		ok(/&outputtest=somecontent&/.test($('form').serialize()), 'finds output serialized in shim');
	}
	$('#rangeId').attr('value', 30);
	$.webshims.triggerInlineForm($('input.oninput-test')[0], 'input');
	equals(window.globalInput, '30:30', 'globalInput value was set on trigger');
	
	
	
	$.webshims.ready('forms ready', function(){
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
	ok(!$('#form-1').checkValidity(), 'validity is false for form-element (form)');
	equals(invalids, 5, 'there were 5 invalid events (form)');
		
	$.webshims.ready('forms ready', function(){
		start();
	});
});
asyncTest('checkValidity/invalid event II', function(){
	QUnit.reset();
	var invalids = 0;
	$('#form-1').bind('invalid', function(){
		invalids++;
	});
	
	ok(!$('#form-1 fieldset.check').checkValidity(), 'validity is false for fieldset-element (fieldset)');
	equals(invalids, 5, 'there were 5 invalid events (fieldset)');
	
	
	$.webshims.ready('forms ready', function(){
		setTimeout(start, 0);
	});
});

asyncTest('checkValidity/invalid event III', function(){
	QUnit.reset();
	var invalids = 0;
	$('#form-1').bind('invalid', function(){
		invalids++;
	});
	
	ok(!$('#name').checkValidity(), 'validity is false for #name (element)');
	equals(invalids, 1, 'there was 1 invalid event (element)');
		
	$.webshims.ready('forms ready', function(){
		setTimeout(start, 16);
	});
});


asyncTest('checkValidity/invalid event IV', function(){
	QUnit.reset();
	var invalids = 0;
	$('#form-1').bind('invalid', function(e){
		invalids++;
	});
	
	
	$.each([
		{
			id: '#name',
			val: 'some name'
		},
		{
			id: '#email',
			val: 'some@name.com'
		},
		{
			id: '#email',
			val: 'some@name.com'
		},
		{
			id: '#field6-1'
		}
	], function(i, data){
		if(data.val){
			$(data.id).attr('value', data.val);
		} else {
			$(data.id).attr('checked', true);
		}
	});
	ok($('#form-1').checkValidity(), 'validity is true for form-element');
	equals(invalids, 0, 'there were 0 invalid events');
	
	$.webshims.ready('forms ready', function(){
		setTimeout(start, 32);
	});
});


})(jQuery);