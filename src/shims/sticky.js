/**
 * this polyfill is based on https://github.com/filamentgroup/fixed-sticky, but it's heavily optimized
 */

webshim.register('sticky', function($, webshim, window, document, undefined){

	"use strict";

	var uid = 0;
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

		this.evtid = '.stickyid' + uid;
		this.$el = $(dom).data('wsSticky', this);
		this.$parent = this.$el.parent();


		this.ankered = '';
		this.isSticky = false;
		this.$placeholder = null;
		this.addEvents();
		this.update(true);
	}

	Sticky.prototype = {
		addEvents: function () {
			var that = this;
			var update = function() {
				that.update();
			};


			$window
				.on('scroll' + this.evtid, function () {
					if (that.$el[0].offsetWidth) {
						that.updatePos();
					}
				})
				.one('load', update)
			;

			$(document).on('updateshadowdom' + this.evtid, update);



			this.$el.on('remove'+ this.evtid+' destroysticky'+ this.evtid, function () {
				$window.off(that.evtid);
				$(document).off(that.evtid);

				this.$el.off(that.evtid);

				if (that.$placeholder) {
					that.$el.removeClass('ws-sticky-on');
					that.$placeholder.remove();
				}
			});

			this.$el.on('updatesticky'+ this.evtid, function(){
				that.update(true);
			});

		},
		getPosition: function () {
			this.position = {
				top: this.$el.css('top'),
				bottom: this.$el.css('bottom')
			};

			if (this.position.top !== 'auto' || this.position.top !== 'auto') {
				this.position = $.swap(this.$el[0], {position: 'absolute'}, function () {
					return {
						top: $(this).css('top'),
						bottom: $(this).css('bottom')
					};
				});
			}

			if (this.position.top !== 'auto') {
				this.position.top = parseFloat(this.position.top, 10) || 0;
				delete this.position.bottom;
				this.ankered = 'top';
			} else if (this.position.bottom !== 'auto') {
				this.position.bottom = parseFloat(this.position.bottom, 10) || 0;
				delete this.position.top;
				this.ankered = 'bottom';
			}

		},
		updateDimension: function (full) {
			this.height = this.$el.outerHeight();
			this.parentOffset = this.$parent.offset().top;

			if (this.ankered == 'bottom') {
				this.viewportHeight = $window.height();
			} else {
				this.parentHeight = this.$parent.outerHeight();
			}

			if (!this.isSticky) {
				this.elTop = this.$el.offset().top;
				this.elWidth = this.$el.width();
			} else if(full && this.$parent.innerWidth() < this.elWidth){
				this.$el.removeClass('ws-sticky-on');
				this.$el.css('width', this.elOldWidth || '');
				this.elTop = this.$el.offset().top;
				this.elWidth = this.$el.width();
				this.$el.addClass('ws-sticky-on');
				this.$el.css('width', this.elWidth);
			}
		},
		updatePos: function () {

			var offset, shouldSticky;
			var scroll = getWinScroll();

			if (this.ankered == 'top') {
				offset = scroll + this.position.top;
				shouldSticky = this.elTop < offset && offset + this.height <= this.parentOffset + this.parentHeight;

			} else if (this.ankered == 'bottom') {
				shouldSticky = (this.elTop + this.height > scroll + this.viewportHeight - this.position.bottom &&
					scroll + this.viewportHeight - this.position.bottom >= this.parentOffset + this.height)
			}

			if (shouldSticky) {
				if (!this.isSticky) {
					this.isSticky = true;
					this.$el.addClass('ws-sticky-on');
					if(this.elWidth != this.$el.width()){
						this.elOldWidth = this.$el[0].style.width;
						this.$el.width(this.elWidth);
					}
					if (!this.$placeholder) {
						this.$placeholder = $('<span class="ws-fixedsticky-placeholder" />').insertAfter(this.$el).css('height', this.height);
					}
				}
			} else if (this.isSticky) {
				this.isSticky = false;
				this.$el.removeClass('ws-sticky-on');
				this.$el.css('width', this.elOldWidth || '');
			}
		},
		update: function (full) {
			if (this.$el[0].offsetWidth || !this.ankered) {
				if (full) {
					this.getPosition();
				}
				this.updateDimension(full);
				this.updatePos(full);
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
			new Sticky(this);
			loadDomSupport();
		}
	};

	if (!support.sticky && support.fixed) {
		$(function(){
			webshim.addReady(function(context, insertedElement){
				$('.ws-sticky', context).add(insertedElement.filter('.ws-sticky')).each(addSticky);
			});
		});
	}


});
