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
        <div className="min-h-screen bg-[#F9FAFB] font-sans">
            <div className="w-full py-12 px-6 space-y-10 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex items-end justify-between border-b border-[#F2F4F6] pb-8">
                    <div className="space-y-2">
                        <div className="text-[14px] font-bold text-[#3182F6] uppercase tracking-wider mb-1">팀 상세 정보</div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#191F28]">{team.name}</h1>
                    </div>
                    <Button variant="outline" className="rounded-2xl border-[#F2F4F6] text-[#4E5968] font-bold h-12 px-6 hover:bg-white transition-all shadow-sm" asChild>
                        <Link href="/dashboard/teams">팀 목록으로 돌아가기</Link>
                    </Button>
                </div>

                <div className="grid gap-8 md:grid-cols-2 items-start">
                    {/* Team Info Card */}
                    <Card className="bg-white border-[#F2F4F6] rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
                            <CardTitle className="text-xl font-bold text-[#191F28]">팀 정보</CardTitle>
                            <div className="flex gap-2">
                                <TeamEditDialog team={team} users={users} />
                                <TeamDeleteDialog teamId={team.id} teamName={team.name} />
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-8">
                            <div className="space-y-3">
                                <div className="text-[14px] font-bold text-[#8B95A1] uppercase tracking-wide">팀 설명</div>
                                <div className="text-[16px] font-medium text-[#4E5968] leading-relaxed break-keep">
                                    {team.description || '팀 설명이 없습니다.'}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="text-[13px] font-bold text-[#8B95A1] uppercase tracking-wide">생성일</div>
                                    <div className="text-[15px] font-semibold text-[#191F28]">
                                        {team.createdAt.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-[13px] font-bold text-[#8B95A1] uppercase tracking-wide">전체 분석 기록</div>
                                    <div className="text-[15px] font-bold text-[#3182F6]">
                                        {team.members.reduce((sum, m) => sum + m.analyses.length, 0)}건
                                    </div>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-[#F2F4F6] space-y-4">
                                <div className="text-[14px] font-bold text-[#8B95A1] uppercase tracking-wide">팀 리더</div>
                                {leader ? (
                                    <div className="flex items-center justify-between bg-[#F9FAFB] p-5 rounded-2xl border border-[#F2F4F6]">
                                        <div className="flex flex-col gap-1">
                                            <div className="font-bold text-[16px] text-[#191F28]">{leader.name}</div>
                                            <div className="text-[13px] font-medium text-[#8B95A1]">{leader.email}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] bg-[#3182F6]/10 text-[#3182F6] px-2.5 py-1 rounded-lg font-bold">LEADER</span>
                                            <TeamRemoveMemberDialog userId={leader.id} teamId={team.id} userName={leader.name || '리더'} />
                                        </div>
                                    </div>
                                ) : (
                                    <TeamAssignLeaderDialog teamId={team.id} users={users.filter(u => u.teamId === team.id || !u.teamId)} />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Team Members Card */}
                    <Card className="bg-white border-[#F2F4F6] rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
                            <CardTitle className="text-xl font-bold text-[#191F28]">
                                팀 멤버 <span className="text-[#3182F6] ml-1">{team.members.filter(m => m.role !== 'TEAM_LEADER').length}</span>
                            </CardTitle>
                            <TeamAddMemberDialog teamId={team.id} users={users.filter(u => u.teamId !== team.id && u.role !== 'MASTER')} />
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                            <ul className="space-y-3">
                                {team.members.filter(m => m.role !== 'TEAM_LEADER').map((member) => (
                                    <li key={member.id} className="flex justify-between items-center bg-[#F9FAFB] p-5 rounded-2xl border border-[#F2F4F6] hover:bg-white transition-all group">
                                        <div className="flex flex-col gap-1">
                                            <div className="font-bold text-[16px] text-[#191F28]">{member.name}</div>
                                            <div className="text-[13px] font-medium text-[#8B95A1]">{member.email}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] bg-white text-[#4E5968] px-2.5 py-1 rounded-lg border border-[#F2F4F6] font-bold">{member.role}</span>
                                            <UserPasswordResetDialog userId={member.id} userName={member.name || '사용자'} />
                                            <TeamRemoveMemberDialog userId={member.id} teamId={team.id} userName={member.name || '사용자'} />
                                        </div>
                                    </li>
                                ))}
                                {team.members.filter(m => m.role !== 'TEAM_LEADER').length === 0 && (
                                    <div className="text-[15px] font-medium text-[#ABB3BB] text-center py-12 bg-[#F9FAFB] rounded-2xl border border-[#F2F4F6] border-dashed">
                                        이 팀에 등록된 멤버가 없습니다.
                                    </div>
                                )}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Analysis History */}
                <Card className="bg-white border-[#F2F4F6] rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden mt-8">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-xl font-bold text-[#191F28]">팀 브랜드 분석 히스토리</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#F9FAFB] border-y border-[#F2F4F6]">
                                        <th className="px-8 py-5 text-[14px] font-bold text-[#8B95A1] uppercase tracking-wider">브랜드</th>
                                        <th className="px-8 py-5 text-[14px] font-bold text-[#8B95A1] uppercase tracking-wider">카테고리</th>
                                        <th className="px-8 py-5 text-[14px] font-bold text-[#8B95A1] uppercase tracking-wider">작성자</th>
                                        <th className="px-8 py-5 text-[14px] font-bold text-[#8B95A1] uppercase tracking-wider">분석일</th>
                                        <th className="px-8 py-5 text-[14px] font-bold text-[#8B95A1] uppercase tracking-wider text-right">상세보기</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {team.members.flatMap(m => m.analyses.map(a => ({ ...a, authorName: m.name }))).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((analysis) => (
                                        <tr key={analysis.id} className="bg-white border-b border-[#F2F4F6] hover:bg-[#F9FAFB] transition-colors group">
                                            <td className="px-8 py-6 font-bold text-[16px] text-[#191F28]">
                                                {analysis.brandKor || analysis.brandEng}
                                            </td>
                                            <td className="px-8 py-6 text-[15px] font-medium text-[#4E5968]">
                                                {analysis.category}
                                            </td>
                                            <td className="px-8 py-6 text-[15px] font-medium text-[#4E5968]">
                                                {analysis.authorName}
                                            </td>
                                            <td className="px-8 py-6 text-[14px] font-medium text-[#8B95A1]">
                                                {new Date(analysis.createdAt).toLocaleDateString('ko-KR')}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Button variant="ghost" className="h-10 px-4 rounded-xl text-[#3182F6] font-bold hover:bg-[#3182F6]/5 transition-all" asChild>
                                                    <Link href={`/main/analysis?id=${analysis.id}`}>상세보기</Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {team.members.every(m => m.analyses.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center text-[#ABB3BB] font-medium text-[15px]">
                                                팀 내에 생성된 분석 히스토리가 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
