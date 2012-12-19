jQuery.webshims.register('datepopover-ui', function($, webshims, window, document, undefined, options){
	var picker = {};
	var formcfg = $.webshims.formcfg;
	var curCfg;
	
	picker.getYearList = function(options){
		console.log(options)
	};
	
	picker.month = function(data){
		var popover = webshims.objectCreate(webshims.wsPopover, {}, {prepareFor: data.element});
		popover.element.addClass(data.type+'-popover');
		$('<span class="popover-opener" />').appendTo(data.buttonWrapper);
		data.element.bind('focus', function(){
			picker.getYearList(data.options)
			popover.show(data.element);
		});
	};
	
	curCfg = formcfg[''];
	
	$.webshims.ready('dom-extend', function(){
		$.webshims.activeLang({
			register: 'form-core', 
			callback: function(){
				$.each(arguments, function(i, val){
					if(formcfg[val]){
						curCfg = formcfg[val];
						return false;
					}
				});
			}
		});
	});
	
	webshims.picker = picker;
});