if(!jQuery.support.jsonStorage){
	jQuery.support.jsonStorage = 'shim';
}

//JSON
(function(){if('JSON'in window){return;}if(!this.JSON){this.JSON={};}(function(){function f(n){return n<10?'0'+n:n;}if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+f(this.getUTCMonth()+1)+'-'+f(this.getUTCDate())+'T'+f(this.getUTCHours())+':'+f(this.getUTCMinutes())+':'+f(this.getUTCSeconds())+'Z':null;};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf();};}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+string+'"';}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key);}if(typeof rep==='function'){value=rep.call(holder,key,value);}switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null';}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null';}v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v;}if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){k=rep[i];if(typeof k==='string'){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}else{for(k in value){if(Object.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v;}}if(typeof JSON.stringify!=='function'){JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' ';}}else if(typeof space==='string'){indent=space;}rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}return str('',{'':value});};}if(typeof JSON.parse!=='function'){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}return reviver.call(holder,key,value);}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);});}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j;}throw new SyntaxError('JSON.parse');};}}());})();

//modified version from http://gist.github.com/350433
//using window.name for sessionStorage and cookies for localStorage
if (!window.localStorage || !window.sessionStorage){
(function () {

var Storage = function (type) {
  function createCookie(name, value, days) {
    var date, expires;

    if (days) {
      date = new Date();
      date.setTime(date.getTime()+(days*24*60*60*1000));
      expires = "; expires="+date.toGMTString();
    } else {
      expires = "";
    }
    document.cookie = name+"="+value+expires+"; path=/";
  }

  function readCookie(name) {
    var nameEQ = name + "=",
        ca = document.cookie.split(';'),
        i, c;

    for (i=0; i < ca.length; i++) {
      c = ca[i];
      while (c.charAt(0)==' ') {
        c = c.substring(1,c.length);
      }

      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length,c.length);
      }
    }
    return null;
  }
  
  function setData(data) {
    data = JSON.stringify(data);
    if (type == 'session') {
      window.top.name = data;
    } else {
      createCookie('localStorage', data, 365);
    }
  }
  
  function clearData() {
    if (type == 'session') {
      window.top.name = '';
    } else {
      createCookie('localStorage', '', 365);
    }
  }
  
  function getData() {
    var data = type == 'session' ? window.top.name : readCookie('localStorage');
    return data ? JSON.parse(data) : {};
  }


  // initialise if there's already data
  var data = getData();

  return {
    clear: function () {
      data = {};
      clearData();
    },
    getItem: function (key) {
      return data[key] || null;
    },
    key: function (i) {
      // not perfect, but works
      var ctr = 0;
      for (var k in data) {
        if (ctr == i) {
			return k;
		} else {
			ctr++;
		}
      }
      return null;
    },
    removeItem: function (key) {
      delete data[key];
      setData(data);
    },
    setItem: function (key, value) {
      data[key] = value+''; // forces the value to a string
      setData(data);
    }
  };
};

if (!window.sessionStorage) {window.sessionStorage = new Storage('session');}




$.webshims.loader.loadList(['swfobject']);
(function(){
	var swfTimer;
	$.webshims.localStorageSwfCallback = function(){
		clearTimeout(swfTimer);
		if(window.localStorage){
			$.webshims.createReadyEvent('json-storage');
			return;
		}
		var shim = document.getElementById('swflocalstorageshim');
		//brute force flash getter
		
		if( !shim || typeof shim.GetVariable == 'undefined' ){
			shim = document.swflocalstorageshim;
		}
		if( !shim || typeof shim.GetVariable == 'undefined'){
			shim = window.localstorageshim;
		}
		if( !shim || typeof shim.GetVariable == 'undefined'){
			window.localStorage = new Storage('local');
		} else {
			window.localStorage = {};
			$.each(['key', 'setItem', 'getItem', 'removeItem', 'clear'], function(i, fn){
				window.localStorage[fn] = shim[fn];
			});
		}
		if(window.localStorage){
			$.webshims.createReadyEvent('json-storage');
		}
	};
	
	$.webshims.readyModules('ready swfobject', function(){
		if(swfobject.hasFlashPlayerVersion('8.0.0')){
			swfobject.createCSS('#swflocalstorageshim', 'position: absolute; top: -1px; left: -1px; overflow: hidden; height: 1px; width: 1px;');
			$('body').after('<div id="swflocalstorageshim" />');
			swfobject.embedSWF($.webshims.loader.basePath +'localStorage.swf', 'swflocalstorageshim', '1', '1', '8.0.0', '', {allowscriptaccess: 'always'}, {name: 'localstorageshim'}, function(e){
				if(!e.success && !window.localStorage){
					$.webshims.localStorageSwfCallback();
				}
			});
			swfTimer = setTimeout($.webshims.localStorageSwfCallback, 9999);
		} else if(!window.localStorage){
			window.localStorage = new Storage('local');
			$.webshims.createReadyEvent('json-storage');
		}
	});
})();


})();
}
