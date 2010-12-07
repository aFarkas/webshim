jQuery.webshims.ready('form-core json-storage', function($, webshims, window, document, undefined){
	var noDatalistSupport = {
		submit: 1,
		button: 1,
		reset: 1, 
		hidden: 1,
		
		//ToDo
		range: 1,
		color: 1
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
	
	webshims.createDatalist = function(input, id, datalist){
		datalist = datalist || document.getElementById(id);
		if(!datalist || noDatalistSupport[getType(input)] || $.data(input, 'datalistWidget')){return;}
		var data = $.data(input, 'datalistWidget', {
			shadowList: $('<div class="datalist-polyfill" />').appendTo('body'), 
			id: id,
			storedOptions: getStoredOptions(input.name || input.id)
		});
		updateListOptions(datalist, data.shadowList, input, data.storedOptions);
		
		$(input).bind('input', function(){
			var found = showHideOptions(data.shadowList, input);
		});
		if(input.form){
			$(input.form).one('submit', function(){
				var val = $.attr(input, 'value');
				if(val && $.inArray(val, data.storedOptions) == -1){
					data.storedOptions.push(val);
					storeOptions(this.name || this.id, data.storedOptions );
				}
			});
		}
	};
	
	var updateListOptions = function(datalist, shadowList, input, storedOptions){
		var list = '<ul>';
		var value;
		var values = [];
		var allOptions = [];
		$('option', datalist).each(function(i){
			var item = {
				value: $.attr(this, 'value'),
				text: getText(this)
			};
			values[i] = item.value;
			allOptions[i] = item;
		});
		$.each(storedOptions, function(i, val){
			if($.inArray(val, values) == -1){
				allOptions.push({value: val, text: val});
			}
		});
		if(shadowList.hasClass('datalist-visible')){
			value = $.attr(input, 'value');
			$.each(allOptions, function(i, item){
				var visibility = '';
				if(item.text.indexOf('value') == -1){ 
					visibility = ' style="display: none;"';
				}
				list += '<li'+ visibility +' data-value="'+item.value+'">'+ item.text +'</li>';
			});
			
		} else {
			$.each(allOptions, function(i, item){
				list += '<li data-value="'+item.value+'">'+ item.text +'</li>';
			});
		}
		list += '</ul>';
		shadowList.html(list);
	};
	
	var showHideOptions = function(shadowList, input){
		if(shadowList.hasClass('list-item-active')){return 'activelist';}
		var value = $.attr(input, 'value');
		var found = false;
		$('li', shadowList).each(function(){
			if(getText(this).indexOf(value) == -1){
				this.style.display = 'none';
			} else {
				this.style.display = 'block';
				found = true;
			}
		});
		if(found){
			showList(shadowList, input);
		} else {
			hideList(shadowList);
		}
		return found;
	};
	
	var showList = function(shadowList, input){
		if(shadowList.hasClass('datalist-visible')){return;}
		var css = $(input).offset();
		css.top += $(input).outerHeight();
		css.width = $(input).outerWidth() - (parseInt(shadowList.css('borderLeftWidth'), 10)  || 0) - (parseInt(shadowList.css('borderRightWidth'), 10)  || 0);
		css.display = 'block';
		
		if(noMin){
			shadowList.css('height', 'auto');
			if(shadowList.height() > 250){
				shadowList.css('height', 220);
			}
		}
		shadowList.css(css).addClass('datalist-visible');
	};
	
	var hideList = function(shadowList){
		if(!shadowList.hasClass('datalist-visible')){return;}
		
		shadowList.removeClass('datalist-visible list-item-active');
	};
	
	webshims.addReady(function(context, contextElem){
		$('input[list]', context).add(contextElem.filter('input[list]')).attr('list', function(i, list){
			return list;
		});
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
	
}, true);
