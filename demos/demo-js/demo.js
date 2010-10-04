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
		
		$('button.feature').bind('click', function(e){
			var elem = $(this).parent().find('input:first');
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
				console.log(ret);
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
