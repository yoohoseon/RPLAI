'use client';

import { useState } from 'react';
import { testMetaAdsApiRaw, testMetaAdsApiDirectUrl } from '@/app/lib/actions';
import { scrapeMetaAds } from '@/app/lib/scraper';

const AVAILABLE_FIELDS = [
    { id: 'id', label: '광고 ID' },
    { id: 'page_id', label: '페이지 ID' },
    { id: 'page_name', label: '페이지명' },
    { id: 'ad_creative_bodies', label: '광고 본문' },
    { id: 'ad_creative_link_captions', label: '링크 캡션' },
    { id: 'ad_creation_time', label: '생성 시간' },
    { id: 'ad_delivery_start_time', label: '시작 시간' },
    { id: 'ad_delivery_stop_time', label: '종료 시간' },
    { id: 'ad_snapshot_url', label: '스냅샷 URL(랜딩)' },
    { id: 'impressions', label: '노출수 (impressions)' },
    { id: 'spend', label: '지출액 (spend)' },
    { id: 'demographic_distribution', label: '인구통계 (demographic)' },
    { id: 'publisher_platforms', label: '게재 플랫폼 (platforms)' },
    { id: 'bylines', label: '지원·스폰서 (bylines)' },
    { id: 'currency', label: '통화 (currency)' },
    { id: 'estimated_audience_size', label: '타겟 크기 (audience)' }
];

