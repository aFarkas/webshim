(function($){
	var steps = {
		number: {
			step: 1,
			stepScaleFactor: 1
		},
		date: {
			step: 1,
			//stepBase: 0, 0 = default
			stepScaleFactor:  86400000
		},
		time: {
			step: 60,
			stepScaleFactor:  1000
		}
	};
	steps.range = steps.number;
	var elems = {
		
	};
	
	var spinBtnProto = {
		_create: function(){
			var i;
			this.type = this.options.type;
			if(!elems[this.type]){
				elems[this.type] = $('<input type="'+ this.type+'" />');
			}
			this.elemHelper = elems[this.type];
			this.buttonWrapper = $('<span class="input-buttons"><span unselectable="on" class="step-controls"><span class="step-up"></span><span class="step-down"></span></span></span>')
				.insertAfter(this.element)
			;
			this.element.data(this.type+'Ui', this);
			this.addBindings();
			this._init = true;
		},
		value: $.noop,
		value: function(val){
			
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
		min: function(val){
			
		},
		max: function(val){
			
		},
		step: function(val){
			
		},
		
		normalizeVal: function(val){
			
		},
		doStep: function(factor){
			this.value( this.options.value + (retDefault(this.options.step, 1) * factor) );
		},
		
		addBindings: function(){
			
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
