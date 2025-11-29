import { NextResponse } from "next/server";
import { getCrisisResponse } from "@/lib/openai";

export async function POST(request: Request) {
    try {
        const { messages } = await request.json();
        const response = await getCrisisResponse(messages);
        return NextResponse.json({ response });
    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: "Failed to get chat response" }, { status: 500 });
    }
}
