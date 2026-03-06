'use server';

import { signIn, auth } from '@/auth';
import prisma from '@/lib/prisma';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { generateStagePersonas } from '@/app/lib/ai-da';
import fs from 'fs';
import path from 'path';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { scrapeMetaAds } from '@/app/lib/scraper';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const email = formData.get('email') as string;
        const user = await prisma.user.findUnique({
            where: { email },
            select: { role: true }
        });

        const redirectTo = user?.role === 'TEAM_MEMBER' ? '/main' : '/dashboard';

        await signIn('credentials', {
            ...Object.fromEntries(formData),
            redirectTo,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}


export async function createTeam(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'MASTER') {
        return { message: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!name) {
        return { message: 'Team name is required' };
    }

    try {
        await prisma.team.create({
            data: {
                name,
                description,
            },
        });
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/teams');
        return { message: 'Team created successfully', success: true };
    } catch (e) {
        return { message: 'Failed to create team' };
    }
}

export async function updateTeam(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'MASTER') {
        return { message: 'Unauthorized' };
    }

    const teamId = formData.get('teamId') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const leaderId = formData.get('leaderId') as string;

    try {
        await prisma.$transaction(async (tx: any) => {
            // 1. Update Team Info
            await tx.team.update({
                where: { id: teamId },
                data: { name, description },
            });

            // 2. Handle Leader Assignment if provided
            if (leaderId) {
                // Demote existing leaders of this team
                await tx.user.updateMany({
                    where: { teamId, role: 'TEAM_LEADER' },
                    data: { role: 'TEAM_MEMBER' },
                });

                // Promote new leader
                await tx.user.update({
                    where: { id: leaderId },
                    data: { role: 'TEAM_LEADER', teamId }, // Ensure they are in the team
                });
            }
        });

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/teams');
        revalidatePath('/dashboard/users');
        return { message: 'Team updated successfully', success: true };
    } catch (e) {
        return { message: 'Failed to update team' };
    }
}

export async function deleteTeam(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'MASTER') {
        return { message: 'Unauthorized' };
    }

    const teamId = formData.get('teamId') as string;

    try {
        await prisma.team.delete({
            where: { id: teamId },
        });
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/teams');
        return { message: 'Team deleted successfully', success: true };
    } catch (e) {
        // Handle deletion restriction (e.g., users in team) if necessary, Prisma might throw error if foreign key constraints exist
        return { message: 'Failed to delete team (ensure no users are assigned)' };
    }
}

export async function createUser(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'MASTER' && session.user.role !== 'TEAM_LEADER')) {
        return { message: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;
    const teamId = formData.get('teamId') as string;

    if (!name || !email || !password || !role) {
        return { message: 'Missing required fields' };
    }

    if (session.user.role === 'TEAM_LEADER' && role !== 'TEAM_MEMBER') {
        return { message: 'Team Leaders can only create Team Members' };
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role as any,
                teamId: teamId || null,
            },
        });
        revalidatePath('/dashboard/users');
        revalidatePath('/dashboard');
        return { message: 'User created successfully', success: true };
    } catch (e: any) {
        if (e.code === 'P2002') {
            return { message: 'This email is already registered.' };
        }
        return { message: 'Failed to create user.' };
    }
}

export async function deleteUser(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'MASTER') {
        return { message: 'Unauthorized' };
    }

    const userId = formData.get('userId') as string;

    try {
        await prisma.user.delete({
            where: { id: userId },
        });
        revalidatePath('/dashboard/users');
        revalidatePath('/dashboard');
        return { message: 'User deleted successfully', success: true };
    } catch (e) {
        return { message: 'Failed to delete user' };
    }
}

export async function updateUser(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'MASTER') {
        return { message: 'Unauthorized' };
    }

    const userId = formData.get('userId') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const teamId = formData.get('teamId') as string;
    const password = formData.get('password') as string;

    try {
        const data: any = {
            name,
            email,
            role: role as any,
            teamId: teamId || null,
        };

        if (password) {
            const bcrypt = require('bcryptjs');
            data.password = await bcrypt.hash(password, 10);
        }

        await prisma.user.update({
            where: { id: userId },
            data,
        });
        revalidatePath('/dashboard/users');
        revalidatePath('/dashboard');
        return { message: 'User updated successfully', success: true };
    } catch (e) {
        return { message: 'Failed to update user' };
    }
}

