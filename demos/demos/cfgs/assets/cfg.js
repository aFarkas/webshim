/**
 * @author Kyle Florence <kyle[dot]florence[at]gmail[dot]com>
 * @website https://github.com/kflorence/jquery-deserialize/
 * @version 1.2.1
 *
 * Dual licensed under the MIT and GPLv2 licenses.
 */

(function(factory){
	if(window.jQuery){
		factory(jQuery);
	} else if(window.webshims){
		webshims.ready('jquery', factory);
	}
})(function( jQuery ) {
	var undefined;
	var push = Array.prototype.push,
		rcheck = /^(?:radio|checkbox)$/i,
		rplus = /\+/g,
		rselect = /^(?:option|select-one|select-multiple)$/i,
		rvalue = /^(?:button|color|date|datetime|datetime-local|email|hidden|month|number|password|range|reset|search|submit|tel|text|textarea|time|url|week)$/i;

	function getElements( elements ) {
		return elements.map(function() {
			var elms = $.prop(this, 'elements');
			return elms ? jQuery.makeArray( elms ) : this;
		}).filter( ":input" ).get();
	}

	function getElementsByName( elements ) {
		var current,
			elementsByName = {};

		jQuery.each( elements, function( i, element ) {
			current = elementsByName[ element.name ];
			elementsByName[ element.name ] = current === undefined ? element :
				( jQuery.isArray( current ) ? current.concat( element ) : [ current, element ] );
		});

		return elementsByName;
	}

	jQuery.fn.deserialize = function( data, options ) {
		var i, length,
			elements = getElements( this ),
			normalized = [];

		if ( !data || !elements.length ) {
			return this;
		}

		if ( jQuery.isArray( data ) ) {
			normalized = data;

		} else if ( jQuery.isPlainObject( data ) ) {
			var key, value;

			for ( key in data ) {
				jQuery.isArray( value = data[ key ] ) ?
					push.apply( normalized, jQuery.map( value, function( v ) {
						return { name: key, value: v };
					})) : push.call( normalized, { name: key, value: value } );
			}

		} else if ( typeof data === "string" ) {
			var parts;

			data = data.split( "&" );

			for ( i = 0, length = data.length; i < length; i++ ) {
				parts =  data[ i ].split( "=" );
				push.call( normalized, {
					name: decodeURIComponent( parts[ 0 ] ),
					value: decodeURIComponent( parts[ 1 ].replace( rplus, "%20" ) )
				});
			}
		}

		if ( !( length = normalized.length ) ) {
			return this;
		}

		var current, element, j, len, name, property, type, value,
			change = jQuery.noop,
			complete = jQuery.noop,
			names = {};

		options = options || {};
		elements = getElementsByName( elements );

		// Backwards compatible with old arguments: data, callback
		if ( jQuery.isFunction( options ) ) {
			complete = options;

		} else {
			change = jQuery.isFunction( options.change ) ? options.change : change;
			complete = jQuery.isFunction( options.complete ) ? options.complete : complete;
		}

		for ( i = 0; i < length; i++ ) {
			current = normalized[ i ];

			name = current.name;
			value = current.value;

			if ( !( element = elements[ name ] ) ) {
				continue;
			}

			type = ( len = element.length ) ? element[ 0 ] : element;
			type = ( type.type || type.nodeName ).toLowerCase();
			property = null;

			if ( rvalue.test( type ) ) {
				if ( len ) {
					j = names[ name ];
					element = element[ names[ name ] = ( j == undefined ) ? 0 : ++j ];
				}

				change.call( element, ( $.prop(element, 'value', value ) ) );

			} else if ( rcheck.test( type ) ) {
				property = "checked";

			} else if ( rselect.test( type ) ) {
				property = "selected";
			}

			if ( property ) {
				if ( !len ) {
					element = [ element ];
					len = 1;
				}

				for ( j = 0; j < len; j++ ) {
					current = element[ j ];

					if ( current.value == value ) {
						change.call( current, ( $.prop(current, property, true) ) && value );
					}
				}
			}
		}

		complete.call( this );

		return this;
	};

});
;webshims.ready('jquery', function($){
$(function($){
	$('#code').each(function(){
		var lastData, configType, markupFormat;
		var output = $(this);
		var cfgFeature = $('#cfg-feature').val() || 'forms-ext';
		var getOptions = function(){
			configType = ($('#config-type').val() || $('#config-type option').eq(0).val()).split('-');
			markupFormat = $('#markup-format').val();
		};
		var prism = function(){
			if(window.Prism){
				Prism.highlightElement(this);
			}
		};
		var normalName = /([A-Z])/g;
		var nameFn = function(f, dashed){
			return '-'+dashed.toLowerCase();
		};
		var getScript = function(data){
			var obj;
			var code = '';
			if(configType[0] == 'markup'){
				
				if(data.classes.length){
					data.attr['class'] = data.classes.join(' ');
				}
				if(!$.isEmptyObject(data.data)){
					if(configType[1] == 'json'){
						data.attr['data-'+ data.cfgtype] = data.data;
					} else {
						$.each(data.data, function(name, val){
							data.attr['data-'+ data.cfgtype +'-'+name.replace(normalName, nameFn)] = val;
						});
					}
				}
			} else {
				obj = {};
				if(data.classes.length){
					data.data.classes = data.classes.join(' ');
				}
				if(!$.isEmptyObject(data.data)){
					obj[configType[1] == 'type' ? data.cfgtype : 'widgets'] = data.data;
					code += '<script>\n';
					code += '//configure before calling webshims.polyfill\n';
					code += 'webshims.setOptions("'+cfgFeature+'", ';
					code += JSON.stringify(obj, null, '\t') +');';
					if(cfgFeature == 'forms-ext'){
						code += '\n\n//webshims.polyfill("forms forms-ext");';
					} else {
						code += '\n\n//webshims.polyfill("'+ cfgFeature +'");';
					}
					code += '\n<\/script>\n';
				}
			}
			return code;
		};
		var getMarkup = function(data){
			var input = ['<input'];
			$.each(data.attr, function(name, val){
				if(typeof val == 'object'){
					input.push(name+"='"+ JSON.stringify(val, null, markupFormat == 'verbose' ? '\t' : null) +"'");
				} else {
					if(name.indexOf('data-') < 0 && typeof val == 'boolean'){
						val = '';
					}
					input.push(name+'="'+ val +'"');
				}
			});
			
			input.push('/>');
			if(data.attr.list){
				input.push('\n'+ $('#'+data.attr.list).prop('outerHTML'));
			}
			return input.join(markupFormat == 'verbose' ? '\n ' : ' ');
		};
		var render = function(data){
			var code = '\n';
			if(!data){
				data = lastData;
			} else {
				lastData = data;
			}
			
			data = $.extend(true, {}, data);
			code += getScript(data);
			code += '\n';
			code += getMarkup(data);
			code += '\n';
			$('code', output)
				.text(code)
				.each(prism)
			;
		};

		getOptions();

		$(this).on('change', function(){
			getOptions();
			render();
		});
		$(this).on('render', function(e, data){
			render(data);
		});
	});

	$('#dir').each(function(){
		var onChange = function(){
			$('#output').attr('dir', $(this).val());
			$('form.input-widget fieldset').eq(0).trigger('forcechange');
		};
		$(this).on('change', onChange).each(onChange);
	});
	
	$('#widget-scale').each(function(){
		var div = $('<div hidden="" />').appendTo('body').get(0);
		var fsScale = function(){
			var fs = $.prop(this, 'value');
			var style = 'x<style>#output .ws-popover, #output .input-picker, #output .ws-range, body >  .ws-popover { font-size:'+ fs +'px;}</style>';
			div.innerHTML = style;
			$(document).trigger('updatelayout');
		};
		$(this).on('input', fsScale).each(fsScale);
		
	});
	
	$('form.input-widget').each(function(){
		var lastState;
		var form = $(this);
		var type = form.data('type');
		var createWidget = function(){
			var curState = form.serialize();
			var output = {};
			var input = $('<input />');
			if(curState === lastState){
				return;
			}
			lastState = curState;
			if(type){
				input.attr('type', type);
			}
			$('fieldset[data-method]', form).each(function(){
				var obj = {};
				var method = $(this).data('method');
				$($.prop(this, 'elements')).filter('[name]').each(function(){
					var val, name;
					if($(this).is(':invalid') || $(this).is(':disabled')){return;}
					name = $.prop(this, 'name');
					if($.prop(this, 'type') == 'checkbox'){
						val =  $.prop(this, 'checked') ;
						if(val == $.prop(this, 'defaultChecked')){
							return;
						}
					} else {
						val = $(this).val();
						if( !val || (!$(this).is('.init-value') && (val === $.prop(this, 'defaultValue') || $('option:checked', this).prop('defaultSelected'))) ){
							return;
						}
						
						try {
							val = JSON.parse(val);
						} catch(e){}
					}
					if(typeof obj[name] == 'object' && typeof val == 'object'){
						$.extend(true, obj[name], val);
					} else {
						obj[name] = val;
					}
				});
				
				input[method]($(this).data('name') || obj, obj);
				
				if(method == 'data' && !type){
					type = $(this).data('name');
				}
				
				if(method == 'prop'){
					method = 'attr';
				}
				if(output[method]){
					$.extend(output[method], obj);
				} else {
					output[method] = obj;
				}
			});
			
			output.classes = [];
			
			$('fieldset[data-classes] input[name]:checked', form).each(function(){
				output.classes.push($.prop(this, 'name'));
			});
			
			$('#output')
				.html('<label for="'+ type+'">'+ type +' label</label>')
				.appendPolyfill(
					input.addClass('form-control '+output.classes.join(' ')).prop('id', type)
				)
			;
			if(!output.attr.type){
				output.attr.type = type;
			}
			output.cfgtype = type;
			$('#code').trigger('render', [output]);
			if(location.replace){
				location.replace('#'+ curState);
			}
		};
		$('> fieldset', form).on('change input forcechange', (function(){
			var timer;
			return function(e){
				clearTimeout(timer);
				if(e.type == 'forcechange'){
					lastState = null;
				}
				timer = setTimeout(createWidget, e.type == 'input' ? 200 : 9);
			};
		})());
		form.on('submit', false);
		if(form.deserialize){
			form.deserialize(location.hash.substr(1));
		}
		createWidget();
	});
	
	(function(){
		var getFormElements = function(names, form){
			return names.split(' ').map(function(name){
				return form.prop(name);
			});
		};
		var isChecked = function(elem){
			return elem && $.prop(elem, 'checked');
		};
		$('[data-needs]').each(function(){
			var module = $(this);
			var form = module.jProp('form');
			var needs = getFormElements(module.data('needs'), module.jProp('form'));
			var enable = function(){
				module.prop('disabled', !needs.some(isChecked));
			};
			module.each(enable);
			$(needs).on('change', enable);
		});
		$('[data-excludes]').each(function(){
			var module = $(this);
			var excludes = getFormElements(module.data('excludes'), module.jProp('form'));
			
			var enable = function(){
				module.prop('disabled', excludes.some(isChecked));
			};
			var addFlag = function(excludes){
				var excludeFlags = $.data(this, 'excludeFlags') || $.data(this, 'excludeFlags', {});
				excludeFlags[module.prop('name')] = true;
			};
			var enableExclude = function(){
				var excludeFlags = $.data(this, 'excludeFlags');
				if(excludeFlags){
					delete excludeFlags[module.prop('name')]; 
				}
				if(!excludeFlags || $.isEmptyObject(excludeFlags)){
					$.prop(this, 'disabled', false);
				}
			};
			module.each(enable).on('change', function(){
				if($(this).prop('checked')){
					$(excludes).prop('disabled', true);
					$(excludes).each(addFlag);
				} else {
					$(excludes).each(enableExclude);
				}
			});
			$(excludes).on('change', enable);
			enable();
		});
	})();
});
});
