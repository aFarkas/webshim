//
webshims.register('form-combat', function($,webshims){
	"use strict";
	
	var replacementDatas = {
		
	};
	var addReplacement = function(pName, dataName, obj){
		if($.fn[pName]){
			if(typeof dataName == 'object'){
				obj = dataName;
				dataName = pName;
			}
			replacementDatas[dataName] = obj;
			webshims.info('detected use of '+ pName +' try to add support.');
		}
	};
	
	addReplacement('select2', {
		shadow: 'container',
		shadowFocus: 'selection'
	});
	
	addReplacement('chosen', {
		shadow: 'container',
		shadowFocus: 'search_field'
	});
	
	addReplacement('selectpicker', {
		shadow: '$newElement',
		shadowFocus: '$button'
	});
	
	addReplacement('selectBoxIt', {
		shadow: 'dropdownContainer',
		shadowFocus: 'dropdown'
	});
	
	addReplacement('checkboxradio', 'mobileCheckboxradio', {
		shadow: 'label',
		shadowFocus: 'element'
	});
	
	addReplacement('selectmenu', 'mobileSelectmenu', {
		shadow: 'button',
		shadowFocus: function(data, elem){
			return data.options.nativeMenu ? data.element : data.button;
		}
	});

	function find(context){
		$('select:not(.ui-select-nativeonly), input[type="radio"], input[type="checkbox"]', context).each(find.detectReplacement);
	}
	
	find.register = function(elem, data, pluginDescriptor){
		var shadow = typeof pluginDescriptor.shadow == 'string' ? data[pluginDescriptor.shadow] : pluginDescriptor.shadow(data, elem);
		var shadowFocus = typeof pluginDescriptor.shadowFocus == 'string' ? data[pluginDescriptor.shadowFocus] : pluginDescriptor.shadowFocus(data, elem);
		if(!shadowFocus){
			shadowFocus = shadow;
		}
		if(shadow){
			webshims.addShadowDom(elem, shadow, {shadowFocusElement: shadowFocus});
		}
	};
	
	find.detectReplacement = function(){
		var plugin;
		var data = $(this).data();
		if(data && !(webshims.data(this) || {}).hasShadow){
			for(plugin in replacementDatas){
				if(data[plugin]){
					find.register(this, data[plugin], replacementDatas[plugin]);
					break;
				}
			}
		}
	};
	
	webshims.addReady(function(context){
		
		setTimeout(function(){
			find(context);
		}, 4);
	});
});
