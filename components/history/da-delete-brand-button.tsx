"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteBrandDaAnalysis } from '@/app/lib/concept-actions';


export function DaDeleteBrandButton({ analysisId }: { analysisId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsDeleting(true);
        const result = await deleteBrandDaAnalysis(analysisId);
        setIsDeleting(false);
        setIsOpen(false);

        if (result.success) {
            alert("DA 분석 기록이 삭제되었습니다.");
            window.location.reload();
        } else {
            alert(result.error || "삭제에 실패했습니다.");
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>DA 기록을 삭제하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                        이 작업은 되돌릴 수 없습니다. 해당 브랜드의 DA 분석 데이터가 데이터베이스에서 영구적으로 삭제됩니다.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? "삭제 중..." : "삭제"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
