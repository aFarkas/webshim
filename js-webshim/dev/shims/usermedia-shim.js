webshim.register('usermedia-shim', function($, webshim, window, document, undefined, options){
	"use strict";
	var streamUrlPrefix = 'webshimstream';
	var id = 0;
	var streams = {};
	var hasSwf = swfmini.hasFlashPlayerVersion('11.3');
	var mediaOptions = webshim.cfg.mediaelement;
	var mediaelement = webshim.mediaelement;
	var flashEvents = {
		NOT_SUPPORTED_ERROR: 1,
		PERMISSION_DENIED: 1,
		//not implemented yet
		MANDATORY_UNSATISFIED_ERROR: 1,
		onUserSuccess: 1
	};

	function wsGetUserMedia(constraints, successCb, failCb){
		if(hasSwf){
			if(!successCb){return;}
			if(!webshim.mediaelement.createSWF){
				webshim.loader.loadList(['swfmini-embed']);
				webshim.mediaelement.loadSwf = true;
				webshim.reTest(['mediaelement-jaris'], true);
				webshim.ready('mediaelement-jaris', function(){
					createMediaRequest(constraints, successCb, failCb);
				});
			} else {
				createMediaRequest(constraints, successCb, failCb);
			}


		} else if(failCb) {
			failCb({name: 'NOT_SUPPORTED_ERROR'});
		}
	}

	function createMediaRequest(constraints, successCb, failCb){
		var elemId, $dom;
		var vars = $.extend({}, mediaOptions.vars);
		var params = $.extend({}, mediaOptions.params);
		var attrs = $.extend({}, mediaOptions.attrs);

		id++;
		elemId = streamUrlPrefix+id;
		attrs.id = elemId;
		attrs.name = elemId;

		$.extend(vars, {id: elemId, evtId: elemId, controls: 'false', autostart: 'false', streamtype: 'usermedia', video: !!constraints.video, audio: !!constraints.audio});

		$dom = $('<div class="ws-mediastreamrequest-overlay"><div id="'+ elemId +'"></div></div>').appendTo('body');

		mediaelement.jarisEvent[elemId] = function(e){

			if(!flashEvents[e.type]){return;}

			if(e.type == 'NOT_SUPPORTED_ERROR'){
				failCb({name: 'NOT_SUPPORTED_ERROR'});
				$dom.remove();
			} else if(e.type == 'PERMISSION_DENIED'){
				failCb({name: 'PERMISSION_DENIED'});
				$dom.remove();
			} else if(e.type == 'MANDATORY_UNSATISFIED_ERROR'){
				failCb({name: 'MANDATORY_UNSATISFIED_ERROR'});
				$dom.remove();
			} else {
				$dom.addClass('hide-streamrequest');
				successCb(new LocalMediaStream($dom, elemId, e));
			}
		};
		swfmini.embedSWF(mediaOptions.playerPath, elemId, "100%", "100%", "11.3", false, vars, params, attrs, function(swfData){

		});
	}


	function LocalMediaStream($dom, id, jarisData){
		webshim.defineProperties(this, {
			_swf: {
				value: $dom.find('object')[0],
				enumerable: false
			},
			_id: {
				value: id,
				enumerable: false
			},
			_wsStreamId: {
				value: 'webshimstream:'+id,
				enumerable: false
			}
		});
	}

	LocalMediaStream.prototype = {
		currentTime: 0,
		stop: $.noop,
		getAudioTracks: $.noop,
		getVideoTracks: $.noop
	};

	URL._nativeCreateObjectURL = URL.createObjectURL;
	URL._nativeRevokeObjectURL = URL.revokeObjectURL;

	URL.createObjectURL = function(stream){

		var url = '';
		if(URL._nativeCreateObjectURL && !stream._wsStreamId){
			url = URL._nativeCreateObjectURL(stream);
		} else if(stream._wsStreamId) {
			url = stream._wsStreamId;
			streams[url] = stream;
		}
		return url;
	};

	URL.revokeObjectURL = function(url){
		if(streams[url]){
			delete streams[url];
		}
		if(URL._nativeRevokeObjectURL){
			return URL._nativeRevokeObjectURL(url);
		}
	};
	webshim.usermediastreams = streams;

	webshim.getUserMedia = wsGetUserMedia;
	navigator.wsGetUserMedia = wsGetUserMedia;
});
