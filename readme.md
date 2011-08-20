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

Release 1.8.0
----------

*
* updated jQuery UI path 
* fixed label for putput element

Release 1.7.2
----------

* fixed bad feature detection for interactive form validation in Safari 5.1
* improved error balloon positioning
* .form-ui-valid/.form-ui-invalid behave now more similiar to :-moz-ui-valid/:-moz-ui-invalid 
* some little performance improvements
* started mediaelement support (next major release)

Release 1.7.1
----------

* fixed autofocus issue
* updated "placeholder label option"-algorithm (changed spec)
* scripted submit is not prevented anymore
* delegate validity property from shadowelement to native element
* delayed focusout/blur event on date-input, if user is interacting with datepicker


Release 1.7
----------

* compaibility with jQuery 1.6.x
* support for $.fn.prop/$.fn.removeAttr
* added custom events to webforms *changedvalid* / *changedinvalid*

