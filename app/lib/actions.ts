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
                brand,
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
    return await generateStagePersonas(stage, brandContext);
}

export async function getCompetitorAdsAction(brandContext: any) {
    try {
        const brandName = brandContext?.brandKor || brandContext?.brandEng || '테스트 브랜드';
        const brandCategory = brandContext?.category || '일반';

        // 1. Find competitors via AI
        const { object } = await generateObject({
            model: google('gemini-2.5-flash'),
            system: 'You are an expert digital marketer. Identify top 5 primary real-world competitors for the given brand. Return their names in Korean where appropriate.',
            prompt: `Brand: ${brandName}\nCategory: ${brandCategory}\nWhat are the top 5 competitors?`,
            schema: z.object({
                competitors: z.array(z.string()).max(5)
            })
        });

        // Save competitors to DB asynchronously
        if (brandName && brandName !== '테스트 브랜드') {
            try {
                const latestBrandData = await prisma.brandDatas.findFirst({
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

                    await prisma.brandDatas.update({
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
        // 1. Fetch real ads from Meta Ads API
        const token = "EAAXMCWaR9w4BQ90ECXJ6MrJtOZBdxcyCLnJuCRr3ClBovW8lz83YudcrBAMiojcCyhFsNMbZBOwGzEN536VVvLKpZB3fDPNwzkxhwafofJM30Rb7ZBrYS4jjTGQBBZAJjWOZBp2NyGAxhAl0PL8lBGQEa47uXSpuvXJWqsEdxNuGcJndsPkXHQa8rzbrJ9xJZClfP9J0NUVnQC01Cfw";
        const fields = "id,page_id,page_name,ad_creative_bodies,ad_creative_link_captions,ad_creation_time,ad_delivery_start_time,ad_snapshot_url";
        const afterParam = afterCursor ? `&after=${afterCursor}` : "";
        const url = `https://graph.facebook.com/v19.0/ads_archive?access_token=${token}&search_terms=${encodeURIComponent(searchTerms)}&ad_type=ALL&ad_reached_countries=['KR']&fields=${fields}&limit=12${afterParam}`;

        const response = await fetch(url);
        const data = await response.json();

        let realAds = data.data || [];
        const nextCursor = data.paging?.cursors?.after || null;

        if (data.error || realAds.length === 0) {
            console.warn("[Meta Ads Warning/Error] Falling back to AI mock. Message:", data.error?.message);
            const { object } = await generateObject({
                model: google('gemini-2.5-flash'),
                system: 'You are an expert digital performance marketer. Simulate the Meta Ads Library by providing realistic, current-sounding digital ad creatives actually used (or highly likely to be used) by the requested brand. Ensure absolute natural Korean phrasing.',
                prompt: `Generate 12 realistic Meta/Instagram/Google ad creatives for the brand: ${searchTerms}.`,
                schema: z.object({
                    ads: z.array(z.object({
                        type1: z.enum(['프로모션', '리뷰/UGC', '일반형']),
                        type2: z.string(),
                        copy: z.string(),
                        platform: z.string(),
                        targetGroup: z.string(),
                        days: z.number().min(0).max(100)
                    })).length(12)
                })
            });
            const fallbackAds = object.ads.map((ad, idx) => ({
                id: idx + 1,
                ...ad,
                spend: 'N/A',
                startDate: new Date(Date.now() - ad.days * 86400000).toISOString().split('T')[0],
                endDate: '-',
                link: `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=KR&q=${encodeURIComponent(searchTerms)}`
            }));
            return { ads: fallbackAds, nextCursor: null };
        }

        // We have real ads! Let's slice if needed and feed to AI for categorization (limit API calls)
        realAds = realAds.slice(0, 12);

        const adsForAi = realAds.map((ad: any, index: number) => ({
            index,
            copy: ad.ad_creative_bodies?.[0] || '이미지/영상 소재',
        }));

        const { object } = await generateObject({
            model: google('gemini-2.5-flash'),
            system: 'Categorize the following real ad copies into specific marketing tags.',
            prompt: `Categorize these ${adsForAi.length} ads. 
Ads data: ${JSON.stringify(adsForAi)}`,
            schema: z.object({
                categorized: z.array(z.object({
                    index: z.number(),
                    type1: z.enum(['프로모션', '리뷰/UGC', '일반형']),
                    type2: z.string().describe('Detailed type (e.g., 이미지, 숏폼 비디오, 캐러셀)'),
                    targetGroup: z.string().describe('Likely target audience (e.g., 2030 여성, 피부 민감러)')
                }))
            })
        });

        const categorizationMap = new Map(object.categorized.map(c => [c.index, c]));

        const finalAds = realAds.map((ad: any, index: number) => {
            const cat = categorizationMap.get(index) || { type1: '일반형', type2: '이미지', targetGroup: '불특정 다수' };
            const startTime = ad.ad_delivery_start_time ? new Date(ad.ad_delivery_start_time) : new Date();
            const daysActive = Math.floor((Date.now() - startTime.getTime()) / (1000 * 3600 * 24));

            return {
                id: ad.id || index + 1,
                type1: cat.type1,
                type2: cat.type2,
                copy: ad.ad_creative_bodies?.[0]?.substring(0, 150) + (ad.ad_creative_bodies?.[0]?.length > 150 ? '...' : '') || '이미지/영상 소재',
                platform: 'Meta',
                targetGroup: cat.targetGroup,
                days: Math.max(0, daysActive),
                link: ad.ad_snapshot_url || '#',
                spend: 'N/A',
                startDate: startTime.toISOString().split('T')[0],
                endDate: '-'
            };
        });

        return { ads: finalAds, nextCursor };

    } catch (error) {
        console.error("Failed to fetch specific ads:", error);
        return { ads: [], nextCursor: null };
    }
}
