import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { TeamCreateDialog } from '@/components/team-create-dialog';
import { TeamEditDialog } from '@/components/team-edit-dialog';
import { TeamDeleteDialog } from '@/components/team-delete-dialog';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default async function TeamsPage({
    searchParams,
}: {
    searchParams?: {
        query?: string;
        page?: string;
    };
}) {
    const session = await auth();
    if (session?.user.role !== 'MASTER') {
        return <div>Unauthorized</div>;
    }

    const params = await searchParams;
    const query = params?.query || '';
    const currentPage = Number(params?.page) || 1;
    const itemsPerPage = 10;

    const where = query
        ? {
            name: { contains: query },
        }
        : {};

    const totalItems = await prisma.team.count({ where });
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const teams = await prisma.team.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage,
        include: { members: true } // Include members to find current leader
    });

    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true }
    });

    return (
        <div className="min-h-screen bg-[#F9FAFB] font-sans">
            <div className="container mx-auto py-12 px-6 max-w-7xl space-y-10 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex items-end justify-between border-b border-[#F2F4F6] pb-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-[#191F28]">팀 관리</h1>
                        <p className="text-[17px] font-medium text-[#4E5968]">조직 내의 모든 팀을 조회하고 관리합니다.</p>
                    </div>
                    <Button variant="outline" className="rounded-2xl border-[#F2F4F6] text-[#4E5968] font-bold h-12 px-6 hover:bg-white transition-all shadow-sm" asChild>
                        <Link href="/dashboard">대시보드로 돌아가기</Link>
                    </Button>
                </div>

                <Card className="bg-white border-[#F2F4F6] rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 pb-4 gap-6">
                        <div className="space-y-4 w-full sm:w-auto">
                            <CardTitle className="text-xl font-bold text-[#191F28]">전체 팀 목록</CardTitle>
                            <form className="relative flex items-center w-full max-w-md group">
                                <div className="absolute left-4 text-[#8B95A1] group-focus-within:text-[#EE2924] transition-colors">
                                    <Search className="w-5 h-5" />
                                </div>
                                <Input
                                    name="query"
                                    placeholder="팀 이름 검색..."
                                    defaultValue={query}
                                    className="h-13 w-full bg-[#F9FAFB] border-[#F2F4F6] rounded-[18px] pl-12 pr-24 text-[15px] font-bold focus:bg-white focus:ring-4 focus:ring-[#EE2924]/5 transition-all"
                                />
                                <Button type="submit" className="absolute right-1.5 h-10 px-5 bg-[#EE2924] hover:bg-[#D11F1B] text-white rounded-[14px] font-bold text-[14px] transition-all shadow-sm">
                                    검색
                                </Button>
                            </form>
                        </div>
                        <TeamCreateDialog />
                    </CardHeader>
                    <CardContent className="p-0 mt-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#F9FAFB] border-y border-[#F2F4F6]">
                                        <th className="px-8 py-5 text-[14px] font-bold text-[#8B95A1] uppercase tracking-wider">팀 이름</th>
                                        <th className="px-8 py-5 text-[14px] font-bold text-[#8B95A1] uppercase tracking-wider">설명</th>
                                        <th className="px-8 py-5 text-[14px] font-bold text-[#8B95A1] uppercase tracking-wider">생성일</th>
                                        <th className="px-8 py-5 text-[14px] font-bold text-[#8B95A1] uppercase tracking-wider text-right">관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teams.map((team) => (
                                        <tr key={team.id} className="bg-white border-b border-[#F2F4F6] hover:bg-[#F9FAFB] transition-colors group">
                                            <td className="px-8 py-6">
                                                <Link href={`/dashboard/teams/${team.id}`} className="font-bold text-[16px] text-[#EE2924] hover:underline whitespace-nowrap">
                                                    {team.name}
                                                </Link>
                                            </td>
                                            <td className="px-8 py-6 text-[15px] font-medium text-[#4E5968] break-keep min-w-[200px]">
                                                {team.description || '팀 설명이 없습니다.'}
                                            </td>
                                            <td className="px-8 py-6 text-[14px] font-medium text-[#8B95A1] whitespace-nowrap">
                                                {team.createdAt.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <TeamEditDialog team={team} users={users} />
                                                    <TeamDeleteDialog teamId={team.id} teamName={team.name} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {teams.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center text-[#ABB3BB] font-medium text-[15px]">
                                                검색 결과와 일치하는 팀이 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center py-10 gap-3 border-t border-[#F2F4F6]">
                                <Button
                                    variant="outline"
                                    className="h-10 px-4 rounded-xl border-[#F2F4F6] bg-white text-[#4E5968] font-bold hover:bg-[#F9FAFB] disabled:opacity-30 disabled:bg-transparent transition-all gap-1"
                                    disabled={currentPage <= 1}
                                    asChild={currentPage > 1}
                                >
                                    {currentPage > 1 ? (
                                        <Link href={`/dashboard/teams?query=${query}&page=${currentPage - 1}`}>
                                            <ChevronLeft className="w-4 h-4" />
                                            이전
                                        </Link>
                                    ) : (
                                        <>
                                            <ChevronLeft className="w-4 h-4" />
                                            이전
                                        </>
                                    )}
                                </Button>
                                <span className="text-[14px] font-bold text-[#191F28] px-4 min-w-[100px] text-center">
                                    <span className="text-[#EE2924]">{currentPage}</span> <span className="text-[#ABB3BB] mx-1">/</span> {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    className="h-10 px-4 rounded-xl border-[#F2F4F6] bg-white text-[#4E5968] font-bold hover:bg-[#F9FAFB] disabled:opacity-30 disabled:bg-transparent transition-all gap-1"
                                    disabled={currentPage >= totalPages}
                                    asChild={currentPage < totalPages}
                                >
                                    {currentPage < totalPages ? (
                                        <Link href={`/dashboard/teams?query=${query}&page=${currentPage + 1}`}>
                                            다음
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    ) : (
                                        <>
                                            다음
                                            <ChevronRight className="w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
