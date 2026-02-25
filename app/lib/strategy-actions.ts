'use server';

import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function generateStrategyKeywords(
    timing: string,
    goal: string,
    conceptName: string,
    conceptMessage: string
) {
    const prompt = `
당신은 최고의 콘텐츠 기획자이자 마케터입니다.
다음 캠페인 조건과 선택된 핵심 컨셉을 바탕으로, 
가장 매력적인 '기획 탭/테마(캠페인 앵글)' 3가지를 제안하고, 
각 테마별로 5가지 카테고리의 전략 키워드(또는 매우 짧은 커스텀 구문)를 10개씩 도출해주세요.

[입력 조건]
- 선택된 컨셉: ${conceptName}
- 핵심 메시지: ${conceptMessage}
- 발행 예정 시기: ${timing}
- 캠페인 핵심 목적: ${goal}

[출력 요구사항]
1. 위 조건들을 영리하게 조합하여, 타겟의 눈길을 확 끌 수 있는 3개의 서로 다른 기획 앵글(테마)을 만들어주세요. 테마 이름 앞에는 어울리는 이모지를 하나씩 붙여주세요. (예: [🌸 3월 봄맞이 리프레쉬], [🎒 신학기 필수템 큐레이션])
2. 각 앵글(테마)마다 아래 5가지 카테고리에 해당하는 키워드를 정확히 10개씩, 아주 트렌디하고 실용적으로 뽑아주세요:
   A. 브랜드 에센스: 앵글에 맞춰 강조할 브랜드의 무드/질감/가치 (예: 미니멀한, 압도적인, 맑은)
   B. 시즌/TPO: '발행 예정 시기(${timing})'에 맞는 구체적 상황, 장소 (예: 벚꽃 흩날리는 주말, 출근길 지하철)
   C. 페인포인트: 타겟이 해당 시기에 겪는 뾰족한 문제나 욕망 (예: 옷장 앞 멍때리는 아침, 건조해서 찢어질듯한 피부)
   D. 트렌드/밈: 현재 유행하는 감성, 밈, 행동 양식 (예: 럭키비키 긍정, 디토 감성, 갓생 살기)
   E. CTA: '캠페인 목적(${goal})'을 달성하게 만드는 행동 유도 문구 (예: 지금 한정 혜택 확인, 내 피부타입 테스트하기, 저장해두고 꺼내보기)

모든 텍스트는 한국어로 작성해야 하며, 각 카테고리의 배열 길이는 무조건 10개여야 합니다. 
뻔한 교과서적 단어보다는 실제 현업 마케터가 인스타그램 프로모션 기획에서 쓸 법한 생생한 단어와 구문을 제시하세요.
    `;

    try {
        const { object } = await generateObject({
            model: google('models/gemini-2.5-flash'),
            schema: z.object({
                themes: z.array(z.object({
                    themeName: z.string().describe("테마/캠페인 앵글의 이름 (이모지 포함)"),
                    description: z.string().describe("이 테마를 추천하는 매력적인 이유"),
                    keywords: z.object({
                        essence: z.array(z.string()).length(10).describe("브랜드 에센스/무드 키워드 10개"),
                        season: z.array(z.string()).length(10).describe("시즌/TPO 키워드 10개"),
                        painPoint: z.array(z.string()).length(10).describe("타겟의 페인포인트/니즈 키워드 10개"),
                        trend: z.array(z.string()).length(10).describe("트렌드/밈 감성 키워드 10개"),
                        cta: z.array(z.string()).length(10).describe("액션 유도(CTA) 문구 10개")
                    })
                })).length(3)
            }),
            prompt,
            temperature: 0.8,
        });

        return { success: true, data: object };
    } catch (error) {
        console.error("Strategy keyword generation failed:", error);
        return { success: false, error: "Failed to generate keywords" };
    }
}

export async function saveGeneratedStrategy(
    analysisId: string,
    strategyData: {
        conceptName: string;
        conceptMessage: string;
        timing: string;
        goal: string;
        themes: any[];
    }
) {
    if (!analysisId) return { success: false, error: "No analysis ID provided" };

    try {
        const record = await prisma.brandAnalysis.findUnique({
            where: { id: analysisId }
        });

        if (!record) return { success: false, error: "Brand record not found" };

        const parsedContent = JSON.parse(record.content || '{}');
        const savedStrategies = parsedContent.savedStrategies || [];

        const newStrategyId = randomUUID();
        const newStrategy = {
            id: newStrategyId,
            createdAt: new Date().toISOString(),
            ...strategyData
        };

        savedStrategies.push(newStrategy);
        parsedContent.savedStrategies = savedStrategies;

        await prisma.brandAnalysis.update({
            where: { id: analysisId },
            data: { content: JSON.stringify(parsedContent) }
        });

        return { success: true, strategyId: newStrategyId };
    } catch (error: any) {
        console.error("Failed to save strategy:", error);
        return { success: false, error: error.message };
    }
}
