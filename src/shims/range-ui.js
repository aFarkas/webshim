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
			
			this.thumb = $('<span class="ws-range-thumb" />');
			this.thumbStyle = this.thumb[0].style;
			this.element.addClass('ws-range').attr({role: 'slider'}).html(this.thumb);
			this.updateMetrics();
			this.options.min = retDefault(this.options.min, 0);
			this.options.max = retDefault(this.options.max, 100);
			this.options.step = this.options.step == 'any' ? 'any' : retDefault(this.options.step, 1);
			
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
		_value: function(val, _noNormalize){
			var left;
			var oVal = val;
			if(!_noNormalize && parseFloat(val, 10) != val){
				val = (this.options.max - this.options.min) / 2;
			}
			
			if(!_noNormalize){
				val = this.normalizeVal(val);
			}
			left =  this.maxLeft * ((val - this.options.min) / (this.options.max - this.options.min));
			
			/*
			max = 5;
			min = 1;
			
			val = 1; //-> 0
			val = 3 // 0.5
			val = 8 // -> 1
			*/
			//this.options.min + this.options.max // 16
			
			this.options.value = val;
			this.thumbStyle.left = left+'px';
			if(this.orig && oVal != val){
				this.orig.value = val;
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
			var maxLeft = this.maxLeft;
			var correctLeft = (this.thumbWidth / 2);
			var element = this.element;
			o.options = opts || {};
			
			this.element.attr({'aria-valuetext': o.options[o.value] || o.value});
			$('span.ws-range-ticks', this.element).remove();
			
			
			$.each(opts, function(val, label){
				if(!isNumber(val) || val < min || val > max){return;}
				var left =  (maxLeft * ((val - min) / (max - min))) + correctLeft;
				var title = o.showLabels ? ' title="'+ label +'"' : '';
				element.append('<span class="ws-range-ticks"'+ title +' style="left: '+left+'px;" />');
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
			this.value( this.options.value + (retDefault(this.options.step, 1) * factor) );
			
		},
		 
		getStepedValueFromPos: function(pos){
			var val, valModStep, alignValue, step;
			if(pos < 0){
				val = this.options.min;
			} else if(pos > this.maxLeft) {
				val = this.options.max;
			} else {
				val = ((this.options.max - this.options.min) * (pos / this.maxLeft)) + this.options.min;
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
			
			if (val == this.options.max) {
				pos = this.maxLeft;
			}else if (val == this.options.min){
				pos = 0;
			}
			return [val, pos];
		},
		addBindings: function(){
			var x, l;
			var that = this;
			var o = this.options;
			var eventTimer = (function(){
				var events = {};
				return {
					init: function(name, curVal, fn){
						if(!events[name]){
							events[name] = {fn: fn};
							if(that.orig){
								$(that.orig).bind(name, function(){
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
			
			var setValueFromPos = function(pos, pX){
				var val = that.getStepedValueFromPos(pos);
				if(val[0] != o.value){
					x = pX;
					l = val[1];
					that.value(val[0]);
					eventTimer.call('input', val[0]);
				}
			};
			var move = function(e){
				var nl = l + e.pageX - x;
				setValueFromPos(nl, e.pageX);
			};
			var remove = function(){
				that.element.removeClass('ws-active');
				$(document).off('mousemove', move).off('mouseup', remove);
				eventTimer.init('input', o.value);
				eventTimer.call('change', o.value);
			};
			var add = function(e){
				if(!o.readonly && !o.disabled){
					x = e.pageX;
					l = parseFloat(that.thumb.css('left'), 10);
					remove();
					that.element.focus().addClass('ws-active');
					$(document).on({
						mouseup: remove,
						mousemove: move
					});
				}
				e.preventDefault();
			};
			
			eventTimer.init('input', o.value, this.options.slide);
			eventTimer.init('change', o.value, this.options.change);
			
			this.element.on({
				mousedown: function(e){
					if(!o.readonly && !o.disabled){
						var eX = e.pageX;
						var offset = that.element.addClass('ws-active').offset().left;
						eventTimer.init('input', o.value);
						eventTimer.init('change', o.value);
						setValueFromPos(eX - offset - (that.thumbWidth / 2), eX);
						add(e);
						
						return false;
					}
					e.preventDefault();
				},
				focus: function(e){
					if(!o.disabled){
						eventTimer.init('change', o.value);
						that.element.addClass('ws-focus');
					}
				},
				blur: function(e){
					that.element.removeClass('ws-focus ws-active');
				},
				keyup: function(){
					that.element.removeClass('ws-active');
					eventTimer.call('input', o.value);
					eventTimer.call('change', o.value);
				},
				keypress: function(e){
					var step = true;
					var code = e.keyCode;
					if (!o.readonly && !o.disabled) {
						if (code == 39 || code == 38) {
							that.doStep(1);
						}
						else if (code == 37 || code == 40) {
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
			var rangeWidth, thumbWidth;
			if(this._init){
				rangeWidth = this.rangeWidth;
				thumbWidth = this.thumbWidth;
			}
			this.rangeWidth = this.element.innerWidth();
			this.thumbWidth = this.thumb.outerWidth();
			this.maxLeft = this.rangeWidth - this.thumbWidth;
			if(this._init && (rangeWidth != this.rangeWidth || thumbWidth != this.thumbWidth)){
				this.value(this.options.value);
				this.list(this.options.options);
			}
		}
	};
	
	$.fn.rangeUI = function(opts){
		opts = $.extend({readonly: false, disabled: false, tabindex: 0, min: 0, step: 1, max: 100, value: 50, input: $.noop, change: $.noop, showLabels: true}, opts);
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