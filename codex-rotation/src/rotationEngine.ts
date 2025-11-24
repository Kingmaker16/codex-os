import { RotationContext, RotationDecision, AccountRiskSnapshot, VisibilitySnapshot } from "./types.js";
import { getRiskSnapshots, getVisibilitySnapshots, setVisibilitySnapshots } from "./state.js";
import { fetchVisibilitySnapshot } from "./fetchers.js";

export async function decideRotation(ctx: RotationContext): Promise<RotationDecision> {
  const risks = getRiskSnapshots();
  const vis = getVisibilitySnapshots();

  const candidates = risks.filter(r => {
    if (ctx.riskTolerance === "LOW" && r.riskTier !== "SAFE") return false;
    if (ctx.riskTolerance === "MEDIUM" && r.riskTier === "EXPERIMENT") return false;
    return r.status !== "PAUSED"; // don't use PAUSED
  });

  if (candidates.length === 0) {
    return {
      ok: false,
      platform: ctx.platform,
      accountId: null,
      riskTier: null,
      reason: "No eligible accounts available for rotation."
    };
  }

  const healthy = candidates.filter(c => c.status === "HEALTHY");
  const pool = healthy.length > 0 ? healthy : candidates;

  const visSnapshots: VisibilitySnapshot[] = [...vis];

  for (const c of pool) {
    const existing = visSnapshots.find(v => v.accountId === c.accountId && v.platform === ctx.platform);
    if (!existing) {
      const snap = await fetchVisibilitySnapshot(ctx.platform, c.accountId);
      if (snap) visSnapshots.push(snap);
    }
  }

  setVisibilitySnapshots(visSnapshots);

  let best: { score: number; accountId: string; riskTier: AccountRiskSnapshot["riskTier"] } | null = null;

  for (const c of pool) {
    const snap = visSnapshots.find(v => v.accountId === c.accountId && v.platform === ctx.platform);
    const reachScore = snap?.reachScore ?? 50;
    const riskPenalty = c.riskScore / 2; // higher risk → lower preference
    const score = reachScore - riskPenalty;

    if (!best || score > best.score) {
      best = { score, accountId: c.accountId, riskTier: c.riskTier };
    }
  }

  if (!best) {
    const pick = pool[0];
    return {
      ok: true,
      platform: ctx.platform,
      accountId: pick.accountId,
      riskTier: pick.riskTier,
      reason: "Fallback rotation selection."
    };
  }

  return {
    ok: true,
    platform: ctx.platform,
    accountId: best.accountId,
    riskTier: best.riskTier,
    reason: "Selected account based on risk and reach balance."
  };
}
