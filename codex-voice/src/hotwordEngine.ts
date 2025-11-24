// Codex Voice OS v1.1 - Hotword/Wake-Word Engine (Stub)
// Full implementation will use Web Speech API or Porcupine

type WakeWordCallback = () => void;

class HotwordEngine {
  private isListening: boolean = false;
  private callbacks: WakeWordCallback[] = [];

  async start(): Promise<void> {
    if (this.isListening) {
      console.log("⚠️  Wake-word engine already running");
      return;
    }

    this.isListening = true;
    console.log("🎤 Wake-word engine stub started");
    console.log("   TODO: Integrate Web Speech API or Porcupine for 'Hey Codex' detection");
    
    // Simulate wake-word detection for testing
    if (process.env.CODEX_WAKEWORD_ENABLED === "true") {
      console.log("   Wake-word detection ENABLED (stub mode)");
    } else {
      console.log("   Wake-word detection DISABLED (set CODEX_WAKEWORD_ENABLED=true)");
    }
  }

  stop(): void {
    this.isListening = false;
    this.callbacks = [];
    console.log("🛑 Wake-word engine stopped");
  }

  onWakeWord(callback: WakeWordCallback): void {
    this.callbacks.push(callback);
  }

  // Simulate wake-word detection (for testing)
  simulateWakeWord(): void {
    if (!this.isListening) return;
    
    console.log("👂 Wake-word detected: 'Hey Codex'");
    this.callbacks.forEach(cb => cb());
  }

  getStatus(): { listening: boolean; enabled: boolean } {
    return {
      listening: this.isListening,
      enabled: process.env.CODEX_WAKEWORD_ENABLED === "true",
    };
  }
}

export const hotwordEngine = new HotwordEngine();

export async function startWakeWordListener(): Promise<void> {
  await hotwordEngine.start();
}

export function stopWakeWordListener(): void {
  hotwordEngine.stop();
}
