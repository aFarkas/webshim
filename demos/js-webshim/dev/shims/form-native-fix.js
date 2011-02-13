/* https://github.com/aFarkas/webshim/issues#issue/16 */
jQuery.webshims.ready('dom-extend', function($, webshims, window, doc, undefined){
	
	if(!Modernizr.formvalidation || window.noHTMLExtFixes || Modernizr.bugfreeformvalidation){return;}
	
	var badWebkit = ($.browser.webkit && parseFloat($.browser.version, 10) < 534.16);
	var invalids = [],
		firstInvalidEvent,
		form
	;
	
	//opera/chrome fix (this will double all invalid events, we have to stop them!)
	//opera throws a submit-event and then the invalid events,
	//chrome7/safari5.02 has disabled invalid events, this brings them back
	//safari 5.02 reports false invalid events, if setCustomValidity was used
	if(window.addEventListener){
		var formnovalidate = {
			timer: undefined,
			prevented: false
		};
		window.addEventListener('submit', function(e){
			if(!formnovalidate.prevented && e.target.checkValidity && $.attr(e.target, 'novalidate') == null){
				$(e.target).checkValidity();
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
		.bind('firstinvalid', function(e){
			form = e.target.form;
			if(!form){return;}
			firstInvalidEvent = e;
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
			if( firstTarget && badWebkit && document.activeElement && firstTarget !== document.activeElement && !firstInvalidEvent.isInvalidUIPrevented() ){
				webshims.validityAlert.showFor(firstTarget);
			}
			invalids = [];
			//remove webkit/operafix
			if(!form){return;}
			$(form).unbind('submit.preventInvalidSubmit');
		})
	;
		
	(function(){
		//safari 5.0.2/5.0.3 has serious issues with checkValidity in combination with setCustomValidity so we mimic checkValidity using validity-property (webshims.fix.checkValidity)
		if(!badWebkit){return;}
		var checkValidity = function(elem){
			var valid = ($.attr(elem, 'validity') || {valid: true}).valid;
			if(!valid && elem.checkValidity && elem.checkValidity()){
				$(elem).trigger('invalid');
			}			
			return valid;
		};
		
		webshims.defineNodeNamesProperty(['input', 'textarea', 'select', 'form'], 'checkValidity', {
			value: function(){
				if(this.elements || $.nodeName(this, 'fieldset')){
					var ret = true;
					$(this.elements || 'input, textarea, select', this)
						.each(function(){
							 if(!checkValidity(this)){
								ret = false;
							}
						})
					;
					return ret;
				} else if(this.checkValidity){
					return checkValidity(this);
				}
			}
		});
		
	})();
	if(!Modernizr.requiredSelect){
		webshims.ready('form-extend', function(){
			webshims.addValidityRule('valueMissing', function(jElm, val, cache, validityState){
				
				if(cache.nodeName == 'select' && !val && jElm.attr('required') && jElm[0].size < 2){
					if(!cache.type){
						cache.type = jElm[0].type;
					}
					
					if(cache.type == 'select-one' && $('> option:first-child:not(:disabled)', jElm).attr('selected')){
						return true;
					}
				}
				return validityState.valueMissing;
			});
			
			webshims.defineNodeNamesBooleanProperty(['select'], 'required', {
				set: function(value){
					this.setAttribute('aria-required', (value) ? 'true' : 'false');
					//trigger validity test
					$.attr(this, 'validity');
				},
				content: true
			}, true);
		});
	}
});