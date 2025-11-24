import { Account, DistributionSlot, RiskLevel } from "../types.js";
import { CONFIG } from "../config.js";
import axios from "axios";

export async function assessRisk(
  accountId: string,
  platform: string,
  contentId: string
): Promise<{ riskLevel: RiskLevel; riskScore: number; factors: string[] }> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.ACCOUNTS}/accounts/risk-assess`, {
      accountId,
      platform,
      contentId
    }, { timeout: 5000 });

    return {
      riskLevel: response.data.riskLevel || "MEDIUM",
      riskScore: response.data.riskScore || 0.5,
      factors: response.data.factors || []
    };
  } catch (error) {
    console.error("Risk assessment failed:", error);
    return {
      riskLevel: "MEDIUM",
      riskScore: 0.5,
      factors: ["Assessment unavailable"]
    };
  }
}

export function categorizeRisk(riskScore: number): RiskLevel {
  if (riskScore < CONFIG.RISK_THRESHOLDS.LOW) return "LOW";
  if (riskScore < CONFIG.RISK_THRESHOLDS.MEDIUM) return "MEDIUM";
  if (riskScore < CONFIG.RISK_THRESHOLDS.HIGH) return "HIGH";
  return "CRITICAL";
}

export async function mitigateRisk(
  slot: DistributionSlot,
  riskLevel: RiskLevel
): Promise<{ mitigated: boolean; newSlot?: DistributionSlot; actions: string[] }> {
  const actions: string[] = [];

  if (riskLevel === "LOW") {
    return { mitigated: true, newSlot: slot, actions: ["No mitigation needed"] };
  }

  if (riskLevel === "MEDIUM") {
    actions.push("Adding 2-hour delay");
    const newTime = new Date(slot.datetime);
    newTime.setHours(newTime.getHours() + 2);
    
    return {
      mitigated: true,
      newSlot: { ...slot, datetime: newTime.toISOString() },
      actions
    };
  }

  if (riskLevel === "HIGH") {
    actions.push("Rotating to safer account");
    actions.push("Adding 6-hour delay");
    
    try {
      const response = await axios.post(`${CONFIG.SERVICES.ROTATION}/rotation/safe-account`, {
        platform: slot.platform
      }, { timeout: 5000 });

      const safeAccountId = response.data.accountId;
      const newTime = new Date(slot.datetime);
      newTime.setHours(newTime.getHours() + 6);

      return {
        mitigated: true,
        newSlot: {
          ...slot,
          accountId: safeAccountId,
          datetime: newTime.toISOString()
        },
        actions
      };
    } catch (error) {
      console.error("Failed to rotate to safe account:", error);
      return { mitigated: false, actions: ["Mitigation failed"] };
    }
  }

  actions.push("CRITICAL risk - skipping publication");
  return {
    mitigated: false,
    newSlot: { ...slot, status: "SKIPPED" },
    actions
  };
}

export async function monitorAccountHealth(accountId: string): Promise<{
  healthy: boolean;
  metrics: {
    successRate: number;
    recentFailures: number;
    lastSuccess?: string;
  };
}> {
  try {
    const response = await axios.get(`${CONFIG.SERVICES.ACCOUNTS}/accounts/${accountId}/health`, {
      timeout: 5000
    });

    return {
      healthy: response.data.healthy || false,
      metrics: response.data.metrics || { successRate: 0, recentFailures: 0 }
    };
  } catch (error) {
    console.error(`Failed to monitor account ${accountId}:`, error);
    return {
      healthy: false,
      metrics: { successRate: 0, recentFailures: 0 }
    };
  }
}
