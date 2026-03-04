import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const qs = searchParams.get('q');

    if (!qs) {
        return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // 최대 3개의 쿼리 파싱 (ex: 'query1,query2')
    const queries = qs.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3);
    console.log(`[Pinterest API] Starting Puppeteer for queries: ${queries.join(', ')}`);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const allImages: string[] = [];

        for (const query of queries) {
            console.log(`[Pinterest API] Scraping query: ${query}`);
            const page = await browser.newPage();

            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (['font', 'stylesheet'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            await page.setViewport({ width: 1280, height: 800 });
            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;

            try {
                await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

                // 스크롤 회수를 5번에서 8번으로 눌러서 더 깊게 이미지를 가져옵니다
                await page.evaluate(async () => {
                    await new Promise<void>((resolve) => {
                        let totalHeight = 0;
                        let distance = 400; // 스크롤 길이 증가
                        let scrolls = 0;
                        const timer = setInterval(() => {
                            window.scrollBy(0, distance);
                            totalHeight += distance;
                            scrolls++;
                            if (scrolls >= 8) {
                                clearInterval(timer);
                                resolve();
                            }
                        }, 400); // 0.4초 간격
                    });
                });

                await new Promise(res => setTimeout(res, 1200));

                const imageUrls = await page.evaluate(() => {
                    const imgs = Array.from(document.querySelectorAll('img'));
                    const urls: string[] = [];
                    for (const img of imgs) {
                        const src = img.src || img.getAttribute('src');
                        if (src && src.includes('pinimg.com')) {
                            let hqSrc = src;
                            if (hqSrc.includes('/236x/')) {
                                hqSrc = hqSrc.replace('/236x/', '/736x/');
                            } else if (hqSrc.includes('/474x/')) {
                                hqSrc = hqSrc.replace('/474x/', '/736x/');
                            }
                            urls.push(hqSrc);
                        }
                    }
                    return urls;
                });

                console.log(`[Pinterest API] Found ${imageUrls.length} images for query: ${query}`);
                allImages.push(...imageUrls);
            } catch (err) {
                console.error(`[Pinterest API] Error scraping ${query}:`, err);
            } finally {
                await page.close();
            }
        }

        // 중복 제거 후 랜덤하게 혹은 순서대로 섞기
        const uniqueImages = Array.from(new Set(allImages));
        // 가볍게 배열 섞기(셔플) যাতে 다양한 키워드 이미지가 고루 섞임
        for (let i = uniqueImages.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [uniqueImages[i], uniqueImages[j]] = [uniqueImages[j], uniqueImages[i]];
        }

        console.log(`[Pinterest API] Total UNIQUE images found: ${uniqueImages.length}`);
        await browser.close();

        return NextResponse.json({ success: true, count: uniqueImages.length, images: uniqueImages });
    } catch (error: any) {
        if (browser) await browser.close();
        console.error('[Pinterest API] Crawling error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
