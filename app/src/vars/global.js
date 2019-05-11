var relations = [
		[4, 5, 3],
		[2, 3, 4],
		[1, 4, 5],
		[5, 1, 0],
		[0, 2, 1],
		[3, 0, 2]
	],

	syndicateNames = [
		['steel',  'Steel Meridian'],
		['hexis',  'Arbiters of Hexis'],
		['suda',   'Cephalon Suda'],
		['perrin', 'The Perrin Sequence'],
		['veil',   'Red Veil'],
		['loka',   'New Loka']
	],

	rankNames = [
		['Enemy', 'Outcast', 'Neutral', 'Brave', 'Valiant', 'Defender', 'Protector', 'General'],
		['Fraud', 'Deceiver', 'Neutral', 'Principled', 'Authentic', 'Lawful', 'Crusader', 'Maxim'],
		['Waste', 'Debris', 'Neutral', 'Competent', 'Intriguing', 'Intelligent', 'Wise', 'Genius'],
		['Write-Off', 'Liability', 'Neutral', 'Associate', 'Senior Associate', 'Executive', 'Senior Executive', 'Partner'],
		['Corrupt', 'Suspect', 'Neutral', 'Respected', 'Honored', 'Esteemed', 'Revered', 'Exalted'],
		['Exiled', 'Condemned', 'Neutral', 'Humane', 'Bountiful', 'Benevolent', 'Pure', 'Flawless']
	],

	levelsNeg = [-5000, -22000, -44000],
	levelsPos = [ 5000,  22000,  44000,  70000,  99000,  132000],
	levelsNegCumulative = 0,
	levelsPosCumulative = 0,
	minRep = 0,
	maxRep = 0,
	valueRegexp = new RegExp('-?\\d+', 'g');

levelsNegCumulative = levelsNeg.slice();
levelsPosCumulative = levelsPos.slice();
for (var rankIdx = 1; rankIdx < levelsNeg.length; ++rankIdx) {
	levelsNegCumulative[rankIdx] += levelsNegCumulative[rankIdx - 1];
}
for (var rankIdx = 1; rankIdx < levelsPos.length; ++rankIdx) {
	levelsPosCumulative[rankIdx] += levelsPosCumulative[rankIdx - 1];
}
minRep = levelsNegCumulative.pop();
maxRep = levelsPosCumulative.pop();

export {
	relations,
	syndicateNames,
	rankNames,
	levelsNeg,
	levelsPos,
	levelsNegCumulative,
	levelsPosCumulative,
	minRep,
	maxRep,
	valueRegexp
};
