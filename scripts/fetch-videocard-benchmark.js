const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const math = require('mathjs');
const puppeteer = require('puppeteer');
const {number} = require("mathjs/lib/utils")

async function wait(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

async function fetchData() {
    // load the gpu power table from https://www.videocardbenchmark.net/ and
    // write the dta out into json blobs.

	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();

	let gfxCardData = null;

	// Listen for the request to get the card data JSON text
	page.on('response', async(response) => {
		const request = response.request();
		if (request.url().includes('https://www.videocardbenchmark.net/data/')){
			const text = await response.text();
			gfxCardData = JSON.parse(text).data;
		}
	});

	await page.goto('https://www.videocardbenchmark.net/GPU_mega_page.html', { waitUntil: 'networkidle2' });

	const timeStartedRequest = performance.now();

	// Wait until we've parsed the site gfx card json
	while (gfxCardData === null) {
		await wait(1);

		if (performance.now() - timeStartedRequest > 30000) {
			console.error('Cannot get graphics card data from Video Card Benchmark');
		}
	}

	const formattedGfxCardData = {};

	const parseNumber = function(x) {
		const parsed = parseInt(x);
		if (isNaN(parsed)) { return 0; }
		return parsed;
	}

	for (const gfx of gfxCardData) {
		formattedGfxCardData[gfx.name] = {
			name: gfx.name,
			g3dPerf: parseNumber(gfx.g3d.replace(',', '')),
			g2dPerf: parseNumber(gfx.g2d.replace(',', '')),
			tdp: parseNumber(gfx.tdp.replace(',', '')),
			type: gfx.cat,
			testDate: gfx.date,
			busInterface: gfx.bus,
			memory: gfx.memSize,
			clock: gfx.coreClk,
			memoryClock: gfx.memClk
		}
	}

	browser.close();

	return formattedGfxCardData;
}

function normalizeData(data) {

    const result = {};

    for (const name in data) {

        const {

            g3dPerf,
            g2dPerf,
            tdp,
            type,

            memory,
            clock,
            memoryClock,

        } = data[name];

        // Memory string can be shaped like "256 MB"
        // Math.js uses `MiB` to do power of 2 megabyte conversions
        const cleanedMemory = memory.replace(/,/g, '').replace(/([A-Z])B/g, (match, scale) => `${ scale }iB`);

        // Parse the numeric values
        const parsedTdp = tdp === 'NA' ? null : parseFloat(tdp);
        const parsedMemory = memory === 'NA' ? null : math.unit(cleanedMemory).toNumber('MiB');
        const cleanClock = clock.replace(/,/g, '');
        let parsedClock;

        // If the clock values have a space, dash or slash between them then
        // convert to an average of the two numbers
        const re = /(\d+)[\s-/]+(\d+)/;
        if (re.test(cleanClock)) {

            const unit = cleanClock.replace(re, '').trim();
            const matches = re.exec(cleanClock);
            const val = (parseFloat(matches[1]) + parseFloat(matches[2])) / 2;
            parsedClock = math.unit(val, unit).toNumber('MHz');

        } else {

            try {
                parsedClock = cleanClock === 'NA' ? null : math.unit(cleanClock.replace('Mhz', '')).toNumber('MHz');
            } catch (e) {
                console.error(e);
                console.error(`${ name }, ${ cleanClock }`);
                console.error('');
                parsedClock = null;
            }
        }

        const cleanMemoryClock = memoryClock.replace(/,/g, '');
        let parsedMemoryClock;
        if (re.test(cleanMemoryClock)) {

            const unit = cleanMemoryClock.replace(re, '').trim();
            const matches = re.exec(cleanMemoryClock);
            const val = (parseFloat(matches[1]) + parseFloat(matches[2])) / 2;
            parsedMemoryClock = math.unit(val, unit).toNumber('MHz');

        } else {

            try {
                parsedMemoryClock = cleanMemoryClock === 'NA' ? null : math.unit(cleanMemoryClock.replace(/,/g, '').replace(/\([^)]+\)/, '')).toNumber('MHz');
            } catch (e) {
                console.warn(`Cannot parse ${ name }, ${ cleanMemoryClock }`);
                parsedMemoryClock = null;
            }
        }

        result[name] =
            {

                name,
                passmark: parseFloat(g3dPerf),
                passmark2d: parseFloat(g2dPerf),

                type,
                tdp: parsedTdp,
                memory: parsedMemory,
                clock: parsedClock,
                memoryClock: parsedMemoryClock,

            };

    }

    return result;

}

module.exports = { fetchData, normalizeData };
