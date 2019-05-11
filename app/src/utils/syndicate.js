import * as global from '../vars/global';

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
