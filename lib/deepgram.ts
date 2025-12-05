import { createClient } from "@deepgram/sdk";

export const deepgram = createClient(process.env.DEEPGRAM_API_KEY || "");

export async function getDeepgramTempKey() {
    const apiKey = (process.env.DEEPGRAM_API_KEY || "").trim();
    if (!apiKey) throw new Error("Deepgram API key not found");

    const projectId = (process.env.DEEPGRAM_PROJECT_ID || "").trim();
    if (!projectId) {
        throw new Error("Deepgram Project ID not configured in .env.local");
    }

    const response = await fetch(`https://api.deepgram.com/v1/projects/${projectId}/keys`, {
        method: "POST",
        headers: {
            "Authorization": `Token ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            comment: "temp-key",
            scopes: ["usage:write"],
            time_to_live_in_seconds: 60,
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Deepgram API Error: ${response.status} ${response.statusText} - ${text}`);
    }

    const result = await response.json();
    return result;
}
