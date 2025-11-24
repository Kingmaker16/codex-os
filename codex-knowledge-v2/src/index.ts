/**
 * Knowledge Engine v2.5 - Main Service
 * 
 * C1 STRICT MODE - Focused Learning
 * Port: 4500
 */

import Fastify from "fastify";
import { registerRoutes } from "./router.js";
import { initializeKernels } from "./domainKernels.js";
import { CONFIG } from "./config.js";

async function main() {
  const app = Fastify({
    logger: true
  });

  // Initialize domain kernels
  initializeKernels();

  // Register routes
  await registerRoutes(app);

  // Start server
  try {
    await app.listen({ port: CONFIG.port, host: "0.0.0.0" });
    console.log(`✅ Knowledge Engine v2.5 running on port ${CONFIG.port}`);
    console.log(`   Mode: ${CONFIG.mode} (explicit learning only)`);
    console.log(`   Domain kernels: ${CONFIG.domains.length}`);
    console.log(`   Fusion models: ${CONFIG.providers.length}`);
    console.log(`   Bridge: ${CONFIG.bridgeUrl}`);
    console.log(`   Brain: ${CONFIG.brainUrl}`);
    console.log(`   ⚠️  C1 Rules: No auto-learning, explicit requests only`);
  } catch (err: any) {
    console.error("Failed to start Knowledge Engine:", err);
    process.exit(1);
  }
}

main();
