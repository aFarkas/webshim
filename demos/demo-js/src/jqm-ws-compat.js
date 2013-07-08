(function($){
	if(!window.Modernizr || !window.webshims){
		if(window.console && console.log){
			console.log('Please include after Modernizr, webshims and jQuery mobile');
		}
		return;
	}
	
	
	window.hasMobileAspect = function(){
		var assumeMobile = /mobile/i.test(navigator.userAgent) ? 2 : 0;
		var mqTest = {
			0: '480',
			1: '1024',
			2: '1440'
		};
		
		$.each(['touch', 'lowbandwidth', 'lowbattery'], function(i, name){
			if(Modernizr[name]){
				assumeMobile++;
				if(assumeMobile > 2){
					return false;
				}
			}
		});
		if(assumeMobile < 3 && Modernizr.mq && Modernizr.mq('(max-device-width: '+mqTest[assumeMobile]+'px)')){
			assumeMobile = 3;
		}
		
		window.hasMobileAspect = (assumeMobile < 3) ?
			function(){return false;} :
			function(){return true;}
		;
		return window.hasMobileAspect();
	};
	
	if(!$.mobile){
		if(window.console && console.log){
			console.log('Please include after jQuery mobile');
		}
		return;
	}
	
	var doCreate = function(constructor, fn){
		if(constructor && constructor.prototype && constructor.prototype._create){
			constructor.prototype._wsSuperCreate = constructor.prototype._create;
			constructor.prototype._create = fn;
		}
	};
	
	var onDomSupport = function(fn){
		if(!onDomSupport.run){
			webshims.ready('WINDOWLOAD', function(){
				webshims._polyfill(['dom-support']);
			});
		}
		onDomSupport.run = true;
		webshims.ready('dom-support', fn);
	};
	
	doCreate($.mobile.textinput, function(){
		var wsWidget, events, eventCount;
		var ret = this;
		var type = this.element.getNativeElement().prop('type');
		
		if(type == 'number' && this.element.attr('data-type') == 'range'){
			this.element.removeClass('ws-important-hide');
		}
		if(this.element.is('.ws-important-hide')){
			wsWidget = this;
			
			setTimeout(function(){
				wsWidget.destroy();
			}, 4);
		} else {
			
			wsWidget = this.element.data('wsWidget'+type);
			
			ret = this._wsSuperCreate.apply(this, arguments);
			if(wsWidget){
				$(wsWidget.orig)
					.addClass(this.element.prop('className'))
					.removeClass('ws-'+type)
					.insertBefore(this.element)
				;
				$( "label[for='" + $(wsWidget.orig).prop( "id" ) + "']" ).addClass( "ui-input-text" );
				wsWidget.buttonWrapper.insertAfter(this.element);
			}
		}
		return ret;
	});
	
	doCreate($.mobile.slider, function(){
		this.element.removeClass('ws-important-hide');
		this._wsSuperCreate.apply(this, arguments);
	});
	
	doCreate($.mobile.selectmenu, function(){
		var that = this;
		this._wsSuperCreate.apply(this, arguments);
		if(this.element.is('select')){
			onDomSupport(function(){
				webshims.addShadowDom(that.element, that.button, {
					shadowFocusElement: that[that.options.nativeMenu ? 'element' : 'button']
				});
			});
		}
	});
	
	doCreate($.mobile.checkboxradio, function(){
		var that = this;
		this._wsSuperCreate.apply(this, arguments);
		if(this.element.is('input[type="radio"], input[type="checkbox"]')){
			onDomSupport(function(){
				webshims.addShadowDom(that.element, that.label, {
					shadowFocusElement: that.element
				});
			});
		}
	});
	
	
	
})(jQuery);
