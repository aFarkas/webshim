(function($){
	
//Todo test textarea + \n
module("placeholder");
var placeholder = {
	isApplied: function(elem, state){
		if(Modernizr.input.placeholder) {return;}
		var parent = $(elem).parent();
		equals(parent.is('span.placeholder-box'), state, 'placeholder-box is applied');
		equals(!!(parent.find('.placeholder-text')[0]), state, 'placeholder-text is applied');
		
	},
	isVisible: function(elem, state){
		if(Modernizr.input.placeholder) {return;}
		var parent = $(elem).parent();
		equals(parent.hasClass('placeholder-visible'), state, 'placeholder visible class');
		equals(parent.find('.placeholder-text').is(':visible'), state, 'placeholder-text is applied');
	},
	hasText: function(elem, text){
		if(Modernizr.input.placeholder) {return;}
		equals($(elem).parent().find('.placeholder-text').text(), text, 'placeholder has text: ');
	}
};

var textPlaceholder = {
	hasText: function(elem, text){
		if(Modernizr.input.placeholder) {return;}
		equals(elem.value, text, 'placeholder has placeholder text: ');
	},
	hasValue: function(elem, value){
		if(Modernizr.input.placeholder) {return;}
		equals($(elem).attr('value'), value, 'placeholder has text ($.fn.attr): ');
		equals($(elem).val(), value, 'placeholder has text ($.fn.val): ');
	}
};
asyncTest("placeholder Modul", function(){
	QUnit.reset();
	
	equals( $('#placeholder').attr('value'), "", '$.fn.attr(value) is empty' );
	
	
	placeholder.isApplied($('#placeholder'), true);
	placeholder.isVisible($('#placeholder'), true);
	placeholder.hasText($('#placeholder'), 'hello');
	
	
	
	$('#placeholder').val("world");
	equals( $('#placeholder').val(), "world", '$.fn.val is world' );
		
	placeholder.isVisible($('#placeholder'), false);
	
	
	$('#placeholder').val("");
	placeholder.isVisible($('#placeholder'), true);
	
	$('#placeholder').attr("value", "foo");
	placeholder.isVisible($('#placeholder'), false);
	equals( $('#placeholder').attr('placeholder'), "hello", '$.attr(placeholder) is hello' );
	
	$('#placeholder').val("").attr('placeholder', "bar");
	equals( $('#placeholder').attr('placeholder'), "bar", '$.attr(placeholder) is bar' );
	
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
	
	
	textPlaceholder.hasText($('#placeholder-text')[0], 'hello');
	textPlaceholder.hasValue($('#placeholder-text')[0], '');
	$('#placeholder-text').attr('placeholder', 'yes changed');
	
	textPlaceholder.hasText($('#placeholder-text')[0], 'yes changed');
	textPlaceholder.hasValue($('#placeholder-text')[0], '');
	$('#placeholder-text').attr('value', 'jo');
	textPlaceholder.hasValue($('#placeholder-text')[0], 'jo');
	
	$('#placeholder-text').attr('value', '');
	textPlaceholder.hasValue($('#placeholder-text')[0], '');
	
	$('#placeholder-empty-text').attr('placeholder', 'yes');
	$('#placeholder-empty-text').attr('value', 'jo');
	textPlaceholder.hasValue($('#placeholder-empty-text')[0], 'jo');
	textPlaceholder.hasText($('#placeholder-empty-text')[0], 'jo');
	$('#placeholder-empty-text').val('');
	textPlaceholder.hasValue($('#placeholder-empty-text')[0], '');
	textPlaceholder.hasText($('#placeholder-empty-text')[0], 'yes');
	
	$('#placeholder-empty-text').attr('placeholder', 'yes2');
	$('#placeholder-empty-text').attr('value', 'yes2');
	textPlaceholder.hasValue($('#placeholder-empty-text')[0], 'yes2');
	textPlaceholder.hasText($('#placeholder-empty-text')[0], 'yes2');
	$('#placeholder-empty-text').val('');
	textPlaceholder.hasValue($('#placeholder-empty-text')[0], '');
	textPlaceholder.hasText($('#placeholder-empty-text')[0], 'yes2');
	
	$('#placeholder-empty-text').triggerHandler('focus');
	textPlaceholder.hasText($('#placeholder-empty-text')[0], '');
	$('#placeholder-empty-text').triggerHandler('blur');
	textPlaceholder.hasText($('#placeholder-empty-text')[0], 'yes2');
		
	$.webshims.ready('forms DOM', function(){
		start();
	});
});

})(jQuery);
