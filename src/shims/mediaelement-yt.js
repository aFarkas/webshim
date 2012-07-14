jQuery.webshims.register('mediaelement-yt', function($, webshims, window, document, undefined, options){
"use strict";
var mediaelement = webshims.mediaelement;
var ytAPI = jQuery.Deferred();
window.onYouTubePlayerAPIReady = function() {
	ytAPI.resolve();
};
if(window.YT && YT.Player){
	window.onYouTubePlayerAPIReady();
}

var playerStateObj = {
	isActive: 'html5',
	activating: 'html5',
	_metadata: false,
	duration: NaN
};

var setElementDimension = function(data){
	var elem = data._elem;
	var box = data.shadowElem;
	box.css({
		width: elem.style.width || $(elem).width(),
		height: elem.style.height || $(elem).height()
	});
};

var getYtDataFromElem = function(elem){
	try {
		(elem.nodeName);
	} catch(er){
		return null;
	}
	var data = webshims.data(elem, 'mediaelement');
	return (data && data.isActive== 'third') ? data : null;
};

var getYtId = function(src){
	src = src.split('?');
	if(src[1]){
		src = src[1].split('&');
		$.each(src, function(i, name){
			name = name.split('=');
			if(name[0] == 'v'){
				src = name[1];
				return false;
			}
		});
	}
	return src;
};

var addMediaToStopEvents = $.noop;
(function(){
	var stopEvents = {
		play: 1,
		playing: 1
	};
	var hideEvtArray = ['play', 'pause', 'playing', 'canplay', 'progress', 'waiting', 'ended', 'loadedmetadata', 'durationchange', 'emptied'];
	var hidevents = hideEvtArray.map(function(evt){
		return evt +'.webshimspolyfill';
	}).join(' ');
	
	var hidePlayerEvents = function(event){
		var data = webshims.data(event.target, 'mediaelement');
		if(!data){return;}
		var isNativeHTML5 = ( event.originalEvent && event.originalEvent.type === event.type );
		if( isNativeHTML5 == (data.activating == 'third') ){
			event.stopImmediatePropagation();
			if(stopEvents[event.type] && data.isActive != data.activating){
				$(event.target).pause();
			}
		}
	};
	
	addMediaToStopEvents = function(elem){
		$(elem)
			.unbind(hidevents)
			.bind(hidevents, hidePlayerEvents)
		;
		hideEvtArray.forEach(function(evt){
			webshims.moveToFirstEvent(elem, evt);
		});
	};
	addMediaToStopEvents(document);
})();
	
	
	
mediaelement.setActive = function(elem, type, data){
	if(!data){
		data = webshims.data(elem, 'mediaelement');
	}
	if(!data || data.isActive == type){return;}
	if(type != 'html5' && type != 'third'){
		webshims.warn('wrong type for mediaelement activating: '+ type);
	}
	var shadowData = webshims.data(elem, 'shadowData');
	data.activating = type;
	$(elem).pause();
	data.isActive = type;
	if(type == 'third'){
		shadowData.shadowElement = shadowData.shadowFocusElement = data.shadowElem[0];
		$(elem).hide().getShadowElement().show();
	} else {
		$(elem).show().getShadowElement().hide();
		shadowData.shadowElement = shadowData.shadowFocusElement = false;
	}
	
};
//unstarted (-1), ended (0), playing (1), paused (2), buffering
var states = {
	'-1': 'unstarted',
	'0': 'ended',
	'1': 'playing',
	'2': 'paused',
	'3': 'buffering'
};
var addYtAPI = function(mediaElm, elemId, data, ytID){
	ytAPI.done(function(){
		data._ytAPI = new YT.Player(elemId, {
			height: '100%',
			width: '100%',
			playerVars: {
				allowfullscreen: true,
				fs: 1,
				rel: 0,
				showinfo: 0,
				autohide: 1,
				controls: $.prop(mediaElm, 'controls') ? 1:0
			},
			
			videoId: ytID,
			events: {
				'onReady': function(e){
					
				},
				'onStateChange': function(e){
					if(!data._metadata){
						var duration = data._ytAPI.getDuration();
						if(duration){
							data._metadata = true;
							$(mediaElm)
								.trigger('durationchange')
								.trigger('loadedmetadata')
							;
							
						}
					}
					console.log(arguments, this, 'state', e.data, states[e.data])
					console.log(e.target.getDuration())
				}
			}
		});
	});
};

mediaelement.createSWF = function(mediaElem, src, data){
	if(!data){
		data = webshims.data(mediaElem, 'mediaelement');
	}
	if(data){
		console.log('already created');
		return;
	}
	var hasControls = $.prop(mediaElem, 'controls');
	var elemId = 'yt-'+ webshims.getID(mediaElem);
	var box = $('<div class="polyfill-video polyfill-mediaelement" id="wrapper-'+ elemId +'"><div id="'+ elemId +'"></div>')
		.css({
			position: 'relative',
			overflow: 'hidden'
		})
	;
	
	var ytID = getYtId(src.src);
	
	data = webshims.data(mediaElem, 'mediaelement', webshims.objectCreate(playerStateObj, {
		shadowElem: {
			value: box
		},
		_elem: {
			value: mediaElem
		}
	}));
	setElementDimension(data);
	box.insertBefore(mediaElem);
	
	webshims.addShadowDom(mediaElem, box);
	mediaelement.setActive(mediaElem, 'third', data);
	addMediaToStopEvents(mediaElem);
	
	addYtAPI(mediaElem, elemId, data, ytID);
};

$.each(['play', 'pause'], function(i, name){
	var ytName = name+'Video';
	var sup = webshims.defineNodeNameProperty('video', name, { 
		prop: { 
			value: function(){
				var data = getYtDataFromElem(this);
				if(data){
					if(data._ytAPI){
						data._ytAPI[ytName]();
					}
				} else {
					return sup.prop._supvalue.apply(this, arguments);
				}
			} 
		} 
	});
});



});
