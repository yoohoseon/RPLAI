'use client';

import { useActionState, useState } from 'react';
import { resetUserPassword } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Loader2 } from 'lucide-react';

export function UserPasswordResetDialog({ userId, userName }: { userId: string; userName: string }) {
    const [open, setOpen] = useState(false);
    const [state, dispatch, isPending] = useActionState(resetUserPassword, null);

    if (state?.success && open) {
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9 text-[#8B95A1] hover:text-[#EE2924] hover:bg-[#EE2924]/5 rounded-xl transition-all" title="비밀번호 초기화">
                    <KeyRound className="h-4.5 w-4.5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-[#F2F4F6] rounded-[32px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                <div className="p-10">
                    <DialogHeader className="mb-8">
                        <div className="w-14 h-14 bg-[#EE2924]/5 rounded-2xl flex items-center justify-center mb-6">
                            <KeyRound className="w-7 h-7 text-[#EE2924]" />
                        </div>
                        <DialogTitle className="text-[22px] font-bold text-[#191F28] tracking-tight">비밀번호 초기화</DialogTitle>
                        <DialogDescription className="text-[15px] font-medium text-[#4E5968] leading-relaxed mt-2">
                            <strong>{userName}</strong> 사용자의 새로운 비밀번호를 설정합니다.
                        </DialogDescription>
                    </DialogHeader>
                    <form action={dispatch} className="space-y-6">
                        <input type="hidden" name="userId" value={userId} />
                        <div className="space-y-5">
                            <div className="space-y-2.5">
                                <Label htmlFor="newPassword" className="text-[14px] font-bold text-[#8B95A1] ml-1">
                                    새 비밀번호 입력
                                </Label>
                                <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    placeholder="관리용 임시 비밀번호 설정"
                                    className="h-14 bg-[#F9FAFB] border-[#F2F4F6] rounded-2xl px-5 text-[15px] font-bold focus:ring-[#EE2924]/20 placeholder:text-[#ABB3BB]"
                                    required
                                />
                            </div>
                            {state?.message && (
                                <div className={`text-[13px] font-bold px-4 py-3 rounded-xl text-center ${state.success ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-500'}`}>
                                    {state.message}
                                </div>
                            )}
                        </div>
                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-16 rounded-[20px] bg-[#EE2924] hover:bg-[#D11F1B] text-white font-bold text-[17px] shadow-lg shadow-[#EE2924]/10 active:scale-[0.98] transition-all"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        재설정하는 중...
                                    </>
                                ) : (
                                    '비밀번호 재설정 완료'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
