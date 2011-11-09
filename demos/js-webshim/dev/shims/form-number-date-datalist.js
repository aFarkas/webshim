jQuery.webshims.register('forms-ext', function($, webshims, window, document, undefined){
	"use strict";
	
	//form messages for forms-ext
	(function(){
		var validityMessages = webshims.validityMessages;
		var extendFormLang = function(obj, ext){
			$.each(ext, function(name, val){
				if(!obj[name]){
					obj[name] = val;
				} else if(typeof val == 'object'){
					extendFormLang(obj[name], val);
				}
			});
		};
		var en = {
			typeMismatch: {
				number: 'Please enter a number.',
				date: 'Please enter a date.',
				time: 'Please enter a time.',
				range: 'Invalid input.',
				"datetime-local": 'Please enter a datetime.'
			},
			rangeUnderflow: {
				defaultMessage: 'Value must be greater than or equal to {%min}.'
			},
			rangeOverflow: {
				defaultMessage: 'Value must be less than or equal to {%max}.'
			},
			stepMismatch: 'Invalid input.'
		};
		var de = {
			typeMismatch: {
				number: '{%value} ist keine Nummer!',
				date: '{%value} ist kein Datum',
				time: '{%value} ist keine Uhrzeit',
				range: '{%value} ist keine Nummer!',
				"datetime-local": '{%value} ist kein Datum-Uhrzeit Format.'
			},
			rangeUnderflow: {
				defaultMessage: '{%value} ist zu niedrig. {%min} ist der unterste Wert, den Sie benutzen können.'
			},
			rangeOverflow: {
				defaultMessage: '{%value} ist zu hoch. {%max} ist der oberste Wert, den Sie benutzen können.'
			},
			stepMismatch: 'Der Wert {%value} ist in diesem Feld nicht zulässig. Hier sind nur bestimmte Werte zulässig. {%title}'
		};
		
		['date', 'time', 'datetime-local'].forEach(function(type){
			en.rangeUnderflow[type] = 'Value must be at or after {%min}.';
		});
		['date', 'time', 'datetime-local'].forEach(function(type){
			en.rangeOverflow[type] = 'Value must be at or before {%max}.';
		});
		
		['date', 'time', 'datetime-local'].forEach(function(type){
			de.rangeUnderflow[type] = '{%value} ist zu früh. {%min} ist die früheste Zeit, die Sie benutzen können.';
		});
		['date', 'time', 'datetime-local'].forEach(function(type){
			de.rangeOverflow[type] = '{%value} ist zu spät. {%max} ist die späteste Zeit, die Sie benutzen können.';
		});
		extendFormLang(validityMessages['en'], en);
		extendFormLang(validityMessages['de'], de);
		
	})();
	
	
	//why no step IDL?
	webshims.getStep = function(elem, type){
		var step = $.attr(elem, 'step');
		if(step === 'any'){
			return step;
		}
		type = type || getType(elem);
		if(!typeModels[type] || !typeModels[type].step){
			return step;
		}
		step = typeProtos.number.asNumber(step);
		return ((!isNaN(step) && step > 0) ? step : typeModels[type].step) * typeModels[type].stepScaleFactor;
	};
	//why no min/max IDL?
	webshims.addMinMaxNumberToCache = function(attr, elem, cache){
		if (!(attr+'AsNumber' in cache)) {
			cache[attr+'AsNumber'] = typeModels[cache.type].asNumber(elem.attr(attr));
			if(isNaN(cache[attr+'AsNumber']) && (attr+'Default' in typeModels[cache.type])){
				cache[attr+'AsNumber'] = typeModels[cache.type][attr+'Default'];
			}
		}
	};
	
	var nan = parseInt('NaN', 10),
		doc = document,
		typeModels = webshims.inputTypes,
		isNumber = function(string){
			return (typeof string == 'number' || (string && string == string * 1));
		},
		supportsType = function(type){
			return (Modernizr.input.valueAsNumber && $('<input type="'+type+'" />').prop('type') === type);
		},
		getType = function(elem){
			return (elem.getAttribute('type') || '').toLowerCase();
		},
		isDateTimePart = function(string){
			return (isNumber(string) || (string && string == '0' + (string * 1)));
		},
		addMinMaxNumberToCache = webshims.addMinMaxNumberToCache,
		addleadingZero = function(val, len){
			val = ''+val;
			len = len - val.length;
			for(var i = 0; i < len; i++){
				val = '0'+val;
			}
			return val;
		},
		EPS = 1e-7
	;
	
	webshims.addValidityRule('stepMismatch', function(input, val, cache){
		if(val === ''){return false;}
		if(!('type' in cache)){
			cache.type = getType(input[0]);
		}
		//stepmismatch with date is computable, but it would be a typeMismatch (performance)
		if(cache.type == 'date'){
			return false;
		}
		var ret = false, base;
		if(typeModels[cache.type] && typeModels[cache.type].step){
			if( !('step' in cache) ){
				cache.step = webshims.getStep(input[0], cache.type);
			}
			
			if(cache.step == 'any'){return false;}
			
			if(!('valueAsNumber' in cache)){
				cache.valueAsNumber = typeModels[cache.type].asNumber( val );
			}
			if(isNaN(cache.valueAsNumber)){return false;}
			
			addMinMaxNumberToCache('min', input, cache);
			base = cache.minAsNumber;
			if(isNaN(base)){
				base = typeModels[cache.type].stepBase || 0;
			}
			
			ret =  Math.abs((cache.valueAsNumber - base) % cache.step);
							
			ret = !(  ret <= EPS || Math.abs(ret - cache.step) <= EPS  );
		}
		return ret;
	});
	
	
	
	[{name: 'rangeOverflow', attr: 'max', factor: 1}, {name: 'rangeUnderflow', attr: 'min', factor: -1}].forEach(function(data, i){
		webshims.addValidityRule(data.name, function(input, val, cache) {
			var ret = false;
			if(val === ''){return ret;}
			if (!('type' in cache)) {
				cache.type = getType(input[0]);
			}
			if (typeModels[cache.type] && typeModels[cache.type].asNumber) {
				if(!('valueAsNumber' in cache)){
					cache.valueAsNumber = typeModels[cache.type].asNumber( val );
				}
				if(isNaN(cache.valueAsNumber)){
					return false;
				}
				
				addMinMaxNumberToCache(data.attr, input, cache);
				
				if(isNaN(cache[data.attr+'AsNumber'])){
					return ret;
				}
				ret = ( cache[data.attr+'AsNumber'] * data.factor <  cache.valueAsNumber * data.factor - EPS );
			}
			return ret;
		});
	});
	
	webshims.reflectProperties(['input'], ['max', 'min', 'step']);
	
	
	//IDLs and methods, that aren't part of constrain validation, but strongly tight to it
	var valueAsNumberDescriptor = webshims.defineNodeNameProperty('input', 'valueAsNumber', {
		prop: {
			get: function(){
				var elem = this;
				var type = getType(elem);
				return (typeModels[type] && typeModels[type].asNumber) ? 
					typeModels[type].asNumber($.prop(elem, 'value')) :
					nan;
			},
			set: function(val){
				var elem = this;
				var type = getType(elem);
				if(typeModels[type] && typeModels[type].numberToString){
					//is NaN a number?
					if(isNaN(val)){
						$.prop(elem, 'value', '');
						return;
					}
					var set = typeModels[type].numberToString(val);
					if(set !==  false){
						$.prop(elem, 'value', set);
					} else {
						webshims.warn('INVALID_STATE_ERR: DOM Exception 11');
					}
				} else {
					valueAsNumberDescriptor.prop._supset && valueAsNumberDescriptor.prop._supset.call(elem, arguments);
				}
			}
		}
	});
	
	var valueAsDateDescriptor = webshims.defineNodeNameProperty('input', 'valueAsDate', {
		prop: {
			get: function(){
				var elem = this;
				var type = getType(elem);
				return (typeModels[type] && typeModels[type].asDate && !typeModels[type].noAsDate) ? 
					typeModels[type].asDate($.prop(elem, 'value')) :
					valueAsDateDescriptor.prop._supget && valueAsDateDescriptor.prop._supget.call(elem);
			},
			set: function(value){
				var elem = this;
				var type = getType(elem);
				if(typeModels[type] && typeModels[type].dateToString && !typeModels[type].noAsDate){
					
					if(value === null){
						$.prop(elem, 'value', '');
						return '';
					}
					var set = typeModels[type].dateToString(value);
					if(set !== false){
						$.prop(elem, 'value', set);
						return set;
					} else {
						webshims.warn('INVALID_STATE_ERR: DOM Exception 11');
					}
				} else {
					return valueAsDateDescriptor.prop._supset && valueAsDateDescriptor.prop._supset(elem, arguments) || null;
				}
			}
		}
	});
	
	var typeProtos = {
		
		number: {
			mismatch: function(val){
				return !(isNumber(val));
			},
			step: 1,
			//stepBase: 0, 0 = default
			stepScaleFactor: 1,
			asNumber: function(str){
				return (isNumber(str)) ? str * 1 : nan;
			},
			numberToString: function(num){
				return (isNumber(num)) ? num : false;
			}
		},
		
		range: {
			minDefault: 0,
			maxDefault: 100
		},
		
		date: {
			mismatch: function(val){
				if(!val || !val.split || !(/\d$/.test(val))){return true;}
				var valA = val.split(/\u002D/);
				if(valA.length !== 3){return true;}
				var ret = false;
				$.each(valA, function(i, part){
					if(!isDateTimePart(part)){
						ret = true;
						return false;
					}
				});
				if(ret){return ret;}
				if(valA[0].length !== 4 || valA[1].length != 2 || valA[1] > 12 || valA[2].length != 2 || valA[2] > 33){
					ret = true;
				}
				return (val !== this.dateToString( this.asDate(val, true) ) );
			},
			step: 1,
			//stepBase: 0, 0 = default
			stepScaleFactor:  86400000,
			asDate: function(val, _noMismatch){
				if(!_noMismatch && this.mismatch(val)){
					return null;
				}
				return new Date(this.asNumber(val, true));
			},
			asNumber: function(str, _noMismatch){
				var ret = nan;
				if(_noMismatch || !this.mismatch(str)){
					str = str.split(/\u002D/);
					ret = Date.UTC(str[0], str[1] - 1, str[2]);
				}
				return ret;
			},
			numberToString: function(num){
				return (isNumber(num)) ? this.dateToString(new Date( num * 1)) : false;
			},
			dateToString: function(date){
				return (date && date.getFullYear) ? date.getUTCFullYear() +'-'+ addleadingZero(date.getUTCMonth()+1, 2) +'-'+ addleadingZero(date.getUTCDate(), 2) : false;
			}
		},
		
		time: {
			mismatch: function(val, _getParsed){
				if(!val || !val.split || !(/\d$/.test(val))){return true;}
				val = val.split(/\u003A/);
				if(val.length < 2 || val.length > 3){return true;}
				var ret = false,
					sFraction;
				if(val[2]){
					val[2] = val[2].split(/\u002E/);
					sFraction = parseInt(val[2][1], 10);
					val[2] = val[2][0];
				}
				$.each(val, function(i, part){
					if(!isDateTimePart(part) || part.length !== 2){
						ret = true;
						return false;
					}
				});
				if(ret){return true;}
				if(val[0] > 23 || val[0] < 0 || val[1] > 59 || val[1] < 0){
					return true;
				}
				if(val[2] && (val[2] > 59 || val[2] < 0 )){
					return true;
				}
				if(sFraction && isNaN(sFraction)){
					return true;
				}
				if(sFraction){
					if(sFraction < 100){
						sFraction *= 100;
					} else if(sFraction < 10){
						sFraction *= 10;
					}
				}
				return (_getParsed === true) ? [val, sFraction] : false;
			},
			step: 60,
			stepBase: 0,
			stepScaleFactor:  1000,
			asDate: function(val){
				val = new Date(this.asNumber(val));
				return (isNaN(val)) ? null : val;
			},
			asNumber: function(val){
				var ret = nan;
				val = this.mismatch(val, true);
				if(val !== true){
					ret = Date.UTC('1970', 0, 1, val[0][0], val[0][1], val[0][2] || 0);
					if(val[1]){
						ret += val[1];
					}
				}
				return ret;
			},
			dateToString: function(date){
				if(date && date.getUTCHours){
					var str = addleadingZero(date.getUTCHours(), 2) +':'+ addleadingZero(date.getUTCMinutes(), 2),
						tmp = date.getSeconds()
					;
					if(tmp != "0"){
						str += ':'+ addleadingZero(tmp, 2);
					}
					tmp = date.getUTCMilliseconds();
					if(tmp != "0"){
						str += '.'+ addleadingZero(tmp, 3);
					}
					return str;
				} else {
					return false;
				}
			}
		},
		
		'datetime-local': {
			mismatch: function(val, _getParsed){
				if(!val || !val.split || (val+'special').split(/\u0054/).length !== 2){return true;}
				val = val.split(/\u0054/);
				return ( typeModels.date.mismatch(val[0]) || typeModels.time.mismatch(val[1], _getParsed) );
			},
			noAsDate: true,
			asDate: function(val){
				val = new Date(this.asNumber(val));
				
				return (isNaN(val)) ? null : val;
			},
			asNumber: function(val){
				var ret = nan;
				var time = this.mismatch(val, true);
				if(time !== true){
					val = val.split(/\u0054/)[0].split(/\u002D/);
					
					ret = Date.UTC(val[0], val[1] - 1, val[2], time[0][0], time[0][1], time[0][2] || 0);
					if(time[1]){
						ret += time[1];
					}
				}
				return ret;
			},
			dateToString: function(date, _getParsed){
				return typeModels.date.dateToString(date) +'T'+ typeModels.time.dateToString(date, _getParsed);
			}
		}
	};
	
	if(!Modernizr.input.valueAsNumberSet || !supportsType('number')){
		webshims.addInputType('number', typeProtos.number);
	}
	
	if(!Modernizr.input.valueAsNumberSet || !supportsType('range')){
		webshims.addInputType('range', $.extend({}, typeProtos.number, typeProtos.range));
	}
	if(!Modernizr.input.valueAsNumberSet || !supportsType('date')){
		webshims.addInputType('date', typeProtos.date);
	}
	if(!Modernizr.input.valueAsNumberSet || !supportsType('time')){
		webshims.addInputType('time', $.extend({}, typeProtos.date, typeProtos.time));
	}
	
	if(!Modernizr.input.valueAsNumberSet || !supportsType('datetime-local')){
		webshims.addInputType('datetime-local', $.extend({}, typeProtos.date, typeProtos.time, typeProtos['datetime-local']));
	}
		
});

