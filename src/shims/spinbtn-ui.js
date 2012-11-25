(function($){
	var steps = {
		number: {
			step: 1,
			stepScaleFactor: 1
		},
		date: {
			step: 1,
			//stepBase: 0, 0 = default
			stepScaleFactor:  86400000
		},
		time: {
			step: 60,
			stepScaleFactor:  1000
		}
	};
	steps.range = steps.number;
})(jQuery);
