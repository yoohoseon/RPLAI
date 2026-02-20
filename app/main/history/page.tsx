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
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

import HistoryFilters from '@/components/history/history-filters';

import PaginationControls from '@/components/ui/pagination-controls';

interface HistoryPageProps {
    searchParams: Promise<{
        brand?: string;
        userName?: string;
        teamName?: string;
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
            teamName: params.teamName
        },
        currentPage,
        limit
    );

    const teams = await fetchTeams();

    return (
        <div className="container mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analysis History</h1>
                    <p className="text-muted-foreground">View past brand analysis reports.</p>
                </div>
                <Link href="/main">
                    <Button variant="outline">New Analysis</Button>
                </Link>
            </div>

            <HistoryFilters teams={teams} />

            <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Date</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Created By</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analyses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        No analysis history found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                analyses.map((analysis) => (
                                    <TableRow key={analysis.id}>
                                        <TableCell className="font-medium">
                                            {format(analysis.createdAt, 'yyyy-MM-dd')}
                                            <br />
                                            <span className="text-xs text-muted-foreground">
                                                {format(analysis.createdAt, 'HH:mm')}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-bold">
                                            {analysis.brandKor}
                                            <br />
                                            <span className="text-xs text-muted-foreground font-normal">
                                                {analysis.brandEng}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-normal">
                                                {analysis.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                            {analysis.target}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm">{analysis.user.name}</span>
                                                <span className="text-xs text-muted-foreground">{analysis.user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {/* Future: Link to detail view, passing content or ID */}
                                            {/* For now, just button placeholder or link to retry with params */}
                                            <Link href={`/main/analysis?brandKor=${analysis.brandKor}&brandEng=${analysis.brandEng}&category=${analysis.category}&target=${analysis.target}&competitors=${analysis.competitors}&url=${analysis.url}`}>
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    View
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="flex justify-end text-sm text-muted-foreground">
                Total {totalCount} items
            </div>

            <PaginationControls totalPages={totalPages} currentPage={currentPage} />
        </div>
    );
}
