import { NextResponse } from "next/server";
import { generateSpeech } from "@/lib/murf";

export async function POST(request: Request) {
    try {
        const { text, voiceId, style, rate, pitch } = await request.json();
        const audioBuffer = await generateSpeech(text, { voiceId, style, rate, pitch });

        return new NextResponse(audioBuffer, {
            headers: {
                "Content-Type": "audio/mpeg",
            },
        });
    } catch (error) {
        console.error("TTS API Error:", error);
        return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 });
    }
}
