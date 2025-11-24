import Fastify from "fastify";
import { registerRoutes } from "./router.js";

const app = Fastify({ logger: true });
const PORT = 5300;

async function main() {
  await registerRoutes(app);
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 DISTRIBUTION ENGINE v1 ULTRA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Service running on port ${PORT}

Capabilities:
  ✓ Multi-platform distribution (TikTok, YouTube, Instagram)
  ✓ Content calendar planning (7 days, 2 posts/day)
  ✓ Smart account routing (SAFE/MEDIUM/EXPERIMENT)
  ✓ Content repurposing across platforms
  ✓ Batch publishing with safety checks

Integrations:
  → Account Safety (5090) - Risk-tier routing
  → Creative Suite (5250) - Content analysis
  → Video Engine (4700) - Repurposing
  → Social Engine (4800) - Publishing

Endpoints:
  GET  /health
  POST /distribution/planCalendar
  GET  /distribution/plans
  GET  /distribution/plan/:id
  POST /distribution/repurpose
  POST /distribution/publishBatch

Ready for multi-platform distribution! 📡
  `);
}

main().catch(err => {
  console.error("Failed to start codex-distribution", err);
  process.exit(1);
});
