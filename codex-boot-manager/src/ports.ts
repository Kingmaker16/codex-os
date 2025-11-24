import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface PortRegistry {
  bridge: number;
  brain: number;
  orchestrator: number;
  hands: number;
  ui: number;
  voice: number;
  knowledge: number;
  vision: number;
  stability: number;
  social: number;
  video: number;
  "mac-optimizer": number;
  telemetry: number;
  monetization: number;
}

export function loadPortRegistry(): PortRegistry {
  const registryPath = join(__dirname, "..", "ports.json");
  const raw = readFileSync(registryPath, "utf-8");
  return JSON.parse(raw);
}

export function savePortRegistry(registry: PortRegistry): void {
  const registryPath = join(__dirname, "..", "ports.json");
  writeFileSync(registryPath, JSON.stringify(registry, null, 2));
}

export async function killStaleProcesses(ports: number[]): Promise<void> {
  console.log(`🧹 Killing stale processes on ports: ${ports.join(", ")}`);
  
  for (const port of ports) {
    try {
      const { stdout } = await execAsync(`lsof -ti:${port}`);
      const pids = stdout.trim().split("\n").filter(Boolean);
      
      if (pids.length > 0) {
        console.log(`   Killing PID(s) on port ${port}: ${pids.join(", ")}`);
        await execAsync(`kill -9 ${pids.join(" ")}`);
      }
    } catch (err) {
      // Port is free, ignore
    }
  }
  
  console.log("✅ Stale processes cleaned\n");
}

export function getAllPorts(registry: PortRegistry): number[] {
  return [
    registry.bridge,
    registry.brain,
    registry.orchestrator,
    registry.hands,
    registry.ui,
    // Voice OS range
    9000, 9001, 9002, 9003, 9004, 9005,
    // Extra UI ports
    5173, 5174, 5175, 5176, 5177, 5178, 5179, 5180, 5181, 5182, 5183, 5184, 5185
  ];
}
