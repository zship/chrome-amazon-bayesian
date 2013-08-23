define(function(require) {

	var $ = require('jquery');


	var getProductElements = function(html) {
		return $(html).find('.grid.results .prod');
	};


	return getProductElements;
});
