export type RegulationDomain =
  | "social"
  | "ecomm"
  | "video"
  | "strategy"
  | "trends"
  | "campaign"
  | "monetization"
  | "system";

export type RegulationLevel = "INFO" | "WARN" | "BLOCK";

export interface SRLContext {
  sessionId: string;
  domain: RegulationDomain;
  goal?: string;
  recentIssues?: string[];
}

export interface SRLCheckRequest {
  sessionId: string;
  domain: RegulationDomain;
  contentSummary: string;
  plannedActions?: string[];
}

export interface SRLFinding {
  type:
    | "GOAL_DRIFT"
    | "SAFETY_RISK"
    | "LOOP_RISK"
    | "CONTRADICTION"
    | "RESOURCE_STRESS"
    | "ACCOUNT_RISK"
    | "POLICY_DEVIATION"
    | "UNCLEAR_OBJECTIVE";
  level: RegulationLevel;
  message: string;
}

export interface SRLDecision {
  ok: boolean;
  sessionId: string;
  domain: RegulationDomain;
  allowExecution: boolean;
  requireApproval: boolean;
  findings: SRLFinding[];
  summary: string;
  confidence: number; // 0-1
}
