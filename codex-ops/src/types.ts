// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Ops Engine v1 ULTRA - Type Definitions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const OPS_ENGINE_VERSION = "1.0.0-ULTRA";

export type OpsStatus = "GREEN" | "YELLOW" | "RED";
export type TaskStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "RETRY";

export interface OpsTask {
  taskId: string;
  sessionId: string;
  task: string;
  steps: string[];
  params?: Record<string, any>;
  status: TaskStatus;
  currentStep: number;
  retries: number;
  maxRetries: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  results: OpsStepResult[];
}

export interface OpsStepResult {
  step: string;
  status: "success" | "failure";
  latency: number;
  output?: any;
  error?: string;
  timestamp: string;
}

export interface OpsRunRequest {
  sessionId: string;
  task: string;
  steps?: string[];
  params?: Record<string, any>;
}

export interface OpsQueueRequest {
  task: string;
  steps: string[];
  params?: Record<string, any>;
  sessionId?: string;
}

export interface OpsRecoveryRequest {
  service: string;
  action: "restart" | "fallback" | "skip";
}

export interface ServiceHealth {
  service: string;
  port: number;
  healthy: boolean;
  latency?: number;
  error?: string;
}

export interface OpsHealthResponse {
  ok: boolean;
  status: OpsStatus;
  version: string;
  services: ServiceHealth[];
  queueLength: number;
  activeTask?: string;
  uptime: number;
}

export interface BrainLogEntry {
  ts: string;
  service: string;
  action: string;
  result: "success" | "failure";
  latency: number;
  retries: number;
  sessionId: string;
  metadata?: Record<string, any>;
}
