'use client';

import { useActionState, useState } from 'react';
import { updateUser } from '@/app/lib/actions';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Pencil, Loader2, UserCircle } from 'lucide-react';

type Team = {
    id: string;
    name: string;
};

type User = {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    teamId: string | null;
};

export function UserEditDialog({ user, teams }: { user: User; teams: Team[] }) {
    const [open, setOpen] = useState(false);
    const [state, dispatch, isPending] = useActionState(updateUser, null);
    const [role, setRole] = useState(user.role);
    const [teamId, setTeamId] = useState(user.teamId || 'none');

    if (state?.success && open) {
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9 text-[#8B95A1] hover:text-[#333333] hover:bg-[#F2F4F6]/5 rounded-xl transition-all" title="사용자 정보 수정">
                    <Pencil className="h-4.5 w-4.5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border-none rounded-[32px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                <div className="p-10">
                    <DialogHeader className="mb-8">
                        <div className="w-14 h-14 bg-[#F2F4F6]/5 rounded-2xl flex items-center justify-center mb-6">
                            <UserCircle className="w-7 h-7 text-[#333333]" />
                        </div>
                        <DialogTitle className="text-[22px] font-bold text-[#333333] tracking-tight">사용자 정보 수정</DialogTitle>
                        <DialogDescription className="text-[15px] font-medium text-[#4E5968] leading-relaxed mt-2">
                            사용자의 이름, 이메일, 권한 및 소속 팀을 변경합니다.
                        </DialogDescription>
                    </DialogHeader>
                    <form action={dispatch} className="space-y-6">
                        <input type="hidden" name="userId" value={user.id} />
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2.5">
                                    <Label htmlFor="name" className="text-[14px] font-bold text-[#8B95A1] ml-1">
                                        이름
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={user.name || ''}
                                        placeholder="이름 입력"
                                        className="h-14 bg-[#F2F4F7] border-none rounded-2xl px-5 text-[15px] font-bold focus:ring-[#3182F6]/20"
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
                                        defaultValue={user.email || ''}
                                        placeholder="이메일 입력"
                                        className="h-14 bg-[#F2F4F7] border-none rounded-2xl px-5 text-[15px] font-bold focus:ring-[#3182F6]/20"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <Label htmlFor="password" className="text-[14px] font-bold text-[#8B95A1] ml-1">
                                    비밀번호 변경 (필요 시)
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="변경하지 않으려면 공란으로 두세요"
                                    className="h-14 bg-[#F2F4F7] border-none rounded-2xl px-5 text-[15px] font-bold focus:ring-[#3182F6]/20 placeholder:text-[#ABB3BB]"
                                />
                            </div>

                            <div className="space-y-2.5">
                                <Label htmlFor="role" className="text-[14px] font-bold text-[#8B95A1] ml-1">
                                    권한 설정
                                </Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger className="h-14 bg-[#F2F4F7] border-none rounded-2xl px-5 text-[15px] font-bold focus:ring-[#3182F6]/20">
                                        <SelectValue placeholder="권한 선택" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
                                        <SelectItem value="MASTER" className="rounded-xl font-medium py-3 text-purple-600">Master</SelectItem>
                                        <SelectItem value="TEAM_LEADER" className="rounded-xl font-medium py-3 text-[#333333]">Team Leader</SelectItem>
                                        <SelectItem value="TEAM_MEMBER" className="rounded-xl font-medium py-3">Team Member</SelectItem>
                                    </SelectContent>
                                </Select>
                                <input type="hidden" name="role" value={role} />
                            </div>

                            <div className="space-y-2.5">
                                <Label htmlFor="team" className="text-[14px] font-bold text-[#8B95A1] ml-1">
                                    소속 팀 설정
                                </Label>
                                <Select value={teamId} onValueChange={setTeamId}>
                                    <SelectTrigger className="h-14 bg-[#F2F4F7] border-none rounded-2xl px-5 text-[15px] font-bold focus:ring-[#3182F6]/20">
                                        <SelectValue placeholder="팀 선택" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
                                        <SelectItem value="none" className="rounded-xl font-medium py-3 text-[#ABB3BB]">선택 안 함</SelectItem>
                                        {teams.map((team) => (
                                            <SelectItem key={team.id} value={team.id} className="rounded-xl font-medium py-3">
                                                {team.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <input type="hidden" name="teamId" value={teamId === 'none' ? '' : teamId} />
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
                                className="w-full h-16 rounded-[20px] bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#333333] font-bold text-[17px] shadow-none active:scale-[0.98] transition-all"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        저장하는 중...
                                    </>
                                ) : (
                                    '사용자 정보 저장 완료'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
