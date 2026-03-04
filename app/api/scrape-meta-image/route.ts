import { NextResponse } from 'next/server';
import puppeteer, { Browser } from 'puppeteer';

// Global browser instance to reuse across API calls (saves massive overhead)
let globalBrowser: Browser | null = null;
let activeRequests = 0;
let browserTimer: NodeJS.Timeout | null = null;

async function getBrowser() {
    if (!globalBrowser) {
        globalBrowser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
        });
    }
    activeRequests++;
    if (browserTimer) clearTimeout(browserTimer);
    return globalBrowser;
}

function releaseBrowser() {
    activeRequests--;
    if (activeRequests <= 0) {
        activeRequests = 0;
        // Close browser after 15 seconds of inactivity to save memory
        if (browserTimer) clearTimeout(browserTimer);
        browserTimer = setTimeout(async () => {
            if (activeRequests === 0 && globalBrowser) {
                await globalBrowser.close();
                globalBrowser = null;
            }
        }, 15000);
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) return NextResponse.json({ error: 'url is required' }, { status: 400 });

    try {
        const browser = await getBrowser();
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        // Go to the meta ad link and wait for the React app to initialize and fetch data
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => { });

        // Let's add an explicit small wait to ensure React renders the images after data fetch
        await new Promise(r => setTimeout(r, 2000));

        // Evaluate in browser context to find the largest image or poster
        const imgUrl = await page.evaluate(() => {
            // First check for video posters
            const video = document.querySelector('video');
            if (video && video.poster && video.poster.includes('scontent')) {
                return video.poster;
            }

            const imgs = document.querySelectorAll('img');
            let bestSrc = '';
            let maxArea = 0;

            for (let i = 0; i < imgs.length; i++) {
                const img = imgs[i];
                const area = img.width * img.height || (img.naturalWidth * img.naturalHeight) || 0;
                // Ignore small icons, profile pics (usually < 100x100)
                if (area > 10000 && img.src && img.src.includes('scontent') && img.src.startsWith('http')) {
                    if (area > maxArea) {
                        maxArea = area;
                        bestSrc = img.src;
                    }
                }
            }

            // If still no large image, just grab the first scontent image
            if (!bestSrc) {
                for (let i = 0; i < imgs.length; i++) {
                    if (imgs[i].src && imgs[i].src.includes('scontent')) {
                        return imgs[i].src;
                    }
                }
            }

            return bestSrc || null;
        });

        await page.close();
        releaseBrowser();

        if (imgUrl) {
            return NextResponse.json({ url: imgUrl });
        } else {
            return NextResponse.json({ error: 'No image found', url: null }, { status: 404 });
        }
    } catch (e: any) {
        console.error('Puppeteer error:', e);
        releaseBrowser();
        return NextResponse.json({ error: e.message, url: null }, { status: 500 });
    }
}
