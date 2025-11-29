import { createClient } from "@deepgram/sdk";

export const deepgram = createClient(process.env.DEEPGRAM_API_KEY || "");

export async function getDeepgramTempKey() {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) throw new Error("Deepgram API key not found");

    const projectId = process.env.DEEPGRAM_PROJECT_ID;
    if (!projectId) {
        // If no project ID, we can't create a temp key via API easily without listing projects first.
        // But for now, let's assume the user provides it or we fail.
        // Alternatively, we can just return the API key if it's safe (it's not).
        // Let's try to list projects if ID is missing? No, too complex.
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
        throw new Error(`Deepgram API Error: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
}
