webshims.ready('jquery', function($){
$(function($){
	$('#code').each(function(){
		var lastData, configType, markupFormat;
		var output = $(this);
		var cfgFeature = $('#cfg-feature').val() || 'forms-cfg';
		var getOptions = function(){
			configType = ($('#config-type').val() || $('#config-type option').eq(0).val()).split('-');
			markupFormat = $('#markup-format').val();
		};
		var prism = function(){
			if(window.Prism){
				Prism.highlightElement(this);
			}
		};
		var normalName = /([A-Z])/g;
		var nameFn = function(f, dashed){
			return '-'+dashed.toLowerCase();
		};
		var getScript = function(data){
			var obj;
			var code = '';
			if(configType[0] == 'markup'){
				
				if(data.classes.length){
					data.attr['class'] = data.classes.join(' ');
				}
				if(!$.isEmptyObject(data.data)){
					if(configType[1] == 'json'){
						data.attr['data-'+ data.attr.type] = data.data;
					} else {
						$.each(data.data, function(name, val){
							data.attr['data-'+ data.attr.type +'-'+name.replace(normalName, nameFn)] = val;
						});
					}
				}
			} else {
				obj = {};
				if(data.classes.length){
					data.data.classes = data.classes.join(' ');
				}
				if(!$.isEmptyObject(data.data)){
					obj[configType[1] == 'type' ? data.attr.type : 'widgets'] = data.data;
					code += '<script>\n';
					code += '//configure before calling webshims.polyfill\n';
					code += 'webshims.setOptions("'+cfgFeature+'", ';
					code += JSON.stringify(obj, null, '\t') +');';
					code += '\n\n//webshims.polyfill("forms forms-ext");';
					code += '\n<\/script>\n';
				}
			}
			return code;
		};
		var getMarkup = function(data){
			var input = ['<input'];
			$.each(data.attr, function(name, val){
				if(typeof val == 'object'){
					input.push(name+"='"+ JSON.stringify(val, null, markupFormat == 'verbose' ? '\t' : null) +"'");
				} else {
					if(name.indexOf('data-') < 0 && typeof val == 'boolean'){
						val = '';
					}
					input.push(name+'="'+ val +'"');
				}
			});
			
			input.push('/>');
			if(data.attr.list){
				input.push('\n'+ $('#'+data.attr.list).prop('outerHTML'));
			}
			return input.join(markupFormat == 'verbose' ? '\n ' : ' ');
		};
		var render = function(data){
			var code = '\n';
			if(!data){
				data = lastData;
			} else {
				lastData = data;
			}
			
			data = $.extend(true, {}, data);
			code += getScript(data);
			code += '\n';
			code += getMarkup(data);
			code += '\n';
			$('code', output)
				.text(code)
				.each(prism)
			;
		};
		getOptions();
		$(this).on('change', function(){
			getOptions();
			render();
		});
		$(this).on('render', function(e, data){
			render(data);
		});
	});
	$('#dir').each(function(){
		var onChange = function(){
			$('#output').attr('dir', $(this).val());
			$('form.input-widget fieldset').eq(0).trigger('change');
		};
		$(this).on('change', onChange).each(onChange);
	});
	
	$('#widget-scale').each(function(){
		var div = $('<div hidden="" />').appendTo('body').get(0);
		var fsScale = function(){
			var fs = $.prop(this, 'value');
			var style = 'x<style>#output .ws-popover, #output .input-picker, #output .ws-range, body >  .ws-popover { font-size:'+ fs +'px;}</style>';
			div.innerHTML = style;
			$(document).trigger('updatelayout');
		};
		$(this).on('input', fsScale).each(fsScale);
		
	});
	
	$('form.input-widget').each(function(){
		var form = $(this);
		var type = form.data('type');
		var createWidget = function(){
			var output = {};
			var input = $('<input />');
			if(type){
				input.attr('type', type);
			}
			$('fieldset[data-method]', form).each(function(){
				var obj = {};
				var method = $(this).data('method');
				$($.prop(this, 'elements')).filter('[name]').each(function(){
					var val, name;
					if($(this).is(':invalid')){return;}
					name = $.prop(this, 'name');
					if($.prop(this, 'type') == 'checkbox'){
						val =  $.prop(this, 'checked') ;
						if(val == $.prop(this, 'defaultChecked')){
							return;
						}
					} else {
						val = $(this).val();
						if(val === $.prop(this, 'defaultValue') || !val){
							return;
						}
						
						try {
							val = JSON.parse(val);
						} catch(e){}
					}
					if(typeof obj[name] == 'object' && typeof val == 'object'){
						$.extend(true, obj[name], val);
					} else {
						obj[name] = val;
					}
				});
				
				input[method]($(this).data('name') || obj, obj);
				
				if(method == 'data' && !type){
					type = $(this).data('name');
				}
				
				if(method == 'prop'){
					method = 'attr';
				}
				if(output[method]){
					$.extend(output[method], obj);
				} else {
					output[method] = obj;
				}
			});
			
			output.classes = [];
			
			$('fieldset[data-classes] input[name]:checked', form).each(function(){
				output.classes.push($.prop(this, 'name'));
			});
			
			$('#output')
				.html('<label for="'+ type+'">'+ type +' label</label>')
				.appendPolyfill(
					input.addClass('form-control '+output.classes.join(' ')).prop('id', type)
				)
			;
			output.attr.type = type;
			$('#code').trigger('render', [output]);
			if(location.replace){
				location.replace('#'+ form.serialize());
			}
		};
		$('> fieldset', form).on('change input', (function(){
			var timer;
			return function(e){
				clearTimeout(timer);
				timer = setTimeout(createWidget, e.type == 'input' ? 200 : 9);
			};
		})());
		form.on('submit', false);
		if(form.deserialize){
			form.deserialize(location.hash.substr(1));
		}
		createWidget();
	});
	
	(function(){
		var getFormElements = function(names, form){
			return names.split(' ').map(function(name){
				return form.prop(name);
			});
		};
		var isChecked = function(elem){
			return $.prop(elem, 'checked');
		};
		$('[data-needs]').each(function(){
			var module = $(this);
			var form = module.jProp('form');
			var needs = getFormElements(module.data('needs'), module.jProp('form'));
			var enable = function(){
				module.prop('disabled', !needs.some(isChecked));
			};
			module.each(enable);
			$(needs).on('change', enable);
		});
		$('[data-excludes]').each(function(){
			var module = $(this);
			var excludes = getFormElements(module.data('excludes'), module.jProp('form'));
			
			var enable = function(){
				module.prop('disabled', excludes.some(isChecked));
			};
			var addFlag = function(excludes){
				var excludeFlags = $.data(this, 'excludeFlags') || $.data(this, 'excludeFlags', {});
				excludeFlags[module.prop('name')] = true;
			};
			var enableExclude = function(){
				var excludeFlags = $.data(this, 'excludeFlags');
				if(excludeFlags){
					delete excludeFlags[module.prop('name')]; 
				}
				if(!excludeFlags || $.isEmptyObject(excludeFlags)){
					$.prop(this, 'disabled', false);
				}
			};
			module.each(enable).on('change', function(){
				if($(this).prop('checked')){
					$(excludes).prop('disabled', true);
					$(excludes).each(addFlag);
				} else {
					$(excludes).each(enableExclude);
				}
			});
			$(excludes).on('change', enable);
			enable();
		});
	})();
});
});