import { toggle as toggleInfoBox } from '../utils/info-box';
import * as global from '../vars/global';

var planner = null;

var matrix = [
		//SM, AH, CS, PS, RV
		[-3,  0,  1, -3,  2], // Steel Meridian
		[ 0, -4,  0, -2, -4], // Arbiters of Hexis
		[ 1,  0,  1,  1,  0], // Cephalon Suda
		[-3, -2,  1, -3,  0], // The Perrin Sequence
		[ 2, -4,  0,  0, -4]  // Red Veil
	],

	presets = [
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

export function PlannerComponent(tracker) {
	if (planner) {
		throw new Error('A planner instance has already been created.');
	}
	planner = this;
	this.tracker = tracker;
	this.$planner = $('#planner-wrap');
	this.targets = $.fillArray(Array(6), false);
	this.inputs = [];
	this.suggestionsId = 0;
	this.initialized = false;
}

PlannerComponent.prototype = {
	init: function() {
		if (this.initialized) {
			throw new Error('The planner has already been initialized.');
		}
		this.initialized = true;
		var self = this,
			$wrap = $.createElement('div', {'id': 'planner-wrap'}),
			$planner = $.createElement('div', {'id': 'planner', 'class': 'light-box border'}),
			$buttons = $.createElement('div', {'class': 'buttons'}),
			inputs = [],
			suggestionIcons = '';
		$wrap.append('<h1>'
				+ 'Planning\u00a0'
				+ '<div class="icon info-icon" id="info-planner-icon"></div>'
				+ '</h1>'
				+ '<div class="info-box" id="info-planner" style="display:none"><div class="light-box border">'
				+ '<p>Calculate how many points you need to gain with each syndicate in order to reach a given distribution of reputation'
				+ ' by entering the desired targets in the input field or using the controls.'
				+ ' Expressions with addition and subtraction are allowed in the input fields.</p>'
				+ '<p>The multiplier field at the bottom accepts any real number and multiplies the results by that value.</p>'
				+ '<p>The Apply button copies the points required to the bottom fields in the tracking section.</p>'
				+ '</div></div>')
			.append($planner);
		$('#info-planner-icon', $wrap).on('click', function() {
			toggleInfoBox('#info-planner');
		});
		for (var syndicateIdx = 0; syndicateIdx < this.targets.length; ++syndicateIdx) {
			var $synd = $.createElement('div', {'class': 'synd ' + global.syndicateNames[syndicateIdx][0]})
					.data('synd-idx', syndicateIdx)
					.html('<div class="icon logo small"></div>')
					.appendTo($planner),
				$inputWrap = $.createElement('div', {'class': 'values'})
					.appendTo($synd);
			this.inputs.push($.createElement('input', {
				'type': 'text',
				'class': 'target',
				'placeholder': 'Target rep',
				'tabindex': 2
			}).appendTo($inputWrap)[0]);
			$synd.append('<div class="controls">'
				+ '<button class="auto" title="Auto">\u21bb</button>'
				+ '<button class="down" title="Decrease">-</button>'
				+ '<button class="up" title="Increase">+</button>'
				+ '</div>'
				+ '<div class="results nobr">'
				+	'<div class="in">\u200b</div>'
				+	'<div class="out">\u200b</div>'
				+ '</div>');
			suggestionIcons += '<div class="target ' + global.syndicateNames[syndicateIdx][0] + '"><div class="icon logo tiny"></div></div>';
		}
		suggestionIcons += '<div class="efficiency"></div>';
		$planner.append('<div id="summary" class="nobr">'
			+ '<div class="in">\u200b</div>'
			+ '<div class="out">\u200b</div>'
			+ '<div class="efficiency">\u200b</div>'
			+ '</div>');
		this.$multiply = $.createElement('input', {
			'type': 'text',
			'class': 'multiply',
			'placeholder': 'Multiply',
			'tabindex': 3
		}).on('input|keyup', function() {
			self.update(true);
		}).appendTo($planner);
		$planner.append($buttons);
		$.createElement('button', {'tabindex': 4}).text('Apply').appendTo($buttons).on('click', function() {
			self.tracker.setStartValues(self.points);
		});
		this.$resultsIn = $('.results .in', $planner);
		this.$resultsOut = $('.results .out', $planner);
		this.$summaryIn = $('#summary .in',  $planner);
		this.$summaryOut = $('#summary .out',  $planner);
		this.$efficiency = $('#summary .efficiency', $planner);
		$('.target', $planner).on('input|keyup', function(ev) {
			var syndicateIdx = $(ev.currentTarget).getData('synd-idx', true),
				match;
			self.targets[syndicateIdx] = false;
			while (match = global.valueRegexp.exec(ev.currentTarget.value)) {
				self.targets[syndicateIdx] += Number(match[0]);
			}
			self.update();
		});
		$('button.auto', $planner).on('click', function(ev) {
			var syndicateIdx = $(ev.currentTarget).getData('synd-idx', true);
			self.targets[syndicateIdx] = false;
			self.inputs[syndicateIdx].value = '';
			self.update();
		});
		$('button.up, button.down', $planner).on('click', function(ev) {
			var syndicateIdx = $(ev.currentTarget).getData('synd-idx', true);
			self.targets[syndicateIdx] += ev.currentTarget.className == 'up' ? 10 : -10;
			self.inputs[syndicateIdx].value = self.targets[syndicateIdx];
			self.update();
		});
		this.$suggestions = $.createElement('div', {'id': 'suggestions'});
		this.$suggestionsWrap = $.createElement('div', {'id': 'suggestions-wrap', 'class': 'dark-box border'})
			.append('<h2>Suggestions</h2><div id="suggestion-icons">' + suggestionIcons + '</div>')
			.append(this.$suggestions)
			.hide()
			.appendTo($planner);
		$('#page').append($wrap);
	},

	suggest: function() {
		var self = this,
			bitfield = 0,
			bitfieldNeg = 0,
			bitfieldZero = 0,
			numSuggestions = 0;
		for (var idx = 0; idx < this.targets.length; ++idx) {
			var target = this.targets[idx];
			bitfield <<= 1;
			bitfieldNeg <<= 1;
			bitfieldZero <<= 1;
			if (target > 0) {
				++bitfield;
			}
			else if (target < 0) {
				++bitfieldNeg;
			}
			else if (target === 0) {
				++bitfieldZero;
			}
		}
		var suggestionId = (bitfield << 12) | (bitfieldNeg << 6) | bitfieldZero;
		if (this.suggestionsId == suggestionId) {
			return;
		}
		this.suggestionsId = suggestionId;
		this.$suggestions.html('');
		if (suggestionId) {
			for (var presetIdx = 0; presetIdx < presets.length; ++presetIdx) {
				var preset = presets[presetIdx],
					pBitfield = preset[7],
					pBitfieldNeg = preset[8],
					numIdentical = 0,
					suggestionHtml = '';
				if ((pBitfield & bitfield) != bitfield || (pBitfield & bitfieldNeg) || (pBitfield | pBitfieldNeg) & bitfieldZero) {
					continue;
				}
				var $suggestion = $.createElement('div', {'class': 'suggestion'})
					.addClass((numSuggestions & 1) ? 'odd' : 'even')
					.data('preset-idx', presetIdx);
				for (var colIdx = 0; colIdx < this.targets.length; ++colIdx) {
					var colorClass = preset[colIdx] < 0 ? 'neg' : 'pos';
					suggestionHtml += '<div class="target ' + colorClass + '">' + (preset[colIdx] || '') + '</div>';
					if (preset[colIdx] === this.targets[colIdx]) {
						++numIdentical;
					}
				}
				if (numIdentical == 6) {
					continue;
				}
				var colorClass = 'color-lerp' + Math.min(9, Math.round(9 * preset[6] / 100));
				suggestionHtml += '<div class="efficiency ' + colorClass + '">' + preset[6] + '%</div>';
				$suggestion.append(suggestionHtml)
					.on('click', function(ev) {
						var presetIdx = $(ev.currentTarget).data('preset-idx'),
							preset = presets[presetIdx];
						for (var syndicateIdx = 0; syndicateIdx < self.targets.length; ++syndicateIdx) {
							self.inputs[syndicateIdx].value = self.targets[syndicateIdx] = preset[syndicateIdx];
						}
						self.update(true);
					})
					.appendTo(this.$suggestions);
				if (++numSuggestions >= 5) {
					break;
				}
			}
		}
		if (numSuggestions > 0) {
			this.$suggestionsWrap.show();
		}
		else {
			this.$suggestionsWrap.hide();
		}
	},
	
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
				this.tracker.addPoints(results, points[syndicateIdx], syndicateIdx);
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
