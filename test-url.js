const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    try {
        const url = 'https://ko-kr.facebook.com/ads/library/?active_status=active&ad_type=all&country=KR&is_targeted_country=false&media_type=all&page_ids[0]=250311674989370&q=%EB%9D%BC%EB%84%A4%EC%A6%88&search_type=keyword_unordered&sort_data[direction]=desc&sort_data[mode]=total_impressions';
        await page.goto(url, { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 6000));

        console.log("Current URL:", page.url());

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
