export type HardeningLevel = "INFO" | "WARN" | "CRITICAL";

export interface ServiceStatus {
  name: string;
  healthy: boolean;
  lastLatencyMs?: number;
  lastError?: string;
}

export interface HardeningCheckRequest {
  sessionId: string;
  workflowId?: string;
  domain?: string;
  actionSummary: string;
  servicesInvolved: string[];
  plannedActions?: string[];
}

export interface HardeningIssue {
  type:
    | "SERVICE_DOWN"
    | "HIGH_LATENCY"
    | "RECENT_FAILURES"
    | "LOOP_RISK"
    | "RESOURCE_STRESS"
    | "SAFETY_RISK"
    | "UNSTABLE_POLICY";
  level: HardeningLevel;
  message: string;
}

export interface HardeningDecision {
  ok: boolean;
  sessionId: string;
  domain?: string;
  allowExecution: boolean;
  requireApproval: boolean;
  issues: HardeningIssue[];
  summary: string;
  confidence: number; // 0-1
}
