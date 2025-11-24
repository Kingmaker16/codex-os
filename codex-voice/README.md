# Codex Voice OS v1.1

Hybrid voice support for Codex OS with OpenAI Realtime + ElevenLabs TTS, wake-word detection, and barge-in capabilities.

## Features

- **Hybrid TTS Engine**: Fast (OpenAI) + Rich (ElevenLabs)
- **STT Integration**: OpenAI Whisper (stub for v1.1)
- **Wake-Word Detection**: "Hey Codex" listener (stub)
- **Barge-In**: Interrupt Codex while speaking
- **WebSocket Audio**: Real-time bidirectional audio streaming
- **Orchestrator Integration**: Voice → Text → AI → Voice pipeline

## Quick Start

```bash
# Start via Boot Manager
cd ~/Codex
npm run codex:start

# Or standalone
cd codex-voice
npm start
```

## Endpoints

### HTTP (Port 9001)

#### Health Check
```bash
GET /health
Response: { "ok": true, "service": "codex-voice", "version": "1.1.0" }
```

#### Status
```bash
GET /voice/status
Response: {
  "ok": true,
  "wakeWord": { "listening": true, "enabled": false },
  "bargeIn": { "speaking": false }
}
```

#### TTS Test
```bash
POST /voice/text
Body: {
  "text": "Hello from Codex",
  "fast": true  # true = OpenAI, false = ElevenLabs
}
```

#### Voice Command (Full Pipeline)
```bash
POST /voice/command
Body: {
  "sessionId": "session-1",
  "text": "Your spoken input",
  "provider": "openai",
  "fast": false
}

Response: {
  "ok": true,
  "sessionId": "session-1",
  "userText": "Your spoken input",
  "replyText": "Codex response",
  "voiceMode": "hybrid",
  "ttsEngine": "elevenlabs",
  "audioSize": 12345,
  "audioBase64": "..."
}
```

### WebSocket (Port 9002)

```javascript
// Connect to audio stream
const ws = new WebSocket('ws://localhost:9002/ws/voice');

// Send audio chunks
ws.send(audioBuffer);  // PCM/Opus audio data

// Receive events
ws.on('message', (data) => {
  const event = JSON.parse(data);
  // event.type: "transcription" | "barge_in" | "error"
});
```

## Architecture

```
Voice Command Flow:
  1. STT: Audio → Text
  2. Route to Orchestrator /chat
  3. Orchestrator → Bridge → AI Provider
  4. TTS: Response Text → Audio
  5. Stream audio back to client

TTS Engine Selection:
  - fast=true → OpenAI (low latency)
  - fast=false → ElevenLabs (high quality)
```

## Configuration

Environment variables:

```bash
VOICE_PORT=9001
OPENAI_API_KEY=sk-...        # For OpenAI TTS/STT
ELEVENLABS_API_KEY=...       # For ElevenLabs TTS
ORCHESTRATOR_URL=http://localhost:4200
CODEX_WAKEWORD_ENABLED=true  # Enable wake-word (stub)
```

## Components

### src/index.ts
Main Fastify server with HTTP + WebSocket

### src/config.ts
Environment configuration loader

### src/audioServer.ts
WebSocket server for bidirectional audio streaming

### src/voiceRouter.ts
- TTS engine selection (fast vs rich)
- Routing to Orchestrator
- Pipeline orchestration

### src/bargeIn.ts
Barge-in state management (stop TTS on new input)

### src/hotwordEngine.ts
Wake-word detection stub (TODO: Web Speech API / Porcupine)

### src/stt/openaiStt.ts
Speech-to-text via OpenAI Whisper (stub for v1.1)

### src/tts/openaiTts.ts
Text-to-speech via OpenAI Realtime API (stub for v1.1)

### src/tts/elevenlabsTts.ts
Text-to-speech via ElevenLabs API (production-ready)

## Testing

```bash
# Test health
curl http://localhost:9001/health

# Test TTS
curl -X POST http://localhost:9001/voice/text \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "fast": true}'

# Test full pipeline
curl -X POST http://localhost:9001/voice/command \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-1",
    "text": "What is Codex?",
    "provider": "openai",
    "fast": false
  }'
```

## TODO (v1.2+)

- [ ] Implement actual OpenAI Whisper STT
- [ ] Implement OpenAI Realtime TTS
- [ ] Integrate Web Speech API for wake-word
- [ ] Add Porcupine as alternative wake-word engine
- [ ] Stream audio responses via WebSocket
- [ ] Add voice activity detection (VAD)
- [ ] Support multiple simultaneous sessions
- [ ] Add audio format conversion (PCM, Opus, etc.)
- [ ] Implement voice fingerprinting for user recognition
- [ ] Add emotion detection in voice
- [ ] Support voice commands without text (direct STT)

## Integration with Codex OS

Voice OS is automatically started by Codex Boot Manager:

1. **Brain** (4100) - Logs voice interactions
2. **Bridge** (4000) - Routes to AI providers
3. **Orchestrator** (4200) - Handles chat logic
4. **Hands** (4300) - Executes tasks from voice commands
5. **UI** (5173) - Can integrate voice interface
6. **Voice** (9001) - This service

Voice commands are logged to Brain memory for session history.

## Example Voice Flow

```
User: "Hey Codex, create a notes file for my project ideas"
  ↓
Wake-word detects "Hey Codex"
  ↓
STT: Audio → "create a notes file for my project ideas"
  ↓
Voice → Orchestrator /chat with sessionId
  ↓
Orchestrator → Task Planner → Hands
  ↓
Hands creates file
  ↓
Orchestrator → Voice with success message
  ↓
TTS (ElevenLabs): "I've created a notes file at..."
  ↓
Audio → User
```

## License

MIT
