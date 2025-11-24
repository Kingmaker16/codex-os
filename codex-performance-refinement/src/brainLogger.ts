import fetch from "node-fetch";
import { RefinementReport } from "./types.js";

const BRAIN_URL = "http://localhost:4100";

export async function logRefinementToBrain(report: RefinementReport): Promise<void> {
  try {
    const summary = {
      domain: report.domain,
      timestamp: report.timestamp,
      weaknessCount: report.weaknesses.length,
      patternCount: report.patterns.length,
      recommendationCount: report.recommendations.length,
      improvementScore: report.improvementScore,
      highPriorityRecs: report.recommendations.filter(r => r.priority === "HIGH").length,
      topWeaknesses: report.weaknesses.slice(0, 3).map(w => ({
        metric: w.metric,
        type: w.type,
        severity: w.severity
      })),
      topRecommendations: report.recommendations.slice(0, 3).map(r => ({
        category: r.category,
        action: r.action,
        priority: r.priority
      }))
    };

    await fetch(BRAIN_URL + "/v2/memory/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: "performance_refinement",
        sessionId: report.sessionId,
        title: `Performance Refinement: ${report.domain}`,
        content: JSON.stringify(summary),
        tags: ["refinement", report.domain, "performance", "recommendations"]
      })
    });
  } catch (err) {
    console.error("Failed to log refinement report to Brain:", err);
  }
}
