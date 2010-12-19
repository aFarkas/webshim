(function($, webshims, window, document, undefined){
	var listidIndex = 0;
	
	var noDatalistSupport = {
		submit: 1,
		button: 1,
		reset: 1, 
		hidden: 1,
		
		//ToDo
		range: 1,
		date: 1
	};
	var noMin = ($.browser.msie && parseInt($.browser.version, 10) < 7);
	
	var getStoredOptions = function(name){
		if(!name){return [];}
		var data;
		try {
			data = JSON.parse(localStorage.getItem('storedDatalistOptions'+name));
		} catch(e){
			data = [];
		}
		return data || [];
	};
	var storeOptions = function(name, val){
		if(!name){return;}
		val = val || [];
		try {
			localStorage.setItem( 'storedDatalistOptions'+name, JSON.stringify(val) );
		} catch(e){}
	};
	var getType = function(elem){
		return (elem.getAttribute('type') || '').toLowerCase() || elem.type;
	};
	var getText = function(elem){
		return (elem.textContent || elem.innerText || jQuery.getText([ elem ]) || '');
	};
	
	var Datalist = function(input, id, datalist){
		this.init(input, id, datalist);
	};
	
	Datalist.prototype = {
		init: function(input, id, datalist){
			datalist = datalist || id && document.getElementById(id);
			if(!datalist || noDatalistSupport[getType(input)]){return;}
			var data = $.data(input, 'datalistWidget');
			if(datalist && data && (data.datalist !== datalist)){
				data.datalist = datalist;
				data.id = id;
				data.needsUpdate = true;
				return;
			} 
			if(!datalist){
				if(data){
					data.destroy();
				}
				return;
			}
			listidIndex++;
			var that = this;
			this.timedHide = function(){
				clearTimeout(that.hideTimer);
				that.hideTimer = setTimeout($.proxy(that, 'hideList'), 9);
			};
			this.datalist = datalist;
			this.id = id;
			this.idindex = listidIndex;
			this.hasViewableData = true;
			this._autocomplete = $.attr(input, 'autocomplete');
			$.data(input, 'datalistWidget', this);
			this.shadowList = $('<div class="datalist-polyfill" style="display: none;" />').appendTo('body');
			this.index = -1;
			this.input = input;
			
			this.storedOptions = getStoredOptions(input.name || input.id);
			
			
			this.shadowList
				.delegate('li', 'mouseover.datalistWidget mousedown.datalistWidget click.datalistWidget', function(e){
					var items = $('li:not(.hidden-item)', that.shadowList);
					var select = (e.type == 'mousedown' || e.type == 'click');
					that.markItem(items.index(e.target), select, items, 'mouse');
					if(e.type == 'click'){
						that.hideList();
					}
					return (e.type != 'mousedown');
				})
				.bind('focusout', this.timedHide)
			;
			
			$(input)
				.attr({
					autocomplete: 'off', 
					//role: 'combobox',
					'aria-haspopup': 'true'
				})
				.bind('input.datalistWidget', $.proxy(this, 'showHideOptions'))
				.bind('keydown.datalistWidget', function(e){
					var keyCode = e.keyCode;
					var items;
					if(keyCode == 40 && !that.showList()){
						that.markItem(that.index + 1, true);
						return false;
					} 
					
					if(!that.shadowList.hasClass('datalist-visible')){return;}
					
					 
					if(keyCode == 38){
						that.markItem(that.index - 1, true);
						return false;
					} 
					if(keyCode == 33 || keyCode == 36){
						that.markItem(0, true);
						return false;
					} 
					if(keyCode == 34 || keyCode == 35){
						items = $('li:not(.hidden-item)', that.shadowList);
						that.markItem(items.length - 1, true, items);
						return false;
					} 
					if(keyCode == 13 || keyCode == 27){
						that.hideList();
						return false;
					}
	
				})
				.bind('blur.datalistWidget', this.timedHide)
			;
			
			$(this.datalist)
				.unbind('updateDatalist.datalistWidget')
				.bind('updateDatalist.datalistWidget', function(){
					that.needsUpdate = true;
					that.updateTimer = setTimeout(function(){
						that.updateListOptions();
					}, 10 *  that.idindex);			
				})
				.triggerHandler('updateDatalist')
			;
			
			
			if(input.form && input.id){
				$(input.form).bind('submit.datalistWidget'+input.id, function(){
					var val = $.attr(input, 'value');
					if(val && $.inArray(val, that.storedOptions) == -1){
						that.storedOptions.push(val);
						storeOptions(input.name || input.id, that.storedOptions );
					}
				});
			}
		},
		destroy: function(){
			var autocomplete = $.attr(this.input, 'autocomplete');
			$(this.input)
				.unbind('.datalistWidget')
				.removeData('datalistWidget')
			;
			this.shadowList.remove();
			$(document).unbind('.datalist'+this.id);
			if(this.input.form && this.input.id){
				$(this.input.form).unbind('submit.datalistWidget'+this.input.id);
			}
			$(this.input).attr('autocomplete', autocomplete);
		},
		updateListOptions: function(){
			this.needsUpdate = false;
			clearTimeout(this.updateTimer);
			var list = '<ul role="list">';
			var value;
			var values = [];
			var allOptions = [];
			$('option', this.datalist).each(function(i){
				if(this.disabled && this.disabled != 'false'){return;}
				var item = {
					value: $.attr(this, 'value'),
					text: $.attr(this, 'label') || getText(this)
				};
				values[i] = item.value;
				allOptions[i] = item;
			});
			$.each(this.storedOptions, function(i, val){
				if($.inArray(val, values) == -1){
					allOptions.push({value: val, text: val});
				}
			});
			if(this.shadowList.hasClass('datalist-visible')){
				value = $.attr(this.input, 'value');
				$.each(allOptions, function(i, item){
					var visibility = '';
					if(item.text.indexOf('value') == -1){ 
						visibility = ' class="hidden-item"';
					}
					list += '<li'+ visibility +' role="listitem" tabindex="-1" data-value="'+item.value+'">'+ item.text +'</li>';
				});
				this.lastUpdatdValue = value;
			} else {
				$.each(allOptions, function(i, item){
					list += '<li data-value="'+item.value+'" tabindex="-1" role="listitem">'+ item.text +'</li>';
				});
				this.lastUpdatdValue = "";
			}
			list += '</ul>';
			this.hasViewableData = true;
			this.shadowList.html(list);
		},
		showHideOptions: function(){
			var value = $.attr(this.input, 'value');
			if(value === this.lastUpdatdValue){return;}
			this.lastUpdatdValue = value;
			var found = false;
			
			if(value){
				value = value.toLowerCase();
				$('li', this.shadowList).each(function(){
					if(getText(this).toLowerCase().indexOf(value) == -1 && ($.attr(this, 'data-value') || '').indexOf(value) == -1){
						$(this).addClass('hidden-item');
					} else {
						$(this).removeClass('hidden-item');
						found = true;
					}
				});
			} else {
				$('li', this.shadowList).removeClass('hidden-item');
				found = true;
			}
			if(found){
				this.hasViewableData = true;
				this.showList();
			} else {
				this.hasViewableData = false;
				this.hideList();
			}
		},
		showList: function(){
			if(!this.hasViewableData || this.shadowList.hasClass('datalist-visible')){return false;}
			if(this.needsUpdate){
				this.updateListOptions();
			}
			this.showHideOptions();
			var that = this;
			var css = $(this.input).offset();
			css.top += $(this.input).outerHeight();
			css.width = $(this.input).outerWidth() - (parseInt(this.shadowList.css('borderLeftWidth'), 10)  || 0) - (parseInt(this.shadowList.css('borderRightWidth'), 10)  || 0);
			css.display = 'block';
			
			if(noMin){
				this.shadowList.css('height', 'auto');
				if(this.shadowList.height() > 250){
					this.shadowList.css('height', 220);
				}
			}
			this.shadowList.css(css).addClass('datalist-visible');
			//todo
			$(document).bind('mousedown.datalist'+this.id +' focusin.datalist'+this.id, function(e){
				if(e.target === that.input ||  that.shadowList[0] === e.target || $.contains( that.shadowList[0], e.target )){
					clearTimeout(that.hideTimer);
					setTimeout(function(){
						clearTimeout(that.hideTimer);
					}, 0);
				} else {
					that.timedHide();
				}
			});
			return true;
		},
		hideList: function(){
			if(!this.shadowList.hasClass('datalist-visible')){return false;}
			this.shadowList
				.removeClass('datalist-visible list-item-active')
				.scrollTop(0)
				.css({display: 'none'})
				.find('li.active-item').removeClass('active-item')
			;
			this.index = -1;
			$(this.input).removeAttr('aria-activedescendant');
			$(document).unbind('.datalist'+this.id);
			return true;
		},
		markItem: function(index, doValue, items, type){
			if(index < 0){return;}
			var activeItem;
			var goesUp;
			items = items || $('li:not(.hidden-item)', this.shadowList);
			if(index >= items.length){return;}
			items.removeClass('active-item');
			this.shadowList.addClass('list-item-active');
			activeItem = items.filter(':eq('+ index +')').addClass('active-item');
			
			
			
			if(doValue){
				goesUp = (this.index > index);
				if(activeItem[0] && activeItem[0].scrollIntoView){
					if(type !== 'mouse' && (!goesUp || activeItem.position().top < 3)){
						activeItem[0].scrollIntoView(goesUp);
					}
				}
				$.attr(this.input, 'value', activeItem.attr('data-value'));
				$.attr(this.input, 'aria-activedescendant', $.webshims.getID(activeItem));
				
			}
			this.index = index;
		}
	};
	
	
	webshims.defineNodeNameProperty('input', 'list', {
		get: function(elem){
			var val = webshims.contentAttr(elem, 'list');
			if(typeof val == 'string'){
				val = document.getElementById(val);
			}
			return val || null;
		},
		set: function(elem, value){
			var dom;
			if(value && value.getAttribute){
				dom = value;
				value = $.webshims.getID(value);
			}
			$.webshims.contentAttr(elem, 'list', value);
			if(Datalist){
				new Datalist(elem, value, dom);
			}
		},
		init: true
	});
	
	webshims.defineNodeNameProperty('input', 'selectedOption', {
		get: function(elem){
			var list = $.attr(elem, 'list');
			var ret = null;
			var value, options;
			if(!list){return ret;}
			value = $.attr(elem, 'value');
			if(!value){return ret;}
			options = $.attr(list, 'options');
			if(!options.length){return ret;}
			$.each(options, function(i, option){
				if(value == $.attr(option, 'value')){
					ret = option;
					return false;
				}
			});
			return ret;
		}
	});
		
	webshims.defineNodeNameProperty('input', 'autocomplete', {
		get: function(elem){
			var data = $.data(elem, 'datalistWidget');
			if(data){
				return data._autocomplete;
			}
			return ('autocomplete' in elem) ? elem.autocomplete : elem.getAttribute('autocomplete');
		},
		set: function(elem, value){
			var data = $.data(elem, 'datalistWidget');
			if(data){
				data._autocomplete = value;
				if(value == 'off'){
					data.hideList();
				}
			} else {
				if('autocomplete' in elem){
					elem.autocomplete = value;
				} else {
					elem.setAttribute('autocomplete', value);
				}
			}
		}
	});
	
	
	webshims.defineNodeNameProperty('datalist', 'options', {
		get: function(elem){
			var select = $('select', elem);
			return (select[0]) ? select[0].options : [];
		}
	});
	
	
	webshims.addReady(function(context, contextElem){
		contextElem.filter('select, option').each(function(){
			var parent = this.parentNode;
			if(parent && !$.nodeName(parent, 'datalist')){
				parent = parent.parentNode;
			}
			if(parent && $.nodeName(parent, 'datalist')){
				$(parent).triggerHandler('updateDatalist');
			}
		});
	});
	
})();
