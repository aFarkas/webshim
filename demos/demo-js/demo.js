(function($){
	$(function(){
		$('code.run-once').each(function(){
			var elem = this;
			$('<button>run example</button>').insertAfter(elem).click(function(){
				eval(elem.innerHTML.replace(/&gt;/g, '>').replace(/&lt;/g, '<'));
				this.disabled = true;
				return false;
			});
		});
	});
})(jQuery);
