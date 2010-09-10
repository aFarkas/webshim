(function($){
	
	
	
	if(!$.fn.slider || !$.fn.datepicker){
		$.htmlExt.loader.loadScript('http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.4/jquery-ui.min.js', false, 'jquery-ui');
	}
	
	var replace = function(context){
		$('input', context).each(function(){
			
		});
	};
	$.htmlExt.addReady(function(context){
		if ($.fn.slider && $.fn.datepicker) {
			replace(context);
		} else {
			$(document).one('jquery-uiReady', function(){
				replace(context);
			});
		}
	});
})(jQuery);
