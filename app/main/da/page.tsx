"use client";

import { useState } from "react";
import { BrandDaRegistrationForm } from "@/components/home/brand-da-registration-form";

export default function DaMainPage() {
    const [preset, setPreset] = useState<any>(null);
    const [promptText, setPromptText] = useState("");
    const [isParsing, setIsParsing] = useState(false);

    const handleSetPreset = async () => {
        if (!promptText.trim()) {
            alert("텍스트를 먼저 입력해주세요.");
            return;
        }

        setIsParsing(true);
        try {
            const res = await fetch('/api/parse-da-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ promptText })
            });
            const data = await res.json();

            if (res.ok) {
                setPreset(data);
            } else {
                console.error(data.error);
                alert("AI 파싱에 실패했습니다.");
            }
        } catch (err) {
            console.error(err);
            alert("오류가 발생했습니다.");
        } finally {
            setIsParsing(false);
        }
    };
    return (
        <div className="relative min-h-[calc(100vh-4rem)] bg-transparent flex items-center justify-center p-6 md:p-10 font-sans">
            <div className="w-full grid lg:grid-cols-2 gap-16 items-center px-4 sm:px-6 lg:px-8">
                {/* Left Column: Hero Text */}
                <div className="space-y-8 text-center lg:text-left animate-in fade-in slide-in-from-left-5 duration-1000">
                    <div className="space-y-4">
                        <h1 className="text-5xl lg:text-[72px] font-bold tracking-tight text-[#333333] leading-[1.15]">
                            데이터로 이끄는<br />
                            <span className="text-[#0064FF]">디지털 에셋 분석</span>
                        </h1>
                        <p className="text-[19px] lg:text-[22px] font-medium text-[#4E5968] leading-relaxed max-w-xl mx-auto lg:mx-0 break-keep">
                            단 몇 초 만에 심도 있는 디지털 자산 인사이트를 도출합니다.<br />
                            고급 AI 분석으로 실행 가능한 온라인 전략을 세워보세요.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-4">
                        <div className="flex items-center gap-2 text-[15px] font-bold bg-white text-[#4E5968] px-5 py-3 rounded-2xl shadow-sm border-none">
                            <span className="text-[#333333]">✓</span> 경쟁사 채널 지표
                        </div>
                        <div className="flex items-center gap-2 text-[15px] font-bold bg-white text-[#4E5968] px-5 py-3 rounded-2xl shadow-sm border-none">
                            <span className="text-[#333333]">✓</span> 디지털 소통 구조
                        </div>
                        <div className="flex items-center gap-2 text-[15px] font-bold bg-white text-[#4E5968] px-5 py-3 rounded-2xl shadow-sm border-none">
                            <span className="text-[#333333]">✓</span> 미디어 자산 최적화
                        </div>
                    </div>

                    <div className="mt-12 pt-10 border-t border-[#E5E8EB]/50 animate-in fade-in slide-in-from-left-5 duration-1000 delay-300">
                        <p className="text-[15px] font-bold text-[#333333] mb-4 text-center lg:text-left">
                            아래 예시와 같이 브랜드/제품명을 입력하시면 최적의 분석 세팅을 추천해 드립니다.
                        </p>

                        <textarea
                            value={promptText}
                            onChange={(e) => setPromptText(e.target.value)}
                            placeholder={"분석하고 싶은 브랜드 혹은 제품명을 입력하세요.\n\n산업: 코스메틱\n타겟 국가: 한국\n브랜드명: 센카 (Senka)\n자사 브랜드 및 제품: 퍼펙트 휩, 퍼펙트 화이트 클레이, 센카 올 클리어 오일\n경쟁사 브랜드 및 제품: 마녀공장(퓨어 클렌징 오일), 해피바스(마이크로 미셀라), 비레디(딥 클렌징 폼)"}
                            className="flex min-h-[260px] w-full rounded-2xl border border-[#E5E8EB] bg-white px-5 py-5 text-[15px] font-bold transition-all focus:border-[#0064FF] focus:ring-1 focus:ring-[#0064FF] focus:outline-none placeholder:text-[#A4AEC0] text-[#333333] resize-none mb-4 leading-relaxed shadow-sm hover:border-[#D1D6DB]"
                        />

                        <button
                            onClick={handleSetPreset}
                            disabled={isParsing}
                            className="w-[200px] mx-auto lg:mx-0 flex items-center justify-center gap-2 bg-[#0064FF] hover:bg-[#0052E0] text-white font-bold text-[15px] h-12 rounded-[20px] transition-colors active:scale-[0.98] disabled:opacity-50 shadow-md shadow-[#0064FF]/20"
                        >
                            {isParsing ? "AI 분석 중..." : "추천값으로 세팅"}
                        </button>
                    </div>
                </div>

                {/* Right Column: Analysis Form */}
                <div className="w-full animate-in fade-in slide-in-from-right-5 duration-1000 delay-200">
                    <div className="bg-white rounded-[36px] p-8 sm:p-12 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-none relative overflow-hidden group">
                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-[28px] lg:text-[32px] font-bold tracking-tight mb-2 text-[#333333]">타겟 정보 등록</h2>
                            <p className="text-[16px] font-medium text-[#4E5968]">분석할 브랜드의 디지털 자산 정보를 입력해 주세요.</p>
                        </div>

                        <BrandDaRegistrationForm presetData={preset} />
                    </div>
                </div>
            </div>
        </div>
    );
}
