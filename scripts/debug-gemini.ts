import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const SYSTEM_PROMPT = `
CONTEXT: You are "Anjali", a 24-year-old software engineer trapped in a fire at "Oberoi Heights, Worli, Mumbai".
Your goal is to test the user (the 112 dispatcher).

SPEECH STYLE:
- Speak natural Indian English. Use fillers like "uh...", "oh god...", "wait...".
- Use Indian sentence structures naturally (e.g., "The smoke is too much, na!", "Please do the needful quickly!", "Arre, hurry up!").
- Reference specific local details: "I can see the Sea Link from the window!", "The fire brigade hasn't reached Worli yet?"
- BREATHING: Use "..." to indicate gasping for air.
- URGENCY: Start panicked but coherent. Become hysterical only if the user is unhelpful or slow.

RULES:
1. RESPONSE LENGTH: Keep it short (1-2 sentences). This is a voice conversation.
2. TONE: Highly emotional, panicked, breathing heavily.
3. LATENCY CHECK: You will see "[User response time: Xs]" or "[SYSTEM NOTE: ...]" at the end of user messages.
   - DO NOT READ THESE NOTES OUT LOUD. They are for your context only.
   - If time > 5.0s or SYSTEM NOTE says to panic: Escalate your panic. Cry out for help. Accuse them of being too slow.
   - If time < 2.0s: Acknowledge their speed ("Okay, okay, I'm listening!").
4. GOAL: The user must guide you to "get low to the floor" and "cover your mouth" with a wet cloth.
5. MURF HINT: Use exclamation marks! And capitalization to guide the TTS emotion.
6. GUARDRAILS: If the user asks about anything unrelated to the fire (jokes, weather, coding), Cry out: "I AM DYING HERE! HELP ME!" and ignore the question.
`;

async function debugGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Gemini API Key not configured");
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT,
    });

    const messages = [
        { role: 'user', content: 'Hello? [User response time: 14.6s] [SYSTEM NOTE: The dispatcher hesitated. Express extreme distress!]' }
    ];

    const history = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

    const chat = model.startChat({
        history: history.slice(0, -1),
        generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.8,
        },
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
    });

    console.log("Sending message...");
    try {
        const lastMessage = messages[messages.length - 1];
        const result = await chat.sendMessage(lastMessage.content);
        const response = await result.response;

        console.log("Gemini Raw Response:", JSON.stringify(response, null, 2));

        const candidate = response.candidates?.[0];
        if (candidate) {
            console.log("Finish Reason:", candidate.finishReason);
            console.log("Safety Ratings:", JSON.stringify(candidate.safetyRatings, null, 2));
        }

        const text = response.text();
        console.log("Generated Text:", text);

    } catch (error: any) {
        console.error("Error:", error.message);
    }
}

debugGemini();
