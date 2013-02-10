jQuery.webshims.register('spinbtn-ui', function($, webshims, window, document, undefined, options){
	"use strict";
	var formcfg = $.webshims.formcfg;
	var curCfg;
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
	var mousePress = function(e){
		$(this)[e.type == 'mousepressstart' ? 'addClass' : 'removeClass']('mousepress-ui');
	};
	var retDefault = function(val, def){
		if(!(typeof val == 'number' || (val && val == val * 1))){
			return def;
		}
		return val * 1;
	};
	var createOpts = ['step', 'min', 'max', 'readonly', 'title', 'disabled', 'tabindex', 'value'];
	var createFormat = function(name){
		if(!curCfg.patterns[name+'Obj']){
			var obj = {};
			$.each(curCfg.patterns[name].split(curCfg[name+'Format']), function(i, name){
				obj[name] = i;
			});
			curCfg.patterns[name+'Obj'] = obj;
		}
	};
	var addZero = function(val){
		if(!val){return "";}
		val = val+'';
		return val.length == 1 ? '0'+val : val;
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
//			if($.browser.mozilla){
//				$(window).on('unload', function(){
//					elem.remove();
//				});
//			}
			this._init = true;
		},
		parseValue: function(val){
			return parseVal[this.type](val);
		},
		formatValue: function(val){
			return formatVal[this.type](val, this.options);
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
			var mouseDownInit = function(){
				if(!o.disabled && !isFocused){
					that.element[0].focus();
				}
				preventBlur.set();
				
				return false;
			};
			var step = {};
			var preventBlur = function(e){
				if(preventBlur.prevent){
					e.preventDefault();
					that.element.focus();
					e.stopImmediatePropagation();
					return true;
				}
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
			
			$(document).on('wslocalechange', function(){
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
});
