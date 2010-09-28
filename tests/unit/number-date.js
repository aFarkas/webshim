module("numeric/date types: validity");
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


asyncTest('step number/date module specific validity', function(){
	
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
				value: '2010-10-31'
			},
			trueState: 'valid'
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
	
	
	$.webshims.readyModules('forms ready', function(){
		start();
	});
	
});


asyncTest('valueAsDate/valueAsNumber', function(){
	
	//getting valueAsNumber
	$.each([
		{
			id: 'number',
			value: '34',
			result: 34
		},
		{
			id: 'number',
			value: '34.56',
			result: 34.56
		},
		{
			id: 'number',
			value: '1e2',
			result: 100
		},
		{
			id: 'number',
			value: '1d2'
		},
		{
			id: 'date',
			value: '1999-12-12',
			result: 944956800000
		},
		{
			id: 'date',
			value: '1899-12-12',
			result: -2210716800000
		},
		{
			id: 'date',
			value: '1899-12-32'
		},
		{
			id: 'date',
			value: '1899-12-12-'
		},
		{
			id: 'date',
			value: '2010-12-31',
			result: 1293753600000
		},
		{
			id: 'datetime-local',
			value: '2010-12-31T23:59',
			result: 1293839940000
		},
		{
			id: 'datetime-local',
			value: '2010-12-31T00:00',
			result: 1293753600000
		},
		{
			id: 'datetime-local',
			value: '2010-12-31T02:00',
			result: 1293760800000
		},
		{
			id: 'datetime-local',
			value: '2010-12-31B2:00'
		},
		{
			id: 'time',
			value: '13:00',
			result: 46800000
		},
		{
			id: 'time',
			value: '13:45',
			result: 49500000
		},
		{
			id: 'time',
			value: '13:45:30',
			result: 49530000
		},
		{
			id: 'time',
			value: '13:30:30.5',
			result: 48630500
		},
		{
			id: 'time',
			value: '13:30:30,5'
		}
	], function(i, data){
		var elem = $('#'+data.id);
		elem.attr('value', data.value);
		if($.support.validity ===  true && data.value != elem.attr('value')){
			return;
		}
		if(data.result === undefined){
			var asVal = elem.attr('valueAsNumber');
			ok(isNaN(asVal), data.value+' is as number NaN, element: '+ data.id+ ', was: '+ asVal +', type: '+ (typeof asVal));
		} else {
			ok(elem.attr('valueAsNumber') === data.result, data.value+' is AsNumber: '+ data.result +', element: '+ data.id+ ', was: '+ elem.attr('valueAsNumber'));
		}
	});
	
	
	//setting valueAsNumber
	$.each([
		{
			id: 'time',
			result: '13:30:30.5',
			value: 48630500
		},
		{
			id: 'datetime-local',
			result: '2010-12-31T00:00',
			value: 1293753600000
		},
		{
			id: 'date',
			result: '2010-12-31',
			value: 1293753600000
		}
	], function(i, data){
		var elem = $('#'+data.id);
		elem.attr('valueAsNumber', data.value);
		
		if($.support.validity ===  true && data.value != elem.attr('valueAsNumber')){
			return;
		}
		var val = elem.attr('value');
		ok(function(){
			if(data.id == 'time' || data.id == 'datetime-local'){
				if(val && val.indexOf('.') !== -1 && data.result.length < val.length){
					var lenDif = val.length - data.result.length;
					while(lenDif--){
						data.result += '0';
					}
				}
			} 
			return (val === data.result);
		}(), data.value+' is as value: '+ data.result +', element: '+ data.id+ ', was: '+ val);
	});
	
	//setting valueAsDate (webkit orientated, not sure these test are right)
	$.each([
		{
			id: 'date',
			value: function(){
				return new Date(2010, 11, 31, 0, 0);
			},
			resultVal: '2010-12-30',
			resultNumber: 1293667200000
		},
		{
			id: 'date',
			value: function(){
				return new Date(1999, 0, 1, 0, 0);
			},
			resultVal: '1998-12-31',
			resultNumber: 915062400000
		},
		{
			id: 'date',
			value: function(){
				return new Date(1999, 0, 1, 10, 10);
			},
			resultVal: '1999-01-01',
			resultNumber: 915148800000
		},
		{
			id: 'date',
			value: function(){
				return null;
			},
			resultVal: ''
		},
		{
			id: 'date',
			value: function(){
				var date = new Date();
				date.setUTCDate(31);
				date.setUTCMonth(11);
				date.setUTCFullYear(2010);
				return date;
			},
			resultVal: '2010-12-01',
			resultNumber: 1291161600000
		},
		{
			id: 'date',
			value: function(){
				var date = new Date();
				date.setUTCDate(1);
				date.setUTCMonth(0);
				date.setUTCFullYear(1999);
				return date;
			},
			resultVal: '1999-01-01',
			resultNumber: 915148800000
		},
		{
			id: 'time',
			value: function(){
				return new Date(1999, 0, 1, 20, 30);
			},
			resultVal: '19:30',
			resultNumber: 70200000
		},
		{
			id: 'time',
			value: function(){
				var date = new Date(1999, 0, 1, 20, 30);
				date.setSeconds(1);
				return date;
			},
			resultVal: '19:30:01',
			resultNumber: 70201000
		}
	], function(i, data){
		var elem = $('#'+data.id);
		elem.attr('valueAsDate', data.value());
		
		ok(elem.attr('value') === data.resultVal,'expected val: '+ data.resultVal +', element: '+ data.id+ ', was: '+ elem.attr('value'));
		if(data.resultNumber === undefined){
			ok(isNaN(elem.attr('valueAsNumber')), ' expected number: NaN, element: '+ data.id+ ', was: '+ elem.attr('valueAsNumber'));
		} else {
			ok(elem.attr('valueAsNumber') === data.resultNumber, ' expected number: '+ data.resultNumber +', element: '+ data.id+ ', was: '+ elem.attr('valueAsNumber'));
		}
	});
	
	$.webshims.readyModules('forms ready', function(){
		start();
	});
});
