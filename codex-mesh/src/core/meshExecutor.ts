import { MeshPlan, MeshStep } from "../types.js";
import { postJson, AUTONOMY_URL, HARDENING_URL, SRL_URL, WORKFLOW_URL } from "../integrations/serviceClients.js";
import { updatePlan } from "./meshState.js";
import { logMeshPlanToBrain } from "../integrations/brainLogger.js";

function resolveBaseUrl(service: string): string {
  if (service === "autonomy") return AUTONOMY_URL;
  if (service === "srl") return SRL_URL;
  if (service === "hardening") return HARDENING_URL;
  if (service === "workflow") return WORKFLOW_URL;
  return AUTONOMY_URL;
}

export async function runNextMeshStep(plan: MeshPlan): Promise<MeshPlan> {
  const next = plan.steps.find(s => s.status === "PENDING");
  if (!next) {
    await logMeshPlanToBrain(plan, "Mesh plan completed (no more steps).");
    return plan;
  }

  next.status = "IN_PROGRESS";
  updatePlan(plan);

  const baseUrl = resolveBaseUrl(next.service);
  const { ok, status, data } = await postJson(baseUrl + next.endpoint, next.payload);

  if (ok) {
    next.status = "DONE";
    next.result = data;
    await logMeshPlanToBrain(plan, `Step success: ${next.label}`);
  } else {
    next.status = "ERROR";
    next.error = (data as any)?.error || `HTTP ${status}`;
    await logMeshPlanToBrain(plan, `Step error: ${next.label} (${next.error})`);
  }

  updatePlan(plan);
  return plan;
}
