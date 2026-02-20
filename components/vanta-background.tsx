'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

export default function VantaBackground() {
    const vantaRef = useRef<HTMLDivElement>(null);
    const [vantaEffect, setVantaEffect] = useState<any>(null);
    const { theme } = useTheme();

    useEffect(() => {
        let effect: any = null;
        const loadVanta = async () => {
            if (!vantaEffect && vantaRef.current) {
                try {
                    // Dynamic import to avoid SSR issues
                    // @ts-ignore
                    const VantaHalo = (await import('vanta/dist/vanta.halo.min')).default;

                    if (VantaHalo) {
                        effect = VantaHalo({
                            el: vantaRef.current,
                            THREE: THREE,
                            mouseControls: true,
                            touchControls: true,
                            gyroControls: false,
                            minHeight: 200.00,
                            minWidth: 200.00,
                            baseColor: 0x6366f1,
                            backgroundColor: 0xf8fafc,
                            size: 1.5,
                            amplitudeFactor: 1.5,
                            xOffset: 0.1,
                            yOffset: 0.1
                        });
                        setVantaEffect(effect);
                    }
                } catch (error) {
                    console.error("Failed to load Vanta Halo:", error);
                }
            }
        };

        loadVanta();

        return () => {
            if (effect) effect.destroy();
        };
    }, []); // Run once on mount

    // Update background color on theme change
    useEffect(() => {
        if (vantaEffect) {
            const isDark = theme === 'dark';
            // Vanta might not support dynamic update perfectly, but setOptions usually works
            if (vantaEffect.setOptions) {
                vantaEffect.setOptions({
                    backgroundColor: isDark ? 0x020617 : 0xf8fafc,
                    baseColor: isDark ? 0x4f46e5 : 0x6366f1
                });
            }
        }
    }, [theme, vantaEffect]);

    return <div ref={vantaRef} className="absolute inset-0 -z-10 opacity-60" />;
}
