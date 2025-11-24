/**
 * Codex Stability Layer - Log Writer
 * 
 * Writes stability events to Brain for audit trail
 */

import fetch from "node-fetch";

const STABILITY_SESSION_ID = "codex-stability-log";
const BRAIN_URL = "http://localhost:4100";

/**
 * Log stability event to Brain
 */
export async function logStabilityEvent(message: any): Promise<void> {
  try {
    await fetch(`${BRAIN_URL}/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "TurnAppended",
        event: {
          sessionId: STABILITY_SESSION_ID,
          role: "system",
          text: JSON.stringify(message),
          ts: new Date().toISOString()
        }
      })
    });
  } catch (err) {
    // Silently fail - don't crash stability layer if Brain is down
    console.error("[LogWriter] Failed to log to Brain:", err);
  }
}

/**
 * Log heartbeat failure
 */
export async function logHeartbeatFailure(service: string, detail: any): Promise<void> {
  await logStabilityEvent({
    kind: "heartbeat-fail",
    service,
    detail,
    at: new Date().toISOString()
  });
}

/**
 * Log auto-heal action
 */
export async function logHealAction(service: string, action: any): Promise<void> {
  await logStabilityEvent({
    kind: "auto-heal",
    service,
    action,
    at: new Date().toISOString()
  });
}

/**
 * Log browser health issue
 */
export async function logBrowserIssue(detail: any): Promise<void> {
  await logStabilityEvent({
    kind: "browser-health-fail",
    detail,
    at: new Date().toISOString()
  });
}

/**
 * Log diagnostics trigger
 */
export async function logDiagnosticsTrigger(reason: string): Promise<void> {
  await logStabilityEvent({
    kind: "diagnostics-triggered",
    reason,
    at: new Date().toISOString()
  });
}
