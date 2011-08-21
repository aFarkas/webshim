(function($){
	var results = {
		target: "",
		name: "",
		action: ""
	};
	var addTest = function(){
		
	};
	window.submitterTest = function(target, search, action){
		results.target = target;
		results.search = search;
		results.action = action;
		addTest();
		$.webshims.ready('DOM forms', function(){
			setTimeout(start, 10);
		});
	};
	
	
	module("form-submitters");
	asyncTest("form-submitters API", function(){
		var form = $('#form-buttons');
		
		//action
		equals($('button.action-test').prop('formAction'), form.prop('action'), "action property is calculated");
		$('button.action-test').removeAttr('formAction');
		strictEqual($('button.action-test').prop('formAction'), "", "action with no content attribute is an empty string");
		
		//enctype
		equals($('button.enctype-test').prop('formEnctype'), "application/x-www-form-urlencoded", "wrong enctype is limited to defaults");
		$('button.enctype-test').removeAttr('formenctype');
		equals($('button.enctype-test').attr('formEnctype'), undefined, "enctype can be removed");
		equals($('button.enctype-test').prop('formEnctype'), "application/x-www-form-urlencoded", "empty enctype is limited to defaults");
		$('button.enctype-test').attr('formenctype', 'text/plAin');
		equals($('button.enctype-test').prop('formEnctype'), "text/plain", "formEnctype can be changed and is not casesensitive");
		
		//method
		equals($('button.method-test').prop('formMethod'), 'get', "wrong formmethod is limited to get");
		$('button.method-test').prop('formMethod', 'post');
		equals($('button.method-test').prop('formMethod'), 'post', "formMethod can be changed and is not casesensitive");		
		equals($('input.method-submit-test').prop('formMethod'), 'post', "formMethod is not casesensitive");
		$('input.method-submit-test').removeAttr('formMethod');
		equals($('input.method-submit-test').prop('formMethod'), 'get', "empty formMethod is limited to defaults");
		
		$.webshims.ready('DOM forms', start);
	});
	
	
	
	
	asyncTest("target-test", function(){
		var form = $('#form-buttons');
		stop();
		$('input.target-image-test', form).click();
		addTest = function(){
			equals(results.target, 'image-target');
			equals(results.search, '');
			equals(results.action, 1);
			equals(form.prop('method'), "post");
			equals(form.attr('action'), "test-ext/form-tester-1.html");
			equals(form.prop('target'), "_originaltarget");
		};
		
		$.webshims.ready('DOM forms', start);
	});
	
	asyncTest("target-dynamic-change-test", function(){
		var form = $('#form-buttons');
		stop();
		$('input.target-image-test', form).removeAttr('formTarget').attr('formmethod', 'get').click();
		addTest = function(){
			equals(results.target, '_originaltarget');
			ok(results.search);
			equals(results.action, 1);
			equals(form.prop('method'), "post");
			equals(form.attr('action'), "test-ext/form-tester-1.html");
			equals(form.prop('target'), "_originaltarget");
		};
		
		$.webshims.ready('DOM forms', start);
	});
	
	asyncTest("mixed-test", function(){
		var form = $('#form-buttons');
		stop();
		$('input.enctype-submit-test', form).click();
		addTest = function(){
			equals(results.target, '_originaltarget');
			ok(results.search);
			equals(results.action, 2);
			equals(form.prop('method'), "post");
			equals(form.attr('action'), "test-ext/form-tester-1.html");
		};
		
		$.webshims.ready('DOM forms', start);
	});
	
	asyncTest("empty-test", function(){
		var form = $('#form-buttons');
		stop();
		$('button.empty-test', form).click();
		addTest = function(){
			equals(results.target, '_originaltarget');
			equals(results.search, '');
			equals(results.action, 1);
			equals(form.prop('method'), "post");
			equals(form.attr('action'), "test-ext/form-tester-1.html");
		};
		
		$.webshims.ready('DOM forms', start);
	});
	

	
	
	asyncTest("change-form-test", function(){
		var form = $('#form-buttons').attr('method', 'get');
		stop();
		$('button.empty-test', form).attr('formtarget', '_blank').click();
		addTest = function(){
			ok(results.target == '');
			ok(results.search);
			equals(results.action, 1);
			equals(form.prop('method'), "get");
		};
		
		$.webshims.ready('DOM forms', start);
	});
	
})(jQuery);
