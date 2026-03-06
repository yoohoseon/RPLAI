'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function Footer() {
    const pathname = usePathname();
    const footerText = "© 2026 RPLAI. Powered by Goldenax. All rights reserved.";

    // Hide footer on analysis page since we show it in the sidebar
    if (pathname?.includes('/main/da/analysis')) {
        return null;
    }

    // 글자 하나하나에 적용될 애니메이션
    const letterVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.1 } // 각 글자가 나타나는 속도
        }
    };

    return (
        <footer className="w-full py-10 bg-transparent border-none mt-auto">
            <div className="w-full px-4">
                <motion.p
                    className="text-center text-[#8B95A1] text-[14px] font-normal"
                    initial="hidden"
                    whileInView="visible" // 스크롤이 도달했을 때 실행
                    viewport={{ once: false }}
                    transition={{ staggerChildren: 0.03 }} // 타이핑 속도
                >
                    {footerText.split("").map((char, index) => (
                        <motion.span key={index} variants={letterVariants}>
                            {char}
                        </motion.span>
                    ))}
                </motion.p>
            </div>
        </footer>
    );
}