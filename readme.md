[Webshims Lib](http://aFarkas.github.com/webshim/demos/index.html) - The polyfilling, capability based loading JavaScript Libary
================================

How To Use
------------------

* Simply [download Webshims Lib](http://github.com/downloads/aFarkas/webshim/webshims-latest.zip/qr_code) and put the js-webshim-folder in your project
* Include the JavaScript:

---------------
<script src="js-webshim/minified/polyfiller.js"></script> 

<script> 
	//path is path of polyfiller.js-code + shims/ $.webshims.loader.basePath += 'shims/'; 
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

The Webshims Lib core is licensed under the [MIT-License](http://aFarkas.github.com/webshim/MIT-LICENSE.txt). Note: Webshims Lib uses many greate third party scripts.



Questions?
----------

If you have any questions, please feel free to ask them on the Using jQuery Plugins
forum, which can be found here:  
[http://forum.jquery.com/using-jquery-plugins](http://forum.jquery.com/using-jquery-plugins)

**Please tag your questions with 'webshims' or 'polyfill'.**
