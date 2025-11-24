import { DomainOptimizer, OptimizationInsight, KPI, ServiceHealth } from "../../types.js";

export class VideoOptimizer implements DomainOptimizer {
  domain = "video" as const;

  async analyze(kpis: KPI[], serviceHealth: ServiceHealth[]): Promise<OptimizationInsight[]> {
    const insights: OptimizationInsight[] = [];

    const videosKPI = kpis.find(k => k.name === "videos_generated");
    if (videosKPI && videosKPI.delta && videosKPI.delta < 0) {
      insights.push({
        domain: "video",
        priority: "MEDIUM",
        issue: "Video generation declining",
        recommendation: "Check Creative Suite health, review content calendar, optimize video templates",
        impactScore: 0.7,
        actionable: true,
        requiresApproval: false
      });
    }

    return insights;
  }
}
