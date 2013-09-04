webshims.register('mediagroup', function($, webshims, window, document, undefined){
	"use strict";
	var mediaelement = webshims.mediaelement;
	
	
	mediaelement.mediagroup = {
		set: function(){
			console.log(this, arguments, 'mediagroupSet')
		}
	};
	
	
	mediaelement.controller = {};
	
	['audio', 'video'].forEach(function(name){
		
		var controller = {
			set: function(){
				console.log(this, arguments, 'controllerSet')
				return controller.sup.prop._supset && controller.sup.prop._supset.apply(this, arguments);
			},
			get: function(){
				console.log(this, arguments, 'controllerGet', controller)
				return controller.sup.prop._supget && controller.sup.prop._supget.apply(this, arguments) || null;
			}
		};
		mediaelement.controller[name] = controller;
	});
});