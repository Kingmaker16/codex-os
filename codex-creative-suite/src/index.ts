// index.ts - Creative Suite Enhancement v1.5 ULTRA Server

import Fastify from "fastify";
import { registerRoutes } from "./router.js";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5250;
const HOST = "0.0.0.0";

const app = Fastify({
  logger: false,
});

// Register routes
await registerRoutes(app);

// Start server
try {
  await app.listen({ port: PORT, host: HOST });
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 CREATIVE SUITE ENHANCEMENT v1.5 ULTRA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Service running on port ${PORT}

Engines:
  ✓ Fusion Creative (Multi-LLM)
  ✓ Creative Kernel (Performance Learning)
  ✓ Scene Detect (Segmentation)
  ✓ Shot Planner (Viral Pacing)
  ✓ Caption Engine (Subtitle Timing)
  ✓ Thumbnail Engine (Photoshop Automation)
  ✓ Audio Enhancer (Loudness Normalization)
  ✓ Brand Voice (Amar's Tone)
  ✓ Trend Alignment (Trend Engine Integration)
  ✓ Integration Pipelines (Downstream Services)

Endpoints: 11
  GET  /health
  POST /creative/analyze
  POST /creative/plan
  POST /creative/enhanceVideo
  POST /creative/generateThumbnail
  POST /creative/generateCaptions
  POST /creative/brandVoiceCheck
  POST /creative/trendAlign
  POST /creative/integrate
  GET  /creative/integrationHealth
  POST /creative/recordPerformance
  GET  /creative/insights

Integrations:
  → Bridge (4000) - Multi-LLM Fusion
  → Trends (5060) - Trend Alignment
  → Campaign (5120) - Campaign Creative
  → Video (4700) - Video Enhancement
  → Engagement (5110) - Engagement Analysis
  → Social (4350) - Social Posting
  → E-Commerce (5100) - Product Creative

Ready for high-quality creative production! 🎬
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
} catch (err) {
  console.error("❌ Failed to start Creative Suite:", err);
  process.exit(1);
}
