jQuery.webshims.ready('dom-support', function($, webshims, window, document, undefined){
	
	var anchor = document.createElement('a');
	['poster', 'src'].forEach(function(prop){
		webshims.defineNodeNamesProperty(prop == 'src' ? ['audio', 'video', 'source'] : ['video'], prop, {
			prop: {
				get: function(){
					var href = $.attr(this, prop);
					if(href == null){return '';}
					anchor.setAttribute('href', href);
					return anchor.href;
				},
				set: function(src){
					$.attr(this, prop, src);
				}
			}
		});
	});
	
	
	['loop', 'autoplay', 'controls'].forEach(function(name){
		webshims.defineNodeNamesBooleanProperty(['audio', 'video'], name);
	});
		
	webshims.defineNodeNamesProperties(['audio', 'video'], {
		HAVE_CURRENT_DATA: {
			value: 2
		},
		HAVE_ENOUGH_DATA: {
			value: 4
		},
		HAVE_FUTURE_DATA: {
			value: 3
		},
		HAVE_METADATA: {
			value: 1
		},
		HAVE_NOTHING: {
			value: 0
		},
		NETWORK_EMPTY: {
			value: 0
		},
		NETWORK_IDLE: {
			value: 1
		},
		NETWORK_LOADING: {
			value: 2
		},
		NETWORK_NO_SOURCE: {
			value: 3
		}
				
	}, 'prop');
	

});