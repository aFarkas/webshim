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
	form1.find('#name').removeAttr('name');
	equals( $('#form-1 input:willValidate').length, total - 1, 'willValidate: false without name' );
	form1.find('#name').attr('name', 'name');
	//invalid
	var invalid = $('input, textarea, select', form1).filter(':invalid');
	equals( invalid.length, 5, 'total invalid' );
	
	equals( invalid.filter('[type=radio]').length, 3, 'radio invalid' );
	invalid.filter('[type=radio]:last').attr('checked', true);
	equals( invalid.filter('[type=radio]:invalid').length, 0, 'radio changed valid' );
	invalid.filter('[type=radio]:last').attr('checked', false);
	
	equals(form1.find('#name').is(':invalid'), true, 'name is invalid');
	form1.find('#name').attr('required', false);
	equals(form1.find('#name').attr('required'), false, "name isn't required");
	equals(form1.find('#name').is(':invalid'), false, 'name is valid');
	form1.find('#name').attr('required', true);
		
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
	
	
	$.each({
		'info@c-t.de': 'valid', 
		'INFO@CTE.DE': 'valid', 
		'info@c-t.museum': 'valid',
		'info@c123t.museum': 'valid',
		'info@cät.de': 'valid',
		'info@3com.com': 'valid',
		'in-f+a{t$o@cpt.de': 'valid',
		'"in@fo"@3com.com': 'valid',
		'in\@fo@3com.com': 'valid',
		'in@fo@3com.com': 'invalid',
		'info.de': 'invalid'
		//we are too lax, but better too lax, then too strict :-)
//		,'info@des': 'invalid',
//		'info@des.ä': 'invalid'
	}, function(val, state){
		$('#email').val(val);
		ok($('#email').is(':'+state), val+' is '+state+' mail');
	});
	
	$.webshims.readyModules('forms ready', function(){
		start();
	});
});

asyncTest('email, url, pattern, maxlength', function(){
	$.each({
		'http://bla.de': 'valid', 
		'http://www.bla.de': 'valid', 
		'http://www.bla.museum': 'valid',
		'https://www.bla.museum:800': 'valid',
		'https://www.bla.museum:800/': 'valid',
		'https://www.bla.co.uk:800/': 'valid',
		'https://www.3blä.de:800': 'valid',
		'ftp://www.3blä.de:800': 'valid',
		//ok, almost everything is valid here
		'htstp//dff': 'invalid'
	}, function(val, state){
		$('#url').val(val);
		ok($('#url').is(':'+state), val+' is '+state+' url');
	});
	
	
	//maxlength
	$.each({
		'Lorem ipsum dolor sit amet, consetetur sadipscing elitr,  sed diam nonumy eirmod tempor invidunt ut labore et dolore mag': 'invalid', 
		'Lorem ipsum dolor sit amet, consetetur sadipscing elitr,  sed diam nonumy eirmod tempor invidunt ut ': 'valid',
		'Lorem ipsum dolor sit amet, consetetur sadipscing elitr\n,  sed diam nonumy eirmod tempor invidunt u': 'valid',
		'Lorem ipsum d\tor s\t amet, c\nsetetur sadipscing elitr\n,  sed ddm nonumdeirmod tempor invidunt u': 'valid',
		'Lorem ipsum ddddor sddd amet, c\nsetetur sadipscing elitr\n,  sed dddm nonumddeirmod tempor invidunt ut': 'invalid', 
		'Lorem ittum dolor sit amet, consetetur s\nipscing elit\n,  sed diam nonumy eittod tempor invidunt ut ': 'invalid'
	}, function(val, state){
		$('#maxlength').val(val);
		ok($('#maxlength').is(':'+state), val.length+' is '+state+' maxlength');
	});
	
	$('#maxlength').attr('maxlength', 30);
	
	$.each({
		'Lorem ipsum dolor sit amet, con': 'invalid', 
		'Lorem ipsum dolor sit amet, co': 'valid'
	}, function(val, state){
		$('#maxlength').val(val);
		ok($('#maxlength').is(':'+state), val.length+' is '+state+' maxlength');
	});
		
	
	//pattern
	$('#pattern').val('test');
	ok($('#pattern').is(':invalid'), 'test is invalid pattern');
	$('#pattern').val('1DHT');
	ok($('#pattern').is(':valid'), '1DHT is valid pattern');
	
	$.webshims.readyModules('forms ready', function(){
		start();
	});
});

asyncTest('validationMessage/setCustomValidity', function(){
	//select + customValidity
	ok($('#select').is(':valid'), 'select is valid');
	$('#select').setCustomValidity('has an error');
	ok($('#select').is(':invalid'), 'select is set valid');
	
	ok($('#select').attr('validity').customError, 'select has customerror');
	equals($('#select').attr('validationMessage'), 'has an error', 'custom error message set');
	equals($('#select').attr('disabled', true).attr('validationMessage'), '', 'custom error message is empty, if control is disabled');
	$('#select').attr('disabled', false).setCustomValidity('');
	ok(( $('#select').is(':valid') && $('#select').attr('willValidate') ), 'select is set valid again');
	
	$.webshims.readyModules('forms ready', function(){
		start();
	});
});

asyncTest('checkValidity/invalid event', function(){
	QUnit.reset();
	var invalids = 0;
	$('#form-1').bind('invalid', function(){
		invalids++;
	});
	ok(!$('#form-1').checkValidity(), 'validity is false for form-element (form)');
	equals(invalids, 5, 'there were 5 invalid events (form)');
	
	invalids = 0;
	ok(!$('#form-1 fieldset.check').checkValidity(), 'validity is false for fieldset-element (fieldset)');
	equals(invalids, 5, 'there were 5 invalid events (fieldset)');
	
	invalids = 0;
	ok(!$('#name').checkValidity(), 'validity is false for #name (element)');
	equals(invalids, 1, 'there was 1 invalid event (element)');
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
	invalids = 0;
	ok($('#form-1').checkValidity(), 'validity is true for form-element');
	equals(invalids, 0, 'there were 0 invalid events');
	
	$.webshims.readyModules('forms ready', function(){
		start();
	});
});
