define(function(require) {

	var $ = require('jquery');
	var compact = require('mout/array/compact');

	var getProductElements = require('./getProductElements');
	var getRating = require('./getRating');
	var getVoteCount = require('./getVoteCount');


	var parseProducts = function(html) {
		return compact(
			getProductElements($(html)).toArray().map(function(el) {
				return {
					rating: getRating(el),
					voteCount: getVoteCount(el),
					html: el.outerHTML
				};
			}).map(function(prod) {
				if (prod.rating === undefined || prod.voteCount === undefined) {
					return undefined;
				}
				return prod;
			})
		);
	};


	return parseProducts;
});
