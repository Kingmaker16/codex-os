// index.ts - Vision Engine v2.6 ULTRA Server

import Fastify from "fastify";
import { registerVisionRoutes } from "./router.js";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4650;

const fastify = Fastify({
  logger: false,
});

// Register routes
await registerVisionRoutes(fastify);

// Start server
try {
  await fastify.listen({ port: PORT, host: "0.0.0.0" });

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👁️  VISION ENGINE v2.6 ULTRA - CO-PILOT MODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Service running on port ${PORT}

Mode: Co-Pilot (AI suggests, Amar approves)

Engines:
  ✓ Scene Analyzer (Frame-by-Frame)
  ✓ Fusion Vision (Multi-LLM: GPT-4o, Claude, Gemini, Grok)
  ✓ Edit Suggester (10+ action types)
  ✓ Timeline Mapper (Premiere/FinalCut/CapCut)
  ✓ AR Feedback (Live Editing)
  ✓ Brain Logger (Performance Learning)

Endpoints: 7
  GET  /health
  POST /vision/analyzeFrame
  POST /vision/analyzeTimeline
  POST /vision/suggestEdits       <-- MAIN ENDPOINT
  POST /vision/mapTimeline
  POST /vision/liveFeedback
  POST /vision/logPerformance
  GET  /vision/insights

Edit Actions:
  trim, cut, jump-zoom, crop, contrast, color-lift,
  saturation-bump, speed-ramp, text-overlay, zoom-to-face

Integrations:
  → Bridge (4000) - Multi-LLM
  → Hands v5.0 (4350) - Video macros
  → Creative Suite (5250) - Creative production
  → Campaign (5120) - Campaign planning
  → Social (4350) - Social posting

Ready for AI-assisted video editing! 🎬
  `);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
