import { AccountProfile, AccountEvent, AccountRiskState, RiskTier, Platform } from "./types.js";
import { v4 as uuid } from "uuid";

const profiles: Map<string, AccountProfile> = new Map();
const events: AccountEvent[] = [];
const riskStates: Map<string, AccountRiskState> = new Map();

export function registerAccount(platform: Platform, handle: string, riskTier: RiskTier): AccountProfile {
  const id = uuid();
  const profile: AccountProfile = {
    id,
    platform,
    handle,
    riskTier,
    createdAt: new Date().toISOString()
  };
  profiles.set(id, profile);
  riskStates.set(id, {
    accountId: id,
    riskTier,
    riskScore: riskTier === "SAFE" ? 5 : riskTier === "MEDIUM" ? 20 : 40,
    recentWarnings: 0,
    recentStrikes: 0,
    recentBans: 0,
    status: "HEALTHY"
  });
  return profile;
}

export function listAccounts(): AccountProfile[] {
  return Array.from(profiles.values());
}

export function logEvent(evt: AccountEvent): void {
  events.push(evt);
  const state = riskStates.get(evt.accountId);
  if (!state) return;

  if (evt.type === "WARNING") state.recentWarnings += 1;
  if (evt.type === "STRIKE") state.recentStrikes += 1;
  if (evt.type === "BAN") state.recentBans += 1;
  if (evt.type === "VIEW_DROP") {
    // Soft bump risk score for sudden drops
    state.riskScore = Math.min(100, state.riskScore + 5);
  }

  // Simple risk scoring heuristics
  state.riskScore = Math.min(100, state.riskScore +
    state.recentWarnings * 2 +
    state.recentStrikes * 5 +
    state.recentBans * 10
  );

  // Status updates based on score
  if (state.riskScore < 30) {
    state.status = "HEALTHY";
  } else if (state.riskScore < 50) {
    state.status = "WATCH";
  } else if (state.riskScore < 70) {
    state.status = "LIMITED";
  } else {
    state.status = "PAUSED";
  }

  riskStates.set(evt.accountId, state);
}

export function getRiskStates(): AccountRiskState[] {
  return Array.from(riskStates.values());
}

export function getRiskState(accountId: string): AccountRiskState | undefined {
  return riskStates.get(accountId);
}
