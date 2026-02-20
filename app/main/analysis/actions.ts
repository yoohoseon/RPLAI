'use server'

import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function generateExtendedStrategy(analysisId: string, currentContent: any) {
    if (!analysisId) throw new Error("Analysis ID is required");

    // 1. Generate Extended Strategy
    const prompt = `
    Based on the following Brand Analysis, provide detailed actionable plans:
    
    Context:
    - Brand: ${currentContent.kpis?.[0]?.value || 'N/A'} (Reference)
    - Insights: ${JSON.stringify(currentContent.insight)}
    - Strategy (SWOT): ${JSON.stringify(currentContent.strategy)}

    TASK:
    1. Create a "Leverage Plan" based on the brand's STRENGTHS & OPPORTUNITIES. Include concrete content ideas (SNS, Blog, etc.).
    2. Create a "Turnaround Plan" based on the brand's WEAKNESSES & THREATS. Include concrete content ideas to address these.

    Output JSON format:
    {
        "strengthsPlan": {
            "title": "String (Strategy Name)",
            "strategy": "String (Strategic Overview)",
            "contentPlan": [
                {
                    "title": "String (Content Title)",
                    "format": "String (e.g. Instagram Reels, Blog, Newsletter)",
                    "description": "String (Detailed execution guide, key message, visual style)"
                }
            ]
        },
        "weaknessesPlan": {
            "title": "String",
            "strategy": "String",
            "contentPlan": [
                {
                    "title": "String",
                    "format": "String",
                    "description": "String"
                }
            ]
        }
    }
    Language: Korean.
    important: Provide at least 3 content items for each plan. Descriptions must be specific and actionable.
    `;


    // Retry logic for extended strategy
    let text = '';
    const maxRetries = 3;
    let currentDelay = 2000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const result = await generateText({
                model: google('models/gemini-2.5-flash'),
                prompt: prompt,
                maxRetries: 0,
            });
            text = result.text;
            break;
        } catch (error: any) {
            if (attempt === maxRetries) throw error;
            console.warn(`[AI] Extended Strategy Attempt ${attempt + 1} failed. Retrying... ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, currentDelay));
            currentDelay *= 1.5;
        }
    }


    let extendedData;
    try {
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
        extendedData = JSON.parse(cleanText);
    } catch (e) {
        console.error("Failed to parse extended strategy", e);
        throw new Error("Failed to generate valid JSON");
    }

    // 2. Update DB
    const newContent = {
        ...currentContent,
        extendedStrategy: extendedData
    };

    await prisma.brandAnalysis.update({
        where: { id: analysisId },
        data: {
            content: JSON.stringify(newContent)
        }
    });

    revalidatePath('/main/analysis');
    return newContent;
}

export async function updateBrandPersona(analysisId: string, newPersona: any) {
    if (!analysisId) throw new Error("Analysis ID is required");

    try {
        const analysis = await prisma.brandAnalysis.findUnique({
            where: { id: analysisId },
        });

        if (!analysis) throw new Error("Analysis not found");

        const currentContent = JSON.parse(analysis.content);
        const updatedContent = {
            ...currentContent,
            persona: newPersona
        };

        // If extended strategy exists, keep it. 
        // Just updating persona part.

        await prisma.brandAnalysis.update({
            where: { id: analysisId },
            data: {
                content: JSON.stringify(updatedContent)
            }
        });

        revalidatePath('/main/analysis');
        return true;
    } catch (error) {
        console.error("Failed to update brand persona:", error);
        throw error;
    }
}

export async function generateBrandContent(analysisId: string, type: string, topic: string) {
    if (!analysisId) throw new Error("Analysis ID is required");

    const analysis = await prisma.brandAnalysis.findUnique({
        where: { id: analysisId },
    });

    if (!analysis) throw new Error("Analysis not found");

    const content = JSON.parse(analysis.content);
    const persona = content.persona;

    if (!persona) throw new Error("Persona not found. Please analyze the brand first.");

    let typePrompt = "";
    if (type === 'instagram') {
        typePrompt = "Instagram Caption. Use emojis, hashtags, and a line-break heavy style. Engaging and short.";
    } else if (type === 'blog') {
        typePrompt = "SEO Blog Post. Structured with H2, H3. Informative and valuable.";
    } else if (type === 'newsletter') {
        typePrompt = "Email Newsletter. Personal, direct, and click-worthy subject line included.";
    } else if (type === 'youtube_shorts') {
        typePrompt = "YouTube Shorts Script format (Visual/Audio columns or Hook-Body-CTA). Hook viewers in first 3s, fast-paced, ending with CTA.";
    } else if (type === 'tiktok') {
        typePrompt = "TikTok Video Concept & Script. Trend-aware, highly visual description, engaging hook, short punchy text.";
    } else if (type === 'threads') {
        typePrompt = "Threads Text Post. Conversational, witty, engaging question or thought-provoking statement to trigger replies.";
    } else if (type === 'linkedin') {
        typePrompt = "LinkedIn Post. Professional yet engaging, story-driven, structured with line breaks, insights, ending with an open question.";
    }

    const prompt = `
    You are the Digital Twin of the brand "${analysis.brandKor}".
    ACTIVATE BRAND PERSONA:
    - Archetype/Personality: "${persona.personality || 'N/A'}"
    - Tone: ${persona.tone?.join(', ') || ''}
    - Keywords: ${persona.keywords?.join(', ') || ''}
    - USP: "${persona.usp || 'N/A'}"
    - Philosophy & Story: "${persona.philosophy || ''} ${persona.story || ''}"
    - Voice: "${persona.voice || ''}"
    - Slogan: "${persona.slogan || ''}"

    TASK:
    Write a ${typePrompt} about the topic: "${topic}".

    RULES:
    1. Write in KOREAN.
    2. STRICTLY follow the defined Tone & Voice. If the brand is "Witty", be funny. If "Serious", be professional.
    3. Do NOT mention "AI" or "Persona". Write AS the brand.
    4. Format the output beautifully for the chosen platform.
    `;

    try {
        const result = await generateText({
            model: google('models/gemini-2.5-flash'),
            prompt: prompt,
        });
        return result.text;
    } catch (error) {
        console.error("Content Generation Failed:", error);
        throw new Error("Content Generation Failed");
    }
}

export async function generateImagePrompt(analysisId: string, context: string) {
    if (!analysisId) throw new Error("Analysis ID is required");

    const analysis = await prisma.brandAnalysis.findUnique({
        where: { id: analysisId },
    });

    if (!analysis) throw new Error("Analysis not found");

    const content = JSON.parse(analysis.content);
    const persona = content.persona; // mood, tone, philosophy

    const prompt = `
    You are an Expert Art Director for the brand "${analysis.brandKor}".
    
    BRAND CONTEXT (Aesthetic & Soul):
    - Archetype: "${persona?.personality || ''}"
    - Philosophy: "${persona?.philosophy || ''}"
    - Keywords: "${persona?.keywords?.join(', ') || ''}"
    - Visual Tone: "${persona?.tone?.join(', ') || ''}"
    - Brand Story/Vibe: "${persona?.story || ''}"

    INPUT TEXT (Copy):
    "${context}"

    TASK:
    Write a detailed Text-to-Image Prompt (English) to generate a photo that perfectly matches the mood of the input text and the brand's visual identity.
    
    REQUIREMENTS:
    - Describe the subject, lighting, color palette, and composition.
    - Style: High-end, cinematic, photorealistic (unless brand tone suggests otherwise).
    - Format: Raw prompt string (e.g., "A cinematic shot of...")
    - NO explanation, just the prompt.
    `;

    try {
        const result = await generateText({
            model: google('models/gemini-2.5-flash'),
            prompt: prompt,
        });
        return result.text;
    } catch (error) {
        console.error("Image Prompt Generation Failed:", error);
        throw new Error("Generic failure");
    }
}

// Visual Moodboard
export async function getBrandVisuals(expertBrandName: string) {
    if (!expertBrandName) return [];

    // Pollinations AI server is currently facing Argo Tunnel errors (1033).
    // To ensure 100% reliability with NO broken images, we use a robust photo placeholder (loremflickr)
    // combined with AI-extracted aesthetic keywords for the brand.
    try {
        const prompt = `
        You are a Visual Director for the brand "${expertBrandName}".
        Provide exactly 4 distinct, single-word English keywords that represent the core visual aesthetic of this brand (e.g., "minimal", "luxury", "beauty", "neon", "nature", "urban", "modern").
        Return ONLY a raw JSON array of 4 string words. No markdown.
        `;

        const result = await generateText({
            model: google('models/gemini-2.5-flash'),
            prompt: prompt,
        });

        let keywords = [];
        try {
            const cleanText = result.text.replace(/```json\n?|\n?```/g, '').trim();
            keywords = JSON.parse(cleanText);
            if (!Array.isArray(keywords)) throw new Error("Not an array");

            // Clean keywords (single word, no special chars)
            keywords = keywords.map(k => k.toString().split(' ')[0].toLowerCase().replace(/[^a-z]/g, ''));
        } catch (e) {
            console.warn("Failed to parse keyword array, using robust fallback");
            keywords = ["aesthetic", "design", "creative", "style"];
        }

        // Map to loremflickr based on the keyword. 
        // Even if a keyword has no exact match, loremflickr guarantees a fallback image instead of a 404/1033 error.
        const seed = Math.floor(Math.random() * 10000);
        const urls = keywords.slice(0, 4).map((k: string, idx: number) =>
            `https://loremflickr.com/400/400/${k},mood?lock=${seed + idx}`
        );

        return urls;
    } catch (error) {
        console.error("Visual Search Failed:", error);
        return [];
    }
}

