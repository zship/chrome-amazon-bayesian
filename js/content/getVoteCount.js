define(function(require) {

	var $ = require('jquery');


	var getVoteCount = function(el) {
		var txt = $(el).find('.rvwCnt a').text();
		if (!txt) {
			return undefined;
		}
		return parseInt(txt.replace(',', ''), 10);
	};


	return getVoteCount;

});
