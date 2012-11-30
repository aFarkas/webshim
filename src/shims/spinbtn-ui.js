(function($){
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
	steps.range = steps.date = steps.number;
		
	var spinBtnProto = {
		_create: function(){
			var i;
			this.type = this.options.type;
			
			this.elemHelper = $('<input type="'+ this.type+'" />');
			this.buttonWrapper = $('<span class="input-buttons"><span unselectable="on" class="step-controls"><span class="step-up"></span><span class="step-down"></span></span></span>')
				.insertAfter(this.element)
			;
			for(i = 0; i < createOpts.length; i++){
				this[createOpts[i]](this.options[createOpts[i]]);
			}
			this.element.data(this.type+'Ui', this);
			this.addBindings();
			this._init = true;
		},
		value: function(val){
			var valueAsNumber = this.asNumber(val);
			this.options.value = val;
			if(isNaN(valueAsNumber)){
				this.elemHelper.prop('valueAsNumber', 0);
			}
			this.stringValue(val);
			console.log(val)
		},
		stringValue: function(val){
			this.element.prop('value', val);
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
		stepUp: function(factor){
			this.value(this.elemHelper.stepUp(factor).prop('value'));
		},
		stepDown: function(factor){
			this.value(this.elemHelper.stepDown(factor).prop('value'));
		},
		
		addBindings: function(){
			var that = this;
			$('.step-up', this.buttonWrapper)
				.on('mousedown', function(){
					that.stepUp(1);
					return false;
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
})(jQuery);
