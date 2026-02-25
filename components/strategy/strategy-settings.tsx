"use client";

import { useState } from "react";
import { Sparkles, Calendar, Target, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StrategySettingsProps {
    onGenerate: (timing: string, goal: string) => void;
    isGenerating: boolean;
}

export function StrategySettings({ onGenerate, isGenerating }: StrategySettingsProps) {
    const currentMonth = new Date().getMonth() + 1;
    const [month, setMonth] = useState<number[]>([currentMonth, Math.min(currentMonth + 2, 12)]);
    const [isNewLaunch, setIsNewLaunch] = useState<boolean>(false);
    const [goal, setGoal] = useState<string>("");

    const handleGenerate = () => {
        if (!month[0] || !goal) return;
        const monthRangeStr = month[0] === month[1] ? `${month[0]}월` : `${month[0]}월 ~ ${month[1]}월`;
        const timingStr = `${monthRangeStr}${isNewLaunch ? " (신제품 런칭 이슈 포함)" : ""}`;
        onGenerate(timingStr, goal);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 rounded-b-3xl">
            {/* Header Area */}
            <div className="p-6 border-b border-border/40 pb-5">
                <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                    <Sparkles className="w-5 h-5 text-primary" />
                    설정
                </h3>
                <p className="text-sm text-muted-foreground mt-1">캠페인 시기와 목적을 알려주시면, AI가 3가지 기획 앵글과 50개의 키워드 풀을 제안합니다.</p>
            </div>

            {/* Form Area */}
            <div className="p-6 flex-1 flex flex-col gap-6">
                {/* 1. Timing Input (Slider & Checkbox) */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            발행 예정 월 (Month)
                        </Label>
                        <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                            {month[0] === month[1] ? `${month[0]}월` : `${month[0]}월 ~ ${month[1]}월`}
                        </span>
                    </div>

                    <div className="px-2">
                        <Slider
                            value={month}
                            onValueChange={setMonth}
                            max={12}
                            min={1}
                            step={1}
                            className="w-full cursor-pointer"
                        />
                        <div className="flex justify-between items-center mt-2 text-xs font-medium tracking-wider text-muted-foreground/60 w-full px-1">
                            <span>1월</span>
                            <span>12월</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 bg-muted/40 p-4 rounded-xl border border-border/40 hover:bg-muted/60 transition-colors">
                        <Checkbox
                            id="newLaunch"
                            checked={isNewLaunch}
                            onCheckedChange={(checked) => setIsNewLaunch(checked as boolean)}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label
                            htmlFor="newLaunch"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 flex items-center justify-between"
                        >
                            <span className="flex items-center gap-1.5">
                                신제품/신규 서비스 런칭 준비
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-[200px] text-xs font-medium p-2">
                                            체크 시 AI가 런칭 기대감, 사전예약 등에 관련된 시즌 키워드를 적극 탐색합니다.
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </span>
                        </Label>
                    </div>
                </div>

                {/* 2. Goal Input */}
                <div className="space-y-3">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        캠페인 핵심 목적
                    </Label>
                    <Select value={goal} onValueChange={setGoal}>
                        <SelectTrigger className="w-full h-12 bg-white dark:bg-slate-950 border-border/50 rounded-xl focus:ring-primary/20">
                            <SelectValue placeholder="어떤 행동을 유도하고 싶나요?" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="인지도 확산 (도달/바이럴 중심)">인지도 확산 (도달/바이럴 중심)</SelectItem>
                            <SelectItem value="매출/프로모션 전환 (세일즈 중심)">매출/프로모션 전환 (세일즈 중심)</SelectItem>
                            <SelectItem value="고객 참여 유도 (댓글/이벤트 중심)">고객 참여 유도 (댓글/이벤트 중심)</SelectItem>
                            <SelectItem value="브랜드 충성도/팬덤 강화 (정보성/소통 중심)">브랜드 충성도/팬덤 강화 (소통 중심)</SelectItem>
                            <SelectItem value="웹사이트/앱 트래픽 유입">웹사이트/앱 트래픽 유입</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Action Area */}
            <div className="p-6 pt-2 mt-auto">
                <Button
                    onClick={handleGenerate}
                    disabled={!month[0] || !goal || isGenerating}
                    size="lg"
                    className="w-full rounded-xl h-14 text-base font-bold shadow-xl shadow-primary/10 transition-all hover:-translate-y-0.5"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            AI 기획 앵글 도출 중...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            AI 전략 키워드 세팅하기
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
