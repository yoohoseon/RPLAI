"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Target, AlertCircle } from "lucide-react";

export default function CompetitorAnalysisPage() {
    const [brandKor, setBrandKor] = useState("");
    const [brandEng, setBrandEng] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [category, setCategory] = useState("");

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any[] | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setErrorMsg(null);
        setResult(null);

        try {
            // 영문 브랜드명 우선으로 검색에 활용
            const searchTerm = brandEng || brandKor;
            const response = await fetch(`/api/meta-ads?q=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "메타 광고 데이터를 가져오는데 실패했습니다.");
            }

            setResult(data.data);
        } catch (error: any) {
            console.error(error);
            setErrorMsg(error.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const isFormValid = brandKor && brandEng && websiteUrl && category;

    return (
        <div className="min-h-screen bg-[#F2F4F7] font-sans">
            <div className="w-full py-12 px-6 space-y-10 animate-in fade-in duration-700">
                <div className="flex flex-col space-y-2 pb-6 border-b border-[#E5E8EB]">
                    <h1 className="text-3xl font-bold tracking-tight text-[#333333]">경쟁사 광고 분석</h1>
                    <p className="text-[17px] font-medium text-[#4E5968]">분석할 브랜드 정보를 입력하면 메타 광고 라이브러리를 통해 주요 광고 소재를 분석합니다.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Input Form Section */}
                    <div className="lg:col-span-5 space-y-6">
                        <Card className="rounded-[2rem] border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white overflow-hidden">
                            <CardHeader className="bg-[#F9FAFB] border-b border-[#F2F4F6] p-6 lg:p-8">
                                <CardTitle className="text-xl font-bold text-[#333333] flex items-center gap-2">
                                    <Target className="w-5 h-5 text-[#333333]" />
                                    타겟 브랜드 정보
                                </CardTitle>
                                <CardDescription className="text-[14px] font-medium text-[#8B95A1] pt-1">
                                    경쟁사 메타 광고 검색을 위한 정보입니다.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 lg:p-8 space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-[15px] font-bold text-[#333333]">브랜드명 (국문)</Label>
                                    <Input
                                        value={brandKor}
                                        onChange={(e) => setBrandKor(e.target.value)}
                                        placeholder="예: 나이키"
                                        className="h-14 bg-[#F2F4F7] border-none rounded-2xl px-5 text-[15px] text-[#333333] font-medium placeholder:text-[#A4AEC0] focus-visible:ring-1 focus-visible:ring-[#333333]"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[15px] font-bold text-[#333333]">브랜드명 (영문)</Label>
                                    <Input
                                        value={brandEng}
                                        onChange={(e) => setBrandEng(e.target.value)}
                                        placeholder="예: Nike"
                                        className="h-14 bg-[#F2F4F7] border-none rounded-2xl px-5 text-[15px] text-[#333333] font-medium placeholder:text-[#A4AEC0] focus-visible:ring-1 focus-visible:ring-[#333333]"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[15px] font-bold text-[#333333]">웹사이트 링크</Label>
                                    <Input
                                        value={websiteUrl}
                                        onChange={(e) => setWebsiteUrl(e.target.value)}
                                        placeholder="예: https://www.nike.com"
                                        className="h-14 bg-[#F2F4F7] border-none rounded-2xl px-5 text-[15px] text-[#333333] font-medium placeholder:text-[#A4AEC0] focus-visible:ring-1 focus-visible:ring-[#333333]"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[15px] font-bold text-[#333333]">주요업종</Label>
                                    <Input
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        placeholder="예: 스포츠 의류, 뷰티, 푸드"
                                        className="h-14 bg-[#F2F4F7] border-none rounded-2xl px-5 text-[15px] text-[#333333] font-medium placeholder:text-[#A4AEC0] focus-visible:ring-1 focus-visible:ring-[#333333]"
                                    />
                                </div>

                                <Button
                                    onClick={handleAnalyze}
                                    disabled={!isFormValid || isAnalyzing}
                                    className="w-full h-14 bg-[#030000] text-white hover:bg-[#1A1A1A] active:bg-[#111111] font-bold rounded-2xl shadow-none text-[16px] mt-6 transition-all active:scale-[0.98] disabled:bg-[#ABB3BB]"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            데이터 수집 및 분석 중...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="w-5 h-5 mr-2" />
                                            경쟁사 광고 분석하기
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Temporary Result Area */}
                    <div className="lg:col-span-7 flex flex-col h-full">
                        <Card className="rounded-[2rem] border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white w-full flex-1 flex flex-col p-2 min-h-[600px]">
                            {isAnalyzing ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center text-[#8B95A1] flex-1 h-full min-h-[600px]">
                                    <Loader2 className="w-10 h-10 animate-spin text-[#ABB3BB] mb-4" />
                                    <h3 className="text-[18px] font-bold text-[#333333] mb-2">메타 광고 라이브러리 탐색 중...</h3>
                                    <p className="text-[15px] font-medium break-keep leading-relaxed">
                                        입력하신 브랜드를 바탕으로 현재 집행 중인 공식 광고를 가져오고 있습니다.<br />
                                    </p>
                                </div>
                            ) : errorMsg ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center flex-1 h-full min-h-[600px]">
                                    <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                                    <p className="text-[16px] font-bold text-red-500">{errorMsg}</p>
                                    <p className="text-[14px] text-gray-500 mt-2">이름을 변경해서 다시 시도해보세요.</p>
                                </div>
                            ) : result ? (
                                <div className="p-6 lg:p-8 flex flex-col h-full overflow-y-auto max-h-[800px]">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-[18px] font-bold text-[#333333]">최근 활성 광고 ({result.length}건)</h3>
                                    </div>
                                    <div className="space-y-6">
                                        {result.length === 0 ? (
                                            <div className="p-10 text-center bg-[#F9FAFB] rounded-2xl">
                                                <p className="text-[#8B95A1] font-bold">진행 중인 광고가 없거나 찾을 수 없습니다.</p>
                                            </div>
                                        ) : (
                                            result.map((ad, idx) => (
                                                <div key={ad.id || idx} className="p-6 bg-[#F9FAFB] rounded-2xl border border-[#F2F4F6] flex flex-col space-y-3 relative group transition hover:shadow-md">
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-bold text-[#333333] text-[15px]">{ad.page_name}</span>
                                                        <span className="text-[12px] bg-[#E5E8EB] px-2 py-1 rounded text-[#4E5968] font-bold">
                                                            {ad.ad_delivery_start_time ? new Date(ad.ad_delivery_start_time).toLocaleDateString() : '날짜 확인불가'} 시작
                                                        </span>
                                                    </div>

                                                    {/* 광고 문구 */}
                                                    {ad.ad_creative_bodies && ad.ad_creative_bodies.length > 0 && (
                                                        <div className="pt-2 text-[14px] text-[#4E5968] whitespace-pre-line leading-relaxed border-t border-[#E5E8EB]">
                                                            {ad.ad_creative_bodies[0]}
                                                        </div>
                                                    )}

                                                    {/* 광고 원본(이미지/영상) 보러가기 버튼 */}
                                                    {ad.ad_snapshot_url && (
                                                        <div className="pt-3 mt-auto">
                                                            <a
                                                                href={ad.ad_snapshot_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center justify-center w-full bg-[#E5E8EB] hover:bg-[#D1D6DB] text-[#333333] text-[13px] font-bold py-2.5 rounded-xl transition-colors"
                                                            >
                                                                원본 광고 (이미지/영상) 확인하기 ↗
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 text-center flex-1 h-full min-h-[600px]">
                                    <div className="w-24 h-24 rounded-full bg-[#F2F4F7] flex items-center justify-center mb-6">
                                        <Search className="w-10 h-10 text-[#ABB3BB]" />
                                    </div>
                                    <h3 className="text-[18px] font-bold text-[#333333] mb-3">경쟁사 광고 분석 결과</h3>
                                    <p className="text-[15px] text-[#8B95A1] font-medium break-keep leading-relaxed">
                                        좌측에 분석할 브랜드 정보를 입력하고 버튼을 눌러보세요.<br />
                                        설정된 정보를 기반으로 공식 메타 광고 라이브러리 데이터를 호출하여 분석합니다.
                                    </p>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
