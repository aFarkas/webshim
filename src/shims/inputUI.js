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
		if($.support.validity === true){
			orig.bind('firstinvalid', function(e){
				setTimeout(function(){
					if(!$.data(e.target, 'maybePreventedinvalid')){
						$.webshims.validityAlert.showFor(e.target);
					}
				}, 30);
			});
		}
		
		var attr = {
			css: {
				marginRight: orig.css('marginRight'),
				marginLeft: orig.css('marginLeft')
			},
			outerWidth: orig.getouterWidth()
		};
		shim.addClass(orig[0].className).data('html5element', orig);
		orig
			.after(shim)
			.data('inputUIReplace', {visual: shim, methods: methods})
			.hide()
		;
		
		return attr;
	};
	
	replaceInputUI['datetime-local'] = function(elem){
		if(!$.fn.datepicker){return;}
		var date = $('<span class="input-datetime-local"><input type="text" class="input-datetime-local-date" /><input type="time" class="input-datetime-local-time" /></span>'),
			attr  = this.common(elem, date, replaceInputUI['datetime-local'].attrs),
			datePicker = $('input.input-datetime-local-date', date),
			data
		;
		$('input', date).data('html5element', $.data(date[0], 'html5element'));
		
		if(attr.css){
			date.css(attr.css);
			if(attr.outerWidth){
				date.outerWidth(attr.outerWidth);
				var width = date.getwidth();
				datePicker
					.css({marginLeft: 0, marginRight: 2})
					.outerWidth(Math.floor(width * 0.61))
				;
				$('input.input-datetime-local-time')
					.css({marginLeft: 2, marginRight: 0})
					.outerWidth(Math.floor(width * 0.37))
				;
			}
		}
		
		$.webshims.triggerDomUpdate(date);
		data = $('input.input-datetime-local-date', date)
			.datepicker($.extend({}, options.date))
			.bind('change', function(val, ui){
				
				var value, timeVal = $('input.input-datetime-local-time', date).attr('value');
				try {
					value = $.datepicker.parseDate(datePicker.datepicker('option', 'dateFormat'), datePicker.attr('value'));
					value = (value) ? $.datepicker.formatDate('yy-mm-dd', value) : datePicker.attr('value');
				} 
				catch (e) {
					value = datePicker.attr('value');
				}
				if (!$('input.input-datetime-local-time', date).attr('value')) {
					timeVal = '00:00';
					$('input.input-datetime-local-time', date).attr('value', timeVal);
				}
				replaceInputUI['datetime-local'].blockAttr = true;
				elem.attr('value', value + 'T' + timeVal);
				replaceInputUI['datetime-local'].blockAttr = false;
				elem.trigger('change');
			})
			.data('datepicker')
		;
		
		$('input.input-datetime-local-time', date).bind('input change', function(){
			var val = elem.attr('value').split('T');
			if(val.length < 2 || !val[0]){
				val[0] = $.datepicker.formatDate('yy-mm-dd', new Date());
			}
			val[1] = $.attr(this, 'value');
			replaceInputUI['datetime-local'].blockAttr = true;
			
			try {
				datePicker.attr('value', $.datepicker.formatDate(datePicker.datepicker('option', 'dateFormat'), $.datepicker.parseDate('yy-mm-dd', val[0])));
			} catch(e){}
			elem.attr('value', val.join('T'));
			replaceInputUI['datetime-local'].blockAttr = false;
			elem.trigger('change');
		});
		
		data.dpDiv.addClass('input-date-datepicker-control');
		$.each(['disabled', 'min', 'max', 'value'], function(i, name){
			elem.attr(name, function(i, value){return value || '';});
		});
	};
	
	replaceInputUI['datetime-local'].attrs = {
		disabled: function(orig, shim, value){
			$('input.input-datetime-local-date', shim).datepicker('option', 'disabled', !!value);
			$('input.input-datetime-local-time', shim).attr('disabled', !!value);
		},
		//ToDo: use min also on time
		min: function(orig, shim, value){
			value = (value.split) ? value.split('T') : [];
			try {
				value = $.datepicker.parseDate('yy-mm-dd', value[0]);
			} catch(e){value = false;}
			if(value){
				$('input.input-datetime-local-date', shim).datepicker('option', 'minDate', value);
			}
		},
		//ToDo: use max also on time
		max: function(orig, shim, value){
			value = (value.split) ? value.split('T') : [];
			try {
				value = $.datepicker.parseDate('yy-mm-dd', value[0]);
			} catch(e){value = false;}
			if(value){
				$('input.input-datetime-local-date', shim).datepicker('option', 'maxDate', value);
			}
		},
		value: function(orig, shim, value){
			if(!replaceInputUI['datetime-local'].blockAttr){
				var dateValue;
				value = (value.split) ? value.split('T') : [];
				try {
					dateValue = $.datepicker.parseDate('yy-mm-dd', value[0]);
				} catch(e){dateValue = false;}
				if(dateValue){
					$('input.input-datetime-local-date', shim).datepicker('setDate', dateValue);
					$('input.input-datetime-local-time', shim).attr('value', value[1] || '00:00');
				} else {
					$('input.input-datetime-local-date', shim).attr('value', value[0] || '');
					$('input.input-datetime-local-time', shim).attr('value', value[1] || '');
				}
				
			}
		}
	};
	
	replaceInputUI.date = function(elem){
		if(!$.fn.datepicker){return;}
		var date = $('<input type="text" class="input-date" />'),
			attr  = this.common(elem, date, replaceInputUI.date.attrs),
			change = function(val, ui){
				replaceInputUI.date.blockAttr = true;
				var value;
				try {
					value = $.datepicker.parseDate(date.datepicker('option', 'dateFormat'), date.attr('value') );
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
		$('input.hasDatepicker').filter('.input-date, .input-datetime-local-date').datepicker('option', opts).each(function(){
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
	}, true);
	
})(jQuery);
