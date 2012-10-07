(function($){
	module("mediaelement API test");
	
	var SRCES = {
		mp4: 'http://corrupt-system.de/assets/media/bigbugbunny/bbb_trailer.m4v',
		ogg: 'http://corrupt-system.de/assets/media/bigbugbunny/bbb_trailer.ogg',
		poster: 'http://corrupt-system.de/assets/media/sintel/sintel-trailer.png',
		yt: 'http://www.youtube.com/watch?v=siOHh0uzcuY'
	};
	var absoluteUrlTest = function(url){
		ok(url.indexOf('://') != -1, 'url is absolute. url was: '+ url);
	};
	
	var generalMediaTest = function(media, options){
		var events = {
			loadedmetadata: 0,
			play: 0,
			pause: 0,
			playing: 0,
			durationchange: 0,
			emptied: 0,
			mediaerror: 0
		};
		var duration;
		media
			.bind('loadedmetadata.testevent', function(){
				events.loadedmetadata++;
				ok(media.prop('readyState') > 0, "readyState is greater 1 if media loaded metadata");
				if(options.duration){
					duration = media.prop('duration');
					ok(duration > options.duration - 4 && duration < options.duration + 4, "duration is in range for "+ options.duration +" on loadedmetadata event. duration was: "+duration);
				}
				if(options.videoHeight){
					ok(media.prop('videoHeight') > options.videoHeight - 4 && media.prop('videoHeight') < options.videoHeight + 4, "videoHeight is in range for "+ options.videoHeight +" on loadedmetadata event");
				}
				if(options.videoWidth){
					ok(media.prop('videoWidth') > options.videoWidth - 4 && media.prop('videoWidth') < options.videoWidth + 4, "videoHeight is in range for "+ options.videoHeight +" on loadedmetadata event");
				}
			})
			.bind('durationchange.testevent', function(){
				events.durationchange++;
				if(options.duration){
					duration = media.prop('duration');
					ok(duration > options.duration - 4 && duration < options.duration + 4, "duration is in range for "+ options.duration +" on durationchange event duration was: "+duration);
				}
			})
			.bind('waiting.testevent', function(){
				ok(media.prop('readyState') <= media.prop('HAVE_CURRENT_DATA'), "readyState is equal or less than HAVE_CURRENT_DATA");
			})
			
			
			.bind('playing.testevent', function(){
				events.playing++;
				ok(!media.prop('paused') && !media.prop('ended') && media.prop('readyState') >= media.prop('HAVE_CURRENT_DATA'), "media state accords to currently playing");
			})
			.bind('emptied.testevent', function(){
				events.emptied++;
			})
			.bind('play.testevent', function(){
				events.play++;
				ok(!media.prop('paused'), "media is not paused");
			})
			.bind('pause.testevent', function(){
				events.pause++;
				ok(media.prop('paused'), "media is paused");
			})
			.bind('mediaerror', function(){
				events.mediaerror++;
				ok(media.data('mediaerror'), "media has error on mediaerror event");
			})
		;
		
		
		return function(){
			media.unbind('.testevent');
			if(media.canPlayType( options.type[0] ) || (options.type[1] && media.canPlayType( options.type[1] )) ){
				ok(!media.prop('mediaerror'), "media has no error");
				$.each(events, function(eventName){
					if(eventName in options){
						equals(events[eventName], options[eventName], eventName+ " happend "+events[eventName] +'times');
					}
				})
			} else {
				
			}
		};
	};
	
	asyncTest("mediaelement properties", function(){
		var video = $('video');
		var audio = $('audio');
		
		absoluteUrlTest(video.prop('poster'));
		absoluteUrlTest(video.prop('src'));
		absoluteUrlTest($('source', video).prop('src'));
		ok(video.data('mediaerror'), "video has mediaerror with unknown video sources");
		strictEqual(video.prop('readyState'), 0, "readyState is 0");
		
		webshimtest.reflectAttr(video, 'controls', true, 'boolean');
		video.prop('controls', false);
		webshimtest.reflectAttr(video, 'controls', false, 'boolean');
		
		webshimtest.reflectAttr(video, 'autoplay', false, 'boolean');
		video.prop('autoplay', true);
		webshimtest.reflectAttr(video, 'autoplay', true, 'boolean');
		
		webshimtest.reflectAttr(video, 'loop', false, 'boolean');
		video.prop('loop', true);
		webshimtest.reflectAttr(video, 'loop', true, 'boolean');
		
		ok(!video.prop('duration'), 'duration is NaN/0 ');
		
		absoluteUrlTest(audio.prop('src'));
		
		
		absoluteUrlTest($('source', audio).prop('src'));
		ok(audio.data('mediaerror'), "audio has mediaerror with unknown video sources");
		if($.support.deleteExpando){
			strictEqual(audio.prop('poster'), undefined, "poster property is undefined on audio");
		} else {
			ok((audio.prop('poster') || "").indexOf('://') == -1, "poster property is not transformed to an url");
		}
		strictEqual(audio.prop('readyState'), 0, "readyState is 0");
		
		webshimtest.reflectAttr(audio, 'controls', true, 'boolean');
		audio.prop('controls', false);
		webshimtest.reflectAttr(audio, 'controls', false, 'boolean');
		
		webshimtest.reflectAttr(audio, 'autoplay', false, 'boolean');
		audio.prop('autoplay', true);
		webshimtest.reflectAttr(audio, 'autoplay', true, 'boolean');
		
		webshimtest.reflectAttr(audio, 'loop', false, 'boolean');
		audio.prop('loop', true);
		webshimtest.reflectAttr(audio, 'loop', true, 'boolean');
		
		ok(!audio.prop('duration'), 'duration is NaN/0');
		setTimeout(function(){
			$.webshims.ready('mediaelement swfobject', start);
		}, 100);
	});
	
	asyncTest("mediaelement all sources", function(){
		var video = $('video');
		var endTest = generalMediaTest(video, {
			duration: 32.5,
			type: ['video/ogg', 'video/mp4'],
			loadedmetadata: 1, 
			durationchange: 1,
			play: 1
		});
		video
			.loadMediaSrc(
				[
					SRCES.mp4,
					SRCES.ogg
				], 
				SRCES.poster)
			.play()
		;
		
		
		
		video
			.bind('loadedmetadata.testevent mediaerror.testevent', function(){
				endTest();
				
				endTest = generalMediaTest(video, {
					duration: 2515,
					type: ['video/youtube'],
					loadedmetadata: 1, 
					durationchange: 1
//					,emptied: 1
				});
				video
					.loadMediaSrc(
						[
							SRCES.yt
						], 
						SRCES.poster)
					.bind('loadedmetadata.testevent mediaerror.testevent', function(){
						setTimeout(function(){
							endTest();
							setTimeout(start, 9);
						}, 1);
						
					})
					.play()
				;
			})
		
			.each(function(){
				if(video.prop('readyState')){
					video.trigger('loadedmetadata');
				}
			})
		;
	});
	
})(jQuery);
