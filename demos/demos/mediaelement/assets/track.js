(function($){

var startTreeOfLife = function(video){
	var videoElement = $(video);
	
	
	var buildInfoPanel = function(textTrack){
		var updatePanel = function(){
			var cue = $.prop(this, 'activeCues')[0]; // there is only one active cue in this example
			if (!cue) {
				return;
			}
			// set text in #moreInformation panel
			var obj = JSON.parse(cue.text);
			$("#moreInformation h2").html(obj.title);
			$("#moreInformation p").html(obj.description);
			$("#originalArticle").attr("href", obj.href);
		};
		
		$(textTrack)
			.on('cuechange', updatePanel)
			//run immediately in case there is already an active cue
			.each(updatePanel)
		;
		$("#originalArticle").colorbox({iframe:true, width:"80%", height:"100%", transition:"elastic"});
	};
	
	
	var buildDatalistFromCues = function(textTrack){
		var id = 'id-seachlist';
		var datalist = $('<datalist id="'+ id +'">').insertAfter("#searchInput");
		//old option wrapper
		var select = $('<select />');
		var subtitles = $.map(textTrack.cues, function(cue){
			return $(document.createElement('option')).attr({
				'data-start-time': cue.startTime,
				value: cue.text
			})[0];
		});
		var onSelect = function(){
			var val = $.prop(this, 'value');
			var startTime = $(subtitles)
				.filter(function(){
					return val == $.prop(this, 'value');
				})
				.data('startTime')
			;
			
			if(startTime){
				videoElement.prop('currentTime', startTime);
				videoElement.callProp('play');
			}
			
		};
		
		select.html(subtitles);
		
		$("#searchInput").attr('list', id).on('change', onSelect);
		//use htmlPolyfill instead of html for dynamic content!
		datalist.htmlPolyfill(select);
	};
	
	var buildCarouselFromCues = function(textTrack){
		var  cueHTML = function(item) {
			return '<img src="http://samdutton.net/track/images/' + item.src + '" alt="' + item.description + '" /><div class="thumbnailOverlay">' + item.title + '</div>';
		};
		var itemLoadCB = function myCarousel_itemLoadCallback(carousel, state) {
			var item;
			for (var i = carousel.first; i <= carousel.last; i++) {
				if (carousel.has(i)) {
					continue;
				}
				
				if (i > textTrack.cues.length) {
					break;
				}
				var cue = textTrack.cues[i-1];
				var item = JSON.parse(cue.text);
				carousel
					.add(i, cueHTML(item))
					.attr({
						'data-cueid': cue.id,
						'data-start-time': cue.startTime
					})
				;
			
				
			}
		};
		var highLightItem = function(){
			var cue = $.prop(textTrack, 'activeCues')[0];
			if(cue){
				var carouselIndex = $.inArray(cue, textTrack.cues);
				$('#carousel .active-cueitem').removeClass('active-cueitem');
				
				
				$('#carousel')
					.data('jcarousel')
					.scroll(carouselIndex, true)
				;
				
				$('#carousel [data-cueid="'+ cue.id +'"]').addClass('active-cueitem');
			}
		}
		
		$(textTrack)
			.on('cuechange', highLightItem)
			//run immediately in case there is already an active cue
			.each(highLightItem)
		;
		$('#carousel')
			.jcarousel({
				size: textTrack.cues.length,
				itemLoadCallback: {
					onBeforeAnimation: itemLoadCB
				}
			})
			.on('click', '[data-start-time]', function(){
				videoElement.prop('currentTime', $(this).data('startTime'));
				videoElement.callProp('play');
			})
		;
	};
	
	var onTrackLoad = function(){
		var textTrack = $.prop(this, 'track'); // gotcha: "this" is track *element*
		//track was loaded without errors	
		if ($.prop(this, 'readyState') == 2) {
		
			if (textTrack.kind === "metadata") {
				buildCarouselFromCues(textTrack);
				buildInfoPanel(textTrack);
			} else if (textTrack.kind === "subtitles") {
				buildDatalistFromCues(textTrack);
			}
		}	
	
	};
	
	// for each track, set track mode and add event listeners
	videoElement.find("track")
		.on("load", onTrackLoad)
		//run immediately in case track was already loaded
		.each(onTrackLoad)
	;
	//activate all track
	videoElement
		//jProp is nice it returns a jQuery property
		//good for properties, which return a DOM-Element, an event target or an array-like object
		.jProp('textTracks')
		.prop('mode', function(i, track){
			//activate textTracks in case 'default' attribute didn't work (default should be only used on one track per mediaelement!)
			return $.prop(this, 'kind') == 'subtitles' ? 
				'showing' :
				'hidden'
			;
		})
	;
};

$(function(){
	startTreeOfLife('video');
});



})(jQuery);