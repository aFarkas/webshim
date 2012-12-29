jQuery.webshims.register('datepopover-ui', function($, webshims, window, document, undefined, options){
	var picker = {};
	var formcfg = $.webshims.formcfg;
	var curCfg;
	
	picker.getYearList = function(year, max, min){
		console.log(year, max, min)
		var i, val;
		var xth = (year * 1) % 12;
		var start = year - xth;
		var lis = [];
		for(i = 0; i < 12; i++){
			val = start + i;
			lis.push('<li><button type="button" data-action="getMonthList" value="'+val+'">'+val+'</button></li>');
		}
		
		return '<ul class="year-list">'+ (lis.join(''))+ '</ul>';
	};
	
	picker.getMonthList = function(value, options){
		
		var i, name, val;
		var lis = [];
		console.log(curCfg)
		for(i = 0; i < 12; i++){
			val = curCfg.date.monthkeys[i+1];
			name = curCfg.date.monthNames[i];
			lis.push('<li><button type="button" data-action="changeInput" value="'+value+'-'+val+'">'+name+'</button></li>');
		}
		
		return '<ul class="month-list">'+ (lis.join(''))+ '</ul>';
	};
	
	var actions = {
		getMonthList: function(val, popover, data){
			var content = picker.getMonthList(val, data.options);
			popover.contentElement.html(content);
		},
		changeInput: function(val, popover, data){
			data.setChange(val);
			popover.hide();
		}
	};
	
	picker.month = function(data){
		var popover = webshims.objectCreate(webshims.wsPopover, {}, {prepareFor: data.element});
		var opener = $('<span class="popover-opener" />').appendTo(data.buttonWrapper);
		var options = data.options;
		var show = function(){
			if(!options.disabled && !options.readonly){
				var year = (options.value || options.defValue).split('-')[0];
				var max = (options.max).split('-')[0];
				var min = (options.min).split('-')[0];
				popover.contentElement.html(picker.getYearList(year, max, min));
				popover.show(data.element);
			}
		};
		
		popover.element.addClass(data.type+'-popover');
		popover.contentElement.on('click', 'button[data-action]', function(){
			console.log(this)
			var action = $(this).data('action');
			if(actions[action]){
				actions[action]($(this).val(), popover, data);
			} else {
				webshims.warn('no action for '+ action);
			}
			return false;
		});
		opener.on('mousedown', show);
		data.element.on('focus', function(){
			if(data.options.openOnFocus){
				show();
			}
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