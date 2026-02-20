'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { generateBrandContent, generateImagePrompt, refineBrandContent, saveGeneratedContent } from '@/app/main/analysis/actions';
import { Loader2, Copy, Check, Sparkles, Image as ImageIcon, Wand2, RefreshCw, Bookmark } from "lucide-react";

interface ContentGeneratorProps {
    analysisId: string;
    brandName: string;
    initialSavedContents?: { id: string, type: string, topic: string, content: string, date: string }[];
}

export default function ContentGenerator({ analysisId, brandName, initialSavedContents = [] }: ContentGeneratorProps) {
    const [contentType, setContentType] = useState('instagram');
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');
    const [copied, setCopied] = useState(false);

    // Feedback Loop (Refinement)
    const [refineInstruction, setRefineInstruction] = useState('');
    const [isRefining, setIsRefining] = useState(false);

    // Save to Vault
    const [savedList, setSavedList] = useState(initialSavedContents);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveToList = async () => {
        if (!generatedContent || !topic) return;
        setIsSaving(true);
        try {
            const result = await saveGeneratedContent(analysisId, {
                type: contentType,
                topic: topic,
                content: generatedContent
            });
            setSavedList(result);
            // alert("Saved successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to save.");
        } finally {
            setIsSaving(false);
        }
    };

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

    const [imagePrompt, setImagePrompt] = useState('');
    const [isPromptGenerating, setIsPromptGenerating] = useState(false);
    const [visuals, setVisuals] = useState<string[]>([]);
    const [isLoadingVisuals, setIsLoadingVisuals] = useState(false);

    const loadVisuals = async () => {
        setIsLoadingVisuals(true);
        try {
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

    const handleRefine = async () => {
        if (!generatedContent) return alert("Generate content first before refining.");
        if (!refineInstruction) return alert("Please enter instructions for revision.");

        setIsRefining(true);
        try {
            const result = await refineBrandContent(analysisId, generatedContent, refineInstruction);
            setGeneratedContent(result);
            setRefineInstruction('');
        } catch (error) {
            console.error(error);
            alert("Failed to refine content.");
        } finally {
            setIsRefining(false);
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
                <h2 className="text-2xl font-semibold tracking-tight">Stage 2. Content Engine & Distro</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* LEFT: Visual Generator (Moved) */}
                <Card className="border-pink-200 dark:border-pink-900 shadow-lg bg-white dark:bg-slate-950 flex flex-col">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <span className="text-xl">🎨</span> Visual Director
                        </CardTitle>
                        <CardDescription>
                            Generate brand-aligned multimodal visual guides.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1 space-y-6 text-center p-6 bg-slate-50/50 dark:bg-slate-900/50 h-full">

                        {/* Brand Moodboard */}
                        <div className="w-full space-y-2 mb-2">
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

                        <div className="w-full space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex-1 flex flex-col">
                            <div className="text-left space-y-1 flex-1 flex flex-col">
                                <label className="text-sm font-medium flex items-center gap-2 mb-1">
                                    <span>AI Visual Guide Prompt</span>
                                    {generatedContent && !imagePrompt && (
                                        <span className="text-xs text-pink-500 animate-pulse hidden sm:inline-block">
                                            ← Analyze copy for visual direction
                                        </span>
                                    )}
                                </label>
                                <Textarea
                                    value={imagePrompt}
                                    onChange={(e) => setImagePrompt(e.target.value)}
                                    placeholder="Generate copy first, then click below to design a visual concept..."
                                    className="resize-none flex-1 min-h-[120px] text-sm font-mono bg-white dark:bg-slate-950"
                                />
                            </div>

                            <Button
                                onClick={handleGenerateImagePrompt}
                                disabled={isPromptGenerating || (!generatedContent && !topic)}
                                variant="outline"
                                className="w-full border-pink-200 hover:bg-pink-50 text-pink-700 dark:border-pink-900 dark:text-pink-300 dark:hover:bg-pink-950"
                            >
                                {isPromptGenerating ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Designing...</>
                                ) : (
                                    <><Wand2 className="mr-2 h-4 w-4" /> {imagePrompt ? "Regenerate Visual Guide" : "1. Create Visual Guide"}</>
                                )}
                            </Button>
                        </div>

                        <Button
                            className="w-full bg-pink-600 hover:bg-pink-700 text-white mt-auto"
                            disabled={!imagePrompt}
                        >
                            <ImageIcon className="mr-2 h-4 w-4" />
                            2. Generate Image (API Integration Soon)
                        </Button>
                    </CardContent>
                </Card>

                {/* RIGHT: Text Generator & Editor (Moved) */}
                <Card className="border-purple-200 dark:border-purple-900 shadow-lg bg-white dark:bg-slate-950 flex flex-col">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-xl">✍️</span> AI Copywriter
                                <span className="text-xs ml-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-2 py-1 rounded font-bold">Feedback Loop</span>
                            </CardTitle>

                            {/* Saved Vault Dialog Trigger */}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 gap-1 border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-900 dark:text-purple-300 dark:hover:bg-purple-900/50">
                                        <Bookmark className="h-4 w-4" />
                                        <span className="hidden sm:inline">Saved Vault</span>
                                        {savedList.length > 0 && (
                                            <span className="ml-1 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{savedList.length}</span>
                                        )}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <Bookmark className="h-5 w-5 text-blue-500" /> Saved Content Vault
                                        </DialogTitle>
                                        <DialogDescription>
                                            View and manage your saved content snippets for {brandName}.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-3 scrollbar-hide">
                                        {savedList.length === 0 ? (
                                            <div className="text-center py-10 text-muted-foreground text-sm">
                                                No content saved yet. Generate and save some copy first.
                                            </div>
                                        ) : (
                                            savedList.map((item) => (
                                                <details key={item.id} className="group p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 transition-all open:bg-white dark:open:bg-slate-950 open:shadow-md">
                                                    <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden focus:outline-none flex flex-col w-full">
                                                        <div className="flex justify-between items-center w-full">
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded flex-shrink-0">{item.type.replace('_', ' ')}</span>
                                                                <p className="text-sm font-semibold truncate group-open:text-blue-600 dark:group-open:text-blue-400 transition-colors" title={item.topic}>{item.topic}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                                                <span className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
                                                                <span className="text-slate-400 transition-transform duration-200 group-open:-rotate-180 border border-slate-200 dark:border-slate-700 rounded p-1 group-hover:bg-slate-100 dark:group-hover:bg-slate-800">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </summary>
                                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 relative animate-in fade-in zoom-in-95 duration-200">
                                                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed pb-10">{item.content}</p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="absolute bottom-0 right-0 h-8 text-xs px-4 shadow-sm bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                navigator.clipboard.writeText(item.content);
                                                            }}
                                                        >
                                                            <Copy className="h-4 w-4 mr-2" /> Copy Content
                                                        </Button>
                                                    </div>
                                                </details>
                                            ))
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <CardDescription>
                            Generate persona-synced content across multiple platforms.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                        <Tabs defaultValue="instagram" onValueChange={setContentType} className="w-full h-full flex flex-col">
                            {/* Flex-wrap Tabs List for Multiple Channels to avoid scrollbar */}
                            <div className="w-full pb-3 mb-2">
                                <TabsList className="inline-flex flex-wrap h-auto p-1 bg-slate-100 dark:bg-slate-900 justify-start w-full rounded-md gap-1">
                                    <TabsTrigger value="instagram">Instagram</TabsTrigger>
                                    <TabsTrigger value="youtube_shorts">Shorts/Reels</TabsTrigger>
                                    <TabsTrigger value="tiktok">TikTok</TabsTrigger>
                                    <TabsTrigger value="threads">Threads</TabsTrigger>
                                    <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                                    <TabsTrigger value="blog">Blog</TabsTrigger>
                                    <TabsTrigger value="newsletter">Email</TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="space-y-4 flex flex-col flex-1">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Topic / Key Message</label>
                                    <Textarea
                                        placeholder="Detailed topic (e.g. Summer launch with tropical vibes)"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="resize-none h-20 bg-white dark:bg-slate-950"
                                    />
                                </div>

                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !topic}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    {isGenerating ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Writing...</>
                                    ) : (
                                        <><Sparkles className="mr-2 h-4 w-4" /> Generate Copy</>
                                    )}
                                </Button>

                                {generatedContent && (
                                    <div className="mt-4 flex flex-col flex-1 space-y-2 relative animate-in fade-in h-auto">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase">Result</label>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={handleSaveToList} disabled={isSaving} className="h-6 text-xs px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30">
                                                    {isSaving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Bookmark className="h-3 w-3 mr-1" />} Save
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-6 text-xs px-2">
                                                    {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />} Copy
                                                </Button>
                                            </div>
                                        </div>
                                        {/* Editor Content */}
                                        <Textarea
                                            value={generatedContent}
                                            onChange={(e) => setGeneratedContent(e.target.value)}
                                            className="min-h-[250px] flex-1 bg-slate-50 dark:bg-slate-900 border-purple-100 dark:border-purple-900 font-sans leading-relaxed p-4 text-sm"
                                        />

                                        {/* Feedback Loop Input */}
                                        <div className="flex items-center gap-2 pt-2">
                                            <Input
                                                placeholder="e.g., Make it funnier, Add a bold CTA..."
                                                value={refineInstruction}
                                                onChange={(e) => setRefineInstruction(e.target.value)}
                                                className="flex-1 border-purple-200 dark:border-purple-800 focus-visible:ring-purple-500 text-sm h-9"
                                            />
                                            <Button
                                                size="sm"
                                                onClick={handleRefine}
                                                disabled={isRefining || !refineInstruction}
                                                className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white h-9"
                                            >
                                                {isRefining ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
                                                Refine
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
