/*
 * enables polyfiller.js to generate combohandler urls
 */
(function($){
	
	var webshims = $.webshims;
	var modules = webshims.modules;
	var loader = webshims.loader;
	
	$.extend(true, webshims, {
		cfg: {
			comboOptions: {
				separator: ',',
				base: '/min/f=',
				maxFiles: 10,
				//set script path for comboOptions
				scriptPath: (function(){
					var l = location;
					return $.webshims.cfg.basePath.replace(l.protocol + '//' + l.host + '/', '');
				})(),
				fn: function(base, scriptPath, separator, srces){
					return base +
					$.map(srces, function(src){
						return scriptPath + src;
					}).join(separator);
				}
			}
		},
		loadAsCombo: (function(){
			var excludeCombo = /\.\/|\/\//;
			return function(toLoad, combo){
				var fPart = [];
				var combiNames = [];
				var len = 0;
				
				combo = $.extend({}, webshims.cfg.comboOptions, typeof combo == 'object' ? combo : {});
				
				$.each(toLoad, function(i, loadName){
					if ($.inArray(loadName, loader.loadedModules) == -1) {
						var src = (modules[loadName].src || loadName);
						
						if (src.indexOf('.') == -1) {
							src += '.js';
						}
						if (!excludeCombo.test(src)) {
							len++;
							fPart.push(src);
							combiNames.push(loadName);
							if (len >= combo.maxFiles || (len > 9 && fPart.join(',,,,').length > 200)) {
								loader._loadScript(combo.fn(combo.base, combo.scriptPath, combo.separator, fPart), combiNames);
								fPart = [];
								combiNames = [];
								len = 0;
							}
						}
						else {
							loader._loadScript(src, loadName);
						}
					}
				});
				if (fPart.length) {
					loader._loadScript(combo.fn(combo.base, combo.scriptPath, combo.separator, fPart), combiNames);
				}
			};
		})()
	});
	
})(jQuery);
