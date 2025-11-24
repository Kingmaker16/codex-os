import fetch from "node-fetch";
import { SRLDecision } from "../types.js";

const BRAIN_URL = "http://localhost:4100";

export async function logToBrain(decision: SRLDecision): Promise<void> {
  try {
    await fetch(BRAIN_URL + "/v2/memory/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: "system",
        sessionId: "srl-" + decision.sessionId,
        title: `SRL decision for domain ${decision.domain}`,
        content: JSON.stringify({
          allowExecution: decision.allowExecution,
          requireApproval: decision.requireApproval,
          confidence: decision.confidence,
          findings: decision.findings
        }),
        tags: ["srl", "self_regulation", decision.domain]
      })
    });
  } catch {}
}
