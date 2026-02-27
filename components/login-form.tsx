'use client';

import { useActionState } from 'react';
import { authenticate } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginForm() {
    const [errorMessage, dispatch, isPending] = useActionState(
        authenticate,
        undefined,
    );

    return (
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white border-none rounded-[32px] p-10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] relative overflow-hidden">
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#F2F4F6]/5 text-[#333333] mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                            <polyline points="10 17 15 12 10 7" />
                            <line x1="15" x2="3" y1="12" y2="12" />
                        </svg>
                    </div>
                    <h1 className="text-[26px] font-bold tracking-tight text-[#333333] mb-2.5">로그인</h1>
                    <p className="text-[15px] font-medium text-[#4E5968]">분석 서비스 이용을 위해 로그인해주세요</p>
                </div>

                <form action={dispatch} className="space-y-6">
                    <div className="space-y-2.5">
                        <Label htmlFor="email" className="text-[14px] font-bold text-[#8B95A1] ml-1">이메일</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="example@email.com"
                            required
                            className="flex h-14 w-full rounded-2xl border-none bg-[#F2F4F7] px-5 text-[15px] font-bold transition-all focus:outline-none focus:ring-4 focus:ring-[#3182F6]/5 focus:border-[#3182F6] placeholder:text-[#ABB3BB]"
                        />
                    </div>
                    <div className="space-y-2.5">
                        <Label htmlFor="password" className="text-[14px] font-bold text-[#8B95A1] ml-1">비밀번호</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            className="flex h-14 w-full rounded-2xl border-none bg-[#F2F4F7] px-5 text-[15px] font-bold transition-all focus:outline-none focus:ring-4 focus:ring-[#3182F6]/5 focus:border-[#3182F6] placeholder:text-[#ABB3BB]"
                        />
                    </div>

                    {errorMessage && (
                        <div className="flex items-center gap-2.5 p-4 text-[13px] font-bold text-red-500 bg-red-50 rounded-2xl border border-red-100 animate-in slide-in-from-left-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" x2="12" y1="8" y2="12" />
                                <line x1="12" x2="12.01" y1="16" y2="16" />
                            </svg>
                            {errorMessage}
                        </div>
                    )}

                    <Button
                        className="w-full h-16 rounded-[24px] bg-[#030000] text-white hover:bg-[#1A1A1A] active:bg-[#111111] font-bold text-[17px] shadow-none active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
                        type="submit"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <div className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-[#333333]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                로그인 중...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                시작하기
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            </div>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
