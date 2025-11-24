// Codex Voice OS v1.1 - Speech-to-Text via OpenAI Whisper

export async function transcribeAudioChunk(
  audioBuffer: Buffer,
  apiKey?: string
): Promise<string> {
  // TODO: Implement actual OpenAI Whisper API integration
  // For v1.1, return a stub transcription

  if (!apiKey) {
    console.log("🎙️  STT stub: no OpenAI API key, simulating transcription");
    return "[STT STUB] Transcribed audio chunk";
  }

  // TODO: Call OpenAI Whisper API
  // POST https://api.openai.com/v1/audio/transcriptions
  // with multipart/form-data: file=audioBuffer, model="whisper-1"

  console.log("🎙️  STT: Transcribing audio chunk (stub)");
  return "[STT STUB] Transcribed audio chunk";
}

export async function transcribeStream(
  audioStream: AsyncIterable<Buffer>,
  apiKey?: string
): Promise<string> {
  // TODO: Implement streaming STT for real-time transcription
  console.log("🎙️  STT: Streaming transcription (stub)");
  return "[STT STUB] Streaming transcription";
}
