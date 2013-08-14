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

1 - Simply [download Webshims Lib](http://corrupt-system.de/webshims-stable.zip) and put the js-webshim-folder in your project

2 - Include the JavaScript:

```html
<script src="js/jquery.js"></script>

<!-- Simple change -->
<script src="js-webshim/minified/extras/modernizr-custom.js"></script> 

<!-- 'Use your own' variant -->
<script src="js/Modernizr-custom.js"></script> 

<script src="js-webshim/minified/polyfiller.js"></script> 

<script> 
	//load and implement all unsupported features 
	$.webshims.polyfill();
		
	//or only load a specific feature
	//$.webshims.polyfill('geolocation json-storage');
</script>
```


3 - Wait till everything has been loaded and then use it:

```html
<script> 
	$(function(){
		//work with JSON and localStorage 
		var userData = JSON.parse(localStorage.getItem('userData')) || {visits: 0};
		$('#visits').html(userData.visits);
		//...
	});
</script>
```


More information and demos [here](http://aFarkas.github.com/webshim/demos/index.html).


License
---------------------------------------

The Webshims Lib core is licensed under the [MIT-License](http://aFarkas.github.com/webshim/MIT-LICENSE.txt). Note: Webshims Lib uses many great third party scripts.



Questions?
----------

If you have any questions, please feel free to ask them on [stackoverflow.com/questions/tagged/webshim](http://stackoverflow.com/questions/tagged/webshim).

**Please tag your questions with 'webshim'.**