export default function MetaTestPage() {
    const [searchTerms, setSearchTerms] = useState('');
    const [searchPageIds, setSearchPageIds] = useState('');
    const [adType, setAdType] = useState('ALL');
    const [countries, setCountries] = useState("'KR'");
    const [limit, setLimit] = useState<number>(40);
    const [deliveryDateMin, setDeliveryDateMin] = useState('');
    const [deliveryDateMax, setDeliveryDateMax] = useState('');

    // 선택된 필드 배열
    const [selectedFields, setSelectedFields] = useState<string[]>([
        'id', 'page_id', 'page_name', 'ad_creative_bodies',
        'ad_creative_link_captions', 'ad_creation_time',
        'ad_delivery_start_time', 'ad_snapshot_url',
        'impressions', 'spend', 'demographic_distribution',
        'publisher_platforms'
    ]);

    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // 무식하게 크롤링 스위치
    const [useScraper, setUseScraper] = useState(false);

    // 직접 URL 수정 및 요청 
    const [directUrl, setDirectUrl] = useState('');
    const [directLoading, setDirectLoading] = useState(false);

    const toggleField = (fieldId: string) => {
        setSelectedFields(prev =>
            prev.includes(fieldId)
                ? prev.filter(f => f !== fieldId)
                : [...prev, fieldId]
        );
    };

    const handleTest = async () => {
        if (!searchTerms.trim() && !searchPageIds.trim()) {
            alert("검색어 혹은 브랜드(페이지) ID를 입력해주세요!");
            return;
        }
        if (selectedFields.length === 0) {
            alert("최소 1개 이상의 요청 필드(응답 데이터)를 선택해주세요!");
            return;
        }

        setLoading(true);
        setResult(null);
        try {
            let data;
            if (useScraper) {
                // 크롤러 사용 (pageId와 searchTerms 만 가져감)
                data = await scrapeMetaAds(searchPageIds, searchTerms);
            } else {
                // 공식 API 사용
                data = await testMetaAdsApiRaw({
                    searchTerms,
                    searchPageIds,
                    adType,
                    countries,
                    limit,
                    fields: selectedFields.join(','),
                    deliveryDateMin,
                    deliveryDateMax
                });
            }

            setResult(data);
            if (data.request_url) {
                setDirectUrl(data.request_url);
            }
        } catch (error: any) {
            setResult({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleFetchUrl = async (urlToFetch: string) => {
        setDirectLoading(true);
        try {
            const data = await testMetaAdsApiDirectUrl(urlToFetch);
            setResult(data);
            if (data.request_url) {
                setDirectUrl(data.request_url);
            }
        } catch (error: any) {
            setResult({ request_url: urlToFetch, error: error.message });
        } finally {
            setDirectLoading(false);
        }
    };

    const handleDirectTest = async () => {
        if (!directUrl.trim()) {
            alert("요청할 타겟 URL을 붙여넣거나 생성해주세요!");
            return;
        }
        await handleFetchUrl(directUrl);
    };

    // 현재 응답 데이터에서 고유한 페이지 ID와 이름 추출
    const extractedPages = result?.response?.data?.reduce((acc: any[], curr: any) => {
        if (curr.page_id && curr.page_name) {
            if (!acc.find((p: any) => p.page_id === curr.page_id)) {
                acc.push({ page_id: curr.page_id, page_name: curr.page_name });
            }
        }
        return acc;
    }, []) || [];

    const pagingNextUrl = result?.response?.paging?.next;

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            <div className="p-5 border-b bg-white border-gray-200 z-10 shrink-0">
                <h1 className="text-xl font-bold text-gray-800">메타 광고 API 커스텀 테스트 랩</h1>
            </div>

            <div className="flex-1 flex min-h-0">
                {/* Left panel: Custom options */}
                <div className="w-[450px] shrink-0 bg-white border-r border-gray-200 flex flex-col pt-2">
                    <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-bold text-gray-700">검색어 (search_terms)</label>
                                <input
                                    type="text"
                                    value={searchTerms}
                                    onChange={(e) => setSearchTerms(e.target.value)}
                                    placeholder="예: 이니스프리, BHC치킨"
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-bold text-gray-700">페이지 ID (search_page_ids)</label>
                                <input
                                    type="text"
                                    value={searchPageIds}
                                    onChange={(e) => {
                                        setSearchPageIds(e.target.value);
                                        if (e.target.value.trim() !== '') {
                                            setSearchTerms('');
                                        }
                                    }}
                                    placeholder="옵션: 콤마로 다중 입력"
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* 체크박스로 필드 커스텀 */}
                            <div className="flex flex-col gap-2 mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-800">응답 Fields</label>
                                    <span className="text-xs text-gray-500 font-medium">{selectedFields.length} / {AVAILABLE_FIELDS.length}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-1">
                                    {AVAILABLE_FIELDS.map((field) => (
                                        <label key={field.id} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.includes(field.id)}
                                                onChange={() => toggleField(field.id)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0"
                                            />
                                            <span className={`text-[12px] whitespace-nowrap overflow-hidden text-ellipsis ${selectedFields.includes(field.id) ? 'text-blue-700 font-semibold' : 'text-gray-600 group-hover:text-gray-900'} transition-colors`}>
                                                {field.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-gray-700">광고 타입 (ad_type)</label>
                                    <select value={adType} onChange={(e) => setAdType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg outline-none text-xs">
                                        <option value="ALL">ALL</option>
                                        <option value="POLITICAL_AND_ISSUE_ADS">POLITICAL</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-gray-700">국가</label>
                                    <input type="text" value={countries} onChange={(e) => setCountries(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg outline-none text-xs" placeholder="'KR'" />
                                </div>
                            </div>



                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-700">조회 개수 한도</label>
                                <input
                                    type="number"
                                    value={limit}
                                    onChange={(e) => setLimit(Number(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg outline-none text-xs"
                                    disabled={useScraper}
                                />
                            </div>

                            <div className="flex items-center gap-3 mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={useScraper}
                                        onChange={(e) => setUseScraper(e.target.checked)}
                                        className="w-5 h-5 text-red-600 rounded"
                                    />
                                    <span className="text-sm font-bold text-red-800">🚀 무식한 자체 크롤러 가동 (Playwright 봇)</span>
                                </label>
                                {useScraper && (
                                    <span className="text-[11px] text-red-600 font-medium">
                                        * 공식 API 무시하고 웹 화면을 무식하게 다 긁어옴 (10초 이상 소요)
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Floating Bottom Button */}
                    <div className="p-5 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={handleTest}
                            disabled={loading}
                            className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                                    호출 중...
                                </>
                            ) : '▶ 요청 생성'}
                        </button>
                    </div>
                </div>

                {/* Right panel: API Results */}
                <div className="flex-1 overflow-y-auto p-8 relative">
                    {result ? (
                        <div className="max-w-5xl mx-auto space-y-6 pb-20">
                            {/* Request URL Card */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                        요청 Target URL (직접 수정 가능)
                                    </h2>
                                    <button
                                        onClick={handleDirectTest}
                                        disabled={directLoading}
                                        className="px-4 py-2 bg-gray-800 text-white text-[13px] font-bold rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
                                    >
                                        {directLoading ? (
                                            <>
                                                <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                                                요청 중...
                                            </>
                                        ) : '▶ 이 URL로 직접 요청'}
                                    </button>
                                </div>
                                <div className="bg-[#F8F9FA] rounded-md border border-[#E9ECEF]">
                                    <textarea
                                        value={directUrl || (result.request_url || '')}
                                        onChange={(e) => setDirectUrl(e.target.value)}
                                        className="w-full bg-transparent p-3 border-none text-[13px] text-[#0064FF] font-mono leading-relaxed outline-none resize-y min-h-[90px]"
                                        placeholder="API 요청 URL이 여기에 표시됩니다. 값을 직접 타이핑해서 우측 상단 '직접 요청' 버튼을 누를 수도 있습니다."
                                        spellCheck={false}
                                    />
                                </div>
                            </div>

                            {/* Extracted Page IDs Card */}
                            {extractedPages.length > 0 && (
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                                    <h2 className="text-sm font-bold mb-3 text-gray-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                            추출된 페이지 (브랜드) 리스트
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                                            총 {extractedPages.length}개
                                        </span>
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {extractedPages.map((page: any) => (
                                            <button
                                                key={page.page_id}
                                                onClick={() => {
                                                    setSearchPageIds(prev => prev ? `${prev},${page.page_id}` : page.page_id);
                                                    setSearchTerms(''); // 페이지 ID 입력 시 검색어 비우기
                                                    alert(`${page.page_name} (${page.page_id})가 추가되고 검색어가 초기화되었습니다.`);
                                                }}
                                                className="flex flex-col items-start px-3 py-2 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
                                            >
                                                <span className="text-[12px] font-bold text-gray-800">{page.page_name}</span>
                                                <span className="text-[11px] text-gray-500 font-mono">ID: {page.page_id}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-2">
                                        * 클릭하면 좌측 '페이지 ID' 입력칸에 자동으로 추가됩니다.
                                    </p>
                                </div>
                            )}

                            {/* Response JSON Card */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                                <h2 className="text-sm font-bold mb-3 text-gray-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        API 응답 (Response)
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                                        {result.response && result.response.data ? `검색된 개수: ${result.response.data.length}` : '에러 또는 빈 응답'}
                                    </span>
                                </h2>

                                <div className="bg-[#1E1E1E] rounded-md p-5 overflow-auto custom-scrollbar border border-gray-800 flex-1">
                                    <pre className="text-[13px] text-[#A6E22E] font-mono whitespace-pre-wrap break-all leading-relaxed">
                                        {JSON.stringify(result.response || result, null, 2)}
                                    </pre>
                                </div>

                                {/* Pagination Action */}
                                {pagingNextUrl && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                        <button
                                            onClick={() => {
                                                setDirectUrl(pagingNextUrl);
                                                handleFetchUrl(pagingNextUrl);
                                            }}
                                            disabled={directLoading}
                                            className="px-5 py-2.5 bg-green-600 text-white text-[13px] font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
                                        >
                                            {directLoading ? '불러오는 중...' : '▶ 다음 페이지 (Next Cursor) 불러오기'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <div className="w-16 h-16 bg-white border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                            </div>
                            <p className="text-lg font-bold text-gray-800 mb-1">결과가 여기에 표시됩니다</p>
                            <p className="text-sm font-medium text-gray-500">좌측 패널에서 옵션을 세팅하고 요청을 날려주세요.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom scrollbar styles for dark terminal */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #2D2D2D;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #555;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #777;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none; /* IE and Edge */
                    scrollbar-width: none; /* Firefox */
                }
            `}</style>
        </div>
    );
}
