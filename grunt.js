/*global module:false*/
module.exports = function(grunt){

	// Project configuration.
	grunt.initConfig({
		pkg: '<json:package.json>',
		meta: {
			banner: '/*! v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %> */'
		},
		//concat is changed through webshimscombos
		concat: {},
		//copy and min are changed through cfgcopymin
		copy: {},
		min: {},
		cssmin: getFiles('src', 'demos/js-webshim/minified', '**/*.css'),
		uglify: {
			codegen: {ascii_only: true}
		},
		watch: {
			files: 'src/shims/styles/shim.css',
			tasks: 'css'
		}
	});
	
	grunt.registerTask('webshimscombos', 'create combos from polyfiller.js.', function() {
		var done = this.async();
		var combos = {};
		grunt.utils.spawn({
			cmd: 'phantomjs',
			args: [
				// PhantomJS options.
				'--config={}',
				// The main script file.
				'build/combobuild.js',
				// The temporary file used for communications.
				'',
				// The QUnit helper file to be injected.
				'build/build.html'
			]
		}, 
		function(err, result, code) {
			if(!err && result.indexOf && result.indexOf('done') == -1){
				
				try {
					combos = JSON.parse(result);
				} catch(er){
					grunt.warn('parse error');
				}
				grunt.config('concat', combos);
				
				done(code);
				return;
			}
			
			// Something went horribly wrong.
			grunt.verbose.or.writeln();
			grunt.log.write('Running PhantomJS...').error();
			if (code === 127) {
				grunt.log.errorlns(
				  'In order for this task to work properly, PhantomJS must be ' +
				  'installed and in the system PATH (if you can run "phantomjs" at' +
				  ' the command line, this task should work). Unfortunately, ' +
				  'PhantomJS cannot be installed automatically via npm or grunt. ' +
				  'See the grunt FAQ for PhantomJS installation instructions: ' +
				  'https://github.com/gruntjs/grunt/blob/master/docs/faq.md'
				);
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
			if(grunt.file.isMatch('*.*', file)){
				minPath = path.join('demos/js-webshim/minified', i);
				if(grunt.file.isMatch('*.js', file)){
					minTask[minPath] = file;
					found = true;
				}
				copyTask[minPath] = file;
				copyTask[path.join('demos/js-webshim/dev', i)] = file;
			}
		}
		if(!found){
			minTask[path.join('demos/js-webshim/minified', 'polyfiller.js')] = path.join('src', 'polyfiller.js');
		}
		grunt.config('min', minTask);
		grunt.config('copy', copyTask);
	});
	
	// Default task.
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-css');
	grunt.registerTask('default', 'webshimscombos concat cfgcopymin copy cssmin min');

	grunt.registerTask('css', 'cfgcopymin copy');



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
