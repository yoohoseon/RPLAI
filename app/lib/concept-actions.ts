'use server';

import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function generateConceptsBatch(
    brandKor: string,
    brandEng: string,
    targetAndTone: { lifestyle: number; knowledge: number; communication: number },
    analysisId?: string,
    guidelines?: string
) {
    const prompt = `
    당신은 실력 있는 수석 브랜드 전략가이자 수석 카피라이터입니다.
    다음 브랜드 정보와 타겟&톤(Target & Tone) 값을 바탕으로, 타겟 고객에게 어필할 수 있는 핵심 컨셉(Concept) 3가지 카테고리를 도출하고,
    각 카테고리별로 사용할 수 있는 키 메시지(Key Message) 문구를 10개씩(총 30개) 작성해주세요.

    [상태 정보]
    - 브랜드 한글명: ${brandKor}
    - 브랜드 영문명: ${brandEng}
    - 라이프스타일 지수 (0: 안정/실속 ~ 100: 성취/도전): ${targetAndTone.lifestyle}
    - 지식/관여도 지수 (0: 대중/입문 ~ 100: 전문가/매니아): ${targetAndTone.knowledge}
    - 소통 관계 지수 (0: 친근한 ~ 100: 신뢰받는): ${targetAndTone.communication}
    ${guidelines ? `\n    [특별 요청/강력 지침]\n    ${guidelines}\n` : ''}

    [말투, 어휘, 소구점 절대 규칙]
    1. 소통 관계 지수(${targetAndTone.communication})에 따른 **말투(어미, 톤)**:
       - 0 ~ 33 (친근함): 친구처럼 아주 편안하고 캐주얼한 말투, '~해요', '~해', 유행어나 감성적인 짧은 표현
       - 34 ~ 66 (부드러운 신뢰): 예의 바르면서도 딱딱하지 않은 부드러운 존댓말, '~하세요', '~입니다'
       - 67 ~ 100 (강력한 신뢰/권위): 전문가적인 무게감이 느껴지는 단호하고 묵직한 격식체, 명사형 종결이나 '~하십시오', '~합니다' 형식

    2. 지식/관여도 지수(${targetAndTone.knowledge})에 따른 **어휘 수준 및 정보의 깊이**:
       - 0 ~ 33 (대중/입문): 전문 용어 절대 사용 금지. 아주 쉽고 일상적인 언어, 직관적인 비유, 누구나 바로 이해할 수 있는 쉬운 표현 사용
       - 34 ~ 66 (관심층): 일반적인 마니아층이 알만한 수준의 업계 용어는 자연스럽게 섞어 쓰되, 복잡한 원리보다는 혜택과 가치 위주로 서술
       - 67 ~ 100 (전문가/매니아): 고도의 전문 용어, 숫자, 스펙, 기술적 원리, 업계 은어 등을 적극 활용. 타협 없는 극도의 전문성과 깊이를 보여주는 카피

    3. 라이프스타일 지수(${targetAndTone.lifestyle})에 따른 **핵심 훅(Hook) 및 심리적 소구점**:
       - 0 ~ 33 (안정/실속): 가성비, 실패하지 않는 선택, 편안함, 일상의 평온함, 보호, 안정감을 강조하는 메시지
       - 34 ~ 66 (균형/발전): 나를 위한 똑똑한 선택, 더 나은 내일, 워라밸, 세련된 라이프스타일 개선을 강조하는 메시지
       - 67 ~ 100 (성취/도전): 한계 돌파, 자아실현, 남들과 다른 파격적인 선택, 최고를 향한 열망, 도전을 자극하는 메시지

    [요구사항]
    1. 위 타겟&톤 지수를 심층적으로 분석하여, 해당 타겟층에 가장 강력하게 전달될 수 있는 3개의 서로 다른 컨셉을 명확하게 설정해 주세요. (주의: 컨셉명은 'XX추구형', 'XX강조형' 같은 분류나 분석용 명칭이 절대 아닙니다. '최고의 경험 추구', '일상의 완벽한 휴식', '타협 없는 퀄리티'처럼 실제 마케팅 캠페인 타이틀 같은 세련되고 직관적인 문구로 작성하세요.)
    2. 각 컨셉 카테고리에 대해 짧고 강력한 설명(description)을 덧붙여 주세요.
    3. 각 컨셉 카테고리당 10개씩, 당장 마케팅 소재나 상세페이지에 쓸 수 있을 만큼 직관적이고 퀄리티 높은 키 메시지를 작성해 주세요. (한국어로 응답)
    4. 반드시 위 **[말투, 어휘, 소구점 절대 규칙]**에서 지정된 세 가지 기준(말투, 어휘 난이도, 심리적 소구점)을 모두 극단적이고 정확하게 반영하여 키 메시지를 작성해야 합니다.
    `;

    try {
        const { object } = await generateObject({
            model: google('models/gemini-2.5-flash'),
            schema: z.object({
                concepts: z.array(z.object({
                    conceptName: z.string().describe("컨셉의 이름 ('XX형' 형태 절대 금지. 예: 최고의 경험 추구, 일상의 리프레쉬 등 실제 캠페인명처럼)"),
                    description: z.string().describe("이 컨셉을 제안하는 핵심 이유 및 설명"),
                    keyMessages: z.array(z.string()).length(10).describe("이 컨셉에 맞는 직관적인 키 메시지 문구 10개")
                })).length(3)
            }),
            prompt,
        });

        let currentHistory: any[] = [];
        if (analysisId) {
            try {
                const record = await prisma.brandAnalysis.findUnique({ where: { id: analysisId } });
                if (record) {
                    const parsedContent = JSON.parse(record.content || '{}');

                    // 최초 AI 추천 값을 유지하기 위해 처음 수정될 때 원본을 저장해 둠
                    if (!parsedContent.originalTargetAndTone) {
                        parsedContent.originalTargetAndTone = parsedContent.targetAndTone;
                    }

                    if (!parsedContent.conceptHistory) {
                        parsedContent.conceptHistory = [];
                    }

                    if (parsedContent.concepts) {
                        parsedContent.conceptHistory.unshift({
                            id: Date.now().toString(),
                            timestamp: new Date().toISOString(),
                            targetAndTone: parsedContent.targetAndTone || targetAndTone,
                            guidelines: parsedContent.guidelines,
                            concepts: parsedContent.concepts
                        });
                    }

                    parsedContent.targetAndTone = targetAndTone;
                    parsedContent.guidelines = guidelines;
                    parsedContent.concepts = object.concepts;

                    currentHistory = parsedContent.conceptHistory;

                    await prisma.brandAnalysis.update({
                        where: { id: analysisId },
                        data: { content: JSON.stringify(parsedContent) }
                    });
                }
            } catch (dbError) {
                console.error("Failed to save concepts to DB:", dbError);
            }
        }

        return { success: true, data: object, newHistory: currentHistory };
    } catch (error: any) {
        console.error("Concept generation failed:", error);
        return { success: false, error: error.message };
    }
}

