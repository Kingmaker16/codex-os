import { Platform, DistributionSlot, VelocityProfile } from "../types.js";
import { CONFIG } from "../config.js";

export function getVelocityProfile(platform: Platform): VelocityProfile {
  const platformConfig = CONFIG.PLATFORMS[platform];
  
  const engagementMultiplier: Record<number, number> = {};
  platformConfig.peakHours.forEach(hour => {
    engagementMultiplier[hour] = 1.5;
  });

  return {
    platform,
    optimalPostsPerDay: platformConfig.maxPostsPerDay,
    minGapHours: platformConfig.minGapHours,
    peakHours: platformConfig.peakHours,
    engagementMultiplier
  };
}

export function calculateOptimalVelocity(
  platform: Platform,
  targetReach: number,
  currentEngagement: number
): number {
  const profile = getVelocityProfile(platform);
  const baseVelocity = profile.optimalPostsPerDay / 24;
  
  const reachFactor = Math.min(targetReach / 100000, 2);
  const engagementFactor = Math.max(currentEngagement / 10, 0.5);
  
  return baseVelocity * reachFactor * engagementFactor;
}

export function adjustSlotTimingForVelocity(
  slots: DistributionSlot[],
  velocity: number
): DistributionSlot[] {
  const adjustedSlots = [...slots];
  const gapHours = 24 / velocity;

  for (let i = 1; i < adjustedSlots.length; i++) {
    const prevTime = new Date(adjustedSlots[i - 1].datetime);
    const newTime = new Date(prevTime.getTime() + gapHours * 60 * 60 * 1000);
    
    adjustedSlots[i] = {
      ...adjustedSlots[i],
      datetime: newTime.toISOString()
    };
  }

  return adjustedSlots;
}

export function filterSlotsByVelocityConstraints(
  slots: DistributionSlot[],
  platform: Platform
): DistributionSlot[] {
  const profile = getVelocityProfile(platform);
  const minGapMs = profile.minGapHours * 60 * 60 * 1000;
  
  const filtered: DistributionSlot[] = [];
  let lastSlotTime: number | null = null;

  for (const slot of slots) {
    if (slot.platform !== platform) {
      filtered.push(slot);
      continue;
    }

    const slotTime = new Date(slot.datetime).getTime();
    
    if (lastSlotTime === null || slotTime - lastSlotTime >= minGapMs) {
      filtered.push(slot);
      lastSlotTime = slotTime;
    }
  }

  return filtered;
}

export function boostPeakHourSlots(slots: DistributionSlot[]): DistributionSlot[] {
  return slots.map(slot => {
    const slotHour = new Date(slot.datetime).getHours();
    const profile = getVelocityProfile(slot.platform);
    
    if (profile.peakHours.includes(slotHour)) {
      return {
        ...slot,
        visibilityScore: (slot.visibilityScore || 0) * (profile.engagementMultiplier[slotHour] || 1)
      };
    }
    
    return slot;
  });
}
