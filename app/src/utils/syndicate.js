import * as global from '../vars/global';

/**
 * Add points to the specified element in a provided array of numbers
 *
 * @param {number[]} destination Points array to modify
 * @param {number} points Points to add
 * @param {number} syndicateIdx Array index
 */
export function addPoints(destination, points, syndicateIdx) {
	points = Math.round(points);
	var relations = global.relations[syndicateIdx],
		halfPoints = $.roundFromZero(points / 2);
	destination[syndicateIdx] += points;
	destination[relations[0]] += halfPoints;
	destination[relations[1]] -= halfPoints;
	destination[relations[2]] -= points;
}

export function getRankIdx(pointsIn) {
	var rankIdx = 0;
	if (pointsIn >= global.maxRep) {
		rankIdx = global.levelsPos.length - 1;
	}
	else if (pointsIn <= global.minRep) {
		rankIdx = -(global.levelsNeg.length - 1);
	}
	else if (pointsIn < 0) {
		while (rankIdx < global.levelsNegCumulative.length && global.levelsNegCumulative[rankIdx] >= pointsIn) {
			++rankIdx;
		}
		rankIdx = -rankIdx;
	}
	else if (pointsIn > 0) {
		while (rankIdx < global.levelsPosCumulative.length && global.levelsPosCumulative[rankIdx] <= pointsIn) {
			++rankIdx;
		}
	}
	return rankIdx;
}

export function getRankPoints(pointsIn) {
	var rankIdx = getRankIdx(pointsIn),
		levelPoints = rankIdx ? (rankIdx < 0 ? global.levelsNegCumulative[-rankIdx - 1] : global.levelsPosCumulative[rankIdx - 1]) : 0;
	return pointsIn - levelPoints;
}
