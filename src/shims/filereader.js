webshim.register('filereader', function($, webshim, window, document, undefined, options){
	"use strict";
	var regList = /\s*,\s*/;
	var mOxie = window.mOxie;
	var sel = 'input[type="file"].ws-filereader';

	mOxie.Env.swf_url = webshim.cfg.basePath+'moxie/flash/Moxie.cdn.swf';
	mOxie.Env.xap_url = webshim.cfg.basePath+'moxie/flash/Moxie.cdn.xap';

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

	function createFilePicker(){
		var $input, picker, $parent;
		var input = this;
		if(webshims.implement(input, 'inputwidgets')){

			input = this;
			$input = $(this);
			$parent = $input.parent();
			picker = new mOxie.FileInput({
				browse_button: this,
				accept: $.prop(this, 'accept'),
				multiple: $.prop(this, 'multiple')
			});

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
	}

	if(!window.FileReader){
		window.FileReader = mOxie.FileReader;
	}

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

	webshim.addReady(function(context, contextElem){
		$(context.querySelectorAll(sel)).add(contextElem.filter(sel)).each(createFilePicker);
	});

});
