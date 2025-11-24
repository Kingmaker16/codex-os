export type Domain = 
  | "social" 
  | "ecomm" 
  | "video" 
  | "strategy" 
  | "trends" 
  | "campaign" 
  | "monetization";

export type WeaknessType = "DECLINE" | "PLATEAU" | "UNDERPERFORMANCE";
export type ImpactLevel = "HIGH" | "MEDIUM" | "LOW";

export interface Metrics {
  views?: number;
  ctr?: number;
  engagement?: number;
  trendVelocity?: number;
  watchTime?: number;
  rpm?: number;
  revenue?: number;
  postingCadence?: number;
  [key: string]: number | undefined;
}

export interface Weakness {
  metric: string;
  type: WeaknessType;
  severity: ImpactLevel;
  currentValue: number;
  benchmark?: number;
  delta?: number;
  description: string;
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  confidence: number;
  correlation: string;
  dataPoints: number;
}

export interface Recommendation {
  id: string;
  priority: ImpactLevel;
  category: string;
  action: string;
  rationale: string;
  expectedImpact: string;
  requiresApproval: boolean;
  estimatedEffort: "LOW" | "MEDIUM" | "HIGH";
  llmSource?: string;
}

export interface ProgressEntry {
  date: string;
  domain: Domain;
  metrics: Metrics;
  improvementScore: number;
}

export interface RefinementRequest {
  sessionId: string;
  domain: Domain;
  metrics: Metrics;
  includeLLMRecommendations?: boolean;
}

export interface RefinementReport {
  ok: boolean;
  sessionId: string;
  domain: Domain;
  timestamp: string;
  weaknesses: Weakness[];
  patterns: Pattern[];
  recommendations: Recommendation[];
  improvementScore: number;
  llmConsensus?: string;
}

export interface HistoryRequest {
  domain?: Domain;
  days?: number;
}
