/**
 * @typedef {import ('./tracker').TrackerComponent} TrackerComponent
 * @typedef {{pos: number, neg: number, zero: number}} Bitfields
 */

import { toggle as toggleInfoBox } from '../utils/info-box';
import * as global from '../vars/global';
import * as syndicate from '../utils/syndicate';

var instantiated = false;

/**
 * Inverse of the following matrix containing reputation multipliers.
 * ```
       1     0     0    -1   0.5
       0     1   0.5  -0.5    -1
       0   0.5     1     0  -0.5
      -1  -0.5     0     1     0
     0.5    -1  -0.5     0     1
 ```
 */
var matrix = [
		//SM, AH, CS, PS, RV
		[-3,  0,  1, -3,  2], // Steel Meridian
		[ 0, -4,  0, -2, -4], // Arbiters of Hexis
		[ 1,  0,  1,  1,  0], // Cephalon Suda
		[-3, -2,  1, -3,  0], // The Perrin Sequence
		[ 2, -4,  0,  0, -4]  // Red Veil
	];

/**
 * Pre-calculated combinations with optimal efficiencies.
 * The Bitfield+/- columns have active bits where the corresponding target is positive or negative, respectively.
 */
var presets = [
	//SM,  AH,  CS,  PS,  RV,  NL, Efficiency, Bitfield+, Bitfield-
	[-20, -10,   0,  20,   0,  10,   100,  5, 48],
	[-10,   0, -20,  10,   0,  20,   100,  5, 40],
	[-30, -10, -20,  30,   0,  30,   100,  5, 56],
	[  0,  10,  20,   0, -10, -20,   100, 24,  3],
	[  0,  20,  10, -10, -20,   0,   100, 24,  6],
	[  0,  30,  30, -10, -30, -20,   100, 24,  7],
	[ 10, -20, -10,   0,  20,   0,   100, 34, 24],
	[ 20,   0,   0, -20,  10, -10,   100, 34,  5],
	[ 30, -20, -10, -20,  30, -10,   100, 34, 29],
	[ 10,  20,  40, -10, -15, -45, 93.33, 56,  7],
	[-30, -30, -50,  40,  20,  50, 91.67,  7, 56],
	[-40, -40, -30,  50,  20,  40, 91.67,  7, 56],
	[ 10, -40, -40,  10,  40,  20, 88.89, 39, 24],
	[ 40,  10,  20, -40,  10, -40, 88.89, 58,  5],
	[-10,  15,  40,  10, -20, -35, 86.67, 28, 35],
	[-30,  20, -50,  20, -20,  60, 83.33, 21, 42],
	[-20,  50,  30, -10, -60,  10,    75, 25, 38],
	[ 30, -40, -40, -10,  50,  10,    75, 35, 28],
	[-20,   0,  20,  20, -10, -10, 66.67, 12, 35],
	[-40,   0,  10,  30, -20,  20, 66.67, 13, 34],
	[-10,  20, -10,   0, -20,  20, 66.67, 17, 42],
	[-20,  10,  10,  10, -20,  10, 66.67, 29, 34],
	[-50, -10,  30,  50, -15,  -5, 66.67, 12, 51],
	[ 30, -10,  10, -20,  20, -30, 66.67, 42, 21],
	[-60, -10, -10,  50, -15,  45, 57.58,  5, 58],
	[-15,  50,  50, -10, -60, -15, 53.33, 24, 39],
	[ 10, -60, -10,  20,  50, -10, 53.33, 38, 25],
	[ 50,  20, -10, -60,  10, -10, 53.33, 50, 13],
	[-30, -30,  10,  40,  10,   0,    50, 14, 48],
	[ 10,  40,   0, -30, -30,  10,    50, 49,  6],
	[ 10,  40,  15, -30, -40,   5, 49.12, 57,  6],
	[ 40,  40,   0, -60, -15,  -5, 48.49, 48,  7],
	[ 40,  10,   0, -40,  15, -25, 48.15, 50,  5],
	[-20, -50,   0,  40,  30,   0, 46.67,  6, 48],
	[ 20, -60,  20,  20,  50, -50, 45.83, 46, 17],
	[  0,   0, -40,   0,  10,  30, 44.44,  3,  8],
	[ 10,  20, -10, -20, -10,  10, 44.44, 49, 14],
	[ 10,   0,  30,   0,   0, -40, 44.44, 40,  1],
	[ 40,  20, -30, -50,  10,  10, 44.44, 51, 12],
	[-40, -30,  10,  40,  10,  10, 42.42, 15, 48],
	[ 10, -30, -20,  10,  30,   0, 41.67, 38, 24],
	[-10,  10,   0,  10, -10,   0, 33.33, 20, 34],
	[  0,  10, -60,   0,  10,  40, 28.57, 19,  8],
	[ 10,   0,  40,  10,   0, -60, 28.57, 44,  1],
	[ 40,  50, -10, -60, -15,  -5, 27.27, 48, 15],
	[-10, -50, -15,  40,  40,  -5, 26.02,  6, 57],
	[  0,   0, -10,   0,   0,  10, 22.22,  1,  8],
	[  0,   0,  10,   0,   0, -10, 22.22,  8,  1],
	[ 10,  20,  40,  10, -10, -70, 22.22, 60,  3],
	[-10,  10, -60,  10,  10,  40, 21.21, 23, 40],
	[ 10,   0, -50, -10,   0,  50, 21.05, 33, 12],
	[-40,  50, -10,  50, -40, -10, 20.83, 20, 43],
	[  0, -10,  40,   0,  10, -40, 20.83, 10, 17],
	[-30, -10,   0,  40,   0,   0, 17.78,  4, 48],
	[  0,  40,   0, -10, -30,   0, 17.78, 16,  6],
	[  0, -10,   0,   0,  10,   0, 16.67,  2, 16],
	[ 10,   0,   0, -10,   0,   0, 16.67, 32,  4],
	[-10, -40, -40, -10,  50,  50, 15.15,  3, 60],
	[ 50, -10,  50, -40, -10, -40, 15.15, 40, 23],
	[ 20,  10,  30,  10,  10, -80, 13.33, 62,  1],
	[ 40, -50,  10, -50,  40,  10, 12.82, 43, 20],
	[-10, -50,  10,   0,  40,  10,  12.5, 11, 48],
	[ 40,   0,  10, -50, -10,  10,  12.5, 41,  6],
	[-10, -60,  50, -10,  50, -20, 12.12, 10, 53],
	[ 50, -10, -20, -60, -10,  50, 12.12, 33, 30],
	[ 10, -10,  50,  10, -10, -50, 11.97, 44, 19],
	[ 10,  10, -60,  10,  20,  10, 11.76, 55,  8],
	[-10, -60,  20, -10,  50,  10, 11.59, 11, 52],
	[ 50, -10,  10, -60, -10,  20, 11.59, 41, 22],
	[-10,   0,  10,   0, -10,  10, 11.11,  9, 34],
	[ 40,  10, -50,  10,  40, -50, 10.42, 54,  9],
	[-10,  10, -50,  40,  10,   0,    10, 22, 40],
	[ 10,  40,   0,  10, -10, -50,    10, 52,  3],
	[  0,  10,  40,  20,  10, -80,  9.88, 30,  1],
	[-40, -10,  50, -10, -40,  50,   9.8,  9, 54],
	[ 10,  50, -20,  10, -10, -40,  9.72, 52, 11],
	[  0,  10,  40,   0,  10, -60,  9.09, 26,  1],
	[ 10,   0, -60,  10,   0,  40,  9.09, 37,  8],
	[ 10,  10, -60,  10, -10,  40,  8.97, 53, 10],
	[ 10, -60,  15,  10,  20,   5,  8.79, 47, 16],
	[ 20,  10,  10, -60,  10,  10,  8.51, 59,  4],
	[  0,  10,  30,   0,  10, -50,  8.13, 26,  1],
	[-10, -10,  50, -10, -10, -10,  8.13,  8, 55],
	[-10, -10, -10, -10, -10,  50,  8.13,  1, 62],
	[ 10, -10, -50,  10, -10,  50,  6.76, 37, 26],
	[  0,  40, -50,   0,  10,   0,  5.65, 18,  8],
	[ 10,   0,   0,  40,   0, -50,  5.65, 36,  1],
	[-10,  50, -10, -10, -15,  -5,  5.38, 16, 47],
	[-15, -10, -10,  50, -10,  -5,  5.25,  4, 59],
	[  0,  10,  10, -60,  10,  30,  5.19, 27,  4],
	[ 10, -60,  30,  10,   0,  10,  5.19, 45, 16],
	[-10,  50, -60, -10,  40, -10,  4.11, 18, 45],
	[ 30, -10, -10,  50, -10, -50,  4.07, 36, 27],
	[-10, -15, -10, -10,  50,  -5,  3.79,  2, 61],
	[ 50, -10, -10, -15, -10,  -5,  3.72, 32, 31],
	[ 10,  20,  15,  10, -60,   5,  3.65, 61,  2],
	[-60,  10,  10,  20,  10,  10,   3.6, 31, 32]
];

