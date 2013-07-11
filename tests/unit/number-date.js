(function($){

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
		elem.val(obj.value);
		validity = elem.prop('validity');
		
		$.each(obj.attrs, function(name, val){
			attrs.push(name+': "'+val+'"');
		});
		
		attrs = attrs.join(', ');
		attrs = ' and value: '+ obj.value;
		if(!$.isArray(obj.trueState)){
			obj.trueState = [obj.trueState];
		}
		
		//abort test in some cases
		//todo make all test work also with value sanitation
		if( Modernizr.formvalidation === true && obj.trueState[0] !== 'valid' && elem.val() != obj.attrs.value ){
			return;
		}
		$.each(obj.trueState, function(i, trueState){
			if(trueState == 'typeMismatch' || trueState == 'badInput'){
				ok(validity.typeMismatch || validity.badInput, 'typeMismatch/badInput is true for '+id+', '+ attrs);
			} else {
				ok(validity[trueState], trueState+' is true for '+id+', '+ attrs);
			}
			//these are conditional extra tests
			if(trueState !== 'valid'){
				if(validity.valid){
					ok(!validity.valid, id+' is invalid for, '+ attrs);
				}
			} else {
				$.each(validity, function(name, val){
					if(name !== 'valid' && val){
						ok(!val, 'validity.'+ name +' is false for '+id+', '+ attrs);
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
				step: '',
				min: ''
			},
			value: '523',
			trueState: 'valid'
		},
		{
			attrs: {
				value: '5ed',
				step: '',
				min: ''
			},
			value: '5ed',
			trueState: 'typeMismatch'
		},
		{
			attrs: {
				step: '',
				min: ''
			},
			value: '5.5',
			trueState: 'stepMismatch'
		},
		{
			attrs: {
				step: '0.5',
				min: ''
			},
			value: '5.5',
			trueState: 'valid'
		},
		{
			attrs: {
				step: '0.6',
				min: '4.3'
			},
			value: '5.5',
			trueState: 'valid'
		},
		{
			attrs: {
				step: '0.6e',
				min: '4.3'
			},
			value: '5.5',
			trueState: 'stepMismatch'
		},
		{
			attrs: {
				step: '0.6',
				min: '4.3e'
			},
			value: '5.5',
			trueState: 'stepMismatch'
		},
		{
			attrs: {
				step: '0.5',
				min: '4'
			},
			value: '5.5',
			trueState: 'valid'
		},
		{
			attrs: {
				step: 'any',
				min: '4',
				max: ''
			},
			value: '5.55556',
			trueState: 'valid'
		},
		{
			attrs: {
				min: '6'
			},
			value: '5',
			trueState: 'rangeUnderflow'
		},
		{
			attrs: {
				max: '6'
			},
			value: '8',
			trueState: 'rangeOverflow'
		},
		{
			attrs: {
				min: '5'
			},
			value: '5',
			trueState: 'valid'
		},
		{
			attrs: {
				max: '6'
			},
			value: '6',
			trueState: 'valid'
		},
		{
			attrs: {
				max: '6',
				min: ''
			},
			value: '-8',
			trueState: 'valid'
		},
		{
			attrs: {
				max: '6e'
			},
			value: '8',
			trueState: 'valid'
		},
		{
			attrs: {
				max: '8',
				min: 8
			},
			value: '8',
			trueState: 'valid'
		},
		{
			attrs: {},
			value: '8e2',
			trueState: 'valid'
		},
		{
			attrs: {
				min: '9e2'
			},
			value: '8e2',
			trueState: 'rangeUnderflow'
		}
		
	], createTestMethodA('number'));
	
	if(!omitTests.numericDateProps){
		$.each([
			{
				attrs: {
					step: '0.005',
					min: '4'
				},
				value: '5.005',
				trueState: 'valid'
			},
			{
				attrs: {
					step: '0.0005',
					min: '4'
				},
				value: '5.55556',
				trueState: 'stepMismatch'
			},
			{
				attrs: {
					step: '-0.5',
					min: '4'
				},
				value: '5.5',
				trueState: 'stepMismatch'
			}
		], createTestMethodA('number'));
	}
	
	$.each([
		{
			attrs: {},
			value: '1988-12-11',
			trueState: 'valid'
		},
		{
			attrs: {},
			value: '1988-12-11-',
			trueState: 'typeMismatch'
		},
		{
			attrs: {},
			value: '2010-10-31',
			trueState: 'valid'
		},
		{
			attrs: {},
			value: '1888-12-11',
			trueState: 'valid'
		},
		{
			attrs: {},
			value: '1988-12-61',
			trueState: 'typeMismatch'
		},
		{
			attrs: {},
			value: '2010-09-30',
			trueState: 'valid'
		},
		{
			attrs: {},
			value: '2010-09-31',
			trueState: 'typeMismatch'
		},
		{
			attrs: {
				max: '2010-09-31'
			},
			value: '2010-10-02',
			trueState: 'valid'
		},
		{
			attrs: {
				max: '2010-09-02'
			},
			value: '2010-09-02',
			trueState: 'valid'
		},
		{
			attrs: {
				min: '2010-09-02',
				value: '2010-09-02'
			},
			trueState: 'valid'
		},
		{
			attrs: {
				min: '2010-09-13'
			},
			value: '2010-09-12',
			trueState: 'rangeUnderflow'
		},
		{
			attrs: {
				max: '2010-08-12'
			},
			value: '2010-09-12',
			trueState: 'rangeOverflow'
		},
		{
			attrs: {
				max: '2010-09-11',
				min: '2010-09-11'
			},
			value: '2010-09-12',
			trueState: 'rangeOverflow'
		},
		{
			attrs: {
				max: '2010-10-12',
				min: '2010-09-11'
			},
			value: '2010-09-12',
			trueState: 'valid'
		}
	],
	createTestMethodA('date'));
	
	if(!omitTests.numericDateProps){
		$.each([
			{
				attrs: {},
				value: '1488-12-11',
				trueState: 'valid'
			}
		], createTestMethodA('date'));
	}

	$.each([
		{
			attrs: {},
			value: '20:30',
			trueState: 'valid'
		},
		{
			attrs: {
				step: 'any'
			},
			value: '20:30:03',
			trueState: 'valid'
		},
		{
			attrs: {
				step: 'any'
			},
			value: '20:30:03.500',
			trueState: 'valid'
		},
		{
			attrs: {},
			value: '24:30',
			trueState: 'typeMismatch'
		},
		{
			attrs: {
				
			},
			value: '23:30:40',
			trueState: 'stepMismatch'
		},
		{
			attrs: {
				step: '10'
			},
			value: '23:30:40',
			trueState: 'valid'
		},
		{
			attrs: {
				step: '300'
			},
			value: '23:35',
			trueState: 'valid'
		},
		{
			attrs: {
				step: '300'
			},
			value: '23:36',
			trueState: 'stepMismatch'
		},
		{
			attrs: {
				min: '02:20'
			},
			value: '01:30',
			trueState: 'rangeUnderflow'
		},
		{
			attrs: {
				min: '01:20'
			},
			value: '01:30',
			trueState: 'valid'
		},
		{
			attrs: {
				max: '18:20'
			},
			value: '20:30',
			trueState: 'rangeOverflow'
		},
		{
			attrs: {
				max: '20:30'
			},
			value: '20:30',
			trueState: 'valid'
		}
	],
	createTestMethodA('time'));
	
//	$.each([
//		{
//			attrs: {
//				
//			},
//			value: '1999-12-09T20:30',
//			trueState: 'valid'
//		},
//		{
//			attrs: {
//				
//			},
//			value: '1999-12-09T20|30',
//			trueState: 'typeMismatch'
//		},
//		{
//			attrs: {
//				
//			},
//			value: '1999-12-09T20:0',
//			trueState: 'typeMismatch'
//		},
//		{
//			attrs: {
//				
//			},
//			value: '1999-12-09T20:1',
//			trueState: 'typeMismatch'
//		},
//		{
//			attrs: {
//				
//			},
//			value: '1939-12-09T20:10:01',
//			trueState: 'stepMismatch'
//		},
//		{
//			attrs: {
//				step: 1
//			},
//			value: '1999-12-09T20:10:01',
//			trueState: 'valid'
//		},
//		{
//			attrs: {
//				step: 120
//			},
//			value: '1999-12-09T20:12',
//			trueState: 'valid'
//		},
//		{
//			attrs: {
//				step: '',
//				min: '1999-12-09T20:11'
//			},
//			value: '1999-12-09T20:10',
//			trueState: 'rangeUnderflow'
//		},
//		{
//			attrs: {
//				min: '1999-12-09T20:10'
//			},
//			value: '1999-12-09T20:10',
//			trueState: 'valid'
//		},
//		{
//			attrs: {
//				max: '1999-12-09T20:10'
//			},
//			value: '1999-12-09T20:10',
//			trueState: 'valid'
//		},
//		{
//			attrs: {
//				step: '',
//				min: '1999-12-09T20:11',
//				max: '1999-12-09T20:09'
//			},
//			value: '1999-12-09T20:10',
//			trueState: ['rangeUnderflow', 'rangeOverflow']
//		},
//		{
//			attrs: {
//				step: '',
//				min: '1999-12-09T20:11T',
//				max: '1999-12-09T20:09:'
//			},
//			value: '1999-12-09T20:10',
//			trueState: 'valid'
//		}
//	], createTestMethodA('datetime-local'));
//	
//	if(!omitTests.numericDateProps){
//		$.each([
//			{
//				attrs: {
//					step: 120
//				},
//				value: '1999-12-09T20:11',
//				trueState: 'stepMismatch'
//			}
//		], createTestMethodA('datetime-local'));
//	}
	
	
	
	$.webshims.ready('forms DOM', function(){
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
			id: 'date',
			value: '1999-12-12',
			result: 944956800000
		},
		{
			id: 'date',
			value: '1899-12-12',
			result: -2210716800000
		},
//		,{
//			id: 'datetime-local',
//			value: '2010-12-31T23:59',
//			result: 1293839940000
//		},
//		{
//			id: 'datetime-local',
//			value: '2010-12-31T02:00',
//			result: 1293760800000
//		},
		
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
		}
	], function(i, data){
		var elem = $('#'+data.id);
		elem.prop('value', data.value);
		
		if(data.result === undefined){
			var asVal = elem.prop('valueAsNumber');
			ok(isNaN(asVal), data.value+' is as number NaN, element: '+ data.id+ ', was: '+ asVal +', type: '+ (typeof asVal));
		} else {
			ok(elem.prop('valueAsNumber') === data.result, data.value+' is AsNumber: '+ data.result +', element: '+ data.id+ ', was: '+ elem.prop('valueAsNumber'));
		}
	});
	
	if(!omitTests.numericDateProps){
		$.each([
//			{
//				id: 'datetime-local',
//				value: '2010-12-31T00:00',
//				result: 1293753600000
//			},
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
//			,{
//				id: 'number',
//				value: '1d2'
//			},
//			{
//				id: 'datetime-local',
//				value: '2010-12-31B2:00'
//			},
			{
				id: 'time',
				value: '13:30:30,5'
			}
		], function(i, data){
			var elem = $('#'+data.id);
			elem.prop('value', data.value);
			if(Modernizr.formvalidation ===  true && data.value != elem.prop('value')){
				return;
			}
			if(data.result === undefined){
				var asVal = elem.prop('valueAsNumber');
				ok(isNaN(asVal), data.value+' is as number NaN, element: '+ data.id+ ', was: '+ asVal +', type: '+ (typeof asVal));
			} else {
				ok(elem.prop('valueAsNumber') === data.result, data.value+' is AsNumber: '+ data.result +', element: '+ data.id+ ', was: '+ elem.prop('valueAsNumber'));
			}
		});
	}
	
	
	//setting valueAsNumber
	$.each([
			{
				id: 'time',
				result: '13:30:30',
				value: 48630000
			}, 
			{
				id: 'date',
				result: '2010-12-31',
				value: 1293753600000
			}
		], 
		function(i, data){
			var elem = $('#' + data.id);
			elem.prop('value', '');
			elem.prop('valueAsNumber', data.value);
			
//			if (Modernizr.formvalidation === true && data.value != elem.prop('valueAsNumber')) {
//				return;
//			}
			var val = elem.prop('value');
			ok(function(){
				if (data.id == 'time' || data.id == 'datetime-local') {
					if (val && val.indexOf('.') !== -1 && data.result.length < val.length) {
						var lenDif = val.length - data.result.length;
						while (lenDif--) {
							data.result += '0';
						}
					}
				}
				return (val === data.result);
			}(), data.value + ' is as value: ' + data.result + ', element: ' + data.id + ', was: ' + val);
		}
	);
		
//	if(!omitTests.numericDateProps){
//		$.each([
//		 {
//			id: 'datetime-local',
//			result: '2010-12-31T00:00',
//			value: 1293753600000
//		}], 
//		function(i, data){
//			var elem = $('#' + data.id);
//			elem.prop('valueAsNumber', data.value);
//			
//			
//			var val = elem.prop('value');
//			ok(function(){
//				if (data.id == 'time' || data.id == 'datetime-local') {
//					if (val && val.indexOf('.') !== -1 && data.result.length < val.length) {
//						var lenDif = val.length - data.result.length;
//						while (lenDif--) {
//							data.result += '0';
//						}
//					}
//				}
//				return (val === data.result);
//			}(), data.value + ' is as value: ' + data.result + ', element: ' + data.id + ', was: ' + val);
//		});
//	}
	
	//setting valueAsDate (webkit orientated, not sure these test are right + time has a bug in different time zone)
	$.each([{
		id: 'date',
		value: function(){
			return new Date(2010, 11, 31, 0, 0);
		},
		resultVal: '2010-12-30',
		resultNumber: 1293667200000
	}, {
		id: 'date',
		value: function(){
			return new Date(1999, 0, 1, 0, 0);
		},
		resultVal: '1998-12-31',
		resultNumber: 915062400000
	}, {
		id: 'date',
		value: function(){
			return new Date(1999, 0, 1, 10, 10);
		},
		resultVal: '1999-01-01',
		resultNumber: 915148800000
	}, {
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
	}
	,{
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
		var elem = $('#' + data.id);
		elem.prop('valueAsDate', data.value());
		
		ok(elem.prop('value') === data.resultVal, 'expected val: ' + data.resultVal + ', element: ' + data.id + ', was: ' + elem.prop('value'));
		if (data.resultNumber === undefined) {
			ok(isNaN(elem.prop('valueAsNumber')), ' expected number: NaN, element: ' + data.id + ', was: ' + elem.prop('valueAsNumber'));
		}
		else {
			ok(elem.prop('valueAsNumber') === data.resultNumber, ' expected number: ' + data.resultNumber + ', element: ' + data.id + ', was: ' + elem.prop('valueAsNumber'));
		}
	});
	
	//getting valueAsDate
	$.each([
		{
			id: 'time',
			val: '',
			result: null,
			strict: true 
		},
		{
			id: 'time',
			val: '19:30',
			result: 70200000 
		}
//		,{
//			id: 'datetime-local',
//			value: '',
//			result: null
//		},
//		{
//			id: 'datetime-local',
//			value: '2010-12-31T23:59',
//			result: null
//		}
	], function(i, data){
		var elem = $('#' + data.id);
		elem.prop('value', data.val);
		if(data.result === null){
			if(data.strict){
				strictEqual(data.result, elem.prop('valueAsDate'), 'empty value is null '+data.id);
			} else {
				equal(data.result, elem.prop('valueAsDate'), 'empty value is null/undefined '+data.id);
			}
		} else {
			equal(data.result, elem.prop('valueAsDate').getTime(), 'get valueAsDate on '+data.id);
		}
	});
	
	$.webshims.ready('forms DOM', function(){
		start();
	});
});


})(jQuery);