export async function addTeamMember(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'MASTER') {
        return { message: 'Unauthorized' };
    }

    const teamId = formData.get('teamId') as string;
    const userId = formData.get('userId') as string;

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { teamId },
        });
        revalidatePath(`/dashboard/teams/${teamId}`);
        revalidatePath('/dashboard/teams');
        revalidatePath('/dashboard/users');
        return { message: 'Member added successfully', success: true };
    } catch (e) {
        return { message: 'Failed to add member' };
    }
}

export async function removeTeamMember(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'MASTER') {
        return { message: 'Unauthorized' };
    }

    const userId = formData.get('userId') as string;
    const teamId = formData.get('teamId') as string; // Needed for revalidation

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const isLeader = user?.role === 'TEAM_LEADER';

        await prisma.user.update({
            where: { id: userId },
            data: {
                teamId: null,
                role: isLeader ? 'TEAM_MEMBER' : undefined // Demote if they were a leader
            },
        });
        revalidatePath(`/dashboard/teams/${teamId}`);
        revalidatePath('/dashboard/teams');
        revalidatePath('/dashboard/users');
        return { message: 'Member removed successfully', success: true };
    } catch (e) {
        return { message: 'Failed to remove member' };
    }
}

export async function assignTeamLeader(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'MASTER') {
        return { message: 'Unauthorized' };
    }

    const teamId = formData.get('teamId') as string;
    const leaderId = formData.get('leaderId') as string;

    try {
        await prisma.$transaction(async (tx: any) => {
            // Demote existing leaders of this team
            await tx.user.updateMany({
                where: { teamId, role: 'TEAM_LEADER' },
                data: { role: 'TEAM_MEMBER' },
            });

            // Promote new leader
            await tx.user.update({
                where: { id: leaderId },
                data: { role: 'TEAM_LEADER', teamId }, // Ensure they are in the team
            });
        });

        revalidatePath(`/dashboard/teams/${teamId}`);
        revalidatePath('/dashboard/teams');
        revalidatePath('/dashboard/users');
        return { message: 'Leader assigned successfully', success: true };
    } catch (e) {
        return { message: 'Failed to assign leader' };
    }
}

export async function changeMyPassword(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user) {
        return { message: 'Unauthorized' };
    }

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { message: 'All fields are required' };
    }

    if (newPassword !== confirmPassword) {
        return { message: 'New passwords do not match' };
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user) return { message: 'User not found' };

        const bcrypt = require('bcryptjs');
        const passwordsMatch = await bcrypt.compare(currentPassword, user.password);

        if (!passwordsMatch) {
            return { message: 'Incorrect current password' };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword },
        });

        return { message: 'Password changed successfully', success: true };
    } catch (e) {
        return { message: 'Failed to change password' };
    }
}

export async function saveAnalysis(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user) {
        return { message: 'Unauthorized' };
    }

    const brand = formData.get('brand') as string;
    const url = formData.get('url') as string;
    const category = formData.get('category') as string;
    const target = formData.get('target') as string;
    const competitors = formData.get('competitors') as string;
    const content = formData.get('content') as string;

    console.log('[saveAnalysis] Request received');
    console.log('[saveAnalysis] Session User:', session.user);
    console.log('[saveAnalysis] Content Length:', content ? content.length : 'null');
    console.log('[saveAnalysis] Data:', { brand, url, category, target, competitors });

    try {
        console.log('[saveAnalysis] Attempting to create DB record...');
        await prisma.brandAnalysis.create({
            data: {
                brandKor: brand,
                brandEng: '',
                url,
                category,
                target,
                competitors,
                content: content || '{}',
                userId: session.user.id,
            },
        });
        return { message: 'Analysis saved successfully', success: true };
    } catch (e: any) {
        console.error('Save Analysis Error:', e);
        return { message: 'Failed to save analysis: ' + (e.message || e) };
    }
}

export async function resetUserPassword(prevState: any, formData: FormData) {
    const session = await auth();
    // Allow MASTER and TEAM_LEADER to reset passwords (with logic)
    // For now, check MASTER as per current requirement/page access
    if (!session?.user || (session.user.role !== 'MASTER' && session.user.role !== 'TEAM_LEADER')) {
        return { message: 'Unauthorized' };
    }

    const userId = formData.get('userId') as string;
    const newPassword = formData.get('newPassword') as string;

    if (!userId || !newPassword) {
        return { message: 'Missing required fields' };
    }

    try {
        // Optional: Check if TEAM_LEADER is managing their own team member
        if (session.user.role === 'TEAM_LEADER') {
            const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
            const targetUser = await prisma.user.findUnique({ where: { id: userId } });

            if (!currentUser?.teamId || targetUser?.teamId !== currentUser.teamId) {
                return { message: 'You can only manage your own team members.' };
            }
        }

        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        revalidatePath('/dashboard/teams');
        revalidatePath('/dashboard/users');
        return { message: 'Password reset successfully', success: true };
    } catch (e) {
        return { message: 'Failed to reset password' };
    }
}

