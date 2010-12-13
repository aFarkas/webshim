(function($, window, document, undefined){
	if(!document.createStyleSheet){return;}
	var webshims = $.webshims;
	var span = document.createElement('span');
	var bindProp;
	if(span.style.behavior != null){
		bindProp = 'behavior';
	} else if(span.style.MsBehavior != null){
		bindProp = 'MsBehavior';
	} else {
		return;
	}
	var ss = document.createStyleSheet();
	var rules = ss.rules;
	var ruleNumber = -1;
    var addedBehaviors = {};
	webshims.preloadBehavior =  (function(){
		
		var behaviors = [];
		return function(file){
			file = 'url('+ (webshims.loader.makePath(file)) +')';
			if($.inArray(file, behaviors) != -1){return;}
			behaviors.push(file);
			span.style[bindProp] = behaviors.join(', ');
		};
	})();
	
	$.each(webshims.preloadHTCs, function(i, file){
		webshims.preloadBehavior(file);
	});
	
	webshims.preloadHTCs = {push: webshims.preloadBehavior};
    
	webshims.addBehavior = function(sel, file){
		var files;
		var selBehavior = addedBehaviors[sel];
		file = 'url('+webshims.loader.makePath(file)+')';
		if(!selBehavior){
			ruleNumber++;
			addedBehaviors[sel] = {
				files: [file],
				index: ruleNumber
			};
			ss.addRule(sel, bindProp+': '+ file +';');
		} else if($.inArray(file, selBehavior) == -1) {
			files = selBehavior.files;
			files.push(file);
			
			rules[selBehavior.index].style.cssText = bindProp+': '+ (files.join(', '));
						
		}
	};
})(jQuery, this, this.document);
