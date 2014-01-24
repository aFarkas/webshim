(function($){
	var results = [];
	var addTest = function(){
		
	};
	window.loadingTest = function(){
		results = arguments;
		addTest();
		$.webshims.ready('DOM forms', function(){
			setTimeout(function(){
				start();
			}, 10);
			
		});
	};
	
	
	module("loading tests");
	
	asyncTest("require async test3", function(){
		$('#image-target').attr('src', 'test-ext/require-loading-3.html');
		stop();
		addTest = function(){
			
			strictEqual(results[0], "../../src/shims/");
			strictEqual(results[1], false);
		};
		
		setTimeout(function(){
			$.webshims.ready('DOM forms', start);
		}, 10);
	});
	
	
	
	asyncTest("require async test4", function(){
		$('#image-target').attr('src', 'test-ext/require-loading-4.html');
		stop();
		addTest = function(){
			equals(results[0], 'test4');
		};
		
		setTimeout(function(){
			$.webshims.ready('DOM forms', start);
		}, 10);
	});
	
	
	asyncTest("require async test5", function(){
		$('#image-target').attr('src', 'test-ext/require-loading-5.html');
		stop();
		addTest = function(){
			equals(results[0], 'test5');
		};
		
		setTimeout(function(){
			$.webshims.ready('DOM forms', start);
		}, 10);
	});
	
	
	
	asyncTest("require async test6", function(){
		$('#image-target').attr('src', 'test-ext/require-loading-6.html');
		stop();
		addTest = function(){
			equals(results[0], 'test6');
//			equals(results[1], true);
		};
		
		setTimeout(function(){
			$.webshims.ready('DOM forms', start);
		}, 10);
	});
	
	asyncTest("markup async test1", function(){
		$('#image-target').attr('src', 'test-ext/markup-loading-1.html');
		stop();
		addTest = function(){
			equals(results[0], 'markup1', 'shims folder set correctly');
			strictEqual(results[1], false, 'cfg is set correctly');
		};
		
		setTimeout(function(){
			$.webshims.ready('DOM forms', start);
		}, 10);
	});
	
	asyncTest("markup async test2", function(){
		$('#image-target').attr('src', 'test-ext/markup-loading-2.html');
		stop();
		addTest = function(){
			equals(results[0], 'markup2');
			strictEqual(results[1], false);
		};
		
		setTimeout(function(){
			$.webshims.ready('DOM forms', start);
		}, 10);
	});
	
})(jQuery);