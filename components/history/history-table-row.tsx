"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { DeleteBrandButton } from '@/components/analysis/delete-brand-button';
import { useRouter } from 'next/navigation';

export function HistoryTableRow({ analysis }: { analysis: any }) {
    const router = useRouter();

    const handleRowClick = () => {
        router.push(`/main/analysis?brandKor=${analysis.brandKor}&brandEng=${analysis.brandEng}&category=${analysis.category}&target=${analysis.target}&competitors=${analysis.competitors}&url=${analysis.url}`);
    };

    return (
        <TableRow onClick={handleRowClick} className="cursor-pointer hover:bg-muted/50 transition-colors group">
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
            <TableCell>
                <div className="flex flex-col">
                    <span className="text-sm">{analysis.user.name}</span>
                    <span className="text-xs text-muted-foreground">{analysis.user.email}</span>
                </div>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <DeleteBrandButton analysisId={analysis.id} />
                </div>
            </TableCell>
        </TableRow>
    );
}
