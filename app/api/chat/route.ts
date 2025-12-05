import { NextResponse } from "next/server";
import { getCrisisResponse } from "@/lib/gemini";

export async function POST(request: Request) {
    try {
        const { messages } = await request.json();
        console.log("Chat API Request Messages:", JSON.stringify(messages, null, 2));
        const response = await getCrisisResponse(messages);
        console.log("Chat API Response:", response);
        return NextResponse.json({ response });
    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to get chat response" }, { status: 500 });
    }
}