export async function generateStagePersonasAction(stage: string, brandContext: any) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        return await generateStagePersonas(stage, brandContext);
    }

    try {
        // Find existing analysis for this brand
        const existing = await (prisma as any).brandDatas.findFirst({
            where: { brandKor: brandContext.brandKor, userId: userId },
            orderBy: { createdAt: 'desc' }
        });

        if (existing && existing.content) {
            const content = JSON.parse(existing.content);
            // Awareness level personas are typically generated first in the DA process as 'content.personas'
            if (stage === 'awareness' && content.personas && content.personas.length > 0) {
                return content.personas;
            }
            // Check if mapped into stagePersonas object
            if (content.stagePersonas && content.stagePersonas[stage] && content.stagePersonas[stage].length > 0) {
                return content.stagePersonas[stage];
            }
        }

        // Generate brand new via AI
        const personas = await generateStagePersonas(stage, brandContext);

        // Save it to database for future toggles
        if (existing && personas && Array.isArray(personas)) {
            const content = JSON.parse(existing.content || "{}");
            if (stage === 'awareness') {
                content.personas = personas;
            } else {
                content.stagePersonas = content.stagePersonas || {};
                content.stagePersonas[stage] = personas;
            }
            await (prisma as any).brandDatas.update({
                where: { id: existing.id },
                data: { content: JSON.stringify(content) }
            });
        }

        return personas;
    } catch (e) {
        console.error("Error generating stage personas:", e);
        return await generateStagePersonas(stage, brandContext);
    }
}

export async function getCompetitorAdsAction(brandContext: any) {
    try {
        const brandName = brandContext?.brandKor || brandContext?.brandEng || '테스트 브랜드';
        const brandCategory = brandContext?.category || '일반';

        // 1. Find competitors via AI(상위 경쟁 브랜드 5가지 검색 gemini-2.5-flash 기반)
        const { object } = await generateObject({
            model: google('gemini-2.5-flash'),
            system: 'You are an expert digital marketer. Identify top 5 primary real-world competitor BRANDS for the given brand. Return ONLY the exact brand name in Korean (e.g., "마녀공장", "해피바스", "비레디"). CRITICAL: DO NOT include any product names, modifiers, or descriptions (e.g., DO NOT return "마녀공장 퓨어 클렌징 오일", JUST "마녀공장").',
            prompt: `Brand: ${brandName}\nCategory: ${brandCategory}\nWhat are the top 5 competitor brands? Return EXACTLY the brand name only.`,
            schema: z.object({
                competitors: z.array(z.string().describe("The exact name of the competitor brand without any product names.")).max(5)
            })
        });

        // Save competitors to DB asynchronously
        if (brandName && brandName !== '테스트 브랜드') {
            try {
                const latestBrandData = await (prisma as any).brandDatas.findFirst({
                    where: {
                        OR: [
                            { brandKor: brandName },
                            { brandEng: brandName }
                        ]
                    },
                    orderBy: { createdAt: 'desc' }
                });

                if (latestBrandData) {
                    const parsedContent = JSON.parse(latestBrandData.content || '{}');
                    parsedContent.competitors = object.competitors;

                    await (prisma as any).brandDatas.update({
                        where: { id: latestBrandData.id },
                        data: { content: JSON.stringify(parsedContent) }
                    });
                }
            } catch (dbErr) {
                console.error("Failed to save competitors to DB:", dbErr);
            }
        }

        // 2. Parse mock CSV as reference ads
        const filePath = path.join(process.cwd(), `sample_report_라네즈.csv`);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const rows = fileContent.split('\n');

        const ads = [];
        for (let i = 4; i < rows.length; i++) {
            const line = rows[i].trim();
            if (!line || line.startsWith('""') || line.startsWith('"소재') || line.startsWith('소재유형')) break;

            const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (cols.length >= 11) {
                const cleanCols = cols.map(c => c.replace(/^"|"$/g, '').trim());
                if (!isNaN(parseInt(cleanCols[0]))) {
                    ads.push({
                        id: parseInt(cleanCols[0]),
                        type1: cleanCols[2],
                        type2: cleanCols[3],
                        copy: cleanCols[4],
                        platform: cleanCols[6],
                        targetGroup: cleanCols[7],
                        startDate: cleanCols[8],
                        endDate: cleanCols[9],
                        days: parseInt(cleanCols[10]),
                        spend: cleanCols[11]
                    });
                }
            }
        }
        return {
            competitors: object.competitors,
            ads
        };
    } catch (error) {
        console.error("Failed to call AI for competitors", error);
        return { competitors: ["경쟁사A", "경쟁사B", "경쟁사C"], ads: [] };
    }
}

