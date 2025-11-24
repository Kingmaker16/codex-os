import { v4 as uuidv4 } from "uuid";
import { AutonomyMemoryRecord, AutonomyOutcome } from "./types.js";
import { addRecord, listRecords, filterByDomain, filterByOutcome } from "./state.js";

export function storeAutonomyMemory(input: {
  sessionId: string;
  workflowId?: string;
  goal: string;
  domain: string[];
  decision: string;
  outcome: AutonomyOutcome;
  approved: boolean;
  notes?: string;
  metrics?: Record<string, number>;
}): AutonomyMemoryRecord {
  const rec: AutonomyMemoryRecord = {
    id: uuidv4(),
    sessionId: input.sessionId,
    workflowId: input.workflowId,
    goal: input.goal,
    domain: input.domain,
    decision: input.decision,
    outcome: input.outcome,
    approved: input.approved,
    ts: new Date().toISOString(),
    notes: input.notes,
    metrics: input.metrics
  };
  addRecord(rec);
  return rec;
}

export function getRecent(limit: number = 50) {
  return listRecords(limit);
}

export function getByDomain(domain: string) {
  return filterByDomain(domain);
}

export function getByOutcome(outcome: AutonomyOutcome) {
  return filterByOutcome(outcome);
}
