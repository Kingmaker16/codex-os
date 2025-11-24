import { SRLContext, SRLFinding } from "../types.js";

export function checkGoalDrift(ctx: SRLContext): SRLFinding[] {
  const findings: SRLFinding[] = [];
  if (!ctx.goal || ctx.goal.trim().length < 8) {
    findings.push({
      type: "UNCLEAR_OBJECTIVE",
      level: "WARN",
      message: "Goal is missing or too vague for safe autonomous execution."
    });
  }
  return findings;
}
