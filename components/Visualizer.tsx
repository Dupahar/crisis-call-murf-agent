"use client";

import { useEffect, useRef } from "react";

interface VisualizerProps {
    isListening: boolean;
    isSpeaking: boolean;
    isPanic: boolean;
}

export function Visualizer({ isListening, isSpeaking, isPanic }: VisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let step = 0;

        const draw = () => {
            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            const centerY = height / 2;
            const amplitude = isListening || isSpeaking ? 30 : 5;
            const frequency = isListening || isSpeaking ? 0.1 : 0.05;
            const speed = isListening || isSpeaking ? 0.2 : 0.05;

            ctx.beginPath();
            ctx.moveTo(0, centerY);

            for (let x = 0; x < width; x++) {
                const y = centerY + Math.sin(x * frequency + step) * amplitude * Math.sin(x / width * Math.PI);
                ctx.lineTo(x, y);
            }

            // Panic = Red, Speaking = Green, Listening = Blue, Idle = Gray
            ctx.strokeStyle = isPanic ? "#ef4444" : isSpeaking ? "#10b981" : isListening ? "#3b82f6" : "#6b7280";
            ctx.lineWidth = 3;
            ctx.stroke();

            step += speed;
            animationId = requestAnimationFrame(draw);
        };

        draw();

        return () => cancelAnimationFrame(animationId);
    }, [isListening, isSpeaking]);

    return (
        <canvas
            ref={canvasRef}
            width={300}
            height={100}
            className="w-full h-24"
        />
    );
}
