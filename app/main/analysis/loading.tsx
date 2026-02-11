import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Loading() {
    return (
        <div className="container mx-auto py-10 px-4 space-y-12 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>

                <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                    ))}
                </div>
            </div>

            {/* Central Spinner / Analyzing Indicator */}
            <div className="flex flex-col items-center justify-center py-10 space-y-6">
                <div className="relative flex items-center justify-center w-24 h-24">
                    <div className="absolute w-full h-full border-4 border-slate-200 dark:border-slate-800 rounded-full opacity-30"></div>
                    <div className="absolute w-full h-full border-4 border-t-primary rounded-full animate-spin"></div>
                    <div className="absolute w-16 h-16 bg-primary/10 rounded-full animate-pulse"></div>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold animate-pulse text-foreground">Analyzing Brand...</h3>
                    <p className="text-sm text-muted-foreground">Gathering insights from AI models</p>
                </div>
            </div>

            {/* 1. KPI Dashboard Skeleton */}
            <section className="space-y-4 opacity-50">
                <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="border-slate-200 dark:border-slate-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2" />
                                <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* 2. Insight Discovery Skeleton */}
            <section className="space-y-4 opacity-40">
                <div className="h-8 w-56 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-64 w-full bg-slate-100 dark:bg-slate-900 rounded-lg animate-pulse" />
            </section>
        </div>
    );
}
