import { SRLCheckRequest, SRLFinding } from "../types.js";

export function checkLoopRisk(req: SRLCheckRequest): SRLFinding[] {
  const findings: SRLFinding[] = [];
  const actions = req.plannedActions || [];

  const repetitive = actions.filter((a, idx) => idx > 0 && a === actions[idx - 1]);
  if (repetitive.length >= 3) {
    findings.push({
      type: "LOOP_RISK",
      level: "WARN",
      message: "Planned actions show repeated identical steps, indicating possible loop behavior."
    });
  }

  return findings;
}
