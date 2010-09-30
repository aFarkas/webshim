/* fix chrome 5/6 and safari 5 implemenation + add some usefull custom invalid event called firstinvalid */
(function($){
	var firstEvent,
		invalids = [],
		stopSubmitTimer,
		form
	;
	
	//opera fix
	//opera throws a submit-event and then the invalid events,
	//the following code will trigger the invalid events first and webkitfix will stopImmediatePropagation of submit event
	if($.support.validity === true && document.addEventListener && !window.noHTMLExtFixes && window.opera){
		document.addEventListener('submit', function(e){
			if(e.target.checkValidity){
				e.target.checkValidity();
			}
		}, true);
	}
	$(document).bind('invalid', function(e){
		if(!firstEvent){
			//webkitfix 
			//chrome/safari submits an invalid form, if you prevent all invalid events
			//this also prevents opera from throwing a submit event if form isn't valid
			form = e.target.form;
			if ($.support.validity === true && form && !window.noHTMLExtFixes){
				var submitEvents = $(form)
					.bind('submit.preventInvalidSubmit', function(submitEvent){
						if( $.attr(form, 'novalidate') === undefined ){
							submitEvent.stopImmediatePropagation();
							return false;
						}
					})
					.data('events').submit
				;
				//add this handler as first executing handler
				if (submitEvents && submitEvents.length > 1) {
					submitEvents.unshift(submitEvents.pop());
				}
			}
			
			//trigger firstinvalid
			firstEvent = $.Event('firstinvalid');
			$(e.target).trigger(firstEvent);
		}
		//if firstinvalid was prevented all invalids will be also prevented
		if( firstEvent && firstEvent.isDefaultPrevented() ){
			e.preventDefault();
		}
		invalids.push(e.target);
		clearTimeout(stopSubmitTimer);
		stopSubmitTimer = setTimeout(function(){
			var lastEvent = {type: 'lastinvalid', cancelable: false, invalidlist: $(invalids)};
			//reset firstinvalid
			firstEvent = false;
			//remove webkitfix
			$(form).unbind('submit.preventInvalidSubmit');
			invalids = [];
			$(e.target).trigger(lastEvent, lastEvent);
		}, 9);
		
	});
	
	
	/* some extra validation UI */
	var ValidityAlert = function(){this._create();};
	
	ValidityAlert.prototype = {
		_create: function(){
			this.alert = $('<div class="validity-alert" role="alert"><div class="va-box" /></div>').css({position: 'absolute', display: 'none'});
			this.hideTimer = false;
			this.boundHide = $.proxy(this, 'hide');
		},
		hideDelay: 5000,
		createAlert: function(){
			if(this.created){return;}
			this.created = true;
			var that = this;
			$(function(){that.alert.appendTo('body');});
		},
		showFor: function(elem, noFocus){
			elem = $(elem);
			var widget = elem.data('inputUIReplace');
			if(widget){
				elem = widget.visual;
			}
			this.createAlert();
			this.clear();
			this.getMessage(elem);
			this.position(elem);
			this.show();
			if(!noFocus){
				elem.focus();
			}
			this.hideTimer = setTimeout(this.boundHide, this.hideDelay);
			$(document).bind('focusout.validityalert', this.boundHide);
		},
		getMessage: function(elem){
			$('> div', this.alert).html(elem.attr('validationMessage'));
		},
		position: function(elem){
			var offset = elem.offset();
			offset.top += elem.outerHeight();
			this.alert.css(offset);
		},
		clear: function(){
			clearTimeout(this.hideTimer);
			$(document).unbind('focusout.validityalert');
			this.alert.stop().css({opacity: ''});
		},
		show: function(){
			this.alert.fadeIn();
		},
		hide: function(){
			this.clear();
			this.alert.fadeOut();
		}
	};
	$.webshims.validityAlert = new ValidityAlert();
	
	$.webshims.validityMessages['en'] = $.webshims.validityMessages['en'] || $.webshims.validityMessages['en-US'] || {
		typeMismatch: {
			email: '{%value} is not a legal email address',
			url: '{%value} is not a valid web address',
			number: '{%value} is not a number!',
			date: '{%value} is not a date',
			time: '{%value} is not a time',
			range: '{%value} is not a number!',
			"datetime-local": '{%value} is not a correct date-time format.'
		},
		rangeUnderflow: '{%value} is too low. The lowest value you can use is {%min}.',
		rangeOverflow: '{%value}  is too high. The highest value you can use is {%max}.',
		stepMismatch: 'The value {%value} is not allowed for this form. Only certain values are allowed for this field. {%title}',
		tooLong: 'The entered text is too large! You used {%valueLen} letters and the limit is {%maxlength}.',
		
		patternMismatch: '{%value} is not in the format this page requires! {%title}',
		valueMissing: 'You have to specify a value'
	};
	
	$.webshims.validityMessages['en-US'] = $.webshims.validityMessages['en-US'] || $.webshims.validityMessages['en'];
	$.webshims.validityMessages[''] = $.webshims.validityMessages[''] || $.webshims.validityMessages['en'];
	
	$.webshims.validityMessages['de'] = $.webshims.validityMessages['de'] || {
		typeMismatch: {
			email: '{%value} ist keine zulässige E-Mail-Adresse',
			url: '{%value} ist keine zulässige Webadresse',
			number: '{%value} ist keine Nummer!',
			date: '{%value} ist kein Datum',
			time: '{%value} ist keine Uhrzeit',
			range: '{%value} ist keine Nummer!',
			"datetime-local": '{%value} ist kein Datum-Uhrzeit Format.'
		},
		rangeUnderflow: '{%value} ist zu niedrig. {%min} ist der unterste Wert, den Sie benutzen können.',
		rangeOverflow: '{%value} ist zu hoch. {%max} ist der oberste Wert, den Sie benutzen können.',
		stepMismatch: 'Der Wert {%value} ist in diesem Feld nicht zulässig. Hier sind nur bestimmte Werte zulässig. {%title}',
		tooLong: 'Der eingegebene Text ist zu lang! Sie haben {%valueLen} Buchstaben eingegeben, dabei sind {%maxlength} das Maximum.',
		
		patternMismatch: '{%value} hat für diese Seite ein falsches Format! {%title}',
		valueMissing: 'Sie müssen einen Wert eingeben'
	};
	
	
	var validiyMessages;
	$(document).bind('htmlExtLangChange', function(){
		$.webshims.activeLang($.webshims.validityMessages, 'validation-base', function(langObj){
			validiyMessages = langObj;
		});
	});
		
	$.each(($.support.validationMessage) ? ['customValidationMessage'] : ['customValidationMessage', 'validationMessage'], function(i, fn){
		$.webshims.attr(fn, {
			elementNames: ['input', 'select', 'textarea'],
			getter: function(elem){
				var message = '';
				if(!$.attr(elem, 'willValidate')){
					return message;
				}
				
				var validity = $.attr(elem, 'validity') || {valid: 1};
				if(validity.valid){return message;}
				if(validity.customError || fn === 'validationMessage'){
					message = ('validationMessage' in elem) ? elem.validationMessage : $.data(elem, 'customvalidationMessage');
					if(message){return message;}
				}
				$.each(validity, function(name, prop){
					if(name == 'valid' || !prop){return;}
					message = validiyMessages[name];
					if(message && typeof message !== 'string'){
						message = message[ (elem.getAttribute('type') || '').toLowerCase() ] || message.defaultMessage;
					}
					if(message){
						return false;
					}
				});
				if(message){
					$.each(['value', 'min', 'max', 'title', 'maxlength', 'label'], function(i, attr){
						if(message.indexOf('%'+attr) === -1){return;}
						var val = ((attr == 'label') ? $.trim($('label[for='+ elem.id +']', elem.form).text()).replace(/\*$|:$/, '') : $.attr(elem, attr)) || '';
						message = message.replace('{%'+ attr +'}', val);
						if('value' == attr){
							message = message.replace('{%valueLen}', val.length);
						}
					});
				}
				return message || '';
			}
		});
	} );
	
	
	$.support.validationMessage = 'shim';
})(jQuery);

