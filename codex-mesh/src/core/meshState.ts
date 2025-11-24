import { MeshPlan } from "../types.js";

const plans: Map<string, MeshPlan> = new Map();

export function addPlan(p: MeshPlan) {
  plans.set(p.id, p);
}

export function getPlan(id: string): MeshPlan | undefined {
  return plans.get(id);
}

export function listPlans(): MeshPlan[] {
  return Array.from(plans.values());
}

export function updatePlan(p: MeshPlan) {
  p.updatedAt = new Date().toISOString();
  plans.set(p.id, p);
}
