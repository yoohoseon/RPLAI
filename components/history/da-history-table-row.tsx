"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { DaDeleteBrandButton } from "./da-delete-brand-button";

export function DaHistoryTableRow({ analysis }: { analysis: any }) {
    const router = useRouter();

    const handleRowClick = () => {
        router.push(`/main/da/analysis?id=${analysis.id}`);
    };

    return (
        <TableRow onClick={handleRowClick} className="cursor-pointer hover:bg-[#F9FAFB] transition-colors group h-20 border-none">
            <TableCell className="px-8 font-medium">
                <div className="text-[15px] text-[#333333] font-bold">
                    {format(analysis.createdAt, 'yyyy-MM-dd')}
                </div>
                <div className="text-[13px] text-[#8B95A1] font-medium">
                    {format(analysis.createdAt, 'HH:mm')}
                </div>
            </TableCell>
            <TableCell>
                <div className="text-[16px] text-[#333333] font-bold">
                    {analysis.brandKor}
                </div>
                <div className="text-[13px] text-[#8B95A1] font-medium leading-tight">
                    {analysis.brandEng}
                </div>
            </TableCell>
            <TableCell>
                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-[#F2F4F6] text-[#4E5968] text-[13px] font-bold">
                    {analysis.category}
                </span>
            </TableCell>
            <TableCell>
                <div className="flex flex-col">
                    <span className="text-[15px] text-[#333333] font-bold">{analysis.user.name}</span>
                    <span className="text-[13px] text-[#8B95A1] font-medium">{analysis.user.email}</span>
                </div>
            </TableCell>
            <TableCell className="text-right px-8">
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <DaDeleteBrandButton analysisId={analysis.id} />
                </div>
            </TableCell>
        </TableRow>
    );
}
