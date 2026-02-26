import { fetchBrandAnalyses, fetchTeams } from '@/app/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { HistoryTableRow } from '@/components/history/history-table-row';

import HistoryFilters from '@/components/history/history-filters';

import PaginationControls from '@/components/ui/pagination-controls';

interface HistoryPageProps {
    searchParams: Promise<{
        brand?: string;
        userName?: string;
        teamName?: string;
        sort?: string;
        page?: string;
    }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;
    const limit = 10;

    const { data: analyses, totalPages, totalCount } = await fetchBrandAnalyses(
        {
            brand: params.brand,
            userName: params.userName,
            teamName: params.teamName,
            sort: params.sort
        },
        currentPage,
        limit
    );

    const teams = await fetchTeams();

    return (
        <div className="min-h-screen bg-[#F2F4F7] font-sans">
            <div className="container mx-auto py-12 px-6 max-w-7xl space-y-10 animate-in fade-in duration-700">
                <div className="flex items-end justify-between border-none pb-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-[#333D4B]">분석 이력</h1>
                        <p className="text-[17px] font-medium text-[#4E5968]">과거의 브랜드 분석 및 전략 수립 기록을 확인하세요.</p>
                    </div>
                    <Link href="/main">
                        <Button className="bg-[#030000] text-white hover:bg-[#1A1A1A] active:bg-[#111111] rounded-2xl px-6 h-12 font-bold shadow-none">
                            새로운 분석 시작하기
                        </Button>
                    </Link>
                </div>

                <div className="space-y-6">
                    <HistoryFilters teams={teams} />

                    <div className="bg-white rounded-[2rem] border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                        <Table>
                            <TableHeader className="bg-[#F2F4F7]">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="w-[180px] text-[#8B95A1] font-bold h-14 px-8">분석 일시</TableHead>
                                    <TableHead className="text-[#8B95A1] font-bold h-14">브랜드</TableHead>
                                    <TableHead className="text-[#8B95A1] font-bold h-14">카테고리</TableHead>
                                    <TableHead className="text-[#8B95A1] font-bold h-14">작성자</TableHead>
                                    <TableHead className="text-right h-14 px-8"><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {analyses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-48 text-[#ABB3BB] font-medium text-[15px]">
                                            표시할 분석 이력이 없습니다.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    analyses.map((analysis) => (
                                        <HistoryTableRow key={analysis.id} analysis={analysis} />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 px-2">
                    <div className="text-[15px] font-medium text-[#8B95A1]">
                        전체 <span className="text-[#4E5968] font-bold">{totalCount}</span>개의 항목
                    </div>
                    <PaginationControls totalPages={totalPages} currentPage={currentPage} />
                </div>
            </div>
        </div>
    );
}
