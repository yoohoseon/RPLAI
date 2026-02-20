'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { generateExtendedStrategy } from '@/app/main/analysis/actions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface AnalysisActionsProps {
    analysisId: string;
    brand: string;
    url: string;
    category: string;
    target: string;
    competitors: string;
    content: string;
}

export default function AnalysisActions({ analysisId, brand, url, category, target, competitors, content }: AnalysisActionsProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [parsedContent, setParsedContent] = useState<any>(() => {
        try {
            return JSON.parse(content);
        } catch (e) {
            return {};
        }
    });

    const handleGenerateStrategy = async () => {
        setIsGenerating(true);
        try {
            const newContent = await generateExtendedStrategy(analysisId, parsedContent);
            setParsedContent(newContent);
        } catch (error) {
            console.error("Failed to generate strategy", error);
            alert("Failed to generate detailed strategy. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRetry = () => {
        window.location.reload();
    };


    const handleDownloadPdf = () => {
        window.print();
    };

    const extended = parsedContent?.extendedStrategy;

    return (
        <div className="space-y-8 print:hidden">
            {extended ? (
                <section className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold tracking-tight">6. Detailed Content Strategy (AI)</h2>
                        <span className="text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Generated</span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-sm overflow-hidden">
                        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b">
                            <div className="p-6 bg-blue-50/10 hover:bg-blue-50/20 transition-colors">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl">🚀</div>
                                    <div>
                                        <h3 className="font-bold text-lg text-blue-700 dark:text-blue-400">Strength Leverage</h3>
                                        <p className="text-sm text-muted-foreground">Maximize your advantages</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                        <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-200">Strategic Focus</h4>
                                        <p className="text-sm text-blue-800 dark:text-blue-300">{extended.strengthsPlan.strategy}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm mb-3 text-slate-700 dark:text-slate-300">Actionable Content Ideas</h4>
                                        <div className="space-y-3">
                                            {extended.strengthsPlan.contentPlan?.map((item: any, i: number) => (
                                                <div key={i} className="flex flex-col gap-1 p-3 bg-white/50 dark:bg-black/20 rounded border border-blue-100 dark:border-blue-900/30">
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-medium text-sm text-blue-900 dark:text-blue-200">{item.title}</span>
                                                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-500 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">{item.format}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
                                                </div>
                                            ))}
                                            {extended.strengthsPlan.contentIdeas?.map((idea: string, i: number) => (
                                                <div key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-400 items-start">
                                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0"></span>
                                                    <span>{idea}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-orange-50/10 hover:bg-orange-50/20 transition-colors">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xl">🛡️</div>
                                    <div>
                                        <h3 className="font-bold text-lg text-orange-700 dark:text-orange-400">Weakness Turnaround</h3>
                                        <p className="text-sm text-muted-foreground">Address critical gaps</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                                        <h4 className="font-semibold text-sm mb-2 text-orange-900 dark:text-orange-200">Strategic Focus</h4>
                                        <p className="text-sm text-orange-800 dark:text-orange-300">{extended.weaknessesPlan.strategy}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm mb-3 text-slate-700 dark:text-slate-300">Actionable Content Ideas</h4>
                                        <div className="space-y-3">
                                            {extended.weaknessesPlan.contentPlan?.map((item: any, i: number) => (
                                                <div key={i} className="flex flex-col gap-1 p-3 bg-white/50 dark:bg-black/20 rounded border border-orange-100 dark:border-orange-900/30">
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-medium text-sm text-orange-900 dark:text-orange-200">{item.title}</span>
                                                        <span className="text-[10px] uppercase font-bold tracking-wider text-orange-500 bg-orange-50 dark:bg-orange-950 px-1.5 py-0.5 rounded">{item.format}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
                                                </div>
                                            ))}
                                            {extended.weaknessesPlan.contentIdeas?.map((idea: string, i: number) => (
                                                <div key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-400 items-start">
                                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400 flex-shrink-0"></span>
                                                    <span>{idea}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            ) : (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-gray-900/50 gap-4">
                    <div className="text-center space-y-1">
                        <h3 className="font-semibold">Need Deeper Insights?</h3>
                        <p className="text-sm text-muted-foreground">Generate a detailed content strategy based on this analysis.</p>
                    </div>
                    <Button onClick={handleGenerateStrategy} disabled={isGenerating} size="lg" className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0">
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating Strategy...
                            </>
                        ) : (
                            <>
                                ✨ Generate Detailed Content Strategy
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center pb-10">
                <Button variant="outline" onClick={handleRetry} className="w-32">
                    Retry
                </Button>

                <Button onClick={handleDownloadPdf} className="w-40 gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                    Download PDF
                </Button>
            </div>
        </div>
    );
}
