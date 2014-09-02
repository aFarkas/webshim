Release 1.15.2
----------
- fix regression bug in custom validators

Release 1.15.1
----------
- added postion: ``sticky`` polyfill ([demo](http://fiddle.jshell.net/trixta/5kjrtLvw/show/light/))
- added canvas.toBlob feature as part of the ``filereader`` feature
- improved cuechange event in performance and precision

Release 1.15.0
----------

- implemented ``getUserMedia`` feature ([demo](http://jsfiddle.net/trixta/yC2j3/embedded/result/))
- fixed data-grouprequired bug
- improved youtube iframe lazy loading
- added ``canvas.toBlob`` in browsers without native FormData (to be used with FormData/FileReader shim)
- improved loading of xhr2/filereader feature
- update es6-shim
- improved youtube play bug on iOS and Android browsers

Release 1.14.6
----------

- added URL polyfill
- added canvas <-> mediaelement bridge ([demo](http://jsfiddle.net/trixta/Wvaca/embedded/result/))
- fixed custom controls in conjunction with youtube API and iOS/Android
- fixed bug in conjunction with some AMD loading environments
- improved type="number" detection
- update picturefill polyfill
- improve input type=time formatting
- and one hidden/undocumented but awesome feature ([demo](http://jsfiddle.net/trixta/yC2j3/embedded/result/)) (still in alpha state)

Release 1.14.5
----------

- force all browser to use new stepUp/stepDown algorithm
- improve readyState complete detection
- don't polyfill elements with the class 'ws-nopolyfill'
- improve support for custom jQuery builds
- recheck validilty of invalid textarea using input event
- updated plugins (sizzle and ui.position)
- improved performance for IE's
- fixed several CSS issues for Android and iOS (especially input widgets sometimes not focusable on iOS5/6)
- no restart of mediaelement after video ended
- don't show main playbutton while in paused state (only on initial and ended state)


Release 1.14.4
----------

- replaced promise  with [es6-shim](https://github.com/paulmillr/es6-shim) (currently most things aren't feature detected, so only promise can be used safely)
- removed dependency to Modernizr (still needed html5shiv or Modernizr to use semantic elements like section/article/main etc.), but not needed for video/audio/form and so on
- improved runtime and network performance for mediaelement flash fallback
- added track[kind="chapters"] support to mediaelement UI
- added alternate-media plugin for mediaelement implementation use as quality switch or other alternative media sources (switch video with or without sign language or switch videos with different audiotracks and so on.)
- fixed IE issue with custom styleable filechooser
- improved textTrack feature detection
- load all track sources on loadstart (use preload="none" to optimize for performance)
- add matchMedia polyfill including addListener and removeListener interface
- in case picture feature was requested, ready event of jQuery was delayed
- improved touch support

Release 1.14.3
----------
- added new language files (zh-TW and fa)
- removed box-shadows and border-radius and added new metro theme ([demo](http://afarkas.github.io/webshim/demos/demos/themes/themes.html))
- improved styles for custom styleable mediaelement controls
- added popinline feature for form widgets (don't confuse with inlinePicker feature ([demo](http://jsfiddle.net/trixta/cc7Rt/embedded/result,html,js,css/)), which is also great.)
- added mediaelement debugger (just lunch with ``webshim.mediaelement.loadDebugger();``)
- improved selector performance
- added srt and ttml subtitle support (but you really should still use vtt!)
- improved touch support
- fixed a change event bug in input[type="range"] polyfill



Release 1.14.1/Release 1.14.2
----------
- Bugfixes for new FileReader feature (including better errorhandling in case of mis-configuration)


Release 1.14.0
----------
- implement ``inputmode="numeric"`` for Smartphones ([see demo](http://fiddle.jshell.net/trixta/7NEBb/show/))
- re-implemented FileReader
- implemented XHR2 and FormData (i.e. Sending FileData and Cross-Domain-Requests)
- fixed ``data-groupriequired``
- improved a11y for popovers in conjunction with ``openOnFocus``
- added minlength attribute to custom validators (only if minlength isn't implemented already)
- added new alias ``$.webshim`` (Only for completeness and compatibility. Use the ``webshim`` namespace! For example: ``webshim.polyfill('mediaelement');``)
- **renamed** ``valuevalidation`` to ``validatevalue``
- **renamed** ``refreshCustomValidityRules`` event to ``updatecustomvalidity`` event (``webshim.refreshCustomValidityRules`` method is untouched)


Release 1.13.1
----------
- added clonePolyfill + htmlPolyfill can be used as getter
- implemented pattern check for [type="email"][multiple]
- fixed datalist bug for Android
- fix wrong icon font path for IE8
- added support for jQuery UI selectmenu
- handle autocomplete/passwordmanager autofill with custom validation rules


Release 1.13.0
----------
- added picture / img[srcset] element polyfill
- added promise polyfill
- implemented input event for textarea
- fixed ajax custom validation
- improved stepUp/stepDown methods


Release 1.12.6/1.12.7
----------
- added thousand separator to input[type="number"]
- several runtime performance improvements
- improved responsive default mediaplayer theme
- improved touch support / added fastclick / tab to mediaplayer controls and UI form widgets
- added playlist plugin feature to mediaelement


Release 1.12.5
----------
- added custom styleable controls to mediaelement feature `webshims.setOptions('mediaelement', {replaceUI: true});`
- runtime performance improvements for several input widgets
- added enhancement/mobile strategy flag
- improved datalist/list widget


Release 1.12.4
----------
- new documentation (thx to @mreinstein)
- several small bugfixes
- improve track stlyes


Release 1.12.3
----------

- fixed removeAttr 'disabled' for fieldset[disabled] elements (fix by @outdooricon)
- Enable attribute placeholders for custom error elements in Instant Form Validation
- fix CSS bugs for IE8 in datepicker and range
- compile Jarisplayer as Flash 10.x (fix youtube advertisement bug https://code.google.com/p/gdata-issues/issues/detail?id=5911)


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
