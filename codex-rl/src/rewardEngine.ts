import { RLState, RLRewardBreakdown } from "./types.js";

const REWARD_WEIGHTS = {
  trend: 0.3,
  visibility: 0.3,
  engagement: 0.2,
  revenue: 0.2
};

export function computeReward(
  currentState: RLState,
  previousState: RLState
): RLRewardBreakdown {
  // Calculate deltas
  const trendDelta = currentState.trendScore - previousState.trendScore;
  const visibilityDelta = currentState.visibilityScore - previousState.visibilityScore;
  const engagementDelta = currentState.engagementRate - previousState.engagementRate;
  const revenueDelta = currentState.revenue - previousState.revenue;

  // Compute weighted reward
  const totalReward =
    trendDelta * REWARD_WEIGHTS.trend +
    visibilityDelta * REWARD_WEIGHTS.visibility +
    engagementDelta * REWARD_WEIGHTS.engagement +
    revenueDelta * REWARD_WEIGHTS.revenue;

  return {
    trendDelta,
    visibilityDelta,
    engagementDelta,
    revenueDelta,
    totalReward,
    weights: REWARD_WEIGHTS
  };
}

export function normalizeReward(reward: number): number {
  // Normalize to [-1, 1] range using tanh
  return Math.tanh(reward / 10);
}
