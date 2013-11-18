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
		equals(parent.find('.placeholder-text').css('display'), state ? 'inline-block' : 'none', 'placeholder-text is applied');
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
		strictEqual($(elem).prop('value'), value, 'placeholder has text ($.fn.attr): ');
		strictEqual($(elem).prop('value'), value, 'placeholder has text ($.fn.prop): ');
		strictEqual($(elem).val(), value, 'placeholder has text ($.fn.val): ');
	}
};
asyncTest("placeholder Modul", function(){
	QUnit.reset();
	
	equals( $('#placeholder').prop('value'), "", '$.fn.prop(value) is empty' );
	
	
	placeholder.isApplied($('#placeholder'), true);
	placeholder.isVisible($('#placeholder'), true);
	placeholder.hasText($('#placeholder'), 'hello');
	
	
	
	$('#placeholder').val("world");
	equals( $('#placeholder').val(), "world", '$.fn.val is world' );
		
	placeholder.isVisible($('#placeholder'), false);
	
	
	$('#placeholder').val("");
	placeholder.isVisible($('#placeholder'), true);
	
	$('#placeholder').prop("value", "foo");
	placeholder.isVisible($('#placeholder'), false);
	
	webshimtest.reflectAttr($('#placeholder'), 'placeholder', "hello");
	
	$('#placeholder').val("").attr('placeholder', "bar");
	equals( $('#placeholder').attr('placeholder'), "bar", '$.attr(placeholder) is bar' );
	
	placeholder.isVisible($('#placeholder'), true);
	placeholder.hasText($('#placeholder'), 'bar');
	
	$('#placeholder').removeAttr('placeholder');
	placeholder.isVisible($('#placeholder'), false);
	
	webshimtest.reflectAttr($('#placeholder'), 'placeholder', "");
	
	$('#placeholder').prop('placeholder', 'bar2');
	
	placeholder.isVisible($('#placeholder'), true);
	placeholder.hasText($('#placeholder'), 'bar2');
	
		
		
	placeholder.isApplied($('#placeholder-empty'), false);
	$('#placeholder-empty').attr('placeholder', 'test dynamic placeholder');
	placeholder.isApplied($('#placeholder-empty'), true);
	placeholder.hasText($('#placeholder-empty'), 'test dynamic placeholder');
	placeholder.isVisible($('#placeholder-empty'), true);
	
	//todo: make this testable in jQuery 1.7+
	if(!$.fn.on){
		$('#placeholder-empty').trigger('focus');
		$('#placeholder-empty').triggerHandler('keydown');
		placeholder.isVisible($('#placeholder-empty'), false);
		$('#placeholder-empty').trigger('blur');
		placeholder.isVisible($('#placeholder-empty'), true);
	}
	
	
	$.webshims.ready('forms DOM', function(){
		start();
	});
});

})(jQuery);
