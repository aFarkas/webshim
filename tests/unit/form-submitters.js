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
	if (!webshims.support.formvalidation) {
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
			
			//todo
			//equals($('button.enctype-test').prop('formEnctype'), "application/x-www-form-urlencoded", "empty enctype is limited to defaults");
			
			$('button.enctype-test').attr('formenctype', 'text/plAin');
			equals($('button.enctype-test').prop('formEnctype'), "text/plain", "formEnctype can be changed and is not casesensitive");
			
			//method
			equals($('button.method-test').prop('formMethod'), 'get', "wrong formmethod is limited to get");
			$('button.method-test').prop('formMethod', 'post');
			equals($('button.method-test').prop('formMethod'), 'post', "formMethod can be changed and is not casesensitive");
			equals($('input.method-submit-test').prop('formMethod'), 'post', "formMethod is not casesensitive");
			
			//$('input.method-submit-test').removeAttr('formMethod');
			//equals($('input.method-submit-test').prop('formMethod'), 'get', "empty formMethod is limited to defaults");
			
			$.webshims.ready('DOM forms', start);
		});
	}
	
	
	
	
	if (location.host.indexOf('github.com') == -1) {
		asyncTest("mixed-test", function(){
			var form = $('#form-buttons');
			$('input.enctype-submit-test', form).trigger('click');
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
		$('input.target-image-test', form).removeAttr('formtarget').attr('formmethod', 'get').trigger('click');
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
			$('input.target-image-test', form).trigger('click');
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
			$('button.empty-test', form).trigger('click');
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
	
	if (location.host.indexOf('github.com') == -1) {
		
		asyncTest("form-attribute1", function(){
			var submits = 0;
			var invalids = 0;
			var outsideInput = $('input[name="outside-1"]');
			$('#form-buttons').on('submit.testoutsidesubmit', function(){
				submits++;
				return false;
			});
			$('input[name="outside-1"]').on('invalid.testoutsidesubmit', function(e){
				invalids++;
				return false;
			});
			ok( $( $('#form-buttons').prop('elements') ).filter('input[name="outside-1"]').length == 1, 'elements property finds associated element' );
			ok($('#form-buttons').serialize().indexOf('outside-1=') != -1, "outside element is part of serialize");
			equals(outsideInput[0], $('#form-buttons').prop('outside-1'), "outside input can be found by name");
			equals($('#form-buttons').prop('multiple-outsides').length, 2, 'multiple associated field can be found by name');
			equals($('#form-buttons').prop('outside-id'), $('#outside-id')[0], 'associated field can be found by id');
			
			$.webshims.ready('DOM forms', start);
		});
		
		asyncTest("form-attribute2", function(){
			var submits = 0;
			var invalids = 0;
			$('#form-buttons').on('submit.testoutsidesubmit', function(e){
				submits++;
				e.preventDefault();
			});
			$('input[name="outside-1"]').on('invalid.testoutsidesubmit', function(e){
				invalids++;
				e.preventDefault();
			});
			
			$('button.outside-button').trigger('click');
			stop();
			setTimeout(function(){
				ok(submits == 1, "click on outsidebutton submits form");
				ok(invalids === 0, "invalids are 0");
				start();
			}, 80);
			
			
			setTimeout(function(){
				$.webshims.ready('DOM forms', start);
			}, 40);
		});
		asyncTest("form-attribute3", function(){
			var submits = 0;
			var invalids = 0;
			$('#form-buttons').on('submit.testoutsidesubmit', function(){
				submits++;
				return false;
			});
			$('input[name="outside-1"]').on('invalid.testoutsidesubmit', function(e){
				invalids++;
				return false;
			});
			
			
			$('input[name="outside-1"]').prop('required', true);
			ok(invalids === 0, "invalids are 0");
			$('button.outside-button').trigger('click');
			equals(submits, 0, "click on outsidebutton of invalid form does not submit");
			equals(invalids, 1, "click on outsidebutton validates associated fields");
			setTimeout(function(){
				$.webshims.ready('DOM forms', start);
			}, 40);
		});
		asyncTest("button submits associated fields", function(){
			
			var form = $('#form-buttons');
			
			var submits = 0;
			$('#form-buttons').on('submit.testoutsidesubmit', function(){
				submits++;
			});
			
			$('input[name="outside-submit"]').trigger('click');
			ok(submits == 1, "click on outsidebutton submits form");
			stop();
			addTest = function(){
				equals(results.target, 'originaltarget');
				ok(results.search.indexOf('outside-submit=outside-submitvalue') != -1, 'form submits associated submitter value');
				ok(results.search.indexOf('outside-1=') != -1, 'form submits associated input');
			};
			
			setTimeout(function(){
				$.webshims.ready('DOM forms', start);
			}, 80);
		});
	}
	
})(jQuery);
