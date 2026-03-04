import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const daPersonaSchema = z.object({
    dbPersonaId: z.string().describe("The 'id' of the best matching persona FROM THE PROVIDED LIST of DB personas."),
    washedName: z.string().describe("Washed/tailored short name of the persona specifically for this brand. (e.g., '20대 트렌디 뷰티 덕후')"),
    washedDetails: z.string().describe("Detailed description of this persona's lifestyle, habits, and why they resonate with this brand."),
    washedTags: z.array(z.string()).length(3).describe("3 keyword tags summarizing this tailored persona (e.g., ['#가심비', '#인스타그래머블', '#자기관리']).")
});

const daBmSchema = z.object({
    coreModel: z.string().describe("The core business/revenue model and key value proposition (BM)."),
    targetMarket: z.string().describe("The primary target market defined in one sentence."),
    differentiation: z.string().describe("How this brand digitally differentiates itself from competitors.")
});

const daFunnelSchema = z.object({
    awareness: z.string().describe("Strategy, media approach, and message for the Awareness phase (인지단계)."),
    consideration: z.string().describe("Strategy, media approach, and message for the Consideration/Inflow phase (유입/고려단계)."),
    conversion: z.string().describe("Strategy, media approach, and message for the Conversion phase (전환단계).")
});

const daKeyMessageSchema = z.object({
    mainCopy: z.string().describe("A catchy, impactful main copy/slogan for digital advertisements."),
    subCopies: z.array(z.string()).length(3).describe("3 supporting copy phrases emphasizing different strengths or angles."),
    communicationStrategy: z.string().describe("How to effectively communicate with the target audience on digital channels (Instagram, YouTube, etc)."),
    funnelStrategy: daFunnelSchema.describe("Detailed strategy for each funnel stage: Awareness, Consideration, Conversion.")
});

const cdjStageSchema = z.object({
    percentage: z.number().describe("Estimated percentage of audience in this stage (sum to 100)"),
    keywords: z.array(z.string()).describe("Top 5 search keywords associated with this stage"),
    insightTitle: z.string().describe("Short title for insight in this stage (e.g., '탐색 단계 진입')"),
    insightDetail: z.string().describe("Detailed insight highlighting key data or issues"),
    consumerAction: z.string().describe("How consumers behave or what they interpret in this stage"),
});

const daAnalysisSchema = z.object({
    bm: daBmSchema,
    cdj: z.object({
        awareness: cdjStageSchema,
        consideration: cdjStageSchema,
        purchase: cdjStageSchema,
        postPurchase: cdjStageSchema,
    }),
    recommendedStage: z.enum(['awareness', 'consideration', 'purchase', 'postPurchase']).describe("The most critical or relevant CDJ stage for this brand's current phase based on data"),
    personas: z.array(z.object({
        name: z.string().describe("Short persona name (e.g., '꼼꼼한 30대 남성', '트렌드 민감 20대')"),
        behavior: z.string().describe("What they search for, their pain points, and why they care about the brand"),
        percentage: z.number().describe("Estimated weight of this persona (sum to 100)"),
        dbPersonaId: z.string().describe("Closest matching persona ID from the provided DB list")
    })).length(5).describe("Top 5 matching personas representing different segments of the audience"),
    trends: z.object({
        summary: z.string().describe("Overall search trend summary and key market movement"),
        serpIntent: z.string().describe("Search intent focus and recommended SERP (Search Engine Results Page) content strategy")
    }),
    messages: daKeyMessageSchema
});

