'use client';

import { useActionState, useState } from 'react';
import { createTeam } from '@/app/lib/actions';
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

import { Users, Plus, Loader2 } from 'lucide-react';

export function TeamCreateDialog() {
    const [open, setOpen] = useState(false);
    const [state, dispatch, isPending] = useActionState(createTeam, null);

    if (state?.success && open) {
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-12 px-6 bg-[#333D4B] hover:bg-[#191F28] text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    새로운 팀 생성
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-[32px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                <div className="p-10">
                    <DialogHeader className="mb-8">
                        <div className="w-14 h-14 bg-[#F2F4F6]/5 rounded-2xl flex items-center justify-center mb-6">
                            <Users className="w-7 h-7 text-[#333D4B]" />
                        </div>
                        <DialogTitle className="text-[22px] font-bold text-[#333D4B] tracking-tight">팀 생성</DialogTitle>
                        <DialogDescription className="text-[15px] font-medium text-[#4E5968] leading-relaxed mt-2">
                            새로운 브랜드 또는 프로젝트를 관리할<br />팀 단위를 생성합니다.
                        </DialogDescription>
                    </DialogHeader>
                    <form action={dispatch} className="space-y-6">
                        <div className="space-y-5">
                            <div className="space-y-2.5">
                                <Label htmlFor="name" className="text-[14px] font-bold text-[#8B95A1] ml-1">
                                    팀 이름
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="예: 마케팅 A팀"
                                    className="h-14 bg-[#F2F4F7] border-none rounded-2xl px-5 text-[15px] font-bold focus:ring-[#3182F6]/20 placeholder:text-[#ABB3BB]"
                                    required
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="description" className="text-[14px] font-bold text-[#8B95A1] ml-1">
                                    설명 (선택)
                                </Label>
                                <Input
                                    id="description"
                                    name="description"
                                    placeholder="팀의 역할에 대해 간단히 적어주세요"
                                    className="h-14 bg-[#F2F4F7] border-none rounded-2xl px-5 text-[15px] font-bold focus:ring-[#3182F6]/20 placeholder:text-[#ABB3BB]"
                                />
                            </div>
                            {state?.message && (
                                <div className="text-[13px] font-bold px-4 py-3 rounded-xl text-center bg-rose-50 text-rose-500">
                                    {state.message}
                                </div>
                            )}
                        </div>
                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-16 rounded-[20px] bg-[#333D4B] hover:bg-[#191F28] text-white font-bold text-[17px] shadow-sm active:scale-[0.98] transition-all disabled:bg-[#ABB3BB]"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        생성하는 중...
                                    </>
                                ) : (
                                    '팀 생성 완료'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
