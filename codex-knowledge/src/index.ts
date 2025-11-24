/**
 * Knowledge Engine v2 - Main Service
 * 
 * AGI Research Mode (C1 Focused)
 * Port: 4500
 */

import Fastify from "fastify";
import { registerRoutes } from "./router.js";
import { CONFIG } from "./config.js";

const PORT = process.env.PORT || 4500;

async function main() {
  const app = Fastify({
    logger: CONFIG.verbose
  });

  // Register routes
  await registerRoutes(app);

  // Start server
  try {
    await app.listen({ port: Number(PORT), host: "0.0.0.0" });
    console.log(`✅ Knowledge Engine v2 (${CONFIG.mode} Mode) running on port ${PORT}`);
    console.log(`   Explicit-only research: ${CONFIG.explicitOnly}`);
    console.log(`   Auto-refinement: ${CONFIG.autoRefine}`);
    console.log(`   Background learning: ${CONFIG.backgroundLearning}`);
  } catch (err: any) {
    console.error("Failed to start Knowledge Engine:", err);
    process.exit(1);
  }
}

main();
