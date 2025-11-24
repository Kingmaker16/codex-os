export interface ContextInput {
  sessionId: string;
  goal: string;
  domain: string[];
  recentMetrics: Record<string, number>;
}

export interface InsightProposal {
  id: string;
  title: string;
  description: string;
  confidence: number;
  impact: number;
  requiresApproval: boolean;
  actions: string[];
  sourceModels: string[];
}
