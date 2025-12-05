export interface MurfVoiceOptions {
  voiceId: string;
  style?: string;
  rate?: number;
  pitch?: number;
}

export async function generateSpeech(text: string, options: MurfVoiceOptions) {
  const apiKey = process.env.MURF_API_KEY;

  if (!apiKey) {
    throw new Error("Murf API credentials not configured");
  }

  const response = await fetch("https://api.murf.ai/v1/speech/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      voiceId: options.voiceId || "en-IN-isha", // Default to Isha (Indian English)
      text: text,
      style: options.style || "Conversational", // Fallback to Conversational
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

  const data = await response.json();
  if (!data.audioFile) {
    throw new Error("Murf API response missing audioFile URL");
  }

  const audioResponse = await fetch(data.audioFile);
  if (!audioResponse.ok) {
    throw new Error(`Failed to fetch audio from URL: ${data.audioFile}`);
  }

  return audioResponse.arrayBuffer();
}
