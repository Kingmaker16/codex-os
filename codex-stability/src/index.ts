/**
 * Codex Stability Layer - Main Service Entry
 * 
 * Daemon for monitoring, auto-healing, and maintaining service health
 * Port: 4700
 */

import Fastify from "fastify";
import { startStabilityWatcher } from "./watcher.js";
import { SERVICES } from "./serviceRegistry.js";
import { checkAllHeartbeats } from "./heartbeat.js";
import { readTradingKillState, clearTradingKill, applyTradingKillSoft, applyTradingKillHard } from "./tradingGuard.js";

const PORT = 4700;

async function main() {
  const app = Fastify({ logger: true });

  // Health check
  app.get("/health", async () => {
    return { ok: true, service: "codex-stability", version: "1.0.0" };
  });

  // Get status of all services
  app.get("/status", async () => {
    const results = await checkAllHeartbeats(SERVICES);
    return {
      timestamp: new Date().toISOString(),
      services: results.map(r => ({
        name: r.service,
        status: r.ok ? "healthy" : "unhealthy",
        statusCode: r.statusCode,
        responseTime: r.responseTime,
        error: r.error
      }))
    };
  });

  // Get trading kill state
  app.get("/trading/status", async () => {
    const state = readTradingKillState();
    return {
      blocked: state ? (state.soft || state.hard) : false,
      state: state || { soft: false, hard: false }
    };
  });

  // Clear trading kill
  app.post("/trading/clear", async () => {
    await clearTradingKill();
    return { success: true, message: "Trading kill cleared" };
  });

  // Apply soft kill
  app.post("/trading/kill/soft", async (req) => {
    const { reason } = req.body as { reason?: string };
    await applyTradingKillSoft(reason || "Manual soft kill via stability API");
    return { success: true, mode: "soft" };
  });

  // Apply hard kill
  app.post("/trading/kill/hard", async (req) => {
    const { reason } = req.body as { reason?: string };
    await applyTradingKillHard(reason || "Manual hard kill via stability API");
    return { success: true, mode: "hard" };
  });

  // Start server
  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`✅ Codex Stability Layer running on port ${PORT}`);
    console.log(`   Monitoring ${SERVICES.length} services`);
    console.log(`   Auto-healing: enabled`);
    console.log(`   Trading guard: enabled`);
  } catch (err: any) {
    console.error("Failed to start Stability Layer:", err);
    process.exit(1);
  }

  // Start monitoring
  startStabilityWatcher();
}

main();
