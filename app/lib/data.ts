import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function fetchBrandAnalyses(
    filters?: { brand?: string; userName?: string; teamName?: string },
    page: number = 1,
    limit: number = 10
) {
    try {
        const session = await auth();
        if (!session?.user) return { data: [], totalCount: 0, totalPages: 0 };

        const role = session.user.role;
        const userId = session.user.id;
        const teamId = session.user.teamId;
        const skip = (page - 1) * limit;

        const where: any = {};

        // 1. Role-based Base Constraints
        if (role === 'MASTER') {
            // No base constraint
        } else if (role === 'TEAM_LEADER') {
            where.user = { teamId };
        } else {
            where.userId = userId;
        }

        // 2. Search Filters
        if (filters?.brand) {
            where.brand = { contains: filters.brand };
        }

        if (filters?.userName) {
            where.user = {
                ...where.user,
                name: { contains: filters.userName }
            };
        }

        if (filters?.teamName) {
            if (role === 'MASTER') {
                where.user = {
                    ...where.user,
                    team: { name: { contains: filters.teamName } }
                };
            }
        }

        // Get total count for pagination
        const totalCount = await prisma.brandAnalysis.count({ where });
        const totalPages = Math.ceil(totalCount / limit);

        const data = await prisma.brandAnalysis.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        team: { select: { name: true } }
                    }
                }
            }
        });

        return { data, totalCount, totalPages };
    } catch (error) {
        console.error('Failed to fetch brand analyses:', error);
        throw new Error('Failed to fetch brand analyses.');
    }
}

export async function fetchTeams() {
    try {
        const session = await auth();
        if (!session?.user) return [];

        // Ideally, restrict this based on role? 
        // For now, let's allow fetching list of teams for filter purpose.
        // A standard user (TEAM_MEMBER) might only need to see their own team, 
        // but if the UI is smart, it might pre-select/disable the dropdown for them.

        return await prisma.team.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true }
        });
    } catch (error) {
        console.error('Failed to fetch teams:', error);
        return [];
    }
}
