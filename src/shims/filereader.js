webshim.register('filereader', function($, webshim, window, document, undefined, options){
	"use strict";

	var mOxie;
	var FormData = $.noop;
	var sel = 'input[type="file"].ws-filereader';
	var loadMoxie = function (){
		webshim.loader.loadList(['moxie']);
	};
	var _createFilePicker = function(){
		var $input, picker, $parent;
		var input = this;
		if(webshim.implement(input, 'inputwidgets')){

			input = this;
			$input = $(this);
			$parent = $input.parent();

			$input.on('mousedown.filereaderwaiting click.filereaderwaiting', false);
			$parent.addClass('ws-loading');
			picker = new mOxie.FileInput({
				browse_button: this,
				accept: $.prop(this, 'accept'),
				multiple: $.prop(this, 'multiple')
			});


			picker.onready = function(){
				$input.off('.fileraderwaiting');
				$parent.removeClass('ws-waiting');
			};

			picker.onchange = function(e){
				webshim.data(input, 'fileList', e.target.files);
				$input.trigger('change');
			};
			picker.onmouseenter = function(){
				$parent.addClass('ws-mouseenter');
			};
			picker.onmouseleave = function(){
				$parent.removeClass('ws-mouseenter');
			};
			picker.onmousedown = function(){
				$parent.addClass('ws-active');
			};
			picker.onmouseup = function(){
				$parent.removeClass('ws-active');
			};
			webshim.data(input, 'filePicker', picker);

			webshim.ready('WINDOWLOAD', function(){
				var lastWidth;
				$input.onWSOff('updateshadowdom', function(){
					var curWitdth = input.offsetWidth;
					if(curWitdth && lastWidth != curWitdth){
						lastWidth = curWitdth;
						picker.refresh();
					}
				});
			});

			webshim.addShadowDom();
			picker.init();
			if(input.disabled){
				picker.disable(true);
			}

		}
	};
	var getFileNames = function(file){
		return file.name;
	};
	var createFilePicker = function(){
		var elem = this;
		loadMoxie();
		$(elem)
			.on('mousedown.filereaderwaiting click.filereaderwaiting', false)
			.parent()
			.addClass('ws-loading')
		;
		webshim.ready('moxie', function(){
			createFilePicker.call(elem);
		});
	};

	var notReadyYet = function(){
		loadMoxie();
		webshim.error('filereader/formdata not ready yet. please wait for moxie to load `webshim.ready("moxie", callbackFn);`` or wait for the first change event on input[type="file"].ws-filereader.')
	};
	var inputValueDesc = webshim.defineNodeNameProperty('input', 'value', {
			prop: {
				get: function(){
					var fileList = webshim.data(this, 'fileList');

					if(fileList && fileList.map){
						return fileList.map(getFileNames).join(', ');
					}

					return inputValueDesc.prop._supget.call(this);
				}
			}
		}
	);
	var createMoxieTransport = function (options, originalOptions, jqXHR){
		if(options.wsType == 'moxie' || (options.data && options.data instanceof FormData)){
			var ajax;
			return {
				send: function( headers, completeCallback ) {
					ajax = new moxie.xhr.XMLHttpRequest();
					ajax.open(options.type, options.url, options.async, options.username, options.password);
					ajax.send(options.data);
					ajax.addEventListener('readystatechange', function(e){
						var responses = {
							text: ajax.responseText,
							xml: ajax.responseXML
						};

						if(ajax.readyState == 4){
							completeCallback(ajax.status, ajax.statusText, responses);
						}
					});

				},
				abort: function() {
					if(ajax){
						ajax.abort();
					}
				}
			};
		}
	};

	var transports = {
		xdomain: function (options, originalOptions, jqXHR){
			if(options.wsType == 'xdomain'){

			}
		},
		moxie: function (options, originalOptions, jqXHR){
			if(options.wsType == 'moxie' || (options.data && options.data instanceof FormData)){
				var ajax;
				return {
					send: function( headers, completeCallback ) {
						ajax = new moxie.xhr.XMLHttpRequest();
						ajax.open(options.type, options.url, options.async, options.username, options.password);
						ajax.send(options.data);
						ajax.addEventListener('readystatechange', function(e){
							var responses = {
								text: ajax.responseText,
								xml: ajax.responseXML
							};

							if(ajax.readyState == 4){
								completeCallback(ajax.status, ajax.statusText, responses);
							}
						});

					},
					abort: function() {
						if(ajax){
							ajax.abort();
						}
					}
				};
			}
		}
	};

	if($.support.cors !== false || !window.XDomainRequest){
		delete transports.xdomain;
	}


	$.ajaxTransport("+*", function( options, originalOptions, jqXHR ) {
		var ajax, type;
		if(options.wsType || transports[transports]){
			ajax = transports[transports](options, originalOptions, jqXHR);
		}
		if(!ajax){
			for(type in transports){
				ajax = transports[type](options, originalOptions, jqXHR);
				if(ajax){break;}
			}
		}
		return ajax;
	});

	var readyForm = (function(){
		var ready;
		var addFormData = function(e){
			if(!e.isDefaultPrevented()){

			}
		};
		return function(){
			if(ready){return;}
			ready = true;
			setTimeout(function(){
				$(document).on('submit', addFormData);
			});
		};
	})();

	readyForm();
	webshim.defineNodeNameProperty('input', 'files', {
			prop: {
				writeable: false,
				get: function(){
					if(this.type != 'file'){return null;}
					if(!$(this).is('.ws-filereader')){
						webshim.error("please add the 'ws-filereader' class to your input[type='file'] to implement files-property");
					}
					return webshim.data(this, 'fileList') || window.FileList && webshim.data(this, 'fileList', new FileList()) || [];
				}
			}
		}
	);

	webshim.reflectProperties(['input'], ['accept']);

	if($('<input />').prop('multiple') == null){
		webshim.defineNodeNamesBooleanProperty(['input'], ['multiple']);
	}

	webshim.onNodeNamesPropertyModify('input', 'disabled', function(value, boolVal, type){
		var picker = webshim.data(this, 'filePicker');
		if(picker){
			picker.disable(boolVal);
		}
	});

	window.FileReader = notReadyYet;
	window.FormData = notReadyYet;
	webshim.ready('moxie', function(){
		mOxie = window.mOxie;
		mOxie.Env.swf_url = webshim.cfg.basePath+'moxie/flash/Moxie.cdn.swf';
		mOxie.Env.xap_url = webshim.cfg.basePath+'moxie/flash/Moxie.cdn.xap';

		window.FileReader = mOxie.FileReader;
		window.FormData = mOxie.FormData;
		FormData = mOxie.FormData;

		createFilePicker = _createFilePicker;
		transports.moxie = createMoxieTransport;
	});

	webshim.addReady(function(context, contextElem){
		$(context.querySelectorAll(sel)).add(contextElem.filter(sel)).each(createFilePicker);
	});
	webshim.ready('WINDOWLOAD', loadMoxie);


});
