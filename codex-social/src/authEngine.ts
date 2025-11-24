/**
 * Social Engine v1 - Auth Engine
 * 
 * Handles authentication flows using Hands v4 for automation
 */

import type { SocialAccount } from "./types.js";
import { CONFIG, Platform } from "./config.js";
import { updateLoginState } from "./accountManager.js";
import { logLogin } from "./brainLogger.js";

export async function loginToAccount(
  account: SocialAccount,
  useCaptchaSolver: boolean = true
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[AuthEngine] Starting login for ${account.id} (${account.platform})`);

    const platformConfig = CONFIG.platforms[account.platform];
    if (!platformConfig) {
      throw new Error(`Platform not supported: ${account.platform}`);
    }

    // Step 1: Open login page with Hands
    const openResult = await fetch(`${CONFIG.handsUrl}/ui/openUrl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: platformConfig.loginUrl,
        appName: getAppForPlatform(account.platform)
      })
    });

    if (!openResult.ok) {
      throw new Error("Failed to open login page");
    }

    // Step 2: Wait for page load
    await sleep(3000);

    // Step 3: Detect login form with Vision
    const visionResult = await fetch(`${CONFIG.visionUrl}/vision/analyzeScreen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context: `Login page for ${account.platform}`,
        detectUI: true
      })
    });

    if (!visionResult.ok) {
      console.warn("[AuthEngine] Vision detection failed, proceeding with manual flow");
    }

    // Step 4: Execute platform-specific login
    const loginSuccess = await executePlatformLogin(account, useCaptchaSolver);

    if (loginSuccess) {
      updateLoginState(account.id, "logged_in");
      await logLogin(account.id, account.platform, true);
      console.log(`[AuthEngine] Login succeeded for ${account.id}`);
      return { success: true };
    } else {
      updateLoginState(account.id, "error");
      await logLogin(account.id, account.platform, false);
      return { success: false, error: "Login flow failed" };
    }

  } catch (error: any) {
    console.error(`[AuthEngine] Login error for ${account.id}:`, error.message);
    updateLoginState(account.id, "error");
    await logLogin(account.id, account.platform, false);
    return { success: false, error: error.message };
  }
}

async function executePlatformLogin(
  account: SocialAccount,
  useCaptchaSolver: boolean
): Promise<boolean> {
  // Import platform-specific handler
  const { loginFlow } = await import(`./platforms/${account.platform}.js`);
  return loginFlow(account, useCaptchaSolver);
}

function getAppForPlatform(platform: Platform): string {
  // Map platform to preferred browser/app
  return "Google Chrome"; // Default to Chrome for all platforms
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function checkLoginStatus(account: SocialAccount): Promise<boolean> {
  try {
    // Use Vision to detect if still logged in
    const dashboardUrl = CONFIG.platforms[account.platform].dashboardUrl
      .replace("{username}", account.username || "")
      .replace("{channelId}", account.metadata?.channelId || "");

    const openResult = await fetch(`${CONFIG.handsUrl}/ui/openUrl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: dashboardUrl })
    });

    if (!openResult.ok) return false;

    await sleep(2000);

    // Check for login indicators
    const visionResult = await fetch(`${CONFIG.visionUrl}/vision/analyzeScreen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context: "Check if logged in",
        detectUI: true
      })
    });

    const visionData = await visionResult.json() as any;
    const isLoggedIn = !visionData.analysis?.includes("login") && 
                       !visionData.analysis?.includes("sign in");

    return isLoggedIn;

  } catch (error: any) {
    console.error(`[AuthEngine] Status check failed:`, error.message);
    return false;
  }
}
