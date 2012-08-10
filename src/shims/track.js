jQuery.webshims.register('track', function($, webshims, window, document, undefined){
	var mediaelement = webshims.mediaelement;
	var id = new Date().getTime();
	var showTracks = {subtitles: 1, captions: 1};
	var notImplemented = function(){
		webshims.error('not implemented yet');
	};
	var eventTargetProto = {
		addEventListener: notImplemented,
		removeEventListener: notImplemented,
		dispatchEvent: notImplemented
	};
	var cueListProto = {
		getCueById: notImplemented
	};
	var textTrackProto = {
		shimActiveCues: null,
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
	
	
	window.TextTrackCue = function(id, startTime, endTime, text, settings, pauseOnExit){
		this.id = id;
		this.startTime = startTime;
		this.endTime = endTime;
		this.text = text;
		this.pauseOnExit = pauseOnExit;
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
	
	
	webshims.defineNodeNamesBooleanProperty(['track'], 'default');
	webshims.reflectProperties(['track'], ['srclang', 'label']);
	webshims.defineNodeNameProperty('track', 'src', {
		//attr: {},
		reflect: true,
		propType: 'src'
	});
	
	webshims.defineNodeNameProperty('track', 'kind', {
		//attr: {},
		reflect: true,
		propType: 'enumarated',
		defaultValue: 'subtitles',
		limitedTo: ['subtitles', 'captions', 'descriptions', 'chapters', 'metadata']
	});
	
	webshims.defineNodeNameProperty('track', 'readyState', {
		prop: {
			get: function(){
				return (webshims.data(this, 'trackData') || {readyState: 0}).readyState;
			} 
		}
	});
	
	mediaelement.createCueList = function(){
		return $.extend([], cueListProto);
	};
	
	mediaelement.createTextTrack = function(mediaelem, track){
		var obj, trackData, load;
		id++;
		if(track.nodeName){
			trackData = webshims.data(track, 'trackData');
			if(trackData){
				obj = trackData.track;
				clearTimeout(trackData.modeTimer);
				trackData.modeTimer = setTimeout(function(){
					$(track).triggerHandler('checktrackmode');
				}, 9);
			}
		}
		if(!obj){
			obj = webshims.objectCreate(textTrackProto);
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
				load = function(){
					var error;
					if(obj.mode){
						if(!trackData.readyState){
							error = function(){
								trackData.readyState = 3;
								$(track).triggerHandler('error');
							};
							trackData.readyState = 1;
							try {
								$.ajax({
									dataType: 'text',
									url: $.prop(track, 'src'),
									success: function(text){
										mediaelement.parseCaptions(text, function(cues){
											if(cues && 'length' in cues){
												obj.cues = cues;
												obj.shimActiveCues = mediaelement.createCueList();
												trackData.readyState = 2;
												$(track).triggerHandler('load');
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
						$(mediaelem).unbind('play playing progress timeupdate', load);
						$(track).unbind('checktrackmode', load);
					}
				};
				trackData = webshims.data(track, 'trackData', {track: obj, readyState: 0});
				$(mediaelem).bind('play playing progress timeupdate', load);
				$(track).bind('checktrackmode', load);
				if($.prop(track, 'default')){
					obj.mode = showTracks[obj.kind] ? 2 : 1;
					load();
				}
			} else {
				obj.cues = mediaelement.createCueList();;
				obj.shimActiveCues = mediaelement.createCueList();
				obj.mode = 1;
			}
		}
		return obj;
	};
	
	mediaelement.parseCaptionChunk = (function(){
		// Set up timestamp parsers - SRT does WebVTT timestamps as well.
		var SUBTimestampParser			= /^(\d{2})?:?(\d{2}):(\d{2})\.(\d+)\,(\d{2})?:?(\d{2}):(\d{2})\.(\d+)\s*(.*)/;
		var SBVTimestampParser			= /^(\d+)?:?(\d{2}):(\d{2})\.(\d+)\,(\d+)?:?(\d{2}):(\d{2})\.(\d+)\s*(.*)/;
		var SRTTimestampParser			= /^(\d{2})?:?(\d{2}):(\d{2})[\.\,](\d+)\s+\-\-\>\s+(\d{2})?:?(\d{2}):(\d{2})[\.\,](\d+)\s*(.*)/;
		var SRTChunkTimestampParser		= /(\d{2})?:?(\d{2}):(\d{2})[\.\,](\d+)/;
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
				
				if ((timestampMatch = SRTTimestampParser.exec(timestamp)) ||
					(timestampMatch = SUBTimestampParser.exec(timestamp)) ||
					(timestampMatch = SBVTimestampParser.exec(timestamp))) {
					
					// WebVTT / SRT / SUB (VOBSub) / YouTube SBV style timestamp
					
					timeData = timestampMatch.slice(1);
					
					timeIn =	parseInt((timeData[0]||0) * 60 * 60,10) +	// Hours
								parseInt((timeData[1]||0) * 60,10) +		// Minutes
								parseInt((timeData[2]||0),10) +				// Seconds
								parseFloat("0." + (timeData[3]||0));		// MS
					
					timeOut =	parseInt((timeData[4]||0) * 60 * 60,10) +	// Hours
								parseInt((timeData[5]||0) * 60,10) +		// Minutes
								parseInt((timeData[6]||0),10) +				// Seconds
								parseFloat("0." + (timeData[7]||0));		// MS
					
					if (timeData[8]) {
						cueSettings = timeData[8];
					}
			
				} else if (!!(timestampMatch = GoogleTimestampParser.exec(timestamp))) {
					
					// Google's proposed WebVTT timestamp style
					timeData = timestampMatch.slice(1);
					
					timeIn = parseFloat(timeData[0]);
					timeOut = timeIn + parseFloat(timeData[1]);

					if (timeData[2]) {
						cueSettings = timeData[2];
					}
				}
				
				// We've got the timestamp - return all the other unmatched lines as the raw subtitle data
				subtitleParts = subtitleParts.slice(0,subtitlePartIndex).concat(subtitleParts.slice(subtitlePartIndex+1));
				break;
			}

			if (!timeIn && !timeOut) {
				// We didn't extract any time information. Assume the cue is invalid!
				return null;
			}

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
			
			// The remaining lines are the subtitle payload itself (after removing an ID if present, and the time);
			html = subtitleParts.join("\n");
			tmpCue = new TextTrackCue(id, timeIn, timeOut, html, cueSettings, false);
			tmpCue.styleData = cueStyles;
			return tmpCue;
		};
	})();
	
	mediaelement.parseCaptions = function(captionData, complete) {
			var subtitles = mediaelement.createCueList();
			var cue, lazyProcess, regWevVTT;
			var startDate;
			if (captionData) {
				startDate = new Date().getTime();
				regWevVTT = /^WEBVTT(\s*FILE)?/ig;
				// Begin parsing --------------------
				captionData = captionData.replace(/\r\n/g,"\n").replace(/\r/g,"\n");
			
				captionData = captionData.split(/\n\n+/g);
			
				lazyProcess = function(i, len){
					
					for(; i < len; i++){
						cue = captionData[i];
						if(!regWevVTT.test(cue) && cue.replace(/\s*/ig,"").length){
							cue = mediaelement.parseCaptionChunk(cue, i);
							if(cue){
								subtitles.push(cue);
							}
						}
						if(startDate < (new Date().getTime()) - 20){
							i++;
							console.log('stopon')
							setTimeout(function(){
								startDate = new Date().getTime();
								lazyProcess(i, len);
							}, 90);
							
							break;
						}
					}
					if(i >= len){
						complete(subtitles);
					}
				};
								
				lazyProcess(0, captionData.length)
				
				
			} else {
				throw new Error("Required parameter captionData not supplied.");
			}
		};
	
	
	mediaelement.createTrackList = function(mediaelement){
		var baseData = webshims.data(mediaelement, 'mediaelementBase') || webshims.data(mediaelement, 'mediaelementBase', {});
		if(!baseData.textTracks){
			baseData.textTracks = [];
			webshims.defineProperties(baseData.textTracks, {
				onaddtrack: {value: null},
				onremovetrack: {value: null}
			});
		}
		return baseData.textTracks;
	};
	
	
	['audio', 'video'].forEach(function(nodeName){
		var addTrack, textTracks;
		textTracks = webshims.defineNodeNameProperty(nodeName, 'textTracks', {
			prop: {
				get: function(){
					var elem = this;
					
					return mediaelement.createTrackList(this);
				}
			}
		});
		addTrack = webshims.defineNodeNameProperty(nodeName, 'addTextTrack', {
			prop: {
				value: function(kind, label, lang){
					var textTrack = mediaelement.createTextTrack(this, {kind: kind || '', label: label || '', srclang: lang || ''});
					var textTracks = $.prop(this, 'textTracks');
					textTracks.push(textTrack);
					return textTrack;
				}
			}
		});
	});
	
	webshims.defineNodeNameProperty('track', 'track', {
		prop: {
			get: function(){
				return mediaelement.createTextTrack($(this).closest('audio, video')[0], this);
			}
		}
		
	});
	
	var addToTrackList = function(){
		var trackList = $.prop(this, 'textTracks');
		$('track', this).each(function(){
			trackList.push($.prop(this, 'track'));
		});
	};
	
	webshims.addReady(function(context, insertedElement){
		$('video, audio', context).add(insertedElement.filter('video, audio')).each(addToTrackList);
		insertedElement.filter('track').parent('audio, video').each(addToTrackList);
	});
	
});