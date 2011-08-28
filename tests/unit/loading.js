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
	asyncTest("markup async test1", function(){
		$('#image-target').attr('src', 'test-ext/markup-loading-1.html');
		stop();
		addTest = function(){
			equals(results[0], '../../src/shims/', 'shims folder set correctly');
			strictEqual(results[1], false, 'cfg is set correctly');
			ok(results[2] > 0, 'feature is loaded');
		};
		
		setTimeout(function(){
			$.webshims.ready('DOM forms', start);
		}, 10);
	});
	
	asyncTest("markup async test2", function(){
		$('#image-target').attr('src', 'test-ext/markup-loading-2.html');
		stop();
		addTest = function(){
			equals(results[0], '../../src/shims/');
			strictEqual(results[1], false);
			strictEqual(results[2], 0, 'feature is not loaded');
			ok(results[3] > 0, 'feature is loaded');
		};
		
		setTimeout(function(){
			$.webshims.ready('DOM forms', start);
		}, 10);
	});
})(jQuery);