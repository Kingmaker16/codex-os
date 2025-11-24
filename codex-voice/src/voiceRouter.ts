// Codex Voice OS v1.1 - Voice Routing & Hybrid TTS Engine Selection

import { synthesizeOpenAi } from "./tts/openaiTts.js";
import { synthesizeElevenLabs } from "./tts/elevenlabsTts.js";
import type { VoiceConfig } from "./config.js";

export type TtsMode = "fast" | "rich";

export interface SpeakOptions {
  fast?: boolean;
  voiceId?: string;
}

export class VoiceRouter {
  constructor(private config: VoiceConfig) {}

  async chooseTtsEngine(text: string, mode: TtsMode): Promise<Buffer> {
    if (mode === "fast") {
      console.log("🚀 Using fast TTS: OpenAI");
      return synthesizeOpenAi(text, "alloy", this.config.openaiApiKey);
    } else {
      console.log("💎 Using rich TTS: ElevenLabs");
      return synthesizeElevenLabs(
        text,
        this.config.defaultVoiceId,
        this.config.elevenlabsApiKey
      );
    }
  }

  async speak(text: string, options: SpeakOptions = {}): Promise<Buffer> {
    const mode: TtsMode = options.fast ? "fast" : "rich";
    return this.chooseTtsEngine(text, mode);
  }

  async routeToOrchestrator(
    sessionId: string,
    text: string,
    provider?: string
  ): Promise<string> {
    try {
      console.log(`📡 Routing to Orchestrator: "${text.substring(0, 50)}..."`);

      const response = await fetch(`${this.config.orchestratorUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          provider: provider || this.config.defaultProvider,
          model: "",
          messages: [{ role: "user", content: text }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Orchestrator returned ${response.status}`);
      }

      const data = await response.json();
      const replyText = (data as any).reply || "";
      
      console.log(`✅ Orchestrator reply: "${replyText.substring(0, 50)}..."`);
      return replyText;
    } catch (err) {
      console.error("❌ Failed to route to Orchestrator:", err);
      throw err;
    }
  }
}
