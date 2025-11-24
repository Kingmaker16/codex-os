// Codex Voice OS v1.1 - Configuration

export interface VoiceConfig {
  port: number;
  openaiApiKey?: string;
  elevenlabsApiKey?: string;
  orchestratorUrl: string;
  defaultProvider: string;
  defaultVoiceId: string;
}

export function loadConfig(): VoiceConfig {
  const port = Number(process.env.VOICE_PORT ?? 9001);
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;

  if (!openaiApiKey) {
    console.warn("⚠️  OPENAI_API_KEY not set - OpenAI TTS will be stubbed");
  }

  if (!elevenlabsApiKey) {
    console.warn("⚠️  ELEVENLABS_API_KEY not set - ElevenLabs TTS will be stubbed");
  }

  return {
    port,
    openaiApiKey,
    elevenlabsApiKey,
    orchestratorUrl: process.env.ORCHESTRATOR_URL ?? "http://localhost:4200",
    defaultProvider: "openai",
    defaultVoiceId: "21m00Tcm4TlvDq8ikWAM", // ElevenLabs Rachel voice
  };
}
