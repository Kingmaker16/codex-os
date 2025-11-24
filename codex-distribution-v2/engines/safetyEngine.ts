import { SafetyMode, DistributionSlot, PublishRequest } from "../types.js";
import { CONFIG } from "../config.js";

export function enforceSafetyMode(mode: SafetyMode): {
  requiresApproval: boolean;
  maxRiskScore: number;
  allowedActions: string[];
} {
  switch (mode) {
    case "MANUAL":
      return {
        requiresApproval: true,
        maxRiskScore: 1.0,
        allowedActions: ["REVIEW_ONLY"]
      };

    case "SEMI_AUTONOMOUS":
      return {
        requiresApproval: true,
        maxRiskScore: 0.6,
        allowedActions: ["SCHEDULE", "QUEUE", "SIMULATE"]
      };

    case "FULL_AUTONOMOUS":
      return {
        requiresApproval: false,
        maxRiskScore: 0.3,
        allowedActions: ["SCHEDULE", "QUEUE", "PUBLISH", "SIMULATE"]
      };

    default:
      return {
        requiresApproval: true,
        maxRiskScore: 0.6,
        allowedActions: ["SCHEDULE", "QUEUE", "SIMULATE"]
      };
  }
}

export function validatePublishRequest(
  request: PublishRequest,
  safetyMode: SafetyMode
): { valid: boolean; reason?: string } {
  const safety = enforceSafetyMode(safetyMode);

  if (safetyMode === "SEMI_AUTONOMOUS" && !request.simulate) {
    return {
      valid: false,
      reason: "SEMI_AUTONOMOUS mode requires simulation or manual approval"
    };
  }

  if (safetyMode === "MANUAL") {
    return {
      valid: false,
      reason: "MANUAL mode does not allow automated publishing"
    };
  }

  return { valid: true };
}

export function shouldSkipSlot(
  slot: DistributionSlot,
  safetyMode: SafetyMode
): { skip: boolean; reason?: string } {
  const safety = enforceSafetyMode(safetyMode);

  if (slot.riskScore && slot.riskScore > safety.maxRiskScore) {
    return {
      skip: true,
      reason: `Risk score ${slot.riskScore} exceeds safety threshold ${safety.maxRiskScore}`
    };
  }

  if (!slot.contentId) {
    return {
      skip: true,
      reason: "No content assigned to slot"
    };
  }

  if (!slot.accountId) {
    return {
      skip: true,
      reason: "No account assigned to slot"
    };
  }

  return { skip: false };
}

export function logSafetyEvent(
  event: string,
  details: Record<string, any>
): void {
  const timestamp = new Date().toISOString();
  console.log(`[SAFETY] ${timestamp} - ${event}:`, JSON.stringify(details, null, 2));
}

export function createSafetyReport(
  slots: DistributionSlot[],
  safetyMode: SafetyMode
): {
  mode: SafetyMode;
  totalSlots: number;
  safeSlots: number;
  riskySlots: number;
  skippedSlots: number;
  avgRiskScore: number;
} {
  const safety = enforceSafetyMode(safetyMode);
  
  let safeCount = 0;
  let riskyCount = 0;
  let skippedCount = 0;
  let totalRisk = 0;

  for (const slot of slots) {
    const riskScore = slot.riskScore || 0;
    totalRisk += riskScore;

    if (slot.status === "SKIPPED") {
      skippedCount++;
    } else if (riskScore <= safety.maxRiskScore) {
      safeCount++;
    } else {
      riskyCount++;
    }
  }

  return {
    mode: safetyMode,
    totalSlots: slots.length,
    safeSlots: safeCount,
    riskySlots: riskyCount,
    skippedSlots: skippedCount,
    avgRiskScore: slots.length > 0 ? totalRisk / slots.length : 0
  };
}
