const VB = require('./fetch-videocard-benchmark.js');
const { findMatch } = require('../umd/utils.js');
const fs = require('fs');
const path = require('path');

console.log('Normalizing videocard benchmark data...');
VB.data = VB.normalizeData(require('../data/videocard-benchmark-gpus.json'));

const result = {};

function getBaseObject (name) {
	return {
		name,
		performance: 0
	};
}

// Iterate over all videobenchmark data
for (const name in VB.data) {
	const dbObj = getBaseObject(name);
	let vbDesc = VB.data[name];

	dbObj.performance = vbDesc.passmark ? vbDesc.passmark : 0;

	result[name] = dbObj;
}

console.log('Writing file...');
const jsonStr = JSON.stringify(result, null, 4);

let filePath;
filePath = path.join(__dirname, '../data/database.json');
fs.writeFileSync(filePath, jsonStr, { encoding: 'utf8' });
