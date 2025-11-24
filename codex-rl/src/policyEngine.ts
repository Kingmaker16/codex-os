import { v4 as uuidv4 } from "uuid";
import { RLPolicy, RLExperience } from "./types.js";

export function proposePolicy(
  experiences: RLExperience[],
  confidence: number = 0.7
): RLPolicy {
  // Analyze recent experiences to propose policy changes
  const recentExperiences = experiences.slice(-50); // Last 50 experiences
  
  // Find high-reward actions
  const highRewardActions = recentExperiences
    .filter(exp => exp.reward > 0.5)
    .map(exp => exp.action.type);

  const actionCounts: Record<string, number> = {};
  for (const actionType of highRewardActions) {
    actionCounts[actionType] = (actionCounts[actionType] || 0) + 1;
  }

  // Normalize to weights
  const total = Object.values(actionCounts).reduce((sum, count) => sum + count, 0) || 1;
  const actionWeights: Record<string, number> = {};
  for (const [action, count] of Object.entries(actionCounts)) {
    actionWeights[action] = count / total;
  }

  // Generate proposed changes
  const proposedChanges: string[] = [];
  const sortedActions = Object.entries(actionWeights)
    .sort(([, a], [, b]) => b - a);

  for (const [action, weight] of sortedActions) {
    if (weight > 0.3) {
      proposedChanges.push(
        `Increase ${action} action frequency by ${Math.round(weight * 100)}%`
      );
    }
  }

  if (proposedChanges.length === 0) {
    proposedChanges.push("Continue current policy (no significant improvements detected)");
  }

  return {
    id: uuidv4(),
    description: "Policy proposal based on recent experience analysis",
    actionWeights,
    proposedChanges,
    requiresApproval: true, // ALWAYS requires approval for safety
    approved: false,
    confidence,
    timestamp: new Date().toISOString()
  };
}

export function applyPolicy(
  policy: RLPolicy,
  approved: boolean
): { success: boolean; message: string } {
  if (!approved) {
    return {
      success: false,
      message: "Policy not approved. No changes applied."
    };
  }

  if (!policy.requiresApproval) {
    return {
      success: false,
      message: "Policy must require approval for safety."
    };
  }

  // In production, this would update actual service configurations
  // For now, we log the approval
  return {
    success: true,
    message: `Policy ${policy.id} approved and applied. Changes: ${policy.proposedChanges.join(", ")}`
  };
}
