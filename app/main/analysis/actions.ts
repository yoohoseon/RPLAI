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
    }

    const prompt = `
    You are the Digital Twin of the brand "${analysis.brandKor}".
    ACTIVATE BRAND PERSONA:
    - Tone: ${persona.tone.join(', ')}
    - Keywords: ${persona.keywords.join(', ')}
    - Philosophy: "${persona.philosophy}"
    - Voice: "${persona.voice}"

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
    
    BRAND CONTEXT:
    - Philosophy: "${persona?.philosophy || ''}"
    - Keyword: "${persona?.keywords?.join(', ') || ''}"
    - Tone: "${persona?.tone?.join(', ') || ''}"

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

    // Use Gemini with Google Search Grounding to find images
    // This is more stable than scraping libraries
    try {
        const prompt = `
        Find 4 high-quality public image URLs that represent the visual style of the brand "${expertBrandName}".
        Focus on their official Instagram or website photography.
        Return ONLY a raw JSON array of strings (URLs). No markdown.
        Example: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"]
        `;

        const result = await generateText({
            model: google('models/gemini-2.5-flash'),
            tools: {
                googleSearch: google.tools.googleSearch({}),
            },
            prompt: prompt,
        });

        // Parse JSON from text
        const cleanText = result.text.replace(/```json\n?|\n?```/g, '').trim();
        try {
            const urls = JSON.parse(cleanText);
            if (Array.isArray(urls)) {
                return urls.slice(0, 4);
            }
        } catch (e) {
            console.warn("Failed to parse image URLs from Gemini, trying reg-ex fallback");
            // Fallback regex to find https://... .jpg|.png
            const urlRegex = /https?:\/\/[^\s"']+\.(?:jpg|jpeg|png|webp)/gi;
            const matches = result.text.match(urlRegex);
            return matches ? matches.slice(0, 4) : [];
        }

        return [];
    } catch (error) {
        console.error("Visual Search Failed via Gemini:", error);
        return [];
    }
}
