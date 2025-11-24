import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";
import { Finding } from "../types.js";

const SAFETY_ENGINE_URL = "http://localhost:5090";

export async function validateSafety(content: string, sessionId: string): Promise<Finding[]> {
  const findings: Finding[] = [];

  try {
    const resp = await fetch(SAFETY_ENGINE_URL + "/safety/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        action: { type: "audit", description: content.slice(0, 500) }
      })
    });

    const data = await resp.json() as any;

    if (data.violations && data.violations.length > 0) {
      for (const violation of data.violations) {
        findings.push({
          id: uuidv4(),
          type: "SAFETY_VIOLATION",
          severity: violation.severity || "HIGH",
          confidence: 0.9,
          description: violation.rule || "Safety rule violation detected",
          context: violation.reason
        });
      }
    }
  } catch (err) {
    // Safety engine unavailable - add warning
    findings.push({
      id: uuidv4(),
      type: "SAFETY_VIOLATION",
      severity: "LOW",
      confidence: 0.3,
      description: "Unable to verify safety compliance (Safety Engine offline)"
    });
  }

  return findings;
}
