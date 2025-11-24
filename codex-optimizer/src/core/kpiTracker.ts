import { KPI, Domain } from "../types.js";
import fetch from "node-fetch";

const KPI_REGISTRY: Record<string, KPI[]> = {};

export async function fetchKPIsFromServices(domain: Domain): Promise<KPI[]> {
  const kpis: KPI[] = [];
  const now = new Date().toISOString();

  // Social KPIs
  if (domain === "social" || domain === "all") {
    try {
      const resp = await fetch("http://localhost:5020/accounts/list", { method: "GET" });
      const data = await resp.json() as any;
      kpis.push({
        name: "social_accounts_active",
        value: data.accounts?.length ?? 0,
        unit: "count",
        timestamp: now
      });
    } catch {}

    try {
      const resp = await fetch("http://localhost:5040/engagement/stats", { method: "GET" });
      const data = await resp.json() as any;
      kpis.push({
        name: "engagement_rate",
        value: data.avgEngagementRate ?? 0,
        unit: "percent",
        timestamp: now
      });
    } catch {}
  }

  // Ecomm KPIs
  if (domain === "ecomm" || domain === "all") {
    try {
      const resp = await fetch("http://localhost:5100/shop/stats", { method: "GET" });
      const data = await resp.json() as any;
      kpis.push({
        name: "ecomm_stores_active",
        value: data.activeStores ?? 0,
        unit: "count",
        timestamp: now
      });
    } catch {}
  }

  // Video KPIs
  if (domain === "video" || domain === "all") {
    try {
      const resp = await fetch("http://localhost:5230/creative-suite/stats", { method: "GET" });
      const data = await resp.json() as any;
      kpis.push({
        name: "videos_generated",
        value: data.videosCreated ?? 0,
        unit: "count",
        timestamp: now
      });
    } catch {}
  }

  // Distribution KPIs
  if (domain === "campaigns" || domain === "all") {
    try {
      const resp = await fetch("http://localhost:5301/distribution/stats", { method: "GET" });
      const data = await resp.json() as any;
      kpis.push({
        name: "content_distributed",
        value: data.totalDistributions ?? 0,
        unit: "count",
        timestamp: now
      });
    } catch {}
  }

  // Calculate deltas
  const previousKPIs = KPI_REGISTRY[domain] || [];
  for (const kpi of kpis) {
    const prev = previousKPIs.find(p => p.name === kpi.name);
    if (prev) {
      kpi.previousValue = prev.value;
      kpi.delta = kpi.value - prev.value;
    }
  }

  KPI_REGISTRY[domain] = kpis;
  return kpis;
}

export function getKPIDelta(kpi: KPI): number {
  return kpi.delta ?? 0;
}

export function getKPIGrowthRate(kpi: KPI): number {
  if (!kpi.previousValue || kpi.previousValue === 0) return 0;
  return ((kpi.value - kpi.previousValue) / kpi.previousValue) * 100;
}
