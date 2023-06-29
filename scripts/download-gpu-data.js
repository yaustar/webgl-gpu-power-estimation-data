const VB = require('./fetch-videocard-benchmark.js');
const fs = require('fs');
const path = require('path');

(async() => {
    {
        console.log('Fetching videocardbenchmark.com data...');
        const data = await VB.fetchData();

        const filePath = path.join(__dirname, '../data/videocard-benchmark-gpus.json');
        const jsonStr = JSON.stringify(data, null, 4);
        fs.writeFileSync(filePath, jsonStr, { encoding: 'utf8' });
    }
})();
