// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Ops Engine v1 ULTRA - Load Balancer
// Smart selection between LLM providers and account tiers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import fetch from "node-fetch";

const BRIDGE_PORT = 4000;
const ACCOUNT_SAFETY_PORT = 5090;

export type LLMProvider = "openai" | "claude" | "gemini" | "grok";
export type AccountTier = "SAFE" | "MEDIUM" | "EXPERIMENT";

const PROVIDER_ROTATION: LLMProvider[] = ["openai", "claude", "gemini", "grok"];
let providerIndex = 0;

const TIER_PRIORITY: AccountTier[] = ["SAFE", "MEDIUM", "EXPERIMENT"];

export function selectProvider(): LLMProvider {
  const provider = PROVIDER_ROTATION[providerIndex];
  providerIndex = (providerIndex + 1) % PROVIDER_ROTATION.length;
  return provider;
}

export async function selectAccount(
  platform: string,
  preferredTier?: AccountTier
): Promise<{ accountId: string; tier: AccountTier }> {
  try {
    const response = await fetch(
      `http://localhost:${ACCOUNT_SAFETY_PORT}/accounts/summary`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(2000),
      }
    );

    if (!response.ok) {
      throw new Error("Account Safety service unavailable");
    }

    const data = (await response.json()) as any;
    const accounts = data.accounts || [];

    // Filter by platform and health
    const healthyAccounts = accounts.filter(
      (acc: any) =>
        acc.platform === platform &&
        acc.status !== "BANNED" &&
        acc.recentBans === 0
    );

    if (healthyAccounts.length === 0) {
      return {
        accountId: `fallback-${platform}`,
        tier: "EXPERIMENT",
      };
    }

    // Select by tier priority
    const tierOrder = preferredTier
      ? [preferredTier, ...TIER_PRIORITY.filter((t) => t !== preferredTier)]
      : TIER_PRIORITY;

    for (const tier of tierOrder) {
      const tieredAccounts = healthyAccounts.filter(
        (acc: any) => acc.riskTier === tier
      );
      if (tieredAccounts.length > 0) {
        const selected =
          tieredAccounts[Math.floor(Math.random() * tieredAccounts.length)];
        return {
          accountId: selected.accountId,
          tier: selected.riskTier,
        };
      }
    }

    // Fallback to first available
    const fallback = healthyAccounts[0];
    return {
      accountId: fallback.accountId,
      tier: fallback.riskTier || "SAFE",
    };
  } catch (error) {
    // Fallback if Account Safety is down
    return {
      accountId: `fallback-${platform}-${Date.now()}`,
      tier: "EXPERIMENT",
    };
  }
}

export function getProviderModel(provider: LLMProvider): string {
  const models: Record<LLMProvider, string> = {
    openai: "gpt-4o",
    claude: "claude-3-5-sonnet-20241022",
    gemini: "gemini-pro",
    grok: "grok-2",
  };
  return models[provider];
}
