import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

// --- Murf Logic ---
async function verifyMurf() {
    console.log('\n--- Verifying Murf AI ---');
    const apiKey = process.env.MURF_API_KEY;
    if (!apiKey) {
        console.log('❌ Murf API Key missing in .env.local');
        return;
    }

    try {
        // We know this works now, just doing a quick check
        const response = await fetch("https://api.murf.ai/v1/speech/voices", {
            method: "GET",
            headers: {
                "api-key": apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Murf API Error: ${response.statusText}`);
        }
        console.log(`✅ Murf API check passed.`);
    } catch (error: any) {
        console.log('❌ Murf API check failed:', error.message);
    }
}

// --- Gemini Logic ---
async function verifyGemini() {
    console.log('\n--- Verifying Gemini Pro ---');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log('❌ Gemini API Key missing in .env.local');
        return;
    }

    try {
        console.log('Listing Gemini Models via REST API...');
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Gemini API Error: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        const models = data.models || [];
        console.log(`✅ Gemini API check passed. Found ${models.length} models.`);

        const geminiModels = models.filter((m: any) => m.name.includes('gemini'));
        console.log('Available Gemini models:', geminiModels.map((m: any) => m.name).join(', '));

        if (geminiModels.length > 0) {
            // Try the first one
            const modelName = geminiModels[0].name.replace('models/', '');
            console.log(`Testing with model: ${modelName}...`);
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log('✅ Generation successful:', response.text().substring(0, 20) + "...");
        }

    } catch (error: any) {
        console.log('❌ Gemini API check failed:', error.message);
    }
}

async function main() {
    await verifyMurf();
    await verifyGemini();
}

main();
