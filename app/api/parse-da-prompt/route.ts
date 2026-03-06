import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { promptText } = await req.json();

        if (!promptText) {
            return NextResponse.json({ error: 'Prompt text is required' }, { status: 400 });
        }

        const dbCategories = await (prisma as any).brandCategory.findMany();
        const categoryList = dbCategories.length > 0 ? dbCategories.map((c: any) => c.name) : ['코스메틱', 'IT/테크', '패션', '음.식료품'];
        const categoryString = categoryList.join(', ');

        const result = await generateObject({
            model: google('gemini-2.5-flash'),
            schema: z.object({
                industry: z.string().describe(`Extract the industry (산업/산업군). MUST pick exactly one from this list: [${categoryString}]`),
                country: z.string().describe('Extract target country (국가), default to 대한민국 if unknown'),
                language: z.string().describe('Output language, default to 한국어'),
                channels: z.array(z.string()).describe('Channels like Google, Meta. Default to ["Google", "Meta"] if unknown'),
                categoryKeywords: z.array(z.string()).describe('General category keywords (e.g. 코스메틱, 퍼스널 케어)'),
                ourKeywords: z.array(z.string()).describe('Our brand and product names keywords (e.g. 센카, 퍼펙트 휩)'),
                competitorKeywords: z.array(z.string()).describe('Competitor brand and product keywords (e.g. 마녀공장, 퓨어 클렌징 폼)'),
                brandKor: z.string().optional().describe('Korean brand name (e.g., 센카). Infer from text if not explicit.'),
                brandEng: z.string().optional().describe('English brand name (e.g., SENKA). MUST deduce from your knowledge if missing.'),
                url: z.string().optional().describe('Official website URL (e.g., https://www.senka.co.kr). MUST deduce from your knowledge if missing.'),
            }),
            prompt: `
You are a highly intelligent digital marketing AI assistant. 
Analyze the following user input describing a brand or product.
Your job is to deeply understand the requested brand and extract OR DEDUCE the necessary fields for a structured form.

Instructions:
1. If the user only provides a short brand name or product, you MUST use your internal knowledge to automatically deduce and fill in ALL of the following: 
   - English brand name (brandEng)
   - Official homepage URL (url)
   - Industry (industry)
   - Relevant category keywords (categoryKeywords)
   - Detailed internal brand/product keywords (ourKeywords)
   - At least 2-3 main competitor brand and product keywords (competitorKeywords).
2. DEDUCE the official website URL if the user did not provide it. Do your best to provide the actual working homepage URL of the brand (e.g., https://www.innisfree.com).
3. If channels or languages are missing, use defaults like "한국어" and ["Google", "Meta"].
4. Ensure keywords are logical short phrases. Example of ourKeywords: ["센카", "퍼펙트 휩"], competitorKeywords: ["마녀공장 퓨어 클렌징 오일", "해피바스 클렌징 폼"].
5. Do not leave array fields empty if you can reasonably deduce them based on the brand mentioned.
6. For 'industry', you MUST strictly map the user's input or deduced industry into one of the exact acceptable category names: [${categoryString}]. Do NOT invent a new category name.

User Input:
${promptText}
            `,
        });

        return NextResponse.json(result.object);
    } catch (error: any) {
        console.error('Failed to parse prompt:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
