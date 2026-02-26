'use client';

import { useActionState, useState } from 'react';
import { removeTeamMember } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

export function TeamRemoveMemberDialog({ userId, teamId, userName }: { userId: string; teamId: string; userName: string }) {
    const [open, setOpen] = useState(false);
    const [state, dispatch, isPending] = useActionState(removeTeamMember, null);

    if (state?.success && open) {
        setOpen(false);
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9 text-[#8B95A1] hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="멤버 제외">
                    <Trash2 className="h-4.5 w-4.5" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-[32px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                <div className="p-10">
                    <AlertDialogHeader className="mb-8">
                        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
                            <AlertTriangle className="w-7 h-7 text-rose-500" />
                        </div>
                        <AlertDialogTitle className="text-[22px] font-bold text-[#333D4B] tracking-tight">멤버를 제외하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription className="text-[15px] font-medium text-[#4E5968] leading-relaxed mt-2">
                            <strong>{userName}</strong> 님을 이 팀에서 제외합니다.<br />
                            시스템 계정은 유지되나, 이 팀의 데이터에는 더 이상 접근할 수 없게 됩니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <form action={dispatch}>
                        <input type="hidden" name="userId" value={userId} />
                        <input type="hidden" name="teamId" value={teamId} />
                        <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
                            <AlertDialogCancel asChild>
                                <Button variant="ghost" className="flex-1 h-16 rounded-[20px] bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#4E5968] font-bold text-[17px] transition-all">
                                    취소
                                </Button>
                            </AlertDialogCancel>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="flex-1 h-16 rounded-[20px] bg-rose-500 hover:bg-rose-600 text-white font-bold text-[17px] shadow-lg shadow-rose-500/10 active:scale-[0.98] transition-all"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        제외 중...
                                    </>
                                ) : (
                                    '제외하기'
                                )}
                            </Button>
                        </AlertDialogFooter>
                    </form>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
