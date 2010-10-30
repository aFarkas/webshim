(function($){
	if($.webshims){return;}
	
	$.webshims = {
		loader:{},
		ready: function(events, fn){
			if(typeof events == 'string'){
				events = events.split(' ');
			}
			
			if($.inArray('ready', events) != -1){
				fn($, $.webshims, window, document);
			} else {
				fn($, $.webshims, window, document);
			}
		},
		capturingEvents: function(names){
			if(!document.addEventListener){return;}
			if(typeof names == 'string'){
				names = [names];
			}
			$.each(names, function(i, name){
				var handler = function( e ) { 
					e = $.event.fix( e );
					return $.event.handle.call( this, e );
				};
				$.event.special[name] = $.event.special[name] || {};
				$.extend($.event.special[name], {
					setup: function() {
						this.addEventListener(name, handler, true);
					}, 
					teardown: function() { 
						this.removeEventListener(name, handler, true);
					}
				});
			});
		},
		addMethodName: function(name, elementNames){
			if($.fn[name] && $.fn[name].shim){return;}
			$.fn[name] = function(){
				var args = arguments,
					ret
				;
				this.each(function(){
					if(this[name]){
						ret = this[name].apply(this, args);
						if(ret !== undefined){
							return false;
						}
					}
				});
				return (ret !== undefined) ? ret : this;
			};
			$.fn[name].shim = false; 
			$.fn[name].elementNames = elementNames;
		},
		polyfill: $.noop
	};
})(jQuery);
