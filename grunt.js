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
		concat: {},
		copy: {
			dist: {
				files: {
					"demos/js-webshim/dev/": "src/**",
					"demos/js-webshim/minified/": "src/**"
				}
			}
		},
		min: getFiles('src', 'demos/js-webshim/minified', '**/*.js'),
		
		uglify: {}
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
				grunt.log.write(result)
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
	
	// Default task.
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.registerTask('default', 'webshimscombos concat copy min');



	function getFiles(srcdir, destdir, wildcard) {
		var path = require('path');
		var files = {};
		grunt.file.expand({cwd: srcdir}, wildcard).forEach(function(relpath) {
			files[path.join(destdir, relpath)] = path.join(srcdir, relpath);
		});
		return files;
	}
	
	
};
