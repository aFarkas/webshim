webshim.register('usermedia-shim', function($, webshim, window, document, undefined, options){
	"use strict";
	var addMediaAPI;
	var id = 0;
	var streams = {};
	var streamCb = {};
	var hasSwf = swfmini.hasFlashPlayerVersion('11.3');
	var mediaelement = webshim.mediaelement;
	var flashEvents = {
		NotSupportedError: 1,
		PermissionDeniedError: 1,
		//not implemented yet
		ConstraintNotSatisfiedError: 1,
		onUserSuccess: 1
	};
	var noSource = function(){
		return !$.prop(this, 'currentSrc') && !mediaelement.srces(this).length;
	};

	function wsGetUserMedia(constraints, successCb, failCb){
		if(hasSwf){
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
		} else {
			failCb({name: 'NOT_SUPPORTED_ERROR'});
		}
	}

	function createMediaRequest(constraints, successCb, failCb){
		var src;
		var media = getMediaCandidate();
		if(!media){return;}

		id++;
		src = 'webshimstream:stream'+id;

		streamCb[src] = {
			src: src,
			success: successCb,
			fail: failCb
		};

		addMediaAPI();
		/*
		 { width: 650 },
		 { width: { min: 650 }},
		 { frameRate: 60 },
		 { width: { max: 800 }},
		 { facingMode: "user" }
		 */
		mediaelement.createSWF(media, {srcProp: src, streamrequest: true, type: 'jarisplayer/stream'});
	}



	function getMediaCandidate(){
		var $media = $('video');
		$media = $media.filter('.ws-usermedia');
		if(!$media.length){
			$media = $media.end();
		}
		if($media.length != 1){
			$media = $media.filter(noSource);
		}
		if($media.length != 1){
			webshim.error('for getUserMedia an empty video element has to be already in the DOM. If you provide multiple empty videos. please mark your suggested video using the "ws-usermedia" class.');
		}
		return $media[0];
	}


	function LocalMediaStream(data, api, id){
		webshim.defineProperties(this, {
			_swf: {
				value: api,
				enumerable: false
			},
			_data: {
				value: data,
				enumerable: false
			},
			_wsStreamId: {
				value: id,
				enumerable: false
			}
		});
	}



	LocalMediaStream.prototype = {
		currentTime: 0,
		stop: function(){
			mediaelement.queueSwfMethod(this._data._elem, 'api_detach', [], this._data);
		}
		/*,
		getAudioTracks: $.noop,
		getVideoTracks: $.noop
		*/
	};


	webshim.usermedia = {
		attach: function(elem, canPlaySrc, data){
			if(data._usermedia == canPlaySrc.srcProp){
				mediaelement.queueSwfMethod(data._elem, 'api_attach', [], data);
				$(data._elem).trigger('loadstart');
			} else {
				webshim.error('something went wrong');
			}
		},
		request: function(elem, canPlaySrc, data){
			data._usermedia = canPlaySrc.srcProp;
			if(!options.inline && !$(elem).hasClass('ws-inlineusermedia')){
				$(data.api).css({position: 'fixed', top: 0, left: 0, width: '100%', height: 150, zIndex: '999999'});
			} else {
				$(data.api).css({position: 'relative', zIndex: '999999'});
			}
		}
	};

	var _nativeCreateObjectURL = URL.createObjectURL;
	var _nativeRevokeObjectURL = URL.revokeObjectURL;

	URL.createObjectURL = function(stream){

		var url = stream;
		if(_nativeCreateObjectURL && !stream._wsStreamId){
			url = _nativeCreateObjectURL.apply(this, arguments);
		} else if(stream._wsStreamId) {
			url = stream._wsStreamId;
			streams[url] = stream;
		}
		return url;
	};

	URL.revokeObjectURL = function(url){
		if(streams[url]){
			delete streams[url];
		} else if (_nativeRevokeObjectURL){
			return _nativeRevokeObjectURL.apply(this, arguments);
		}
	};

	webshim.usermediastreams = streams;

	addMediaAPI = function(){
		if(!webshim.mediaelement.createSWF){return;}
		addMediaAPI = $.noop;
		var revert = function(data){
			setTimeout(function(){
				$(data.api).css({position: '', top: '', left: '', width: '', height: '', zIndex: ''});
				if($.prop(data._elem, 'controls')){
					$.prop(data._elem, 'controls', true);
				}
			}, 50);
		};
		var fail = function(jaris, data){
			revert(data);
			streamCb[data._usermedia].fail({name: jaris.type});
		};
		$.extend(mediaelement.onEvent, {
			NotSupportedError: fail,
			PermissionDeniedError: fail,
			//not implemented yet
			ConstraintNotSatisfiedError: fail,
			onUserSuccess: function(jaris, data){
				revert(data);
				streamCb[data._usermedia].success(new LocalMediaStream(data, data.api, data._usermedia));
			}
		});
	};
	webshim.ready('mediaelement-jaris', addMediaAPI);

	webshim.getUserMedia = wsGetUserMedia;
	navigator.wsGetUserMedia = wsGetUserMedia;
	webshim.isReady('usermedia-api', true);
});
