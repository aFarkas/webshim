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
		//copy and uglify are changed through cfgcopymin
		copy: {},
		cssmin: getFiles('src', 'demos/js-webshim/minified', '**/*.css'),
		uglify: {
			options: {
				beautify: {
					ascii_only : true
				}
			}			  
		},
		watch: {
			files: 'src/shims/styles/shim.css',
			tasks: 'css'
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
			result = result.toString();
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
	grunt.registerTask('default', ['webshimscombos', 'concat', 'cfgcopymin', 'copy', 'cssmin', 'uglify']);

	grunt.registerTask('css', ['cfgcopymin', 'copy']);



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