export async function getCompetitorSpecificAdsAction(searchTerms: string, afterCursor?: string) {
    try {
        console.log(`[getCompetitorSpecificAdsAction] Scraping for: ${searchTerms}`);
        // Use custom scraper. Pass "" for pageId, and searchTerms for keyword.
        const scrapedResult = await scrapeMetaAds("", searchTerms);

        let realAds: any[] = [];
        if (scrapedResult && !scrapedResult.error && scrapedResult.response?.data) {
            realAds = scrapedResult.response.data;
        }

        if (realAds.length === 0) {
            console.warn("[Meta Ads Warning] No results from custom scraper");
            return { ads: [], nextCursor: null };
        }

        // We have real ads! 
        // 1. Sort locally by impressions or fallback to oldest active days
        // (Since scraper doesn't have real impressions, we rely mostly on the scraper's native ordering or time)
        realAds.sort((a: any, b: any) => {
            const timeA = a.ad_delivery_start_time ? new Date(a.ad_delivery_start_time).getTime() : Date.now();
            const timeB = b.ad_delivery_start_time ? new Date(b.ad_delivery_start_time).getTime() : Date.now();
            return timeA - timeB;
        });

        // Slice to top 12 to save AI tokens and match UI mapping
        realAds = realAds.slice(0, 12);

        const adsForAi = realAds.map((ad: any, index: number) => ({
            index,
            copy: ad.ad_creative_bodies?.[0] || '이미지/영상 소재',
        }));

        const validAdsWithImages = realAds.filter((ad: any) => ad.ad_snapshot_url && !ad.ad_snapshot_url.includes('No+Media')).slice(0, 3);
        const imageParts: any[] = [];
        await Promise.all(validAdsWithImages.map(async (ad: any) => {
            try {
                const res = await fetch(ad.ad_snapshot_url);
                if (res.ok) {
                    const arrayBuffer = await res.arrayBuffer();
                    imageParts.push({
                        type: 'image',
                        image: Buffer.from(arrayBuffer)
                    });
                }
            } catch (e) { }
        }));

        const { object } = await generateObject({
            model: google('gemini-2.5-flash'),
            system: 'You are an elite creative director and data analyst. Analyze the following real ad copies AND their visual elements (images if provided) to provide deep, actionable insights. **CRITICAL: OUTPUT EVERYTHING STRICTLY IN KOREAN (한국어).**',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: `Here are ${adsForAi.length} ads with copy texts. Please categorize them and provide a deep, multi-dimensional insight.\nAds data: ${JSON.stringify(adsForAi)}` },
                        ...imageParts
                    ]
                }
            ],
            schema: z.object({
                categorized: z.array(z.object({
                    index: z.number(),
                    type1: z.enum(['프로모션', '리뷰/UGC', '일반형']),
                    type2: z.string().describe('Detailed type (e.g., 이미지, 숏폼 비디오, 캐러셀) in Korean'),
                    targetGroup: z.string().describe('Likely target audience (e.g., 2030 여성, 피부 민감러) in Korean')
                })),
                insight: z.string().describe("Provide a comprehensive markdown-formatted insight including: 1. 🖋️ 카피라이팅 기조 (Main focus of text), 2. 🎨 비주얼 시각화 전략 (What do the images/videos visually emphasize?), 3. 🎯 핵심 타겟팅 의도. Return it as a structured markdown string. **MUST BE WRITTEN IN PERFECT KOREAN.**")
            })
        });

        const categorizationMap = new Map(object.categorized.map(c => [c.index, c]));

        const finalAds = realAds.map((ad: any, index: number) => {
            const cat = categorizationMap.get(index) || { type1: '일반형', type2: '이미지', targetGroup: '불특정 다수' };
            const startTime = ad.ad_delivery_start_time ? new Date(ad.ad_delivery_start_time) : new Date();
            const daysActive = Math.floor((Date.now() - startTime.getTime()) / (1000 * 3600 * 24));

            let platforms = 'Meta';
            if (ad.publisher_platforms && Array.isArray(ad.publisher_platforms)) {
                platforms = ad.publisher_platforms.map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(', ');
            }

            return {
                id: ad.id || index + 1,
                type1: cat.type1,
                type2: cat.type2,
                copy: ad.ad_creative_bodies?.[0]?.substring(0, 150) + (ad.ad_creative_bodies?.[0]?.length > 150 ? '...' : '') || '이미지/영상 소재',
                platform: platforms,
                targetGroup: cat.targetGroup,
                days: Math.max(0, daysActive),
                // Custom UI requires the URL to point directly to Meta Ad Library Creative page:
                link: `https://www.facebook.com/ads/library/?id=${ad.id || ''}`,
                spend: 'N/A', // Not supported by scraper for commercial ads
                impressions: null, // Not supported by scraper for commercial ads
                startDate: startTime.toISOString().split('T')[0],
                endDate: '-',
                // We'll pass media URL generated by the scraper
                mediaUrl: ad.ad_snapshot_url,
                profileLogo: ad.profile_logo_url,
                pageName: ad.page_name
            };
        });

        // The scraper doesn't support pagination easily initially, so we just set null. 
        // If it supports loading more via DOM tricks, we'd adjust it.
        return { ads: finalAds, insight: object.insight, nextCursor: null };

    } catch (error) {
        console.error("Failed to fetch specific ads:", error);
        return { ads: [], nextCursor: null };
    }
}

