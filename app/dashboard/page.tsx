import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamCreateDialog } from '@/components/team-create-dialog';
import { UserCreateDialog } from '@/components/user-create-dialog';
import { UserPasswordResetDialog } from '@/components/user-password-reset-dialog';
import prisma from '@/lib/prisma';

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Fetch current user to get fresh team info
    const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            team: {
                include: {
                    members: {
                        include: {
                            _count: {
                                select: { analyses: true }
                            }
                        }
                    }
                }
            }
        }
    });

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {session.user.role === 'MASTER' && (
                    <div className="col-span-full grid gap-6 md:grid-cols-2">
                        <Card className="bg-slate-50 border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>All Teams</CardTitle>
                                <TeamCreateDialog />
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 mb-4">
                                    {(await prisma.team.findMany({
                                        take: 10,
                                        orderBy: { createdAt: 'desc' },
                                        include: {
                                            members: {
                                                include: {
                                                    _count: {
                                                        select: { analyses: true }
                                                    }
                                                }
                                            }
                                        }
                                    })).map((team) => {
                                        const leader = team.members.find(m => m.role === 'TEAM_LEADER');
                                        const totalAnalyses = team.members.reduce((sum, member) => sum + member._count.analyses, 0);
                                        const memberCount = team.members.length;

                                        return (
                                            <li key={team.id} className="bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                                <Link href={`/dashboard/teams/${team.id}`} className="block p-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-semibold text-lg text-slate-900 group-hover:text-blue-600">{team.name}</div>
                                                            <div className="text-sm text-gray-500 mb-1">{team.description || 'No description provided.'}</div>
                                                        </div>
                                                        <div className="flex gap-3 text-xs font-medium">
                                                            <div className="bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100">
                                                                Members: {memberCount}
                                                            </div>
                                                            <div className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">
                                                                Histories: {totalAnalyses}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {leader && (
                                                        <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                                            <span className="font-semibold">Leader:</span> {leader.email}
                                                        </div>
                                                    )}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                                <Button className="w-full" variant="outline" asChild>
                                    <a href="/dashboard/teams">View All Teams</a>
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-50 border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Recent Users</CardTitle>
                                <UserCreateDialog teams={await prisma.team.findMany()} />
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 max-h-[400px] overflow-y-auto pr-2 mb-4">
                                    {(await prisma.user.findMany({ take: 10, include: { team: true }, orderBy: { createdAt: 'desc' } })).map((user) => (
                                        <li key={user.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.name || 'Unnamed'}</span>
                                                <span className="text-xs text-gray-400">{user.email}</span>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${user.role === 'MASTER' ? 'bg-purple-100 text-purple-700' :
                                                    user.role === 'TEAM_LEADER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>{user.role}</span>
                                                {user.team && <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100">{user.team.name}</span>}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <Button className="w-full" variant="outline" asChild>
                                    <a href="/dashboard/users">View All Users</a>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {session.user.role === 'TEAM_LEADER' && currentUser?.team && (
                    <div className="col-span-full">
                        <Card className="bg-slate-50 border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>My Team: {currentUser.team.name}</CardTitle>
                                <UserCreateDialog
                                    teams={[currentUser.team]}
                                    fixedTeamId={currentUser.team.id}
                                    fixedRole="TEAM_MEMBER"
                                />
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-500 mb-6">{currentUser.team.description}</p>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm text-center">
                                        <div className="text-2xl font-bold text-slate-800">
                                            {currentUser.team.members.length}
                                        </div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-1">
                                            Team Members
                                        </div>
                                    </div>
                                    <Link href="/main/history" className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow group block">
                                        <div className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                            {currentUser.team.members.reduce((sum, m) => sum + m._count.analyses, 0)}
                                        </div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-1 group-hover:text-blue-600 transition-colors">
                                            Total Histories
                                        </div>
                                    </Link>
                                </div>

                                <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">Team Leader</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="font-medium text-sm text-blue-900">{currentUser.name || 'Admin'}</div>
                                        <div className="text-xs text-blue-600">({currentUser.email})</div>
                                    </div>
                                </div>
                                <h3 className="font-semibold mb-2">Team Members</h3>
                                <ul className="space-y-2 mb-4">
                                    {currentUser.team.members.filter(m => m.id !== currentUser.id).length === 0 ? (
                                        <li className="text-gray-500 text-sm">No other members yet.</li>
                                    ) : (
                                        currentUser.team.members.filter(m => m.id !== currentUser.id).map((member) => (
                                            <li key={member.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{member.name || 'Unnamed'}</span>
                                                    <span className="text-xs text-gray-400">{member.email}</span>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{member.role}</span>
                                                        <UserPasswordResetDialog userId={member.id} userName={member.name || 'User'} />
                                                    </div>
                                                </div>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {session.user.role === 'TEAM_LEADER' && !currentUser?.team && (
                    <div className="col-span-full">
                        <Card>
                            <CardHeader>
                                <CardTitle>No Team Assigned</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-500">You are not currently assigned to any team. Please contact the administrator.</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

            </div>
        </div>
    );
}
