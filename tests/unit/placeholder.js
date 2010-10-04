//Todo test textarea + \n
module("placeholder");
var placeholder = {
	isApplied: function(elem, state){
		var parent = $(elem).parent();
		equals(parent.is('span.placeholder-box'), state, 'placeholder-box is applied');
		equals(!!(parent.find('.placeholder-text')[0]), state, 'placeholder-text is applied');
	},
	isVisible: function(elem, state){
		var parent = $(elem).parent();
		equals(parent.hasClass('placeholder-visible'), state, 'placeholder visible class');
		equals(parent.find('.placeholder-text').is(':visible'), state, 'placeholder-text is applied');
	},
	hasText: function(elem, text){
		equals($(elem).parent().find('.placeholder-text').text(), text, 'placeholder has text: ');
	}
};
asyncTest("placeholder Modul", function(){
	QUnit.reset();
	
	equals( $('#placeholder').attr('value'), "", '$.fn.attr(value) is empty' );
	if($.support.placeholder === 'shim'){
		placeholder.isApplied($('#placeholder'), true);
		placeholder.isVisible($('#placeholder'), true);
		placeholder.hasText($('#placeholder'), 'hello');
	}
	
	
	$('#placeholder').val("world");
	equals( $('#placeholder').val(), "world", '$.fn.val is world' );
		
	if($.support.placeholder === 'shim'){
		placeholder.isVisible($('#placeholder'), false);
	}
	
	
	$('#placeholder').val("");
	if($.support.placeholder === 'shim'){
		placeholder.isVisible($('#placeholder'), true);
	}
	
	$('#placeholder').attr("value", "foo");
	if ($.support.placeholder === 'shim') {
		placeholder.isVisible($('#placeholder'), false);
	}
	equals( $('#placeholder').attr('placeholder'), "hello", '$.attr(placeholder) is hello' );
	
	$('#placeholder').val("").attr('placeholder', "bar");
	equals( $('#placeholder').attr('placeholder'), "bar", '$.attr(placeholder) is bar' );
	
	if($.support.placeholder === 'shim'){
		placeholder.isVisible($('#placeholder'), true);
		placeholder.hasText($('#placeholder'), 'bar');
		
		
		placeholder.isApplied($('#placeholder-empty'), false);
		$('#placeholder-empty').attr('placeholder', 'test dynamic placeholder');
		placeholder.isApplied($('#placeholder-empty'), true);
		placeholder.hasText($('#placeholder-empty'), 'test dynamic placeholder');
		placeholder.isVisible($('#placeholder-empty'), true);
		$('#placeholder-empty').trigger('focus');
		placeholder.isVisible($('#placeholder-empty'), false);
		$('#placeholder-empty').trigger('blur');
		placeholder.isVisible($('#placeholder-empty'), true);
	}
	
		
	
	$(document).bind('placeholderReady', function(){
		start();
	});
});
