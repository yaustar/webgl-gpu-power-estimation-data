const VB = require('./fetch-videocard-benchmark.js');
const fs = require('fs');
const path = require('path');
const {findGpuMatch} = require("./find-gpu-match")

console.log('Normalizing videocard benchmark data...');
VB.data = VB.normalizeData(require('../data/videocard-benchmark-gpus.json'));

const db = {};

function addEntry (name, performance) {
	db[name] = {
		name,
		performance: performance
	};
}

// Iterate over all videobenchmark data
for (const name in VB.data) {
	const vbDesc = VB.data[name];
	addEntry(name, vbDesc.passmark ? vbDesc.passmark : 0);
}

const dbKeys = Object.keys(db);

// Find the similarCard in the database and use that performance name
function addSimilarCardEntry (name, similarCardName) {
	const matches = findGpuMatch(similarCardName, dbKeys);

	// Use the first result if there is one
	if (matches.length > 0) {
		addEntry(name, db[matches[0]].performance);
	} else {
		console.error(`Cannot find matching similar card in database ${similarCardName} to use for card ${name}`);
		addEntry(name, 0);
	}
}

function addIosCardEntry (name, iosGeekBenchScore) {
	// Use the M1 GPU as a frame of reference
	const M1_GEEK_BENCH_SCORE = 18708;
	const M1_PASSMARK_SCORE = db['Apple M1'].performance;

	if (!M1_PASSMARK_SCORE) {
		console.error(`No M1 passmark score to use a frame of reference`);
		addEntry(name, 0);
		return;
	}

	addEntry(name, Math.round(iosGeekBenchScore * (M1_PASSMARK_SCORE / M1_GEEK_BENCH_SCORE)));
}

// Add missing entries that are common with our userbase
addSimilarCardEntry('Intel HD Graphics 400', 'Quadro FX 1500');
addSimilarCardEntry('Apple GPU (Apple GPU)', 'NVIDIA GeForce GTX 1050 Ti with Max-Q Design');
addSimilarCardEntry('Radeon R9 200', 'Radeon R9 255');
addSimilarCardEntry('Intel Radeong 0.4 on AMD Cape Verde', 'Radeon HD 7770');
addSimilarCardEntry('Radeon Pro 575', 'NVIDIA GeForce GTX 1050 Ti with Max-Q Design');
addSimilarCardEntry('AMD Renoir', 'Ryzen 5 PRO 4400GE with Radeon Graphics');
addSimilarCardEntry('Radeon R9 M390', 'Radeon R9 M390X');
addSimilarCardEntry('AMD FirePro D300', 'Radeon HD 6970');
addSimilarCardEntry('AMD FirePro D500', 'Radeon HD 7850');
addSimilarCardEntry('AMD FirePro D700', 'GeForce GTX 960');

// Add Apple videocard data based on the PC card closest to it on the Geekbench OpenCL and iOS data
// https://browser.geekbench.com/opencl-benchmarks
// https://browser.geekbench.com/ios-benchmarks
addSimilarCardEntry('Apple M1', 'NVIDIA GeForce GTX 1050 Ti with Max-Q Design');
addSimilarCardEntry('Apple M1 Pro', 'AMD Radeon Pro 5500 XT');
addSimilarCardEntry('Apple M1 Max', 'AMD Radeon RX 6650 XT');
addSimilarCardEntry('Apple M1 Ultra', 'NVIDIA GeForce RTX 2080 SUPER');

addSimilarCardEntry('Apple M2', 'GeForce GTX 1060');
addSimilarCardEntry('Apple M2 Pro', 'AMD Radeon RX 580');
addSimilarCardEntry('Apple M2 Max', 'AMD Radeon RX 6600 XT');
addSimilarCardEntry('Apple M2 Ultra', 'NVIDIA GeForce RTX 2080 SUPER');

addIosCardEntry('Apple A7 GPU',	400);
addIosCardEntry('Apple A8 GPU', 555);
addIosCardEntry('Apple A8X GPU', 778);
addIosCardEntry('Apple A9 GPU', 2791);
addIosCardEntry('Apple A9X GPU', 5546);
addIosCardEntry('Apple A10 GPU', 4183);
addIosCardEntry('Apple A10X GPU', 8417);
addIosCardEntry('Apple A11 GPU', 5263);
addIosCardEntry('Apple A12 GPU', 9254);
addIosCardEntry('Apple A12X GPU', 16574);
addIosCardEntry('Apple A12Z GPU', 18406);
addIosCardEntry('Apple A13 GPU', 13581);
addIosCardEntry('Apple A14 GPU', 15687);
addIosCardEntry('Apple A15 GPU', 19221);
addIosCardEntry('Apple A16 GPU', 22226);

addSimilarCardEntry('AMD Radeon Polaris', 'GeForce GTX 1050');
addSimilarCardEntry('AMD Radeon Pro 555x', 'AMD Radeon RX 550');
addSimilarCardEntry('AMD Radeon Pro wx3200', 'NVIDIA GeForce GT 1030');

// These don't exist yet, so we are just guessing to save some future proofing
addSimilarCardEntry('Apple M3', 'NVIDIA GeForce GTX 1070');
addSimilarCardEntry('Apple M3 Pro', 'NVIDIA GeForce GTX 1080');
addSimilarCardEntry('Apple M3 Max', 'NVIDIA GeForce RTX 2080');
addSimilarCardEntry('Apple M3 Ultra', 'NVIDIA GeForce RTX 3070');

addSimilarCardEntry('Apple M4', 'NVIDIA GeForce GTX 1080');
addSimilarCardEntry('Apple M4 Pro', 'NVIDIA GeForce RTX 2080');
addSimilarCardEntry('Apple M4 Max', 'NVIDIA GeForce RTX 3070');
addSimilarCardEntry('Apple M4 Ultra', 'NVIDIA GeForce RTX 3080');

addIosCardEntry('Apple A17 GPU', 25000);
addIosCardEntry('Apple A18 GPU', 30000);

console.log('Writing file...');
const jsonStr = JSON.stringify(db, null, 4);

let filePath;
filePath = path.join(__dirname, '../data/database.json');
fs.writeFileSync(filePath, jsonStr, { encoding: 'utf8' });
