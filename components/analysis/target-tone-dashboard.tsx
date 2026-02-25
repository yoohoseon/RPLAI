"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Info, RotateCcw, Loader2, Wand2, MessageSquare, ChevronDown, Sparkles, History, ArrowRight, Trash2, Edit2, Check, X, ArrowRightCircle, MoreHorizontal, PenLine, Rocket } from 'lucide-react';
import { generateConceptsBatch, deleteConceptHistoryItem, saveEditedConcepts } from '@/app/lib/concept-actions';
import { useRouter } from 'next/navigation';

interface TargetToneProps {
    brandKor: string;
    brandEng: string;
    initialConcepts: any[] | null;
    initialHistory: any[];
    analysisId: string;
    initialValues: {
        lifestyle: number;
        knowledge: number;
        communication: number;
        lifestyleExplanation?: string;
        knowledgeExplanation?: string;
        communicationExplanation?: string;
    }
    originalValues: {
        lifestyle: number;
        knowledge: number;
        communication: number;
        lifestyleExplanation?: string;
        knowledgeExplanation?: string;
        communicationExplanation?: string;
    }
}

export function TargetToneDashboard({ initialValues, originalValues, brandKor, brandEng, initialConcepts, initialHistory, analysisId }: TargetToneProps) {
    const router = useRouter();

    const [lifestyle, setLifestyle] = useState(initialValues.lifestyle);
    const [knowledge, setKnowledge] = useState(initialValues.knowledge);
    const [communication, setCommunication] = useState(initialValues.communication);

    const [concepts, setConcepts] = useState<any[] | null>(initialConcepts);
    const [conceptHistory, setConceptHistory] = useState<any[]>(initialHistory);
    const [isLoadingConcepts, setIsLoadingConcepts] = useState(false);
    const [visibleCounts, setVisibleCounts] = useState<{ [key: number]: number }>({ 0: 1, 1: 1, 2: 1 });
    const [isLoadingMore, setIsLoadingMore] = useState<{ [key: number]: boolean }>({});
    const [isDeletingHistory, setIsDeletingHistory] = useState<{ [key: string]: boolean }>({});

    const [editingMsg, setEditingMsg] = useState<{ conceptIdx: number, msgIdx: number } | null>(null);
    const [editValue, setEditValue] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const [editingConcept, setEditingConcept] = useState<number | null>(null);
    const [editConceptName, setEditConceptName] = useState("");
    const [editConceptDesc, setEditConceptDesc] = useState("");
    const [isSavingConcept, setIsSavingConcept] = useState(false);

    const handleSelectMessage = (conceptName: string, message: string) => {
        const params = new URLSearchParams({
            analysisId,
            concept: conceptName,
            message: message
        });
        router.push(`/main/strategy?${params.toString()}`);
    };

    const isModified =
        lifestyle !== originalValues.lifestyle ||
        knowledge !== originalValues.knowledge ||
        communication !== originalValues.communication;

    const handleEditStart = (conceptIdx: number, msgIdx: number, currentMsg: string) => {
        setEditingMsg({ conceptIdx, msgIdx });
        setEditValue(currentMsg);
    };

    const handleEditCancel = () => {
        setEditingMsg(null);
        setEditValue("");
    };

    const handleEditSave = async () => {
        if (!editingMsg || !concepts) return;
        setIsSavingEdit(true);

        const newConcepts = [...concepts];
        newConcepts[editingMsg.conceptIdx].keyMessages[editingMsg.msgIdx] = editValue;

        // Optimistic update
        setConcepts(newConcepts);

        await saveEditedConcepts(analysisId, newConcepts);

        setIsSavingEdit(false);
        setEditingMsg(null);
    };

    const handleConceptEditStart = (idx: number, name: string, desc: string) => {
        setEditingConcept(idx);
        setEditConceptName(name);
        setEditConceptDesc(desc);
    };

    const handleConceptEditCancel = () => {
        setEditingConcept(null);
        setEditConceptName("");
        setEditConceptDesc("");
    };

    const handleConceptEditSave = async () => {
        if (editingConcept === null || !concepts) return;
        setIsSavingConcept(true);

        const newConcepts = [...concepts];
        newConcepts[editingConcept].conceptName = editConceptName;
        newConcepts[editingConcept].description = editConceptDesc;

        // Optimistic update
        setConcepts(newConcepts);

        await saveEditedConcepts(analysisId, newConcepts);

        setIsSavingConcept(false);
        setEditingConcept(null);
    };

    const handleReset = () => {
        setLifestyle(originalValues.lifestyle);
        setKnowledge(originalValues.knowledge);
        setCommunication(originalValues.communication);

        // 오리지널 추천값에 해당하는 컨셉이 히스토리에 있다면 복원
        const originalHistory = conceptHistory.find(item =>
            item.targetAndTone.lifestyle === originalValues.lifestyle &&
            item.targetAndTone.knowledge === originalValues.knowledge &&
            item.targetAndTone.communication === originalValues.communication
        );

        if (originalHistory && originalHistory.concepts) {
            setConcepts(originalHistory.concepts);
            setVisibleCounts({ 0: 1, 1: 1, 2: 1 });
        } else {
            // 히스토리에 없다면, 현재 화면의 컨셉(수정된 슬라이더 기반)과 스펙이 꼬이지 않도록 클리어
            setConcepts(null);
        }
    };

    const handleGenerateConcepts = async () => {
        setIsLoadingConcepts(true);
        const result = await generateConceptsBatch(brandKor, brandEng, { lifestyle, knowledge, communication }, analysisId);
        if (result.success && result.data) {
            setConcepts(result.data.concepts);
            setVisibleCounts({ 0: 1, 1: 1, 2: 1 });
            if (result.newHistory) {
                setConceptHistory(result.newHistory);
            }
        }
        setIsLoadingConcepts(false);
    };

    const handleRestoreHistory = (historyItem: any) => {
        setLifestyle(historyItem.targetAndTone.lifestyle);
        setKnowledge(historyItem.targetAndTone.knowledge);
        setCommunication(historyItem.targetAndTone.communication);
        setConcepts(historyItem.concepts);
        setVisibleCounts({ 0: 1, 1: 1, 2: 1 });
    };

    const handleDeleteHistoryItem = async (e: React.MouseEvent, historyItemId: string) => {
        e.stopPropagation();
        if (!confirm("이 이전 분석 히스토리를 대시보드에서 완전히 삭제하시겠습니까?")) return;

        setIsDeletingHistory(prev => ({ ...prev, [historyItemId]: true }));
        const result = await deleteConceptHistoryItem(analysisId, historyItemId);

        if (result.success && result.newHistory) {
            setConceptHistory(result.newHistory);
        } else {
            alert("히스토리 삭제 중 오류가 발생했습니다.");
        }
        setIsDeletingHistory(prev => ({ ...prev, [historyItemId]: false }));
    };

    const handleShowMore = async (conceptIdx: number) => {
        setIsLoadingMore(prev => ({ ...prev, [conceptIdx]: true }));

        // 인위적인 로딩 딜레이 (자연스러운 UI 효과를 위해)
        await new Promise(resolve => setTimeout(resolve, 600));

        setVisibleCounts(prev => ({
            ...prev,
            [conceptIdx]: Math.min((prev[conceptIdx] || 1) + 3, 10)
        }));

        setIsLoadingMore(prev => ({ ...prev, [conceptIdx]: false }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left side: Target & Tone */}
            <section className="space-y-8 relative lg:col-span-5">
                <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">Target & Tone</h2>
                    </div>
                    {isModified && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleReset}
                            className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50 shadow-sm rounded-full px-4"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            AI 추천값 초기화
                        </Button>
                    )}
                </div>
                <Card className="overflow-hidden border-border/50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 rounded-3xl h-full">
                    <CardContent className="p-8 space-y-12">
                        <TooltipProvider delayDuration={200}>
                            {/* Slider 1: Lifestyle */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end border-b border-border/40 pb-2 mb-2">
                                    <span className="text-violet-600 dark:text-violet-400 font-extrabold text-lg tracking-wider flex items-center gap-1.5">
                                        라이프스타일
                                        {originalValues.lifestyleExplanation && (
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="w-4 h-4 text-primary cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent side="top" sideOffset={8} className="max-w-[340px] p-3 shadow-xl rounded-xl">
                                                    <p className="text-xs font-medium leading-relaxed break-keep">
                                                        <span className="text-primary font-bold mr-1">AI의 분석:</span>
                                                        {originalValues.lifestyleExplanation}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground/80 mb-1 px-1">
                                    <Tooltip>
                                        <TooltipTrigger className="cursor-help flex items-center gap-1 decoration-dashed underline-offset-4 hover:underline">
                                            안정 / 실속
                                        </TooltipTrigger>
                                        <TooltipContent side="top" sideOffset={6} className="max-w-[280px] p-2.5 rounded-lg shadow-md">
                                            <p className="text-[11px] font-medium leading-relaxed break-keep">실용성과 가성비를 추구하는 안정적 가치관</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger className="cursor-help flex items-center gap-1 decoration-dashed underline-offset-4 hover:underline">
                                            성취 / 도전
                                        </TooltipTrigger>
                                        <TooltipContent side="top" sideOffset={6} className="max-w-[280px] p-2.5 rounded-lg shadow-md">
                                            <p className="text-[11px] font-medium leading-relaxed break-keep">새로운 경험과 개인의 성공을 중시하는 도전적 성향</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Slider
                                    value={[lifestyle]}
                                    onValueChange={(vals) => setLifestyle(vals[0])}
                                    max={100}
                                    step={1}
                                    className="w-full"
                                />
                            </div>

                            {/* Slider 2: Knowledge */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end border-b border-border/40 pb-2 mb-2">
                                    <span className="text-violet-600 dark:text-violet-400 font-extrabold text-lg tracking-wider flex items-center gap-1.5">
                                        지식 / 관여도
                                        {originalValues.knowledgeExplanation && (
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="w-4 h-4 text-primary cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent side="top" sideOffset={8} className="max-w-[340px] p-3 shadow-xl rounded-xl">
                                                    <p className="text-xs font-medium leading-relaxed break-keep">
                                                        <span className="text-primary font-bold mr-1">AI의 분석:</span>
                                                        {originalValues.knowledgeExplanation}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground/80 mb-1 px-1">
                                    <Tooltip>
                                        <TooltipTrigger className="cursor-help flex items-center gap-1 decoration-dashed underline-offset-4 hover:underline">
                                            대중 / 입문
                                        </TooltipTrigger>
                                        <TooltipContent side="top" sideOffset={6} className="max-w-[280px] p-2.5 rounded-lg shadow-md">
                                            <p className="text-[11px] font-medium leading-relaxed break-keep">직관적이고 쉬운 접근을 선호하는 대중적 시각</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger className="cursor-help flex items-center gap-1 decoration-dashed underline-offset-4 hover:underline">
                                            전문가 / 매니아
                                        </TooltipTrigger>
                                        <TooltipContent side="top" sideOffset={6} className="max-w-[280px] p-2.5 rounded-lg shadow-md">
                                            <p className="text-[11px] font-medium leading-relaxed break-keep">디테일과 원리를 꼼꼼히 따지는 고관여 고객층</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Slider
                                    value={[knowledge]}
                                    onValueChange={(vals) => setKnowledge(vals[0])}
                                    max={100}
                                    step={1}
                                    className="w-full"
                                />
                            </div>

                            {/* Slider 3: Communication */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end border-b border-border/40 pb-2 mb-2">
                                    <span className="text-violet-600 dark:text-violet-400 font-extrabold text-lg tracking-wider flex items-center gap-1.5">
                                        소통 관계
                                        {originalValues.communicationExplanation && (
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="w-4 h-4 text-primary cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent side="top" sideOffset={8} className="max-w-[340px] p-3 shadow-xl rounded-xl">
                                                    <p className="text-xs font-medium leading-relaxed break-keep">
                                                        <span className="text-primary font-bold mr-1">AI의 분석:</span>
                                                        {originalValues.communicationExplanation}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground/80 mb-1 px-1">
                                    <Tooltip>
                                        <TooltipTrigger className="cursor-help flex items-center gap-1 decoration-dashed underline-offset-4 hover:underline">
                                            친근한
                                        </TooltipTrigger>
                                        <TooltipContent side="top" sideOffset={6} className="max-w-[280px] p-2.5 rounded-lg shadow-md">
                                            <p className="text-[11px] font-medium leading-relaxed break-keep">친밀한 유대감을 형성하는 캐주얼하고 감성적인 소통</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger className="cursor-help flex items-center gap-1 decoration-dashed underline-offset-4 hover:underline">
                                            신뢰받는
                                        </TooltipTrigger>
                                        <TooltipContent side="top" sideOffset={6} className="max-w-[280px] p-2.5 rounded-lg shadow-md">
                                            <p className="text-[11px] font-medium leading-relaxed break-keep">논리와 권위를 바탕으로 확신을 주는 전문적인 소통</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Slider
                                    value={[communication]}
                                    onValueChange={(vals) => setCommunication(vals[0])}
                                    max={100}
                                    step={1}
                                    className="w-full"
                                />
                            </div>
                        </TooltipProvider>

                        {/* History Section (Now integrated below sliders) */}
                        {conceptHistory && conceptHistory.length > 0 && (
                            <div className="pt-8 mt-4 border-t border-border/40">
                                <h3 className="font-extrabold text-sm text-foreground mb-4 flex items-center gap-2">
                                    <History className="w-4 h-4 text-primary" />
                                    이전 분석 히스토리
                                </h3>
                                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                                    {conceptHistory.map((item, idx) => (
                                        <div
                                            key={item.id || idx}
                                            className="flex justify-between items-center bg-background/50 border border-border/40 p-3 rounded-2xl hover:bg-background/80 hover:border-primary/30 transition-all cursor-pointer group shadow-sm"
                                            onClick={() => handleRestoreHistory(item)}
                                        >
                                            <div className="flex flex-col gap-1.5">
                                                <p className="text-xs font-semibold text-muted-foreground">
                                                    {new Date(item.timestamp).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <div className="flex gap-1.5 text-[10px] font-bold">
                                                    <span className="bg-primary/5 text-primary/80 border border-primary/10 px-2 py-0.5 rounded-md">라이프 {item.targetAndTone.lifestyle}</span>
                                                    <span className="bg-primary/5 text-primary/80 border border-primary/10 px-2 py-0.5 rounded-md">지식 {item.targetAndTone.knowledge}</span>
                                                    <span className="bg-primary/5 text-primary/80 border border-primary/10 px-2 py-0.5 rounded-md">소통 {item.targetAndTone.communication}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-8 h-8 rounded-full opacity-50 group-hover:opacity-100 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/40 dark:hover:text-rose-400 transition-all z-10 cursor-pointer"
                                                    onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                                                    disabled={isDeletingHistory[item.id]}
                                                >
                                                    {isDeletingHistory[item.id] ? <Loader2 className="w-4 h-4 animate-spin text-rose-500 cursor-wait" /> : <Trash2 className="w-4 h-4" />}
                                                </Button>
                                                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full opacity-50 group-hover:opacity-100 group-hover:bg-primary/10 transition-all cursor-pointer">
                                                    <ArrowRight className="w-4 h-4 text-primary" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>

            {/* Right side: Concept & Key Message */}
            <section className="space-y-8 relative flex flex-col lg:col-span-7">
                <div className="flex items-center justify-between mb-2 gap-4 flex-wrap min-h-[36px]">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">Concept & Key Message</h2>
                    </div>
                    <Button
                        onClick={handleGenerateConcepts}
                        disabled={isLoadingConcepts}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm rounded-full px-5"
                    >
                        {isLoadingConcepts ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                        {isLoadingConcepts ? 'AI 분석 & DB 저장 중...' : (concepts ? '다시 분석하기' : 'AI 분석하기')}
                    </Button>
                </div>

                <Card className={`overflow-hidden border-border/50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 rounded-3xl flex-1 flex flex-col ${!concepts ? 'items-center justify-center border-dashed' : ''} p-8 min-h-[350px]`}>
                    {!concepts ? (
                        <>
                            {isLoadingConcepts ? (
                                <div className="flex flex-col items-center justify-center space-y-4 text-center animate-in fade-in duration-500">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                                        <Sparkles className="w-12 h-12 text-primary relative animate-bounce" />
                                    </div>
                                    <p className="text-primary font-bold text-lg">AI가 맞춤형 컨셉을 분석하고 DB에 저장 중입니다...</p>
                                    <p className="text-muted-foreground text-sm">약 5~10초 정도 소요될 수 있습니다.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center opacity-70">
                                    <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground font-medium mb-1">
                                        현재 타겟과 톤앤매너에 맞는 컨셉 및 키 메시지를 분석해보세요.
                                    </p>
                                    <p className="text-xs text-muted-foreground/70">
                                        우측 상단의 'AI 분석하기' 버튼을 클릭하여 시작하세요.
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <Tabs defaultValue="concept-0" className={`w-full relative transition-all duration-500 ${isLoadingConcepts ? 'opacity-40 pointer-events-none' : 'opacity-100 animate-in slide-in-from-bottom-4 fade-in'}`}>
                            {isLoadingConcepts && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                                    <div className="bg-background/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-border/50 flex flex-col items-center">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                                        <p className="text-sm font-bold text-foreground">새로운 컨셉 분석 및 DB 저장 중...</p>
                                    </div>
                                </div>
                            )}

                            <TabsList className="w-full h-auto flex flex-wrap gap-2 justify-start bg-transparent p-0 mb-6">
                                {concepts?.map((concept, idx) => (
                                    <TabsTrigger
                                        key={idx}
                                        value={`concept-${idx}`}
                                        className="h-10 px-4 rounded-full border border-border/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary shadow-sm transition-all"
                                    >
                                        {concept.conceptName}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {concepts?.map((concept, idx) => {
                                const currentVisibleCount = visibleCounts[idx] || 1;
                                const isAllVisible = currentVisibleCount >= concept.keyMessages.length;

                                return (
                                    <TabsContent key={idx} value={`concept-${idx}`} className="space-y-6 mt-0 focus-visible:outline-none focus-visible:ring-0">
                                        <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-4 group relative pr-12 min-h-[70px]">
                                            {editingConcept === idx ? (
                                                <div className="flex flex-col w-full gap-2 mt-1">
                                                    <input
                                                        value={editConceptName}
                                                        onChange={e => setEditConceptName(e.target.value)}
                                                        className="font-extrabold text-xl text-foreground tracking-tight bg-background border border-input rounded-md px-3 py-1.5 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                        placeholder="컨셉명"
                                                        autoFocus
                                                    />
                                                    <textarea
                                                        value={editConceptDesc}
                                                        onChange={e => setEditConceptDesc(e.target.value)}
                                                        className="text-sm text-foreground font-medium leading-relaxed bg-background border border-input rounded-md px-3 py-2 w-full min-h-[60px] resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                        placeholder="컨셉 설명"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col mt-1">
                                                    <h3 className="font-extrabold text-xl text-foreground tracking-tight">{concept.conceptName}</h3>
                                                    <p className="text-sm text-muted-foreground font-medium leading-relaxed mt-1">{concept.description}</p>
                                                </div>
                                            )}

                                            {editingConcept === idx ? (
                                                <div className="flex flex-col gap-1 absolute top-1 right-0">
                                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-100" onClick={handleConceptEditSave} disabled={isSavingConcept}>
                                                        {isSavingConcept ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-600 hover:text-rose-700 hover:bg-rose-100" onClick={handleConceptEditCancel} disabled={isSavingConcept}>
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-1 right-0 transition-opacity h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm"
                                                    onClick={() => handleConceptEditStart(idx, concept.conceptName, concept.description)}
                                                >
                                                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            {concept.keyMessages.slice(0, currentVisibleCount).map((msg: string, msgIdx: number) => {
                                                const isEditing = editingMsg?.conceptIdx === idx && editingMsg?.msgIdx === msgIdx;

                                                return (
                                                    <div key={msgIdx} className="group relative bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-4 border border-border/30 text-[15px] font-medium text-foreground leading-relaxed animate-in slide-in-from-bottom-2 fade-in min-h-[60px] flex items-center pr-12">
                                                        {isEditing ? (
                                                            <div className="flex w-full gap-2 items-start">
                                                                <textarea
                                                                    value={editValue}
                                                                    onChange={(e) => setEditValue(e.target.value)}
                                                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                                                    autoFocus
                                                                />
                                                                <div className="flex flex-col gap-1">
                                                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-100" onClick={handleEditSave} disabled={isSavingEdit}>
                                                                        {isSavingEdit ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                                                    </Button>
                                                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-600 hover:text-rose-700 hover:bg-rose-100" onClick={handleEditCancel} disabled={isSavingEdit}>
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span>"{msg}"</span>
                                                                <div className="absolute top-1/2 -translate-y-1/2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm text-muted-foreground">
                                                                                <MoreHorizontal className="h-4 w-4" />
                                                                                <span className="sr-only">액션 메뉴</span>
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="w-[180px] rounded-xl p-2 font-medium">
                                                                            <DropdownMenuItem onClick={() => handleSelectMessage(concept.conceptName, msg)} className="text-primary focus:text-primary focus:bg-primary/10 cursor-pointer rounded-lg py-2.5">
                                                                                <Rocket className="mr-2 h-4 w-4" />
                                                                                <span>콘텐츠 전략 수립</span>
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem onClick={() => handleEditStart(idx, msgIdx, msg)} className="cursor-pointer rounded-lg py-2.5">
                                                                                {isSavingEdit && editingMsg?.conceptIdx === idx && editingMsg?.msgIdx === msgIdx ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PenLine className="mr-2 h-4 w-4 text-muted-foreground" />}
                                                                                <span>텍스트 수정</span>
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {!isAllVisible && (
                                                <div className="pt-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleShowMore(idx)}
                                                        disabled={isLoadingMore[idx]}
                                                        className="w-full text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl border border-dashed border-border/50 py-5 transition-all"
                                                    >
                                                        {isLoadingMore[idx] ? (
                                                            <>
                                                                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                                                AI 생성 중...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronDown className="w-4 h-4 mr-2" />
                                                                더 보기
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                );
                            })}
                        </Tabs>
                    )}
                </Card>
            </section>
        </div>
    );
}
