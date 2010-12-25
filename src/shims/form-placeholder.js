/*
 * HTML5 placeholder-enhancer
 * version: 2.0.2
 * including a11y-name fallback
 * 
 * 
 */


jQuery.webshims.ready('es5', function($, webshims, window, doc, undefined){
	if($.support.placeholder){return;}
	var hidePlaceholder = function(elem, data, value){
			if(elem.type != 'password'){
				if(value === false){
					value = $.attr(elem, 'value');
				}
				elem.value = value;
			}
			data.box.removeClass('placeholder-visible');
		},
		showPlaceholder = function(elem, data, placeholderTxt){
			if(placeholderTxt === false){
				placeholderTxt = $.attr(elem, 'placeholder') || '';
			}
			
			if(elem.type != 'password'){
				elem.value = placeholderTxt;
			}
			data.box.addClass('placeholder-visible');
		},
		changePlaceholderVisibility = function(elem, value, placeholderTxt, data, type){
			if(!data){
				data = $.data(elem, 'placeHolder');
				if(!data){return;}
			}
			if(type == 'focus' || (!type && elem === document.activeElement)){
				if(elem.type == 'password' || $(elem).hasClass('placeholder-visible')){
					hidePlaceholder(elem, data, '');
				}
				return;
			}
			if(value === false){
				value = $.attr(elem, 'value');
			}
			if(value){
				hidePlaceholder(elem, data, value);
				return;
			}
			if(placeholderTxt === false){
				placeholderTxt = $.attr(elem, 'placeholder') || '';
			}
			if(placeholderTxt && !value){
				showPlaceholder(elem, data, placeholderTxt);
			} else {
				hidePlaceholder(elem, data, value);
			}
		},
		createPlaceholder = function(elem){
			elem = $(elem);
			var id 			= elem.attr('id'),
				hasLabel	= !!(elem.attr('title') || elem.attr('aria-labeledby')),
				pHolderTxt
			;
			if(!hasLabel && id){
				hasLabel = !!( $('label[for="'+ id +'"]', elem[0].form)[0] );
			}
			return $( hasLabel ? '<span class="placeholder-text"></span>' : '<label for="'+ (id || $.webshims.getID(elem)) +'" class="placeholder-text"></label>');
		},
		pHolder = (function(){
			var delReg 	= /\n|\r|\f|\t/g,
				allowedPlaceholder = {
					text: 1,
					search: 1,
					url: 1,
					email: 1,
					password: 1,
					tel: 1
				}
			;
			
			return {
				create: function(elem){
					var data = $.data(elem, 'placeHolder');
					if(data){return data;}
					data = $.data(elem, 'placeHolder', {
						text: createPlaceholder(elem)
					});
					
					$(elem).bind('focus.placeholder blur.placeholder', function(e){
						changePlaceholderVisibility(this, false, false, data, e.type );
					});
					
					if(elem.type == 'password'){
						data.box = $(elem)
							.wrap('<span class="placeholder-box placeholder-box-'+ (elem.nodeName || '').toLowerCase() +'" />')
							.parent()
						;
	
						data.text
							.insertAfter(elem)
							.bind('mousedown.placeholder', function(){
								changePlaceholderVisibility(this, false, false, data, 'focus' );
								elem.focus();
								return false;
							})
						;
						
						
		
						$.each(['Left', 'Top'], function(i, side){
							var size = (parseInt($.curCSS(elem, 'padding'+ side), 10) || 0) + Math.max((parseInt($.curCSS(elem, 'margin'+ side), 10) || 0), 0) + (parseInt($.curCSS(elem, 'border'+ side +'Width'), 10) || 0);
							data.text.css('padding'+ side, size);
						});
						var lineHeight 	= $.curCSS(elem, 'lineHeight'),
							dims 		= {
								width: $(elem).width(),
								height: $(elem).height()
							},
							cssFloat 		= $.curCSS(elem, 'float')
						;
						$.each(['lineHeight', 'fontSize', 'fontFamily', 'fontWeight'], function(i, style){
							var prop = $.curCSS(elem, style);
							if(data.text.css(style) != prop){
								data.text.css(style, prop);
							}
						});
						
						if(dims.width && dims.height){
							data.text.css(dims);
						}
						if(cssFloat !== 'none'){
							data.box.addClass('placeholder-box-'+cssFloat);
						}
					} else {
						var reset = function(){
							hidePlaceholder(elem, data, '');
						};
						if($.nodeName(data.text[0], 'label')){
							//if label is dynamically set after we ensure that our label isn't exposed anymore
							//ie always exposes last label and ff always first
							data.text.hide()[$.browser.msie ? 'insertBefore' : 'insertAfter'](elem);
						}
						$(window).unload(reset);
						data.box = $(elem);
						if(elem.form){
							$(elem.form).submit(reset);
						}
					}
					
					return data;
				},
				update: function(elem, val){
					if(!allowedPlaceholder[$.attr(elem, 'type')] && !$.nodeName(elem, 'textarea')){return;}
					if($.nodeName(elem, 'input')){
						val = val.replace(delReg, '');
					}
					var data = pHolder.create(elem);
					if(webshims.contentAttr(elem, 'placeholder') != val){
						webshims.contentAttr(elem, 'placeholder', val);
					}
					data.text.text(val);
					
					changePlaceholderVisibility(elem, false, val, data);
				}
			};
		})()
	;
	
	$.webshims.publicMethods = {
		pHolder: pHolder
	};
	
	webshims.defineNodeNamesProperty(['input', 'textarea'], 'placeholder', {
		set: function(elem, val){
			pHolder.update(elem, val);
		},
		get: function(elem){
			return webshims.contentAttr(elem, 'placeholder') || '';
		},
		init: true
	});
			
	$.each(['input', 'textarea'], function(i, name){
		var desc = webshims.defineNodeNameProperty(name, 'value', {
			set: function(elem, val){
				var placeholder = webshims.contentAttr(elem, 'placeholder');
				if(placeholder && 'value' in elem){
					changePlaceholderVisibility(elem, val, placeholder);
				}
				return desc.set._polyfilled(elem, val);
			},
			get: function(elem){
				return $(elem).hasClass('placeholder-visible') ? '' : desc.get._polyfilled(elem);
			}
		});
	});
	
	
	
	var oldVal = $.fn.val;
	$.fn.val = function(val){
		if(val !== undefined){
			var process = (val === '') ? 
				function(){
					if( this.nodeType === 1 ){
						var placeholder = this.getAttribute('placeholder');
						if(placeholder && 'value' in this){
							changePlaceholderVisibility(this, val, placeholder);
						}
						if(this.type == 'password'){
							oldVal.call($(this), '');
						}
					}
				} : 
				function(){
					if( this.nodeType === 1 ){
						var placeholder = this.getAttribute('placeholder');
						if(placeholder && 'value' in this){
							changePlaceholderVisibility(this, val, placeholder);
						}
					}
				}
			;
			this.each(process);
			if(val === ''){return this;}
		} else if(this[0] && this[0].nodeType == 1 && this.hasClass('placeholder-visible')) {
			return '';
		}
		return oldVal.apply(this, arguments);
	};
	
});
