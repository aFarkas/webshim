module("storage");



asyncTest("json-storage", function(){
	equals(localStorage.getItem('test1'), '', 'localStorage test1 is an empty string');
	
	equals(localStorage.getItem('test2'), 'undefined', 'localStorage test2 is "undefined"');
	
	equals(localStorage.getItem('t!(){};es.t-3'), 'localStorage', 'localStorage t!(){};es.t-3 is "localStorage"');
//	equals(localStorage.length, 3, 'localStorage.length is 3');
	
	if((location.hash || '').indexOf('testsession') !== -1){
		equals(sessionStorage.getItem('test1'), '', 'sessionStorage test1 is an empty string');
		equals(sessionStorage.getItem('test2'), 'undefined', 'sessionStorage: test2 is "undefined"');
		equals(sessionStorage.getItem('t!(){};es.t-3'), 'sessionStorage', 'sessionStorage: t!(){};es.t-3 is "sessionStorage"');
//		equals(sessionStorage.length, 3, 'sessionStorage.length is 3');
	}
	
	$.webshims.ready('json-storage', function(){
		start();
	});
});