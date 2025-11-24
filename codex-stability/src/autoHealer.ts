/**
 * Codex Stability Layer - Auto-Healer
 * 
 * Restarts crashed or unresponsive services
 */

import { spawn } from "node:child_process";
import type { CodexService } from "./serviceRegistry.js";

export interface HealAction {
  service: string;
  action: string;
  startedAt: string;
  finishedAt?: string;
  success: boolean;
  error?: string;
  pid?: number;
}

/**
 * Restart a service
 */
export async function restartService(svc: CodexService): Promise<HealAction> {
  const startedAt = new Date().toISOString();
  
  try {
    console.log(`[AutoHealer] Restarting ${svc.name}...`);
    
    const proc = spawn(svc.startCommand[0], svc.startCommand.slice(1), {
      cwd: svc.cwd,
      stdio: "ignore",
      detached: true
    });
    
    proc.unref();
    
    const finishedAt = new Date().toISOString();
    
    return {
      service: svc.name,
      action: "restart",
      startedAt,
      finishedAt,
      success: true,
      pid: proc.pid
    };
  } catch (err: any) {
    const finishedAt = new Date().toISOString();
    
    console.error(`[AutoHealer] Failed to restart ${svc.name}:`, err.message);
    
    return {
      service: svc.name,
      action: "restart",
      startedAt,
      finishedAt,
      success: false,
      error: String(err?.message ?? err)
    };
  }
}

/**
 * Kill a service by port
 */
export async function killServiceByPort(port: number): Promise<void> {
  try {
    const { exec } = await import("node:child_process");
    const { promisify } = await import("node:util");
    const execAsync = promisify(exec);
    
    await execAsync(`lsof -ti :${port} | xargs kill -9`);
    console.log(`[AutoHealer] Killed process on port ${port}`);
  } catch (err) {
    // Process may not exist, ignore
  }
}

/**
 * Full service restart (kill + restart)
 */
export async function fullRestart(svc: CodexService): Promise<HealAction> {
  await killServiceByPort(svc.port);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  return restartService(svc);
}
