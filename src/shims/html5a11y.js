(function($, document){
	
	var elemMappings = {
		article: "article",
		aside: "complementary",
		section: "region",
		nav: "navigation",
		address: "contentinfo"
	};
	var addRole = function(elem, role){
		var hasRole = elem.getAttribute('role');
		if(!hasRole){elem.setAttribute('role', role);}
	};
	
	$.webshims.addReady(function(context, contextElem){
		$.each(elemMappings, function(name, role){
			var elems = $(name, context).add(contextElem.filter(name));
			for(var i = 0, len = elems.length; i < len; i++){
				addRole(elems[i], role);
			}
		});
		if(context === document){
			var header = document.getElementsByTagName('header')[0];
			var footers = document.getElementsByTagName('footer');
			var footerLen = footers.length;
			if(header && !$(header).closest('section, article')[0]){
				addRole(header, 'banner');
			}
			if(!footerLen){return;}
			var footer = footers[footerLen -1];
			if(!$(footer).closest('section, article')[0]){
				addRole(footer, 'contentinfo');
			}
		}
	});
})(jQuery, document);

