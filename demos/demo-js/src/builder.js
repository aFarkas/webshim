(function($){
	var remove;
	var regStart = /\/\/<([A-Za-z]+)/;
	var regEnd = /\/\/>/;
	var initialAll = {
		forms: {
			'form-core': true,
			'dom-extend': {customMessages: true},
			'form-message': {customMessages: true}
		},
		'forms-ext': {
			'dom-extend': {replaceUI: true},
			'form-number-date-ui': {replaceUI: true}
			,'range-ui': {replaceUI: true}
		},
		mediaelement: {
			'swfmini': {confirm: 'Should swfmini be included? Not needed if you already using swfobject on your site!'},
			'mediaelement-core': true
		},
		track: {
			'track-ui': true //todo remove dom-extend prefernce
		}
	};
	var webshimsBuilder = {
		data: null,
		evalIt: (function(){
			var cfg = {};
			var webshims = {
				cfg: $.extend(true, {}, window.webshims.cfg),
				setOptions: function(name, opts){
					if (typeof name == 'string' && opts !== undefined) {
						this.cfg[name] = (!$.isPlainObject(opts)) ? opts : $.extend(true, this.cfg[name] || {}, opts);
					} else if (typeof name == 'object') {
						$.extend(true, this.cfg, name);
					}
				},
				polyfill: function(features){
					if(!features){
						cfg.features = window.webshims.featureList;
					} else if(typeof features == 'string'){
						cfg.features = features.split(' ');
					} else {
						cfg.features = features;
					}
				},
				activeLang: function(lang){
					cfg.lang = lang;
				}
			};
			var webshim = webshims;
			$.webshims = webshims;
			$.webshim = webshims;
			
			return function(code){
				eval(code);
				cfg.cfg = webshims.cfg;
				return cfg;
			};
		})(),
		init: function(form){
			form.trigger('reset');
			this.path = form.data('polyfillpath');
			this.getData(this.path+'polyfiller.js');
			$('button.generate', form).on('click', function(){
				var code = $('.config', form).val();
				var cfg = webshimsBuilder.evalIt(code);
				$('.output', form).val('');
				cfg.includeInitial = $('.include-initial', form).prop('checked');
				webshimsBuilder.build(cfg, $('.output', form));
			});
		},
		build: function(cfg, output){
			var polyfillCode = this.getPolyfillerCode(cfg);
			
			this.getInitialLoaded(cfg, polyfillCode).always(function(code){
				$(output).val(code);
			});
			
		},
		getInitialLoaded: function(cfg, code){
			var promise = $.Deferred();
			var ajax = [];
			var path = this.path;
			var loadedModules = {};
			
			if(cfg.includeInitial){
				cfg.features.forEach(function(feature){
					if(initialAll[feature]){
						$.each(initialAll[feature], function(module, opts){
							var load;
							if(loadedModules[module]){return;}
							if(opts === true){
								load = true;
							} else if(opts.confirm && confirm(opts.confirm)){
								load = true;
							} else {
								$.each(opts, function(name){
									if(cfg.cfg[feature][name]){
										load = true;
										return false;
									}
								});
							}
							
							
							if(load){
								loadedModules[module] = true;
								ajax.push($.ajax({
									dataType: 'text',
									url: path+'shims/'+module+'.js'
								}));
							}
						});
					}
				});
				
				if(cfg.lang && (cfg.cfg.forms.customMessages || cfg.cfg['forms-ext'].replaceUI)){
					if(webshims.formcfg.availableLangs.indexOf(cfg.lang) != -1){
						ajax.push($.ajax({
								dataType: 'text',
								url: path+'shims/i18n/formcfg-'+cfg.lang+'.js'
							}));
					}
				}
				$.when.apply($, ajax).then(function(){
					$.each(arguments, function(i, module){
						if(module[1] == 'success'){
							code += "\n;"+module[0];
						}
					});
					promise.resolveWith(this, [code]);
				});
			} else {
				promise.resolveWith(this, [code]);
			}
			
			
			return promise;
		},
		getPolyfillerCode: function(cfg, output){
			var result = [];
			var combos = [];
			var features = cfg.features;
			var data = webshimsBuilder.data.replace(/\t/g, "").split(/[\n\r]/g);
			
			cfg.features.push('removeCombos');
			
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
					webshimsBuilder.getRemoveCombos(foundFeature[1], combos);
				}
			});
			
			return result.join("\n");
		},	
		getData: function(path){
			
			$.ajax(path, {
				dataType: 'text',
				success: function(data){
					webshimsBuilder.data = data;
				}
			});
		},
		getRemoveCombos: function(removeFeature, combos){
			
			var removeModules = webshims.features[removeFeature];
			
			$.each(webshims.c, function(c, modules){
				$.each(modules, function(i, module){
					if(removeModules.indexOf(module) !== -1 && combos.indexOf(c) == -1){
						combos.push(c);
						return false;
					}
				});
			});
		}
	};
	
	webshimsBuilder.init($('form[data-polyfillpath]'));
})(jQuery);