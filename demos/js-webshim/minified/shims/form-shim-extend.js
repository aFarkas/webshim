(!Modernizr.formvalidation||jQuery.webshims.bugs.bustedValidity)&&jQuery.webshims.register("form-extend",function(a,f,u,l){f.inputTypes=f.inputTypes||{};var x=f.cfg.forms,r,t=f.inputTypes,A={radio:1,checkbox:1};f.addInputType=function(a,d){t[a]=d};var y={customError:!1,typeMismatch:!1,rangeUnderflow:!1,rangeOverflow:!1,stepMismatch:!1,tooLong:!1,patternMismatch:!1,valueMissing:!1,valid:!0},v={valueMissing:function(b,d,c){if(!b.prop("required"))return!1;var k=!1;if(!("type"in c))c.type=(b[0].getAttribute("type")||
b[0].type||"").toLowerCase();if("select"==c.nodeName){if(d=!d)if(!(d=0>b[0].selectedIndex))b=b[0],d="select-one"==b.type&&2>b.size?!!a("> option:first-child",b).prop("selected"):!1;b=d}else b=A[c.type]?"checkbox"==c.type?!b.is(":checked"):!f.modules["form-core"].getGroupElements(b).filter(":checked")[0]:!d;return b},tooLong:function(){return!1},typeMismatch:function(a,d,c){if(""===d||"select"==c.nodeName)return!1;var f=!1;if(!("type"in c))c.type=(a[0].getAttribute("type")||a[0].type||"").toLowerCase();
if(t[c.type]&&t[c.type].mismatch)f=t[c.type].mismatch(d,a);else if("validity"in a[0])f=a[0].validity.typeMismatch;return f},patternMismatch:function(a,d,c){if(""===d||"select"==c.nodeName)return!1;a=a.attr("pattern");if(!a)return!1;try{a=RegExp("^(?:"+a+")$")}catch(k){f.error('invalid pattern value: "'+a+'" | '+k),a=!1}return!a?!1:!a.test(d)}};f.addValidityRule=function(a,d){v[a]=d};a.event.special.invalid={add:function(){a.event.special.invalid.setup.call(this.form||this)},setup:function(){var b=
this.form||this;if(!a.data(b,"invalidEventShim")&&(a(b).data("invalidEventShim",!0).bind("submit",a.event.special.invalid.handler),f.moveToFirstEvent(b,"submit"),f.bugs.bustedValidity&&a.nodeName(b,"form"))){var d=b.getAttribute("novalidate");b.setAttribute("novalidate","novalidate");f.data(b,"bustedNoValidate",null==d?null:d)}},teardown:a.noop,handler:function(b){if(!("submit"!=b.type||b.testedValidity||!b.originalEvent||!a.nodeName(b.target,"form")||a.prop(b.target,"noValidate"))){r=!0;b.testedValidity=
!0;if(!a(b.target).checkValidity())return b.stopImmediatePropagation(),r=!1;r=!1}}};a(l).bind("invalid",a.noop);a.event.special.submit=a.event.special.submit||{setup:function(){return!1}};var B=a.event.special.submit.setup;a.extend(a.event.special.submit,{setup:function(){a.nodeName(this,"form")?a(this).bind("invalid",a.noop):a("form",this).bind("invalid",a.noop);return B.apply(this,arguments)}});f.addInputType("email",{mismatch:function(){var a=x.emailReg||/^[a-zA-Z0-9.!#$%&'*+-\/=?\^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
return function(d){return!a.test(d)}}()});f.addInputType("url",{mismatch:function(){var a=x.urlReg||/^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
return function(d){return!a.test(d)}}()});f.defineNodeNameProperty("input","type",{prop:{get:function(){var a=(this.getAttribute("type")||"").toLowerCase();return f.inputTypes[a]?a:this.type}}});f.defineNodeNamesProperties(["button","fieldset","output"],{checkValidity:{value:function(){return!0}},willValidate:{value:!1},setCustomValidity:{value:a.noop},validity:{writeable:!1,get:function(){return a.extend({},y)}}},"prop");var o=function(b){var d,c=a.prop(b,"validity");if(c)a.data(b,"cachedValidity",
c);else return!0;if(!c.valid){d=a.Event("invalid");var k=a(b).trigger(d);if(r&&!o.unhandledInvalids&&!d.isDefaultPrevented())f.validityAlert.showFor(k),o.unhandledInvalids=!0}a.removeData(b,"cachedValidity");return c.valid},C=/^(?:select|textarea|input)/i;f.defineNodeNameProperty("form","checkValidity",{prop:{value:function(){var b=!0,d=a(a.prop(this,"elements")).filter(function(){if(!C.test(this.nodeName))return!1;var a=f.data(this,"shadowData");return!a||!a.nativeElement||a.nativeElement===this});
o.unhandledInvalids=!1;for(var c=0,k=d.length;c<k;c++)o(d[c])||(b=!1);return b}}});f.defineNodeNamesProperties(["input","textarea","select"],{checkValidity:{value:function(){o.unhandledInvalids=!1;return o(a(this).getNativeElement()[0])}},setCustomValidity:{value:function(b){a.removeData(this,"cachedValidity");f.data(this,"customvalidationMessage",""+b)}},willValidate:{writeable:!1,get:function(){var b={button:1,reset:1,hidden:1,image:1};return function(){var d=a(this).getNativeElement()[0];return!(d.disabled||
d.readOnly||b[d.type])}}()},validity:{writeable:!1,get:function(){var b=a(this).getNativeElement(),d=b[0],c=a.data(d,"cachedValidity");if(c)return c;c=a.extend({},y);if(!a.prop(d,"willValidate")||"submit"==d.type)return c;var k=b.val(),g={nodeName:d.nodeName.toLowerCase()};c.customError=!!f.data(d,"customvalidationMessage");if(c.customError)c.valid=!1;a.each(v,function(a,d){if(d(b,k,g))c[a]=!0,c.valid=!1});a(this).getShadowFocusElement().attr("aria-invalid",c.valid?"false":"true");d=b=null;return c}}},
"prop");f.defineNodeNamesBooleanProperty(["input","textarea","select"],"required",{set:function(b){a(this).getShadowFocusElement().attr("aria-required",!!b+"")},initAttr:!a.browser.msie||7<f.browserVersion});f.reflectProperties(["input"],["pattern"]);if(!("maxLength"in l.createElement("textarea"))){var p=function(){var b,d=0,c=a([]),f=1E9,g=function(){var a=c.prop("value"),b=a.length;b>d&&b>f&&(b=Math.max(d,f),c.prop("value",a.substr(0,b)));d=b},j=function(){clearTimeout(b);c.unbind(".maxlengthconstraint")};
return function(s,z){j();if(-1<z)f=z,d=a.prop(s,"value").length,c=a(s),c.bind("keydown.maxlengthconstraint keypress.maxlengthconstraint paste.maxlengthconstraint cut.maxlengthconstraint",function(){setTimeout(g,0)}),c.bind("keyup.maxlengthconstraint",g),c.bind("blur.maxlengthconstraint",j),b=setInterval(g,200)}}();p.update=function(b,d){a(b).is(":focus")&&(null==d&&(d=a.prop(b,"maxlength")),p(e.target,d))};a(l).bind("focusin",function(b){var d;"TEXTAREA"==b.target.nodeName&&-1<(d=a.prop(b.target,
"maxlength"))&&p(b.target,d)});f.defineNodeNameProperty("textarea","maxlength",{attr:{set:function(a){this.setAttribute("maxlength",""+a);p.update(this)},get:function(){var a=this.getAttribute("maxlength");return null==a?void 0:a}},prop:{set:function(a){if("number"==typeof a||a&&a==1*a){if(0>a)throw"INDEX_SIZE_ERR";a=parseInt(a,10);this.setAttribute("maxlength",a);p.update(this,a)}else this.setAttribute("maxlength","0"),p.update(this,0)},get:function(){var a=this.getAttribute("maxlength");return("number"==
typeof a||a&&a==1*a)&&0<=a?parseInt(a,10):-1}}});f.defineNodeNameProperty("textarea","maxLength",{prop:{set:function(b){a.prop(this,"maxlength",b)},get:function(){return a.prop(this,"maxlength")}}})}var D={submit:1,button:1,image:1},m={};[{name:"enctype",limitedTo:{"application/x-www-form-urlencoded":1,"multipart/form-data":1,"text/plain":1},defaultProp:"application/x-www-form-urlencoded",proptype:"enum"},{name:"method",limitedTo:{get:1,post:1},defaultProp:"get",proptype:"enum"},{name:"action",proptype:"url"},
{name:"target"},{name:"novalidate",propName:"noValidate",proptype:"boolean"}].forEach(function(b){var d="form"+(b.propName||b.name).replace(/^[a-z]/,function(a){return a.toUpperCase()}),c="form"+b.name,f=b.name,g="click.webshimssubmittermutate"+f,j=function(){if("form"in this&&D[this.type]){var j=a.prop(this,"form");if(j){var h=a.attr(this,c);if(null!=h&&(!b.limitedTo||h.toLowerCase()===a.prop(this,d))){var i=a.attr(j,f);a.attr(j,f,h);setTimeout(function(){if(null!=i)a.attr(j,f,i);else try{a(j).removeAttr(f)}catch(b){j.removeAttribute(f)}},
9)}}}};switch(b.proptype){case "url":var s=l.createElement("form");m[d]={prop:{set:function(b){a.attr(this,c,b)},get:function(){var b=a.attr(this,c);if(null==b)return"";s.setAttribute("action",b);return s.action}}};break;case "boolean":m[d]={prop:{set:function(b){b?a.attr(this,"formnovalidate","formnovalidate"):a(this).removeAttr("formnovalidate")},get:function(){return null!=a.attr(this,"formnovalidate")}}};break;case "enum":m[d]={prop:{set:function(b){a.attr(this,c,b)},get:function(){var d=a.attr(this,
c);return!d||(d=d.toLowerCase())&&!b.limitedTo[d]?b.defaultProp:d}}};break;default:m[d]={prop:{set:function(b){a.attr(this,c,b)},get:function(){var b=a.attr(this,c);return null!=b?b:""}}}}m[c]||(m[c]={});m[c].attr={set:function(b){m[c].attr._supset.call(this,b);a(this).unbind(g).bind(g,j)},get:function(){return m[c].attr._supget.call(this)}};m[c].initAttr=!0;m[c].removeAttr={value:function(){a(this).unbind(g);m[c].removeAttr._supvalue.call(this)}}});f.defineNodeNamesProperties(["input","button"],
m);!a.support.getSetAttribute&&null==a("<form novalidate></form>").attr("novalidate")?f.defineNodeNameProperty("form","novalidate",{attr:{set:function(a){this.setAttribute("novalidate",""+a)},get:function(){var a=this.getAttribute("novalidate");return null==a?void 0:a}}}):f.bugs.bustedValidity&&(f.defineNodeNameProperty("form","novalidate",{attr:{set:function(a){f.data(this,"bustedNoValidate",""+a)},get:function(){var a=f.data(this,"bustedNoValidate");return null==a?void 0:a}},removeAttr:{value:function(){f.data(this,
"bustedNoValidate",null)}}}),a.each(["rangeUnderflow","rangeOverflow","stepMismatch"],function(a,d){v[d]=function(a){return(a[0].validity||{})[d]||!1}}));f.defineNodeNameProperty("form","noValidate",{prop:{set:function(b){b?a.attr(this,"novalidate","novalidate"):a(this).removeAttr("novalidate")},get:function(){return null!=a.attr(this,"novalidate")}}});a.browser.webkit&&Modernizr.inputtypes.date&&function(){var b={updateInput:1,input:1},d={date:1,time:1,"datetime-local":1},c={focusout:1,blur:1},k=
{updateInput:1,change:1},g=function(a){var d,f=!0,h=a.prop("value"),i=h,q=function(d){if(a){var c=a.prop("value");c!==h&&(h=c,(!d||!b[d.type])&&a.trigger("input"));d&&k[d.type]&&(i=c);!f&&c!==i&&a.trigger("change")}},g,w=function(b){clearInterval(d);setTimeout(function(){b&&c[b.type]&&(f=!1);a&&(a.unbind("focusout blur",w).unbind("input change updateInput",q),q());a=null},1)};clearInterval(d);d=setInterval(q,160);clearTimeout(g);g=setTimeout(q,9);a.unbind("focusout blur",w).unbind("input change updateInput",
q);a.bind("focusout blur",w).bind("input updateInput change",q)};if(a.event.customEvent)a.event.customEvent.updateInput=!0;(function(){var b=function(b){var d=1,i,c;if("date"==b.type&&(r||!a(b).is(":focus")))if((c=b.value)&&10>c.length&&(c=c.split("-"))&&3==c.length){for(;3>d;d++)if(1==c[d].length)c[d]="0"+c[d];else if(2!=c[d].length){i=!0;break}if(!i)return c=c.join("-"),a.prop(b,"value",c),c}},d,c,h,i;d=f.defineNodeNameProperty("input","checkValidity",{prop:{value:function(){b(this);return d.prop._supvalue.apply(this,
arguments)}}});c=f.defineNodeNameProperty("form","checkValidity",{prop:{value:function(){a("input",this).each(function(){b(this)});return c.prop._supvalue.apply(this,arguments)}}});h=f.defineNodeNameProperty("input","value",{prop:{set:function(){return h.prop._supset.apply(this,arguments)},get:function(){return b(this)||h.prop._supget.apply(this,arguments)}}});i=f.defineNodeNameProperty("input","validity",{prop:{writeable:!1,get:function(){b(this);return i.prop._supget.apply(this,arguments)}}});a(l).bind("change",
function(a){isChangeSubmit=!0;b(a.target);isChangeSubmit=!1})})();a(l).bind("focusin",function(b){b.target&&d[b.target.type]&&!b.target.readOnly&&!b.target.disabled&&g(a(b.target))})}();f.addReady(function(b,d){var c;a("form",b).add(d.filter("form")).bind("invalid",a.noop);try{if(b==l&&!("form"in(l.activeElement||{})))(c=a("input[autofocus], select[autofocus], textarea[autofocus]",b).eq(0).getShadowFocusElement()[0])&&c.offsetHeight&&c.offsetWidth&&c.focus()}catch(f){}});(!Modernizr.formattribute||
!Modernizr.fieldsetdisabled)&&function(){(function(b,d){a.prop=function(c,f,h){var i;if(c&&1==c.nodeType&&h===d&&a.nodeName(c,"form")&&c.id){i=l.getElementsByName(f);if(!i||!i.length)i=l.getElementById(f);if(i&&(i=a(i).filter(function(){return a.prop(this,"form")==c}).get(),i.length))return 1==i.length?i[0]:i}return b.apply(this,arguments)}})(a.prop,void 0);var b=function(b){var d=a.data(b,"webshimsAddedElements");d&&(d.remove(),a.removeData(b,"webshimsAddedElements"))},d=/\r?\n/g,c=/^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
k=/^(?:select|textarea)/i;Modernizr.formattribute||(f.defineNodeNamesProperty(["input","textarea","select","button","fieldset"],"form",{prop:{get:function(){var b=f.contentAttr(this,"form");b&&(b=l.getElementById(b))&&!a.nodeName(b,"form")&&(b=null);return b||this.form},writeable:!1}}),f.defineNodeNamesProperty(["form"],"elements",{prop:{get:function(){var d=this.id,c;b(this);d&&(c=a('input[form="'+d+'"], select[form="'+d+'"], textarea[form="'+d+'"], button[form="'+d+'"], fieldset[form="'+d+'"]').add(this.elements).get());
return c.length?c:this.elements||null},writeable:!1}}),a(function(){var d=function(a){a.stopPropagation()};a(u).delegate("form[id]","submit",function(d){if(!d.isDefaultPrevented()){var c=this;if(d=c.id)b(c),d=a('input[form="'+d+'"], select[form="'+d+'"], textarea[form="'+d+'"]').filter(function(){return!this.disabled&&this.name&&this.form!=c}).clone(),d.length&&(a.data(c,"webshimsAddedElements",a('<div class="webshims-visual-hide" />').append(d).appendTo(c)),setTimeout(function(){b(c)},9)),d=null}});
a(u).delegate('input[type="submit"][form], button[form], input[type="button"][form], input[type="image"][form], input[type="reset"][form]',"click",function(b){if(!b.isDefaultPrevented()){var c=a.prop(this,"form"),f=this.form,h;c&&c!=f&&(h=a(this).clone().addClass("webshims-visual-hide").bind("click",d).appendTo(c),f&&b.preventDefault(),h.trigger("click"),setTimeout(function(){h.remove();h=null},9))}})}));Modernizr.fieldsetdisabled||f.defineNodeNamesProperty(["fieldset"],"elements",{prop:{get:function(){var b=
a("input, select, textarea, button, fieldset",this);return b.length?b:this.elements||null},writeable:!1}});a.fn.serializeArray=function(){return this.map(function(){var b=a.prop(this,"elements");return b?a.makeArray(b):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||k.test(this.nodeName)||c.test(this.type))}).map(function(b,c){var f=a(this).val();return null==f?null:a.isArray(f)?a.map(f,function(a){return{name:c.name,value:a.replace(d,"\r\n")}}):{name:c.name,value:f.replace(d,
"\r\n")}}).get()}}();(function(){Modernizr.textareaPlaceholder=!!("placeholder"in a("<textarea />")[0]);var b=a.browser.webkit&&Modernizr.textareaPlaceholder;if(!Modernizr.input.placeholder||!Modernizr.textareaPlaceholder||b){var d="over"==f.cfg.forms.placeholderType,c=["textarea"];Modernizr.input.placeholder||c.push("input");var k=function(a){try{if(a.setSelectionRange)return a.setSelectionRange(0,0),!0;if(a.createTextRange){var b=a.createTextRange();b.collapse(!0);b.moveEnd("character",0);b.moveStart("character",
0);b.select();return!0}}catch(d){}},g=function(b,c,f,n){!1===f&&(f=a.prop(b,"value"));if(!d&&"password"!=b.type){if(!f&&n&&k(b)){var g=setTimeout(function(){k(b)},9);a(b).unbind(".placeholderremove").bind("keydown.placeholderremove keypress.placeholderremove paste.placeholderremove input.placeholderremove",function(d){if(!d||!(17==d.keyCode||16==d.keyCode))b.value=a.prop(b,"value"),c.box.removeClass("placeholder-visible"),clearTimeout(g),a(b).unbind(".placeholderremove")}).bind("mousedown.placeholderremove drag.placeholderremove select.placeholderremove",
function(){k(b);clearTimeout(g);g=setTimeout(function(){k(b)},9)}).bind("blur.placeholderremove",function(){clearTimeout(g);a(b).unbind(".placeholderremove")});return}b.value=f}else if(!f&&n){a(b).unbind(".placeholderremove").bind("keydown.placeholderremove keypress.placeholderremove paste.placeholderremove input.placeholderremove",function(d){if(!d||!(17==d.keyCode||16==d.keyCode))c.box.removeClass("placeholder-visible"),a(b).unbind(".placeholderremove")}).bind("blur.placeholderremove",function(){a(b).unbind(".placeholderremove")});
return}c.box.removeClass("placeholder-visible")},j=function(b,c,f,n,j){if(!n&&(n=a.data(b,"placeHolder"),!n))return;a(b).unbind(".placeholderremove");if("focus"==j||!j&&a(b).is(":focus"))("password"==b.type||d||a(b).hasClass("placeholder-visible"))&&g(b,n,"",!0);else if(!1===c&&(c=a.prop(b,"value")),c)g(b,n,c);else if(!1===f&&(f=a.attr(b,"placeholder")||""),f&&!c){c=n;!1===f&&(f=a.prop(b,"placeholder"));if(!d&&"password"!=b.type)b.value=f;c.box.addClass("placeholder-visible")}else g(b,n,c)},m=function(b){var b=
a(b),d=b.prop("id"),c=!(!b.prop("title")&&!b.attr("aria-labelledby"));!c&&d&&(c=!!a('label[for="'+d+'"]',b[0].form)[0]);c||(d||(d=a.webshims.getID(b)),c=!!a("label #"+d)[0]);return a(c?'<span class="placeholder-text"></span>':'<label for="'+d+'" class="placeholder-text"></label>')},l=function(){var b={text:1,search:1,url:1,email:1,password:1,tel:1,date:1};return{create:function(b){var c=a.data(b,"placeHolder");if(c)return c;c=a.data(b,"placeHolder",{});a(b).bind("focus.placeholder blur.placeholder",
function(a){j(this,!1,!1,c,a.type);c.box["focus"==a.type?"addClass":"removeClass"]("placeholder-focused")});b.form&&a(b.form).bind("reset.placeholder",function(a){setTimeout(function(){j(b,!1,!1,c,a.type)},0)});if("password"==b.type||d){c.text=m(b);c.box=a(b).wrap('<span class="placeholder-box placeholder-box-'+(b.nodeName||"").toLowerCase()+'" />').parent();c.text.insertAfter(b).bind("mousedown.placeholder",function(){j(this,!1,!1,c,"focus");try{setTimeout(function(){b.focus()},0)}catch(a){}return!1});
a.each(["Left","Top"],function(d,f){var h=(parseInt(a.css(b,"padding"+f),10)||0)+Math.max(parseInt(a.css(b,"margin"+f),10)||0,0)+(parseInt(a.css(b,"border"+f+"Width"),10)||0);c.text.css("padding"+f,h)});a.css(b,"lineHeight");var f={width:a(b).width(),height:a(b).height()},h=a.css(b,"float");a.each(["lineHeight","fontSize","fontFamily","fontWeight"],function(d,f){var h=a.css(b,f);c.text.css(f)!=h&&c.text.css(f,h)});f.width&&f.height&&c.text.css(f);"none"!==h&&c.box.addClass("placeholder-box-"+h)}else f=
function(d){a(b).hasClass("placeholder-visible")&&(g(b,c,""),d&&"submit"==d.type&&setTimeout(function(){d.isDefaultPrevented()&&j(b,!1,!1,c)},9))},a(u).bind("beforeunload",f),c.box=a(b),b.form&&a(b.form).submit(f);return c},update:function(c,d){if(!b[a.prop(c,"type")]&&!a.nodeName(c,"textarea"))f.warn("placeholder not allowed on type: "+a.prop(c,"type"));else{var g=l.create(c);g.text&&g.text.text(d);j(c,!1,d,g)}}}}();a.webshims.publicMethods={pHolder:l};c.forEach(function(a){f.defineNodeNameProperty(a,
"placeholder",{attr:{set:function(a){b?(f.data(this,"textareaPlaceholder",a),this.placeholder=""):f.contentAttr(this,"placeholder",a);l.update(this,a)},get:function(){return(b?f.data(this,"textareaPlaceholder"):"")||f.contentAttr(this,"placeholder")}},reflect:!0,initAttr:!0})});c.forEach(function(c){var d={},g;["attr","prop"].forEach(function(c){d[c]={set:function(d){var h;b&&(h=f.data(this,"textareaPlaceholder"));h||(h=f.contentAttr(this,"placeholder"));a.removeData(this,"cachedValidity");var i=
g[c]._supset.call(this,d);h&&"value"in this&&j(this,d,h);return i},get:function(){return a(this).hasClass("placeholder-visible")?"":g[c]._supget.call(this)}}});g=f.defineNodeNameProperty(c,"value",d)})}})()});
