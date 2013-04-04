(function($){
var path = location.pathname.substr(0, location.pathname.lastIndexOf('/')) +'/';
loadTester.addImplementationTest('forms', function(){
	strictEqual($('<input required />').prop('required'), true, "required implemented");
});
loadTester.addImplementationTest('forms-ext forms', function(){
	strictEqual($('<input />').prop('list'), null, "input[list] implemented");
	equals($('<input type="date" />').prop('valueAsNumber', 0).prop('value'), "1970-01-01", "valueAsNumber succesful integrated");
});


})(window.jQuery);