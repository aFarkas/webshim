/*
 * todos: 
 * - shadowdom switch
 * - flashblocker detect
 * - decouple muted/volume
 * - improve buffered-property with youtube/rtmp
 * - get buffer-full event
 * - set preload to none, if flash is active
 * - handle flashresize -> auto
 */

jQuery.webshims.register('mediaelement-swf', function($, webshims, window, document, undefined, options){
	"use strict";
	var mediaelement = webshims.mediaelement;
	var swfobject = window.swfobject;
	var hasNative = Modernizr.audio && Modernizr.video;
	var hasFlash = swfobject.hasFlashPlayerVersion('9.0.115');
	var loadedSwf;
	var getProps = {
		paused: true,
		ended: false,
		currentSrc: '',
		duration: window.NaN,
		
		readyState: 0,
		networkState: 0,
		videoHeight: 0,
		videoWidth: 0,
		error: null,
		buffered: undefined
	};
	var getPropKeys = Object.keys(getProps);
	
	var getSetProps = {
		currentTime: 0,
		volume: 1,
		muted: false
	};
	var getSetPropKeys = Object.keys(getSetProps);
	
	var playerStateObj = $.extend({
		isActive: 'html5',
		activating: 'html5',	
		wasSwfReady: false,
		_bufferedEnd: 0,
		_bufferedStart: 0,
		_metadata: false,
		currentTime: 0,
		_ppFlag: undefined
	}, getProps, getSetProps);
	
	var idRep = /^jwplayer-/;
	var getSwfDataFromID = function(id){
		
		var elem = document.getElementById(id.replace(idRep, ''));
		if(!elem){return;}
		var data = webshims.data(elem, 'mediaelement');
		return data.isActive == 'flash' ? data : null;
	};
	
	var getSwfDataFromElem = function(elem){
		try {
			(elem.nodeName);
		} catch(er){
			return null;
		}
		var data = webshims.data(elem, 'mediaelement');
		return (data && data.isActive== 'flash') ? data : null;
	};
	
	var trigger = function(elem, evt){
		evt = $.Event(evt);
		evt.preventDefault();
		$.event.trigger(evt, undefined, elem);
	};
	var stopMutedAnnounce;
	var jwplugin = webshims.cfg.basePath +'swf/jwwebshims.swf';
	var playerSwfPath = webshims.cfg.basePath + "jwplayer/player.swf";
	if(hasFlash){
		webshims.ready('WINDOWLOAD', function(){
			if(!loadedSwf){
				$.ajax(jwplugin, webshims.xhrPreloadOption);
			}
		});
	}
	webshims.extendUNDEFProp(options.jwParams, {
		allowscriptaccess: 'always',
		allowfullscreen: 'true',
		wmode: 'transparent'
	});
	webshims.extendUNDEFProp(options.jwVars, {
		screencolor: 'ffffffff',
		controlbar: 'over'
	});
	webshims.extendUNDEFProp(options.jwAttrs, {
		bgcolor: '#000000'
	});
	
	
	mediaelement.jwEvents = {
		View: {
			
			PLAY: function(obj){
				var data = getSwfDataFromID(obj.id);
				if(!data || data.stopPlayPause){return;}
				data._ppFlag = true;
				if(data.paused == obj.state){
					data.paused = !obj.state;
					if(data.ended){
						data.ended = false;
					}
					trigger(data._elem, obj.state ? 'play' : 'pause');
				}
			}
		},
		Model: {
			
			BUFFER: function(obj){
				var data = getSwfDataFromID(obj.id);
				if(!data){return;}
				if(data._bufferEnd == obj.percentage){return;}
				data.networkState = (obj.percentage == 100) ? 1 : 2;
				if(!data.duration){
					try {
						data.duration = data.jwapi.getPlaylist()[0].duration;
						if(data.duration <= 0){
							data.duration = window.NaN;
						}
					} catch(er){}
					if(data.duration){
						trigger(data._elem, 'durationchange');
						if(data._elemNodeName == 'audio'){
							this.META($.extend({duration: data.duration}, obj), data);
						}
					}
				}
				if(data.ended){
					data.ended = false;
				}
				if(!data.duration){
					return;
				}
				
				if(obj.percentage > 1 && data.readyState < 3){
					data.readyState = 3;
					trigger(data._elem, 'canplay');
				}
				if(data._bufferedEnd && (data._bufferedEnd > obj.percentage)){
					data._bufferedStart = data.currentTime || 0;
				}
				data._bufferedEnd = obj.percentage;
				data.buffered.length = 1;
				if(obj.percentage == 100){
					data.networkState = 1;
					data.readyState = 4;
				}
				$.event.trigger('progress', undefined, data._elem, true);
			},
			META: function(obj, data){
				
				if( !('duration' in obj) && !('youtubequalitylevels' in obj) ){return;}
				
				data = data && data.networkState ? data : getSwfDataFromID(obj.id);
				
				if(!data || data._metadata ){return;}
				data._metadata = true;
				if(data.duration && !('duration' in obj) && ('youtubequalitylevels' in obj) ){
					trigger(data._elem, 'loadedmetadata');
					return;
				}
				
				var oldDur = data.duration;
				data.duration = obj.duration;
				data.videoHeight = obj.height || 0;
				data.videoWidth = obj.width || 0;
				if(!data.networkState){
					data.networkState = 2;
				}
				if(data.readyState < 1){
					data.readyState = 1;
				}
				if(oldDur !== data.duration){
					trigger(data._elem, 'durationchange');
				}
				
				trigger(data._elem, 'loadedmetadata');
			},
			TIME: function(obj){
				var data = getSwfDataFromID(obj.id);
				if(!data || data.currentTime === obj.position){return;}
				data.currentTime = obj.position;
				if(data.readyState < 2){
					data.readyState = 2;
				}
				if(data.ended){
					data.ended = false;
				}
				trigger(data._elem, 'timeupdate');
				
			},
			STATE: function(obj){
				var data = getSwfDataFromID(obj.id);
				if(!data){return;}
				switch(obj.newstate) {
					case 'BUFFERING':
						if(data.readyState > 1){
							data.readyState = 1;
						}
						if(data.ended){
							data.ended = false;
						}
						trigger(data._elem, 'waiting');
						break;
					case 'PLAYING':
						data.paused = false;
						data._ppFlag = true;
						if(data.readyState < 3){
							data.readyState = 3;
							trigger(data._elem, 'canplay');
						}
						if(data.ended){
							data.ended = false;
						}
						trigger(data._elem, 'playing');
						break;
					case 'PAUSED':
						if(!data.paused && !data.stopPlayPause){
							data.paused = true;
							data._ppFlag = true;
							trigger(data._elem, 'pause');
						}
						break;
					case 'COMPLETED':
						if(data.readyState < 4){
							data.readyState = 4;
						}
						data.ended = true;
						trigger(data._elem, 'ended');
						break;
				}
			}
		}
		,Controller: {
			
			ERROR: function(obj){
				var data = getSwfDataFromID(obj.id);
				if(!data){return;}
				mediaelement.setError(data._elem, obj.message);
			},
			SEEK: function(obj){
				var data = getSwfDataFromID(obj.id);
				if(!data){return;}
				if(data.ended){
					data.ended = false;
				}
				if(data.paused){
					try {
						data.jwapi.sendEvent('play', 'false');
					} catch(er){}
				}
				if(data.currentTime != obj.position){
					data.currentTime = obj.position;
					trigger(data._elem, 'timeupdate');
				}
				
				
			},
			VOLUME: function(obj){
				var data = getSwfDataFromID(obj.id);
				if(!data){return;}
				var newVolume = obj.percentage / 100;
				if(data.volume == newVolume){return;}
				data.volume = newVolume;
				trigger(data._elem, 'volumechange');
			},
			MUTE: function(obj){
				if(stopMutedAnnounce && obj.state){return;}
				var data = getSwfDataFromID(obj.id);
				if(!data){return;}
				if(data.muted == obj.state){return;}
				data.muted = obj.state;
				trigger(data._elem, 'volumechange');
			}
		}
	};
	
	var initEvents = function(data){
		$.each(mediaelement.jwEvents, function(mvcName, evts){
			$.each(evts, function(evtName){
				data.jwapi['add'+ mvcName +'Listener'](evtName, 'jQuery.webshims.mediaelement.jwEvents.'+ mvcName +'.'+ evtName);
			});
		});
	};
	
	var workActionQueue = function(data){
		var actionLen = data.actionQueue.length;
		var i = 0;
		var operation;
		if(actionLen && data.isActive == 'flash'){
			while(data.actionQueue.length && actionLen > i){
				i++;
				operation = data.actionQueue.shift();
				data.jwapi[operation.fn].apply(data.jwapi, operation.args);
			}
		}
		if(data.actionQueue.length){
			data.actionQueue = [];
		}
	};
	var startAutoPlay = function(data){
		if(!data){return;}
		if( (data._ppFlag === undefined && ($.prop(data._elem, 'autoplay')) || !data.paused)){
			setTimeout(function(){
				if(data.isActive == 'flash' && (data._ppFlag === undefined || !data.paused)){
					try {
						$(data._elem).play();
					} catch(er){}
				}
			}, 1);
		}
	};
	
	var startIntrinsicDimension = function(data){
		if(!data || data._elemNodeName != 'video'){return;}
		var img;
		var widthAuto;
		var heightAuto;
		var shadowElem;
		var errorTimer;
		var lastresize;
		var blockResize;
		var setSize = function(width, height){
			if(!height || !width || height < 1 || width < 1 || data.isActive != 'flash'){return;}
			if(img){
				img.remove();
				img = false;
			}
			clearTimeout(errorTimer);
			widthAuto = data._elem.style.width == 'auto';
			heightAuto = data._elem.style.height == 'auto';
			
			if(!widthAuto && !heightAuto){return;}
			var curResize = widthAuto + heightAuto + width + height;
			if(curResize === lastresize){return;}
			lastresize = curResize;
			shadowElem = shadowElem || $(data._elem).getShadowElement();
			var cur;
			if(widthAuto && !heightAuto){
				cur = $(data._elem).height();
				width *=  cur / height;
				height = cur;
			} else if(!widthAuto && heightAuto){
				cur = $(data._elem).width();
				height *=  cur / width;
				width = cur;
			}
			blockResize = true;
			setTimeout(function(){
				blockResize = false;
			}, 30);
			shadowElem.css({width: width, height: height});
		};
		var setPosterSrc = function(){
			if(data.isActive != 'flash' || ($.prop(data._elem, 'readyState') && $.prop(this, 'videoWidth'))){return;}
			var posterSrc = $.prop(data._elem, 'poster');
			if(!posterSrc){return;}
			widthAuto = data._elem.style.width == 'auto';
			heightAuto = data._elem.style.height == 'auto';
			if(!widthAuto && !heightAuto){return;}
			if(img){
				img.remove();
				img = false;
			}
			img = $('<img style="position: absolute; height: auto; width: auto; top: 0px; left: 0px; visibility: hidden;" />');
			img
				.bind('load error alreadycomplete', function(e){
					clearTimeout(errorTimer);
					
					var elem = this;
					var width = elem.naturalWidth || elem.width || elem.offsetWidth;
					var height = elem.naturalHeight || elem.height || elem.offsetHeight;
					
					if(height && width){
						setSize(width, height);
						elem = null;
					} else {
						setTimeout(function(){
							width = elem.naturalWidth || elem.width || elem.offsetWidth;
							height = elem.naturalHeight || elem.height || elem.offsetHeight;
							setSize(width, height);
							if(img){
								img.remove();
								img = false;
							}
							elem = null;
						}, 9);
					}
					$(this).unbind();
				})
				.prop('src', posterSrc)
				.appendTo('body')
				.each(function(){
					if(this.complete || this.error){
						$(this).triggerHandler('alreadycomplete');
					} else {
						clearTimeout(errorTimer);
						errorTimer = setTimeout(function(){
							$(data._elem).triggerHandler('error');
						}, 9999);
					}
				})
			;
		};
		$(data._elem)
			.bind('loadedmetadata swfstageresize', function(){
				setSize($.prop(this, 'videoWidth'), $.prop(this, 'videoHeight'));
			})
			.bind('emptied', setPosterSrc)
			.bind('swfstageresize', function(){
				if(blockResize){return;}
				setPosterSrc();
				if($.prop(data._elem, 'readyState')){
					setSize($.prop(this, 'videoWidth'), $.prop(this, 'videoHeight'));
				}
			})
			.triggerHandler('swfstageresize')
		;
	};
	
	
	$(document).bind('emptied', function(e){
		var data = getSwfDataFromElem(e.target);
		startAutoPlay(data);
	});
	
	var localConnectionTimer;
	mediaelement.jwPlayerReady = function(jwData){
		var data = getSwfDataFromID(jwData.id);
		if(!data || !data.jwapi){return;}
		clearTimeout(localConnectionTimer);
		data.jwData = jwData;
		if(!data.wasSwfReady){
			var version = parseFloat( jwData.version, 10);
			if(version < 5.6 || version >= 6){
				webshims.warn('mediaelement-swf is only testet with jwplayer 5.6+');
			}
			$.prop(data._elem, 'volume', data.volume);
			$.prop(data._elem, 'muted', data.muted);
			initEvents(data);
			
		} else {
			workActionQueue(data);
		}
		data.wasSwfReady = true;
		startAutoPlay(data);
	};
	
	var addMediaToStopEvents = $.noop;
	if(hasNative){
		var stopEvents = {
			play: 1,
			playing: 1
		};
		var hidevents = ['play', 'pause', 'playing', 'canplay', 'progress', 'waiting', 'ended', 'loadedmetadata', 'durationchange', 'emptied'].map(function(evt){
			return evt +'.webshimspolyfill';
		}).join(' ');
		
		var hidePlayerEvents = function(event){
			var data = webshims.data(event.target, 'mediaelement');
			if(!data){return;}
			var isNativeHTML5 = ( event.originalEvent && event.originalEvent.type === event.type );
			if( isNativeHTML5 == (data.activating == 'flash') ){
				event.stopImmediatePropagation();
				if(stopEvents[event.type] && data.isActive != data.activating){
					$(event.target).pause();
				}
			}
		};
		$(document).bind(hidevents, hidePlayerEvents);
		addMediaToStopEvents = function(elem){
			$(elem)
				.unbind(hidevents)
				.bind(hidevents, hidePlayerEvents)
			;
		};
	}
	
	
	mediaelement.setActive = function(elem, type, data){
		if(!data){
			data = webshims.data(elem, 'mediaelement');
		}
		if(!data || data.isActive == type){return;}
		if(type != 'html5' && type != 'flash'){
			webshims.warn('wrong type for mediaelement activating: '+ type);
		}
		data.activating = type;
		$(elem).pause();
		data.isActive = type;
		if(type == 'flash'){
			$(elem).hide().getShadowElement().show();
		} else {
			$(elem).show().getShadowElement().hide();
		}
		
	};
	
	
	
	var resetSwfProps = (function(){
		var resetProtoProps = ['_bufferedEnd', '_bufferedStart', '_metadata', '_ppFlag', 'currentSrc', 'currentTime', 'duration', 'ended', 'networkState', 'paused', 'videoHeight', 'videoWidth'];
		var len = resetProtoProps.length;
		return function(data){
			
			if(!data){return;}
			var lenI = len;
			var networkState = data.networkState;
			while(--lenI){
				delete data[resetProtoProps[lenI]];
			}
			data.actionQueue = [];
			data.buffered.length = 0;
			if(networkState){
				trigger(data._elem, 'emptied');
			}
		};
	})();
	
	mediaelement.createSWF = function( elem, canPlaySrc, data ){
		if(!hasFlash){
			setTimeout(function(){
				$(elem).mediaLoad(); //<- this should produce a mediaerror
			}, 1);
			return;
		}
		loadedSwf = true;
		var vars = $.extend({}, options.jwVars, {
				image: $.prop(elem, 'poster') || '',
				file: canPlaySrc.srcProp
		});
		var elemVars = $(elem).data('jwvars') || {};
		
		if(data && data.swfCreated){
			mediaelement.setActive(elem, 'flash', data);
			resetSwfProps(data);
			data.currentSrc = canPlaySrc.srcProp;
			$.extend(vars, elemVars);
			options.changeJW(vars, elem, canPlaySrc, data, 'load');
			queueSwfMethod(elem, 'sendEvent', ['LOAD', vars]);
			
			return;
		}
		
		
		var hasControls = $.prop(elem, 'controls');
		var elemId = 'jwplayer-'+ webshims.getID(elem);
		
		
		var params = $.extend(
			{},
			options.jwParams,
			$(elem).data('jwparams')
		);
		var elemNodeName = elem.nodeName.toLowerCase();
		var attrs = $.extend(
			{},
			options.jwAttrs,
			{
				name: elemId,
				id: elemId
			},
			$(elem).data('jwattrs')
		);
		var box = $('<div class="polyfill-'+ (elemNodeName) +'" id="wrapper-'+ elemId +'"><div id="'+ elemId +'"></div>')
			.css({
				width: elem.style.width || $(elem).width(),
				height: elem.style.height || $(elem).height(),
				position: 'relative'
			})
			.insertBefore(elem)
		;
		
		data = webshims.data(elem, 'mediaelement', webshims.objectCreate(playerStateObj, {
			actionQueue: {
				value: []
			},
			_elemNodeName: {
				value: elemNodeName
			},
			_elem: {
				value: elem
			},
			currentSrc: {
				value: canPlaySrc.srcProp
			},
			swfCreated: {
				value: true
			},
			buffered: {
				value: {
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
					return ( (data.duration - data._bufferedStart) * data._bufferedEnd / 100) + data._bufferedStart;
				},
				length: 0
			}
			}
		}));
		
		if(hasNative){
			$.extend(data, {volume: $.prop(elem, 'volume'), muted: $.prop(elem, 'muted')});
		}
		
		$.extend(vars, 
			{
				id: elemId,
				controlbar: hasControls ? options.jwVars.controlbar || 'over' : 'none',
				icons: ''+hasControls
			},
			elemVars,
			{playerready: 'jQuery.webshims.mediaelement.jwPlayerReady'}
		);
		if(vars.plugins){
			vars.plugins += ','+jwplugin;
		} else {
			vars.plugins = jwplugin;
		}
		
		
		webshims.addShadowDom(elem, box);
		addMediaToStopEvents(elem);
		mediaelement.setActive(elem, 'flash', data);
		options.changeJW(vars, elem, canPlaySrc, data, 'embed');
		startIntrinsicDimension(data);
		swfobject.embedSWF(playerSwfPath, elemId, "100%", "100%", "9.0.0", false, vars, params, attrs, function(swfData){
			if(swfData.success){
				data.jwapi = swfData.ref;
				if(!hasControls){
					$(swfData.ref).attr('tabindex', '-1').css('outline', 'none');
				}
				if(!localConnectionTimer){
					clearTimeout(localConnectionTimer);
					localConnectionTimer = setTimeout(function(){
						var elem = $(swfData.ref);
						if(elem[0].offsetWidth > 1 && elem[0].offsetHeight > 1 && location.protocol.indexOf('file:') === 0){
							webshims.warn("Add your local development-directory to the local-trusted security sandbox:  http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html");
						} else if(elem[0].offsetWidth < 2 || elem[0].offsetHeight < 2) {
							webshims.info("JS-SWF connection can't be established on hidden or unconnected flash objects");
						}
						elem = null;
					}, 8000);
				}
			}
		});
	};
	
	var SENDEVENT = 'sendEvent';
	var queueSwfMethod = function(elem, fn, args, data){
		data = data || getSwfDataFromElem(elem);
		if(data){
			if(data.jwapi && data.jwapi[fn]){
				data.jwapi[fn].apply(data.jwapi, args || []);
			} else {
				//todo add to queue
				data.actionQueue.push({fn: fn, args: args});
				if(data.actionQueue.length > 10){
					setTimeout(function(){
						if(data.actionQueue.length > 5){
							data.actionQueue.shift();
						}
					}, 99);
				}
			}
			return data;
		}
		return false;
	};
	
	['audio', 'video'].forEach(function(nodeName){
		var descs = {};
		var mediaSup;
		var createGetProp = function(key){
			if(nodeName == 'audio' && (key == 'videoHeight' || key == 'videoWidth')){return;}
			descs[key] = {
				get: function(){
					var data = getSwfDataFromElem(this);
					if(data){
						return data[key];
					} else if(mediaSup[key].prop._supget) {
						return mediaSup[key].prop._supget.apply(this);
					}
				},
				writeable: false
			};
		};
		var createGetSetProp = function(key, setFn){
			createGetProp(key);
			delete descs[key].writeable;
			descs[key].set = setFn;
		};
		
		createGetSetProp('volume', function(v){
			var data = getSwfDataFromElem(this);
			if(data){
				v *= 100;
				if(!isNaN(v)){
					if(v < 0 || v > 100){
						webshims.error('volume greater or less than allowed '+ (v / 100));
					}
					if(data.muted){
						stopMutedAnnounce = true;
					}
					queueSwfMethod(this, SENDEVENT, ['VOLUME', v], data);
					if(stopMutedAnnounce){
						try {
							data.jwapi.sendEvent('mute', 'true');
						} catch(er){}
						stopMutedAnnounce = false;
					}
					setTimeout(function(){
						if(data.volume == v || data.isActive != 'flash'){return;}
						data.volume = v;
						trigger(data._elem, 'volumechange');
						data = null;
					}, 1);	
				} 
			} else if(mediaSup.volume.prop._supset) {
				return mediaSup.volume.prop._supset.apply(this, arguments);
			}
		});
		
		createGetSetProp('muted', function(m){
			var data = getSwfDataFromElem(this);
			if(data){
				m = !!m;
				queueSwfMethod(this, SENDEVENT, ['mute', ''+m], data);
				setTimeout(function(){
					if(data.muted == m || data.isActive != 'flash'){return;}
					data.muted = m;
					trigger(data._elem, 'volumechange');
					data = null;
				}, 1); 
			} else if(mediaSup.muted.prop._supset) {
				return mediaSup.muted.prop._supset.apply(this, arguments);
			}
		});
		
		
		createGetSetProp('currentTime', function(t){
			var data = getSwfDataFromElem(this);
			if(data){
				t *= 1;
				if (!isNaN(t)) {
					if(data.paused){
						clearTimeout(data.stopPlayPause);
						data.stopPlayPause = setTimeout(function(){
							data.paused = true;
							data.stopPlayPause = false;
						}, 50);
					}
					queueSwfMethod(this, SENDEVENT, ['SEEK', '' + t], data);
					
					if(data.paused){
						if(data.readyState > 0){
							data.currentTime = t;
							trigger(data._elem, 'timeupdate');
						}
						try {
							data.jwapi.sendEvent('play', 'false');
						} catch(er){}
						
					}
				}
				 
			} else if(mediaSup.currentTime.prop._supset) {
				return mediaSup.currentTime.prop._supset.apply(this, arguments);
			}
		});
		
		['play', 'pause'].forEach(function(fn){
			descs[fn] = {
				value: function(){
					var data = getSwfDataFromElem(this);
					if(data){
						if(data.stopPlayPause){
							clearTimeout(data.stopPlayPause);
						}
						queueSwfMethod(this, SENDEVENT, ['play', fn == 'play'], data);
						setTimeout(function(){
							if(data.isActive == 'flash'){
								data._ppFlag = true;
								if(data.paused != (fn != 'play')){
									data.paused = fn != 'play';
									trigger(data._elem, fn);
								}
							}
						}, 1);
					} else if(mediaSup[fn].prop._supvalue) {
						return mediaSup[fn].prop._supvalue.apply(this, arguments);
					}
				}
			};
		});
		
		getPropKeys.forEach(createGetProp);
		
		webshims.onNodeNamesPropertyModify(nodeName, 'controls', function(val, boolProp){
			var data = queueSwfMethod(this, boolProp ? 'showControls' : 'hideControls');
			if(data){
				$(data.jwapi).attr('tabindex', boolProp ? '0' : '-1');
			}
		});
		
		mediaSup = webshims.defineNodeNameProperties(nodeName, descs, 'prop');
	});
	
	
});