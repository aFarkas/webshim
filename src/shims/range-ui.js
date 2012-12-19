(function($){
	
	var id = 0;
	var isNumber = function(string){
		return (typeof string == 'number' || (string && string == string * 1));
	};
	var retDefault = function(val, def){
		if(!(typeof val == 'number' || (val && val == val * 1))){
			return def;
		}
		return val * 1;
	};
	var createOpts = ['step', 'min', 'max', 'readonly', 'title', 'disabled', 'tabindex'];
	var rangeProto = {
		_create: function(){
			var i;
			
			
			this.element.addClass('ws-range').attr({role: 'slider'}).html('<span class="ws-range-min" /><span class="ws-range-rail"><span class="ws-range-thumb" /></span>');
			this.trail = $('.ws-range-rail', this.element);
			this.range = $('.ws-range-min', this.element);
			this.thumb = $('.ws-range-thumb', this.trail);
			this.dirs = this.element.innerHeight() > this.element.innerWidth() ? 
				{mouse: 'pageY', pos: 'top', range: 'height', outerWidth: 'outerHeight'} :
				{mouse: 'pageX', pos: 'left', range: 'width', outerWidth: 'outerWidth'}
			;
			this.updateMetrics();
			
			this.orig = this.options.orig;
			
			for(i = 0; i < createOpts.length; i++){
				this[createOpts[i]](this.options[createOpts[i]]);
			}
			this.value = this._value;
			this.value(this.options.value);
			this.list(this.options.options);
			this.element.data('rangeUi', this);
			this.addBindings();
			this._init = true;
		},
		value: $.noop,
		_value: function(val, _noNormalize, animate){
			var left;
			var oVal = val;
			var thumbStyle = {};
			var rangeStyle = {};
			if(!_noNormalize && parseFloat(val, 10) != val){
				val = this.options.min + ((this.options.max - this.options.min) / 2);
			}
			
			if(!_noNormalize){
				val = this.normalizeVal(val);
			}
			left =  100 * ((val - this.options.min) / (this.options.max - this.options.min));
			
			this.options.value = val;
			this.thumb.stop();
			this.range.stop();
			thumbStyle[this.dirs.pos] = left+'%';
			rangeStyle[this.dirs.range] = left+'%';
			if(!animate){
				this.thumb.css(thumbStyle);
				this.range.css(rangeStyle);
			} else {
				this.thumb.animate(thumbStyle, {animate: this.options.animate});
				this.range.animate(rangeStyle, {animate: this.options.animate});
			}
			if(this.orig && (oVal != val || (!this._init && this.orig.value != val)) ){
				this.options._change(val);
			}
			this.element.attr({
				'aria-valuenow': this.options.value,
				'aria-valuetext': this.options.options[this.options.value] || this.options.value
			});
		},
		list: function(opts){
			var o = this.options;
			var min = o.min;
			var max = o.max;
			var trail = this.trail;
			o.options = opts || {};
			
			this.element.attr({'aria-valuetext': o.options[o.value] || o.value});
			$('.ws-range-ticks', trail).remove();
			
			
			$.each(opts, function(val, label){
				if(!isNumber(val) || val < min || val > max){return;}
				var left = 100 * ((val - min) / (max - min));
				var title = o.showLabels ? ' title="'+ label +'"' : '';
				trail.append('<span class="ws-range-ticks"'+ title +' style="'+(this.dirs.pos)+': '+left+'%;" />');
			});
		},
		readonly: function(val){
			val = !!val;
			this.options.readonly = val;
			this.element.attr('aria-readonly', ''+val);
		},
		disabled: function(val){
			val = !!val;
			this.options.disabled = val;
			if(val){
				this.element.attr({tabindex: -1, 'aria-disbaled': 'true'});
			} else {
				this.element.attr({tabindex: this.options.tabindex, 'aria-disbaled': 'false'});
			}
		},
		tabindex: function(val){
			this.options.tabindex = val;
			if(!this.options.disabled){
				this.element.attr({tabindex: val});
			}
		},
		title: function(val){
			this.element.prop('title', val);
		},
		min: function(val){
			this.options.min = retDefault(val, 0);
			this.value(this.options.value, true);
		},
		max: function(val){
			this.options.max = retDefault(val, 100);
			this.value(this.options.value, true);
		},
		step: function(val){
			this.options.step = val == 'any' ? 'any' : retDefault(val, 1);
			this.value(this.options.value);
		},
		
		normalizeVal: function(val){
			var valModStep, alignValue, step;
			var o = this.options;
			
			if(val <= o.min){
				val = o.min;
			} else if(val >= o.max) {
				val = o.max;
			} else if(o.step != 'any'){
				step = o.step;
				valModStep = (val - o.min) % step;
				alignValue = val - valModStep;
				
				if ( Math.abs(valModStep) * 2 >= step ) {
					alignValue += ( valModStep > 0 ) ? step : ( -step );
				}
				val = alignValue.toFixed(5) * 1;
			}
			return val;
		},
		doStep: function(factor){
			var step = retDefault(this.options.step, 1);
			if(this.options.step == 'any'){
				step = Math.min(step, (this.options.max - this.options.min) / 10);
			}
			this.value( this.options.value + (step * factor) );
			
		},
		 
		getStepedValueFromPos: function(pos){
			var val, valModStep, alignValue, step;
			
			if(pos <= 0){
				val = this.options.min;
			} else if(pos > 100) {
				val = this.options.max;
			} else {
				val = ((this.options.max - this.options.min) * (pos / 100)) + this.options.min;
				step = this.options.step;
				if(step != 'any'){
					valModStep = (val - this.options.min) % step;
					alignValue = val - valModStep;
					
					if ( Math.abs(valModStep) * 2 >= step ) {
						alignValue += ( valModStep > 0 ) ? step : ( -step );
					}
					val = ((alignValue).toFixed(5)) * 1;
					
				}
			}
			
			return val;
		},
		addBindings: function(){
			var leftOffset, widgetUnits, hasFocus;
			var that = this;
			var o = this.options;
			
			var eventTimer = (function(){
				var events = {};
				return {
					init: function(name, curVal, fn){
						if(!events[name]){
							events[name] = {fn: fn};
							if(that.orig){
								$(that.orig).on(name, function(){
									events[name].val = $.prop(that.orig, 'value');
								});
							}
							
						}
						events[name].val = curVal;
					},
					call: function(name, val){
						if(events[name].val != val){
							clearTimeout(events[name].timer);
							events[name].val = val;
							events[name].timer = setTimeout(function(){
								events[name].fn(val, that);
							}, 0);
						}
					}
				};
			})();
			
			var setValueFromPos = function(e, animate){
				var val = that.getStepedValueFromPos((e[that.dirs.mouse] - leftOffset) * widgetUnits);
				if(val != o.value){
					
					that.value(val, false, animate);
					eventTimer.call('input', val);
				}
			};
			
			var remove = function(e){
				if(e && e.type == 'mouseup'){
					eventTimer.call('input', o.value);
					eventTimer.call('change', o.value);
				}
				that.element.removeClass('ws-active');
				$(document).off('mousemove', setValueFromPos).off('mouseup', remove);
			};
			var add = function(e){
				e.preventDefault();
				$(document).off('mousemove', setValueFromPos).off('mouseup', remove);
				if(!o.readonly && !o.disabled){
					leftOffset = that.element.focus().addClass('ws-active').offset();
					widgetUnits = that.element.width();
					if(!widgetUnits || !leftOffset){return;}
					leftOffset = leftOffset[that.dirs.pos];
					widgetUnits = 100 / (widgetUnits  - ((that.thumb[that.dirs.outerWidth]() || 2) / 2));
					setValueFromPos(e, that.options.animate);
					$(document)
						.on({
							mouseup: remove,
							mousemove: setValueFromPos
						})
					;
					e.stopPropagation();
				}
			};
			
			eventTimer.init('input', o.value, this.options.input);
			eventTimer.init('change', o.value, this.options.change);
			
			this.element.on({
				mousedown: add,
				focus: function(e){
					if(!o.disabled){
						eventTimer.init('input', o.value);
						eventTimer.init('change', o.value);
						that.element.addClass('ws-focus');
					}
					hasFocus = true;
				},
				blur: function(e){
					that.element.removeClass('ws-focus ws-active');
					hasFocus = false;
					eventTimer.init('input', o.value);
					eventTimer.call('change', o.value);
				},
				keyup: function(){
					that.element.removeClass('ws-active');
					eventTimer.call('input', o.value);
					eventTimer.call('change', o.value);
				},
				mousewheel: function(e, delta){
					if(delta && hasFocus && !o.readonly && !o.disabled){
						that.doStep(delta);
						e.preventDefault();
						eventTimer.call('input', o.value);
					}
				},
				keypress: function(e){
					var step = true;
					var code = e.keyCode;
					if(!o.readonly && !o.disabled){
						if (code == 39 || code == 38) {
							that.doStep(1);
						} else if (code == 37 || code == 40) {
							that.doStep(-1);
						} else if (code == 33) {
							that.doStep(10);
						} else if (code == 34) {
							that.doStep(-10);
						} else if (code == 36) {
							that.value(that.options.max);
						} else if (code == 35) {
							that.value(that.options.min);
						} else {
							step = false;
						}
						if (step) {
							that.element.addClass('ws-active');
							eventTimer.call('input', o.value);
							e.preventDefault();
						}
					}
				}
			});
			this.thumb.on({
				mousedown: add
			});
		},
		updateMetrics: function(){
			
		}
	};
	
	$.fn.rangeUI = function(opts){
		opts = $.extend({readonly: false, disabled: false, tabindex: 0, min: 0, step: 1, max: 100, value: 50, input: $.noop, change: $.noop, _change: $.noop, showLabels: true}, opts);
		return this.each(function(){
			$.webshims.objectCreate(rangeProto, {
				element: {
					value: $(this)
				}
			}, opts);
		});
	};
	jQuery.webshims.isReady('range-ui', true);
})(jQuery);