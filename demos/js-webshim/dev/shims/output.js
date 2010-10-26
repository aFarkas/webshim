jQuery.webshims.ready('validation-base', function($){
	if( 'value' in document.createElement('output') ){return;}
	var outputCreate = function(elem){
		if(elem.getAttribute('aria-live')){return;}
		elem = $(elem);
		var value = (elem.text() || '').trim();
		var	id 	= elem.attr('id');
		var	htmlFor = elem.attr('for');
		var shim = $('<input class="output-shim" type="hidden" name="'+ (elem.attr('name') || '')+'" value="'+value+'" style="display: none !important;" />').insertAfter(elem);
		var form = shim[0].form || document;
		var setValue = function(val){
			shim[0].value = val;
			val = shim[0].value;
			elem.text(val);
			elem[0].value = val;
		};
		
		elem[0].defaultValue = value;
		elem[0].value = value;
		
		elem.attr({'aria-live': 'polite'});
		if(id){
			shim.attr('id', id);
			elem.attr('aria-labeldby', $.webshims.getID($('label[for='+id+']', form)));
		}
		if(htmlFor){
			id = $.webshims.getID(elem);
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
	

	$.webshims.attr('value', {
		elementNames: ['output', 'input'],
		getter: true,
		setter: function(elem, value, oldFn){
			var setVal = $.data(elem, 'outputShim');
			if(!setVal){
				if($.nodeName(elem, 'output')){
					setVal = outputCreate(elem);
				} else {
					return oldFn();
				}
			}
			setVal(value);
		}
	});
	
	$.webshims.addReady(function(context){
		$('output', context).each(function(){
			outputCreate(this);
		});
	});
	
	$.webshims.createReadyEvent('output');
}, true);