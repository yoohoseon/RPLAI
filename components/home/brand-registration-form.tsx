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

        router.push(`/main/analysis?${params.toString()}`);
    };

    const handleViewExisting = () => {
        setShowDialog(false);
        proceedToAnalysis(existingBrandData);
    };

    const handleGenerateNew = () => {
        setShowDialog(false);
        setIsLoading(true);
        proceedToAnalysis(formData);
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6">
                <input type="hidden" name="model" value="gemini-2.0-flash" />

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="brandKor" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            브랜드명 (국문) <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="brandKor"
                            name="brandKor"
                            type="text"
                            required
                            placeholder="예: 골드넥스"
                            value={formData.brandKor}
                            onChange={handleChange}
                            className="flex h-12 w-full rounded-lg border border-input bg-background/50 px-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="brandEng" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            브랜드명 (영문) <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="brandEng"
                            name="brandEng"
                            type="text"
                            required
                            placeholder="예: Goldenax"
                            value={formData.brandEng}
                            onChange={handleChange}
                            className="flex h-12 w-full rounded-lg border border-input bg-background/50 px-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="url" className="text-sm font-medium leading-none">
                        웹사이트 링크 <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="url"
                        name="url"
                        type="url"
                        required
                        placeholder="https://example.com"
                        value={formData.url}
                        onChange={handleChange}
                        className="flex h-12 w-full rounded-lg border border-input bg-background/50 px-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium leading-none">
                        주요 업종 <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="category"
                        name="category"
                        type="text"
                        required
                        placeholder="예: 코스메틱, 라이프스타일 큐레이션, F&B 프랜차이즈, IT 등"
                        value={formData.category}
                        onChange={handleChange}
                        className="flex h-12 w-full rounded-lg border border-input bg-background/50 px-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium leading-none">
                        브랜드 설명 (핵심 제품/서비스) <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-muted-foreground pb-1">브랜드가 제공하는 핵심 가치나 특징을 짧게 적어주세요.</p>
                    <textarea
                        id="description"
                        name="description"
                        required
                        placeholder="예: 민감 피부용 비건 스킨케어, 15분 완성 프리미엄 밀키트, 성과 중심의 마케팅 솔루션 등"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="flex min-h-[80px] w-full rounded-lg border border-input bg-background/50 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all resize-none"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="instagram" className="text-sm font-medium leading-none">인스타그램</label>
                    <input
                        id="instagram"
                        name="instagram"
                        type="url"
                        placeholder="https://instagram.com/..."
                        value={formData.instagram}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="youtube" className="text-sm font-medium leading-none">유튜브</label>
                    <input
                        id="youtube"
                        name="youtube"
                        type="url"
                        placeholder="https://youtube.com/..."
                        value={formData.youtube}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center rounded-lg text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] cursor-pointer h-14 shadow-lg hover:shadow-xl mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                    {isLoading ? <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> 분석 중...</span> : "분석 시작"}
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
                        <AlertDialogCancel onClick={() => setShowDialog(false)} className="mt-0 w-full sm:w-auto text-muted-foreground">
                            취소
                        </AlertDialogCancel>
                        <Button variant="outline" onClick={handleGenerateNew} className="mt-0 w-full sm:w-auto text-muted-foreground">
                            새로 분석하기
                        </Button>
                        <AlertDialogAction onClick={handleViewExisting} className="w-full sm:w-auto bg-gray-900 text-white dark:bg-white dark:text-gray-900 border border-transparent shadow-sm">
                            기존 결과 보기
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
