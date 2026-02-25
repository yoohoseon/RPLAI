import React from 'react';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { CheckCircle2, ChevronRight, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/auth';
import { GenerationDashboard } from '@/components/generation/generation-dashboard';

export interface SavedStrategyData {
    id: string;
    conceptName: string;
    conceptMessage: string;
    timing: string;
    goal: string;
    themes: {
        themeName: string;
        description: string;
        keywords: Record<string, string[]>;
    }[];
}

interface GenerationPageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function GenerationPage(props: GenerationPageProps) {
    const session = await auth();
    const searchParams = await props.searchParams;
    const analysisId = searchParams.analysisId;
    const strategyId = searchParams.strategyId;

    if (!analysisId || !strategyId) {
        redirect('/main');
    }

    const brandRecord = await prisma.brandAnalysis.findUnique({
        where: { id: analysisId },
    });

    if (!brandRecord) {
        redirect('/main');
    }

    // Attempt to load the selected strategy from the JSON content
    let strategy = null;
    try {
        const parsedContent = JSON.parse(brandRecord.content);
        const savedStrategies = parsedContent.savedStrategies || [];
        strategy = savedStrategies.find((s: SavedStrategyData) => s.id === strategyId);
    } catch {
        // Error handling
    }

    if (!strategy) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>전략 정보를 찾을 수 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen pb-32 selection:bg-primary/20 font-sans">
            {/* Ambient Background */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background -z-10 pointer-events-none" />
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

            {/* Header & Step Bar */}
            <div className="sticky top-0 z-50 w-full bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-border/50 shadow-sm transition-all">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-baseline gap-3">
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground truncate max-w-[200px] sm:max-w-none">
                            {brandRecord.brandKor} <span className="text-muted-foreground/50 text-lg font-medium tracking-normal ml-1">{brandRecord.brandEng}</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Progress UI */}
                        <nav className="flex items-center space-x-2 text-sm font-medium mr-4">
                            <Link href={`/main/analysis?id=${analysisId}`} className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                                <CheckCircle2 className="w-4 h-4 mr-1 text-primary" />
                                브랜드 분석
                            </Link>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                            <Link href={`/main/strategy?analysisId=${analysisId}&concept=${encodeURIComponent(strategy.conceptName)}&message=${encodeURIComponent(strategy.conceptMessage)}`} className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                                <CheckCircle2 className="w-4 h-4 mr-1 text-primary" />
                                콘텐츠 전략 수립
                            </Link>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                            <span className="flex items-center text-primary bg-primary/10 px-3 py-1 rounded-full">
                                <LayoutTemplate className="w-4 h-4 mr-1" />
                                콘텐츠 생성
                            </span>
                        </nav>
                    </div>
                </div>
            </div>

            <main className="container max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-12 animate-in slide-in-from-bottom-8 fade-in duration-1000">
                <GenerationDashboard
                    strategy={strategy as SavedStrategyData}
                    analysisId={analysisId}
                    brandName={brandRecord.brandKor || brandRecord.brandEng || ''}
                    userEmail={session?.user?.email || ''}
                />
            </main>
        </div>
    );
}
