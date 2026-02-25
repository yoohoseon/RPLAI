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
        <div className="relative min-h-screen pb-32 selection:bg-primary/20 font-sans">
            {/* Ambient Background */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background -z-10 pointer-events-none" />
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

            {/* Header & Step Bar */}
            <div className="sticky top-0 z-50 w-full bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-border/50 shadow-sm transition-all">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-baseline gap-3">
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground truncate max-w-[200px] sm:max-w-none">
                            {brandRecord.brandKor}
                        </h1>
                        {url ? (
                            <a
                                href={url.startsWith('http') ? url : `https://${url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-1.5 text-sm sm:text-base font-semibold text-muted-foreground hover:text-primary transition-colors truncate hidden sm:inline-flex bg-muted/30 hover:bg-primary/10 px-2 py-0.5 rounded-md"
                                title="웹사이트 방문"
                            >
                                {brandRecord.brandEng}
                                <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        ) : (
                            <span className="text-sm sm:text-base font-semibold text-muted-foreground truncate hidden sm:inline-block px-2 py-0.5">
                                {brandRecord.brandEng}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Progress UI */}
                        <nav className="flex items-center space-x-2 text-sm font-medium mr-4">
                            <Link href={`/main/analysis?id=${analysisId}`} className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                                <CheckCircle2 className="w-4 h-4 mr-1 text-primary" />
                                브랜드 분석
                            </Link>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                            <span className="flex items-center text-primary bg-primary/10 px-3 py-1 rounded-full">
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

            <main className="container max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-12 animate-in slide-in-from-bottom-8 fade-in duration-1000">
                <StrategyDashboard concept={concept} message={message} availableConcepts={allConcepts} analysisId={analysisId} savedStrategies={savedStrategies} />
            </main>
        </div>
    );
}
