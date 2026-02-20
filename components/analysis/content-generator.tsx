'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateBrandContent, generateImagePrompt } from '@/app/main/analysis/actions';
import { Loader2, Copy, Check, Sparkles, Image as ImageIcon, Wand2 } from "lucide-react";

interface ContentGeneratorProps {
    analysisId: string;
    brandName: string;
}

export default function ContentGenerator({ analysisId, brandName }: ContentGeneratorProps) {
    const [contentType, setContentType] = useState('instagram');
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');
    const [copied, setCopied] = useState(false);

    // Sync with URL params (from Strategy Action click)
    // We listen to popstate or just check on mount.
    // Ideally, we'd use useSearchParams from next/navigation but that requires Suspense boundary.
    // For simplicity, we can just check query params on mount and window events.
    useEffect(() => {
        const checkParams = () => {
            const params = new URLSearchParams(window.location.search);
            const topicParam = params.get('topic');
            const typeParam = params.get('type');
            if (topicParam) setTopic(topicParam);
            if (typeParam) setContentType(typeParam);
        };

        checkParams();
        window.addEventListener('popstate', checkParams);
        return () => window.removeEventListener('popstate', checkParams);
    }, []);

    // Image Gen State
    const [activeTab, setActiveTab] = useState('text'); // text | image
    const [imagePrompt, setImagePrompt] = useState('');
    const [isPromptGenerating, setIsPromptGenerating] = useState(false);
    const [visuals, setVisuals] = useState<string[]>([]);
    const [isLoadingVisuals, setIsLoadingVisuals] = useState(false);

    // Initial Load of Brand Visuals
    const loadVisuals = async () => {
        setIsLoadingVisuals(true);
        try {
            // dynamic import to avoid server-side issues
            const { getBrandVisuals } = await import('@/app/main/analysis/actions');
            const images = await getBrandVisuals(brandName);
            setVisuals(images);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingVisuals(false);
        }
    };

    const handleGenerateImagePrompt = async () => {
        if (!generatedContent && !topic) return alert("Generate copy first or enter a topic.");

        setIsPromptGenerating(true);
        try {
            const context = generatedContent || topic;
            const result = await generateImagePrompt(analysisId, context);
            setImagePrompt(result);
        } catch (error) {
            console.error(error);
            alert("Failed to create image prompt");
        } finally {
            setIsPromptGenerating(false);
        }
    };

    const handleGenerate = async () => {
        if (!topic) return alert("Please enter a topic.");

        setIsGenerating(true);
        setGeneratedContent('');
        try {
            const result = await generateBrandContent(analysisId, contentType, topic);
            setGeneratedContent(result);
        } catch (error) {
            console.error(error);
            alert("Failed to generate content.");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
            <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl font-semibold tracking-tight">Stage 2. Content Disruption</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* LEFT: Text Generator */}
                <Card className="border-purple-200 dark:border-purple-900 shadow-lg bg-white dark:bg-slate-950">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="text-xl">✍️</span> Copywriter
                        </CardTitle>
                        <CardDescription>
                            Generate persona-synced captions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="instagram" onValueChange={setContentType} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-4">
                                <TabsTrigger value="instagram">Instagram</TabsTrigger>
                                <TabsTrigger value="blog">Blog</TabsTrigger>
                                <TabsTrigger value="newsletter">Email</TabsTrigger>
                            </TabsList>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Topic / Key Message</label>
                                    <Textarea
                                        placeholder="Detailed topic (e.g. Summer launch with tropical vibes)"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="resize-none h-24"
                                    />
                                </div>

                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !topic}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Writing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Generate Copy
                                        </>
                                    )}
                                </Button>

                                {generatedContent && (
                                    <div className="mt-4 space-y-2 relative animate-in fade-in">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase">Result</label>
                                            <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-6 text-xs px-2">
                                                {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                                Copy
                                            </Button>
                                        </div>
                                        <Textarea
                                            readOnly
                                            value={generatedContent}
                                            className="min-h-[300px] bg-slate-50 dark:bg-slate-900 border-purple-100 dark:border-purple-900 font-sans leading-relaxed p-4 text-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* RIGHT: Visual Generator */}
                <Card className="border-pink-200 dark:border-pink-900 shadow-lg bg-white dark:bg-slate-950">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="text-xl">🎨</span> Visual Director
                        </CardTitle>
                        <CardDescription>
                            Generate brand-aligned visuals.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col min-h-[400px] space-y-6 text-center p-6 bg-slate-50/50 dark:bg-slate-900/50">

                        {/* 0. Brand Moodboard (New) */}
                        <div className="w-full space-y-2 mb-4">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                    Current Brand Mood
                                </label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={loadVisuals}
                                    disabled={isLoadingVisuals}
                                    className="h-6 text-xs"
                                >
                                    {isLoadingVisuals ? <Loader2 className="h-3 w-3 animate-spin" /> : "Refresh Moodboard"}
                                </Button>
                            </div>

                            {visuals.length > 0 ? (
                                <div className="grid grid-cols-4 gap-2 h-24 overflow-hidden rounded-md">
                                    {visuals.map((src, idx) => (
                                        <div key={idx} className="relative aspect-square bg-slate-200">
                                            <img src={src} alt="Brand visual" className="object-cover w-full h-full hover:scale-110 transition-transform duration-500 cursor-pointer" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div
                                    onClick={loadVisuals}
                                    className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-md flex items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <span className="text-xs text-muted-foreground">
                                        {isLoadingVisuals ? "Loading..." : "Click to Load Visual Moodboard"}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="w-full space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <div className="text-left space-y-1">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <span>AI Image Prompt</span>
                                    {generatedContent && !imagePrompt && (
                                        <span className="text-xs text-pink-500 animate-pulse">
                                            ← Ready to visualize this copy
                                        </span>
                                    )}
                                </label>
                                <Textarea
                                    value={imagePrompt}
                                    onChange={(e) => setImagePrompt(e.target.value)}
                                    placeholder="Generate copy first, then click 'Visualize' to get an AI prompt..."
                                    className="resize-none h-24 text-sm font-mono bg-white dark:bg-slate-950"
                                />
                            </div>

                            <Button
                                onClick={handleGenerateImagePrompt}
                                disabled={isPromptGenerating || (!generatedContent && !topic)}
                                variant="outline"
                                className="w-full border-pink-200 hover:bg-pink-50 text-pink-700 dark:border-pink-900 dark:text-pink-300 dark:hover:bg-pink-950"
                            >
                                {isPromptGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Designing...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="mr-2 h-4 w-4" />
                                        {imagePrompt ? "Regenerate Prompt" : "1. Create Prompt from Copy"}
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Image Preview Area */}

                        <Button
                            className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                            disabled={!imagePrompt}
                        >
                            <ImageIcon className="mr-2 h-4 w-4" />
                            2. Generate Image (Coming Soon)
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
