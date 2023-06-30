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

	await browser.close();

	return formattedGfxCardData;
}

function normalizeData(data) {

    const result = {};

    for (const name in data) {

        const {

            g3dPerf,
            g2dPerf,
            type,

        } = data[name];

        result[name] =
            {
                name,
                passmark: parseFloat(g3dPerf),
                passmark2d: parseFloat(g2dPerf),

                type
            };

    }

    return result;

}

module.exports = { fetchData, normalizeData };
