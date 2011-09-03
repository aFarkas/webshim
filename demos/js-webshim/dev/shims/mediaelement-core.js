(function($, Modernizr, webshims){
	var hasNative = Modernizr.audio && Modernizr.video;
	var supportsLoop = false;
	
	if(hasNative){
		var videoElem = document.createElement('video');
		Modernizr.videoBuffered = ('buffered' in videoElem);
		supportsLoop = ('loop' in videoElem);
		if(!Modernizr.videoBuffered){
			webshims.addPolyfill('mediaelement-native-fix', {
				feature: 'mediaelement',
				test: Modernizr.videoBuffered,
				dependencies: ['dom-support']
			});
			
			if(webshims.cfg.waitReady){
				$.readyWait++;
			}
			webshims.loader.loadScript('mediaelement-native-fix', function(){
				if(webshims.cfg.waitReady){
					$.ready(true);
				}
			});
			
			
		}
	}

$.webshims.ready('dom-support', function($, webshims, window, document, undefined){
	"use strict";
	
	var options = webshims.cfg.mediaelement;
	var mediaelement = webshims.mediaelement;
	var hasSwf = !window.swfobject || swfobject.hasFlashPlayerVersion('9.0.115');
	var loadSwf = function(){
		webshims.ready('mediaelement-swf', function(){
			if(!mediaelement.createSWF){
				//reset readyness (hacky way)
				webshims.modules["mediaelement-swf"].test = false;
				delete $.event.special["mediaelement-swfReady"];
				//load mediaelement-swf
				webshims.loader.loadList(["mediaelement-swf"]);
			}
		});
	};
	var getSrcObj = function(elem, nodeName){
		elem = $(elem);
		var src = {src: elem.attr('src') || '', elem: elem, srcProp: elem.prop('src')};
		if(!src.src){return src;}
		var tmp = elem.attr('type');
		if(tmp){
			src.type = tmp;
			src.container = $.trim(tmp.split(';')[0]);
		} else {
			if(!nodeName){
				nodeName = elem[0].nodeName.toLowerCase();
				if(nodeName == 'source'){
					nodeName = (elem.closest('video, audio')[0] || {nodeName: 'video'}).nodeName.toLowerCase();
				}
			}
			tmp = mediaelement.getTypeForSrc(src.src, nodeName );
			
			if(tmp){
				src.type = tmp;
				src.container = tmp;
				if($.nodeName(elem[0], 'source')){
					webshims.warn('you should always provide a proper mime-type. '+ src.src +' detected as: '+ tmp);
					elem.attr('type', tmp);
				}
			}
		}
		tmp = elem.attr('media');
		if(tmp){
			src.media = tmp;
		}
		return src;
	};
	
	
	webshims.ready('WINDOWLOAD', function(){
		webshims.loader.loadList(['swfobject']);
	});
	webshims.ready('swfobject', function(){
		hasSwf = swfobject.hasFlashPlayerVersion('9.0.115');
		if(hasSwf){
			webshims.ready('WINDOWLOAD', loadSwf);
		}
	});
	
	if(hasNative){
		webshims.capturingEvents(['play', 'playing', 'waiting', 'paused', 'ended', 'durationchange', 'loadedmetadata', 'canplay', 'volumechange']);
	}
	
	
	
	mediaelement.mimeTypes = {
		audio: {
				//ogm shouldn´t be used!
				'audio/ogg': ['ogg','oga', 'ogm'],
				'audio/mpeg': ['mp2','mp3','mpga','mpega'],
				'audio/mp4': ['mp4','mpg4', 'm4r'],
				'audio/wav': ['wav'],
				'audio/x-m4a': ['m4a'],
				'audio/x-m4p': ['m4p'],
				'audio/3gpp': ['3gp','3gpp'],
				'audio/webm': ['webm']
			},
			video: {
				//ogm shouldn´t be used!
				'video/ogg': ['ogg','ogv', 'ogm'],
				'video/mpeg': ['mpg','mpeg','mpe'],
				'video/mp4': ['mp4','mpg4', 'm4v'],
				'video/quicktime': ['mov','qt'],
				'video/x-msvideo': ['avi'],
				'video/x-ms-asf': ['asf', 'asx'],
				'video/flv': ['flv', 'f4v'],
				'video/3gpp': ['3gp','3gpp'],
				'video/webm': ['webm']
			}
		}
	;
	
	mediaelement.mimeTypes.source =  $.extend({}, mediaelement.mimeTypes.audio, mediaelement.mimeTypes.video);
	
	mediaelement.getTypeForSrc = function(src, nodeName){
		if(src.indexOf('youtube.com/watch?') != -1){
			return 'video/youtube';
		}
		src = src.split('?')[0].split('.');
		src = src[src.length - 1];
		var mt;
		
		$.each(mediaelement.mimeTypes[nodeName], function(mimeType, exts){
			if(exts.indexOf(src) !== -1){
				mt = mimeType;
				return false;
			}
		});
		return mt;
	};
	
	
	mediaelement.srces = function(mediaElem, srces){
		mediaElem = $(mediaElem);
		if(!srces){
			srces = [];
			var nodeName = mediaElem[0].nodeName.toLowerCase();
			var src = getSrcObj(mediaElem, nodeName);
			
			if(!src.src){
				
				$('source', mediaElem).each(function(){
					src = getSrcObj(this, nodeName);
					if(src.src){srces.push(src);}
				});
			} else {
				srces.push(src);
			}
			return srces;
		} else {
			mediaElem.removeAttr('src').removeAttr('type').find('source').remove();
			if(!$.isArray(srces)){
				srces = [srces]; 
			}
			srces.forEach(function(src){
				var source = document.createElement('source');
				if(typeof src == 'string'){
					src = {src: src};
				} 
				source.setAttribute('src', src.src);
				if(src.type){
					source.setAttribute('type', src.type);
				}
				if(src.media){
					source.setAttribute('media', src.media);
				}
				mediaElem.append(source);
			});
			
		}
	};
	
	
	$.fn.loadMediaSrc = function(srces, poster){
		return this.each(function(){
			if(poster !== undefined){
				$(this).removeAttr('poster');
				if(poster){
					$.attr(this, 'poster', poster);
				}
			}
			mediaelement.srces(this, srces);
			$(this).mediaLoad();
		});
	};
	
	mediaelement.swfMimeTypes = ['video/3gpp', 'video/x-msvideo', 'video/quicktime', 'video/x-m4v', 'video/mp4', 'video/m4p', 'video/x-flv', 'video/flv', 'audio/mpeg', 'audio/aac', 'audio/mp4', 'audio/x-m4a', 'audio/m4a', 'audio/mp3', 'audio/x-fla', 'audio/fla', 'youtube/flv', 'jwplayer/jwplayer', 'video/youtube'];
	mediaelement.canSwfPlaySrces = function(mediaElem, srces){
		var ret = '';
		if(hasSwf){
			mediaElem = $(mediaElem);
			srces = srces || mediaelement.srces(mediaElem);
			$.each(srces, function(i, src){
				if(src.container && src.src && mediaelement.swfMimeTypes.indexOf(src.container) != -1){
					ret = src;
					return false;
				}
			});
			
		}
		
		return ret;
	};
	
	mediaelement.canNativePlaySrces = function(mediaElem, srces){
		var ret = '';
		if(hasNative){
			mediaElem = $(mediaElem);
			srces = srces || mediaelement.srces(mediaElem);
			
			$.each(srces, function(i, src){
				if(src.type && mediaElem.canPlayType(src.type) ){
					ret = src;
					return false;
				}
			});
		}
		return ret;
	};
	mediaelement.setError = function(elem, message, baseData){
		if(!message){
			message = "can't play sources";
		}
		if(baseData){
			baseData = webshims.data(this, 'mediaelementBase', {});
		}
		baseData.error = message;
		webshims.warn('mediaelementError: '+ message);
		setTimeout(function(){
			if(baseData.error){
				$(elem).trigger('mediaerror');
			}
		}, 1);
	};
	
	var handleSWF = (function(){
		var requested;
		return function( mediaElem, ret, data ){
			webshims.ready('mediaelement-swf', function(){
				if(mediaelement.createSWF){
					mediaelement.createSWF( mediaElem, ret, data );
				} else if(!requested) {
					requested = true;
					loadSwf();
					//readd to ready
					handleSWF( mediaElem, ret, data );
				}
			});
		};
	})();
	
	var selectSource = function(baseData, elem, data, useSwf, _srces, _noLoop){
		var ret;
		_srces = _srces || mediaelement.srces(elem);
		baseData.error = false;
		if(!_srces.length){return;}
		if(useSwf || (useSwf !== false && data && data.isActive == 'flash')){
			ret = mediaelement.canSwfPlaySrces(elem, _srces);
			if(!ret){
				if(_noLoop){
					mediaelement.setError(elem, false, baseData);
				} else {
					selectSource(baseData, elem, data, false, _srces, true);
				}
			} else {
				handleSWF(elem, ret, data);
			}
		} else {
			ret = mediaelement.canNativePlaySrces(elem);
			if(!ret){
				if(_noLoop){
					mediaelement.setError(elem, false, baseData);
				} else {
					selectSource(baseData, elem, data, true, _srces, true);
				}
			} else if(data && data.isActive == 'flash') {
				mediaelement.setActive(elem, 'html5', data);
			}
		}
	};
	
	
	$(document).bind('ended', function(e){
		var data = webshims.data(e.target, 'mediaelement');
		if( supportsLoop && (!data || data.isActive == 'html5') && !$.prop(e.target, 'loop')){return;}
		setTimeout(function(){
			if( $.prop(e.target, 'paused') || !$.prop(e.target, 'loop') ){return;}
			$(e.target).prop('currentTime', 0).play();
		}, 1);
		
	});
	if(!supportsLoop){
		webshims.defineNodeNamesBooleanProperty(['audio', 'video'], 'loop');
	}
	
	var stopParent = /^(?:embed|object)$/i;
	webshims.addReady(function(context, insertedElement){
		$('video, audio', context)
			.add(insertedElement.filter('video, audio'))
			.each(function(){
				var parent = this.parentNode;
				if(parent && stopParent.test(parent.nodeName || '')){return;}
				var baseData = webshims.data(this, 'mediaelementBase') || webshims.data(this, 'mediaelementBase', {});
				selectSource(baseData, this, false, options.preferFlash || undefined);
			})
		;
	 });
	
	['audio', 'video'].forEach(function(nodeName){
		var supLoad = webshims.defineNodeNameProperty(nodeName, 'load',  {
			prop: {
				value: function(){
					var data = webshims.data(this, 'mediaelement');
					var baseData = webshims.data(this, 'mediaelementBase') || webshims.data(this, 'mediaelementBase', {});
					clearTimeout(baseData.loadTimer);
					selectSource(baseData, this, data);
					if(hasNative && (!data || data.isActive == 'html5') && supLoad.prop._supvalue){
						supLoad.prop._supvalue.apply(this, arguments);
					}
				}
			}
		});
		
	});
	webshims.onNodeNamesPropertyModify(['audio', 'video'], 'src', {
		set: function(){
			var data = webshims.data(this, 'mediaelement');
			var elem = this;
			var baseData = webshims.data(this, 'mediaelementBase') || webshims.data(this, 'mediaelementBase', {});
			clearTimeout(baseData.loadTimer);
			baseData.loadTimer = setTimeout(function(){
				selectSource(baseData, elem, data);
			}, 9);
		}
	});
	
		
	webshims.isReady('mediaelement-core', true);
});
})(jQuery, Modernizr, jQuery.webshims);