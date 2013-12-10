(function($){
	function rangeNumberCombo(){
		var opposite = {
			range: 'number',
			number: 'range'
		};
		var onInput = function(e){
			$('input[type="'+ opposite[$.prop(e.target, 'type')] +'"]', this).prop('value', $.prop(e.target, 'value'));
		};
		$(this).on('input valuechange', onInput);
	}
	
	function getSet(){
		var inputs;
		var module = $(this);
		$('button', this).on('click', function(){
			if(!inputs){
				inputs = $('input', module).getNativeElement();
			}
			if($(this).hasClass('get')){
				
				inputs.val( Math.round($('video').prop('currentTime') || 0 * 100) / 100 );
			} else if($(this).hasClass('set') && inputs.checkValidity()){
				$('video').prop('currentTime', inputs.prop('value'));
			}
		});
	}
	
	function onMediaLoad(){
		if($.prop(this, 'readyState') > 0){
			var duration = Math.round($.prop(this, 'duration') * 100) / 100;
			$('.start-cue input').getNativeElement().prop({
				value: 0,
				max: duration
			});
			$('.end-cue input').getNativeElement().prop({
				value: duration,
				max: duration
			});
		}
	}
	
	function TrackManager(video){
		this.video = video;
		this.active = null;
	}
	
	TrackManager.prototype = {
		create: function(kind, lang, label){
			var track = this.video.addTextTrack(kind || 'subtitles', label || '', lang || 'en');
			this.active = track;
			track.mode = 'showing';
			return track;
		},
		addCue: function(cue){
			this.active.addCue(cue);
		},
		removeCue: function(cue){
			this.active.removeCue(cue);
		}
	};
	
	function CueManager(trackManager, cueWrapper){
		this.trackManager = trackManager;
		this.cueWrapper = cueWrapper;
		this.cueList = $('.cue-list', this.cueWrapper);
		
		this.cueTemplate = $('#cue-item').html().trim();
		this._bind(this);
	}
	
	CueManager.prototype = {
		_bind: function(that){
			this.cueList.on('focusin', '> li', function(e){
				
				
			});
			this.cueList.on('click', '.remove', function(){
				that.removeCue($(this).closest('li'));
			});
			$('form.add-cue', this.cueWrapper).on('submit', function(){
				var obj = {};
				$(this).jProp('elements').each(function(){
					var name = $.prop(this, 'name');
					var val = name && $.prop(this, 'value');
					if(name && val){
						obj[name] = val;
					}
				});
				that.add(obj);
				return false;
			});
		},
		transferContent: function(item, cue){
			item.find('.start').html(cue.startTime);
			item.find('.end').html(cue.endTime);
			item.find('.text').html(cue.text);
			item.find('.id').html(cue.id);
			item.data('cue', cue);
		},
		removeCue: function(item){
			var cue = $(item).data('cue');
			this.trackManager.removeCue(cue);
			$(item).remove();
		},
		add: function(obj){
			var cueItem = $($.parseHTML(this.cueTemplate));
			
			var cue = new TextTrackCue(obj.start, obj.end, obj.text);
			if(obj.id){
				cue.id = obj.id;
			}
			cueItem.appendTo(this.cueList);
			this.transferContent(cueItem, cue);
			this.trackManager.addCue(cue);
		}
	}
	
	$(function(){
		$('video').on('loadedmetadata', onMediaLoad).each(onMediaLoad);
		$('.number-range-combo').each(rangeNumberCombo);
		$('.get-set').each(getSet);
		var track = new TrackManager($('video'));
		
		var cueManager = new CueManager(track, $('.cues'));
		
		track.create();
	});
})(jQuery);
