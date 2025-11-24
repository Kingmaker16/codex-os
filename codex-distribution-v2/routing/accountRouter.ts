import { Platform, Account, RiskLevel } from "../types.js";
import { CONFIG } from "../config.js";
import axios from "axios";

export async function selectAccount(
  platform: Platform,
  riskLevel: RiskLevel
): Promise<Account | null> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.ROTATION}/rotation/select`, {
      platform,
      riskLevel
    }, { timeout: 5000 });

    return response.data.account || null;
  } catch (error) {
    console.error(`Failed to select account for ${platform}:`, error);
    return null;
  }
}

export async function getAccountRiskScore(accountId: string): Promise<number> {
  try {
    const response = await axios.get(`${CONFIG.SERVICES.ACCOUNTS}/accounts/${accountId}/risk`, {
      timeout: 5000
    });

    return response.data.riskScore || 0.5;
  } catch (error) {
    console.error(`Failed to get risk score for account ${accountId}:`, error);
    return 0.5;
  }
}

export async function getActiveAccounts(platform: Platform): Promise<Account[]> {
  try {
    const response = await axios.get(`${CONFIG.SERVICES.ACCOUNTS}/accounts`, {
      params: { platform, status: "ACTIVE" },
      timeout: 5000
    });

    return response.data.accounts || [];
  } catch (error) {
    console.error(`Failed to get active accounts for ${platform}:`, error);
    return [];
  }
}

export async function rotateAccount(currentAccountId: string, platform: Platform): Promise<Account | null> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.ROTATION}/rotation/rotate`, {
      currentAccountId,
      platform
    }, { timeout: 5000 });

    return response.data.newAccount || null;
  } catch (error) {
    console.error(`Failed to rotate account ${currentAccountId}:`, error);
    return null;
  }
}

export function shouldRotateAccount(account: Account): boolean {
  if (account.riskScore > CONFIG.RISK_THRESHOLDS.HIGH) return true;
  if (account.status !== "ACTIVE") return true;
  
  if (account.lastUsed) {
    const hoursSinceLastUse = (Date.now() - account.lastUsed) / (1000 * 60 * 60);
    if (hoursSinceLastUse < 2) return true;
  }
  
  return false;
}

export async function validateAccountForPublish(
  accountId: string,
  platform: Platform
): Promise<{ valid: boolean; reason?: string }> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.ACCOUNTS}/accounts/validate`, {
      accountId,
      platform
    }, { timeout: 5000 });

    return {
      valid: response.data.valid || false,
      reason: response.data.reason
    };
  } catch (error) {
    console.error(`Failed to validate account ${accountId}:`, error);
    return { valid: false, reason: "Validation service unavailable" };
  }
}
