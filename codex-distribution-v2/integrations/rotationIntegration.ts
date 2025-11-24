import { Platform, Account } from "../types.js";
import { CONFIG } from "../config.js";
import axios from "axios";

export async function getNextAccount(
  platform: Platform
): Promise<Account | null> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.ROTATION}/rotation/next`, {
      platform
    }, { timeout: 5000 });

    return response.data.account || null;
  } catch (error) {
    console.error("Failed to get next account:", error);
    return null;
  }
}

export async function rotateToSafeAccount(
  currentAccountId: string,
  platform: Platform
): Promise<Account | null> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.ROTATION}/rotation/safe`, {
      currentAccountId,
      platform
    }, { timeout: 5000 });

    return response.data.safeAccount || null;
  } catch (error) {
    console.error("Failed to rotate to safe account:", error);
    return null;
  }
}

export async function reportAccountUsage(
  accountId: string,
  success: boolean
): Promise<void> {
  try {
    await axios.post(`${CONFIG.SERVICES.ROTATION}/rotation/report`, {
      accountId,
      success,
      timestamp: new Date().toISOString()
    }, { timeout: 3000 });
  } catch (error) {
    console.error("Failed to report account usage:", error);
  }
}
