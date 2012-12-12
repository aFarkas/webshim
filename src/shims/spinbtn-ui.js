jQuery.webshims.register('spinbtn-ui', function($, webshims, window, document, undefined, options){
	"use strict";
	var formcfg = $.webshims.formcfg;
	var curCfg;
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
			nextText: 'Vor;',
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
	
	$.webshims.ready('dom-extend', function(){
		$.webshims.activeLang({
			register: 'form-core', 
			callback: function(){
				$.each(arguments, function(i, val){
					if(formcfg[val]){
						curCfg = formcfg[val];
						$.event.trigger('wslocalechange');
						return false;
					}
				});
			}
		});
	});
	
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
		return val.length == 1 ? '0'+val : val;
	};
	
	var formatVal = {
		number: function(val){
			return (val+'').replace(/\,/g, '').replace(/\./, curCfg.numberFormat['.']);
		},
		time: function(val){
			return val;
		},
		month: function(val){
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
			step: 1
		},
		date: {
			step: 1,
			start: (new Date(new Date().getFullYear(), '00', '01')).getTime()
		}
	};
	
	var createAsNumber = (function(){
		var types = {};
		return function(type){
			var input;
			if(!types[type]){
				input = $('<input type="'+type+'" />');
				types[type] = function(val){
					return input.prop('value', val).prop('valueAsNumber');
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
			this.buttonWrapper = $('<span class="input-buttons"><span unselectable="on" class="step-controls"><span class="step-up"></span><span class="step-down"></span></span></span>')
				.insertAfter(this.element)
			;
			for(i = 0; i < createOpts.length; i++){
				this[createOpts[i]](this.options[createOpts[i]]);
			}
			var elem = this.element.attr('autocomplete', 'off').data(this.type+'Ui', this);
			this.addBindings();
			if($.browser.mozilla){
				$(window).on('unload', function(){
					elem.remove();
				});
			}
			this._init = true;
		},
		parseValue: function(val){
			return parseVal[this.type](val);
		},
		formatValue: function(val){
			return formatVal[this.type](val);
		},
		_setStartInRange: function(){
			var start = steps[this.type].start || 0;
			if(!isNaN(this.minAsNumber) && start < this.minAsNumber){
				start = this.minAsNumber;
			} else if(!isNaN(this.maxAsNumber) && start > this.maxAsNumber){
				start = this.maxAsNumber;
			}
			this.elemHelper.prop('valueAsNumber', start);
		},
		value: function(val){
			this.valueAsNumber = this.asNumber(val);
			this.options.value = val;
			if(isNaN(this.valueAsNumber)){
				this._setStartInRange();
			} else {
				this.elemHelper.prop('value', val);
			}
			this.element.prop('value', formatVal[this.type](val));
		},
		
		list: function(opts){
			
		},
		readonly: function(val){
			this.options.readonly = !!val;
			this.element.prop('readonly', this.options.readonly);
		},
		disabled: function(val){
			this.options.disabled = !!val;
			this.element.prop('disabled', this.options.disabled);
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
						if(!e.ctrlKey && !e.metaKey){
							chr = String.fromCharCode(e.charCode == null ? code : e.charCode);
							stepped = !(chr < " " || (curCfg[that.type+'Signs']+'0123456789').indexOf(chr) > -1);
						} else {
							stepped = false;
						}
					}
					if(stepped){
						e.preventDefault();
					}
				},
				wslocalechange: function(){
					that.value(that.options.value);
				}
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
		opts = $.extend({readonly: false, disabled: false, tabindex: 0, min: 0, step: 1, max: 100, value: 50, input: $.noop, change: $.noop, _change: $.noop, showLabels: true}, opts);
		return this.each(function(){
			$.webshims.objectCreate(spinBtnProto, {
				element: {
					value: $(this)
				}
			}, opts);
		});
	};
});
