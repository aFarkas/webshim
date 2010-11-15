jQuery.webshims.ready('es5', function($, webshims, window, document, undefined){
	var support = $.support;
	if(support.validity && !window.noHTMLExtFixes){return;}
	
	
	var advancedForm = ( 'value' in doc.createElement('output') && 'list' in doc.createElement('input') ),
		invalids = [],
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
		.bind('lastinvalid', function(e){
			console.log(arguments);
			var firstTarget = e.invalidlist[0];
			if( !advancedForm && document.activeElement && ffirstTarget !== document.activeElement && !$.data(firstTarget, 'maybePreventedinvalid') ){
				webshims.validityAlert.showFor(firstTarget);
			}
			invalids = [];
			//remove webkit/operafix
			if(!form){return;}
			$(form).unbind('submit.preventInvalidSubmit');
		})
	;
		

}, true);