(function($){
	
//Todo test:
//types: datetime-local, time
//properties: step, max, min, disabled, valueAsDate
module("input ui");

var getRangeValueUI = function(range){
	var leftStyle = parseInt( ($('.ws-range-thumb', range)[0] || {style: {left: -1}}).style.left, 10)
	equals(range.data('rangeUi').options.value, leftStyle, "range's left style equals options.value");
	return ''+leftStyle;
};

asyncTest("widgets Modul", function(){
	QUnit.reset();
	$.webshims.activeLang('de');
	
	var replaceUI = $.webshims.cfg['forms-ext'].replaceUI;
	var shadow;
	
	ok($('#range').prop('value') != "", "range has always a value");
	
	
	
	if(replaceUI || !webshims.support.inputtypes.range){
		shadow =  $('#range').next('.ws-range');
		ok(!!shadow[0], "range has a shadow element");
		ok($('#range').prop('value') == getRangeValueUI(shadow), "shadow slider reflects initial value");
		$('#range').prop('value', '10');
		equals(getRangeValueUI(shadow), $('#range').prop('value'), "range value is reflected");
		$('#range').prop('valueAsNumber', 20);
		equals(getRangeValueUI(shadow), 20, "range valueAsNumber is reflected");
	}
	
	if(replaceUI || !webshims.support.inputtypes.date){
		shadow =  $('#date').next('.ws-date');
		ok(!!shadow[0], "date has a shadow element");
		ok(!!shadow.prop('value'), "date has an initial value");
		$('#date').val('2010-11-10');
		
		equals(shadow.prop('value'), '10.11.2010', "date value is reflected");
		
		$('#date').prop('valueAsNumber', 1293753600000);
		equals(shadow.prop('value'), '31.12.2010', "date valueAsNumber is reflected");
		
		shadow.prop('value', '12.10.2000').trigger('change');
		equals($('#date').prop('value'), '2000-10-12', "shadow dom input is reflected");
		$.webshims.activeLang('en');
		equals(shadow.prop('value'), '10/12/2000', "format is changed on localechange");
		$.webshims.activeLang('de');
	}
	
	if(replaceUI || !webshims.support.inputtypes.number){
		$.webshims.activeLang('de');
		shadow =  $('#number').next('.ws-number');
		$('#number').prop('step', '0.1').val('0.1');
		strictEqual($('#number').prop('valueAsNumber'), 0.1, 'valueAsNumber is 0.1');
		strictEqual(shadow.prop('value'), '0,1', 'formatted value is 0,1 on nummber');
		$.webshims.activeLang('en');
		equals(shadow.prop('value'), '0.1', "format is changed on localechange");
		$.webshims.activeLang('de');
	}
	
	$.webshims.ready('forms-ext DOM', start);
});

})(jQuery);
