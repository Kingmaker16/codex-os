// Codex Telemetry Engine v1 - Main Entry Point

import Fastify from "fastify";
import { registerRoutes } from "./router.js";
import { metricsCollector } from "./metricsCollector.js";
import { eventLogger } from "./eventLogger.js";

const PORT = 4950;
const app = Fastify({ logger: true });

// CORS support
app.addHook("onRequest", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  reply.header("Access-Control-Allow-Headers", "Content-Type");
  if (request.method === "OPTIONS") {
    reply.status(204).send();
  }
});

// Register routes
registerRoutes(app);

// Background metrics collection (every 60 seconds)
let metricsInterval: NodeJS.Timeout | null = null;

function startMetricsCollection() {
  console.log("🔄 Starting background metrics collection...");
  
  metricsInterval = setInterval(async () => {
    try {
      await metricsCollector.collect();
    } catch (err) {
      console.error("Failed to collect metrics:", err);
    }
  }, 60000); // Every 60 seconds
}

function stopMetricsCollection() {
  if (metricsInterval) {
    clearInterval(metricsInterval);
    metricsInterval = null;
  }
}

// Start server
async function startTelemetryEngine() {
  try {
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║   TELEMETRY ENGINE v1                 ║");
    console.log("║   System Monitoring & Analytics       ║");
    console.log("╚════════════════════════════════════════╝\n");

    // Collect initial metrics
    await metricsCollector.collect();

    // Start background collection
    startMetricsCollection();

    // Log startup event
    await eventLogger.log(
      "info",
      "system",
      "telemetry",
      "Telemetry Engine started",
      { port: PORT, version: "1.0.0" }
    );

    // Start HTTP server
    await app.listen({ port: PORT, host: "0.0.0.0" });
    
    console.log("📊 Telemetry Endpoints:");
    console.log(`   Health:   http://localhost:${PORT}/telemetry/health`);
    console.log(`   Services: http://localhost:${PORT}/telemetry/services`);
    console.log(`   Metrics:  http://localhost:${PORT}/telemetry/metrics`);
    console.log(`   Trends:   http://localhost:${PORT}/telemetry/trends`);
    console.log(`   Events:   http://localhost:${PORT}/telemetry/events`);
    console.log("\n✨ Features:");
    console.log("   ✅ System metrics (CPU, RAM, disk, network)");
    console.log("   ✅ Service latency monitoring");
    console.log("   ✅ Trend analysis & regression detection");
    console.log("   ✅ Anomaly detection & early warnings");
    console.log("   ✅ Brain integration for event logging");
    console.log("   ✅ Background metrics collection (60s interval)");
    console.log();
  } catch (err) {
    console.error("Failed to start Telemetry Engine:", err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down Telemetry Engine...");
  stopMetricsCollection();
  
  await eventLogger.log(
    "info",
    "system",
    "telemetry",
    "Telemetry Engine shutting down"
  );
  
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down Telemetry Engine...");
  stopMetricsCollection();
  
  await eventLogger.log(
    "info",
    "system",
    "telemetry",
    "Telemetry Engine shutting down"
  );
  
  process.exit(0);
});

// Start if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startTelemetryEngine();
}

export { app, startTelemetryEngine };