(function($){
	if($.support.validity !== true || $.support.fieldsetValidation || window.noHTMLExtFixes){
		return;
	}
	$.support.fieldsetValidation = 'shim';
	$.webshims.addMethod('checkValidity', function(error){
		if($.nodeName(this, 'fieldset')){
			var ret = true;
			$(this.elements || 'input, textarea, select', this)
				.each(function(){
					 if(this.checkValidity){
						if(!this.checkValidity()){
							ret = false;
						}
					}
				})
			;
			return ret;
		} else if(this.checkValidity){
			return this.checkValidity();
		}
	});
})(jQuery);
(function($){
	if($.support.validity === true && ( $('<input type="datetime-local" />').attr('type') !== 'datetime-local' || $('<input type="range" />').attr('type') !== 'range' )){return;}
	//prepare for ff4 doesn't do anything yet
	var typeModels = $.webshims.inputTypes;
	$.webshims.addInputType = function(type, obj){
		typeModels[type] = obj;
	};
	
	var validityRules = {};
	$.webshims.addValidityRule = function(type, fn){
		validityRules[type] = fn;
	};
})(jQuery);
(function($){
	var isImplemented;
	var implementTypes = function(){
		if(isImplemented){return;}
		isImplemented = true;
		var nan = parseInt('NaN', 10),
			typeModels = $.webshims.inputTypes,
			isNumber = function(string){
				return (typeof string == 'number' || ($.trim(string) && string == string * 1));
			},
			getType = function(elem){
				return (elem.getAttribute('type') || '').toLowerCase();
			},
			isDateTimePart = function(string){
				return (isNumber(string) || (string && string == '0' + (string * 1)));
			},
			//why no step IDL?
			getStep = function(elem, type){
				var step = $.attr(elem, 'step');
				if(step === 'any'){
					return step;
				}
				type = type || getType(elem);
				if(!typeModels[type] || !typeModels[type].step){
					return step;
				}
				step = typeModels.number.asNumber(step);
				return ((!isNaN(step) && step > 0) ? step : typeModels[type].step) * typeModels[type].stepScaleFactor;
			},
			//why no min/max IDL?
			addMinMaxNumberToCache = function(attr, elem, cache){
				if (!(attr+'AsNumber' in cache)) {
					cache[attr+'AsNumber'] = typeModels[cache.type].asNumber(elem.attr(attr));
					if(isNaN(cache[attr+'AsNumber']) && (attr+'Default' in typeModels[cache.type])){
						cache[attr+'AsNumber'] = typeModels[cache.type][attr+'Default'];
					}
				}
			},
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
		
		$.webshims.addValidityRule('stepMismatch', function(input, val, cache){
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
					cache.step = getStep(input[0], cache.type);
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
		
		
		
		$.each([{name: 'rangeOverflow', attr: 'max', factor: 1}, {name: 'rangeUnderflow', attr: 'min', factor: -1}], function(i, data){
			$.webshims.addValidityRule(data.name, function(input, val, cache) {
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
					
					ret = ( cache[data.attr+'AsNumber'] * data.factor <=  cache.valueAsNumber * data.factor - EPS );
				}
				return ret;
			});
		});
		
		//IDLs and methods, that aren't part of constrain validation, but strongly tight to it
		$.webshims.attr('valueAsNumber', {
			elementNames: ['input'],
			getter: function(elem, fn){
				var type = getType(elem);
				return (typeModels[type] && typeModels[type].asNumber) ? 
					typeModels[type].asNumber($.attr(elem, 'value')) :
					nan;
			},
			setter: function(elem, val, fn){
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
						throw('INVALID_STATE_ERR: DOM Exception 11');
					}
				} else {
					fn();
				}
			}
		});
		
		$.webshims.attr('valueAsDate', {
			elementNames: ['input'],
			getter: function(elem, fn){
				var type = getType(elem);
				return (typeModels[type] && typeModels[type].asDate && !typeModels[type].noAsDate) ? 
					typeModels[type].asDate($.attr(elem, 'value')) :
					null;
			},
			setter: function(elem, value, fn){
				var type = getType(elem);
				if(typeModels[type] && typeModels[type].dateToString){
					if(value === null){
						$.attr(elem, 'value', '');
						return;
					}
					var set = typeModels[type].dateToString(value);
					if(set !== false){
						$.attr(elem, 'value', set);
					} else {
						throw('INVALID_STATE_ERR: DOM Exception 11');
					}
				} else {
					fn();
				}
			}
		});
		
		$.webshims.addInputType('number', {
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
		});
		
		
		$.webshims.addInputType('range', $.extend({}, typeModels.number, {
			minDefault: 0,
			maxDefault: 100
		}));
		
		$.webshims.addInputType('date', {
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
		});
		
		$.webshims.addInputType('time', $.extend({}, typeModels.date, 
			{
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
			})
		);
		
		$.webshims.addInputType('datetime-local', $.extend({}, typeModels.time, 
			{
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
				
			})
		);
		
		(function(){
			var options = $.webshims.loader.modules['number-date-type'].options;
			var getNextStep = function(input, upDown, cache){
				
				cache = cache || {};
				
				if( !('type' in cache) ){
					cache.type = getType(input);
				}
				if( !('step' in cache) ){
					cache.step = getStep(input, cache.type);
				}
				if( !('valueAsNumber' in cache) ){
					cache.valueAsNumber = typeModels[cache.type].asNumber($.attr(input, 'value'));
				}
				var delta = (cache.step == 'any') ? typeModels[cache.type].step * typeModels[cache.type].stepScaleFactor : cache.step,
					ret
				;
				addMinMaxNumberToCache('min', $(input), cache);
				addMinMaxNumberToCache('max', $(input), cache);
				
				if(isNaN(cache.valueAsNumber)){
					//ToDo: make this more usable
					cache.valueAsNumber = typeModels[cache.type].stepBase || 0;
				}
				//make a valid step
				if(cache.step !== 'any'){
					cache.valueAsNumber = Math.round( ( cache.valueAsNumber - ((cache.valueAsNumber - (cache.minAsnumber || 0)) % cache.step)) * 1e7) / 1e7;
				}
				ret = cache.valueAsNumber + (delta * upDown);
				//using NUMBER.MIN/MAX is really stupid 
				if(!isNaN(cache.minAsNumber) && ret < cache.minAsNumber){
					ret = (cache.valueAsNumber * upDown  < cache.minAsNumber) ? cache.minAsNumber : isNaN(cache.maxAsNumber) ? Number.MAX_VALUE : cache.maxAsNumber;
				} else if(!isNaN(cache.maxAsNumber) && ret > cache.maxAsNumber){
					ret = (cache.valueAsNumber * upDown > cache.maxAsNumber) ? cache.maxAsNumber : isNaN(cache.minAsNumber) ? Number.MIN_VALUE : cache.minAsNumber;
				}
				return ret;
			};
			var doSteps = function(input, type, control){
				if(input.disabled || input.readOnly || $(control).hasClass('step-controls')){return;}
				$.attr(input, 'value',  typeModels[type].numberToString(getNextStep(input, ($(control).hasClass('step-up')) ? 1 : -1, {type: type})));
				$(input).unbind('blur.stepeventshim').trigger('input');
				if( document.activeElement ){
					if(document.activeElement !== input){
						try {input.focus();} catch(e){}
					}
					setTimeout(function(){
						if(document.activeElement !== input){
							try {input.focus();} catch(e){}
						}
						$(input)
							.one('blur.stepeventshim', function(){
								$(input).trigger('change');
							})
						;
					}, 0);
					
				}
			};
			
			
			if(options.stepArrows){
				var disabledReadonly = {
					elementNames: ['input'],
					// don't change getter
					setter: function(elem, value, fn){
						fn();
						var stepcontrols = $.data(elem, 'step-controls');
						if(stepcontrols){
							stepcontrols[ (elem.disabled || elem.readonly) ? 'addClass' : 'removeClass' ]('disabled-step-control');
						}
					}
				};
				$.webshims.attr('disabled', disabledReadonly);
				$.webshims.attr('readonly', disabledReadonly);
				
			}
			
			$.webshims.addReady(function(context){
				
				//ui for numeric values
				if(options.stepArrows){
					$('input', context).each(function(){
						var type = getType(this);
						if(!typeModels[type] || !typeModels[type].asNumber || !options.stepArrows || (options.stepArrows !== true && !options.stepArrows[type])){return;}
						var elem = this,
							dir 	= ($(this).css('direction') == 'rtl') ? 
								{
									action: 'insertBefore',
									side: 'Left',
									otherSide: 'right'
								} :
								{
									action: 'insertAfter',
									side: 'Right',
									otherSide: 'left'
								}
						;
						var controls = $('<span class="step-controls"><span class="step-up" /><span class="step-down" tabindex="-1" /></span>')	
							[dir.action](this)
							.bind('mousedown mousepress', function(e){
								doSteps(elem, type, e.target);
								return false;
							})
						;
						
						$(this)
							.addClass('has-step-controls')
							.data('step-controls', controls)
							.attr({
								readonly: this.readOnly,
								disabled: this.disabled
							})
						;
						
						if(options.recalcWidth){
							var padding = controls.outerWidth(true) + (parseInt($(this).css('padding'+dir.side), 10) || 0),
								border	= parseInt($(this).css('border'+dir.side+'width'), 10) || 0
							;
							controls.css(dir.otherSide, (border + padding) * -1);
							padding++;
							$(this).css('width', $(this).width() - padding).css('padding'+dir.side, padding);
						}
					});
				}
			});
		})();
		// add support for new input-types
		
		$.webshims.attr('type', {
			elementNames: ['input'],
			getter: function(elem, fn){
				var type = getType(elem);
				return ($.webshims.inputTypes[type]) ? type : elem.type || elem.getAttribute('type');
			},
			//don't change setter
			setter: true
		});
	};
	
	if($.webshims.addValidityRule){
		implementTypes();
	}else if($.support.validity === true){
		$.webshims.readyModules('implement-types',implementTypes);
	} else {
		$.webshims.readyModules('validity',implementTypes);
	}
	
})(jQuery);
