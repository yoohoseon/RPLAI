"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Plus, Image as ImageIcon, Sparkles as SparklesIcon, Save, Download, Instagram, Youtube, Lock, PenTool, Check, RotateCcw, Edit2, FileSpreadsheet, ArrowUpDown, Loader2, Inbox, Wand2 } from "lucide-react";
import * as XLSX from 'xlsx';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { generateMarketingContent } from "@/app/lib/generation-actions";

const KEYWORD_CATEGORIES = [
    { key: "essence", label: "브랜드 에센스", desc: "무드와 핵심 가치" },
    { key: "season", label: "시즌/TPO", desc: "상황과 장소" },
    { key: "painPoint", label: "페인포인트", desc: "문제와 니즈" },
    { key: "trend", label: "트렌드/밈", desc: "유행과 감성" },
    { key: "cta", label: "CTA (콜투액션)", desc: "행동 유도 문구" }
];

const TOSS_BLUE = "#3182F6";
const TOSS_GRAY_BG = "#F2F4F6";
const TOSS_TEXT_DARK = "#191F28";
const TOSS_TEXT_GRAY = "#4E5968";

interface Theme {
    themeName: string;
    description: string;
    keywords: Record<string, string[]>;
}

interface GenerationDashboardProps {
    strategy: {
        id: string;
        conceptName: string;
        conceptMessage: string;
        timing: string;
        goal: string;
        themes: Theme[];
    };
    analysisId: string;
    brandName: string;
    userEmail: string;
}

