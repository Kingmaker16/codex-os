import { ProfileRecord } from "../types.js";

const BRAIN_URL = "http://localhost:4100";

export async function logProfileToBrain(profile: ProfileRecord): Promise<void> {
  try {
    const response = await fetch(BRAIN_URL + "/v2/memory/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: "social",
        sessionId: "profiles-" + profile.id,
        title: `Profile created for ${profile.platform}`,
        content: `Username: ${profile.username}, riskTier: ${profile.riskTier}, createdAt: ${profile.createdAt}`,
        tags: ["profile", "social", profile.platform, profile.riskTier]
      })
    });

    if (!response.ok) {
      console.warn(`[BrainClient] Failed to log profile: ${response.status}`);
    }
  } catch (error) {
    console.warn("[BrainClient] Brain v2 unavailable, skipping memory log");
  }
}
