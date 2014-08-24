webshim.register('sticky', function($, webshim, window, document, undefined){

	"use strict";

	var uid = 0;
	var stickys = 0;
	var $window = $(window);

	function getCssValue(property, value, noPrefixes) {
		var prop = property + ':',
			el = document.createElement('test'),
			mStyle = el.style;

		if (!noPrefixes) {
			mStyle.cssText = prop + [ '-webkit-', '-moz-', '-ms-', '-o-', '' ].join(value + ';' + prop) + value + ';';
		} else {
			mStyle.cssText = prop + value;
		}

		return mStyle[ property ];
	}

	function getPos() {
		return {
			top: $.css(this, 'top'),
			bottom: $.css(this, 'bottom')
		};
	}

	var getWinScroll = (function () {
		var docElem;
		var prop = 'pageYOffset';

		return (prop in window) ?
			function () {
				return window[ prop ];
			} :
			((docElem = document.documentElement), function () {
				return docElem.scrollTop();
			})
			;
	})();

	var support = {
		fixed: getCssValue('position', 'fixed', true),
		sticky: getCssValue('position', 'sticky')
	};

	function Sticky(dom) {

		uid++;
		stickys++;

		this.evtid = '.wsstickyid' + uid;
		this.$el = $(dom).data('wsSticky', this);
		this.$parent = this.$el.parent();
		this.elStyle = dom.style;


		this.ankered = '';
		this.isSticky = false;
		this.$placeholder = null;

		if(this.hasOverflowVisibleContainer()){
			this.addEvents();
			this.update(true);
		} else {
			webshim.warn('we currently only support sticky with overflow visible containers');
		}

	}

	Sticky.prototype = {
		addEvents: function () {
			var that = this;
			var update = function() {
				that.update();
			};


			$window
				.on('scroll' + this.evtid, function () {
					if (that.ankered && that.$el[0].offsetWidth) {
						that.updatePos();
					}
				})
				.one('load', update)
			;

			$(document).on('updateshadowdom' + this.evtid, update);

			this.$el.on('remove'+ this.evtid+' destroysticky'+ this.evtid, function () {
				$window.off(that.evtid);
				$(document).off(that.evtid);

				that.$el.off(that.evtid);
				that.$el.removeData('wsSticky').removeClass('ws-sticky');

				if (that.$placeholder) {
					that.$el.removeClass('ws-sticky-on');
					that.$placeholder.remove();
				}

				stickys--;
			});

			this.$el.on('updatesticky'+ this.evtid, function(){
				that.update(true);
			});

			this.$el.on('changesticky'+ this.evtid, function(){
				that.trashPosition(true);
			});

		},
		hasOverflowVisibleContainer: function(){
			return (this.$parent.css('overflowY') || this.$parent.css('overflow') || 'visible') == 'visible';
		},
		trashPosition: function(){
			if(this.isSticky){
				this.removeSticky();
			}
			this.update(true);
		},
		getPosition: function () {

			if(!this.isSticky){
				this.position = {
					top: this.$el.css('top'),
					bottom: this.$el.css('bottom')
				};

				if ((
					(this.position.top != 'auto' && this.position.bottom != 'auto') ||
						this.position.top == 'auto' && this.position.bottom == 'auto')) {
					this.position = $.swap(this.$el[0], {position: 'absolute'}, getPos);
				}

				if (this.position.top !== 'auto') {
					delete this.position.bottom;
					this.ankered = 'top';
				} else if (this.position.bottom !== 'auto') {
					delete this.position.top;
					this.ankered = 'bottom';
				}

				if(this.ankered == 'top'){
					this.position.top = parseFloat(this.position.top, 10) || 0;
				} else if(this.ankered == 'bottom'){
					this.position.bottom = parseFloat(this.position.bottom, 10) || 0;
				}

				this.inlineTop = this.elStyle.top;
				this.inlineBottom = this.elStyle.bottom;
			}
		},
		updateDimension: function (noPos) {
			if(this.isSticky){
				this.removeSticky();
			}

			var parentOffset = this.$parent.offset().top;
			this.elOuterHeight = this.$el.outerHeight();


			this.elTop = this.$el.offset().top;
			this.elWidth = this.$el.width();
			this.inlineWidth = this.elStyle.width;

			if(this.ankered == 'top'){
				this.elMargins = ( parseFloat(this.$el.css('borderTopWidth'), 10) || 0) + ( parseFloat(this.$el.css('marginTop'), 10) || 0);
				this.elTop -= this.elMargins;
			} else {
				this.elMargins = ( parseFloat(this.$el.css('borderBottomWidth'), 10) || 0) + ( parseFloat(this.$el.css('marginBottom'), 10) || 0);
				this.elTop += this.elMargins;
			}

			if (this.ankered == 'bottom') {
				this.viewportBottomAnker = $window.height() - this.position.bottom;
				this.viewportTopAnker = parentOffset + (parseFloat(this.$parent.css('borderTopWidth'), 10) || 0) + (parseFloat(this.$parent.css('paddingTop'), 10) || 0) + this.elMargins;
				this.elBottom = this.elTop + this.elOuterHeight;
			} else {
				this.parentBottom = parentOffset + this.$parent.innerHeight() - (parseFloat(this.$parent.css('paddingBottom'), 10) || 0)  + (parseFloat(this.$parent.css('borderBottomWidth'), 10) || 0) - this.elMargins;
			}

			if(!noPos){
				this.updatePos(true);
			}
		},
		updatePos: function (fromDimension) {

			var offset, shouldSticky, shouldMoveWith;
			var scroll = getWinScroll();
			if (this.ankered == 'top') {
				offset = scroll + this.position.top;
				if(this.elTop < offset && offset - (this.elMargins + 9) <= this.parentBottom){
					shouldMoveWith = offset + this.elOuterHeight - this.parentBottom + this.elMargins;
					if(shouldMoveWith >= 0){
						shouldMoveWith *= -1;
					} else {
						shouldMoveWith = false;
					}

					shouldSticky =  true;
				}
			} else if (this.ankered == 'bottom') {
				offset = scroll + this.viewportBottomAnker;


				if(this.elBottom > offset &&
					offset + (this.elMargins + 9) >= this.viewportTopAnker){
					shouldSticky =  true;
					shouldMoveWith = offset - this.elMargins - this.viewportTopAnker - this.elOuterHeight;
					if(shouldMoveWith >= 0){
						shouldMoveWith = false;
					}
				}
			}

			if (shouldSticky) {
				if (!this.isSticky) {

					//updateDimension before layout trashing
					if(!fromDimension){
						this.updateDimension(true);
					}

					if (!this.$placeholder) {
						this.$placeholder = this.$el
							.clone()
							.addClass('ws-fixedsticky-placeholder')
						;
					}
					this.$placeholder.insertAfter(this.$el).outerHeight(this.elOuterHeight);

					this.isSticky = true;
					this.$el.addClass('ws-sticky-on');

					if(this.elWidth != this.$el.width()){
						this.$el.width(this.elWidth);
					}
				}
				if(shouldMoveWith){
					if(this.ankered == 'top'){
						this.elStyle.top = this.position.top + shouldMoveWith +'px';
					} else if(this.ankered == 'bottom'){
						this.elStyle.bottom = this.position.bottom + shouldMoveWith +'px';
					}
				}
			} else if (this.isSticky) {
				this.removeSticky();
			}
		},
		removeSticky: function(){
			this.$el.removeClass('ws-sticky-on');
			this.$el.css({
				width: this.inlineWidth || '',
				top: this.inlineTop || '',
				bottom: this.inlineBottom || ''
			});
			this.$placeholder.detach();
			this.isSticky = false;
		},
		update: function (full) {
			if (this.$el[0].offsetWidth || !this.ankered) {
				if (full) {
					this.getPosition();
				}
				this.updateDimension();
			}
		}
	};

	var loadDomSupport = function(){
		loadDomSupport = $.noop;
		webshim.ready('WINDOWLOAD', function(){
			webshim.loader.loadList(['dom-extend']);
			webshim.ready('dom-extend', function(){
				webshim.addShadowDom();
			});
		});
	};

	var addSticky = function(){
		if(!$.data(this, 'wsSticky')){
			$(this).addClass('ws-sticky');
			new Sticky(this);
			loadDomSupport();
		}
	};

	if (!support.sticky && support.fixed) {
		$(document).on('wssticky', function(e){
			addSticky.call(e.target);
		});
		$(function(){
			webshim.addReady(function(context, insertedElement){
				$('.ws-sticky', context).add(insertedElement.filter('.ws-sticky')).each(addSticky);
			});
		});
	}

	if(document.readyState == 'complete'){
		webshim.isReady('WINDOWLOAD', true);
	}
});
