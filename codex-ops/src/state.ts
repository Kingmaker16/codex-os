// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Ops Engine v1 ULTRA - State Management
// In-memory storage for tasks, queue, and global state
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { OpsTask, TaskStatus } from "./types.js";
import { v4 as uuidv4 } from "uuid";

const taskQueue: OpsTask[] = [];
const taskHistory = new Map<string, OpsTask>();
let activeTask: OpsTask | null = null;
const startTime = Date.now();

export function createTask(
  task: string,
  steps: string[],
  sessionId: string,
  params?: Record<string, any>
): OpsTask {
  const opsTask: OpsTask = {
    taskId: uuidv4(),
    sessionId,
    task,
    steps,
    params,
    status: "QUEUED",
    currentStep: 0,
    retries: 0,
    maxRetries: 3,
    createdAt: new Date().toISOString(),
    results: [],
  };

  taskQueue.push(opsTask);
  taskHistory.set(opsTask.taskId, opsTask);
  return opsTask;
}

export function getQueue(): OpsTask[] {
  return [...taskQueue];
}

export function getActiveTask(): OpsTask | null {
  return activeTask;
}

export function setActiveTask(task: OpsTask | null): void {
  activeTask = task;
}

export function dequeueTask(): OpsTask | undefined {
  return taskQueue.shift();
}

export function requeueTask(task: OpsTask): void {
  task.status = "QUEUED";
  task.retries += 1;
  taskQueue.push(task);
}

export function updateTaskStatus(taskId: string, status: TaskStatus): void {
  const task = taskHistory.get(taskId);
  if (task) {
    task.status = status;
    if (status === "COMPLETED" || status === "FAILED") {
      task.completedAt = new Date().toISOString();
    }
  }
}

export function getTask(taskId: string): OpsTask | undefined {
  return taskHistory.get(taskId);
}

export function getQueueLength(): number {
  return taskQueue.length;
}

export function getUptime(): number {
  return Math.floor((Date.now() - startTime) / 1000);
}

export function clearQueue(): void {
  taskQueue.length = 0;
}
