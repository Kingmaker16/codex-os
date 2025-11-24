import { ProfileRecord } from "../types.js";

const VAULT_URL = "http://localhost:5175";

export async function storeProfileCredentials(profile: ProfileRecord): Promise<void> {
  try {
    const body = {
      type: `${profile.platform}_login` as any,
      scope: "SOCIAL",
      name: `${profile.platform} Account - ${profile.username}`,
      username: profile.username,
      email: profile.email,
      data: {
        password: profile.password,
        accountId: profile.id
      },
      metadata: {
        platform: profile.platform,
        riskTier: profile.riskTier,
        createdAt: profile.createdAt,
        createdBy: "codex-profiles"
      },
      tags: [profile.platform, profile.riskTier, "simulated"]
    };

    const response = await fetch(VAULT_URL + "/vault/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      console.warn(`[VaultClient] Failed to store credentials: ${response.status}`);
    }
  } catch (error) {
    console.warn("[VaultClient] Vault unavailable, skipping credential storage");
  }
}
