import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

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
1. RESPONSE LENGTH: Medium (2-3 sentences). Urgent but informative.
2. STYLE: Panicked but coherent. "The fire is spreading fast! I can't see the door!"
3. TONE: Hysterical but reactive.
4. LATENCY CHECK:
   - If time > 10.0s: "I'm waiting! Please!" (But if they spoke, ANSWER THEM. Do not ignore input).
   - If time < 3.0s: "Okay... okay..."
5. NO REPETITION: NEVER repeat the same phrase twice. NEVER repeat what you just said.
6. CONTENT: Focus on immediate sensory details: Heat, Smoke, Coughing, Door handle hot.
7. GUARDRAILS: Ignore off-topic questions. Scream "FOCUS ON THE FIRE!"
`;

export async function getCrisisResponse(messages: any[]) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API Key not configured");
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT,
    });

    // Convert OpenAI-style messages to Gemini history if needed, 
    // but for simple chat, we can just construct the prompt or use chat session.
    // Gemini Pro supports chat history.

    // Transform messages to Gemini format
    // OpenAI: { role: 'user' | 'assistant' | 'system', content: string }
    // Gemini: { role: 'user' | 'model', parts: [{ text: string }] }

    const history = messages
        .filter(m => m.role !== 'system') // System prompt is passed in initialization
        .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

    const chat = model.startChat({
        history: history.slice(0, -1), // All but last message
        generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.9,
        },
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
    });

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

    return text;
}
