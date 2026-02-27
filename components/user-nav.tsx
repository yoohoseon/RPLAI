'use client';

import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { ChangePasswordDialog } from '@/components/change-password-dialog';

export function UserNav({ user }: { user: any }) {
    const [showChangePassword, setShowChangePassword] = useState(false);

    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="/avatars/01.png" alt={user.name || ''} />
                            <AvatarFallback>{user.name?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-2 rounded-[24px] border-none shadow-[0_8px_30px_rgba(0,0,0,0.08)]" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal p-4">
                        <div className="flex flex-col space-y-2">
                            <p className="text-[16px] font-bold text-[#333333] leading-none">{user.name}</p>
                            <p className="text-[13px] font-medium text-[#8B95A1] leading-none">
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[#F2F4F6] mx-2" />
                    <DropdownMenuGroup className="p-1">
                        {(user.role === 'MASTER' || user.role === 'TEAM_LEADER') && (
                            <DropdownMenuItem asChild className="rounded-xl h-11 px-3 focus:bg-[#F2F4F6]/5 focus:text-[#333333] font-medium transition-all cursor-pointer">
                                <Link href="/dashboard">
                                    팀 관리 설정
                                </Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild className="rounded-xl h-11 px-3 focus:bg-[#F2F4F6]/5 focus:text-[#333333] font-medium transition-all cursor-pointer">
                            <Link href="/main/history">
                                분석 내역 확인
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setShowChangePassword(true)} className="rounded-xl h-11 px-3 focus:bg-[#F2F4F6]/5 focus:text-[#333333] font-medium transition-all cursor-pointer">
                            비밀번호 변경
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-[#F2F4F6] mx-2" />
                    <DropdownMenuGroup className="p-1">
                        <DropdownMenuItem onSelect={() => signOut()} className="rounded-xl h-11 px-3 focus:bg-rose-50 focus:text-rose-500 font-bold transition-all cursor-pointer">
                            로그아웃
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <ChangePasswordDialog open={showChangePassword} onOpenChange={setShowChangePassword} />
        </>
    );
}
