"use client";

import { useState } from "react";
import { MessageSquare, Clock, ArrowRight, LayoutTemplate } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StrategySettings } from "./strategy-settings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveGeneratedStrategy, generateStrategyKeywords } from "@/app/lib/strategy-actions";
import { useRouter } from "next/navigation";

interface ConceptItem {
    concept: string;
    message: string;
    messages?: string[];
}

interface StrategyDashboardProps {
    concept: string;
    message: string;
    availableConcepts?: ConceptItem[];
    analysisId: string;
    savedStrategies?: {
        id: string;
        conceptName: string;
        conceptMessage: string;
        timing: string;
        goal: string;
        themes: { themeName: string; description: string; }[];
        createdAt?: string;
    }[];
}

export function StrategyDashboard({ concept, message, availableConcepts, analysisId, savedStrategies = [] }: StrategyDashboardProps) {
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedMsgIdx, setSelectedMsgIdx] = useState(0);

    const [selectedIdx, setSelectedIdx] = useState(() => {
        if (!availableConcepts || availableConcepts.length === 0) return 0;
        const idx = availableConcepts.findIndex((c: ConceptItem) => c.concept === concept);
        return idx >= 0 ? idx : 0;
    });

    const activeConcept = availableConcepts && availableConcepts.length > 0
        ? availableConcepts[selectedIdx]
        : { concept, message };

    const reqMsg = activeConcept.messages?.[selectedMsgIdx] || activeConcept.message;

    const filteredStrategies = savedStrategies.filter(
        (s) => s.conceptName === activeConcept.concept && s.conceptMessage === reqMsg
    );

    const handleGenerateStrategy = async (timing: string, goal: string) => {
        setIsGenerating(true);
        const result = await generateStrategyKeywords(timing, goal, activeConcept.concept, reqMsg);

        if (result.success && result.data) {
            const saveResult = await saveGeneratedStrategy(analysisId, {
                conceptName: activeConcept.concept,
                conceptMessage: reqMsg,
                timing,
                goal,
                themes: result.data.themes
            });
            setIsGenerating(false);

            if (saveResult.success && saveResult.strategyId) {
                router.push(`/main/generation?analysisId=${analysisId}&strategyId=${saveResult.strategyId}`);
            }
        } else {
            setIsGenerating(false);
        }
    };

    return (
        <section className="flex flex-col gap-6">

            {/* Left/Right Split Engine Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* Left Side: Strategy Selectors & Concept */}
                <div className="flex flex-col h-full gap-4">

                    {/* Unified Parameters Card */}
                    <div className="flex items-center gap-2 px-2">
                        <LayoutTemplate className="w-5 h-5 text-[#EE2924]" />
                        <h3 className="text-xl font-bold tracking-tight text-[#191F28]">콘텐츠 기획</h3>
                    </div>
                    <Card className="rounded-[32px] border-[#F2F4F6] bg-white flex flex-col min-h-[550px] transition-all overflow-hidden h-full shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                        {/* Top: Selected Concept Info (Always visible) */}
                        <div className="p-8 border-b border-[#F2F4F6] bg-white relative">
                            {availableConcepts && availableConcepts.length > 1 ? (
                                <div className="mb-6">
                                    <span className="text-[13px] font-bold text-[#8B95A1] uppercase tracking-wider mb-3 block px-1">
                                        분석 컨셉 카테고리
                                    </span>
                                    <Select
                                        value={selectedIdx.toString()}
                                        onValueChange={(val) => {
                                            setSelectedIdx(parseInt(val));
                                            setSelectedMsgIdx(0); // Reset message index when concept changes
                                        }}
                                    >
                                        <SelectTrigger className="w-full h-14 bg-[#F9FAFB] border-[#F2F4F6] rounded-2xl focus:ring-[#EE2924]/20 text-[16px] font-bold text-[#191F28]">
                                            <SelectValue placeholder="컨셉을 선택하세요" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-[#F2F4F6] shadow-xl w-[var(--radix-select-trigger-width)]">
                                            {availableConcepts.map((item: ConceptItem, idx: number) => (
                                                <SelectItem key={idx} value={idx.toString()} className="font-bold text-[15px] py-3.5 px-10 focus:bg-[#F2F4F6] focus:text-[#EE2924] data-[state=checked]:text-[#EE2924]">
                                                    {item.concept}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <h3 className="text-2xl font-bold tracking-tight text-[#191F28] mb-6 px-1 italic">
                                    &ldquo;{activeConcept.concept}&rdquo;
                                </h3>
                            )}

                            <div className="bg-[#F9FAFB] rounded-[24px] p-6 flex flex-col gap-4 border border-[#F2F4F6]">
                                <span className="text-[13px] font-bold text-[#EE2924] uppercase tracking-wider flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    핵심 광고 메시지 (Key Message)
                                </span>
                                {activeConcept.messages && activeConcept.messages.length > 1 ? (
                                    <Select
                                        value={selectedMsgIdx.toString()}
                                        onValueChange={(val) => setSelectedMsgIdx(parseInt(val))}
                                    >
                                        <SelectTrigger className="w-full h-auto min-h-14 py-4 px-5 bg-white border-[#F2F4F6] rounded-2xl focus:ring-[#EE2924]/20 text-[15px] font-bold leading-relaxed text-left text-[#191F28] whitespace-normal [&>span]:line-clamp-none shadow-sm">
                                            <SelectValue placeholder="키 메시지를 선택하세요" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-[#F2F4F6] shadow-xl w-[var(--radix-select-trigger-width)]">
                                            {activeConcept.messages.map((msg: string, idx: number) => (
                                                <SelectItem key={idx} value={idx.toString()} className="font-bold text-[14px] py-4 px-10 leading-relaxed whitespace-normal focus:bg-[#F2F4F6] focus:text-[#EE2924] data-[state=checked]:text-[#EE2924] data-[state=checked]:bg-[#EE2924]/5">
                                                    {msg}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="text-[16px] font-bold leading-relaxed text-[#191F28] py-1 px-1 break-keep">
                                        &ldquo;{activeConcept.messages?.[selectedMsgIdx] || activeConcept.message}&rdquo;
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Bottom: Dynamic Area (Settings -> Keyword Selectors) */}
                        <div className="flex-1 flex flex-col">
                            {/* Bottom: Settings Form */}
                            <div className="flex-1 flex flex-col">
                                <StrategySettings
                                    onGenerate={handleGenerateStrategy}
                                    isGenerating={isGenerating}
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Side: Saved Strategies History */}
                <div className="flex flex-col h-full gap-4">
                    <div className="flex items-center gap-2 px-2">
                        <Clock className="w-5 h-5 text-[#EE2924]" />
                        <h3 className="text-xl font-bold tracking-tight text-[#191F28]">저장된 전략 히스토리</h3>
                    </div>
                    <Card className="rounded-[32px] border-[#F2F4F6] bg-white flex flex-col flex-1 transition-all overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-4">
                        {filteredStrategies.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <div className="w-20 h-20 rounded-full bg-[#F9FAFB] flex items-center justify-center mb-6">
                                    <Clock className="w-10 h-10 text-[#ABB3BB]" />
                                </div>
                                <h4 className="text-xl font-bold mb-2 text-[#191F28]">저장된 기록이 없습니다.</h4>
                                <p className="text-[#4E5968] font-medium text-[15px] max-w-[280px] break-keep">
                                    이 컨셉으로 첫 번째 콘텐츠 전략을 세팅하고 저장해보세요.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 p-2 overflow-y-auto max-h-[750px] scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                                {filteredStrategies.slice().reverse().map((strategy, idx: number) => {
                                    const themeOutput = strategy.themes && strategy.themes.length > 0 ? strategy.themes[0] : null;
                                    const titleStr = themeOutput ? `${themeOutput.themeName}${strategy.themes.length > 1 ? ` 외 ${strategy.themes.length - 1}건` : ''}` : '기획 앵글 정보 없음';
                                    const descriptionStr = themeOutput ? themeOutput.description : '';

                                    return (
                                        <div key={strategy.id || idx} className="bg-white border border-[#F2F4F6] p-6 rounded-[24px] shadow-sm hover:shadow-md hover:border-[#EE2924]/30 transition-all flex flex-col gap-4">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#EE2924] bg-[#EE2924]/5 px-2.5 py-1 rounded-lg inline-block">
                                                            {strategy.conceptName}
                                                        </span>
                                                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#4E5968] bg-[#F2F4F6] px-2.5 py-1 rounded-lg inline-block">
                                                            {strategy.timing}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-[17px] font-bold tracking-tight text-[#191F28]">
                                                        {titleStr}
                                                    </h4>
                                                </div>
                                            </div>
                                            <p className="text-[14px] font-medium text-[#4E5968] line-clamp-2 leading-relaxed break-keep">
                                                {descriptionStr}
                                            </p>
                                            <div className="pt-4 flex items-center justify-between border-t border-[#F2F4F6] mt-1">
                                                <span className="text-[12px] font-bold text-[#ABB3BB]">
                                                    {strategy.createdAt ? new Date(strategy.createdAt).toLocaleDateString() : '최근 저장됨'}
                                                </span>
                                                <Link href={`/main/generation?analysisId=${analysisId}&strategyId=${strategy.id}`}>
                                                    <Button size="sm" className="bg-[#EE2924] text-white hover:bg-[#D11F1B] rounded-xl text-[13px] font-bold px-4 h-9 shadow-sm">
                                                        업무 보드 열기
                                                        <ArrowRight className="w-4 h-4 ml-2" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </section>
    );
}