/**
 * @param {TrackerComponent} tracker
 */
export function PlannerComponent(tracker) {
	if (instantiated) {
		// Currently, only one instance is allowed since multiple browser tabs is a better way to compare strategies.
		throw new Error('A planner instance has already been created.');
	}
	instantiated = true;
	this.initialized = false;
	this.maxSuggestions = 5;
	this.tracker = tracker;

	/**
	 * Entered targets.
	 *
	 * @type {number[]}
	 */
	this.targets = [];

	/**
	 * Points required to reach the target.
	 *
	 * @type {number[]}
	 */
	this.points = [];

	/**
	 * Identifier for the entered targets to reuse suggestions if signs are unchanged.
	 *
	 * @type {number}
	 */
	this.suggestionsId = 0;

	/**
	 * Target input fields.
	 *
	 * @type {JSUtilObj}
	 */
	this.$inputs = null;

	/**
	 * Text fields presenting points required to reach the target.
	 *
	 * @type {JSUtilObj}
	 */
	this.$resultsIn = null;

	/**
	 * Text fields presenting the result after gaining the required points.
	 *
	 * @type {JSUtilObj}
	 */
	this.$resultsOut = null;

	/**
	 * Text field presenting the sum of required points.
	 *
	 * @type {JSUtilObj}
	 */
	this.$summaryIn = null;

	/**
	 * Text field presenting the sum of gained points.
	 *
	 * @type {JSUtilObj}
	 */
	this.$summaryOut = null;

	/**
	 * Text field presenting the efficiency of the entered combination.
	 *
	 * @type {JSUtilObj}
	 */
	this.$efficiency = null;

	/**
	 * Wrapper for the suggestions.
	 *
	 * @type {JSUtilObj}
	 */
	this.$suggestions = null;

	/**
	 * List of suggested combinations.
	 *
	 * @type {JSUtilObj}
	 */
	this.$suggestionsList = null;
}


