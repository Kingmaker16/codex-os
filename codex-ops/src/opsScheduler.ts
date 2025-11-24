// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Ops Engine v1 ULTRA - Scheduler
// Runs queued ops tasks every 60 seconds with retry logic
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import {
  dequeueTask,
  requeueTask,
  setActiveTask,
  getActiveTask,
} from "./state.js";
import { executeTask } from "./opsExecutor.js";
import {
  logTaskStart,
  logTaskComplete,
  logTaskFailed,
} from "./opsBrainLogger.js";

const SCHEDULER_INTERVAL = 60000; // 60 seconds
const BACKOFF_DELAYS = [10000, 30000, 60000]; // 10s, 30s, 60s
let schedulerRunning = false;

export function startScheduler(): void {
  if (schedulerRunning) {
    return;
  }

  schedulerRunning = true;
  console.log("[OPS SCHEDULER] Started - checking queue every 60s");

  setInterval(async () => {
    await processQueue();
  }, SCHEDULER_INTERVAL);

  // Also process immediately on start
  setTimeout(() => processQueue(), 1000);
}

async function processQueue(): Promise<void> {
  const activeTask = getActiveTask();

  // Don't process if there's an active task
  if (activeTask) {
    return;
  }

  const task = dequeueTask();
  if (!task) {
    return;
  }

  setActiveTask(task);

  console.log(
    `[OPS SCHEDULER] Processing task: ${task.taskId} (${task.task})`
  );

  await logTaskStart(task.taskId, task.task, task.sessionId);

  const startTime = Date.now();

  try {
    await executeTask(task);

    if (task.status === "COMPLETED") {
      const latency = Date.now() - startTime;
      await logTaskComplete(
        task.taskId,
        task.task,
        task.sessionId,
        latency,
        task.retries
      );
      console.log(`[OPS SCHEDULER] Task completed: ${task.taskId}`);
    } else if (task.status === "FAILED") {
      // Check if we should retry
      if (task.retries < task.maxRetries) {
        const backoffDelay =
          BACKOFF_DELAYS[Math.min(task.retries, BACKOFF_DELAYS.length - 1)];
        console.log(
          `[OPS SCHEDULER] Task failed, retrying in ${backoffDelay}ms: ${task.taskId}`
        );

        setTimeout(() => {
          requeueTask(task);
        }, backoffDelay);
      } else {
        await logTaskFailed(
          task.taskId,
          task.task,
          task.sessionId,
          task.error || "Max retries exceeded",
          task.retries
        );
        console.error(
          `[OPS SCHEDULER] Task failed permanently: ${task.taskId}`
        );
      }
    }
  } catch (error: any) {
    task.status = "FAILED";
    task.error = error.message || "Unknown error";

    await logTaskFailed(
      task.taskId,
      task.task,
      task.sessionId,
      error.message,
      task.retries
    );

    console.error(`[OPS SCHEDULER] Task error: ${task.taskId}`, error);
  } finally {
    setActiveTask(null);
  }
}
