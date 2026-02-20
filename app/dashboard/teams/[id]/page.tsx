import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamEditDialog } from '@/components/team-edit-dialog';
import { TeamDeleteDialog } from '@/components/team-delete-dialog';
import { TeamAddMemberDialog } from '@/components/team-add-member-dialog';
import { TeamRemoveMemberDialog } from '@/components/team-remove-member-dialog';
import { TeamAssignLeaderDialog } from '@/components/team-assign-leader-dialog';
import Link from 'next/link';
import { UserPasswordResetDialog } from '@/components/user-password-reset-dialog';

export default async function TeamDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    if (!session?.user) {
        return <div>Unauthorized</div>;
    }

    const { id } = await params;

    // Check permissions
    if (session.user.role !== 'MASTER') {
        // If not MASTER, must be TEAM_LEADER of this specific team
        if (session.user.role !== 'TEAM_LEADER') {
            return <div>Unauthorized</div>;
        }

        // We need to verify if the user is the leader of THIS team
        // We can do this by fetching the user or relying on session if we trust it (better to fetch)
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { teamId: true }
        });

        if (currentUser?.teamId !== id) {
            return <div>Unauthorized</div>;
        }
    }

    const team = await prisma.team.findUnique({
        where: { id },
        include: {
            members: {
                include: {
                    analyses: {
                        orderBy: { createdAt: 'desc' }
                    }
                }
            }
        },
    });

    if (!team) {
        return <div>Team not found</div>;
    }

    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, teamId: true }
    });

    const leader = team.members.find(m => m.role === 'TEAM_LEADER');

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{team.name}</h1>
                <Button variant="outline" asChild>
                    <Link href="/dashboard/teams">Back to Teams</Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Team Information</CardTitle>
                        <div className="flex gap-2">
                            <TeamEditDialog team={team} users={users} />
                            <TeamDeleteDialog teamId={team.id} teamName={team.name} />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="font-semibold mb-1">Description</div>
                            <div className="text-sm text-gray-500">{team.description || 'No description provided.'}</div>
                        </div>
                        <div>
                            <div className="font-semibold mb-1">Created At</div>
                            <div className="text-sm text-gray-500">{team.createdAt.toLocaleDateString()}</div>
                        </div>
                        <div>
                            <div className="font-semibold mb-1">Team Leader</div>
                            {leader ? (
                                <div className="flex items-center gap-2">
                                    <div className="font-medium">{leader.name}</div>
                                    <div className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">TEAM_LEADER</div>
                                    <TeamRemoveMemberDialog userId={leader.id} teamId={team.id} userName={leader.name || 'Leader'} />
                                </div>
                            ) : (
                                <TeamAssignLeaderDialog teamId={team.id} users={users.filter(u => u.teamId === team.id || !u.teamId)} />
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Team Members ({team.members.filter(m => m.role !== 'TEAM_LEADER').length})</CardTitle>
                        <TeamAddMemberDialog teamId={team.id} users={users.filter(u => u.teamId !== team.id && u.role !== 'MASTER')} />
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {team.members.filter(m => m.role !== 'TEAM_LEADER').map((member) => (
                                <li key={member.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                    <div>
                                        <div className="font-medium text-sm">{member.name}</div>
                                        <div className="text-xs text-gray-400">{member.email}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                            {member.role}
                                        </div>
                                        <UserPasswordResetDialog userId={member.id} userName={member.name || 'User'} />
                                        <TeamRemoveMemberDialog userId={member.id} teamId={team.id} userName={member.name || 'Unnamed'} />
                                    </div>
                                </li>
                            ))}
                            {team.members.filter(m => m.role !== 'TEAM_LEADER').length === 0 && (
                                <div className="text-sm text-gray-500 text-center py-4">No members in this team.</div>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Team Analysis History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700 uppercase">
                                    <tr>
                                        <th className="px-6 py-3">Brand</th>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3">Author</th>
                                        <th className="px-6 py-3">Created At</th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {team.members.flatMap(m => m.analyses.map(a => ({ ...a, authorName: m.name }))).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((analysis) => (
                                        <tr key={analysis.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{analysis.brandKor || analysis.brand}</td>
                                            <td className="px-6 py-4">{analysis.category}</td>
                                            <td className="px-6 py-4">{analysis.authorName}</td>
                                            <td className="px-6 py-4">{new Date(analysis.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/main/analysis?id=${analysis.id}`}>View</Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {team.members.every(m => m.analyses.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No analysis history found for this team.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
