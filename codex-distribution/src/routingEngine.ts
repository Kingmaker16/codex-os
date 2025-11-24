import fetch from "node-fetch";
import { AccountRouting, DistPlatform } from "./types.js";

// Calls Account Safety Engine v1-ULTRA to pick accounts per platform.
const ACCOUNTS_URL = "http://localhost:5090/accounts/summary";

export async function computeRouting(platforms: DistPlatform[]): Promise<AccountRouting[]> {
  const resp = await fetch(ACCOUNTS_URL);
  if (!resp.ok) {
    // Fallback: one fake SAFE route per platform
    return platforms.map(p => ({
      platform: p,
      accountId: `fallback-${p}`,
      riskTier: "SAFE"
    }));
  }
  const data = await resp.json();
  const summary = (data as any).summary;

  const routing: AccountRouting[] = [];

  for (const p of platforms) {
    const safeAccounts = (summary.safe || []).filter((s: any) => s.accountId && s.recentBans === 0);
    const mediumAccounts = (summary.medium || []).filter((s: any) => s.accountId && s.recentBans === 0);
    const experimentAccounts = (summary.experiment || []).filter((s: any) => s.accountId && s.recentBans === 0);

    if (safeAccounts.length > 0) {
      routing.push({
        platform: p,
        accountId: safeAccounts[0].accountId,
        riskTier: "SAFE"
      });
    } else if (mediumAccounts.length > 0) {
      routing.push({
        platform: p,
        accountId: mediumAccounts[0].accountId,
        riskTier: "MEDIUM"
      });
    } else if (experimentAccounts.length > 0) {
      routing.push({
        platform: p,
        accountId: experimentAccounts[0].accountId,
        riskTier: "EXPERIMENT"
      });
    } else {
      routing.push({
        platform: p,
        accountId: `ad-hoc-${p}`,
        riskTier: "EXPERIMENT"
      });
    }
  }

  return routing;
}
