jQuery.webshims.register('form-native-fix', function($, webshims, window, doc, undefined){
	
	if(!Modernizr.formvalidation || Modernizr.bugfreeformvalidation){return;}
	
	var badWebkit = ($.browser.webkit);
	var xBadWebkit = badWebkit && webshims.browserVersion < 533.18;
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
			
			$(form)
				.unbind('submit.preventInvalidSubmit')
				.bind('submit.preventInvalidSubmit', function(submitEvent){
					if( $.attr(form, 'novalidate') == null ){
						submitEvent.stopImmediatePropagation();
						return false;
					}
				})
			;
			webshims.moveToFirstEvent(form, 'submit');
			
			
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
				
			if( firstTarget && (badWebkit || (!Modernizr.requiredSelect && $.nodeName(firstTarget, 'select'))) && document.activeElement && firstTarget !== document.activeElement && firstInvalidEvent && !firstInvalidEvent.isInvalidUIPrevented() ){
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
		$(document).bind('invalid', function(e){
			if(e.originalEvent && !fromSubmit && !fromCheckValidity && ($.prop(e.target, 'validity') || {}).valid){
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
		});
		
		webshims.moveToFirstEvent(document, 'invalid');
		
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
		//safari 5.0.x has serious issues with checkValidity in combination with setCustomValidity so we mimic checkValidity using validity-property (webshims.fix.checkValidity)
		if(!badWebkit){return;}
		['input', 'textarea', 'select'].forEach(function(name){
			var desc = webshims.defineNodeNameProperty(name, 'checkValidity', {
				prop: {
					value: function(){
						if(!this.willValidate){return true;}
						var valid = ($.prop(this, 'validity') || {valid: true}).valid;
						
						fromCheckValidity = true;
						if(!valid && desc.prop._supvalue && desc.prop._supvalue.call(this)){
							$(this).trigger('invalid');
						}
						fromCheckValidity = false;
						return valid;
					}
				}
			});
		});
		
		webshims.defineNodeNameProperty('form', 'checkValidity', {
			prop: {
				value: function(){
					var ret = true;
					$(this.elements || [])
						.filter(function(){
							if(!this.willValidate){
								return false;
							}
							var shadowData = webshims.data(this, 'shadowData');
							return !shadowData || !shadowData.nativeElement || shadowData.nativeElement === this;
						})
						.each(function(){
							 if($(this).checkValidity() === false){
								ret = false;
							}
						})
					;
					return ret;
				}
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
				prop: {
					value: function(){
						if(!fromSubmit){
							$(this).bind('invalid', preventDefault);
						}
						
						fromCheckValidity = true;
						var ret = desc.prop._supvalue.apply(this, arguments);
						if(!fromSubmit){
							$(this).unbind('invalid', preventDefault);
						}
						fromCheckValidity = false;
						return ret;
					}
				}
			});
		});
	})();
	
	if(!Modernizr.requiredSelect){
		
		webshims.ready('form-extend', function(){
			
			var isPlaceholderOptionSelected = function(select){
				if(select.type == 'select-one' && select.size < 2){
					var option = $('> option:first-child', select);
					return option.prop('selected');
				} 
				return false;
			};
			
			webshims.addValidityRule('valueMissing', function(jElm, val, cache, validityState){
				
				if(cache.nodeName == 'select' && !val && jElm.prop('required')){
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
					$.prop(this, 'validity');
				},
				initAttr: true
			});
		});
	}

	//simply copied from form-shim-extend without novalidate for safari 5.0.1
if( !('formTarget' in document.createElement('input')) ){
	(function(){
		
		var submitterTypes = {submit: 1, button: 1, image: 1};
		var formSubmitterDescriptors = {};
		[
			{
				name: "enctype",
				limitedTo: {
					"application/x-www-form-urlencoded": 1,
					"multipart/form-data": 1,
					"text/plain": 1
				},
				defaultProp: "application/x-www-form-urlencoded",
				proptype: "enum"
			},
			{
				name: "method",
				limitedTo: {
					"get": 1,
					"post": 1
				},
				defaultProp: "get",
				proptype: "enum"
			},
			{
				name: "action",
				proptype: "url"
			},
			{
				name: "target"
			}
		].forEach(function(desc){
			var propName = 'form'+ (desc.propName || desc.name).replace(/^[a-z]/, function(f){
				return f.toUpperCase();
			});
			var attrName = 'form'+ desc.name;
			var formName = desc.name;
			var eventName = 'click.webshimssubmittermutate'+formName;
			
			var changeSubmitter = function(){
				var elem = this;
				if( !('form' in elem) || !submitterTypes[elem.type] ){return;}
				var form = $.prop(elem, 'form');
				if(!form){return;}
				var attr = $.attr(elem, attrName);
				if(attr != null && ( !desc.limitedTo || attr.toLowerCase() === $.prop(elem, propName))){
					
					var oldAttr = $.attr(form, formName);
					
					$.attr(form, formName, attr);
					setTimeout(function(){
						if(oldAttr != null){
							$.attr(form, formName, oldAttr);
						} else {
							$(form).removeAttr(formName);
						}
					}, 9);
				}
			};
			
			
		
		switch(desc.proptype) {
				case "url":
					var urlForm = document.createElement('form');
					formSubmitterDescriptors[propName] = {
						prop: {
							set: function(value){
								$.attr(this, attrName, value);
							},
							get: function(){
								var value = $.attr(this, attrName);
								if(value == null){return '';}
								urlForm.setAttribute('action', value);
								return urlForm.action;
							}
						}
					};
					break;
				case "boolean":
					formSubmitterDescriptors[propName] = {
						prop: {
							set: function(val){
								val = !!val;
								if(val){
									$.attr(this, 'formnovalidate', 'formnovalidate');
								} else {
									$(this).removeAttr('formnovalidate');
								}
							},
							get: function(){
								return $.attr(this, 'formnovalidate') != null;
							}
						}
					};
					break;
				case "enum":
					formSubmitterDescriptors[propName] = {
						prop: {
							set: function(value){
								$.attr(this, attrName, value);
							},
							get: function(){
								var value = $.attr(this, attrName);
								return (!value || ( (value = value.toLowerCase()) && !desc.limitedTo[value] )) ? desc.defaultProp : value;
							}
						}
				};
				break;
				default:
					formSubmitterDescriptors[propName] = {
						prop: {
							set: function(value){
								$.attr(this, attrName, value);
							},
							get: function(){
								var value = $.attr(this, attrName);
								return (value != null) ? value : "";
							}
						}
					};
			}
		
		
			if(!formSubmitterDescriptors[attrName]){
				formSubmitterDescriptors[attrName] = {};
			}
			formSubmitterDescriptors[attrName].attr = {
				set: function(value){
					formSubmitterDescriptors[attrName].attr._supset.call(this, value);
					$(this).unbind(eventName).bind(eventName, changeSubmitter);
				},
				get: function(){
					return formSubmitterDescriptors[attrName].attr._supget.call(this);
				}
			};
			formSubmitterDescriptors[attrName].initAttr = true;
			formSubmitterDescriptors[attrName].removeAttr = {
				value: function(){
					$(this).unbind(eventName);
					formSubmitterDescriptors[attrName].removeAttr._supvalue.call(this);
				}
			};
		});
		
		webshims.defineNodeNamesProperties(['input', 'button'], formSubmitterDescriptors);
	})();
}	

	
});