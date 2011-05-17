(function($){
	var getAttrValue = function(value, type, name){
		
		if(type == 'standard' && value === ''){
			value = undefined;
		} else if(type == 'boolean'){
			value = (value) ? name : undefined;
		}
		return value;
	};
	var getElementSel = function(elem){
		var name = elem.prop('nodeName').toLowerCase();
		var ext = elem.prop('className');
		if(ext && ext.split){
			name += '.'+ (ext.split(' ').join('.'));
		}
		ext = elem.prop('name');
		if(ext){
			name += '[name="'+ ext +'"]';
		}
		ext = elem.prop('id');
		if(ext){
			name += '#'+ext;
		}
		return name;
	};
	
	window.webshimtest = {
		reflectAttr: function(elem, name, value, type){
			elem = $(elem);
			type = type || 'standard';
			var elemSel = getElementSel(elem);
			var attrValue = getAttrValue(value, type, name);
			strictEqual(elem.prop(name), value, type+' - prop of '+ elemSel  +' is '+ name +': '+ value);
			strictEqual(elem.attr(name), attrValue, type+' - attr of '+ elemSel  +' is '+ name +': '+ attrValue);
		},
		hasMethod: function(elem, methodName){
			elem = $(elem);
			var elemSel = getElementSel(elem);
			var fn = elem.prop(methodName);
			ok(fn && fn.call && fn.apply, elemSel+' has method as prop '+ methodName);
			fn = elem[0][methodName];
			ok(fn && fn.call && fn.apply, elemSel+' has method as native '+ methodName);
		}
	};
})(jQuery);
