import { toggle as toggleInfoBox } from '../utils/info-box';
import * as syndicate from '../utils/syndicate';
import * as global from '../vars/global';

var tracker = null;

export function TrackerComponent(settings) {
	if (tracker) {
		throw new Error('A tracker instance has already been created.');
	}
	tracker = this;
	this.settings = settings;
	this.valuesStart = [];
	this.valuesEnd = [];
	this.valuesTarget = [];
	this.$rankListActive = null;
	this.$rankLabels = null;
	this.$rankStars = null;
	this.$rankLists = null;
	this.$inputsIn = null;
	this.$inputsAdd = null;
	this.$results = null;
	this.$progressBars = null;
	this.$resultsDiff = null;
	this.$totalResults = null;
	this.$totalDiff = null;
	this.initialized = false;
}

TrackerComponent.prototype = {
	init: function() {
		if (this.initialized) {
			throw new Error('The tracker has already been initialized.');
		}
		this.initialized = true;

		for (var syndicateIdx = 0, $syndEls = $('#tracker .synd'); syndicateIdx < $syndEls.length; ++syndicateIdx) {
			$syndEls.getObj(syndicateIdx).data('synd-idx', syndicateIdx);
		}
		var updateTableBound = this.updateTable.bind(this);

		this.$rankLabels = $('#tracker .rank-label');
		this.$rankStars = $('#tracker .rank-stars');
		this.$rankLists = $('#tracker .ranklist');
		this.$inputsIn = $('#tracker .values .in');
		this.$inputsAdd = $('#tracker .values .add');
		this.$results = $('#tracker .results .out');
		this.$progressBars = $('#tracker .progress');
		this.$resultsDiff = $('#tracker .diff');
		this.$totalResults = $('#total-results');
		this.$totalDiff = $('#total-results-diff');
		this.$inputsIn.on('input|keyup', updateTableBound);
		this.$inputsAdd.on('input|keyup', updateTableBound);
		this.$rankLabels.on('click', this.showRankSelection.bind(this));
		$('#set-start').on('click', this.updateStartValues.bind(this));
		$('#clear-start').on('click', this.clearStartValues.bind(this));
		$('#save-start').on('click', this.saveStartValues.bind(this));
		$('#info-main-icon').on('click', function() {
			toggleInfoBox('#info-main');
		});
		$(document).on('click', this.hideRankSelection.bind(this));
		if (!this.settings.hasLocalStorage()) {
			$('#save-start').disable().attr('title', 'Requires browser support for localStorage');
		}
		this.loadStartValues();
		this.updateRankValues();
		updateTableBound();
	},

	addPoints: function(destination, points, syndicateIdx) {
		points = Math.round(points);
		var relations = global.relations[syndicateIdx],
			halfPoints = $.roundFromZero(points / 2);
		destination[syndicateIdx] += points;
		destination[relations[0]] += halfPoints;
		destination[relations[1]] -= halfPoints;
		destination[relations[2]] -= points;
	},

	updateTable: function() {
		var totalAdded = 0,
			totalDiff = 0,
			valuesIn = [];

		for (var syndicateIdx = 0; syndicateIdx < this.$inputsIn.length; ++syndicateIdx) {
			var inputIn = this.$inputsIn[syndicateIdx],
				pointsIn = this.valuesStart[syndicateIdx],
				match;
			while (match = global.valueRegexp.exec(inputIn.value)) {
				pointsIn += Number(match[0]);
			}
			valuesIn[syndicateIdx] = $.clamp(pointsIn, global.minRep, global.maxRep);
		}

		this.valuesEnd = valuesIn.slice();
		for (var syndicateIdx = 0; syndicateIdx < this.$inputsAdd.length; ++syndicateIdx) {
			var inputAdd = this.$inputsAdd[syndicateIdx],
				match;
			while (match = global.valueRegexp.exec(inputAdd.value)) {
				var pointsToAdd = Number(match[0]);
				this.addPoints(this.valuesEnd, pointsToAdd, syndicateIdx);
				totalAdded += Math.abs(pointsToAdd);
			}
		}

		for (var syndicateIdx = 0; syndicateIdx < this.$results.length; ++syndicateIdx) {
			var pointsOut = $.clamp(this.valuesEnd[syndicateIdx], global.minRep, global.maxRep),
				pointsDiff = pointsOut - valuesIn[syndicateIdx],
				rankIdx,
				rankPoints,
				nextLevel,
				progress,
				colorClass;
			this.valuesEnd[syndicateIdx] = pointsOut;
			if (pointsOut >= 0) {
				colorClass = 'pos';
				rankIdx = syndicate.getRankIdx(pointsOut);
				rankPoints = pointsOut;
				if (rankIdx > 0) {
					rankPoints -= global.levelsPosCumulative[rankIdx - 1];
				}
				nextLevel = global.levelsPos[rankIdx];
				progress = 100 * rankPoints / nextLevel;
			}
			else {
				colorClass = 'neg';
				rankIdx = syndicate.getRankIdx(pointsOut);
				rankPoints = pointsOut;
				if (rankIdx < 0) {
					rankPoints -= global.levelsNegCumulative[-rankIdx - 1];
					if (rankPoints == 0 && pointsDiff > 0) {
						++rankIdx;
						if (rankIdx < 0) {
							rankPoints = global.levelsNeg[-rankIdx];
						}
					}
				}
				nextLevel = global.levelsNeg[-rankIdx];
				progress = 100 * rankPoints / nextLevel;
			}
			if (pointsDiff > 0) {
				totalDiff += pointsDiff;
			}
			var pointsDiffStr = pointsDiff ? (pointsDiff > 0 ? '+' : '') + $.formatNumber(pointsDiff) : '\u200b',
				progressHTML = '<span class="points-rank">' + $.formatNumber(rankPoints) + '</span>'
					+ '<span class="points-next-rank"> / ' + $.formatNumber(nextLevel) + '</span>';
			this.$results[syndicateIdx].innerHTML = progressHTML;
			this.$progressBars.getObj(syndicateIdx).setClass('progress ' + colorClass).css('width', progress + '%');
			this.$resultsDiff.getObj(syndicateIdx).setClass('diff ' + (pointsDiff >= 0 ? 'pos' : 'neg')).text(pointsDiffStr);
			this.$rankLabels.getObj(syndicateIdx).text(global.rankNames[syndicateIdx][rankIdx + 2]);
			this.$rankStars.getObj(syndicateIdx).setClass('rank-stars ' + colorClass).text($.strRepeat('\u2605', Math.abs(rankIdx)));
		}
		if (totalAdded > 0) {
			this.$totalResults.text('+' + $.formatNumber(totalDiff) + ' points (' + ($.round(66.667 * totalDiff / totalAdded, 2))  + '% efficiency)').show();
		}
		else {
			this.$totalResults.hide().text('');
		}
	},

	updateRankValues: function() {
		for (var syndicateIdx = 0; syndicateIdx < this.$inputsIn.length; ++syndicateIdx) {
			var rankPointsStart = this.valuesStart[syndicateIdx];
			if (rankPointsStart == global.minRep) {
				rankPointsStart = global.levelsNeg[global.levelsNeg.length - 1];
			}
			else if (rankPointsStart == global.maxRep) {
				rankPointsStart = global.levelsPos[global.levelsPos.length - 1];
			}
			else {
				rankPointsStart = syndicate.getRankPoints(rankPointsStart);
			}
			this.$inputsIn[syndicateIdx].value = rankPointsStart || '';
			if (rankPointsStart) {
				this.valuesStart[syndicateIdx] -= rankPointsStart;
			}
		}
	},

	loadStartValues: function() {
		var valuesStart;
		if (valuesStart = this.settings.getItem('syndicate_startValues')) {
			valuesStart = valuesStart.split(',');
			if (valuesStart.length == this.$inputsIn.length) {
				for (var syndicateIdx = 0; syndicateIdx < this.$inputsIn.length; ++syndicateIdx) {
					valuesStart[syndicateIdx] = $.truncate(valuesStart[syndicateIdx]);
				}
			}
			else {
				valuesStart = false;
			}
		}
		this.valuesStart = valuesStart || $.fillArray(Array(this.$inputsIn.length), 0);
	},

	clearStartValues: function() {
		this.valuesStart = $.fillArray(Array(this.$inputsIn.length), 0);
		this.$inputsAdd.val('');
		this.$inputsIn.val('');
		this.updateTable();
	},

	setStartValues: function(valuesStart) {
		if (valuesStart.length > this.$inputsAdd.length) {
			throw new Error('Value count exceeds input field amount.');
		}
		for (var syndicateIdx = 0; syndicateIdx < valuesStart.length; ++syndicateIdx) {
			this.$inputsAdd[syndicateIdx].value = valuesStart[syndicateIdx] || '';
		}
		this.updateTable();
	},

	saveStartValues: function() {
		this.settings.setItem('syndicate_startValues', this.valuesEnd.join(','));
	},

	updateStartValues: function() {
		this.$inputsAdd.val('');
		this.valuesStart = this.valuesEnd.slice();
		this.updateRankValues();
		this.updateTable();
	},

	showRankSelection: function(ev) {
		ev.stopPropagation();
		var $target = $(ev.target),
			syndicateIdx = $target.getData('synd-idx', true),
			$rankList = this.$rankLists.getObj(syndicateIdx);
		if (this.$rankListActive == $rankList) {
			this.hideRankSelection();
			return;
		}
		if (!$rankList[0].children.length) {
			for (var rankIdx in global.rankNames[syndicateIdx]) {
				var colorClass = rankIdx == global.levelsNeg.length - 1 ? '' : rankIdx > global.levelsNeg.length - 1 ? ' pos' : ' neg';
				$.createElement('div', {'class': 'ranklist-item nobr' + colorClass})
					.data('rank-idx', rankIdx - (global.levelsNeg.length - 1))
					.text(global.rankNames[syndicateIdx][rankIdx])
					.on('click', this.cbSetRank.bind(this))
					.appendTo($rankList);
			}
		}
		this.hideRankSelection();
		$target.addClass('selecting');
		$rankList.css({'height': $rankList[0].scrollHeight + 'px', 'opacity': '1', 'zIndex': '2'});
		this.$rankListActive = $rankList;
	},

	hideRankSelection: function() {
		this.$rankListActive && this.$rankListActive.css({'height': '0', 'opacity': '0', 'zIndex': null});
		$('.rank-label.selecting').removeClass('selecting');
		this.$rankListActive = null;
	},

	cbSetRank: function(ev) {
		var $target = $(ev.target),
			syndicateIdx = $target.getData('synd-idx', true),
			targetRankIdx = $target.getData('rank-idx');
		this.setRank(syndicateIdx, targetRankIdx);
	},

	setRank: function(syndicateIdx, targetRankIdx) {
		if (!this.$rankListActive || this.$rankListActive != this.$rankLists.getObj(syndicateIdx)) {
			return;
		}
		if (targetRankIdx < 0) {
			this.valuesStart[syndicateIdx] = global.levelsNegCumulative[-targetRankIdx - 1];
		}
		else if (targetRankIdx > 0) {
			this.valuesStart[syndicateIdx] = global.levelsPosCumulative[targetRankIdx - 1];
		}
		else {
			this.valuesStart[syndicateIdx] = 0;
		}
		this.$inputsIn[syndicateIdx].value = '';
		this.updateTable();
	}
};
