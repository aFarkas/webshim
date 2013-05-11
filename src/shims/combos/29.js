webshims.register('track', function($, webshims, window, document, undefined){
	"use strict";
	var mediaelement = webshims.mediaelement;
	var id = new Date().getTime();
	var ADDBACK = $.fn.addBack ? 'addBack' : 'andSelf';
	//descriptions are not really shown, but they are inserted into the dom
	var showTracks = {subtitles: 1, captions: 1, descriptions: 1};
	var notImplemented = function(){
		webshims.error('not implemented yet');
	};
	var dummyTrack = $('<track />');
	var supportTrackMod = Modernizr.ES5 && Modernizr.objectAccessor;
	var createEventTarget = function(obj){
		var eventList = {};
		obj.addEventListener = function(name, fn){
			if(eventList[name]){
				webshims.error('always use $.on to the shimed event: '+ name +' already bound fn was: '+ eventList[name] +' your fn was: '+ fn);
			}
			eventList[name] = fn;
			
		};
		obj.removeEventListener = function(name, fn){
			if(eventList[name] && eventList[name] != fn){
				webshims.error('always use $.on/$.off to the shimed event: '+ name +' already bound fn was: '+ eventList[name] +' your fn was: '+ fn);
			}
			if(eventList[name]){
				delete eventList[name];
			}
		};
		return obj;
	};
	
	var cueListProto = {
		getCueById: function(id){
			var cue = null;
			for(var i = 0, len = this.length; i < len; i++){
				if(this[i].id === id){
					cue = this[i];
					break;
				}
			}
			return cue;
		}
	};
	var numericModes = {
		0: 'disabled',
		1: 'hidden',
		2: 'showing'
	};
	
	var textTrackProto = {
		shimActiveCues: null,
		_shimActiveCues: null,
		activeCues: null,
		cues: null,
		kind: 'subtitles',
		label: '',
		language: '',
		mode: 'disabled',
		readyState: 0,
		oncuechange: null,
		toString: function() {
			return "[object TextTrack]";
		},
		addCue: function(cue){
			if(!this.cues){
				this.cues = mediaelement.createCueList();
			} else {
				var lastCue = this.cues[this.cues.length-1];
				if(lastCue && lastCue.startTime > cue.startTime){
					webshims.error("cue startTime higher than previous cue's startTime");
				}
			}
			if(cue.track && cue.track.removeCue){
				cue.track.removeCue(cue);
			}
			cue.track = this;
			this.cues.push(cue);
		},
		//ToDo: make it more dynamic
		removeCue: function(cue){
			var cues = this.cues || [];
			var i = 0;
			var len = cues.length;
			if(cue.track != this){
				webshims.error("cue not part of track");
				return;
			}
			for(; i < len; i++){
				if(cues[i] === cue){
					cues.splice(i, 1);
					cue.track = null;
					break;
				}
			}
			if(cue.track){
				webshims.error("cue not part of track");
				return;
			}
		},
		DISABLED: 'disabled',
		OFF: 'disabled',
		HIDDEN: 'hidden',
		SHOWING: 'showing',
		ERROR: 3,
		LOADED: 2,
		LOADING: 1,
		NONE: 0
	};
	var copyProps = ['kind', 'label', 'srclang'];
	var copyName = {srclang: 'language'};
	
	var owns = Function.prototype.call.bind(Object.prototype.hasOwnProperty);
	
	var updateMediaTrackList = function(baseData, trackList){
		var removed = [];
		var added = [];
		var newTracks = [];
		var i, len;
		if(!baseData){
			baseData =  webshims.data(this, 'mediaelementBase') || webshims.data(this, 'mediaelementBase', {});
		}
		
		if(!trackList){
			baseData.blockTrackListUpdate = true;
			trackList = $.prop(this, 'textTracks');
			baseData.blockTrackListUpdate = false;
		}
		
		clearTimeout(baseData.updateTrackListTimer);
		
		$('track', this).each(function(){
			var track = $.prop(this, 'track');
			newTracks.push(track);
			if(trackList.indexOf(track) == -1){
				added.push(track);
			}
		});
		
		if(baseData.scriptedTextTracks){
			for(i = 0, len = baseData.scriptedTextTracks.length; i < len; i++){
				newTracks.push(baseData.scriptedTextTracks[i]);
				if(trackList.indexOf(baseData.scriptedTextTracks[i]) == -1){
					added.push(baseData.scriptedTextTracks[i]);
				}
			}
		}
		
		for(i = 0, len = trackList.length; i < len; i++){
			if(newTracks.indexOf(trackList[i]) == -1){
				removed.push(trackList[i]);
			}
		}
		
		if(removed.length || added.length){
			trackList.splice(0);
			
			for(i = 0, len = newTracks.length; i < len; i++){
				trackList.push(newTracks[i]);
			}
			for(i = 0, len = removed.length; i < len; i++){
				$([trackList]).triggerHandler($.Event({type: 'removetrack', track: removed[i]}));
			}
			for(i = 0, len = added.length; i < len; i++){
				$([trackList]).triggerHandler($.Event({type: 'addtrack', track: added[i]}));
			}
			if(baseData.scriptedTextTracks || removed.length){
				$(this).triggerHandler('updatetrackdisplay');
			}
		}
	};
	
	var refreshTrack = function(track, trackData){
		if(!trackData){
			trackData = webshims.data(track, 'trackData');
		}
		if(trackData && !trackData.isTriggering){
			trackData.isTriggering = true;
			setTimeout(function(){
				if(!(trackData.track || {}).readyState){
					$(track).triggerHandler('checktrackmode');
				} else {
					$(track).closest('audio, video').triggerHandler('updatetrackdisplay');
				}
				trackData.isTriggering = false;
			}, 1);
		}
	};
	
	var emptyDiv = $('<div />')[0];
	window.TextTrackCue = function(startTime, endTime, text){
		if(arguments.length != 3){
			webshims.error("wrong arguments.length for TextTrackCue.constructor");
		}
		
		this.startTime = startTime;
		this.endTime = endTime;
		this.text = text;
		
		this.id = "";
		this.pauseOnExit = false;
		
		createEventTarget(this);
	};
	
	window.TextTrackCue.prototype = {
		
		onenter: null,
		onexit: null,
		pauseOnExit: false,
		getCueAsHTML: function(){
			var lastText = "";
			var parsedText = "";
			var fragment = document.createDocumentFragment();
			var fn;
			if(!owns(this, 'getCueAsHTML')){
				fn = this.getCueAsHTML = function(){
					var i, len;
					if(lastText != this.text){
						lastText = this.text;
						parsedText = mediaelement.parseCueTextToHTML(lastText);
						emptyDiv.innerHTML = parsedText;
						
						for(i = 0, len = emptyDiv.childNodes.length; i < len; i++){
							fragment.appendChild(emptyDiv.childNodes[i].cloneNode(true));
						}
					}
					return fragment.cloneNode(true);
				};
				
			}
			return fn ? fn.apply(this, arguments) : fragment.cloneNode(true);
		},
		track: null,
		
		
		id: ''
		//todo-->
//			,
//			snapToLines: true,
//			line: 'auto',
//			size: 100,
//			position: 50,
//			vertical: '',
//			align: 'middle'
	};
	
	
	
	
	
	mediaelement.createCueList = function(){
		return $.extend([], cueListProto);
	};
	
	mediaelement.parseCueTextToHTML = (function(){
		var tagSplits = /(<\/?[^>]+>)/ig;
		var allowedTags = /^(?:c|v|ruby|rt|b|i|u)/;
		var regEnd = /\<\s*\//;
		var addToTemplate = function(localName, attribute, tag, html){
			var ret;
			if(regEnd.test(html)){
				ret = '</'+ localName +'>';
			} else {
				tag.splice(0, 1);
				ret =  '<'+ localName +' '+ attribute +'="'+ (tag.join(' ').replace(/\"/g, '&#34;')) +'">';
			}
			return ret;
		};
		var replacer = function(html){
			var tag = html.replace(/[<\/>]+/ig,"").split(/[\s\.]+/);
			if(tag[0]){
				tag[0] = tag[0].toLowerCase();
				if(allowedTags.test(tag[0])){
					if(tag[0] == 'c'){
						html = addToTemplate('span', 'class', tag, html);
					} else if(tag[0] == 'v'){
						html = addToTemplate('q', 'title', tag, html);
					}
				} else {
					html = "";
				}
			}
			return html;
		};
		
		return function(cueText){
			return cueText.replace(tagSplits, replacer);
		};
	})();
	
	mediaelement.loadTextTrack = function(mediaelem, track, trackData, _default){
		var loadEvents = 'play playing timeupdate updatetrackdisplay';
		var obj = trackData.track;
		var load = function(){
			var src = $.prop(track, 'src');
			var error;
			var ajax;
			if(obj.mode != 'disabled' && src && $.attr(track, 'src')){
				$(mediaelem).unbind(loadEvents, load);
				$(track).unbind('checktrackmode', load);
				if(!obj.readyState){
					error = function(){
						obj.readyState = 3;
						obj.cues = null;
						obj.activeCues = obj.shimActiveCues = obj._shimActiveCues = null;
						$(track).triggerHandler('error');
					};
					obj.readyState = 1;
					try {
						obj.cues = mediaelement.createCueList();
						obj.activeCues = obj.shimActiveCues = obj._shimActiveCues = mediaelement.createCueList();
						ajax = $.ajax({
							dataType: 'text',
							url: src,
							success: function(text){
								if(ajax.getResponseHeader('content-type') != 'text/vtt'){
									webshims.error('set the mime-type of your WebVTT files to text/vtt. see: http://dev.w3.org/html5/webvtt/#text/vtt');
								}
								mediaelement.parseCaptions(text, obj, function(cues){
									if(cues && 'length' in cues){
										obj.readyState = 2;
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
		obj.readyState = 0;
		obj.shimActiveCues = null;
		obj._shimActiveCues = null;
		obj.activeCues = null;
		obj.cues = null;
		$(mediaelem).unbind(loadEvents, load);
		$(track).unbind('checktrackmode', load);
		$(mediaelem).on(loadEvents, load);
		$(track).on('checktrackmode', load);
		if(_default){
			obj.mode = showTracks[obj.kind] ? 'showing' : 'hidden';
			load();
		}
	};
	
	mediaelement.createTextTrack = function(mediaelem, track){
		var obj, trackData;
		if(track.nodeName){
			trackData = webshims.data(track, 'trackData');
			
			if(trackData){
				refreshTrack(track, trackData);
				obj = trackData.track;
			}
		}
		
		if(!obj){
			obj = createEventTarget(webshims.objectCreate(textTrackProto));
			
			if(!supportTrackMod){
				copyProps.forEach(function(copyProp){
					var prop = $.prop(track, copyProp);
					if(prop){
						obj[copyName[copyProp] || copyProp] = prop;
					}
				});
			}
			
			
			if(track.nodeName){
				
				if(supportTrackMod){
					copyProps.forEach(function(copyProp){
						webshims.defineProperty(obj, copyName[copyProp] || copyProp, {
							get: function(){
								return $.prop(track, copyProp);
							}
						});
					});
				}
				
				trackData = webshims.data(track, 'trackData', {track: obj});
				mediaelement.loadTextTrack(mediaelem, track, trackData, ($.prop(track, 'default') && $(track).siblings('track[default]')[ADDBACK]()[0] == track));
			} else {
				if(supportTrackMod){
					copyProps.forEach(function(copyProp){
						webshims.defineProperty(obj, copyName[copyProp] || copyProp, {
							value: track[copyProp],
							writeable: false
						});
					});
				}
				obj.cues = mediaelement.createCueList();
				obj.activeCues = obj._shimActiveCues = obj.shimActiveCues = mediaelement.createCueList();
				obj.mode = 'hidden';
				obj.readyState = 2;
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
		// Set up timestamp parsers
		var WebVTTTimestampParser			= /^(\d{2})?:?(\d{2}):(\d{2})\.(\d+)\s+\-\-\>\s+(\d{2})?:?(\d{2}):(\d{2})\.(\d+)\s*(.*)/;
		var GoogleTimestampParser		= /^([\d\.]+)\s+\+([\d\.]+)\s*(.*)/;
		var WebVTTDEFAULTSCueParser		= /^(DEFAULTS|DEFAULT)\s+\-\-\>\s+(.*)/g;
		var WebVTTSTYLECueParser		= /^(STYLE|STYLES)\s+\-\-\>\s*\n([\s\S]*)/g;
		var WebVTTCOMMENTCueParser		= /^(COMMENT|COMMENTS)\s+\-\-\>\s+(.*)/g;
		
		return function(subtitleElement,objectCount){
			var cueDefaults = [];
		
			var subtitleParts, timeIn, timeOut, html, timeData, subtitlePartIndex, cueSettings = "", id, specialCueData;
			var timestampMatch, tmpCue;

			// WebVTT Special Cue Logic
			if ((specialCueData = WebVTTDEFAULTSCueParser.exec(subtitleElement))) {
//				cueDefaults = specialCueData.slice(2).join("");
//				cueDefaults = cueDefaults.split(/\s+/g).filter(function(def) { return def && !!def.length; });
				return null;
			} else if ((specialCueData = WebVTTSTYLECueParser.exec(subtitleElement))) {
				return null;
			} else if ((specialCueData = WebVTTCOMMENTCueParser.exec(subtitleElement))) {
				return null; // At this stage, we don't want to do anything with these.
			}
			
			subtitleParts = subtitleElement.split(/\n/g);
		
			// Trim off any blank lines (logically, should only be max. one, but loop to be sure)
			while (!subtitleParts[0].replace(/\s+/ig,"").length && subtitleParts.length > 0) {
				subtitleParts.shift();
			}
		
			if (subtitleParts[0].match(/^\s*[a-z0-9-\_]+\s*$/ig)) {
				// The identifier becomes the cue ID (when *we* load the cues from file. Programatically created cues can have an ID of whatever.)
				id = String(subtitleParts.shift().replace(/\s*/ig,""));
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
				webshims.warn("couldn't extract time information: "+[timeIn, timeOut, subtitleParts.join("\n"), id].join(' ; '));
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
			tmpCue = new TextTrackCue(timeIn, timeOut, html);
			if(id){
				tmpCue.id = id;
			}
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
							track.addCue(cue);
						}
					}
					if(startDate < (new Date().getTime()) - 30){
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
					complete(track.cues);
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
			webshims.error("Required parameter captionData not supplied.");
		}
	};
	
	
	mediaelement.createTrackList = function(mediaelem, baseData){
		baseData = baseData || webshims.data(mediaelem, 'mediaelementBase') || webshims.data(mediaelem, 'mediaelementBase', {});
		if(!baseData.textTracks){
			baseData.textTracks = [];
			webshims.defineProperties(baseData.textTracks, {
				onaddtrack: {value: null},
				onremovetrack: {value: null}
			});
			createEventTarget(baseData.textTracks);
		}
		return baseData.textTracks;
	};
	
	if(!Modernizr.track){
		webshims.defineNodeNamesBooleanProperty(['track'], 'default');
		webshims.reflectProperties(['track'], ['srclang', 'label']);
		
		webshims.defineNodeNameProperties('track', {
			src: {
				//attr: {},
				reflect: true,
				propType: 'src'
			}
		});
	}
	
	webshims.defineNodeNameProperties('track', {
		kind: {
			attr: Modernizr.track ? {
				set: function(value){
					var trackData = webshims.data(this, 'trackData');
					this.setAttribute('data-kind', value);
					if(trackData){
						trackData.attrKind = value;
					}
				},
				get: function(){
					var trackData = webshims.data(this, 'trackData');
					if(trackData && ('attrKind' in trackData)){
						return trackData.attrKind;
					}
					return this.getAttribute('kind');
				}
			} : {},
			reflect: true,
			propType: 'enumarated',
			defaultValue: 'subtitles',
			limitedTo: ['subtitles', 'captions', 'descriptions', 'chapters', 'metadata']
		}
	});
	
	$.each(copyProps, function(i, copyProp){
		var name = copyName[copyProp] || copyProp;
		webshims.onNodeNamesPropertyModify('track', copyProp, function(){
			var trackData = webshims.data(this, 'trackData');
			var track = this;
			if(trackData){
				if(copyProp == 'kind'){
					refreshTrack(this, trackData);
				}
				if(!supportTrackMod){
					trackData.track[name] = $.prop(this, copyProp);
				}
				clearTimeout(trackData.changedTrackPropTimer);
				trackData.changedTrackPropTimer = setTimeout(function(){
					$(track).trigger('updatesubtitlestate');
				}, 1); 
			}
		});
	});		
	
	
	webshims.onNodeNamesPropertyModify('track', 'src', function(val){
		if(val){
			var data = webshims.data(this, 'trackData');
			var media;
			if(data){
				media = $(this).closest('video, audio');
				if(media[0]){
					mediaelement.loadTextTrack(media, this, data);
				}
			}
		}
		
	});
	
	//
	
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
				return ($.prop(this, 'track') || {readyState: 0}).readyState;
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
				var media = this;
				var baseData = webshims.data(media, 'mediaelementBase') || webshims.data(media, 'mediaelementBase', {});
				var tracks = mediaelement.createTrackList(media, baseData);
				if(!baseData.blockTrackListUpdate){
					updateMediaTrackList.call(media, baseData, tracks);
				}
				return tracks;
			},
			writeable: false
		},
		addTextTrack: {
			value: function(kind, label, lang){
				var textTrack = mediaelement.createTextTrack(this, {
					kind: dummyTrack.prop('kind', kind || '').prop('kind'),
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

	
	$(document).on('emptied ended updatetracklist', function(e){
		if($(e.target).is('audio, video')){
			var baseData = webshims.data(e.target, 'mediaelementBase');
			if(baseData){
				clearTimeout(baseData.updateTrackListTimer);
				baseData.updateTrackListTimer = setTimeout(function(){
					updateMediaTrackList.call(e.target, baseData);
				}, 0);
			}
		}
	});
	
	var getNativeReadyState = function(trackElem, textTrack){
		return textTrack.readyState || trackElem.readyState;
	};
	var stopOriginalEvent = function(e){
		if(e.originalEvent){
			e.stopImmediatePropagation();
		}
	};
	var startTrackImplementation = function(){
		if(webshims.implement(this, 'track')){
			var shimedTrack = $.prop(this, 'track');
			var origTrack = this.track;
			var kind;
			var readyState;
			if(origTrack){
				kind = $.prop(this, 'kind');
				readyState = getNativeReadyState(this, origTrack);
				if (origTrack.mode || readyState) {
					shimedTrack.mode = numericModes[origTrack.mode] || origTrack.mode;
				}
				//disable track from showing + remove UI
				if(kind != 'descriptions'){
					origTrack.mode = (typeof origTrack.mode == 'string') ? 'disabled' : 0;
					this.kind = 'metadata';
					$(this).attr({kind: kind});
				}
				
			}
			$(this).on('load error', stopOriginalEvent);
		}
	};
	webshims.addReady(function(context, insertedElement){
		var insertedMedia = insertedElement.filter('video, audio, track').closest('audio, video');
		$('video, audio', context)
			.add(insertedMedia)
			.each(function(){
				updateMediaTrackList.call(this);
			})
			.each(function(){
				if(Modernizr.track){
					var shimedTextTracks = $.prop(this, 'textTracks');
					var origTextTracks = this.textTracks;
					if(shimedTextTracks.length != origTextTracks.length){
						webshims.error("textTracks couldn't be copied");
					}
					
					$('track', this).each(startTrackImplementation);
				}
			})
		;
		insertedMedia.each(function(){
			var media = this;
			var baseData = webshims.data(media, 'mediaelementBase');
			if(baseData){
				clearTimeout(baseData.updateTrackListTimer);
				baseData.updateTrackListTimer = setTimeout(function(){
					updateMediaTrackList.call(media, baseData);
				}, 9);
			}
		});
	});
	
	if(Modernizr.track){
		$('video, audio').trigger('trackapichange');
	}
});
(function($){
	if(Modernizr.track && Modernizr.texttrackapi && document.addEventListener){
		var trackOptions = webshims.cfg.track;
		var trackListener = function(e){
			$(e.target).filter('track').each(changeApi);
		};
		var trackBugs = webshims.bugs.track;
		var changeApi = function(){
			if(trackBugs || (!trackOptions.override && $.prop(this, 'readyState') == 3)){
				trackOptions.override = true;
				webshims.reTest('track');
				document.removeEventListener('error', trackListener, true);
				if(this && $.nodeName(this, 'track')){
					webshims.error("track support was overwritten. Please check your vtt including your vtt mime-type");
				} else {
					webshims.info("track support was overwritten. due to bad browser support");
				}
				return false;
			}
		};
		var detectTrackError = function(){
			document.addEventListener('error', trackListener, true);
			if(trackBugs){
				changeApi();
			} else {
				$('track').each(changeApi);
			}
		};
		if(!trackOptions.override){
			detectTrackError();
		}
	}
})(jQuery)
webshims.register('track-ui', function($, webshims, window, document, undefined){
	"use strict";
	var options = webshims.cfg.track;
	var enterE = {type: 'enter'};
	var exitE = {type: 'exit'};
	//descriptions are not really shown, but they are inserted into the dom
	var showTracks = {subtitles: 1, captions: 1, descriptions: 1};
	var mediaelement = webshims.mediaelement;
	var usesNativeTrack =  function(){
		return !options.override && Modernizr.track;
	};
	
	var trackDisplay = {
		update: function(baseData, media){
			if(!baseData.activeCues.length){
				this.hide(baseData);
			} else {
				if(!compareArray(baseData.displayedActiveCues, baseData.activeCues)){
					baseData.displayedActiveCues = baseData.activeCues;
					if(!baseData.trackDisplay){
						baseData.trackDisplay = $('<div class="cue-display"><span class="description-cues" aria-live="assertive" /></div>').insertAfter(media);
						this.addEvents(baseData, media);
						webshims.docObserve();
					}
					
					if(baseData.hasDirtyTrackDisplay){
						media.triggerHandler('forceupdatetrackdisplay');
					}
					this.showCues(baseData);
				}
			}
		},
		showCues: function(baseData){
			var element = $('<span class="cue-wrapper" />');
			$.each(baseData.displayedActiveCues, function(i, cue){
				var id = (cue.id) ? 'id="cue-id-'+cue.id +'"' : '';
				var cueHTML = $('<span class="cue-line"><span '+ id+ ' class="cue" /></span>').find('span').html(cue.getCueAsHTML()).end();
				if(cue.track.kind == 'descriptions'){
					setTimeout(function(){
						$('span.description-cues', baseData.trackDisplay).html(cueHTML);
					}, 0);
				} else {
					element.prepend(cueHTML);
				}
			});
			$('span.cue-wrapper', baseData.trackDisplay).remove();
			baseData.trackDisplay.append(element);
		},
		addEvents: function(baseData, media){
			if(options.positionDisplay){
				var timer;
				var positionDisplay = function(_force){
					if(baseData.displayedActiveCues.length || _force === true){
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
							height: uiHeight - 45,
							top: position.top,
							display: 'block'
						});
						
						baseData.trackDisplay.css('fontSize', Math.max(Math.round(uiHeight / 30), 7));
						baseData.hasDirtyTrackDisplay = false;
					} else {
						baseData.hasDirtyTrackDisplay = true;
					}
				};
				var delayed = function(e){
					clearTimeout(timer);
					timer = setTimeout(positionDisplay, 0);
				};
				var forceUpdate = function(){
					positionDisplay(true);
				};
				media.on('playerdimensionchange mediaelementapichange updatetrackdisplay updatemediaelementdimensions swfstageresize', delayed);
				media.on('forceupdatetrackdisplay', forceUpdate).onWSOff('updateshadowdom', delayed);
				forceUpdate();
			}
		},
		hide: function(baseData){
			if(baseData.trackDisplay && baseData.displayedActiveCues.length){
				baseData.displayedActiveCues = [];
				$('span.cue-wrapper', baseData.trackDisplay).remove();
				$('span.description-cues', baseData.trackDisplay).empty();
			}
		}
	};
	
	function compareArray(a1, a2){
		var ret = true;
		var i = 0;
		var len = a1.length;
		if(len != a2.length){
			ret = false;
		} else {
			for(; i < len; i++){
				if(a1[i] != a2[i]){
					ret = false;
					break;
				}
			}
		}
		return ret;
	}
	
	$.extend($.event.customEvent, {
		updatetrackdisplay: true,
		forceupdatetrackdisplay: true
	});
	
	mediaelement.trackDisplay = trackDisplay;
	
	if(!mediaelement.createCueList){
		
		var cueListProto = {
			getCueById: function(id){
				var cue = null;
				for(var i = 0, len = this.length; i < len; i++){
					if(this[i].id === id){
						cue = this[i];
						break;
					}
				}
				return cue;
			}
		};
		
		mediaelement.createCueList = function(){
			return $.extend([], cueListProto);
		};
	}
	
	mediaelement.getActiveCue = function(track, media, time, baseData){
		if(!track._lastFoundCue){
			track._lastFoundCue = {index: 0, time: 0};
		}
		
		if(Modernizr.track && !options.override && !track._shimActiveCues){
			track._shimActiveCues = mediaelement.createCueList();
		}
		
		var i = 0;
		var len;
		var cue;
		
		for(; i < track.shimActiveCues.length; i++){
			cue = track.shimActiveCues[i];
			if(cue.startTime > time || cue.endTime < time){
				track.shimActiveCues.splice(i, 1);
				i--;
				if(cue.pauseOnExit){
					$(media).pause();
				}
				$(track).triggerHandler('cuechange');
				$(cue).triggerHandler('exit');
			} else if(track.mode == 'showing' && showTracks[track.kind] && $.inArray(cue, baseData.activeCues) == -1){
				baseData.activeCues.push(cue);
			}
		}
		

		len = track.cues.length;
		i = track._lastFoundCue.time < time ? track._lastFoundCue.index : 0;
		
		for(; i < len; i++){
			cue = track.cues[i];
			
			if(cue.startTime <= time && cue.endTime >= time && $.inArray(cue, track.shimActiveCues) == -1){
				track.shimActiveCues.push(cue);
				if(track.mode == 'showing' && showTracks[track.kind]){
					baseData.activeCues.push(cue);
				}
				$(track).triggerHandler('cuechange');
				$(cue).triggerHandler('enter');
				
				track._lastFoundCue.time = time;
				track._lastFoundCue.index = i;
				
				
			}
			if(cue.startTime > time){
				break;
			}
		}
	};
	
	if(usesNativeTrack()){
		(function(){
			var block;
			var triggerDisplayUpdate = function(elem){
				setTimeout(function(){
					block = true;
					$(elem).triggerHandler('updatetrackdisplay');
					block = false;
				}, 9);
			};
			
			var createUpdateFn = function(nodeName, prop, type){
				var superType = '_sup'+type;
				var desc = {prop: {}};
				var superDesc;
				desc.prop[type] = function(){
					if(!block && usesNativeTrack()){
						triggerDisplayUpdate($(this).closest('audio, video'));
					}
					return superDesc.prop[superType].apply(this, arguments);
				};
				superDesc = webshims.defineNodeNameProperty(nodeName, prop, desc);
			};
			
			createUpdateFn('track', 'track', 'get');
			
			['audio', 'video'].forEach(function(nodeName){
				createUpdateFn(nodeName, 'textTracks', 'get');
				createUpdateFn('nodeName', 'addTextTrack', 'value');
			});
		})();
	}
	
	webshims.addReady(function(context, insertedElement){
		$('video, audio', context)
			.add(insertedElement.filter('video, audio'))
			.filter(function(){
				return webshims.implement(this, 'trackui');
			})
			.each(function(){
				var elem = $(this);
				
				var getDisplayCues = function(e){
					var track;
					var time;
					
					if(!trackList || !baseData){
						trackList = elem.prop('textTracks');
						baseData = webshims.data(elem[0], 'mediaelementBase') || webshims.data(elem[0], 'mediaelementBase', {});
						if(!baseData.displayedActiveCues){
							baseData.displayedActiveCues = [];
						}
					}
					
					if (!trackList){return;}
					time = elem.prop('currentTime');
					
					if(!time && time !== 0){return;}
					baseData.activeCues = [];
					for(var i = 0, len = trackList.length; i < len; i++){
						track = trackList[i];
						if(track.mode != 'disabled' && track.cues && track.cues.length){
							mediaelement.getActiveCue(track, elem, time, baseData);
						}
					}
					
					trackDisplay.update(baseData, elem);
					
				};
				var onUpdate = function(e){
					clearTimeout(updateTimer);
					if(e && e.type == 'timeupdate'){
						getDisplayCues();
						setTimeout(onUpdate, 90);
					} else {
						updateTimer = setTimeout(getDisplayCues, 9);
					}
				};
				
				var addTrackView = function(){
					
					elem
						.off('.trackview')
						.on('play.trackview timeupdate.trackview updatetrackdisplay.trackview', onUpdate)
					;
				};
				var baseData, trackList, updateTimer;
				
				if(!usesNativeTrack()){
					addTrackView();
				} else {
					elem.on('mediaelementapichange trackapichange', function(){
						if(!usesNativeTrack() || elem.is('.nonnative-api-active')){
							addTrackView();
						} else {
							trackList = elem.prop('textTracks');
							baseData = webshims.data(elem[0], 'mediaelementBase') || webshims.data(elem[0], 'mediaelementBase', {});
							
							$.each(trackList, function(i, track){
								if(track._shimActiveCues){
									delete track._shimActiveCues;
								}
							});
							trackDisplay.hide(baseData);
							elem.unbind('.trackview');
						}
					});
				}
			})
		;
	});
});