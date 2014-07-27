webshim.register('usermedia-core', function($, webshim, window, document, undefined, options){
	"use strict";

	var srcObjectName = webshim.prefixed('srcObject', document.createElement('video'));

	if(srcObjectName != 'srcObject'){
		var hasURL = !!(window.URL && URL.createObjectURL);
		webshim.defineNodeNamesProperty(['audio', 'video'], 'srcObject', {
			prop: {
				get: function(){
					return this[srcObjectName] || null;
				},
				set: function(stream){
					if(srcObjectName){
						$.prop(this, srcObjectName, stream);
					} else {
						$.prop(this, 'src', hasURL ? URL.createObjectURL(stream) : stream);
					}
				}
			}
		});
	}



	webshim.ready('usermedia-shim', function(){
		navigator.getUserMedia = navigator[webshim.prefixed('getUserMedia', navigator)];
	});
});
