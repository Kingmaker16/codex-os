import fetch from "node-fetch";
import { CrossValResult } from "./types.js";

const BRAIN_URL = "http://localhost:4100";

export async function logCrossValToBrain(result: CrossValResult): Promise<void> {
  try {
    await fetch(BRAIN_URL + "/v2/memory/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: "system",
        sessionId: "crossval-" + result.sessionId,
        title: `CrossVal result for domain ${result.domain}`,
        content: JSON.stringify({
          fusedAnswer: result.fusedAnswer.slice(0, 500),
          confidence: result.confidence,
          issues: result.issues,
          models: result.modelOutputs.map(m => ({ provider: m.provider, model: m.model }))
        }),
        tags: ["crossval", result.domain]
      })
    });
  } catch {
    // ignore logging errors
  }
}
