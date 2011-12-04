(function($){

module("datalist");
asyncTest("datalist", function(){
	var options = $('#dlist').prop('options');
	var options2 = $('#dlist option');
	
	equals(options.length, options2.length, 'datalist options-attr has same length as option-element');
	
	strictEqual(options[0], options2[0], 'datalist first options-attr equals first option-element');
	
	//todo: test prop list| test attr set/get list || removeAttr list
	
	strictEqual($('#email').prop('list'), $('#dlist')[0], 'list property returns right datalist');
	
	if(!Modernizr.datalist){
		var shadowListItems = $('div.datalist-polyfill li');
		$.each(['yes aßäöâ', 'yes "2"', "yes '3'"], function(i, val){
			equals($.attr(shadowListItems[i], 'data-value'), val, 'shadow datalistitems value equals options value');
		});
		strictEqual($('#email').attr('aria-haspopup'), 'true', 'input[list] has aria');
	}
	
	
	
	$('#email').attr('list', 'blasdsa');
	strictEqual($('#email').prop('list'), null, 'list property is null, if id is not in document');
	
	$('#email').attr('list', 'range');
	strictEqual($('#email').prop('list'), null, 'list property is null, if element is not a datalist');
	
	if(!Modernizr.datalist){
		ok(!$('#email').attr('aria-haspopup'), 'aria was removed on input:not([list])');
	}
	
	$('#email').attr('list', 'dlist2');
	strictEqual($('#email').prop('list'), $('#dlist2')[0], 'list property changed through content attribute');
	
	if(!Modernizr.datalist){
		strictEqual($('#email').attr('aria-haspopup'), 'true', 'input[list] has aria');
		
				
		
		$('#email').removeAttr('list');
		ok(!$('#email').attr('aria-haspopup'), 'removed list attribute removes aria in shim');
		
	}
	$.webshims.ready('DOM forms', function(){
		start();
	});
});
if (!Modernizr.datalist) {
	test("datalist manipulate shadowdom I", function(){
		stop();
		$('#email').attr('list', 'dlist2');
		$('#dlist2 select').appendPolyfill('<option value="dynamic appended"></option>');
		$.webshims.ready('DOM forms', function(){
			setTimeout(function(){
				start();
				var shadowList = $('ul.dlist2-shadowdom');
				var shadowListItems = $('li', shadowList);
				strictEqual(shadowList.length, 1, 'there is on dlist2 element');
				$.each(['secondlist', 'dynamic appended'], function(i, val){
					equals($.attr(shadowListItems[i], 'data-value'), val, 'shadow datalistitems value equals options value');
				});
				shadowList.remove();
			}, 20);
		});
	});
	test("datalist manipulate shadowdom II", function(){
		stop();
		$('#email').attr('list', 'dlist2');
		$('#dlist2 select').htmlPolyfill('<option value="dynamic appended1"></option><option value="dynamic appended2"></option>');
		$.webshims.ready('DOM forms', function(){
			setTimeout(function(){
				start();
				var shadowList = $('ul.dlist2-shadowdom');
				var shadowListItems = $('li', shadowList);
				strictEqual(shadowList.length, 1, 'there is on dlist2 element');
				$.each(['dynamic appended1', 'dynamic appended2'], function(i, val){
					equals($.attr(shadowListItems[i], 'data-value'), val, 'shadow datalistitems value equals options value');
				});
				shadowList.remove();
			}, 20);
		});
	});
}


})(jQuery);