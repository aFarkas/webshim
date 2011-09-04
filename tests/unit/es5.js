(function($){
	module("es5 module");
	asyncTest("es5 implementation tests", function(){
		var isInObject = function(prop, obj){
			ok(prop in obj, prop +' is available in '+obj);
		};
		$.each(['isArray'], function(i, name){
			isInObject(name, Array);
		});
		$.each(['keys'], function(i, name){
			isInObject(name, Object);
		});
		$.each('forEach, map, filter, every, some, reduce, reduceRight, indexOf, lastIndexOf'.split(', '), function(i, name){
			isInObject(name, Array.prototype);
			var a = ['jo', 'jo2'];
			a[name]($.noop);
		});
		$.each(['now'], function(i, name){
			isInObject(name, Date);
		});
		$.each('toISOString, toJSON'.split(', '), function(i, name){
			isInObject(name, Date.prototype);
		});
		$.each(['bind'], function(i, name){
			isInObject(name, Function.prototype);
		});
		$.each(['trim'], function(i, name){
			isInObject(name, String.prototype);
		});
		
		ok(Array.isArray([]), 'isarray finds array');
		ok(!Array.isArray({length: 0, push: $.noop, pop: $.noop}), 'isarray finds array');
		deepEqual(Object.keys({foo: 'bar', baz: undefined}), ['foo', 'baz'], 'object key do work');
		
		equals((new Date(0)).toISOString(), "1970-01-01T00:00:00.000Z", "toISOString works");
		(new Date()).toJSON();
		(function(arg1, arg2){
			equals(this.bla, 'foo', "bind works somehow");
			equals(arg1, 'jo', "bind works somehow");
			equals(arg2, 'blub', "bind works somehow");
		}.bind({bla: 'foo'}, 'jo'))('blub');
		equals(("  bla  ").trim(), "bla", "trim works somehow");
		$.webshims.ready('DOM es5', function(){
			start();
		});
	});
	asyncTest("cross-browser create, defineProperty features", function(){	
		var desc;
		var obj = $.webshims.objectCreate({
			foo: 'bar',
			baz: 'jo',
			boom: 'yes',
			options: {bla: 2}
		}, {
			baz: {
				value: 'jo2'
			},
			_create: {
				value: function(){
					this.boom = 'yes2';
				}
			}
		}, {bar: 2});
		
		equals(obj.foo, 'bar', 'access proto');
		equals(obj.baz, 'jo2', 'access direct');
		equals(obj.boom, 'yes2', 'create is run access direct');
		equals(obj.options.bar, 2, 'options are extended');
		
		ok('baz' in obj, 'values are visible by default');
		
		delete obj.baz;
		delete obj.boom;
		equals(obj.baz, 'jo', 'access proto after delete');
		equals(obj.boom, 'yes', 'access proto after delete');
		
		$.webshims.defineProperty(obj, 'sometest', {
			value: 'yes'
		});
		equals(obj.sometest, 'yes', 'defineProperty');
		
		$.webshims.defineProperties(obj, {
			sometest1: {value: 'yes'},
			sometest2: {value: 'yes2'}
		});
		equals(obj.sometest1, 'yes', 'defineProperties');
		equals(obj.sometest2, 'yes2', 'defineProperties');
		
		equals($.webshims.getOwnPropertyDescriptor(obj , 'baz'), undefined, 'proto-property is undefined (getOwnPropertyDescriptor)');
		desc = $.webshims.getOwnPropertyDescriptor(obj , 'sometest1');
		equals(desc.value, 'yes', 'getOwnPropertyDescriptor value');
		equals(desc.configurable, true, 'getOwnPropertyDescriptor writeable');
		equals(desc.enumerable, true, 'getOwnPropertyDescriptor enumerable');
		
		
		$.webshims.ready('DOM es5', function(){
			start();
		});
	});
	
	
		asyncTest("advanced Object (support.objectAccessor)", function(){	
			if (Modernizr.objectAccessor) {
				var desc;
				var obj = $.webshims.objectCreate({
					foo: 'bar'
				}, {
					baz: {
						set: function(value){
							this.setTest = value;
						},
						get: function(){
							return 'bar';
						}
					}
				});
				
				equals(obj.foo, 'bar', 'access proto');
				obj.baz = 'setBar';
				equals(obj.setTest, 'setBar', 'setter invoked with right value');
				equals(obj.baz, 'bar', 'getter returns right value');
				desc = $.webshims.getOwnPropertyDescriptor(obj, 'baz');
				equals(desc.configurable, true, 'getOwnPropertyDescriptor writeable');
				equals(desc.enumerable, true, 'getOwnPropertyDescriptor enumerable');
				equals(desc.value, undefined, 'getOwnPropertyDescriptor value');
				ok($.isFunction(desc.set), 'getOwnPropertyDescriptor set is a function');
				
				$.webshims.defineProperty(document.createElement('b').constructor.prototype, 'magic', {
					set: function(value){
						this._magic = value;
					},
					get: function(){
						return this._magic || '';
					}
				});
				
				obj = $('<b />')[0];
				equals(obj.magic, '', 'getter returns right value');
				obj.magic = 'foo bar';
				equals(obj.magic, 'foo bar', 'getter returns changed value');
			}
			$.webshims.ready('DOM es5', function(){
				start();
			});
			
		});
	
	
	
		asyncTest("extreme advanced Object (support.advancedObjectProperties)", function(){	
			if (Modernizr.advancedObjectProperties) {
				var desc;
				var keys = '';
				var obj = Object.create({
					foo: 'bar'
				}, {
					baz: {
						set: function(value){
							this.setTest = value;
						},
						get: function(){
							return 'bar';
						},
						enumerable: false,
						configurable: false
					}
				});
				
				
				$.each(obj, function(key, value){
					keys += key;
				});
				
				equals(keys, 'foo', 'baz is not enumerable');
				
				obj.baz = 'setBar';
				equals(obj.setTest, 'setBar', 'setter invoked with right value');
				equals(obj.baz, 'bar', 'getter returns right value');
				
			}
				
			$.webshims.ready('DOM es5', function(){
				start();
			});
			
		});
	
	
})(jQuery);
