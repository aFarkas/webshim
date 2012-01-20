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
			}
		});
		
	});
	
	
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
				
			}); 
			
			testProfile = testProfile || 0;
			
			loadTester.initTest(testProfile);
		},
		loadNext: function(index){
			location.search = '?loadTest='+index +'&notrycatch=true';
			
		},
		addProfile: function(profile){
			profiles.push(profile);
		},
		initTest: function(index){
			if(profiles[index]){
				if(profiles[index + 1]){
					QUnit.done = function(data){
						if((loadTester.debug == 'silent' && data.failed === 0 && data.passed) || confirm(index +' load profile had '+ data.failed +' failures. Do next load?')){
							if(profiles[index + 1]){
								loadTester.loadNext(index + 1);
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
				$(function(){
					start();
				});
				
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
					if(module && module.d && module.d.length){
						dependencyTime = true;
						$.webshims.ready(module.d, function(){
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
