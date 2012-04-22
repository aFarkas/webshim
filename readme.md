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
* HTML5 form features including: constraint validation and form widgets (input[range], input[date], input[time], input[datetime-local], output, input[list]/datalist)
* HTML5 audio/video implementation
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

upcomming Release 1.8.10
----------

- fixed validity issues with old webkits (Safari 5.0.0 - 5.0.2)
- improved object/flash reframe handling for mediaelement
- improved spinbutton usability
- auto disable html5shiv's innerShiv, if jQuery 1.7+ is used
- fixed input/change event for input widgets on iOS5
- improved :required/:valid/:invalid pseudoselectos
- added possibility for custom styleable datalists (in capable browsers)
- added test for custom styleable input[type="range"]

Release 1.8.9
----------

- updated to Modernizr 2.5.3 (fixes crash bug in IE8)
- improved field[placeholder] usability
- fixed regression for iOS4 (old webkits)
- updated email validation

Release 1.8.8
----------

- updated to Modernizr 2.5.2
- use of yepnope's 1.5.2 low-level API for better network performance
- improved scriptability of datalist and details/summary elements

Release 1.8.7
----------

- fixed Opera error
- aligned maxlength property to the HTML5 spec

Release 1.8.5/1.8.6
----------

- much improved bug detection for buggy interactive constraint validation (no more assumptions)
- new custom event **changedvaliditystate** for forms feature
- improved overlay placement (errormessage/datalist)

Release 1.8.4
----------

- improved network performance
- polyfiller supports AMD + async pre-configuration
- Opera bugfix

Release 1.8.3
----------

- chrome/webkit fixes
- full compatibility with jQuery 1.7
- added locales for errormessages (If you want to improve [existing messages](https://github.com/aFarkas/webshim/tree/master/src/shims/i18n) or add some errormessages, please send me a pull request or file an issue)
- improved progress event for older Safari mobile and Firefox

Release 1.8.2
----------
- improved mediaelement (canplaythrough event, http live streaming for iOS)
- moved input[list]/datalist support from 'forms' to 'forms-ext' feature (more lightweight for Chrome/Safari)
- improved styleability of errorbubble
- <del>compatibility with jQuery 1.7 (1.8.1 is not compatible with jQuery 1.7)</del>

Release 1.8.1
----------
- improved mediaelement loading
- fixed small bugs in mediaelement polyfill
- prepare for jQuery 1.7 compatibility
- fixed demos


Release 1.8.0
----------

* first mediaelement implementation (audio/video)
* implemented form submitter attributes (formaction, formtarget, formenctype)
* better language support
* updated es5-shim
* updated jQuery UI path 
* fixed label for output element
