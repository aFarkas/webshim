module("placeholder");
asyncTest("placeholder Modul", function(){
	QUnit.reset();
	
	
	equals( $('#placeholder').val(), "", '$.fn.val is empty' );
	equals( $('#placeholder').attr('value'), "", '$.fn.attr(value) is empty' );
	if($.support.placeholder === 'shim'){
		equals( $('#placeholder')[0].value, "hello", 'native is hello in shim' );
		ok($('#placeholder').hasClass('placeholder-visible'), 'placeholder-class');
	}
	
	
	$('#placeholder').val("world");
	equals( $('#placeholder').val(), "world", '$.fn.val is world' );
	
	equals( $('#placeholder').attr('value'), "world", '$.fn.attr(value) is world' );
	
	equals( $('#placeholder')[0].value, "world", 'value is world' );
	
	if($.support.placeholder === 'shim'){
		ok(!$('#placeholder').hasClass('placeholder-visible'), 'placeholder-class is removed');
	}
	
	
	$('#placeholder').val("");
	equals( $('#placeholder').attr('value'), "", '$.fn.attr(value) is empty' );
	if($.support.placeholder === 'shim'){
		ok($('#placeholder').hasClass('placeholder-visible'), 'placeholder-class is added');
	}
	
	
	
	$('#placeholder').attr("value", "foo");
	equals( $('#placeholder').val(), "foo", '$.fn.val is foo' );
	equals( $('#placeholder').attr('value'), "foo", '$.fn.attr(value) is foo' );
	equals( $('#placeholder')[0].value, "foo", 'value is foo in shim' );
	if ($.support.placeholder === 'shim') {
		ok(!$('#placeholder').hasClass('placeholder-visible'), 'placeholder-class is removed');
	}
	equals( $('#placeholder').attr('placeholder'), "hello", '$.attr(placeholder) is hello' );
	
	$('#placeholder').val("").attr('placeholder', "bar");
	equals( $('#placeholder').attr('placeholder'), "bar", '$.attr(placeholder) is bar' );
	equals( $('#placeholder').val(), "", '$.fn.val is empty' );
	equals( $('#placeholder').attr('value'), "", '$.fn.attr(value) is empty' );
	if($.support.placeholder === 'shim'){
		equals( $('#placeholder')[0].value, "bar", 'native is bar in shim' );
	}
	
	if($.support.placeholder === 'shim'){
		ok($('#placeholder').hasClass('placeholder-visible'), 'placeholder-class is added');
	}
	
});
$(document).bind('placeholderReady', function(){
	start();
});