export async function refineBrandContent(analysisId: string, currentContent: string, instruction: string) {
    if (!analysisId) throw new Error("Analysis ID is required");

    const analysis = await prisma.brandAnalysis.findUnique({
        where: { id: analysisId },
    });

    if (!analysis) throw new Error("Analysis not found");

    const content = JSON.parse(analysis.content);
    const persona = content.persona;

    const prompt = `
    You are the Digital Twin of the brand "${analysis.brandKor}".
    ACTIVATE BRAND PERSONA:
    - Archetype/Personality: "${persona?.personality || 'N/A'}"
    - Tone: ${persona?.tone?.join(', ') || ''}
    - USP: "${persona?.usp || 'N/A'}"
    - Story/Philosophy: "${persona?.philosophy || ''} ${persona?.story || ''}"
    - Voice: "${persona?.voice || ''}"

    CURRENT CONTENT:
    """
    ${currentContent}
    """

    USER INSTRUCTION FOR REVISION (Feedback Loop):
    "${instruction}"

    TASK:
    Rewrite the CURRENT CONTENT based on the USER INSTRUCTION above.
    Keep the brand's defined Tone & Voice intact.
    Write in KOREAN. Output ONLY the rewritten text.
    `;

    try {
        const result = await generateText({
            model: google('models/gemini-2.5-flash'),
            prompt: prompt,
        });
        return result.text;
    } catch (error) {
        console.error("Refine Content Failed:", error);
        throw new Error("Refine Content Failed");
    }
}

export async function saveGeneratedContent(analysisId: string, item: { type: string, topic: string, content: string }) {
    if (!analysisId) throw new Error("Analysis ID is required");

    try {
        const analysis = await prisma.brandAnalysis.findUnique({
            where: { id: analysisId },
        });

        if (!analysis) throw new Error("Analysis not found");

        const currentContent = JSON.parse(analysis.content);
        const savedContents = currentContent.savedContents || [];

        const newItem = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            ...item
        };

        savedContents.unshift(newItem); // Add to the top of the list

        const updatedContent = {
            ...currentContent,
            savedContents
        };

        await prisma.brandAnalysis.update({
            where: { id: analysisId },
            data: {
                content: JSON.stringify(updatedContent)
            }
        });

        revalidatePath('/main/analysis');
        return savedContents;
    } catch (error) {
        console.error("Failed to save content snippet:", error);
        throw error;
    }
}
