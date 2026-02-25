'use client';

import { useState } from 'react';
import { deleteUser } from '@/app/lib/actions';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"

export function UserDeleteDialog({ userId, userName }: { userId: string, userName: string }) {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const deleteAction = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDeleting(true);
        const formData = new FormData();
        formData.append('userId', userId);
        const result = await deleteUser(null, formData);
        setIsDeleting(false);
        if (result.success) {
            setOpen(false);
        } else {
            alert(result.message);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9 text-[#8B95A1] hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="사용자 삭제">
                    <Trash2 className="h-4.5 w-4.5" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-[#F2F4F6] rounded-[32px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                <div className="p-10">
                    <AlertDialogHeader className="mb-8">
                        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
                            <AlertTriangle className="w-7 h-7 text-rose-500" />
                        </div>
                        <AlertDialogTitle className="text-[22px] font-bold text-[#191F28] tracking-tight">사용자를 삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription className="text-[15px] font-medium text-[#4E5968] leading-relaxed mt-2">
                            <strong>{userName}</strong> 사용자의 계정과 모든 데이터가<br />시스템에서 영구적으로 삭제됩니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
                        <AlertDialogCancel asChild>
                            <Button variant="ghost" className="flex-1 h-16 rounded-[20px] bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#4E5968] font-bold text-[17px] transition-all">
                                취소
                            </Button>
                        </AlertDialogCancel>
                        <Button
                            onClick={deleteAction}
                            disabled={isDeleting}
                            className="flex-1 h-16 rounded-[20px] bg-rose-500 hover:bg-rose-600 text-white font-bold text-[17px] shadow-lg shadow-rose-500/10 active:scale-[0.98] transition-all"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    삭제 중...
                                </>
                            ) : (
                                '사용자 삭제'
                            )}
                        </Button>
                    </AlertDialogFooter>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
