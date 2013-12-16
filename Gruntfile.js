/*global module:false*/
module.exports = function(grunt){

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		bower: grunt.file.readJSON('bower.json'),
		jq: grunt.file.readJSON('webshims.jquery.json'),
		meta: {
			banner: '/*! v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %> */'
		},
		//concat is changed through webshimscombos
		concat: {
			options: {
				separator: ';'
			},
			demo: {
				src: ['demos/demo-js/src/prism.js', 'demos/demo-js/src/behavior.js'],
				dest: 'demos/demo-js/demo.js'
			}
		},
		//copy and uglify are changed through cfgcopymin
		copy: {},
		cssmin: getFiles('src', 'demos/js-webshim/minified', '**/*.css'),

		sass: { 
			dist: { 
				files:[{
					expand : true,
					cwd : 'src/shims/styles/scss',
					src : ['*.scss'],
					dest : 'src/shims/styles/',
					ext : '.css'
				}]
			}
		},

		uglify: {
			options: {
				beautify: {
					ascii_only : true
				},
				compress: {
				global_defs: {
					"WSDEBUG": false
				},
					dead_code: true
				}
			},
			demo: {
				src: 'demos/demo-js/demo.js',
				dest: 'demos/demo-js/demo.js'
			}
		},
		watch: {
			sass: {
				files: ['src/shims/styles/scss/*.scss'],
				tasks: ['sass']
			},
			css: {
				files: ['src/shims/**/*.css'],
				tasks: ['cfgcopymin', 'copy']
			},
			js: {
				files: ['src/**/*.js'],
				tasks: ['webshimscombos', 'concat', 'cfgcopymin', 'copy']
			},
			demos: {
				files: ['demos/demo-js/src/**/*.js'],
				tasks: ['concat']
			}
		}
	});
	
	grunt.registerTask('webshimscombos', 'create combos from polyfiller.js.', function() {
		var phantomjs = require('phantomjs');
		var done = this.async();
		var combos = {};
		grunt.util.spawn({
			cmd: phantomjs.path,
			args: [
				// The main script file.
				'build/combobuild.js',
				// The QUnit helper file to be injected.
				'build/build.html'
			]
		}, 
		function(err, result, code) {
			var concatCfg;
			result = result.toString();
			if(!err && result.indexOf && result.indexOf('done') == -1){
				
				try {
					combos = JSON.parse(result);
				} catch(er){
					grunt.warn('parse error');
				}
				
				concatCfg = grunt.config('concat');
				if(concatCfg){
					concatCfg.combos = {files: combos};
				} else {
					concatCfg = combos;
				}
				//grunt.warn(JSON.stringify(concatCfg))
				grunt.config('concat', concatCfg);
				
				done(code);
				return;
			}
			
			// Something went horribly wrong.
			grunt.verbose.or.writeln();
			grunt.log.write('Running PhantomJS...').error();
			if (code === 127) {
				grunt.warn('PhantomJS not found.');
			} else {
				result.split('\n').forEach(grunt.log.error, grunt.log);
				grunt.warn('PhantomJS exited unexpectedly with exit code ' + code + '.');
			}
			done(code);
		});		
	
	});
	grunt.registerTask('cfgcopymin', 'config min and copy tasks.', function() {
		var files = getFiles('src', false, '**', 'demos/js-webshim/dev', '*.js');
		var path = require('path');
		var copyTask = {};
		var minTask = {};
		var minPath, file, found;
		
		for(var i in files){
			file = files[i];
			if(grunt.file.isFile(file)){
				minPath = path.join('demos/js-webshim/minified', i);
				if(/\.js$/.test(file)){
					minTask[minPath] = [file];
					found = true;
				}
				copyTask[minPath] = [file];
				copyTask[path.join('demos/js-webshim/dev', i)] = [file];
			}
		}
		if(!found){
			minTask[path.join('demos/js-webshim/minified', 'polyfiller.js')] = path.join('src', 'polyfiller.js');
		}
		var uglifyCfg = grunt.config('uglify');
		var copyCfg = grunt.config('copy');
		uglifyCfg.dist = { 'files': minTask };
		copyCfg.dist = { 'files': copyTask };
		grunt.config('uglify', uglifyCfg);
		grunt.config('copy', copyCfg);
	});
	
	// Default task.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-css');
	grunt.loadNpmTasks('grunt-contrib-sass');
	
	grunt.registerTask('default', ['webshimscombos', 'concat', 'sass', 'cfgcopymin', 'copy', 'cssmin', 'uglify']);

	grunt.registerTask('dev', ['webshimscombos', 'concat', 'sass', 'cfgcopymin', 'copy', 'watch']);


	function getFiles(srcdir, destdir, wildcard, compareDir, compareMatch) {
		var path = require('path');
		var fs = require('fs');
		// In Nodejs 0.8.0, existsSync moved from path -> fs.
		var existsSync = fs.existsSync || path.existsSync;
		var files = {};
		grunt.file.expand({cwd: srcdir}, wildcard).forEach(function(relpath) {
			var src = path.join(srcdir, relpath);
			
			if(!compareDir || !compareMatch || !grunt.file.isMatch(compareMatch, src) || (!existsSync(path.join(compareDir, relpath)) || grunt.file.read(src) != grunt.file.read(path.join(compareDir, relpath)))){
				files[destdir === false ? relpath : path.join(destdir, relpath)] = src;
			}
		});
		return files;
	}
	
	
};
