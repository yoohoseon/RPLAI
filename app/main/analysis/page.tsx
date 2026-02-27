import AnalysisActions from '@/components/analysis/analysis-actions';
import BrandPersona from '@/components/analysis/brand-persona';
import ContentGenerator from '@/components/analysis/content-generator';
import { generateBrandAnalysis } from '@/app/lib/ai';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
    TrendingUp, TrendingDown, Minus, Target, ArrowRight, Lightbulb,
    Zap, ShieldCheck, Activity, AlertTriangle, Crosshair, Map, MessageSquare, ExternalLink,
    CheckCircle2, ChevronRight, PenTool, LayoutTemplate
} from 'lucide-react';
import { TargetToneDashboard } from '@/components/analysis/target-tone-dashboard';
import { DeleteBrandButton } from '@/components/analysis/delete-brand-button';

interface AnalysisPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AnalysisPage(props: AnalysisPageProps) {
    const searchParams = await props.searchParams;
    const id = searchParams.id as string | undefined;

    let brandKor = (searchParams.brandKor as string) || 'Brand';
    let brandEng = (searchParams.brandEng as string) || '';
    let url = searchParams.url as string | undefined;
    let category = (searchParams.category as string) || 'General';
    let competitors = (searchParams.competitors as string) || 'None';
    let target = (searchParams.target as string) || 'General';
    let description = (searchParams.description as string) || '';

    // Get current user session for caching
    const session = await auth();
    const userId = session?.user?.id;

    // Generate Analysis using AI
    let analysisData;
    let isError = false;
    let savedAnalysisId = id || '';

    try {
        if (id) {
            const existingRecord = await prisma.brandAnalysis.findUnique({
                where: { id }
            });
            if (existingRecord) {
                brandKor = existingRecord.brandKor;
                brandEng = existingRecord.brandEng;
                category = existingRecord.category;
                target = existingRecord.target;
                competitors = existingRecord.competitors;
                url = existingRecord.url || undefined;
                analysisData = JSON.parse(existingRecord.content);
            } else {
                isError = true;
            }
        } else {
            const socialUrls = {
                instagram: searchParams.instagram as string | undefined,
                twitter: searchParams.twitter as string | undefined,
                youtube: searchParams.youtube as string | undefined,
                facebook: searchParams.facebook as string | undefined,
                linkedin: searchParams.linkedin as string | undefined,
                tiktok: searchParams.tiktok as string | undefined,
                naver_blog: searchParams.naver_blog as string | undefined,
            };

            analysisData = await generateBrandAnalysis(brandKor, brandEng, category, target, competitors, url, socialUrls, userId, description);

            // Find the ID of the analysis we just generated/retrieved
            const savedRecord = await prisma.brandAnalysis.findFirst({
                where: { brandKor, brandEng, category, target, competitors },
                orderBy: { createdAt: 'desc' },
                select: { id: true }
            });
            savedAnalysisId = savedRecord?.id || '';
        }
    } catch (e) {
        console.error("Analysis Generation/Fetch Failed", e);
        isError = true;
    }

    if (isError || !analysisData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F2F4F7]">
                <div className="container max-w-lg mx-auto p-12 text-center bg-white rounded-[36px] shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-none">
                    <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8">
                        <AlertTriangle className="w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4 text-[#333333]">분석에 실패했습니다</h1>
                    <p className="text-[#4E5968] mb-10 text-lg font-medium break-keep">
                        브랜드 분석 데이터를 생성하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                    </p>
                    <a href="/main" className="inline-flex items-center justify-center px-10 py-5 bg-[#F2F4F7] text-[#333333] font-bold rounded-2xl hover:bg-[#E5E8EB] transition-all shadow-none active:scale-[0.98] text-[16px]">
                        대시보드로 돌아가기
                    </a>
                </div>
            </div>
        );
    }

    interface AnalysisData {
        kpis: { label: string; value: string; trend: string; change: string; description: string }[];
        insight: { intent: string; perception: string; gap: string };
        strategy: { category: string; points: string[] }[];
        actions: { phase: string; title: string; description: string; timeline: string }[];
        sentiments: { category: string; text: string; source: string }[];
        extendedStrategy?: any;
        savedContents?: { id: string, type: string, topic: string, content: string, date: string }[];
        persona?: { personality: string; tone: string[]; keywords: string[]; usp: string; story: string; philosophy: string; voice: string; slogan: string };
        targetAndTone?: { lifestyle: number; knowledge: number; communication: number; lifestyleExplanation?: string; knowledgeExplanation?: string; communicationExplanation?: string; };
        originalTargetAndTone?: { lifestyle: number; knowledge: number; communication: number; lifestyleExplanation?: string; knowledgeExplanation?: string; communicationExplanation?: string; };
        concepts?: any[];
        conceptHistory?: any[];
    }

    const { kpis, insight, strategy, actions, sentiments, extendedStrategy, savedContents, targetAndTone, originalTargetAndTone, concepts, conceptHistory } = analysisData as AnalysisData;

    return (
        <div id="analysis-report" className="relative min-h-screen pb-32 font-sans bg-[#F2F4F7]">
            {/* 1. Sticky Header Hero section */}
            <div className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md shadow-sm border-none transition-all py-1">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-baseline gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-[#333333] truncate max-w-[200px] sm:max-w-none">
                            {brandKor} <span className="text-[#4E5968] text-lg font-medium tracking-normal ml-2">{brandEng}</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Progress UI */}
                        <nav className="flex items-center space-x-3 text-sm font-bold">
                            <span className="flex items-center text-[#333333] bg-[#F2F4F7] px-5 py-2 rounded-2xl gap-2 shadow-none border-none">
                                <CheckCircle2 className="w-4 h-4" />
                                브랜드 분석
                            </span>
                            <ChevronRight className="w-4 h-4 text-[#ABB3BB]" />
                            <span className="flex items-center text-[#ABB3BB] gap-1.5">
                                <PenTool className="w-4 h-4" />
                                콘텐츠 전략 수립
                            </span>
                            <ChevronRight className="w-4 h-4 text-[#ABB3BB]" />
                            <span className="flex items-center text-[#ABB3BB] gap-1.5">
                                <LayoutTemplate className="w-4 h-4" />
                                콘텐츠 생성
                            </span>
                        </nav>
                    </div>
                </div>
            </div>

            <div className="container max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-12 animate-in slide-in-from-bottom-8 fade-in duration-1000">



                {targetAndTone && (
                    <TargetToneDashboard
                        initialValues={targetAndTone}
                        originalValues={originalTargetAndTone || targetAndTone}
                        brandKor={brandKor}
                        brandEng={brandEng}
                        initialConcepts={concepts || null}
                        initialHistory={conceptHistory || []}
                        analysisId={savedAnalysisId}
                    />
                )}


            </div>
        </div>
    );
}
