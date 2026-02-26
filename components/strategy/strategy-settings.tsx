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
        <div className="flex flex-col h-full bg-white rounded-b-[32px]">
            {/* Header Area */}
            <div className="p-8 pb-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-[#191F28]">
                    <Sparkles className="w-5 h-5 text-[#3182F6]" />
                    기획 설정
                </h3>
                <p className="text-[14px] font-medium text-[#4E5968] mt-2 leading-relaxed">캠페인 시기와 목적을 알려주시면, AI가 3가지 기획 앵글과 50개의 키워드 풀을 제안합니다.</p>
            </div>

            {/* Form Area */}
            <div className="p-8 pt-0 flex-1 flex flex-col gap-8">
                {/* 1. Timing Input (Slider & Checkbox) */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Label className="text-[15px] font-bold flex items-center gap-2 text-[#191F28]">
                            <Calendar className="w-4 h-4 text-[#8B95A1]" />
                            발행 예정 시기
                        </Label>
                        <span className="text-[14px] font-bold text-[#3182F6] bg-[#3182F6]/5 px-4 py-1.5 rounded-full">
                            {month[0] === month[1] ? `${month[0]}월` : `${month[0]}월 ~ ${month[1]}월`}
                        </span>
                    </div>

                    <div className="px-1">
                        <Slider
                            value={month}
                            onValueChange={setMonth}
                            max={12}
                            min={1}
                            step={1}
                            className="w-full cursor-pointer [--primary:#3182F6]"
                        />
                        <div className="flex justify-between items-center mt-3 text-[11px] font-bold tracking-wider text-[#ABB3BB] w-full px-1">
                            <span>1월</span>
                            <span>12월</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 bg-[#F9FAFB] p-5 rounded-2xl border border-[#F2F4F6] hover:bg-[#F2F4F6] transition-colors cursor-pointer group" onClick={() => setIsNewLaunch(!isNewLaunch)}>
                        <Checkbox
                            id="newLaunch"
                            checked={isNewLaunch}
                            onCheckedChange={(checked) => setIsNewLaunch(checked as boolean)}
                            className="border-[#ABB3BB] data-[state=checked]:bg-[#3182F6] data-[state=checked]:border-[#3182F6] w-5 h-5"
                        />
                        <Label
                            htmlFor="newLaunch"
                            className="text-[14px] font-bold leading-none cursor-pointer flex-1 flex items-center justify-between text-[#4E5968] group-hover:text-[#191F28]"
                        >
                            <span className="flex items-center gap-2">
                                신제품 / 서비스 런칭 캠페인
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="w-4 h-4 text-[#ABB3BB] hover:text-[#3182F6] transition-colors cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-[220px] text-[12px] font-bold p-3 rounded-xl border-[#F2F4F6] shadow-xl">
                                            체크 시 AI가 런칭 기대감, 사전예약 등에 관련된 시즌 키워드를 적극 탐색합니다.
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </span>
                        </Label>
                    </div>
                </div>

                {/* 2. Goal Input */}
                <div className="space-y-4">
                    <Label className="text-[15px] font-bold flex items-center gap-2 text-[#191F28]">
                        <Target className="w-4 h-4 text-[#8B95A1]" />
                        캠페인 핵심 목표
                    </Label>
                    <Select value={goal} onValueChange={setGoal}>
                        <SelectTrigger className="w-full h-14 bg-[#F9FAFB] border-[#F2F4F6] rounded-2xl focus:ring-[#3182F6]/20 text-[15px] font-bold text-[#191F28]">
                            <SelectValue placeholder="유도하고 싶은 행동을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-[#F2F4F6] shadow-2xl w-[var(--radix-select-trigger-width)]">
                            <SelectItem value="인지도 확산 (도달/바이럴 중심)" className="py-3.5 px-10 font-bold focus:bg-[#F2F4F6] data-[state=checked]:text-[#3182F6]">인지도 확산 (도달/바이럴 중심)</SelectItem>
                            <SelectItem value="매출/프로모션 전환 (세일즈 중심)" className="py-3.5 px-10 font-bold focus:bg-[#F2F4F6] data-[state=checked]:text-[#3182F6]">매출/프로모션 전환 (세일즈 중심)</SelectItem>
                            <SelectItem value="고객 참여 유도 (댓글/이벤트 중심)" className="py-3.5 px-10 font-bold focus:bg-[#F2F4F6] data-[state=checked]:text-[#3182F6]">고객 참여 유도 (댓글/이벤트 중심)</SelectItem>
                            <SelectItem value="브랜드 충성도/팬덤 강화 (정보성/소통 중심)" className="py-3.5 px-10 font-bold focus:bg-[#F2F4F6] data-[state=checked]:text-[#3182F6]">브랜드 충성도/팬덤 강화 (소통 중심)</SelectItem>
                            <SelectItem value="웹사이트/앱 트래픽 유입" className="py-3.5 px-10 font-bold focus:bg-[#F2F4F6] data-[state=checked]:text-[#3182F6]">웹사이트/앱 트래픽 유입</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Action Area */}
            <div className="p-8 pt-0 mt-auto">
                <Button
                    onClick={handleGenerate}
                    disabled={!month[0] || !goal || isGenerating}
                    size="lg"
                    className="w-full rounded-[20px] h-16 text-[17px] font-bold shadow-lg shadow-[#3182F6]/10 transition-all active:scale-[0.98] bg-[#3182F6] text-white hover:bg-[#1B64DA]"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                            AI가 기획 앵글을 도출하고 있습니다...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5 mr-3" />
                            AI 전략 키워드 세팅하기
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
