import { NextResponse } from "next/server";
import { generateSpeech } from "@/lib/murf";

export async function POST(request: Request) {
    try {
        const { text, voiceId, style, rate, pitch } = await request.json();
        console.log(`TTS Request: Text="${text?.substring(0, 50)}...", Style=${style}, Rate=${rate}`);

        const audioBuffer = await generateSpeech(text, { voiceId, style, rate, pitch });

        return new NextResponse(audioBuffer, {
            headers: {
                "Content-Type": "audio/mpeg",
            },
        });
    } catch (error: any) {
        console.error("TTS API Error Details:", error.message);
        return NextResponse.json({ error: error.message || "Failed to generate speech" }, { status: 500 });
    }
}
