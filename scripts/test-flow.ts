import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { getCrisisResponse } from '../lib/gemini';
import { generateSpeech } from '../lib/murf';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function testFlow() {
    console.log('\n--- Testing Integration Flow ---');

    // 1. Chat (Gemini)
    console.log('1. Testing Chat (Gemini)...');
    let chatResponse = "";
    try {
        const messages = [
            { role: 'user', content: 'Help! There is a fire!' }
        ];
        chatResponse = await getCrisisResponse(messages);
        console.log('✅ Chat Response:', chatResponse);
    } catch (error: any) {
        console.error('❌ Chat failed:', error.message);
        return;
    }

    // 2. TTS (Murf)
    console.log('\n2. Testing TTS (Murf)...');
    try {
        if (!chatResponse) {
            console.log('⚠️ Skipping TTS because chat response was empty.');
            return;
        }
        const audioBuffer = await generateSpeech(chatResponse, {
            voiceId: 'en-US-alina',
            style: 'Angry',
            rate: 20
        });
        console.log(`✅ TTS Generated. Buffer size: ${audioBuffer.byteLength} bytes`);
    } catch (error: any) {
        console.error('❌ TTS failed:', error.message);
    }
}

testFlow();
