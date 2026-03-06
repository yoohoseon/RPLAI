const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    try {
        await page.goto('https://ko-kr.facebook.com/ads/library/?active_status=active&ad_type=all&country=KR&is_targeted_country=false&media_type=all&page_ids[0]=250311674989370&search_type=page', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 6000));

        const fs = require('fs');
        const text = await page.evaluate(() => document.body.innerText);
        fs.writeFileSync('page-text.txt', text);
        console.log(`Saved page text, length: ${text.length}`);
    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
})();
