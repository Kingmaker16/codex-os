/**
 * Codex OS Boot Manager v2
 * Orchestration Engine
 */

import { spawn } from "child_process";
import { join } from "path";
import { SERVICES_V2, ManagedService } from "./services.v2.js";

const NODE_PATH = "/opt/homebrew/Cellar/node/24.10.0/bin/node";
const CODEX_ROOT = join(import.meta.dirname, "..", "..");

interface ServiceStatus {
  name: string;
  port: number;
  group: string;
  status: "✅" | "❌" | "⚠️";
  latency?: number;
}

/**
 * Kill all processes on specified ports
 */
async function killStaleProcesses(ports: number[]): Promise<void> {
  console.log("🧹 Cleaning stale processes...\n");
  for (const port of ports) {
    try {
      const { exec } = await import("child_process");
      const { promisify } = await import("util");
      const execAsync = promisify(exec);

      const { stdout } = await execAsync(`lsof -ti:${port}`);
      const pids = stdout.trim().split("\n").filter(Boolean);

      for (const pid of pids) {
        try {
          await execAsync(`kill -9 ${pid}`);
          console.log(`   Killed PID ${pid} on port ${port}`);
        } catch {
          // Process may have already exited
        }
      }
    } catch {
      // No process on this port
    }
  }
  console.log();
}

/**
 * Start a single service
 */
function startService(service: ManagedService): void {
  // service.cwd is relative (e.g., "../codex-brain")
  // We need to resolve it properly from CODEX_ROOT
  const servicePath = join(CODEX_ROOT, service.cwd.replace("../", ""));
  const entrypoint = join(servicePath, "dist/index.js");

  // Use absolute path to real node binary and absolute path to entrypoint
  const proc = spawn(NODE_PATH, [entrypoint], {
    cwd: servicePath,
    detached: true,
    stdio: "ignore",
    env: {
      ...process.env,
    }
  });

  proc.on("error", (err) => {
    console.error(`   ❌ Failed to start ${service.name}:`, err);
  });

  proc.unref();
  console.log(`   🚀 Started ${service.name} (node dist/index.js) on port ${service.port}`);
}

/**
 * Wait for service health check
 */
async function waitForHealth(service: ManagedService): Promise<{ success: boolean; latency?: number }> {
  const maxRetries = 15;
  const retryDelay = 2000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const startTime = Date.now();
      const response = await fetch(service.healthUrl);
      const latency = Date.now() - startTime;

      if (response.ok) {
        return { success: true, latency };
      }
    } catch {
      // Service not ready yet
    }

    await new Promise((resolve) => setTimeout(resolve, retryDelay));
  }

  return { success: false };
}

/**
 * Boot all services in group order
 */
export async function bootAllServicesV2(): Promise<void> {
  console.log("\n╔══════════════════════════════════════════════════════════════════════╗");
  console.log("║              CODEX OS BOOT MANAGER v2.0                              ║");
  console.log("╚══════════════════════════════════════════════════════════════════════╝\n");

  // Kill stale processes
  const allPorts = SERVICES_V2.map((s) => s.port);
  await killStaleProcesses(allPorts);

  // Define boot order by group
  const bootOrder: Array<ManagedService["group"]> = [
    "core",
    "safety",
    "execution",
    "ai",
    "identity",
    "infra",
    "optimization",
  ];

  const statusList: ServiceStatus[] = [];

  // Boot services group by group
  for (const group of bootOrder) {
    const groupServices = SERVICES_V2.filter((s) => s.group === group);
    if (groupServices.length === 0) continue;

    console.log(`\n📦 Booting ${group.toUpperCase()} group (${groupServices.length} services)...\n`);

    for (const service of groupServices) {
      startService(service);

      const { success, latency } = await waitForHealth(service);

      if (success) {
        statusList.push({
          name: service.name,
          port: service.port,
          group: service.group,
          status: "✅",
          latency,
        });
      } else if (service.required) {
        statusList.push({
          name: service.name,
          port: service.port,
          group: service.group,
          status: "❌",
        });
        console.log(`\n❌ CRITICAL: Required service ${service.name} failed to start\n`);
        printStatusTable(statusList);
        process.exit(1);
      } else {
        statusList.push({
          name: service.name,
          port: service.port,
          group: service.group,
          status: "⚠️",
        });
      }
    }
  }

  // Print final status table
  printStatusTable(statusList);

  // Summary
  const online = statusList.filter((s) => s.status === "✅").length;
  const failed = statusList.filter((s) => s.status === "❌").length;
  const optional = statusList.filter((s) => s.status === "⚠️").length;

  console.log("\n╔══════════════════════════════════════════════════════════════════════╗");
  console.log(`║   ✅ CODEX OS v2 ONLINE: ${online} services | Failed: ${failed} | Optional offline: ${optional}     ║`);
  console.log("╚══════════════════════════════════════════════════════════════════════╝\n");
}

/**
 * Print formatted status table
 */
function printStatusTable(statusList: ServiceStatus[]): void {
  console.log("\n╔══════════════════════════════════════════════════════════════════════╗");
  console.log("║                      CODEX OS SERVICE STATUS                         ║");
  console.log("╠══════════════════════════════════════════════════════════════════════╣");
  console.log("║ Name                    Port    Group          Status    Latency    ║");
  console.log("╠══════════════════════════════════════════════════════════════════════╣");

  for (const item of statusList) {
    const name = item.name.padEnd(22);
    const port = item.port.toString().padEnd(6);
    const group = item.group.padEnd(14);
    const latency = item.latency ? `${item.latency}ms`.padEnd(10) : "".padEnd(10);
    console.log(`║ ${name} ${port} ${group} ${item.status}      ${latency}║`);
  }

  console.log("╚══════════════════════════════════════════════════════════════════════╝");
}
