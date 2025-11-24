// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Ops Engine v1 ULTRA - Main Server
// Coordinates all Codex OS services with scheduling, recovery, and health monitoring
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import Fastify from "fastify";
import opsRouter from "./router.js";
import { startScheduler } from "./opsScheduler.js";
import { OPS_ENGINE_VERSION } from "./types.js";

const PORT = 5350;
const app = Fastify({ logger: false });

// Register ops routes
app.register(opsRouter, { prefix: "/ops" });

// Start scheduler
startScheduler();

// Start server
app
  .listen({ port: PORT, host: "0.0.0.0" })
  .then(() => {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️  OPS ENGINE v1 ULTRA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Service running on port ${PORT}
📦 Version: ${OPS_ENGINE_VERSION}

Core Systems:
  ✓ Global Scheduler (60s intervals)
  ✓ Task Executor (dependency tracking)
  ✓ Recovery Engine (restart/fallback/skip)
  ✓ Load Balancer (LLM + Account routing)
  ✓ Health Monitor (19 service checks)
  ✓ Brain Logger (analytics streaming)

Coordinating Services:
  → Bridge (4000) - Multi-provider LLM
  → Brain (4100) - Analytics & logging
  → Orchestrator (4200) - Task orchestration
  → Hands v5 (4350) - Automation
  → Knowledge (4500) - Knowledge base
  → Vision v2.6 (4650) - Video editing
  → Video (4700) - Content generation
  → Monetization (4850) - Revenue tracking
  → Telemetry (4950) - System monitoring
  → Voice v2 (9001) - Voice synthesis
  → Strategy (5050) - Strategic intelligence
  → Trends (5060) - Trend analysis
  → Simulation (5070) - Scenario testing
  → Visibility (5080) - Shadowban detection
  → Account Safety (5090) - Risk management
  → E-Commerce (5100) - Product management
  → Engagement (5110) - Engagement planning
  → Campaign (5120) - Campaign orchestration
  → Creative (5200) - Creative concepts
  → Creative Suite (5250) - Content creation
  → Distribution (5300) - Multi-platform distribution

Endpoints:
  GET  /ops/health - Service health & global status
  POST /ops/run - Execute task immediately
  POST /ops/queue - Add task to scheduler queue
  GET  /ops/queue - View current queue
  POST /ops/recover - Trigger service recovery
  GET  /ops/status - Detailed system status

Features:
  • Automatic task retries (3x with backoff: 10s→30s→60s)
  • Dependency-aware task execution
  • Service failure recovery & fallback routing
  • Smart LLM provider rotation (GPT-4o/Claude/Gemini/Grok)
  • SAFE/MEDIUM/EXPERIMENT account selection
  • Real-time health monitoring (GREEN/YELLOW/RED)
  • Comprehensive Brain analytics logging

Ready to orchestrate Codex OS! ⚙️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  })
  .catch((err) => {
    console.error("Failed to start Ops Engine:", err);
    process.exit(1);
  });
