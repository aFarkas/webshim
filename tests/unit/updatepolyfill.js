(function($){

module("updatePolyfill/htmlPolyfill");

asyncTest("updatePolyfill", function(){
	var newStr;
	var docStr = $('html').get(0).innerHTML.split('\n');
	$('body').updatePolyfill();
	newStr = $('html').get(0).innerHTML.split('\n');
	for(var i = 0; i < newStr.length; i++){
		if(newStr[i] != docStr[i]){
			strictEqual(newStr[i], docStr[i], 'string not equal in line '+ i);
		}
	}
	
	
	
	$.webshims.ready('DOM forms forms-ext canvas mediaelement', function(){
		start();
	});
});

})(jQuery);