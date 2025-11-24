import { OptimizationInsight, KPI, Domain } from "../types.js";

export function generateCorrections(
  domain: Domain,
  kpis: KPI[]
): OptimizationInsight[] {
  const corrections: OptimizationInsight[] = [];

  // Check for declining KPIs
  for (const kpi of kpis) {
    if (kpi.delta && kpi.delta < 0) {
      corrections.push({
        domain,
        priority: Math.abs(kpi.delta) > 10 ? "HIGH" : "MEDIUM",
        issue: `${kpi.name} declined by ${Math.abs(kpi.delta)} ${kpi.unit}`,
        recommendation: `Investigate ${kpi.name} drop. Review recent changes in ${domain} workflows.`,
        impactScore: Math.min(1, Math.abs(kpi.delta) / 100),
        estimatedGain: `Restore ${Math.abs(kpi.delta)} ${kpi.unit}`,
        actionable: true,
        requiresApproval: false
      });
    }
  }

  // Check for stagnant KPIs
  for (const kpi of kpis) {
    if (kpi.delta === 0 && kpi.value > 0) {
      corrections.push({
        domain,
        priority: "LOW",
        issue: `${kpi.name} is stagnant (no growth)`,
        recommendation: `Implement growth strategies for ${kpi.name}. Consider A/B testing.`,
        impactScore: 0.3,
        actionable: true,
        requiresApproval: false
      });
    }
  }

  return corrections;
}

export function prioritizeCorrections(
  corrections: OptimizationInsight[]
): OptimizationInsight[] {
  return corrections.sort((a, b) => {
    const priorityScore = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    const aScore = priorityScore[a.priority] + a.impactScore;
    const bScore = priorityScore[b.priority] + b.impactScore;
    return bScore - aScore;
  });
}
