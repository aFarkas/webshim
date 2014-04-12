webshims.register('jme', function($, webshims, window, doc, undefined){
	"use strict";
	var props = {};
	var fns = {};
	var slice = Array.prototype.slice;

	var options = $.extend({selector: '.mediaplayer'}, webshims.cfg.mediaelement.jme);
	webshims.cfg.mediaelement.jme = options;


	$.jme = {
		plugins: {},
		data: function(elem, name, value){
			var data = $(elem).data('jme') || $.data(elem, 'jme', {});
			if(value === undefined){
				return (name) ? data[name] : data;
			} else {
				data[name] = value;
			}
		},
		registerPlugin: function(name, plugin){
			this.plugins[name] = plugin;
			if(!plugin.nodeName){
				plugin.nodeName = '';
			}
			if(!plugin.className){
				plugin.className = name;
			}

			options[name] = $.extend(plugin.options || {}, options[name]);

			if(options[name] && options[name].text){
				plugin.text = options[name].text;
			} else if(options.i18n && options.i18n[name]){
				plugin.text = options.i18n[name];
			}
		},
		defineMethod: function(name, fn){
			fns[name] = fn;
		},
		defineProp: function(name, desc){
			if(!desc){
				desc = {};
			}
			if(!desc.set){
				if(desc.readonly){
					desc.set = function(){
						throw(name +' is readonly');
					};
				} else {
					desc.set = $.noop;
				}
			}
			if(!desc.get){
				desc.get = function(elem){
					return $.jme.data(elem, name);
				};
			}
			props[name] = desc;
		},
		prop: function(elem, name, value){
			if(!props[name]){
				return $.prop(elem, name, value);
			}
			if(value === undefined){
				return props[name].get( elem );
			} else {
				var setValue = props[name].set(elem, value);
				if(setValue === undefined){
					setValue = value;
				}
				if(setValue != 'noDataSet'){
					$.jme.data(elem, name, setValue);
				}
			}
		}
	};

	$.fn.jmeProp = function(name, value){
		return $.access( this, $.jme.prop, name, value, arguments.length > 1 );
	};

	$.fn.jmeFn = function(fn){
		var args = slice.call( arguments, 1 );
		var ret;
		this.each(function(){
			ret = (fns[fn] || $.prop(this, fn)).apply(this, args);
			if(ret !== undefined){
				return false;
			}
		});
		return (ret !== undefined) ? ret : this;
	};



	var baseSelector = options.selector;

	$.jme.initJME = function(context, insertedElement){
		$(baseSelector, context).add(insertedElement.filter(baseSelector)).jmePlayer();
	};

	var idlStates = {
		emptied: 1,
		pause: 1
	};

	$.jme.getDOMList = function(attr){
		var list = [];
		if(!attr){
			attr = [];
		}
		if(typeof attr == 'string'){
			attr = attr.split(' ');
		}
		$.each(attr, function(i, id){
			if(id){
				id = document.getElementById(id);
				if(id){
					list.push(id);
				}
			}
		});
		return list;
	};


	$.jme.getButtonText = function(button, classes){
		var isCheckbox;
		var lastState;
		var txtChangeFn = function(state){
			if(lastState === state){return;}
			lastState = state;


			button
				.removeClass(classes[(state) ? 0 : 1])
				.addClass(classes[state])
			;

			if(isCheckbox){
				button.prop('checked', !!state);
				(button.data('checkboxradio') || {refresh: $.noop}).refresh();
			}
		};

		if (button.is('[type="checkbox"], [type="radio"]')){
			button.prop('checked', function(){
				return this.defaultChecked;
			});
			isCheckbox = true;
		} else if(button.is('a')){
			button.on('click', function(e){
				e.preventDefault();
			});
		}

		return txtChangeFn;
	};

	$.fn.jmePlayer = function(opts){

		return this.each(function(){
			if(opts){
				$.jme.data(this, $.extend(true, {}, opts));
			}

			var mediaUpdateFn, canPlay, removeCanPlay, canplayTimer, playerSize;
			var media = $('audio, video', this).eq(0);
			var base = $(this);

			var jmeData = $.jme.data(this);
			var mediaData = $.jme.data(media[0]);


			base.addClass(media.prop('nodeName').toLowerCase()+'player');
			mediaData.player = base;
			mediaData.media = media;
			if(!jmeData.media){

				removeCanPlay = function(){
					media.off('canplay', canPlay);
					clearTimeout(canplayTimer);
				};
				canPlay = function(){
					var state = (media.prop('paused')) ? 'idle' : 'playing';
					base.attr('data-state', state);
				};
				mediaUpdateFn = function(e){
					var state = e.type;
					var readyState;
					var paused;
					removeCanPlay();

					if(state == 'ended' || $.prop(this, 'ended')){
						state = 'ended';
					} else if(state == 'waiting'){

						if($.prop(this, 'readyState') > 2){
							state = '';
						} else {
							canplayTimer = setTimeout(function(){
								if(media.prop('readyState') > 2){
									canPlay();
								}
							}, 9);
							media.on('canPlay', canPlay);
						}

					} else if(idlStates[state]){
						state = 'idle';
					} else {
						readyState = $.prop(this, 'readyState');
						paused = $.prop(this, 'paused');
						if(!paused && readyState < 3){
							state = 'waiting';
						} else if(!paused && readyState > 2){
							state = 'playing';
						} else {
							state = 'idle';
						}
					}

					if(state == 'idle' && base._seekpause){
						state = false;
					}
					if(state){
						base.attr('data-state', state);
					}
				};

				playerSize = (function(){
					var lastSize;
					var sizes = [
						{size: 380, name: 'x-small'},
						{size: 490, name: 'small'},
						{size: 756, name: 'medium'},
						{size: 1024, name: 'large'}
					];

					var len = sizes.length;
					return function(){
						var size = 'x-large';
						var i = 0;
						var width = base.outerWidth();
						for(; i < len; i++){
							if(sizes[i].size >= width){
								size = sizes[i].name;
								break;
							}
						}
						if(lastSize != size){
							lastSize = size;
							base.attr('data-playersize', size);
						}
					};
				})();
				jmeData.media = media;
				jmeData.player = base;
				media
					.on('ended', function(){
						removeCanPlay();
						media.jmeFn('pause');
						if(!options.noReload && !media.prop('autoplay') && !media.prop('loop') && !media.hasClass('no-reload')){
							media.jmeFn('load');
						}
					})
					.on('emptied waiting canplay canplaythrough playing ended pause mediaerror', mediaUpdateFn)
					.on('volumechange updateJMEState', function(){
						var volume = $.prop(this, 'volume');
						base[!volume || $.prop(this, 'muted') ? 'addClass' : 'removeClass']('state-muted');

						if(volume < 0.01){
							volume = 'no';
						} else if(volume < 0.36){
							volume = 'low';
						} else if(volume < 0.7){
							volume = 'medium';
						} else {
							volume = 'high';
						}
						base.attr('data-volume', volume);
					})
				;

				base
					.on({
						useractive: function(){
							base.attr('data-useractivity', 'true');
						}
					})
					.on('userinactive', {idletime: 3500}, function(){
						base.attr('data-useractivity', 'false');
					})
					.triggerHandler('userinactive')
				;

				playerSize();
				webshims.ready('dom-support', function(){
					base.onWSOff('updateshadowdom', playerSize);
					webshims.addShadowDom();
				});
				if(mediaUpdateFn){
					media.on('updateJMEState', mediaUpdateFn).triggerHandler('updateJMEState');
				}
			}
		});
	};


	$.jme.defineProp('isPlaying', {
		get: function(elem){
			return (!$.prop(elem, 'ended') && !$.prop(elem, 'paused') && $.prop(elem, 'readyState') > 1 && !$.data(elem, 'mediaerror'));
		},
		readonly: true
	});

	$.jme.defineProp('player', {
		readonly: true
	});

	$.jme.defineProp('media', {
		readonly: true
	});

	$.jme.defineProp('srces', {
		get: function(elem){
			var srces;
			var data = $.jme.data(elem);
			var src = data.media.prop('src');
			if(src){
				return [{src: src}];
			}
			srces = $.map($('source', data.media).get(), function(source){
				var src = {
					src: $.prop(source, 'src')
				};
				var tmp = $.attr(source, 'media');
				if(tmp){
					src.media = tmp;
				}
				tmp = $.attr(source, 'type');
				if(tmp){
					src.type = tmp;
				}
				return src;
			});
			return srces;
		},
		set: function(elem, srces){
			var data = $.jme.data(elem);

			var setSrc = function(i, src){
				if(typeof src == 'string'){
					src = {src: src};
				}
				$(document.createElement('source')).attr(src).appendTo(data.media);
			};
			data.media.removeAttr('src').find('source').remove();
			if($.isArray(srces)){
				$.each(srces, setSrc);
			} else {
				setSrc(0, srces);
			}
			data.media.jmeFn('load');
			return 'noDataSet';
		}
	});

	$.jme.defineMethod('togglePlay', function(){
		$(this).jmeFn( ( props.isPlaying.get(this) ) ? 'pause' : 'play' );
	});


	$.jme.defineMethod('addControls', function(controls){
		var data = $.jme.data(this) || {};

		if(!data.media){return;}
		var oldControls = $.jme.data(data.player[0], 'controlElements') || $([]);
		controls = $(controls);
		$.each($.jme.plugins, function(name, plugin){
			controls
				.filter('.'+plugin.className)
				.add(controls.find('.'+plugin.className))
				.each(function(){
					var control = $(this);
					var options = $.jme.data(this);
					options.player = data.player;
					options.media = data.media;
					if(options._rendered){return;}
					options._rendered = true;

					if(plugin.options){
						$.each(plugin.options, function(option, value){
							if(!(option in options)){
								options[option] = value;
							}
						});
					}
					plugin._create(control, data.media, data.player, options);
					control = null;
				})
			;
		});

		$.jme.data(data.player[0], 'controlElements', oldControls.add(controls));

		data.player.triggerHandler('controlsadded');
	});




	(function(){
		var activity = {
			add: function(elem, cfg, name){
				var data 		= $.data(elem, 'jmeuseractivity') || $.data(elem, 'jmeuseractivity', {idletime: 2500, idle: true, trigger: {}}),
					jElm 		= $(elem),
					setInactive = function(){
						if(!data.idle){
							data.idle = true;
							if ( data.trigger.userinactive ) {
								jElm.trigger('userinactive');
							}
						}
					},
					x, y,
					setActive 	= function(e){
						if(!e || (e.type === 'mousemove' && e.pageX === x && e.pageY === y)){return;}
						if(e.type === 'mousemove'){
							 x = e.pageX;
							 y = e.pageY;
						}
						if(data.idleTimer){
							clearTimeout(data.idleTimer);
						}
						data.idleTimer = setTimeout(setInactive, data.idletime);
						if(data.idle){
							data.idle = false;
							if( data.trigger.useractive ){
								jElm.trigger('useractive');
							}
						}
					}
				;

				data.idletime = (cfg || {}).idletime || data.idletime;
				if(cfg && 'idle' in cfg){
					data.idle = cfg.idle;
				}
				data.trigger[name] = true;

				if(!data.bound){
					jElm
						.on('mouseleave.jmeuseractivity', setInactive)
						.on('mousemove.jmeuseractivity focusin.jmeuseractivity mouseenter.jmeuseractivity keydown.jmeuseractivity keyup.jmeuseractivity mousedown.jmeuseractivity', setActive)
					;
					data.bound = true;
				}
				if(!data.idle){
					setActive({type: 'initunidled'});
				}
			},
			remove: function(elem, name){
				var data = $.data(elem, 'jmeuseractivity') || $.data(elem, 'jmeuseractivity', {idletime: 2500, idle: true, trigger: {}});
				data.trigger[name] = false;
				if(!data.trigger.useractive && !data.trigger.userinactive){
					$(elem).off('.jmeuseractivity');
					data.bound = false;
				}
			}
		};
		$.each(['useractive', 'userinactive'], function(i, name){
			$.event.special[name] = {
				setup: function(cfg){
					activity.add(this, cfg, name);
				},
				teardown: function(){
					activity.remove(this, name);
				}
			};
		});
	})();


	webshims.ready('mediaelement', function(){
		webshims.addReady($.jme.initJME);
	});
	webshims._polyfill(['mediaelement']);
});



