const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    let interceptedAds = [];

    page.on('response', async (response) => {
        const url = response.url();
        // Facebook's ad library uses graphql endpoint to fetch ads
        if (url.includes('graphql') || url.includes('api/graphql')) {
            try {
                const text = await response.text();
                if (text.includes('ad_archive_id') || text.includes('collated_results')) {
                    // Try parsing
                    const lines = text.split('\n');
                    for (const line of lines) {
                        try {
                            const data = JSON.parse(line);
                            if (data.data && data.data.page && data.data.page.ad_library) {
                                interceptedAds.push(data.data.page.ad_library);
                            } else if (data.data && data.data.ad_library_main) {
                                interceptedAds.push(data.data.ad_library_main);
                            }
                        } catch (e) { }
                    }
                    console.log(`Found GraphQL response with ads data (${text.length} bytes)`);
                }
            } catch (err) { }
        }
    });

    try {
        await page.goto('https://ko-kr.facebook.com/ads/library/?active_status=active&ad_type=all&country=KR&is_targeted_country=false&media_type=all&page_ids[0]=250311674989370&search_type=page', { waitUntil: 'networkidle2' });

        await new Promise(r => setTimeout(r, 8000));

        const fs = require('fs');
        fs.writeFileSync('ads.json', JSON.stringify(interceptedAds, null, 2));
        console.log(`Saved ${interceptedAds.length} graphql payloads to ads.json`);

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
})();
