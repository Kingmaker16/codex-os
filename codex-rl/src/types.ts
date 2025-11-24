export interface RLState {
  trendScore: number;
  visibilityScore: number;
  engagementRate: number;
  revenue: number;
  timestamp: string;
}

export interface RLAction {
  type: "strategy" | "distribution" | "campaign" | "ecommerce";
  description: string;
  parameters: Record<string, any>;
}

export interface RLRewardBreakdown {
  trendDelta: number;
  visibilityDelta: number;
  engagementDelta: number;
  revenueDelta: number;
  totalReward: number;
  weights: {
    trend: number;
    visibility: number;
    engagement: number;
    revenue: number;
  };
}

export interface RLExperience {
  id: string;
  state: RLState;
  action: RLAction;
  reward: number;
  rewardBreakdown: RLRewardBreakdown;
  nextState: RLState;
  advantage: number;
  timestamp: string;
}

export interface RLEpisode {
  id: string;
  sessionId: string;
  experiences: RLExperience[];
  totalReward: number;
  episodeLength: number;
  timestamp: string;
}

export interface RLPolicy {
  id: string;
  description: string;
  actionWeights: Record<string, number>;
  proposedChanges: string[];
  requiresApproval: boolean;
  approved: boolean;
  confidence: number;
  timestamp: string;
}

export interface RLRunRequest {
  sessionId: string;
  episodes?: number;
}

export interface RLPolicyRequest {
  approve: boolean;
  policyId?: string;
}

export interface RLReplayRequest {
  sessionId?: string;
  limit?: number;
}
