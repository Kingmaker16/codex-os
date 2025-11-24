import fetch from "node-fetch";
import { MeshPlan } from "../types.js";

const BRAIN_URL = "http://localhost:4100";

export async function logMeshPlanToBrain(plan: MeshPlan, message: string): Promise<void> {
  try {
    await fetch(BRAIN_URL + "/v2/memory/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: "ops",
        sessionId: "mesh-" + plan.sessionId,
        title: `Mesh plan update (${plan.domain})`,
        content: JSON.stringify({
          goal: plan.goal,
          mode: plan.mode,
          summary: message,
          steps: plan.steps.map(s => ({
            label: s.label,
            service: s.service,
            status: s.status
          }))
        }),
        tags: ["mesh","orchestration",plan.domain]
      })
    });
  } catch {}
}
