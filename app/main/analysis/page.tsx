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
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="container max-w-lg mx-auto p-10 text-center bg-white dark:bg-black rounded-3xl shadow-2xl border border-border/50 backdrop-blur-xl">
                    <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Analysis Failed</h1>
                    <p className="text-muted-foreground mb-8 text-lg">
                        Sorry, we couldn't generate the analysis at this time. Please check your API key or try again later.
                    </p>
                    <a href="/main" className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 text-sm uppercase tracking-wider">
                        Return to Dashboard
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
        <div id="analysis-report" className="relative min-h-screen pb-32 selection:bg-primary/20 font-sans">
            {/* Ambient Background */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background -z-10 pointer-events-none" />
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

            {/* 1. Sticky Header Hero section */}
            <div className="sticky top-0 z-50 w-full bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-border/50 shadow-sm transition-all">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-baseline gap-3">
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground truncate max-w-[200px] sm:max-w-none">
                            {brandKor}
                        </h1>
                        {url ? (
                            <a
                                href={url.startsWith('http') ? url : `https://${url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-1.5 text-sm sm:text-base font-semibold text-muted-foreground hover:text-primary transition-colors truncate hidden sm:inline-flex bg-muted/30 hover:bg-primary/10 px-2 py-0.5 rounded-md"
                                title="웹사이트 방문"
                            >
                                {brandEng}
                                <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        ) : (
                            <span className="text-sm sm:text-base font-semibold text-muted-foreground truncate hidden sm:inline-block px-2 py-0.5">
                                {brandEng}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Progress UI */}
                        <nav className="flex items-center space-x-2 text-sm font-medium mr-4">
                            <span className="flex items-center text-primary bg-primary/10 px-3 py-1 rounded-full">
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                브랜드 분석
                            </span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                            <span className="flex items-center text-muted-foreground opacity-50">
                                <PenTool className="w-4 h-4 mr-1" />
                                콘텐츠 전략 수립
                            </span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                            <span className="flex items-center text-muted-foreground opacity-50">
                                <LayoutTemplate className="w-4 h-4 mr-1" />
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
