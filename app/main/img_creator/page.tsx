"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, LayoutGrid, Search, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { generatePinterestKeywords } from "@/app/lib/concept-actions";

export default function MoodboardCreatorPage() {
    const [brandName, setBrandName] = useState("");
    const [concept, setConcept] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<{ keywords: string[], images: string[] } | null>(null);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(true);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setErrorMsg(null);
        setResult(null);
        setIsFormOpen(false); // 도출 시작 시 폼을 위로 접습니다.

        try {
            // 1. AI에게 핀터레스트 검색 키워드 추천받기
            const keywordRes = await generatePinterestKeywords(brandName, concept);
            if (!keywordRes.success || !keywordRes.keywords) {
                throw new Error("키워드 추천에 실패했습니다.");
            }

            const aiKeywords = keywordRes.keywords;

            // 2. 추천받은 키워드 중 상위 3개를 묶어서 검색 (더 다양하고 많은 결과)
            const activeKeywords = aiKeywords.slice(0, 3).join(',');
            const response = await fetch(`/api/pinterest?q=${encodeURIComponent(activeKeywords)}`);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "핀터레스트 이미지를 가져오지 못했습니다. 잠시 후 다시 시도해주세요.");
            }

            setResult({
                keywords: aiKeywords,
                images: data.images.slice(0, 24) // 최대 24장까지 대폭 표시
            });
        } catch (error: any) {
            console.error(error);
            setErrorMsg(error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F4F7] font-sans">
            <div className="w-full py-12 px-6 space-y-10 animate-in fade-in duration-700">
                <div className="flex flex-col space-y-2 pb-6 border-b border-[#E5E8EB]">
                    <h1 className="text-3xl font-bold tracking-tight text-[#333333]">무드보드 생성</h1>
                    <p className="text-[17px] font-medium text-[#4E5968]">브랜드와 컨셉을 입력하면 최적의 핀터레스트 무드보드를 추출합니다.</p>
                </div>

                {/* Collapsible Input Section */}
                <Card className="rounded-[2rem] border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white overflow-hidden w-full transition-all duration-300">
                    {isFormOpen ? (
                        <div className="p-6 lg:p-8 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-[18px] font-bold text-[#333333] flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-[#333333]" />
                                    컨셉 정보 입력
                                </h2>
                                {(result || isGenerating) && (
                                    <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)} className="text-[#8B95A1] hover:text-[#333333] h-8 rounded-xl px-2">
                                        최소화 <ChevronUp className="w-4 h-4 ml-1" />
                                    </Button>
                                )}
                            </div>
                            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end">
                                <div className="w-full lg:w-[25%] space-y-3">
                                    <Label className="text-[15px] font-bold text-[#333333]">브랜드 명</Label>
                                    <Input
                                        value={brandName}
                                        onChange={(e) => setBrandName(e.target.value)}
                                        placeholder="예: 니치 향수 브랜드"
                                        className="h-14 bg-[#F2F4F7] border-none rounded-2xl px-5 text-[15px] text-[#333333] font-medium placeholder:text-[#A4AEC0] focus-visible:ring-1 focus-visible:ring-[#333333]"
                                    />
                                </div>
                                <div className="w-full lg:w-[50%] space-y-3">
                                    <Label className="text-[15px] font-bold text-[#333333]">핵심 컨셉</Label>
                                    <Input
                                        value={concept}
                                        onChange={(e) => setConcept(e.target.value)}
                                        placeholder="예: 새벽 숲속의 몽환적인 분위기, 차분하고 미니멀한 무드"
                                        className="h-14 bg-[#F2F4F7] border-none rounded-2xl px-5 text-[15px] text-[#333333] focus-visible:ring-1 focus-visible:ring-[#333333] font-medium placeholder:text-[#A4AEC0]"
                                    />
                                </div>
                                <div className="w-full lg:w-[25%]">
                                    <Button
                                        onClick={handleGenerate}
                                        disabled={!brandName || !concept || isGenerating}
                                        className="w-full h-14 bg-[#030000] text-white hover:bg-[#1A1A1A] active:bg-[#111111] font-bold rounded-2xl shadow-none text-[16px] transition-all active:scale-[0.98] disabled:bg-[#ABB3BB]"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                탐색 중...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-5 h-5 mr-2" />
                                                도출하기
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="p-4 px-6 flex items-center justify-between cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                            onClick={() => setIsFormOpen(true)}
                        >
                            <div className="flex items-center gap-4">
                                <span className="px-3 py-1 bg-[#F2F4F7] text-[#4E5968] font-bold rounded-lg text-[13px]">검색 중점</span>
                                <p className="text-[15px] text-[#333333]">
                                    <span className="font-bold">{brandName}</span> <span className="text-[#8B95A1] mx-1">|</span> {concept}
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-[#8B95A1] hover:text-[#333333] pointer-events-none h-8 px-2">
                                내용 수정하기 <ChevronDown className="w-5 h-5 ml-1" />
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Result Section */}
                {isGenerating || result ? (
                    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* 1. Keywords Card */}
                        <Card className="rounded-[2rem] border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white p-6 lg:p-8">
                            <h3 className="text-[16px] font-bold text-[#333333] mb-4 flex items-center gap-2">
                                <Search className="w-4 h-4 text-[#8B95A1]" />
                                AI 추천 핀터레스트 검색 키워드
                            </h3>
                            {isGenerating && !result ? (
                                <div className="flex items-center gap-3 text-[#8B95A1] h-10">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-[14px] font-bold">최적의 키워드 조합을 추출하고 있습니다...</span>
                                </div>
                            ) : result && (
                                <div className="flex flex-wrap gap-2">
                                    {result.keywords.map((kw, i) => (
                                        <span key={i} className="px-4 py-2 rounded-xl bg-[#F2F4F6] text-[#4E5968] font-bold text-[14px]">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </Card>

                        {/* 2. Moodboard Grid Card */}
                        <Card className="rounded-[2rem] border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white flex flex-col flex-1 min-h-[600px] p-6 lg:p-8">
                            {isGenerating && (!result || result.images.length === 0) ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center">
                                    <Loader2 className="w-10 h-10 animate-spin text-[#ABB3BB] mb-4" />
                                    <h3 className="text-[18px] font-bold text-[#333333] mb-2">무드보드 이미지를 스크래핑 중입니다</h3>
                                    <p className="text-[15px] text-[#8B95A1] font-medium break-keep">
                                        선별된 키워드를 바탕으로 실제 핀터레스트 이미지를 탐색합니다.<br />
                                        가상 브라우저가 동작하여 약 5~15초 정도 소요될 수 있습니다.
                                    </p>
                                </div>
                            ) : result ? (
                                <div className="flex-1 flex flex-col">
                                    <div className="flex items-center justify-between w-full mb-6">
                                        <h3 className="text-[16px] font-bold text-[#333333] flex items-center gap-2">
                                            <LayoutGrid className="w-4 h-4 text-[#8B95A1]" />
                                            추출된 무드보드 ({result.images.length}장)
                                        </h3>
                                        <Button size="sm" variant="ghost" className="h-8 px-3 rounded-full text-xs font-bold bg-[#F2F4F7] text-[#4E5968] hover:bg-[#E5E8EB]">
                                            이미지 다운로드
                                        </Button>
                                    </div>

                                    {result.images.length > 0 ? (
                                        <div className="relative w-full h-[800px] md:h-[1000px] lg:h-[1200px] bg-[#FFFFFF]/50 rounded-[2rem] overflow-hidden flex items-center justify-center p-8">
                                            {result.images.map((img, i) => {
                                                // 24개 배치를 위한 풍부한 꼴라쥬 스타일셋
                                                const collageStyles = [
                                                    { width: "20%", top: "8%", left: "5%", rotate: "-4deg", zIndex: 10 },
                                                    { width: "15%", top: "5%", left: "28%", rotate: "2deg", zIndex: 5 },
                                                    { width: "18%", top: "25%", left: "12%", rotate: "3deg", zIndex: 20 },
                                                    { width: "26%", top: "15%", left: "38%", rotate: "0deg", zIndex: 30 },
                                                    { width: "16%", top: "6%", left: "68%", rotate: "4deg", zIndex: 15 },
                                                    { width: "18%", top: "30%", left: "60%", rotate: "-3deg", zIndex: 25 },
                                                    { width: "20%", top: "20%", left: "76%", rotate: "2deg", zIndex: 20 },

                                                    { width: "24%", top: "45%", left: "25%", rotate: "-2deg", zIndex: 35 },
                                                    { width: "14%", top: "50%", left: "5%", rotate: "-5deg", zIndex: 15 },
                                                    { width: "18%", top: "55%", left: "52%", rotate: "1deg", zIndex: 20 },
                                                    { width: "22%", top: "42%", left: "70%", rotate: "-4deg", zIndex: 10 },

                                                    { width: "17%", top: "70%", left: "10%", rotate: "3deg", zIndex: 25 },
                                                    { width: "22%", top: "68%", left: "32%", rotate: "-1deg", zIndex: 30 },
                                                    { width: "16%", top: "75%", left: "55%", rotate: "4deg", zIndex: 15 },
                                                    { width: "20%", top: "65%", left: "75%", rotate: "-2deg", zIndex: 20 },

                                                    { width: "19%", top: "85%", left: "8%", rotate: "-3deg", zIndex: 10 },
                                                    { width: "15%", top: "88%", left: "28%", rotate: "2deg", zIndex: 5 },
                                                    { width: "25%", top: "82%", left: "45%", rotate: "-1deg", zIndex: 25 },
                                                    { width: "18%", top: "86%", left: "72%", rotate: "3deg", zIndex: 15 },

                                                    { width: "15%", top: "35%", left: "42%", rotate: "-4deg", zIndex: 10 },
                                                    { width: "12%", top: "12%", left: "85%", rotate: "5deg", zIndex: 5 },
                                                    { width: "16%", top: "55%", left: "82%", rotate: "-1deg", zIndex: 10 },
                                                    { width: "14%", top: "25%", left: "2%", rotate: "2deg", zIndex: 8 },
                                                ];

                                                const style = collageStyles[i % collageStyles.length];

                                                return (
                                                    <div
                                                        key={i}
                                                        className="absolute bg-transparent shadow-[0_8px_30px_rgba(0,0,0,0.08)] group hover:z-50 transition-all duration-300 ease-out hover:scale-[1.03]"
                                                        style={{
                                                            width: style.width,
                                                            top: style.top,
                                                            left: style.left,
                                                            transform: `rotate(${style.rotate})`,
                                                            zIndex: style.zIndex,
                                                        }}
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={img}
                                                            alt="Moodboard tile"
                                                            className="w-full h-auto object-cover opacity-95 group-hover:opacity-100 transition-opacity"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center p-8 bg-[#F2F4F7] rounded-2xl text-[#8B95A1] font-bold w-full h-[400px]">
                                            검색된 이미지가 없습니다. 다른 키워드로 다시 시도해보세요.
                                        </div>
                                    )}
                                </div>
                            ) : null}

                            {errorMsg && (
                                <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 w-full text-left">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p className="text-[14px] font-bold leading-relaxed">{errorMsg}</p>
                                </div>
                            )}
                        </Card>
                    </div>
                ) : (
                    <Card className="rounded-[2rem] border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white w-full flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[500px]">
                        <div className="w-24 h-24 rounded-full bg-[#F2F4F7] flex items-center justify-center mb-6">
                            <LayoutGrid className="w-10 h-10 text-[#ABB3BB]" />
                        </div>
                        <h3 className="text-[18px] font-bold text-[#333333] mb-3">무드보드가 이곳에 생성됩니다</h3>
                        <p className="text-[15px] text-[#8B95A1] font-medium break-keep leading-relaxed">
                            상단의 <strong>도출하기</strong> 버튼을 눌러보세요.<br />
                            AI가 검색 키워드를 추천하고 핀터레스트 이미지를 즉시 추출해옵니다.
                        </p>
                    </Card>
                )}
            </div>
        </div>
    );
}
