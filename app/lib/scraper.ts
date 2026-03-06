"use server";

import puppeteer from "puppeteer";

export async function scrapeMetaAds(pageId: string, keyword: string = "") {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // 검색어(keyword) 여부에 따라 URL 분기
        let url = `https://ko-kr.facebook.com/ads/library/?active_status=active&ad_type=all&country=KR&is_targeted_country=false&media_type=all`;

        if (pageId && keyword) {
            url += `&page_ids[0]=${pageId}&q=${encodeURIComponent(keyword)}&search_type=keyword_unordered`;
        } else if (pageId && !keyword) {
            url += `&page_ids[0]=${pageId}&search_type=page`;
        } else if (!pageId && keyword) {
            url += `&q=${encodeURIComponent(keyword)}&search_type=keyword_unordered`;
        }

        console.log("[크롤링 시작] ", url);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // 광고 데이터가 로딩될 때까지 잠시 대기
        await new Promise(r => setTimeout(r, 5000));

        // 여러 번 아래로 스크롤해서 데이터를 채움 (페이징 무식하게 긁기)
        for (let i = 0; i < 5; i++) {
            await page.evaluate(() => window.scrollBy(0, 3000));
            await new Promise(r => setTimeout(r, 2000));
        }

        const adsData = await page.evaluate(() => {
            // "라이브러리 ID" 텍스트를 포함하는 작은 텍스트 노드를 찾아 광고 카드의 시작점으로 삼습니다.
            const headerElements = Array.from(document.querySelectorAll('span, div, p'))
                .filter(el => {
                    const t = (el as HTMLElement).innerText || '';
                    return t.includes('라이브러리 ID:') && t.length < 50; // 보통 "라이브러리 ID: 1234" 형태 
                });

            const results: { id: string, img: string, video: string, profile: string, platforms: string[], text: string }[] = [];
            const seenIds = new Set<string>();

            headerElements.forEach(el => {
                let parent: HTMLElement | null = el.parentElement;
                // 상위로 올라가면서 전체 카드를 감싸는 부모를 찾습니다.
                while (parent && parent.tagName !== 'BODY') {
                    const text = parent.innerText || '';
                    // 카드의 풋터 "광고 상세 정보 보기" 또는 "상세 정보 보기"가 포함된 노드를 카드 껍데기로 간주합니다.
                    if (text.includes('상세 정보 보기') || text.includes('어바웃')) {

                        // 1. 카드의 고유 라이브러리 ID 추출 (중복 방지)
                        const idMatch = text.match(/라이브러리 ID:\s*(\d+)/);
                        const libraryId = idMatch ? idMatch[1] : null;

                        if (libraryId && !seenIds.has(libraryId)) {
                            seenIds.add(libraryId);

                            // 2. 동영상 영상 src 긁어오기
                            const videoEl = parent.querySelector('video');
                            const videoUrl = videoEl && videoEl.src ? videoEl.src : '';

                            // 3. 본문 썸네일/이미지 긁어오기 (프로필 등 작은 이미지인 60x60, 40x40 등 제외)
                            const allImgs = Array.from(parent.querySelectorAll('img')).filter(img => img.src);

                            const contentImgs = allImgs.filter(img => !img.src.includes('60x60') && !img.src.includes('40x40') && !img.src.includes('16x16'));
                            const mainImgUrl = contentImgs.length > 0 ? contentImgs[contentImgs.length - 1].src : ''; // 맨 마지막 이미지가 보통 메인 크리에이티브

                            // 4. 프로필 로고 긁어오기 (작은 이미지)
                            const profileImg = allImgs.find(img => img.src.includes('60x60') || img.src.includes('40x40') || img.src.includes('16x16'));
                            const profileUrl = profileImg ? profileImg.src : '';

                            // 5. 플랫폼 긁어오기
                            // 메타의 플랫폼 아이콘은 텍스트가 없고 순수 CSS 배경 이미지(mask)로 처리됨
                            // 즉, 소스코드에 facebook이라는 글자 자체가 없음!
                            // "플랫폼" 글자 옆에 있는 아이콘 그룹 컨테이너의 자식(아이콘) '개수'를 바탕으로 유추함.
                            const platforms: string[] = [];
                            const platformSpan = Array.from(parent.querySelectorAll('span')).find(s => s.innerText === '플랫폼');

                            if (platformSpan && platformSpan.nextElementSibling) {
                                const iconCount = platformSpan.nextElementSibling.children.length;

                                if (iconCount >= 4) {
                                    platforms.push('Facebook', 'Instagram', 'Audience Network', 'Messenger');
                                } else if (iconCount === 3) {
                                    platforms.push('Facebook', 'Instagram', 'Messenger');
                                } else if (iconCount === 2) {
                                    platforms.push('Facebook', 'Instagram');
                                } else if (iconCount === 1) {
                                    platforms.push('Instagram');
                                }
                            }

                            // 만약 위에서 못 찾았다면 (보통 기본적으로 두 곳에는 거의 100% 송출)
                            if (platforms.length === 0) {
                                platforms.push('Facebook', 'Instagram');
                            }

                            results.push({
                                id: libraryId,
                                img: mainImgUrl,
                                video: videoUrl,
                                profile: profileUrl,
                                platforms: platforms,
                                text: text
                            });
                        }
                        break; // 카드를 찾았으므로 상위 탐색 종료
                    }
                    parent = parent.parentElement;
                }
            });

            return results;
        });

        // 스크래핑된 데이터를 좀 더 예쁘게 배열 형식의 API 응답처럼 가공
        const formattedAds = [];
        const length = adsData.length;

        for (let i = 0; i < length; i++) {
            // 헤더 정보 쓰레기값들 쳐내기 (불필요한 줄 제거)
            let lines = adsData[i].text.split('\n')
                .map((t: string) => t.trim())
                .filter((t: string) => t.length > 0);

            // '광고' 라는 단어가 나온 줄 이후부터가 진짜 본문일 확률이 매우 높음
            const adStartIdx = lines.indexOf('광고');
            let extractedPageName = "알 수 없는 브랜드";

            if (adStartIdx !== -1) {
                // 보통 '광고' 한 칸 앞의 줄이 브랜드 페이지명! (예: "Innisfree (이니스프리)")
                if (adStartIdx > 0) {
                    extractedPageName = lines[adStartIdx - 1];
                }

                if (adStartIdx < lines.length - 1) {
                    // "광고" 다음 줄 부터 잘라버림 (본문만 남기기)
                    lines = lines.slice(adStartIdx + 1);
                }
            } else {
                // 보험용: 상위 더미 텍스트를 무식하게 4~5줄 잘라냄
                lines = lines.slice(8);
            }

            // "지금 구매하기", "더 알아보기", "OY.RUN" 같은 버튼 텍스트도 마지막 3~4줄에 붙으므로 제거
            lines = lines.filter((t: string) =>
                !t.includes('지금 구매하기') &&
                !t.includes('더 알아보기') &&
                !t.includes('더 보기') &&
                !t.includes('OY.RUN')
            );

            formattedAds.push({
                id: adsData[i].id, // 이것이 바로 라이브러리 고유 ID입니다.
                page_id: pageId || "키워드검색", // 페이지ID는 브랜드 고유 번호입니다.
                page_name: extractedPageName,
                ad_creative_bodies: [lines.join('\n')],
                ad_creative_link_captions: [],
                ad_creation_time: new Date().toISOString().split('T')[0],
                ad_delivery_start_time: new Date().toISOString().split('T')[0],
                ad_snapshot_url: adsData[i].video || adsData[i].img || "https://via.placeholder.com/300?text=No+Media",
                profile_logo_url: adsData[i].profile || "",
                impressions: "스크래핑 감지됨",
                spend: "스크래핑 감지됨",
                publisher_platforms: adsData[i].platforms
            });
        }

        return {
            request_url: url,
            scraped_count: formattedAds.length,
            response: { data: formattedAds, paging: {} }
        };

    } catch (error: any) {
        console.error("Puppeteer 크롤링 실패:", error);
        return { error: `크롤링 에러: ${error.message}` };
    } finally {
        if (browser) await browser.close();
    }
}
