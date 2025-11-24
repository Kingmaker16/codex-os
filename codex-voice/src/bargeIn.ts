// Codex Voice OS v1.1 - Barge-In State Management

export class BargeInManager {
  private isSpeaking: boolean = false;
  private currentAudioStream: any = null;

  startSpeaking(audioStream?: any): void {
    this.isSpeaking = true;
    this.currentAudioStream = audioStream;
    console.log("🗣️  Codex started speaking");
  }

  stopSpeaking(): void {
    this.isSpeaking = false;
    if (this.currentAudioStream) {
      // TODO: Actually stop audio playback when streaming is implemented
      this.currentAudioStream = null;
    }
    console.log("🤐 Codex stopped speaking");
  }

  handleBargeIn(): boolean {
    if (this.isSpeaking) {
      console.log("⚡ Barge-in detected! Stopping current speech");
      this.stopSpeaking();
      return true;
    }
    return false;
  }

  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const bargeInManager = new BargeInManager();
