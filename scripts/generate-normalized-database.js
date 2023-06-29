const VB = require('./fetch-videocard-benchmark.js');
const { findMatch } = require('../umd/utils.js');
const fs = require('fs');
const path = require('path');

console.log('Normalizing videocard benchmark data...');
VB.data = VB.normalizeData(require('../data/videocard-benchmark-gpus.json'));

const result = {};

function addEntry (name, performance) {
	result[name] = {
		name,
		performance: performance
	};
}

// Iterate over all videobenchmark data
for (const name in VB.data) {
	const vbDesc = VB.data[name];
	addEntry(name, vbDesc.passmark ? vbDesc.passmark : 0);
}

// Add Apple videocard data that is based benchmarks relative to other cards on Passmark
addEntry('Apple M1', 1000);
// Apple M1, Apple M1 Pro, Apple M1 Max, Apple M1 Ultra
// Apple M2, Apple M2 Pro, Apple M2 Max, Apple M2 Ultra
// Apple M3, Apple M3 Pro, Apple M3 Max, Apple M3 Ultra
// Apple M4, Apple M4 Pro, Apple M4 Max, Apple M4 Ultra
// Apple A7 GPU, Apple A8 GPU, Apple A8X GPU, Apple A9 GPU, Apple A9X GPU, Apple A10 GPU, Apple A10X GPU, Apple A11 GPU, Apple A12 GPU, Apple A12X GPU, Apple A13 GPU, Apple A14 GPU, Apple A15 GPU, Apple A16 GPU, Apple A17 GPU, Apple A18 GPU

console.log('Writing file...');
const jsonStr = JSON.stringify(result, null, 4);

let filePath;
filePath = path.join(__dirname, '../data/database.json');
fs.writeFileSync(filePath, jsonStr, { encoding: 'utf8' });
