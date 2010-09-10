module("validity");

//testMethodA tests the validity-property for all input-types with number properties i.e.: number, range, date, time etc.
var createTestMethodA = function(id){
	return function(i, obj){
		var elem 	= $('#'+id),
			attrs 	= [],
			validity
		;
		$.each(['min', 'max', 'step'], function(i, attr){
			elem.removeAttr(attr);
		});
		
		elem.attr(obj.attrs);
		validity = elem.attr('validity');
		
		$.each(obj.attrs, function(name, val){
			attrs.push(name+': "'+val+'"');
		});
		
		attrs = attrs.join(', ');
		if(!$.isArray(obj.trueState)){
			obj.trueState = [obj.trueState];
		}
		
		//abort test in some cases
		//todo make all test work also with value sanitation
		if( $.support.validity === true && obj.trueState[0] !== 'valid' && elem.val() != obj.attrs.value ){
			return;
		}
		$.each(obj.trueState, function(i, trueState){
			ok(validity[trueState], trueState+' is true for '+id+', '+ attrs);
			//these are conditional extra tests
			if(trueState !== 'valid'){
				if(validity.valid){
					ok(!validity.valid, id+' is invalid for, '+ attrs);
				}
			} else {
				$.each(validity, function(name, val){
					if(name !== 'valid' && val){
						ok(!val, 'validity.'+ name +' is true for '+id+', '+ attrs);
					}
				});
			}
			if(!validity[trueState] && window.console && console.log){
				console.log(validity, elem[0], elem.val());
			}
		});
	};
};

