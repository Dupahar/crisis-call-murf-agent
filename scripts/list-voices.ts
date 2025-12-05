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

async function listVoices() {
    const apiKey = process.env.MURF_API_KEY;
    if (!apiKey) {
        console.error("Murf API Key not configured");
        return;
    }

    console.log("Fetching voices...");
    const response = await fetch("https://api.murf.ai/v1/speech/voices", {
        method: "GET",
        headers: {
            "api-key": apiKey,
        },
    });

    if (!response.ok) {
        console.error("Failed to fetch voices:", await response.text());
        return;
    }

    const voices = await response.json();

    // Filter for Indian English or relevant accents
    const indianVoices = voices.filter((v: any) =>
        v.locale === 'en-IN' ||
        v.displayName.includes('India') ||
        v.description?.includes('India')
    );

    console.log("Found Indian Voices:", JSON.stringify(indianVoices, null, 2));

    // Also list a few US voices just in case
    console.log("First 5 voices:", JSON.stringify(voices.slice(0, 5), null, 2));
}

listVoices();
