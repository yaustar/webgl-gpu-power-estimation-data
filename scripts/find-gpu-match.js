const { findMatch } = require('../umd/utils.js');

function findGpuMatch (name, dbKeys) {
	let result = findMatch(name, dbKeys);
	const matches = result.score >= 0.75 ? result.matches : [];
	return matches;
}

module.exports = { findGpuMatch };

