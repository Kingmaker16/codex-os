import { spawn, ChildProcess } from "child_process";
import { promisify } from "util";
import { exec } from "child_process";

const execAsync = promisify(exec);
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface ServiceConfig {
  name: string;
  path: string;
  port: number;
  healthCheck: () => Promise<boolean>;
  startCommand: string;
  args: string[];
}

export class ProcessManager {
  private processes: Map<string, ChildProcess> = new Map();

  async startService(config: ServiceConfig): Promise<boolean> {
    console.log(`🚀 Starting ${config.name}...`);
    
    try {
      const proc = spawn(config.startCommand, config.args, {
        cwd: config.path,
        detached: true,
        stdio: "ignore",
      });

      proc.unref();
      this.processes.set(config.name, proc);

      // Wait for service to be ready with health checks
      const maxRetries = 15;
      const retryDelay = 2000; // 2 seconds

      for (let i = 0; i < maxRetries; i++) {
        await sleep(retryDelay);
        
        try {
          const healthy = await config.healthCheck();
          if (healthy) {
            console.log(`✅ ${config.name} is online (port ${config.port})\n`);
            return true;
          }
        } catch (err) {
          // Continue retrying
        }
      }

      console.error(`❌ ${config.name} failed to start (timeout)\n`);
      return false;
    } catch (err) {
      console.error(`❌ ${config.name} failed to start:`, err);
      return false;
    }
  }

  async stopAllServices(): Promise<void> {
    console.log("🛑 Stopping all Codex services...\n");

    // Kill all known Codex processes
    const processPatterns = [
      "codex-brain.*dist/index.js",
      "codex-bridge.*dist/index.js",
      "codex-orchestrator.*dist/index.js",
      "codex-hands.*dist/index.js",
      "codex-desktop.*dev",
      "vite.*codex-desktop"
    ];

    for (const pattern of processPatterns) {
      try {
        await execAsync(`pkill -f "${pattern}"`);
      } catch (err) {
        // Process not found, ignore
      }
    }

    this.processes.clear();
    console.log("✅ All services stopped\n");
  }
}

export async function healthCheck(url: string, timeout = 5000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    return response.ok;
  } catch (err) {
    return false;
  }
}

export async function openUIInBrowser(port: number): Promise<void> {
  const url = `http://localhost:${port}`;
  console.log(`🌐 Opening UI in browser: ${url}`);
  
  try {
    await execAsync(`open "${url}"`);
    console.log("✅ UI launched\n");
  } catch (err) {
    console.error("❌ Failed to open browser:", err);
  }
}
