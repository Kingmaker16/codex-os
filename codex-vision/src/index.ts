/**
 * Vision Engine v2 - Main Service
 * 
 * Full Perceptual AGI Layer for Codex OS
 * Port: 4600
 */

import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { registerRoutes } from "./router.js";
import { CONFIG } from "./config.js";

async function main() {
  const app = Fastify({
    logger: CONFIG.verbose
  });

  // Register WebSocket support
  await app.register(websocket);

  // Register routes
  await registerRoutes(app);

  // Start server
  try {
    await app.listen({ port: CONFIG.port, host: "0.0.0.0" });
    console.log(`✅ Vision Engine v2.5 running on port ${CONFIG.port}`);
    console.log(`   Mode: Semi-Autonomous (suggestions only)`);
    console.log(`   Vision models: ${CONFIG.visionProviders.length}`);
    console.log(`   AR streaming: enabled`);
    console.log(`   UI profiles: ${Object.keys(CONFIG.uiProfiles).length}`);
    console.log(`   ⚠️  Actions require approval - never auto-execute`);
  } catch (err: any) {
    console.error("Failed to start Vision Engine:", err);
    process.exit(1);
  }
}

main();
