import { DomainOptimizer, OptimizationInsight, KPI, ServiceHealth } from "../../types.js";

export class EcommOptimizer implements DomainOptimizer {
  domain = "ecomm" as const;

  async analyze(kpis: KPI[], serviceHealth: ServiceHealth[]): Promise<OptimizationInsight[]> {
    const insights: OptimizationInsight[] = [];

    const storesKPI = kpis.find(k => k.name === "ecomm_stores_active");
    if (storesKPI && storesKPI.value === 0) {
      insights.push({
        domain: "ecomm",
        priority: "HIGH",
        issue: "No active e-commerce stores",
        recommendation: "Create Shopify store, sync products, enable payment processing",
        impactScore: 0.85,
        estimatedGain: "1 active store",
        actionable: true,
        requiresApproval: false
      });
    }

    return insights;
  }
}
