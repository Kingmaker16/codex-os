export type StrategyDomain = "ecomm" | "social" | "trading" | "kingmaker" | "creative";

export interface StrategyQuestion {
  sessionId: string;
  domain: StrategyDomain[];
  goal: string;           // e.g. "grow TikTok", "launch product", "test niche"
  horizonDays: number;    // planning horizon
}

export interface StrategyPlay {
  id: string;
  domain: StrategyDomain;
  description: string;
  rationale: string;
  prerequisites?: string[];
  riskLevel: "low" | "medium" | "high";
}

export interface StrategyPlan {
  id: string;
  sessionId: string;
  domains: StrategyDomain[];
  goal: string;
  horizonDays: number;
  plays: StrategyPlay[];
  createdAt: string;
  sourceModels: string[];
  trendContext?: string;  // Optional trend summary from Trend Engine
}

export interface StrategyEvaluation {
  planId: string;
  performanceSummary: string;
  keepPlays: string[];
  modifyPlays: string[];
  dropPlays: string[];
  nextActions: string[];
}
