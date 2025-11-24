import { SRLCheckRequest, SRLDecision, SRLContext, SRLFinding } from "../types.js";
import { checkGoalDrift } from "./goalRegulator.js";
import { checkSafety } from "./safetyRegulator.js";
import { checkLoopRisk } from "./loopRegulator.js";
import { checkSystemStress } from "./systemRegulator.js";
import { logToBrain } from "../integrations/brainLogger.js";

export async function runSelfRegulation(req: SRLCheckRequest): Promise<SRLDecision> {
  const ctx: SRLContext = {
    sessionId: req.sessionId,
    domain: req.domain,
    goal: req.contentSummary
  };

  let findings: SRLFinding[] = [];

  findings = findings.concat(checkGoalDrift(ctx));
  findings = findings.concat(await checkSafety(req));
  findings = findings.concat(checkLoopRisk(req));
  findings = findings.concat(await checkSystemStress());

  let block = false;
  let requireApproval = false;

  for (const f of findings) {
    if (f.level === "BLOCK") block = true;
    if (f.level === "WARN") requireApproval = true;
  }

  const issuesDescription = findings.map(f => `[${f.level}] ${f.type}: ${f.message}`).join(" | ") || "No issues detected.";

  const decision: SRLDecision = {
    ok: true,
    sessionId: req.sessionId,
    domain: req.domain,
    allowExecution: !block,
    requireApproval: requireApproval || block,
    findings,
    summary: issuesDescription,
    confidence: block ? 0.2 : requireApproval ? 0.6 : 0.9
  };

  await logToBrain(decision);
  return decision;
}
