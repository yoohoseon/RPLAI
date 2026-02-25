"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteBrandAnalysis } from '@/app/lib/concept-actions';
import { useRouter, usePathname } from 'next/navigation';

export function DeleteBrandButton({ analysisId }: { analysisId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const handleDelete = async () => {
        if (!confirm("현재 브랜드를 완전히 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.")) return;

        setIsDeleting(true);
        const result = await deleteBrandAnalysis(analysisId);

        if (result.success) {
            if (pathname.includes('/history')) {
                setIsDeleting(false);
                router.refresh(); // Refresh current history table
            } else {
                router.push('/main/history');
            }
        } else {
            alert("브랜드 삭제 중 오류가 발생했습니다: " + result.error);
            setIsDeleting(false);
        }
    }

    // 분석 ID가 없을 경우 숨김 처리
    if (!analysisId) return null;

    return (
        <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 rounded-full px-4 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition-all font-semibold cursor-pointer"
            disabled={isDeleting}
            onClick={handleDelete}
        >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            브랜드 삭제
        </Button>
    )
}
