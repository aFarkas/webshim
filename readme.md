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
* HTML5 form features including: constraint validation and form widgets (input[type="range"], input[type="date"], input[type="number"], input[type="time"], input[type="month"], output, progress, input[list]/datalist)
* HTML5 audio/video/track implementation
* interactive elements: summary/details
* JSON (stringify and parse)
* localStorage/sessionStorage
* geolocation
* ECMAScript 5 / JavaScript 1.8.5 features 


How To Use
------------------

* Simply [download Webshims Lib](http://corrupt-system.de/webshims-stable.zip) and put the js-webshim-folder in your project
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

If you have any questions, please feel free to ask them on [stackoverflow.com/questions/tagged/webshim](http://stackoverflow.com/questions/tagged/webshim).

**Please tag your questions with 'webshims' or 'webshim'.**

Release 1.10.9
----------

- fixed regression introduced in 1.10.8 with input[type="month"] ([see Issue #258](https://github.com/aFarkas/webshim/issues/258))

Release 1.10.8
----------

- improved input event for input widgets (date, time, number)
- added en-AU locale (thx to @tomascassidy)
- Browserify compatibility (thx to @joeybaker)
- improved mediaelement error- and flashblock handling
- added mediaelement width/height content attribute support (deprecated, but used too much in the wild)
- use polyfilled input widgets in old Android stock browser (there are simply too much small bugs)
- tested jQuery 1.10.1 and 2.0.2 compatibility

Release 1.10.7
----------

- fixed several localization date formatting issues 
- much improved french localization  (thx to @jls2933)

Release 1.10.6
----------

- fixed regression from 1.10.5 (selectedOption not implemented in all browsers)
- added Lithuanian (lt-LT) translations (thx @Gamesh)
- small style tweaks for input[type="color"] [demo](http://jsfiddle.net/trixta/sYVEd/)

Release 1.10.5
----------

- input[type="color"]
- Instant Form Validation helper (enhances the HTML5 UI for much better UX) [demo](http://jsfiddle.net/trixta/XqPhQ/)
- FileReader API
- improved range UI styleability
- lazy load mostly everything (performance)


Release 1.10.4
----------

- override IE10's type="number" UI
- improved styleability of input[type="range"]
- improved loading of mediaelement/track support
- improved performance for dynamic content (i.e.: updatePolyfill)
- optional override of IE10's placeholder
- new fix for placeholder orientationchange bug on Safari iOS


Release 1.10.3
----------

- tested support for jQuery 2.0.0
- fixed invisible native audio controls in IE9 in case of preload="none"
- improved datepicker type="date"/type="number"
- fixed flash encoding vars for special charakters in video path
- check initially invalid inputs in Firefox
- removed unused packages (jQuery UI, swfobject, jwplayer)


Release 1.10.2
----------

- improved list/datalist options [demo](http://jsfiddle.net/trixta/7DETa/)
- small improvements to type="range" and type="date" [demo](http://jsfiddle.net/trixta/VNuct/)
- fixed animate bug in jQuery 1.8.3
- fixed dutch language