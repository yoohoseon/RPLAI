'use client';

import { useActionState, useState } from 'react';
import { createUser } from '@/app/lib/actions';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Team = {
    id: string;
    name: string;
};

import { UserPlus, Plus, Loader2 } from 'lucide-react';

export function UserCreateDialog({ teams, fixedTeamId, fixedRole }: { teams: Team[]; fixedTeamId?: string; fixedRole?: string }) {
    const [open, setOpen] = useState(false);
    const [state, dispatch, isPending] = useActionState(createUser, null);
    const [role, setRole] = useState(fixedRole || 'TEAM_MEMBER');
    const [teamId, setTeamId] = useState(fixedTeamId || '');

    if (state?.success && open) {
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-12 px-6 bg-[#EE2924] hover:bg-[#D11F1B] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#EE2924]/20 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    새로운 사용자 추가
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border-[#F2F4F6] rounded-[32px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                <div className="p-10">
                    <DialogHeader className="mb-8">
                        <div className="w-14 h-14 bg-[#EE2924]/5 rounded-2xl flex items-center justify-center mb-6">
                            <UserPlus className="w-7 h-7 text-[#EE2924]" />
                        </div>
                        <DialogTitle className="text-[22px] font-bold text-[#191F28] tracking-tight">사용자 추가</DialogTitle>
                        <DialogDescription className="text-[15px] font-medium text-[#4E5968] leading-relaxed mt-2">
                            시스템을 이용할 새로운 사용자를 등록합니다.
                        </DialogDescription>
                    </DialogHeader>
                    <form action={dispatch} className="space-y-6">
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2.5">
                                    <Label htmlFor="name" className="text-[14px] font-bold text-[#8B95A1] ml-1">
                                        이름
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="홍길동"
                                        className="h-14 bg-[#F9FAFB] border-[#F2F4F6] rounded-2xl px-5 text-[15px] font-bold focus:ring-[#EE2924]/20 placeholder:text-[#ABB3BB]"
                                        required
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <Label htmlFor="email" className="text-[14px] font-bold text-[#8B95A1] ml-1">
                                        이메일
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="example@rplai.com"
                                        className="h-14 bg-[#F9FAFB] border-[#F2F4F6] rounded-2xl px-5 text-[15px] font-bold focus:ring-[#EE2924]/20 placeholder:text-[#ABB3BB]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <Label htmlFor="password" className="text-[14px] font-bold text-[#8B95A1] ml-1">
                                    초기 비밀번호
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="비밀번호 설정"
                                    className="h-14 bg-[#F9FAFB] border-[#F2F4F6] rounded-2xl px-5 text-[15px] font-bold focus:ring-[#EE2924]/20 placeholder:text-[#ABB3BB]"
                                    required
                                />
                            </div>

                            {!fixedRole && (
                                <div className="space-y-2.5">
                                    <Label htmlFor="role" className="text-[14px] font-bold text-[#8B95A1] ml-1">
                                        권한 설정
                                    </Label>
                                    <Select value={role} onValueChange={setRole}>
                                        <SelectTrigger className="h-14 bg-[#F9FAFB] border-[#F2F4F6] rounded-2xl px-5 text-[15px] font-bold focus:ring-[#EE2924]/20">
                                            <SelectValue placeholder="권한 선택" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-[#F2F4F6] shadow-xl">
                                            <SelectItem value="TEAM_LEADER" className="rounded-xl font-medium py-3">Team Leader</SelectItem>
                                            <SelectItem value="TEAM_MEMBER" className="rounded-xl font-medium py-3">Team Member</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <input type="hidden" name="role" value={fixedRole || role} />

                            {!fixedTeamId && (
                                <div className="space-y-2.5">
                                    <Label htmlFor="team" className="text-[14px] font-bold text-[#8B95A1] ml-1">
                                        소속 팀 설정
                                    </Label>
                                    <Select value={teamId} onValueChange={setTeamId}>
                                        <SelectTrigger className="h-14 bg-[#F9FAFB] border-[#F2F4F6] rounded-2xl px-5 text-[15px] font-bold focus:ring-[#EE2924]/20">
                                            <SelectValue placeholder="팀 선택 (선택 사항)" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-[#F2F4F6] shadow-xl">
                                            <SelectItem value="none" className="rounded-xl font-medium py-3 text-[#ABB3BB]">선택 안 함</SelectItem>
                                            {teams.map((team) => (
                                                <SelectItem key={team.id} value={team.id} className="rounded-xl font-medium py-3">
                                                    {team.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <input type="hidden" name="teamId" value={fixedTeamId || (teamId === 'none' ? '' : teamId)} />

                            {state?.message && (
                                <div className="text-[13px] font-bold px-4 py-3 rounded-xl text-center bg-rose-50 text-rose-500 mt-2">
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
                                        추가하는 중...
                                    </>
                                ) : (
                                    '사용자 등록 완료'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
