jQuery.webshims.ready('form-core dom-extend', function($, webshims, window, document, undefined){
	var doc = document;	
	
	(function(){
		var elements = {
				input: 1,
				textarea: 1
			},
			noInputTriggerEvts = {updateInput: 1, input: 1},
			noInputTypes = {
				radio: 1,
				checkbox: 1,
				submit: 1,
				button: 1,
				image: 1,
				reset: 1
				
				//pro forma
				,color: 1
				//,range: 1
			},
			observe = function(input){
				var timer,
					lastVal = input.attr('value'),
					trigger = function(e){
						//input === null
						if(!input){return;}
						var newVal = input.attr('value');
						
						if(newVal !== lastVal){
							lastVal = newVal;
							if(!e || !noInputTriggerEvts[e.type]){
								webshims.triggerInlineForm(input[0], 'input');
							}
						}
					},
					unbind = function(){
						input.unbind('focusout', unbind).unbind('input', trigger).unbind('updateInput', trigger);
						clearInterval(timer);
						trigger();
						input = null;
					}
				;
				
				clearInterval(timer);
				timer = setInterval(trigger, ($.browser.mozilla) ? 250 : 111);
				setTimeout(trigger, 9);
				input.bind('focusout', unbind).bind('input updateInput', trigger);
			}
		;
			
		
		$(doc)
			.bind('focusin', function(e){
				if( e.target && e.target.type && !e.target.readonly && !e.target.readOnly && !e.target.disabled && elements[(e.target.nodeName || '').toLowerCase()] && !noInputTypes[e.target.type] ){
					observe($(e.target));
				}
			})
		;
	})();
	
	(function(){
		if( 'value' in document.createElement('output') ){return;}
		var outputCreate = function(elem){
			if(elem.getAttribute('aria-live')){return;}
			elem = $(elem);
			var value = (elem.text() || '').trim();
			var	id 	= elem.attr('id');
			var	htmlFor = elem.attr('for');
			var shim = $('<input class="output-shim" type="hidden" name="'+ (elem.attr('name') || '')+'" value="'+value+'" style="display: none" />').insertAfter(elem);
			var form = shim[0].form || doc;
			var setValue = function(val){
				shim[0].value = val;
				val = shim[0].value;
				elem.text(val);
				webshims.contentAttr(elem[0], 'value', val);
			};
			
			elem[0].defaultValue = value;
			webshims.contentAttr(elem[0], 'value', value);
			
			elem.attr({'aria-live': 'polite'});
			if(id){
				shim.attr('id', id);
				elem.attr('aria-labeldby', webshims.getID($('label[for="'+id+'"]', form)));
			}
			if(htmlFor){
				id = webshims.getID(elem);
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
		
		webshims.defineNodeNameProperty('output', 'value', {
			set: function(value){
				var elem = this;
				var setVal = $.data(elem, 'outputShim');
				if(!setVal){
					setVal = outputCreate(elem);
				}
				setVal(value);
			},
			get: function(){
				var elem = this;
				return webshims.contentAttr(elem, 'value') || $(elem).text() || '';
			}
		}, true, 'output-props', 'form-output-datalist');
				
		webshims.addReady(function(context, contextElem){
			$('output', context).add(contextElem.filter('output')).each(function(){
				outputCreate(this);
			});
		});
	})();
	
	(function(){
		if($.support.datalist){return;}
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
			} catch(e){}
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
			return (elem.textContent || elem.innerText || $.text([ elem ]) || '');
		};
		
		//ToDo: It's a little bit to complex, maintainability isn't good		
		var dataListProto = {
			_create: function(opts){
				var datalist = opts.datalist || opts.id && document.getElementById(opts.id);
				if(noDatalistSupport[getType(opts.input)]){return;}
				var data = $.data(opts.input, 'datalistWidget');
				if(datalist && data && (data.datalist !== datalist)){
					data.datalist = datalist;
					data.id = opts.id;
					data._resetListCached();
					return;
				} else if(!datalist){
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
				this.id = opts.id;
				this.lazyIDindex = listidIndex;
				this.hasViewableData = true;
				this._autocomplete = $.attr(opts.input, 'autocomplete');
				$.data(opts.input, 'datalistWidget', this);
				this.shadowList = $('<div class="datalist-polyfill" />').appendTo('body');
				this.index = -1;
				this.input = opts.input;
				this.arrayOptions = [];
				
				
				this.shadowList
					.delegate('li', 'mouseover.datalistWidget mousedown.datalistWidget click.datalistWidget', function(e){
						var items = $('li:not(.hidden-item)', that.shadowList);
						var select = (e.type == 'mousedown' || e.type == 'click');
						that.markItem(items.index(e.target), select, items);
						if(e.type == 'click'){
							that.hideList();
						}
						return (e.type != 'mousedown');
					})
					.bind('focusout', this.timedHide)
				;
				
				opts.input.setAttribute('autocomplete', 'off');
				
				$(opts.input)
					.attr({
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
						 
						if(!that.isListVisible){return;}
						
						 
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
							that.hideList();
							return false;
						}
		
					})
					.bind('blur.datalistWidget', this.timedHide)
				;
				
				$(this.datalist)
					.unbind('updateDatalist.datalistWidget')
					.bind('updateDatalist.datalistWidget', $.proxy(this, '_resetListCached'))
				;
				
				this._resetListCached();
				
				if(opts.input.form && opts.input.id){
					$(opts.input.form).bind('submit.datalistWidget'+opts.input.id, function(){
						var val = $.attr(opts.input, 'value');
						that.storedOptions = that.storedOptions || getStoredOptions(opts.input.name || opts.input.id);
						if(val && $.inArray(val, that.storedOptions) == -1){
							that.storedOptions.push(val);
							storeOptions(opts.input.name || opts.input.id, that.storedOptions );
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
				this.input.removeAttribute('aria-haspopup');
				if(autocomplete === undefined){
					this.input.removeAttribute('autocomplete');
				} else {
					$(this.input).attr('autocomplete', autocomplete);
				}
			},
			_resetListCached: function(){
				var that = this;
				this.needsUpdate = true;
				this.lastUpdatedValue = false;
				this.lastUnfoundValue = '';
				
				
				clearTimeout(this.updateTimer);
				this.updateTimer = setTimeout(function(){
					that.updateListOptions();
				}, this.isListVisible ? 0 : 20 * this.lazyIDindex);
			},
			updateListOptions: function(){
				this.needsUpdate = false;
				clearTimeout(this.updateTimer);
				this.shadowList.css({
					fontSize: $.curCSS(this.input, 'fontSize'),
					fontFamily: $.curCSS(this.input, 'fontFamily')
				});
				var list = '<ul role="list" class="'+ (this.datalist.className || '') +'">';
				
				var values = [];
				var allOptions = [];
				$('option', this.datalist).each(function(i){
					if(this.disabled){return;}
					var item = {
						value: $(this).val(),
						text: $.trim($.attr(this, 'label') || getText(this)),
						className: this.className || '',
						style: $.attr(this, 'style') || ''
					};
					if(!item.text){
						item.text = item.value;
					}
					values[i] = item.value;
					allOptions[i] = item;
				});
				this.storedOptions = this.storedOptions || getStoredOptions(this.input.name || this.input.id);
				this.storedOptions.forEach(function(val, i){
					if($.inArray(val, values) == -1){
						allOptions.push({value: val, text: val, className: '', style: ''});
					}
				});
				
				allOptions.forEach(function(item, i){
					list += '<li data-value="'+item.value+'" class="'+ item.className +'" style="'+ item.style +'" tabindex="-1" role="listitem">'+ item.text +'</li>';
				});
				
				list += '</ul>';
				this.arrayOptions = allOptions;
				this.shadowList.html(list);
				if(this.isListVisible){
					this.showHideOptions();
				}
			},
			showHideOptions: function(){
				var value = $.attr(this.input, 'value').toLowerCase();
				//first check prevent infinite loop, second creates simple lazy optimization
				if(value === this.lastUpdatedValue || (this.lastUnfoundValue && value.indexOf(this.lastUnfoundValue) === 0)){
					return;
				}
				this.lastUpdatedValue = value;
				var found = false;
				var lis = $('li', this.shadowList);
				if(value){
					this.arrayOptions.forEach(function(item, i){
						if(!('lowerText' in item)){
							item.lowerText = item.text.toLowerCase();
							item.lowerValue = item.value.toLowerCase();
						}
						
						if(item.lowerText.indexOf(value) !== -1 || item.lowerValue.indexOf(value) !== -1){
							$(lis[i]).removeClass('hidden-item');
							found = true;
						} else {
							$(lis[i]).addClass('hidden-item');
						}
					});
				} else {
					lis.removeClass('hidden-item');
					found = true;
				}
				
				this.hasViewableData = found;
				
				if(found){
					this.showList();
				} else {
					this.lastUnfoundValue = value;
					this.hideList();
				}
			},
			showList: function(){
				if(this.isListVisible){return false;}
				if(this.needsUpdate){
					this.updateListOptions();
				}
				this.showHideOptions();
				if(!this.hasViewableData){return false;}
				var that = this;
				var css = $(this.input).offset();
				css.top += $(this.input).outerHeight();
				
				css.width = $(this.input).outerWidth() - (parseInt(this.shadowList.css('borderLeftWidth'), 10)  || 0) - (parseInt(this.shadowList.css('borderRightWidth'), 10)  || 0);
				
				if(noMin){
					this.shadowList.css('height', 'auto');
					if(this.shadowList.height() > 250){
						this.shadowList.css('height', 220);
					}
				}
				this.shadowList.css(css).addClass('datalist-visible');
				this.isListVisible = true;
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
				if(!this.isListVisible){return false;}
				this.shadowList
					.removeClass('datalist-visible list-item-active')
					.scrollTop(0)
					.find('li.active-item').removeClass('active-item')
				;
				this.index = -1;
				this.isListVisible = false;
				$(this.input).removeAttr('aria-activedescendant');
				$(document).unbind('.datalist'+this.id);
				return true;
			},
			scrollIntoView: function(elem){
				var ul = $('> ul', this.shadowList);
				var elemPos = elem.position();
				var containerHeight;
				elemPos.top -=  (parseInt(ul.css('paddingTop'), 10) || 0) + (parseInt(ul.css('marginTop'), 10) || 0) + (parseInt(ul.css('borderTopWidth'), 10) || 0);
				if(elemPos.top < 0){
					this.shadowList.scrollTop( this.shadowList.scrollTop() + elemPos.top - 2);
					return;
				}
				elemPos.top += elem.outerHeight();
				containerHeight = this.shadowList.height();
				if(elemPos.top > containerHeight){
					this.shadowList.scrollTop( this.shadowList.scrollTop() + (elemPos.top - containerHeight) + 2);
				}
			},
			markItem: function(index, doValue, items){
				if(index < 0){return;}
				var activeItem;
				var goesUp;
				items = items || $('li:not(.hidden-item)', this.shadowList);
				if(index >= items.length){return;}
				items.removeClass('active-item');
				this.shadowList.addClass('list-item-active');
				activeItem = items.filter(':eq('+ index +')').addClass('active-item');
				
				if(doValue){
					$.attr(this.input, 'value', activeItem.attr('data-value'));
					$.attr(this.input, 'aria-activedescendant', $.webshims.getID(activeItem));
					this.scrollIntoView(activeItem);
				}
				this.index = index;
			}
		};
		
		
		webshims.defineNodeNameProperty('input', 'list', {
			get: function(){
				var elem = this;
				var val = webshims.contentAttr(elem, 'list');
				if(typeof val == 'string'){
					val = document.getElementById(val);
				}
				return val || null;
			},
			set: function(value){
				var elem = this;
				var dom;
				if(value && value.getAttribute){
					dom = value;
					value = webshims.getID(value);
				}
				webshims.contentAttr(elem, 'list', value);
				if(dataListProto){
					webshims.objectCreate(dataListProto, undefined, {input: elem, id: value, datalist: dom});
				}
			},
			contentAttr: true
		}, true, 'input-datalist', 'form-output-datalist');
		
		webshims.defineNodeNameProperty('input', 'selectedOption', {
			get: function(){
				var elem = this;
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
		}, true, 'input-datalist', 'form-output-datalist');
			
		webshims.defineNodeNameProperty('input', 'autocomplete', {
			get: function(){
				var elem = this;
				var data = $.data(elem, 'datalistWidget');
				if(data){
					return data._autocomplete;
				}
				return ('autocomplete' in elem) ? elem.autocomplete : elem.getAttribute('autocomplete');
			},
			set: function(value){
				var elem = this;
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
			get: function(){
				var elem = this;
				var select = $('select', elem);
				return (select[0]) ? select[0].options : [];
			}
		}, true, 'datalist-props', 'form-output-datalist');
		
		
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
	
	
	webshims.isReady('form-output-datalist', true);
});