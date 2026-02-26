'use client';

import { useActionState, useState } from 'react';
import { addTeamMember } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, UserPlus, Loader2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type User = {
    id: string;
    name: string | null;
    email: string | null;
    teamId: string | null;
};

export function TeamAddMemberDialog({ teamId, users }: { teamId: string; users: User[] }) {
    const [open, setOpen] = useState(false);
    const [state, dispatch, isPending] = useActionState(addTeamMember, null);
    const [userId, setUserId] = useState('');

    if (state?.success && open) {
        setOpen(false);
        setUserId('');
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-10 px-4 bg-[#3182F6] hover:bg-[#1B64DA] text-white rounded-xl font-bold transition-all shadow-md shadow-[#3182F6]/10 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    멤버 추가
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-[#F2F4F6] rounded-[32px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                <div className="p-10">
                    <DialogHeader className="mb-8">
                        <div className="w-14 h-14 bg-[#3182F6]/5 rounded-2xl flex items-center justify-center mb-6">
                            <UserPlus className="w-7 h-7 text-[#3182F6]" />
                        </div>
                        <DialogTitle className="text-[22px] font-bold text-[#191F28] tracking-tight">팀 멤버 추가</DialogTitle>
                        <DialogDescription className="text-[15px] font-medium text-[#4E5968] leading-relaxed mt-2">
                            기존 사용자 중 팀원으로 합류할<br />사용자를 선택해주세요.
                        </DialogDescription>
                    </DialogHeader>
                    <form action={dispatch} className="space-y-6">
                        <input type="hidden" name="teamId" value={teamId} />
                        <div className="space-y-5">
                            <div className="space-y-2.5">
                                <Label htmlFor="user" className="text-[14px] font-bold text-[#8B95A1] ml-1">
                                    사용자 선택
                                </Label>
                                <Select value={userId} onValueChange={setUserId}>
                                    <SelectTrigger className="h-14 bg-[#F9FAFB] border-[#F2F4F6] rounded-2xl px-5 text-[15px] font-bold focus:ring-[#3182F6]/20">
                                        <SelectValue placeholder="추가할 사용자 선택" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-[#F2F4F6] shadow-xl">
                                        {users.length === 0 ? (
                                            <div className="px-4 py-3 text-[14px] text-[#ABB3BB] text-center">추가 가능한 사용자가 없습니다.</div>
                                        ) : (
                                            users.map((user) => (
                                                <SelectItem key={user.id} value={user.id} className="rounded-xl font-medium py-3">
                                                    {user.name} ({user.email})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <input type="hidden" name="userId" value={userId} />
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
                                disabled={isPending || !userId}
                                className="w-full h-16 rounded-[20px] bg-[#3182F6] hover:bg-[#1B64DA] text-white font-bold text-[17px] shadow-lg shadow-[#3182F6]/10 active:scale-[0.98] transition-all disabled:bg-[#F2F4F6] disabled:text-[#ABB3BB] disabled:shadow-none"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        추가하는 중...
                                    </>
                                ) : (
                                    '멤버 추가 완료'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
