// Codex Voice OS v2 - Main Entry Point

import Fastify from "fastify";
import { loadConfig } from "./config.js";
import { VoiceRouter } from "./voiceRouter.js";
import { AudioServer } from "./audioServer.js";
import { startWakeWordListener, stopWakeWordListener, hotwordEngine } from "./hotwordEngine.js";
import { bargeInManager } from "./bargeIn.js";
import { ConversationLoop } from "./conversationLoop.js";
import { AudioRouter } from "./audioRouter.js";
import { parseIntent } from "./intentParser.js";
import { realTimeTts } from "./realTimeTts.js";
import { hotwordEngineV2, startWakeWordV2, stopWakeWordV2 } from "./hotwordEngineV2.js";
import { bargeInV2Manager } from "./bargeInV2.js";

const app = Fastify({ logger: true });
const config = loadConfig();
const voiceRouter = new VoiceRouter(config);
const audioServer = new AudioServer({
  port: config.port,
  apiKey: config.openaiApiKey,
});

// Voice OS v2 modules
const conversationLoop = new ConversationLoop(voiceRouter);
const audioRouter = new AudioRouter(conversationLoop);

// CORS support
app.addHook("onRequest", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  reply.header("Access-Control-Allow-Headers", "Content-Type");
  if (request.method === "OPTIONS") {
    reply.status(204).send();
  }
});

// Health check
app.get("/health", async () => ({
  ok: true,
  service: "codex-voice",
  version: "2.0.0",
  voiceOS: "v2",
}));

// Status endpoint
app.get("/voice/status", async () => ({
  ok: true,
  wakeWord: hotwordEngine.getStatus(),
  wakeWordV2: hotwordEngineV2.getStatus(),
  bargeIn: {
    speaking: bargeInManager.isCurrentlySpeaking(),
  },
  bargeInV2: bargeInV2Manager.getStats(),
  conversations: conversationLoop.getAllSessions(),
  audioRoutes: audioRouter.getAllRoutes(),
}));

// Simple TTS test endpoint
app.post("/voice/text", async (req, reply) => {
  try {
    const body = req.body as { text: string; fast?: boolean };

    if (!body.text || typeof body.text !== "string") {
      reply.status(400);
      return { ok: false, error: "text is required" };
    }

    const audioBuffer = await voiceRouter.speak(body.text, {
      fast: body.fast ?? false,
    });

    // For now, return audio as base64
    // In production, this would be streamed via WebSocket or returned as audio/mpeg
    return {
      ok: true,
      text: body.text,
      audioSize: audioBuffer.length,
      audioBase64: audioBuffer.toString("base64").substring(0, 100) + "...",
      voiceMode: body.fast ? "fast" : "rich",
    };
  } catch (err: any) {
    app.log.error({ err }, "/voice/text failed");
    reply.status(500);
    return { ok: false, error: "TTS failed", details: err?.message };
  }
});

// Voice command endpoint (STT → Orchestrator → TTS)
app.post("/voice/command", async (req, reply) => {
  try {
    const body = req.body as {
      sessionId: string;
      text: string;
      provider?: string;
      domain?: string;
      fast?: boolean;
    };

    // Validate
    if (!body.sessionId || !body.text) {
      reply.status(400);
      return { ok: false, error: "sessionId and text are required" };
    }

    // Check for barge-in (stop any ongoing speech)
    bargeInManager.handleBargeIn();

    // Route to Orchestrator
    const replyText = await voiceRouter.routeToOrchestrator(
      body.sessionId,
      body.text,
      body.provider
    );

    // Synthesize response
    bargeInManager.startSpeaking();
    const audioBuffer = await voiceRouter.speak(replyText, {
      fast: body.fast ?? false,
    });
    bargeInManager.stopSpeaking();

    return {
      ok: true,
      sessionId: body.sessionId,
      userText: body.text,
      replyText,
      voiceMode: "hybrid",
      ttsEngine: body.fast ? "openai" : "elevenlabs",
      audioSize: audioBuffer.length,
      // In production, stream audio via WebSocket instead of base64
      audioBase64: audioBuffer.toString("base64").substring(0, 100) + "...",
    };
  } catch (err: any) {
    app.log.error({ err }, "/voice/command failed");
    bargeInManager.stopSpeaking();
    reply.status(500);
    return { ok: false, error: "Voice command failed", details: err?.message };
  }
});

// Wake-word simulation endpoint (for testing)
app.post("/voice/wake", async () => {
  hotwordEngine.simulateWakeWord();
  return { ok: true, message: "Wake-word simulated" };
});

// ========================================
// VOICE OS v2 ENDPOINTS
// ========================================

