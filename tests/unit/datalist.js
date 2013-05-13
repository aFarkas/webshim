(function($){

module("datalist");
asyncTest("datalist", function(){
	var options = $('#dlist').prop('options') || $('#dlist select').prop('options');
	var options2 = $('#dlist option');
	if(options && !options.length){
		options = $('#dlist select').prop('options');
	}
	equals(options.length, options2.length, 'datalist options-attr has same length as option-element');
	
	strictEqual(options[0], options2[0], 'datalist first options-attr equals first option-element');
	
	//todo: test prop list| test attr set/get list || removeAttr list
	
	strictEqual($('#email').prop('list'), $('#dlist')[0], 'list property returns right datalist');
	
	if(!Modernizr.input.list || $.webshims.cfg.forms.customDatalist){
		$('#email').data('datalistWidget').showList();
		var shadowListItems = $('div.datalist-polyfill li');
		$.each(['yes aßäöâ', 'yes "2"', "yes '3'"], function(i, val){
			equals($('span.option-value', shadowListItems[i]).text(), val, 'shadow datalistitems value equals options value');
		});
		
		
		strictEqual($('#email').attr('aria-haspopup'), 'true', 'input[list] has aria');
	}
	
	$('#email').attr('list', 'blasdsa');
	strictEqual($('#email').prop('list'), null, 'list property is null, if id is not in document');
	
	$('#email').attr('list', 'range');
	strictEqual($('#email').prop('list'), null, 'list property is null, if element is not a datalist');
	
	if(!Modernizr.input.list){
		ok(!$('#email').attr('aria-haspopup'), 'aria was removed on input:not([list])');
	}
	
	$('#email').attr('list', 'dlist2');
	strictEqual($('#email').prop('list'), $('#dlist2')[0], 'list property changed through content attribute');
	
	if(!Modernizr.input.list || $.webshims.cfg.forms.customDatalist){
		strictEqual($('#email').attr('aria-haspopup'), 'true', 'input[list] has aria');
		
		$('#email').removeAttr('list');
		ok(!$('#email').attr('aria-haspopup'), 'removed list attribute removes aria in shim');
	}
	
	if($.webshims.cfg.forms.customDatalist){
		strictEqual($('#email').prop('selectedOption'), null, 'selectedOption is implemented');
	}
	
	$.webshims.ready('DOM forms forms-ext', function(){
		start();
	});
});



})(jQuery);