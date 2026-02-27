"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkBrandExistsAction } from "@/app/lib/concept-actions";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function BrandRegistrationForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [existingBrandData, setExistingBrandData] = useState<any>(null);

    const [formData, setFormData] = useState({
        brandKor: "",
        brandEng: "",
        description: "",
        url: "",
        category: "",
        instagram: "",
        youtube: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await checkBrandExistsAction(formData.brandKor, formData.brandEng);

        if (result.exists && result.data) {
            setExistingBrandData(result.data);
            setShowDialog(true);
            setIsLoading(false);
        } else {
            proceedToAnalysis(formData);
        }
    };

    const proceedToAnalysis = (data: any = formData) => {
        const params = new URLSearchParams();
        params.set("model", "gemini-2.0-flash");
        params.set("brandKor", data.brandKor || "");
        params.set("brandEng", data.brandEng || "");
        params.set("url", data.url || "");
        params.set("category", data.category || "General");
        if (data.description) params.set("description", data.description);

        if (data.instagram) params.set("instagram", data.instagram);
        if (data.youtube) params.set("youtube", data.youtube);
        if (data.id) params.set("id", data.id);
        if (data.forceNew) params.set("forceNew", "true");

        router.push(`/main/analysis?${params.toString()}`);
    };

    const handleViewExisting = () => {
        setShowDialog(false);
        proceedToAnalysis(existingBrandData);
    };

    const handleGenerateNew = () => {
        setShowDialog(false);
        setIsLoading(true);
        proceedToAnalysis({ ...formData, forceNew: true });
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-8">
                <input type="hidden" name="model" value="gemini-2.0-flash" />

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label htmlFor="brandKor" className="text-[15px] font-bold text-[#333333] px-1">
                            브랜드명 (국문) <span className="text-[#333333]">*</span>
                        </label>
                        <input
                            id="brandKor"
                            name="brandKor"
                            type="text"
                            required
                            placeholder="예: 골드넥스"
                            value={formData.brandKor}
                            onChange={handleChange}
                            className="flex h-[56px] w-full rounded-2xl border-none bg-[#F2F4F7] px-5 text-[15px] font-bold transition-all focus:bg-[#E5E8EB] focus:outline-none placeholder:text-[#A4AEC0] text-[#333333]"
                        />
                    </div>
                    <div className="space-y-3">
                        <label htmlFor="brandEng" className="text-[15px] font-bold text-[#333333] px-1">
                            브랜드명 (영문) <span className="text-[#333333]">*</span>
                        </label>
                        <input
                            id="brandEng"
                            name="brandEng"
                            type="text"
                            required
                            placeholder="예: Goldenax"
                            value={formData.brandEng}
                            onChange={handleChange}
                            className="flex h-[56px] w-full rounded-2xl border-none bg-[#F2F4F7] px-5 text-[15px] font-bold transition-all focus:bg-[#E5E8EB] focus:outline-none placeholder:text-[#A4AEC0] text-[#333333]"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label htmlFor="url" className="text-[15px] font-bold text-[#333333] px-1">
                        웹사이트 링크 <span className="text-[#333333]">*</span>
                    </label>
                    <input
                        id="url"
                        name="url"
                        type="url"
                        required
                        placeholder="https://example.com"
                        value={formData.url}
                        onChange={handleChange}
                        className="flex h-[56px] w-full rounded-2xl border-none bg-[#F2F4F7] px-5 text-[15px] font-bold transition-all focus:bg-[#E5E8EB] focus:outline-none placeholder:text-[#A4AEC0] text-[#333333]"
                    />
                </div>

                <div className="space-y-3">
                    <label htmlFor="category" className="text-[15px] font-bold text-[#333333] px-1">
                        주요 업종 <span className="text-[#333333]">*</span>
                    </label>
                    <input
                        id="category"
                        name="category"
                        type="text"
                        required
                        placeholder="예: 코스메틱, 라이프스타일 큐레이션, IT 기술 등"
                        value={formData.category}
                        onChange={handleChange}
                        className="flex h-[56px] w-full rounded-2xl border-none bg-[#F2F4F7] px-5 text-[15px] font-bold transition-all focus:bg-[#E5E8EB] focus:outline-none placeholder:text-[#A4AEC0] text-[#333333]"
                    />
                </div>

                <div className="space-y-3">
                    <label htmlFor="description" className="text-[15px] font-bold text-[#333333] px-1">
                        브랜드 설명 <span className="text-[#333333]">*</span>
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        required
                        placeholder="브랜드가 제공하는 핵심 가치나 특징을 적어주세요."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="flex min-h-[120px] w-full rounded-2xl border-none bg-[#F2F4F7] px-5 py-5 text-[15px] font-bold transition-all focus:bg-[#E5E8EB] focus:outline-none placeholder:text-[#A4AEC0] text-[#333333] resize-none"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-3">
                        <label htmlFor="instagram" className="text-[15px] font-bold text-[#333333] px-1">인스타그램</label>
                        <input
                            id="instagram"
                            name="instagram"
                            type="url"
                            placeholder="https://instagram.com/..."
                            value={formData.instagram}
                            onChange={handleChange}
                            className="flex h-[48px] w-full rounded-2xl border-none bg-[#F2F4F7] px-5 text-[14px] font-bold transition-all focus:bg-[#E5E8EB] focus:outline-none placeholder:text-[#A4AEC0] text-[#333333]"
                        />
                    </div>
                    <div className="space-y-3">
                        <label htmlFor="youtube" className="text-[15px] font-bold text-[#333333] px-1">유튜브</label>
                        <input
                            id="youtube"
                            name="youtube"
                            type="url"
                            placeholder="https://youtube.com/..."
                            value={formData.youtube}
                            onChange={handleChange}
                            className="flex h-[48px] w-full rounded-2xl border-none bg-[#F2F4F7] px-5 text-[14px] font-bold transition-all focus:bg-[#E5E8EB] focus:outline-none placeholder:text-[#A4AEC0] text-[#333333]"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center rounded-[20px] text-lg font-bold transition-all disabled:opacity-50 h-[60px] mt-6 bg-[#030000] text-white hover:bg-[#1A1A1A] active:bg-[#111111] active:scale-[0.98] border-none"
                >
                    {isLoading ? <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> 분석 중...</span> : "브랜드 분석 시작하기"}
                </button>
            </form>

            <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
                <AlertDialogContent className="sm:max-w-[425px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>⚠️ 이미 등록된 브랜드입니다</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3 pt-2 text-left">
                            <p>입력하신 브랜드명으로 이전에 분석한 기록이 발견되었습니다.</p>
                            {existingBrandData && (
                                <div className="bg-muted/50 p-4 rounded-xl text-sm border border-border/50 text-foreground">
                                    <p><strong>브랜드명:</strong> {existingBrandData.brandKor} ({existingBrandData.brandEng})</p>
                                    <p><strong>주요 업종:</strong> {existingBrandData.category}</p>
                                    <p><strong>생성자:</strong> {existingBrandData.creatorName}</p>
                                    <p className="text-xs text-muted-foreground mt-1"><strong>생성일:</strong> {new Date(existingBrandData.createdAt).toLocaleString('ko-KR')}</p>
                                </div>
                            )}
                            <p className="pt-2 text-sm text-foreground">이전의 결과를 불러오시겠습니까, 아니면 완전히 새롭게 다시 분석하시겠습니까?</p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6 sm:space-x-0">
                        <AlertDialogCancel onClick={() => setShowDialog(false)} className="mt-0 w-full sm:w-auto h-12 rounded-xl text-[#8B95A1] border-none hover:bg-[#F2F4F7] font-bold">
                            취소
                        </AlertDialogCancel>
                        <Button variant="outline" onClick={handleGenerateNew} className="mt-0 w-full sm:w-auto h-12 rounded-xl text-[#4E5968] border-none hover:bg-[#F2F4F7] font-bold">
                            새로 분석하기
                        </Button>
                        <AlertDialogAction onClick={handleViewExisting} className="w-full sm:w-auto h-12 rounded-xl bg-[#F2F4F6] text-[#333333] hover:bg-[#E5E8EB] active:bg-[#D1D6DB] font-bold shadow-none border-none transition-all">
                            기존 결과 보기
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
