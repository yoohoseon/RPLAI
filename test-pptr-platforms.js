const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    try {
        const url = 'https://ko-kr.facebook.com/ads/library/?active_status=active&ad_type=all&country=KR&is_targeted_country=false&media_type=all&page_ids[0]=250311674989370&q=%EB%9D%BC%EB%84%A4%EC%A6%88&search_type=keyword_unordered';
        await page.goto(url, { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 6000));

        const platformData = await page.evaluate(() => {
            const results = [];
            const headerElements = Array.from(document.querySelectorAll('span, div, p'))
                .filter(el => {
                    const t = (el).innerText || '';
                    return t.includes('라이브러리 ID:') && t.length < 50;
                });

            headerElements.forEach(el => {
                let parent = el.parentElement;
                while (parent && parent.tagName !== 'BODY') {
                    const text = parent.innerText || '';
                    if (text.includes('상세 정보 보기') || text.includes('어바웃')) {
                        // try to find the platform icons
                        // usually there's a tooltip or aria-label
                        const platforms = Array.from(parent.querySelectorAll('[aria-label]'))
                            .filter(n => n.getAttribute('aria-label'))
                            .map(n => n.getAttribute('aria-label'));

                        // also look for SVG paths or masks if aria-label is missing
                        const svgs = parent.innerHTML.match(/facebook|instagram|messenger|audience network/gi);

                        results.push({
                            id: text.match(/라이브러리 ID:\s*(\d+)/)[1],
                            ariaLabels: platforms,
                            svgMatches: svgs ? [...new Set(svgs.map(s => s.toLowerCase()))] : []
                        });
                        break;
                    }
                    parent = parent.parentElement;
                }
            });
            return results;
        });

        console.log(JSON.stringify(platformData, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
})();
