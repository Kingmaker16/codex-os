import fetch from "node-fetch";
import { SRLCheckRequest, SRLFinding } from "../types.js";

const SAFETY_URL = "http://localhost:5090";
const SELF_AUDIT_URL = "http://localhost:5530";

export async function checkSafety(req: SRLCheckRequest): Promise<SRLFinding[]> {
  const findings: SRLFinding[] = [];

  try {
    const auditResp = await fetch(SELF_AUDIT_URL + "/audit/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: req.sessionId,
        content: req.contentSummary,
        contentType: "action",
        enableLLMValidation: false,
        enableSafetyCheck: false,
        enableConsistencyCheck: false
      })
    });
    const auditJson = await auditResp.json() as any;

    if (auditJson.report && auditJson.report.findings) {
      const critical = auditJson.report.findings.filter((f: any) => f.severity === "CRITICAL");
      if (critical.length > 0) {
        findings.push({
          type: "SAFETY_RISK",
          level: "BLOCK",
          message: "Self-Audit reported CRITICAL issues. Execution should be blocked."
        });
      }
    }
  } catch {
    findings.push({
      type: "SAFETY_RISK",
      level: "WARN",
      message: "Self-Audit unavailable. Proceed with caution."
    });
  }

  try {
    await fetch(SAFETY_URL + "/health").catch(() => {});
  } catch {}

  return findings;
}