;webshims.register('mediacontrols', function($, webshims, window, doc, undefined){
	"use strict";
	var pseudoClasses = 'pseudoClasses';
	var playStates = {
		play: 1,
		playing: 1
	};
	var options = webshims.cfg.mediaelement.jme;
	var baseSelector = options.selector;

	var pauseStates = {
		pause: 1,
		ended: 1
	};

	var loadRange = function(){
		webshims.loader.loadList(['range-ui']);
	};
	var onSliderReady = function(fn){
		loadRange();
		webshims.ready('range-ui', fn);
	};

	var btnStructure = '<button class="{%class%}" type="button" aria-label="{%text%}"></button>';
	var defaultStructure = '<div  class="{%class%}"></div>';
	var slideStructure = '<div class="{%class%}"></div>';
	var noVolumeClass = (function(){
		var audio;
		var ret = '';
		if(typeof window.Audio == 'function'){
			audio = new Audio();
			audio.volume = 0.55;
			ret = audio.volume = 0.55 ? '' : ' no-volume-api';
		}
		return ret;
	})();

	var getBarHtml = (function(){
		var cache = {};
		var regTemplate = /\{\{(.+?)\}\}/igm;

		return function(template, invalidCache){
			if(!template){
				template = options.barTemplate;
			}
			if(!cache[template] || invalidCache){
				cache[template] = template.replace(regTemplate, function(match, matchName){
					var plugin = $.jme.plugins[matchName];
					if(plugin && plugin.structure){
						return plugin.structure.replace('{%class%}', matchName).replace('{%text%}', plugin.text || '');
					}
					return match;
				});
			}

			return cache[template] || '';
		};
	})();

	if(!options.barTemplate){
		options.barTemplate = '<div class="play-pause-container">{{play-pause}}</div><div class="playlist-container"><div class="playlist-box">{{playlist-prev}}{{playlist-next}}</div></div><div class="currenttime-container">{{currenttime-display}}</div><div class="progress-container">{{time-slider}}</div><div class="duration-container">{{duration-display}}</div><div class="mute-container">{{mute-unmute}}</div><div class="volume-container">{{volume-slider}}</div><div class="subtitle-container"><div class="subtitle-controls">{{captions}}</div></div><div class="fullscreen-container">{{fullscreen}}</div>';
	}
	if(!options.barStructure){
		options.barStructure = '<div class="jme-media-overlay"></div><div class="jme-controlbar'+ noVolumeClass +'" tabindex="-1"><div class="jme-cb-box"></div></div>';
	}



	$.jme.defineProp('controlbar', {
		set: function(elem, value){
			value = !!value;
			var data = $.jme.data(elem);
			var controlBar = $('div.jme-mediaoverlay, div.jme-controlbar', data.player);
			var structure = '';
			var controls;
			if(value && !controlBar[0]){
				if(data._controlbar){
					data._controlbar.appendTo(data.player);
				} else {
					data.media.prop('controls', false);

					structure = getBarHtml();
					data._controlbar = $( options.barStructure );
					controlBar = data._controlbar.find('div.jme-cb-box').addClass('media-controls');
					controls = data._controlbar.filter('.jme-media-overlay').addClass('play-pause');
					controls =  controls.add( controlBar );
					$(structure).appendTo(controlBar);
					data._controlbar.appendTo(data.player);
					data.player.jmeFn('addControls', controls);
				}

			} else if(!value) {
				controlBar.detach();
			}
			controlBar = null;
			controls = null;
			return value;
		}
	});

	$.jme.registerPlugin('play-pause', {
		pseudoClasses: {
			play: 'state-paused',
			pause: 'state-playing'
		},
		structure: btnStructure,
		text: 'play / pause',
		_create: function(control, media){
			var textFn = $.jme.getButtonText(control, [this[pseudoClasses].play, this[pseudoClasses].pause]);

			media
				.on('play playing ended pause updateJMEState', function(e){
					var state = e.type;
					if(playStates[state]){
						state = 1;
					} else if(pauseStates[state]) {
						state = 0;
					} else {
						state = (media.jmeProp('isPlaying') )? 1 : 0;
					}
					textFn(state);
				})
				.triggerHandler('updateJMEState')
			;
			control.on((control.is('select')) ? 'change' : 'click', function(e){
				media.jmeFn('togglePlay');
				e.stopPropagation();
			});

		}
	});

	$.jme.registerPlugin('mute-unmute', {
		pseudoClasses: {
			mute: 'state-mute',
			unmute: 'state-unmute'
		},
		structure: btnStructure,
		text: 'mute / unmute',
		_create: function(control, media, base){
			var textFn = $.jme.getButtonText(control, [this[pseudoClasses].mute, this[pseudoClasses].unmute]);
			media
				.on('volumechange updateJMEState', function(e){
					textFn(media.prop('muted') ? 1 : 0);
				})
				.triggerHandler('updateJMEState')
			;

			control.on((control.is('select')) ? 'change' : 'click', function(e){
				media.prop('muted', !media.prop('muted'));
				e.stopPropagation();
			});

		}
	});

	function createGetSetHandler(fns){
		var throttleTimer;
		var blocked;

		if(fns.release === true){
			fns.release = fns.set;
		}
		var getSetHelper = {
			start: function(){
				if(!blocked){
					blocked = true;
					if(fns.start){
						fns.start();
					}
				}
			},
			release: function(){
				if(blocked){
					blocked = false;

					if(fns.release){
						fns.release();
					}
				}
			},
			get: function(){
				if(blocked){return;}
				return fns.get.apply(this, arguments);
			},
			set: function(){

				var that = this;
				var args = arguments;
				getSetHelper.start();
				clearTimeout(throttleTimer);
				throttleTimer = setTimeout(function(){
					fns.set.apply(that, args);
				}, 33);
			}
		};
		getSetHelper.fns = fns;
		return getSetHelper;
	}

	$.jme.registerPlugin('volume-slider', {
		structure: slideStructure,

		_create: function(control, media, base){

			var createFn = function(){
				var api, volume;

				volume = createGetSetHandler({
					get: function(){
						var volume = media.prop('volume');
						if(volume !== undefined){
							api.value(volume);
						}
					},
					set: function(){
						media.prop({
							muted: false,
							volume: api.options.value
						});
					},
					release: true
				});

				api = control
					.rangeUI({
						min: 0,
						max: 1,
						//animate: true,
						step: 'any',
						input: volume.set,
						change: volume.release,
						baseClass: 'media-range'
					})
					.data('rangeUi')
				;
				media.on('volumechange', volume.get);
			};

			onSliderReady(createFn);
		}
	});

	$.jme.registerPlugin('time-slider', {
		structure: slideStructure,
		pseudoClasses: {
			no: 'no-duration'
		},
		options: {
			format: ['mm', 'ss']
		},
		_create: function(control, media, base){

			var module = this;

			var createFn = function(){
				var time, durationChange, api, timeShow, wasPaused;
				var hasDuration = 'has-duration';
				var duration = media.prop('duration');

				time = createGetSetHandler({
					get: function(){
						var time = media.prop('currentTime');
						if(!isNaN(time)){
							try {
								api.value(time);
							} catch(er){}
						}

					},
					set: function(){
						try {
							media.prop('currentTime', api.options.value).triggerHandler('timechanged', [api.options.value]);
						} catch(er){}
					},
					start: function(){
						if(wasPaused == null){
							wasPaused = media.prop('paused');
							if(!wasPaused){
								base._seekpause = true;
								media.pause();
							} else {
								base._seekpause = false;
							}
						}
					},
					release: function(){
						time.fns.set();
						if(wasPaused === false){
							media.play();
						}
						if('_seekpause' in base){
							delete base._seekpause;
						}
						wasPaused = null;
					}
				});

				durationChange = function(){
					duration = media.prop('duration');
					hasDuration = duration && isFinite(duration) && !isNaN(duration);
					if(hasDuration){
						api.disabled(false);
						api.max(duration);

						base.removeClass(module[pseudoClasses].no);
					} else {
						api.disabled(true);
						api.max(Number.MAX_VALUE);
						base.addClass(module[pseudoClasses].no);
					}
				};

				api = control
					.rangeUI({
						min: 0,
						value: media.prop('currentTime') || 0,
						step: 'any',
						input: time.set,
						change: time.release,
						textValue: function(val){
							return media.jmeFn('formatTime', val);
						},
						baseClass: 'media-range'
					})
					.data('rangeUi')
				;

				timeShow = $('<span class="time-select" />').appendTo(control);

				control
					.on({
						'mouseenter': function(e){
							if(hasDuration){
								var widgetLeft = (control.offset() || {left: 0}).left;
								var widgetWidth = control.innerWidth();
								var posLeft = function(x){
									var perc = (x - widgetLeft) / widgetWidth * 100;
									timeShow
										.html(media.jmeFn('formatTime', duration * perc / 100))
										.css({left: perc+'%'})
									;
								};

								setTimeout(function(){
									posLeft(e.pageX);
									timeShow.addClass('show-time-select');
								});
								control
									.off('.jmetimeselect')
									.on('mousemove.jmetimeselect', function(e){
										posLeft(e.pageX);
									})
								;
							}
						},
						mouseleave: function(){
							setTimeout(function(){
								timeShow.removeClass('show-time-select');
								control.off('.jmetimeselect');
							});
						}
					})
				;


				media.on({
					timeupdate: time.get,
					emptied: function(){
						durationChange();
						api.value(0);
					},
					durationchange: durationChange
				});

				base.jmeFn('addControls', $('<div class="buffer-progress" />').prependTo(control) );
				durationChange();
			};

			onSliderReady(createFn);
		}
	});


	$.jme.defineMethod('concerningRange', function(type, time){
		var elem = this;
		var ret = {start: 0, end: 0};
		if(!type){
			type = 'buffered';
		}
		type = $.prop(elem, type);

		if(time == null){
			time = $.prop(elem, 'currentTime');
		}
		if(!type || !('length' in type)){return ret;}
		for(var i = 0, len = type.length; i < len; i++){
			ret.start = type.start(i);
			ret.end = type.end(i);
			if(ret.start <= time && ret.end >= time){
				break;
			}
		}
		return ret;
	});

	$.jme.defineProp('progress', {
		get: function(elem){
			var data = $.jme.data(elem);
			if(!data.media){return 0;}
			var progress = data.media.jmeFn('concerningRange').end / data.media.prop('duration') * 100;
			if(progress > 99.4){
				progress = 100;
			}
			return progress || 0;
		},
		readonly: true
	});

	$.jme.registerPlugin('buffer-progress', {
		_create: function(control, media, base, options){
			var indicator = $('<div class="buffer-progress-indicator" />').appendTo(control);
			var drawBufferProgress = function(){
				var progress = media.jmeProp('progress');


				if(options.progress !== progress){
					options.progress = progress;
					indicator.css('width', progress +'%');
				}
			};
			media.on({
				progress: drawBufferProgress,
				emptied: function(){
					indicator.css('width', 0);
					options.progress = 0;
				},
				playing: drawBufferProgress
			});
			drawBufferProgress();
		}
	});

	var times = {
		hh: 60000,
		mm: 60,
		ss: 1,
		ms: 1/1000
	};
	var formatTime = function(sec, format){
		var data;
		if(!format){
			format = ['mm', 'ss'];
		}
		if(sec == null){
			data = $.jme.data(this);
			sec = $.prop(data.media, 'duration');
		}
		if(!sec){
			sec = 0;
		}
		var formated = [];
		var frac;
		for(var i = 0, len = format.length; i < len; i++){
			if(format[i] == 'ms' && i == len -1 ){
				frac = Math.round( (sec / times[format[i]]) / 10);
			} else {
				frac = parseInt(sec / times[format[i]], 10);
				sec = sec % times[format[i]];
			}
			if(frac < 10){
				frac = '0'+frac;
			}
			formated.push( frac );
		}

		return formated.join(':');
	};
	$.jme.defineMethod('formatTime', formatTime);

	$.jme.defineProp('format', {
		set: function(elem, format){
			if(!$.isArray(format)){
				format = format.split(':');
			}
			var data = $.jme.data(elem);
			data.format = format;
			$(elem).triggerHandler('updatetimeformat');
			data.player.triggerHandler('updatetimeformat');
			return 'noDataSet';
		}
	});

	$.jme.registerPlugin('duration-display', {
		structure: defaultStructure,
		options: {
			format: "mm:ss"
		},
		_create: function(control, media, base, options){
			if(typeof options.format == 'string'){
				options.format = options.format.split(':');
			}
			var showDuration = function(){
				control.html(formatTime(media.prop('duration'), options.format));
			};
			media.on('durationchange emptied', showDuration);

			control
				.on('updatetimeformat', showDuration)
				.jmeProp('format', options.format)
			;
		}
	});

	$.jme.defineProp('countdown', {
		set: function(elem, value){

			var data = $.jme.data(elem);
			data.countdown = !!value;
			$(elem).triggerHandler('updatetimeformat');
			data.player.triggerHandler('updatetimeformat');
			return 'noDataSet';
		}
	});

	$.jme.registerPlugin('currenttime-display', {
		structure: defaultStructure,
		options: {
			format: "mm:ss",
			countdown: false
		},
		_create: function(control, media, base, options){
			if(typeof options.format == 'string'){
				options.format = options.format.split(':');
			}

			var showTime = function(e){
				var currentTime = media.prop('currentTime');
				if(options.countdown){
					currentTime = (media.prop('duration') || 0) - currentTime;
					if(currentTime < 0.7){
						currentTime = 0;
					}
				}
				control.html(formatTime(currentTime, options.format));
			};
			media.on('timeupdate emptied durationchange', showTime);

			control
				.on('updatetimeformat', showTime)
				.jmeProp('format', options.format)
			;
		}
	});


	/**
	 * Added Poster Plugin
	 * @author mderting
	 */

	/*
	 * the old technique wasn't fully bullet proof
	 * beside this, jme2 adovactes to use the new improved state-classes to handle visual effect on specific state (see CSS change)
	 */
	$.jme.registerPlugin('poster-display', {
		structure: '<div />',
		options: {
		},
		_create: function(control, media, base, options){

			/* Empty span element used for vertical centering in IE7 - thanks to Bruno Fassino.
			 * @see http://www.brunildo.org/test/img_center.html
			 */
			var updatePoster = function(){
				var poster = media.prop('poster');
				if(poster){
					control.html('<span></span><img src="'+ poster +'" class="poster-image" />');
				} else {
					control.empty();
				}
			};
			media.on('emptied', updatePoster);
			updatePoster();
		}
	});

	//taken from http://johndyer.name/native-fullscreen-javascript-api-plus-jquery-plugin/
	$.jme.fullscreen = (function() {
		var parentData;
		var frameData;
		var doc = document.documentElement;

		var fullScreenApi = {
			supportsFullScreen: Modernizr.prefixed('fullscreenEnabled', document, false) || Modernizr.prefixed('fullScreenEnabled', document, false),
			isFullScreen: function() { return false; },
			requestFullScreen: function(elem){
				var tmpData;
				parentData = [];
				$(elem).parentsUntil('body').each(function(){
					var pos =  $.css(this, 'position');
					var left = this.scrollLeft;
					var top = this.scrollTop;
					var changed;
					tmpData = {elemStyle: this.style, elem: this};
					if(pos !== 'static'){
						changed = true;
						tmpData.pos = tmpData.elemStyle.position;
						this.style.position = 'static';
					}
					if(left){
						changed = true;
						tmpData.left = left;
					}
					if(top){
						changed = true;
						tmpData.top = top;
					}
					if(changed){
						parentData.push(tmpData);
					}
				});
				frameData = false;
				try {
					frameData = {elemStyle: frameElement.style, elem: frameElement, css: {}};
					frameData.css.position = frameData.elemStyle.position;
					frameData.elemStyle.position = 'fixed';
					$.each(['top', 'left', 'right', 'bottom'], function(i, name){
						frameData.css[name] = frameData.elemStyle[name];
						frameData.elemStyle[name] = '0px';
					});
					$.each(['height', 'width'], function(i, name){
						frameData.css[name] = frameData.elemStyle[name];
						frameData.elemStyle[name] = '100%';
					});
				} catch(er){
					frameData = false;
				}

				tmpData = null;
			},
			cancelFullScreen: function(){
				if(parentData){
					$.each(parentData, function(i, data){
						if('pos' in data){
							data.elemStyle.position = data.pos;
						}
						if(data.left){
							data.elem.scrollLeft = data.left;
						}
						if(data.top){
							data.elem.scrollTop = data.top;
						}
						data = null;
					});
					parentData = [];
				}
				if(frameData){
					$.each(frameData.css, function(name, value){
						frameData.elemStyle[name] = value;
					});
					frameData = false;
				}
			},
			eventName: 'fullscreenchange',
			exitName: 'exitFullscreen',
			requestName: 'requestFullscreen',
			elementName: 'fullscreenElement',
			enabledName: ''
		};

		fullScreenApi.cancelFullWindow = fullScreenApi.cancelFullScreen;
		fullScreenApi.requestFullWindow = fullScreenApi.requestFullScreen;

		// update methods to do something useful
		if (fullScreenApi.supportsFullScreen) {
			fullScreenApi.enabledName = fullScreenApi.supportsFullScreen;
			fullScreenApi.exitName = Modernizr.prefixed("exitFullscreen", document, false) || Modernizr.prefixed("cancelFullScreen", document, false);
			fullScreenApi.elementName = Modernizr.prefixed("fullscreenElement", document, false) || Modernizr.prefixed("fullScreenElement", document, false);
			fullScreenApi.supportsFullScreen = !!fullScreenApi.supportsFullScreen;
			if(fullScreenApi.elementName != 'fullscreenElement' || fullScreenApi.exitName != 'exitFullscreen' || fullScreenApi.enabledName != 'fullscreenEnabled'){
				$.each(Modernizr._domPrefixes, function(i, prefix){
					var requestName = prefix+'RequestFullscreen';
					if((requestName in doc) || ((requestName = prefix+'RequestFullScreen') && (requestName in doc))){
						fullScreenApi.eventName = prefix + 'fullscreenchange';
						fullScreenApi.requestName = requestName;
						return false;
					}
				});
			}

			fullScreenApi.isFullScreen = function() {
				return document[fullScreenApi.elementName];
			};
			fullScreenApi.requestFullScreen = function(el) {
				return el[fullScreenApi.requestName]();
			};
			fullScreenApi.cancelFullScreen = function() {
				return document[fullScreenApi.exitName]();
			};
		}

		if(!window.Modernizr || !('fullscreen' in Modernizr)){
			$('html').addClass(fullScreenApi.supportsFullScreen ? 'fullscreen' : 'no-fullscreen');
		}

		if(window.parent != window){
			(function(){
				try{
					var frame = window.frameElement;
					if (fullScreenApi.supportsFullScreen) {
						if('allowfullscreen' in frame && !frame.allowfullscreen) {
							frame.allowfullscreen = true;
						} else {
							if(frame.getAttribute('webkitallowfullscreen') == null){
								frame.setAttribute('webkitallowfullscreen', '');
							}
							if(frame.getAttribute('allowfullscreen') == null){
								frame.setAttribute('allowfullscreen', 'allowfullscreen');
							}
						}
					}
				} catch(er){
					if(!fullScreenApi.supportsFullScreen){
						$('html').addClass('no-fullwindow');
					}
				}
			})();

		}


		return fullScreenApi;
	})();

	$.jme.defineProp('fullscreen', {
		set: function(elem, value){
			var data = $.jme.data(elem);

			if((!data || !data.player) && !$(elem).hasClass('player-fullscreen')){return 'noDataSet';}
			if(value){
				if(data.player.hasClass('player-fullscreen')){return 'noDataSet';}

				data.scrollPos = {
					top: $(window).scrollTop(),
					left: $(window).scrollLeft()
				};

				$(document)
					.off('.jmefullscreen')
					.on('keydown.jmefullscreen', function(e){
						if(e.keyCode == 27){
							data.player.jmeProp('fullscreen', false);
							return false;
						}
						if(e.keyCode === 32 && !('form' in e.target)){
							data.media.jmeFn('togglePlay');
							return false;
						}
					})
				;


				if(value == 'fullwindow'){
					$.jme.fullscreen.requestFullWindow(data.player[0]);
				} else {
					try {
						$.jme.fullscreen.requestFullScreen(data.player[0]);
					} catch(er){}
				}


				$('html').addClass('has-media-fullscreen');

				data.player.addClass('player-fullscreen');

				data.media.addClass('media-fullscreen');

				$('button.play-pause', data.player).trigger('focus');

				if($.jme.fullscreen.supportsFullScreen){
					$(document)
						.on($.jme.fullscreen.eventName+'.jmefullscreen', function(e){
							var fullScreenElem = $.jme.fullscreen.isFullScreen();
							if(fullScreenElem && elem == fullScreenElem){
								data.media.trigger('playerdimensionchange', ['fullscreen']);
							} else {
								data.player.jmeProp('fullscreen', false);
							}
						})
					;

				}
				data.media.trigger('playerdimensionchange', ['fullwindow']);

			} else {
				if(data.player && !data.player.hasClass('player-fullscreen')){return 'noDataSet';}
				$(document).off('.jmefullscreen');
				$('html').removeClass('has-media-fullscreen');
				if(data.player && data.media){
					data.player.removeClass('player-fullscreen');
					data.media.removeClass('media-fullscreen');
				}
				if($.jme.fullscreen.isFullScreen()){
					try {
						$.jme.fullscreen.cancelFullScreen();
					} catch(er){}
				} else {
					$.jme.fullscreen.cancelFullWindow();
				}
				
				if(data.scrollPos){
					$(window).scrollTop(data.scrollPos.top);
					$(window).scrollLeft(data.scrollPos.left);
					delete data.scrollPos;
				}
				if(data.media){
					data.media.trigger('playerdimensionchange');
				}
			}
			return 'noDataSet';
		},
		get: function(elem){
			var data = $.jme.data(elem);
			if(!data || !data.player){return;}
			var fs = data.player.hasClass('player-fullscreen');
			if(!fs){return false;}
			return $.jme.fullscreen.isFullScreen() || 'fullwindow';
		}
	});

	$.jme.defineProp('autoplayfs');

	$.jme.registerPlugin('fullscreen', {
		pseudoClasses: {
			enter: 'state-enterfullscreen',
			exit: 'state-exitfullscreen'
		},
		options: {
			fullscreen: true,
			autoplayfs: false
		},
		structure: btnStructure,
		text: 'enter fullscreen / exit fullscreen',
		_create: function(control, media, base){
			var textFn = $.jme.getButtonText(control, [this[pseudoClasses].enter, this[pseudoClasses].exit]);
			var updateControl = function(){
				textFn(base.hasClass('player-fullscreen') ? 1 : 0);
			};
			var options = this.options;
			var addDoubbleClick = function(){
				$(base.data('jme').controlElements)
					.filter('.jme-media-overlay')
					.off('.dblfullscreen')
					.on('dblclick.dblfullscreen', function(e){
						base.jmeProp('fullscreen', !base.jmeProp('fullscreen'));
					})
				;
			};

			base.on('controlsadded', addDoubbleClick);

			base.on('playerdimensionchange', updateControl);

			control.on((control.is('select')) ? 'change' : 'click', function(){
				var value = base.hasClass('player-fullscreen') ? false : options.fullscreen;
				base.jmeProp('fullscreen', value);
				if(value && options.autoplayfs){
					media.jmeFn('play');
				}
			});
			addDoubbleClick();
			updateControl();
		}
	});


	$.jme.ButtonMenu = function(button, menu, clickHandler){

		this.button = $(button).attr({'aria-haspopup': 'true'});

		this.clickHandler = clickHandler;

		this.toggle = $.proxy(this, 'toggle');
		this.keyIndex = $.proxy(this, 'keyIndex');
		this._buttonClick = $.proxy(this, '_buttonClick');


		this.addMenu(menu);
		this._closeFocusOut();
		this.button.on('click', this.toggle);

	};

	$.jme.ButtonMenu.prototype = {
		addMenu: function(menu){
			if(this.menu){
				this.menu.remove();
			}
			this.menu = $(menu);
			this.buttons = $('button', this.menu);
			this.menu.insertAfter(this.button);
			this.menu
				.on('keydown', this.keyIndex)
				.delegate('button', 'click', this._buttonClick)
			;
		},
		_closeFocusOut: function(){
			var that  = this;
			var timer;
			var stopFocusOut = function(){
				clearTimeout(timer);
				setTimeout(function(){
					clearTimeout(timer);
				}, 9);
			};
			this.menu
				.parent()
				.on('focusin', stopFocusOut)
				.on('mousedown', stopFocusOut)
				.on('focusout', function(e){
					timer = setTimeout(function(){
						that.hide();
					}, 40);
				})
			;
		},
		_buttonClick: function(e){
			this.clickHandler(this.buttons.index(e.currentTarget), e.currentTarget);
			this.hide();
		},
		keyIndex: function(e){
			var dir = (e.keyCode == 40) ? 1 : (e.keyCode == 38) ? -1 : 0;
			if(dir){
				var buttons = this.buttons.not(':disabled');
				var activeButton = buttons.filter(':focus');

				activeButton = buttons[buttons.index(activeButton) + dir] || buttons.filter(dir > 0 ? ':first' : ':last');
				activeButton.focus();
				e.preventDefault();
			}
		},
		show: function(){
			if(this.isVisible){return;}
			var buttons = this.buttons.not(':disabled');
			this.isVisible = true;
			this.menu.addClass('visible-menu');
			try {
				this.activeElement = document.activeElement || this.button[0];
			} catch(er){
				this.activeElement = this.button[0];
			}

			setTimeout(function(){
				$(buttons.filter('[aria-checked="true"]')[0] || buttons[0]).focus();
			}, 60);
		},
		toggle: function(){
			this[this.isVisible ? 'hide' : 'show']();
		},
		hide: function(){
			if(!this.isVisible){return;}
			this.isVisible = false;
			this.menu.removeClass('visible-menu');
			if(this.activeElement){
				try {
					this.activeElement.focus();
				} catch(er){}
			}
			this.activeElement = false;
		}
	};

	var showKinds = {subtitles: 1, caption: 1};
	var getTrackMenu = function(tracks){
		var items = $.map(tracks, function(track){
				var className = (track.kind == 'caption') ? 'caption-type' : 'subtitle-type';
				var lang = track.language;
				lang = (lang) ? ' <span class="track-lang">'+ lang +'</span>' : '';
				return '<li class="'+ className +'" role="presentation"><button role="menuitemcheckbox">'+ track.label + lang +'</button></li>';
			})
			;
		return '<div><ul>' + items.join('') +'</ul></div>';
	};


	$.jme.registerPlugin('captions', {
		pseudoClasses: {
			menu: 'subtitle-menu'
		},
		structure: btnStructure,
		text: 'subtitles',
		_create: function(control, media, base, options){
			var that = this;

			var trackElems = media.find('track');
			var checkbox = $(control).clone().attr({role: 'checkbox'}).insertBefore(control);

			base.attr('data-tracks', trackElems.length > 1 ? 'many' : trackElems.length);
			control.attr('aria-haspopup', 'true');

			webshims.ready('track', function(){
				var menuObj, throttledUpdateMode;
				var tracks = [];
				var textTracks = media.prop('textTracks');

				var throttledUpdate = (function(){
					var timer;
					var triggerTimer;
					return function(e){
						clearTimeout(timer);
						clearTimeout(triggerTimer);
						if(e.type == 'updatesubtitlestate'){
							triggerTimer = setTimeout(function(){
								media.trigger('updatetracklist');
							}, 0);
						}
						timer = setTimeout(updateTrackMenu, 19);
					};
				})();

				function createSubtitleMenu(menu){
					var menuClick;

					if(!menuObj){
						menuClick = function(index, button){
							if($.attr(button, 'aria-checked') == 'true'){
								tracks[index].mode = 'disabled';
							} else {
								$.each(tracks, function(i, track){
									track.mode = (i == index) ? 'showing' : 'disabled';
								});
							}
							media.prop('textTracks');
							updateMode();
						};

						menuObj = new $.jme.ButtonMenu(control, menu, menuClick);
						checkbox.on('click', function(){
							menuClick(0, this);
							return false;
						});
					} else {
						menuObj.addMenu(menu);
					}

					updateMode();
				}

				function updateMode(){
					$('button', menuObj.menu).each(function(i){
						var checked = (tracks[i].mode == 'showing') ? 'true' : 'false';
						if(!i){
							checkbox.attr('aria-checked', checked);
						}
						$.attr(this, 'aria-checked', checked);
					});
				}

				function updateTrackMenu(){
					tracks = [];
					$.each(textTracks, function(i, track){
						if(showKinds[track.kind] && track.readyState != 3){
							tracks.push(track);
						}
					});

					base.attr('data-tracks', tracks.length > 1 ? 'many' : tracks.length);

					if(tracks.length){
						createSubtitleMenu('<div class="'+that[pseudoClasses].menu +'" >'+ (getTrackMenu(tracks)) +'</div>');

						$('span.jme-text, label span.jme-text', checkbox).text((tracks[0].label || ' ') + (tracks[0].lang || ''));

						if(!base.hasClass(that[pseudoClasses].hasTrack) || base.hasClass(that[pseudoClasses].noTrack)){
							control.prop('disabled', false);
							base.triggerHandler('controlschanged');
						}

					} else if(!base.hasClass(that[pseudoClasses].noTrack) || base.hasClass(that[pseudoClasses].hasTrack)){
						control.prop('disabled', true);
						base
							.triggerHandler('controlschanged')
						;
					}
				}

				if(!textTracks){
					textTracks = [];
					updateTrackMenu();
				} else {
					throttledUpdateMode = (function(){
						var timer;
						return function(){
							clearTimeout(timer);
							timer = setTimeout(updateMode, 20);
						};
					})();

					updateTrackMenu();

					$([textTracks])
						.on('addtrack removetrack', throttledUpdate)
						.on('change', throttledUpdateMode)
					;

					base.on('updatesubtitlestate', throttledUpdate);
					media.on('updatetrackdisplay', throttledUpdateMode);
				}

			});
		}
	});

	webshims.ready(webshims.cfg.mediaelement.plugins, function(){
		webshims.addReady(function(context, insertedElement){
			$(baseSelector, context).add(insertedElement.filter(baseSelector)).jmeProp('controlbar', true);
		});
	});
	webshims.ready('WINDOWLOAD', loadRange);
});
;webshims.register('playlist', function($, webshims){
	"use strict";
	var jme = $.jme;
	var listId = 0;
	var btnStructure = '<button class="{%class%}" type="button" aria-label="{%text%}"></button>';

	function PlaylistList(data){
		this.data = data;
		this._autoplay = null;
		this.lists = {};


		this.onaddlist = null;
		this.onremovelist = null;

		this.onitemchange = null;
		this.onloopchange = null;
		this.onautoplaychange = null;
	}

	$.extend(PlaylistList.prototype, {
		add: function(list, opts){

			list = new Playlist(list, this, opts);
			if(!list.id){
				listId++;
				list.id = 'list-'+listId;
			}
			this.lists[list.id] = list;

			if(list.options.showControls){
				this.data.player.addClass('has-playlist');
			}

			return list;
		},
		_getListId: function(list){
			var id;
			if(typeof list == 'string'){
				id = list;
			} else {
				id = list.id;
			}
			return id;
		},
		remove: function(list){
			var id = this._getListId(list);
			if(this.lists[id]){
				this.lists[id].remove();
			}
		},
		autoplay: function(list, value){
			var id = this._getListId(list);
			if(arguments.length > 1){
				if(value && this._autoplay && this._autoplay != this.lists[id]){
					this.active(this._autoplay, false);
				}
				this.lists[id].autoplay(value);
			} else {
				return this.lists[id] == this._autoplay;
			}
		},
		getAutoplay: function(){
			return this._autoplay;
		},
		getControlsList: function(){
			var clist = null;
			$.each(this.lists, function(id, list){
				if(list.options.showControls){
					clist = list;
					return false;
				}
			});
			return clist;
		}

	});

	function Playlist(list, parent, opts){
		this.list = list || [];
		this.playlists = parent;
		this.media = parent.data.media;
		this.player = parent.data.player;
		this.options = $.extend({}, Playlist.defaults, opts);
		this.options.itemTmpl  = this.options.itemTmpl.trim();

		this.deferred = $.Deferred();
		this._selectedIndex = -1;
		this._selectedItem = null;
		this._$rendered = null;

		this._detectListType();

		this.autoplay(this.options.autoplay);

		this.deferred.done(function(){
			this._addEvents(this);
			if(this.options.defaultSelected == 'auto' && !this.media.jmeProp('srces').length){
				this.options.defaultSelected = 0;
			}
			if(this.list[this.options.defaultSelected]){
				this.selectedIndex(this.options.defaultSelected);
			}
			this._fire('addlist');
		});
	}

	Playlist.getText = function($elem){
		return $elem.attr('content') || ($elem.text() || '').trim();
	};
	Playlist.getUrl = function($elem){
		return $elem.attr('content') || $elem.attr('url') || $elem.attr('href') || $elem.attr('src') ||  ($elem.text() || '').trim();
	};
	Playlist.tryGetElements = function(selectors, element){
		var elem, i;
		var len = selectors.length;

		for(i = 0; i < len; i++){
			elem = $(selectors[i], element);
			if(elem[i]){
				break;
			}
		}
		return elem;
	};

	Playlist.defaults = {
		loop: false,
		autoplay: false,
		defaultSelected: 'auto',
		addItemEvents: true,
		showControls: true,
		itemTmpl: '<li class="list-item">' +
			'<% if(poster) {%><img src="<%=poster%>" /><% }%>' +
			'<h3><%=title%></h3>' +
			'<% if(description) {%><div class="item-description"><%=description%></div><% }%>' +
		'</li>',
		renderer: function(item, template){
			return $.jme.tmpl(template, item);
		},
		mapDom: function(element){

			return {
				title: Playlist.getText(Playlist.tryGetElements(['[itemprop="name"]', 'h1, h2, h3, h4, h5, h6', 'a'], element)),
				srces: Playlist.tryGetElements(['[itemprop="contentUrl"]', 'a'], element).map(function(){
					var tmp;
					var src =  {src: Playlist.getUrl($(this))};
					if(this.nodeName.toLowerCase() == 'a'){
						tmp = $.prop(this, 'type');
					} else {
						tmp = Playlist.getText($('[itemprop="encodingFormat"]', element));
					}
					if(tmp){
						src.type = tmp;
					}
					tmp = $.attr(this, 'data-media');
					if(tmp){
						src.media = tmp;
					}
					return src;
				}).get(),
				poster: Playlist.getUrl(Playlist.tryGetElements(['[itemprop="thumbnailUrl"]', 'img'], element)) || null,
				description:  Playlist.getText(Playlist.tryGetElements(['[itemprop="description"]', '.item-description', 'p'], element)) || null
			};
		},
		mapUrl: function(url, callback){
			$.ajax({
				url: url,
				success: function(data){
					var list;
					if($.isArray(data)){
						list = data;
					} else {
						list = [];
						$('item', data).each(function(){
							var srces =  $('enclosure, media\\:content', this)
								.filter('[type^="video"], [type^="audio"]')
								.map(mapUrl)
								.get()
							;
							if(srces.length){
								list.push({
									title: $('title', this).html(),
									srces: srces,
									pubDate: $('pubDate', this).html() || null,
									description: $('description', this).text() || null,
									poster: Playlist.getUrl($('itunes\\:image, media\\:thumbnail, enclosure[type^="image"], media\\:content[type^="image"]', this)) || null,
									author: $('itunes\\:author', this).html() || null,
									duration: $('itunes\\:duration', this).html() || null,
									tracks: $('media\\:subTitle', this).map(mapUrl).get() || null
								});
							}
						});
					}

					callback(list, data);
				}
			});
		}
	};

	function mapUrl(){
		return {
			src: $.attr(this, 'url') || $.attr(this, 'href'),
			type: $.attr(this, 'type')
		};
	}

	function filterNode(){
		return this.nodeType == 1;
	}

	$.extend(Playlist.prototype, {
		_detectListType: function(){

			if(typeof this.list == 'string'){
				this._createListFromUrl();
				return;
			}
			this.deferred.resolveWith(this);
			if(this.list.nodeName || (this.list.length > 0 && this.list[0].nodeName)){
				this._createListFromDom();
			}

		},
		_createListFromUrl: function(){
			var that = this;


			this.options.mapUrl(this.list, function(list){
				that.list = list;
				that.deferred.resolveWith(that);
			});
		},
		_createListFromDom: function(){
			var that = this;

			this._$rendered = $(this.list).eq(0);
			this.list = [];

			if(this._$rendered){
				this._addDomList();
				this.list = this._$rendered.children().map(function(){
					return that._createItemFromDom(this);
				}).get();
			}
		},
		_createItemFromDom: function(dom){
			var item = this.options.mapDom(dom);
			this._addItemData(item, dom);
			return item;
		},
		_fire: function(evt, extra){
			var evt = $.Event(evt);
			$(this).triggerHandler(evt, extra);
			$(this.playlists).triggerHandler(evt, $.merge([{list: this}], extra || []));
		},
		_addDomList: function(){
			this._$rendered
				.attr({
					'data-autoplay': this.options.autoplay,
					'data-loop': this.options.loop
				})
				.addClass('media-playlist')
				.data('playlist', this)
			;
		},
		_addItemData: function(item, dom){
			var that = this;
			item._$elem = $(dom).data('itemData', item);
			if(this.options.addItemEvents){
				item._$elem.on('click.playlist', function(e){
					that.playItem(item, e);
					return false;
				});
			}
		},
		_addEvents: function(that){
			var o = that.options;
			var onEnded = function(e){
				if(o.autoplay){
					that.playNext(e);
				}
			};
			this.playlists.data.media.on('ended', onEnded);
			this.remove = function(){
				that.playlists.data.media.on('ended', onEnded);

				that.autoplay(false);
				if(that.playlists.lists[that.id]){
					delete that.playlists.lists[that.id];
				}
				if(that._$rendered){
					that._$rendered.remove();
				}
				if(!that.playlists.getControlsList()){
					that.player.removeClass('has-playlist');
				}
				that._fire('removelist');
			};
		},
		remove: $.noop,
		render: function(callback){
			if(this._$rendered){
				callback(this._$rendered, this.player, this);
			} else {
				this.deferred.done(function(){
					var nodeName;
					var that = this;
					var items = [];
					if(!this._$rendered){
						$.each(this.list, function(i, item){
							var domItem = $($.parseHTML(that.options.renderer(item, that.options.itemTmpl))).filter(filterNode)[0];
							that._addItemData(item, domItem);
							items.push(domItem);
						});
						nodeName = (items[0] && items[0].nodeName || '').toLowerCase();

						switch (nodeName){
							case 'li':
								this._$rendered = $.parseHTML('<ul />');
								break;
							case 'option':
								this._$rendered = $.parseHTML('<select />');
								break;
							default:
								this._$rendered = $.parseHTML('<div />');
								break;
						}
						this._$rendered = $(this._$rendered).html(items);
						this._addDomList();
					}
					callback(this._$rendered, this.player, this);
				});
			}
		},

		autoplay: function(value){
			if(arguments.length){

				if(value){
					if(this.playlists._autoplay && this.playlists._autoplay != this){
						this.playlists.autoplay(this.lists._autoplay, false);
					}
					this.playlists._autoplay = this;
				}

				if(this.options.autoplay != value){
					this.options.autoplay = !!value;
					if(this._$rendered){
						this._$rendered.attr('data-autoplay', this.options.autoplay);
					}
					this._fire('autoplaychange');
				}
			} else {
				return this.options.autoplay;
			}

		},
		/*
		loop: function(loop){

		},
		addItem: function(item, pos){

		},
		removeItem: function(item){

		},
		*/
		_loadItem: function(item){
			this.media.attr('poster', item.poster || '');
			this.media.jmeProp('srces', item.srces);
		},
		_getItem: function(item){
			if(item && (item.nodeName || item.jquery || typeof item == 'string')){
				item = $(item).data('itemData');
			}
			return item;
		},
		playItem: function(item, e){
			this.selectedItem(item, e);
			if(item){
				this.playlists.data.media.play();
			}
		},
		selectedIndex: function(index, e){
			if(arguments.length){
				this.selectedItem(this.list[index], e);
			} else {
				return this._selectedIndex;
			}
		},

		selectedItem: function(item, e){
			var oldItem, found;

			if(arguments.length){
				found = -1;
				item = this._getItem(item);
				if(item){
					$.each(this.list, function(i){
						if(item == this){
							found = i;
							return false;
						}
					});
				}

				if(found >= 0){
					this._loadItem(this.list[found]);
				}

				if(found != this._selectedIndex){
					oldItem = this._selectedItem || null;
					if(oldItem && oldItem._$elem){
						oldItem._$elem.removeClass('selected-item');
					}
					this._selectedItem = this.list[found] || null;
					this._selectedIndex = found;
					if(this._selectedItem && this._selectedItem._$elem){
						this._selectedItem._$elem.addClass('selected-item');
					}
					if(oldItem !== this._selectedItem){
						this._fire('itemchange', [{oldItem: oldItem, from: e || null}]);
					}
				}

			} else {
				return this._selectedItem;
			}
		},
		playNext: function(){
			var item = this.getNext();
			if(item){
				this.playItem(item);
			}
		},
		playPrev: function(){
			var item = this.getPrev();
			if(item){
				this.playItem(item);
			}
		},
		getNext: function(){
			var index = this._selectedIndex + 1;
			return this.list[index] || (this.options.loop ? this.list[0] : null);
		},
		getPrev: function(){
			var index = this._selectedIndex - 1;
			return this.list[index] || (this.options.loop ? this.list[this.list.length - 1] : null);
		}
	});

	jme.defineProp('playlists', {
		writable: false,
		get: function(elem){
			var data = $.jme.data(elem);

			if(elem != data.player[0]){return null;}
			if(!data.playlists){
				data.playlists = new PlaylistList(data);
			}
			return data.playlists;
		}
	});

	jme.defineMethod('addPlaylist', function(list, options){
		var playlists = $.jme.prop(this, 'playlists');
		if(playlists && playlists.add){
			return playlists.add(list, options);
		}
		return null;
	});

	[
		{name: 'playlist-prev', text: 'previous', get: 'getPrev', play: 'playPrev'},
		{name: 'playlist-next', text: 'next', get: 'getNext', play: 'playNext'}
	]
		.forEach(function(desc){
			$.jme.registerPlugin(desc.name, {
				structure: btnStructure,
				text: desc.text,
				_create: function(control, media, base){
					var cList;
					var playlists = base.jmeProp('playlists');

					function itemChange(){
						var item = cList[desc.get]();
						if(item){
							control.prop({'disabled': false, title: item.title});
						} else {
							control.prop({'disabled': true, title: ''});
						}
					}

					function listchange(){
						var newClist = playlists.getControlsList();
						if(newClist != cList){
							if(cList){
								$(cList).off('itemchange', itemChange);
							}
							cList = newClist;
							if(cList){
								$(cList).on('itemchange', itemChange);
								itemChange();
							}
						}
					}

					control.on('click', function(){
						if(cList){
							cList[desc.play]();
						}
					});

					$(playlists).on({
						'addlist removelist':listchange
					});
					listchange();
				}
			});
		})
	;


	// Simple JavaScript Templating
	(function() {
		var cache = {};
		$.jme.tmpl = function tmpl(str, data) {
			// Figure out if we're getting a template, or if we need to
			// load the template - and be sure to cache the result.
			if(!cache[str]){
				cache[str] = new Function("obj",
						"var p=[],print=function(){p.push.apply(p,arguments);};" +

							// Introduce the data as local variables using with(){}
							"with(obj){p.push('" +

							// Convert the template into pure JavaScript
							str.replace(/[\r\t\n]/g, " ")
								.replace(/'(?=[^%]*%>)/g,"\t")
								.split("'").join("\\'")
								.split("\t").join("'")
								.replace(/<%=(.+?)%>/g, "',$1,'")
								.split("<%").join("');")
								.split("%>").join("p.push('")
							+ "');}return p.join('');");
			}

			// Provide some basic currying to the user
			return data ? cache[str](data) : cache[str];
		};
	})();

	$.jme.Playlist = Playlist;
});
