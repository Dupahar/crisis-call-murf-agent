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

async function testMurfGeneration() {
    const apiKey = process.env.MURF_API_KEY;
    if (!apiKey) {
        console.error("MURF_API_KEY not found");
        return;
    }

    console.log("Testing Murf Generation...");
    console.log("Voice: en-US-alina");
    console.log("Style: Terrified");

    try {
        const response = await fetch("https://api.murf.ai/v1/speech/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": apiKey,
            },
            body: JSON.stringify({
                voiceId: "en-US-alina",
                text: "I am trying to stay calm.",
                style: "Angry",
                rate: 10,
                pitch: 0,
                format: "MP3",
                channelType: "MONO",
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("❌ Murf API Error:", JSON.stringify(error, null, 2));
        } else {
            console.log("✅ Generation successful!");
        }

    } catch (error: any) {
        console.error("❌ Network/Script Error:", error.message);
    }
}

testMurfGeneration();
