// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Credibility Engine v1 - Main Server
// Multi-LLM credibility analysis for trust improvement
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import Fastify from "fastify";
import { registerRoutes } from "./router.js";
import { CREDIBILITY_VERSION } from "./types.js";

const PORT = 5450;
const app = Fastify({ logger: false });

async function main() {
  // Register routes
  await registerRoutes(app);

  // Start server
  await app.listen({ port: PORT, host: "0.0.0.0" });

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️  CREDIBILITY ENGINE v1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Service running on port ${PORT}
📦 Version: ${CREDIBILITY_VERSION}

Core Features:
  ✓ Multi-LLM Fusion (4 providers)
  ✓ Weak Claim Detection
  ✓ Trust Score (0-100)
  ✓ Proof Suggestions
  ✓ Issue Classification

LLM Providers:
  → GPT-4o (OpenAI)
  → Claude 3.5 Sonnet (Anthropic)
  → Gemini 2.5 Flash (Google)
  → Grok 2 (xAI)

Endpoints:
  GET  /health - Service status
  POST /credibility/check - Analyze single content
  POST /credibility/batch - Batch analysis

Issue Types:
  • VAGUE - Unclear claims
  • UNSUPPORTED - No evidence provided
  • OVERPROMISE - Unrealistic guarantees
  • RISKY_CLAIM - Potentially misleading
  • MISSING_PROOF - Needs verification
  • UNCLEAR - General credibility issue

Domains Supported:
  • social - Social media posts
  • ecomm - E-commerce descriptions
  • ad - Advertising copy
  • script - Video scripts
  • email - Email campaigns

Use Cases:
  • Product descriptions validation
  • Ad copy trust improvement
  • Social media credibility check
  • Email campaign verification
  • Video script fact-checking

Ready to analyze credibility! 🛡️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

main().catch((err) => {
  console.error("Failed to start Credibility Engine:", err);
  process.exit(1);
});