export async function testMetaAdsApiRaw(params: {
    searchTerms: string;
    adType: string;
    countries: string;
    fields: string;
    limit: number;
    searchPageIds?: string;
    deliveryDateMin?: string;
    deliveryDateMax?: string;
}) {
    try {
        const token = "EAAXMCWaR9w4BQ90ECXJ6MrJtOZBdxcyCLnJuCRr3ClBovW8lz83YudcrBAMiojcCyhFsNMbZBOwGzEN536VVvLKpZB3fDPNwzkxhwafofJM30Rb7ZBrYS4jjTGQBBZAJjWOZBp2NyGAxhAl0PL8lBGQEa47uXSpuvXJWqsEdxNuGcJndsPkXHQa8rzbrJ9xJZClfP9J0NUVnQC01Cfw";
        let url = `https://graph.facebook.com/v19.0/ads_archive?access_token=${token}&ad_type=${params.adType}&ad_reached_countries=[${params.countries}]&fields=${params.fields}&limit=${params.limit}`;

        if (params.searchTerms) {
            url += `&search_terms=${encodeURIComponent(params.searchTerms)}`;
        }
        if (params.searchPageIds) {
            url += `&search_page_ids=${encodeURIComponent(params.searchPageIds)}`;
        }
        if (params.deliveryDateMin) {
            url += `&ad_delivery_date_min=${params.deliveryDateMin}`;
        }
        if (params.deliveryDateMax) {
            url += `&ad_delivery_date_max=${params.deliveryDateMax}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        return { request_url: url, response: data };
    } catch (error: any) {
        return { error: error.message || "Failed to fetch from Meta API" };
    }
}

export async function testMetaAdsApiDirectUrl(url: string) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return { request_url: url, response: data };
    } catch (error: any) {
        return { error: error.message || "Failed to fetch from Meta API" };
    }
}

export async function saveCompetitorAdLogAction(brandKor: string, competitorName: string, adsData: any[], insight?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error('Not authenticated');
        }

        const log = await (prisma as any).competitorAdLog.create({
            data: {
                brandKor,
                competitorName,
                adsData: JSON.stringify({ ads: adsData, insight: insight || '' }),
                userId: session.user.id,
                userName: session.user.name || '알 수 없는 사용자',
            }
        });

        return { success: true, logId: log.id, createdAt: log.createdAt };
    } catch (e: any) {
        console.error('Failed to save ad log:', e);
        return { success: false, error: e.message };
    }
}

export async function getCompetitorAdLogsAction(brandKor: string, competitorName: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error('Not authenticated');
        }

        const logs = await (prisma as any).competitorAdLog.findMany({
            where: { brandKor, competitorName },
            orderBy: { createdAt: 'desc' },
            select: { id: true, createdAt: true, userName: true }
        });

        return {
            success: true, logs: logs.map((l: any) => ({
                id: l.id,
                createdAt: l.createdAt.toISOString(),
                userName: l.userName
            }))
        };
    } catch (e: any) {
        console.error('Failed to fetch ad logs:', e);
        return { success: false, error: e.message };
    }
}

export async function getCompetitorAdLogByIdAction(logId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error('Not authenticated');
        }

        const log = await (prisma as any).competitorAdLog.findUnique({
            where: { id: logId }
        });

        if (!log) throw new Error('Log not found');

        const parsed = JSON.parse(log.adsData);
        let returnAds = [];
        let returnInsight = '';

        if (Array.isArray(parsed)) {
            // Backwards compatibility for old saved array logs
            returnAds = parsed;
        } else {
            returnAds = parsed.ads || [];
            returnInsight = parsed.insight || '';
        }

        return { success: true, adsData: returnAds, insight: returnInsight };
    } catch (e: any) {
        console.error('Failed to fetch ad log:', e);
        return { success: false, error: e.message };
    }
}

export async function generateFinalAnalysisSummaryAction(payload: {
    brandKor: string;
    brandEng: string;
    category: string;
    stagePersonas: any;
    messages?: any;
    ourBrandData: { ads: any[], insight: string } | null;
    competitorData: Record<string, { ads: any[], insight: string }>;
}) {
    try {
        const sharedPromptContext = `
            Brand: ${payload.brandKor} (${payload.brandEng})
            Category: ${payload.category}
            [Stage Personas Data]: ${JSON.stringify(payload.stagePersonas)}
            [Brand Initial Key Copy & Communication Messages]: ${JSON.stringify(payload.messages)}
            [Our Brand Ad Data]: ${JSON.stringify(payload.ourBrandData)}
            [Competitor Ad Data]: ${JSON.stringify(payload.competitorData)}

            CRITICAL NEGATIVE GUIDELINE: 절대로 '자사(Our Brand)'가 과거에 진행했던 특정 캐릭터 IP 콜라보레이션(예: 시나모롤 등)이나 경쟁사의 흔한 콜라보 패턴을 미래의 메인 전략으로 단순히 재탕하거나 예시로 제안하지 마세요. 기존에 의존했던 캐릭터/굿즈 부록 중심의 단기적이고 뻔한 기획에서 완전히 벗어나, 제품의 본질적인 효능 가치, 압도적인 기능성, 타겟의 라이프스타일, 그리고 독보적인 메시지에 집중하는 새롭고 근본적인 브랜드 차별화 기획을 도출해야 합니다.
        `;

        // 1. Keyword & Core Analysis
        const keywordCall = generateObject({
            model: google('gemini-2.5-flash'),
            system: 'You are a data-driven digital marketer. Analyze the provided ad data and extract key advertising copy keywords and strategic statistics.',
            prompt: `Based on the brand and competitor ads, extract the top keywords used in creatives and summarize the core keyword strategy. CRITICALLY IMPORTANT: You must use the '[Brand Initial Key Copy & Communication Messages]' as the foundation. The Catchphrase you create here must be a direct enhancement or highly aligned version of the 'mainCopy' from the initial messages, not an entirely random new thought.\n${sharedPromptContext}`,
            schema: z.object({
                catchphrase: z.string().describe("마스터플랜을 관통하는 매우 매력적이고 압도적인 1줄 핵심 슬로건 카피 (탑 티어 카피라이터가 쓴 것처럼 세련되고 트렌디하며 직관적인 타격감이 있는 문장이어야 함. 기획 단계의 'Hero Copy'를 더욱 고도화하여 작성할 것)"),
                keywords: z.array(z.object({
                    word: z.string().describe("핵심 키워드 (예: '무자극', '할인', '비건')"),
                    weight: z.number().describe("중요도 비중 (10~100 사이의 수치)"),
                    type: z.enum(["blue", "red", "basic"]).describe("블루오션(전략적 차별화 추천), 레드오션(경쟁 치열/지양), 기본(카테고리 필수 소구점) 중 택1")
                })).length(30).describe("시장 분석을 기반으로 마케팅에 활용될 핵심 키워드를 최대한 많이(정확히 30개) 폭넓게 뽑고 각각의 상태(좋은것/나쁜것)를 분류해주세요."),
                keywordInsight: z.string().describe("블루오션 키워드를 어떻게 활용해야 하며, 레드오션 키워드를 왜 피해야 하는지에 대한 전략적 분석 요약")
            })
        });

        // 2. Media Channel Strategy
        const mediaCall = generateObject({
            model: google('gemini-2.5-flash'),
            system: 'You are a media planning expert. Allocate budget and channel strategy based on the target persona and category data.',
            prompt: `Recommend the optimal media channel mix (e.g. Meta, YouTube, Search, etc.) and deep targeting strategy for this brand.\n${sharedPromptContext}`,
            schema: z.object({
                channels: z.array(z.object({
                    name: z.string().describe("미디어 채널명 (예: 'Instagram 스폰서드', 'YouTube Shorts', '네이버 검색광고')"),
                    percentage: z.number().describe("예산 투여 비중 (총합 100%)"),
                    role: z.string().describe("해당 채널의 주요 역할 (예: '초기 인지도 확산 및 후킹')"),
                    targeting: z.string().describe("상세 타겟팅 기법 (예: '2030 뷰티 관심사 기반, 리타겟팅 등')")
                })).length(3).describe("가장 핵심적인 3가지 미디어 채널 믹스")
            })
        });

        // Extract valid media from competitor data to enrich the creative approaches context
        const validMediaUrls: { url: string, type: 'video' | 'image' }[] = [];
        if (payload.competitorData) {
            Object.values(payload.competitorData).forEach((comp: any) => {
                if (comp.ads && Array.isArray(comp.ads)) {
                    comp.ads.forEach((ad: any) => {
                        if (ad.mediaUrl && ad.mediaUrl !== 'No+Media') {
                            const isVid = ad.mediaUrl.includes('.mp4') || ad.mediaUrl.includes('.webm');
                            validMediaUrls.push({ url: ad.mediaUrl, type: isVid ? 'video' : 'image' });
                        }
                    });
                }
            });
        }

        // Ensure unique URLs
        const uniqueMediaMap = new Map<string, 'video' | 'image'>();
        validMediaUrls.forEach(m => uniqueMediaMap.set(m.url, m.type));
        const uniqueMedia = Array.from(uniqueMediaMap.entries()).map(([url, type]) => ({ url, type }));

        const topMedia = uniqueMedia.length > 0 ? uniqueMedia : [{ url: '', type: 'image' }, { url: '', type: 'image' }, { url: '', type: 'image' }];
        const mediaPromptCtx = `\nCRITICAL: You are providing exactly 3 approaches. The competitor references we have collected for these 3 approaches are as follows:` +
            `\n- Approach 1 Reference Type: ${topMedia[0]?.type || topMedia[0 % topMedia.length]?.type || 'image'}` +
            `\n- Approach 2 Reference Type: ${topMedia[1]?.type || topMedia[1 % topMedia.length]?.type || 'image'}` +
            `\n- Approach 3 Reference Type: ${topMedia[2]?.type || topMedia[2 % topMedia.length]?.type || 'image'}` +
            `\nYou MUST tailor the 'format' field for each approach to match its corresponding reference type (if it's 'video', suggest a Reels/TikTok video format. If it's 'image', suggest an Image Carousel or Static Image banner).`;

        // 3. Creative & Content Strategy
        const creativeCall = generateObject({
            model: google('gemini-2.5-flash'),
            system: 'You are an elite creative director. Propose compelling content formats and visual strategies to beat competitors.',
            prompt: `Develop specific content themes, ad formats, and an A/B test strategy based on the ad data and personas.\n${sharedPromptContext}${mediaPromptCtx}`,
            schema: z.object({
                approaches: z.array(z.object({
                    theme: z.string().describe("콘텐츠 테마명 (예: '성분 강조형', '가성비/프로모션형')"),
                    format: z.string().describe("추천 포맷 (예: '이미지 캐러셀', '15초 숏폼 비디오') *반드시 Reference Type과 일치해야함*"),
                    direction: z.string().describe("구체적인 시각적/카피라이팅 연출 방향"),
                    pinterestKeyword: z.string().describe("이 컨셉/무드를 시각적으로 찾기 좋은 영문 핀터레스트 검색어 (예: 'clean cosmetics aesthetic', 'foam cleanser texture')")
                })).length(3).describe("경쟁사를 이길 수 있는 3가지 주요 크리에이티브 어프로치"),
                abTest: z.string().describe("가장 추천하는 A/B 테스트 전략 시나리오 (예: 'A: 전문성 강조 vs B: 인플루언서 리뷰')")
            })
        });

        // 4. Action Masterplan
        const masterplanCall = generateObject({
            model: google('gemini-2.5-pro'),
            system: 'You are a master strategist. Create a phased execution roadmap using the provided context.',
            prompt: `Synthesize the data into a step-by-step master execution plan (phases) with expected outcomes.\n${sharedPromptContext}`,
            schema: z.object({
                masterplan: z.array(z.object({
                    phase: z.string().describe("작업 단계명 (예: 'Phase 1. 시장 침투 및 반응 테스트')"),
                    strategy: z.string().describe("구체적 실행 내용 및 전략 요약"),
                    expectedOutcome: z.string().describe("성공 시 기대되는 정량적/정성적 효과"),
                    pinterestKeyword: z.string().describe("해당 단계의 마케팅 무드, 타겟, 혹은 비주얼 전략을 보여주는 영문 핀터레스트 키워드 (예: 'campaign billboard aesthetic', 'instagram beauty feed')")
                })).length(3).describe("단기, 중기, 장기 (혹은 연속된 3단계) 로드맵")
            })
        });

        // 5. Strategic Differentiated Directions
        const strategyCall = generateObject({
            model: google('gemini-2.5-pro'),
            system: 'You are a top-tier brand strategist. Analyze competitors and find 3 DISTINCT, highly differentiated strategic pivot angles. Do not blindly copy competitor tactics (e.g. if they use character collabs, suggest an authentic product-focused route, or a different paradigm). Provide actionable diversification.',
            prompt: `Based on the competitor trends and persona data, develop 3 distinct strategic marketing directions that offer an alternative or superior approach to current market norms.\n${sharedPromptContext}`,
            schema: z.object({
                strategicDirections: z.array(z.object({
                    title: z.string().describe("차별화 전략명 (예: '본질 집중: 진정성 기반 성분 어필', '탈-캐릭터: 프로페셔널 더마 코스메틱 포지셔닝')"),
                    rationale: z.string().describe("왜 이 방향이 유효한지? (경쟁사의 흔한 패턴과 비교하여 요즘 소비 트렌드를 반영한 차별점)"),
                    coreUsp: z.string().describe("이 방향에서의 핵심 USP (Unique Selling Proposition)"),
                    coreTarget: z.string().describe("이 전략이 가장 강력하게 작용할 핵심 타겟 (페르소나 기반)"),
                    coreValue: z.string().describe("소비자에게 전달할 핵심 가치 (Core Value)")
                })).length(3).describe("경쟁사와 직관적으로 대비되는 3가지 다양한 관점의 시장 공략 방향")
            })
        });

        const [keywordRes, mediaRes, creativeRes, masterplanRes, strategyRes] = await Promise.all([
            keywordCall, mediaCall, creativeCall, masterplanCall, strategyCall
        ]);

        const mergedReport = {
            ...keywordRes.object,
            ...mediaRes.object,
            ...creativeRes.object,
            ...masterplanRes.object,
            ...strategyRes.object
        };

        if (mergedReport.approaches && Array.isArray(mergedReport.approaches)) {
            mergedReport.approaches.forEach((app: any, idx: number) => {
                const img = uniqueMedia[idx]?.url || uniqueMedia[idx % uniqueMedia.length]?.url;
                app.competitorMediaUrl = img || null;
            });
        }

        return { success: true, report: JSON.stringify(mergedReport) };
    } catch (error: any) {
        console.error("Failed to generate final summary:", error);
        return { success: false, error: error.message };
    }
}

export async function saveFinalStrategySummaryAction(brandKor: string, brandEng: string, summary: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error('Not authenticated');
        }

        const log = await (prisma as any).brandStrategySummary.create({
            data: {
                brandKor,
                brandEng,
                summary,
                userId: session.user.id,
            }
        });

        return { success: true, logId: log.id, createdAt: log.createdAt };
    } catch (e: any) {
        console.error('Failed to save strategy summary:', e);
        return { success: false, error: e.message };
    }
}

export async function getFinalStrategySummaryAction(brandKor: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error('Not authenticated');
        }

        const log = await (prisma as any).brandStrategySummary.findFirst({
            where: { brandKor, userId: session.user.id },
            orderBy: { createdAt: 'desc' },
        });

        if (!log) {
            return { success: true, summary: null };
        }

        return { success: true, summary: log.summary, createdAt: log.createdAt };
    } catch (e: any) {
        console.error('Failed to fetch strategy summary:', e);
        return { success: false, error: e.message };
    }
}
