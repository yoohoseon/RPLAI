'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Footer } from '@/components/footer';

/* ─── 타이핑 텍스트 ─── */
const LEFT_KO = '데이터로\n이끄는';
const RIGHT_KO = '브랜드의\n성장';

function renderLines(text: string) {
    return text.split('\n').map((line, i, arr) => (
        <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
    ));
}

/* ─── 스크롤 애니메이션 래퍼 ─── */
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0px)' : 'translateY(36px)',
                transition: `opacity 0.9s ease ${delay}s, transform 0.9s ease ${delay}s`,
            }}
        >
            {children}
        </div>
    );
}

/* ─── Step 데이터 ─── */
const STEPS = [
    { num: '01', title: '브랜드 정보 입력', desc: '브랜드명, URL, 타겟, 경쟁사 정보만 입력하면 분석이 시작됩니다.' },
    { num: '02', title: 'AI 브랜드 분석', desc: 'Gemini AI가 KPI·인식 갭·SWOT·페르소나를 실시간으로 분석합니다.' },
    { num: '03', title: '전략 수립', desc: '타겟 세팅과 AI 추천 컨셉 중 최적의 전략 방향을 확정합니다.' },
    { num: '04', title: '콘텐츠 생성', desc: '확정된 전략을 바탕으로 SNS 콘텐츠와 비주얼 가이드를 완성합니다.' },
];

/* ─── Feature 데이터 ─── */
const FEATURES = [
    {
        num: '01',
        title: 'Brand Insight',
        label: '브랜드 인식 갭 분석',
        desc: '브랜드가 전달하려는 메시지와\n소비자가 실제로 받아들이는 인식 사이의\n간극을 정밀하게 분석합니다.',
    },
    {
        num: '02',
        title: 'Brand Persona',
        label: '브랜드 정체성 정의',
        desc: '브랜드를 하나의 인격체로 규명합니다.\n성격, 톤, USP, 철학, 슬로건까지\nAI가 브랜드의 디지털 소울을 완성합니다.',
    },
    {
        num: '03',
        title: 'Target & Tone',
        label: '타겟 정밀 설정',
        desc: '라이프스타일·지식/관여도·소통 관계\n세 가지 축으로 타겟 프로필을 설정하고\nAI 추천값과 직접 비교할 수 있습니다.',
    },
    {
        num: '04',
        title: 'Content Generation',
        label: '콘텐츠 자동 생성',
        desc: '브랜드 페르소나와 전략에 맞춤한\n인스타그램 카피와 Midjourney\n비주얼 프롬프트까지 한번에 생성합니다.',
    },
];

