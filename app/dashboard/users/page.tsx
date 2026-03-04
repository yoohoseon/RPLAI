import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { UserCreateDialog } from '@/components/user-create-dialog';
import { UserEditDialog } from '@/components/user-edit-dialog';
import { UserDeleteDialog } from '@/components/user-delete-dialog';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default async function UsersPage({
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

    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;
    const itemsPerPage = 10;

    const where = query
        ? {
            OR: [
                { name: { contains: query } },
                { email: { contains: query } },
            ],
        }
        : {};

    const totalItems = await prisma.user.count({ where });
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const users = await prisma.user.findMany({
        where,
        include: { team: true },
        orderBy: { createdAt: 'desc' },
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage,
    });

    const teams = await prisma.team.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="min-h-screen bg-[#F9FAFB] font-sans">
            <div className="w-full py-12 px-6 space-y-10 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex items-end justify-between border-b border-[#F2F4F6] pb-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-[#191F28]">사용자 관리</h1>
                        <p className="text-[17px] font-medium text-[#4E5968]">시스템을 이용하는 사용자들의 권한과 팀을 관리합니다.</p>
                    </div>
                    <Button variant="outline" className="rounded-2xl border-[#F2F4F6] text-[#4E5968] font-bold h-12 px-6 hover:bg-white transition-all shadow-sm" asChild>
                        <Link href="/dashboard">대시보드로 돌아가기</Link>
                    </Button>
                </div>

                <Card className="bg-white border-[#F2F4F6] rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 pb-4 gap-6">
                        <div className="space-y-4 w-full sm:w-auto">
                            <CardTitle className="text-xl font-bold text-[#191F28]">전체 사용자 목록</CardTitle>
                            <form className="relative flex items-center w-full max-w-md group">
                                <div className="absolute left-4 text-[#8B95A1] group-focus-within:text-[#3182F6] transition-colors">
                                    <Search className="w-5 h-5" />
                                </div>
                                <Input
                                    name="query"
                                    placeholder="이름 또는 이메일 검색..."
                                    defaultValue={query}
                                    className="h-13 w-full bg-[#F9FAFB] border-[#F2F4F6] rounded-[18px] pl-12 pr-24 text-[15px] font-bold focus:bg-white focus:ring-4 focus:ring-[#3182F6]/5 transition-all"
                                />
                                <Button type="submit" className="absolute right-1.5 h-10 px-5 bg-[#3182F6] hover:bg-[#1B64DA] text-white rounded-[14px] font-bold text-[14px] transition-all shadow-sm">
                                    검색
                                </Button>
                            </form>
                        </div>
                        <UserCreateDialog teams={teams} />
                    </CardHeader>
                    <CardContent className="p-0 mt-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#F9FAFB] border-y border-[#F2F4F6]">
                                        <th className="px-8 py-5 text-[14px] font-bold text-[#8B95A1] uppercase tracking-wider">사용자</th>
                                        <th className="px-8 py-5 text-[14px] font-bold text-[#8B95A1] uppercase tracking-wider">이메일</th>
                                        <th className="px-8 py-5 text-[14px] font-bold text-[#8B95A1] uppercase tracking-wider">권한</th>
                                        <th className="px-8 py-5 text-[14px] font-bold text-[#8B95A1] uppercase tracking-wider">소속 팀</th>
                                        <th className="px-8 py-5 text-[14px] font-bold text-[#8B95A1] uppercase tracking-wider text-right">관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="bg-white border-b border-[#F2F4F6] hover:bg-[#F9FAFB] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-[16px] text-[#191F28]">{user.name || '이름 없음'}</div>
                                            </td>
                                            <td className="px-8 py-6 text-[15px] font-medium text-[#4E5968]">{user.email}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${user.role === 'MASTER' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                                                    user.role === 'TEAM_LEADER' ? 'bg-[#3182F6]/5 text-[#3182F6] border border-[#3182F6]/10' : 'bg-white text-[#8B95A1] border border-[#F2F4F6]'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-[15px] font-bold text-[#4E5968]">
                                                {user.team?.name ? (
                                                    <span className="text-[#3182F6]">{user.team.name}</span>
                                                ) : (
                                                    <span className="text-[#ABB3BB] font-medium">-</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <UserEditDialog user={user} teams={teams} />
                                                    <UserDeleteDialog userId={user.id} userName={user.name || user.email || ''} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center text-[#ABB3BB] font-medium text-[15px]">
                                                일치하는 사용자를 찾을 수 없습니다.
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
                                        <Link href={`/dashboard/users?query=${query}&page=${currentPage - 1}`}>
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
                                    <span className="text-[#3182F6]">{currentPage}</span> <span className="text-[#ABB3BB] mx-1">/</span> {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    className="h-10 px-4 rounded-xl border-[#F2F4F6] bg-white text-[#4E5968] font-bold hover:bg-[#F9FAFB] disabled:opacity-30 disabled:bg-transparent transition-all gap-1"
                                    disabled={currentPage >= totalPages}
                                    asChild={currentPage < totalPages}
                                >
                                    {currentPage < totalPages ? (
                                        <Link href={`/dashboard/users?query=${query}&page=${currentPage + 1}`}>
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
