export type WorkflowStatus = "PLANNED" | "RUNNING" | "PAUSED" | "COMPLETED" | "FAILED";

export interface WorkflowStep {
  id: string;
  label: string;
  service: string;          // e.g. "strategy", "creative", "video", "distribution"
  endpoint: string;         // e.g. "/strategy/plan"
  mode?: "SIMULATION" | "DRY_RUN" | "LIVE";
  payload: any;
  requiresApproval: boolean;
  status: "PENDING" | "IN_PROGRESS" | "DONE" | "ERROR";
  result?: any;
  error?: string;
}

export interface Workflow {
  id: string;
  projectId: string;
  goal: string;
  createdAt: string;
  updatedAt: string;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  reasoningTrace: string[];
}

export interface WorkflowCreateRequest {
  projectId: string;
  goal: string;
  sessionId: string;
}

export interface WorkflowStartRequest {
  workflowId: string;
}

export interface WorkflowApproveStepRequest {
  workflowId: string;
  stepId: string;
}