/* number-date-ui */
/* https://github.com/aFarkas/webshim/issues#issue/23 */
jQuery.webshims.ready('forms-ext dom-support', function($, webshims, window, document){
	"use strict";
	var triggerInlineForm = webshims.triggerInlineForm;
	var modernizrInputTypes = Modernizr.inputtypes;
	var adjustInputWithBtn = (function(){
		var fns = {"padding-box": "innerWidth", "border-box": "outerWidth", "content-box": "width"};
		var boxSizing = Modernizr.prefixed && Modernizr.prefixed("boxSizing");
		var getWidth = function(input){
			var widthFn = "width";
			if(boxSizing){
				widthFn = fns[input.css(boxSizing)] || widthFn;
			}
			
			return {
				w: input[widthFn](),
				add: widthFn == "width"
			};
			
		};
		
		
		return function(input, button){
			var inputDim = getWidth(input);
			if(!inputDim.w){return;}
			var controlDim = {
				mL: (parseInt(button.css('marginLeft'), 10) || 0),
				w: button.outerWidth()
			};
			inputDim.mR = (parseInt(input.css('marginRight'), 10) || 0);
			if(inputDim.mR){
				input.css('marginRight', 0);
			}
			//is inside
			if( controlDim.mL <= (controlDim.w * -1) ){
				button.css('marginRight',  Math.floor(Math.abs(controlDim.w + controlDim.mL) + inputDim.mR));
				input.css('paddingRight', (parseInt(input.css('paddingRight'), 10) || 0) + Math.abs(controlDim.mL));
				if(inputDim.add){
					input.css('width', Math.floor(inputDim.w + controlDim.mL));
				}
			} else {
				button.css('marginRight', inputDim.mR);
				input.css('width',  Math.floor(inputDim.w - controlDim.mL - controlDim.w));
			}
		};
	})();
		
	var options = $.webshims.cfg['forms-ext'];
	var defaultDatepicker = {dateFormat: 'yy-mm-dd'};
	var labelID = 0;
	var emptyJ = $([]);
	var isCheckValidity;
	var replaceInputUI = function(context, elem){
		$('input', context).add(elem.filter('input')).each(function(){
			var type = $.prop(this, 'type');
			if(replaceInputUI[type]  && !webshims.data(this, 'shadowData')){
				replaceInputUI[type]($(this));
			}
		});
	};
	//set date is extremly slow in IE so we do it lazy
	var lazySetDate = function(elem, date){
		if(!options.lazyDate){
			elem.datepicker('setDate', date);
			return;
		}
		var timer = $.data(elem[0], 'setDateLazyTimer');
		if(timer){
			clearTimeout(timer);
		}
		$.data(elem[0], 'setDateLazyTimer', setTimeout(function(){
			elem.datepicker('setDate', date);
			$.removeData(elem[0], 'setDateLazyTimer');
			elem = null;
		}, 0));
	};
	
	if(options.lazyDate === undefined){
		try {
			options.lazyDate = ($.browser.msie && webshims.browserVersion < 9) || ($(window).width() < 500 && $(window).height() < 500);
		} catch(er){}
	}
	
	replaceInputUI.common = function(orig, shim, methods){
		if(Modernizr.formvalidation){
			orig.bind('firstinvalid', function(e){
				if(!webshims.fromSubmit && isCheckValidity){return;}
				orig.unbind('invalid.replacedwidgetbubble').bind('invalid.replacedwidgetbubble', function(evt){
					if(!e.isInvalidUIPrevented() && !evt.isDefaultPrevented()){
						webshims.validityAlert.showFor( e.target );
						e.preventDefault();
						evt.preventDefault();
					}
					orig.unbind('invalid.replacedwidgetbubble');
				});
			});
		}
		var id = orig.attr('id'),
			attr = {
				css: {
					marginRight: orig.css('marginRight'),
					marginLeft: orig.css('marginLeft')
				},
				outerWidth: orig.outerWidth(),
				label: (id) ? $('label[for="'+ id +'"]', orig[0].form) : emptyJ
			},
			curLabelID =  webshims.getID(attr.label)
		;
		shim.addClass(orig[0].className);
		webshims.addShadowDom(orig, shim, {
			data: methods || {},
			shadowFocusElement: $('input.input-datetime-local-date, span.ui-slider-handle', shim)[0],
			shadowChilds: $('input, span.ui-slider-handle', shim)
		});
		
		orig
			.after(shim)
			.hide()
		;
		
		if(orig[0].form){
			$(orig[0].form).bind('reset', function(e){
				if(e.originalEvent && !e.isDefaultPrevented()){
					setTimeout(function(){orig.prop( 'value', orig.prop('value') );}, 0);
				}
			});
		}
		if(shim.length == 1 && !$('*', shim)[0]){
			shim.attr('aria-labeledby', curLabelID);
			attr.label.bind('click', function(){
				shim.focus();
				return false;
			});
		}
		return attr;
	};
	
	if(Modernizr.formvalidation){
		['input', 'form'].forEach(function(name){
			var desc = webshims.defineNodeNameProperty(name, 'checkValidity', {
				prop: {
					value: function(){
						isCheckValidity = true;
						var ret = desc.prop._supvalue.apply(this, arguments);
						isCheckValidity = false;
						return ret;
					}
				}
			});
		});
	}
	//date and datetime-local implement if we have to replace
	if(!modernizrInputTypes['datetime-local'] || options.replaceUI){
		
		
		var datetimeFactor = {
			trigger: [0.595,0.395],
			normal: [0.565,0.425]
		};
		var subPixelCorrect = (!$.browser.msie || webshims.browserVersion > 6) ? 0 : 0.45;
		
		var configureDatePicker = function(elem, datePicker, change, _wrapper){
			var stopFocusout;
			var focusedOut;
			var resetFocusHandler = function(){
				data.dpDiv.unbind('mousedown.webshimsmousedownhandler');
				stopFocusout = false;
				focusedOut = false;
			};
			var data = datePicker
				.bind('focusin', function(){
					resetFocusHandler();
					data.dpDiv.unbind('mousedown.webshimsmousedownhandler').bind('mousedown.webshimsmousedownhandler', function(){
						stopFocusout = true;
					});
				})
				.bind('focusout blur', function(e){
					if(stopFocusout){
						focusedOut = true;
						e.stopImmediatePropagation();
					}
				})
				.datepicker($.extend({
					onClose: function(){
						if(focusedOut && document.activeElement !== datePicker[0]){
							resetFocusHandler();
							datePicker.trigger('focusout');
							datePicker.triggerHandler('blur');
						} else {
							resetFocusHandler();
						}
					}
				}, defaultDatepicker, options.datepicker, elem.data('datepicker')))
				.bind('change', change)
				.data('datepicker')
			;
			data.dpDiv.addClass('input-date-datepicker-control');
			
			if(_wrapper){
				webshims.triggerDomUpdate(_wrapper[0]);	
			}
			['disabled', 'min', 'max', 'value', 'step'].forEach(function(name){
				var val = elem.prop(name);
				if(val !== "" && (name != 'disabled' || !val)){
					elem.prop(name, val);
				}
			});
			return data;
		};
		
		replaceInputUI['datetime-local'] = function(elem){
			if(!$.fn.datepicker){return;}
			
			var date = $('<span role="group" class="input-datetime-local"><input type="text" class="input-datetime-local-date" /><input type="time" class="input-datetime-local-time" /></span>'),
				attr  = this.common(elem, date, replaceInputUI['datetime-local'].attrs),
				datePicker = $('input.input-datetime-local-date', date),
				datePickerChange = function(e){
						
						var value = datePicker.prop('value') || '', 
							timeVal = ''
						;
						if(options.lazyDate){
							var timer = $.data(datePicker[0], 'setDateLazyTimer');
							if(timer){
								clearTimeout(timer);
								$.removeData(datePicker[0], 'setDateLazyTimer');
							}
						}
						
						if(value){
							timeVal = $('input.input-datetime-local-time', date).prop('value') || '00:00';
							try {
								value = $.datepicker.parseDate(datePicker.datepicker('option', 'dateFormat'), value);
								value = (value) ? $.datepicker.formatDate('yy-mm-dd', value) : datePicker.prop('value');
							} catch (e) {value = datePicker.prop('value');}
						} 
						value = (!value && !timeVal) ? '' : value + 'T' + timeVal;
						replaceInputUI['datetime-local'].blockAttr = true;
						elem.prop('value', value);
						replaceInputUI['datetime-local'].blockAttr = false;
						e.stopImmediatePropagation();
						triggerInlineForm(elem[0], 'input');
						triggerInlineForm(elem[0], 'change');
					},
				data = configureDatePicker(elem, datePicker, datePickerChange, date)
			;
			
			
			$('input.input-datetime-local-time', date).bind('change', function(e){
				var timeVal = $.prop(this, 'value');
				var val = ['', ''];
				if(timeVal){
					val = elem.prop('value').split('T');
					if((val.length < 2 || !val[0])){
						val[0] = $.datepicker.formatDate('yy-mm-dd', new Date());
					}
					val[1] = timeVal;
					
					if (timeVal) {
						try {
							datePicker.prop('value', $.datepicker.formatDate(datePicker.datepicker('option', 'dateFormat'), $.datepicker.parseDate('yy-mm-dd', val[0])));
						} catch (e) {}
					}
				}
				val = (!val[0] && !val[1]) ? '' : val.join('T');
				replaceInputUI['datetime-local'].blockAttr = true;
				elem.prop('value', val);
				replaceInputUI['datetime-local'].blockAttr = false;
				e.stopImmediatePropagation();
				triggerInlineForm(elem[0], 'input');
				triggerInlineForm(elem[0], 'change');
			});
			
			
			
			date.attr('aria-labeledby', attr.label.attr('id'));
			attr.label.bind('click', function(){
				datePicker.focus();
				return false;
			});
			
			if(attr.css){
				date.css(attr.css);
				if(attr.outerWidth){
					date.outerWidth(attr.outerWidth);
					var width = date.width();
					var widthFac = (data.trigger[0]) ? datetimeFactor.trigger : datetimeFactor.normal;
					datePicker.outerWidth(Math.floor((width * widthFac[0]) - subPixelCorrect), true);
					$('input.input-datetime-local-time', date).outerWidth(Math.floor((width * widthFac[1]) - subPixelCorrect), true);
					if(data.trigger[0]){
						adjustInputWithBtn(datePicker, data.trigger);
					}
				}
			}
			
			
		};
		
		replaceInputUI['datetime-local'].attrs = {
			disabled: function(orig, shim, value){
				$('input.input-datetime-local-date', shim).prop('disabled', !!value);
				$('input.input-datetime-local-time', shim).prop('disabled', !!value);
			},
			step: function(orig, shim, value){
				$('input.input-datetime-local-time', shim).attr('step', value);
			},
			//ToDo: use min also on time
			min: function(orig, shim, value){
				if(value){
					value = (value.split) ? value.split('T') : [];
					try {
						value = $.datepicker.parseDate('yy-mm-dd', value[0]);
					} catch(e){value = false;}
				}
				if(!value){
					value = null;
				}
				$('input.input-datetime-local-date', shim).datepicker('option', 'minDate', value);
				
			},
			//ToDo: use max also on time
			max: function(orig, shim, value){
				if(value){
					value = (value.split) ? value.split('T') : [];
					try {
						value = $.datepicker.parseDate('yy-mm-dd', value[0]);
					} catch(e){value = false;}
				}
				if(!value){
					value = null;
				}
				$('input.input-datetime-local-date', shim).datepicker('option', 'maxDate', value);
			},
			value: function(orig, shim, value){
				var dateValue;
				if(value){
					value = (value.split) ? value.split('T') : [];
					try {
						dateValue = $.datepicker.parseDate('yy-mm-dd', value[0]);
					} catch(e){dateValue = false;}
				}
				if(dateValue){
					if(!replaceInputUI['datetime-local'].blockAttr){
						lazySetDate($('input.input-datetime-local-date', shim), dateValue);
					}
					$('input.input-datetime-local-time', shim).prop('value', value[1] || '00:00');
				} else {
					$('input.input-datetime-local-date', shim).prop('value', value[0] || '');
					$('input.input-datetime-local-time', shim).prop('value', value[1] || '');
				}
					
				
			}
		};
			
		
		replaceInputUI.date = function(elem){
			
			if(!$.fn.datepicker){return;}
			var date = $('<input class="input-date" type="text" />'),
				attr  = this.common(elem, date, replaceInputUI.date.attrs),
				change = function(e){
					
					replaceInputUI.date.blockAttr = true;
					var value;
					if(options.lazyDate){
						var timer = $.data(date[0], 'setDateLazyTimer');
						if(timer){
							clearTimeout(timer);
							$.removeData(date[0], 'setDateLazyTimer');
						}
					}
					try {
						value = $.datepicker.parseDate(date.datepicker('option', 'dateFormat'), date.prop('value') );
						value = (value) ? $.datepicker.formatDate( 'yy-mm-dd', value ) : date.prop('value');
					} catch(e){
						value = date.prop('value');
					}
					elem.prop('value', value);
					replaceInputUI.date.blockAttr = false;
					e.stopImmediatePropagation();
					triggerInlineForm(elem[0], 'input');
					triggerInlineForm(elem[0], 'change');
				},
				data = configureDatePicker(elem, date, change)
				
			;
						
			if(attr.css){
				date.css(attr.css);
				if(attr.outerWidth){
					date.outerWidth(attr.outerWidth);
				}
				if(data.trigger[0]){
					adjustInputWithBtn(date, data.trigger);
				}
			}
			
		};
		
		
		replaceInputUI.date.attrs = {
			disabled: function(orig, shim, value){
				$.prop(shim, 'disabled', !!value);
			},
			min: function(orig, shim, value){
				try {
					value = $.datepicker.parseDate('yy-mm-dd', value);
				} catch(e){value = false;}
				if(value){
					$(shim).datepicker('option', 'minDate', value);
				}
			},
			max: function(orig, shim, value){
				try {
					value = $.datepicker.parseDate('yy-mm-dd', value);
				} catch(e){value = false;}
				if(value){
					$(shim).datepicker('option', 'maxDate', value);
				}
			},
			value: function(orig, shim, value){
				if(!replaceInputUI.date.blockAttr){
					try {
						var dateValue = $.datepicker.parseDate('yy-mm-dd', value);
					} catch(e){var dateValue = false;}
					
					if(dateValue){
						lazySetDate($(shim), dateValue);
					} else {
						$.prop(shim, 'value', value);
					}
				}
			}
		};
	}
	if (!modernizrInputTypes.range || options.replaceUI) {
		replaceInputUI.range = function(elem){
			if(!$.fn.slider){return;}
			var range = $('<span class="input-range"><span class="ui-slider-handle" role="slider" tabindex="0" /></span>'),
				attr  = this.common(elem, range, replaceInputUI.range.attrs),
				change = function(e, ui){
					if(e.originalEvent){
						replaceInputUI.range.blockAttr = true;
						elem.prop('value', ui.value);
						replaceInputUI.range.blockAttr = false;
						triggerInlineForm(elem[0], 'input');
						triggerInlineForm(elem[0], 'change');
					}
				}
			;
			
			$('span', range)
				.attr('aria-labeledby', attr.label.attr('id'))
			;
			attr.label.bind('click', function(){
				$('span', range).focus();
				return false;
			});
			
			if(attr.css){
				range.css(attr.css);
				if(attr.outerWidth){
					range.outerWidth(attr.outerWidth);
				}
			}
			range.slider($.extend({}, options.slider, elem.data('slider'), {
				slide: change
			}));
			
			['disabled', 'min', 'max', 'step', 'value'].forEach(function(name){
				var val = elem.attr(name);
				var shadow;
				if(name == 'value' && !val){
					
					shadow = elem.getShadowElement();
					if(shadow){
						val = ($(shadow).slider('option', 'max') - $(shadow).slider('option', 'min')) / 2;
					}
				}
				if(val != null){
					elem.attr(name, val);
				}
			});
		};
		
		replaceInputUI.range.attrs = {
			disabled: function(orig, shim, value){
				value = !!value;
				$(shim).slider( "option", "disabled", value );
				$('span', shim)
					.attr({
						'aria-disabled': value+'',
						'tabindex': (value) ? '-1' : '0'
					})
				;
			},
			min: function(orig, shim, value){
				value = (value) ? value * 1 || 0 : 0;
				$(shim).slider( "option", "min", value );
				$('span', shim).attr({'aria-valuemin': value});
			},
			max: function(orig, shim, value){
				value = (value || value === 0) ? value * 1 || 100 : 100;
				$(shim).slider( "option", "max", value );
				$('span', shim).attr({'aria-valuemax': value});
			},
			value: function(orig, shim, value){
				value = $(orig).prop('valueAsNumber');
				if(!isNaN(value)){
					if(!replaceInputUI.range.blockAttr){
						$(shim).slider( "option", "value", value );
					}
					$('span', shim).attr({'aria-valuenow': value, 'aria-valuetext': value});
				}
			},
			step: function(orig, shim, value){
				value = (value && $.trim(value)) ? value * 1 || 1 : 1;
				$(shim).slider( "option", "step", value );
			}
		};
	}
	
	if(Modernizr.input.valueAsNumberSet && Modernizr.input.valueAsDate && (options.replaceUI || !Modernizr.inputtypes["datetime-local"] || !Modernizr.inputtypes.range)){
		var reflectFn = function(val){
			if(webshims.data(this, 'hasShadow')){
				$.prop(this, 'value', $.prop(this, 'value'));
			}
		};
		
		webshims.onNodeNamesPropertyModify('input', 'valueAsNumber', reflectFn);
		webshims.onNodeNamesPropertyModify('input', 'valueAsDate', reflectFn);
	}
	
	$.each(['disabled', 'min', 'max', 'value', 'step'], function(i, attr){
		webshims.onNodeNamesPropertyModify('input', attr, function(val){
				var shadowData = webshims.data(this, 'shadowData');
				if(shadowData && shadowData.data && shadowData.data[attr] && shadowData.nativeElement === this){
					shadowData.data[attr](this, shadowData.shadowElement, val);
				}
			}
		);
	});
	if(!options.availabeLangs){
		options.availabeLangs = 'af ar ar-DZ az bg bs ca cs da de el en-AU en-GB en-NZ eo es et eu fa fi fo fr fr-CH gl he hr hu hy id is it ja ko kz lt lv ml ms nl no pl pt-BR rm ro ru sk sl sq sr sr-SR sv ta th tr uk vi zh-CN zh-HK zh-TW'.split(' ');
	}
	
	var getDefaults = function(){
		if(!$.datepicker){return;}
		
		webshims.activeLang({
			langObj: $.datepicker.regional, 
			module: 'forms-ext', 
			callback: function(langObj){
				$('input.hasDatepicker').filter('.input-date, .input-datetime-local-date').datepicker('option', $.extend(defaultDatepicker, langObj, options.datepicker));
			}
		});
		$(document).unbind('jquery-uiReady.langchange input-widgetsReady.langchange');
	};
	
	$(document).bind('jquery-uiReady.langchange input-widgetsReady.langchange', getDefaults);
	getDefaults();
	
	//implement set/arrow controls
(function(){
	var supportsType = (function(){
		var types = {};
		return function(type){
			if(type in types){
				return types[type];
			}
			return (types[type] = ($('<input type="'+type+'" />')[0].type === type));
		};
	})();
	
	if(Modernizr.input.valueAsNumber && supportsType('number') && supportsType('time')){return;}
	var doc = document;
	var options = webshims.modules["forms-ext"].options;
	var typeModels = webshims.inputTypes;
	
	var getNextStep = function(input, upDown, cache){
		
		cache = cache || {};
		
		if( !('type' in cache) ){
			cache.type = $.prop(input, 'type');
		}
		if( !('step' in cache) ){
			cache.step = webshims.getStep(input, cache.type);
		}
		if( !('valueAsNumber' in cache) ){
			cache.valueAsNumber = typeModels[cache.type].asNumber($.prop(input, 'value'));
		}
		var delta = (cache.step == 'any') ? typeModels[cache.type].step * typeModels[cache.type].stepScaleFactor : cache.step,
			ret
		;
		webshims.addMinMaxNumberToCache('min', $(input), cache);
		webshims.addMinMaxNumberToCache('max', $(input), cache);
		
		if(isNaN(cache.valueAsNumber)){
			cache.valueAsNumber = typeModels[cache.type].stepBase || 0;
		}
		//make a valid step
		if(cache.step !== 'any'){
			ret = Math.round( ((cache.valueAsNumber - (cache.minAsnumber || 0)) % cache.step) * 1e7 ) / 1e7;
			if(ret &&  Math.abs(ret) != cache.step){
				cache.valueAsNumber = cache.valueAsNumber - ret;
			}
		}
		ret = cache.valueAsNumber + (delta * upDown);
		//using NUMBER.MIN/MAX is really stupid | ToDo: either use disabled state or make this more usable
		if(!isNaN(cache.minAsNumber) && ret < cache.minAsNumber){
			ret = (cache.valueAsNumber * upDown  < cache.minAsNumber) ? cache.minAsNumber : isNaN(cache.maxAsNumber) ? Number.MAX_VALUE : cache.maxAsNumber;
		} else if(!isNaN(cache.maxAsNumber) && ret > cache.maxAsNumber){
			ret = (cache.valueAsNumber * upDown > cache.maxAsNumber) ? cache.maxAsNumber : isNaN(cache.minAsNumber) ? Number.MIN_VALUE : cache.minAsNumber;
		}
		return Math.round( ret * 1e7)  / 1e7;
	};
	
	webshims.modules["forms-ext"].getNextStep = getNextStep;
	
	var doSteps = function(input, type, control){
		if(input.disabled || input.readOnly || $(control).hasClass('step-controls')){return;}
		$.prop(input, 'value',  typeModels[type].numberToString(getNextStep(input, ($(control).hasClass('step-up')) ? 1 : -1, {type: type})));
		$(input).unbind('blur.stepeventshim');
		triggerInlineForm(input, 'input');
		
		
		if( doc.activeElement ){
			if(doc.activeElement !== input){
				try {input.focus();} catch(e){}
			}
			setTimeout(function(){
				if(doc.activeElement !== input){
					try {input.focus();} catch(e){}
				}
				$(input)
					.one('blur.stepeventshim', function(){
						triggerInlineForm(input, 'change');
					})
				;
			}, 0);
			
		}
	};
	
	
	if(options.stepArrows){
		var stepDisableEnable = {
			// don't change getter
			set: function(value){
				var stepcontrols = webshims.data(this, 'step-controls');
				if(stepcontrols){
					stepcontrols[ (this.disabled || this.readonly) ? 'addClass' : 'removeClass' ]('disabled-step-control');
				}
			}
		};
		webshims.onNodeNamesPropertyModify('input', 'disabled', stepDisableEnable);
		webshims.onNodeNamesPropertyModify('input', 'readonly', $.extend({}, stepDisableEnable));
	}
	var stepKeys = {
		38: 1,
		40: -1
	};
	webshims.addReady(function(context, contextElem){
		//ui for numeric values
		if(options.stepArrows){
			$('input', context).add(contextElem.filter('input')).each(function(){
				var type = $.prop(this, 'type');
				if(!typeModels[type] || !typeModels[type].asNumber || !options.stepArrows || (options.stepArrows !== true && !options.stepArrows[type]) || supportsType(type) || $(this).hasClass('has-step-controls')){return;}
				var elem = this;
				var controls = $('<span class="step-controls" unselectable="on"><span class="step-up" /><span class="step-down" /></span>')	
					.insertAfter(this)
					.bind('selectstart dragstart', function(){return false;})
					.bind('mousedown mousepress', function(e){
						doSteps(elem, type, e.target);
						return false;
					})
					.bind('mousepressstart mousepressend', function(e){
						$(e.target)[e.type == 'mousepressstart' ? 'addClass' : 'removeClass']('mousepress-ui');
					})
				;
				var jElm = $(this)
					.addClass('has-step-controls')
					.attr({
						readonly: this.readOnly,
						disabled: this.disabled,
						autocomplete: 'off',
						role: 'spinbutton'
					})
					.bind(($.browser.msie) ? 'keydown' : 'keypress', function(e){
						if(this.disabled || this.readOnly || !stepKeys[e.keyCode]){return;}
						$.prop(this, 'value',  typeModels[type].numberToString(getNextStep(this, stepKeys[e.keyCode], {type: type})));
						triggerInlineForm(this, 'input');
						return false;
					})
				;
				webshims.data(this, 'step-controls', controls);
				if(options.calculateWidth){
					adjustInputWithBtn(jElm, controls);
					controls.css('marginTop', (jElm.outerHeight() - controls.outerHeight())  / 2 );
				}
			});
		}
	});
})();

	
	webshims.addReady(function(context, elem){
		$(document).bind('jquery-uiReady.initinputui input-widgetsReady.initinputui', function(e){
			if($.datepicker || $.fn.slider){
				replaceInputUI(context, elem);
			}
			if($.datepicker && $.fn.slider){
				$(document).unbind('.initinputui');
			} else if(!webshims.modules["input-widgets"].src){
				webshims.warn('jQuery UI Widget factory is already included, but not datepicker or slider. configure src of $.webshims.modules["input-widgets"].src');
			}
		});
	});
	
});

