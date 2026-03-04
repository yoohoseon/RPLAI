import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const searchTerms = searchParams.get('q');

    // 유저가 제공한 메타 액세스 토큰
    const token = "EAAXMCWaR9w4BQ90ECXJ6MrJtOZBdxcyCLnJuCRr3ClBovW8lz83YudcrBAMiojcCyhFsNMbZBOwGzEN536VVvLKpZB3fDPNwzkxhwafofJM30Rb7ZBrYS4jjTGQBBZAJjWOZBp2NyGAxhAl0PL8lBGQEa47uXSpuvXJWqsEdxNuGcJndsPkXHQa8rzbrJ9xJZClfP9J0NUVnQC01Cfw";

    if (!searchTerms) {
        return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    try {
        const fields = "id,page_id,page_name,ad_creative_bodies,ad_creative_link_captions,ad_creation_time,ad_delivery_start_time,ad_snapshot_url";

        // 검색 쿼리를 바탕으로 한국('KR') 대상으로 진행 중인 모든 광고(ALL)를 들고옵니다.
        const url = `https://graph.facebook.com/v19.0/ads_archive?access_token=${token}&search_terms=${encodeURIComponent(searchTerms)}&ad_type=ALL&ad_reached_countries=['KR']&fields=${fields}&limit=12`;

        const response = await fetch(url);
        const data = await response.json();

        // Meta API 자체 에러 처리 (토큰 만료 등)
        if (data.error) {
            console.error("[Meta Ads API Error]", data.error);

            // 토큰 만료시 테스트용 Mock 데이터(가짜 데이터)를 반환하여 UI가 깨지지 않도록 방어 로직 추가
            if (data.error.message.includes('Session has expired') || data.error.message.includes('access token')) {
                const mockData = [
                    {
                        id: 'mock_1',
                        page_name: `${searchTerms} 공식 페이지`,
                        ad_delivery_start_time: new Date().toISOString(),
                        ad_creative_bodies: [`[Mock Data] ${searchTerms}의 신제품 출시! 지금 바로 확인하세요. 토큰이 만료되어 가상 데이터를 표시합니다.`]
                    },
                    {
                        id: 'mock_2',
                        page_name: `${searchTerms} 공식 페이지`,
                        ad_delivery_start_time: new Date(Date.now() - 86400000).toISOString(),
                        ad_creative_bodies: [`[Mock Data] 단 3일간 진행되는 ${searchTerms} 특별 프로모션! 놓치지 마세요. (개발자용 임시 화면)`]
                    }
                ];
                return NextResponse.json({ success: true, count: mockData.length, data: mockData, isMock: true });
            }

            return NextResponse.json({ success: false, error: data.error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, count: data.data?.length || 0, data: data.data });
    } catch (error: any) {
        console.error("[Meta Ads API Exception]", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
