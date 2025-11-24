/**
 * Codex Stability Layer - Heartbeat Checker
 * 
 * Monitors service health endpoints
 */

import fetch from "node-fetch";
import type { CodexService } from "./serviceRegistry.js";

export interface HeartbeatResult {
  service: string;
  ok: boolean;
  statusCode?: number;
  error?: string;
  responseTime?: number;
}

/**
 * Check if a service is responding to health checks
 */
export async function checkHeartbeat(svc: CodexService): Promise<HeartbeatResult> {
  const url = `http://localhost:${svc.port}${svc.healthPath}`;
  const startTime = Date.now();
  
  try {
    const resp = await fetch(url, { 
      method: "GET",
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    const responseTime = Date.now() - startTime;
    
    return {
      service: svc.name,
      ok: resp.ok,
      statusCode: resp.status,
      responseTime
    };
  } catch (err: any) {
    const responseTime = Date.now() - startTime;
    
    return {
      service: svc.name,
      ok: false,
      error: String(err?.message ?? err),
      responseTime
    };
  }
}

/**
 * Check all services in parallel
 */
export async function checkAllHeartbeats(services: CodexService[]): Promise<HeartbeatResult[]> {
  return Promise.all(services.map(svc => checkHeartbeat(svc)));
}

/**
 * Get failed services from heartbeat results
 */
export function getFailedServices(results: HeartbeatResult[]): HeartbeatResult[] {
  return results.filter(r => !r.ok);
}
