(function($){
	if($.support.validity === true && ( $('<input type="datetime-local" />').attr('type') !== 'datetime-local' || $('<input type="range" />').attr('type') !== 'range' )){return;}
	//prepare for ff4 doesn't do anything yet
	var typeModels = $.webshims.inputTypes;
	$.webshims.addInputType = function(type, obj){
		typeModels[type] = obj;
	};
	
	var validityRules = {};
	$.webshims.addvalidityRule = function(type, fn){
		validityRules[type] = fn;
	};
})(jQuery);
