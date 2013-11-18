(function($){
    module("boolean attr");
    	
	var booleanJTest = function(i, data){
        var elem = $(data.sel);
        equals(elem.prop(data.attr), data.init, 'element initial boolean value');
        elem.prop(data.attr, true);
        equals(elem.prop(data.attr), true, 'element is set set to true');
        //fals-y value test
		elem.prop(data.attr, "");
        equals(elem.prop(data.attr), false, 'element is set to false by using empty string');
    };
	
	var booleanContentTest = function(i, data){
        var elem = $(data.sel);
        elem.prop(data.attr, true);
        //fals-y value test
		elem.prop(data.attr, "");
        equals(elem.attr(data.attr), undefined, 'element is set undefined by using empty string');
		
		elem.attr(data.attr, "");
        equals(elem.attr(data.attr), data.attr, 'element is set to "attribute name" by using empty string');
		
		elem.removeAttr(data.attr);
        equals(elem.attr(data.attr), undefined, 'element is set undefined by using removeAttr');
    };
	
	
    
    asyncTest("boolean IDL attributes", function(){
		
		QUnit.reset();
        
        $.each([{
            sel: '#name',
            attr: 'required',
            init: true
        }, {
            sel: '#number',
            attr: 'required',
            init: false
        }], booleanJTest);
		
        $.webshims.ready('DOM forms forms-ext es5 canvas', function(){
            start();
        });
    });
	
	
    asyncTest("boolean content attributes", function(){
		
		QUnit.reset();
        
        $.each([{
            sel: '#name',
            attr: 'required',
            init: 'required'
        }, {
            sel: '#number',
            attr: 'required',
            init: undefined
        }], booleanContentTest);
		
        $.webshims.ready('DOM forms forms-ext es5 canvas', function(){
            start();
        });
    });
    
    
    
})(jQuery);
