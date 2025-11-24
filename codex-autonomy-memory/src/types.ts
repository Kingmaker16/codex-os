export type AutonomyOutcome = "SUCCESS" | "FAILURE" | "PARTIAL" | "BLOCKED";

export interface AutonomyMemoryRecord {
  id: string;
  sessionId: string;
  workflowId?: string;
  goal: string;
  domain: string[];
  decision: string;          // high-level decision made by autonomy system
  outcome: AutonomyOutcome;
  approved: boolean;
  ts: string;
  notes?: string;
  metrics?: Record<string, number>;
}
