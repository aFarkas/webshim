Release 1.12.2
----------

- fixed grouped instant validation

Release 1.12.1
----------

- improved intelligent calculation of basePath (now works with async loaded and renamed polyfiller, too)
- fixed regression in IE8 on input type date prev/next buttons (https://github.com/aFarkas/webshim/issues/340)
- added tooFixed option for input type=number (a good base for a currency input [demo](http://afarkas.github.io/webshim/demos/demos/cfgs/input-number.html#min=0&step=0.01&stepfactor=1000&toFixed=2))
- added predefined styling configurations for mutliple widgets ([range](http://afarkas.github.io/webshim/demos/demos/cfgs/input-range.html#&max=50&list=range-list&show-activelabeltooltip=on&show-tickvalues=on), [date](http://afarkas.github.io/webshim/demos/demos/cfgs/input-date.html#startView=2&splitInput=on&calculateWidth=on&show-week=on&hide-btnrow=on&hide-spinbtns=on&inputbtns-outside=on))
- added yearSelect/monthSelect [and daySelect] option to type=month/date pickers ([month](http://afarkas.github.io/webshim/demos/demos/cfgs/input-month.html#yearSelect=on&monthSelect=on&placeholder=yyyy-mm&min=2014-02&max=2020-01&monthNames=monthNamesShort))
- added noInlineValue to list/datalist ([demo](http://afarkas.github.io/webshim/demos/demos/cfgs/list-datalist.html#list=state-list&filter=^&highlight=on&noInlineValue=on))
- improved descriptive errormessage markup
- trigger invalid event on form element itself (only in polyfilled browsers)
- new stepbase calculation using defaultValue if min isn't applied (only in polyfilled browsers)


Release 1.12.0
----------

- new dir structure for bower (:root/js-webshim is the new folder for build js. :root/demos/js-webshim will be removed with next realease)
- all locale js files are fetched using XHR (use setOptions('ajax', {crossDomain: true}) to disable)
- transfer JS options for many pickers to CSS (i.e.: showWeek: true -> .input-picker .ws-week {display: table-cell})
- fixed fieldset:disabled implementation [demo](http://jsfiddle.net/trixta/K8EPm/)
- improved styles for type=range, datalist and progress element
- most widgets are em scalable (base font is 13px)
- fixed data-errormessage attribute
- added grunt task to optimize polyfiller.js (-> grunt-tasks/optimize-polyfiller.js)
- update flashcanvas fixes a security issue (with php)
- a11y improvements

Release 1.11.5 and 1.11.6
----------

- improved support for video width=auto/height=auto in combination with min-/max- / width/height
- full support for jQuery mobile 1.3+
- update es5-shim v.2.1.0
- update Modernizr 2.7.1
- youtube qualitity settings for Flash and iframe API (using ``vq`` parameter on src (/vq\=(small|medium|large|hd720|hd1080|highres)/i)
- updated dutch language file (thx to @espaan)
- a lot of undocumented option tweaks
- implemented/polyfilled setSelectionRange/selectionStart/selectionEnd
- added fieldset[disabled]/:disabled support (buggy, will be fixed with next release)

Release 1.11.3
----------

- fixed regression error for time picker (i.e: t.time is undefined)
- added full support for form reset
- allow partial UI replacement (replaceUI can take an object instead of a boolean)
- fix change/input event in capable browsers on type="range" (fixRangeChange option)
- added czech and br language
- added support for fieldset:invalid (but not polyfilled in capable browsers without support i.e.: Chrome)


Release 1.11.2
----------

- split form-shims into two files (improves network performance for iOS/Safari7)
- added getTrackById and onchange event to TrackList Object
- improved stepUp/stepDown method
- added touch support to input[type="range"]
- fixed time picker
- added support for defaultValue to all input widgets 

Release 1.11.1
----------

- implemented seeking, seeked events, seeking property for mediaelements
- implemented muted content attribute/defaultMuted property for mediaelements (muted porperty was supported from beginning of course)
- improved form validators
- implemented remote form validation
- fixed meridian parsing for datetime-local
- allow URI Fragments as source for mediaelements

Release 1.11.0
----------

- implemented input[type="datetime-local"]
- implmented picker for input[type="time"]
- implemented validityState.badInput
- all input widget popover can be displayed inline

Release 1.10.10
----------

- improved positioning support of popover (datalist, datepicker etc.) (if jQuery UI position utility is detected)
- re-added width: auto/height: auto support for mediaelement flash fallback [demo](http://afarkas.github.io/webshim/demos/demos/mediaelement/responsive-mediaelement.html)
- added media attribute support for mediaelement flash fallback
- updated regular expression for type="email"
- optional IDN support for type="email" for polyfilled browsers ([punycode](https://github.com/bestiejs/punycode.js) has to be included) 

Release 1.10.9
----------

- fixed regression introduced in 1.10.8 with input[type="month"] [see Issue #258](https://github.com/aFarkas/webshim/issues/258)

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
