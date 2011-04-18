(function($){
var path = location.pathname.substr(0, location.pathname.lastIndexOf('/')) +'/';
loadTester.addImplementationTest('forms', function(){
	strictEqual($('<input required />').attr('required'), true, "required implemented");
});
loadTester.addImplementationTest('forms-ext', function(){
	equals($('<input type="date" />').attr('valueAsNumber', 0).attr('value'), "1970-01-01", "valueAsNumber succesful integrated");
});
	
loadTester.addProfile({
	init: function(){
		$.webshims.loader.loadScript('http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.5/jquery-ui.min.js', function(){
			$.webshims.setOptions('forms-ext', {
				replaceUI: true
			});
			$.webshims.modules['input-widgets'].src = path+'test-ext/input-widgets.js';
			$('script').addClass('inline');
			$.webshims.polyfill('forms-ext');
		});
	},
	tests: function(){
		module("no ui loading");
		loadTester.testGlobalReady();
		loadTester.testFeaturesLoad([], 'forms-ext');
		asyncTest("init", function(){
			$.webshims.ready('forms-ext', start);
		});
		
		module("input-widget loading test 1");
		asyncTest("input-widget loading test 1 (load nothing)", function(){
			var scripts = $('script:not(.inline)').filter('[src*="jquery-ui.min.js"], [src*="input-widgets.js"]');
			equals(scripts.length, 0, 'no extras loaded');
			
			$.webshims.ready('forms-ext', start);
		});
	}
});

loadTester.addProfile({
	init: function(){
		$.webshims.loader.loadScript(path+'test-ext/ui-base.js', function(){
			$.webshims.setOptions('forms-ext', {
				replaceUI: true
			});
			$.webshims.modules['input-widgets'].src = '../../tests/test-ext/input-widgets.js';
			$('script').addClass('inline');
			loadTester.markScripts();
			$.webshims.polyfill('forms-ext');
		});
	},
	tests: function(){
		module("input-widget loading");
		loadTester.testGlobalReady();
		asyncTest("init", function(){
			$.webshims.ready('forms-ext', start);
		});
		loadTester.testFeaturesLoad([], 'forms-ext');
		
		asyncTest("input-widget loading test 1 (load input-widgets)", function(){
			var scripts = $('script');
			equals(0, scripts.filter('[src*="jquery-ui.min.js"]').length, 'jquery-ui.min not loaded');
			equals(1, scripts.filter('[src*="ui-base.js"]').length, 'load ui-base');
			equals(1, scripts.filter('[src*="input-widgets.js"]').length, 'load input-widgets');
			$.webshims.ready('forms-ext', start);
		});
		
		
	}
});


})(window.jQuery);