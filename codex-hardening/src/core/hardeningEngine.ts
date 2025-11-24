import { HardeningCheckRequest, HardeningDecision, HardeningIssue } from "../types.js";
import { checkServiceHealth } from "./serviceHealth.js";
import { detectAnomalies } from "./anomalyDetector.js";
import { detectLoopRisk } from "./loopGuard.js";
import { logDecisionToBrain } from "../integrations/brainLogger.js";

export async function runHardeningCheck(req: HardeningCheckRequest): Promise<HardeningDecision> {
  const serviceStatuses = await checkServiceHealth();
  let issues: HardeningIssue[] = [];

  issues = issues.concat(detectAnomalies(serviceStatuses));
  issues = issues.concat(detectLoopRisk(req.plannedActions));

  let allowExecution = true;
  let requireApproval = false;

  for (const issue of issues) {
    if (issue.level === "CRITICAL") {
      allowExecution = false;
      requireApproval = true;
    }
    if (issue.level === "WARN") {
      requireApproval = true;
    }
  }

  const summary =
    issues.length === 0
      ? "No hardening issues detected."
      : issues.map(i => `[${i.level}] ${i.type}: ${i.message}`).join(" | ");

  const confidence = issues.length === 0 ? 0.95 : allowExecution ? 0.7 : 0.3;

  const decision: HardeningDecision = {
    ok: true,
    sessionId: req.sessionId,
    domain: req.domain,
    allowExecution,
    requireApproval,
    issues,
    summary,
    confidence
  };

  await logDecisionToBrain(decision);
  return decision;
}
