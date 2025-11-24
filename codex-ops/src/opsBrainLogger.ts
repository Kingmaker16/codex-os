// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Ops Engine v1 ULTRA - Brain Logger
// Streams all ops events to Brain service for analytics
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import fetch from "node-fetch";
import type { BrainLogEntry } from "./types.js";

const BRAIN_PORT = 4100;
const OPS_SESSION_ID = "codex-ops-log";

export async function logToBrain(entry: Omit<BrainLogEntry, "ts">): Promise<void> {
  const brainEntry: BrainLogEntry = {
    ...entry,
    ts: new Date().toISOString(),
    sessionId: entry.sessionId || OPS_SESSION_ID,
  };

  try {
    await fetch(`http://localhost:${BRAIN_PORT}/brain/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brainEntry),
      signal: AbortSignal.timeout(1000),
    });
  } catch (error) {
    // Silent fail - don't let logging block ops
    console.error("[OPS] Failed to log to Brain:", error);
  }
}

export async function logTaskStart(
  taskId: string,
  task: string,
  sessionId: string
): Promise<void> {
  await logToBrain({
    service: "ops",
    action: `task_start:${task}`,
    result: "success",
    latency: 0,
    retries: 0,
    sessionId,
    metadata: { taskId },
  });
}

export async function logTaskComplete(
  taskId: string,
  task: string,
  sessionId: string,
  latency: number,
  retries: number
): Promise<void> {
  await logToBrain({
    service: "ops",
    action: `task_complete:${task}`,
    result: "success",
    latency,
    retries,
    sessionId,
    metadata: { taskId },
  });
}

export async function logTaskFailed(
  taskId: string,
  task: string,
  sessionId: string,
  error: string,
  retries: number
): Promise<void> {
  await logToBrain({
    service: "ops",
    action: `task_failed:${task}`,
    result: "failure",
    latency: 0,
    retries,
    sessionId,
    metadata: { taskId, error },
  });
}

export async function logStepExecution(
  step: string,
  result: "success" | "failure",
  latency: number,
  sessionId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logToBrain({
    service: "ops",
    action: `step:${step}`,
    result,
    latency,
    retries: 0,
    sessionId,
    metadata,
  });
}
