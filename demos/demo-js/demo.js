(function($){
	$(function(){
		if(!window.console){
			window.console = {log: window.alert};
		}
		$('code.run-once').each(function(){
			var elem = this;
			$('<button>run example</button>').insertAfter(elem).click(function(){
				eval(elem.innerHTML.replace(/&gt;/g, '>').replace(/&lt;/g, '<'));
				this.disabled = true;
				return false;
			});
		});
		var doConsole = function(m){
			if(typeof m == 'object'){
				alert(JSON.stringify(m));
			} else {
				alert(m);
			}
		};
		$('button.feature').bind('click', function(e){
			var elem = $(this).attr('data-elem');
			if(elem){
				elem = $(elem);
			} else {
				elem = $(this).parent().find('input:first');
			}
			var val = $(this).attr('data-val');
			var ret;
			if(val){
				val = $(val).val();
			}
			e.preventDefault();
			if($(this).is('.method')){
				ret = elem[$(this).attr('data-name')](val);
			} else {
				ret = elem.attr($(this).attr('data-name'), val);
			} 
			if(ret !== elem){
				if(window.console && console.log){
					try {
						console.log(ret);
					} catch(e){
						doConsole(ret);
					}
				} else {
					doConsole(ret);
				}
			}
			return false;
		});
		
		$('div.feature-example').each(function(){
			var div = $('div.hidden-explanation', this).hide();
			$('button', this).bind('click', function(){
				$('#placeholder').attr('placeholder', $('#placeholder-text').val());
				div.slideDown();
				return false;
			});
		});
	});
})(jQuery);
