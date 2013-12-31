/**
Task to optimize polyfiller.js
optimizePolyfiller: {
	options: {
		src: 'js-webshim/dev/', //required
		features: 'forms mediaelement', //which features are used?

		dest: 'polyfiller-custom.js',
		//should existing uglify be extended to uglify custom polyfiller? default: false (grunt-contrib-uglify has to be installed)
		uglify: true,
		
		//should initially loaded files inlined into polyfiller? default: false (
		//depends on your pferformance strategy. in case you include polyfiller.js at bottom, this should be set true)
		inlineInitFiles: true,
		
		//only in case inlineInitFiles is true
		//which lang or langs are used on page?
		lang: 'fr it',
		//forms feature option default: false
		customMessages: false,
		//forms-ext feature option default: false
		replaceUI: false,
		//is swfobject not used on site default: true (used only with mediaelement)
		includeSwfmini: true
	}
}
*/

module.exports = function( grunt ) {
	grunt.registerTask('optimizePolyfiller', 'optimizes polyfiller file.', function() {
		var code, polyfillerPath, dirPath, uglifyCfg;
		var options = this.options({
			uglify: false,
			dest: 'polyfiller-custom.js',
			
			features: false, 
			
			inlineInitFiles: false,
			
			//only in case inlineInitFiles is true
			lang: false,
			
			customMessages: false,
			replaceUI: false,
			includeSwfmini: true
		});
		
		options.features = makeArrayOrFalse(options.features);
		
		options.lang = makeArrayOrFalse(options.lang);
		
		if(!options.src){
			grunt.log.error('no src path specified');
		}
		
		if(grunt.file.isFile(options.src)){
			polyfillerPath = options.src;
			dirPath = options.src.slice(0, options.src.lastIndexOf("/") + 1);
		} else {
			polyfillerPath = options.src+'polyfiller.js';
			dirPath = options.src;
		}
		
		code = grunt.file.read(polyfillerPath);
		code = removeFeatures(code, options.features, dirPath);
		code = inlineInitial(code, options, dirPath);
		
		grunt.file.write(dirPath+options.dest, code);
		
		if(options.uglify){
			uglifyCfg = grunt.config('uglify') || {};
			uglifyCfg.polyfillerOptimized = {
				options: {
					beautify: {
						ascii_only : true
					},
					preserveComments: 'some',
					compress: {
					global_defs: {
						"WSDEBUG": false
					},
						dead_code: true
					}
				},
				src: dirPath+options.dest,
				dest: dirPath+options.dest
			};
			//
			grunt.config('uglify', uglifyCfg);
			grunt.task.run('uglify:polyfillerOptimized');
		}
		
	});

	var inlineInitial = (function(){
		var initialAll = {
			forms: {
				'form-core': true,
				'dom-extend': {confirm: 'customMessages'},
				'form-message': {confirm: 'customMessages'}
			},
			'forms-ext': {
				'dom-extend': {confirm: 'replaceUI'},
				'form-number-date-ui': {confirm: 'replaceUI'},
				'range-ui': {confirm: 'replaceUI'}
			},
			mediaelement: {
				'swfmini': {confirm: 'includeSwfmini'},
				'mediaelement-core': true
			},
			track: {
				'track-ui': true //todo remove dom-extend prefernce
			}
		};
		
		return function inlineInitial(code, options, dirPath){
			var inlined = {};

			options.features.forEach(function(feature){
				if(initialAll[feature]){
					var file, add;
					var files = initialAll[feature];
					for(file in files){
						add = false;
						if(inlined[file]){
							continue;
						}
						if(files[file] === true){
							add = true;
						} else if(files[file].confirm && options[files[file].confirm]){
							add = true;
						}
						if(add){
							inlined[file] = true;
							code += "\n;"+grunt.file.read(dirPath+'shims/'+file+'.js');
							grunt.log.writeln('Inlined '+file+" script code to polyfiller");
						}
					}
					
				}
			});
			if(options.lang && (options.customMessages || options.replaceUI)){
				options.lang.forEach(function(lang){
					if(grunt.file.isFile(dirPath+'shims/i18n/formcfg-'+lang+'.js')){
						code += "\n;"+grunt.file.read(dirPath+'shims/i18n/formcfg-'+lang+'.js');
						grunt.log.writeln('Inlined '+lang+" locale code to polyfiller");
					} else {
						grunt.log.writeln('Could not find '+lang+" locale.");
					}
				});
			}
			return code;
		};
	})();
	
	var removeFeatures = (function(){
		var remove;
		var regStart = /\/\/<([A-Za-z]+)/;
		var regEnd = /\/\/>/;
		var getRemoveCombos = function (removeFeature, combos, featureCombos){
			if(featureCombos[removeFeature]){
				featureCombos[removeFeature].forEach(function(c){
					if(combos.indexOf(c) == -1){
						combos.push(c);
					}
				});
			}
		};
		
		return function removeFeatures(code, features, path){
			if(features){
				var result = [];
				var combos = [];
				var featureCombos = grunt.file.readJSON(path +'shims/combos/comboinfo.json').features;
				var data = code.replace(/\t/g, "").split(/[\n\r]/g);
				
				data.forEach(function(line){
					var foundFeature;
					var featureCombo;
					
					if(remove){
						remove = !(regEnd.exec(line));
					} else if( !line || !(foundFeature = regStart.exec(line)) || features.indexOf(foundFeature[1]) !== -1 ){
						if(combos.length && (/\/\/>removeCombos</).test(line)){
							line = line.replace(/\/\/>removeCombos</, "removeCombos = removeCombos.concat(["+ combos.join(",") +"]);" );
							grunt.log.writeln('Removed following combos: '+ combos.join(","));
						}
						result.push(line);
					} else if(foundFeature){
						remove = true;
						grunt.log.writeln('Remove '+foundFeature[1]+" code from polyfiller");
						getRemoveCombos(foundFeature[1], combos, featureCombos);
					}
				});
				
				return result.join("\n");
			} else {
				grunt.log.writeln('No feature was removed from polyfiller code.');
			}
			return code;
		};
	})();
	
	
	function makeArrayOrFalse(opt){
		if(opt && typeof opt == 'string'){
			opt = opt.split(' ');
		} else if(!Array.isArray(opt) || !opt.length){
			opt = false;
		}
		
		return opt;
	}
};