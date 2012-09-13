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
	<script src="js/Modernizr-yepnope.js"></script> 
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

Release 1.9.1
----------

- added onaddtrack/onremovetrack events to TextTrackList interface
- datalist polyfill is now default for forms feature
- added swedish locale (thx to @leon)
- improved errorbubble style
- updated JW player

Release 1.9.0
----------

- basic but powerfull track-element including corresponding [DOM- and JS-API](http://jsfiddle.net/trixta/QZJTM/)
- input[form] support: for associating form field using the form attribute (input[form]/select[form] ...)
- implemented youtube iframe support for video element
- better input widget calculation in responsive websites
- elements property for fieldset element
- allow placeholder on input[type="date"]. (as a hint for the dateformat, but use data-placeholder, instead of placeholder!)
- added opus -> mime-type detection for audio
- fixed regression for using an initial value with input[type="date"]. (introduced in 1.8.11)
- update Modernizr to 2.6.2/jQuery UI to 1.8.23
- jQuery 1.6.x not supported anymore, use 1.7.2+ or 1.8.1+ (but we will have legacy support for webshims 1.8.x)


Release 1.8.13
----------

- fixed regression for using an initial value with input[type="date"] (introduced in 1.8.11)


Release 1.8.11/1.8.12
----------

- updated to Modernizr 2.6.1/html5shiv 3.6.0
- fixed Samsung's datepicker implementation 
- updated jQuery UI
- basic support for jQuery 1.8.0
- improved implementation of excanvas
- switch default canvas implementation from excanvas to flashcanvas (because it is so much better)
- fixed :focus implementation in jQuery 1.6+

Release 1.8.10
----------

- fixed validity issues with old webkits (Safari 5.0.0 - 5.0.2)
- improved object/flash reframe handling for mediaelement
- improved spinbutton usability
- auto disable html5shiv's innerShiv, if jQuery 1.7+ is used
- fixed input/change event for input widgets on iOS5
- improved :required/:valid/:invalid pseudoselectos
- added possibility for custom styleable datalists (in capable browsers)
- added test for custom styleable input[type="range"]
- temporarily removed support for time and datetime-local widgets

Release 1.8.9
----------

- updated to Modernizr 2.5.3 (fixes crash bug in IE8)
- improved field[placeholder] usability
- fixed regression for iOS4 (old webkits)
- updated email validation

