(function($){
	
	/**
	 * range-number widget
	 */
	
	function rangeNumber(){
		//why not: $('input[type="range"]', this).prop(['min', 'max', 'value'])
		var range = $('input[type="range"]', this);
		var number = $('input[type="number"]', this);
		number
			.prop({
				value: range.prop('value'),
				min: range.prop('min'),
				max: range.prop('max')
			})
			.on('input', function(){
				if(number.is(':valid')){
					range.val(number.val());
				}
			})
		;
		range.on('input', function(){
			if(range.is(':valid')){
				number.val(range.val());
			}
		});
	}
	
	/**
	 * disable-enable widget
	 */
	
	function disableEnable(){
		//why not: $('input[type="range"]', this).prop(['min', 'max', 'value'])
		var module = $(this);
		var checkBox = $('input[type="checkbox"]', this).eq(0);
		var change = function(){
			$('input, select', module).not(checkBox[0]).prop('disabled', !checkBox.prop('checked'));
		};
		checkBox.on('change', change).each(change);
	}
	
	/**
	 *  widgets
	 */
	$(function(){
		$('.range-number').each(rangeNumber);
				
		$('.disable-enable').each(disableEnable);
	});
	
	
	/**
	 *  app
	 */
	$(function(){
		$('div.styler').each(function(){
			var frame = $('iframe', this).get(0).contentWindow;
			var throttle = function(fn, context, time){
				var timer;
				var fn2 = function(){
					fn.apply(context);
				};
				return function(){
					clearTimeout(timer);
					timer = setTimeout(fn2, time);
				};
			};
			var change = function(){
				var isValid = true;
				var data = {};
				var buildData = function(elem){
					var type = $(elem).data('type');
					var value = $(elem).data('value');
					if(!data[type]){
						data[type] = {};
					}
					if(!data[type][value]){
						data[type][value] = {};
					}
					return data[type][value];
				};
				$('input, select', this).getNativeElement().each(function(){
					var name = $.prop(this, 'name');
					var value = $(this).val();
					if(!name || $.prop(this, 'disabled') || value == 'disable'){return;}
					if($(this).is(':invalid')){
						isValid = false;
						return false;
					}
					
					if(name){
						var value = $(this).val();
						if(value == '0'){
							value = 0;
						}
						$(this).closest('[data-type]').each(function(){
							var temp = buildData(this);
							if(name in temp && !temp[name]){
								return;
							}
							if(temp[name]){
								buildData(this)[name] += value;
							} else {
								buildData(this)[name] = value;
							}
							
						});
					}
				});
				if(isValid){
					frame.postMessage(JSON.stringify(data), '*');
				}
			};
			
			var throttledChange = throttle(change, this, 9);
			
			$('iframe', this).on('load', throttledChange);
			$(this).on({'input change': throttledChange});
			throttledChange();
		});
	});
	
})(jQuery);
