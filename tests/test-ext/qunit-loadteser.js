(function($){
	var browserName;
	var browserVersion = parseInt($.browser.version, 10);
	$.each($.browser, function(name, value){
		if(value === true){
			browserName = (name == 'safari') ? 'webkit' : name;
			return;
		}
	});
	var implementTests = {};
	var profiles = [
		{
			init: function(){
				$.webshims.polyfill();
			},
			tests: function(){
				module("test all");
				loadTester.testGlobalReady();
				loadTester.testFeaturesLoad($.webshims.featureList);
			}
		},
		{
			init: function(){
				loadTester.reverseFeatures();
				$.webshims.polyfill();
			},
			tests: function(){
				module("test all reverse");
				loadTester.testGlobalReady();
				loadTester.testFeaturesLoad($.webshims.featureList);
			}
		}
	];
	
	var loadDefs = {
		forms: {
			mozilla2: ['form-core'],
			"mozilla1": ['form-core', 'form-shim-all', 'dom-extend', 'es5'],
			"webkit534": ['form-core', 'dom-extend', 'form-output-datalist'],
			"webkit533": ['form-core', 'form-native-extend', 'form-native-fix', 'dom-extend', 'form-output-datalist', 'es5'],
			msie9: ['form-core', 'form-shim-all', 'dom-extend'],
			msie8: ['form-core', 'form-shim-all', 'dom-extend', 'es5'],
			msie7: ['form-core', 'form-shim-all', 'dom-extend', 'es5']
		},
//		"forms-ext": {
//			mozilla2: ['form-core', 'form-native-extend', 'form-number-date', 'jquery-ui.min', '18n/jquery.ui', 'dom-extend'],
//			"mozilla1": ['form-core', 'form-shim-all', 'dom-extend', 'es5', 'form-number-date', 'jquery-ui.min', '18n/jquery.ui'],
//			"webkit534": ['form-core', 'dom-extend', 'form-output-datalist', 'form-native-extend', 'form-number-date', 'jquery-ui.min', '18n/jquery.ui'],
//			"webkit533": ['form-core', 'form-native-extend', 'form-native-fix', 'dom-extend', 'form-output-datalist', 'es5', 'form-number-date', 'jquery-ui.min', '18n/jquery.ui'],
//			msie9: ['form-core', 'form-shim-all', 'dom-extend', 'form-number-date', 'jquery-ui.min', '18n/jquery.ui'],
//			msie8: ['form-core', 'form-shim-all', 'dom-extend', 'es5', 'form-number-date', 'jquery-ui.min', '18n/jquery.ui'],
//			msie7: ['form-core', 'form-shim-all', 'dom-extend', 'es5', 'form-number-date', 'jquery-ui.min', '18n/jquery.ui']
//		},
		'json-storage': {
			mozilla2: [],
			"webkit534": [],
			msie9: [],
			msie8: [],
			msie7: ['json-storage', 'swfobject']
		}
	};
	
	$.each($.webshims.features, function(name, splitFeatures){
		
		profiles.push({
			init: function(){
				$.webshims.polyfill(name);
			},
			tests: function(){
				module("test "+ name);
				loadTester.testGlobalReady();
				loadTester.testFeaturesLoad(splitFeatures, name);
			}
		});
		profiles.push({
			init: function(){
				loadTester.reverseFeatures();
				loadTester.markScripts();
				$.webshims.polyfill(name);
			},
			tests: function(){
				module("test "+ name +' reverse');
				
				loadTester.testGlobalReady();
				
				loadTester.testFeaturesLoad(splitFeatures, name);
				if(loadDefs[name]){
					loadTester.expectScriptsLoad(loadDefs[name], name);
				}
			}
		});
		
	});
	var scriptLoaders = [];
	
	$.each($.webshims.cfg.loader, function(name){
		scriptLoaders.push(name);
	});
	var currentLoader = 0;
	window.loadTester = {
		init: function(){
			var search = location.search.split('?')[1];
			var testProfile;
			if(!search){
				this.initTest(0);
				return;
			} 
			search = search.split('&');
			
			$.each(search, function(i, name){
				name = name.split('=');
				if(name[0] == 'loadTest' && name[1]){
					testProfile = parseInt(name[1], 10);
				}
				if(name[0] == 'useLoader' && name[1]){
					currentLoader = parseInt(name[1], 10);
				}
			}); 
			if(!isNaN(currentLoader)){
				var loader = $.webshims.cfg.loader[scriptLoaders[currentLoader]];
				$.webshims.cfg.loader = {};
				$.webshims.cfg.loader[scriptLoaders[currentLoader]] = loader;
			} else {
				currentLoader = 0;
			}
			if(!isNaN(testProfile)){
				loadTester.initTest(testProfile);
			}	
		},
		loadNext: function(index){
			location.search = '?loadTest='+index+'&useLoader='+currentLoader;
			
		},
		addProfile: function(profile){
			profiles.push(profile);
		},
		initTest: function(index){
			if(profiles[index]){
				if(profiles[index + 1] || scriptLoaders[currentLoader + 1]){
					QUnit.done = function(data){
						if((loadTester.debug == 'silent' && data.failed === 0 && data.passed) || confirm(index +' load profile had '+ data.failed +' failures. Do next load?')){
							if(profiles[index + 1]){
								loadTester.loadNext(index + 1);
							} else if(scriptLoaders[currentLoader + 1]) {
								currentLoader++;
								loadTester.loadNext(0);
							}
						}
					};
				}
				
				profiles[index].tests();
				profiles[index].init();
			}
		},
		markScripts: function(){
			$('script').addClass('direct-included');
		},
		expectScriptsLoad: function(scriptDefs, waitFeature){
			//todo
			return;
			if(scriptDefs[browserName+browserVersion]){
				var scripts = scriptDefs[browserName+browserVersion];
				
				asyncTest("scripts loaded", function(){
					var scriptsLoaded = $('script:not(.direct-included)');
					equals(scripts.length, scriptsLoaded.length, 'scripts.length are eqal');
					if(scripts.length != scriptsLoaded.length){
						scriptsLoaded.each(function(){
							var src = this.src;
							var found;
							
							$.each(scripts, function(i, scriptName){
								if((src || '').indexOf(scriptName) !== -1){
									found = true;
									return false;
								}
							});
							if(!found){
								equals('not found', src+' was loaded');
								$.webshims.warn(this);
							}
						});
					}
					$.each(scripts, function(i, src){
						if(scriptsLoaded.filter('[src*="'+  src +'"]').length != 1){
							ok(false, src +' was not loaded');
						}
					});
					$.webshims.ready(waitFeature, function(){setTimeout(start, 300);});
				});
			}
		},
		reverseFeatures: function(){
			$.webshims.featureList.reverse();
			$.each($.webshims.features, function(i, feature){
				if($.isArray(feature)){
					feature.reverse();
				}
			});
		},
		testGlobalReady: function(){
			asyncTest("$.ready test", function(){
				ok($.isReady, 'ready is executed');
				$(function(){start();});
				
			});
			asyncTest("$.isDOMReady test", function(){
				ok($.isDOMReady, 'DOMready is executed');
				$.webshims.ready('DOM', function(){start();});
			});
		},
		addImplementationTest: function(name, test){
			if(!implementTests[name]){
				implementTests[name] = [test];
			} else {
				implementTests.push(test);
			}
		},
		testMainFeatureFor: function(name){
			if(implementTests[name]){
				asyncTest("implementTests for feature "+ name, function(){
					$.each(implementTests[name], function(i, fn){
						fn();
					});
					$.webshims.ready(name, function(){
						start();
					});
				});
			}
		},
		testFeaturesLoad: function(features, mainFeature){
			if(mainFeature){
				asyncTest(mainFeature+ " is ready", function(){
					ok(true, mainFeature+'ready is executed');
					$.webshims.ready(mainFeature, function(){
						start();
					});
				});
				loadTester.testMainFeatureFor(mainFeature);
			}
			
			if(features[0] !== mainFeature){
				
				$.each(features, function(i, name){
					var dependencyTime;
					var module = $.webshims.modules[name];
					if(module && module.dependencies && module.dependencies.length){
						dependencyTime = true;
						$.webshims.ready(module.dependencies, function(){
							dependencyTime = $.now();
						});
					}
					
					asyncTest(name+ " is ready", function(){
						ok(true, name+' ready is executed');
						if(dependencyTime && module){
							ok(dependencyTime !== true && dependencyTime <= $.now() || module.loaded === undefined , ' dependencies are called later');
						}
						$.webshims.ready(name, function(){
							start();
						});
					});
					loadTester.testMainFeatureFor(name);
				});
			}
			
		}
	};
})(window.jQuery);
