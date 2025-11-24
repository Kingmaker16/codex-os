import { Workflow } from "./types.js";

export const workflows: Map<string, Workflow> = new Map();

export function addWorkflow(w: Workflow) {
  workflows.set(w.id, w);
}

export function getWorkflow(id: string): Workflow | undefined {
  return workflows.get(id);
}

export function listWorkflows(): Workflow[] {
  return Array.from(workflows.values());
}

export function updateWorkflow(w: Workflow) {
  w.updatedAt = new Date().toISOString();
  workflows.set(w.id, w);
}
