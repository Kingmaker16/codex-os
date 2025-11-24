import { RLExperience } from "./types.js";

export function computeAdvantage(
  experience: RLExperience,
  baseline: number = 0
): number {
  // Simplified advantage estimation: A = R - baseline
  const advantage = experience.reward - baseline;
  return advantage;
}

export function computeBaseline(experiences: RLExperience[]): number {
  if (experiences.length === 0) return 0;
  
  const totalReward = experiences.reduce((sum, exp) => sum + exp.reward, 0);
  return totalReward / experiences.length;
}

export function updateAdvantages(
  experiences: RLExperience[]
): RLExperience[] {
  const baseline = computeBaseline(experiences);
  
  return experiences.map(exp => ({
    ...exp,
    advantage: computeAdvantage(exp, baseline)
  }));
}

export function estimateValue(
  experiences: RLExperience[],
  lookback: number = 20
): number {
  // Estimate expected future value based on recent experiences
  const recent = experiences.slice(-lookback);
  if (recent.length === 0) return 0;
  
  const avgReward = recent.reduce((sum, exp) => sum + exp.reward, 0) / recent.length;
  return avgReward;
}
