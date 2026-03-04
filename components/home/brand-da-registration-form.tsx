"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X, Plus, Calendar } from "lucide-react";
import { getBrandCategoriesAction } from "@/app/lib/concept-actions";

export function BrandDaRegistrationForm({ presetData }: { presetData?: any }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<string[]>(['코스메틱', 'IT/테크', '패션', '식음료']);

    const [formData, setFormData] = useState<{
        industry: string;
        country: string;
        language: string;
        channels: string[];
        dateRange: string;
        categoryKeywords: string[];
        ourKeywords: string[];
        competitorKeywords: string[];
    }>({
        industry: "코스메틱",
        country: "대한민국",
        language: "한국어",
        channels: ["Google"],
        dateRange: "2025.09.04 - 2026.03.04",
        categoryKeywords: [],
        ourKeywords: [],
        competitorKeywords: [],
    });

    const [inputStates, setInputStates] = useState({
        categoryKeywords: "",
        ourKeywords: "",
        competitorKeywords: "",
    });

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await getBrandCategoriesAction();
            if (res.success && res.data) {
                setCategories(res.data);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (presetData) {
            setFormData(prev => ({
                ...prev,
                industry: presetData.industry || prev.industry,
                country: presetData.country || prev.country,
                language: presetData.language || prev.language,
                channels: presetData.channels && presetData.channels.length > 0 ? presetData.channels : prev.channels,
                categoryKeywords: presetData.categoryKeywords || prev.categoryKeywords,
                ourKeywords: presetData.ourKeywords || prev.ourKeywords,
                competitorKeywords: presetData.competitorKeywords || prev.competitorKeywords,
            }));
        }
    }, [presetData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleInputStateChange = (field: keyof typeof inputStates, val: string) => {
        setInputStates({ ...inputStates, [field]: val });
    };

    const addKeyword = (field: "categoryKeywords" | "ourKeywords" | "competitorKeywords") => {
        const val = inputStates[field].trim();
        if (val && !formData[field].includes(val)) {
            setFormData({ ...formData, [field]: [...formData[field], val] });
        }
        setInputStates({ ...inputStates, [field]: "" });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: "categoryKeywords" | "ourKeywords" | "competitorKeywords") => {
        if (e.key === "Enter") {
            e.preventDefault();
            addKeyword(field);
        }
    };

    const removeKeyword = (field: "categoryKeywords" | "ourKeywords" | "competitorKeywords", keyword: string) => {
        setFormData({ ...formData, [field]: formData[field].filter((k) => k !== keyword) });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const params = new URLSearchParams();
        params.set("model", "gemini-2.5-flash");
        params.set("industry", formData.industry);
        params.set("country", formData.country);
        params.set("language", formData.language);
        params.set("channels", formData.channels.join(","));
        params.set("dateRange", formData.dateRange);
        params.set("categoryKeywords", formData.categoryKeywords.join(","));
        params.set("ourKeywords", formData.ourKeywords.join(","));
        params.set("competitorKeywords", formData.competitorKeywords.join(","));

        // Use the first outKeyword as brand name for backwards compatibility
        if (formData.ourKeywords.length > 0) {
            params.set("brandKor", formData.ourKeywords[0]);
            params.set("brandEng", formData.ourKeywords[0]);
        }

        router.push(`/main/da/analysis?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-[13px] font-bold text-[#4E5968] block text-center">산업군 선택</label>
                    <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        className="w-full h-[48px] rounded-xl border border-[#E5E8EB] bg-[#F9FAFB] px-4 text-[14px] font-bold text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#0064FF]"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[13px] font-bold text-[#4E5968] block text-center">국가 선택</label>
                    <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full h-[48px] rounded-xl border border-[#E5E8EB] bg-[#F9FAFB] px-4 text-[14px] font-bold text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#0064FF]"
                    >
                        <option value="대한민국">대한민국</option>
                        <option value="미국">미국</option>
                        <option value="일본">일본</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[13px] font-bold text-[#4E5968] block text-center">출력 언어 선택</label>
                    <select
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className="w-full h-[48px] rounded-xl border border-[#E5E8EB] bg-[#F9FAFB] px-4 text-[14px] font-bold text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#0064FF]"
                    >
                        <option value="한국어">한국어</option>
                        <option value="영어">영어</option>
                    </select>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                    <label className="text-[13px] font-bold text-[#4E5968] block text-center">채널</label>
                    <div className="relative">
                        <select
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val && !formData.channels.includes(val)) {
                                    setFormData({ ...formData, channels: [...formData.channels, val] });
                                }
                                e.target.value = "";
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        >
                            <option value="">추가할 채널 선택...</option>
                            <option value="Google">Google</option>
                            <option value="Meta">Meta</option>
                            <option value="Naver">Naver</option>
                            <option value="Kakao">Kakao</option>
                            <option value="TikTok">TikTok</option>
                            <option value="YouTube">YouTube</option>
                            <option value="X">X (Twitter)</option>
                        </select>
                        <div className="h-[48px] w-full rounded-xl border border-[#E5E8EB] bg-[#F9FAFB] flex items-center px-3 overflow-x-auto scollbar-hide gap-1 pointer-events-none">
                            {formData.channels.length === 0 && <span className="text-[#A4AEC0] text-[14px] font-medium ml-1">채널 선택...</span>}
                            {formData.channels.map(ch => (
                                <span key={ch} className="bg-[#8B5CF6] text-white text-[12px] px-2 py-1 rounded-[6px] font-bold flex items-center shrink-0 pointer-events-auto">
                                    {ch} <X className="inline w-3 h-3 ml-1 cursor-pointer opacity-80" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFormData({ ...formData, channels: formData.channels.filter(c => c !== ch) }); }} />
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[13px] font-bold text-[#4E5968] block text-center">분석 기간</label>
                    <div className="relative">
                        <input
                            type="text"
                            name="dateRange"
                            value={formData.dateRange}
                            onChange={handleChange}
                            placeholder="YYYY.MM.DD - YYYY.MM.DD"
                            className="w-full h-[48px] text-center rounded-xl border border-[#E5E8EB] bg-[#F9FAFB] pr-10 pl-4 text-[14px] font-bold text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#0064FF]"
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A4AEC0] pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 pt-4">
                {/* Category Keywords */}
                <div className="bg-[#F9FAFB] rounded-[20px] p-5 border border-[#E5E8EB]">
                    <div className="text-center mb-4">
                        <span className="text-[15px] font-bold text-[#333333]">카테고리 키워드</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {formData.categoryKeywords.map((tag) => (
                            <span key={tag} className="inline-flex items-center bg-[#E5E8EB] text-[#4E5968] text-[13px] font-bold px-3 py-1.5 rounded-[10px]">
                                {tag}
                                <button type="button" onClick={() => removeKeyword("categoryKeywords", tag)} className="ml-2 hover:text-black">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <input
                        type="text"
                        placeholder="추가 키워드 입력 후 Enter"
                        value={inputStates.categoryKeywords}
                        onChange={(e) => handleInputStateChange("categoryKeywords", e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, "categoryKeywords")}
                        className="w-full bg-transparent border-none text-[13px] focus:outline-none placeholder:text-[#A4AEC0] font-medium"
                    />
                </div>

                {/* Our Keywords */}
                <div className="bg-[#F0FDF4] rounded-[20px] p-5 border border-[#BBF7D0]">
                    <div className="text-center mb-4">
                        <span className="text-[15px] font-bold text-[#16A34A]">자사 키워드</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {formData.ourKeywords.map((tag) => (
                            <span key={tag} className="inline-flex items-center bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] text-[13px] font-bold px-3 py-1.5 rounded-[10px]">
                                {tag}
                                <button type="button" onClick={() => removeKeyword("ourKeywords", tag)} className="ml-2 hover:text-[#15803D]">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <input
                        type="text"
                        placeholder="추가 키워드 입력 후 Enter"
                        value={inputStates.ourKeywords}
                        onChange={(e) => handleInputStateChange("ourKeywords", e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, "ourKeywords")}
                        className="w-full bg-transparent border-none text-[13px] focus:outline-none placeholder:text-[#86EFAC] text-[#16A34A] font-medium"
                    />
                </div>

                {/* Competitor Keywords */}
                <div className="bg-[#FEF2F2] rounded-[20px] p-5 border border-[#FECACA]">
                    <div className="text-center mb-4">
                        <span className="text-[15px] font-bold text-[#DC2626]">경쟁사 키워드</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {formData.competitorKeywords.map((tag) => (
                            <span key={tag} className="inline-flex items-center bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] text-[13px] font-bold px-3 py-1.5 rounded-[10px]">
                                {tag}
                                <button type="button" onClick={() => removeKeyword("competitorKeywords", tag)} className="ml-2 hover:text-[#B91C1C]">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <input
                        type="text"
                        placeholder="추가 키워드 입력 후 Enter"
                        value={inputStates.competitorKeywords}
                        onChange={(e) => handleInputStateChange("competitorKeywords", e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, "competitorKeywords")}
                        className="w-full bg-transparent border-none text-[13px] focus:outline-none placeholder:text-[#FCA5A5] text-[#DC2626] font-medium"
                    />
                </div>
            </div>

            <div className="pt-6">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-[240px] shadow-md shadow-[#0064FF]/20 mx-auto flex items-center justify-center rounded-2xl text-[16px] font-bold transition-all disabled:opacity-50 h-[56px] bg-[#0064FF] text-white hover:bg-[#0052E0] active:scale-[0.98] border-none"
                >
                    {isLoading ? <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> 분석 준비 중...</span> : "분석 요청하기"}
                </button>
            </div>
        </form>
    );
}
