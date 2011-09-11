(function($){
    module("mediaelement API test");
    
    var absoluteUrlTest = function(url){
        ok(url.indexOf('://') != -1, 'url is absolute');
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
		
		ok(isNaN(video.prop('duration')), 'duration is NaN');
		
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
		
		ok(isNaN(audio.prop('duration')), 'duration is NaN');
        setTimeout(function(){
	        $.webshims.ready('mediaelement swfobject', start);
		}, 100);
    });
	
	asyncTest("mediaelement playing", function(){
        var video = $('video');
        var readyState;
        video
			.loadMediaSrc(
				[
					"http://protofunc.com/jme/media/bbb_trailer_mobile.m4v",
					"http://protofunc.com/jme/media/bbb_trailer_400p.ogg"
				], 
				"http://protofunc.com/jme/media/bbb_watchtrailer.gif")
			.play()
		;
		
		
		
		video
			.bind('loadedmetadata', function(){
				ok(video.prop('readyState') > 0, "readyState is greater 1 if video loaded metadata");
				ok(video.prop('duration') > 31 && video.prop('duration') < 34, "video duration is between 31 and 34");
				setTimeout(function(){
					start();
				}, 400);
			})
		
			.each(function(){
				if(video.prop('readyState')){
					video.trigger('loadedmetadata');
				}
			})
		;
    });
	
	asyncTest("mediaelement youtube playing", function(){
		var video = $('video');
        video
			.loadMediaSrc(
				"http://www.youtube.com/watch?v=siOHh0uzcuY", 
				"http://protofunc.com/jme/media/bbb_watchtrailer.gif"
			)
			.play()
		;
		if(swfobject.hasFlashPlayerVersion('9.0.115')){
	        
			video
				.bind('loadedmetadata', function(){
					ok(video.prop('readyState') > 0, "readyState is greater 1 if video loaded metadata");
					ok(video.prop('duration') > 2510 && video.prop('duration') < 2525, "video duration is between 31 and 34");
					setTimeout(function(){
						start();
					}, 400);
				})
				.each(function(){
					if(video.prop('readyState')){
						video.trigger('loadedmetadata');
					}
				})
			;
		} else {
			ok(video.data('mediaerror'), "video has mediaerror with unknown video sources");
			start();
		}
    });
	
})(jQuery);
