// Codex Voice OS v2 - Enhanced Barge-In Detection

export interface BargeInState {
  isSpeaking: boolean;
  lastBargeInTime: Date | null;
  bargeInCount: number;
}

class BargeInV2Manager {
  private state: BargeInState = {
    isSpeaking: false,
    lastBargeInTime: null,
    bargeInCount: 0,
  };

  private audioPlaybackController: AbortController | null = null;

  /**
   * Called when AI starts speaking (TTS playback begins)
   */
  startSpeaking(): void {
    this.state.isSpeaking = true;
    this.audioPlaybackController = new AbortController();
    console.log("🔊 [BargeInV2] AI started speaking");
  }

  /**
   * Called when AI stops speaking (TTS playback ends)
   */
  stopSpeaking(): void {
    this.state.isSpeaking = false;
    this.audioPlaybackController = null;
    console.log("🔇 [BargeInV2] AI stopped speaking");
  }

  /**
   * Detect user speech during TTS and cancel audio instantly
   */
  handleBargeIn(): void {
    if (!this.state.isSpeaking) return;

    console.log("⚡ [BargeInV2] Barge-in detected! Canceling audio playback...");

    // Cancel ongoing audio playback
    if (this.audioPlaybackController) {
      this.audioPlaybackController.abort();
      this.audioPlaybackController = null;
    }

    // Update state
    this.state.isSpeaking = false;
    this.state.lastBargeInTime = new Date();
    this.state.bargeInCount++;

    // In production, this would:
    // 1. Stop audio output to speakers immediately
    // 2. Clear TTS playback buffer
    // 3. Signal to conversation loop to accept new input
  }

  /**
   * Check if AI is currently speaking
   */
  isCurrentlySpeaking(): boolean {
    return this.state.isSpeaking;
  }

  /**
   * Get barge-in statistics
   */
  getStats(): BargeInState {
    return { ...this.state };
  }

  /**
   * Reset barge-in counter
   */
  resetStats(): void {
    this.state.bargeInCount = 0;
    this.state.lastBargeInTime = null;
  }

  /**
   * Get abort controller for audio playback (advanced usage)
   */
  getAudioController(): AbortController | null {
    return this.audioPlaybackController;
  }
}

// Singleton instance
export const bargeInV2Manager = new BargeInV2Manager();
