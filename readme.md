[Webshim](http://aFarkas.github.com/webshim/demos/index.html)
================================

_The polyfilling, capability based loading JavaScript Library_


General Principles
------------------
* HTML5 compliant: correctly and accurately implemented (HTML5) Markup-, JS- and DOM-APIs  
* capability based loading: extremely lightweight in modern browsers
* cross-browser support: All A-Graded browsers including latest version of Opera are tested
* extendable: if we have not implemented a feature you want, you can easily implement it on your own


Features
------------------
* HTML5 shiv and innerShiv solution including basic CSS-support
* canvas
* HTML5 form features including: constraint validation and form widgets (input[type="range"], input[type="date"], input[type="number"], input[type="time"], input[type="month"], output, progress, input[list]/datalist)
* HTML5 audio/video/track implementation
* interactive elements: summary/details
* filereader (including, XHR2/AJAX CORS and FormData handling)
* promise
* geolocation
* ECMAScript 5 / JavaScript 1.8.5 features 


Installation and Usage
------------------

1 - [Download the Webshim Lib](https://github.com/aFarkas/webshim/releases/latest) and put the `js-webshim-folder` in your project.

2 - Include the JavaScript:

```html
<script src="js/jquery.js"></script>

<script src="js-webshim/minified/polyfiller.js"></script> 

<script> 
	// load and implement all unsupported features 
	webshims.polyfill();
		
	// or only load a specific feature
	//webshims.polyfill('forms es5');
</script>
```


3 - Wait till everything has been loaded and then use it:

```html
<script> 
	$(function(){
		// work with the HTML5 API
		$('input:invalid').each(function(){
		    $(this).after( $.prop(this, 'validationMessage') );
		});
		// ...
	});
</script>
```


 [More information and demos](http://aFarkas.github.com/webshim/demos/index.html).


 Download via bower
 ------------------

 ``bower install webshim --save-dev``


License
---------------------------------------

The Webshims Lib core is licensed under the [MIT-License](http://aFarkas.github.com/webshim/MIT-LICENSE.txt). 

Webshims Lib uses many great third party scripts:

| Script          | License                                      | URL                                                                           |
|:--------------- |:-------------------------------------------- |:----------------------------------------------------------------------------- |
| flashcanvas     | MIT                                          | http://code.google.com/p/flashcanvas                                          |
| flashcanvaspro  | closed                                       | http://flashcanvas.net                                                        |
| Jaris FLV       | GPL 3.0                                      | http://jarisflvplayer.org                                                     |
| excanvas        | Apache License 2.0                           | http://excanvas.sourceforge.net                                               |
| moxie           | GPL 3.0                                      | https://github.com/moxiecode/moxie                                            |
| es5             | MIT                                          | https://github.com/280north/narwhal                                           |
| swfmini         | MIT                                          | https://code.google.com/p/swfobject                                           |
| track           | BSD 2 clause                                 | https://github.com/cgiffard/Captionator                                       |
| color-picker    | MIT                                          | http://johndyer.name/post/2007/09/PhotoShop-like-JavaScript-Color-Picker.aspx |
| forms-picker    | MIT                                          | https://github.com/brandonaaron/jquery-mousewheel                             |
| jme.woff        | GPL / CC BY 3.0                              | http://icomoon.io/#preview-free                                               |




Questions?
----------

If you have any questions, please feel free to ask them on [stackoverflow.com/questions/tagged/webshim](http://stackoverflow.com/questions/tagged/webshim).

**Please tag your questions with 'webshim'.**
