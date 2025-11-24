import { DomainOptimizer, OptimizationInsight, KPI, ServiceHealth } from "../../types.js";

export class CampaignsOptimizer implements DomainOptimizer {
  domain = "campaigns" as const;

  async analyze(kpis: KPI[], serviceHealth: ServiceHealth[]): Promise<OptimizationInsight[]> {
    const insights: OptimizationInsight[] = [];

    const distributionKPI = kpis.find(k => k.name === "content_distributed");
    if (distributionKPI && distributionKPI.value < 10) {
      insights.push({
        domain: "campaigns",
        priority: "MEDIUM",
        issue: "Low content distribution volume",
        recommendation: "Increase posting frequency, enable multi-platform distribution, activate 7-day calendars",
        impactScore: 0.65,
        estimatedGain: "+20 posts/week",
        actionable: true,
        requiresApproval: false
      });
    }

    return insights;
  }
}
