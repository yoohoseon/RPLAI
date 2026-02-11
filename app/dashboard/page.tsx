import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamCreateDialog } from '@/components/team-create-dialog';
import { UserCreateDialog } from '@/components/user-create-dialog';
import prisma from '@/lib/prisma';

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        return <div>Not authenticated</div>;
    }

    // Fetch current user to get fresh team info
    const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { team: { include: { members: true } } }
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
                                    {(await prisma.team.findMany({ take: 10, orderBy: { createdAt: 'desc' } })).map((team) => (
                                        <li key={team.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                                            <div>
                                                <div className="font-semibold">{team.name}</div>
                                                <div className="text-sm text-gray-500">{team.description}</div>
                                            </div>
                                        </li>
                                    ))}
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
                                <p className="text-gray-500 mb-4">{currentUser.team.description}</p>
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
                                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{member.role}</span>
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
