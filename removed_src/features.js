(function($){
	
	$.support.inputUI = ($('<input type="range" />')[0].type == 'range' && $('<input type="date" />')[0].type == 'date');
	$.htmlExt.addModule('input-ui', {
		test: function(){return $.support.inputUI;},
		combination: ['combined-all', 'combined-x', 'combined-forms'],
		options: {
			slider: {},
			date: {},
			juiSrc: 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.4/jquery-ui.min.js',
			langSrc: 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.4/i18n/jquery.ui.datepicker-',
			recalcWidth: true,
			nativeIsReplaced: false,
			replaceNative: function(replace){
				this.nativeIsReplaced = replace;
				if(replace){
					$.htmlExt.loader.modules['input-ui'].test = function(){
						return false;
					};
				} else {
					$.htmlExt.loader.modules['input-ui'].test = function(){
						return $.support.inputUI;
					};
				}
			}
		}
	});
	
	
})(jQuery);
