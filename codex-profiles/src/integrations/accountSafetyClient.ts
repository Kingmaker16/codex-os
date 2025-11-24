import { ProfileRecord } from "../types.js";

const SAFETY_URL = "http://localhost:5090";

export async function registerAccountSafety(profile: ProfileRecord): Promise<void> {
  try {
    const response = await fetch(SAFETY_URL + "/accounts/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountId: profile.id,
        platform: profile.platform,
        type: "CREATE",
        timestamp: new Date().toISOString(),
        meta: {
          username: profile.username,
          riskTier: profile.riskTier
        }
      })
    });

    if (!response.ok) {
      console.warn(`[AccountSafetyClient] Failed to register: ${response.status}`);
    }
  } catch (error) {
    console.warn("[AccountSafetyClient] Safety engine unavailable, skipping registration");
  }
}
