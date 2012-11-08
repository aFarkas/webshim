/*global module:false*/
module.exports = function(grunt){
	
	function getFiles(srcdir, destdir, wildcard) {
		var path = require('path');
		var files = {};
		grunt.file.expand({cwd: srcdir}, wildcard).forEach(function(relpath) {
			files[path.join(destdir, relpath)] = path.join(srcdir, relpath);
		});
		return files;
	}
	
	
	// Project configuration.
	grunt.initConfig({
		pkg: '<json:package.json>',
		meta: {
			banner: '/*! v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %> */'
		},
		concat: {"src/shims/combos/27.js":["src/shims/es5.js","src/shims/dom-extend.js","src/shims/mediaelement-core.js","src/shims/mediaelement-swf.js","src/shims/track.js"],"src/shims/combos/10.js":["src/shims/es5.js","src/shims/dom-extend.js","src/shims/mediaelement-core.js","src/shims/mediaelement-swf.js"],"src/shims/combos/1.js":["src/shims/es5.js","src/shims/dom-extend.js"],"src/shims/combos/22.js":["src/shims/es5.js","src/shims/mediaelement-core.js","src/shims/mediaelement-swf.js"],"src/shims/combos/9.js":["src/shims/dom-extend.js","src/shims/mediaelement-core.js","src/shims/mediaelement-swf.js"],"src/shims/combos/12.js":["src/shims/dom-extend.js","src/shims/details.js","src/shims/mediaelement-core.js"],"src/shims/combos/17.js":["src/shims/dom-extend.js","src/shims/form-core.js","src/shims/form-message.js","src/shims/mediaelement-core.js"],"src/shims/combos/26.js":["src/shims/dom-extend.js","src/shims/form-core.js","src/shims/mediaelement-core.js","src/shims/track.js"],"src/shims/combos/16.js":["src/shims/dom-extend.js","src/shims/form-core.js","src/shims/mediaelement-core.js"],"src/shims/combos/25.js":["src/shims/dom-extend.js","src/shims/mediaelement-core.js","src/shims/track.js"],"src/shims/combos/8.js":["src/shims/dom-extend.js","src/shims/mediaelement-core.js"],"src/shims/combos/24.js":["src/shims/dom-extend.js","src/shims/form-core.js","src/shims/form-datalist.js","src/shims/mediaelement-core.js"],"src/shims/combos/19.js":["src/shims/dom-extend.js","src/shims/form-core.js","src/shims/form-datalist.js"],"src/shims/combos/11.js":["src/shims/dom-extend.js","src/shims/form-datalist.js"],"src/shims/combos/13.js":["src/shims/dom-extend.js","src/shims/details.js"],"src/shims/combos/14.js":["src/shims/json-storage.js","src/shims/geolocation.js"],"src/shims/combos/15.js":["src/shims/geolocation.js","src/shims/details.js"],"src/shims/combos/3.js":["src/shims/form-core.js","src/shims/form-shim-extend.js","src/shims/form-message.js","src/shims/form-datalist.js"],"src/shims/combos/2.js":["src/shims/form-core.js","src/shims/form-shim-extend.js","src/shims/form-message.js"],"src/shims/combos/59.js":["src/shims/form-core.js","src/shims/form-native-extend.js","src/shims/form-message.js","src/shims/form-datalist.js"],"src/shims/combos/5.js":["src/shims/form-core.js","src/shims/form-native-extend.js","src/shims/form-message.js"],"src/shims/combos/4.js":["src/shims/form-core.js","src/shims/form-message.js"],"src/shims/combos/18.js":["src/shims/form-native-extend.js","src/shims/form-number-date-api.js","src/shims/form-number-date-ui.js","src/shims/form-datalist.js"],"src/shims/combos/7.js":["src/shims/form-native-extend.js","src/shims/form-number-date-api.js","src/shims/form-number-date-ui.js"],"src/shims/combos/23.js":["src/shims/form-shim-extend.js","src/shims/form-message.js","src/shims/mediaelement-core.js"],"src/shims/combos/21.js":["src/shims/form-shim-extend.js","src/shims/form-message.js"],"src/shims/combos/6.js":["src/shims/form-number-date-api.js","src/shims/form-number-date-ui.js"],"src/shims/combos/20.js":["src/shims/mediaelement-core.js","src/shims/mediaelement-swf.js"]},
		copy: {
			dist: {
				files: {
					"demos/js-webshim/dev/": "src/**",
					"demos/js-webshim/minified/": "src/**"
				}
			}
		},
		min: getFiles('src', 'demos/js-webshim/minified', '**/*.js'),
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				browser: true
			},
			globals: {
				jQuery: true
			}
		},
		uglify: {}
	});
	
	// Default task.
	
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.registerTask('default', 'concat copy min');
	
};
