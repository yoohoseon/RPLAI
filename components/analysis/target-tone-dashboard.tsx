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
            <section className="space-y-6 relative lg:col-span-5">
                <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-[#F2F4F6] rounded-full" />
                        <h2 className="text-2xl font-bold tracking-tight text-[#333333]">Target & Tone</h2>
                    </div>
                </div>
                <Card className="overflow-hidden border-none bg-white shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-500 rounded-[32px] h-full">
                    <CardContent className="p-10 space-y-12">
                        <TooltipProvider delayDuration={200}>
                            {/* Slider 1: Lifestyle */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-end border-none pb-4 mb-2">
                                    <span className="text-[#333333] font-bold text-lg tracking-tight flex items-center gap-2">
                                        라이프스타일
                                        {originalValues.lifestyleExplanation && (
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="w-4 h-4 text-[#ABB3BB] hover:text-[#333333] cursor-help transition-colors" />
                                                </TooltipTrigger>
                                                <TooltipContent side="top" sideOffset={8} className="max-w-[340px] p-4 border-none shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-[20px]">
                                                    <p className="text-[13px] font-medium leading-relaxed break-keep text-[#4E5968]">
                                                        <span className="text-[#333333] font-bold mr-1">AI 분석 결과:</span>
                                                        {originalValues.lifestyleExplanation}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </span>
                                    <div className="text-[14px] font-bold text-[#333333] bg-[#F2F4F6]/5 px-3 py-1 rounded-lg">
                                        {lifestyle}%
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-[12px] font-bold uppercase tracking-wider text-[#8B95A1] mb-1 px-1">
                                    <span className="flex items-center gap-1.5">안정 / 실속</span>
                                    <span className="flex items-center gap-1.5">성취 / 도전</span>
                                </div>
                                <Slider
                                    value={[lifestyle]}
                                    onValueChange={(vals) => setLifestyle(vals[0])}
                                    max={100}
                                    step={1}
                                    className="w-full [--primary:#3182F6]"
                                />
                            </div>

                            {/* Slider 2: Knowledge */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-end border-none pb-4 mb-2">
                                    <span className="text-[#333333] font-bold text-lg tracking-tight flex items-center gap-2">
                                        지식 / 관여도
                                        {originalValues.knowledgeExplanation && (
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="w-4 h-4 text-[#ABB3BB] hover:text-[#333333] cursor-help transition-colors" />
                                                </TooltipTrigger>
                                                <TooltipContent side="top" sideOffset={8} className="max-w-[340px] p-4 border-none shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-[20px]">
                                                    <p className="text-[13px] font-medium leading-relaxed break-keep text-[#4E5968]">
                                                        <span className="text-[#333333] font-bold mr-1">AI 분석 결과:</span>
                                                        {originalValues.knowledgeExplanation}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </span>
                                    <div className="text-[14px] font-bold text-[#333333] bg-[#F2F4F6]/5 px-3 py-1 rounded-lg">
                                        {knowledge}%
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-[12px] font-bold uppercase tracking-wider text-[#8B95A1] mb-1 px-1">
                                    <span className="flex items-center gap-1.5">대중 / 입문</span>
                                    <span className="flex items-center gap-1.5">전문가 / 매니아</span>
                                </div>
                                <Slider
                                    value={[knowledge]}
                                    onValueChange={(vals) => setKnowledge(vals[0])}
                                    max={100}
                                    step={1}
                                    className="w-full [--primary:#3182F6]"
                                />
                            </div>

                            {/* Slider 3: Communication */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-end border-none pb-4 mb-2">
                                    <span className="text-[#333333] font-bold text-lg tracking-tight flex items-center gap-2">
                                        소통 관계
                                        {originalValues.communicationExplanation && (
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="w-4 h-4 text-[#ABB3BB] hover:text-[#333333] cursor-help transition-colors" />
                                                </TooltipTrigger>
                                                <TooltipContent side="top" sideOffset={8} className="max-w-[340px] p-4 border-none shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-[20px]">
                                                    <p className="text-[13px] font-medium leading-relaxed break-keep text-[#4E5968]">
                                                        <span className="text-[#333333] font-bold mr-1">AI 분석 결과:</span>
                                                        {originalValues.communicationExplanation}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </span>
                                    <div className="text-[14px] font-bold text-[#333333] bg-[#F2F4F6]/5 px-3 py-1 rounded-lg">
                                        {communication}%
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-[12px] font-bold uppercase tracking-wider text-[#8B95A1] mb-1 px-1">
                                    <span className="flex items-center gap-1.5">친근한 소통</span>
                                    <span className="flex items-center gap-1.5">신뢰받는 소통</span>
                                </div>
                                <Slider
                                    value={[communication]}
                                    onValueChange={(vals) => setCommunication(vals[0])}
                                    max={100}
                                    step={1}
                                    className="w-full [--primary:#3182F6]"
                                />
                            </div>
                        </TooltipProvider>

                        <div className="pt-4">
                            {isModified && (
                                <Button
                                    variant="outline"
                                    onClick={handleReset}
                                    className="w-full h-14 rounded-2xl border-none text-[#4E5968] font-bold hover:bg-[#F2F4F7] hover:text-[#333333] transition-all gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    AI 추천값으로 되돌리기
                                </Button>
                            )}
                        </div>

                        {/* History Section */}
                        {conceptHistory && conceptHistory.length > 0 && (
                            <div className="pt-10 border-none">
                                <h3 className="font-bold text-[15px] text-[#333333] mb-5 flex items-center gap-2">
                                    <History className="w-4 h-4 text-[#333333]" />
                                    최근 분석 히스토리
                                </h3>
                                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#F2F4F6]">
                                    {conceptHistory.map((item, idx) => (
                                        <div
                                            key={item.id || idx}
                                            className="flex justify-between items-center bg-[#F2F4F7] border-none p-4 rounded-2xl hover:bg-[#F2F4F6] hover:border-[#3182F6]/20 transition-all cursor-pointer group shadow-sm"
                                            onClick={() => handleRestoreHistory(item)}
                                        >
                                            <div className="flex flex-col gap-2">
                                                <p className="text-[12px] font-bold text-[#8B95A1]">
                                                    {new Date(item.timestamp).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <div className="flex gap-1.5 text-[10px] font-bold">
                                                    <span className="bg-white text-[#4E5968] border-none px-2 py-0.5 rounded-md">L {item.targetAndTone.lifestyle}</span>
                                                    <span className="bg-white text-[#4E5968] border-none px-2 py-0.5 rounded-md">K {item.targetAndTone.knowledge}</span>
                                                    <span className="bg-white text-[#4E5968] border-none px-2 py-0.5 rounded-md">C {item.targetAndTone.communication}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-9 h-9 rounded-full opacity-50 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 transition-all"
                                                    onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                                                    disabled={isDeletingHistory[item.id]}
                                                >
                                                    {isDeletingHistory[item.id] ? <Loader2 className="w-4 h-4 animate-spin text-rose-500" /> : <Trash2 className="w-4 h-4" />}
                                                </Button>
                                                <ArrowRight className="w-5 h-5 text-[#ABB3BB] group-hover:text-[#333333] transition-colors self-center mr-1" />
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
            <section className="space-y-6 relative flex flex-col lg:col-span-7">
                <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-[#F2F4F6] rounded-full" />
                        <h2 className="text-2xl font-bold tracking-tight text-[#333333]">Concept & Key Message</h2>
                    </div>
                </div>

                <Card className={`overflow-hidden border-none bg-white shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-500 rounded-[32px] flex-1 flex flex-col ${!concepts ? 'items-center justify-center border-dashed' : ''} p-10 min-h-[350px]`}>
                    {!concepts ? (
                        <>
                            {isLoadingConcepts ? (
                                <div className="flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-500">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-[#F2F4F6]/10 rounded-full blur-2xl animate-pulse"></div>
                                        <Rocket className="w-16 h-16 text-[#333333] relative animate-bounce" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[#333333] font-bold text-xl">AI가 맞춤형 컨셉을 분석하고 있습니다</p>
                                        <p className="text-[#8B95A1] font-medium text-[15px]">브랜드의 정체성에 딱 맞는 전략을 구성하는 중이에요.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center py-12">
                                    <div className="w-24 h-24 rounded-full bg-[#F2F4F7] flex items-center justify-center mb-6">
                                        <Sparkles className="w-10 h-10 text-[#ABB3BB]" />
                                    </div>
                                    <div className="space-y-3 mb-8">
                                        <p className="text-[#333333] font-bold text-lg">
                                            아직 분석된 컨셉이 없습니다
                                        </p>
                                        <p className="text-[15px] text-[#4E5968] font-medium max-w-[320px] break-keep">
                                            왼쪽의 타겟 정보를 바탕으로 AI에게 최적의 광고 컨셉과 메시지를 제안받아보세요.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleGenerateConcepts}
                                        className="bg-[#030000] text-white hover:bg-[#1A1A1A] active:bg-[#111111] h-16 px-10 rounded-2xl font-bold text-lg shadow-none transition-all active:scale-[0.98] group"
                                    >
                                        AI 분석 시작하기
                                        <ArrowRightCircle className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <Tabs defaultValue="concept-0" className={`w-full relative transition-all duration-500 ${isLoadingConcepts ? 'opacity-40 pointer-events-none' : 'opacity-100 animate-in slide-in-from-bottom-4 fade-in'}`}>
                            {isLoadingConcepts && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                                    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border-none flex flex-col items-center">
                                        <Loader2 className="w-10 h-10 text-[#333333] animate-spin mb-3" />
                                        <p className="text-[15px] font-bold text-[#333333]">새로운 컨셉 분석 중...</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-4 mb-8">
                                <TabsList className="h-auto flex flex-wrap gap-2 justify-start bg-transparent p-0">
                                    {concepts?.map((concept, idx) => (
                                        <TabsTrigger
                                            key={idx}
                                            value={`concept-${idx}`}
                                            className="h-11 px-6 rounded-xl border-none text-[#4E5968] font-bold data-[state=active]:bg-[#F2F4F6] data-[state=active]:text-[#333333] data-[state=active]:border-[#3182F6] shadow-sm transition-all"
                                        >
                                            {concept.conceptName}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                <Button
                                    onClick={handleGenerateConcepts}
                                    variant="outline"
                                    className="h-11 rounded-xl border-none text-[#333333] font-bold hover:bg-[#F2F4F7] shrink-0"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    다시 분석
                                </Button>
                            </div>

                            {concepts?.map((concept, idx) => {
                                const currentVisibleCount = visibleCounts[idx] || 1;
                                const isAllVisible = currentVisibleCount >= concept.keyMessages.length;

                                return (
                                    <TabsContent key={idx} value={`concept-${idx}`} className="space-y-8 mt-0 focus-visible:outline-none focus-visible:ring-0">
                                        <div className="bg-[#F2F4F7] rounded-[24px] p-8 border-none group relative pr-12 min-h-[90px] transition-all">
                                            {editingConcept === idx ? (
                                                <div className="flex flex-col w-full gap-3">
                                                    <input
                                                        value={editConceptName}
                                                        onChange={e => setEditConceptName(e.target.value)}
                                                        className="font-bold text-xl text-[#333333] tracking-tight bg-white border-none rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-[#3182F6]/20 focus:outline-none"
                                                        placeholder="컨셉명"
                                                        autoFocus
                                                    />
                                                    <textarea
                                                        value={editConceptDesc}
                                                        onChange={e => setEditConceptDesc(e.target.value)}
                                                        className="text-[15px] text-[#4E5968] font-medium leading-relaxed bg-white border-none rounded-xl px-4 py-3 w-full min-h-[80px] resize-none focus:ring-2 focus:ring-[#3182F6]/20 focus:outline-none"
                                                        placeholder="컨셉 설명"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <h3 className="font-bold text-xl text-[#333333] tracking-tight">{concept.conceptName}</h3>
                                                    <p className="text-[15px] text-[#4E5968] font-medium leading-relaxed mt-2 italic break-keep pr-4">
                                                        &ldquo;{concept.description}&rdquo;
                                                    </p>
                                                </div>
                                            )}

                                            {editingConcept === idx ? (
                                                <div className="flex flex-col gap-2 absolute top-4 right-4">
                                                    <Button size="icon" variant="ghost" className="h-9 w-9 text-green-600 hover:bg-green-50 rounded-xl" onClick={handleConceptEditSave} disabled={isSavingConcept}>
                                                        {isSavingConcept ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-5 w-5" />}
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-9 w-9 text-rose-600 hover:bg-rose-50 rounded-xl" onClick={handleConceptEditCancel} disabled={isSavingConcept}>
                                                        <X className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-4 right-4 h-10 w-10 bg-white/50 border-none hover:bg-white rounded-xl shadow-sm text-[#ABB3BB] hover:text-[#333333] opacity-0 group-hover:opacity-100 transition-all"
                                                    onClick={() => handleConceptEditStart(idx, concept.conceptName, concept.description)}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[13px] font-bold text-[#8B95A1] uppercase tracking-widest pl-2">추천 핵심 메시지</h4>
                                            {concept.keyMessages.slice(0, currentVisibleCount).map((msg: string, msgIdx: number) => {
                                                const isEditing = editingMsg?.conceptIdx === idx && editingMsg?.msgIdx === msgIdx;

                                                return (
                                                    <div key={msgIdx} className="group relative bg-white rounded-2xl p-6 border-none hover:shadow-md hover:border-[#3182F6]/20 transition-all min-h-[70px] flex items-center pr-16 animate-in slide-in-from-bottom-2 fade-in">
                                                        {isEditing ? (
                                                            <div className="flex w-full gap-3 items-start">
                                                                <textarea
                                                                    value={editValue}
                                                                    onChange={(e) => setEditValue(e.target.value)}
                                                                    className="flex min-h-[70px] w-full rounded-xl border-none bg-white px-4 py-3 text-[15px] font-bold focus:ring-2 focus:ring-[#3182F6]/20 focus:outline-none resize-none"
                                                                    autoFocus
                                                                />
                                                                <div className="flex flex-col gap-2">
                                                                    <Button size="icon" variant="ghost" className="h-9 w-9 text-green-600 hover:bg-green-50 rounded-xl" onClick={handleEditSave} disabled={isSavingEdit}>
                                                                        {isSavingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-5 w-5" />}
                                                                    </Button>
                                                                    <Button size="icon" variant="ghost" className="h-9 w-9 text-rose-600 hover:bg-rose-50 rounded-xl" onClick={handleEditCancel} disabled={isSavingEdit}>
                                                                        <X className="h-5 w-5" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <p className="text-[16px] font-bold text-[#333333] leading-relaxed break-keep">
                                                                    &ldquo;{msg}&rdquo;
                                                                </p>
                                                                <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <DropdownMenu modal={false}>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-10 w-10 bg-[#F2F4F7] hover:bg-[#F2F4F6] rounded-xl text-[#8B95A1]">
                                                                                <MoreHorizontal className="h-5 w-5" />
                                                                                <span className="sr-only">액션</span>
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="w-[190px] rounded-2xl p-2 border-none shadow-2xl">
                                                                            <DropdownMenuItem onClick={() => handleSelectMessage(concept.conceptName, msg)} className="flex items-center gap-2.5 text-[#333333] font-bold focus:bg-[#F2F4F6]/5 focus:text-[#333333] cursor-pointer rounded-xl py-3 px-3">
                                                                                <ArrowRightCircle className="h-5 w-5" />
                                                                                <span>콘텐츠 기획하기</span>
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem onClick={() => handleEditStart(idx, msgIdx, msg)} className="flex items-center gap-2.5 text-[#4E5968] font-bold cursor-pointer rounded-xl py-3 px-3">
                                                                                <PenLine className="h-5 w-5 text-[#ABB3BB]" />
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
                                                        onClick={() => handleShowMore(idx)}
                                                        disabled={isLoadingMore[idx]}
                                                        className="w-full h-16 text-[#8B95A1] font-bold hover:text-[#333333] hover:bg-[#F2F4F6]/5 rounded-2xl border-2 border-dashed border-none transition-all"
                                                    >
                                                        {isLoadingMore[idx] ? (
                                                            <>
                                                                <Loader2 className="animate-spin w-5 h-5 mr-3" />
                                                                메시지 생성 중...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronDown className="w-5 h-5 mr-3" />
                                                                더 많은 메시지 추천받기
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
