/**
 * ...
 * @author alexander farkas
 */
import flash.external.ExternalInterface;

class Main 
{
	
	public static function main(swfRoot:MovieClip):Void 
	{
		var storage:SharedObject = SharedObject.getLocal('domStorage');
		
		ExternalInterface.addCallback('getItem', null, function(name) {
			var val = storage.data[name];
			return (typeof val == 'string') ? val || '' : null;
		});
		
		ExternalInterface.addCallback('removeItem', null, function(name) {
			delete storage.data[name];
		});
		
		ExternalInterface.addCallback('setItem', null, function(name, val) {
			storage.data[name] = '' + val;
			storage.flush();
		});
		
		ExternalInterface.addCallback('clear', null, function() {
			storage.clear();
		});
		
		ExternalInterface.addCallback('key', null, function(i) {
			var ctr = 0;
			for (var k in storage.data) {
				if (ctr == i) {
					return k;
				} else {
					ctr++;
				}
			}
			return null;
		});
		ExternalInterface.call('jQuery.webshims.localStorageSwfCallback', 'swf'); 
	}
		
}