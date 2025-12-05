import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function debugMurf() {
    const apiKey = process.env.MURF_API_KEY;
    if (!apiKey) {
        console.error("Murf API Key not configured");
        return;
    }

    console.log("Sending request to Murf...");
    const response = await fetch("https://api.murf.ai/v1/speech/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
        },
        body: JSON.stringify({
            voiceId: "en-US-alina",
            text: "Help me! The fire is getting closer!",
            style: "Terrified",
            rate: 30,
            pitch: 10,
            format: "MP3",
            channelType: "MONO",
        }),
    });

    console.log("Response Status:", response.status);
    console.log("Response Headers:", JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

    if (!response.ok) {
        const error = await response.text();
        console.error("Murf API Error Body:", error);
        return;
    }

    const buffer = await response.arrayBuffer();
    console.log("Response Buffer Size:", buffer.byteLength);

    // Save to file to inspect
    fs.writeFileSync('debug_murf_output.mp3', Buffer.from(buffer));
    console.log("Saved output to debug_murf_output.mp3");

    // Check if it looks like a JSON error
    const text = Buffer.from(buffer).toString('utf-8').substring(0, 100);
    console.log("First 100 bytes as text:", text);
}

debugMurf();
