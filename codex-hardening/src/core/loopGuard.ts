import { HardeningIssue } from "../types.js";

export function detectLoopRisk(plannedActions: string[] | undefined): HardeningIssue[] {
  if (!plannedActions || plannedActions.length < 4) return [];
  const issues: HardeningIssue[] = [];
  const repeated = plannedActions.filter((a, idx) => idx > 0 && a === plannedActions[idx - 1]);
  if (repeated.length >= 3) {
    issues.push({
      type: "LOOP_RISK",
      level: "WARN",
      message: "Potential loop risk: same action repeated many times back-to-back."
    });
  }
  return issues;
}
