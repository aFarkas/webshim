jQuery.webshims.register('track-ui', function($, webshims, window, document, undefined){
	var options = webshims.cfg.track;
	var enterE = {type: 'enter'};
	var exitE = {type: 'exit'};
	var showTracks = {subtitles: 1, captions: 1};
	
	var trackDisplay = {
		show: function(cue, baseData, media){
			if(!baseData.trackDisplay){
				baseData.trackDisplay = $('<div class="track-display"></div>').insertAfter(media);
				baseData.hasVisibleTrack = 0;
				this.addEvents(baseData, media);
			}
			if(!baseData.currentTrack || cue.track == baseData.currentTrack){
				baseData.hasVisibleTrack++;
				baseData.currentTrack = cue.track;
				baseData.trackDisplay.html('<span>'+ cue.text +'</span>');
			} else {
				webshims.warn("we only handle one visible track");
			}
		}, 
		addEvents: function(baseData, media){
			if(options.positionDisplay){
				var timer;
				var positionDisplay = function(_force){
					if(baseData.hasVisibleTrack || _force === true){
						baseData.trackDisplay.css({display: 'none'});
						var uiElement = media.getShadowElement();
						var offsetElement = media.offsetParent();
						var position = uiElement.position();
						baseData.trackDisplay.css({
							left: position.left,
							width: uiElement.innerWidth(),
							bottom: offsetElement.innerHeight() - (uiElement.innerHeight() + position.top)  + 45,
							display: 'block'
						});
					}
				};
				var delayed = function(){
					clearTimeout(timer);
					timer = setTimeout(positionDisplay, 99);
				};
				media.bind('playerdimensionchange mediaelementapichange updatetrackdisplay updatemediaelementdimensions swfstageresize', delayed);
				$(window).bind('resize', delayed);
				positionDisplay(true);
			}
		},
		hide: function(track, baseData){
			if(baseData.trackDisplay && track == baseData.currentTrack){
				baseData.hasVisibleTrack--;
				baseData.currentTrack = false;
				baseData.trackDisplay.empty();
			}
		}
	};
	
	webshims.mediaelement.trackDisplay = trackDisplay;
	
	webshims.mediaelement.getActiveCue = function(track, media, time, baseData){
		if(!track._lastFoundCue){
			track._lastFoundCue = {index: 0, time: 0};
		}
		
		if(Modernizr.track && !track.hasOwnProtperty('shimActiveCues')){
			track.shimActiveCues = [];
		}
		var len = track.cues.length;
		var i = track._lastFoundCue.time < time ? track._lastFoundCue.index : 0;
		var cue;
		
		
		if(track.shimActiveCues.length && (track.shimActiveCues[0].startTime > time || track.shimActiveCues[0].endTime < time)){
			cue = track.shimActiveCues[0];
			track.shimActiveCues.pop();
			trackDisplay.hide(track, baseData);
			if(cue.onexit){
				exitE.target = cue;
				cue.onexit(exitE);
			}
		}
		
		if(!track.shimActiveCues.length){
			for(; i < len; i++){
				cue = track.cues[i];
				if(cue.startTime <= time && cue.endTime >= time){
					if(!track.shimActiveCues.length){
						track.shimActiveCues.push(cue);
						if(track.mode > 1 && showTracks[track.kind]){
							trackDisplay.show(cue, baseData, media);
						}
						if(cue.onenter){
							enterE.target = cue;
							cue.onenter(enterE);
						}
						
						track._lastFoundCue.time = time;
						track._lastFoundCue.index = i;
						
						
					} else {
						webshims.warn("webshims currently does not support overlapping cues in one track");
						break;
					}
					
					
				}
				if(cue.startTime > time){
					break;
				}
			}
		}
	};
	
	webshims.addReady(function(context, insertedElement){
		$('video, audio', context)
			.add(insertedElement.filter('video, audio'))
			.each(function(){
				var trackList;
				var elem = $(this);
				var baseData;
				var addTrackView = function(){
					elem.unbind('.trackview').bind('play.trackview timeupdate.trackview updatetrackdisplay.trackview', function(e){
						var track;
						var time;
						if(!trackList || !baseData){
							trackList = elem.prop('textTracks');
							baseData = webshims.data(elem[0], 'mediaelementBase') || webshims.data(elem[0], 'mediaelementBase', {});
						}
						if (!trackList){return;}
						time = elem.prop('currentTime');
						if(!time){return;}
						for(var i = 0, len = trackList.length; i < len; i++){
							track = trackList[i];
							if(track.cues && track.cues.length){
								if(track.mode > 0){
									webshims.mediaelement.getActiveCue(track, elem, time, baseData);
								} else {
									trackDisplay.hide(track, baseData);
								}
								
							}
						}
					});
				};
				if(!Modernizr.track || elem.is('.nonnative-api-active')){
					addTrackView();
				}
				if(Modernizr.track){
					elem.bind('mediaelementapichange', function(){
						if(elem.is('.nonnative-api-active')){
							addTrackView();
						} else {
							if(!trackList || !baseData){
								trackList = elem.prop('textTracks');
								baseData = webshims.data(elem[0], 'mediaelementBase') || webshims.data(elem[0], 'mediaelementBase', {});
							}
							
							$.each(trackList, function(i, track){
								trackDisplay.hide(track, baseData);
								if(track.hasOwnProtperty('shimActiveCues')){
									delete track.shimActiveCues;
								}
							});
							elem.unbind('.trackview');
						}
					});
				}
			})
			
		;
	});
});