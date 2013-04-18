/*
 * simple helper for a mousepress event
 * used by webshims improving spinbutton controls for input[type=time], input[type=number]...
 * 
 * $(element).bind('mousepress', function(){
 * 	//repeatedly called after mousedown, till mouseleave/mouseup
 * });
 */
(function($){
	var removeTimer = function(elem, full){
		var timer = elem.data('mousepresstimer');
		if(timer){
			clearTimeout(timer);
		}
		if(full){
			elem.unbind('mouseup.mousepressext mouseleave.mousepressext');
		}
		elem = null;
	};
	$.event.special.mousepress = {
		setup: function(){
			var timer;
			$(this).bind('mousedown.mousepressext', function(e){
				var elem = $(this);
				
				var startIntervall = function(delay){
					var steps = 0;
					removeTimer(elem);
					elem.data('mousepresstimer', setInterval(function(){
						$.event.special.mousepress.handler(elem[0], e);
						steps++;
						if(steps > 3 && delay > 45){
							startIntervall(delay - 40);
						}
					}, delay));
				};
				var target = $(e.target).trigger('mousepressstart', [e]);
				
				removeTimer(elem);
				elem.data('mousepresstimer', setTimeout(function(){
					startIntervall(180);
				}, 200));
				
				elem.bind('mouseup.mousepressext mouseleave.mousepressext', function(e){
					removeTimer(elem, true);
					target.trigger('mousepressend', [e]);
					elem = null;
					target = null;
				});
			});
		},
		teardown: function(){
			removeTimer($(this).unbind('.mousepressext'), true);
		},
		handler: function(elem, e){
			return $.event.dispatch.call(elem, {type: 'mousepress', target: e.target, pageX: e.pageX, pageY: e.pageY});
		}
	};
	
})(jQuery);
;/*! Copyright (c) 2013 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.1.3
 *
 * Requires: 1.2.2+
 */

