webshims.ready('jquery', function($){
	// Set up the 'play' buttons for each runnable code example.
	//todo need to write a prism plugin
	/*
	 $(function(){
	 
	 $('.runnable').each(function(){
	 var code = this;
	 var button = '<div class="run" title="Run"></div>';
	 $(button).insertBefore(code).bind('click', function(){
	 eval($(code).text());
	 });
	 });
	 });
	 */
	// highlight the active menu. Modified from http://expressjs.com/app.js
	$(function(){
		var prev;
		var n = 0;
		
		var headings = $('h2[id],h3[id]').map(function(i, el){
			return {
				top: $(el).offset().top,
				id: el.id
			};
		});
		
		function closest(){
			var h;
			var top = $(window).scrollTop();
			var i = headings.length;
			while (i--) {
				h = headings[i];
				if (top >= h.top) {
					return h;
				}
			}
		}
		var _onScroll = (function(){
			var timer;
			var fn = function(){
				var h = closest();
				if (!h) {
					return;
				}
				
				if (prev) {
					prev.removeClass('active');
				}
				
				var a = $('a[href="#' + h.id + '"]');
				a.addClass('active');
				
				prev = a;
			};
			return function(){
				clearTimeout(timer);
				timer = setTimeout(fn, 1);
			};
		})();
		
		$(document).on('scroll', _onScroll);
		_onScroll();
	});


	$(function(){
		var top = $(window).scrollTop();
		var bottom = $(window).height() + top;
		var runStep = function(){
			var fiddle = document.querySelector('div.fiddle-example');
			if(fiddle){
				replaceFiddle(fiddle);
			} else {
				$(document).off('.fiddlereplace');
			}
		};

		var replaceFiddle = function(fiddle){
			var src = $(fiddle).data('src');
			return $('<iframe class="fiddle-example" />')
				.on('load', runStep)
				.attr({
					src: src,
					frameborder: 0
				})
				.css({
					width: '100%',
					height: $(fiddle).height(),
					allowfullscreen: ""
				})
				.replaceAll(fiddle)
			;

		};



		$(document).on('click.fiddlereplace', function(e){
			if($(e.target).is('div.fiddle-example')){
				replaceFiddle(e.target);
			}
		});

		$(document.querySelectorAll('div.fiddle-example')).each(function(){
			var elemTop = ($(this).offset() || {top: 0}).top - 50;
			if(elemTop > bottom){
				return false;
			} else if(Math.abs(elemTop - top) < 200){
				replaceFiddle(this);
			}
		});

		webshim.ready('WINDOWLOAD', runStep);
	});
	
	
	$(function(){
		var langs = webshims.validityMessages.availableLangs.concat(['de', 'en', 'en-AU', 'en-GB', 'en-US']).sort();
		
		langs.unshift('');
		$('select.active-lang').each(function(){
			var select = $(this);
			var options = langs.map(function(lang){
				return '<option>'+ lang +'</option>';
			});
			var onLangChange = function(){
				select.val(this.__activeName ||  webshims.activeLang());
			};
			
			select
				.html(options)
				.on('change', function(){
					var value = select.val();
					if(value){
						webshims.activeLang(value);
					}
				})
			;
			$(webshims.validityMessages)
				.on('change', onLangChange)
				.each(onLangChange)
			;
		});
	});
});
	
