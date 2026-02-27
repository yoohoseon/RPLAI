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
    personality: z.string().describe("The brand's character as if it were a person (e.g., The Rebel, The Sage)"),
    tone: z.array(z.string()).describe("3 adjectives describing the brand's tone of voice (e.g., Witty, Professional)"),
    keywords: z.array(z.string()).describe("5 core keywords representing the brand identity"),
    usp: z.string().describe("Unique Selling Proposition (What makes it different)"),
    story: z.string().describe("A short summary of the brand's background story or mission narrative"),
    philosophy: z.string().describe("The brand's core philosophy or mission statement in one sentence"),
    voice: z.string().describe("Description of how the brand speaks to its audience"),
    slogan: z.string().describe("A catchy slogan for the brand. If you create a new one instead of finding an official one, append '(AI 제작)' to the very end."),
});

const targetAndToneSchema = z.object({
    lifestyle: z.number().min(0).max(100).describe("Lifestyle: 0 (안정/실속 Stability/Practical) to 100 (성취/도전 Achievement/Challenge)"),
    lifestyleExplanation: z.string().describe("AI rationale for selecting this lifestyle value based on the brand's core product/service. MUST be in Korean (한국어로 작성)"),
    knowledge: z.number().min(0).max(100).describe("Knowledge/Involvement: 0 (대중/입문 Public/Beginner) to 100 (전문가/매니아 Expert/Maniac)"),
    knowledgeExplanation: z.string().describe("AI rationale for selecting this knowledge value. MUST be in Korean (한국어로 작성)"),
    communication: z.number().min(0).max(100).describe("Communication Relationship: 0 (친근한 Friendly) to 100 (신뢰받는 Trusted)"),
    communicationExplanation: z.string().describe("AI rationale for selecting this communication value. MUST be in Korean (한국어로 작성)"),
});

const brandAnalysisSchema = z.object({
    kpis: z.array(kpiSchema).describe("List of 4 key performance indicators"),
    insight: insightSchema.describe("Brand perception gap analysis"),
    strategy: z.array(strategicPointSchema).describe("SWOT analysis strategy points"),
    actions: z.array(actionStepSchema).describe("3-phase action plan"),
    sentiments: z.array(sentimentSchema).describe("Representative customer sentiments (2 positive, 2 negative)"),
    persona: personaSchema.describe("The defined brand persona and digital soul"),
    targetAndTone: targetAndToneSchema.describe("Brand target and tone mapping from 0 to 100"),
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
    userId?: string, // Optional userId for caching
    description?: string, // Description from user form to prevent hallucination
    forceNew?: boolean
) {
    try {
        // 1. Check Cache (Database)
        // Only checking if forceNew is not true
        if (!forceNew) {
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
                    if (parsedContent && parsedContent.targetAndTone) {
                        console.log(`[AI] Returning cached target and tone analysis for ${brandKor} (${brandEng})`);
                        return parsedContent;
                    } else {
                        console.warn(`[AI] Cached analysis for ${brandKor} is invalid/empty (missing targetAndTone). Re-generating.`);
                    }
                } catch (e) {
                    console.error(`[AI] Failed to parse cached analysis for ${brandKor}`, e);
                }
            }
        } else {
            console.log(`[AI] forceNew is true, generating new analysis for ${brandKor} (${brandEng}) bypassing cache.`);
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
      ${description ? `Brand Description / Core Product: ${description}` : ''}
      ${url ? `Official Website: ${url}` : ''}
      ${socialUrls?.instagram ? `Instagram: ${socialUrls.instagram}` : ''}
      ${socialUrls?.twitter ? `Twitter/X: ${socialUrls.twitter}` : ''}
      ${socialUrls?.youtube ? `YouTube: ${socialUrls.youtube}` : ''}
      ${socialUrls?.facebook ? `Facebook: ${socialUrls.facebook}` : ''}
      ${socialUrls?.linkedin ? `LinkedIn: ${socialUrls.linkedin}` : ''}
      ${socialUrls?.tiktok ? `TikTok: ${socialUrls.tiktok}` : ''}
      ${socialUrls?.naver_blog ? `Naver Blog: ${socialUrls.naver_blog}` : ''}

      Provide a structured response. Since the user ONLY wants the Target & Tone mapping, you MUST focus entirely on analyzing the website and brand core values to deduce the target and tone mapping.
      
      For the "targetAndTone" field, output 3 slider values from 0 to 100: 
         - lifestyle: 0 (안정/실속 Stability/Practical) to 100 (성취/도전 Achievement/Challenge)
         - knowledge: 0 (대중/입문 Public/Beginner) to 100 (전문가/매니아 Expert/Maniac)
         - communication: 0 (친근한 Friendly) to 100 (신뢰받는 Trusted)

      CRITICAL: For all "*Explanation" fields, you MUST write the rationale entirely in Korean (반드시 한국어로 작성하세요).

      For all other fields (kpis, insight, strategy, actions, sentiments, persona), just return empty or generic placeholder dummy strings/arrays because they will NOT be displayed.

      IMPORTANT: Use the Google Search tool to find the most recent and accurate information about this brand to calculate the target and tone.

      Output ONLY a valid JSON object matching this schema:
      {
        "kpis": [{ "label": "Mock", "value": "Mock", "trend": "neutral", "change": "Mock", "description": "Mock" }],
        "insight": { "intent": "Mock", "perception": "Mock", "gap": "Mock" },
        "strategy": [],
        "actions": [],
        "sentiments": [],
        "persona": { "personality": "Mock", "tone": [], "keywords": [], "usp": "Mock", "story": "Mock", "philosophy": "Mock", "voice": "Mock", "slogan": "Mock" },
        "targetAndTone": { "lifestyle": number, "lifestyleExplanation": "Mock", "knowledge": number, "knowledgeExplanation": "Mock", "communication": number, "communicationExplanation": "Mock" }
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
        if (userId && object && object.targetAndTone) {
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
                        content: JSON.stringify({
                            ...object,
                            originalTargetAndTone: object.targetAndTone
                        }),
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
            personality: "The Innovator",
            tone: ["Professional", "Innovative", "Reliable"],
            keywords: ["Quality", "Trust", "Future", "Smart", "Global"],
            usp: "Providing enterprise-grade AI solutions with seamless integration.",
            story: "Born from a need for smarter marketing, we strive to make AI accessible for all businesses.",
            philosophy: "Building a better future through continuous innovation.",
            voice: "A confident and expert voice that guides the customer.",
            slogan: "Innovation that connects the future."
        },
        targetAndTone: {
            lifestyle: 50,
            lifestyleExplanation: "AI Error - Mock Reason",
            knowledge: 60,
            knowledgeExplanation: "AI Error - Mock Reason",
            communication: 40,
            communicationExplanation: "AI Error - Mock Reason"
        }
    };
}
