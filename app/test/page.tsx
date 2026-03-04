"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TestPagesDirectory() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '1234') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('비밀번호가 일치하지 않습니다.');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#F2F4F7] p-12 flex items-center justify-center font-sans">
                <div className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] w-full max-w-sm">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-[#000000] text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        </div>
                        <h1 className="text-2xl font-bold text-[#111111] mb-2">테스트 페이지</h1>
                        <p className="text-[#8B95A1] font-medium text-[15px]">접근을 위해 비밀번호를 입력해주세요.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 bg-[#F2F4F7] border-transparent focus:border-[#0064FF] focus-visible:ring-0 rounded-xl px-4 text-[#333333] font-medium"
                                autoFocus
                            />
                            {error && <p className="text-sm font-bold text-red-500 text-center animate-in fade-in">{error}</p>}
                        </div>
                        <Button type="submit" className="w-full h-12 bg-[#000000] hover:bg-[#333333] text-white font-bold rounded-xl text-[16px]">
                            입장하기
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    const pages = [
        { path: '/', name: 'Landing Page' },
        { path: '/login', name: 'Login' },
        { path: '/dashboard', name: 'Admin Dashboard (Master/Team Leader)' },
        { path: '/dashboard/teams', name: 'Admin - Teams' },
        { path: '/dashboard/users', name: 'Admin - Users' },
        { path: '/main', name: 'Main (Brand Analysis Input)' },
        { path: '/main/history', name: 'Analysis History' },
        { path: '/main/analysis', name: 'Analysis Results' },
        { path: '/main/strategy', name: 'Strategy Board' },
        { path: '/main/generation', name: 'Content Generation' },
        { path: '/main/img_creator', name: 'Image Creator' },
        { path: '/main/da', name: 'DA (Digital Asset) Analysis Input' },
        { path: '/main/da/history', name: 'DA Analysis History' },
        { path: '/main/da/analysis', name: 'DA Analysis Results' },
        { path: '/main/comp', name: 'Competitor Analysis' },
    ];

    return (
        <div className="min-h-screen bg-[#F2F4F7] p-12 font-sans overflow-auto selection:bg-[#000000] selection:text-white">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-[#111111] mb-3">🛠️ 페이지 테스트용 디렉토리 </h1>
                    <p className="text-lg text-[#4E5968] font-medium tracking-tight">프로젝트에 구현되어 있는 모든 라우트(페이지) 경로를 모아둔 테스트 리스트입니다.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pages.map((page, index) => (
                        <Link
                            key={index}
                            href={page.path}
                            className="bg-white group p-6 rounded-2xl border border-transparent hover:border-[#E5E8EB] shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex items-center justify-between"
                        >
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-[#333333] text-[17px] group-hover:text-[#000000]">{page.name}</span>
                                <span className="font-medium text-[#8B95A1] text-[14px] font-mono select-all">http://localhost:3000{page.path}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-[#F2F4F7] group-hover:bg-[#000000] group-hover:text-white text-[#8B95A1] flex items-center justify-center transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-12 p-6 bg-[#000/5] rounded-2xl text-center">
                    <p className="text-[#4E5968] text-[14px] font-medium">※ 일부 페이지(대시보드 등)는 권한(Master/Team Leader)이나 파라미터(id 등)에 따라 접근이나 데이터 표시가 안 될 수 있습니다.</p>
                </div>
            </div>
        </div>
    );
}
