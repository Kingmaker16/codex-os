export type TrendPlatform = "tiktok" | "youtube" | "instagram" | "google";

export interface TrendQuery {
  sessionId: string;
  platform: TrendPlatform | "all";
  niche: string;
  language?: string;
}

export interface TrendItem {
  platform: TrendPlatform;
  topic: string;
  examples: string[];
  metricSummary: string;  // e.g. "High growth over last 7 days"
  confidence: number;
}

export interface TrendResponse {
  query: TrendQuery;
  items: TrendItem[];
  generatedAt: string;
}