/* ─── 메인 ─── */
export default function LandingPage() {
    const [isHovered, setIsHovered] = useState(false);
    const [typedLeft, setTypedLeft] = useState('');
    const [typedRight, setTypedRight] = useState('');

    useEffect(() => {
        const html = document.documentElement;
        html.style.overflow = '';
    }, []);

    useEffect(() => {
        let leftIdx = 0;
        const SPEED = 80;
        const leftTimer = setInterval(() => {
            leftIdx++;
            setTypedLeft(LEFT_KO.slice(0, leftIdx));
            if (leftIdx >= LEFT_KO.length) {
                clearInterval(leftTimer);
                let rightIdx = 0;
                const rightTimer = setInterval(() => {
                    rightIdx++;
                    setTypedRight(RIGHT_KO.slice(0, rightIdx));
                    if (rightIdx >= RIGHT_KO.length) clearInterval(rightTimer);
                }, SPEED);
            }
        }, SPEED);
        return () => clearInterval(leftTimer);
    }, []);

    const HC = 'text-[52px] md:text-[72px] lg:text-[96px] xl:text-[112px] font-black leading-none tracking-tight break-keep';

    return (
        <div className="bg-[#FAFAFA] font-sans">

            {/* ══ 섹션 1: Hero ══ */}
            <div
                className="relative h-screen flex flex-col overflow-hidden transition-colors duration-700"
                style={{ backgroundColor: isHovered ? '#EE2924' : '#FAFAFA' }}
            >
                <header className="flex h-16 items-center px-8 md:px-12 justify-between flex-shrink-0 z-20 relative">
                    <Link href="/" className="hover:opacity-70 transition-opacity">
                        <div className="relative w-24 h-8">
                            <Image src="/rplai_logo.svg" alt="RPLAI" fill className="object-contain" priority />
                        </div>
                    </Link>
                    <Link href="/login" className="text-[13px] font-bold tracking-widest uppercase transition-colors duration-700" style={{ color: isHovered ? 'rgba(255,255,255,0.8)' : '#8B95A1' }}>
                        로그인
                    </Link>
                </header>

                <main className="flex-1 flex items-center px-6 md:px-10 lg:px-16 relative z-10 overflow-hidden">
                    <div className="flex-1 flex items-center justify-start">
                        <div className="grid" style={{ gridTemplateAreas: '"h"' }}>
                            <h1 className={HC} style={{ gridArea: 'h', color: isHovered ? 'white' : '#191F28', opacity: isHovered ? 0 : 1, transition: 'opacity 600ms ease', pointerEvents: isHovered ? 'none' : 'auto' }}>{renderLines(typedLeft)}</h1>
                            <h1 className={HC} style={{ gridArea: 'h', color: 'white', opacity: isHovered ? 1 : 0, transition: 'opacity 600ms ease', pointerEvents: isHovered ? 'auto' : 'none' }}>Ready to<br />Make</h1>
                        </div>
                    </div>

                    <div className="flex-shrink-0 relative z-10" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                        <Link href="/login" className="block relative">
                            <div className="w-[200px] h-[200px] md:w-[240px] md:h-[240px] lg:w-[280px] lg:h-[280px]" style={{ animation: 'spin 12s linear infinite' }}>
                                <svg viewBox="0 0 280 280" className="w-full h-full">
                                    <defs><path id="orbitPath" d="M 140,140 m -126,0 a 126,126 0 1,1 252,0 a 126,126 0 1,1 -252,0" /></defs>
                                    <text fontSize="14.5" fontWeight="700" letterSpacing="2" fill={isHovered ? 'white' : '#191F28'} style={{ transition: 'fill 700ms ease' }}>
                                        <textPath href="#orbitPath" startOffset="0%">{"Let's get in touch · Let's get in touch · Let's get in touch · Let's get in touch · Let's get in touch · Let's get in touch · "}</textPath>
                                    </text>
                                </svg>
                            </div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 select-none">
                                <div className="font-black transition-all duration-500" style={{ fontSize: 'clamp(40px, 6vw, 64px)', lineHeight: 1, color: isHovered ? 'white' : '#191F28', transform: isHovered ? 'translateY(-6px) rotate(-10deg)' : 'translateY(0px) rotate(0deg)' }}>↗</div>
                                <span className="font-bold tracking-tight transition-colors duration-700" style={{ fontSize: 'clamp(13px, 1.5vw, 16px)', color: isHovered ? 'rgba(255,255,255,0.9)' : '#4E5968' }}>시작하기</span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex-1 flex items-center justify-end">
                        <div className="grid text-right" style={{ gridTemplateAreas: '"h"' }}>
                            <h1 className={`${HC} text-right`} style={{ gridArea: 'h', color: isHovered ? 'white' : '#EE2924', opacity: isHovered ? 0 : 1, transition: 'opacity 600ms ease', pointerEvents: isHovered ? 'none' : 'auto' }}>{renderLines(typedRight)}</h1>
                            <h1 className={`${HC} text-right`} style={{ gridArea: 'h', color: 'white', opacity: isHovered ? 1 : 0, transition: 'opacity 600ms ease', pointerEvents: isHovered ? 'auto' : 'none' }}>Brands<br />Shine</h1>
                        </div>
                    </div>
                </main>

                <div className="flex-shrink-0 flex items-center justify-between px-8 md:px-12 py-5 z-20 relative">
                    <p className="text-[12px] font-bold tracking-widest uppercase transition-colors duration-700" style={{ color: isHovered ? 'rgba(255,255,255,0.4)' : '#D0D5DB' }}>AI-Powered Brand Analytics</p>
                    <motion.span animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-[11px] font-bold tracking-widest uppercase transition-colors duration-700" style={{ color: isHovered ? 'rgba(255,255,255,0.4)' : '#D0D5DB' }}>scroll</motion.span>
                </div>
            </div>

            {/* ══ 섹션 2: How It Works (다크) ══ */}
            <section className="bg-[#191F28] py-32 px-8 md:px-12 lg:px-20">
                <FadeIn className="max-w-7xl mx-auto">
                    <div className="border-b border-white/10 pb-16 mb-0">
                        <span className="text-[#EE2924] text-[12px] font-black tracking-[0.2em] uppercase">How It Works</span>
                        <h2 className="text-[48px] md:text-[64px] lg:text-[80px] font-black text-white mt-6 leading-none tracking-tight">
                            4단계 프로세스
                        </h2>
                    </div>
                </FadeIn>

                <div className="max-w-7xl mx-auto">
                    {STEPS.map((step, i) => (
                        <FadeIn key={i} delay={i * 0.1}>
                            <div className="flex items-start gap-8 md:gap-16 py-10 border-b border-white/10 group hover:pl-4 transition-all duration-500">
                                <span className="text-[#EE2924] text-[13px] font-black tracking-widest pt-2 w-8 flex-shrink-0">{step.num}</span>
                                <h3 className="text-white text-[28px] md:text-[36px] lg:text-[44px] font-black leading-none tracking-tight flex-1 group-hover:text-[#EE2924] transition-colors duration-500">{step.title}</h3>
                                <p className="text-white/40 text-[15px] font-medium leading-relaxed max-w-xs hidden md:block pt-2">{step.desc}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </section>

            {/* ══ 섹션 3: Features ══ */}
            <section className="bg-[#FAFAFA] py-32 px-8 md:px-12 lg:px-20">
                <FadeIn className="max-w-7xl mx-auto mb-20">
                    <span className="text-[#EE2924] text-[12px] font-black tracking-[0.2em] uppercase">Core Features</span>
                    <h2 className="text-[48px] md:text-[64px] lg:text-[80px] font-black text-[#191F28] mt-6 leading-none tracking-tight">
                        브랜드 분석의 모든 것
                    </h2>
                </FadeIn>

                <div className="max-w-7xl mx-auto space-y-0">
                    {FEATURES.map((feat, i) => (
                        <FadeIn key={i} delay={i * 0.07}>
                            <div className={`flex flex-col lg:flex-row gap-0 border-t border-[#E5E8EB] py-16 group ${i === FEATURES.length - 1 ? 'border-b' : ''}`}>
                                {/* 번호 */}
                                <div className="w-24 flex-shrink-0">
                                    <span className="text-[#EE2924] text-[13px] font-black tracking-widest">{feat.num}</span>
                                </div>
                                {/* 제목 */}
                                <div className="flex-1 lg:max-w-sm">
                                    <p className="text-[#ABB3BB] text-[12px] font-bold tracking-widest uppercase mb-3">{feat.label}</p>
                                    <h3 className="text-[32px] md:text-[40px] lg:text-[48px] font-black text-[#191F28] leading-none tracking-tight group-hover:text-[#EE2924] transition-colors duration-500">{feat.title}</h3>
                                </div>
                                {/* 설명 */}
                                <div className="flex-1 lg:pl-20 pt-6 lg:pt-2 flex items-end">
                                    <p className="text-[#4E5968] text-[17px] font-medium leading-relaxed whitespace-pre-line max-w-md">{feat.desc}</p>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </section>

            {/* ══ 섹션 4: CTA — 다크 좌우 분할 ══ */}
            <section className="relative bg-[#0E1117] overflow-hidden" style={{ minHeight: '100vh' }}>
                {/* 상단 레드 라인 */}
                <div className="w-full h-[5px] bg-[#EE2924]" />

                <div className="flex flex-col lg:flex-row" style={{ minHeight: 'calc(100vh - 5px)' }}>

                    {/* 왼쪽: 초대형 타이포그래피 */}
                    <FadeIn delay={0.05} className="flex-1 flex flex-col justify-center px-10 md:px-16 lg:px-20 py-24 border-b lg:border-b-0 lg:border-r border-white/8">
                        <p className="text-white/25 text-[11px] font-black tracking-[0.3em] uppercase mb-12">The Next Step</p>
                        <div>
                            <h2 className="text-[72px] md:text-[88px] lg:text-[96px] xl:text-[112px] font-black text-white leading-none tracking-tight">RPLAI로</h2>
                            <h2 className="text-[72px] md:text-[88px] lg:text-[96px] xl:text-[112px] font-black text-[#EE2924] leading-none tracking-tight">브랜드를</h2>
                            <h2 className="text-[72px] md:text-[88px] lg:text-[96px] xl:text-[112px] font-black text-white leading-none tracking-tight">완성하세요.</h2>
                        </div>
                        <p className="text-white/30 text-[15px] font-medium leading-relaxed mt-12 max-w-md">
                            분석부터 전략 수립, 콘텐츠 생성까지.<br />
                            브랜드의 모든 것을 AI가 처리합니다.
                        </p>
                    </FadeIn>

                    {/* 오른쪽: 발광 원형 CTA */}
                    <FadeIn delay={0.2} className="w-full lg:w-[440px] xl:w-[520px] flex-shrink-0 flex items-center justify-center py-24 px-10">
                        <div className="flex flex-col items-center gap-10">
                            <Link href="/login" className="group relative block">
                                {/* 외부 펄스 */}
                                <div className="absolute inset-0 rounded-full bg-[#EE2924] opacity-20 scale-110 group-hover:scale-125 group-hover:opacity-30 transition-all duration-700" />
                                <div className="absolute inset-0 rounded-full bg-[#EE2924] opacity-10 scale-125 group-hover:scale-150 group-hover:opacity-20 transition-all duration-1000" />

                                {/* 메인 버튼 원 */}
                                <div className="relative w-52 h-52 md:w-64 md:h-64 rounded-full bg-[#EE2924] flex flex-col items-center justify-center gap-2 group-hover:scale-105 active:scale-95 transition-all duration-400"
                                    style={{ boxShadow: '0 0 80px rgba(238,41,36,0.5), 0 0 160px rgba(238,41,36,0.2)' }}>
                                    <span className="text-white font-black text-[24px] md:text-[28px] tracking-tight">시작하기</span>
                                    <span className="text-white/60 text-[13px] font-bold tracking-widest uppercase">Start Now</span>
                                </div>
                            </Link>

                            {/* 하단 힌트 */}
                            <div className="text-center space-y-2">
                                <p className="text-white/20 text-[12px] font-bold tracking-widest uppercase">Ready to Make Brands Shine</p>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </section>


            {/* ══ Footer ══ */}
            {/* <Footer /> */}
        </div>
    );
}
