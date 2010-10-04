module("canvas + dynamic canvas");
asyncTest("canvas + dynamic canvas", function(){
	
	$('#outside-test canvas').data('canvasnotchanged', true);
	ok('strokeStyle' in $('#outside-test canvas').getContext('2d'), 'webshim canvas is applied');
	ok('strokeStyle' in $('#outside-test canvas')[0].getContext('2d'), '[ex]canvas is applied');
	ok($('#outside-test canvas').data('canvasnotchanged'), 'data on canvas was not changed');
	
	$('#outside-test').html('<canvas></canvas>');
	$('#outside-test canvas').data('canvasnotchanged', true);
	if($.support.canvas === true){
		ok('strokeStyle' in $('#outside-test canvas')[0].getContext('2d'), 'canvas is applied');
		ok('strokeStyle' in $('#outside-test canvas')[0].getContext('2d'), 'canvas is applied');
	} else {
		ok(!('getContext' in $('#outside-test canvas')[0]), 'excanvas is not applied');
		ok('strokeStyle' in $('#outside-test canvas').getContext('2d'), 'excanvas is applied');
		ok('strokeStyle' in $('#outside-test canvas')[0].getContext('2d'), 'excanvas is applied');
	}
	ok($('#outside-test canvas').data('canvasnotchanged'), 'data on canvas was not changed');
	
	
	$('#outside-test').htmlWebshim('<canvas></canvas>');
	$('#outside-test canvas').data('canvasnotchanged', true);
	ok(('getContext' in $('#outside-test canvas')[0]), 'excanvas is applied');
	ok('strokeStyle' in $('#outside-test canvas').getContext('2d'), 'webshim canvas is dynamically applied');
	ok('strokeStyle' in $('#outside-test canvas')[0].getContext('2d'), '[ex]canvas is dynamically applied');
	ok($('#outside-test canvas').data('canvasnotchanged'), 'data on canvas was not changed');
	
	$('#outside-test').remove();
	
	$.webshims.readyModules('ready canvas', function(){
		start();
	});
});