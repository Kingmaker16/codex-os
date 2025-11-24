export type Domain = 
  | "social" 
  | "ecomm" 
  | "video" 
  | "trends" 
  | "monetization" 
  | "campaigns"
  | "all";

export type OptimizationCycle = "hourly" | "daily" | "weekly" | "on_demand";

export interface KPI {
  name: string;
  value: number;
  previousValue?: number;
  delta?: number;
  unit: string;
  timestamp: string;
}

export interface ServiceHealth {
  service: string;
  port: number;
  healthy: boolean;
  responseTime?: number;
}

export interface OptimizationInsight {
  domain: Domain;
  priority: "HIGH" | "MEDIUM" | "LOW";
  issue: string;
  recommendation: string;
  impactScore: number; // 0-1
  estimatedGain?: string;
  actionable: boolean;
  requiresApproval: boolean;
}

export interface ABTestDesign {
  id: string;
  domain: Domain;
  hypothesis: string;
  variantA: string;
  variantB: string;
  metrics: string[];
  duration: string;
  sampleSize: number;
}

export interface OptimizationRequest {
  sessionId: string;
  domain: Domain;
  cycle: OptimizationCycle;
  includeABTests?: boolean;
}

export interface OptimizationResult {
  ok: boolean;
  sessionId: string;
  domain: Domain;
  timestamp: string;
  kpis: KPI[];
  insights: OptimizationInsight[];
  corrections: OptimizationInsight[];
  abTests?: ABTestDesign[];
  serviceHealth: ServiceHealth[];
  llmConsensus?: string;
  confidence: number;
}

export interface DomainOptimizer {
  domain: Domain;
  analyze(kpis: KPI[], serviceHealth: ServiceHealth[]): Promise<OptimizationInsight[]>;
}
