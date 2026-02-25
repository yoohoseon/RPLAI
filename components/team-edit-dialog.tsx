'use client';

import { useActionState, useState } from 'react';
import { updateTeam } from '@/app/lib/actions';
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
import { Pencil, Loader2 } from 'lucide-react';

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
    role: string;
};

type Team = {
    id: string;
    name: string;
    description: string | null;
    members?: { id: string; role: string }[];
};

export function TeamEditDialog({ team, users }: { team: Team; users: User[] }) {
    const [open, setOpen] = useState(false);
    const [state, dispatch, isPending] = useActionState(updateTeam, null);

    const currentLeader = team.members?.find(m => m.role === 'TEAM_LEADER');
    const [leaderId, setLeaderId] = useState(currentLeader?.id || 'none');

    if (state?.success && open) {
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9 text-[#8B95A1] hover:text-[#EE2924] hover:bg-[#EE2924]/5 rounded-xl transition-all" title="팀 정보 수정">
                    <Pencil className="h-4.5 w-4.5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border-[#F2F4F6] rounded-[32px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                <div className="p-10">
                    <DialogHeader className="mb-8">
                        <div className="w-14 h-14 bg-[#EE2924]/5 rounded-2xl flex items-center justify-center mb-6">
                            <Pencil className="w-7 h-7 text-[#EE2924]" />
                        </div>
                        <DialogTitle className="text-[22px] font-bold text-[#191F28] tracking-tight">팀 정보 수정</DialogTitle>
                        <DialogDescription className="text-[15px] font-medium text-[#4E5968] leading-relaxed mt-2">
                            팀의 기본 설정 및 리더를 변경할 수 있습니다.
                        </DialogDescription>
                    </DialogHeader>
                    <form action={dispatch} className="space-y-6">
                        <input type="hidden" name="teamId" value={team.id} />
                        <div className="space-y-5">
                            <div className="space-y-2.5">
                                <Label htmlFor="name" className="text-[14px] font-bold text-[#8B95A1] ml-1">
                                    팀 이름
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={team.name}
                                    placeholder="팀 이름 입력"
                                    className="h-14 bg-[#F9FAFB] border-[#F2F4F6] rounded-2xl px-5 text-[15px] font-bold focus:ring-[#EE2924]/20"
                                    required
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="description" className="text-[14px] font-bold text-[#8B95A1] ml-1">
                                    팀 설명
                                </Label>
                                <Input
                                    id="description"
                                    name="description"
                                    defaultValue={team.description || ''}
                                    placeholder="팀 역할 등에 대한 설명"
                                    className="h-14 bg-[#F9FAFB] border-[#F2F4F6] rounded-2xl px-5 text-[15px] font-bold focus:ring-[#EE2924]/20"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="leader" className="text-[14px] font-bold text-[#8B95A1] ml-1">
                                    팀 리더 지정
                                </Label>
                                <Select value={leaderId} onValueChange={setLeaderId}>
                                    <SelectTrigger className="h-14 bg-[#F9FAFB] border-[#F2F4F6] rounded-2xl px-5 text-[15px] font-bold focus:ring-[#EE2924]/20">
                                        <SelectValue placeholder="리더 선택" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-[#F2F4F6] shadow-xl">
                                        <SelectItem value="none" className="rounded-xl font-medium py-3 text-[#ABB3BB]">리더 없음</SelectItem>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id} className="rounded-xl font-medium py-3">
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <input type="hidden" name="leaderId" value={leaderId === 'none' ? '' : leaderId} />
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
                                className="w-full h-16 rounded-[20px] bg-[#EE2924] hover:bg-[#D11F1B] text-white font-bold text-[17px] shadow-lg shadow-[#EE2924]/10 active:scale-[0.98] transition-all"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        저장하는 중...
                                    </>
                                ) : (
                                    '팀 정보 저장 완료'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
