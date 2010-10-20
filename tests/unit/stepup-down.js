module("stepup");

var stepTest = function(obj){
	var elem 	= $('#'+obj.id),
		attrs 	= [],
		validity
	;
	$.each(['min', 'max', 'step'], function(i, attr){
		elem.removeAttr(attr);
	});
	
	elem.attr(obj.attrs);	
	elem.attr('value', $.webshims.modules['number-date-type'].getNextStep(elem[0], obj.step));
	equals( elem.attr('valueAsNumber'), obj.value, 'step:'+ obj.step +' after: '+ JSON.stringify(obj.attrs) );
	
	
};

asyncTest("stepup", function(){
	if($.webshims.modules['number-date-type'].getNextStep){
		$.each([
			{
				id: 'number',
				attrs: {
					'value': '2',
					min: 2
				},
				step: 1,
				value: 3
				
			},
			{
				id: 'number',
				attrs: {
					'value': '1'
				},
				step: -1,
				value: 0
				
			}
		], function(i, testItem){
			stepTest(testItem);
		})
	}
	
	
	$.webshims.ready('ready forms-ext', function(){
		start();
	});
});