jQuery.webshims.register('form-native-fix', function($, webshims, window, doc, undefined){
	
	if(!Modernizr.formvalidation || Modernizr.bugfreeformvalidation || webshims.bugs.bustedValidity){return;}
	
	var badWebkit = ($.browser.webkit);
//	var badValidity = badWebkit && webshims.browserVersion <= 534.4;
	var invalidSelector = 'input:invalid, select:invalid, textarea:invalid';
	var invalids = [],
		firstInvalidEvent,
		form
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
				if($(invalidSelector, e.target).length){
					$(e.target)
						.unbind('submit.preventInvalidSubmit')
						.bind('submit.preventInvalidSubmit', function(submitEvent){
							if( $.attr(e.target, 'novalidate') == null ){
								submitEvent.stopImmediatePropagation();
								if(badWebkit){
									submitEvent.preventDefault();
								}
							}
							if(e.target){
								$(e.target).unbind('submit.preventInvalidSubmit');
							}
						})
					;
					webshims.moveToFirstEvent(e.target, 'submit');
				}
				if(!window.opera){
					webshims.fromSubmit = true;
					$(e.target).checkValidity();
					webshims.fromSubmit = false;
				}
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
						
			
			if(!webshims.fromSubmit){return;}
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
				
			if( firstTarget && (badWebkit || ($.nodeName(firstTarget, 'select'))) && document.activeElement && firstTarget !== document.activeElement && firstInvalidEvent && !firstInvalidEvent.isInvalidUIPrevented() ){
				webshims.validityAlert.showFor(firstTarget);
			}
			firstInvalidEvent = false;
			invalids = [];
			//remove webkit/operafix
			if(!form){return;}
			$(form).unbind('submit.preventInvalidSubmit');
			
		})
	;
	
	
});