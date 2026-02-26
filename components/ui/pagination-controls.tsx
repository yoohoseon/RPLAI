'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
    totalPages: number;
    currentPage: number;
}

export default function PaginationControls({ totalPages, currentPage }: PaginationControlsProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        replace(`${pathname}?${params.toString()}`);
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-3">
            <Button
                variant="outline"
                className="h-10 px-4 rounded-xl border-[#F2F4F6] bg-white text-[#4E5968] font-bold hover:bg-[#F9FAFB] disabled:opacity-30 disabled:bg-transparent transition-all gap-1"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
            >
                <ChevronLeft className="w-4 h-4" />
                이전
            </Button>

            <span className="text-[14px] font-bold text-[#191F28] px-4 min-w-[100px] text-center">
                <span className="text-[#3182F6]">{currentPage}</span> <span className="text-[#ABB3BB] mx-1">/</span> {totalPages}
            </span>

            <Button
                variant="outline"
                className="h-10 px-4 rounded-xl border-[#F2F4F6] bg-white text-[#4E5968] font-bold hover:bg-[#F9FAFB] disabled:opacity-30 disabled:bg-transparent transition-all gap-1"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
            >
                다음
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
}
