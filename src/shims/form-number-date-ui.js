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
				start: new Date()
			},
			date: {
				step: 1,
				start: new Date()
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
			
			list: function(opts, input){
				this.options.options = opts || {};
				if(this.type == 'number' || this.type == 'time'){
					this.element.attr('list', $.attr(this.orig, 'list'));
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
				var elementEvts = {
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
					keypress: function(e){
						if(e.isDefaultPrevented()){return;}
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
				
				this.setInput = function(value){
					that.value(value);
					eventTimer.call('input', value);
				};
				this.setChange = function(value){
					that.setInput(value);
					eventTimer.call('change', value);
				};
				elementEvts[$.fn.mwheelIntent ? 'mwheelIntent' : 'mousewheel'] = function(e, delta){
					if(delta && isFocused && !o.disabled){
						step[delta > 0 ? 'stepUp' : 'stepDown']();
						e.preventDefault();
					}
				};
				this.element.on(elementEvts);
				
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
		
		['readonly', 'disabled'].forEach(function(name){
			spinBtnProto[name] = function(val){
				if(this.options[name] != val || this._init){
					this.options[name] = !!val;
					this.element.prop(name, this.options[name]);
					this.buttonWrapper[this.options[name] ? 'addClass' : 'removeClass']('ws-'+name);
				}
			};
		});
		
		
		$.fn.spinbtnUI = function(opts){
			opts = $.extend({
				monthNames: 'monthNames',
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
			var ret = [date.getFullYear(), addZero(date.getMonth() + 1), addZero(date.getDate())];
			ret.month = ret[0]+'-'+ret[1];
			ret.date = ret[0]+'-'+ret[1]+'-'+ret[2];
			return ret;
		};
		var today = getDateArray(new Date());
		
		
		picker.getWeek = function(date){
			var onejan = new Date(date.getFullYear(),0,1);
			return Math.ceil((((date - onejan) / 86400000) + onejan.getDay()+1)/7);
		};
		picker.getYearList = function(value, data){
			var j, i, val, disabled, lis, prevDisabled, nextDisabled, classStr, classArray;
			
			value = value[0] * 1;
			
			var size = data.options.size;
			var xth = value % (12 * size);
			var start = value - xth;
			var max = data.options.max.split('-');
			var min = data.options.min.split('-');
			var currentValue = data.options.value.split('-');
			var enabled = 0;
			var str = '';
			for(j = 0; j < size; j++){
				if(j){
					start += 12;
				}  else {
					prevDisabled = picker.isInRange([start-1], max, min) ? {'data-action': 'setYearList','value': start-1} : false;
				}
				
				str += '<div class="year-list ws-index-'+ j +'"><div class="ws-picker-header"><h3>'+ start +' - '+(start + 11)+'</h3></div>';
				lis = [];
				for(i = 0; i < 12; i++){
					val = start + i ;
					classArray = [];
					if( !picker.isInRange([val], max, min) ){
						disabled = ' disabled=""';
					} else {
						disabled = '';
						enabled++;
					}
					
					
					if(val == today[0]){
						classArray.push('this-year');
					}
					
					if(currentValue[0] == val){
						classArray.push('selected-value');
					}
					
					classStr = classArray.length ? ' class="'+ (classArray.join(' ')) +'"' : '';
					
					
					lis.push('<li class="ws-item-'+ i +'"><button type="button"'+ disabled + classStr +' data-action="setMonthList" value="'+val+'" tabindex="-1">'+val+'</button></li>');
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
			
			var j, i, name, val, disabled, lis, fullyDisabled, prevDisabled, nextDisabled, classStr, classArray;
			var size = data.options.size;
			var max = data.options.max.split('-');
			var min = data.options.min.split('-');
			var currentValue = data.options.value.split('-');
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
					disabled = ' disabled=""';
					fullyDisabled = true;
				} else {
					fullyDisabled = false;
					disabled = '';
				}
				
				str += '<div class="month-list ws-index-'+ j +'"><div class="ws-picker-header">';
				
				str += data.options.selectNav ? 
					'<select data-action="setMonthList" tabindex="-1">'+ picker.createYearSelect(value, max, min).join('') +'</select>' : 
					'<button data-action="setYearList"'+disabled+' value="'+ value +'" tabindex="-1">'+ value +'</button>';
				str += '</div>';
				
				for(i = 0; i < 12; i++){
					val = curCfg.date.monthkeys[i+1];
					name = curCfg.date.monthNames[i];
					classArray = [];
					if(fullyDisabled || !picker.isInRange([value, val], max, min) ){
						disabled = ' disabled=""';
					} else {
						disabled = '';
						enabled++;
					}
					
					if(value == today[0] && today[1] == val){
						classArray.push('this-month');
					}
					
					if(currentValue[0] == value && currentValue[1] == val){
						classArray.push('selected-value');
					}
					
					classStr = (classArray.length) ? ' class="'+ (classArray.join(' ')) +'"' : '';
					
					lis.push('<li class="ws-item-'+ i +'"><button type="button"'+ disabled + classStr +' data-action="'+ (data.type == 'month' ? 'changeInput' : 'setDayList' ) +'" value="'+value+'-'+val+'" tabindex="-1">'+name+'</button></li>');
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
			
			var j, i, k, day, nDay, name, val, disabled, lis,  prevDisabled, nextDisabled, addTr, week, rowNum;
			
			var lastMotnh, curMonth, otherMonth, dateArray, monthName, buttonStr, date2, classArray;
			var size = data.options.size;
			var max = data.options.max.split('-');
			var min = data.options.min.split('-');
			var currentValue = data.options.value.split('-');
			var monthNames = curCfg.date[data.options.monthNames] || curCfg.date.monthNames; 
			var enabled = 0;
			var str = [];
			var date = new Date(value[0], value[1] - 1, 1);
			
			date.setMonth(date.getMonth()  - Math.floor((size - 1) / 2));
			
			for(j = 0;  j < size; j++){
				lastMotnh = date.getMonth();
				rowNum = 0;
				if(!j){
					date2 = new Date(date.getTime());
					date2.setDate(-1);
					dateArray = getDateArray(date2);
					prevDisabled = picker.isInRange(dateArray, max, min) ? {'data-action': 'setDayList','value': dateArray[0]+'-'+dateArray[1]} : false;
				}
				
				dateArray = getDateArray(date);
				
				str.push('<div class="day-list ws-index-'+ j +'"><div class="ws-picker-header">');
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
						'<button data-action="setMonthList" value="'+ dateArray.date +'" tabindex="-1">'+ monthName.join(' ')  +'</button>'
					);
				}
				
				
				str.push('</div><table><thead><tr>');
				
				if(data.options.showWeek){
					str.push('<th class="week-header">'+ curCfg.date.weekHeader +'</th>');
				}
				for(k = curCfg.date.firstDay; k < curCfg.date.dayNamesShort.length; k++){
					str.push('<th class="day-'+ k +'"><abbr title="'+ curCfg.date.dayNames[k] +'">'+ curCfg.date.dayNamesShort[k] +'</abbr></th>');
				}
				k = curCfg.date.firstDay;
				while(k--){
					str.push('<th class="day-'+ k +'"><abbr title="'+ curCfg.date.dayNames[k] +'">'+ curCfg.date.dayNamesShort[k] +'</abbr></th>');
				}
				str.push('</tr></thead><tbody><tr class="ws-row-0">');
				
				if(data.options.showWeek) {
					week = picker.getWeek(date);
					str.push('<th class="week-cell">'+ week +'</th>');
				}
				
				for (i = 0; i < 99; i++) {
					addTr = (i && !(i % 7));
					curMonth = date.getMonth();
					otherMonth = lastMotnh != curMonth;
					day = date.getDay();
					classArray = [];
					
					if(addTr && otherMonth ){
						str.push('</tr>');
						break;
					}
					if(addTr){
						rowNum++;
						str.push('</tr><tr class="ws-row-'+ rowNum +'">');
						if(data.options.showWeek) {
							week++;
							str.push('<th class="week-cell">'+ week +'</th>');
						}
					}
					if(!i){
						nDay = date.getDay() - curCfg.date.firstDay;
						
						if(nDay > -1 && nDay < 6){
							date.setDate(date.getDate() - nDay);
						}
						curMonth = date.getMonth();
						otherMonth = lastMotnh != curMonth;
						day = date.getDay();
					}
					
					dateArray = getDateArray(date);
					buttonStr = '<td class="day-'+ day +'"><button data-action="changeInput" value="'+ (dateArray.join('-')) +'"';
					
					if(otherMonth){
						classArray.push('othermonth');
					} 
					
					if(dateArray[0] == today[0] && today[1] == dateArray[1] && today[2] == dateArray[2]){
						classArray.push('this-day');
					}
					
					if(currentValue[0] == dateArray[0] && dateArray[1] == currentValue[1] && dateArray[2] == currentValue[2]){
						classArray.push('selected-value');
					}
					
					if(classArray.length){
						buttonStr += ' class="'+ classArray.join(' ') +'"';
					}
					
					if(!picker.isInRange(dateArray, max, min) || (data.options.disableDays && $.inArray(day, data.options.disableDays) != -1)){
						buttonStr += ' disabled=""';
					}
					
					str.push(buttonStr+' tabindex="-1">'+ date.getDate() +'</button></td>');
					
					date.setDate(date.getDate() + 1);
				}
				str.push('</tbody></table></div>');
				if(j == size - 1){
					dateArray = getDateArray(date);
					dateArray[2] = 1;
					nextDisabled = picker.isInRange(dateArray, max, min) ? {'data-action': 'setDayList','value': dateArray.date} : false;
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
				popover.hide();
				data.setChange(val);
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
					if(!data.options.size){
						data.options.size = 1;
					}
					$.each(getNames, function(i, item){
						if(i >= startAt){
							var content = picker[item](values, data);
							
							if( values.length < 2 || content.enabled > 1 || stops[data.type] === names[i]){
								popover.element
									.attr({'data-currentview': setName})
									.addClass('ws-size-'+data.options.size)
									.data('pickercontent', {
										data: data,
										content: content,
										values: values
									})
								;
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
								popover.element.trigger('pickerchange');
								return false;
							}
						}
					});
				};
			});
		})();
		
		picker.commonInit = function(data, popover){
			var actionfn = function(e){
				
				var action = $(this).attr('data-action');
				var value = $(this).val();
				if(actions[action]){
					actions[action](value, popover, data, 0);
				} else {
					webshims.warn('no action for '+ action);
				}
				
				return false;
			};
			
			data.list = function(opts){
				var o = this.options;
				var options = [];
				
				o.options = opts || {};
				$('div.ws-options', popover.contentElement).remove();
				$.each(o.options, function(val, label){
					options.push('<button value="'+ val +'" data-action="changeInput" tabindex="-1">'+ (label || data.formatValue(val)) +'</button>');
				});
				if(options.length){
					popover.bodyElement.after('<div class="ws-options">'+ options.join('') +'</div>');
				}
			};
			popover.contentElement.html('<button class="ws-prev" tabindex="-1"><span></span></button> <button class="ws-next" tabindex="-1"><span></span></button><div class="ws-picker-body"></div><div class="ws-button-row"><button type="button" class="ws-current" data-action="changeInput" value="'+today[data.type]+'" data-text="current" tabindex="-1"></button> <button type="button" data-action="changeInput" value="" data-text="empty" class="ws-empty" tabindex="-1"></button></div>');
			popover.nextElement = $('button.ws-next', popover.contentElement);
			popover.prevElement = $('button.ws-prev', popover.contentElement);
			popover.bodyElement = $('div.ws-picker-body', popover.contentElement);
			popover.buttonRow = $('div.ws-button-row', popover.contentElement);
			
			popover.contentElement
				.on('click', 'button[data-action]', actionfn)
				.on('change', 'select[data-action]', actionfn)
			;
			
			$(data.options.orig).on('input', function(){
				var currentView;
				if(data.options.updateOnInput && popover.isVisible && data.options.value && (currentView = popover.element.attr('data-currentview'))){
					actions[currentView]( data.options.value , popover, data, 0);
				}
			});
			
			popover.element.on('wspopoverbeforeshow', function(){
				$('button', popover.buttonRow).each(function(){
					if($(this).is('.ws-empty')){
						$.prop(this, 'disabled', $.prop(data.orig, 'required'));
					}
					$(this).text($(this).data('text'));
				});
			});
			
			$(document)
				.onTrigger('wslocalechange',function(){
					$('> span', popover.nextElement).html(curCfg.date.nextText);
					$('> span', popover.prevElement).html(curCfg.date.prevText);
					
					data.list(data.options.options);
				})
			;
		};
		
		picker.month = function(data){
			var popover = webshims.objectCreate(webshims.wsPopover, {}, {prepareFor: data.element});
			var opener = $('<span class="popover-opener" />').appendTo(data.buttonWrapper);
			var options = data.options;
			var init = false;
			
			var show = function(){
				if(!options.disabled && !options.readonly){
					if(!init){
						picker.commonInit(data, popover);
					}
					
					if(!init || data.options.restartView) {
						actions.setYearList( options.value || options.defValue, popover, data, data.options.startAt);
					} else {
						actions[popover.element.attr('data-currentview') || 'setYearList']( options.value || options.defValue, popover, data, 0)
					}
					
					init = true;
					popover.show(data.element);
				}
			};
			
			popover.element.addClass(data.type+'-popover input-picker');
			
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
		var initDataList = function(input, data){
			var listTimer, updateList, list;
			
			if(data){
				updateList = function(){
					list = $(input)
						.jProp('list')
						.off('updateDatalist', updateList)
						.on('updateDatalist', updateList)
					;
					clearTimeout(listTimer);
					listTimer = setTimeout(function(){
						if (data.shim && data.shim.list) {
							data.shim.list(getOptions(input, list), input);
						}
					}, 9);
						
					
					
					
				};
				$(input).onTrigger('listdatalistchange', updateList);
			}
			return getOptions(input, list);
		};
		var getOptions = function(input, list){
			var options = {};
			(list || $(input).jProp('list')).find('option').each(function(){
				options[$.prop(this, 'value')] = $.prop(this, 'label');
			});
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
					
					if(data.buttonWrapper && data.buttonWrapper.filter(isVisible).length){
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
					options: initDataList(this, data),
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
				
				if(data.shim.buttonWrapper && data.shim.buttonWrapper.filter(isVisible).length){
					data.shim.element.addClass('has-input-buttons');
				}
				
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
						var data = $('<input class="ws-'+name+'" type="text" />')
							.insertAfter(opts.orig)
							.spinbtnUI(opts)
							.data('wsspinner')
						;
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

