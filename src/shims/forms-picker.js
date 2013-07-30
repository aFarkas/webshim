webshims.register('forms-picker', function($, webshims, window, document, undefined, options){
	"use strict";
	var picker = webshims.picker;
	var actions = picker._actions;
	var moduleOpts = options;
	
	var getDateArray = function(date){
		var ret = [date.getFullYear(), moduleOpts.addZero(date.getMonth() + 1), moduleOpts.addZero(date.getDate())];
		ret.month = ret[0]+'-'+ret[1];
		ret.date = ret[0]+'-'+ret[1]+'-'+ret[2];
		ret.time = date.getHours() +':'+ date.getMinutes();
		return ret;
	};
	var today = getDateArray(new Date());
	
	
	var _setFocus = function(element, _noFocus){
		
		element = $(element || this.activeButton);
		this.activeButton.attr({tabindex: '-1', 'aria-selected': 'false'});
		this.activeButton = element.attr({tabindex: '0', 'aria-selected': 'true'});
		this.index = this.buttons.index(this.activeButton[0]);
		
		clearTimeout(this.timer);
		
		picker._genericSetFocus.apply(this, arguments);
		
	};
	
	var _initialFocus = function(){
		var sel;
		if(this.popover.navedInitFocus){
			sel = this.popover.navedInitFocus.sel || this.popover.navedInitFocus;
			if((!this.activeButton || !this.activeButton[0]) && this.buttons[sel]){
				this.activeButton = this.buttons[sel]();
			} else if(sel){
				this.activeButton = $(sel, this.element);
			}
			
			if(!this.activeButton[0] && this.popover.navedInitFocus.alt){
				this.activeButton = this.buttons[this.popover.navedInitFocus.alt]();
			}
		}
		
		if(!this.activeButton || !this.activeButton[0]){
			this.activeButton = this.buttons.filter('.checked-value');
		}
		
		if(!this.activeButton[0]){
			this.activeButton = this.buttons.filter('.this-value');
		}
		if(!this.activeButton[0]){
			this.activeButton = this.buttons.eq(0);
		}
		
		this.setFocus(this.activeButton, this.opts.noFocus);
	};
	var formcfg = webshims.formcfg;
	var curCfg = formcfg[$.webshims.activeLang()] || formcfg[''];
	$.webshims.activeLang({
		register: 'form-core', 
		callback: function(){
			$.each(arguments, function(i, val){
				if(formcfg[val]){
					curCfg = formcfg[val];
					return false;
				}
			});
		}
	});
	
	
	webshims.ListBox = function (element, popover, opts){
		this.element = $('ul', element);
		this.popover = popover;
		this.opts = opts || {};
		this.buttons = $('button:not(:disabled)', this.element);
		
		
		this.ons(this);
		this._initialFocus();
	};
	
	webshims.ListBox.prototype = {
		setFocus: _setFocus,
		_initialFocus: _initialFocus,
		prev: function(){
			var index = this.index - 1;
			if(index < 0){
				if(this.opts.prev){
					this.popover.navedInitFocus = 'last';
					this.popover.actionFn(this.opts.prev);
					this.popover.navedInitFocus = false;
				}
			} else {
				this.setFocus(this.buttons.eq(index));
			}
		},
		next: function(){
			var index = this.index + 1;
			if(index >= this.buttons.length){
				if(this.opts.next){
					this.popover.navedInitFocus = 'first';
					this.popover.actionFn(this.opts.next);
					this.popover.navedInitFocus = false;
				}
			} else {
				this.setFocus(this.buttons.eq(index));
			}
		},
		ons: function(that){
			this.element
				.on({
					'keydown': function(e){
						var handled;
						var key = e.keyCode;
						if(e.ctrlKey){return;}
						if(key == 36 || key == 33){
							that.setFocus(that.buttons.eq(0));
							handled = true;
						} else if(key == 34 || key == 35){
							that.setFocus(that.buttons.eq(that.buttons.length - 1));
							handled = true;
						} else if(key == 38 || key == 37){
							that.prev();
							handled = true;
						} else if(key == 40 || key == 39){
							that.next();
							handled = true;
						}
						if(handled){
							return false;
						}
					}
				})
			;
		}
	};
	
	webshims.Grid = function (element, popover, opts){
		this.element = $('tbody', element);
		this.popover = popover;
		this.opts = opts || {};
		this.buttons = $('button:not(:disabled,.othermonth)', this.element);
		
		this.ons(this);
		
		this._initialFocus();
		if(this.popover.openedByFocus){
			this.popover.activeElement = this.activeButton;
		}
	};
	
	
	
	webshims.Grid.prototype = {
		setFocus: _setFocus,
		_initialFocus: _initialFocus,
		
		first: function(){
			this.setFocus(this.buttons.eq(0));
		},
		last: function(){
			this.setFocus(this.buttons.eq(this.buttons.length - 1));
		},
		upPage: function(){
			$('.ws-picker-header > button:not(:disabled)', this.popover.element).trigger('click');
		},
		downPage: function(){
			this.activeButton.filter(':not([data-action="changeInput"])').trigger('click');
		},
		ons: function(that){
			this.element
				.on({
					'keydown': function(e){
						var handled;
						var key = e.keyCode;
						
						if(e.shiftKey){return;}
						
						if((e.ctrlKey && key == 40)){
							handled = 'downPage';
						} else if((e.ctrlKey && key == 38)){
							handled = 'upPage';
						} else if(key == 33 || (e.ctrlKey && key == 37)){
							handled = 'prevPage';
						} else if(key == 34 || (e.ctrlKey && key == 39)){
							handled = 'nextPage';
						} else if(e.keyCode == 36 || e.keyCode == 33){
							handled = 'first';
						} else if(e.keyCode == 35){
							handled = 'last';
						} else if(e.keyCode == 38){
							handled = 'up';
						} else if(e.keyCode == 37){
							handled = 'prev';
						} else if(e.keyCode == 40){
							handled = 'down';
						} else if(e.keyCode == 39){
							handled = 'next';
						}
						if(handled){
							that[handled]();
							return false;
						}
					}
				})
			;
		}
	};
	$.each({
		prevPage: {get: 'last', action: 'prev'}, 
		nextPage: {get: 'first', action: 'next'}
	}, function(name, val){
		webshims.Grid.prototype[name] = function(){
			if(this.opts[val.action]){
				this.popover.navedInitFocus = {
					sel: 'button[data-id="'+ this.activeButton.attr('data-id') +'"]:not(:disabled,.othermonth)',
					alt: val.get
				};
				this.popover.actionFn(this.opts[val.action]);
				this.popover.navedInitFocus = false;
			}
		};
	});
	
	$.each({
		up: {traverse: 'prevAll', get: 'last', action: 'prev', reverse: true}, 
		down: {traverse: 'nextAll', get: 'first', action: 'next'}
	}, function(name, val){
		webshims.Grid.prototype[name] = function(){
			var cellIndex = this.activeButton.closest('td').prop('cellIndex');
			var sel = 'td:nth-child('+(cellIndex + 1)+') button:not(:disabled,.othermonth)';
			var button = this.activeButton.closest('tr')[val.traverse]();
			
			if(val.reverse){
				button = $(button.get().reverse());
			}
			button = button.find(sel)[val.get]();
			
			if(!button[0]){
				if(this.opts[val.action]){
					this.popover.navedInitFocus = sel+':'+val.get;
					this.popover.actionFn(this.opts[val.action]);
					this.popover.navedInitFocus = false;
				}
			} else {
				this.setFocus(button.eq(0));
			}
		};
	});
	
	$.each({
		prev: {traverse: 'prevAll',get: 'last', reverse: true}, 
		next: {traverse: 'nextAll', get: 'first'}
	}, function(name, val){
		webshims.Grid.prototype[name] = function(){
			var sel = 'button:not(:disabled,.othermonth)';
			var button = this.activeButton.closest('td')[val.traverse]('td');
			if(val.reverse){
				button = $(button.get().reverse());
			}
			button = button.find(sel)[val.get]();
			if(!button[0]){
				button = this.activeButton.closest('tr')[val.traverse]('tr');
				if(val.reverse){
					button = $(button.get().reverse());
				}
				button = button.find(sel)[val.get]();
			}
			
			if(!button[0]){
				if(this.opts[name]){
					this.popover.navedInitFocus = val.get;
					this.popover.actionFn(this.opts[name]);
					this.popover.navedInitFocus = false;
				}
			} else {
				this.setFocus(button.eq(0));
			}
		};
	});
	
	//taken from jquery ui
	picker.getWeek = function(date){
		var time;
		var checkDate = new Date(date.getTime());

		checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));

		time = checkDate.getTime();
		checkDate.setMonth(0);
		checkDate.setDate(1);
		return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
	};
	
	picker.getYearList = function(value, data){
		var j, i, val, disabled, lis, prevDisabled, nextDisabled, classStr, classArray, start;
		
		
		var size = data.options.size;
		var max = data.options.max.split('-');
		var min = data.options.min.split('-');
		var currentValue = data.options.value.split('-');
		var xthCorrect = 0;
		var enabled = 0;
		var str = '';
		var rowNum = 0;
		
		if(data.options.useDecadeBase == 'max' && max[0]){
			xthCorrect = 11 - (max[0] % 12);
		} else if(data.options.useDecadeBase == 'min' && min[0]){
			xthCorrect = 11 - (min[0] % 12);
		}
		
		value = value[0] * 1;
		start = value - ((value + xthCorrect) % (12 * size));
		
		
		
		for(j = 0; j < size; j++){
			if(j){
				start += 12;
			}  else {
				prevDisabled = picker.isInRange([start-1], max, min) ? {'data-action': 'setYearList','value': start-1} : false;
			}
			
			str += '<div class="year-list picker-list ws-index-'+ j +'"><div class="ws-picker-header"><button disabled="disabled">'+ start +' – '+(start + 11)+'</button></div>';
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
					classArray.push('this-value');
				}
				
				if(currentValue[0] == val){
					classArray.push('checked-value');
				}
				
				classStr = classArray.length ? ' class="'+ (classArray.join(' ')) +'"' : '';
				
				if(i && !(i % 4)){
					rowNum++;
					lis.push('</tr><tr class="ws-row-'+ rowNum +'">');
				}
				lis.push('<td class="ws-item-'+ i +'" role="presentation"><button  data-id="year-'+ i +'" type="button"'+ disabled + classStr +' data-action="setMonthList" value="'+val+'" tabindex="-1" role="gridcell">'+val+'</button></td>');
			}
			if(j == size - 1){
				nextDisabled = picker.isInRange([val+1], max, min) ? {'data-action': 'setYearList','value': val+1} : false;
			}
			str += '<div class="picker-grid"><table role="grid" aria-label="'+ start +' – '+(start + 11)+'"><tbody><tr class="ws-row-0">'+ (lis.join(''))+ '</tr></tbody></table></div></div>';
		}
		
		return {
			enabled: enabled,
			main: str,
			next: nextDisabled,
			prev: prevDisabled,
			type: 'Grid'
		};
	};
	
	
	picker.getMonthList = function(value, data){
		
		var j, i, name, val, disabled, lis, fullyDisabled, prevDisabled, nextDisabled, classStr, classArray;
		var o = data.options;
		var size = o.size;
		var max = o.max.split('-');
		var min = o.min.split('-');
		var currentValue = o.value.split('-');
		var enabled = 0;
		var rowNum = 0;
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
			
			if(o.minView >= 1){
				disabled = ' disabled=""';
			}
			
			str += '<div class="month-list picker-list ws-index-'+ j +'"><div class="ws-picker-header">';
			
			str += o.selectNav ? 
				'<select data-action="setMonthList" class="year-select">'+ picker.createYearSelect(value, max, min).join('') +'</select>' : 
				'<button data-action="setYearList"'+disabled+' value="'+ value +'" tabindex="-1">'+ value +'</button>';
			str += '</div>';
			
			for(i = 0; i < 12; i++){
				val = curCfg.date.monthkeys[i+1];
				name = (curCfg.date[o.monthNames] || curCfg.date.monthNames)[i];
				classArray = [];
				if(fullyDisabled || !picker.isInRange([value, val], max, min) ){
					disabled = ' disabled=""';
				} else {
					disabled = '';
					enabled++;
				}
				
				if(value == today[0] && today[1] == val){
					classArray.push('this-value');
				}
				
				if(currentValue[0] == value && currentValue[1] == val){
					classArray.push('checked-value');
				}
				
				classStr = (classArray.length) ? ' class="'+ (classArray.join(' ')) +'"' : '';
				if(i && !(i % 4)){
					rowNum++;
					lis.push('</tr><tr class="ws-row-'+ rowNum +'">');
				}

				lis.push('<td class="ws-item-'+ i +'" role="presentation"><button data-id="month-'+ i +'" type="button"'+ disabled + classStr +' data-action="'+ (data.type == 'month' ? 'changeInput' : 'setDayList' ) +'" value="'+value+'-'+val+'" tabindex="-1" role="gridcell" aria-label="'+ curCfg.date.monthNames[i] +'">'+name+'</button></td>');
				
			}
			
			str += '<div class="picker-grid"><table role="grid" aria-label="'+value+'"><tbody><tr class="ws-row-0">'+ (lis.join(''))+ '</tr></tbody></table></div></div>';
		}
		
		return {
			enabled: enabled,
			main: str,
			prev: prevDisabled,
			next: nextDisabled,
			type: 'Grid'
		};
	};
	
	
	picker.getDayList = function(value, data){
		
		var j, i, k, day, nDay, name, val, disabled, lis,  prevDisabled, nextDisabled, addTr, week, rowNum;
		
		var lastMotnh, curMonth, otherMonth, dateArray, monthName, fullMonthName, buttonStr, date2, classArray;
		var o = data.options;
		var size = o.size;
		var max = o.max.split('-');
		var min = o.min.split('-');
		var currentValue = o.value.split('-');
		var monthNames = curCfg.date[o.monthNamesHead] || curCfg.date[o.monthNames] || curCfg.date.monthNames; 
		var enabled = 0;
		var str = [];
		var date = new Date(value[0], value[1] - 1, 1);
		var action = (data.type == 'datetime-local') ? 'setTimeList' : 'changeInput';
		
		date.setMonth(date.getMonth()  - Math.floor((size - 1) / 2));
		
		for(j = 0;  j < size; j++){
			date.setDate(1);
			lastMotnh = date.getMonth();
			rowNum = 0;
			if(!j){
				date2 = new Date(date.getTime());
				date2.setDate(-1);
				dateArray = getDateArray(date2);
				prevDisabled = picker.isInRange(dateArray, max, min) ? {'data-action': 'setDayList','value': dateArray[0]+'-'+dateArray[1]} : false;
			}
			
			dateArray = getDateArray(date);
			
			str.push('<div class="day-list picker-list ws-index-'+ j +'"><div class="ws-picker-header">');
			if( o.selectNav ){
				monthName = ['<select data-action="setDayList" class="month-select" tabindex="0">'+ picker.createMonthSelect(dateArray, max, min, monthNames).join('') +'</select>', '<select data-action="setDayList" class="year-select" tabindex="0">'+ picker.createYearSelect(dateArray[0], max, min, '-'+dateArray[1]).join('') +'</select>'];
				if(curCfg.date.showMonthAfterYear){
					monthName.reverse();
				}
				str.push( monthName.join(' ') );
			} 
			
			fullMonthName = [curCfg.date.monthNames[(dateArray[1] * 1) - 1], dateArray[0]];
			monthName = [monthNames[(dateArray[1] * 1) - 1], dateArray[0]];
			if(curCfg.date.showMonthAfterYear){
				monthName.reverse();
				fullMonthName.reverse();
			}
			
			if(!data.options.selectNav) {
				str.push(  
					'<button data-action="setMonthList"'+ (o.minView >= 2 ? ' disabled="" ' : '') +' value="'+ dateArray.date +'" tabindex="-1">'+ monthName.join(' ') +'</button>'
				);
			}
			
			
			str.push('</div><div class="picker-grid"><table role="grid" aria-label="'+ fullMonthName.join(' ')  +'"><thead><tr>');
			
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
				str.push('<td class="week-cell">'+ week +'</td>');
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
						if(week > 52){
							week =  picker.getWeek(date);
						}
						str.push('<td class="week-cell">'+ week +'</td>');
					}
				}
				
				if(!i){
					
					if(day != curCfg.date.firstDay){
						nDay = day - curCfg.date.firstDay;
						if(nDay < 0){
							nDay += 7;
						}
						date.setDate(date.getDate() - nDay);
						day = date.getDay();
						curMonth = date.getMonth();
						otherMonth = lastMotnh != curMonth;
					}
				}
				
				dateArray = getDateArray(date);
				buttonStr = '<td role="presentation" class="day-'+ day +'"><button data-id="day-'+ date.getDate() +'" role="gridcell" data-action="'+action+'" value="'+ (dateArray.join('-')) +'" type="button"';
				
				if(otherMonth){
					classArray.push('othermonth');
				} else {
					classArray.push('day-'+date.getDate());
				}
				
				if(dateArray[0] == today[0] && today[1] == dateArray[1] && today[2] == dateArray[2]){
					classArray.push('this-value');
				}
				
				if(currentValue[0] == dateArray[0] && dateArray[1] == currentValue[1] && dateArray[2] == currentValue[2]){
					classArray.push('checked-value');
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
			str.push('</tbody></table></div></div>');
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
			next: nextDisabled,
			type: 'Grid'
		};
	};
	
