'use client';

import { useEffect, useRef } from 'react';

export default function InteractiveBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let mouse = { x: -1000, y: -1000 };

        const GAP = 15; // Denser grid
        const BASE_RADIUS = 1.5;
        const MAX_RADIUS = 8;
        const PROXIMITY_RADIUS = 150;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // No need to clear here, draw loop handles it
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const cols = Math.ceil(canvas.width / GAP);
            const rows = Math.ceil(canvas.height / GAP);

            const time = Date.now() * 0.003; // Time factor for animation

            ctx.fillStyle = '#000000';

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = i * GAP + GAP / 2;
                    const y = j * GAP + GAP / 2;

                    const dx = mouse.x - x;
                    const dy = mouse.y - y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // 1. Base Ambient Motion (Wave/Breathing)
                    // Creates a gentle wave moving diagonally
                    const ambientFactor = Math.sin(time + x * 0.01 + y * 0.01);
                    // Maps -1..1 to slight radius change, e.g., 1.5 to 2.5
                    let radius = BASE_RADIUS + ambientFactor * 0.5;

                    // 2. Mouse Interaction (Target Effect)
                    if (dist < PROXIMITY_RADIUS) {
                        const scale = 1 - Math.min(dist / PROXIMITY_RADIUS, 1);
                        const easedScale = scale * scale * scale; // Cubic ease for sharper dropoff
                        radius += (MAX_RADIUS - BASE_RADIUS) * easedScale;
                    }

                    ctx.beginPath();
                    ctx.arc(x, y, Math.max(0, radius), 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        const handleMouseMove = (event: MouseEvent) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        }

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseLeave);

        resizeCanvas();
        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <>
            <canvas
                ref={canvasRef}
                className="fixed top-0 left-0 w-full h-full z-0 bg-white"
            />
            {/* Glass/Fog Overlay */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-white/10 backdrop-blur-[3px]" />
            {/* Optional: Vignette or Noise for more texture if requested, but sticking to blur for now */}
        </>
    );
}
