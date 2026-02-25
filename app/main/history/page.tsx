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
                                <TableHead>Created By</TableHead>
                                <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analyses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No analysis history found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                analyses.map((analysis) => (
                                    <HistoryTableRow key={analysis.id} analysis={analysis} />
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
