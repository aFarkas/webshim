[Webshims Lib](http://aFarkas.github.com/webshim/demos/index.html) - The polyfilling, capability based loading JavaScript Libary
================================

Features
------------------

general Features:

* HTML5 compilant: correctly and accurately implemented (HTML5) Markup-, JS- and DOM-APIs  
* capability based loading: extrem lightweight in modern browsers
* cross-browser support: All A-Graded browsers including last version of Opera are testet
* extendable: we have not implemented a feature, you want to use. You can easily implement the feature your own

implemented Features:

* HTML5 shiv and innerShiv solution including basic CSS-Support
* canvas
* HTML5 form features including: constraint validation and form widgets (input[range], input[date], input[time], input[datetime-local], output)
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
		//path is path of polyfiller.js-code + shims/ 
		$.webshims.loader.basePath += 'shims/'; 
		//load and implement all unsupported features 
		$.webshims.polyfill(); 
	</script>
---------------

* Wait till the implementation is ready and work with it:

--------------
	<script> 
		$.webshims.ready('geolocation json-storage', function(){ 
			//work with geolocation, JSON and localStorage 
			var userData = JSON.parse(localStorage.getItem('userData')) || {visits: 0};
			//...
			$(function(){
				//work with geolocation JSON and localStorage *and the DOM*
				$('#visits').html(userData.visits);
				//...
			});
		}); 
	</script>
--------------

[more informations and demos](http://aFarkas.github.com/webshim/demos/index.html)


License
---------------------------------------

The Webshims Lib core is licensed under the [MIT-License](http://aFarkas.github.com/webshim/MIT-LICENSE.txt). Note: Webshims Lib uses many great third party scripts.



Questions?
----------

If you have any questions, please feel free to ask them on the Using jQuery Plugins
forum, which can be found here:  
[http://forum.jquery.com/using-jquery-plugins](http://forum.jquery.com/using-jquery-plugins)

**Please tag your questions with 'webshims' or 'polyfill'.**
