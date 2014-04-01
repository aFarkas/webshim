(function($){

var startTreeOfLife = function(video){
	var videoElement = $(video);
	
	
	var buildInfoPanel = function(textTrack){
		var updatePanel = function(){
			var cue = $.prop(this, 'activeCues'); // there is only one active cue in this example
			
			if (cue && cue.length && (cue = cue[0])) {
				// set text in #moreInformation panel
				var obj = JSON.parse(cue.text);
				$("#moreInformation h2").html(obj.title);
				$("#moreInformation p").html(obj.description);
				$("#originalArticle").attr("href", obj.href);
			}
		};
		
		$(textTrack)
			.on('cuechange', updatePanel)
			//run immediately in case there is already an active cue
			.each(updatePanel)
		;
		$("#originalArticle").colorbox({iframe:true, width:"80%", height:"100%", transition:"elastic"});
	};
	
	
	var buildDatalistFromCues = function(textTrack){

		var subtitles = $.map(textTrack.cues, function(cue){
			return {
				value: cue.text,
				cue: cue
			};
		});
		
		$("#searchInput").remoteList({
			minLength: 0,
			maxLength: 0,
			source: function(val, response){
				response(subtitles);
			},
			select: function(){
				var data = $(this).remoteList('selectedData');
				if(data && data.cue && data.cue.startTime){
					videoElement.prop('currentTime', data.cue.startTime);
					videoElement.callProp('play');
				}
			}
		});
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
			var cue = $.prop(textTrack, 'activeCues');
			if(cue && cue.length && (cue = cue[0])){
				var carouselIndex = $.inArray(cue, textTrack.cues);
				$('#carousel .active-cueitem').removeClass('active-cueitem');
				
				
				$('#carousel')
					.data('jcarousel')
					.scroll(carouselIndex, true)
				;
				
				$('#carousel [data-cueid="'+ cue.id +'"]').addClass('active-cueitem');
			}
		};
		
		
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
		
		$(textTrack)
			.on('cuechange', highLightItem)
			//run immediately in case there is already an active cue
			.each(highLightItem)
		;
	};
	
	var onTrackLoad = function(){
		var textTrack = $.prop(this, 'track'); // gotcha: "this" is track *element*
		//track was loaded without errors (0: nothing, 1: loading, 2: loaded, 3: error)
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
		//IE10/11 only allows one default track element, so we activate all tracks here:
		.each(function(){
			var track = $.prop(this, 'track');
			//metadata is hidden
			track.mode = (track.kind == 'metadata') ? 'hidden' : 'showing';
		})
	;
	
};

$(function(){
	startTreeOfLife('video');
});

if(!$.fn.callProp){
	$.fn.callProp = $.fn.trigger;
}

$(window).on('load', function(){
	$('video').eq(0).callProp('play');
});



})(jQuery);
