(function($){
    module("boolean attr");
    var booleanTest = function(i, data){
        var elem = $(data.sel);
        equals(elem.attr(data.attr), data.init, 'element initial boolean value');
        elem.attr(data.attr, true);
        equals(elem.attr(data.attr), true, 'element is set set to true');
        //fals-y value test
        elem[0][data.attr] = "";
        equals(elem.attr(data.attr), false, 'element is set to false by using empty string');
    };
	
	var booleanJTest = function(i, data){
        var elem = $(data.sel);
        equals(elem.attr(data.attr), data.init, 'element initial boolean value');
        elem.attr(data.attr, true);
        equals(elem.attr(data.attr), true, 'element is set set to true');
        //fals-y value test
		 elem.attr(data.attr, "");
        equals(elem.attr(data.attr), false, 'element is set to false by using empty string');
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
        if ($.support.contentAttr || $.webshims.extendNative) {
            QUnit.reset();
            
            $.each([{
                sel: '#name',
                attr: 'required',
                init: true
            }, {
                sel: '#number',
                attr: 'required',
                init: false
            }], booleanTest);
        }
        $.webshims.ready('ready forms forms-ext es5 canvas', function(){
            start();
        });
    });
    
    
    
})(jQuery);
