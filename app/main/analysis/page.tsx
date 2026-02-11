import AnalysisActions from '@/components/analysis/analysis-actions';
import { generateBrandAnalysis } from '@/app/lib/ai';
import { auth } from '@/auth';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface AnalysisPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AnalysisPage(props: AnalysisPageProps) {
    const searchParams = await props.searchParams;
    const brand = (searchParams.brand as string) || 'Brand';
    const url = searchParams.url as string | undefined;
    const category = (searchParams.category as string) || 'General';
    const competitors = (searchParams.competitors as string) || 'None';
    const target = (searchParams.target as string) || 'General';

    // Get current user session for caching
    const session = await auth();
    const userId = session?.user?.id;

    // Generate Analysis using AI
    let analysisData;
    let isError = false;

    try {
        analysisData = await generateBrandAnalysis(brand, category, target, competitors, url, userId);
    } catch (e) {
        console.error("Analysis Generation Failed", e);
        isError = true;
    }

    if (isError || !analysisData) {
        return (
            <div className="container mx-auto py-20 px-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Analysis Generation Failed</h1>
                <p className="text-muted-foreground mb-8">
                    Sorry, we couldn't generate the analysis at this time. Please check your API key or try again later.
                </p>
                <a href="/main" className="text-primary hover:underline">Return to Dashboard</a>
            </div>
        );
    }

    const { kpis, insight, strategy, actions, sentiments } = analysisData;

    return (
        <div id="analysis-report" className="container mx-auto py-10 px-4 space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="space-y-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{brand} Analysis</h1>
                    <p className="text-muted-foreground">Comprehensive AI-driven brand performance report</p>
                </div>

                {url && (
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs py-1 px-3">
                            <span className="mr-1 text-muted-foreground">URL:</span> {url}
                        </Badge>
                        <Badge variant="outline" className="text-xs py-1 px-3">
                            <span className="mr-1 text-muted-foreground">Category:</span> {category}
                        </Badge>
                        <Badge variant="outline" className="text-xs py-1 px-3">
                            <span className="mr-1 text-muted-foreground">Target:</span> {target}
                        </Badge>
                        <Badge variant="outline" className="text-xs py-1 px-3">
                            <span className="mr-1 text-muted-foreground">Competitors:</span> {competitors}
                        </Badge>
                    </div>
                )}
            </div>

            {/* 1. KPI Dashboard */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold tracking-tight">1. KPI Dashboard</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {kpis.map((kpi: any, i: number) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {kpi.label}
                                </CardTitle>
                                <span className={`text-xs font-bold ${kpi.trend === 'up' ? 'text-green-500' : kpi.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                                    {kpi.change}
                                </span>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{kpi.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {kpi.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* 2. Insight Discovery */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold tracking-tight">2. Insight Discovery</h2>
                <Card className="bg-slate-50 dark:bg-slate-900 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Perception Gap Analysis</CardTitle>
                        <CardDescription>Contrast between Brand Intent and Consumer Perception</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-3 text-center">
                        <div className="space-y-2 p-4 bg-white dark:bg-black rounded-lg border">
                            <Badge variant="outline" className="mb-2">Brand Intent</Badge>
                            <p className="text-sm font-medium">{insight.intent}</p>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="flex flex-col items-center space-y-2">
                                <span className="text-3xl">↔</span>
                                <span className="text-xs font-bold text-orange-500">GAP IDENTIFIED</span>
                            </div>
                        </div>
                        <div className="space-y-2 p-4 bg-white dark:bg-black rounded-lg border">
                            <Badge variant="outline" className="mb-2">Consumer Perception</Badge>
                            <p className="text-sm font-medium">{insight.perception}</p>
                        </div>
                        <div className="md:col-span-3 bg-orange-50 dark:bg-orange-950/30 p-4 rounded text-sm text-orange-800 dark:text-orange-200">
                            <strong>Insight:</strong> {insight.gap}
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* 3. Strategic Framework (Visual Layout) */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold tracking-tight">3. Strategic Framework (MECE)</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    {strategy.map((item: any, i: number) => (
                        <Card key={i}>
                            <CardHeader>
                                <CardTitle className="text-lg">{item.category}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                    {item.points.map((pt: string, j: number) => (
                                        <li key={j}>{pt}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* 4. Action Plan */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold tracking-tight">4. Action Plan</h2>
                <div className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-4 space-y-8 py-4">
                    {actions.map((action: any, i: number) => (
                        <div key={i} className="relative ml-6">
                            <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-black dark:bg-white border-4 border-white dark:border-black"></div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <h3 className="text-lg font-bold">{action.phase}: {action.title}</h3>
                                <Badge variant="secondary">{action.timeline}</Badge>
                            </div>
                            <p className="text-muted-foreground mt-1 text-sm">{action.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. Voice of Customer */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold tracking-tight">5. Voice of Customer</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-green-100 bg-green-50/50 dark:bg-green-900/10">
                        <CardHeader><CardTitle className="text-green-700 dark:text-green-400">Positive Sentiment (Props)</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {sentiments.filter((s: any) => s.category === 'positive').map((s: any, i: number) => (
                                <div key={i} className="bg-white dark:bg-black p-3 rounded shadow-sm text-sm italic">
                                    "{s.text}"
                                    <div className="text-xs text-gray-400 mt-1 not-italic text-right">- {s.source}</div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card className="border-red-100 bg-red-50/50 dark:bg-red-900/10">
                        <CardHeader><CardTitle className="text-red-700 dark:text-red-400">Negative Sentiment (Cons)</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {sentiments.filter((s: any) => s.category === 'negative').map((s: any, i: number) => (
                                <div key={i} className="bg-white dark:bg-black p-3 rounded shadow-sm text-sm italic">
                                    "{s.text}"
                                    <div className="text-xs text-gray-400 mt-1 not-italic text-right">- {s.source}</div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </section>

            <AnalysisActions
                brand={brand}
                url={url || ''}
                category={category || ''}
                target={target || ''}
                competitors={competitors || ''}
                content={JSON.stringify({ kpis, insight, strategy, actions, sentiments })}
            />
        </div>
    );
}
