/**
 * Social Engine v1 - Brain Logger
 * 
 * Logs all social operations to Brain for audit trail
 */

import { CONFIG } from "./config.js";

export async function logToBrain(sessionId: string, text: string): Promise<void> {
  try {
    await fetch(`${CONFIG.brainUrl}/remember`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        role: "system",
        text,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error: any) {
    console.warn("[BrainLogger] Failed to log:", error.message);
  }
}

export async function logAccountCreated(accountId: string, platform: string): Promise<void> {
  await logToBrain(
    "codex-social-accounts",
    `Account created: ${accountId} (${platform})`
  );
}

export async function logLogin(accountId: string, platform: string, success: boolean): Promise<void> {
  await logToBrain(
    `codex-social-${platform}`,
    `Login ${success ? "succeeded" : "failed"}: ${accountId}`
  );
}

export async function logPost(accountId: string, platform: string, postId?: string): Promise<void> {
  await logToBrain(
    `codex-social-${platform}`,
    `Post published: ${postId || "unknown"} by ${accountId}`
  );
}

export async function logSchedule(postId: string, scheduledFor: string): Promise<void> {
  await logToBrain(
    "codex-social-scheduler",
    `Post scheduled: ${postId} for ${scheduledFor}`
  );
}

export async function logAnalytics(accountId: string, platform: string, metrics: any): Promise<void> {
  await logToBrain(
    `codex-social-analytics`,
    `Analytics for ${accountId} (${platform}): ${JSON.stringify(metrics)}`
  );
}