export async function generateDaAnalysis(
    brandKor: string,
    brandEng: string,
    category: string,
    description?: string,
    url?: string,
    userId?: string,
    forceNew?: boolean,
    params?: {
        industry?: string;
        country?: string;
        language?: string;
        channels?: string;
        dateRange?: string;
        categoryKeywords?: string;
        ourKeywords?: string;
        competitorKeywords?: string;
    }
) {
    try {
        // 1. Check if it already exists in BrandDatas
        if (!forceNew) {
            const existing = await prisma.brandDatas.findFirst({
                where: {
                    brandKor,
                    brandEng,
                    category,
                    ...(userId ? { userId } : {})
                },
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true } } }
            });

            if (existing && existing.content !== '{}') {
                const parsed = JSON.parse(existing.content);
                // Invalidate if the old data structure doesn't have 'cdj'
                if (parsed.cdj) {
                    return parsed;
                }
            }
        }

        // 2. Fetch all 32 personas from DB so AI knows what to pick
        const allPersonas = await prisma.persona.findMany();
        const personaListString = allPersonas.map(p =>
            `[ID: ${p.id}] ${p.ageGroup}대 ${p.gender === 'M' ? '남성' : '여성'} - 타입 ${p.type} (${p.name})`
        ).join('\n');

        // 3. Generate AI insights
        const inputParamsStr = params ? `
        [Detailed Target & Request Params]
        - Industry: ${params.industry || category}
        - Target Country: ${params.country || '대한민국'}
        - Language: ${params.language || '한국어'}
        - Channels: ${params.channels || 'N/A'}
        - Category Keywords: ${params.categoryKeywords || 'N/A'}
        - Our Keywords: ${params.ourKeywords || brandKor}
        - Competitor Keywords: ${params.competitorKeywords || 'N/A'}
        ` : '';

        const prompt = `
        You are a top-tier digital brand strategist and data analyst in South Korea.
        Analyze the following brand and generate a highly detailed Customer Decision Journey (CDJ) analysis, persona mappings, and marketing message strategies.
        Ensure the output is highly professional, data-centric, and structured like a premium consulting report.

        [Brand Information]
        - Name (Korean): ${brandKor}
        - Name (English): ${brandEng}
        - Category/Industry: ${category}
        - Description/Context: ${description || 'N/A'}
        - Website URL: ${url || 'N/A'}
        ${inputParamsStr}

        [AVAILABLE PERSONA DB (For matching)]
        You MUST select ONE persona ID that best fits each of the 5 generated personas from the list below:
        ${personaListString}

        [Instructions]
        1. Parse the given keywords and brand context to estimate realistic search volumes, percentages, and customer flow across the 4 CDJ stages: Awareness(인지), Consideration(고려), Purchase(구매), Post-Purchase(구매 후).
        2. Determine the 'recommendedStage' (the most critical stage for this brand right now). Then generate 5 distinct Target Personas specifically targeting that 'recommendedStage'. Map each to the closest DB Persona ID.
        3. Write actionable insights (CDJ Insights) and trend analysis (Trends) showing exactly how they navigate the SERP (Search Engine Result Page).
        4. Provide core business model alignment (BM) and messaging strategies.
        5. DO NOT hallucinate DB Persona IDs. Only use the Exact IDs provided. Output everything in Korean.
        `;

        const { object } = await generateObject({
            model: google('models/gemini-2.5-flash'),
            schema: daAnalysisSchema,
            prompt,
        });

        // Add the actual DB persona data into each persona object
        if (object.personas) {
            object.personas = object.personas.map((p: any) => {
                const sp = allPersonas.find((db_p: any) => db_p.id === p.dbPersonaId);
                return { ...p, dbPersona: sp || allPersonas[0] };
            }) as any;

            // For backward compatibility, keep the first persona as the main one
            (object as any).persona = (object.personas as any)[0];
            (object as any).dbPersona = (object.personas as any)[0].dbPersona;
        }

        const analysisJson = JSON.stringify(object);

        // 4. Save to BrandDatas DB
        // If user is not logged in, we might either skip saving or save to a default system user.
        // Assuming userId is required for saving based on schema.
        if (userId) {
            const existingRecord = await prisma.brandDatas.findFirst({
                where: { brandKor, brandEng, category, userId },
                orderBy: { createdAt: 'desc' }
            });

            if (existingRecord) {
                await prisma.brandDatas.update({
                    where: { id: existingRecord.id },
                    data: {
                        content: analysisJson,
                        url: url || existingRecord.url,
                        description: description,
                    }
                });
            } else {
                await prisma.brandDatas.create({
                    data: {
                        brandKor,
                        brandEng,
                        category,
                        url: url || '',
                        description: description,
                        userId,
                        content: analysisJson
                    }
                });
            }
        }

        return object;
    } catch (error) {
        console.error("AI DA Generation Error:", error);
        throw error;
    }
}

const stagePersonasSchema = z.array(z.object({
    name: z.string().describe("Short persona name (e.g., '꼼꼼한 30대 남성')"),
    behavior: z.string().describe("What they search for, their pain points, and why they care about the brand in this funnel stage"),
    percentage: z.number().describe("Estimated weight of this persona (sum to 100)"),
    dbPersonaId: z.string().describe("Closest matching persona ID from DB")
})).length(5).describe("Top 5 matching personas representing different segments of the audience for this specific stage");

export async function generateStagePersonas(
    stage: string,
    brandContext: { brandKor: string, brandEng: string, category: string, description?: string, url?: string }
) {
    const allPersonas = await (prisma as any).persona.findMany();
    const personaListString = allPersonas.map((p: any) =>
        `[ID: ${p.id}] ${p.ageGroup}대 ${p.gender === 'M' ? '남성' : '여성'} - 타입 ${p.type} (${p.name})`
    ).join('\n');

    const prompt = `
    You are a top-tier digital brand strategist and data analyst in South Korea.
    The brand is ${brandContext.brandKor} (${brandContext.brandEng}), Category: ${brandContext.category}.
    Description: ${brandContext.description || 'N/A'}. URL: ${brandContext.url || 'N/A'}.
    
    [AVAILABLE PERSONA DB]
    ${personaListString}
    
    Generate 5 distinct Target Personas representing different sub-segments of the audience specifically for the '${stage}' stage of the CDJ (Customer Decision Journey).
    Map each to the closest DB Persona ID. Output in Korean.
    `;

    const { object } = await generateObject({
        model: google('models/gemini-2.5-flash'),
        schema: stagePersonasSchema,
        prompt
    });

    return object.map((p: any) => {
        const dbPersona = allPersonas.find((db: any) => db.id === p.dbPersonaId);
        return { ...p, dbPersona: dbPersona || allPersonas[0] };
    });
}

