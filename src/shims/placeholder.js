/*
 * HTML5 placeholder-enhancer
 * version: 2.0.2
 * including a11y-name fallback
 * 
 * Simply use the HTML5 placeholder attribute 
 * <input type="text" id="birthday" placeholder="dd.mm.yyyy" />
 * 
 * http://www.protofunc.com/2009/08/16/meinung-zu-html5/, 
 * http://robertnyman.com/2010/06/17/adding-html5-placeholder-attribute-support-through-progressive-enhancement/
 * 
 */


(function($){
	if($.support.placeholder){
		return;
	}
	$.support.placeholder = 'shim';
	
	var pHolder = (function(){
		var showPlaceholder = function(force){
				if(!this.value || force === true){
					$(this).addClass('placeholder-visible');
					this.value = this.getAttribute('placeholder') || '';
				}
			},
			hidePlaceHolder = function(){
				if( $(this).hasClass('placeholder-visible') ){
					this.value = '';
					$(this).removeClass('placeholder-visible');
				}
			},
			placeholderID 	= 0,
			delReg 	= /\n|\r|\f|\t/g,
			allowedPlaceholder = {
				text: 1,
				search: 1,
				url: 1,
				email: 1,
				password: 1,
				tel: 1,
				url: 1
			}
		;
		
		return {
			create: function(elem){
				
				if($.data(elem, 'placeHolder')){return;}
				var remove = function(){
					hidePlaceHolder.apply(elem);
				};
				placeholderID++;
				$.data(elem, 'placeHolder', placeholderID);
				$(elem)
					.bind('blur', showPlaceholder)
					.bind('focus', hidePlaceHolder)
				;
				$(window).bind('unload.id-'+placeholderID, remove);
				$(elem.form).bind('submit.id-'+placeholderID, remove);
			},
			changesValidity: function(elem, val){
				if($.support.validity === true && $.attr(elem, 'willValidate')){
					if( $.attr(elem, 'required') ){return true;}
					var oldVal 	= $.attr(elem, 'value'),
						ret 	= false
					;
					$.attr(elem, 'value', val);
					ret = !($.attr(elem, 'validity') || {valid: true}).valid;
					$.attr(elem, 'value', oldVal);
				}
				return false;
			},
			update: function(elem, val){
				var type = $.attr(elem, 'type');
				if(!allowedPlaceholder[type] && !$.nodeName(elem, 'textarea')){return;}
				if(!val){
					pHolder.destroy(elem);
					elem.removeAttribute('placeholder');
					return;
				}
				
				var input = $(elem);
				val = val.replace(delReg, '');
				elem.setAttribute('placeholder', val);
				
				if( pHolder.changesValidity(elem, val) ){
					pHolder.destroy(elem);
					return;
				}
				pHolder.create(elem);
				if(!input.val()){
					showPlaceholder.call(elem, true);
				}
			},
			destroy: function(elem){
				var id = $.data(elem, 'placeHolder');
				if(!id){return;}
				$.data(elem, 'placeHolder', false);
				$(elem)
					.unbind('blur', showPlaceholder)
					.unbind('focus', hidePlaceHolder)
				;
				$(window).unbind('unload.id-'+id);
				$(elem.form).unbind('submit.id-'+id);
				hidePlaceHolder.apply(this);
			}
		};
	})();
	
	
	$.webshims.attr('placeholder', {
		elementNames: ['input', 'textarea'],
		setter: function(elem, val){
			pHolder.update(elem, val);
		},
		getter: function(elem){
			return elem.getAttribute('placeholder');
		}
	});
		
	var value = {
		elementNames: ['input', 'textarea'],
		setter: function(elem, value, oldFn){
			var placeholder = elem.getAttribute('placeholder');
			if(placeholder && 'value' in elem){
				if(value){
					$(elem).removeClass('placeholder-visible');
				} else {
					pHolder.update(elem, placeholder);
				}
			}
			oldFn();
		},
		getter: function(elem, oldFn){
			if($(elem).hasClass('placeholder-visible')){
				return '';
			}
			return oldFn();
		}
	};
	
	$.webshims.attr('value', value);
	
	var oldVal = $.fn.val;
	$.fn.val = function(val){
		if(val === undefined){
			if(this[0] && $(this[0]).hasClass('placeholder-visible')){
				return '';
			}
			return oldVal.apply(this, arguments);
		} else {
			var that 	= this,
				ret 	= oldVal.apply(this, arguments)
			;
			this.each(function(){
				if( this.nodeType === 1 && this.getAttribute('placeholder') ){
					value.setter(this, val, $.noop);
				}
			});
			return ret;
		}
	};
			
	$.webshims.addReady(function(context){
		$('input[placeholder], textarea[placeholder]', context).attr('placeholder', function(i, holder){
			return holder;
		});
	});
	
})(jQuery);
