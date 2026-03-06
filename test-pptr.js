const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    try {
        await page.goto('https://ko-kr.facebook.com/ads/library/?active_status=active&ad_type=all&country=KR&is_targeted_country=false&media_type=all&page_ids[0]=250311674989370&search_type=page', { waitUntil: 'networkidle2' });

        // Wait for ads to load
        await page.waitForSelector('div.xh8yej3', { timeout: 10000 }).catch(() => console.log('Timeout waiting for ads'));

        const ads = await page.evaluate(() => {
            // Find all ad containers
            // We need a good selector. The structure changes frequently.
            const adNodes = document.querySelectorAll('div.xh8yej3'); // This is a generic class, let's look for something more specific or generic to ads list
            return Array.from(document.querySelectorAll('div.x1y1aw1k.xwib8y2.x1n2onr6')).slice(0, 10).map(el => el.innerText);
        });

        console.log(ads);
    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
})();
