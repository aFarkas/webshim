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
				return docElem.scrollTop;
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

		this.stickyData = {inline: {}};
		this.parentData = {};

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
		getStickyData: function(){
			this.stickyData.top = this.$el.offset().top;

			this.stickyData.scrollTop = this.stickyData.top - (parseFloat(this.$el.css('marginTop'), 10) || 0);
			this.stickyData.outerHeight = this.$el.outerHeight(true);

			this.stickyData.bottom = this.stickyData.top + this.stickyData.outerHeight - (parseFloat(this.$el.css('marginTop'), 10) || 0);

			this.stickyData.width = this.$el.width();
			this.stickyData.inline.width = this.elStyle.width;

			if(this.ankered == 'top'){
				this.stickyData.inline.top = this.elStyle.top;
			} else if(this.ankered == 'bottom'){
				this.stickyData.inline.bottom = this.elStyle.bottom;
			}

		},
		getParentData: function(){

			this.parentData.top = this.$parent.offset().top + (parseFloat(this.$parent.css('borderTopWidth'), 10) || 0) + (parseFloat(this.$parent.css('paddingTop'), 10) || 0);
			this.parentData.height = this.$parent.height();
			this.parentData.bottom = this.parentData.top + this.parentData.height;

		},
		updateDimension: function(fromPos){
			if(this.isSticky){
				this.removeSticky();
			}
			this.getParentData();
			this.getStickyData();

			if (this.ankered == 'bottom') {
				this.viewportBottomAnker = $window.height() - this.position.bottom;
			}

			if(!fromPos){
				this.updatePos(true);
			}
		},
		updatePos: function(fromDimension){
			var offset, shouldSticky, shouldMoveWith;
			var scroll = getWinScroll();

			if (this.ankered == 'top') {
				offset = scroll + this.position.top;
				if(this.stickyData.scrollTop < offset && scroll - 9 <= this.parentData.bottom){
					shouldMoveWith = (offset + this.stickyData.outerHeight) - this.parentData.bottom;
					if(shouldMoveWith >= 0){
						shouldMoveWith *= -1;
					} else {
						shouldMoveWith = false;
					}

					shouldSticky =  true;
				}
			} else if (this.ankered == 'bottom') {
				offset = scroll + this.viewportBottomAnker;


				if(this.stickyData.bottom > offset &&
					offset + 9 >= this.parentData.top){
					shouldSticky =  true;

					shouldMoveWith = offset - this.parentData.top - this.stickyData.outerHeight;
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

					if(this.stickyData.width != this.$el.width()){
						this.$el.width(this.stickyData.width);
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
			this.$el.css(this.stickyData.inline);
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
