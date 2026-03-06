const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    try {
        await page.goto('https://ko-kr.facebook.com/ads/library/?active_status=active&ad_type=all&country=KR&is_targeted_country=false&media_type=all&page_ids[0]=250311674989370&search_type=page', { waitUntil: 'networkidle2' });

        await new Promise(r => setTimeout(r, 8000)); // wait for 8 sec

        const html = await page.content();
        fs.writeFileSync('ads.html', html);

        console.log("Saved ads.html");
    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
})();