PlannerComponent.prototype = {
	/**
	 * Setup properties and event handlers.
	 */
	init: function() {
		if (this.initialized) {
			throw new Error('The planner has already been initialized.');
		}
		this.initialized = true;
		this.loadSuggestion = this.loadSuggestion.bind(this);

		for (var syndicateIdx = 0, $syndEls = $('#planner .synd'); syndicateIdx < $syndEls.length; ++syndicateIdx) {
			$syndEls.getObj(syndicateIdx).data('synd-idx', syndicateIdx);
			this.targets.push(false);
		}

		this.$inputs = $('#planner .target');
		this.$resultsIn = $('#planner .results .in');
		this.$resultsOut = $('#planner .results .out');
		this.$summaryIn = $('#planner-summary .in');
		this.$summaryOut = $('#planner-summary .out');
		this.$efficiency = $('#planner-summary .efficiency');
		this.$multiply = $('#planner-multiply');
		this.$suggestions = $('#planner-suggestions');
		this.$suggestionsList = $('#planner-suggestions-list');
		$('#info-planner-icon').on('click', function() {
			toggleInfoBox('#info-planner');
		});
		this.$multiply.on('input|keyup', this.update.bind(this, true));
		$('#planner .target').on('input|keyup', this.setTargetValue.bind(this));
		$('#planner button.auto').on('click', this.setTargetAuto.bind(this));
		$('#planner button.down').on('click', this.decTarget.bind(this));
		$('#planner button.up').on('click', this.incTarget.bind(this));
		$('#planner-apply').on('click', this.updateTracker.bind(this));
	},

	/**
	 * Evaluate syndicate target input and update results.
	 *
	 * @param {KeyboardEvent} ev
	 */
	setTargetValue: function(ev) {
		var syndicateIdx = $(ev.currentTarget).getData('synd-idx', true),
			match;
		this.targets[syndicateIdx] = false;
		while (match = global.valueRegexp.exec(ev.currentTarget.value)) {
			this.targets[syndicateIdx] += Number(match[0]);
		}
		this.update();
	},

	/**
	 * Reset syndicate target and update results.
	 *
	 * @param {KeyboardEvent} ev
	 */
	setTargetAuto: function(ev) {
		var syndicateIdx = $(ev.currentTarget).getData('synd-idx', true);
		this.setTarget(syndicateIdx, false);
		this.update();
	},

	/**
	 * Decrement syndicate target and update results.
	 *
	 * @param {KeyboardEvent} ev
	 */
	decTarget: function(ev) {
		var syndicateIdx = $(ev.currentTarget).getData('synd-idx', true);
		this.setTarget(syndicateIdx, this.targets[syndicateIdx] - 10);
		this.update();
	},

	/**
	 * Increment syndicate target and update results.
	 *
	 * @param {KeyboardEvent} ev
	 */
	incTarget: function(ev) {
		var syndicateIdx = $(ev.currentTarget).getData('synd-idx', true);
		this.setTarget(syndicateIdx, this.targets[syndicateIdx] + 10);
		this.update();
	},

	/**
	 * Set syndicate target and update the corresponding input field value.
	 *
	 * @param {KeyboardEvent} ev
	 * @param {number} points
	 */
	setTarget: function(syndicateIdx, points) {
		this.targets[syndicateIdx] = points;
		this.$inputs[syndicateIdx].value = points === false ? '' : points;
	},

	/**
	 * Send results to the tracker component.
	 */
	updateTracker: function() {
		this.tracker.setStartValues(this.points);
	},

	/**
	 * Create bitfields with active bits where targets have the matching signs.
	 *
	 * @returns {Bitfields}
	 */
	getTargetBitfields: function() {
		var bitfields = {
			pos: 0,
			neg: 0,
			zero: 0
		};
		for (var idx = 0; idx < this.targets.length; ++idx) {
			var target = this.targets[idx];
			bitfields.pos <<= 1;
			bitfields.neg <<= 1;
			bitfields.zero <<= 1;
			if (target > 0) {
				++bitfields.pos;
			}
			else if (target < 0) {
				++bitfields.neg;
			}
			else if (target === 0) {
				++bitfields.zero;
			}
		}
		return bitfields;
	},

	/**
	 * Find the best suggestions satisfying the entered target.
	 *
	 * @param {Bitfields} targetBitfields
	 * @returns {number[]} List of indices in the presets table.
	 */
	getSuggestions: function(targetBitfields) {
		var suggestions = [];
		for (var presetIdx = 0; presetIdx < presets.length && suggestions.length < this.maxSuggestions; ++presetIdx) {
			var preset = presets[presetIdx],
				presetBitfieldPos = preset[7],
				presetBitfieldNeg = preset[8],
				numIdentical = 0;
			if (
				(presetBitfieldPos & targetBitfields.pos) === targetBitfields.pos // Positive targets match
				&& (presetBitfieldPos & targetBitfields.neg) === 0 // Negative targets have negative or neutral values
				&& ((presetBitfieldPos | presetBitfieldNeg) & targetBitfields.zero) === 0 // Strictly neutral targets have neutral values
			) {
				for (var colIdx = 0; colIdx < this.targets.length; ++colIdx) {
					if (preset[colIdx] === this.targets[colIdx]) {
						++numIdentical;
					}
				}
				if (numIdentical < this.targets.length) {
					// Skip suggestions that are identical to the current targets
					suggestions.push(presetIdx);
				}
			}
		}
		return suggestions;
	},

	/**
	 * Copy the values in the selected preset to the planner's input fields.
	 *
	 * @param {MouseEvent} ev
	 */
	loadSuggestion: function(ev) {
		var presetIdx = $(ev.currentTarget).data('preset-idx'),
			preset = presets[presetIdx];
		for (var syndicateIdx = 0; syndicateIdx < this.targets.length; ++syndicateIdx) {
			this.setTarget(syndicateIdx, preset[syndicateIdx]);
		}
		this.update(true);
	},

	/**
	 * Display suggestions satisfying the entered target.
	 */
	suggest: function() {
		var targetBitfields = this.getTargetBitfields(),
			numSuggestions = 0,
			suggestionId = (targetBitfields.pos << 12) | (targetBitfields.neg << 6) | targetBitfields.zero;
		if (this.suggestionsId === suggestionId) {
			return;
		}
		this.suggestionsId = suggestionId;
		this.$suggestionsList.html('');
		if (suggestionId) {
			var suggestions = this.getSuggestions(targetBitfields);
			numSuggestions = suggestions.length
			for (var suggestionIdx = 0; suggestionIdx < numSuggestions; ++suggestionIdx) {
				var presetIdx = suggestions[suggestionIdx],
					preset = presets[presetIdx],
					$suggestion = $.createElement('div', {'class': 'suggestion'})
						.addClass((suggestionIdx & 1) ? 'even' : 'odd')
						.data('preset-idx', presetIdx),
					suggestionHtml = '';
				for (var colIdx = 0; colIdx < this.targets.length; ++colIdx) {
					var colorClassTarget = preset[colIdx] < 0 ? 'neg' : 'pos';
					suggestionHtml += '<div class="column ' + colorClassTarget + '">' + (preset[colIdx] || '') + '</div>';
				}
				var colorClassEfficiency = 'color-lerp' + Math.min(9, Math.round(9 * preset[6] / 100));
				suggestionHtml += '<div class="column efficiency ' + colorClassEfficiency + '">' + preset[6] + '%</div>';
				$suggestion.append(suggestionHtml)
					.on('click', this.loadSuggestion)
					.appendTo(this.$suggestionsList);
			}
		}
		numSuggestions > 0
			? this.$suggestions.show()
			: this.$suggestions.hide();
	},

	/**
	 * Read entered target and calculate the points required to reach it.
	 *
	 * @param {boolean} skipSuggest Whether to search and display matching combinations.
	 */
	update: function(skipSuggest) {
		var points = $.fillArray(Array(this.targets.length), 0),
			results = points.slice(),
			numAutoTargets = 0,
			targetTotal = 0,
			inputTotal = 0,
			outputTotal = 0;
		for (var syndicateIdx = 0; syndicateIdx < points.length; ++syndicateIdx) {
			if (this.targets[syndicateIdx] !== false) {
				targetTotal += this.targets[syndicateIdx];
			}
			else {
				++numAutoTargets;
			}
		}
		if (numAutoTargets == points.length) {
			this.$resultsIn.text('');
			this.$resultsOut.text('');
		}
		else {
			var minPoints = 0,
				autoTarget = -targetTotal / numAutoTargets,
				multiplyVal = this.$multiply.val(),
				multiplier = multiplyVal === '' || isNaN(multiplyVal) ? 1 : Number(multiplyVal);
			for (var rowIdx = 0; rowIdx < matrix.length; ++rowIdx) {
				var row = matrix[rowIdx],
					target = this.targets[rowIdx] !== false ? this.targets[rowIdx] : autoTarget;
				for (var colIdx = 0; colIdx < row.length; ++colIdx) {
					points[colIdx] += row[colIdx] * target;
				}
			}
			for (var rowIdx = 0; rowIdx < matrix.length; ++rowIdx) {
				// Do this separately for consistent rounding
				minPoints = Math.min(minPoints, points[rowIdx]);
			}
			for (var syndicateIdx = 0; syndicateIdx < points.length; ++syndicateIdx) {
				points[syndicateIdx] = Math.round((points[syndicateIdx] - minPoints) * multiplier);
				syndicate.addPoints(results, points[syndicateIdx], syndicateIdx);
			}
			for (var syndicateIdx = 0; syndicateIdx < points.length; ++syndicateIdx) {
				this.$resultsIn.getObj(syndicateIdx)
					.text('in: ' + $.shortenNumber(points[syndicateIdx], 8))
					.attr('title', $.formatNumber(points[syndicateIdx]));
				if (results[syndicateIdx]) {
					var colorClass = results[syndicateIdx] ? (results[syndicateIdx] > 0 ? 'pos' : 'neg') : '',
						resultsHtml = '<span class="' + colorClass + '">'
							+ (results[syndicateIdx] > 0 ? '+' : '')
							+ $.shortenNumber(results[syndicateIdx], 8)
							+ '</span>';
					this.$resultsOut.getObj(syndicateIdx)
						.html('out: ' + resultsHtml)
						.attr('title', $.formatNumber(results[syndicateIdx]));
				}
				else {
					this.$resultsOut.getObj(syndicateIdx).text('out: 0').attr('title', '');
				}
				inputTotal += points[syndicateIdx];
				if (results[syndicateIdx] > 0) {
					outputTotal += results[syndicateIdx];
				}
			}
		}
		if (outputTotal) {
			this.$summaryIn.text('in: ' + $.shortenNumber(inputTotal, 7)).attr('title', $.formatNumber(inputTotal));
			this.$summaryOut.text('out: ' + $.shortenNumber(outputTotal, 7)).attr('title', $.formatNumber(outputTotal));
			this.$efficiency.text('efficiency: ' + $.round(66.667 * outputTotal / inputTotal, 2) + '%');
		}
		else {
			this.$summaryIn.text('\u200b').attr('title', '');
			this.$summaryOut.text('\u200b').attr('title', '');
			this.$efficiency.text('\u200b');
		}
		this.points = points;
		if (!skipSuggest) {
			this.suggest();
		}
	}
};
