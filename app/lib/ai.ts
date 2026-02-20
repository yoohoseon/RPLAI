import { google } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';
import prisma from '@/lib/prisma'; // Import Prisma client

import { z } from 'zod';

// Define schemas matching the UI interfaces
const kpiSchema = z.object({
    label: z.string().describe("Name of the KPI"),
    value: z.string().describe("Current value of the KPI"),
    trend: z.enum(['up', 'down', 'neutral']).describe("Trend direction"),
    change: z.string().describe("Percentage or numerical change"),
    description: z.string().describe("Brief explanation of the KPI"),
});

const insightSchema = z.object({
    intent: z.string().describe("What the brand aims to project"),
    perception: z.string().describe("How consumers actually perceive the brand"),
    gap: z.string().describe("The identified gap between intent and perception"),
});

const strategicPointSchema = z.object({
    category: z.string().describe("SWOT category: Strengths, Weaknesses, Opportunities, Threats"),
    points: z.array(z.string()).describe("List of key points for this category"),
});

const actionStepSchema = z.object({
    phase: z.string().describe("Phase number/name (e.g., Phase 1)"),
    title: z.string().describe("Title of the action step"),
    description: z.string().describe("Detailed description of the action"),
    timeline: z.string().describe("Expected timeline for implementation"),
});

const sentimentSchema = z.object({
    category: z.enum(['positive', 'negative']).describe("Sentiment category"),
    text: z.string().describe("Representative customer quote"),
    source: z.string().describe("Source of the quote (e.g., Twitter, Review)"),
});

const personaSchema = z.object({
    tone: z.array(z.string()).describe("3 adjectives describing the brand's tone of voice (e.g., Witty, Professional)"),
    keywords: z.array(z.string()).describe("5 core keywords representing the brand identity"),
    philosophy: z.string().describe("The brand's core philosophy or mission statement in one sentence"),
    voice: z.string().describe("Description of how the brand speaks to its audience"),
});

const brandAnalysisSchema = z.object({
    kpis: z.array(kpiSchema).describe("List of 4 key performance indicators"),
    insight: insightSchema.describe("Brand perception gap analysis"),
    strategy: z.array(strategicPointSchema).describe("SWOT analysis strategy points"),
    actions: z.array(actionStepSchema).describe("3-phase action plan"),
    sentiments: z.array(sentimentSchema).describe("Representative customer sentiments (2 positive, 2 negative)"),
    persona: personaSchema.describe("The defined brand persona and digital soul"),
});

