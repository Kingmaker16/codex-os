export type MeshDomain =
  | "social"
  | "ecomm"
  | "video"
  | "strategy"
  | "trends"
  | "campaign"
  | "monetization"
  | "system";

export interface MeshRequest {
  sessionId: string;
  domain: MeshDomain;
  goal: string;
  mode?: "SIMULATION" | "DRY_RUN" | "LIVE";
}

export interface MeshStep {
  id: string;
  label: string;
  service: string;      // e.g. "autonomy", "hardening", "srl", "orchestrator"
  endpoint: string;     // e.g. "/autonomy/evaluate"
  payload: any;
  status: "PENDING" | "IN_PROGRESS" | "DONE" | "ERROR";
  result?: any;
  error?: string;
}

export interface MeshPlan {
  id: string;
  sessionId: string;
  domain: MeshDomain;
  goal: string;
  mode: "SIMULATION" | "DRY_RUN" | "LIVE";
  createdAt: string;
  updatedAt: string;
  steps: MeshStep[];
  summary?: string;
}

export interface MeshResponse {
  ok: boolean;
  plan: MeshPlan;
}
