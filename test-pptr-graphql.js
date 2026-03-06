const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    let payloads = [];

    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('/api/graphql/')) {
            try {
                const text = await response.text();
                payloads.push(text);
            } catch (err) { }
        }
    });

    try {
        await page.goto('https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=KR&is_targeted_country=false&media_type=all&page_ids[0]=250311674989370&search_type=page', { waitUntil: 'networkidle2' });

        await new Promise(r => setTimeout(r, 8000));

        fs.writeFileSync('graphql_payloads.json', JSON.stringify(payloads, null, 2));
        console.log(`Saved ${payloads.length} graphql payloads`);

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
})();
