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
		
		$.webshims.ready('DOM forms', function(){
			setTimeout(function(){
				addTest();
				start();
			}, 50);
			
		});
	};
	
	
	module("form-submitters");
	if (!Modernizr.formvalidation) {
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
	}
	
	
	
	
	if (location.host.indexOf('github.com') == -1) {
		asyncTest("mixed-test", function(){
			var form = $('#form-buttons');
			$('input.enctype-submit-test', form).click();
			stop();
			addTest = function(){
				equals(results.target, 'originaltarget');
				equals(results.search, '');
				equals(results.action, 2);
				equals(form.prop('method'), "post");
				equals(form.attr('action'), "test-ext/form-tester-1.html");
			};
			
			setTimeout(function(){
				$.webshims.ready('DOM forms', start);
			}, 10);
		});
	}
	
	
	
	asyncTest("target-dynamic-change-test", function(){
		var form = $('#form-buttons');
		$('input.target-image-test', form).removeAttr('formtarget').attr('formmethod', 'get').click();
		stop();
		addTest = function(){
			equals(results.target, 'originaltarget');
			ok(results.search);
			equals(results.action, 1);
			equals(form.prop('method'), "post");
			equals(form.attr('action'), "test-ext/form-tester-1.html");
			equals(form.prop('target'), "originaltarget");
		};
		setTimeout(function(){
			$.webshims.ready('DOM forms', start);
		}, 20);
	});
	
	if (location.host.indexOf('github.com') == -1) {
		asyncTest("target-test", function(){
			var form = $('#form-buttons');
			$('input.target-image-test', form).click();
			stop();
			addTest = function(){
				equals(results.target, 'image-target');
				equals(results.search, '');
				equals(results.action, 1);
				equals(form.prop('method'), "post");
				equals(form.attr('action'), "test-ext/form-tester-1.html");
				equals(form.prop('target'), "originaltarget");
			};
			
			setTimeout(function(){
				$.webshims.ready('DOM forms', start);
			}, 30);
		});
		
		
		asyncTest("empty-test", function(){
			var form = $('#form-buttons');
			$('button.empty-test', form).click();
			stop();
			addTest = function(){
				equals(results.target, 'originaltarget');
				equals(results.search, '');
				equals(results.action, 1);
				equals(form.prop('method'), "post");
				equals(form.attr('action'), "test-ext/form-tester-1.html");
			};
			
			setTimeout(function(){
				$.webshims.ready('DOM forms', start);
			}, 40);
		});
	}
	
})(jQuery);