(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var toFix = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'];
    var toBind = 'onwheel' in document || document.documentMode >= 9 ? ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];
    var lowestDelta, lowestDeltaXY;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    $.event.special.mousewheel = {
        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
        },

        unmousewheel: function(fn) {
            return this.unbind("mousewheel", fn);
        }
    });


    function handler(event) {
        var orgEvent = event || window.event,
            args = [].slice.call(arguments, 1),
            delta = 0,
            deltaX = 0,
            deltaY = 0,
            absDelta = 0,
            absDeltaXY = 0,
            fn;
        event = $.event.fix(orgEvent);
        event.type = "mousewheel";

        // Old school scrollwheel delta
        if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta; }
        if ( orgEvent.detail )     { delta = orgEvent.detail * -1; }

        // New school wheel delta (wheel event)
        if ( orgEvent.deltaY ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( orgEvent.deltaX ) {
            deltaX = orgEvent.deltaX;
            delta  = deltaX * -1;
        }

        // Webkit
        if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY; }
        if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Look for lowest delta to normalize the delta values
        absDelta = Math.abs(delta);
        if ( !lowestDelta || absDelta < lowestDelta ) { lowestDelta = absDelta; }
        absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
        if ( !lowestDeltaXY || absDeltaXY < lowestDeltaXY ) { lowestDeltaXY = absDeltaXY; }

        // Get a whole value for the deltas
        fn = delta > 0 ? 'floor' : 'ceil';
        delta  = Math[fn](delta / lowestDelta);
        deltaX = Math[fn](deltaX / lowestDeltaXY);
        deltaY = Math[fn](deltaY / lowestDeltaXY);

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

}));
;(function($){
	
	$.webshims.ready('DOM', function(){
		if(!window.console){
			window.console = {log: $.noop};
		}
		if(!window.ActiveXObject){
			$('code.run-once').each(function(){
				var elem = this;
				$('<button>run example</button>').insertAfter(elem).click(function(){
					eval(elem.innerHTML.replace(/&gt;/g, '>').replace(/&lt;/g, '<'));
					this.disabled = true;
					return false;
				});
			});
			
		}
		
		
		$('div.feature-example').each(function(){
			var div = $('div.hidden-explanation', this).hide();
			$('button', this).bind('click', function(){
				$('#placeholder').attr('placeholder', $('#placeholder-text').val());
				div.slideDown();
				return false;
			});
		});
		
		(function(){
			var hash = (location.hash || '').replace(/^#/, '');
			$('div.accordion')
				.each(function(){
					var active;
					var accordion = this;
					var headers = $('h3.button', this);
					var panels = headers.next().hide();
					var selected = (hash) ? headers.filter('[id="'+hash+'"]') : 0;
					
					var jumpIntoView = function(){
						if(active.offset().top < $(window).scrollTop()){
							setTimeout(function(){
								active.prev('h3').get(0).scrollIntoView(true);
							}, 1);
						}
					};
					
					
					headers.on('click', function(){
						var nextActive = panels.eq(headers.index(this));
						if(nextActive[0] != active[0]){
							active.slideUp();
							active = nextActive.slideDown(jumpIntoView);
						}
						return false;
						
					});
					
					if(selected && selected[0]){
						selected = headers.index(selected[0]);
						setTimeout(jumpIntoView, 9);
					}
					active = panels.eq(selected).show();
					$(window).bind('hashchange', function(){
						hash = (location.hash || '').replace(/^#/, '');
						selected = headers.filter('[id="'+hash+'"]');
						if(selected[0]){
							selected.triggerHandler('click');
						}
					});
				})
			;
		})();
	});
})(jQuery);
(function($){
	var remove;
	var regStart = /\/\/<([A-Za-z]+)/;
	var regEnd = /\/\/>/;
	var webshimsBuilder = {
		data: null,
		init: function(form){
			$.webshims.ready('DOM es5', function(){
				$(form).each(function(){
					webshimsBuilder.getData(this.getAttribute("data-polyfillpath"));
					var dependentChecked = function(id){
						$('#'+id).prop('checked', true).prop('disabled', true);
					};
					var dependentUnChecked = function(id){
						$('#'+id).prop('disabled', false);
					};
					var form = this;
					$('fieldset.config', this)
						.delegate('input[data-dependent]', 'click cfginit', function(){
							$.attr(this, 'data-dependent').split(" ").forEach( $.prop(this, 'checked') ? dependentChecked : dependentUnChecked );
						})
						
					;
					
					$(this)
						.delegate('input[type="checkbox"]', 'click cfginit', (function(){
							var timer;
							var modLink = $('a.modernizr-builder', form);
							var base = modLink.data('base');
							return function(){
								clearTimeout(timer);
								timer = setTimeout(function(){
									var mods = [];
									var add = '';
									$('input[data-mod]:checked', form).each(function(){
										$.merge(mods, ($(this).data('mod') || '').split(' '));
									});
									add = mods.length ? '-'+ (mods.join('-')) : '';
									$('code.modernizr-output', form).html(add);
									modLink.attr('href', base + add); 
								}, 0);
							};
						})())
						.find('input[data-dependent]')
						.trigger('cfginit')
					;
					
					$(this).bind('submit', function(e){
						var buildFeatures = [];
						var removeFeatures = [];
						
						$('fieldset.config input:not(:disabled)[id]', this).each(function(checkbox){
							var id = $.prop(this, 'id');
							if($.prop(this, 'checked')){
								buildFeatures.push(id);
							} else {
								$.merge(removeFeatures, $(this).data('features') || [id]);
							}
							
						});
						webshimsBuilder.buildScript(buildFeatures, removeFeatures, $('textarea[name="js_code"]', this));
					});
				});
			});
		},
		getData: function(path){
			
			$.ajax(path, {
				dataType: 'text',
				success: function(data){
					webshimsBuilder.data = data;
				}
			});
		},
		getRemoveCombos: function(removeFeatures){
			var combos = [];
			var removeModules = [];
			$.each(removeFeatures, function(i, feature){
				$.merge(removeModules, $.webshims.features[feature]);
			});
			$.each($.webshims.c, function(c, modules){
				$.each(modules, function(i, module){
					if($.inArray(module, removeModules) !== -1){
						combos.push(c);
						return false;
					}
				});
			});
			return combos;
		},
		buildScript: function(features, removeFeatures, output){
			var result = [];
			var combos = webshimsBuilder.getRemoveCombos(removeFeatures);
			var data = webshimsBuilder.data.replace(/\t/g, "").split(/[\n\r]/g);
			
			data.forEach(function(line){
				var foundFeature;
				var featureCombo;
				
				if(remove){
					remove = !(regEnd.exec(line));
				} else if( !line || !(foundFeature = regStart.exec(line)) || $.inArray(foundFeature[1], features) !== -1 ){
					if(combos.length && line.indexOf("removeCombos") != -1){
						line = line.replace(/\/\/>removeCombos</, "removeCombos = removeCombos.concat(["+ combos.join(",") +"]);" );
					}
					result.push(line);
				} else if(foundFeature){
					
					remove = true;
				}
			});
			
			$(output).val(result.join("\n"));
		}
	};
	
	webshimsBuilder.init('form[data-polyfillpath]');
})(jQuery);