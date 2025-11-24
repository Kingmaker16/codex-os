import fetch from "node-fetch";
import { AccountRiskSnapshot, VisibilitySnapshot, RotationPlatform } from "./types.js";

const ACCOUNTS_URL = "http://localhost:5090/accounts/summary";
const VISIBILITY_URL = "http://localhost:5080/visibility/check";

export async function fetchRiskSnapshots(): Promise<AccountRiskSnapshot[]> {
  const resp = await fetch(ACCOUNTS_URL);
  if (!resp.ok) return [];
  const json = await resp.json();
  const out: AccountRiskSnapshot[] = [];

  const tiers: ("safe" | "medium" | "experiment")[] = ["safe","medium","experiment"];
  for (const t of tiers) {
    for (const s of (json as any).summary?.[t] || []) {
      out.push({
        accountId: s.accountId,
        riskTier: t.toUpperCase() as "SAFE" | "MEDIUM" | "EXPERIMENT",
        riskScore: s.riskScore,
        status: s.status
      });
    }
  }

  return out;
}

export async function fetchVisibilitySnapshot(platform: RotationPlatform, accountId: string): Promise<VisibilitySnapshot | null> {
  try {
    const resp = await fetch(VISIBILITY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, accountId })
    });
    if (!resp.ok) return null;
    const json = await resp.json();
    return {
      platform,
      accountId,
      reachScore: (json as any).fused?.fusedScore ?? (json as any).visibility?.reachScore ?? 50,
      visibilityLevel: (json as any).fused?.fusedStatus ?? "MEDIUM"
    };
  } catch {
    return null;
  }
}
