[Webshims Lib](http://aFarkas.github.com/webshim/demos/index.html) - The polyfilling, capability based loading JavaScript Library
================================

Features
------------------

General Principles:

* HTML5 compliant: correctly and accurately implemented (HTML5) Markup-, JS- and DOM-APIs  
* capability based loading: extremely lightweight in modern browsers
* cross-browser support: All A-Graded browsers including latest version of Opera are tested
* extendable: if we have not implemented a feature you want, you can easily implement it on your own

Implemented Features:

* HTML5 shiv and innerShiv solution including basic CSS-support
* canvas
* HTML5 form features including: constraint validation and form widgets (input[type="range"], input[type="date"], input[type="number"], output, input[list]/datalist)
* HTML5 audio/video/track implementation
* interactive elements: summary/details
* JSON (stringify and parse)
* localStorage/sessionStorage
* geolocation
* ECMAScript 5 / JavaScript 1.8.5 features 


How To Use
------------------

* Simply [download Webshims Lib](https://github.com/aFarkas/webshim/downloads) and put the js-webshim-folder in your project
* Include the JavaScript:

---------------
	<script src="js/jquery.js"></script>
	// Simple change
	<script src="js-webshim/minified/extras/modernizr-custom.js"></script> 
	// 'Use your own' variant
	<script src="js/Modernizr-custom.js"></script> 

	<script src="js-webshim/minified/polyfiller.js"></script> 

	<script> 
		//load and implement all unsupported features 
		$.webshims.polyfill();
		
		//or only load a specific feature
		//$.webshims.polyfill('geolocation json-storage');
	</script>
---------------

* Wait till everything has been loaded and then use it:

--------------
	<script> 
		$(function(){
			//work with JSON and localStorage 
			var userData = JSON.parse(localStorage.getItem('userData')) || {visits: 0};
			$('#visits').html(userData.visits);
			//...
		});
	</script>
--------------

More information and demos [here](http://aFarkas.github.com/webshim/demos/index.html).


License
---------------------------------------

The Webshims Lib core is licensed under the [MIT-License](http://aFarkas.github.com/webshim/MIT-LICENSE.txt). Note: Webshims Lib uses many great third party scripts.



Questions?
----------

If you have any questions, please feel free to ask them on the [Using jQuery Plugins
forum](http://forum.jquery.com/using-jquery-plugins).

**Please tag your questions with 'webshims' or 'polyfill'.**


upcomming Release 1.10.0
----------

- new UI for all input widgets
- input[type="month"]
- list/datalist support for following types: range, month, date (datalist support for text/email/url/tel etc. was already there)
- type="number" can be localized
- type="number"/type="time" are custom styleable in supporting browsers
- labels property for labellable form elements
- stepUp/stepDown methods for input elements

Release 1.9.6
----------

- jQuery 1.9.1 compatibility
- improve flash fallback for mediaelements in case of an error event

Release 1.9.5
----------

- improve youtube playback with jarisplayer
- fix position bug of error messages in nested overflow: scroll boxes
- fix chrome issue with dynamically created required radio buttons
- favorize custom validation message before vendor validation message


Release 1.9.4
----------

- improved rtmp handling for both Jaris and JW player
- fixed bug on iOS in conjunction with input[type=date]
- fixed creditcard validation
- allow placeholder for type=number
- show mediaelement fallback, if flash isn't installed and mediaelements aren't supported
- a lot of improvements to the free and open source swf media player Jaris (we will switch to Jaris by default with next release)


Release 1.9.3
----------

- add option to use alternative jarisplayer as mediaelement fallback
- fixed track[default] in IE10 (initial copying of track.mode)
- implement .prop-checked in browsers, which do not support the :checked selector
- implement .user-error selector
- limit track.kind property using addTextTrack to only known values

Release 1.9.2
----------

- implemented input[type="time"]
- allow dynamically changing label/kind/srclang of existing track elements
- added removeCue to texttrack API
- added screenreader-support for track[kind="descriptions"]
- improved change events for input[type=range] and spinbutton controls (input[type=number])

Release 1.9.1
----------

- added onaddtrack/onremovetrack events to TextTrackList interface
- datalist polyfill is now default for forms feature
- added swedish locale (thx to @leon)
- improved errorbubble style
- updated JW player
