import React from 'react';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { CheckCircle2, ChevronRight, PenTool, LayoutTemplate, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { StrategyDashboard } from '@/components/strategy/strategy-dashboard';

interface StrategyPageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function StrategyPage(props: StrategyPageProps) {
    const searchParams = await props.searchParams;
    const analysisId = searchParams.analysisId;
    const concept = searchParams.concept;
    const message = searchParams.message;

    if (!analysisId || !concept || !message) {
        redirect('/main');
    }

    const brandRecord = await prisma.brandAnalysis.findUnique({
        where: { id: analysisId },
        select: { brandKor: true, brandEng: true, id: true, url: true, content: true }
    });

    if (!brandRecord) {
        redirect('/main');
    }

    const url = brandRecord.url;

    let allConcepts: { concept: string, message: string, messages: string[] }[] = [];
    let savedStrategies: any[] = [];
    try {
        const parsedContent = JSON.parse(brandRecord.content);
        if (parsedContent.concepts && Array.isArray(parsedContent.concepts)) {
            allConcepts = parsedContent.concepts.map((c: { conceptName?: string, concept?: string, title?: string, keyMessages?: string[], description?: string, message?: string }) => ({
                concept: c.conceptName || c.concept || c.title || 'Unknown Concept',
                message: c.keyMessages?.[0] || c.description || c.message || 'No message provided',
                messages: c.keyMessages || (c.description ? [c.description] : (c.message ? [c.message] : ['No message provided']))
            }));
        }
        if (parsedContent.savedStrategies && Array.isArray(parsedContent.savedStrategies)) {
            savedStrategies = parsedContent.savedStrategies;
        }
    } catch {
        // safely ignore JSON parse errors
    }

    if (allConcepts.length === 0) {
        allConcepts.push({ concept, message, messages: [message] });
    }

    return (
        <div className="relative min-h-screen pb-32 font-sans bg-[#F9FAFB]">
            {/* Header & Step Bar */}
            <div className="sticky top-0 z-50 w-full bg-white border-b border-[#F2F4F6] transition-all">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-baseline gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-[#191F28] truncate max-w-[200px] sm:max-w-none">
                            {brandRecord.brandKor} <span className="text-[#4E5968] text-lg font-medium tracking-normal ml-2">{brandRecord.brandEng}</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Progress UI */}
                        <nav className="flex items-center space-x-3 text-sm font-bold">
                            <Link href={`/main/analysis?id=${analysisId}`} className="flex items-center text-[#4E5968] hover:text-[#191F28] transition-colors gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-[#EE2924]" />
                                브랜드 분석
                            </Link>
                            <ChevronRight className="w-4 h-4 text-[#ABB3BB]" />
                            <span className="flex items-center text-[#EE2924] bg-[#EE2924]/10 px-4 py-1.5 rounded-full gap-1.5">
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

            <main className="container max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-12 animate-in slide-in-from-bottom-8 fade-in duration-1000">
                <StrategyDashboard concept={concept} message={message} availableConcepts={allConcepts} analysisId={analysisId} savedStrategies={savedStrategies} />
            </main>
        </div>
    );
}
