define(function(require) {

	var getBayesianRating = function(rating, votes, avgRating, avgVotes) {
		return ( (avgVotes * avgRating) + (votes * rating) ) / (avgVotes + votes);
	};


	return getBayesianRating;

});
