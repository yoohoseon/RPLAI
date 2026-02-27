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
        <div className="relative min-h-screen pb-32 font-sans bg-[#F2F4F7]">

            {/* Header & Step Bar */}
            <div className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md shadow-sm border-none transition-all py-1">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-baseline gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-[#333333] truncate max-w-[200px] sm:max-w-none">
                            {brandRecord.brandKor} <span className="text-[#4E5968] text-lg font-medium tracking-normal ml-2">{brandRecord.brandEng}</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Progress UI */}
                        <nav className="flex items-center space-x-3 text-sm font-bold">
                            <Link href={`/main/analysis?id=${analysisId}`} className="flex items-center text-[#4E5968] hover:text-[#333333] transition-colors gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-[#333333]" />
                                브랜드 분석
                            </Link>
                            <ChevronRight className="w-4 h-4 text-[#ABB3BB]" />
                            <Link href={`/main/strategy?analysisId=${analysisId}&concept=${encodeURIComponent(strategy.conceptName)}&message=${encodeURIComponent(strategy.conceptMessage)}`} className="flex items-center text-[#4E5968] hover:text-[#333333] transition-colors gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-[#333333]" />
                                콘텐츠 전략 수립
                            </Link>
                            <ChevronRight className="w-4 h-4 text-[#ABB3BB]" />
                            <span className="flex items-center text-[#333333] bg-[#F2F4F7] px-5 py-2 rounded-2xl gap-2 shadow-none border-none">
                                <LayoutTemplate className="w-4 h-4" />
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
