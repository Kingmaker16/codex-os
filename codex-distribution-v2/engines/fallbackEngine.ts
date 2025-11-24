import { Platform, DistributionSlot, PublishResult } from "../types.js";
import { CONFIG } from "../config.js";

export async function handlePublishFailure(
  slot: DistributionSlot,
  error: string
): Promise<{ fallbackSlot?: DistributionSlot; fallbackPlatform?: Platform; action: string }> {
  console.error(`Publish failed for slot ${slot.id} on ${slot.platform}:`, error);

  if (error.includes("rate limit") || error.includes("429")) {
    return {
      fallbackSlot: delaySlot(slot, 2),
      action: "DELAYED_2_HOURS"
    };
  }

  if (error.includes("account suspended") || error.includes("banned")) {
    const altPlatform = selectAlternativePlatform(slot.platform);
    return {
      fallbackPlatform: altPlatform,
      fallbackSlot: { ...slot, platform: altPlatform, status: "PLANNED" },
      action: "SWITCHED_PLATFORM"
    };
  }

  if (error.includes("network") || error.includes("timeout")) {
    return {
      fallbackSlot: delaySlot(slot, 0.5),
      action: "RETRY_AFTER_30_MIN"
    };
  }

  return {
    fallbackSlot: { ...slot, status: "FAILED" },
    action: "MARKED_FAILED"
  };
}

function delaySlot(slot: DistributionSlot, hours: number): DistributionSlot {
  const newTime = new Date(slot.datetime);
  newTime.setHours(newTime.getHours() + hours);
  
  return {
    ...slot,
    datetime: newTime.toISOString(),
    status: "PLANNED"
  };
}

function selectAlternativePlatform(failedPlatform: Platform): Platform {
  const alternatives: Record<Platform, Platform[]> = {
    tiktok: ["instagram", "youtube"],
    youtube: ["tiktok", "instagram"],
    instagram: ["tiktok", "twitter"],
    twitter: ["linkedin", "instagram"],
    linkedin: ["twitter", "youtube"]
  };

  const options = alternatives[failedPlatform] || ["instagram"];
  return options[0];
}

export async function retryWithBackoff(
  slot: DistributionSlot,
  attemptNumber: number
): Promise<DistributionSlot> {
  const backoffHours = Math.pow(2, attemptNumber);
  
  const newTime = new Date(slot.datetime);
  newTime.setHours(newTime.getHours() + backoffHours);

  return {
    ...slot,
    datetime: newTime.toISOString(),
    status: "PLANNED"
  };
}

export function shouldFallback(result: PublishResult): boolean {
  if (!result.success) return true;
  if (result.error?.includes("temporary")) return true;
  return false;
}

export async function redistributeFailedSlots(
  failedSlots: DistributionSlot[]
): Promise<DistributionSlot[]> {
  const redistributed: DistributionSlot[] = [];

  for (const slot of failedSlots) {
    const altPlatform = selectAlternativePlatform(slot.platform);
    
    redistributed.push({
      ...slot,
      platform: altPlatform,
      status: "PLANNED",
      error: undefined
    });
  }

  return redistributed;
}

export function logFallbackAction(
  slotId: string,
  originalPlatform: Platform,
  action: string,
  details: any
): void {
  console.log(`[FALLBACK] Slot ${slotId} - ${originalPlatform} - ${action}`, details);
}
