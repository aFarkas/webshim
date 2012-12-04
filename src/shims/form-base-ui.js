jQuery.webshims.register('form-base-ui', function($, webshims, window, document, undefined, options){
	var modernizrInputTypes = Modernizr.inputtypes;
	
	var stopCircular;
	var inputTypes = {
		
	};
	var copyProps = [
		'disabled',
		'readonly',
		'value',
		'min',
		'max',
		'step',
		'title'
	];
	
	//
	var copyAttrs = ['tabindex'];
	var reflectFn = function(val){
		
	};
		
	$.each(copyProps, function(i, name){
		webshims.onNodeNamesPropertyModify('input', name, function(val){
			if(!stopCircular){
				var shadowData = webshims.data(this, 'shadowData');
				if(shadowData && shadowData.data && shadowData.data[name] && shadowData.nativeElement === this){
					shadowData.data[name](val);
				}
			}
		});
	});
	var extendType = (function(){
		
		
		return function(name, data){
			inputTypes[name] = data;
			data.attrs = $.merge([], copyAttrs, data.attrs);
			data.props = $.merge([], copyProps, data.props);
		};
	})();
	var getOptions = function(input, data){
		var list = $.prop(input, 'list');
		var options = {};
		var listTimer;
		
		if(list){
			$('option', list).each(function(){
				options[$.prop(this, 'value')] = $.prop(this, 'label');
			});
		}
		if(data){
			$(input).on('listdatalistchange', function(){
				if(data.shim){
					clearTimeout(listTimer);
					listTimer = setTimeout(function(){
						data.shim.list(getOptions(input));
					}, 9);
				}
			});
		}
		return options;
	};
	var stopPropagation = function(e){
		e.stopImmediatePropagation(e);
	};
	var implementType = function(){
		var type = $.prop(this, 'type');
		
		var i, opts, data, optsName;
		if(inputTypes[type]){
			data = {};
			optsName = type+'Opts';
			//todo: do we need deep extend?
			opts = $.extend({}, options[optsName], $(this).data(type) || {}, {
				orig: this,
				type: type,
				options: getOptions(this, data),
				input: function(val){
					opts._change(val);
					$(opts.orig).trigger('input');
				},
				change: function(val){
					opts._change(val);
					$(opts.orig).trigger('change');
				},
				_change: function(val){
					stopCircular = true;
					$.prop(opts.orig, 'value', val);
					stopCircular = false;
				}
			});
			
			for(i = 0; i <  copyProps.length; i++){
				opts[copyProps[i]] = $.prop(this, copyProps[i]);
			}
			data.shim = inputTypes[type]._create(opts);
			
			webshims.addShadowDom(this, data.shim.element, {
				data: data.shim || {}
			});
			
			data.shim.element.on('change input', stopPropagation);
			data.shim.element.on('focusin focusout', function(e){
				e.stopImmediatePropagation(e);
				$(opts.orig).trigger(e);
			});
			data.shim.element.on('focus blur', function(e){
				e.stopImmediatePropagation(e);
				$(opts.orig).triggerHandler(e);
			});
			
			
			//options.calculateWidth
		}
	};
	
	if(!modernizrInputTypes.range || options.replaceUI){
		extendType('range', {
			_create: function(opts, set){
				return $('<span />').insertAfter(opts.orig).rangeUI(opts).data('rangeUi');
			}
		});
	}
	
	if(!modernizrInputTypes.number || options.replaceUI){
		extendType('number', {
			_create: function(opts, set){
				//
				return $('<input type="text" style="border: 1px solid #f00;" />').insertAfter(opts.orig).spinbtnUI(opts).data('numberUi');
			}
		});
	}
	
	webshims.addReady(function(context, contextElem){
		$('input', context)
			.add(contextElem.filter('input'))
			.each(implementType)
		;
	});
	
});