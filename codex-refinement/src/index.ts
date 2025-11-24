// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Refinement Layer v1 - Main Server
// Multi-LLM content refinement with fusion consensus
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import Fastify from "fastify";
import { refinementRoutes } from "./router.js";
import { REFINEMENT_VERSION } from "./types.js";

const PORT = 5400;
const app = Fastify({ logger: false });

// Register refinement routes
app.register(refinementRoutes);

// Start server
app
  .listen({ port: PORT, host: "0.0.0.0" })
  .then(() => {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ REFINEMENT LAYER v1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Service running on port ${PORT}
📦 Version: ${REFINEMENT_VERSION}

Core Features:
  ✓ Multi-LLM Fusion (4 providers)
  ✓ Content Quality Scoring
  ✓ Issue Detection
  ✓ Improvement Suggestions
  ✓ Consensus-Based Output

LLM Providers:
  → GPT-4o (OpenAI)
  → Claude 3.5 Sonnet (Anthropic)
  → Gemini 2.5 Flash (Google)
  → Grok 2 (xAI)

Endpoints:
  GET  /health - Service status
  POST /refine - Refine single content
  POST /refine/batch - Batch refinement

Fusion Strategy:
  • Query all 4 LLMs in parallel
  • Parse structured outputs
  • Select highest quality result
  • Merge issues & suggestions
  • Calculate consensus score

Use Cases:
  • Video scripts improvement
  • Social media captions
  • Product descriptions
  • Email copy optimization
  • Blog post enhancement

Ready to refine content! ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  })
  .catch((err) => {
    console.error("Failed to start Refinement Layer:", err);
    process.exit(1);
  });
