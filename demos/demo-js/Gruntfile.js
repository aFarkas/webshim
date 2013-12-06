module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: ['src/mousepress.js', 'src/jquery.mousewheel.js', 'src/jquery.mwheelIntent.js', 'src/jquery.ui.position.js', 'src/init.js'],
				dest: 'src/demo.js'
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'src/demo.js',
				dest: 'demo.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	

	grunt.registerTask('default', ['concat', 'uglify']);

};