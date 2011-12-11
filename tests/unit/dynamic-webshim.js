(function($){

module("dynamic webshim / css load");
asyncTest("dynamic webshim Modul", function(){
	var testElem = $('<div />').appendTo('body');
	var testStructure = '<div id="webshim-structure"><section><hgroup><input type="password" placeholder="hello" /></hgroup></section><section></section></div>';
	var structureTest = function(fnName){
		var elemsLength = (!Modernizr.input.placeholder) ? 6 : 4;
		equals( $('#webshim-structure > *').length, 2, 'structure has two childs with method '+ fnName );
		equals( $('#webshim-structure *').length, elemsLength, 'structure has 4 descendants with method '+ fnName );
		if(Modernizr.input.placeholder === 'shim'){
			ok( $('#webshim-structure input').parent().hasClass('placeholder-box'), 'functional webshim does work with method '+ fnName );
		}
		$('#webshim-structure input').remove();
		ok($('#webshim-structure').html().indexOf('/>') === -1, 'html5 structure is parsed correctly');
		$('#webshim-structure').remove();
	};
	
	testElem.afterPolyfill(testStructure);
	structureTest('afterPolyfill');
	
	testElem.htmlPolyfill(testStructure);
	structureTest('htmlPolyfill');
	
	testElem.remove();
	
	
	$.webshims.ready('DOM forms', function(){
		start();
	});
});

})(jQuery);