'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Save, X, Plus, Trash2 } from "lucide-react";
import { updateBrandPersona } from '@/app/main/analysis/actions';

interface BrandPersonaProps {
    analysisId?: string;
    persona: {
        tone: string[];
        keywords: string[];
        philosophy: string;
        voice: string;
    } | undefined;
}

export default function BrandPersona({ analysisId, persona: initialPersona }: BrandPersonaProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [persona, setPersona] = useState(initialPersona);
    const [isSaving, setIsSaving] = useState(false);

    // If no persona, don't render (or maybe render a "Create Persona" button later)
    if (!persona && !isEditing) return null;

    const handleSave = async () => {
        if (!analysisId) {
            alert("Cannot save: Analysis ID missing (Is this a mock?)");
            return;
        }
        setIsSaving(true);
        try {
            await updateBrandPersona(analysisId, persona);
            setIsEditing(false);
            alert("Brand Persona Updated!");
        } catch (error) {
            console.error(error);
            alert("Failed to update persona");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setPersona(initialPersona);
        setIsEditing(false);
    };

    const addKeyword = () => {
        if (!persona) return;
        setPersona({ ...persona, keywords: [...persona.keywords, "New Keyword"] });
    };

    const removeKeyword = (index: number) => {
        if (!persona) return;
        const newKeywords = [...persona.keywords];
        newKeywords.splice(index, 1);
        setPersona({ ...persona, keywords: newKeywords });
    };

    const updateKeyword = (index: number, value: string) => {
        if (!persona) return;
        const newKeywords = [...persona.keywords];
        newKeywords[index] = value;
        setPersona({ ...persona, keywords: newKeywords });
    };

    const addTone = () => {
        if (!persona) return;
        setPersona({ ...persona, tone: [...persona.tone, "New Tone"] });
    };

    const removeTone = (index: number) => {
        if (!persona) return;
        const newTone = [...persona.tone];
        newTone.splice(index, 1);
        setPersona({ ...persona, tone: newTone });
    };

    const updateTone = (index: number, value: string) => {
        if (!persona) return;
        const newTone = [...persona.tone];
        newTone[index] = value;
        setPersona({ ...persona, tone: newTone });
    };

    return (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100 relative group">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold tracking-tight">0. Brand DNA (The Soul)</h2>
                    <span className="text-xs text-muted-foreground bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-2 py-1 rounded font-bold">Feedback Loop</span>
                </div>
                {analysisId && (
                    <div>
                        {isEditing ? (
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={handleCancel} disabled={isSaving}>
                                    <X className="h-4 w-4 mr-1" /> Cancel
                                </Button>
                                <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700 text-white">
                                    <Save className="h-4 w-4 mr-1" /> {isSaving ? "Saving..." : "Save DNA"}
                                </Button>
                            </div>
                        ) : (
                            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit2 className="h-4 w-4 mr-2" /> Edit Persona
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {/* Visual Identity (Keywords & Tone) */}
                <Card className={`border-purple-100 dark:border-purple-900/30 transition-all ${isEditing ? 'ring-2 ring-purple-400 dark:ring-purple-600 bg-white dark:bg-slate-900' : 'bg-gradient-to-br from-purple-50 to-white dark:from-slate-900 dark:to-slate-800'}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-200 uppercase tracking-wider">
                            Brand Identity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* KEYWORDS */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-xs text-muted-foreground">Core Keywords</p>
                                {isEditing && <Button size="icon" variant="ghost" className="h-5 w-5" onClick={addKeyword}><Plus className="h-3 w-3" /></Button>}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {persona?.keywords.map((keyword, i) => (
                                    isEditing ? (
                                        <div key={i} className="relative group/tag">
                                            <Input
                                                value={keyword}
                                                onChange={(e) => updateKeyword(i, e.target.value)}
                                                className="h-7 w-24 text-xs bg-white dark:bg-slate-800"
                                            />
                                            <button onClick={() => removeKeyword(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/tag:opacity-100 transition-opacity">
                                                <X className="h-2 w-2" />
                                            </button>
                                        </div>
                                    ) : (
                                        <Badge key={i} variant="secondary" className="bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 shadow-sm cursor-default">
                                            #{keyword}
                                        </Badge>
                                    )
                                ))}
                            </div>
                        </div>

                        {/* TONE & MANNER */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-xs text-muted-foreground">Tone & Manner</p>
                                {isEditing && <Button size="icon" variant="ghost" className="h-5 w-5" onClick={addTone}><Plus className="h-3 w-3" /></Button>}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {persona?.tone.map((t, i) => (
                                    isEditing ? (
                                        <div key={i} className="relative group/tag">
                                            <Input
                                                value={t}
                                                onChange={(e) => updateTone(i, e.target.value)}
                                                className="h-7 w-24 text-xs bg-white dark:bg-slate-800"
                                            />
                                            <button onClick={() => removeTone(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/tag:opacity-100 transition-opacity">
                                                <X className="h-2 w-2" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span key={i} className="text-sm font-medium px-2 py-1 bg-purple-100/50 dark:bg-purple-900/20 rounded text-purple-800 dark:text-purple-300">
                                            {t}
                                        </span>
                                    )
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Conceptual Identity (Philosophy & Voice) */}
                <Card className={`border-slate-200 dark:border-slate-800 transition-all ${isEditing ? 'ring-2 ring-slate-400 dark:ring-slate-600 bg-white dark:bg-slate-900' : 'bg-white dark:bg-slate-900'}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                            Brand Philosophy & Voice
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Philosophy</p>
                            {isEditing ? (
                                <Textarea
                                    value={persona?.philosophy}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => persona && setPersona({ ...persona, philosophy: e.target.value })}
                                    className="min-h-[80px] text-sm text-slate-700 dark:text-slate-300 font-serif"
                                />
                            ) : (
                                <div className="relative pl-4 border-l-2 border-purple-500">
                                    <p className="text-lg font-serif italic text-slate-700 dark:text-slate-300 leading-relaxed">
                                        "{persona?.philosophy}"
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Voice Description</p>
                            {isEditing ? (
                                <Textarea
                                    value={persona?.voice}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => persona && setPersona({ ...persona, voice: e.target.value })}
                                    className="min-h-[60px] text-sm"
                                />
                            ) : (
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                                    <strong>Voice:</strong> {persona?.voice}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
