jQuery.webshims.register('forms-ext', function($, webshims, window){
	
	"use strict";
	if(Modernizr.input.valueAsNumberSet && Modernizr.input.valueAsDate){return;}
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
			return (Modernizr.input.valueAsNumber && $('<input type="'+type+'" />').attr('type') === type);
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
	
	if(!Modernizr.input.valueAsNumber || !Modernizr.input.valueAsDate){
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
	}
	
	
	// add support for new input-types
	webshims.defineNodeNameProperty('input', 'type', {
		get: function(){
			var elem = this;
			var type = getType(elem);
			return (webshims.inputTypes[type]) ? type : elem.type || elem.getAttribute('type');
		}
	});
	
	//IDLs and methods, that aren't part of constrain validation, but strongly tight to it
	var valueAsNumberDescriptor = webshims.defineNodeNameProperty('input', 'valueAsNumber', {
		get: function(){
			var elem = this;
			var type = getType(elem);
			return (typeModels[type] && typeModels[type].asNumber) ? 
				typeModels[type].asNumber($.attr(elem, 'value')) :
				nan;
		},
		set: function(val){
			var elem = this;
			var type = getType(elem);
			if(typeModels[type] && typeModels[type].numberToString){
				//is NaN a number?
				if(isNaN(val)){
					$.attr(elem, 'value', '');
					return;
				}
				var set = typeModels[type].numberToString(val);
				if(set !==  false){
					$.attr(elem, 'value', set);
				} else {
					webshims.warn('INVALID_STATE_ERR: DOM Exception 11');
				}
			} else {
				valueAsNumberDescriptor._supset && valueAsNumberDescriptor._supset.call(elem, arguments);
			}
		}
	});
	
	var valueAsDateDescriptor = webshims.defineNodeNameProperty('input', 'valueAsDate', {
		get: function(){
			var elem = this;
			var type = getType(elem);
			return (typeModels[type] && typeModels[type].asDate && !typeModels[type].noAsDate) ? 
				typeModels[type].asDate($.attr(elem, 'value')) :
				valueAsDateDescriptor._supget && valueAsDateDescriptor._supget.call(elem);
		},
		set: function(value){
			var elem = this;
			var type = getType(elem);
			if(typeModels[type] && typeModels[type].dateToString){
				
				if(value === null){
					$.attr(elem, 'value', '');
					return '';
				}
				var set = typeModels[type].dateToString(value);
				if(set !== false){
					$.attr(elem, 'value', set);
					return set;
				} else {
					webshims.warn('INVALID_STATE_ERR: DOM Exception 11');
				}
			} else {
				return valueAsDateDescriptor._supset && valueAsDateDescriptor._supset(elem, arguments) || null;
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
	var adjustInputWithBtn = function(input, button){
		var inputDim = {
			w: input.width()
		};
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
			input.css('width', Math.floor(inputDim.w + controlDim.mL));
		} else {
			button.css('marginRight', inputDim.mR);
			input.css('width',  Math.floor(inputDim.w - controlDim.mL - controlDim.w));
		}
	};
		
	var options = $.webshims.cfg['forms-ext'];
	var defaultDatepicker = {dateFormat: 'yy-mm-dd'};
	var globalInvalidTimer;
	var setLangDefaults;
	var labelID = 0;
	var emptyJ = $([]);
	var isCheckValidity;
	var replaceInputUI = function(context, elem){
		$('input', context).add(elem.filter('input')).each(function(){
			var type = $.attr(this, 'type');
			if(replaceInputUI[type]  && !$.data(this, 'inputUIReplace')){
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
	
	replaceInputUI.common = function(orig, shim, methods){
		if(Modernizr.formvalidation){
			orig.bind('firstinvalid', function(e){
				clearTimeout(globalInvalidTimer);
				if(isCheckValidity){return;}
				globalInvalidTimer = setTimeout(function(){
					if(!isCheckValidity && !e.isInvalidUIPrevented()){
						webshims.validityAlert.showFor( e.target ); 
					}
				}, 20);//timeout has to be less than 30!
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
		shim.addClass(orig[0].className).data('html5element', orig);
		orig
			.after(shim)
			.data('inputUIReplace', {visual: shim, methods: methods})
			.hide()
		;
		
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
				value: function(){
					isCheckValidity = true;
					var ret = desc._supvalue.apply(this, arguments);
					isCheckValidity = false;
					return ret;
				}
			});
		});
	}
	//date and datetime-local implement if we have to replace
	if(!modernizrInputTypes.datetime || options.replaceUI){
		var datetimeFactor = {
			trigger: [0.65,0.35],
			normal: [0.57,0.43]
		};
		var subPixelCorrect = (!$.browser.msie || parseInt($.browser.version, 10) > 6) ? 0 : 0.45;
		replaceInputUI['datetime-local'] = function(elem){
			if(!$.fn.datepicker){return;}
			
			var date = $('<span role="group" class="input-datetime-local"><input type="text" class="input-datetime-local-date" /><input type="time" class="input-datetime-local-time" /></span>'),
				attr  = this.common(elem, date, replaceInputUI['datetime-local'].attrs),
				datePicker = $('input.input-datetime-local-date', date),
				data = datePicker
					.datepicker($.extend(defaultDatepicker, options.datepicker, elem.data('datepicker')))
					.bind('change', function(e){
						
						var value = datePicker.attr('value') || '', 
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
							timeVal = $('input.input-datetime-local-time', date).attr('value') || '00:00';
							try {
								value = $.datepicker.parseDate(datePicker.datepicker('option', 'dateFormat'), value);
								value = (value) ? $.datepicker.formatDate('yy-mm-dd', value) : datePicker.attr('value');
							} catch (e) {value = datePicker.attr('value');}
						} 
						value = (!value && !timeVal) ? '' : value + 'T' + timeVal;
						replaceInputUI['datetime-local'].blockAttr = true;
						elem.attr('value', value);
						replaceInputUI['datetime-local'].blockAttr = false;
						e.stopImmediatePropagation();
						triggerInlineForm(elem[0], 'input');
						triggerInlineForm(elem[0], 'change');
					})
					.data('datepicker')
			;
			
			data.dpDiv
				.addClass('input-date-datepicker-control')
				.css({
					fontSize: datePicker.css('fontSize'),
					fontFamily: datePicker.css('fontFamily')
				})
			;
			$('input.input-datetime-local-time', date).bind('change', function(e){
				var timeVal = $.attr(this, 'value');
				var val = ['', ''];
				if(timeVal){
					val = elem.attr('value').split('T');
					if((val.length < 2 || !val[0])){
						val[0] = $.datepicker.formatDate('yy-mm-dd', new Date());
					}
					val[1] = timeVal;
					
					if (timeVal) {
						try {
							datePicker.attr('value', $.datepicker.formatDate(datePicker.datepicker('option', 'dateFormat'), $.datepicker.parseDate('yy-mm-dd', val[0])));
						} catch (e) {}
					}
				}
				val = (!val[0] && !val[1]) ? '' : val.join('T');
				replaceInputUI['datetime-local'].blockAttr = true;
				elem.attr('value', val);
				replaceInputUI['datetime-local'].blockAttr = false;
				e.stopImmediatePropagation();
				triggerInlineForm(elem[0], 'input');
				triggerInlineForm(elem[0], 'change');
			});
			
			$('input', date).data('html5element', $.data(date[0], 'html5element'));
			
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
			
			webshims.triggerDomUpdate(date[0]);
			if(setLangDefaults){
				$.each(['disabled', 'min', 'max', 'value', 'step'], function(i, name){
					elem.attr(name, function(i, value){return value || '';});
				});
			}
		};
		
		replaceInputUI['datetime-local'].attrs = {
			disabled: function(orig, shim, value){
				$('input.input-datetime-local-date', shim).attr('disabled', !!value);
				$('input.input-datetime-local-time', shim).attr('disabled', !!value);
			},
			step: function(orig, shim, value){
				$('input.input-datetime-local-time', shim).attr('step', value);
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
				
					var dateValue;
					value = (value.split) ? value.split('T') : [];
					try {
						dateValue = $.datepicker.parseDate('yy-mm-dd', value[0]);
					} catch(e){dateValue = false;}
					if(dateValue){
						if(!replaceInputUI['datetime-local'].blockAttr){
							lazySetDate($('input.input-datetime-local-date', shim), dateValue);
						}
						$('input.input-datetime-local-time', shim).attr('value', value[1] || '00:00');
					} else {
						$('input.input-datetime-local-date', shim).attr('value', value[0] || '');
						$('input.input-datetime-local-time', shim).attr('value', value[1] || '');
					}
					
				
			}
		};
		
		replaceInputUI.date = function(elem){
			
			if(!$.fn.datepicker){return;}
			var date = $('<input type="text" class="input-date" />'),
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
						value = $.datepicker.parseDate(date.datepicker('option', 'dateFormat'), date.attr('value') );
						value = (value) ? $.datepicker.formatDate( 'yy-mm-dd', value ) : date.attr('value');
					} catch(e){
						value = date.attr('value');
					}
					elem.attr('value', value);
					replaceInputUI.date.blockAttr = false;
					e.stopImmediatePropagation();
					triggerInlineForm(elem[0], 'input');
					triggerInlineForm(elem[0], 'change');
				},
				data = date
					.datepicker($.extend(defaultDatepicker, options.datepicker, elem.data('datepicker')))
					.bind('change', change)
					.data('datepicker')
			;
			
			data.dpDiv
				.addClass('input-date-datepicker-control')
				.css({
					fontSize: date.css('fontSize'),
					fontFamily: date.css('fontFamily')
				})
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
			if(setLangDefaults){
				$.each(['disabled', 'min', 'max', 'value'], function(i, name){
					elem.attr(name, function(i, value){return value || '';});
				});
			}
		};
		
		
		replaceInputUI.date.attrs = {
			disabled: function(orig, shim, value){
				shim.attr('disabled', !!value);
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
						lazySetDate(shim, dateValue);
					} else {
						shim.attr('value', value);
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
						elem.attr('value', ui.value);
						replaceInputUI.range.blockAttr = false;
						if(e.type == 'slidechange'){
							triggerInlineForm(elem[0], 'change');
						} else {
							triggerInlineForm(elem[0], 'input');
						}
					}
				}
			;
			
			$('span', range).attr('aria-labeledby', attr.label.attr('id'));
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
				change: change,
				slide: change
			}));
			
			$.each(['disabled', 'min', 'max', 'value', 'step'], function(i, name){
				elem.attr(name, function(i, value){return value || '';});
			});
		};
		
		replaceInputUI.range.attrs = {
			disabled: function(orig, shim, value){
				value = !!value;
				shim.slider( "option", "disabled", value );
				$('span', shim)
					.attr({
						'aria-disabled': value+'',
						'tabindex': (value) ? '-1' : '0'
					})
				;
			},
			min: function(orig, shim, value){
				value = (value) ? value * 1 || 0 : 0;
				shim.slider( "option", "min", value );
				$('span', shim).attr({'aria-valuemin': value});
			},
			max: function(orig, shim, value){
				value = (value || value === 0) ? value * 1 || 100 : 100;
				shim.slider( "option", "max", value );
				$('span', shim).attr({'aria-valuemax': value});
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
				$('span', shim).attr({'aria-valuenow': value, 'aria-valuetext': value});
			},
			step: function(orig, shim, value){
				value = (value && $.trim(value)) ? value * 1 || 1 : 1;
				shim.slider( "option", "step", value );
			}
		};
	}
	
	if(Modernizr.input.valueAsNumberSet && Modernizr.input.valueAsDate && (options.replaceUI || !Modernizr.inputtypes["datetime-local"] || !Modernizr.inputtypes.range)){
		var reflectFn = function(val){
			if($.data(this, 'inputUIReplace')){
				$.attr(this, 'value', $.attr(this, 'value'));
			}
		};
		
		webshims.onNodeNamesPropertyModify('input', 'valueAsNumber', reflectFn);
		webshims.onNodeNamesPropertyModify('input', 'valueAsDate', reflectFn);
	}
	
	$.each(['disabled', 'min', 'max', 'value', 'step'], function(i, attr){
		webshims.onNodeNamesPropertyModify('input', attr, {
			set: function(val){
				var widget = $.data(this, 'inputUIReplace');
				if(widget && widget.methods[attr]){
					widget.methods[attr](this, widget.visual, val);
				}
			}
		});
	});
	if(!options.availabeLangs){
		options.availabeLangs = 'af ar ar-DZ az bg bs ca cs da de el en-AU en-GB en-NZ eo es et eu fa fi fo fr fr-CH gl he hr hu hy id is it ja ko kz lt lv ml ms nl no pl pt-BR rm ro ru sk sl sq sr sr-SR sv ta th tr uk vi zh-CN zh-HK zh-TW'.split(' ');
	}
	var changeDefaults = function(langObj){
		setLangDefaults = true;
		if(!langObj){return;}
		$.extend(defaultDatepicker, langObj, options.datepicker);
		$('input.hasDatepicker').filter('.input-date, .input-datetime-local-date').datepicker('option', defaultDatepicker).each(function(){
			var orig = $.data(this, 'html5element');
			if(orig){
				$.each(['disabled', 'min', 'max', 'value'], function(i, name){
					orig.attr(name, function(i, value){return value || '';});
				});
			}
		});
		
	};
	var getDefaults = function(){
		if(!$.datepicker){return;}
		webshims.ready('webshimLocalization', function(){
			webshims.activeLang($.datepicker.regional, 'forms-ext', changeDefaults, function(){
				setLangDefaults = true;
			});
		});
		$(document).unbind('jquery-uiReady.langchange input-widgetsReady.langchange');
	};
	
	$(document).bind('jquery-uiReady.langchange input-widgetsReady.langchange', getDefaults);
	getDefaults();
	
	//implement set/arrow controls
(function(){
	if(Modernizr.input.valueAsNumber){return;}
	var doc = document;
	var options = webshims.modules["forms-ext"].options;
	var typeModels = webshims.inputTypes;
	
	var getNextStep = function(input, upDown, cache){
		
		cache = cache || {};
		
		if( !('type' in cache) ){
			cache.type = $.attr(input, 'type');
		}
		if( !('step' in cache) ){
			cache.step = webshims.getStep(input, cache.type);
		}
		if( !('valueAsNumber' in cache) ){
			cache.valueAsNumber = typeModels[cache.type].asNumber($.attr(input, 'value'));
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
		$.attr(input, 'value',  typeModels[type].numberToString(getNextStep(input, ($(control).hasClass('step-up')) ? 1 : -1, {type: type})));
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
				var stepcontrols = $.data(this, 'step-controls');
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
				var type = $.attr(this, 'type');
				if(!typeModels[type] || !typeModels[type].asNumber || !options.stepArrows || (options.stepArrows !== true && !options.stepArrows[type]) || $(this).hasClass('has-step-controls')){return;}
				var elem = this;
				var controls = $('<span class="step-controls" unselectable="on"><span class="step-up" /><span class="step-down" /></span>')	
					.insertAfter(this)
					.bind('selectstart dragstart', function(){return false;})
					.bind('mousedown mousepress', function(e){
						doSteps(elem, type, e.target);
						return false;
					})
				;
				var jElm = $(this)
					.addClass('has-step-controls')
					.data('step-controls', controls)
					.attr({
						readonly: this.readOnly,
						disabled: this.disabled,
						autocomplete: 'off',
						role: 'spinbutton'
					})
					.bind(($.browser.msie) ? 'keydown' : 'keypress', function(e){
						if(this.disabled || this.readOnly || !stepKeys[e.keyCode]){return;}
						$.attr(this, 'value',  typeModels[type].numberToString(getNextStep(this, stepKeys[e.keyCode], {type: type})));
						triggerInlineForm(this, 'input');
						return false;
					})
				;
				
				if(options.calculateWidth){
					adjustInputWithBtn(jElm, controls);
					controls.css('marginTop', (jElm.outerHeight() - controls.outerHeight())  / 2 );
				}
			});
		}
	});
})();
	
	if(webshims.cfg.waitReady){
		$.readyWait++;
	}
	webshims.addReady(function(context, elem){
		
		$(document).bind('jquery-uiReady.initinputui input-widgetsReady.initinputui', function(e){
			if($.datepicker || $.fn.slider){
				replaceInputUI(context, elem);
			}
			
			if($.datepicker && $.fn.slider){
				$(document).unbind('.initinputui');
			}
			if(webshims.cfg.waitReady && context === document){
				$.ready(true);
			}
		});
	});
});

