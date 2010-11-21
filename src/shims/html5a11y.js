(function($, document){
	
	var elemMappings = {
		article: "article",
		aside: "complementary",
		section: "region",
		nav: "navigation"
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
			$('header:first').attr('role', 'banner');
			$('footer:last').attr('role', 'contentinfo');
		}
	});
})(jQuery, this.document);
