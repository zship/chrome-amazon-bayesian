define(function(require) {

	var $ = require('jquery');


	var getRating = function(el) {
		var ratingAlt = $(el).find('.asinReviewsSummary a').attr('alt');
		if (!ratingAlt) {
			return undefined;
		}
		var rating = ratingAlt.match(/([\d\.]+)\sout of 5/)[1];
		return parseFloat(rating, 10);
	};


	return getRating;

});
