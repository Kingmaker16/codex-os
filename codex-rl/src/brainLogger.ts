import fetch from "node-fetch";
import { RLEpisode, RLPolicy } from "./types.js";

const BRAIN_URL = "http://localhost:4100";

export async function logEpisodeToBrain(episode: RLEpisode): Promise<void> {
  try {
    const summary = {
      episodeId: episode.id,
      sessionId: episode.sessionId,
      totalReward: episode.totalReward,
      episodeLength: episode.episodeLength,
      avgReward: episode.totalReward / episode.episodeLength,
      timestamp: episode.timestamp,
      rewardBreakdown: episode.experiences[episode.experiences.length - 1]?.rewardBreakdown
    };

    await fetch(BRAIN_URL + "/v2/memory/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: "rl",
        sessionId: episode.sessionId,
        title: `RL Episode ${episode.id.slice(0, 8)}`,
        content: JSON.stringify(summary),
        tags: ["rl", "episode", "reward", "a2c"]
      })
    });
  } catch (err) {
    console.error("Failed to log episode to Brain:", err);
  }
}

export async function logPolicyToBrain(policy: RLPolicy, sessionId: string): Promise<void> {
  try {
    const summary = {
      policyId: policy.id,
      description: policy.description,
      requiresApproval: policy.requiresApproval,
      approved: policy.approved,
      confidence: policy.confidence,
      proposedChanges: policy.proposedChanges,
      actionWeights: policy.actionWeights,
      timestamp: policy.timestamp
    };

    await fetch(BRAIN_URL + "/v2/memory/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: "rl",
        sessionId,
        title: `RL Policy Proposal ${policy.id.slice(0, 8)}`,
        content: JSON.stringify(summary),
        tags: ["rl", "policy", "proposal", "approval-required"]
      })
    });
  } catch (err) {
    console.error("Failed to log policy to Brain:", err);
  }
}
