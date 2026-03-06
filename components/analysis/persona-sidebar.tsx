'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { UserCircle2, ChevronDown, ChevronLeft, ChevronRight, User, MapPin, Search, X, Loader2, Target, Zap, Activity, ImageIcon, MoreHorizontal, Clock } from 'lucide-react';
import { generateStagePersonasAction, getCompetitorAdsAction, getCompetitorSpecificAdsAction, saveCompetitorAdLogAction, getCompetitorAdLogsAction, getCompetitorAdLogByIdAction } from '@/app/lib/actions';
import { motion } from 'framer-motion';

function AdImage({ mediaUrl, link }: { mediaUrl?: string, link: string }) {
    if (!mediaUrl || mediaUrl.includes('No+Media')) {
        return (
            <div className="w-full aspect-square bg-[#F9FAFB] border border-[#E5E8EB] rounded-xl mb-5 flex flex-col items-center justify-center relative overflow-hidden group-hover:bg-[#F2F4F7] transition-colors shrink-0">
                <ImageIcon className="w-8 h-8 text-[#AEB5BC] mb-3" />
                <p className="text-[13px] font-bold text-[#8B95A1] z-10">미디어 없음</p>
            </div>
        );
    }

    // Check if it's a video
    if (mediaUrl.includes('.mp4') || mediaUrl.includes('.webm')) {
        return (
            <div className="w-full aspect-square mb-5 rounded-xl border border-[#E5E8EB] overflow-hidden relative shrink-0">
                <video src={mediaUrl} autoPlay muted loop playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
        );
    }

    return (
        <div className="w-full aspect-square mb-5 rounded-xl border border-[#E5E8EB] overflow-hidden relative shrink-0">
            <img src={mediaUrl} alt="광고 소재" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
    );
}

