(function($){
var id = 'addready-test'+ (new Date().getTime());
$.webshims.addReady(function(context, contextElem){
	contextElem.filter('#webshim-structure').addClass(id);
	$('> #webshim-structure', context).filter('#webshim-structure').addClass(id);
});
module("dynamic webshim / css load");
asyncTest("dynamic webshim Modul", function(){
	var testElem = $('<div />').appendTo('body');
	var testStructure = '<div id="webshim-structure"><section><hgroup><input type="password" placeholder="hello" /></hgroup></section><section></section></div>';
	var structureTest = function(fnName){
		var elemsLength = (!Modernizr.input.placeholder) ? 6 : 4;
		equals( $('#webshim-structure > *').length, 2, 'structure has two childs with method '+ fnName );
		equals( $('#webshim-structure *').length, elemsLength, 'structure has 4 descendants with method '+ fnName );
		ok($('#webshim-structure').hasClass(id), "structure has addready test-class "+ fnName);
		$('#webshim-structure input').remove();
		ok($('#webshim-structure').html().indexOf('/>') === -1, 'html5 structure is parsed correctly');
		$('#webshim-structure').remove();
	};
	
	testElem.afterPolyfill(testStructure);
	structureTest('afterPolyfill');
	
	testElem.htmlPolyfill(testStructure);
	structureTest('htmlPolyfill');
	
	$(testStructure).insertPolyfillAfter(testElem);
	structureTest('afterPolyfill');
	
	testElem.remove();
	
	
	$.webshims.ready('DOM forms', function(){
		start();
	});
});

})(jQuery);