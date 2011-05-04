[Webshims Lib](http://aFarkas.github.com/webshim/demos/index.html) - The polyfilling, capability based loading JavaScript Libary
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

Release 1.6.2
----------

* improved UI for [type=range], [type=date], [type=datetime-local] and constraint validation
* tweaked bgIframe support for IE6
* added scriptloader adapter (removed own script loader, less [NIH](http://en.wikipedia.org/wiki/Not_Invented_Here))
* removed valueAsDate for type=datetime-local (nice feature but Spec Violation)
* willValidate is true outside of form-element
* typofix [lukeholder](https://github.com/lukeholder)

Release 1.6.1
----------

* UI for date and datetime-local are polyfilled much faster
* performance for IE6/IE7/IE8 in general
* fixed bug Opera isn't calling ready-event anymore
* fewer http requests especially for IE8-
* added disabled state for spinbuttons

Known Issue/Won't fix
----------
* removed placeholder support for Opera (Opera 11+ has native input[placeholder] support)


Release 1.6
----------

* added details & summary element-support
* improved/clean up documentation, fixed many typos, grammar... ([jab](https://github.com/jab))
* improved english validationMessages ([jab](https://github.com/jab))
* re-added combohandler support
* fixed issue with language switching ($.webshims.activeLang not defined initially)
* fixed checkValidity in Opera and in polyfilled browsers
* fixed typo ([Seldaek](https://github.com/Seldaek))
* added support for older jQuery versions
* fixed IE9 styling issue
* fixed IE reopens datepicker sometimes
* updated to jQuery 1.5.2
* fixed many little bugs in old X-/C-graded browsers
* fixed setting valueAsNumber/valueAsDate in Opera
* added optional - but automatic - bgIframe support for IE6
* use png8 for details/summary open indicator