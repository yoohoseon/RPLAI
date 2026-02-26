'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

export default function LandingHero() {
    const [isHovered, setIsHovered] = useState(false);

    const setHover = useCallback((val: boolean) => {
        setIsHovered(val);
        // Broadcast to other components (e.g. PublicHeader)
        window.dispatchEvent(new CustomEvent('landing-hover', { detail: { hovered: val } }));
    }, []);

    return (
        <>
            {/* Full-screen background overlay */}
            <div
                className="fixed inset-0 pointer-events-none z-0 transition-all duration-700 ease-in-out"
                style={{
                    backgroundColor: isHovered ? '#3182F6' : 'transparent',
                    opacity: isHovered ? 1 : 0,
                }}
            />

            {/* Hero content */}
            <div className="max-w-4xl space-y-10 relative z-10">
                {/* Badge */}
                <div
                    className="inline-flex items-center justify-center px-5 py-2 rounded-2xl border text-[15px] font-bold shadow-sm mb-4 transition-all duration-700"
                    style={{
                        backgroundColor: isHovered ? 'rgba(255,255,255,0.15)' : 'white',
                        borderColor: isHovered ? 'rgba(255,255,255,0.3)' : '#F2F4F6',
                        color: isHovered ? 'white' : '#3182F6',
                    }}
                >
                    ✨ AI-Powered Brand Analytics 플랫폼
                </div>

                {/* Heading */}
                <div className="space-y-6">
                    <h1
                        className="text-5xl md:text-[80px] font-bold tracking-tight leading-[1.1] break-keep transition-colors duration-700"
                        style={{ color: isHovered ? 'white' : '#191F28' }}
                    >
                        데이터로 이끄는<br />
                        <span
                            className="transition-colors duration-700"
                            style={{ color: isHovered ? 'rgba(255,255,255,0.85)' : '#3182F6' }}
                        >
                            브랜드의 성장
                        </span>
                    </h1>
                    <p
                        className="text-xl md:text-[22px] font-medium max-w-2xl mx-auto leading-relaxed break-keep transition-colors duration-700"
                        style={{ color: isHovered ? 'rgba(255,255,255,0.8)' : '#4E5968' }}
                    >
                        고급 AI 분석으로 도출하는 심도 있는 시장 인사이트.<br />
                        이제 데이터 기반의 차세대 브랜드 전략을 경험해보세요.
                    </p>
                </div>

                {/* CTA Button */}
                <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/login" className="w-full sm:w-auto">
                        <button
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                            className="
                                relative h-16 w-full sm:w-80 px-12 text-[18px] font-bold rounded-[24px]
                                transition-all duration-500 ease-in-out
                                overflow-hidden group
                                border-2
                                active:scale-[0.98]
                            "
                            style={{
                                backgroundColor: isHovered ? 'white' : '#3182F6',
                                borderColor: isHovered ? 'white' : '#3182F6',
                                color: isHovered ? '#3182F6' : 'white',
                                boxShadow: isHovered
                                    ? '0 0 0 4px rgba(255,255,255,0.4), 0 20px 60px rgba(0,0,0,0.15)'
                                    : '0 8px 30px rgba(238,41,36,0.3)',
                            }}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                시작하기
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                                >
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            </span>
                        </button>
                    </Link>
                </div>

                {/* Feature Cards */}
                <div className="pt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    {[
                        { title: "시장 인텔리전스", desc: "실시간 데이터를 기반으로 업계 동향과 경쟁사를 정밀 분석합니다." },
                        { title: "AI 전략 수립", desc: "브랜드 페르소나와 타겟에 최적화된 마케팅 전략을 생성합니다." },
                        { title: "자동화 리포트", desc: "복잡한 분석 결과를 한눈에 이해할 수 있는 리포트로 제공합니다." }
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            className="p-8 rounded-[32px] border transition-all duration-700"
                            style={{
                                backgroundColor: isHovered ? 'rgba(255,255,255,0.12)' : 'white',
                                borderColor: isHovered ? 'rgba(255,255,255,0.2)' : '#F2F4F6',
                                boxShadow: isHovered
                                    ? '0 8px 30px rgba(0,0,0,0.1)'
                                    : '0 8px 30px rgba(0,0,0,0.04)',
                            }}
                        >
                            <h3
                                className="text-[18px] font-bold mb-3 transition-colors duration-700"
                                style={{ color: isHovered ? 'white' : '#191F28' }}
                            >
                                {item.title}
                            </h3>
                            <p
                                className="text-[15px] font-medium leading-relaxed transition-colors duration-700"
                                style={{ color: isHovered ? 'rgba(255,255,255,0.75)' : '#4E5968' }}
                            >
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
