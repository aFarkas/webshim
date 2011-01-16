(function($){
	
//Todo test textarea + \n
module("input ui");

asyncTest("range Modul", function(){
	QUnit.reset();
	
	ok($('#range').attr('value') !== "", "range has always a value")
	
	$.webshims.ready('forms-ext DOM', function(){
		start();
	});
});

})(jQuery);
