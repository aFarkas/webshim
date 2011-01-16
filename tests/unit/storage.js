(function($){

module("storage");



asyncTest("json-storage", function(){
	
	localStorage.clear();
	sessionStorage.clear();
	
//	equals(localStorage.length, 0, 'localStorage is empty');
//	equals(sessionStorage.length, 0, 'sessionStorage is empty');
	
	localStorage.setItem('test1', '');
	sessionStorage.setItem('test1', '');
	
//	equals(localStorage.length, 1, 'localStorage length is 1');
	equals(localStorage.getItem('test1'), '', 'localStorage test1 is an empty string');
//	equals(sessionStorage.length, 1, 'sessionStorage length is 1');
	equals(sessionStorage.getItem('test1'), '', 'sessionStorage test1 is an empty string');
	
	equals(localStorage.getItem('test2'), null, 'localStorage test2 is null');
	equals(sessionStorage.getItem('test2'), null, 'sessionStorage test2 is null');
	
	localStorage.setItem('testJSON', JSON.stringify({foo: 'bar', baz: 1}));
	sessionStorage.setItem('testJSON', JSON.stringify({foo: 'bar', baz: 1}));
	
	equals(JSON.parse(localStorage.getItem('testJSON')).foo, 'bar', 'localStorage testJSON.foo is bar');
//	equals(sessionStorage.length, 2, 'localStorage length is 2');
	equals(JSON.parse(sessionStorage.getItem('testJSON')).foo, 'bar', 'sessionStorage testJSON.foo is bar');
//	equals(sessionStorage.length, 2, 'sessionStorage length is 2');
	
	localStorage.removeItem('testJSON');
	sessionStorage.removeItem('testJSON');
	equals(localStorage.getItem('testJSON'), null, 'localStorage testJSON.foo is removed');
//	equals(localStorage.length, 1, 'localStorage length is 1');
	equals(sessionStorage.getItem('testJSON'), null, 'sessionStorage testJSON.foo is removed');
//	equals(sessionStorage.length, 1, 'sessionStorage length is 1');
	
	sessionStorage.setItem('test2', undefined);
	equals(sessionStorage.getItem('test2'), 'undefined', 'sessionStorage: test2 is "undefined"');
	
	localStorage.setItem('test2', undefined);
	equals(localStorage.getItem('test2'), 'undefined', 'localStorage test2 is "undefined"');
	
	sessionStorage.setItem('t!(){}es.t-3', 'sessionStorage');
	equals(sessionStorage.getItem('t!(){}es.t-3'), 'sessionStorage', 'sessionStorage: t!(){}es.t-3 is "sessionStorage"');
	
	localStorage.setItem('t!(){}es.t-3', 'localStorage');
	equals(localStorage.getItem('t!(){}es.t-3'), 'localStorage', 'localStorage t!(){}es.t-3 is "localStorage"');
	
	localStorage.setItem('numberTest',  JSON.stringify(4));
	strictEqual(JSON.parse(localStorage.getItem('numberTest')), 4, 'numbers can be used');
	
	sessionStorage.setItem('numberTest',  JSON.stringify(4));
	strictEqual(JSON.parse(sessionStorage.getItem('numberTest')), 4, 'numbers can be used');
	
	localStorage.setItem('stringTest',  JSON.stringify('4'));
	strictEqual(JSON.parse(localStorage.getItem('stringTest')), '4', 'strings can be used');
	
	sessionStorage.setItem('stringTest',  JSON.stringify('4'));
	strictEqual(JSON.parse(sessionStorage.getItem('stringTest')), '4', 'strings can be used');
	
	$.webshims.ready('json-storage', function(){
		start();
	});
});



})(jQuery);