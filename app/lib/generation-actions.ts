'use server';

import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export async function generateMarketingContent(
    conceptName: string,
    conceptMessage: string,
    selectedKeywords: { [category: string]: string[] }
) {
    const keywordsString = Object.entries(selectedKeywords)
        .filter(([, list]) => list.length > 0)
        .map(([cat, list]) => `${cat}: ${list.join(', ')}`)
        .join('\n');

    const prompt = `
당신은 소셜 미디어 마케팅과 비주얼 디렉팅 전문가입니다. 
다음의 브랜드 컨셉과 마케터가 직접 선택한 핵심 키워드들을 바탕으로, 
타겟의 시선을 사로잡는 인스타그램 콘텐츠 기획안을 작성해 주세요.

[브랜드 및 컨셉 정보]
- 컨셉 이름: ${conceptName}
- 핵심 메시지: ${conceptMessage}

[선택된 키워드 조합]
${keywordsString}

[요구사항]
1. 인스타그램 본문 카피:
   - Hook: 첫 줄에서 시선을 끄는 강렬한 한 줄 (이모지 포함 가능).
   - Body: 선택된 키워드들을 자연스럽게 녹여내어 감성적이면서도 설득력 있게 작성하세요.
   - CTA: 행동을 유도하는 뾰족한 마무리 문구.
   - Hashtags: 브랜드와 컨셉에 어울리는 트렌디한 해시태그 5개 이상.

2. 비주얼 가이드:
   - Image Description (Korean): 이 콘텐츠를 위해 제작할 이미지나 사진의 구도, 분위기, 색감 등을 마케터가 이해하기 쉽게 한국어로 상세히 묘사해 주세요.
   - Image Prompt (English): Midjourney나 DALL-E 3에서 실제 고퀄리티 이미지를 생성할 수 있도록, 분위기/조명/카메라 기법 등을 포함한 상세한 영문 프롬프트를 작성해 주세요. 

모든 본문 텍스트는 한국어로 작성하되, Image Prompt만 영문으로 작성하세요.
    `;

    try {
        const { object } = await generateObject({
            model: google('models/gemini-2.5-flash'), // Using flash for speed
            schema: z.object({
                hook: z.string().describe("인스타그램 첫 줄 Hook"),
                body: z.string().describe("인스타그램 본문 내용 (개행 포함 가능)"),
                cta: z.string().describe("CTA 문구"),
                hashtags: z.string().describe("해시태그 묶음"),
                imageDescription: z.string().describe("한국어 비주얼 디렉션 가이드"),
                imagePrompt: z.string().describe("AI 이미지 생성을 위한 영문 프롬프트")
            }),
            prompt,
            temperature: 0.7,
        });

        return { success: true, data: object };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to generate content";
        console.error("Content generation failed:", error);
        return { success: false, error: errorMessage };
    }
}
