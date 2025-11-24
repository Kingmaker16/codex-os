import fetch from "node-fetch";
import { OptimizationResult } from "./types.js";

const BRAIN_URL = "http://localhost:4100";

export async function logOptimizationToBrain(result: OptimizationResult): Promise<void> {
  try {
    const summary = {
      domain: result.domain,
      timestamp: result.timestamp,
      kpiCount: result.kpis.length,
      insightCount: result.insights.length,
      correctionCount: result.corrections.length,
      highPriorityIssues: result.insights.filter(i => i.priority === "HIGH").length,
      confidence: result.confidence,
      topInsights: result.insights.slice(0, 3).map(i => ({
        priority: i.priority,
        issue: i.issue,
        impact: i.impactScore
      }))
    };

    await fetch(BRAIN_URL + "/v2/memory/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: "system",
        sessionId: "optimizer-" + result.sessionId,
        title: `Optimization run: ${result.domain} domain`,
        content: JSON.stringify(summary),
        tags: ["optimizer", result.domain, "kpi", "insights"]
      })
    });
  } catch {
    // Ignore logging errors
  }
}
