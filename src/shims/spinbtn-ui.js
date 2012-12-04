(function($){
	var formcfg = $.webshims.formcfg;
	var curCfg;
	formcfg.de = {
		numberFormat: {
			",": ".",
			".": ","
		},
		dateFormat: {
			"-": "."
		},
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
		dateFormat: {
			"-": "/"
		},
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
						return false;
					}
				});
			}
		});
	});
	
	var retDefault = function(val, def){
		if(!(typeof val == 'number' || (val && val == val * 1))){
			return def;
		}
		return val * 1;
	};
	var createOpts = ['step', 'min', 'max', 'readonly', 'title', 'disabled', 'tabindex', 'value'];
	var steps = {
		number: {
			step: 1
		},
		time: {
			step: 60
		}
	};
	var formatVal = {
		number: function(val){
			return (val+'').replace(/\,/g, '').replace(/\./, curCfg.numberFormat['.']);
		}
	};
	steps.range = steps.date = steps.number;
		
	var spinBtnProto = {
		_create: function(){
			var i;
			this.type = this.options.type;
			
			this.elemHelper = $('<input type="'+ this.type+'" />').insertAfter(this.element);
			this.buttonWrapper = $('<span class="input-buttons"><span unselectable="on" class="step-controls"><span class="step-up"></span><span class="step-down"></span></span></span>')
				.insertAfter(this.element)
			;
			for(i = 0; i < createOpts.length; i++){
				this[createOpts[i]](this.options[createOpts[i]]);
			}
			var elem = this.element.data(this.type+'Ui', this);
			this.addBindings();
			$(window).on('unload', function(){
				elem.remove();
			});
			this._init = true;
		},
		parseValue: function(val){
			
		},
		formatValue: function(val){
			
			
		},
		value: function(val){
			var valueAsNumber = this.asNumber(val);
			this.options.value = val;
			if(isNaN(valueAsNumber)){
				this.elemHelper.prop('valueAsNumber', 0);
			}
			this.element.prop('value', formatVal[this.type](val));
			console.log(val)
		},
		
		list: function(opts){
			
		},
		readonly: function(val){
			
		},
		disabled: function(val){
			
		},
		tabindex: function(val){
			
		},
		title: function(val){
			
		},
		asNumber: function(val){
			return this.elemHelper.prop('value', val).prop('valueAsNumber');
		},
		min: function(val){
			this.elemHelper.prop('min', val);
		},
		max: function(val){
			this.elemHelper.prop('max', val);
		},
		step: function(val){
			var defStep = steps[this.type];
			this.elemHelper.prop('step', retDefault(val, defStep.step));
		},
		
		normalizeVal: function(val){
			
		},
		
		addBindings: function(){
			var that = this;
			var preventBlur = function(e){
				if(preventBlur.prevent){
					e.preventDefault();
					that.element.focus();
					e.stopImmediatePropagation();
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
			
			this.element.on('blur', preventBlur);
			this.buttonWrapper.bind('mousedown', function(){
				preventBlur.set();
				return false;
			});
			
			$('.step-up', this.buttonWrapper)
				.on('mousedown', function(e){
					var val = that.stepUp(1);
					if(val !== false){
						that.options.input(val);
					}
				})
			;
			$('.step-down', this.buttonWrapper)
				.on('mousedown', function(e){
					var val = that.stepDown(1);
					if(val !== false){
						that.options.input(val);
					}
					
				})
			;
		}
	};
	['stepUp', 'stepDown'].forEach(function(name){
		spinBtnProto[name] = function(factor){
			var ret = false;
			try {
				this.elemHelper[name](factor);
				ret = this.elemHelper.prop('value');
				this.value(ret);
			} catch(er){}
			return ret;
		};
	});
	
	
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
})(jQuery);
