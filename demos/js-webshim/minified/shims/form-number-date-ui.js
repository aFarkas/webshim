jQuery.webshims.register('form-number-date-ui', function($, webshims, window, document, undefined, options){
	"use strict";
	var curCfg;
	
	
	var addZero = function(val){
		if(!val){return "";}
		val = val+'';
		return val.length == 1 ? '0'+val : val;
	};
	
		
	(function(){
		
		var formcfg = $.webshims.formcfg;
		formcfg.de = {
			numberFormat: {
				",": ".",
				".": ","
			},
			timeSigns: ":. ",
			numberSigns: ',',
			dateSigns: '.',
			dFormat: ".",
			patterns: {
				d: "dd.mm.yy"
			},
			date: {
				close: 'schließen',
				prevText: 'zurück',
				nextText: 'Vor',
				currentText: 'heute',
				monthNames: ['Januar','Februar','März','April','Mai','Juni',
				'Juli','August','September','Oktober','November','Dezember'],
				monthNamesShort: ['Jan','Feb','Mär','Apr','Mai','Jun',
				'Jul','Aug','Sep','Okt','Nov','Dez'],
				dayNames: ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
				dayNamesShort: ['So','Mo','Di','Mi','Do','Fr','Sa'],
				dayNamesMin: ['So','Mo','Di','Mi','Do','Fr','Sa'],
				weekHeader: 'KW',
				firstDay: 1,
				isRTL: false,
				showMonthAfterYear: false,
				yearSuffix: ''
			}
		};
		
		formcfg.en = {
			numberFormat: {
				".": ".",
				",": ","
			},
			numberSigns: '.',
			dateSigns: '/',
			timeSigns: ":. ",
			dFormat: "/",
			patterns: {
				d: "mm/dd/yy"
			},
			date: {
				"closeText": "Done",
				"prevText": "Prev",
				"nextText": "Next",
				"currentText": "Today",
				"monthNames": ["January","February","March","April","May","June","July","August","September","October","November","December"],
				"monthNamesShort": ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
				"dayNames": ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
				"dayNamesShort": ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
				"dayNamesMin": ["Su","Mo","Tu","We","Th","Fr","Sa"],
				"weekHeader": "Wk",
				"firstDay": 0,
				"isRTL": false,
				"showMonthAfterYear": false,
				"yearSuffix": ""
			}
		};
		
		formcfg['en-US'] = formcfg['en-US'] || formcfg['en'];
		formcfg[''] = formcfg[''] || formcfg['en-US'];
		curCfg = formcfg[''];
		
		var createMonthKeys = function(langCfg){
			if(!langCfg.date.monthkeys){
				var create = function(i, name){
					var strNum;
					var num = i + 1;
					strNum = (num < 10) ? '0'+num : ''+num;
					
					langCfg.date.monthkeys[num] = strNum;
					langCfg.date.monthkeys[name] = strNum;
				};
				langCfg.date.monthkeys = {};
				$.each(langCfg.date.monthNames, create);
				$.each(langCfg.date.monthNamesShort, create);
			}
		};
		
		createMonthKeys(curCfg);
		$.webshims.ready('dom-extend', function(){
			$.webshims.activeLang({
				register: 'form-core', 
				callback: function(){
					$.each(arguments, function(i, val){
						if(formcfg[val]){
							curCfg = formcfg[val];
							createMonthKeys(curCfg);
							$(document).triggerHandler('wslocalechange');
							return false;
						}
					});
				}
			});
		});
	})();
		
	
	
	(function(){
		
		
		var mousePress = function(e){
			$(this)[e.type == 'mousepressstart' ? 'addClass' : 'removeClass']('mousepress-ui');
		};
		
		var retDefault = function(val, def){
			if(!(typeof val == 'number' || (val && val == val * 1))){
				return def;
			}
			return val * 1;
		};
		
		var createOpts = ['step', 'min', 'max', 'readonly', 'title', 'disabled', 'tabindex', 'placeholder', 'value'];
		
		var createFormat = function(name){
			if(!curCfg.patterns[name+'Obj']){
				var obj = {};
				$.each(curCfg.patterns[name].split(curCfg[name+'Format']), function(i, name){
					obj[name] = i;
				});
				curCfg.patterns[name+'Obj'] = obj;
			}
		};
		
		var formatVal = {
			number: function(val){
				return (val+'').replace(/\,/g, '').replace(/\./, curCfg.numberFormat['.']);
			},
			time: function(val){
				return val;
			},
			month: function(val, options){
				var names;
				var p = val.split('-');
				if(p[0] && p[1]){
					names = curCfg.date[options.monthNames] || curCfg.date.monthNames;
					p[1] = names[(p[1] * 1) - 1];
					if(p[1]){
						val = curCfg.date.showMonthAfterYear ? p.join(' ') : p[1]+' '+p[0];
					}
				}
				return val;
			},
			date: function(val){
				var p = (val+'').split('-');
				if(p[2] && p[1] && p[0]){
					val = curCfg.patterns.d.replace('yy', p[0] || '');
					val = val.replace('mm', p[1] || '');
					val = val.replace('dd', p[2] || '');
				}
				
				return val;
			}
		};
		
		var parseVal = {
			number: function(val){
				return (val+'').replace(curCfg.numberFormat[','], '').replace(curCfg.numberFormat['.'], '.');
			},
			time: function(val){
				return val;
			},
			month: function(val){
				var p = val.trim().split(/[\s-\/\\]+/);
				if(p.length == 2){
					p[0] = curCfg.date.monthkeys[p[0]] || p[0];
					p[1] = curCfg.date.monthkeys[p[1]] || p[1];
					if(p[1].length == 2){
						val = p[0]+'-'+p[1];
					} else if(p[0].length == 2){
						val = p[1]+'-'+p[0];
					}
				}
				return val;
			},
			date: function(val){
				createFormat('d');
				var i;
				var obj = curCfg.patterns.dObj;
				val = val.split(curCfg.dFormat);
				return val.length == 3 ? ([addZero(val[obj.yy]), addZero(val[obj.mm]), addZero(val[obj.dd])]).join('-') : '';
			}
		};
		
		var steps = {
			number: {
				step: 1
			},
			time: {
				step: 60
			},
			month: {
				step: 1,
				start: (new Date(new Date().getFullYear(), 0, 1))
			},
			date: {
				step: 1,
				start: (new Date(new Date().getFullYear(), 0, 1))
			}
		};
		
		var createAsNumber = (function(){
			var types = {};
			return function(type){
				var input;
				if(!types[type]){
					input = $('<input type="'+type+'" />');
					types[type] = function(val){
						var type = (typeof val == 'object') ? 'valueAsDate' : 'value';
						return input.prop(type, val).prop('valueAsNumber');
					};
				}
				return types[type];
			};
		})();
		
		steps.range = steps.number;
		
		
		var spinBtnProto = {
			_create: function(){
				var i;
				this.type = this.options.type;
				this.orig = this.options.orig;
				this.elemHelper = $('<input type="'+ this.type+'" />');
				this.asNumber = createAsNumber(this.type);
				this.buttonWrapper = $('<span class="input-buttons '+this.type+'-input-buttons"><span unselectable="on" class="step-controls"><span class="step-up"></span><span class="step-down"></span></span></span>')
					.insertAfter(this.element)
				;
				
				if(typeof steps[this.type].start == 'object'){
					steps[this.type].start = this.asNumber(steps[this.type].start);
				}
				
				for(i = 0; i < createOpts.length; i++){
					this[createOpts[i]](this.options[createOpts[i]]);
				}
				var elem = this.element.attr('autocomplete', 'off').data('wsspinner', this);
				this.addBindings();
//				if($.browser.mozilla){
//					$(window).on('unload', function(){
//						elem.remove();
//					});
//				}
				this._init = true;
			},
			parseValue: function(val){
				return parseVal[this.type](val);
			},
			formatValue: function(val){
				return formatVal[this.type](val, this.options);
			},
			placeholder: function(val){
				var hintValue;
				this.options.placeholder = val;
				if(this.type == 'date'){
					hintValue = (val || '').split('-');
					if(hintValue.length == 3){
						this.options.placeholder = curCfg.patterns.d.replace('yy', hintValue[0]).replace('mm', hintValue[1]).replace('dd', hintValue[2]);
					}
				}
				this.element.prop('placeholder', this.options.placeholder);
			},
			addZero: addZero,
			_setStartInRange: function(){
				var start = steps[this.type].start || 0;
				if(!isNaN(this.minAsNumber) && start < this.minAsNumber){
					start = this.minAsNumber;
				} else if(!isNaN(this.maxAsNumber) && start > this.maxAsNumber){
					start = this.maxAsNumber;
				}
				this.elemHelper.prop('valueAsNumber', start).prop('value');
				this.options.defValue = this.elemHelper.prop('value');
			},
			value: function(val){
				this.valueAsNumber = this.asNumber(val);
				this.options.value = val;
				if(isNaN(this.valueAsNumber)){
					this._setStartInRange();
				} else {
					this.elemHelper.prop('value', val);
				}
				
				this.element.prop('value', formatVal[this.type](val, this.options));
			},
			
			list: function(opts){
				this.options.options = opts || {};
			},
			readonly: function(val){
				this.options.readonly = !!val;
				this.element.prop('readonly', this.options.readonly);
				if(this.options.readonly || this._init){
					this.buttonWrapper[this.options.readonly ? 'addClass' : 'removeClass']('ws-readonly');
				}
			},
			disabled: function(val){
				this.options.disabled = !!val;
				this.element.prop('disabled', this.options.disabled);
				if(this.options.disabled || this._init){
					this.buttonWrapper[this.options.readonly ? 'addClass' : 'removeClass']('ws-disabled');
				}
			},
			tabindex: function(val){
				this.options.tabindex = val;
				this.element.prop('tabindex', this.options.tabindex);
			},
			title: function(val){
				this.options.title = val;
				this.element.prop('tabindex', this.options.title);
			},
			
			min: function(val){
				this.elemHelper.prop('min', val);
				this.minAsNumber = this.asNumber(val);
				if(this.valueAsNumber != null && isNaN(this.valueAsNumber)){
					this._setStartInRange();
				}
			},
			max: function(val){
				this.elemHelper.prop('max', val);
				this.maxAsNumber = this.asNumber(val);
				if(this.valueAsNumber != null && isNaN(this.valueAsNumber)){
					this._setStartInRange();
				}
			},
			step: function(val){
				var defStep = steps[this.type];
				this.elemHelper.prop('step', retDefault(val, defStep.step));
			},
			
			
			addBindings: function(){
				var isFocused;
				
				var that = this;
				var o = this.options;
				
				var eventTimer = (function(){
					var events = {};
					return {
						init: function(name, curVal, fn){
							if(!events[name]){
								events[name] = {fn: fn};
								$(that.orig).on(name, function(){
									events[name].val = $.prop(that.orig, 'value');
								});
								
							}
							events[name].val = curVal;
						},
						call: function(name, val){
							if(events[name] && events[name].val != val){
								clearTimeout(events[name].timer);
								events[name].val = val;
								events[name].timer = setTimeout(function(){
									events[name].fn(val, that);
								}, 0);
							}
						}
					};
				})();
				
				var step = {};
				
				var preventBlur = function(e){
					if(preventBlur.prevent){
						e.preventDefault();
						that.element.focus();
						e.stopImmediatePropagation();
						return true;
					}
				};
				
				var mouseDownInit = function(){
					if(!o.disabled && !isFocused){
						that.element[0].focus();
					}
					preventBlur.set();
					
					return false;
				};
				
				preventBlur.set = (function(){
					var timer;
					var reset = function(){
						preventBlur.prevent = false;
					};
					return function(){
						clearTimeout(timer);
						preventBlur.prevent = true;
						setTimeout(reset, 9);
					};
				})();
				
				['stepUp', 'stepDown'].forEach(function(name){
					step[name] = function(factor){
						if(!o.disabled && !o.readonly){
							if(!isFocused){
								mouseDownInit();
							}
							var ret = false;
							if (!factor) {
								factor = 1;
							}
							try {
								that.elemHelper[name](factor);
								ret = that.elemHelper.prop('value');
								that.value(ret);
								eventTimer.call('input', ret);
							} catch (er) {}
							return ret;
						}
					};
				});
				
				
				this.buttonWrapper.on('mousedown', mouseDownInit);
				
				this.setChange = function(value){
					that.value(value);
					eventTimer.call('input', value);
					eventTimer.call('change', value);
				};
				
				this.element.on({
					blur: function(e){
						if(!preventBlur(e) && !o.disabled && !o.readonly){
							eventTimer.call('input', $.prop(that.orig, 'value'));
							eventTimer.call('change', $.prop(that.orig, 'value'));
							if(!preventBlur.prevent){
								isFocused = false;
							}
						}
					},
					focus: function(){
						eventTimer.init('input', $.prop(that.orig, 'value'), that.options.input);
						eventTimer.init('change', $.prop(that.orig, 'value'), that.options.change);
						isFocused = true;
					},
					change: function(){
						var val = parseVal[that.type]($.prop(this, 'value'));
						$.prop(that.orig, 'value', val);
						eventTimer.call('input', val);
						eventTimer.call('change', val);
					},
					mousewheel: function(e, delta){
						if(delta && isFocused && !o.disabled){
							step[delta > 0 ? 'stepUp' : 'stepDown']();
							e.preventDefault();
						}
					},
					keypress: function(e){
						var chr;
						var stepped = true;
						var code = e.keyCode;
						if (code == 38) {
							step.stepUp();
						} else if (code == 40) {
							step.stepDown();
						} else {
							if(!e.ctrlKey && !e.metaKey && curCfg[that.type+'Signs']){
								chr = String.fromCharCode(e.charCode == null ? code : e.charCode);
								stepped = !(chr < " " || (curCfg[that.type+'Signs']+'0123456789').indexOf(chr) > -1);
							} else {
								stepped = false;
							}
						}
						if(stepped){
							e.preventDefault();
						}
					}
				});
				
				$(document).on('wslocalechange',function(){
					that.value(that.options.value);
				});
				
				$('.step-up', this.buttonWrapper)
					.on({
						'mousepressstart mousepressend': mousePress,
						'mousedown mousepress': function(e){
							step.stepUp();
						}
					})
				;
				$('.step-down', this.buttonWrapper)
					.on({
						'mousepressstart mousepressend': mousePress,
						'mousedown mousepress': function(e){
							step.stepDown();
						}
					})
				;
				
			}
		};
		
		
		$.fn.spinbtnUI = function(opts){
			opts = $.extend({
				monthNames: 'monthNamesShort',
				size: 1,
				startAt: 0,
				selectNav: false,
				openOnFocus: false
			}, opts);
			return this.each(function(){
				$.webshims.objectCreate(spinBtnProto, {
					element: {
						value: $(this)
					}
				}, opts);
			});
		};
	})();
	
	(function(){
		var picker = {};
		var disable = {
			
		};
		
		var getDateArray = function(date){
			return [date.getFullYear(), addZero(date.getMonth() + 1), addZero(date.getDate())];
		};
		
		picker.getYearList = function(value, data){
			var j, i, val, disabled, lis, prevDisabled, nextDisabled;
			
			value = value[0] * 1;
			
			var size = data.options.size || 1;
			var xth = value % (12 * size);
			var start = value - xth;
			var max = data.options.max.split('-');
			var min = data.options.min.split('-');
			var enabled = 0;
			var str = '';
			for(j = 0; j < size; j++){
				if(j){
					start += 12;
				}  else {
					prevDisabled = picker.isInRange([start-1], max, min) ? {'data-action': 'setYearList','value': start-1} : false;
				}
				
				str += '<div class="year-list"><h3>'+ start +' - '+(start + 11)+'</h3>';
				lis = [];
				for(i = 0; i < 12; i++){
					val = start + i ;
					if( !picker.isInRange([val], max, min) ){
						disabled = ' disabled="disabled"';
					} else {
						disabled = '';
						enabled++;
					}
					lis.push('<li><button type="button"'+ disabled +'" data-action="setMonthList" value="'+val+'">'+val+'</button></li>');
				}
				if(j == size - 1){
					nextDisabled = picker.isInRange([val+1], max, min) ? {'data-action': 'setYearList','value': val+1} : false;
				}
				str += '<ul class="year-list">'+ (lis.join(''))+ '</ul></div>';
			}
			
			return {
				enabled: enabled,
				main: str,
				next: nextDisabled,
				prev: prevDisabled
			};
		};
		
		
		picker.getMonthList = function(value, data){
			
			var j, i, name, val, disabled, lis, fullyDisabled, prevDisabled, nextDisabled;
			var size = data.options.size || 1;
			var max = data.options.max.split('-');
			var min = data.options.min.split('-');
			var enabled = 0;
			var str = '';
			
			value = value[0] - Math.floor((size - 1) / 2);
			for(j = 0; j < size; j++){
				if(j){
					value++;
				} else {
					prevDisabled = picker.isInRange([value-1], max, min) ? {'data-action': 'setMonthList','value': value-1} : false;
				}
				if(j == size - 1){
					nextDisabled = picker.isInRange([value+1], max, min) ? {'data-action': 'setMonthList','value': value+1} : false;
				}
				lis = [];
				
				
				
				
				if( !picker.isInRange([value, '01'], max, min) && !picker.isInRange([value, '12'], max, min)){
					disabled = ' disabled="disabled"';
					fullyDisabled = true;
				} else {
					fullyDisabled = false;
					disabled = '';
				}
				str += '<div class="month-list">';
				
				str += data.options.selectNav ? 
					'<select data-action="setMonthList">'+ picker.createYearSelect(value, max, min).join('') +'</select>' : 
					'<button data-action="setYearList"'+disabled+' value="'+ value +'">'+ value +'</button>';
				
				for(i = 0; i < 12; i++){
					val = curCfg.date.monthkeys[i+1];
					name = curCfg.date.monthNames[i];
					if(fullyDisabled || !picker.isInRange([value, val], max, min) ){
						disabled = ' disabled="disabled"';
					} else {
						disabled = '';
						enabled++;
					}
					
					lis.push('<li><button type="button"'+ disabled +'" data-action="'+ (data.type == 'month' ? 'changeInput' : 'setDayList' ) +'" value="'+value+'-'+val+'">'+name+'</button></li>');
				}
				str += '<ul>'+ (lis.join(''))+ '</ul></div>';
			}
			
			return {
				enabled: enabled,
				main: str,
				prev: prevDisabled,
				next: nextDisabled
			};
		};
		
		
		picker.getDayList = function(value, data){
			
			var j, i, k, day, name, val, disabled, lis,  prevDisabled, nextDisabled, addTr;
			
			var lastMotnh, curMonth, otherMonth, dateArray, monthName, buttonStr, date2;
			var size = data.options.size || 1;
			var max = data.options.max.split('-');
			var min = data.options.min.split('-');
			var monthNames = curCfg.date[data.options.monthNames] || curCfg.date.monthNames; 
			var enabled = 0;
			var str = [];
			var date = new Date(value[0], value[1] - 1, 1);
			
			date.setMonth(date.getMonth()  - Math.floor((size - 1) / 2));
			
			for(j = 0;  j < size; j++){
				lastMotnh = date.getMonth();
				
				
				if(!j){
					date2 = new Date(date.getTime());
					date2.setDate(-1);
					dateArray = getDateArray(date2);
					prevDisabled = picker.isInRange(dateArray, max, min) ? {'data-action': 'setDayList','value': dateArray[0]+'-'+dateArray[1]} : false;
				}
				
				dateArray = getDateArray(date);
				
				str.push('<div class="day-list">');
				
				if( data.options.selectNav ){
					monthName = ['<select data-action="setDayList">'+ picker.createMonthSelect(dateArray, max, min, monthNames).join('') +'</select>', '<select data-action="setDayList">'+ picker.createYearSelect(dateArray[0], max, min, '-'+dateArray[1]).join('') +'</select>'];
					if(curCfg.date.showMonthAfterYear){
						monthName.reverse();
					}
					str.push( monthName.join(' ') );
				} else {
					
					monthName = [monthNames[(dateArray[1] * 1) - 1], dateArray[0]];
					if(curCfg.date.showMonthAfterYear){
						monthName.reverse();
					}
					str.push(  
						'<button data-action="setMonthList" value="'+ dateArray[0]+'-'+dateArray[1] +'">'+ monthName.join(' ')  +'</button>'
					);
				}
				
				
				str.push('<table><tr>');
				
				for(k = 1; k < curCfg.date.dayNamesShort.length; k++){
					str.push('<th>'+ curCfg.date.dayNamesShort[k] +'</th>');
				}
				
				str.push('<th>'+ curCfg.date.dayNamesShort[0] +'</th>');
				str.push('</tr><tr>');
				
					
				
				for (i = 0; i < 46; i++) {
					addTr = (i && !(i % 7));
					curMonth = date.getMonth();
					otherMonth = lastMotnh != curMonth;
					
					if(addTr && otherMonth ){
						str.push('</tr>');
						break;
					}
					if(addTr){
						str.push('</tr><tr>');
					}
					if(!i){
						day = date.getDay() - 1;
						
						if(day > -1 && day < 6){
							date.setDate(date.getDate() - day);
						}
						curMonth = date.getMonth();
						otherMonth = lastMotnh != curMonth;
					}
					
					dateArray = getDateArray(date);
					buttonStr = '<td><button data-action="changeInput" value="'+ (dateArray.join('-')) +'"';
					
					if(otherMonth){
						buttonStr += ' data-othermonth=""';
					}
					if(!picker.isInRange(dateArray, max, min)){
						buttonStr += ' disabled=""';
					}
					
					str.push(buttonStr+'>'+ date.getDate() +'</button></td>');
					
					date.setDate(date.getDate() + 1);
				}
				str.push('</table></div>');
				if(j == size - 1){
					dateArray = getDateArray(date);
					dateArray[2] = 1;
					nextDisabled = picker.isInRange(dateArray, max, min) ? {'data-action': 'setDayList','value': dateArray[0]+'-'+dateArray[1]} : false;
				}
			}
					
			
			return {
				enabled: 9,
				main: str.join(''),
				prev: prevDisabled,
				next: nextDisabled
			};
		};
		
		picker.isInRange = function(values, max, min){
			var i;
			var ret = true;
			for(i = 0; i < values.length; i++){
				
				if(min[i] && min[i] > values[i]){
					ret = false;
					break;
				} else if( !(min[i] && min[i] == values[i]) ){
					break;
				}
			}
			if(ret){
				for(i = 0; i < values.length; i++){
					
					if((max[i] && max[i] < values[i])){
						ret = false;
						break;
					} else if( !(max[i] && max[i] == values[i]) ){
						break;
					}
				}
			}
			return ret;
		};
		
		picker.createMonthSelect = function(value, max, min, monthNames){
			if(!monthNames){
				monthNames = curCfg.date.monthNames;
			}
			
			var selected;
			var i = 0;
			var options = [];
			var tempVal = value[1]-1;
			for(; i < monthNames.length; i++){
				selected = tempVal == i ? ' selected=""' : '';
				if(selected || picker.isInRange([value[0], i+1], max, min)){
					options.push('<option value="'+ value[0]+'-'+addZero(i+1) + '"'+selected+'>'+ monthNames[i] +'</option>');
				}
			}
			return options;
		};
		
		picker.createYearSelect = function(value, max, min, valueAdd){
			
			var temp;
			var goUp = true;
			var goDown = true;
			var options = ['<option selected="">'+ value + '</option>'];
			var i = 0;
			if(!valueAdd){
				valueAdd = '';
			}
			while(i < 8 && (goUp || goDown)){
				i++;
				temp = value-i;
				if(goUp && picker.isInRange([temp], max, min)){
					options.unshift('<option value="'+ (temp+valueAdd) +'">'+ temp +'</option>');
				} else {
					goUp = false;
				}
				temp = value + i;
				if(goDown && picker.isInRange([temp], max, min)){
					options.push('<option value="'+ (temp+valueAdd) +'">'+ temp +'</option>');
				} else {
					goDown = false;
				}
			}
			return options;
		};
			
		var actions = {
			
			changeInput: function(val, popover, data){
				data.setChange(val);
				popover.hide();
			}
		};
		
		(function(){
			var retNames = function(name){
				return 'get'+name+'List';
			};
			var stops = {
				date: 'Day',
				week: 'Day',
				month: 'Month'
			};
			
			$.each({'setYearList' : ['Year', 'Month', 'Day'], 'setMonthList': ['Month', 'Day'], 'setDayList': ['Day']}, function(setName, names){
				var getNames = names.map(retNames);
				actions[setName] = function(val, popover, data, startAt){
					var values = val.split('-');
					if(!startAt){
						startAt = 0;
					}
					$.each(getNames, function(i, item){
						if(i >= startAt){
							var content = picker[item](values, data);
							
							if( values.length < 2 || content.enabled > 1 || stops[data.type] === names[i]){
								popover.bodyElement.html(content.main);
								if(content.prev){
									popover.prevElement
										.attr(content.prev)
										.prop({disabled: false})
									;
								} else {
									popover.prevElement
										.removeAttr('data-action')
										.prop({disabled: true})
									;
								}
								if(content.next){
									popover.nextElement
										.attr(content.next)
										.prop({disabled: false})
									;
								} else {
									popover.nextElement
										.removeAttr('data-action')
										.prop({disabled: true})
									;
								}
								return false;
							}
						}
					});
				};
			});
		})();
		
		picker.commonInit = function(data, popover){
			data.list = function(opts){
				var o = this.options;
				var lis = [];
				
				o.options = opts || {};
				$('div.ws-options', popover.contentElement).remove();
				$.each(o.options, function(val, label){
					lis.push('<li><button value="'+ val +'" data-action="changeInput">'+ (label || data.formatValue(val)) +'</button></li>');
				});
				if(lis.length){
					popover.contentElement.append('<div class="ws-options"><ul>'+ lis.join('') +'</ul></div>');
				}
			};
			popover.contentElement.html('<button class="ws-prev"></button><button class="ws-next"></button><div class="ws-picker-body"></div>');
			popover.nextElement = $('button.ws-next', popover.contentElement);
			popover.prevElement = $('button.ws-prev', popover.contentElement);
			popover.bodyElement = $('div.ws-picker-body', popover.contentElement);
			$(document)
				.onTrigger('wslocalechange',function(){
					popover.nextElement.text(curCfg.date.nextText);
					popover.prevElement.text(curCfg.date.prevText);
				})
			;
			data.list(data.options.options);
		};
		
		picker.month = function(data){
			var popover = webshims.objectCreate(webshims.wsPopover, {}, {prepareFor: data.element});
			var opener = $('<span class="popover-opener" />').appendTo(data.buttonWrapper);
			var options = data.options;
			var init = false;
			var actionfn = function(){
				var action = $(this).attr('data-action');
				if(actions[action]){
					actions[action]($(this).val(), popover, data);
				} else {
					webshims.warn('no action for '+ action);
				}
				return false;
			};
			var show = function(){
				if(!options.disabled && !options.readonly){
					
					if(!init){
						picker.commonInit(data, popover);
						actions.setYearList( options.value || options.defValue, popover, data, data.options.startAt);
					}
					init = true;
					popover.show(data.element);
				}
			};
			
			popover.element.addClass(data.type+'-popover');
			popover.contentElement
				.on('click', 'button[data-action]', actionfn)
				.on('change', 'select[data-action]', actionfn)
			;
			opener.on('mousedown', show);
			
			data.element.on({
				focus: function(){
					if(data.options.openOnFocus){
						show();
					}
				},
				mousedown: function(){
					if(data.element.is(':focus')){
						show();
					}
				}
			});
		};
		
		picker.date = picker.month;
		
		webshims.picker = picker;
	})();
	
	(function(){
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
			'title',
			'placeholder'
		];
		
		//
		var copyAttrs = ['tabindex', 'data-placeholder'];
		var reflectFn = function(val){
			
		};
			
		$.each(copyProps.concat(copyAttrs), function(i, name){
			var fnName = name.replace(/^data\-/, '');
			
			webshims.onNodeNamesPropertyModify('input', name, function(val){
				if(!stopCircular){
					var shadowData = webshims.data(this, 'shadowData');
					if(shadowData && shadowData.data && shadowData.nativeElement === this && shadowData.data[fnName]){
						shadowData.data[fnName](val);
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
			var listTimer, updateList;
			
			if(list){
				$('option', list).each(function(){
					options[$.prop(this, 'value')] = $.prop(this, 'label');
				});
			}
			if(data){
				updateList = function(){
					if(data.shim){
						clearTimeout(listTimer);
						listTimer = setTimeout(function(){
							data.shim.list(getOptions(input));
						}, 9);
					}
				};
				$(list).on('updateDatalist', updateList);
				$(input).on('listdatalistchange', updateList);
			}
			return options;
		};
		var stopPropagation = function(e){
			e.stopImmediatePropagation(e);
		};
		var isVisible = function(){
			return $.css(this, 'display') != 'none';
		};
		var sizeInput = function(data){
			var init;
			var updateStyles = function(){
				$.style( data.orig, 'display', '' );
				
				var correctWidth = 0.6;
				if(!init || data.orig.offsetWidth){
					data.element.css({
						marginLeft: $.css( data.orig, 'marginLeft'),
						marginRight: $.css( data.orig, 'marginRight')
					});
					
					if(data.buttonWrapper){
						data.element.css({paddingRight: ''});
						
						if((parseInt(data.buttonWrapper.css('marginLeft'), 10) || 0) < 0){
							data.element
								.css({paddingRight: ''})
								.css({
									paddingRight: (parseInt( data.element.css('paddingRight'), 10) || 0) + data.buttonWrapper.outerWidth()
								})
							;
						} else {
							correctWidth = data.buttonWrapper.outerWidth(true) + 0.6;
						}
					}
					
					data.element.outerWidth( $(data.orig).outerWidth() - correctWidth );
				}
				init = true;
				$.style( data.orig, 'display', 'none' );
			};
			$(document).onTrigger('updateshadowdom', updateStyles);
		};
		
		
		var implementType = function(){
			var type = $.prop(this, 'type');
			
			var i, opts, data, optsName, calcWidth;
			if(inputTypes[type]){
				data = {};
				optsName = type;
				//todo: do we need deep extend?
				opts = $.extend({}, options[type], $($.prop(this, 'form')).data(type) || {}, $(this).data(type) || {}, {
					orig: this,
					type: type,
					options: getOptions(this, data),
					input: function(val){
						opts._change(val, 'input');
					},
					change: function(val){
						opts._change(val, 'change');
					},
					_change: function(val, trigger){
						stopCircular = true;
						$.prop(opts.orig, 'value', val);
						stopCircular = false;
						if(trigger){
							$(opts.orig).trigger(trigger);
						}
					}
				});
				
				
				for(i = 0; i < copyProps.length; i++){
					opts[copyProps[i]] = $.prop(this, copyProps[i]);
				}
				for(i = 0; i < copyAttrs.length; i++){
					optsName = copyAttrs[i].replace(/^data\-/, '');
					if(!opts[optsName]){
						opts[optsName] = $.attr(this, copyAttrs[i]);
					}
				}
				
				data.shim = inputTypes[type]._create(opts);
				
				webshims.addShadowDom(this, data.shim.element, {
					data: data.shim || {}
				});
				
				$(this).on('change', function(e){
					if(!stopCircular && e.originalEvent){
						data.shim.value($.prop(this, 'value'));
					}
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
				
				calcWidth = opts.calculateWidth != null ? opts.calculateWidth : options.calculateWidth;
				
				if(calcWidth){
					sizeInput(data.shim);
				}
				$(this).css({display: 'none'});
			}
		};
		
		if(!modernizrInputTypes.range || options.replaceUI){
			extendType('range', {
				_create: function(opts, set){
					return $('<span />').insertAfter(opts.orig).rangeUI(opts).data('rangeUi');
				}
			});
		}
		
		
		['number', 'time', 'month', 'date'].forEach(function(name){
			if(!modernizrInputTypes[name] || options.replaceUI){
				extendType(name, {
					_create: function(opts, set){
						var data = $('<input class="ws-'+name+'" type="text" />').insertAfter(opts.orig).spinbtnUI(opts).data('wsspinner');
						if(webshims.picker && webshims.picker[name]){
							webshims.picker[name](data);
						}
						data.buttonWrapper.addClass('input-button-size-'+(data.buttonWrapper.children().filter(isVisible).length));
						return data;
					}
				});
			}
		});
		
		
		webshims.addReady(function(context, contextElem){
			$('input', context)
				.add(contextElem.filter('input'))
				.each(implementType)
			;
		});
	})();
});

