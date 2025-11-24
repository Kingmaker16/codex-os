export interface AdaptiveInsight {
  id: string;
  title: string;
  description: string;
  confidence: number;
  impact: number;
  requiresApproval: boolean;
  sourceModels: string[];
  actionItems: string[];
}

export interface AdaptiveRequest {
  sessionId: string;
  goal: string;
  context?: any;
  domains?: string[];
}

export interface AdaptiveResponse {
  ok: boolean;
  insights: AdaptiveInsight[];
  elapsedMs: number;
}
