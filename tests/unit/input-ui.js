(function($){
	
//Todo test:
//types: datetime-local, time
//properties: step, max, min, disabled, valueAsDate
module("input ui");

asyncTest("widgets Modul", function(){
	QUnit.reset();
	$.webshims.setOptions('forms-ext', {lazyDate: false});
	var replaceUI = $.webshims.cfg['forms-ext'].replaceUI;
	var shadow;
	ok($('#range').attr('value') !== "", "range has always a value");
	
	if(replaceUI || !Modernizr.inputtypes.range){
		shadow =  $('#range').next('.input-range');
		ok(!!shadow[0], "range has a shadow element");
		$('#range').attr('value', '10');
		equals(shadow.slider('value'), $('#range').attr('value'), "range value is reflected");
		$('#range').attr('valueAsNumber', 20);
		equals(shadow.slider('value'), $('#range').attr('value'), "range valueAsNumber is reflected");
	}
	
	if(replaceUI || !Modernizr.inputtypes.date){
		shadow =  $('#date').next('.input-date');
		ok(!!shadow[0], "date has a shadow element");
		$('#date').attr('value', '2010-10-10');
		
		var pickerObject = shadow.data('datepicker');
		equals(pickerObject.currentYear +'-'+ (pickerObject.currentMonth + 1) +'-'+pickerObject.currentDay, $('#date').attr('value'), "date value is reflected");
		
		$('#date').attr('valueAsNumber', 1293753600000);
		equals(pickerObject.currentYear +'-'+ (pickerObject.currentMonth + 1) +'-'+pickerObject.currentDay, $('#date').attr('value'), "date valueAsNumber is reflected");
	}
	
	
	$.webshims.setOptions('forms-ext', {lazyDate: true});
	
	$.webshims.ready('forms-ext DOM', function(){
		start();
	});
});

})(jQuery);
