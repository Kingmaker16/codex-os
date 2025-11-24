// Codex Voice OS v2 - Audio Router

import { ConversationLoop } from "./conversationLoop.js";

export interface AudioRoute {
  sessionId: string;
  active: boolean;
  inputSource: "microphone" | "file" | "stream";
  sttEngine: "openai" | "whisper" | "deepgram";
}

/**
 * Routes microphone data → STT engine → conversationLoop
 */
export class AudioRouter {
  private routes: Map<string, AudioRoute> = new Map();
  private conversationLoop: ConversationLoop;

  constructor(conversationLoop: ConversationLoop) {
    this.conversationLoop = conversationLoop;
  }

  /**
   * Start routing audio for a session
   */
  async startRouting(
    sessionId: string,
    options?: {
      inputSource?: "microphone" | "file" | "stream";
      sttEngine?: "openai" | "whisper" | "deepgram";
    }
  ): Promise<AudioRoute> {
    const route: AudioRoute = {
      sessionId,
      active: true,
      inputSource: options?.inputSource || "microphone",
      sttEngine: options?.sttEngine || "openai",
    };

    this.routes.set(sessionId, route);
    console.log(`🎤 [AudioRouter] Started routing for session: ${sessionId}`);
    console.log(`   Input: ${route.inputSource} → STT: ${route.sttEngine}`);

    // In production, this would:
    // 1. Open microphone stream
    // 2. Configure STT engine
    // 3. Start continuous audio capture
    // 4. Process audio frames through STT
    // 5. Feed transcribed text to conversationLoop

    return route;
  }

  /**
   * Stop routing audio for a session
   */
  stopRouting(sessionId: string): boolean {
    const route = this.routes.get(sessionId);
    if (!route) return false;

    route.active = false;
    console.log(`🛑 [AudioRouter] Stopped routing for session: ${sessionId}`);

    // In production, cleanup audio stream and STT connection
    return true;
  }

  /**
   * Process audio chunk (called by audio capture system)
   */
  async processAudioChunk(
    sessionId: string,
    audioData: Buffer
  ): Promise<{ ok: boolean; transcription?: string; error?: string }> {
    const route = this.routes.get(sessionId);
    if (!route || !route.active) {
      return { ok: false, error: "No active route for session" };
    }

    try {
      // In production:
      // 1. Send audioData to STT engine
      // 2. Get transcription
      // 3. Feed to conversationLoop.processInput()

      // STUB: Mock transcription
      const transcription = `[STT Mock] Audio chunk received (${audioData.length} bytes)`;
      console.log(`🎧 [AudioRouter] Transcribed: "${transcription}"`);

      return { ok: true, transcription };
    } catch (err: any) {
      console.error(`❌ [AudioRouter] Processing failed:`, err);
      return { ok: false, error: err?.message };
    }
  }

  /**
   * Manually inject transcribed text (for testing without real audio)
   */
  async injectText(
    sessionId: string,
    text: string,
    options?: { fast?: boolean }
  ): Promise<any> {
    const route = this.routes.get(sessionId);
    if (!route || !route.active) {
      return { ok: false, error: "No active route for session" };
    }

    console.log(`💬 [AudioRouter] Injecting text: "${text}"`);
    return await this.conversationLoop.processInput(sessionId, text, options);
  }

  /**
   * Get route status
   */
  getRoute(sessionId: string): AudioRoute | undefined {
    return this.routes.get(sessionId);
  }

  /**
   * Get all active routes
   */
  getAllRoutes(): AudioRoute[] {
    return Array.from(this.routes.values()).filter((r) => r.active);
  }
}
