import { HardeningIssue, ServiceStatus } from "../types.js";

export function detectAnomalies(statuses: ServiceStatus[]): HardeningIssue[] {
  const issues: HardeningIssue[] = [];

  for (const s of statuses) {
    if (!s.healthy) {
      issues.push({
        type: "SERVICE_DOWN",
        level: "CRITICAL",
        message: `Service ${s.name} is not healthy.`
      });
    } else if ((s.lastLatencyMs ?? 0) > 3000) {
      issues.push({
        type: "HIGH_LATENCY",
        level: "WARN",
        message: `Service ${s.name} has high latency: ${s.lastLatencyMs}ms.`
      });
    }
  }

  return issues;
}
