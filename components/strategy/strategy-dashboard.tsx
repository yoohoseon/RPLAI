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
                    <h3 className="text-xl font-bold tracking-tight text-foreground px-2 flex items-center gap-2">
                        <LayoutTemplate className="w-5 h-5 text-muted-foreground" />
                        콘텐츠 기획
                    </h3>
                    <Card className="rounded-3xl border-border/40 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md flex flex-col min-h-[550px] transition-all overflow-hidden h-full shadow-sm">
                        {/* Top: Selected Concept Info (Always visible) */}
                        <div className="p-6 border-b border-border/40 bg-white/60 dark:bg-slate-950/60 relative">
                            {availableConcepts && availableConcepts.length > 1 ? (
                                <div className="mb-4">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block px-1">
                                        Concept Category
                                    </span>
                                    <Select
                                        value={selectedIdx.toString()}
                                        onValueChange={(val) => {
                                            setSelectedIdx(parseInt(val));
                                            setSelectedMsgIdx(0); // Reset message index when concept changes
                                        }}
                                    >
                                        <SelectTrigger className="w-full h-12 bg-white dark:bg-slate-950 border-border/50 rounded-xl focus:ring-primary/20 text-base font-bold text-foreground">
                                            <SelectValue placeholder="컨셉을 선택하세요" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {availableConcepts.map((item: ConceptItem, idx: number) => (
                                                <SelectItem key={idx} value={idx.toString()} className="font-semibold text-base py-3">
                                                    {item.concept}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <h3 className="text-xl font-extrabold tracking-tight text-foreground mb-4 px-1">
                                    {activeConcept.concept}
                                </h3>
                            )}

                            <div className="bg-foreground/[0.03] rounded-xl p-4 flex flex-col gap-3 justify-start border border-border/40">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Key Message
                                </span>
                                {activeConcept.messages && activeConcept.messages.length > 1 ? (
                                    <Select
                                        value={selectedMsgIdx.toString()}
                                        onValueChange={(val) => setSelectedMsgIdx(parseInt(val))}
                                    >
                                        <SelectTrigger className="w-full h-auto min-h-12 py-3 bg-white dark:bg-slate-950 border-border/50 rounded-xl focus:ring-primary/20 text-sm font-medium leading-relaxed text-left text-foreground/90 whitespace-normal [&>span]:line-clamp-none">
                                            <SelectValue placeholder="키 메시지를 선택하세요" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl max-w-[400px]">
                                            {activeConcept.messages.map((msg: string, idx: number) => (
                                                <SelectItem key={idx} value={idx.toString()} className="font-medium text-sm py-3 leading-relaxed break-keep [&>span]:whitespace-normal">
                                                    {msg}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="text-sm font-medium leading-relaxed text-foreground/90 py-1 px-1">
                                        &quot;{activeConcept.messages?.[selectedMsgIdx] || activeConcept.message}&quot;
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
                    <h3 className="text-xl font-bold tracking-tight text-foreground px-2 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        저장된 전략 히스토리
                    </h3>
                    <Card className="rounded-3xl border-border/40 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md flex flex-col flex-1 transition-all overflow-hidden shadow-sm p-2">
                        {filteredStrategies.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                                    <Clock className="w-8 h-8 text-muted-foreground/50" />
                                </div>
                                <h4 className="text-lg font-bold mb-2 text-foreground/80">저장된 기록이 없습니다.</h4>
                                <p className="text-muted-foreground text-sm max-w-[250px]">
                                    이 컨셉으로 첫 번째 콘텐츠 전략을 세팅하고 저장해보세요.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 p-2 overflow-y-auto max-h-[700px] scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                                {filteredStrategies.slice().reverse().map((strategy, idx: number) => {
                                    const themeOutput = strategy.themes && strategy.themes.length > 0 ? strategy.themes[0] : null;
                                    const titleStr = themeOutput ? `${themeOutput.themeName}${strategy.themes.length > 1 ? ` 외 ${strategy.themes.length - 1}건` : ''}` : '기획 앵글 정보 없음';
                                    const descriptionStr = themeOutput ? themeOutput.description : '';

                                    return (
                                        <div key={strategy.id || idx} className="bg-white dark:bg-slate-950 border border-border/40 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-border/80 transition-all flex flex-col gap-3">
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full inline-block mb-2">
                                                        {strategy.conceptName}
                                                        <span className="mx-1.5 opacity-40">|</span>
                                                        {strategy.timing}
                                                    </span>
                                                    <h4 className="text-base font-extrabold tracking-tight text-foreground">
                                                        {titleStr}
                                                    </h4>
                                                </div>
                                            </div>
                                            <p className="text-sm font-medium text-foreground/70 line-clamp-2 leading-relaxed">
                                                {descriptionStr}
                                            </p>
                                            <div className="pt-2 flex items-center justify-between border-t border-border/40 mt-1">
                                                <span className="text-[11px] font-medium text-muted-foreground">
                                                    {strategy.createdAt ? new Date(strategy.createdAt).toLocaleDateString() : '최근 저장됨'}
                                                </span>
                                                <Link href={`/main/generation?analysisId=${analysisId}&strategyId=${strategy.id}`}>
                                                    <Button size="sm" variant="ghost" className="text-xs font-bold px-3 hover:bg-primary hover:text-primary-foreground rounded-full transition-colors h-8">
                                                        콘텐츠 생성 열기
                                                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
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