asyncTest("validity Modul", function(){
	
	QUnit.reset();
	
	var form1 = $('#form-1');
	
	ok($('html').hasClass('validity-ready'), 'html-class');
	
	/*
	 * novalidate
	 */
	//novalidate getter
	equals( form1.attr('novalidate'), false, 'novalidate is false' );
	equals($('#form-2').attr('novalidate'), true, 'novalidate is true' );
	
	//novalidate setter
	form1.attr('novalidate', true);
	equals( form1.attr('novalidate'), true, 'novalidate is set to true' );
	form1.attr('novalidate', false);
	equals( form1.attr('novalidate'), false, 'novalidate is set to false' );
	
	
	
	equals(form1.find('#name').attr('required'), true, 'name is required');
	
	//willValidate
	var willValidate = $('#form-1 input:willValidate'),
		total = willValidate.length
	;
	
	willValidate.filter(':eq(2)').attr('disabled', true);
	equals( $('#form-1 input:willValidate').length, total - 1, 'willValidate disabled' );
	willValidate.filter(':eq(2)').attr('disabled', false);
	
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
	
	
	
	$.each([
		{
			attrs: {
				value: '523',
				step: '',
				min: ''
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '5ed',
				step: '',
				min: ''
			},
			trueState: 'typeMismatch'
		},
		{
			attrs: {
				value: '5.5',
				step: '',
				min: ''
			},
			trueState: 'stepMismatch'
		},
		{
			attrs: {
				value: '5.5',
				step: '0.5',
				min: ''
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '5.5',
				step: '0.6',
				min: '4.3'
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '5.5',
				step: '0.6e',
				min: '4.3'
			},
			trueState: 'stepMismatch'
		},
		{
			attrs: {
				value: '5.5',
				step: '0.6',
				min: '4.3e'
			},
			trueState: 'stepMismatch'
		},
		{
			attrs: {
				value: '5.5',
				step: '-0.5',
				min: '4'
			},
			trueState: 'stepMismatch'
		},
		{
			attrs: {
				value: '5.5',
				step: '0.5',
				min: '4'
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '5.55556',
				step: '0.0005',
				min: '4'
			},
			trueState: 'stepMismatch'
		},
		{
			attrs: {
				value: '5.005',
				step: '0.005',
				min: '4'
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '5.55556',
				step: 'any',
				min: '4',
				max: ''
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '5',
				min: '6'
			},
			trueState: 'rangeUnderflow'
		},
		{
			attrs: {
				value: '8',
				max: '6'
			},
			trueState: 'rangeOverflow'
		},
		{
			attrs: {
				value: '-8',
				max: '6',
				min: ''
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '8',
				max: '6e'
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '8',
				max: '8',
				min: 8
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '8e2'
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '8e2',
				min: '9e2'
			},
			trueState: 'rangeUnderflow'
		}
		
	], createTestMethodA('number'));
	
	$.each([
		{
			attrs: {
				value: '1988-12-11'
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '1988-12-11-'
			},
			trueState: 'typeMismatch'
		},
		{
			attrs: {
				value: '1488-12-11'
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '1888-12-11'
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '1988-12-61'
			},
			trueState: 'typeMismatch'
		},
		{
			attrs: {
				value: '2010-09-30'
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '2010-09-31'
			},
			trueState: 'typeMismatch'
		},
		{
			attrs: {
				max: '2010-09-31',
				value: '2010-10-02'
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '2010-09-12',
				min: '2010-09-13'
			},
			trueState: 'rangeUnderflow'
		},
		{
			attrs: {
				value: '2010-09-12',
				max: '2010-08-12'
			},
			trueState: 'rangeOverflow'
		},
		{
			attrs: {
				value: '2010-09-12',
				max: '2010-09-11',
				min: '2010-09-11'
			},
			trueState: 'rangeOverflow'
		},
		{
			attrs: {
				value: '2010-09-12',
				max: '2010-10-12',
				min: '2010-09-11'
			},
			trueState: 'valid'
		}
	],
	createTestMethodA('date'));
	
	$.each([
		{
			attrs: {
				value: '20:30'
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '20:30:03',
				step: 'any'
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '20:30:03.500',
				step: 'any'
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '24:30'
			},
			trueState: 'typeMismatch'
		},
		{
			attrs: {
				value: '23:30:40'
			},
			trueState: 'stepMismatch'
		},
		{
			attrs: {
				value: '23:30:40',
				step: '10'
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '23:35',
				step: '300'
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '23:36',
				step: '300'
			},
			trueState: 'stepMismatch'
		},
		{
			attrs: {
				value: '01:30',
				min: '02:20'
			},
			trueState: 'rangeUnderflow'
		},
		{
			attrs: {
				value: '20:30',
				max: '18:20'
			},
			trueState: 'rangeOverflow'
		}
	],
	createTestMethodA('time'));
	
	$.each([
		{
			attrs: {
				value: '1999-12-09T20:30'
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '1999-12-09T20|30'
			},
			trueState: 'typeMismatch'
		},
		{
			attrs: {
				value: '1999-12-09T20:0'
			},
			trueState: 'typeMismatch'
		},
		{
			attrs: {
				value: '1999-12-09T20:1'
			},
			trueState: 'typeMismatch'
		},
		{
			attrs: {
				value: '1939-12-09T20:10:01'
			},
			trueState: 'stepMismatch'
		},
		{
			attrs: {
				value: '1999-12-09T20:10:01',
				step: 1
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '1999-12-09T20:12',
				step: 120
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '1999-12-09T20:11',
				step: 120
			},
			trueState: 'stepMismatch'
		},
		{
			attrs: {
				value: '1999-12-09T20:10',
				step: '',
				min: '1999-12-09T20:11'
			},
			trueState: 'rangeUnderflow'
		},
		{
			attrs: {
				value: '1999-12-09T20:10',
				step: '',
				min: '1999-12-09T20:11',
				max: '1999-12-09T20:09'
			},
			trueState: ['rangeUnderflow', 'rangeOverflow']
		},
		{
			attrs: {
				value: '1999-12-09T20:10',
				step: '',
				min: '1999-12-09T20:11T',
				max: '1999-12-09T20:09:'
			},
			trueState: 'valid'
		}
	], createTestMethodA('datetime-local'));
	
	$.each([
		{
			attrs: {
				value: '4'
			},
			trueState: 'valid'
		},
		{
			attrs: {
				value: '144'
			},
			trueState: 'rangeOverflow'
		},
		{
			attrs: {
				value: '-10'
			},
			trueState: 'rangeUnderflow'
		}
	], 
	createTestMethodA('range'));
	
	
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
	
	//select + customValidity
	ok($('#select').is(':valid'), 'select is valid');
	$('#select').setCustomValidity('has an error');
	ok($('#select').is(':invalid'), 'select is set valid');
	
	ok($('#select').attr('validity').customError, 'select has customerror');
	equals($('#select').attr('validationMessage'), 'has an error', 'custom error message set');
	equals($('#select').attr('disabled', true).attr('validationMessage'), '', 'custom error message is empty, if control is disabled');
	$('#select').attr('disabled', false).setCustomValidity('');
	ok(( $('#select').is(':valid') && $('#select').attr('willValidate') ), 'select is set valid again');
	
	(function(){
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
		
	})();
	
	//valueAsNumber + valueAsDate
	//invalid event + manual testpage
});
$(document).bind('validityReady', function(){
	start();
});