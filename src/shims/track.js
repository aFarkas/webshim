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
				webshims.error('always use $.bind/$.unbind to the shimed event: '+ name +' already bound fn was: '+ eventList[name] +' your fn was: '+ fn);
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
			if(cue.track){
				webshims.error("cue already part of a track element");
			}
			cue.track = this;
			this.cues.push(cue);
		},
		removeCue: notImplemented,
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
	
	var owns = Function.prototype.call.bind(Object.prototype.hasOwnProperty);
	
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
		for(i = 0, len = oldTracks.length; i < len; i++){
			if(trackList.indexOf(oldTracks[i]) == -1){
				oldTracks[i].mode = 'disabled';
			}
		}
		oldTracks = null;
	};
	
	var refreshTrack = function(track, trackData){
		var mode, kind;
		if(!trackData){
			trackData = webshims.data(track, 'trackData');
		}
		if(trackData && !trackData.isTriggering){
			trackData.isTriggering = true;
			mode = (trackData.track || {}).mode; 
			kind = (trackData.track || {}).kind; 
			setTimeout(function(){
				if(mode !== (trackData.track || {}).mode || kind != (trackData.track || {}).kind){
					if(!(trackData.track || {}).readyState){
						$(track).triggerHandler('checktrackmode');
					} else {
						$(track).parent().triggerHandler('updatetrackdisplay');
					}
				}
				trackData.isTriggering = false;
				
			}, 9);
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
		$(mediaelem).bind(loadEvents, load);
		$(track).bind('checktrackmode', load);
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
				trackData = webshims.data(track, 'trackData', {track: obj});
				mediaelement.loadTextTrack(mediaelem, track, trackData, $.prop(track, 'default'));
			} else {
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
		
			if (subtitleParts[0].match(/^\s*[a-z0-9]+\s*$/ig)) {
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
	
	webshims.onNodeNamesPropertyModify('track', 'kind', function(){
		var trackData = webshims.data(this, 'trackData');
		if(trackData){
			trackData.track.kind = $.prop(this, 'kind');
			refreshTrack(this, trackData);
		}
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

	
	$(document).bind('emptied ended', function(e){
		if($(e.target).is('audio, video')){
			setTimeout(function(){
				updateMediaTrackList.call(e.target);
			}, 9);
		}
	});
	
	var getNativeReadyState = function(trackElem, textTrack){
		return textTrack.readyState || trackElem.readyState;
	};
	
	webshims.addReady(function(context, insertedElement){
		$('video, audio', context)
			.add(insertedElement.filter('video, audio, track').closest('audio, video'))
			.each(updateMediaTrackList)
			.each(function(){
				if(Modernizr.track){
					var shimedTextTracks = $.prop(this, 'textTracks');
					var origTextTracks = this.textTracks;
					if(shimedTextTracks.length != origTextTracks.length){
						webshims.error("textTracks couldn't be copied");
					}
					
					$('track', this)
						.each(function(){
							var shimedTrack = $.prop(this, 'track');
							var origTrack = this.track;
							var kind;
							var readyState;
							if(origTrack){
								kind = $.prop(this, 'kind');
								readyState = getNativeReadyState(this, origTrack);
								if (origTrack.mode || readyState) {
									shimedTrack.mode = origTrack.mode;
								}
								//disable track from showing + remove UI
								if(kind != 'descriptions'){
									origTrack.mode = (typeof origTrack.mode == 'string') ? 'disabled' : 0;
									this.kind = 'metadata';
									$(this).attr({kind: kind});
								}
								
							}
						})
						.bind('load error', function(e){
							if(e.originalEvent){
								e.stopImmediatePropagation();
							}
						})
					;
				}
			})
		;
	});
	
	if(Modernizr.track){
		$('video, audio').trigger('trackapichange');
	}
	
});