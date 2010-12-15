jQuery.webshims.ready('form-core', function($, webshims){
	if( 'value' in document.createElement('output') ){return;}
	var doc = document;	
	
	(function(){
		var elements = {
				input: 1,
				textarea: 1
			},
			noInputTriggerEvts = {updateInput: 1, input: 1},
			noInputTypes = {
				radio: 1,
				checkbox: 1,
				submit: 1,
				button: 1,
				image: 1,
				reset: 1
				
				//pro forma
				,color: 1
				//,range: 1
			},
			observe = function(input){
				var timer,
					lastVal = input.attr('value'),
					trigger = function(e){
						//input === null
						if(!input){return;}
						var newVal = input.attr('value');
						
						if(newVal !== lastVal){
							lastVal = newVal;
							if(!e || !noInputTriggerEvts[e.type]){
								console.log(newVal, e)
								webshims.triggerInlineForm(input[0], 'input');
							}
						}
					},
					unbind = function(){
						input.unbind('focusout', unbind).unbind('input', trigger).unbind('updateInput', trigger);
						clearInterval(timer);
						trigger();
						input = null;
					}
				;
				
				clearInterval(timer);
				timer = setInterval(trigger, ($.browser.mozilla) ? 250 : 111);
				setTimeout(trigger, 9);
				input.bind('focusout', unbind).bind('input updateInput', trigger);
			}
		;
			
		
		$(doc)
			.bind('focusin', function(e){
				if( e.target && e.target.type && !e.target.readonly && !e.target.readOnly && !e.target.disabled && elements[(e.target.nodeName || '').toLowerCase()] && !noInputTypes[e.target.type] ){
					observe($(e.target));
				}
			})
		;
	})();
	
	
	
	var outputCreate = function(elem){
		if(elem.getAttribute('aria-live')){return;}
		elem = $(elem);
		var value = (elem.text() || '').trim();
		var	id 	= elem.attr('id');
		var	htmlFor = elem.attr('for');
		var shim = $('<input class="output-shim" type="hidden" name="'+ (elem.attr('name') || '')+'" value="'+value+'" style="display: none" />').insertAfter(elem);
		var form = shim[0].form || doc;
		var setValue = function(val){
			shim[0].value = val;
			val = shim[0].value;
			elem.text(val);
			webshims.contentAttr(elem[0], 'value', val);
		};
		
		elem[0].defaultValue = value;
		webshims.contentAttr(elem[0], 'value', value);
		
		elem.attr({'aria-live': 'polite'});
		if(id){
			shim.attr('id', id);
			elem.attr('aria-labeldby', webshims.getID($('label[for="'+id+'"]', form)));
		}
		if(htmlFor){
			id = webshims.getID(elem);
			htmlFor.split(' ').forEach(function(control){
				control = form.getElementById(control);
				if(control){
					control.setAttribute('aria-controls', id);
				}
			});
		}
		elem.data('outputShim', setValue );
		shim.data('outputShim', setValue );
		return setValue;
	};
	
	webshims.defineNodeNameProperty('output', 'value', {
		set: function(elem, value){
			var setVal = $.data(elem, 'outputShim');
			if(!setVal){
				setVal = outputCreate(elem);
			}
			setVal(value);
		},
		get: function(elem){
			return webshims.contentAttr(elem, 'value') || $(elem).text() || '';
		}
	});
	
	webshims.onNodeNamesPropertyModify('input', 'value', {
		set: function(elem, value){
			var setVal = $.data(elem, 'outputShim');
			if(setVal){
				setVal(value);
				return value;
			}
			$(elem).triggerHandler('updateInput');
		}
	
	});
	
	webshims.addReady(function(context, contextElem){
		$('output', context).add(contextElem.filter('output')).each(function(){
			outputCreate(this);
		});
	});
	
	webshims.createReadyEvent('form-output');
}, true);