export async function saveEditedConcepts(analysisId: string, concepts: any[]) {
    if (!analysisId) return { success: false, error: "No analysis ID" };

    try {
        const record = await prisma.brandAnalysis.findUnique({ where: { id: analysisId } });
        if (!record) return { success: false, error: "Record not found" };

        const parsedContent = JSON.parse(record.content || '{}');
        parsedContent.concepts = concepts;

        await prisma.brandAnalysis.update({
            where: { id: analysisId },
            data: { content: JSON.stringify(parsedContent) }
        });

        return { success: true };
    } catch (error: any) {
        console.error("Failed to save edited concepts:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteConceptHistoryItem(analysisId: string, historyItemId: string) {
    if (!analysisId) return { success: false, error: "No analysis ID" };

    try {
        const record = await prisma.brandAnalysis.findUnique({ where: { id: analysisId } });
        if (!record) return { success: false, error: "Record not found" };

        const parsedContent = JSON.parse(record.content || '{}');
        let currentHistory = parsedContent.conceptHistory || [];

        currentHistory = currentHistory.filter((item: any) => item.id !== historyItemId);
        parsedContent.conceptHistory = currentHistory;

        await prisma.brandAnalysis.update({
            where: { id: analysisId },
            data: { content: JSON.stringify(parsedContent) }
        });

        return { success: true, newHistory: currentHistory };
    } catch (error: any) {
        console.error("Failed to delete history item:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteBrandAnalysis(analysisId: string) {
    if (!analysisId) return { success: false, error: "No analysis ID provided" };

    try {
        await prisma.brandAnalysis.delete({
            where: { id: analysisId }
        });

        revalidatePath('/main');

        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete brand analysis:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteBrandDaAnalysis(analysisId: string) {
    if (!analysisId) return { success: false, error: "No analysis ID provided" };

    try {
        await prisma.brandDatas.delete({
            where: { id: analysisId }
        });

        revalidatePath('/main/da/history');

        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete brand DA analysis:", error);
        return { success: false, error: error.message };
    }
}

export async function checkBrandExistsAction(brandKor: string, brandEng: string) {
    if (!brandKor && !brandEng) return { exists: false };

    try {
        const record = await prisma.brandAnalysis.findFirst({
            where: {
                OR: [
                    { brandKor: brandKor },
                    { brandEng: brandEng }
                ]
            },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
        });

        if (record) {
            return {
                exists: true,
                data: {
                    id: record.id,
                    brandKor: record.brandKor,
                    brandEng: record.brandEng,
                    category: record.category,
                    target: record.target,
                    competitors: record.competitors,
                    url: record.url,
                    creatorName: record.user?.name || '알 수 없음',
                    createdAt: record.createdAt.toISOString()
                }
            };
        }
        return { exists: false };
    } catch (error: any) {
        console.error("Failed to check existing brand:", error);
        return { exists: false, error: error.message };
    }
}

export async function checkBrandDaExistsAction(brandKor: string, brandEng: string) {
    if (!brandKor && !brandEng) return { exists: false };

    try {
        const record = await prisma.brandDatas.findFirst({
            where: {
                OR: [
                    { brandKor: brandKor },
                    { brandEng: brandEng }
                ]
            },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
        });

        if (record) {
            return {
                exists: true,
                data: {
                    id: record.id,
                    brandKor: record.brandKor,
                    brandEng: record.brandEng,
                    category: record.category,
                    url: record.url,
                    description: record.description,
                    creatorName: record.user?.name || '알 수 없음',
                    createdAt: record.createdAt.toISOString()
                }
            };
        }
        return { exists: false };
    } catch (error: any) {
        console.error("Failed to check existing DA brand:", error);
        return { exists: false, error: error.message };
    }
}

export async function generatePinterestKeywords(brandName: string, concept: string) {
    const prompt = `
    당신은 트렌디하고 감각적인 브랜드 비주얼 마케터이자 디자이너입니다.
    사용자가 제시한 브랜드명과 핵심 컨셉을 바탕으로, 핀터레스트(Pinterest)에서 검색하면 
    핵심 무드를 가장 잘 보여줄 수 있는 고품질의 감성적인 이미지들이 나올법한 
    '영문 검색 키워드' 5개를 추천해주세요.
    
    [입력]
    - 브랜드명: ${brandName}
    - 핵심 컨셉: ${concept}
    
    [키워드 도출 가이드 - 마케터 실무 방식]
    1. 브랜드를 한 단어나 형용사로 표현하기 (예: "warm", "calm", "luxurious", "vibrant")
    2. 컬러와 톤앤매너 정리하기 (예: "muted beige", "dark monochrome", "pastel blue")
    3. 일반적인 검색어가 아닌, 실무 디자이너/마케터들이 레퍼런스(포스터, 메뉴, 타이포 등)를 찾을 때 쓰는 구체적이고 디테일한 키워드 포함 (예: "red big typography", "menu poster", "editorial photography", "refined b-grade aesthetic", "product flatlay texture")
    4. 위 요소들을 조합하여 핀터레스트 검색 시 즉시 영감이 되는 강력한 무드보드 키워드를 만드세요.
    
    [조건]
    - 반드시 영어 키워드 조합으로 작성 (핀터레스트는 영어가 가장 퀄리티가 높음)
    - 추상적인 단어 나열이 아닌, 이미지의 '형태', '질감', '매체'가 연상되는 구체적인 검색어 제공
    - 예시: "warm beige editorial skincare photography", "red big typography branding aesthetics", "dark moody menu poster design"
    `;

    try {
        const { object } = await generateObject({
            model: google('models/gemini-2.5-flash'),
            schema: z.object({
                keywords: z.array(z.string()).length(5).describe("핀터레스트 영문 검색 키워드 모음 (5개)")
            }),
            prompt,
        });

        return { success: true, keywords: object.keywords };
    } catch (error: any) {
        console.error("Keyword generation failed:", error);
        return { success: false, error: error.message };
    }
}

export async function getBrandCategoriesAction() {
    try {
        const categories = await prisma.brandCategory.findMany({
            orderBy: { sortOrder: 'asc' }
        });
        return { success: true, data: categories.map((c: any) => c.name) };
    } catch (error: any) {
        console.error("Failed to get brand categories:", error);
        return { success: false, error: error.message };
    }
}
