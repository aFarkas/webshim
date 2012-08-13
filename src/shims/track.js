jQuery.webshims.register('track', function($, webshims, window, document, undefined){
	var mediaelement = webshims.mediaelement;
	var id = new Date().getTime();
	var showTracks = {subtitles: 1, captions: 1};
	var notImplemented = function(){
		webshims.error('not implemented yet');
	};
	
	var createEventTarget = function(obj){
		var eventList = {};
		obj.addEventListener = function(name, fn){
			if(eventList[name]){
				webshims.error('always use $.bind to the shimed event: '+ name +' already bound fn was: '+ eventList[name] +' your fn was: '+ fn);
			}
			eventList[name] = fn;
			
		};
		obj.removeEventListener = function(name, fn){
			if(eventList[name] && eventList[name] != fn){
				webshims.error('always use $.bind to the shimed event: '+ name +' already bound fn was: '+ eventList[name] +' your fn was: '+ fn);
			}
			if(eventList[name]){
				delete eventList[name];
			}
		};
		return obj;
	};
	
	
	var cueListProto = {
		getCueById: notImplemented
	};
	var textTrackProto = {
		shimActiveCues: null,
		activeCues: null,
		cues: null,
		kind: 'subtitles',
		label: '',
		language: '',
		mode: 0,
		oncuechange: null,
		toString: function() {
			return "[object TextTrack]";
		},
		addCue: function(cue){
			if(!this.cues){
				this.cues =[];
			}
			if(cue.track){
				webshims.error("cue already part of a track element");
			}
			cue.track = this;
			this.cues.push(cue);
		},
		removeCue: notImplemented,
		DISABLED: 0,
		OFF: 0,
		HIDDEN: 1,
		SHOWING: 2
	};
	var copyProps = ['kind', 'label', 'srclang'];
	
	var updateMediaTrackList = function(){
		var trackList = $.prop(this, 'textTracks');
		var baseData = webshims.data(this, 'mediaelementBase');
		var oldTracks = trackList.splice(0);
		var i, len;
		$('track', this).each(function(){
			trackList.push($.prop(this, 'track'));
		});
		if(baseData.scriptedTextTracks){
			for(i = 0, len = baseData.scriptedTextTracks.length; i < len; i++){
				trackList.push(baseData.scriptedTextTracks[i]);
			}
		}
		if(mediaelement.trackDisplay && baseData.trackDisplay){
			for(i = 0, len = oldTracks.length; i < len; i++){
				if(trackList.indexOf(oldTracks[i]) == -1){
					mediaelement.trackDisplay.hide(oldTracks[i], baseData);
				}
			}
		}
	};
	
	var refreshTrack = function(track, trackData){
		var mode;
		if(!trackData){
			trackData = webshims.data(track, 'trackData');
		}
		if(trackData && !trackData.isTriggering){
			trackData.isTriggering = true;
			mode = (trackData.track || {}).mode; 
			setTimeout(function(){
				if(mode !== (trackData.track || {}).mode){
					if(!trackData.readyState){
						$(track).triggerHandler('checktrackmode');
					} else {
						$(track).parent().triggerHandler('updatetrackdisplay');
					}
				}
				trackData.isTriggering = false;
				
			}, 9);
		}
	};
	
	
	window.TextTrackCue = function(id, startTime, endTime, text, settings, pauseOnExit){
		this.id = id;
		this.startTime = startTime;
		this.endTime = endTime;
		this.text = text;
		this.pauseOnExit = pauseOnExit;
		
		if(settings){
			webshims.warn("webshims currently does not support any cue settings");
		}
		createEventTarget(this);
	};
	
	window.TextTrackCue.prototype = {
		
		onenter: null,
		onexit: null,
		pauseOnExit: false,
		getCueAsHTML: function(){
			
		},
		track: null,
		
		//todo-->
		id: '',
		snapToLines: true,
		line: -1,
		size: 100,
		position: 50,
		vertical: '',
		align: 'middle'
	};
	
	
	mediaelement.createCueList = function(){
		return $.extend([], cueListProto);
	};
	
	mediaelement.createTextTrack = function(mediaelem, track){
		var obj, trackData, load, loadEvents;
		if(track.nodeName){
			trackData = webshims.data(track, 'trackData');
			
			if(trackData){
				refreshTrack(track, trackData);
				obj = trackData.track;
			}
		}
		if(!obj){
			obj = createEventTarget(webshims.objectCreate(textTrackProto));
			copyProps.forEach(function(copyProp){
				var prop = $.prop(track, copyProp);
				if(prop){
					if(copyProp == 'srclang'){
						copyProp = 'language';
					}
					obj[copyProp] = prop;
				}
			});
			if(track.nodeName){
				loadEvents = 'play playing timeupdate updatetrackdisplay';
				load = function(){
					var error;
					var ajax;
					if(obj.mode){
						$(mediaelem).unbind(loadEvents, load);
						$(track).unbind('checktrackmode', load);
						if(!trackData.readyState){
							error = function(){
								trackData.readyState = 3;
								$(track).triggerHandler('error');
							};
							trackData.readyState = 1;
							try {
								ajax = $.ajax({
									dataType: 'text',
									url: $.prop(track, 'src'),
									success: function(text){
										if(ajax.getResponseHeader('content-type') != 'text/vtt'){
											webshims.warn('set the mime-type of your WebVTT files to text/vtt. see: http://dev.w3.org/html5/webvtt/#text/vtt')
										}
										mediaelement.parseCaptions(text, obj, function(cues){
											if(cues && 'length' in cues){
												obj.cues = cues;
												obj.activeCues = obj.shimActiveCues = mediaelement.createCueList();
												trackData.readyState = 2;
												$(track).triggerHandler('load');
												$(mediaelem).triggerHandler('updatetrackdisplay');
											} else {
												error();
											}
										});
										
									},
									error: error
								});
							} catch(er){
								error();
								webshims.warn(er);
							}
						}
					}
				};
				trackData = webshims.data(track, 'trackData', {track: obj, readyState: 0});
				$(mediaelem).bind(loadEvents, load);
				$(track).bind('checktrackmode', load);
				if($.prop(track, 'default')){
					obj.mode = showTracks[obj.kind] ? 2 : 1;
					load();
				}
			} else {
				obj.cues = mediaelement.createCueList();
				obj.activeCues = obj.shimActiveCues = mediaelement.createCueList();
				obj.mode = 1;
			}
		}
		return obj;
	};
	
	
/*
taken from:
Captionator 0.5.1 [CaptionCrunch]
Christopher Giffard, 2011
Share and enjoy

https://github.com/cgiffard/Captionator

modified for webshims
*/
	mediaelement.parseCaptionChunk = (function(){
		// Set up timestamp parsers - SRT does WebVTT timestamps as well.
		var WebVTTTimestampParser			= /^(\d{2})?:?(\d{2}):(\d{2})\.(\d+)\s+\-\-\>\s+(\d{2})?:?(\d{2}):(\d{2})\.(\d+)\s*(.*)/;
		var GoogleTimestampParser		= /^([\d\.]+)\s+\+([\d\.]+)\s*(.*)/;
		var WebVTTDEFAULTSCueParser		= /^(DEFAULTS|DEFAULT)\s+\-\-\>\s+(.*)/g;
		var WebVTTSTYLECueParser		= /^(STYLE|STYLES)\s+\-\-\>\s*\n([\s\S]*)/g;
		var WebVTTCOMMENTCueParser		= /^(COMMENT|COMMENTS)\s+\-\-\>\s+(.*)/g;
		
		return function(subtitleElement,objectCount){
			var cueStyles = "";
			var cueDefaults = [];
		
			var subtitleParts, timeIn, timeOut, html, timeData, subtitlePartIndex, cueSettings = "", id, specialCueData;
			var timestampMatch, tmpCue;

			// WebVTT Special Cue Logic
			if ((specialCueData = WebVTTDEFAULTSCueParser.exec(subtitleElement))) {
				cueDefaults = specialCueData.slice(2).join("");
				cueDefaults = cueDefaults.split(/\s+/g).filter(function(def) { return def && !!def.length; });
				return null;
			} else if ((specialCueData = WebVTTSTYLECueParser.exec(subtitleElement))) {
				cueStyles += specialCueData[specialCueData.length-1];
				return null;
			} else if ((specialCueData = WebVTTCOMMENTCueParser.exec(subtitleElement))) {
				return null; // At this stage, we don't want to do anything with these.
			}
			
			subtitleParts = subtitleElement.split(/\n/g);
		
			// Trim off any blank lines (logically, should only be max. one, but loop to be sure)
			while (!subtitleParts[0].replace(/\s+/ig,"").length && subtitleParts.length > 0) {
				subtitleParts.shift();
			}
		
			if (subtitleParts[0].match(/^\s*[a-z0-9]+\s*$/ig)) {
				// The identifier becomes the cue ID (when *we* load the cues from file. Programatically created cues can have an ID of whatever.)
				id = String(subtitleParts.shift().replace(/\s*/ig,""));
			} else {
				// We're not parsing a format with an ID prior to each caption like SRT or WebVTT
				id = objectCount;
			}
		
			for (subtitlePartIndex = 0; subtitlePartIndex < subtitleParts.length; subtitlePartIndex ++) {
				var timestamp = subtitleParts[subtitlePartIndex];
				
				if ((timestampMatch = WebVTTTimestampParser.exec(timestamp))) {
					
					// WebVTT
					
					timeData = timestampMatch.slice(1);
					
					timeIn =	parseInt((timeData[0]||0) * 60 * 60,10) +	// Hours
								parseInt((timeData[1]||0) * 60,10) +		// Minutes
								parseInt((timeData[2]||0),10) +				// Seconds
								parseFloat("0." + (timeData[3]||0));		// MS
					
					timeOut =	parseInt((timeData[4]||0) * 60 * 60,10) +	// Hours
								parseInt((timeData[5]||0) * 60,10) +		// Minutes
								parseInt((timeData[6]||0),10) +				// Seconds
								parseFloat("0." + (timeData[7]||0));		// MS
/*
					if (timeData[8]) {
						cueSettings = timeData[8];
					}
*/
				}
				
				// We've got the timestamp - return all the other unmatched lines as the raw subtitle data
				subtitleParts = subtitleParts.slice(0,subtitlePartIndex).concat(subtitleParts.slice(subtitlePartIndex+1));
				break;
			}

			if (!timeIn && !timeOut) {
				// We didn't extract any time information. Assume the cue is invalid!
				return null;
			}
/*
			// Consolidate cue settings, convert defaults to object
			var compositeCueSettings =
				cueDefaults
					.reduce(function(previous,current,index,array){
						previous[current.split(":")[0]] = current.split(":")[1];
						return previous;
					},{});
			
			// Loop through cue settings, replace defaults with cue specific settings if they exist
			compositeCueSettings =
				cueSettings
					.split(/\s+/g)
					.filter(function(set) { return set && !!set.length; })
					// Convert array to a key/val object
					.reduce(function(previous,current,index,array){
						previous[current.split(":")[0]] = current.split(":")[1];
						return previous;
					},compositeCueSettings);
			
			// Turn back into string like the TextTrackCue constructor expects
			cueSettings = "";
			for (var key in compositeCueSettings) {
				if (compositeCueSettings.hasOwnProperty(key)) {
					cueSettings += !!cueSettings.length ? " " : "";
					cueSettings += key + ":" + compositeCueSettings[key];
				}
			}
*/
			// The remaining lines are the subtitle payload itself (after removing an ID if present, and the time);
			html = subtitleParts.join("\n");
			tmpCue = new TextTrackCue(id, timeIn, timeOut, html, cueSettings, false);
			tmpCue.styleData = cueStyles;
			return tmpCue;
		};
	})();
	
	mediaelement.parseCaptions = function(captionData, track, complete) {
			var subtitles = mediaelement.createCueList();
			var cue, lazyProcess, regWevVTT;
			var startDate;
			var isWEBVTT;
			if (captionData) {
				
				regWevVTT = /^WEBVTT(\s*FILE)?/ig;
				
				lazyProcess = function(i, len){
					
					for(; i < len; i++){
						cue = captionData[i];
						if(regWevVTT.test(cue)){
							isWEBVTT = true;
						} else if(cue.replace(/\s*/ig,"").length){
							if(!isWEBVTT){
								webshims.error('please use WebVTT format. This is the standard');
								complete(null);
								break;
							}
							cue = mediaelement.parseCaptionChunk(cue, i);
							if(cue){
								cue.track = track;
								subtitles.push(cue);
							}
						}
						if(startDate < (new Date().getTime()) - 9){
							i++;
							setTimeout(function(){
								startDate = new Date().getTime();
								lazyProcess(i, len);
							}, 90);
							
							break;
						}
					}
					if(i >= len){
						if(!isWEBVTT){
							webshims.error('please use WebVTT format. This is the standard');
						}
						complete(subtitles);
					}
				};
				
				captionData = captionData.replace(/\r\n/g,"\n");
				
				setTimeout(function(){
					captionData = captionData.replace(/\r/g,"\n");
					setTimeout(function(){
						startDate = new Date().getTime();
						captionData = captionData.split(/\n\n+/g);
						lazyProcess(0, captionData.length);
					}, 9);
				}, 9);
				
			
				
				
				
				
				
			} else {
				throw new Error("Required parameter captionData not supplied.");
			}
		};
	
	
	mediaelement.createTrackList = function(mediaelem){
		var baseData = webshims.data(mediaelem, 'mediaelementBase') || webshims.data(mediaelem, 'mediaelementBase', {});
		if(!baseData.textTracks){
			baseData.textTracks = [];
			webshims.defineProperties(baseData.textTracks, {
				onaddtrack: {value: null}
//				,onremovetrack: {value: null}
			});
			createEventTarget(baseData.textTracks);
		}
		return baseData.textTracks;
	};
	
	
	webshims.defineNodeNamesBooleanProperty(['track'], 'default');
	webshims.reflectProperties(['track'], ['srclang', 'label']);
	
	webshims.defineNodeNameProperties('track', {
		kind: {
			//attr: {},
			reflect: true,
			propType: 'enumarated',
			defaultValue: 'subtitles',
			limitedTo: ['subtitles', 'captions', 'descriptions', 'chapters', 'metadata']
		},
		src: {
			//attr: {},
			reflect: true,
			propType: 'src'
		}
	});
	
	webshims.defineNodeNamesProperties(['track'], {
		ERROR: {
			value: 3
		},
		LOADED: {
			value: 2
		},
		LOADING: {
			value: 1
		},
		NONE: {
			value: 0
		},
		readyState: {
			get: function(){
				return (webshims.data(this, 'trackData') || {readyState: 0}).readyState;
			},
			writeable: false
		},
		track: {
			get: function(){
				return mediaelement.createTextTrack($(this).closest('audio, video')[0], this);
			},
			writeable: false
		}
	}, 'prop');
	
	webshims.defineNodeNamesProperties(['audio', 'video'], {
		textTracks: {
			get: function(){
				$('track', this).each(function(){
					refreshTrack(this);
				});
				return mediaelement.createTrackList(this);
			},
			writeable: false
		},
		addTextTrack: {
			value: function(kind, label, lang){
				var textTrack = mediaelement.createTextTrack(this, {
					kind: kind || '',
					label: label || '',
					srclang: lang || ''
				});
				var baseData = webshims.data(this, 'mediaelementBase') || webshims.data(this, 'mediaelementBase', {});
				if (!baseData.scriptedTextTracks) {
					baseData.scriptedTextTracks = [];
				}
				baseData.scriptedTextTracks.push(textTrack);
				updateMediaTrackList.call(this);
				return textTrack;
			}
		}
	}, 'prop');

	
	$(document).bind('emptied', function(e){
		if($(e.target).is('audio, video')){
			setTimeout(function(){
				updateMediaTrackList.call(e.target);
			}, 9);
		}
	});
	
	webshims.addReady(function(context, insertedElement){
		$('video, audio', context).add(insertedElement.filter('video, audio')).each(updateMediaTrackList);
		insertedElement.filter('track').parent('audio, video').each(updateMediaTrackList);
	});
	
});