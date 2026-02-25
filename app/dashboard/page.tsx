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
        <div className="min-h-screen bg-[#F9FAFB] font-sans">
            <div className="container mx-auto py-12 px-6 max-w-7xl space-y-10 animate-in fade-in duration-700">
                {/* Dashboard Header */}
                <div className="flex items-end justify-between border-b border-[#F2F4F6] pb-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-[#191F28]">관리자 대시보드</h1>
                        <p className="text-[17px] font-medium text-[#4E5968]">사용자, 팀 및 전체 분석 현황을 관리합니다.</p>
                    </div>
                </div>

                <div className="grid gap-8 items-start">
                    {session.user.role === 'MASTER' && (
                        <div className="grid gap-8 md:grid-cols-2">
                            {/* All Teams Card */}
                            <Card className="bg-white border-[#F2F4F6] rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
                                    <CardTitle className="text-xl font-bold text-[#191F28]">전체 팀 관리</CardTitle>
                                    <TeamCreateDialog />
                                </CardHeader>
                                <CardContent className="p-8 pt-0">
                                    <ul className="space-y-3 mb-6">
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
                                                <li key={team.id} className="bg-[#F9FAFB] rounded-2xl border border-[#F2F4F6] hover:border-[#EE2924]/20 transition-all group">
                                                    <Link href={`/dashboard/teams/${team.id}`} className="block p-5">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div>
                                                                <div className="font-bold text-[17px] text-[#191F28] group-hover:text-[#EE2924] transition-colors">{team.name}</div>
                                                                <div className="text-[14px] font-medium text-[#8B95A1] mt-1 break-keep line-clamp-1">{team.description || '팀 설명이 없습니다.'}</div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <span className="bg-white text-[#4E5968] text-[12px] font-bold px-3 py-1.5 rounded-lg border border-[#F2F4F6]">
                                                                    멤버 {memberCount}
                                                                </span>
                                                                <span className="bg-[#EE2924]/5 text-[#EE2924] text-[12px] font-bold px-3 py-1.5 rounded-lg border border-[#EE2924]/10">
                                                                    기록 {totalAnalyses}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {leader && (
                                                            <div className="text-[13px] text-[#4E5968] font-medium flex items-center gap-2 mt-2 pt-2 border-t border-[#F2F4F6]">
                                                                <span className="text-[#8B95A1] font-bold">리더:</span> {leader.name || leader.email}
                                                            </div>
                                                        )}
                                                    </Link>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                    <Button className="w-full h-14 bg-[#F2F4F6] text-[#4E5968] hover:bg-[#E5E8EB] rounded-2xl font-bold text-[15px] border-none shadow-none transition-all" variant="outline" asChild>
                                        <a href="/dashboard/teams">모든 팀 보기</a>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Recent Users Card */}
                            <Card className="bg-white border-[#F2F4F6] rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
                                    <CardTitle className="text-xl font-bold text-[#191F28]">최근 가입 사용자</CardTitle>
                                    <UserCreateDialog teams={await prisma.team.findMany()} />
                                </CardHeader>
                                <CardContent className="p-8 pt-0">
                                    <ul className="space-y-3 max-h-[480px] overflow-y-auto pr-2 mb-6 scrollbar-thin scrollbar-thumb-[#F2F4F6]">
                                        {(await prisma.user.findMany({ take: 10, include: { team: true }, orderBy: { createdAt: 'desc' } })).map((user) => (
                                            <li key={user.id} className="flex justify-between items-center p-5 bg-[#F9FAFB] rounded-2xl border border-[#F2F4F6]">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-[16px] text-[#191F28]">{user.name || '이름 없음'}</span>
                                                    <span className="text-[13px] font-medium text-[#8B95A1]">{user.email}</span>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`text-[11px] px-2.5 py-1 rounded-lg font-bold ${user.role === 'MASTER' ? 'bg-[#EE2924]/10 text-[#EE2924]' :
                                                        user.role === 'TEAM_LEADER' ? 'bg-purple-50 text-purple-600' : 'bg-white text-[#4E5968] border border-[#F2F4F6]'
                                                        }`}>{user.role}</span>
                                                    {user.team && <span className="text-[11px] bg-white text-[#4E5968] px-2.5 py-1 rounded-lg border border-[#F2F4F6] font-bold">{user.team.name}</span>}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button className="w-full h-14 bg-[#F2F4F6] text-[#4E5968] hover:bg-[#E5E8EB] rounded-2xl font-bold text-[15px] border-none shadow-none transition-all" variant="outline" asChild>
                                        <a href="/dashboard/users">모든 사용자 보기</a>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {session.user.role === 'TEAM_LEADER' && currentUser?.team && (
                        <div className="grid gap-8">
                            <Card className="bg-white border-[#F2F4F6] rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between p-10 pb-6 border-b border-[#F2F4F6]">
                                    <div className="space-y-2">
                                        <div className="text-[14px] font-bold text-[#EE2924] uppercase tracking-wider">나의 팀</div>
                                        <CardTitle className="text-[28px] font-bold text-[#191F28]">{currentUser.team.name}</CardTitle>
                                        <p className="text-[16px] font-medium text-[#4E5968] mt-2">{currentUser.team.description || '팀 설명이 없습니다.'}</p>
                                    </div>
                                    <UserCreateDialog
                                        teams={[currentUser.team]}
                                        fixedTeamId={currentUser.team.id}
                                        fixedRole="TEAM_MEMBER"
                                    />
                                </CardHeader>
                                <CardContent className="p-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                        <div className="bg-[#F9FAFB] p-8 rounded-3xl border border-[#F2F4F6] text-center space-y-2">
                                            <div className="text-3xl font-extrabold text-[#191F28]">
                                                {currentUser.team.members.length}
                                            </div>
                                            <div className="text-[13px] text-[#8B95A1] font-bold uppercase tracking-wider">
                                                팀 멤버 수
                                            </div>
                                        </div>
                                        <Link href="/main/history" className="bg-[#F9FAFB] p-8 rounded-3xl border border-[#F2F4F6] text-center space-y-2 hover:border-[#EE2924]/30 hover:bg-white transition-all group">
                                            <div className="text-3xl font-extrabold text-[#191F28] group-hover:text-[#EE2924] transition-colors">
                                                {currentUser.team.members.reduce((sum, m) => sum + m._count.analyses, 0)}
                                            </div>
                                            <div className="text-[13px] text-[#8B95A1] font-bold uppercase tracking-wider group-hover:text-[#EE2924] transition-colors">
                                                전체 분석 기록
                                            </div>
                                        </Link>
                                    </div>

                                    <div className="mb-10 p-6 bg-[#EE2924]/5 rounded-2xl border border-[#EE2924]/10 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-[#EE2924]/20">
                                                <span className="text-[#EE2924] font-bold text-lg">L</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[12px] font-bold text-[#EE2924] uppercase tracking-wide">팀 리더</span>
                                                <div className="font-bold text-[16px] text-[#191F28]">{currentUser.name || '관리자'} <span className="text-[#8B95A1] font-medium ml-1">({currentUser.email})</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-[#191F28] mb-5">팀 멤버 현황</h3>
                                    <ul className="space-y-3">
                                        {currentUser.team.members.filter(m => m.id !== currentUser.id).length === 0 ? (
                                            <li className="text-[#8B95A1] text-sm font-medium py-10 text-center bg-[#F9FAFB] rounded-2xl border border-[#F2F4F6] border-dashed">아직 다른 팀 멤버가 없습니다.</li>
                                        ) : (
                                            currentUser.team.members.filter(m => m.id !== currentUser.id).map((member) => (
                                                <li key={member.id} className="flex justify-between items-center p-5 bg-[#F9FAFB] rounded-2xl border border-[#F2F4F6] hover:bg-white transition-all group">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-bold text-[16px] text-[#191F28]">{member.name || '이름 없음'}</span>
                                                        <span className="text-[13px] font-medium text-[#8B95A1]">{member.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[11px] bg-white text-[#4E5968] px-2.5 py-1 rounded-lg border border-[#F2F4F6] font-bold">{member.role}</span>
                                                        <UserPasswordResetDialog userId={member.id} userName={member.name || '사용자'} />
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
                        <div className="grid">
                            <Card className="bg-white border-[#F2F4F6] rounded-[32px] p-12 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                                <CardHeader className="space-y-4">
                                    <div className="w-20 h-20 bg-[#F2F4F6] rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CardTitle className="text-4xl text-[#8B95A1]">?</CardTitle>
                                    </div>
                                    <CardTitle className="text-2xl font-bold text-[#191F28]">배정된 팀이 없습니다</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-[16px] font-medium text-[#4E5968] max-w-sm mx-auto leading-relaxed">
                                        현재 배정된 팀이 확인되지 않습니다. 관리자에게 문의하여 팀 배정을 진행해주세요.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
