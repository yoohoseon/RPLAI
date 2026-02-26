'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function PublicHeader() {
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            setIsHovered(detail.hovered);
        };
        window.addEventListener('landing-hover', handler);
        return () => window.removeEventListener('landing-hover', handler);
    }, []);

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-700"
            style={{
                borderBottomColor: isHovered ? 'rgba(255,255,255,0.15)' : 'rgba(229,231,235,0.5)',
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid',
                backgroundColor: isHovered ? 'rgba(238,41,36,0.4)' : 'rgba(255,255,255,0.3)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
            }}
        >
            <div className="flex h-16 items-center px-8 justify-between">
                <div className="font-bold text-xl">
                    <Link href="/" className="hover:opacity-80 transition-opacity flex items-center">
                        <div className="relative w-24 h-8">
                            <Image
                                src="/rplai_logo.svg"
                                alt="RPLAI"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>
                </div>

                {/* Optional: Login link in header */}
                <Link
                    href="/login"
                    className="text-[14px] font-bold transition-colors duration-700"
                    style={{ color: isHovered ? 'rgba(255,255,255,0.9)' : '#8B95A1' }}
                >
                    로그인
                </Link>
            </div>
        </header>
    );
}
