"use client";

import { useState, useEffect } from "react";
import { Sparkles, Plus, Image as ImageIcon, Sparkles as SparklesIcon, Save, Download, Instagram, Youtube, Lock, PenTool, Check, RotateCcw, Edit2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const KEYWORD_CATEGORIES = [
    { key: "essence", label: "브랜드 에센스", desc: "무드와 핵심 가치" },
    { key: "season", label: "시즌/TPO", desc: "상황과 장소" },
    { key: "painPoint", label: "페인포인트", desc: "문제와 니즈" },
    { key: "trend", label: "트렌드/밈", desc: "유행과 감성" },
    { key: "cta", label: "CTA (콜투액션)", desc: "행동 유도 문구" }
];

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
}

export function GenerationDashboard({ strategy }: GenerationDashboardProps) {
    const { themes } = strategy;
    const [activeThemeIdx, setActiveThemeIdx] = useState(0);
    const [selectedKeywords, setSelectedKeywords] = useState<{ [category: string]: string[] }>({
        essence: [], season: [], painPoint: [], trend: [], cta: []
    });

    const [isGeneratingContent, setIsGeneratingContent] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isEditingVisual, setIsEditingVisual] = useState(false);
    const [isEditingCopy, setIsEditingCopy] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedContents, setSavedContents] = useState<Array<{
        hook?: string;
        body?: string;
        cta?: string;
        hashtags?: string;
        imageDescription?: string;
        imagePrompt?: string;
    }>>([]);
    const [generatedContent, setGeneratedContent] = useState<{
        hook?: string;
        body?: string;
        cta?: string;
        hashtags?: string;
        imageDescription?: string;
        imagePrompt?: string;
    } | null>(null);

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

        // 시연용 딜레이 및 데이터 세팅 
        setTimeout(() => {
            if (isAutoSelect) {
                // (1) 데모용: AI에 의해 키워드가 자동 선택되는 연출 
                const demoTheme = themes[activeThemeIdx];
                if (demoTheme && demoTheme.keywords) {
                    const newSelections: { [k: string]: string[] } = { essence: [], season: [], painPoint: [], trend: [], cta: [] };
                    Object.keys(newSelections).forEach(key => {
                        const list = demoTheme.keywords[key] || [];
                        if (list.length > 0) {
                            // 각 카테고리별로 무작위 1~2개 선택 
                            newSelections[key] = list.slice(0, Math.max(1, Math.floor(Math.random() * 2) + 1));
                        }
                    });
                    setSelectedKeywords(newSelections);
                }
            }

            // (2) 생성 결과 세팅 (단일 결과)
            setGeneratedContent({
                hook: "완벽한 하루를 완성하는 단 하나의 선택 ✨",
                body: "기다리던 그 순간이 마침내 찾아왔습니다.\n우리가 찾던 본질적인 아름다움, 이제 일상 속 자연스러운 변화로 직접 경험해보세요.",
                cta: "지금 프로필 링크에서 새로운 컬렉션을 만나보세요!",
                hashtags: "#신제품런칭 #일상을바꾸다 #브랜드캠페인 #라이프스타일 #트렌드",
                imageDescription: "미니멀하고 세련된 느낌의 스튜디오 배경에서 은은한 자연 채광을 받으며 매끄럽게 연출된 브랜드 신제품 화보입니다. 프리미엄하고 모던한 감성을 시각적으로 전달합니다.",
                imagePrompt: "1:1 aspect ratio, A sleek and modern product showcase in a minimalist studio environment, soft natural lighting, high-end commercial photography style."
            });
            setIsGeneratingContent(false);
        }, 1500);
    };

    const handleCopyAll = () => {
        if (!generatedContent) return;
        const textToCopy = `${generatedContent.hook || ''}\n\n${generatedContent.body || ''}\n\n👉 ${generatedContent.cta || ''}\n\n${generatedContent.hashtags || ''}`.trim();
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
        setSavedContents(prev => [generatedContent, ...prev]);
        setTimeout(() => setIsSaving(false), 1000);
    };

    const totalSelected = Object.values(selectedKeywords).flat().length;

    const savedContentsList = savedContents.length > 0 && (
        <div className="pt-6 flex flex-col gap-4 pb-8">
            <h4 className="text-sm font-extrabold flex items-center gap-2 text-foreground/80">
                <Save className="w-4 h-4 text-primary" />
                저장된 기획안 ({savedContents.length}건)
            </h4>
            <div className="flex flex-col gap-3">
                {savedContents.map((item, idx) => (
                    <div key={idx} className="bg-white/60 dark:bg-slate-900/60 border border-border/60 rounded-xl p-4 flex flex-col gap-2 hover:border-primary/40 transition-colors shadow-sm cursor-pointer group">
                        <p className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">{item.hook}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.body}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-sm shrink-0">Instagram</span>
                            <span className="text-[10px] text-muted-foreground line-clamp-1 flex-1">💡 {item.imageDescription}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Side: Keyword Selection */}
            <div className="flex flex-col h-full gap-4">
                <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    캠페인 앵글 및 키워드 선택
                </h3>
                <Card className="rounded-3xl border-border/40 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md flex flex-col min-h-[700px] transition-all overflow-hidden h-full shadow-sm">
                    {themes && themes.length > 0 ? (
                        <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden">
                            <Tabs value={activeThemeIdx.toString()} onValueChange={(val) => setActiveThemeIdx(parseInt(val))} className="w-full h-full flex flex-col">
                                <div className="p-4 border-b border-border/40 bg-white/40 dark:bg-slate-950/40">
                                    <TabsList className="w-full h-auto p-1.5 grid grid-cols-3 gap-1.5 rounded-2xl bg-muted/60">
                                        {themes.map((t, i) => (
                                            <TabsTrigger key={i} value={i.toString()} className="whitespace-normal text-xs sm:text-sm py-2.5 px-1.5 text-center font-bold tracking-tight rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md transition-all h-full break-keep data-[state=active]:text-primary border border-transparent data-[state=active]:border-border/50">
                                                {t.themeName}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                    <div className="mt-4 px-3 flex gap-2">
                                        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                        <p className="text-sm font-semibold text-foreground/80 leading-relaxed break-keep">
                                            <span className="text-primary font-bold mr-1">AI 앵글 추천:</span>
                                            {themes[activeThemeIdx].description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-10 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                                    {KEYWORD_CATEGORIES.map(cat => (
                                        <div key={cat.key} className="space-y-4">
                                            <div className="flex items-center justify-between border-b border-border/60 pb-3">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-base font-extrabold tracking-tight uppercase text-foreground">
                                                        {cat.label}
                                                    </h4>
                                                    <span className="text-[11px] font-bold text-muted-foreground px-2 py-0.5 bg-muted/80 rounded-full hidden sm:inline-block">
                                                        {cat.desc}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-extrabold text-foreground/70 bg-foreground/5 px-2.5 py-1 rounded-full tabular-nums">
                                                    선택 <span className="text-primary">{selectedKeywords[cat.key]?.length || 0}</span>
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2.5">
                                                {themes[activeThemeIdx].keywords && themes[activeThemeIdx].keywords[cat.key]?.map((kw: string, i: number) => {
                                                    const isSelected = selectedKeywords[cat.key]?.includes(kw);
                                                    return (
                                                        <button
                                                            key={i}
                                                            onClick={() => toggleKeyword(cat.key, kw)}
                                                            className={`inline-flex items-center justify-center px-4 py-2 text-sm font-semibold transition-all rounded-full border shadow-sm select-none active:scale-95 duration-200 ${isSelected
                                                                ? "bg-primary text-primary-foreground border-primary shadow-primary/20"
                                                                : "bg-white dark:bg-slate-950 border-border/50 text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:border-border/80"
                                                                }`}
                                                        >
                                                            {kw}
                                                        </button>
                                                    );
                                                })}
                                                <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold transition-all rounded-full border-2 border-dashed border-border/80 text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 bg-transparent ml-1 hover:border-primary/50">
                                                    <Plus className="w-4 h-4 mr-1.5" />
                                                    직접 추가
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-8 pb-4 flex gap-3">
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="grow basis-1/3 h-14 rounded-2xl text-base font-bold shadow-sm hover:bg-primary/5 hover:text-primary hover:border-primary/50 text-foreground border-border/80"
                                            onClick={() => handleGenerateContent(true)}
                                            disabled={isGeneratingContent}
                                        >
                                            <SparklesIcon className="w-5 h-5 mr-2 text-primary" />
                                            AI 추천 조합
                                        </Button>
                                        <Button
                                            size="lg"
                                            className="grow basis-2/3 h-14 rounded-2xl text-base font-bold shadow-xl group"
                                            onClick={() => handleGenerateContent(false)}
                                            disabled={isGeneratingContent || totalSelected === 0}
                                        >
                                            {isGeneratingContent ? (
                                                "기획안 생성 중..."
                                            ) : (
                                                <>
                                                    <PenTool className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
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
                    <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        콘텐츠 생성 결과
                    </h3>

                    {/* Platform Selector */}
                    <div className="flex bg-slate-100 dark:bg-slate-900 rounded-full p-1 border border-border/40">
                        <button className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-950 text-sm font-bold shadow-sm text-foreground">
                            <Instagram className="w-4 h-4 text-pink-500" />
                            인스타그램
                        </button>
                        <button disabled className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold text-muted-foreground opacity-60 cursor-not-allowed">
                            <Youtube className="w-4 h-4" />
                            유튜브
                            <Lock className="w-3 h-3 ml-0.5" />
                        </button>
                    </div>
                </div>

                <Card className="rounded-3xl border-border/40 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md flex flex-col flex-1 transition-all overflow-hidden shadow-sm p-4 min-h-[700px]">
                    {!generatedContent && !isGeneratingContent ? (
                        <div className="flex-1 flex flex-col p-2 animate-in fade-in duration-500 max-h-full overflow-hidden">
                            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent flex flex-col pb-24 px-2">
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
                                    <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                                        <SparklesIcon className="w-10 h-10 text-muted-foreground/30" />
                                    </div>
                                    <h4 className="text-xl font-bold mb-3 text-foreground/80">생성된 콘텐츠가 없습니다</h4>
                                    <p className="text-muted-foreground text-sm max-w-[280px]">
                                        좌측에서 원하는 앵글과 키워드를 조합하여 <strong>[AI 추천 조합]</strong> 버튼을 눌러보세요.
                                    </p>
                                </div>
                                {savedContents.length > 0 && <div className="h-px w-full bg-border/40 mt-4 mb-2"></div>}
                                {savedContentsList}
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
                        <div className="flex-1 flex flex-col p-2 animate-in slide-in-from-bottom-4 fade-in duration-500 max-h-full overflow-hidden">
                            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent flex flex-col gap-6 pb-24 px-2">

                                {/* Visual Prompt Section (Instagram Square Mock) */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-base font-extrabold flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4 text-primary" />
                                            인스타그램 1:1 비주얼 가이드
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="outline" className="h-8 px-3 rounded-full text-xs font-semibold bg-white dark:bg-slate-950">
                                                        <SparklesIcon className="w-3.5 h-3.5 mr-1.5" />
                                                        프롬프트 확인
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle className="flex items-center gap-2">
                                                            <SparklesIcon className="w-4 h-4 text-primary" />
                                                            영문 프롬프트 (Midjourney / DALL-E)
                                                        </DialogTitle>
                                                    </DialogHeader>
                                                    <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-sm font-mono overflow-auto max-h-[300px] leading-relaxed break-words select-all shadow-inner border border-slate-800">
                                                        {generatedContent?.imagePrompt}
                                                    </div>
                                                    <div className="flex justify-end mt-2">
                                                        <Button size="sm" onClick={() => navigator.clipboard.writeText(generatedContent?.imagePrompt || "")} className="rounded-full shadow-lg">
                                                            <Download className="w-4 h-4 mr-1.5" />
                                                            프롬프트 복사
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                            <Button size="sm" variant="ghost" className="h-8 px-3 rounded-full text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-all" onClick={() => setIsEditingVisual(!isEditingVisual)}>
                                                {isEditingVisual ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 mr-1.5" />
                                                        수정 완료
                                                    </>
                                                ) : (
                                                    <>
                                                        <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                                                        수정하기
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900 border border-border/50 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row gap-5 items-center">
                                        <div className="aspect-square w-full max-w-[180px] shrink-0 rounded-2xl bg-gradient-to-tr from-muted to-muted/50 border border-dashed border-border/80 flex flex-col items-center justify-center text-center p-4 shadow-inner relative overflow-hidden">
                                            <ImageIcon className="w-8 h-8 text-muted-foreground/30 mb-2" />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                Feed Image
                                            </span>
                                        </div>
                                        <div className="flex-1 flex flex-col gap-3">
                                            <div className="text-sm font-medium text-foreground/90 leading-relaxed bg-white/70 dark:bg-slate-950/70 p-4 rounded-xl border border-border/40 shadow-sm relative overflow-hidden">
                                                <strong className="text-foreground block mb-1">💡 비주얼 디렉션:</strong>
                                                {isEditingVisual ? (
                                                    <Textarea
                                                        value={generatedContent?.imageDescription || ''}
                                                        onChange={(e) => handleContentChange('imageDescription', e.target.value)}
                                                        className="mt-2 min-h-[80px] bg-background text-sm leading-relaxed"
                                                    />
                                                ) : (
                                                    generatedContent?.imageDescription
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Copywriting Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-base font-extrabold flex items-center gap-2">
                                            <PenTool className="w-4 h-4 text-primary" />
                                            인스타그램 본문 카피
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="ghost" className="h-8 px-3 rounded-full text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-all" onClick={() => setIsEditingCopy(!isEditingCopy)}>
                                                {isEditingCopy ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 mr-1.5" />
                                                        수정 완료
                                                    </>
                                                ) : (
                                                    <>
                                                        <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                                                        수정하기
                                                    </>
                                                )}
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-8 px-3 rounded-full text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-all" onClick={handleCopyAll}>
                                                {isCopied ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                                                        <span className="text-green-600 dark:text-green-500">복사 완료!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="w-3.5 h-3.5 mr-1.5" />
                                                        전체 복사
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-950 border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-sm font-medium">
                                        {isEditingCopy ? (
                                            <>
                                                <Input
                                                    value={generatedContent?.hook || ''}
                                                    onChange={(e) => handleContentChange('hook', e.target.value)}
                                                    className="font-bold text-base bg-primary/5 border-primary/20 h-10"
                                                    placeholder="Hook 문구"
                                                />
                                                <Textarea
                                                    value={generatedContent?.body || ''}
                                                    onChange={(e) => handleContentChange('body', e.target.value)}
                                                    className="min-h-[140px] leading-relaxed"
                                                    placeholder="본문 내용을 입력하세요"
                                                />
                                                <div className="flex gap-2">
                                                    <span className="shrink-0 mt-2.5 text-primary">👉</span>
                                                    <Input
                                                        value={generatedContent?.cta || ''}
                                                        onChange={(e) => handleContentChange('cta', e.target.value)}
                                                        className="flex-1 font-semibold"
                                                        placeholder="CTA 문구"
                                                    />
                                                </div>
                                                <Input
                                                    value={generatedContent?.hashtags || ''}
                                                    onChange={(e) => handleContentChange('hashtags', e.target.value)}
                                                    className="font-semibold text-primary/80 bg-primary/5 border-primary/10 text-[13px] h-10"
                                                    placeholder="#해시태그"
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-foreground font-bold text-base bg-primary/5 p-3 rounded-xl border border-primary/10">
                                                    {generatedContent?.hook}
                                                </p>
                                                <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                                    {generatedContent?.body}
                                                </p>
                                                <div className="h-px w-full bg-border/40 my-2"></div>
                                                <p className="text-foreground font-semibold flex items-start gap-2">
                                                    <span className="shrink-0 mt-0.5 text-primary">👉</span>
                                                    {generatedContent?.cta}
                                                </p>
                                                <p className="text-primary/80 font-semibold leading-relaxed mt-2 text-[13px] bg-primary/5 p-3 rounded-xl">
                                                    {generatedContent?.hashtags}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-3 pb-6 border-b border-border/40">
                                    <Button
                                        variant="outline"
                                        className="rounded-full px-8 h-12 text-base font-bold shadow-sm shrink-0 w-auto bg-white dark:bg-slate-950 hover:bg-muted"
                                        onClick={() => handleGenerateContent(false)}
                                        disabled={isGeneratingContent || totalSelected === 0}
                                    >
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        새로 만들기
                                    </Button>
                                    <Button
                                        className="rounded-full px-8 h-12 text-base font-bold shadow-xl shadow-foreground/10 bg-foreground text-background hover:bg-foreground/90 shrink-0 w-auto transition-all"
                                        onClick={handleSaveContent}
                                        disabled={isSaving || isAlreadySaved}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Check className="w-4 h-4 mr-2 text-green-400" />
                                                <span className="text-green-400">저장 완료!</span>
                                            </>
                                        ) : isAlreadySaved ? (
                                            <>
                                                <Check className="w-4 h-4 mr-2 text-muted-foreground" />
                                                <span className="text-muted-foreground">이미 보관함에 있음</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                내 보관함에 저장하기
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
