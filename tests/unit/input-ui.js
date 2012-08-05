(function($){
	
//Todo test:
//types: datetime-local, time
//properties: step, max, min, disabled, valueAsDate
module("input ui");

asyncTest("widgets Modul", function(){
	$.webshims.setOptions('forms-ext', {lazyDate: false});
	QUnit.reset();
	
	var replaceUI = $.webshims.cfg['forms-ext'].replaceUI;
	var shadow;
	ok($('#range').prop('value') !== "", "range has always a value");
	
	if(replaceUI || !Modernizr.inputtypes.range){
		shadow =  $('#range').next('.input-range');
		ok(!!shadow[0], "range has a shadow element");
		ok($('#range').prop('value') == shadow.slider('value'), "shadow slider reflects initial value");
		$('#range').prop('value', '10');
		equals(shadow.slider('value'), $('#range').prop('value'), "range value is reflected");
		$('#range').prop('valueAsNumber', 20);
		equals($('#range').prop('value'), "20", "range valueAsNumber is reflected");
		equals(shadow.slider('value'), 20, "range valueAsNumber is reflected");
	}
	
	if(replaceUI || !Modernizr.inputtypes.date){
		shadow =  $('#date').next('.input-date');
		ok(!!shadow[0], "date has a shadow element");
		ok(!!shadow[0].value, "date has an initial value");
		$('#date').val('2010-10-10');
		
		var pickerObject = shadow.data('datepicker');
		equals(pickerObject.currentYear +'-'+ (pickerObject.currentMonth + 1) +'-'+pickerObject.currentDay, $('#date').attr('value'), "date value is reflected");
		
		$('#date').prop('valueAsNumber', 1293753600000);
		equals(pickerObject.currentYear +'-'+ (pickerObject.currentMonth + 1) +'-'+pickerObject.currentDay, $('#date').attr('value'), "date valueAsNumber is reflected");
	}
	
	
	$.webshims.setOptions('forms-ext', {lazyDate: true});
	
	$.webshims.ready('forms-ext DOM', function(){
		start();
	});
});

})(jQuery);
