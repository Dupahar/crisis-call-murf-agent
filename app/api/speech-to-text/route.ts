import { NextResponse } from "next/server";
import { deepgram } from "@/lib/deepgram";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const apiKey = process.env.DEEPGRAM_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Deepgram API key not configured" }, { status: 500 });
        }

        // In a production app, you might want to create a temporary key
        // For this hackathon, we'll just return a success signal or a temp key if using the SDK on client
        // Actually, Deepgram SDK on client needs a key.
        // Let's generate a temporary key.

        const { result, error } = await import("@/lib/deepgram").then(m => m.getDeepgramTempKey().then(res => ({ result: res, error: null })).catch(err => ({ result: null, error: err })));

        if (error) {
            throw error;
        }

        return NextResponse.json({ key: result.key });
    } catch (error) {
        console.error("Deepgram Token Error:", error);
        // Fallback: return the env key directly (Hackathon mode)
        return NextResponse.json({ key: process.env.DEEPGRAM_API_KEY });
    }
}
