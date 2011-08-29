jQuery.webshims.ready('dom-support', function($, webshims, window, document, undefined){
	if(Modernizr.videoBuffered){return;}
	
	var getBufferedData = function(elem){
		var data = webshims.data(elem, 'mediaelementBuffered');
		if(!data){
			data = {
				buffered: {
					start: function(index){
						if(index >= data.buffered.length){
							webshims.error('buffered index size error');
							return;
						}
						return 0;
					},
					end: function(index){
						if(index >= data.buffered.length){
							webshims.error('buffered index size error');
							return;
						}
						return data.loaded;
					},
					length: 0
				},
				loaded: 0
			};
			webshims.data(elem, 'mediaelementBuffered', data);
		}
		return data;
	};
	
	var loadProgessListener = function(e){
		e = e.originalEvent;
		if(!e || !('lengthComputable' in e)){return;}
		var data = webshims.data(e.target, 'mediaelement');
		if(data && data.isActive != 'html5'){return;}
		if(e.lengthComputable && 'loaded' in e){
			var duration = e.target.duration;
			var bufferedData = getBufferedData(e.target);
			bufferedData.loaded = (duration) ? e.loaded / e.total * duration : 0;
			if(bufferedData.loaded){
				bufferedData.buffered.length = 1;
			}
			if(e.type == 'load'){
				$(e.target).triggerHandler('progress');
			}
		}
	};
	var removeProgress = function(e){
		
		data = getBufferedData(e.target);
		data.buffered.length = 0;
		data.loaded = 0;
	};
	
	['audio', 'video'].forEach(function(nodeName){
		var sup = webshims.defineNodeNameProperty(nodeName, 'buffered',  {
			prop: {
				get: function(){
					var data = webshims.data(this, 'mediaelement');
					
					if(data && data.isActive == 'flash' && sup.prop._supget){
						sup.prop._supget.apply(this);
					} else {
						return getBufferedData(this).buffered;
					}
				}
			}
		});
	});
	
//	webshims.defineNodeNamesProperty(['audio', 'video'], 'buffered', {
//		prop: {
//			get: function(){
//				
//			}
//		}
//	});
	
	webshims.addReady(function(context, insertedElement){
		$('video, audio', context)
			.add(insertedElement.filter('video, audio'))
			.bind('load progress', loadProgessListener)
			.bind('emptied', removeProgress)
		;
	 });

});