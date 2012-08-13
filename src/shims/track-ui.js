jQuery.webshims.register('track-ui', function($, webshims, window, document, undefined){
	var options = webshims.cfg.track;
	var enterE = {type: 'enter'};
	var exitE = {type: 'exit'};
	var showTracks = {subtitles: 1, captions: 1};
	
	var trackDisplay = {
		show: function(cue, baseData, media){
			if(!baseData.trackDisplay){
				baseData.trackDisplay = $('<div class="cue-display"></div>').insertAfter(media);
				baseData.hasVisibleTrack = 0;
				this.addEvents(baseData, media);
			}
			if(!baseData.currentTrack || cue.track == baseData.currentTrack){
				baseData.hasVisibleTrack++;
				baseData.currentTrack = cue.track;
				baseData.visibleCue = cue;
				if(baseData.hasDirtyTrackDisplay){
					media.triggerHandler('forceupdatetrackdisplay');
				}
				baseData.trackDisplay.html('<span class="cue-text"><span>'+ cue.text +'</span></span>');
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
						var offsetElement = uiElement.offsetParent();
						var uiHeight = uiElement.innerHeight();
						var uiWidth = uiElement.innerWidth();
						var position = uiElement.position();
						var displaySize = uiHeight * uiWidth;
						baseData.trackDisplay.css({
							left: position.left,
							width: uiWidth,
							height: uiHeight - 5,
							top: position.top,
							display: 'block'
						});
						
						if(displaySize < 80000){
							displaySize = 'xs';
						} else if(displaySize >= 80000 && displaySize < 100000) {
							displaySize = 's';
						} else if(displaySize >= 100000 && displaySize < 300000) {
							displaySize = 'm';
						} else if(displaySize >= 300000 && displaySize < 550000) {
							displaySize = 'l';
						} else if(displaySize >= 550000 && displaySize < 990000) {
							displaySize = 'xl';
						} else if(displaySize >= 990000) {
							displaySize = 'xxl';
						}
						baseData.trackDisplay.attr('data-displaysize', displaySize);
						baseData.hasDirtyTrackDisplay = false;
					} else {
						baseData.hasDirtyTrackDisplay = true;
					}
				};
				var delayed = function(e){
					clearTimeout(timer);
					timer = setTimeout(positionDisplay, (e && e.type == 'resize') ? 99 : 9);
				};
				var forceUpdate = function(){
					positionDisplay(true);
				};
				media.bind('playerdimensionchange mediaelementapichange updatetrackdisplay updatemediaelementdimensions swfstageresize', delayed);
				$(window).bind('resize emchange', delayed);
				media.bind('forceupdatetrackdisplay', forceUpdate);
				forceUpdate();
			}
		},
		hide: function(track, baseData){
			if(baseData.trackDisplay && track == baseData.currentTrack){
				baseData.hasVisibleTrack--;
				baseData.currentTrack = false;
				baseData.visibleCue = false;
				baseData.trackDisplay.empty();
			}
		}
	};
	
	webshims.mediaelement.trackDisplay = trackDisplay;
	
	webshims.mediaelement.getActiveCue = function(track, media, time, baseData){
		if(!track._lastFoundCue){
			track._lastFoundCue = {index: 0, time: 0};
		}
		
		if(Modernizr.track && !track._shimActiveCues){
			track._shimActiveCues = [];
		}
		
		var len = track.cues.length;
		var i = track._lastFoundCue.time < time ? track._lastFoundCue.index : 0;
		var cue;
		
		
		if(track.shimActiveCues.length){
			if(track.shimActiveCues[0].startTime > time || track.shimActiveCues[0].endTime < time){
				cue = track.shimActiveCues[0];
				track.shimActiveCues.pop();
				trackDisplay.hide(track, baseData);
				if(cue.pauseOnExit){
					$(media).pause();
				}
				$(track).triggerHandler('cuechange');
				$(cue).triggerHandler('exit');
			} else if(baseData.visibleCue != track.shimActiveCues[0] && track.mode > 1 && showTracks[track.kind]){
				trackDisplay.show(track.shimActiveCues[0], baseData, media);
			}
		}

		if(!track.shimActiveCues.length){
			for(; i < len; i++){
				cue = track.cues[i];
				
				if(cue.startTime <= time && cue.endTime >= time){
					track.shimActiveCues.push(cue);
					if(track.mode > 1 && showTracks[track.kind]){
						trackDisplay.show(cue, baseData, media);
					}
					$(track).triggerHandler('cuechange');
					$(cue).triggerHandler('enter');
					
					track._lastFoundCue.time = time;
					track._lastFoundCue.index = i;
					
					//found 1
					break;
					
				}
				if(cue.startTime > time){
					break;
				}
			}
		}
	};
	
	if(Modernizr.track){
		(function(){
			var block;
			var triggerDisplayUpdate = function(elem){
				if(!block){
					setTimeout(function(){
						block = true;
						$(elem).triggerHandler('updatetrackdisplay');
						block = false;
					}, 9);
				}
			};
			var trackDesc = webshims.defineNodeNameProperty('track', 'track', {
				prop: {
					get: function(){
						triggerDisplayUpdate($(this).parent('audio, video'));
						return trackDesc.prop._supget.apply(this, arguments);
					}
				}
				
			});
			['audio', 'video'].forEach(function(nodeName){
				var addTrack, textTracks;
				textTracks = webshims.defineNodeNameProperty(nodeName, 'textTracks', {
					prop: {
						get: function(){
							triggerDisplayUpdate(this);
							return textTracks.prop._supget.apply(this, arguments);
						}
					}
				});
				
				addTrack = webshims.defineNodeNameProperty(nodeName, 'addTextTrack', {
					prop: {
						value: function(){
							triggerDisplayUpdate(this);
							return addTrack.prop._supvalue.apply(this, arguments);
						}
					}
				});
			});
		})();
	
	}
	
	webshims.addReady(function(context, insertedElement){
		$('video, audio', context)
			.add(insertedElement.filter('video, audio'))
			.each(function(){
				var trackList;
				var elem = $(this);
				var baseData;
				var addTrackView = function(){
					
					elem
						.unbind('.trackview')
						.bind('play.trackview timeupdate.trackview updatetrackdisplay.trackview', function(e){
							var track;
							var time;
							
							if(!trackList || !baseData){
								trackList = elem.prop('textTracks');
								baseData = webshims.data(elem[0], 'mediaelementBase') || webshims.data(elem[0], 'mediaelementBase', {});
							}
							
							if (!trackList){return;}
							time = elem.prop('currentTime');
							
							if(!time && time !== 0){return;}
							for(var i = 0, len = trackList.length; i < len; i++){
								track = trackList[i];
								if(track.mode > 0 && track.cues && track.cues.length){
									webshims.mediaelement.getActiveCue(track, elem, time, baseData);
								} else {
									trackDisplay.hide(track, baseData);
								}
							}
						})
					;
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
								if(track._shimActiveCues){
									delete track._shimActiveCues;
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