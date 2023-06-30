const database = require('../data/database.json');
const fs = require('fs');
const path = require('path');
const { findGpuMatch } = require("./find-gpu-match");

const gpus = fs.readFileSync(path.join(__dirname, '../data/sample-unmasked-renderer-data.txt'), 'utf8').trim().split(/\n/g).map(g => g.trim());

const dbKeys = Object.keys(database);
gpus.forEach(name => {
	const matches = findGpuMatch(name, dbKeys);
    console.log(name, ' : ', matches.join(', '));
});
