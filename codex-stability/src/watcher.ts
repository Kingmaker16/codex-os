/**
 * Codex Stability Layer - Stability Watcher
 * 
 * Periodic monitoring and auto-healing of all services
 */

import { SERVICES, getCriticalServices } from "./serviceRegistry.js";
import { checkHeartbeat, checkAllHeartbeats, getFailedServices } from "./heartbeat.js";
import { restartService, fullRestart } from "./autoHealer.js";
import { checkBrowserHealth, resetBrowser } from "./browserMonitor.js";
import { logHeartbeatFailure, logHealAction, logBrowserIssue, logDiagnosticsTrigger } from "./logWriter.js";
import { applyTradingKillSoft } from "./tradingGuard.js";
import fetch from "node-fetch";

const INTERVAL_MS = 10000; // 10 seconds
const FAILURE_THRESHOLD = 3; // Consecutive failures before action

// Track consecutive failures per service
const failureCounts: Map<string, number> = new Map();

/**
 * Start the stability monitoring loop
 */
export function startStabilityWatcher() {
  console.log("[StabilityWatcher] Starting periodic monitoring (every 10s)");
  
  // Initial check after 5 seconds
  setTimeout(() => performHealthCheck(), 5000);
  
  // Regular interval
  setInterval(() => performHealthCheck(), INTERVAL_MS);
}

/**
 * Perform health check on all services
 */
async function performHealthCheck() {
  try {
    // Check all services
    const results = await checkAllHeartbeats(SERVICES);
    const failed = getFailedServices(results);
    
    // Process failures
    for (const failure of failed) {
      const currentCount = (failureCounts.get(failure.service) || 0) + 1;
      failureCounts.set(failure.service, currentCount);
      
      console.log(`[StabilityWatcher] ${failure.service} failed (${currentCount}/${FAILURE_THRESHOLD}): ${failure.error}`);
      
      // Log failure
      await logHeartbeatFailure(failure.service, failure);
      
      // Take action if threshold reached
      if (currentCount >= FAILURE_THRESHOLD) {
        await handleServiceFailure(failure.service);
        failureCounts.set(failure.service, 0); // Reset after action
      }
    }
    
    // Reset failure counts for successful services
    for (const result of results) {
      if (result.ok) {
        failureCounts.set(result.service, 0);
      }
    }
    
    // Check browser health
    const browserHealth = await checkBrowserHealth();
    if (!browserHealth.ok) {
      await logBrowserIssue(browserHealth);
      // Future: trigger browser reset
    }
    
  } catch (err: any) {
    console.error("[StabilityWatcher] Health check error:", err.message);
  }
}

/**
 * Handle persistent service failure
 */
async function handleServiceFailure(serviceName: string) {
  console.log(`[StabilityWatcher] Handling failure for ${serviceName}`);
  
  const service = SERVICES.find(s => s.name === serviceName);
  if (!service) {
    console.error(`[StabilityWatcher] Unknown service: ${serviceName}`);
    return;
  }
  
  // Attempt restart
  const healAction = await fullRestart(service);
  await logHealAction(serviceName, healAction);
  
  if (!healAction.success) {
    console.error(`[StabilityWatcher] Failed to restart ${serviceName}`);
    
    // If critical service failed, trigger diagnostics
    if (service.critical) {
      await triggerDiagnostics(`Critical service ${serviceName} failed to restart`);
      
      // Apply trading soft kill if Brain or Bridge failed
      if (serviceName === "brain" || serviceName === "bridge") {
        await applyTradingKillSoft(`${serviceName} service unavailable`);
      }
    }
  } else {
    console.log(`[StabilityWatcher] Successfully restarted ${serviceName}`);
    
    // Wait for service to come up
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verify restart
    const verifyResult = await checkHeartbeat(service);
    if (!verifyResult.ok) {
      console.error(`[StabilityWatcher] ${serviceName} still down after restart`);
      if (service.critical) {
        await triggerDiagnostics(`${serviceName} failed verification after restart`);
      }
    }
  }
}

/**
 * Trigger diagnostics run
 */
async function triggerDiagnostics(reason: string) {
  try {
    console.log(`[StabilityWatcher] Triggering diagnostics: ${reason}`);
    await logDiagnosticsTrigger(reason);
    
    await fetch("http://localhost:4200/diagnostics/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trigger: "stability-layer", reason })
    });
  } catch (err) {
    console.error("[StabilityWatcher] Failed to trigger diagnostics:", err);
  }
}
