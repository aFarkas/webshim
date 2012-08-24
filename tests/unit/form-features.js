(function($){
	
module("additional form features");

asyncTest("field[form]", function(){
	
	equals($('form.no-id').prop('elements').length, 4, "form.no-id has 4 elements");
	equals($('form.no-id').prop('id', 'some-id-'+(new Date().getTime())).prop('elements').length, 4, "form.no-id with id has 4 elements");
	strictEqual($('form.no-id').empty().prop('elements').length, 0, "emptied form.no-id with id has 0 elements");
	strictEqual($('form.no-id').prop('id', '').empty().prop('elements').length, 0, "emptied form.no-id has 0 elements");
	$.webshims.ready('forms DOM', function(){
		start();
	});
});

})(jQuery);