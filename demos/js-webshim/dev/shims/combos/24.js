jQuery.webshims.register('form-validation', function($, webshims, window, document, undefined, options){
	var isWebkit = 'webkitURL' in window;
	var invalidClass = 'user-error';
	var validClass = 'user-success';
	var checkTypes = {checkbox: 1, radio: 1};
	
	var emptyJ = $([]);
	var isValid = function(elem){
		return ($.prop(elem, 'validity') || {valid: 1}).valid;
	};
	
	var getGroupElements = function(elem){
		elem = $(elem);
		var name;
		var form;
		var ret = emptyJ;
		if(elem[0].type == 'radio'){
			form = elem.prop('form');
			name = elem[0].name;
			if(!name){
				ret = elem;
			} else if(form){
				ret = $(form[name]);
			} else {
				ret = $(document.getElementsByName(name)).filter(function(){
					return !$.prop(this, 'form');
				});
			}
			ret = ret.filter('[type="radio"]');
		}
		return ret;
	};
	
	//ToDo needs testing
	var oldAttr = $.prop;
	var changeVals = {selectedIndex: 1, value: 1, checked: 1, disabled: 1, readonly: 1};
	$.prop = function(elem, name, val){
		var ret = oldAttr.apply(this, arguments);
		if(elem && 'form' in elem && changeVals[name] && val !== undefined && $(elem).hasClass(invalidClass)){
			if(isValid(elem)){
				$(elem).getShadowElement().removeClass(invalidClass);
				if(name == 'checked' && val) {
					getGroupElements(elem).not(elem).removeClass(invalidClass).removeAttr('aria-invalid');
				}
			}
		}
		return ret;
	};
	
	var returnValidityCause = function(validity, elem){
		var ret;
		$.each(validity, function(name, value){
			if(value){
				ret = (name == 'customError') ? $.prop(elem, 'validationMessage') : name;
				return false;
			}
		});
		return ret;
	};
	
	var isInGroup = function(name){
		var ret;
		try {
			ret = document.activeElement.name === name;
		} catch(e){}
		return ret;
	};
	var changeTypes = {
		radio: 1,
		checkbox: 1,
		'select-one': 1,
		'select-multiple': 1,
		file: 1
	};
	
	var switchValidityClass = function(e){
		var elem, timer;
		if(!e.target){return;}
		elem = $(e.target).getNativeElement()[0];
		if(elem.type == 'submit' || !$.prop(elem, 'willValidate')){return;}
		timer = $.data(elem, 'webshimsswitchvalidityclass');
		var switchClass = function(){
			
			if((e.type == 'change' && !changeTypes[elem.type]) || (e.type == 'focusout' && elem.type == 'radio' && isInGroup(elem.name))){return;}
			var validity = $.prop(elem, 'validity');
			var shadowElem = $(elem).getShadowElement();
			var addClass, removeClass, trigger, generaltrigger, validityCause;
			
			$(elem).trigger('refreshCustomValidityRules');
			
			if(validity.valid){
				if(!shadowElem.hasClass(validClass)){
					addClass = validClass;
					removeClass = invalidClass;
					generaltrigger = 'changedvaliditystate';
					trigger = 'changedvalid';
					if(checkTypes[elem.type] && elem.checked){
						getGroupElements(elem).not(elem).removeClass(removeClass).addClass(addClass).removeAttr('aria-invalid');
					}
					$.removeData(elem, 'webshimsinvalidcause');
				}
			} else {
				validityCause = returnValidityCause(validity, elem);
				if($.data(elem, 'webshimsinvalidcause') != validityCause){
					$.data(elem, 'webshimsinvalidcause', validityCause);
					generaltrigger = 'changedvaliditystate';
				}
				if(!shadowElem.hasClass(invalidClass)){
					addClass = invalidClass;
					removeClass = validClass;
					if (checkTypes[elem.type] && !elem.checked) {
						getGroupElements(elem).not(elem).removeClass(removeClass).addClass(addClass);
					}
					trigger = 'changedinvalid';
				}
			}
			
			if(addClass){
				shadowElem.addClass(addClass).removeClass(removeClass);
				//jQuery 1.6.1 IE9 bug (doubble trigger bug)
				setTimeout(function(){
					$(elem).trigger(trigger);
				}, 0);
			}
			if(generaltrigger){
				setTimeout(function(){
					$(elem).trigger(generaltrigger);
				}, 0);
			}
			
			$.removeData(elem, 'webshimsswitchvalidityclass');
		};
		
		if(timer){
			clearTimeout(timer);
		}
		if(e.type == 'refreshvalidityui'){
			switchClass();
		} else {
			$.data(elem, 'webshimsswitchvalidityclass', setTimeout(switchClass, 9));
		}
	};
	
	$(document.body).on(options.validityUIEvents || 'focusout change refreshvalidityui invalid', switchValidityClass);
	$(document.body).on('reset', function(e){
		$(e.target)
			.filter('form')
			.jProp('elements')
			.filter('.user-error, .user-success')
			.removeClass('.user-error, .user-success')
			.getNativeElement()
			.each(function(){
				$.removeData(elem, 'webshimsinvalidcause')
			})
		;
	});
	
	var setRoot = function(){
		webshims.scrollRoot = (isWebkit || document.compatMode == 'BackCompat') ?
			$(document.body) : 
			$(document.documentElement)
		;
	};
	var minWidth = (Modernizr.boxSizing || Modernizr['display-table'] || $.support.getSetAttribute) ?
		'minWidth' :
		'width'
	;
	setRoot();
	webshims.ready('DOM', setRoot);
	
	webshims.getRelOffset = function(posElem, relElem){
		posElem = $(posElem);
		var offset = $(relElem).offset();
		var bodyOffset;
		$.swap($(posElem)[0], {visibility: 'hidden', display: 'inline-block', left: 0, top: 0}, function(){
			bodyOffset = posElem.offset();
		});
		offset.top -= bodyOffset.top;
		offset.left -= bodyOffset.left;
		return offset;
	};
	
	$.extend(webshims.wsPopover, {
		
		
		isInElement: function(container, contained){
			return container == contained || $.contains(container, contained);
		},
		show: function(element){
			var e = $.Event('wspopoverbeforeshow');
			this.element.trigger(e);
			if(e.isDefaultPrevented() || this.isVisible){return;}
			this.isVisible = true;
			element = $(element || this.options.prepareFor).getNativeElement() ;
			
			var that = this;
			var visual = $(element).getShadowElement();

			this.clear();
			this.element.removeClass('ws-po-visible').css('display', 'none');
			
			this.prepareFor(element, visual);
			
			this.position(visual);
			that.timers.show = setTimeout(function(){
				that.element.css('display', '');
				that.timers.show = setTimeout(function(){
					that.element.addClass('ws-po-visible').trigger('wspopovershow');
				}, 9);
			}, 9);
			$(document).on('focusin'+this.eventns+' mousedown'+this.eventns, function(e){
				if(that.options.hideOnBlur && !that.stopBlur && !that.isInElement(that.lastElement[0] || document.body, e.target) && !that.isInElement(element[0] || document.body, e.target) && !that.isInElement(that.element[0], e.target)){
					that.hide();
				}
			});
			$(window).on('resize'+this.eventns + ' pospopover'+this.eventns, function(){
				clearTimeout(that.timers.repos);
				that.timers.repos = setTimeout(function(){
					that.position(visual);
				}, 900);
			});
		},
		prepareFor: function(element, visual){
			var onBlur;
			var opts = $.extend({}, this.options, $(element.prop('form') || []).data('wspopover') || {}, element.data('wspopover'));
			var that = this;
			var css = {};
			this.lastElement = $(element).getShadowFocusElement();
			if(!this.prepared || !this.options.prepareFor){
				if(opts.appendTo == 'element'){
					this.element.insertAfter(element);
				} else {
					this.element.appendTo(opts.appendTo);
				}
			}
			
			this.element.attr({
				'data-class': element.prop('className'),
				'data-id': element.prop('id')
			});
			
			css[minWidth] = opts.constrainWidth ? visual.outerWidth() : '';
			
			this.element.css(css);
			
			if(opts.hideOnBlur){
				onBlur = function(e){
					if(that.stopBlur){
						e.stopImmediatePropagation();
					} else {
						that.hide();
					}
				};
				
				that.timers.bindBlur = setTimeout(function(){
					that.lastElement.off(that.eventns).on('focusout'+that.eventns + ' blur'+that.eventns, onBlur);
					that.lastElement.getNativeElement().off(that.eventns);
				}, 10);
				
				
			}
			
			if(!this.prepared && $.fn.bgIframe){
				this.element.bgIframe();
			}
			this.prepared = true;
		},
		clear: function(){
			$(window).off(this.eventns);
			$(document).off(this.eventns);
			
			this.stopBlur = false;
			$.each(this.timers, function(timerName, val){
				clearTimeout(val);
			});
		},
		hide: function(){
			var e = $.Event('wspopoverbeforehide');
			this.element.trigger(e);
			if(e.isDefaultPrevented() || !this.isVisible){return;}
			this.isVisible = false;
			var that = this;
			var forceHide = function(){
				that.element.css('display', 'none').attr({'data-id': '', 'data-class': '', 'hidden': 'hidden'});
				clearTimeout(that.timers.forcehide);
			};
			this.clear();
			this.element.removeClass('ws-po-visible').trigger('wspopoverhide');
			$(window).on('resize'+this.eventns, forceHide);
			that.timers.forcehide = setTimeout(forceHide, 999);
		},
		position: function(element){
			var offset = webshims.getRelOffset(this.element.css({marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}).removeAttr('hidden'), element);
			offset.top += element.outerHeight();
			this.element.css({marginTop: '', marginLeft: '', marginRight: '', marginBottom: ''}).css(offset);
		}
	});
	
	
	
	/* some extra validation UI */
	webshims.validityAlert = (function(){
			
		var focusTimer = false;
		
		var api = webshims.objectCreate(webshims.wsPopover, {}, options.messagePopover);
		var boundHide = api.hide.bind(api);
		
		api.element.addClass('validity-alert').attr({role: 'alert'});
		$.extend(api, {
			hideDelay: 5000,
			showFor: function(elem, message, noFocusElem, noBubble){
				
				elem = $(elem).getNativeElement();
				this.clear();
				this.hide();
				if(!noBubble){
					this.getMessage(elem, message);
					
					this.show(elem);
					if(this.hideDelay){
						this.timers.delayedHide = setTimeout(boundHide, this.hideDelay);
					}
					
				}
				
				if(!noFocusElem){
					this.setFocus(elem);
				}
			},
			setFocus: function(element){
				var focusElem = $(element).getShadowFocusElement();
				var scrollTop = webshims.scrollRoot.scrollTop();
				var elemTop = focusElem.offset().top - 30;
				var smooth;
				
				if(scrollTop > elemTop){
					webshims.scrollRoot.animate(
						{scrollTop: elemTop - 5}, 
						{
							queue: false, 
							duration: Math.max( Math.min( 600, (scrollTop - elemTop) * 1.5 ), 80 )
						}
					);
					smooth = true;
				}
				try {
					focusElem[0].focus();
				} catch(e){}
				if(smooth){
					webshims.scrollRoot.scrollTop(scrollTop);
					setTimeout(function(){
						webshims.scrollRoot.scrollTop(scrollTop);
					}, 0);
				}
				
				$(window).triggerHandler('pospopover'+this.eventns);
			},
			getMessage: function(elem, message){
				if (!message) {
					message = elem.getErrorMessage();
				}
				if (message) {
					api.contentElement.text(message);
				} else {
					this.hide();
				}
			}
		});
		
		
		return api;
	})();
	
	var fx = {
		slide: {
			show: 'slideDown',
			hide: 'slideUp'
		},
		fade: {
			show: 'fadeIn',
			hide: 'fadeOut'
		}
	};
	if(!fx[options.iVal.fx]){
		options.iVal.fx = 'slide';
	}
	webshims.errorbox = {
		create: function(elem){
			var errorBox = $('<div class="ws-errorbox" hidden="hidden">');
			
			this.getFieldWrapper(elem)
				.append(errorBox)
				.data('errorbox', errorBox)
			;
			return errorBox;
		},
		getFieldWrapper: function(elem){
			var fieldWrapper;
			if(options.iVal.fieldWrapper){
				fieldWrapper = $(elem).closest(options.iVal.fieldWrapper);
				if(!fieldWrapper.length){
					fieldWrapper = false;
					webshims.error("could not find fieldwrapper: "+ options.iVal.fieldWrapper);
				}
			}
			if(!fieldWrapper){
				fieldWrapper = $(elem).parent().closest(':not(span, label, em, strong, b, mark)');
			}
			return fieldWrapper;
		},
		get: function(elem, fieldWrapper){
			if(!fieldWrapper){
				fieldWrapper = this.getFieldWrapper(elem);
			}
			var errorBox = fieldWrapper.data('errorbox');
			if(!errorBox){
				errorBox = this.create(elem);
			} else if(typeof errorBox == 'string'){
				errorBox = $('#'+errorBox);
				$.data(elem, 'errorbox', errorBox);
			}
			return errorBox;
		},
		hide: function(elem){
			var fieldWrapper = this.getFieldWrapper(elem);
			var errorBox = fieldWrapper.data('errorbox');
			
			if(errorBox && errorBox.jquery){
				fieldWrapper.removeClass('ws-invalid');
				errorBox.message = '';
				$(elem).filter('input').off('.recheckinvalid');
				errorBox.slideUp(function(){
					$(this).attr({hidden: 'hidden'});
				});
			}
			return fieldWrapper;
		},
		recheckInvalidInput: function(input){
			var timer;
			var throttle = function(){
				switchValidityClass({type: 'input', target: input});
			};
			$(input).filter('input:not([type="checkbox"], [type="radio"])').off('.recheckinvalid').on('input.recheckinvalid', function(){
				clearTimeout(timer);
				timer = setTimeout(throttle, 500); 
			});
		},
		show: function(elem, message){
			var fieldWrapper = this.getFieldWrapper(elem);
			var box = this.get(elem, fieldWrapper);
			
			if(box.message != message){
				box.stop(true, true).html('<p>'+ message +'</p>');
				box.message = message;
				fieldWrapper.addClass('ws-invalid');
				if(box.is('[hidden]')){
					this.recheckInvalidInput(elem);
					box
						.css({display: 'none'})
						.removeAttr('hidden')
						[fx[options.iVal.fx].show]()
					;
				}
			}
			return fieldWrapper;
		},
		reset: function(elem){
			this.hide(elem).removeClass('ws-success');
		},
		toggle: function(elem){
			var message = $(elem).getErrorMessage();
			if(message){
				this.show(elem, message);
			} else {
				this.hide(elem, message);
			}
		}
	};
	
	$(document.body)
		
		.on({
			'changedvaliditystate': function(e){
				var message;
				var form = $(e.target).jProp('form');
				if(form.is('.ws-instantvalidation')){
					webshims.errorbox.toggle(e.target);
				}
			},
			firstinvalid: function(e){
				var form = $(e.target).jProp('form');
				if(form.is('.ws-instantvalidation')){
					form.addClass('invalid-form');
					if(options.iVal.replaceBubble || options.iVal.hideBubble){
						e.preventDefault();
						webshims.validityAlert.showFor( e.target, false, false, options.iVal.hideBubble ); 
					}
				}
			},
			submit: function(e){
				if($(e.target).is('.ws-instantvalidation') && $.prop(e.target, 'noValidate') && !$(e.target).checkValidity()){
					return false;
				}
			}
		})
	;
	
	webshims.modules["form-core"].getGroupElements = getGroupElements;
	
	
	if (isWebkit && !webshims.bugs.bustedValidity) {
		(function(){
			(function(){
				var elems = /^(?:textarea|input)$/i;
				var form = false;
				
				document.addEventListener('contextmenu', function(e){
					if (elems.test(e.target.nodeName || '') && (form = e.target.form)) {
						setTimeout(function(){
							form = false;
						}, 1);
					}
				}, false);
				
				$(window).on('invalid', function(e){
					if (e.originalEvent && form && form == e.target.form) {
						e.wrongWebkitInvalid = true;
						e.stopImmediatePropagation();
					}
				});
				
			})();
		})();
	}
});

jQuery.webshims.register('form-validators', function(){
	alert('f')
});
