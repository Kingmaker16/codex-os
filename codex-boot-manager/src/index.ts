#!/usr/bin/env node

import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { spawn } from "child_process";
import {
  loadPortRegistry,
  killStaleProcesses,
  getAllPorts,
} from "./ports.js";
import {
  ProcessManager,
  ServiceConfig,
  healthCheck,
  openUIInBrowser,
} from "./processManager.js";
import {
  startWakeWordListener,
  stopWakeWordListener,
} from "./wakeWord.js";
import { bootAllServicesV2 } from "./bootV2.js";
import { SERVICES_V2 } from "./services.v2.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CODEX_ROOT = join(__dirname, "..", "..");

function runBootBackup() {
  const proc = spawn("node", ["scripts/codexAutoBackup.js"], {
    cwd: CODEX_ROOT,
    stdio: "inherit",
  });
  proc.on("exit", (code) => {
    console.log(`💾 Boot backup complete (exit ${code})\n`);
  });
  proc.on("error", (err) => {
    console.error("⚠️ Boot backup failed:", err);
  });
}

function runBootDiagnostics() {
  const proc = spawn("curl", [
    "-s",
    "-X",
    "POST",
    "http://localhost:4200/diagnostics/run"
  ], {
    cwd: CODEX_ROOT,
    stdio: "ignore", // Run silently in background
  });
  proc.on("exit", (code) => {
    if (code === 0) {
      console.log("🩺 Boot diagnostics triggered successfully\n");
    } else {
      console.log(`⚠️ Boot diagnostics trigger failed (exit ${code})\n`);
    }
  });
  proc.on("error", (err) => {
    console.error("⚠️ Boot diagnostics failed:", err);
  });
}

