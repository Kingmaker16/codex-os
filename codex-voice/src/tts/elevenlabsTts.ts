// Codex Voice OS v1.1 - Text-to-Speech via ElevenLabs

export async function synthesizeElevenLabs(
  text: string,
  voiceId: string,
  apiKey?: string
): Promise<Buffer> {
  if (!apiKey) {
    console.log("🔊 ElevenLabs TTS stub: no API key, returning placeholder");
    return Buffer.from("ELEVENLABS_TTS_STUB");
  }

  try {
    console.log(`🔊 ElevenLabs TTS: Synthesizing "${text.substring(0, 50)}..."`);

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ ElevenLabs TTS error:", response.status, errorText);
      throw new Error(`ElevenLabs TTS failed: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`✅ ElevenLabs TTS: Generated ${buffer.length} bytes`);
    return buffer;
  } catch (err) {
    console.error("❌ ElevenLabs TTS error:", err);
    throw err;
  }
}

export async function synthesizeElevenLabsStream(
  text: string,
  voiceId: string,
  apiKey?: string
): Promise<AsyncIterable<Buffer>> {
  if (!apiKey) {
    console.log("🔊 ElevenLabs TTS stream stub: no API key");
    async function* stub() {
      yield Buffer.from("ELEVENLABS_TTS_STREAM_STUB");
    }
    return stub();
  }

  // TODO: Implement streaming synthesis with ElevenLabs WebSocket API
  console.log("🔊 ElevenLabs TTS: Streaming synthesis (fallback to full synthesis)");
  
  const fullAudio = await synthesizeElevenLabs(text, voiceId, apiKey);
  
  async function* stream() {
    yield fullAudio;
  }
  
  return stream();
}
