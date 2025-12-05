import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function verifyDeepgram() {
    console.log('\n--- Verifying Deepgram ---');
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
        console.log('❌ Deepgram API Key missing in .env.local');
        return;
    }

    try {
        console.log('Testing Deepgram API...');
        const projectId = process.env.DEEPGRAM_PROJECT_ID;
        if (!projectId) {
            console.log('❌ Deepgram Project ID missing.');
            return;
        }

        console.log(`Using Project ID: ${projectId}`);

        const response = await fetch(`https://api.deepgram.com/v1/projects/${projectId}/keys`, {
            method: "POST",
            headers: {
                "Authorization": `Token ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                comment: "verify-key",
                scopes: ["usage:write"],
                time_to_live_in_seconds: 60,
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Deepgram API Error: ${response.statusText} (${response.status}) - ${text}`);
        }

        const data = await response.json();
        console.log('✅ Deepgram API check passed (Key and Project ID are valid)');
        console.log('   Temp Key ID:', data.api_key_id);

    } catch (error: any) {
        console.log('❌ Deepgram API check failed:', error.message);
    }
}

verifyDeepgram();