export function PersonaSidebar({
    initialPersonas,
    initialStage,
    initialCompetitors,
    brandContext,
    children
}: {
    initialPersonas: any[],
    initialStage: string,
    initialCompetitors?: string[],
    brandContext: any,
    children?: React.ReactNode
}) {
    const [selectedPersona, setSelectedPersona] = useState<any | null>(null);
    const [stagePersonas, setStagePersonas] = useState<Record<string, any[]>>({
        [initialStage]: initialPersonas || []
    });
    const [activeStage, setActiveStage] = useState<string>(initialStage);
    const [isLoadingStage, setIsLoadingStage] = useState<Record<string, boolean>>({});
    const [isMainAccordionOpen, setIsMainAccordionOpen] = useState<boolean>(true);
    const [isOurBrandAccordionOpen, setIsOurBrandAccordionOpen] = useState<boolean>(false);
    const [isCompetitorAccordionOpen, setIsCompetitorAccordionOpen] = useState<boolean>(false);
    const [competitorAds, setCompetitorAds] = useState<any[]>([]);
    const [competitorList, setCompetitorList] = useState<string[]>(initialCompetitors || []);
    const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);
    const [isLoadingSpecificAds, setIsLoadingSpecificAds] = useState<boolean>(false);
    const [isLoadMore, setIsLoadMore] = useState<boolean>(false);
    const [nextAdCursor, setNextAdCursor] = useState<string | null>(null);
    const [isLoadingAds, setIsLoadingAds] = useState<boolean>(false);
    const [hasAnalyzed, setHasAnalyzed] = useState<boolean>((initialCompetitors && initialCompetitors.length > 0) || false);
    const [newCompetitorInput, setNewCompetitorInput] = useState<string>('');
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    const [isVerifyingAds, setIsVerifyingAds] = useState<boolean>(false);
    const [invalidAdIds, setInvalidAdIds] = useState<Set<string>>(new Set());
    const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
    const [historyLogs, setHistoryLogs] = useState<any[]>([]);
    const [isFetchingHistory, setIsFetchingHistory] = useState<boolean>(false);

    const updateAndVerifyAds = async (fetchedAds: any[], keyword: string, isLoadMore = false, skipSave = false) => {
        if (isLoadMore) {
            setCompetitorAds(prev => [...prev, ...fetchedAds]);
        } else {
            setCompetitorAds(fetchedAds);
        }

        if (fetchedAds.length === 0) return;

        setIsVerifyingAds(true);

        // Calculate frequency of page_name
        const countMap: Record<string, number> = {};
        const combinedAds = isLoadMore ? [...competitorAds, ...fetchedAds] : fetchedAds;

        combinedAds.forEach(ad => {
            const name = ad.pageName || "";
            countMap[name] = (countMap[name] || 0) + 1;
        });

        // Prefer names containing the keyword first
        let bestName = "";
        let maxScore = -1;

        for (const [name, count] of Object.entries(countMap)) {
            let score = count;
            if (name.toLowerCase().includes(keyword.toLowerCase())) {
                score += 1000;
            }
            if (score > maxScore) {
                maxScore = score;
                bestName = name;
            }
        }

        const invalidSet = new Set<string>();
        combinedAds.forEach((ad) => {
            if ((ad.pageName || "") !== bestName) {
                invalidSet.add(ad.id);
            }
        });

        if (invalidSet.size > 0) {
            // Wait 1.5s for visual "verifying" feel
            await new Promise(resolve => setTimeout(resolve, 1500));
            setInvalidAdIds(invalidSet);
            // Wait another 0.8s for fade out animation
            await new Promise(resolve => setTimeout(resolve, 800));
            const finalAds = combinedAds.filter(ad => !invalidSet.has(ad.id));
            setCompetitorAds(finalAds);
            setInvalidAdIds(new Set());

            if (!isLoadMore && !skipSave && finalAds.length > 0) {
                await saveCompetitorAdLogAction(brandContext.brandKor, keyword, finalAds);
            }
        } else {
            // Quick delay just to let user read the message
            await new Promise(resolve => setTimeout(resolve, 800));

            if (!isLoadMore && !skipSave && combinedAds.length > 0) {
                await saveCompetitorAdLogAction(brandContext.brandKor, keyword, combinedAds);
            }
        }

        setIsVerifyingAds(false);
    };

    const fetchHistoryLogs = async (competitor: string) => {
        setIsFetchingHistory(true);
        try {
            const { success, logs } = await getCompetitorAdLogsAction(brandContext.brandKor, competitor);
            if (success && logs) {
                setHistoryLogs(logs);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsFetchingHistory(false);
        }
    };

    const loadHistoryLog = async (logId: string) => {
        setIsLoadingSpecificAds(true);
        setIsHistoryOpen(false);
        try {
            const { success, adsData } = await getCompetitorAdLogByIdAction(logId);
            if (success && adsData) {
                setCompetitorAds(adsData);
                setNextAdCursor(null); // Can't load more on historical snapshot generally
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingSpecificAds(false);
        }
    };

    const footerText = "© 2026 RPLAI. Powered by Goldenax. All rights reserved.";
    const letterVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.1 }
        }
    };

    const handleToggleCompetitor = async () => {
        setIsCompetitorAccordionOpen(!isCompetitorAccordionOpen);
    };

    const loadMoreAds = async () => {
        if (!selectedCompetitor || !nextAdCursor) return;
        setIsLoadMore(true);
        try {
            const { ads, nextCursor } = await getCompetitorSpecificAdsAction(selectedCompetitor, nextAdCursor);
            await updateAndVerifyAds(ads, selectedCompetitor, true);
            setNextAdCursor(nextCursor);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadMore(false);
        }
    };

    const runCompetitorAnalysis = async () => {
        setIsLoadingAds(true);
        setHasAnalyzed(true);
        try {
            const { competitors, ads } = await getCompetitorAdsAction(brandContext);
            setCompetitorList(competitors || []);
            setCompetitorAds(ads || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingAds(false);
        }
    };

    const handleToggleStage = async (stageId: string) => {
        if (activeStage === stageId) {
            // Can toggle off or keep open? Let's say keep open for simplicity or toggle off.
            // If toggle off, setActiveStage('') but user says "각 단계별로 드롭다운이 있어야 하고"
            // Let's just keep accordion logic.
            setActiveStage('');
            return;
        }

        setActiveStage(stageId);

        // Fetch only if we don't have it yet
        if (!stagePersonas[stageId]) {
            setIsLoadingStage(prev => ({ ...prev, [stageId]: true }));
            try {
                const result = await generateStagePersonasAction(stageId, brandContext);
                setStagePersonas(prev => ({ ...prev, [stageId]: result }));
            } catch (error) {
                console.error("Failed to load stage personas:", error);
            } finally {
                setIsLoadingStage(prev => ({ ...prev, [stageId]: false }));
            }
        }
    };

    const stages = [
        { id: 'awareness', label: '인지 (Awareness) 단계', icon: <Search className="w-5 h-5 text-blue-500" />, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'consideration', label: '유입 및 고려 (Consideration) 단계', icon: <Target className="w-5 h-5 text-indigo-500" />, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { id: 'purchase', label: '구매 (Purchase) 단계', icon: <Zap className="w-5 h-5 text-orange-500" />, color: 'text-orange-500', bg: 'bg-orange-50' },
        { id: 'postPurchase', label: '구매 후 (Post Purchase) 단계', icon: <Activity className="w-5 h-5 text-purple-500" />, color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    const currentPersonas = selectedPersona ? (stagePersonas[selectedPersona.stageId] || []) : [];

    return (
        <>
            <div className={`sticky top-[144px] h-[calc(100vh-144px)] shrink-0 bg-white border-r border-[#E5E8EB] shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-full lg:w-[540px]' : 'w-0'}`}>

                {/* 접기/펴기 토글 버튼 */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute top-1/2 -right-5 z-50 flex items-center justify-center w-5 h-20 bg-white border border-[#E5E8EB] border-l-0 shadow-[2px_0_8px_rgba(0,0,0,0.04)] rounded-r-xl transition-all hover:bg-gray-50 text-[#8B95A1] hover:text-[#333333] transform -translate-y-1/2"
                >
                    {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 ml-[2px]" />}
                </button>

                <div className={`w-full h-full overflow-hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 delay-100' : 'opacity-0'}`}>
                    <div className="w-[100vw] lg:w-[539px] h-full p-8 sm:p-10 pb-32 overflow-y-auto scrollbar-hide">

                        <div className="flex flex-col gap-1 mb-6 mt-2">
                            <button
                                className="flex items-center justify-between w-full text-left"
                                onClick={() => setIsMainAccordionOpen(!isMainAccordionOpen)}
                            >
                                <h2 className="text-[18px] font-bold text-[#333333] flex items-center gap-2">
                                    디지털 핵심 타겟 페르소나
                                </h2>
                                <ChevronDown className={`w-5 h-5 text-[#8B95A1] transition-transform duration-300 ${isMainAccordionOpen ? '-rotate-180' : ''}`} />
                            </button>
                        </div>

                        {isMainAccordionOpen && (
                            <div className="border-t border-[#E5E8EB] divide-y divide-[#F2F4F6] flex flex-col pt-2 animate-in fade-in slide-in-from-top-4 duration-500">
                                {stages.map((stage) => {
                                    const isOpen = activeStage === stage.id;
                                    const isLoaded = !!stagePersonas[stage.id];
                                    const isLoading = isLoadingStage[stage.id];
                                    const currentStagePersonas = stagePersonas[stage.id] || [];

                                    return (
                                        <div key={stage.id} className="overflow-hidden bg-white transition-all duration-300">
                                            <button
                                                onClick={() => handleToggleStage(stage.id)}
                                                className={`w-full flex items-center justify-between py-5 px-2 transition-colors hover:bg-gray-50/50 rounded-xl mb-1`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {stage.icon}
                                                    <h3 className={`font-bold text-[17px] ${isOpen ? stage.color : 'text-[#333333]'}`}>{stage.label}</h3>
                                                </div>
                                                {isLoading ? (
                                                    <Loader2 className="w-5 h-5 text-[#8B95A1] animate-spin shrink-0" />
                                                ) : (
                                                    <ChevronDown className={`w-5 h-5 text-[#8B95A1] transition-transform duration-300 shrink-0 ${isOpen ? '-rotate-180' : ''}`} />
                                                )}
                                            </button>

                                            {isOpen && (
                                                <div className="pb-6 pt-2 px-1 bg-white">
                                                    {isLoading ? (
                                                        <div className="py-12 flex flex-col items-center justify-center gap-3">
                                                            <Loader2 className="w-8 h-8 text-[#0064FF] animate-spin" />
                                                            <p className="text-[14px] font-medium text-[#4E5968]">AI가 해당 단계의 페르소나를 예측 중입니다...</p>
                                                        </div>
                                                    ) : isLoaded && currentStagePersonas.length > 0 ? (
                                                        <div className="space-y-4 mt-5 animate-in fade-in slide-in-from-top-4 duration-500 pb-2">
                                                            {currentStagePersonas.map((p: any, i: number) => {
                                                                const pDb = p.dbPersona;
                                                                return (
                                                                    <div
                                                                        onClick={() => {
                                                                            setSelectedPersona({ ...p, index: i, stageId: stage.id });
                                                                            setSelectedCompetitor(null);
                                                                        }}
                                                                        className={`flex flex-col gap-4 p-5 rounded-[1.25rem] transition-all cursor-pointer group/card ${selectedPersona?.stageId === stage.id && selectedPersona?.index === i ? 'bg-[#F2F8FF] border-[2px] border-[#0064FF] shadow-sm transform scale-[1.01]' : 'bg-white border border-[#E5E8EB] hover:border-[#0064FF]/30 hover:shadow-md'}`}
                                                                    >
                                                                        <div className="flex items-center gap-4 border-none">
                                                                            <div className="w-[64px] h-[64px] shrink-0 bg-[#E5E8EB] rounded-full overflow-hidden relative shadow-sm group-hover/card:scale-[1.02] transition-transform">
                                                                                <Image src={pDb?.imagePath || '/avatars/01.png'} alt={p.name} fill className="object-cover" />
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center justify-between mb-1.5">
                                                                                    <h3 className="text-[#333333] font-bold text-[16px] truncate pr-2">{p.name}</h3>
                                                                                    <span className="text-[#0064FF] font-black text-[14px] whitespace-nowrap bg-[#0064FF]/10 px-2.5 py-0.5 rounded-lg border border-[#0064FF]/20">{p.percentage}%</span>
                                                                                </div>
                                                                                <div className="text-[#8B95A1] text-[13px] font-medium flex items-center gap-1.5">
                                                                                    <span className="bg-white px-2 py-0.5 rounded-md border border-[#E5E8EB]">#{i + 1} 핵심군</span>
                                                                                    <span>·</span>
                                                                                    <span>{pDb?.ageGroup}대 {pDb?.gender === 'M' ? '남성' : '여성'}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="w-full bg-[#F9FAFB] p-3.5 rounded-xl border border-[#F2F4F6]">
                                                                            <p className="text-[14px] text-[#4E5968] leading-relaxed break-keep line-clamp-2">
                                                                                {p.behavior}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="py-10 text-center text-[#8B95A1] text-[14px]">
                                                            페르소나 데이터가 없습니다.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="flex flex-col gap-1 mb-6 mt-8">
                            <button
                                className="flex items-center justify-between w-full text-left"
                                onClick={() => setIsOurBrandAccordionOpen(!isOurBrandAccordionOpen)}
                            >
                                <h2 className="text-[17px] font-bold text-[#333333] flex items-center gap-2">
                                    자사 소재 분석
                                </h2>
                                <ChevronDown className={`w-5 h-5 text-[#8B95A1] transition-transform duration-300 ${isOurBrandAccordionOpen ? '-rotate-180' : ''}`} />
                            </button>
                        </div>

                        {isOurBrandAccordionOpen && (
                            <div className="border-t border-[#E5E8EB] flex flex-col pt-6 pb-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                <button
                                    onClick={async () => {
                                        const brand = brandContext.brandKor;
                                        setSelectedCompetitor(brand);
                                        setSelectedPersona(null);
                                        setIsLoadingSpecificAds(true);
                                        setCompetitorAds([]);
                                        setNextAdCursor(null);
                                        try {
                                            // Check DB history first
                                            const { success, logs } = await getCompetitorAdLogsAction(brand, brand);
                                            if (success && logs && logs.length > 0) {
                                                const latestLogId = logs[0].id;
                                                const { success: dataSuccess, adsData } = await getCompetitorAdLogByIdAction(latestLogId);
                                                if (dataSuccess && adsData && adsData.length > 0) {
                                                    setCompetitorAds(adsData);
                                                    return;
                                                }
                                            }

                                            // Fallback to scrape if no history found
                                            const { ads, nextCursor } = await getCompetitorSpecificAdsAction(brand);
                                            await updateAndVerifyAds(ads, brand);
                                            setNextAdCursor(nextCursor);
                                        } catch (e) {
                                            console.error(e);
                                        } finally {
                                            setIsLoadingSpecificAds(false);
                                        }
                                    }}
                                    className={`w-full text-left bg-white border ${selectedCompetitor === brandContext.brandKor ? 'border-[#0064FF] ring-1 ring-[#0064FF]' : 'border-[#E5E8EB]'} shadow-sm px-4 py-3 rounded-xl text-[14px] font-bold text-[#333333] hover:border-[#0064FF] transition-all`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#03C75A]" />
                                            {brandContext.brandKor}
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-[#8B95A1]" />
                                    </div>
                                </button>
                            </div>
                        )}

                        <div className="flex flex-col gap-1 mb-6 mt-8">
                            <button
                                className="flex items-center justify-between w-full text-left"
                                onClick={handleToggleCompetitor}
                            >
                                <h2 className="text-[17px] font-bold text-[#333333] flex items-center gap-2">
                                    경쟁사 분석
                                </h2>
                                <ChevronDown className={`w-5 h-5 text-[#8B95A1] transition-transform duration-300 ${isCompetitorAccordionOpen ? '-rotate-180' : ''}`} />
                            </button>
                        </div>

                        {isCompetitorAccordionOpen && (
                            <div className="border-t border-[#E5E8EB] flex flex-col pt-6 pb-4 animate-in fade-in slide-in-from-top-4 duration-500">

                                {!hasAnalyzed ? (
                                    <div className="bg-[#F9FAFB] rounded-xl p-6 text-center border border-[#E5E8EB]">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-[#E5E8EB]">
                                            <Search className="w-6 h-6 text-[#0064FF]" />
                                        </div>
                                        <h3 className="text-[16px] font-bold text-[#333333] mb-2">경쟁사 광고 소재 분석</h3>
                                        <p className="text-[13px] text-[#4E5968] mb-5 break-keep">
                                            현재 브랜드와 매칭되는 주요 경쟁사들의 Meta 광고 라이브러리를 스크래핑하여 주력 소재를 분석합니다.
                                        </p>
                                        <button
                                            onClick={runCompetitorAnalysis}
                                            className="w-full bg-[#0064FF] hover:bg-[#0052D4] text-white font-bold text-[14px] py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <Activity className="w-4 h-4" />
                                            경쟁사 분석하기
                                        </button>
                                    </div>
                                ) : isLoadingAds ? (
                                    <div className="py-12 flex flex-col items-center justify-center gap-3">
                                        <Loader2 className="w-8 h-8 text-[#0064FF] animate-spin" />
                                        <div className="text-center">
                                            <p className="text-[14px] font-bold text-[#333333] mb-1">AI가 최신 광고 소재를 분석 중입니다...</p>
                                            <p className="text-[12px] text-[#8B95A1]">경쟁사의 주력 타겟과 크리에이티브를 추출하고 있어요</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col mb-2 gap-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-[15px] font-bold text-[#333333] flex items-center gap-1.5">
                                                    <div className="w-2 h-2 rounded-full bg-[#03C75A]" />
                                                    메인 경쟁사
                                                </h3>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {competitorList.map((comp, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={async () => {
                                                            setSelectedCompetitor(comp);
                                                            setSelectedPersona(null);
                                                            setIsLoadingSpecificAds(true);
                                                            setCompetitorAds([]);
                                                            setNextAdCursor(null);
                                                            try {
                                                                const { ads, nextCursor } = await getCompetitorSpecificAdsAction(comp);
                                                                await updateAndVerifyAds(ads, comp);
                                                                setNextAdCursor(nextCursor);
                                                            } catch (e) {
                                                                console.error(e);
                                                            } finally {
                                                                setIsLoadingSpecificAds(false);
                                                            }
                                                        }}
                                                        className={`w-full text-left bg-white border ${selectedCompetitor === comp ? 'border-[#0064FF] ring-1 ring-[#0064FF]' : 'border-[#E5E8EB]'} shadow-sm px-4 py-3 rounded-xl text-[14px] font-bold text-[#333333] hover:border-[#0064FF] transition-all`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-[#03C75A]" />
                                                                {comp}
                                                            </div>
                                                            <ChevronRight className="w-4 h-4 text-[#8B95A1]" />
                                                        </div>
                                                    </button>
                                                ))}
                                                {competitorList.length === 0 && (
                                                    <span className="bg-white border border-[#E5E8EB] shadow-sm px-3 py-1 rounded-full text-[13px] font-medium text-[#4E5968]">AI 분석 오류</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <input
                                                    type="text"
                                                    placeholder="경쟁사 추가 입력"
                                                    value={newCompetitorInput}
                                                    onChange={(e) => setNewCompetitorInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && newCompetitorInput.trim()) {
                                                            const newVal = newCompetitorInput.trim();
                                                            if (!competitorList.includes(newVal)) {
                                                                setCompetitorList([...competitorList, newVal]);
                                                            }
                                                            setNewCompetitorInput('');
                                                        }
                                                    }}
                                                    className="w-full h-10 px-3 py-2 text-[13px] bg-white border border-[#E5E8EB] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0064FF]/20 focus:border-[#0064FF] transition-all"
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (newCompetitorInput.trim()) {
                                                            const newVal = newCompetitorInput.trim();
                                                            if (!competitorList.includes(newVal)) {
                                                                setCompetitorList([...competitorList, newVal]);
                                                            }
                                                            setNewCompetitorInput('');
                                                        }
                                                    }}
                                                    className="shrink-0 bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#4E5968] active:scale-95 transition-all text-[13px] font-bold h-10 px-4 rounded-lg flex items-center justify-center"
                                                >
                                                    추가
                                                </button>
                                            </div>
                                            <p className="text-[12px] text-[#8B95A1] mt-3 mb-1">* 각 브랜드를 클릭하면 광고 크리에이티브 샘플을 볼 수 있습니다.</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <div className="mt-20 flex justify-center pb-24">
                            <motion.p
                                className="text-center text-[#8B95A1] text-[13px] font-normal"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: false }}
                                transition={{ staggerChildren: 0.03 }}
                            >
                                {footerText.split("").map((char, index) => (
                                    <motion.span key={index} variants={letterVariants}>
                                        {char}
                                    </motion.span>
                                ))}
                            </motion.p>
                        </div>
                    </div>
                </div>
            </div>

            {
                selectedPersona && !selectedCompetitor ? (
                    <div className="flex-1 min-w-0 py-10 px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8 bg-[#F2F4F7]" >
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-bold text-[#333333]">타겟 페르소나 상세 정보</h2>
                            <button onClick={() => setSelectedPersona(null)} className="w-10 h-10 rounded-full bg-white border border-[#E5E8EB] flex items-center justify-center text-[#8B95A1] hover:text-[#333333] hover:shadow-sm transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                            {/* First Column - Persona Identity */}
                            <div className="xl:col-span-1 space-y-6">
                                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#E5E8EB] flex flex-col items-center relative">
                                    <div className="w-full h-2 bg-[#F2F4F6] rounded-full absolute top-full left-0 -mt-1" />
                                    <div className="flex items-center justify-center w-full mb-8">
                                        <div className="w-[140px] h-[140px] shrink-0 rounded-full overflow-hidden relative shadow-lg">
                                            <Image src={selectedPersona.dbPersona?.imagePath || '/avatars/01.png'} alt={selectedPersona.name} fill className="object-cover" />
                                        </div>
                                    </div>
                                    <div className="w-full space-y-3">
                                        <div className="flex items-start gap-3 text-[18px] font-bold text-[#333333] h-[54px]">
                                            <User className="w-5 h-5 text-[#8B95A1] shrink-0 mt-0.5" />
                                            <span className="leading-[1.4] line-clamp-2 break-keep">{selectedPersona.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[15px] font-medium text-[#4E5968]">
                                            <div className="w-5 h-5 flex items-center justify-center text-[#8B95A1]">⚥</div>
                                            <span>{selectedPersona.dbPersona?.ageGroup}s {selectedPersona.dbPersona?.gender === 'M' ? 'male' : 'female'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[15px] font-medium text-[#4E5968]">
                                            <MapPin className="w-5 h-5 text-[#8B95A1]" />
                                            <span>South Korea</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Columns 2-4: Details */}
                            <div className="xl:col-span-3 space-y-6 flex flex-col">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                                    <div className="bg-white rounded-[1.5rem] shadow-sm border border-[#E5E8EB] p-6 flex flex-col h-full">
                                        <h3 className="text-[16px] font-bold text-[#333333] mb-4 flex items-center gap-2">
                                            페르소나 요약 <div className="w-4 h-4 rounded-full border border-[#8B95A1] text-[#8B95A1] flex items-center justify-center text-[10px]">i</div>
                                        </h3>
                                        <div className="bg-[#F9FAFB] p-5 rounded-2xl flex-1">
                                            <h4 className="text-[20px] font-bold text-[#333333] leading-tight mb-4 ">{selectedPersona.name}</h4>
                                            <p className="text-[#4E5968] text-[15px] leading-relaxed break-keep">
                                                {selectedPersona.behavior} 이들은 소셜미디어를 통해 브랜드 경험을 소비하며, 브랜드가 개인의 삶에 주는 가치와 효율성을 중시합니다. 구체적으로는 제품을 구매하기 전 상세한 리뷰를 탐색하고, 자신의 라이프스타일과 핏이 맞는지를 적극적으로 고려하는 {selectedPersona.dbPersona?.ageGroup}대 {selectedPersona.dbPersona?.gender === 'M' ? '남성' : '여성'} 소비자들을 대변합니다.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-[1.5rem] shadow-sm border border-[#E5E8EB] p-6 flex flex-col h-full">
                                        <h3 className="text-[16px] font-bold text-[#333333] mb-4 flex items-center gap-2">
                                            선호 미디어 채널 <div className="w-4 h-4 rounded-full border border-[#8B95A1] text-[#8B95A1] flex items-center justify-center text-[10px]">i</div>
                                        </h3>

                                        {(() => {
                                            const MOCK_MEDIA_SETS = [
                                                [
                                                    { platform: "instagram", cat: "소셜미디어", color: "text-[#E1306C]" },
                                                    { platform: "youtube", cat: "스트리밍/콘텐츠", color: "text-[#FF0000]" },
                                                    { platform: "oliveyoung", cat: "커뮤니티/커머스", color: "text-[#9BB802]" },
                                                    { platform: "naver", cat: "정보 제공 사이트", color: "text-[#03C75A]" },
                                                    { platform: "glowpick", cat: "리뷰 플랫폼", color: "text-[#FF4785]" }
                                                ],
                                                [
                                                    { platform: "tiktok", cat: "숏폼 소셜", color: "text-[#000000]" },
                                                    { platform: "youtube", cat: "스트리밍/콘텐츠", color: "text-[#FF0000]" },
                                                    { platform: "musinsa", cat: "패션 커머스", color: "text-[#000000]" },
                                                    { platform: "twitter", cat: "트렌드 탐색", color: "text-[#1DA1F2]" },
                                                    { platform: "hwahae", cat: "성분 분석 플랫폼", color: "text-[#00B4B4]" }
                                                ],
                                                [
                                                    { platform: "naver_blog", cat: "정보 탐색", color: "text-[#03C75A]" },
                                                    { platform: "youtube", cat: "리뷰 및 하울", color: "text-[#FF0000]" },
                                                    { platform: "kakao_style", cat: "라이프스타일 커머스", color: "text-[#FFCD00]" },
                                                    { platform: "instagram", cat: "인플루언서 참고", color: "text-[#E1306C]" },
                                                    { platform: "coupang", cat: "빠른 배송 커머스", color: "text-[#EA2428]" }
                                                ],
                                                [
                                                    { platform: "facebook", cat: "소셜미디어", color: "text-[#1877F2]" },
                                                    { platform: "youtube", cat: "스트리밍/콘텐츠", color: "text-[#FF0000]" },
                                                    { platform: "kurly", cat: "프리미엄 커머스", color: "text-[#5F0080]" },
                                                    { platform: "naver_cafe", cat: "커뮤니티", color: "text-[#03C75A]" },
                                                    { platform: "ssg", cat: "백화점몰", color: "text-[#000000]" }
                                                ]
                                            ];
                                            const mediaSet = MOCK_MEDIA_SETS[(selectedPersona.index || 0) % MOCK_MEDIA_SETS.length];
                                            return (
                                                <div className="overflow-x-auto h-full flex flex-col bg-[#F9FAFB] rounded-2xl p-4">
                                                    <table className="w-full text-left text-[13px]">
                                                        <thead>
                                                            <tr className="border-b border-[#E5E8EB] text-[#8B95A1]">
                                                                <th className="pb-2 font-bold w-12 text-center">#</th>
                                                                <th className="pb-2 font-bold">Category</th>
                                                                <th className="pb-2 font-bold">Domain</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="text-[#333333] font-medium">
                                                            {mediaSet.map((m, idx) => (
                                                                <tr key={idx} className={`border-b border-[#E5E8EB]/50 ${idx % 2 === 1 ? 'bg-white' : ''}`}>
                                                                    <td className="py-2.5 text-center text-[#8B95A1]">{idx + 1}</td>
                                                                    <td className="py-2.5">{m.cat}</td>
                                                                    <td className={`py-2.5 font-bold ${idx === 2 ? m.color : ''}`}>{m.platform}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Keyword Mapping Graph (Mock) */}
                                <div className="bg-white rounded-[1.5rem] shadow-sm border border-[#E5E8EB] p-6 relative min-h-[400px] flex flex-col">
                                    <h3 className="text-[16px] font-bold text-[#333333] mb-1 flex items-center gap-2">
                                        키워드 연관성 지도 <div className="w-4 h-4 rounded-full border border-[#8B95A1] text-[#8B95A1] flex items-center justify-center text-[10px]">i</div>
                                    </h3>
                                    <p className="text-[13px] text-[#8B95A1] mb-6">검색 의도 및 관심사와 연관된 주요 키워드 클러스터링.</p>

                                    {(() => {
                                        const MOCK_GRAPH_SETS = [
                                            [
                                                { text: "라이프스타일 트렌드", color: "bg-[#E8F3FF] text-[#0064FF]" },
                                                { text: "인스타 감성", color: "bg-[#F2F4F6] text-[#4E5968]" },
                                                { text: "가심비 높은 소비", color: "bg-[#FFF0F4] text-[#FF4785]" },
                                                { text: "브랜드 경험 중시", color: "bg-[#E8FFF0] text-[#00A650]" },
                                                { text: "리뷰 플랫폼 확인", color: "bg-[#F3E8FF] text-[#8638EA]" },
                                                { text: "할인/프로모션 민감도", color: "bg-[#F2F4F6] text-[#4E5968]" },
                                                { text: "제품 성능 위주", color: "bg-[#FFEED4] text-[#FF8A00]" },
                                                { text: "성분 중심의 신뢰도", color: "bg-[#E1F5FE] text-[#0288D1]" },
                                                { text: "웰니스/헬스케어", color: "bg-[#E8F3FF] text-[#0064FF]" },
                                                { text: "가족단위 라이프", color: "bg-[#E8FFF0] text-[#00A650]" },
                                                { text: "친환경 패키지 선호", color: "bg-[#F2F4F6] text-[#4E5968]" },
                                                { text: "오프라인/팝업스토어", color: "bg-[#FFF0F4] text-[#FF4785]" },
                                            ],
                                            [
                                                { text: "유행 민감도 최상", color: "bg-[#FFF0F4] text-[#FF4785]" },
                                                { text: "숏폼 챌린지 밈", color: "bg-[#F2F4F6] text-[#4E5968]" },
                                                { text: "한정판 아이템", color: "bg-[#E8FFF0] text-[#00A650]" },
                                                { text: "셀럽/아이돌 손민수", color: "bg-[#E8F3FF] text-[#0064FF]" },
                                                { text: "빠른 트렌드 캐치", color: "bg-[#FFEED4] text-[#FF8A00]" },
                                                { text: "비주얼 중심 평가", color: "bg-[#E1F5FE] text-[#0288D1]" },
                                                { text: "패키지 디자인 중시", color: "bg-[#F3E8FF] text-[#8638EA]" },
                                                { text: "온라인 바이럴 확인", color: "bg-[#F2F4F6] text-[#4E5968]" },
                                                { text: "플렉스(Flex)", color: "bg-[#FFF0F4] text-[#FF4785]" },
                                                { text: "새로운 브랜드 시도", color: "bg-[#E8FFF0] text-[#00A650]" },
                                                { text: "글로벌 트렌드 선도", color: "bg-[#E8F3FF] text-[#0064FF]" },
                                                { text: "이색적인 콜라보레이션", color: "bg-[#FFEED4] text-[#FF8A00]" },
                                            ],
                                            [
                                                { text: "실용적 가치 우선", color: "bg-[#E8FFF0] text-[#00A650]" },
                                                { text: "꼼꼼한 성분 비교", color: "bg-[#E1F5FE] text-[#0288D1]" },
                                                { text: "인증 마크 획득", color: "bg-[#F2F4F6] text-[#4E5968]" },
                                                { text: "사용자 찐리뷰", color: "bg-[#FFEED4] text-[#FF8A00]" },
                                                { text: "가성비 대용량", color: "bg-[#E8F3FF] text-[#0064FF]" },
                                                { text: "장기적인 효능 기대", color: "bg-[#F3E8FF] text-[#8638EA]" },
                                                { text: "전문가 추천 제품", color: "bg-[#FFF0F4] text-[#FF4785]" },
                                                { text: "부작용 우려 확인", color: "bg-[#F2F4F6] text-[#4E5968]" },
                                                { text: "오프라인 비교 체험", color: "bg-[#E1F5FE] text-[#0288D1]" },
                                                { text: "다용도 활용법", color: "bg-[#FFEED4] text-[#FF8A00]" },
                                                { text: "세트 상품 구성", color: "bg-[#E8FFF0] text-[#00A650]" },
                                                { text: "비교 리뷰 검색", color: "bg-[#E8F3FF] text-[#0064FF]" },
                                            ],
                                            [
                                                { text: "안정성과 성분 무해함", color: "bg-[#F2F4F6] text-[#4E5968]" },
                                                { text: "브랜드 신뢰도/역사", color: "bg-[#E8F3FF] text-[#0064FF]" },
                                                { text: "가족이 함께 쓰는", color: "bg-[#E1F5FE] text-[#0288D1]" },
                                                { text: "용량 대비 할인율", color: "bg-[#FFEED4] text-[#FF8A00]" },
                                                { text: "친환경 철학 동참", color: "bg-[#E8FFF0] text-[#00A650]" },
                                                { text: "자극 없는 사용감", color: "bg-[#F3E8FF] text-[#8638EA]" },
                                                { text: "무향/무색소 지향", color: "bg-[#FFF0F4] text-[#FF4785]" },
                                                { text: "높은 재구매/재방문", color: "bg-[#F2F4F6] text-[#4E5968]" },
                                                { text: "주변인 추천 및 맘카페", color: "bg-[#E1F5FE] text-[#0288D1]" },
                                                { text: "자발적 팬덤 형성", color: "bg-[#E8FFF0] text-[#00A650]" },
                                                { text: "빠른 새벽 배송/물류", color: "bg-[#E8F3FF] text-[#0064FF]" },
                                                { text: "합리적 정기 구독", color: "bg-[#FFEED4] text-[#FF8A00]" },
                                            ]
                                        ];
                                        const graphSet = MOCK_GRAPH_SETS[(selectedPersona.index || 0) % MOCK_GRAPH_SETS.length];

                                        // Pseudo-random position generator based on persona index and item index
                                        const getPosition = (idx: number, personaIdx: number) => {
                                            const seed = (personaIdx * 10) + idx;
                                            const rand = Math.abs(Math.sin(seed * 12.9898 + 78.233)) * 43758.5453;
                                            const randNormalized = rand - Math.floor(rand);

                                            // Radius from center: 20% to 42%
                                            const radius = 20 + randNormalized * 22;
                                            // Evenly spread with jitter
                                            const angleOffset = (personaIdx * 25); // Different start angle per persona
                                            const angleRadians = ((idx * (360 / graphSet.length)) + angleOffset + ((randNormalized - 0.5) * 30)) * (Math.PI / 180);

                                            // Calculate X and Y, assuming center is 50%, 50%
                                            // X needs to be skewed slightly because width is usually larger than height
                                            const x = 50 + (radius * 1.2) * Math.cos(angleRadians);
                                            const y = 50 + radius * Math.sin(angleRadians);

                                            // Bound within 10% to 90%
                                            const boundedX = Math.max(10, Math.min(90, x));
                                            const boundedY = Math.max(10, Math.min(90, y));

                                            return { top: `${boundedY}%`, left: `${boundedX}%` };
                                        };

                                        return (
                                            <div className="flex-1 w-full bg-[#FAFAFA] rounded-2xl border border-[#F2F4F6] relative overflow-hidden flex items-center justify-center p-8 min-h-[400px]">
                                                {/* Background subtle lines for aesthetic */}
                                                <svg className="absolute inset-0 w-full h-full opacity-[0.15]">
                                                    <g stroke="#0064FF" strokeWidth="1" strokeDasharray="4 4" fill="none">
                                                        <circle cx="50%" cy="50%" r="20%" />
                                                        <circle cx="50%" cy="50%" r="35%" />
                                                        <circle cx="50%" cy="50%" r="50%" />
                                                        <line x1="50%" y1="0%" x2="50%" y2="100%" />
                                                        <line x1="0%" y1="50%" x2="100%" y2="50%" />
                                                    </g>
                                                </svg>

                                                {/* Center Node */}
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90px] h-[90px] rounded-full bg-white shadow-[0_8px_30px_rgba(0,100,255,0.25)] border-4 border-[#0064FF] z-30 flex items-center justify-center p-1">
                                                    <div className="w-full h-full rounded-full overflow-hidden relative">
                                                        <Image src={selectedPersona.dbPersona?.imagePath || '/avatars/01.png'} alt="Center" fill className="object-cover" />
                                                    </div>
                                                </div>

                                                {/* Keyword Pills */}
                                                {graphSet.map((item, idx) => {
                                                    const pos = getPosition(idx, selectedPersona.index || 0);
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-1000 ease-out"
                                                            style={{ top: pos.top, left: pos.left }}
                                                        >
                                                            <div className={`px-4 py-2 font-bold text-[13px] rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.06)] whitespace-nowrap transition-transform hover:scale-105 hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] cursor-default ${item.color}`}>
                                                                {item.text}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Strategy Section */}
                                <div className="bg-white rounded-[1.5rem] shadow-sm border border-[#E5E8EB] p-8 mt-6">
                                    <h3 className="text-[18px] font-bold text-[#333333] mb-6 flex items-center gap-2">
                                        타겟 페르소나 콘텐츠 전략
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="bg-[#F9FAFB] p-6 rounded-2xl">
                                            <h4 className="text-[16px] font-bold text-[#333333] mb-4 text-rose-500">1. 라이프스타일 전체 개요</h4>
                                            <ul className="list-disc pl-5 space-y-2 text-[15px] font-medium text-[#4E5968] break-keep">
                                                <li>모바일을 통한 정보 습득과 온라인/앱 기반 구매가 익숙한 디지털 네이티브 성향.</li>
                                                <li>단순한 필요를 넘어서 가심비, 브랜드의 철학, 성분 등을 디테일하게 따지는 소비 패턴.</li>
                                                <li>SNS나 커뮤니티에서 실사용자 리뷰를 깊게 참고하며, 입소문(바이럴) 타겟이 됨.</li>
                                            </ul>
                                        </div>
                                        <div className="bg-[#F9FAFB] p-6 rounded-2xl">
                                            <h4 className="text-[16px] font-bold text-[#0064FF] mb-4">2. 검색 여정 및 관심 흐름</h4>
                                            <ul className="list-disc pl-5 space-y-2 text-[15px] font-medium text-[#4E5968] break-keep">
                                                <li>[Awareness] 일상에서의 불편함이나 새로운 트렌드 노출을 통해 관련 제품 카테고리를 검색 시작.</li>
                                                <li>[Consideration] 브랜드 비교, 성분 및 가격 분석, 유튜브 내돈내산 숏폼이나 블로그 후기 수집.</li>
                                                <li>[Conversion] 최저가 비교, 프로모션 혜택 타이밍에 맞춰 신뢰할 수 있는 공식채널/커머스몰에서 구매.</li>
                                            </ul>
                                        </div>
                                        <div className="bg-[#F9FAFB] p-6 rounded-2xl">
                                            <h4 className="text-[16px] font-bold text-amber-500 mb-4">3. 커뮤니케이션 전략 핵심</h4>
                                            <ul className="list-disc pl-5 space-y-2 text-[15px] font-medium text-[#4E5968] break-keep">
                                                <li>제품의 핵심 기능(USP)에 더불어 &quot;나의 라이프스타일이 어떻게 상승하는가&quot;를 보여주는 시각적 소구.</li>
                                                <li>객관성을 담보할 수 있는 리뷰 콘텐츠와 신뢰도 높은 인플루언서 마케팅 연계.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : selectedCompetitor ? (
                    <div className="flex-1 min-w-0 py-10 px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8 bg-[#F2F4F7]" >
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-[#333333] mb-2">{selectedCompetitor} 주요 소재 분석</h2>
                                <p className="text-[15px] text-[#4E5968]">AI와 Meta Ad Library 데이터를 융합하여 수집된 최근 광고 트렌드와 전략을 살펴봅니다.</p>

                                {competitorAds.length > 0 && !isLoadingSpecificAds && (() => {
                                    const activeCount = competitorAds.length;
                                    let totalDays = 0;
                                    let longRunningCount = 0;
                                    const typeCount: Record<string, number> = {};

                                    competitorAds.forEach(ad => {
                                        const startTime = ad.startDate ? new Date(ad.startDate).getTime() : Date.now();
                                        const daysActive = Math.max(0, Math.floor((Date.now() - startTime) / (1000 * 3600 * 24)));
                                        totalDays += daysActive;
                                        if (daysActive >= 30) {
                                            longRunningCount++;
                                        }

                                        const type = ad.type2 || ad.type1 || '알 수 없음';
                                        typeCount[type] = (typeCount[type] || 0) + 1;
                                    });

                                    const avgDays = activeCount > 0 ? Math.floor(totalDays / activeCount) : 0;
                                    let mainType = '-';
                                    let maxCount = 0;
                                    Object.entries(typeCount).forEach(([type, count]) => {
                                        if (count > maxCount) {
                                            maxCount = count;
                                            mainType = type;
                                        }
                                    });

                                    return (
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 mb-2">
                                            <div className="bg-white border flex flex-col justify-center border-[#E5E8EB] p-5 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                                <div className="text-[13px] font-bold text-[#8B95A1] mb-1">활성화된 소재</div>
                                                <div className="text-[22px] font-black text-[#333333]">{activeCount}개</div>
                                            </div>
                                            <div className="bg-white border flex flex-col justify-center border-[#E5E8EB] p-5 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                                <div className="text-[13px] font-bold text-[#8B95A1] mb-1">가장 많은 유형</div>
                                                <div className="text-[18px] font-black text-[#0064FF] truncate mt-1">{mainType}</div>
                                            </div>
                                            <div className="bg-white border flex flex-col justify-center border-[#E5E8EB] p-5 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                                <div className="text-[13px] font-bold text-[#8B95A1] mb-1">평균 게재 일수</div>
                                                <div className="text-[22px] font-black text-[#333333]">{avgDays}일</div>
                                            </div>
                                            <div className="bg-white border flex flex-col justify-center border-[#E5E8EB] p-5 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                                <div className="text-[13px] font-bold text-[#8B95A1] mb-1">장기 소재 (30일+)</div>
                                                <div className="text-[22px] font-black text-[#00A650]">{longRunningCount}건</div>
                                            </div>
                                        </div>
                                    );
                                })()}


                                {isVerifyingAds && (
                                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-500 rounded-full font-bold text-[13px] animate-pulse">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        검색어 유사도 기반 2차 노이즈 제거 분석 중...
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 relative">
                                <button
                                    onClick={() => {
                                        setIsHistoryOpen(!isHistoryOpen);
                                        if (!isHistoryOpen && selectedCompetitor) fetchHistoryLogs(selectedCompetitor);
                                    }}
                                    className="w-10 h-10 rounded-full bg-white border border-[#E5E8EB] flex items-center justify-center text-[#8B95A1] hover:text-[#333333] hover:shadow-sm transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] shrink-0 relative"
                                    title="분석 히스토리 보기"
                                >
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                                {isHistoryOpen && (
                                    <div className="absolute top-12 right-12 w-80 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#E5E8EB] overflow-hidden z-50">
                                        <div className="px-5 py-4 border-b border-[#F2F4F6] flex items-center justify-between bg-[#F9FAFB]">
                                            <h4 className="text-[14px] font-bold text-[#333333] flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-[#8B95A1]" />
                                                최근 로드된 히스토리
                                            </h4>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {isFetchingHistory ? (
                                                <div className="py-8 flex justify-center">
                                                    <Loader2 className="w-5 h-5 text-[#8B95A1] animate-spin" />
                                                </div>
                                            ) : historyLogs.length === 0 ? (
                                                <div className="py-8 text-center text-[#8B95A1] text-[13px]">
                                                    저장된 히스토리가 없습니다.
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    {historyLogs.map(log => {
                                                        const date = new Date(log.createdAt);
                                                        const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                                                        return (
                                                            <button
                                                                key={log.id}
                                                                onClick={() => loadHistoryLog(log.id)}
                                                                className="px-5 py-4 hover:bg-[#F2F4F6] transition-colors border-b border-[#F2F4F6] flex flex-col items-start gap-1"
                                                            >
                                                                <span className="text-[13px] font-bold text-[#333333]">{dateStr}</span>
                                                                <span className="text-[12px] text-[#8B95A1]">by {log.userName}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <button onClick={() => setSelectedCompetitor(null)} className="w-10 h-10 rounded-full bg-white border border-[#E5E8EB] flex items-center justify-center text-[#8B95A1] hover:text-[#333333] hover:shadow-sm transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] shrink-0">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {isLoadingSpecificAds ? (
                            <div className="w-full py-32 flex flex-col items-center justify-center gap-4 bg-white rounded-[2rem] border border-[#E5E8EB]">
                                <Loader2 className="w-10 h-10 text-[#0064FF] animate-spin" />
                                <div className="text-center">
                                    <p className="text-[18px] font-bold text-[#333333] mb-2">실시간 광고 소재 추적 중...</p>
                                    <p className="text-[14px] text-[#8B95A1]">Meta 및 Google 광고 라이브러리에서 최신 데이터를 가져오고 있습니다.</p>
                                </div>
                            </div>
                        ) : competitorAds.length === 0 ? (
                            <div className="w-full py-32 flex flex-col items-center justify-center gap-4 bg-white rounded-[2rem] border border-[#E5E8EB]">
                                <div className="w-16 h-16 bg-[#F2F4F7] rounded-full flex items-center justify-center mb-2">
                                    <Search className="w-8 h-8 text-[#AEB5BC]" />
                                </div>
                                <div className="text-center">
                                    <p className="text-[18px] font-bold text-[#333333] mb-2">집행 중인 광고가 없습니다</p>
                                    <p className="text-[14px] text-[#8B95A1] max-w-[300px] break-keep">현재 Meta (Facebook/Instagram) 광고 라이브러리에서 해당 브랜드로 활성화된 공식 광고 데이터를 찾을 수 없습니다.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {competitorAds.map((ad, idx) => (
                                        <div key={idx} className={`bg-white border border-[#E5E8EB] rounded-[1.5rem] p-6 shadow-sm flex flex-col h-full hover:border-[#0064FF]/30 transition-all group overflow-hidden ${invalidAdIds.has(ad.id) ? 'opacity-30 scale-95 grayscale duration-700' : 'duration-300'}`}>
                                            {/* Meta Ad Library Card Style Render */}
                                            {/* Top Metadata */}
                                            <div className="mb-4 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#E8FFF0] text-[#00A650] text-[12px] font-bold rounded-md">
                                                        <div className="w-1.5 h-1.5 bg-[#00A650] rounded-full" />
                                                        활성
                                                    </span>
                                                </div>
                                                <div className="text-[13px] text-[#4E5968]">라이브러리 ID: {ad.id}</div>
                                                <div className="text-[13px] text-[#4E5968]">{ad.startDate}에 게재 시작함</div>
                                                <div className="text-[13px] text-[#4E5968] flex items-center gap-1">
                                                    플랫폼 <span className="font-semibold">{ad.platform}</span>
                                                </div>
                                            </div>

                                            {/* 광고 상세 정보 보기 버튼 */}
                                            <a href={ad.link} target="_blank" rel="noreferrer" className="w-full py-2 bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#333333] font-bold text-[13px] rounded-lg text-center transition-colors mb-4 block">
                                                광고 소재 및 상세 정보 보기
                                            </a>

                                            <div className="h-[1px] w-full bg-[#E5E8EB] mb-4" />

                                            {/* 브랜드 프로필 & 이름 */}
                                            <div className="flex items-center gap-3 mb-4">
                                                {ad.profileLogo ? (
                                                    <img src={ad.profileLogo} alt={ad.pageName || 'Brand'} className="w-10 h-10 rounded-full border border-[#E5E8EB] object-cover shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-[#F2F4F6] flex items-center justify-center shrink-0 border border-[#E5E8EB]">
                                                        <User className="w-5 h-5 text-[#8B95A1]" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="font-bold text-[#333333] text-[15px]">{ad.pageName || selectedCompetitor}</h3>
                                                    <p className="text-[13px] text-[#8B95A1]">광고</p>
                                                </div>
                                            </div>

                                            {/* 광고 본문 내용 */}
                                            <h4 className="text-[14px] text-[#333333] leading-relaxed break-keep whitespace-pre-wrap mb-4 shrink-0">
                                                {ad.copy}
                                            </h4>

                                            {/* Dynamic Image/Video from our local scraper */}
                                            <AdImage mediaUrl={ad.mediaUrl} link={ad.link} />

                                            <div className="flex flex-col gap-4 border-t border-[#F2F4F6] pt-4 mt-auto">
                                                {/* AI Analysis Badges */}
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${ad.type1 === '프로모션' ? 'text-[#0064FF] bg-[#0064FF]/10' :
                                                            ad.type1 === '리뷰/UGC' ? 'text-[#FF4785] bg-[#FF4785]/10' :
                                                                'text-[#8B95A1] bg-[#F2F4F6]'
                                                            }`}>
                                                            {ad.type1}
                                                        </span>
                                                        <span className="text-[11px] font-medium text-[#4E5968] bg-[#F2F4F6] px-2 py-1 rounded-md">
                                                            {ad.type2 !== '-' ? ad.type2 : '일반형'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-1.5 bg-[#F9FAFB] px-2.5 py-2 rounded-lg border border-[#E5E8EB] text-[13px] text-[#4E5968]">
                                                    <Target className="w-4 h-4 text-[#8B95A1] shrink-0 mt-0.5" />
                                                    <span className="font-semibold break-keep leading-snug">{ad.targetGroup}</span>
                                                </div>

                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {nextAdCursor && (
                                    <div className="flex justify-center mt-8">
                                        <button
                                            onClick={loadMoreAds}
                                            disabled={isLoadMore}
                                            className="px-8 py-3 bg-white border border-[#E5E8EB] hover:border-[#0064FF] text-[#333333] font-bold text-[14px] rounded-xl shadow-sm transition-all hover:shadow-md flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isLoadMore ? (
                                                <Loader2 className="w-5 h-5 animate-spin text-[#0064FF]" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5" />
                                            )}
                                            {isLoadMore ? '광고 데이터를 더 불러오는 중...' : '더 많은 광고 로드하기 (12개 추가)'}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    children
                )
            }
        </>
    );
}