//	var createDatimeValue = 
	
	
	picker.getTimeList = function(value, data){
		var label, tmpValue, iVal, hVal, valPrefix;
		var str = '<div class="time-list picker-list ws-index-0">';
		var i = 0;
		var rowNum = 0;
		var len = 24;
		var attrs = {
			min: $.prop(data.orig, 'min'),
			max: $.prop(data.orig, 'max'),
			step: $.prop(data.orig, 'step')
		};
		var o = data.options;
		var monthNames = curCfg.date[o.monthNamesHead] || curCfg.date[o.monthNames] || curCfg.date.monthNames; 
		var gridLabel = '';
		
		if(data.type == 'time'){
			label = '<button type="button" disabled="">'+ $.trim($(data.orig).jProp('labels').text() || '').replace(/[\:\*]/g, '')+'</button>';
		} else {
			tmpValue = value[2].split('T');
			value[2] = tmpValue[0];
			if(tmpValue[1]){
				value[3] = tmpValue[1];
			}
			label = value[2] +'. '+ (monthNames[(value[1] * 1) - 1]) +' '+ value[0];
			gridLabel = ' aria-label="'+ label +'"';
			label = '<button tabindex="-1" data-action="setDayList" value="'+value[0]+'-'+value[1]+'-'+value[2]+'" type="button">'+label+'</button>';
			valPrefix = value[0] +'-'+value[1]+'-'+value[2]+'T';
		}
		
		str += '<div class="ws-picker-header">'+label+'</div>';
		
		str += '<div class="picker-grid"><table role="grid"'+ gridLabel +'><tbody><tr>';
		console.log(attrs)
		for(; i <= len; i++){
			iVal = moduleOpts.addZero(''+i) +':00';
			hVal = valPrefix ? 
				valPrefix+iVal :
				iVal
			;
				
			if(i && !(i % 5)){
				rowNum++;
				str += '</tr><tr class="ws-row-'+ rowNum +'">';
			}
			str += '<td role="presentation"><button role="gridcell" data-action="changeInput" value="'+ hVal +'" type="button" tabindex="-1"';
			
			if(!data.isValid(hVal, attrs)){
				console.log(hVal, attrs)
				str += ' disabled=""';
			}
			if(value == iVal){
				str += ' class="checked-value"';
			}
			str += '>'+ data.formatValue(iVal) +'</button></td>';
		}
		
		
		str += '</tr></tbody></table></div></div>';
		
		return {
			enabled: 9,
			main: str,
			prev: false,
			next: false,
			type: 'Grid'
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
				options.push('<option value="'+ value[0]+'-'+moduleOpts.addZero(i+1) + '"'+selected+'>'+ monthNames[i] +'</option>');
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
		
	(function(){
		var retNames = function(name){
			return 'get'+name+'List';
		};
		var retSetNames = function(name){
			return 'set'+name+'List';
		};
		var stops = {
			date: 'Day',
			week: 'Day',
			month: 'Month',
			'datetime-local': 'Time',
			time: 'Time'
		};
		
		$.each({'setYearList' : ['Year', 'Month', 'Day', 'Time'], 'setMonthList': ['Month', 'Day', 'Time'], 'setDayList': ['Day', 'Time'], 'setTimeList': ['Time']}, function(setName, names){
			var getNames = names.map(retNames);
			var setNames = names.map(retSetNames);
			actions[setName] = function(val, popover, data, startAt){
				val = ''+val;
				var o = data.options;
				var values = val.split('-');
				if(!startAt){
					startAt = 0;
				}
				$.each(getNames, function(i, item){
					if(i >= startAt){
						var content = picker[item](values, data);
						
						if( values.length < 2 || content.enabled > 1 || stops[data.type] === names[i]){
							popover.element
								.attr({'data-currentview': setNames[i]})
								.addClass('ws-size-'+o.size)
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
							if(webshims[content.type]){
								new webshims[content.type](popover.bodyElement.children(), popover, content);
							}
							popover.element.trigger('pickerchange')
								.filter('[data-vertical="bottom"]')
								.triggerHandler('pospopover')
							;
							return false;
						}
					}
				});
			};
		});
	})();
	
	picker.showPickerContent = function(data, popover){
		var options = data.options;
		if(!data._popoverinit){
			picker.commonInit(data, popover);
			picker.commonDateInit(data, popover);
		}
		
		if(!data._popoverinit || options.restartView) {
			actions.setYearList( options.defValue || options.value, popover, data, options.startView);
		} else {
			actions[popover.element.attr('data-currentview') || 'setYearList']( options.defValue || options.value, popover, data, 0);
		}
		data._popoverinit = true;
	};
	
	
	picker.commonDateInit = function(data, popover){
		var actionfn = function(e){
			if(!$(this).is('.othermonth') || $(this).css('cursor') == 'pointer'){
				popover.actionFn({
					'data-action': $.attr(this, 'data-action'),
					value: $(this).val() || $.attr(this, 'value')
				});
			}
			return false;
		};
		var id = new Date().getTime();
		var generateList = function(o, max, min){
			var options = [];
			var label = '';
			var labelId = '';
			o.options = data.getOptions() || {};
			$('div.ws-options', popover.contentElement).remove();
			$.each(o.options[0], function(val, label){
				var disabled = picker.isInRange(val.split('-'), o.maxS, o.minS) ?
					'' :
					' disabled="" '
				;
				options.push('<li role="presentation"><button value="'+ val +'" '+disabled+' data-action="changeInput" tabindex="-1"  role="option">'+ (label || data.formatValue(val, false)) +'</button></li>');
			});
			if(options.length){
				id++;
				if(o.options[1]){
					labelId = 'datalist-'+id;
					label = '<h5 id="'+labelId+'">'+ o.options[1] +'</h5>';
					labelId = ' aria-labelledbyid="'+ labelId +'" ';
				}
				new webshims.ListBox($('<div class="ws-options">'+label+'<ul role="listbox" '+ labelId +'>'+ options.join('') +'</div>').insertAfter(popover.bodyElement)[0], popover, {noFocus: true});
			}
		};
		var updateContent = function(){
			if(popover.isDirty){
				var o = data.options;
				o.maxS = o.max.split('-');
				o.minS = o.min.split('-');
				
				$('button', popover.buttonRow).each(function(){
					var text;
					if($(this).is('.ws-empty')){
						text = curCfg.date.clear;
						if(!text){
							text = formcfg[''].date.clear || 'clear';
							webshims.warn("could not get clear text from form cfg");
						}
					} else if($(this).is('.ws-current')){
						text = (curCfg[data.type] || {}).currentText;
						if(!text){
							text = (formcfg[''][[data.type]] || {}).currentText || 'current';
							webshims.warn("could not get currentText from form cfg");
						}
						if(today[data.type] && data.type != 'time'){
							$.prop(this, 'disabled', !picker.isInRange(today[data.type].split('-'), o.maxS, o.minS));
						}
					}
					if(text){
						$(this).text(text).attr({'aria-label': text});
						if(webshims.assumeARIA){
							$.attr(this, 'aria-label', text);
						}
					}
					
				});
				popover.nextElement.attr({'aria-label': curCfg.date.nextText});
				$('> span', popover.nextElement).html(curCfg.date.nextText);
				popover.prevElement.attr({'aria-label': curCfg.date.prevText});
				$('> span', popover.prevElement).html(curCfg.date.prevText);
				
				generateList(o, o.maxS, o.minS);
				
				if(popover.isVisible){
					picker.showPickerContent(data, popover);
				}
				
			}
			$('button.ws-empty', popover.buttonRow).prop('disabled', $.prop(data.orig, 'required'));
			popover.isDirty = false;
		};
		
		popover.actionFn = function(obj){
			if(actions[obj['data-action']]){
				actions[obj['data-action']](obj.value, popover, data, 0);
			} else {
				webshims.warn('no action for '+ obj['data-action']);
			}
		};
		
		popover.contentElement.html('<button class="ws-prev" tabindex="0"><span></span></button> <button class="ws-next" tabindex="0"><span></span></button><div class="ws-picker-body"></div><div class="ws-button-row"><button type="button" class="ws-current" data-action="changeInput" value="'+today[data.type]+'" tabindex="0"></button> <button type="button" data-action="changeInput" value="" class="ws-empty" tabindex="0"></button></div>');
		popover.nextElement = $('button.ws-next', popover.contentElement);
		popover.prevElement = $('button.ws-prev', popover.contentElement);
		popover.bodyElement = $('div.ws-picker-body', popover.contentElement);
		popover.buttonRow = $('div.ws-button-row', popover.contentElement);
		popover.element.on('updatepickercontent', updateContent);
		
		popover.contentElement
			.on('click', 'button[data-action]', actionfn)
			.on('change', 'select[data-action]', actionfn)
		;
		
		if(data.options.inlinePicker){
			data.options.updateOnInput = true;
		}
		
		$(data.options.orig).on('input', function(){
			var currentView;
			if(data.options.updateOnInput && popover.isVisible && data.options.value && (currentView = popover.element.attr('data-currentview'))){
				actions[currentView]( data.options.value , popover, data, 0);
			}
		});
		$(document).onTrigger('wslocalechange', data._propertyChange);
	};
		
});
