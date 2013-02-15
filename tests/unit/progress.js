(function($){
	
module("progress bar");

asyncTest("progress", function(){
	QUnit.reset();
	
	$.webshims.ready('forms-ext DOM', function(){
		start();
	});
});

})(jQuery);
