(function($){
	$.support.inputUI = 'shim';
		
	var options = $.webshims.modules.inputUI.options;
	
	var replaceInputUI = function(context){
		$('input', context).each(function(){
			var type = $.attr(this, 'type');
			if(replaceInputUI[type]  && !$.data(this, 'inputUIReplace')){
				replaceInputUI[type]($(this));
			}
		});
	};
	
	replaceInputUI.common = function(orig, shim, methods){
		if(options.replaceNative){
			orig.bind('invalid', function(e){
				setTimeout(function(){
					if(!$.data(e.target, 'maybePreventedinvalid')){
						throw('you have to handle invalid events, if you replace native input-widgets.');
					}
				}, 9);
			});
		}
		
		var attr = {
			css: {
				marginRight: orig.css('marginRight'),
				marginLeft: orig.css('marginLeft')
			},
			outerWidth: orig.outerWidth()
		};
		shim.addClass(orig[0].className).data('html5element', orig);
		orig
			.after(shim)
			.data('inputUIReplace', {visual: shim, methods: methods})
			.hide()
		;
		
		return attr;
	};
	
	replaceInputUI.date = function(elem){
		if(!$.fn.datepicker){return;}
		var date = $('<input type="text" class="input-date" />'),
			attr  = this.common(elem, date, replaceInputUI.date.attrs),
			change = function(val, ui){
				replaceInputUI.date.blockAttr = true;
				var value;
				try {
					value = $.datepicker.parseDate(data.settings.dateFormat, date.attr('value') );
					value = (value) ? $.datepicker.formatDate( 'yy-mm-dd', value ) : date.attr('value');
				} catch(e){
					value = date.attr('value');
				}
				elem.attr('value', value);
				replaceInputUI.date.blockAttr = false;
				elem.trigger('change');
			},
			data
		;
		
		if(attr.css){
			date.css(attr.css);
			if(attr.outerWidth){
				date.outerWidth(attr.outerWidth);
			}
		}
		data = date
			.datepicker($.extend({}, options.date))
			.bind('change', change)
			.data('datepicker')
		;
		data.dpDiv.addClass('input-date-datepicker-control');
		$.each(['disabled', 'min', 'max', 'value'], function(i, name){
			elem.attr(name, function(i, value){return value || '';});
		});
	};
	
	replaceInputUI.date.attrs = {
		disabled: function(orig, shim, value){
			shim.datepicker('option', 'disabled', !!value);
		},
		min: function(orig, shim, value){
			try {
				value = $.datepicker.parseDate('yy-mm-dd', value);
			} catch(e){value = false;}
			if(value){
				shim.datepicker('option', 'minDate', value);
			}
		},
		max: function(orig, shim, value){
			try {
				value = $.datepicker.parseDate('yy-mm-dd', value);
			} catch(e){value = false;}
			if(value){
				shim.datepicker('option', 'maxDate', value);
			}
		},
		value: function(orig, shim, value){
			if(!replaceInputUI.date.blockAttr){
				try {
					var dateValue = $.datepicker.parseDate('yy-mm-dd', value);
				} catch(e){var dateValue = false;}
				if(dateValue){
					shim.datepicker('setDate', dateValue);
				} else {
					shim.attr('value', value);
				}
			}
		}
	};
	
	replaceInputUI.range = function(elem){
		if(!$.fn.slider){return;}
		var range = $('<span class="input-range" />'),
			attr  = this.common(elem, range, replaceInputUI.range.attrs)
		;
		
		if(attr.css){
			range.css(attr.css);
			if(attr.outerWidth){
				range.outerWidth(attr.outerWidth);
			}
		}
		range.slider($.extend(options.slider, {
			change: function(e, ui){
				if(e.originalEvent){
					replaceInputUI.range.blockAttr = true;
					elem.attr('value', ui.value);
					replaceInputUI.range.blockAttr = false;
					elem.trigger('change');
				}
			}
		}));
		
		$.each(['disabled', 'min', 'max', 'value', 'step'], function(i, name){
			elem.attr(name, function(i, value){return value || '';});
		});
	};
	
	replaceInputUI.range.attrs = {
		disabled: function(orig, shim, value){
			shim.slider( "option", "disabled", !!value );
		},
		min: function(orig, shim, value){
			value = (value) ? value * 1 || 0 : 0;
			shim.slider( "option", "min", value );
		},
		max: function(orig, shim, value){
			value = (value || value === 0) ? value * 1 || 100 : 100;
			shim.slider( "option", "max", value );
		},
		value: function(orig, shim, value){
			value = $(orig).attr('valueAsNumber');
			if(isNaN(value)){
				value = (shim.slider('option', 'max') - shim.slider('option', 'min')) / 2;
				orig.value = value;
			}
			if(!replaceInputUI.range.blockAttr){
				shim.slider( "option", "value", value );
			}
		},
		step: function(orig, shim, value){
			value = (value && $.trim(value)) ? value * 1 || 1 : 1;
			shim.slider( "option", "step", value );
		}
	};
	
	$.each(['disabled', 'min', 'max', 'value', 'step'], function(i, attr){
		$.webshims.attr(attr, {
			elementNames: ['input'],
			setter: function(elem, val, fn){
				var widget = $.data(elem, 'inputUIReplace');
				fn();
				if(widget && widget.methods[attr]){
					val = widget.methods[attr](elem, widget.visual, val);
				}
			},
			getter: true
		});
	});
	
		
	var changeDefaults = function(langObj){
		if(!langObj){return;}
		var opts = $.extend({}, langObj, options.date);
		$('input.input-date.hasDatepicker').datepicker('option', opts).each(function(){
			var orig = $.data(this, 'html5element');
			if(orig){
				$.each(['disabled', 'min', 'max', 'value'], function(i, name){
					orig.attr(name, function(i, value){return value || '';});
				});
			}
		});
		$.datepicker.setDefaults(opts);
	};
	
	$(document).bind('jquery-uiReady.langchange input-widgetsReady.langchange', function(){
		if(!$.datepicker){return;}
		$(document)
			.bind('htmlExtLangChange', function(){
				$.webshims.activeLang($.datepicker.regional, 'inputUI', changeDefaults);
			})
			.unbind('jquery-uiReady.langchange input-widgetsReady.langchange')
		;
	});
	$.webshims.ready('number-date-type', function(){
		$.webshims.addReady(function(context){
			$(document).bind('jquery-uiReady.initinputui input-widgetsReady.initinputui', function(){
				if(!$.datepicker && !$.fn.slider){return;}
				replaceInputUI(context);
				if($.datepicker && $.fn.slider){
					$(document).unbind('jquery-uiReady.initinputui input-widgetsReady.initinputui');
				}
			});
		});
		$.webshims.createReadyEvent('inputUI');
	}, true, true);
	
})(jQuery);
