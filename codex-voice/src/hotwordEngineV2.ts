// Codex Voice OS v2 - Enhanced Wake-Word Engine

import { loadConfig } from "./config.js";

export interface HotwordStatus {
  enabled: boolean;
  listening: boolean;
  phrase: string;
  detectionCount: number;
  lastDetection: Date | null;
}

class HotwordEngineV2 {
  private status: HotwordStatus = {
    enabled: false,
    listening: false,
    phrase: "hey codex",
    detectionCount: 0,
    lastDetection: null,
  };

  private detectionCallback: (() => void) | null = null;

  constructor() {
    // Check environment variable for wake-word enablement
    const enabled = process.env.VOICE_WAKEWORD_ENABLED === "true";
    this.status.enabled = enabled;

    if (enabled) {
      console.log(`🎯 [HotwordV2] Wake-word detection enabled: "${this.status.phrase}"`);
    } else {
      console.log("⏸️  [HotwordV2] Wake-word detection disabled (set VOICE_WAKEWORD_ENABLED=true to enable)");
    }
  }

  /**
   * Start listening for wake-word
   */
  async start(callback?: () => void): Promise<void> {
    if (!this.status.enabled) {
      console.log("⚠️  [HotwordV2] Cannot start - wake-word detection is disabled");
      return;
    }

    this.status.listening = true;
    this.detectionCallback = callback || null;

    console.log(`👂 [HotwordV2] Started listening for "${this.status.phrase}"...`);

    // In production, this would:
    // 1. Initialize Porcupine/Snowboy/Picovoice wake-word engine
    // 2. Start continuous audio stream from microphone
    // 3. Run wake-word detection model on audio frames
    // 4. Trigger callback when wake-word detected

    // STUB: Simulate background listening
    this.startBackgroundListener();
  }

  /**
   * Stop listening for wake-word
   */
  stop(): void {
    if (!this.status.listening) return;

    this.status.listening = false;
    console.log("🛑 [HotwordV2] Stopped wake-word listening");

    // In production, release audio stream and cleanup wake-word engine
  }

  /**
   * Simulate wake-word detection (for testing)
   */
  simulateDetection(): void {
    if (!this.status.enabled) {
      console.log("⚠️  [HotwordV2] Cannot simulate - wake-word detection is disabled");
      return;
    }

    console.log(`✨ [HotwordV2] Wake-word detected: "${this.status.phrase}"`);
    this.status.detectionCount++;
    this.status.lastDetection = new Date();

    if (this.detectionCallback) {
      this.detectionCallback();
    }
  }

  /**
   * Get current status
   */
  getStatus(): HotwordStatus {
    return { ...this.status };
  }

  /**
   * Change wake-word phrase
   */
  setPhrase(phrase: string): void {
    this.status.phrase = phrase.toLowerCase();
    console.log(`🔄 [HotwordV2] Wake-word changed to: "${this.status.phrase}"`);
  }

  /**
   * Background listener loop (stub implementation)
   */
  private startBackgroundListener(): void {
    // In production, this would be a continuous audio processing loop
    // For now, it's a placeholder that can be triggered via simulateDetection()
    console.log("🔄 [HotwordV2] Background listener active (stub mode)");
  }
}

// Singleton instance
export const hotwordEngineV2 = new HotwordEngineV2();

/**
 * Start wake-word listener with callback
 */
export async function startWakeWordV2(callback?: () => void): Promise<void> {
  await hotwordEngineV2.start(callback);
}

/**
 * Stop wake-word listener
 */
export function stopWakeWordV2(): void {
  hotwordEngineV2.stop();
}
