(function($){
	
module("progress bar");

asyncTest("progress", function(){
	QUnit.reset();
	var progress = $('progress').eq(0);
	
	equals(progress.prop('position'), -1, "progress position");
	equals(progress.prop('max'), 1, "progress max");
	
	progress.prop('value', '0.5');
	strictEqual(progress.prop('position'), 0.5, "progress position");
	strictEqual(progress.prop('value'), 0.5, "progress prop value");
	strictEqual(progress.val(), 0.5, "progress val");
	if($.fn.finish) {
		strictEqual(progress.attr('value'), "0.5", "progress attr value");
	}
	progress.prop('max', '0.5');
	strictEqual(progress.prop('position'), 1, "progress position");
	strictEqual(progress.prop('value'), 0.5, "progress prop value");
	
	progress.removeAttr('value');
	equals(progress.prop('position'), -1, "progress position");
	strictEqual(progress.prop('value'), 0, "progress prop value");
	
	progress.prop('value', '1');
	strictEqual(progress.prop('position'), 1, "progress position");
	strictEqual(progress.prop('value'), 0.5, "progress prop value");
	if($.fn.finish){
		strictEqual(progress.attr('value'), "1", "progress attr value");
	}
	
	
//	progress.attr('value', 'dsadsa');
//	strictEqual(progress.prop('position'), -1, "progress position");
//	strictEqual(progress.prop('value'), 0, "progress prop value");
//	if($.fn.finish){
//		strictEqual(progress.attr('value'), "dsadsa", "progress attr value");
//	}
	
	
	$.webshims.ready('forms-ext DOM', start);
});

})(jQuery);
