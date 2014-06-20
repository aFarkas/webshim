(function(webshim, $){
	"use strict";
	if(!window.console){return;}
	var mediaelement = webshim.mediaelement;
	var hasFlash = swfmini.hasFlashPlayerVersion('10.0.3');
	var url = location.protocol+'//'+location.hostname;
	var tests = {
		urlInValid: {
			level: 1,
			test: (function(){
				var reg = /^[a-z0-9\,\.\:\/\-_\;\?#\+\*\!\(\)\$\;\&\=]+$/i;
				return function(src){
					return (src.src && !reg.test(src.src));
				};
			})(),
			srcTest: {poster: 1, srces: 1}
		},
		hasNoTypeAttribute: {
			level: 3.5,
			test: function(src){
				return !src.declaredType && !src.typeNotRequired;
			},
			srcTest: {srces: 1}
		},
		couldNotComputeTypeDeclaredTypeAbsent: {
			level: 1,
			test: function(src){
				return (!src.computedContainer && !src.declaredType);
			},
			srcTest: {srces: 1}
		},
		httpError: {
			level: 2.5,
			test: function(src){

				if(!src.ajax){
					return 'not testable';
				} else {
					return !!(src.httpError && !src.httpErrorText);
				}
			},
			srcTest: {srces: 1}
		},
		fileEncoding: {
			test: function(){
				return 'This test does not test file encoding, framerate compatibility, moov index, encoding profiles. So there is room to fail!';
			},
			srcTest: {srces: 1}
		},
		explicitHttpError: {
			level: 1,
			test: function(src){
				if(!src.ajax){
					return 'not testable';
				} else {
					return !!(src.httpErrorText);
				}
			},
			srcTest: {srces: 1}
		},
		charsetInContentType: {
			level: 2.5,
			test: function(src){
				if(!src.ajax){
					return 'not testable';
				} else {
					return src.headerType && (/charset=/i).test(src.headerType);
				}
			},
			srcTest: {srces: 1}
		},
		explicitTypeMix: {
			level: 3,
			test: function(src){
				if(src.declaredContainer && src.headerType){
					return src.headerType != src.declaredType;
				} else {
					return 'not testable';
				}
			},
			srcTest: {srces: 1}
		},
		noContentType: {
			level: 2.5,
			test: function(src){
				if(src.ajax){
					return !(src.headerType);
				} else {
					return 'not testable';
				}
			},
			srcTest: {srces: 1}
		},
		noContentLength: {
			level: 3,
			test: function(src){
				if(src.ajax){
					return !(src.headers['Content-Length']);
				} else {
					return 'not testable';
				}
			},
			srcTest: {srces: 1}
		},
		noRange: {
			level: 3,
			test: function(src){
				if(src.ajax){
					return (src.headers['Accept-Ranges'] == 'none');
				} else {
					return 'not testable';
				}
			},
			srcTest: {srces: 1}
		},
		doubleEncoded: {
			level: 1,
			test: function(src){
				if(src.ajax){
					return ((/[defalte|gzip]/i).test(src.headers['Content-Encoding']));
				} else {
					return 'not testable';
				}
			},
			srcTest: {srces: 1}
		},
		mediaAttachment: {
			level: 1,
			test: function(src){
				if(src.ajax){
					return (/attach/i.test(src.headers['Content-Disposition']));
				} else {
					return 'not testable';
				}
			},
			srcTest: {srces: 1}
		},
		badTypeMix: {
			level: 1,
			test: function(src, infos){
				var ret = false;

				var isPlayableHtml, isPlayableHeader;
				var htmlContainer = src.declaredContainer || src.computedContainer;
				var headerContainer = src.headerContainer;
				if(headerContainer && htmlContainer && headerContainer != htmlContainer){
					isPlayableHtml = mediaelement.swfMimeTypes.indexOf(htmlContainer) != -1;
					isPlayableHeader = mediaelement.swfMimeTypes.indexOf(headerContainer) != -1;
					if(isPlayableHtml != isPlayableHeader){
						ret = true;
					}

					if(!ret && infos.element.canPlayType){

						isPlayableHtml = !!infos.element.canPlayType(htmlContainer);
						isPlayableHeader = !!infos.element.canPlayType(headerContainer);
						if(isPlayableHtml != isPlayableHeader){
							ret = true;
						}
					}
				} else {
					ret = 'not testable';
				}

				return ret;
			},
			srcTest: {srces: 1}
		},
		hasNoPlayableSrc: {
			level: 1,
			test: function(infos){
				var hasPlayable = false;

				$.each(infos.srces, function(i, src){
					var pluginContainer = src.declaredContainer || src.computedContainer;
					var nativeContainer = src.headerContainer || pluginContainer;

					if(mediaelement.swfMimeTypes.indexOf(pluginContainer) != -1){
						hasPlayable = true;
						return false;
					}

					if(infos.element.canPlayType && infos.element.canPlayType(pluginContainer) && infos.element.canPlayType(nativeContainer)){
						hasPlayable = true;
						return false;
					}
				});

				return !hasPlayable;
			}
		},
		needsFlashInstalled: {
			level: 1,
			test: function(infos){
				var flashCanPlay = false;
				var nativeCanPlay = false;
				if(!hasFlash){
					$.each(infos.srces, function(i, src){
						var pluginContainer = src.declaredContainer || src.computedContainer;
						var nativeContainer = src.headerContainer || pluginContainer;

						if(mediaelement.swfMimeTypes.indexOf(pluginContainer) != -1){
							flashCanPlay = true;
						}

						if(infos.element.canPlayType && (pluginContainer == 'video/youtube' || (infos.element.canPlayType(pluginContainer) && infos.element.canPlayType(nativeContainer)))){
							nativeCanPlay = true;
							return false;
						}
					});
				}

				return flashCanPlay && !nativeCanPlay;
			}
		},
		hasNoSwfPlayableSrc: {
			level: 1,
			test: function(infos){
				var hasPlayable = false;

				$.each(infos.srces, function(i, src){
					var pluginContainer = src.declaredContainer || src.computedContainer;

					if(mediaelement.swfMimeTypes.indexOf(pluginContainer) != -1){
						hasPlayable = true;
						return false;
					}

				});

				return !hasPlayable;
			}
		},
		hasNoNativePlayableSrc: {
			level: 3,
			test: function(infos){
				var hasPlayable = false;

				if(infos.element.canPlayType){
					$.each(infos.srces, function(i, src){
						var pluginContainer = src.declaredContainer || src.computedContainer;
						var nativeContainer = src.headerContainer || pluginContainer;

						if(pluginContainer == 'video/youtube' || (infos.element.canPlayType(pluginContainer) && infos.element.canPlayType(nativeContainer))){
							hasPlayable = true;
							return false;
						}

					});
				}

				return !hasPlayable;
			}
		},
		misLeadingAttrMode: {
			level: 2,
			test: function(infos){
				return (infos.srces.length > 1 && infos.srces[0].attrMode);
			}
		},
		emptySrc: {
			level: 2,
			test: function(src){
				return src.src && !src.attrSrc;
			},
			srcTest: {poster: 1, srces: 1}
		}
	};

	function getSrcInfo(elem, nodeName){
		var ajax;
		var src = {
			src: $.prop(elem, 'src'),
			attrSrc: $.trim($.attr(elem, 'src')),
			declaredType: $.attr(elem, 'type') || $(elem).data('type') || '',
			errors: {}
		};
		src.declaredContainer = src.declaredType.split(';')[0].trim();
		try {
			src.computedContainer = mediaelement.getTypeForSrc( src.src, nodeName);
		} catch(e){
			src.computedContainer = '';
		}

		if(!src.src.indexOf(url)){

			try {
				src.headerType = '';
				src.headers = {};
				ajax = $.ajax({
					url: src.src,
					type: 'head',

					success: function(){
						src.headerType = ajax.getResponseHeader('Content-Type') || '';
						if((/^\s*application\/octet\-stream\s*$/i).test(src.headerType)){
							src.headerType = '';
							src.errors.octetStream = 'octetStream';
						}
						src.headerContainer = $.trim(src.headerType.split(';')[0]);
						['Content-Type', 'Content-Length', 'Accept-Ranges', 'Content-Disposition', 'Content-Encoding'].forEach(function(name){
							src.headers[name] = ajax.getResponseHeader(name) || '';
						});

					},
					error: function(xhr, status, statusText){
						src.httpError = status;
						src.httpErrorText = statusText;
					}
				});
				src.ajax = ajax;
			} catch(e){}
		} else {
			src.cors = true;
		}

		return src;
	}

	function resolveSrces(elem, infos){
		var src;
		var srces = [];
		var ajaxes = [];
		var nodeName = elem.nodeName.toLowerCase();
		var $sources = $('source', elem);


		if($.prop(elem, 'src')){
			src = getSrcInfo(elem, nodeName);
			src.attrMode = true;
			src.typeNotRequired = true;
			srces.push(src);
		}

		$sources.each(function(i){
			var src = getSrcInfo(this, nodeName);
			src.typeNotRequired = i >= $sources.length - 1;

			srces.push(src);

			if(src.ajax){
				ajaxes.push(src.ajax);
			}
		});

		infos.srces = srces;


		return $.when.apply($, ajaxes);
	}



	function runTests(infos){
		$.each(tests, function(name, obj){
			var localMessage;
			var failed = false;
			var message = obj.message || name;
			if(obj.srcTest){
				if(obj.srcTest.poster){
					localMessage = obj.test(infos.poster, infos);
					if(localMessage){
						if(typeof localMessage == 'string'){
							infos.poster.errors[name] = localMessage;
						} else {
							infos.poster.errors[name] = message;
							failed = true;
						}
					}
				}

				if(obj.srcTest.srces){
					infos.srces.forEach(function(src){
						localMessage = obj.test(src, infos);
						if(localMessage){
							if(typeof localMessage == 'string'){
								src.errors[name] = localMessage;
							} else {
								src.errors[name] = message;
								failed = true;
							}
						}
					});

				}
			} else {
				failed = obj.test(infos);
			}

			if(failed){
				infos.errors.push({
					message: message,
					level: obj.level
				});
			}
		});

		infos.errors.sort(function(a, b){
			return a.level > b.level;
		});

		console.log('Testing mediaelement network + markup:', infos);
		infos.errors.forEach(function(error){
			var type = 'log';
			if(console.error && console.warn){
				if(error.level < 3){
					type = 'error';
				} else if(error.level < 4){
					type = 'warn';
				}
			}
			console[type](error.message, error.level);
		});
	}

	function getMediaInfo(elem){
		var infos = {
			element: elem,
			errors: [],
			poster: {
				src: $.prop(elem, 'poster'),
				attrSrc: $.trim($.attr(elem, 'poster')),
				errors: {}
			},
			mediaError: $.prop(elem, 'error'),
			wsError: $(elem).data('mediaerror')
		};
		var promise = resolveSrces(elem, infos);
		var initTests = function(){
			runTests(infos);
		};

		promise
			.fail(function(){
				setTimeout(initTests, 399);
			})
			.done(initTests)
		;
	}

	var timedMediaInfo = function(){
		var elem = this;
		setTimeout(function(){
			getMediaInfo(elem);
		});
	};
	console.log('running mediaelement debugger. Only run to test. Not in production. set webshim.setOptions("debug", false); to remove.');
	if(webshim.cfg.extendNative){
		console.log('Mediaelement debugger does not detect all problems with extendNative set to true. Please set webshim.setOptions("extendNative", false);');
	}
	webshim.addReady(function(context, $insertedElement){
		$('video, audio', context)
			.add($insertedElement.filter('video, audio'))
			.each(timedMediaInfo)
		;
	});
})(webshim, webshim.$);