async function bootCodexOSV1(): Promise<void> {
  console.log("\n╔════════════════════════════════════════╗");
  console.log("║   CODEX OS BOOT MANAGER v1.0          ║");
  console.log("╚════════════════════════════════════════╝\n");

  // 1. Load port registry
  const registry = loadPortRegistry();
  console.log("📋 Port Registry Loaded:");
  console.log(`   Brain:        ${registry.brain}`);
  console.log(`   Bridge:       ${registry.bridge}`);
  console.log(`   Orchestrator: ${registry.orchestrator}`);
  console.log(`   Hands:        ${registry.hands}`);
  console.log(`   UI:           ${registry.ui}`);
  console.log(`   Voice:        ${registry.voice}`);
  console.log(`   Vision:       ${registry.vision}`);
  console.log(`   Knowledge:    ${registry.knowledge}`);
  console.log(`   Stability:    ${registry.stability}`);
  console.log(`   Telemetry:    ${registry.telemetry}`);
  console.log();

  // 2. Kill stale processes
  const allPorts = getAllPorts(registry);
  await killStaleProcesses(allPorts);

  // 3. Initialize process manager
  const pm = new ProcessManager();

  // 4. Define service configurations in correct boot order
  const services: ServiceConfig[] = [
    // Brain first (memory/persistence)
    {
      name: "Brain",
      path: join(CODEX_ROOT, "codex-brain"),
      port: registry.brain,
      startCommand: "npm",
      args: ["start"],
      healthCheck: async () => healthCheck(`http://localhost:${registry.brain}/health`),
    },
    // Bridge second (provider abstraction)
    {
      name: "Bridge",
      path: join(CODEX_ROOT, "codex-bridge"),
      port: registry.bridge,
      startCommand: "npm",
      args: ["start"],
      healthCheck: async () => healthCheck(`http://localhost:${registry.bridge}/providers`),
    },
    // Orchestrator third (routing + planning)
    {
      name: "Orchestrator",
      path: join(CODEX_ROOT, "codex-orchestrator"),
      port: registry.orchestrator,
      startCommand: "npm",
      args: ["start"],
      healthCheck: async () => healthCheck(`http://localhost:${registry.orchestrator}/health`),
    },
    // Hands fourth (execution)
    {
      name: "Hands",
      path: join(CODEX_ROOT, "codex-hands"),
      port: registry.hands,
      startCommand: "npm",
      args: ["start"],
      healthCheck: async () => healthCheck(`http://localhost:${registry.hands}/hands/health`),
    },
    // UI fifth (interface)
    {
      name: "UI",
      path: join(CODEX_ROOT, "codex-desktop"),
      port: registry.ui,
      startCommand: "npm",
      args: ["run", "dev"],
      healthCheck: async () => {
        // Vite dev server check
        try {
          const response = await fetch(`http://localhost:${registry.ui}`);
          return response.status < 500; // Accept any non-500 response
        } catch {
          return false;
        }
      },
    },
    // Voice sixth (voice interface)
    {
      name: "Voice",
      path: join(CODEX_ROOT, "codex-voice"),
      port: registry.voice,
      startCommand: "npm",
      args: ["start"],
      healthCheck: async () => healthCheck(`http://localhost:${registry.voice}/health`),
    },
    // Vision seventh (perceptual AGI)
    {
      name: "Vision",
      path: join(CODEX_ROOT, "codex-vision"),
      port: registry.vision,
      startCommand: "npm",
      args: ["start"],
      healthCheck: async () => healthCheck(`http://localhost:${registry.vision}/health`),
    },
    // Knowledge Engine eighth (AGI research - C1 mode v2.5)
    {
      name: "Knowledge",
      path: join(CODEX_ROOT, "codex-knowledge-v2"),
      port: registry.knowledge,
      startCommand: "node",
      args: ["dist/index.js"],
      healthCheck: async () => healthCheck(`http://localhost:${registry.knowledge}/health`),
    },
    // Stability Layer ninth (monitoring + auto-healing)
    {
      name: "Stability",
      path: join(CODEX_ROOT, "codex-stability"),
      port: registry.stability,
      startCommand: "npm",
      args: ["start"],
      healthCheck: async () => healthCheck(`http://localhost:${registry.stability}/health`),
    },
    // Telemetry Engine tenth (system monitoring & analytics)
    {
      name: "Telemetry",
      path: join(CODEX_ROOT, "codex-telemetry"),
      port: registry.telemetry,
      startCommand: "npm",
      args: ["start"],
      healthCheck: async () => healthCheck(`http://localhost:${registry.telemetry}/telemetry/health`),
    },
    // Monetization Engine eleventh (revenue tracking & profit forecasting)
    {
      name: "Monetization",
      path: join(CODEX_ROOT, "codex-monetization"),
      port: registry.monetization,
      startCommand: "npm",
      args: ["start"],
      healthCheck: async () => healthCheck(`http://localhost:${registry.monetization}/monetization/health`),
    },
  ];

  // 5. Start services sequentially
  console.log("🔄 Booting Codex OS services...\n");

  for (const service of services) {
    const success = await pm.startService(service);
    if (!success) {
      console.error(`\n❌ Boot failed: ${service.name} did not start\n`);
      console.error("Aborting boot sequence.\n");
      process.exit(1);
    }
  }

  // 6. Open UI in browser
  await openUIInBrowser(registry.ui);

  // 7. Start wake-word listener (stub)
  await startWakeWordListener();

    // 8. Auto-backup after boot
  console.log("💾 Starting boot backup...");
  runBootBackup();

  // 9. Trigger diagnostics run
  console.log("🩺 Starting boot diagnostics...");
  runBootDiagnostics();

  // 10. Boot complete
  console.log("╔════════════════════════════════════════╗");
  console.log("║   ✅ CODEX OS IS ONLINE, AMAR.         ║");
  console.log("╚════════════════════════════════════════╝\n");

  console.log("Services:");
  console.log(`  Brain:        http://localhost:${registry.brain}`);
  console.log(`  Bridge:       http://localhost:${registry.bridge}`);
  console.log(`  Orchestrator: http://localhost:${registry.orchestrator}`);
  console.log(`  Hands:        http://localhost:${registry.hands}`);
  console.log(`  Voice:        http://localhost:${registry.voice}`);
  console.log(`  Vision:       http://localhost:${registry.vision} (AGI Perception)`);
  console.log(`  Knowledge:    http://localhost:${registry.knowledge} (C1 Mode)`);
  console.log(`  Stability:    http://localhost:${registry.stability} (Auto-Healing)`);
  console.log(`  UI:           http://localhost:${registry.ui}`);
  console.log();
  console.log("To shut down: npm run codex:stop\n");
}

async function shutdownCodexOS(): Promise<void> {
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   CODEX OS SHUTDOWN v2                       ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  // Stop wake-word listener
  await stopWakeWordListener();

  // Kill all Codex services by port from SERVICES_V2
  const allPorts = SERVICES_V2.map((s) => s.port);
  await killStaleProcesses(allPorts);

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   ✅ CODEX OS SHUT DOWN.                     ║");
  console.log("╚══════════════════════════════════════════════╝\n");
}

async function main() {
  const mode = process.argv[2] || "start:v2";

  if (mode === "start" || mode === "start:v2") {
    // Boot Manager v2 - unified 43-service orchestration
    await bootAllServicesV2();
    
    // Post-boot hooks
    console.log("💾 Starting boot backup...");
    runBootBackup();
    
    console.log("🩺 Starting boot diagnostics...");
    runBootDiagnostics();
    
    await startWakeWordListener();
    
  } else if (mode === "start:v1") {
    // Legacy Boot Manager v1 - 11 services
    await bootCodexOSV1();
    
  } else if (mode === "stop") {
    await shutdownCodexOS();
    
  } else {
    console.error("Usage: node dist/index.js [start|start:v1|start:v2|stop]");
    console.error("  start      - Boot using v2 (default)");
    console.error("  start:v1   - Boot using legacy v1");
    console.error("  start:v2   - Boot using v2 (explicit)");
    console.error("  stop       - Shutdown all services");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