export async function generateBrandAnalysis(
    brandKor: string,
    brandEng: string,
    category: string,
    target: string,
    competitors: string,
    url?: string,
    socialUrls?: {
        instagram?: string,
        twitter?: string,
        youtube?: string,
        facebook?: string,
        linkedin?: string,
        tiktok?: string,
        naver_blog?: string
    },
    userId?: string // Optional userId for caching
) {
    try {
        // 1. Check Cache (Database)
        // Note: We are not consistently checking socialUrls for cache hit to allow flexibility, 
        // or we can just ignore it for cache lookup to find previous analysis of same brand/category.
        // For strictness, we should check relevant fields.
        const existingAnalysis = await prisma.brandAnalysis.findFirst({
            where: {
                brandKor,
                brandEng,
                category,
                target,
                competitors,
            },
            orderBy: { createdAt: 'desc' }
        });

        if (existingAnalysis) {
            try {
                const parsedContent = JSON.parse(existingAnalysis.content);
                if (parsedContent && parsedContent.kpis && parsedContent.kpis.length > 0) {
                    console.log(`[AI] Returning cached analysis for ${brandKor} (${brandEng})`);
                    return parsedContent;
                } else {
                    console.warn(`[AI] Cached analysis for ${brandKor} is invalid/empty. Re-generating.`);
                }
            } catch (e) {
                console.error(`[AI] Failed to parse cached analysis for ${brandKor}`, e);
            }
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.error("CRITICAL: GOOGLE_GENERATIVE_AI_API_KEY is missing from process.env");
            throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is missing.");
        }

        const prompt = `
      Analyze the brand "${brandKor}" (English Name: "${brandEng}") in the "${category}" industry.
      Target Audience: ${target}
      Key Competitors: ${competitors}
      ${url ? `Official Website: ${url}` : ''}
      ${socialUrls?.instagram ? `Instagram: ${socialUrls.instagram}` : ''}
      ${socialUrls?.twitter ? `Twitter/X: ${socialUrls.twitter}` : ''}
      ${socialUrls?.youtube ? `YouTube: ${socialUrls.youtube}` : ''}
      ${socialUrls?.facebook ? `Facebook: ${socialUrls.facebook}` : ''}
      ${socialUrls?.linkedin ? `LinkedIn: ${socialUrls.linkedin}` : ''}
      ${socialUrls?.tiktok ? `TikTok: ${socialUrls.tiktok}` : ''}
      ${socialUrls?.naver_blog ? `Naver Blog: ${socialUrls.naver_blog}` : ''}

      Provide a comprehensive brand analysis including:
      1. 4 Key KPIs relevant to this brand's health.
      2. A perception gap analysis (Intent vs Perception).
      3. A Strategic Framework (SWOT Analysis).
      4. A 3-Phase Action Plan to improve brand performance.
      5. Representative Voice of Customer (VoC) sentiments (simulated based on typical market feedback).
      6. Brand Persona Definition: Extract the brand's "Soul" (Tone, Keywords, Philosophy, Voice).

      IMPORTANT: Use the Google Search tool to find the most recent and accurate information about this brand.
      Ensure the tone is professional, strategic, and actionable.
      Language: Korean (Translate ALL content values to Korean. Do NOT use English for descriptions or points).
      If a KPI value is not available, use "측정 미달" instead of "측정 필요".

      Output ONLY a valid JSON object matching this schema:
      {
        "kpis": [{ "label": string, "value": string, "trend": "up"|"down"|"neutral", "change": string, "description": string }],
        "insight": { "intent": string, "perception": string, "gap": string },
        "strategy": [{ "category": string, "points": string[] }],
        "actions": [{ "phase": string, "title": string, "description": string, "timeline": string }],
        "sentiments": [{ "category": "positive"|"negative", "text": string, "source": string }],
        "persona": { "tone": string[], "keywords": string[], "philosophy": string, "voice": string }
      }
    `;


        // Custom retry logic with exponential backoff
        // User requested to increase retry interval gemini-2.5-flash
        let text = '';
        const maxRetries = 3;
        let currentDelay = 3000; // Start with 3 seconds

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const result = await generateText({
                    model: google('models/gemini-2.5-flash'),
                    tools: {
                        googleSearch: google.tools.googleSearch({}),
                    },
                    prompt: prompt,
                    maxRetries: 0, // Disable internal SDK retry to control it manually
                });
                text = result.text;
                break; // Success
            } catch (error: any) {
                if (attempt === maxRetries) {
                    console.error(`[AI] Final attempt failed after ${maxRetries} retries.`);
                    throw error;
                }

                const isRateLimit = error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('Too Many Requests');

                // If rate limit, maybe wait longer?
                if (isRateLimit) currentDelay += 2000;

                console.warn(`[AI] Attempt ${attempt + 1} failed. Retrying in ${currentDelay}ms... Error: ${error.message}`);
                await new Promise(resolve => setTimeout(resolve, currentDelay));
                currentDelay *= 1.5; // Exponential backoff
            }
        }


        // Parse JSON from text (handling potential markdown code blocks)
        let cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
        let object: any;
        try {
            object = JSON.parse(cleanText);
        } catch (e) {
            console.error("Failed to parse JSON from AI response:", text);
            throw new Error("Invalid JSON response from AI");
        }

        // 2. Save to Cache (Database)
        // Only save if object is valid
        if (userId && object && object.kpis && object.kpis.length > 0) {
            try {
                await prisma.brandAnalysis.create({
                    data: {
                        brandKor,
                        brandEng,
                        category,
                        target,
                        competitors,
                        url: url || '',
                        socialUrls: socialUrls ? JSON.stringify(socialUrls) : undefined,
                        content: JSON.stringify(object),
                        userId: userId
                    }
                });
                console.log(`[AI] Saved analysis for ${brandKor} to DB`);
            } catch (dbError) {
                console.error("[AI] Failed to save analysis to DB:", dbError);
            }
        }

        return object;
    } catch (error: any) {
        console.error("AI Generation Failed:", error);

        // Check for specific errors if needed
        if (error.message?.includes('429') || error.message?.includes('quota')) {
            console.warn("Gemini Quota Exceeded. Falling back to mock data.");
        }

        // Return Mock Data as Fallback
        return getMockAnalysisData(brandKor, category);
    }
}

function getMockAnalysisData(brand: string, category: string) {
    return {
        kpis: [
            { label: 'Brand Awareness', value: 'Simulated 78%', trend: 'up', change: '+5.2%', description: 'AI Error - Mock Data' },
            { label: 'Customer Satisfaction', value: '4.2/5.0', trend: 'neutral', change: '0.0%', description: 'AI Error - Mock Data' },
            { label: 'Market Influence', value: '85', trend: 'up', change: '+2', description: 'AI Error - Mock Data' },
            { label: 'Repurchase Intent', value: '62%', trend: 'down', change: '-1.5%', description: 'AI Error - Mock Data' },
        ],
        insight: {
            intent: `${brand} aims to be a leader in ${category}.`,
            perception: "Customers perceive it as a stong but expensive brand.",
            gap: "Gap in value perception vs price."
        },
        strategy: [
            { category: 'Strengths', points: ['Strong Brand Heritage', 'Global Presence'] },
            { category: 'Weaknesses', points: ['High Price Point', 'Slow Innovation'] },
            { category: 'Opportunities', points: ['Expansion into Emerging Markets', 'Digital Transformation'] },
            { category: 'Threats', points: ['Agile Competitors', 'Economic Downturn'] }
        ],
        actions: [
            { phase: 'Phase 1', title: 'Quick Wins', description: 'Optimize digital marketing channels.', timeline: 'Q3 2024' },
            { phase: 'Phase 2', title: 'Strategic Shift', description: 'Launch new affordable product line.', timeline: 'Q4 2024' },
            { phase: 'Phase 3', title: 'Long-term Growth', description: 'Establish R&D center for innovation.', timeline: '2025' }
        ],
        sentiments: [
            { category: 'positive', text: "I love the quality of their products!", source: 'Twitter' },
            { category: 'positive', text: "Best customer service I've experienced.", source: 'Review' },
            { category: 'negative', text: "Too expensive for what you get.", source: 'Reddit' },
            { category: 'negative', text: "Shipping took way too long.", source: 'Forum' }
        ],
        persona: {
            tone: ["Professional", "Innovative", "Reliable"],
            keywords: ["Quality", "Trust", "Future", "Smart", "Global"],
            philosophy: "Building a better future through continuous innovation.",
            voice: "A confident and expert voice that guides the customer."
        }
    };
}
