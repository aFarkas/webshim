webshims.register('form-datalist-lazy', function($, webshims, window, document, undefined, options){
	
	var listidIndex = 0;
	var formsCFG = $.webshims.cfg.forms;
	var globStoredOptions = {};
	var getStoredOptions = function(name){
		if(!name){return [];}
		if(globStoredOptions[name]){
			return globStoredOptions[name];
		}
		var data;
		try {
			data = JSON.parse(localStorage.getItem('storedDatalistOptions'+name));
		} catch(e){}
		globStoredOptions[name] = data || [];
		return data || [];
	};
	var storeOptions = function(name, val){
		if(!name){return;}
		val = val || [];
		try {
			localStorage.setItem( 'storedDatalistOptions'+name, JSON.stringify(val) );
		} catch(e){}
	};
	
	var getText = function(elem){
		return (elem.textContent || elem.innerText || $.text([ elem ]) || '');
	};
	var lReg = /</g;
	var gReg = />/g;
	
	$.extend(options.shadowListProto, {
		_lazyCreate: function(opts){
			var that = this;
			this.hideList = $.proxy(that, 'hideList');
			
			
			
			this.popover = webshims.objectCreate(webshims.wsPopover, {}, options.datalistPopover);
			this.shadowList = this.popover.element.addClass('datalist-polyfill');
			
			
			this.index = -1;
			this.input = opts.input;
			this.arrayOptions = [];
			
			this.shadowList
				.delegate('li', 'mouseenter.datalistWidget mousedown.datalistWidget click.datalistWidget', function(e){
					var items = $('li:not(.hidden-item)', that.shadowList);
					var select = (e.type == 'mousedown' || e.type == 'click');
					that.markItem(items.index(e.currentTarget), select, items);
					if(e.type == 'click'){
						that.hideList();
						if(formsCFG.customDatalist){
							$(opts.input).getNativeElement().trigger('datalistselect');
						}
					}
					return (e.type != 'mousedown');
				})
			;
			
			opts.input.setAttribute('autocomplete', 'off');
			
			$(opts.input)
				.attr({
					//role: 'combobox',
					'aria-haspopup': 'true'
				})
				.on({
					'input.datalistWidget': function(){
						if(!that.triggeredByDatalist){
							that.changedValue = false;
							that.showHideOptions();
						}
					},
					'keydown.datalistWidget': function(e){
						var keyCode = e.keyCode;
						var activeItem;
						var items;
						if(keyCode == 40 && !that.showList()){
							that.markItem(that.index + 1, true);
							return false;
						}
						
						if(!that.popover.isVisible){return;}
						
						 
						if(keyCode == 38){
							that.markItem(that.index - 1, true);
							return false;
						} 
						if(!e.shiftKey && (keyCode == 33 || keyCode == 36)){
							that.markItem(0, true);
							return false;
						} 
						if(!e.shiftKey && (keyCode == 34 || keyCode == 35)){
							items = $('li:not(.hidden-item)', that.shadowList);
							that.markItem(items.length - 1, true, items);
							return false;
						} 
						if(keyCode == 13 || keyCode == 27){
							if (keyCode == 13){
								activeItem = $('li.active-item:not(.hidden-item)', that.shadowList);
								that.changeValue( $('li.active-item:not(.hidden-item)', that.shadowList) );
							}
							that.hideList();
							if(formsCFG.customDatalist && activeItem && activeItem[0]){
								$(opts.input).getNativeElement().trigger('datalistselect');
							}
							return false;
						}
					},
					'focus.datalistWidget': function(){
						if($(this).hasClass('list-focus')){
							that.showList();
						}
					},
					'mousedown.datalistWidget': function(){
						if($(this).is(':focus')){
							that.showList();
						}
					}
				})
			;
			
			
			$(this.datalist)
				.off('updateDatalist.datalistWidget')
				.on('updateDatalist.datalistWidget', $.proxy(this, '_resetListCached'))
				.on('remove', function(e){
					if(!e.originalEvent){
						that.detroy();
					}
				})
			;
			
			this._resetListCached();
			
			if(opts.input.form && (opts.input.name || opts.input.id)){
				$(opts.input.form).on('submit.datalistWidget'+opts.input.id, function(){
					if(!$(opts.input).hasClass('no-datalist-cache') && that._autocomplete != 'off'){
						var val = $.prop(opts.input, 'value');
						var name = (opts.input.name || opts.input.id) + $.prop(opts.input, 'type');
						if(!that.storedOptions){
							that.storedOptions = getStoredOptions( name );
						}
						if(val && that.storedOptions.indexOf(val) == -1){
							that.storedOptions.push(val);
							storeOptions(name, that.storedOptions );
						}
					}
				});
			}
			$(window).on('unload.datalist'+this.id+' beforeunload.datalist'+this.id, function(){
				that.destroy();
			});
		},
		_resetListCached: function(e){
			var that = this;
			var forceShow;
			this.needsUpdate = true;
			this.lastUpdatedValue = false;
			this.lastUnfoundValue = '';

			if(!this.updateTimer){
				if(window.QUnit || (forceShow = ($(that.input).is(':focus') && ($(that.input).hasClass('list-focus') || $.prop(that.input, 'value'))) )){
					that.updateListOptions(forceShow);
				} else {
					webshims.ready('WINDOWLOAD', function(){
						that.updateTimer = setTimeout(function(){
							that.updateListOptions();
							that = null;
							listidIndex = 1;
						}, 200 + (100 * listidIndex));
					});
				}
			}
		},
		updateListOptions: function(_forceShow){
			this.needsUpdate = false;
			clearTimeout(this.updateTimer);
			this.updateTimer = false;
			
			this.searchStart = formsCFG.customDatalist && $(this.input).hasClass('search-start');
			this.addMarkElement = options.addMark || $(this.input).hasClass('mark-option-text');
			
			var list = [];
			
			var values = [];
			var allOptions = [];
			var rElem, rItem, rOptions, rI, rLen, item, value;
			for(rOptions = $.prop(this.datalist, 'options'), rI = 0, rLen = rOptions.length; rI < rLen; rI++){
				rElem = rOptions[rI];
				if(!rElem.disabled && (value = $(rElem).val())){
					rItem = {
						value: value.replace(lReg, '&lt;').replace(gReg, '&gt;'),
						label: $.trim($.attr(rElem, 'label') || getText(rElem)).replace(lReg, '&lt;').replace(gReg, '&gt;'),
						className: rElem.className || ''
					};
					
					if(rItem.label){
						rItem.className += ' has-option-label';
					}
					values.push(rItem.value);
					allOptions.push(rItem);
				}
			}
			
			if(!this.storedOptions){
				this.storedOptions = ($(this.input).hasClass('no-datalist-cache') || this._autocomplete == 'off') ? [] : getStoredOptions((this.input.name || this.input.id) + $.prop(this.input, 'type'));
			}
			
			this.storedOptions.forEach(function(val, i){
				if(values.indexOf(val) == -1){
					allOptions.push({value: val, label: '', className: 'stored-suggest', style: ''});
				}
			});
			
			for(rI = 0, rLen = allOptions.length; rI < rLen; rI++){
				item = allOptions[rI];
				list[rI] = '<li class="'+ item.className +'" tabindex="-1" role="listitem">'+ this.getOptionContent(item) +'</li>';
			}
			
			this.arrayOptions = allOptions;
			this.popover.contentElement.html('<div class="datalist-box"><ul role="list">'+ list.join("\n") +'</ul></div>');
			
			
			if(_forceShow || this.popover.isVisible){
				this.showHideOptions();
			}
		},
		getOptionContent: function(item){
			var content = '';
			if(options.getOptionContent){
				content = options.apply(this, arguments) || '';
			} else {
				content = '<span class="option-value">'+ item.value +'</span>';
				if(item.label){
					content += ' <span class="option-label">'+ item.label +'</span>';
				}
			}
			return content;
		},
		showHideOptions: function(_fromShowList){
			var value = $.prop(this.input, 'value').toLowerCase();

			//first check prevent infinite loop, second creates simple lazy optimization
			if(value === this.lastUpdatedValue){
				return;
			} 
			if(this.lastUnfoundValue && value.indexOf(this.lastUnfoundValue) === 0){
				this.hideList();
				return;
			}
			
			
			this.lastUpdatedValue = value;
			var found = false;
			var startSearch = this.searchStart;
			var lis = $('li', this.shadowList);
			var that = this;
			if(value){
				
				this.arrayOptions.forEach(function(item, i){
					var search, searchIndex, foundName;
					if(!('lowerValue' in item)){
						item.lowerValue = item.value.toLowerCase();
						if(item.label && item.label != item.value ){
							item.lowerLabel = item.label.toLowerCase();
						}
					}
					
					if(value != item.lowerValue && item.lowerLabel != value){
						searchIndex = item.lowerValue.indexOf(value);
						search = startSearch ? !searchIndex : searchIndex !== -1;
						if(search){
							foundName = 'value';
						} else if(item.lowerLabel){
							searchIndex = item.lowerLabel.indexOf(value);
							search = startSearch ? !searchIndex : searchIndex !== -1;
							foundName = 'label';
						}
					}
					
					if(search){
						that.addMark($(lis[i]).removeClass('hidden-item'), item, foundName, searchIndex, value.length);
						found = true;
					} else {
						$(lis[i]).addClass('hidden-item');
					}
				});
			} else if(lis.length) {
				this.removeMark(lis.removeClass('hidden-item'));
				found = true;
			}
			
			this.hasViewableData = found;
			if(!_fromShowList && found){
				this.showList();
			}
			
			if(!found){
				this.lastUnfoundValue = value;
				this.hideList();
			} else {
				this.lastUnfoundValue = false;
			}
		},
		otherType: {
			value: 'label',
			label: 'value'
		},
		addMark: function(elem, item, prop, start, length){
			if(this.addMarkElement){
				var text = item[prop].substr(start, length);
				text = item[prop].replace(text ,'<mark>'+ text +'</mark>');
				$('.option-'+ this.otherType[prop] +' > mark', elem).each(this._replaceMark);
				$('.option-'+prop, elem).html(text);
				
			}
		},
		_replaceMark: function(){
			var content = $(this).html();
			$(this).replaceWith(content);
		},
		removeMark: function(lis){
			if(this.addMarkElement){
				$('mark', lis).each(this._replaceMark);
			}
		},
		showList: function(){
			if(this.popover.isVisible){return false;}
			if(this.needsUpdate){
				this.updateListOptions();
			}
			this.showHideOptions(true);
			if(!this.hasViewableData){return false;}
			var that = this;
			
			that.shadowList.find('li.active-item').removeClass('active-item');
			that.popover.show(this.input);
			
			
			return true;
		},
		hideList: function(){
			if(!this.popover.isVisible){return false;}
			var that = this;
			
			
			this.popover.hide();
			that.shadowList.removeClass('datalist-visible list-item-active');
			that.index = -1;
			if(that.changedValue){
				that.triggeredByDatalist = true;
				$(that.input).trigger('input').trigger('change');
				that.changedValue = false;
				that.triggeredByDatalist = false;
			}
			
			return true;
		},
		scrollIntoView: function(elem){
			var ul = $('ul', this.shadowList);
			var div = $('div.datalist-box', this.shadowList);
			var elemPos = elem.position();
			var containerHeight;
			elemPos.top -=  (parseInt(ul.css('paddingTop'), 10) || 0) + (parseInt(ul.css('marginTop'), 10) || 0) + (parseInt(ul.css('borderTopWidth'), 10) || 0);
			if(elemPos.top < 0){
				div.scrollTop( div.scrollTop() + elemPos.top - 2);
				return;
			}
			elemPos.top += elem.outerHeight();
			containerHeight = div.height();
			if(elemPos.top > containerHeight){
				div.scrollTop( div.scrollTop() + (elemPos.top - containerHeight) + 2);
			}
		},
		changeValue: function(activeItem){
			if(!activeItem[0]){return;}
			var spinner;
			var newValue = $('span.option-value', activeItem).text();
			var oldValue = $.prop(this.input, 'value');
			if(newValue != oldValue){
				
				$(this.input)
					.prop('value', newValue)
					.triggerHandler('updateInput')
				;
				this.changedValue = true;
				if((spinner = $.data(this.input, 'wsspinner')) && spinner.setInput){
					spinner.setInput(newValue);
				}
			}
		},
		markItem: function(index, doValue, items){
			var activeItem;
			var goesUp;
			
			items = items || $('li:not(.hidden-item)', this.shadowList);
			if(!items.length){return;}
			if(index < 0){
				index = items.length - 1;
			} else if(index >= items.length){
				index = 0;
			}
			items.removeClass('active-item');
			this.shadowList.addClass('list-item-active');
			activeItem = items.filter(':eq('+ index +')').addClass('active-item');
			
			if(doValue){
				this.changeValue(activeItem);
				this.scrollIntoView(activeItem);
			}
			this.index = index;
		}
	});
});