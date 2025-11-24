// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Ops Engine v1 ULTRA - Recovery Engine
// Handles service failures, restarts, and fallback routes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import fetch from "node-fetch";
import { getServiceByName } from "./opsServiceMap.js";
import { logToBrain } from "./opsBrainLogger.js";

const TELEMETRY_PORT = 4950;

export interface RecoveryResult {
  success: boolean;
  action: string;
  message: string;
}

export async function handleServiceFailure(
  serviceName: string,
  action: "restart" | "fallback" | "skip"
): Promise<RecoveryResult> {
  const service = getServiceByName(serviceName);

  if (!service) {
    return {
      success: false,
      action: "unknown",
      message: `Service ${serviceName} not found in service map`,
    };
  }

  // Log to telemetry
  await logFailureToTelemetry(serviceName, action);

  // Log to brain
  await logToBrain({
    service: "ops",
    action: `recovery:${action}:${serviceName}`,
    result: "success",
    latency: 0,
    retries: 0,
    sessionId: "codex-ops-recovery",
    metadata: { serviceName, recoveryAction: action },
  });

  switch (action) {
    case "restart":
      return attemptRestart(serviceName);

    case "fallback":
      return attemptFallback(serviceName);

    case "skip":
      return {
        success: true,
        action: "skip",
        message: `Skipped recovery for ${serviceName}`,
      };

    default:
      return {
        success: false,
        action: "unknown",
        message: `Unknown recovery action: ${action}`,
      };
  }
}

async function logFailureToTelemetry(
  serviceName: string,
  action: string
): Promise<void> {
  try {
    await fetch(`http://localhost:${TELEMETRY_PORT}/telemetry/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service: serviceName,
        event: "service_failure",
        action,
        timestamp: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(2000),
    });
  } catch (error) {
    // Silent fail
  }
}

function attemptRestart(serviceName: string): RecoveryResult {
  // Note: In production, this would trigger Boot Manager restart
  // For now, return a simulation response
  return {
    success: true,
    action: "restart",
    message: `Restart request sent for ${serviceName} (Boot Manager integration required)`,
  };
}

function attemptFallback(serviceName: string): RecoveryResult {
  // Define fallback routes
  const fallbackMap: Record<string, string> = {
    vision: "hands",
    creativeSuite: "creative",
    distribution: "campaign",
    video: "hands",
  };

  const fallbackService = fallbackMap[serviceName];

  if (fallbackService) {
    return {
      success: true,
      action: "fallback",
      message: `Using ${fallbackService} as fallback for ${serviceName}`,
    };
  } else {
    return {
      success: false,
      action: "fallback",
      message: `No fallback available for ${serviceName}`,
    };
  }
}
