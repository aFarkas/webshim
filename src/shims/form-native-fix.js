/* https://github.com/aFarkas/webshim/issues#issue/16 */
jQuery.webshims.register('form-native-fix', function($, webshims, window, doc, undefined){
	
	if(!Modernizr.formvalidation || window.noHTMLExtFixes || Modernizr.bugfreeformvalidation){return;}
	
	var browserVersion = parseFloat($.browser.version, 10);
	var badWebkit = ($.browser.webkit && browserVersion < 534.19);
	var xBadWebkit = badWebkit && browserVersion < 533.18;
	var invalids = [],
		firstInvalidEvent,
		form,
		fromSubmit,
		fromCheckValidity
	;
	
	//opera/chrome fix (this will double all invalid events in opera, we have to stop them!)
	//opera throws a submit-event and then the invalid events,
	//chrome7/safari5.0.2 has disabled invalid events, this brings them back
	//safari 5.0.2 reports false invalid events, if setCustomValidity was used
	if(window.addEventListener){
		var formnovalidate = {
			timer: undefined,
			prevented: false
		};
		window.addEventListener('submit', function(e){
			if(!formnovalidate.prevented && e.target.checkValidity && $.attr(e.target, 'novalidate') == null){
				fromSubmit = true;
				
				$(e.target).checkValidity();
				fromSubmit = false;
			}
		}, true);
		var preventValidityTest = function(e){
			if($.attr(e.target, 'formnovalidate') == null){return;}
			if(formnovalidate.timer){
				clearTimeout(formnovalidate.timer);
			}
			formnovalidate.prevented = true;
			formnovalidate.timer = setTimeout(function(){
				formnovalidate.prevented = false;
			}, 20);
		};
		window.addEventListener('click', preventValidityTest, true);
		window.addEventListener('touchstart', preventValidityTest, true);
		window.addEventListener('touchend', preventValidityTest, true);
	}
	
	$(document)
		.bind('firstinvalidsystem', function(e, data){
			form = data.form;
			if(!form){return;}
			firstInvalidEvent = false;
			invalids = [];
			
			var submitEvents = $(form)
				.unbind('submit.preventInvalidSubmit')
				.bind('submit.preventInvalidSubmit', function(submitEvent){
					if( $.attr(form, 'novalidate') == null ){
						submitEvent.stopImmediatePropagation();
						return false;
					}
				})
				.data('events').submit
			;
			//add this handler as first executing handler
			if (submitEvents && submitEvents.length > 1) {
				submitEvents.unshift(submitEvents.pop());
			}
			
			if(!fromSubmit){return;}
			firstInvalidEvent = data;
		})
		.bind('invalid', function(e){
			if(invalids.indexOf(e.target) == -1){
				invalids.push(e.target);
			} else {
				e.stopImmediatePropagation();
			}
		})
		.bind('lastinvalid', function(e, data){
			var firstTarget = data.invalidlist[0];
				
			if( firstTarget && badWebkit && document.activeElement && firstTarget !== document.activeElement && firstInvalidEvent && !firstInvalidEvent.isInvalidUIPrevented() ){
				webshims.validityAlert.showFor(firstTarget);
			}
			firstInvalidEvent = false;
			invalids = [];
			//remove webkit/operafix
			if(!form){return;}
			$(form).unbind('submit.preventInvalidSubmit');
			
		})
	;
	
	//safari 5.0.0 and 5.0.1
	if(xBadWebkit){
		var submitTimer;
		var trueInvalid;
		var invalidEvent = $(document).bind('invalid', function(e){
			if(e.originalEvent && !fromSubmit && !fromCheckValidity && $.attr(e.target, 'validity').valid){
				e.originalEvent.wrongWebkitInvalid = true;
				e.wrongWebkitInvalid = true;
				e.stopImmediatePropagation();
				e.preventDefault();
				return false;
			} else {
				trueInvalid = true;
			}
			clearTimeout(submitTimer);
			submitTimer = setTimeout(function(){
				if(e.target.form && !trueInvalid){
					trueInvalid = false;
					$(e.target.form).trigger('submit');
				}
				trueInvalid = false;
			}, 1);
		})
		.data('events').invalid;
		//add this handler as first executing handler
		if (invalidEvent && invalidEvent.length > 1) {
			invalidEvent.unshift(invalidEvent.pop());
		}
		
		$(document).bind('firstinvalidsystem', function(e, data){
			if(fromCheckValidity){return;}
			setTimeout(function(){
				if(!data.isInvalidUIPrevented()){
					webshims.validityAlert.showFor(data.element);
				}
			}, 0);
		});
	}
		
	(function(){
		//safari 5.0.2/5.0.3 has serious issues with checkValidity in combination with setCustomValidity so we mimic checkValidity using validity-property (webshims.fix.checkValidity)
		if(!badWebkit){return;}
		['input', 'textarea', 'select'].forEach(function(name){
			var desc = webshims.defineNodeNameProperty(name, 'checkValidity', {
				value: function(){
					if(!this.willValidate){return true;}
					var valid = ($.attr(this, 'validity') || {valid: true}).valid;
					fromCheckValidity = true;
					if(!valid && desc._supvalue && desc._supvalue.call(this)){
						$(this).trigger('invalid');
					}
					fromCheckValidity = false;
					return valid;
				}
			});
		});
		
		webshims.defineNodeNameProperty('form', 'checkValidity', {
			value: function(){
				var ret = true;
				$(this.elements || [])
					.each(function(){
						 if($(this).checkValidity() === false){
							ret = false;
						}
					})
				;
				return ret;
			}
		});
		
	})();
	
	(function(){
		if(!$.browser.opera){return;}
		var preventDefault = function(e){
			e.preventDefault();
		};
		
		['form', 'input', 'textarea', 'select'].forEach(function(name){
			var desc = webshims.defineNodeNameProperty(name, 'checkValidity', {
				value: function(){
					if(!fromSubmit){
						$(this).bind('invalid', preventDefault);
					}
					fromCheckValidity = true;
					var ret = desc._supvalue.apply(this, arguments);
					if(!fromSubmit){
						$(this).unbind('invalid', preventDefault);
					}
					fromCheckValidity = false;
					return ret;
				}
			});
		});
	})();
	
	if(!Modernizr.requiredSelect){
		webshims.ready('form-extend', function(){
			var isPlaceholderOptionSelected = function(select){
				if(select.type == 'select-one' && select.size < 2){
					var option = $('> option:first-child', select);
					return (!option.attr('disabled') && option.attr('selected'));
				} 
				return false;
			};
			webshims.addValidityRule('valueMissing', function(jElm, val, cache, validityState){
				
				if(cache.nodeName == 'select' && !val && jElm.attr('required')){
					if(!cache.type){
						cache.type = jElm[0].type;
					}
					
					if(!val && (jElm[0].selectedIndex < 0 || isPlaceholderOptionSelected(jElm[0]) )){
						return true;
					}
				}
				return validityState.valueMissing;
			});
			
			webshims.defineNodeNamesBooleanProperty(['select'], 'required', {
				set: function(value){
					this.setAttribute('aria-required', (value) ? 'true' : 'false');
					$.attr(this, 'validity');
				},
				initAttr: true
			});
		});
	}
});