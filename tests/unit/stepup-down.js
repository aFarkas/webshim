(function($){

module("stepup");

var stepTest = function(obj){
	var elem 	= $('#'+obj.id),
		attrs 	= [],
		validity
	;
	$.each(['min', 'max', 'step'], function(i, attr){
		elem.removeAttr(attr);
	});
	
	elem.prop(obj.attrs);	
	elem.prop('value', $.webshims.modules['forms-ext'].getNextStep(elem[0], obj.step));
	equals( elem.prop('valueAsNumber'), obj.value, 'step:'+ obj.step +' after: '+ JSON.stringify(obj.attrs) );
	
	
};

asyncTest("stepup", function(){
	if($.webshims.modules['forms-ext'].getNextStep){
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
				
			},
			{
				id: 'number',
				attrs: {
					'value': '1',
					step: '0.2'
				},
				step: 1,
				value: 1.2
			},
			{
				id: 'number',
				attrs: {
					'value': '0.8',
					step: '0.2'
				},
				step: -1,
				value: 0.6
			},
			{
				id: 'number',
				attrs: {
					'value': '0.6',
					step: '0.2'
				},
				step: -1,
				value: 0.4
			}
		], function(i, testItem){
			stepTest(testItem);
		});
	}
	
	
	$.webshims.ready('DOM forms-ext', function(){
		start();
	});
});


})(jQuery);