// Start continuous conversation loop
app.get("/voice/listen", async (req, reply) => {
  try {
    const sessionId = (req.query as any).sessionId || `session-${Date.now()}`;
    
    // Start conversation loop
    const session = await conversationLoop.startListening(sessionId);
    
    // Start audio routing
    await audioRouter.startRouting(sessionId);

    return {
      ok: true,
      message: "Conversation loop started",
      session,
      tip: "Say 'stop listening' to end the conversation",
    };
  } catch (err: any) {
    app.log.error({ err }, "/voice/listen failed");
    reply.status(500);
    return { ok: false, error: err?.message };
  }
});

// Stop conversation loop
app.post("/voice/stop", async (req, reply) => {
  try {
    const body = req.body as { sessionId: string };
    
    if (!body.sessionId) {
      reply.status(400);
      return { ok: false, error: "sessionId is required" };
    }

    const stopped = conversationLoop.stopListening(body.sessionId);
    audioRouter.stopRouting(body.sessionId);

    return {
      ok: true,
      stopped,
      message: stopped ? "Conversation loop stopped" : "Session not found",
    };
  } catch (err: any) {
    app.log.error({ err }, "/voice/stop failed");
    reply.status(500);
    return { ok: false, error: err?.message };
  }
});

// Parse intent from text
app.post("/voice/intent", async (req, reply) => {
  try {
    const body = req.body as { text: string };
    
    if (!body.text) {
      reply.status(400);
      return { ok: false, error: "text is required" };
    }

    const intent = parseIntent(body.text);

    return {
      ok: true,
      text: body.text,
      intent,
    };
  } catch (err: any) {
    app.log.error({ err }, "/voice/intent failed");
    reply.status(500);
    return { ok: false, error: err?.message };
  }
});

// Synthesize arbitrary text (real-time TTS)
app.post("/voice/speak", async (req, reply) => {
  try {
    const body = req.body as { text: string; fast?: boolean; voiceId?: string };
    
    if (!body.text) {
      reply.status(400);
      return { ok: false, error: "text is required" };
    }

    const result = await realTimeTts.synthesize({
      text: body.text,
      fast: body.fast ?? false,
      voiceId: body.voiceId,
    });

    if (!result.ok) {
      reply.status(500);
      return { ok: false, error: result.error };
    }

    return {
      ok: true,
      text: body.text,
      engine: result.engine,
      duration: result.duration,
      audioSize: result.audioBuffer?.length,
      message: "TTS synthesis completed",
    };
  } catch (err: any) {
    app.log.error({ err }, "/voice/speak failed");
    reply.status(500);
    return { ok: false, error: err?.message };
  }
});

export async function startVoiceServer(): Promise<void> {
  try {
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║   VOICE OS v2 ACTIVE                  ║");
    console.log("║   Codex Voice Intelligence System     ║");
    console.log("╚════════════════════════════════════════╝\n");

    // Start wake-word listeners (v1 and v2)
    await startWakeWordListener();
    await startWakeWordV2(() => {
      console.log("🎯 Wake-word detected by v2 engine!");
    });

    // Start WebSocket audio server
    audioServer.start();

    // Start HTTP server
    await app.listen({ port: config.port, host: "0.0.0.0" });
    app.log.info(`codex-voice listening on :${config.port}`);

    console.log("\n🎤 Voice OS v2 Endpoints:");
    console.log(`   HTTP:             http://localhost:${config.port}`);
    console.log(`   WebSocket:        ws://localhost:${config.port + 1}/ws/voice`);
    console.log(`   Health:           http://localhost:${config.port}/health`);
    console.log(`   Status:           http://localhost:${config.port}/voice/status`);
    console.log(`   Listen:           http://localhost:${config.port}/voice/listen`);
    console.log(`   Stop:             http://localhost:${config.port}/voice/stop (POST)`);
    console.log(`   Intent Parser:    http://localhost:${config.port}/voice/intent (POST)`);
    console.log(`   Speak:            http://localhost:${config.port}/voice/speak (POST)`);
    console.log("\n🚀 Features:");
    console.log("   ✅ Continuous conversation loop");
    console.log("   ✅ Barge-in v2 (instant cancel)");
    console.log("   ✅ Intent parsing (5 types)");
    console.log("   ✅ Wake-word detection v2");
    console.log("   ✅ Real-time TTS (OpenAI + ElevenLabs)");
    console.log("   ✅ Audio routing pipeline");
    console.log();
  } catch (err) {
    app.log.error({ err }, "Failed to start voice server");
    process.exit(1);
  }
}

async function main() {
  await startVoiceServer();
}

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down Voice OS v2...");
  stopWakeWordListener();
  stopWakeWordV2();
  audioServer.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down Voice OS v2...");
  stopWakeWordListener();
  stopWakeWordV2();
  audioServer.stop();
  process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
