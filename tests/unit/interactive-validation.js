(function($){
	var isMobile = /iphone|ipad|mobile/i.test(navigator.userAgent);
	var setupClickTest = function(){
		var counters = {};
		counters.boundInvalids = 0;
		counters.boundFormInvalids = 0;
		counters.delegatedFormInvalids = 0;
		
		counters.boundDocumentInvalids = 0;
		counters.delegatedDocumentInvalids = 0;
		counters.boundFirstInvalids = 0;
		
		counters.boundFormFirstInvalids = 0;
		counters.delegatedFormFirstInvalids = 0;
		
		counters.boundDocumentFirstInvalids = 0;
		counters.delegatedDocumentFirstInvalids = 0;
		
		
		//submits
		counters.boundFormSubmit = 0;
		
		counters.boundDocumentSubmit = 0;
		counters.delegatedDocumentSubmit = 0;
		
		counters.focused = [];
		
		$(document)
			.bind('invalid.clicktest', function(){
				counters.boundDocumentInvalids++;
			})
			.bind('firstinvalid.clicktest', function(){
				counters.boundDocumentFirstInvalids++;
			})
			.bind('submit.clicktest', function(){
				counters.boundDocumentSubmit++;
				
			})
		;
		
		$(document)
			.delegate('input', 'invalid.clicktest', function(){
				counters.delegatedDocumentInvalids++;
			})
			.delegate('input', 'firstinvalid.clicktest', function(){
				counters.delegatedDocumentFirstInvalids++;
			})
			.delegate('form', 'submit.clicktest', function(){
				counters.delegatedDocumentSubmit++;
			})
		;
		$('#click-test-form')
			.bind('invalid.clicktest', function(){
				counters.boundFormInvalids++;
			})
			.bind('firstinvalid.clicktest', function(){
				counters.boundFormFirstInvalids++;
			})
			.bind('submit.clicktest', function(e){
				counters.boundFormSubmit++;
				e.preventDefault();
			})
			.delegate('*', 'invalid.clicktest', function(){
				counters.delegatedFormInvalids++;
			})
			.delegate('*', 'firstinvalid.clicktest', function(){
				counters.delegatedFormFirstInvalids++;
				setTimeout(function(){
					counters.focused.push(document.activeElement);
				}, 20);
				counters.focused.push(document.activeElement);
			})
			.bind('focusin', function(e){
				counters.focused.push(e.target);
			})
		;
		$('#click-test-form input:not([type="submit"])')
			.bind('invalid.clicktest', function(){
				counters.boundInvalids++;
			})
			.bind('firstinvalid.clicktest', function(e){
				counters.boundFirstInvalids++;
			})
		;
		return counters;
	};
	var testClickTest = function(counters, expect){
		
		equals(counters.boundFirstInvalids, expect.firstinvalid, "input bind firstinvalid");
		equals(counters.boundInvalids, expect.invalid, "input bind invalid");
		
		equals(counters.boundFormInvalids, expect.invalid, "form bind invlid");
		equals(counters.boundFormFirstInvalids, expect.firstinvalid, "form bind firstinvalid");
		equals(counters.boundFormSubmit, expect.submit, "form bind submit");
		equals(counters.delegatedFormInvalids, expect.invalid, "form delegate invalid");
		equals(counters.delegatedFormFirstInvalids, expect.firstinvalid, "form delegate firstinvalid");
		
		equals(counters.boundDocumentInvalids, expect.invalid, "document bind invalid");
		equals(counters.boundDocumentFirstInvalids, expect.firstinvalid, "document bind firstinvalid");
		equals(counters.boundDocumentSubmit, expect.submit, "document bind submit");
		equals(counters.delegatedDocumentSubmit, expect.submit, "document delegate submit");
		
		equals(counters.delegatedDocumentInvalids, expect.invalid, "document delegate invalid");
		equals(counters.delegatedDocumentFirstInvalids, expect.firstinvalid, "document delegate firstinvalid");
		if(!isMobile && document.activeElement && ('focus' in expect)){
			if(expect.focus){
				ok( $.inArray( expect.focus, counters.focused) != -1, "first invalid was focused");
			} else {
				ok( $.inArray( document.activeElement, $('#click-test-form  input:not([type="submit"])').get() ) == -1, "no input was focused");
			}
		}
	};
	module("submit test");
	test("click test all invalid 1", function(){
		stop();
		var counters = setupClickTest();
		setTimeout(function(){
			$('#click-test-form input[type="submit"]').trigger('click');
			setTimeout(function(){
				testClickTest(counters, {firstinvalid: 1, invalid: 3, submit: 0, focus: $('#click-test-form input').eq(0).getShadowFocusElement()[0]});
				setTimeout(start, 50);
			}, 40);
		}, 0);
		
		
		
		
		
	});
	test("click test third invalid 2", function(){
		stop();
		var counters = setupClickTest();
		setTimeout(function(){
			$('#click-test-form input').slice(0, 2).prop('value', 'some value');
			$('#click-test-form input[type="submit"]').trigger('click');
			setTimeout(function(){
				testClickTest(counters, {firstinvalid: 1, invalid: 1, submit: 0, focus: $('#click-test-form input').eq(2).getShadowFocusElement()[0]});
				setTimeout(start, 50);
			}, 40);
		}, 0);
	});
	
	test("click test all valid", function(){
		stop();
		var counters = setupClickTest();
		setTimeout(function(){
			$('#click-test-form input').prop('value', '2010-10-11');
			$('#click-test-form input[type="submit"]').trigger('click');
			setTimeout(function(){
				testClickTest(counters, {firstinvalid: 0, invalid: 0, submit: 1, focus: false});
				setTimeout(start, 50);
			}, 40);
		}, 0);
	});
	test("click test all invalid but invalid prevented", function(){
		stop();
		var counters = setupClickTest();
		setTimeout(function(){
			$('#click-test-form').bind('invalid', function(e){
				e.preventDefault();
			});
			$('#click-test-form input[type="submit"]').trigger('click');
			setTimeout(function(){
				testClickTest(counters, {firstinvalid: 1, invalid: 3, submit: 0, focus: false});
				setTimeout(start, 50);
			}, 40);
		}, 0);
	});
	
	test("click test all invalid but firstinvalid prevented", function(){
		stop();
		var counters = setupClickTest();
		setTimeout(function(){
			$('#click-test-form').bind('firstinvalid', function(e){
				e.preventDefault();
			});
			$('#click-test-form input[type="submit"]').trigger('click');
			setTimeout(function(){
				testClickTest(counters, {firstinvalid: 1, invalid: 3, submit: 0, focus: false});
				setTimeout(start, 50);
			}, 40);
		}, 0);
	});
	
	test("click test all invalid but formnovalidate click", function(){
		stop();
		var counters = setupClickTest();
		setTimeout(function(){
			$('#click-test-form input[type="submit"]').attr('formnovalidate', 'formnovalidate').trigger('click');
			setTimeout(function(){
				testClickTest(counters, {firstinvalid: 0, invalid: 0, submit: 1, focus: false});
				setTimeout(start, 50);
			}, 40);
		}, 0);
	});
	
	test("checkValidity test", function(){
		stop();
		var counters = setupClickTest();
		setTimeout(function(){
			$('#click-test-form').checkValidity();
			setTimeout(function(){
				testClickTest(counters, {firstinvalid: 1, invalid: 3, submit: 0, focus: false});
				setTimeout(start, 50);
			}, 40);
		}, 0);
	});
	
})(jQuery);