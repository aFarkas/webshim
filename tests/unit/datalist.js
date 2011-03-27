(function($){
	

module("datalist");
asyncTest("datalist", function(){
	var options = $('datalist').attr('options');
	var options2 = $('#dlist option');
	
	equals(options.length, options.length, 'datalist options-attr has same length as option-element');
	
	strictEqual(options[0], options[0], 'datalist first options-attr equals first option-element');
	
	if(!Modernizr.datalist){
		var shadowListItems = $('div.datalist-polyfill li');
		$.each(['yes aßäöâ', 'yes "2"', "yes '3'"], function(i, val){
			equals(val, $.attr(shadowListItems[i], 'data-value'), 'shadow datalistitems value equals options value');
		});
	}
	
	
	
	$.webshims.ready('DOM forms', function(){
		start();
	});
});


})(jQuery);