export function GenerationDashboard({ strategy, brandName, userEmail }: GenerationDashboardProps) {
    const { themes } = strategy;
    const [activeThemeIdx, setActiveThemeIdx] = useState(0);
    const [selectedKeywords, setSelectedKeywords] = useState<{ [category: string]: string[] }>({
        essence: [], season: [], painPoint: [], trend: [], cta: []
    });
    // Store user-added keywords per theme and category
    const [customKeywords, setCustomKeywords] = useState<{ [themeIdx: number]: { [category: string]: string[] } }>({});

    const [isGeneratingContent, setIsGeneratingContent] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isPromptCopied, setIsPromptCopied] = useState(false);
    const [isEditingVisual, setIsEditingVisual] = useState(false);
    const [isEditingCopy, setIsEditingCopy] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'abc'>('latest');

    const [savedContents, setSavedContents] = useState<Array<{
        hook?: string;
        body?: string;
        cta?: string;
        hashtags?: string;
        imageDescription?: string;
        imagePrompt?: string;
        keywords?: { [category: string]: string[] };
        themeIdx?: number;
        createdAt?: number;
        creatorEmail?: string;
    }>>([]);

    // Load saved contents from localStorage when strategy.id changes
    useEffect(() => {
        if (typeof window !== 'undefined' && strategy.id) {
            const storageKey = `rplai_saved_contents_${strategy.id}_${userEmail}`;
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                try {
                    setSavedContents(JSON.parse(saved));
                } catch (e) {
                    console.error('Failed to parse saved contents', e);
                    setSavedContents([]);
                }
            } else {
                setSavedContents([]);
            }
        }
    }, [strategy.id]);

    const [generatedContent, setGeneratedContent] = useState<{
        hook?: string;
        body?: string;
        cta?: string;
        hashtags?: string;
        imageDescription?: string;
        imagePrompt?: string;
        keywords?: { [category: string]: string[] };
        themeIdx?: number;
    } | null>(null);

    // Save contents to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== 'undefined' && strategy.id && savedContents.length > 0) {
            const storageKey = `rplai_saved_contents_${strategy.id}_${userEmail}`;
            localStorage.setItem(storageKey, JSON.stringify(savedContents));
        }
    }, [savedContents, strategy.id]);

    const toggleKeyword = (category: string, keyword: string) => {
        setSelectedKeywords(prev => {
            const list = prev[category] || [];
            if (list.includes(keyword)) {
                return { ...prev, [category]: list.filter(k => k !== keyword) };
            } else {
                return { ...prev, [category]: [...list, keyword] };
            }
        });
    };

    const handleGenerateContent = async (isAutoSelect: boolean = false) => {
        setIsGeneratingContent(true);
        setIsEditingVisual(false);
        setIsEditingCopy(false);

        let finalKeywords = selectedKeywords;

        // If AI Recommended mode, pick keywords first (Simulating AI selection)
        if (isAutoSelect) {
            const demoTheme = themes[activeThemeIdx];
            if (demoTheme && demoTheme.keywords) {
                const newSelections: { [k: string]: string[] } = { essence: [], season: [], painPoint: [], trend: [], cta: [] };
                Object.keys(newSelections).forEach(key => {
                    const list = demoTheme.keywords[key] || [];
                    if (list.length > 0) {
                        // Pick 1-2 random keywords per category
                        newSelections[key] = list
                            .sort(() => 0.5 - Math.random())
                            .slice(0, Math.max(1, Math.floor(Math.random() * 2) + 1));
                    }
                });
                setSelectedKeywords(newSelections);
                finalKeywords = newSelections;
            }
        }

        try {
            const result = await generateMarketingContent(
                strategy.conceptName,
                strategy.conceptMessage,
                finalKeywords
            );

            if (result.success && result.data) {
                setGeneratedContent({
                    ...result.data,
                    keywords: finalKeywords,
                    themeIdx: activeThemeIdx
                });
            } else {
                console.error("Content generation failed:", result.error);
                // Fallback to minimal data if needed, but let's just show an error toast/log for now
            }
        } catch (error) {
            console.error("Error in handleGenerateContent:", error);
        } finally {
            setIsGeneratingContent(false);
        }
    };

    const handleCopyAll = () => {
        if (!generatedContent) return;
        const textToCopy = `${generatedContent.hook || ''}\n\n${generatedContent.body || ''}\n\n${generatedContent.cta || ''}\n\n${generatedContent.hashtags || ''}`.trim();
        navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleContentChange = (key: keyof Exclude<typeof generatedContent, null>, value: string) => {
        setGeneratedContent(prev => prev ? { ...prev, [key]: value } : prev);
    };

    const isAlreadySaved = generatedContent
        ? savedContents.some(item => item.hook === generatedContent.hook && item.body === generatedContent.body)
        : false;

    const handleSaveContent = () => {
        if (!generatedContent || isAlreadySaved) return;
        setIsSaving(true);
        const itemToSave = {
            ...generatedContent,
            createdAt: Date.now(),
            creatorEmail: userEmail
        };
        setSavedContents(prev => [itemToSave, ...prev]);
        setTimeout(() => setIsSaving(false), 1000);
    };

    const sortedContents = [...savedContents].sort((a, b) => {
        if (sortBy === 'latest') return (b.createdAt || 0) - (a.createdAt || 0);
        if (sortBy === 'oldest') return (a.createdAt || 0) - (b.createdAt || 0);
        if (sortBy === 'abc') return (a.hook || '').localeCompare(b.hook || '');
        return 0;
    });

    const totalSelected = Object.values(selectedKeywords).flat().length;

    const handleExportToExcel = () => {
        if (sortedContents.length === 0) return;

        // Prepare data for Excel
        const exportData = sortedContents.map((item, index) => ({
            '순번': index + 1,
            '브랜드명': brandName,
            '캠페인 콘셉명': strategy.conceptName,
            '핵심 메시지': strategy.conceptMessage,
            '발행 예정 시기': strategy.timing,
            '캠페인 목표': strategy.goal,
            '테마': item.themeIdx !== undefined ? themes[item.themeIdx]?.themeName : '-',
            'Hook (광고 카피)': item.hook || '',
            'Body (본문 내용)': item.body || '',
            'CTA (행동 유도)': item.cta || '',
            '해시태그': item.hashtags || '',
            '비주얼 구성 가이드': item.imageDescription || '',
            '이미지 생성 프롬프트': item.imagePrompt || '',
            '조합된 키워드': item.keywords ? Object.entries(item.keywords)
                .filter(([_, kws]) => kws.length > 0)
                .map(([cat, kws]) => {
                    const catLabel = KEYWORD_CATEGORIES.find(c => c.key === cat)?.label || cat;
                    return `${catLabel}: ${kws.join(', ')}`;
                })
                .join(' / ') : ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // Adjust column widths
        const wscols = [
            { wch: 5 },  // 순번
            { wch: 15 }, // 브랜드명
            { wch: 25 }, // 캠페인 콘셉명
            { wch: 40 }, // 핵심 메시지
            { wch: 15 }, // 발행 예정 시기
            { wch: 20 }, // 캠페인 목표
            { wch: 15 }, // 테마
            { wch: 40 }, // Hook
            { wch: 60 }, // Body
            { wch: 30 }, // CTA
            { wch: 30 }, // 해시태그
            { wch: 50 }, // 비주얼
            { wch: 50 }, // 프롬프트
            { wch: 40 }  // 키워드
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "저장된 기획안");

        const today = new Date();
        const yymmdd = today.getFullYear().toString().slice(2) +
            (today.getMonth() + 1).toString().padStart(2, '0') +
            today.getDate().toString().padStart(2, '0');
        const hhmm = today.getHours().toString().padStart(2, '0') +
            today.getMinutes().toString().padStart(2, '0');
        const fileName = `골드넥스_RPLAI_${brandName}_콘텐츠_${yymmdd}_${hhmm}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const savedContentsList = sortedContents.length > 0 && (
        <div className="pt-6 flex flex-col gap-4 pb-8">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold flex items-center gap-2 text-foreground/80">
                    <Save className="w-4 h-4 text-primary" />
                    저장된 기획안 ({sortedContents.length}건)
                </h4>
                <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                    <SelectTrigger className="w-[110px] h-8 text-[11px] font-bold rounded-full bg-white dark:bg-slate-900 border-border/40">
                        <div className="flex items-center gap-1.5">
                            <ArrowUpDown className="w-3 h-3 text-primary" />
                            <SelectValue placeholder="정렬 방식" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="latest" className="text-[11px] font-bold">최신순</SelectItem>
                        <SelectItem value="oldest" className="text-[11px] font-bold">이전순</SelectItem>
                        <SelectItem value="abc" className="text-[11px] font-bold">ABC순</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-col gap-3">
                {sortedContents.map((item, idx) => (
                    <div
                        key={idx}
                        onClick={() => {
                            setGeneratedContent(item);
                            if (item.keywords) {
                                setSelectedKeywords(item.keywords);
                            }
                            if (item.themeIdx !== undefined) {
                                setActiveThemeIdx(item.themeIdx);
                            }
                            const container = document.getElementById('generation-result-container');
                            if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="bg-[#F2F4F7] border-none rounded-2xl p-5 flex flex-col gap-2 hover:bg-[#F2F4F6] transition-all cursor-pointer group"
                    >
                        <p className="font-bold text-[15px] text-[#333333] line-clamp-1 group-hover:text-[#333333] transition-colors">{item.hook}</p>
                        <p className="text-[13px] text-[#4E5968] line-clamp-2 leading-relaxed">{item.body}</p>
                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold bg-[#F2F4F6]/10 text-[#333333] px-2.5 py-1 rounded-lg shrink-0">Instagram</span>
                                <span className="text-[11px] font-medium text-[#4E5968] line-clamp-1 flex-1">💡 {item.imageDescription}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button
                variant="outline"
                size="lg"
                className="w-full mt-4 h-14 rounded-2xl text-sm font-bold text-[#333333] border-none bg-[#F2F4F6] hover:bg-[#E5E8EB] transition-all gap-2"
                onClick={handleExportToExcel}
            >
                <FileSpreadsheet className="w-5 h-5" />
                보관함 전체 엑셀 다운로드 ({sortedContents.length}건)
            </Button>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Side: Keyword Selection */}
            <div className="flex flex-col h-full gap-4">
                <h3 className="text-2xl font-bold tracking-tight text-[#333333] flex items-center gap-2 mb-2">
                    <Sparkles className="w-6 h-6 text-[#333333]" />
                    캠페인 앵글 및 키워드 선택
                </h3>
                <Card className="rounded-[2rem] border-none bg-white flex flex-col min-h-[700px] transition-all overflow-hidden h-full shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                    {themes && themes.length > 0 ? (
                        <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
                            <Tabs value={activeThemeIdx.toString()} onValueChange={(val) => setActiveThemeIdx(parseInt(val))} className="w-full h-full flex flex-col">
                                <div className="p-6 border-none">
                                    <TabsList className="w-full h-auto p-1 grid grid-cols-3 gap-1 rounded-2xl bg-[#F2F4F6]">
                                        {themes.map((t, i) => (
                                            <TabsTrigger key={i} value={i.toString()} className="whitespace-normal text-xs sm:text-sm py-3 px-2 text-center font-bold tracking-tight rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#333333] data-[state=active]:shadow-sm transition-all h-full break-keep border-none">
                                                {t.themeName}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                    <div className="mt-6 px-1 flex gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#F2F4F6]/10 flex items-center justify-center shrink-0">
                                            <Sparkles className="w-5 h-5 text-[#333333]" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#333333] mb-1">AI 앵글 추천</p>
                                            <p className="text-[15px] font-semibold text-[#333333] leading-snug break-keep">
                                                {themes[activeThemeIdx].description}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 space-y-12 scrollbar-hide">
                                    {KEYWORD_CATEGORIES.map(cat => (
                                        <div key={cat.key} className="space-y-5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-[17px] font-bold tracking-tight text-[#333333]">
                                                        {cat.label}
                                                    </h4>
                                                    <span className="text-xs font-medium text-[#4E5968] bg-[#F2F4F6] px-2.5 py-1 rounded-lg">
                                                        {cat.desc}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-bold text-[#333333]">
                                                    {selectedKeywords[cat.key]?.length || 0} 선택됨
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {(() => {
                                                    const standardKeywords = themes[activeThemeIdx].keywords?.[cat.key] || [];
                                                    const extraKeywords = customKeywords[activeThemeIdx]?.[cat.key] || [];
                                                    const allKeywords = [...standardKeywords, ...extraKeywords];

                                                    return allKeywords.map((kw: string, i: number) => {
                                                        const isSelected = selectedKeywords[cat.key]?.includes(kw);
                                                        return (
                                                            <button
                                                                key={i}
                                                                onClick={() => toggleKeyword(cat.key, kw)}
                                                                className={`inline-flex items-center justify-center px-4 py-2.5 text-[14px] font-[600] transition-all rounded-full select-none active:scale-95 duration-200 cursor-pointer border ${isSelected
                                                                    ? "bg-[#333333] text-white border-[#333333] shadow-sm"
                                                                    : "bg-[#F2F4F6] text-[#4E5968] border-transparent hover:bg-[#E5E8EB]"
                                                                    }`}
                                                            >
                                                                {isSelected && <Check className="w-4 h-4 mr-1.5" />}
                                                                {kw}
                                                            </button>
                                                        );
                                                    });
                                                })()}
                                                <button
                                                    onClick={() => {
                                                        const newKw = prompt(`${cat.label} 카테고리에 추가할 키워드를 입력해주세요.`);
                                                        if (newKw && newKw.trim()) {
                                                            const trimmedKw = newKw.trim();
                                                            // Add to custom keywords for this theme and category
                                                            setCustomKeywords(prev => {
                                                                const themeCustom = prev[activeThemeIdx] || {};
                                                                const catCustom = themeCustom[cat.key] || [];
                                                                if (catCustom.includes(trimmedKw)) return prev;
                                                                return {
                                                                    ...prev,
                                                                    [activeThemeIdx]: {
                                                                        ...themeCustom,
                                                                        [cat.key]: [...catCustom, trimmedKw]
                                                                    }
                                                                };
                                                            });
                                                            // Automatically select it
                                                            toggleKeyword(cat.key, trimmedKw);
                                                        }
                                                    }}
                                                    className="inline-flex items-center justify-center px-4 py-2.5 text-[14px] font-[600] transition-all rounded-full select-none active:scale-95 duration-200 cursor-pointer border border-dashed border-[#ABB3BB] text-[#4E5968] hover:bg-[#F2F4F6] bg-transparent ml-1"
                                                >
                                                    <Plus className="w-4 h-4 mr-1.5" />
                                                    직접 추가
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="mt-auto pt-10 pb-4 flex gap-4">
                                        <Button
                                            size="lg"
                                            variant="ghost"
                                            className="grow basis-1/3 h-16 rounded-[24px] text-[16px] font-bold bg-[#F2F4F6] text-[#4E5968] border-none hover:bg-[#E5E8EB] active:scale-[0.98] transition-all"
                                            onClick={() => handleGenerateContent(true)}
                                            disabled={isGeneratingContent}
                                        >
                                            <SparklesIcon className="w-5 h-5 mr-2 text-[#333333]" />
                                            AI 추천 조합
                                        </Button>
                                        <Button
                                            size="lg"
                                            className="grow basis-2/3 h-16 rounded-[24px] text-[17px] font-bold bg-[#333333] text-white hover:bg-[#191F28] active:bg-[#000000] shadow-sm active:scale-[0.98] transition-all group border-none disabled:bg-[#ABB3BB] disabled:text-white"
                                            onClick={() => handleGenerateContent(false)}
                                            disabled={isGeneratingContent || totalSelected === 0}
                                        >
                                            {isGeneratingContent ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    기획안 생성 중...
                                                </>
                                            ) : (
                                                <>
                                                    <PenTool className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                                                    지금 키워드로 만들기
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Tabs>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">전략 키워드 데이터가 없습니다.</div>
                    )}
                </Card>
            </div>

            {/* Right Side: Generation Result */}
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-2xl font-bold tracking-tight text-[#333333] flex items-center gap-2">
                        <Wand2 className="w-6 h-6 text-[#333333]" />
                        콘텐츠 생성 결과
                    </h3>

                    {/* Platform Selector */}
                    <div className="flex bg-[#F2F4F6] rounded-full p-1">
                        <button className="flex items-center gap-2 px-6 py-2 rounded-full bg-white text-sm font-bold shadow-sm text-[#333333]">
                            <Instagram className="w-4 h-4 text-pink-500" />
                            인스타그램
                        </button>
                        <button disabled className="flex items-center gap-1.5 px-6 py-2 rounded-full text-sm font-bold text-[#4E5968] opacity-50 cursor-not-allowed">
                            <Youtube className="w-4 h-4" />
                            유튜브
                            <Lock className="w-3 h-3 ml-0.5" />
                        </button>
                    </div>
                </div>

                <Card className="rounded-[2rem] border-none bg-white flex flex-col flex-1 transition-all overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 min-h-[700px]">
                    {!generatedContent && !isGeneratingContent ? (
                        <div className="flex-1 flex flex-col p-2 animate-in fade-in duration-500 max-h-full overflow-hidden">
                            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent flex flex-col pb-24 px-2">
                                {savedContents.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
                                        <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                                            <SparklesIcon className="w-10 h-10 text-muted-foreground/30" />
                                        </div>
                                        <h4 className="text-xl font-bold mb-3 text-foreground/80">생성된 콘텐츠가 없습니다</h4>
                                        <p className="text-muted-foreground text-sm max-w-[280px]">
                                            좌측에서 원하는 앵글과 키워드를 조합하여 <strong>[AI 추천 조합]</strong> 버튼을 눌러보세요.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                                        {savedContentsList}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : isGeneratingContent ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
                            <div className="w-20 h-20 relative flex items-center justify-center mb-6">
                                <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                                <SparklesIcon className="w-8 h-8 text-primary animate-pulse" />
                            </div>
                            <h4 className="text-xl font-bold mb-3 text-foreground">AI가 콘텐츠를 제작 중입니다</h4>
                            <p className="text-muted-foreground text-sm max-w-[280px]">
                                선택하신 {totalSelected}개의 키워드를 바탕으로 트렌디한 카피를 작성하고 있어요. 조금만 기다려주세요!
                            </p>
                        </div>
                    ) : generatedContent != null ? (
                        <div id="generation-result-container" className="flex-1 flex flex-col p-2 animate-in slide-in-from-bottom-4 fade-in duration-500 max-h-full overflow-hidden">
                            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent flex flex-col gap-6 pb-24 px-2">

                                {/* Visual Prompt Section (Instagram Square Mock) */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[17px] font-bold flex items-center gap-2 text-[#333333]">
                                            <ImageIcon className="w-5 h-5 text-[#333333]" />
                                            인스타그램 비주얼 가이드
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="ghost" className="h-9 px-4 rounded-full text-xs font-bold text-[#4E5968] bg-[#F2F4F6] hover:bg-[#E5E8EB]">
                                                        <SparklesIcon className="w-3.5 h-3.5 mr-1.5 text-[#333333]" />
                                                        영문 프롬프트
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-lg rounded-[2rem] border-none shadow-2xl flex flex-col items-stretch max-h-[85vh] p-6 bg-white !pr-6">
                                                    <DialogHeader className="shrink-0 mb-2">
                                                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-[#333333]">
                                                            <SparklesIcon className="w-5 h-5 text-[#333333]" />
                                                            AI 프롬프트 (Midjourney)
                                                        </DialogTitle>
                                                    </DialogHeader>
                                                    {/* 기존 코드에서 w-full(너비 100%)과 flex-shrink-0 방지 등을 보강했습니다. */}
                                                    <div className="w-full min-w-0 bg-[#191F28] text-[#F9FAFB] p-6 rounded-2xl text-[14px] font-mono leading-relaxed break-words select-all overflow-y-auto flex-1 min-h-[200px] scrollbar-thin scrollbar-thumb-white/20">
                                                        {generatedContent?.imagePrompt}
                                                    </div>
                                                    <div className="flex justify-end mt-4 shrink-0 w-full">
                                                        <Button size="lg" onClick={() => {
                                                            navigator.clipboard.writeText(generatedContent?.imagePrompt || "");
                                                            setIsPromptCopied(true);
                                                            setTimeout(() => setIsPromptCopied(false), 2000);
                                                        }} className="rounded-2xl h-12 px-6 bg-[#F2F4F6] text-[#333333] font-bold hover:bg-[#E5E8EB]">
                                                            {isPromptCopied ? (
                                                                <>
                                                                    <Check className="w-4 h-4 mr-1.5 text-green-600" />
                                                                    복사 완료!
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Download className="w-4 h-4 mr-1.5" />
                                                                    프롬프트 복사하기
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                            <Button size="sm" variant="ghost" className="h-9 px-4 rounded-full text-xs font-bold text-[#4E5968] hover:bg-[#F2F4F6]" onClick={() => setIsEditingVisual(!isEditingVisual)}>
                                                {isEditingVisual ? "수정 완료" : "내용 수정"}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="bg-[#F2F4F7] border-none rounded-[2rem] p-6 flex flex-col sm:flex-row gap-6 items-start">
                                        <div className="aspect-square w-full max-w-[140px] shrink-0 rounded-2xl bg-[#E5E8EB] flex flex-col items-center justify-center text-center p-4">
                                            <ImageIcon className="w-6 h-6 text-[#ABB3BB] mb-2" />
                                            <span className="text-[10px] font-bold text-[#ABB3BB] uppercase tracking-wider">
                                                Image
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[15px] font-semibold text-[#333333] leading-relaxed">
                                                {isEditingVisual ? (
                                                    <Textarea
                                                        value={generatedContent?.imageDescription || ''}
                                                        onChange={(e) => handleContentChange('imageDescription', e.target.value)}
                                                        className="min-h-[100px] bg-white border-none text-[15px] rounded-xl"
                                                    />
                                                ) : (
                                                    <p className="whitespace-pre-wrap">{generatedContent?.imageDescription}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Copywriting Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[17px] font-bold flex items-center gap-2 text-[#333333]">
                                            <PenTool className="w-5 h-5 text-[#333333]" />
                                            인스타그램 본문 카피
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="ghost" className="h-9 px-4 rounded-full text-xs font-bold text-[#4E5968] hover:bg-[#F2F4F6]" onClick={() => setIsEditingCopy(!isEditingCopy)}>
                                                {isEditingCopy ? "수정 완료" : "내용 수정"}
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-9 px-4 rounded-full text-xs font-bold text-[#333333] bg-[#F2F4F6]/10 hover:bg-[#F2F4F6]/20 transition-all font-bold" onClick={handleCopyAll}>
                                                {isCopied ? "복사 완료!" : "전체 복사"}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="bg-[#F2F4F7] border-none rounded-[2rem] p-8 flex flex-col gap-4 text-[15px] font-semibold text-[#333333]">
                                        {isEditingCopy ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs font-bold text-[#4E5968] ml-2 mb-1.5 block">훅 (Hook)</label>
                                                    <Input
                                                        value={generatedContent?.hook || ''}
                                                        onChange={(e) => handleContentChange('hook', e.target.value)}
                                                        className="font-bold text-lg bg-white border-none h-12 rounded-xl"
                                                        placeholder="Hook 문구"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-[#4E5968] ml-2 mb-1.5 block">본문 (Body)</label>
                                                    <Textarea
                                                        value={generatedContent?.body || ''}
                                                        onChange={(e) => handleContentChange('body', e.target.value)}
                                                        className="min-h-[160px] bg-white border-none text-[15px] rounded-xl leading-relaxed"
                                                        placeholder="본문 내용을 입력하세요"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-[#4E5968] ml-2 mb-1.5 block">콜투액션 (CTA)</label>
                                                    <Input
                                                        value={generatedContent?.cta || ''}
                                                        onChange={(e) => handleContentChange('cta', e.target.value)}
                                                        className="font-bold bg-white border-none h-12 rounded-xl"
                                                        placeholder="CTA 문구"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-[#4E5968] ml-2 mb-1.5 block">해시태그 (Hashtags)</label>
                                                    <Input
                                                        value={generatedContent?.hashtags || ''}
                                                        onChange={(e) => handleContentChange('hashtags', e.target.value)}
                                                        className="font-bold text-[#333333] bg-white border-none h-12 rounded-xl"
                                                        placeholder="#해시태그"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <p className="text-xl font-bold bg-white p-6 rounded-2xl shadow-sm border-none">
                                                    {generatedContent?.hook}
                                                </p>
                                                <p className="text-[15px] font-medium text-[#4E5968] leading-loose whitespace-pre-wrap px-1">
                                                    {generatedContent?.body}
                                                </p>
                                                <div className="h-px w-full bg-[#F2F4F6]"></div>
                                                <div className="space-y-4">
                                                    <p className="font-bold flex items-start gap-2">
                                                        {generatedContent?.cta}
                                                    </p>
                                                    <p className="text-[#333333] font-bold leading-relaxed text-[14px]">
                                                        {generatedContent?.hashtags}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-auto pt-8 flex justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        className="rounded-2xl px-8 h-14 text-base font-bold bg-[#F2F4F6] text-[#4E5968] border-none hover:bg-[#E5E8EB] transition-all"
                                        onClick={() => handleGenerateContent(false)}
                                        disabled={isGeneratingContent || totalSelected === 0}
                                    >
                                        <RotateCcw className="w-5 h-5 mr-2" />
                                        새로 만들기
                                    </Button>
                                    <Button
                                        className={`rounded-2xl px-10 h-14 text-base font-bold transition-all shadow-md ${isAlreadySaved ? 'bg-[#ABB3BB] text-white cursor-not-allowed' : 'bg-[#333333] text-white hover:bg-[#191F28] active:bg-[#000000]'}`}
                                        onClick={handleSaveContent}
                                        disabled={isSaving || isAlreadySaved}
                                    >
                                        {isSaving ? (
                                            "저장 중..."
                                        ) : isAlreadySaved ? (
                                            "보관 완료"
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5 mr-2" />
                                                이 기획안 저장하기
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Saved Contents Section */}
                                {savedContentsList}
                            </div>
                        </div>
                    ) : null}
                </Card>
            </div >
        </div >
    );
}
