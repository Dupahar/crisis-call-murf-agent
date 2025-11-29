export interface MurfVoiceOptions {
  voiceId: string;
  style?: string;
  rate?: number;
  pitch?: number;
}

export async function generateSpeech(text: string, options: MurfVoiceOptions) {
  const apiKey = process.env.MURF_API_KEY;
  const apiSecret = process.env.MURF_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Murf API credentials not configured");
  }

  const response = await fetch("https://api.murf.ai/v1/speech/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
      "api-secret": apiSecret,
    },
    body: JSON.stringify({
      voiceId: options.voiceId || "en-US-falcon", // Default to Falcon if not specified
      text: text,
      style: options.style || "Angry", // "Angry" often sounds more urgent/loud in TTS models if "Terrified" isn't available
      rate: options.rate || 20, // +20% speed for urgency
      pitch: options.pitch || 0,
      format: "MP3",
      channelType: "MONO",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Murf API Error: ${JSON.stringify(error)}`);
  }

  return response.arrayBuffer();
}
