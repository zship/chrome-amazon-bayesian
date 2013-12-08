define(function(require) {

	var $ = require('jquery');
	var forEach = require('deferreds/forEach');
	var setParam = require('mout/queryString/setParam');
	require('lib/mutation_summary');

	var parseProducts = require('./parseProducts');
	var getBayesianRating = require('./getBayesianRating');


	var nextLinkId = '#pagnNextLink';
	var containerId = '#rightResultsATF';


	var _addLink = function() {
		if ($('.bayesianLink').length) {
			return;
		}
		$('<a class="bayesianLink" href="#">Bayesian</a>').insertAfter('#sort');
	};
	_addLink();


	var observer = new window.MutationSummary({
		rootNode: $(containerId)[0],
		callback: function(summaries) {
			if (summaries[0].removed.length) {
				_addLink();
			}
		},
		queries: [{
			element: '.loadingSpinner'
		}]
	});


	$('body').on('click', '.bayesianLink', function(e) {
		observer.disconnect();

		var products = parseProducts($(containerId));
		var next = $(nextLinkId).attr('href');
		var pageCount = 0;
		if (next) {
			next = next.replace(/\/s\/ref=.*?\?/, '/mn/search/ajax/?');

			var range = $('#resultCount span').text();
			if (!range) {
				throw 'Could not determine total page count.';
			}
			var matches = range.match(/showing (\d+?) - (\d+?) of ([\d,]+?) results/i);
			if (matches[1] !== '1') {
				throw 'Please start on page #1 of the results';
			}
			var pageSize = parseInt(matches[2], 10) - parseInt(matches[1], 10);
			pageSize += 1;
			var total = parseInt(matches[3].replace(',',''), 10);
			pageCount = Math.ceil(total / pageSize);
		}

		next = setParam(next, 'section', 'BTF');

		var urlList = [];
		var curr = 1;
		for (var i = 0; i <= pageCount; i++) {
			curr++;
			next = setParam(next, 'page', curr);
			urlList.push(next);
		}

		if (urlList.length > 16) {
			urlList = urlList.slice(0, 15);
		}

		forEach(urlList, function(url) {
			return $.ajax({
				url: url,
				dataType: 'text'
			}).then(function(data) {
				data.split('&&&').map(function(obj) {
					return obj && JSON.parse(obj);
				}).filter(function(obj) {
					return (obj.centerBelow || obj.centerBelowMinus || obj.centerBelowPlus);
				}).forEach(function(obj) {
					var content = (obj.centerBelow || obj.centerBelowMinus || obj.centerBelowPlus);
					products = products.concat(parseProducts($(content.data.value)));
				});
				//next = $(data).find(nextLinkId).attr('href');
			});
		}).then(function() {
			products = products.filter(function(prod) {
				return prod.voteCount > 10;
			});

			var totalRating = 0;
			var totalVoteCount = 0;
			products.forEach(function(prod) {
				totalRating += prod.rating;
				totalVoteCount += prod.voteCount;
			});

			var avgRating = totalRating / products.length;
			var avgVoteCount = totalVoteCount / products.length;
			products = products.map(function(prod) {
				prod.bayesian = getBayesianRating(prod.rating, prod.voteCount, avgRating, avgVoteCount);
				return prod;
			});

			products = products.sort(function(a, b) {
				return b.bayesian - a.bayesian;
			});

			var container = $('#btfResults');
			container.css('visibility', 'hidden');

			$('#atfResults, #btfResults').empty();

			products.forEach(function(prod, i) {
				if (i % 3 === 0) {
					container.append('<br class="unfloat" />');
					container.append('<div class="rowDividerGrid entireRowGrid"></div>');
				}

				var el = $(prod.html);
				el.find('.rvw').after('<li class="bayesian">Bayesian: ' + prod.bayesian.toFixed(2) + ' (Original ' + prod.rating.toFixed(1) + ')</li>');
				container.append(el);
			});

			container.css('visibility', 'visible');

			observer.reconnect();
		});
	});

});
