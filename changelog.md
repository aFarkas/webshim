upcomming Release 1.11.1
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