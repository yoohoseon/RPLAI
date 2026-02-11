'use server';

import { signIn, auth } from '@/auth';
import prisma from '@/lib/prisma';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';

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
