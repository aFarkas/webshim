/*
 * HTML5 placeholder-enhancer
 * version: 2.0.2
 * including a11y-name fallback
 * 
 * 
 */


jQuery.webshims.ready('es5', function($, webshims, window, doc, undefined){
	if($.support.placeholder){return;}
	var changePlaceholderVisibility = function(elem, value, placeholderTxt, data, type){
			if(!data){
				data = $.data(elem, 'placeHolder');
				if(!data){return;}
			}
			if(type == 'focus' || (!type && elem === document.activeElement)){
				data.box.removeClass('placeholder-visible');
				return;
			}
			if(value === false){
				value = $.attr(elem, 'value');
			}
			if(value){
				data.box.removeClass('placeholder-visible');
				return;
			}
			if(placeholderTxt === false){
				placeholderTxt = $.attr(elem, 'placeholder');
			}
			
			data.box[(placeholderTxt && !value) ? 'addClass' : 'removeClass']('placeholder-visible');
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
			return $((hasLabel) ? '<span class="placeholder-text"></span>' : '<label for="'+ (id || $.webshims.getID(elem)) +'" class="placeholder-text"></label>');
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
					data.box = $(elem)
						.wrap('<span class="placeholder-box placeholder-box-'+ (elem.nodeName || '').toLowerCase() +'" />')
						.bind('focus.placeholder blur.placeholder', function(e){
							changePlaceholderVisibility(this, false, false, data, e.type );
						})
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
		set: function(val){
			pHolder.update(this, val);
		},
		get: function(){
			return webshims.contentAttr(this, 'placeholder') || '';
		}
	}, true, 'form-htc-placeholder.htc');
			
	var valueDescriptor = {
		set: function(value){
			var placeholder = webshims.contentAttr(this, 'placeholder');
			if(placeholder && 'value' in this){
				changePlaceholderVisibility(this, value, placeholder);
			}
			valueDescriptor.set._polyfilled[this.nodeName.toLowerCase()].apply(this, arguments);
		}
	};
	
	webshims.defineNodeNamesProperty(['input', 'textarea'], 'value', valueDescriptor);
	
	var oldVal = $.fn.val;
	$.fn.val = function(val){
		if(val !== undefined){
			this.each(function(){
				if( this.nodeType === 1 ){
					valueDescriptor.set.call(this, val, $.noop);
				}
			});
		}
		return oldVal.apply(this, arguments);
	};
	
	$.webshims.addReady(function(context, contextElem){
		if(webshims.useDHTMLBehavior && webshims.useMagic){return;}	
		$('input[placeholder], textarea[placeholder]', context)
			.add(contextElem.filter('input[placeholder], textarea[placeholder]'))
			.attr('placeholder', function(i, holder){
				return holder;
			})
		;
	});
});
