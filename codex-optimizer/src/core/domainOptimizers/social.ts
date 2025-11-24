import { DomainOptimizer, OptimizationInsight, KPI, ServiceHealth } from "../../types.js";

export class SocialOptimizer implements DomainOptimizer {
  domain = "social" as const;

  async analyze(kpis: KPI[], serviceHealth: ServiceHealth[]): Promise<OptimizationInsight[]> {
    const insights: OptimizationInsight[] = [];

    // Check account growth
    const accountKPI = kpis.find(k => k.name === "social_accounts_active");
    if (accountKPI && accountKPI.value < 5) {
      insights.push({
        domain: "social",
        priority: "HIGH",
        issue: "Low social account count",
        recommendation: "Create additional social profiles across TikTok, Instagram, YouTube Shorts",
        impactScore: 0.8,
        estimatedGain: "3-5 new accounts",
        actionable: true,
        requiresApproval: false
      });
    }

    // Check engagement
    const engagementKPI = kpis.find(k => k.name === "engagement_rate");
    if (engagementKPI && engagementKPI.value < 5) {
      insights.push({
        domain: "social",
        priority: "MEDIUM",
        issue: "Low engagement rate (< 5%)",
        recommendation: "Optimize hook strategies, test trending audio, improve CTA placement",
        impactScore: 0.6,
        estimatedGain: "+2-3% engagement",
        actionable: true,
        requiresApproval: false
      });
    }

    // Service health
    const accountService = serviceHealth.find(s => s.service === "codex-accounts");
    if (accountService && !accountService.healthy) {
      insights.push({
        domain: "social",
        priority: "HIGH",
        issue: "Account creation service unhealthy",
        recommendation: "Restart codex-accounts service (port 5020)",
        impactScore: 0.9,
        actionable: true,
        requiresApproval: true
      });
    }

    return insights;
  }
}
