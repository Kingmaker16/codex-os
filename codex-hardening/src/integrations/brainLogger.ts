import fetch from "node-fetch";
import { HardeningDecision } from "../types.js";

const BRAIN_URL = "http://localhost:4100";

export async function logDecisionToBrain(decision: HardeningDecision): Promise<void> {
  try {
    await fetch(BRAIN_URL + "/v2/memory/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: "system",
        sessionId: "hardening-" + decision.sessionId,
        title: `Hardening decision for domain ${decision.domain}`,
        content: JSON.stringify({
          allowExecution: decision.allowExecution,
          requireApproval: decision.requireApproval,
          confidence: decision.confidence,
          issues: decision.issues
        }),
        tags: ["hardening","stability", decision.domain]
      })
    });
  } catch {
    // logging failures are non-fatal
  }
}
