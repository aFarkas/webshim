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
		var swfIsVissible:Boolean = false;
				
		storage.onStatus = function(infoObject:Object) {
			if(swfIsVissible){
				swfIsVissible = false;
				ExternalInterface.call('jQuery.webshims.swfLocalStorage.hide', infoObject.code == "SharedObject.Flush.Success"); 
			}
		};

		
		ExternalInterface.addCallback('getItem', null, function(name) {
			var val = storage.data[name];
			return (typeof val == 'undefined') ? null  : val || '';
		});
		
		ExternalInterface.addCallback('removeItem', null, function(name) {
			delete storage.data[name];
		});
		
		ExternalInterface.addCallback('setItem', null, function(name, val) { 
			var flushStatus = '';
			storage.data[name] = '' + val;
			flushStatus = storage.flush();
			
            if (flushStatus == 'pending') {
				if(!swfIsVissible){
					swfIsVissible = true;
					ExternalInterface.call('jQuery.webshims.swfLocalStorage.show');
				}
            }

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