/**
 * Social Engine v1 - Main Service
 * 
 * Multi-Account Social Media Automation
 */

import Fastify from "fastify";
import { CONFIG } from "./config.js";
import { loadAccounts } from "./accountManager.js";
import { loadSchedule, startScheduler } from "./scheduler.js";
import { registerRoutes } from "./router.js";

const app = Fastify({ logger: true });

async function main() {
  try {
    // Load accounts from disk
    const accounts = loadAccounts();
    console.log(`✅ Loaded ${accounts.length} accounts`);

    // Load scheduled posts
    const scheduled = loadSchedule();
    console.log(`✅ Loaded ${scheduled.length} scheduled posts`);

    // Register API routes
    registerRoutes(app);

    // Start scheduler
    if (CONFIG.scheduler.enabled) {
      startScheduler();
      console.log("✅ Scheduler started");
    }

    // Start server
    await app.listen({ port: CONFIG.port, host: "0.0.0.0" });

  console.log("\n╔════════════════════════════════════════╗");
  console.log("║   SOCIAL ENGINE v1.5 RUNNING          ║");
  console.log("╚════════════════════════════════════════╝\n");
    console.log(`\n📱 Port: ${CONFIG.port}`);
    console.log(`🔗 Mode: Multi-Account`);
    console.log(`📊 Accounts: ${accounts.length}`);
    console.log(`⏰ Scheduled: ${scheduled.length}`);
    console.log(`\n🔌 Integrations:`);
    console.log(`   Hands v4:     ${CONFIG.handsUrl}`);
    console.log(`   Vision v2.5:  ${CONFIG.visionUrl}`);
    console.log(`   Knowledge v2: ${CONFIG.knowledgeUrl}`);
    console.log(`   Brain:        ${CONFIG.brainUrl}`);
    console.log(`\n📱 Platforms: TikTok, YouTube, Instagram, Gmail`);
    console.log(`\n🚀 Ready for social media automation\n`);

  } catch (error: any) {
    console.error("❌ Failed to start Social Engine:", error.message);
    process.exit(1);
  }
}

main();
