(function($){
	
	$.support.inputUI = ($('<input type="range" />')[0].type == 'range' && $('<input type="date" />')[0].type == 'date');
	$.webshims.addModule('input-ui', {
		test: function(){return $.support.inputUI;},
		combination: ['combined-all', 'combined-x', 'combined-forms'],
		options: {
			slider: {},
			date: {},
			langSrc: 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.4/i18n/jquery.ui.datepicker-',
			recalcWidth: true,
			_autoStart: true,
			autoStart: function(start){
				this._autoStart = start;
			},
			_nativeIsReplaced: false,
			replaceNative: function(replace){
				this._nativeIsReplaced = replace;
				if(replace){
					$.webshims.loader.modules['input-ui'].test = function(){
						return false;
					};
				} else {
					$.webshims.loader.modules['input-ui'].test = function(){
						return $.support.inputUI;
					};
				}
			}
		}
	});
	
	
})(jQuery);
