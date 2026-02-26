'use client';

import { useActionState, useState, useEffect } from 'react';
import { changeMyPassword } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Lock, ShieldCheck, Loader2 } from 'lucide-react';

export function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [state, dispatch, isPending] = useActionState(changeMyPassword, null);

    useEffect(() => {
        if (state?.success) {
            onOpenChange(false);
        }
    }, [state, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-[#F2F4F6] rounded-[32px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                <div className="p-10">
                    <DialogHeader className="mb-8">
                        <div className="w-14 h-14 bg-[#3182F6]/5 rounded-2xl flex items-center justify-center mb-6">
                            <Lock className="w-7 h-7 text-[#3182F6]" />
                        </div>
                        <DialogTitle className="text-[22px] font-bold text-[#191F28] tracking-tight">비밀번호 변경</DialogTitle>
                        <DialogDescription className="text-[15px] font-medium text-[#4E5968] leading-relaxed mt-2 uppercase tracking-wide">
                            보안을 위해 현재 비밀번호를 확인하고<br />새로운 비밀번호를 설정해주세요.
                        </DialogDescription>
                    </DialogHeader>
                    <form action={dispatch} className="space-y-6">
                        <div className="space-y-5">
                            <div className="space-y-2.5">
                                <Label htmlFor="currentPassword" className="text-[14px] font-bold text-[#8B95A1] ml-1">
                                    현재 비밀번호
                                </Label>
                                <Input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type="password"
                                    placeholder="현재 비밀번호 입력"
                                    className="h-14 bg-[#F9FAFB] border-[#F2F4F6] rounded-2xl px-5 text-[15px] font-bold focus:ring-[#3182F6]/20 placeholder:text-[#ABB3BB]"
                                    required
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="newPassword" className="text-[14px] font-bold text-[#8B95A1] ml-1">
                                    새 비밀번호
                                </Label>
                                <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    placeholder="새 비밀번호 입력"
                                    className="h-14 bg-[#F9FAFB] border-[#F2F4F6] rounded-2xl px-5 text-[15px] font-bold focus:ring-[#3182F6]/20 placeholder:text-[#ABB3BB]"
                                    required
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="confirmPassword" className="text-[14px] font-bold text-[#8B95A1] ml-1">
                                    새 비밀번호 확인
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="한 번 더 입력해주세요"
                                    className="h-14 bg-[#F9FAFB] border-[#F2F4F6] rounded-2xl px-5 text-[15px] font-bold focus:ring-[#3182F6]/20 placeholder:text-[#ABB3BB]"
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
                                className="w-full h-16 rounded-[20px] bg-[#3182F6] hover:bg-[#1B64DA] text-white font-bold text-[17px] shadow-lg shadow-[#3182F6]/10 active:scale-[0.98] transition-all"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        변경하는 중...
                                    </>
                                ) : (
                                    '비밀번호 변경 완료'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
