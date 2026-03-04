import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export async function POST(req: Request) {
    try {
        const { promptText } = await req.json();

        if (!promptText) {
            return NextResponse.json({ error: 'Prompt text is required' }, { status: 400 });
        }

        const result = await generateObject({
            model: google('gemini-2.5-flash'),
            schema: z.object({
                industry: z.string().describe('Extract the industry (산업/산업군), default to 코스메틱 if unknown'),
                country: z.string().describe('Extract target country (국가), default to 대한민국 if unknown'),
                language: z.string().describe('Output language, default to 한국어'),
                channels: z.array(z.string()).describe('Channels like Google, Meta. Default to ["Google", "Meta"] if unknown'),
                categoryKeywords: z.array(z.string()).describe('General category keywords (e.g. 코스메틱, 퍼스널 케어)'),
                ourKeywords: z.array(z.string()).describe('Our brand and product names keywords (e.g. 센카, 퍼펙트 휩)'),
                competitorKeywords: z.array(z.string()).describe('Competitor brand and product keywords (e.g. 마녀공장, 퓨어 클렌징 폼)'),
            }),
            prompt: `
Analyze the following user input describing their brand analysis requirements and extract the necessary fields to fill out a structured form.
If some information like channels or languages is missing, use reasonable defaults like "한국어" and ["Google", "Nerd"]. 
For keywords, split them into logical short phrases (like "센카", "퍼펙트 휩").

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