jQuery.webshims.ready('dom-support forms', function($, webshims, window, document, undefined){
	var doc = document;	

	/*
	 * implement propType "element" currently only used for list-attribute (will be moved to dom-extend, if needed)
	 */
	webshims.propTypes.element = function(descs){
		webshims.createPropDefault(descs, 'attr');
		if(descs.prop){return;}
		descs.prop = {
			get: function(){
				var elem = descs.attr.get.call(this);
				if(elem){
					elem = $('#'+elem)[0];
					if(elem && descs.propNodeName && !$.nodeName(elem, descs.propNodeName)){
						elem = null;
					}
				}
				return elem || null;
			},
			writeable: false
		};
	};
	
	
	/*
	 * Implements datalist element and list attribute
	 */
	
	(function(){
		if(Modernizr.datalist){return;}
		
			var initializeDatalist =  function(){
				
				webshims.defineNodeNameProperties('input', {
				'list': {
					attr: {
						get: function(){
							var val = webshims.contentAttr(this, 'list');
							return (val == null) ? undefined : val;
						},
						set: function(value){
							var elem = this;
							webshims.contentAttr(elem, 'list', value);
							webshims.objectCreate(shadowListProto, undefined, {input: elem, id: value, datalist: $.prop(elem, 'list')});
						}
					},
					initAttr: true,
					reflect: true,
					propType: 'element',
					propNodeName: 'datalist'
				},
				
				//currently not supported x-browser (FF4 has not implemented and is not polyfilled )
				selectedOption: {
					prop: {
						writeable: false,
						get: function(){
							var elem = this;
							var list = $.prop(elem, 'list');
							var ret = null;
							var value, options;
							if(!list){return ret;}
							value = $.attr(elem, 'value');
							if(!value){return ret;}
							options = $.prop(list, 'options');
							if(!options.length){return ret;}
							$.each(options, function(i, option){
								if(value == $.prop(option, 'value')){
									ret = option;
									return false;
								}
							});
							return ret;
						}
					}
				},
				
				//override autocomplete
				autocomplete: {
					attr: {
						get: function(){
							var elem = this;
							var data = $.data(elem, 'datalistWidget');
							if(data){
								return data._autocomplete;
							}
							return ('autocomplete' in elem) ? elem.autocomplete : elem.getAttribute('autocomplete');
						},
						set: function(value){
							var elem = this;
							var data = $.data(elem, 'datalistWidget');
							if(data){
								data._autocomplete = value;
								if(value == 'off'){
									data.hideList();
								}
							} else {
								if('autocomplete' in elem){
									elem.autocomplete = value;
								} else {
									elem.setAttribute('autocomplete', value);
								}
							}
						}
					}
				}
			});
						
			webshims.defineNodeNameProperty('datalist', 'options', {
				prop: {
					writeable: false,
					get: function(){
						var elem = this;
						var select = $('select', elem);
						return (select[0]) ? select[0].options : [];
					}
				}
			});
			
			
			
			webshims.addReady(function(context, contextElem){
				contextElem.filter('select, option').each(function(){
					var parent = this.parentNode;
					var isDatalist = $.nodeName(parent, 'datalist');
					if(parent && !isDatalist){
						parent = parent.parentNode;
						isDatalist = $.nodeName(parent, 'datalist');
					}
					if(parent && isDatalist){
						$(parent).triggerHandler('updateDatalist');
					}
				});
			});
			
			
		};
		
		
		/*
		 * ShadowList
		 */
		var listidIndex = 0;
		
		var noDatalistSupport = {
			submit: 1,
			button: 1,
			reset: 1, 
			hidden: 1,
			
			//ToDo
			range: 1,
			date: 1
		};
		var lteie6 = ($.browser.msie && parseInt($.browser.version, 10) < 7);
		var globStoredOptions = {};
		var getStoredOptions = function(name){
			if(!name){return [];}
			if(globStoredOptions[name]){
				return globStoredOptions[name];
			}
			var data;
			webshims.ready('json-storage', function(){
				try {
					data = JSON.parse(localStorage.getItem('storedDatalistOptions'+name));
				} catch(e){}
				globStoredOptions[name] = data || [];
			});
			return data || [];
		};
		var storeOptions = function(name, val){
			if(!name){return;}
			val = val || [];
			try {
				localStorage.setItem( 'storedDatalistOptions'+name, JSON.stringify(val) );
			} catch(e){}
		};
		var getType = function(elem){
			return (elem.getAttribute('type') || '').toLowerCase() || elem.type;
		};
		var getText = function(elem){
			return (elem.textContent || elem.innerText || $.text([ elem ]) || '');
		};
		
		var shadowListProto = {
			_create: function(opts){
				
				if(noDatalistSupport[getType(opts.input)]){return;}
				var datalist = opts.datalist;
				var data = $.data(opts.input, 'datalistWidget');
				if(datalist && data && data.datalist !== datalist){
					data.datalist = datalist;
					data.id = opts.id;
					data._resetListCached();
					return;
				} else if(!datalist){
					if(data){
						data.destroy();
					}
					return;
				} else if(data && data.datalist === datalist){
					return;
				}
				listidIndex++;
				var that = this;
				this.timedHide = function(){
					clearTimeout(that.hideTimer);
					that.hideTimer = setTimeout($.proxy(that, 'hideList'), 9);
				};
				this.datalist = datalist;
				this.id = opts.id;
				this.hasViewableData = true;
				this._autocomplete = $.attr(opts.input, 'autocomplete');
				$.data(opts.input, 'datalistWidget', this);
				this.shadowList = $('<div class="datalist-polyfill" />').appendTo('body');
				
				this.index = -1;
				this.input = opts.input;
				this.arrayOptions = [];
				
				this.shadowList
					.delegate('li', 'mouseover.datalistWidget mousedown.datalistWidget click.datalistWidget', function(e){
						var items = $('li:not(.hidden-item)', that.shadowList);
						var select = (e.type == 'mousedown' || e.type == 'click');
						that.markItem(items.index(e.target), select, items);
						if(e.type == 'click'){
							that.hideList();
						}
						return (e.type != 'mousedown');
					})
					.bind('focusout', this.timedHide)
				;
				
				opts.input.setAttribute('autocomplete', 'off');
				
				$(opts.input)
					.attr({
						//role: 'combobox',
						'aria-haspopup': 'true'
					})
					.bind('input.datalistWidget', $.proxy(this, 'showHideOptions'))
					.bind('keydown.datalistWidget', function(e){
						var keyCode = e.keyCode;
						var items;
						if(keyCode == 40 && !that.showList()){
							that.markItem(that.index + 1, true);
							return false;
						}
						
						if(!that.isListVisible){return;}
						
						 
						if(keyCode == 38){
							that.markItem(that.index - 1, true);
							return false;
						} 
						if(!e.shiftKey && (keyCode == 33 || keyCode == 36)){
							that.markItem(0, true);
							return false;
						} 
						if(!e.shiftKey && (keyCode == 34 || keyCode == 35)){
							items = $('li:not(.hidden-item)', that.shadowList);
							that.markItem(items.length - 1, true, items);
							return false;
						} 
						if(keyCode == 13 || keyCode == 27){
							if (keyCode == 13){
								var activeItem = $('li.active-item:not(.hidden-item)', that.shadowList);
								if(activeItem[0]){
									$.prop(that.input, 'value', activeItem.attr('data-value'));
									$(that.input).triggerHandler('updateInput');
								}
							}
							that.hideList();
							return false;
						}
					})
					.bind('focus.datalistWidget', function(){
						if($(this).hasClass('list-focus')){
							that.showList();
						}
					})
					.bind('blur.datalistWidget', this.timedHide)
				;
				
				
				$(this.datalist)
					.unbind('updateDatalist.datalistWidget')
					.bind('updateDatalist.datalistWidget', $.proxy(this, '_resetListCached'))
				;
				
				this._resetListCached();
				
				if(opts.input.form && opts.input.id){
					$(opts.input.form).bind('submit.datalistWidget'+opts.input.id, function(){
						var val = $.prop(opts.input, 'value');
						that.storedOptions = getStoredOptions(opts.input.name || opts.input.id);
						if(val && that.storedOptions.indexOf(val) == -1){
							that.storedOptions.push(val);
							storeOptions(opts.input.name || opts.input.id, that.storedOptions );
						}
					});
				}
				$(window).bind('unload', function(){
					that.destroy();
				});
			},
			destroy: function(){
				var autocomplete = $.attr(this.input, 'autocomplete');
				$(this.input)
					.unbind('.datalistWidget')
					.removeData('datalistWidget')
				;
				this.shadowList.remove();
				$(document).unbind('.datalist'+this.id);
				if(this.input.form && this.input.id){
					$(this.input.form).unbind('submit.datalistWidget'+this.input.id);
				}
				this.input.removeAttribute('aria-haspopup');
				if(autocomplete === undefined){
					this.input.removeAttribute('autocomplete');
				} else {
					$(this.input).attr('autocomplete', autocomplete);
				}
			},
			_resetListCached: function(e){
				var that = this;
				this.needsUpdate = true;
				this.lastUpdatedValue = false;
				this.lastUnfoundValue = '';
				
				
				if(!this.updateTimer){
					this.updateTimer = setTimeout(function(){
						that.updateListOptions((e && document.activeElement == that.input));
						that = null;
					}, 0);
				}
			},
			updateListOptions: function(_forceShow){
				this.needsUpdate = false;
				clearTimeout(this.updateTimer);
				this.updateTimer = false;
				this.shadowList
					.css({
						fontSize: $.curCSS(this.input, 'fontSize'),
						fontFamily: $.curCSS(this.input, 'fontFamily')
					})
				;
				var list = [];
				
				var values = [];
				var allOptions = [];
				var rElem;
				var rItem;
				for(var rOptions = $('option', this.datalist), rI = 0, rLen = $('option', this.datalist).length; rI < rLen; rI++){
					rElem = rOptions[rI];
					if(rElem.disabled){return;}
					rItem = {
						value: $(rElem).val() || '',
						text: $.trim($.attr(rElem, 'label') || getText(rElem)),
						className: rElem.className || '',
						style: $.attr(rElem, 'style') || ''
					};
					if(!rItem.text){
						rItem.text = rItem.value;
					}
					values[rI] = rItem.value;
					allOptions[rI] = rItem;
				}
				
				this.storedOptions = getStoredOptions(this.input.name || this.input.id);
				this.storedOptions.forEach(function(val, i){
					if(values.indexOf(val) == -1){
						allOptions.push({value: val, text: val, className: '', style: ''});
					}
				});
				
				allOptions.forEach(function(item, i){
					var val = item.value.indexOf('"') != -1 ? "'"+ item.value +"'" : '"' + item.value +'"';
					list[i] = '<li data-value='+ val +' class="'+ item.className +'" style="'+ item.style +'" tabindex="-1" role="listitem">'+ item.text +'</li>';
				});
				
				this.arrayOptions = allOptions;
				this.shadowList.html('<ul role="list" class="'+ (this.datalist.className || '') + ' '+ this.datalist.id +'-shadowdom' +'">'+ list.join("\n") +'</ul>');
				
				if($.fn.bgIframe && lteie6){
					this.shadowList.bgIframe();
				}
				
				if(_forceShow || this.isListVisible){
					this.showHideOptions();
				}
			},
			showHideOptions: function(){
				var value = $.prop(this.input, 'value').toLowerCase();
				//first check prevent infinite loop, second creates simple lazy optimization
				if(value === this.lastUpdatedValue || (this.lastUnfoundValue && value.indexOf(this.lastUnfoundValue) === 0)){
					return;
				}
				
				this.lastUpdatedValue = value;
				var found = false;
				var lis = $('li', this.shadowList);
				if(value){
					this.arrayOptions.forEach(function(item, i){
						if(!('lowerText' in item)){
							item.lowerText = item.text.toLowerCase();
							item.lowerValue = item.value.toLowerCase();
						}
						
						if(item.lowerText.indexOf(value) !== -1 || item.lowerValue.indexOf(value) !== -1){
							$(lis[i]).removeClass('hidden-item');
							found = true;
						} else {
							$(lis[i]).addClass('hidden-item');
						}
					});
				} else {
					lis.removeClass('hidden-item');
					found = true;
				}
				
				this.hasViewableData = found;
				
				if(found){
					this.showList();
				} else {
					this.lastUnfoundValue = value;
					this.hideList();
				}
			},
			showList: function(){
				if(this.isListVisible){return false;}
				if(this.needsUpdate){
					this.updateListOptions();
				}
				this.showHideOptions();
				if(!this.hasViewableData){return false;}
				var that = this;
				var css = $(this.input).offset();
				css.top += $(this.input).outerHeight();
				
				css.width = $(this.input).outerWidth() - (parseInt(this.shadowList.css('borderLeftWidth'), 10)  || 0) - (parseInt(this.shadowList.css('borderRightWidth'), 10)  || 0);
				
				if(lteie6){
					this.shadowList.css('height', 'auto');
					if(this.shadowList.height() > 250){
						this.shadowList.css('height', 220);
					}
				}
				this.shadowList.css(css).addClass('datalist-visible');
				this.isListVisible = true;
				//todo
				$(document).bind('mousedown.datalist'+this.id +' focusin.datalist'+this.id, function(e){
					if(e.target === that.input ||  that.shadowList[0] === e.target || $.contains( that.shadowList[0], e.target )){
						clearTimeout(that.hideTimer);
						setTimeout(function(){
							clearTimeout(that.hideTimer);
						}, 0);
					} else {
						that.timedHide();
					}
				});
				return true;
			},
			hideList: function(){
				if(!this.isListVisible){return false;}
				this.shadowList
					.removeClass('datalist-visible list-item-active')
					.scrollTop(0)
					.find('li.active-item').removeClass('active-item')
				;
				this.index = -1;
				this.isListVisible = false;
				$(this.input).removeAttr('aria-activedescendant');
				$(document).unbind('.datalist'+this.id);
				return true;
			},
			scrollIntoView: function(elem){
				var ul = $('> ul', this.shadowList);
				var elemPos = elem.position();
				var containerHeight;
				elemPos.top -=  (parseInt(ul.css('paddingTop'), 10) || 0) + (parseInt(ul.css('marginTop'), 10) || 0) + (parseInt(ul.css('borderTopWidth'), 10) || 0);
				if(elemPos.top < 0){
					this.shadowList.scrollTop( this.shadowList.scrollTop() + elemPos.top - 2);
					return;
				}
				elemPos.top += elem.outerHeight();
				containerHeight = this.shadowList.height();
				if(elemPos.top > containerHeight){
					this.shadowList.scrollTop( this.shadowList.scrollTop() + (elemPos.top - containerHeight) + 2);
				}
			},
			markItem: function(index, doValue, items){
				var activeItem;
				var goesUp;
				items = items || $('li:not(.hidden-item)', this.shadowList);
				if(!items.length){return;}
				if(index < 0){
					index = items.length - 1;
				} else if(index >= items.length){
					index = 0;
				}
				items.removeClass('active-item');
				this.shadowList.addClass('list-item-active');
				activeItem = items.filter(':eq('+ index +')').addClass('active-item');
				
				if(doValue){
					$.prop(this.input, 'value', activeItem.attr('data-value'));
					$.attr(this.input, 'aria-activedescendant', $.webshims.getID(activeItem));
					$(this.input).triggerHandler('updateInput');
					this.scrollIntoView(activeItem);
				}
				this.index = index;
			}
		};
		
		//init datalist update
		initializeDatalist();
	})();
	
	if(webshims.modules['forms-ext'].src == 'form-datalist'){
		webshims.isReady('forms-ext', true);
	} else {
		setTimeout(function(){
			if(!webshims.isReady('forms-ext')){
				webshims.warn("setting forms-ext ready from datalist");
				webshims.isReady('forms-ext', true);
			}
		}, 9999);
	}
});