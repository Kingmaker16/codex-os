import { v4 as uuidv4 } from "uuid";
import { SocialPlatform, RiskTier, ProfileRecord } from "./types.js";

const adjectives = ["swift", "bright", "stealth", "prime", "apex", "sonic", "vivid"];
const nouns = ["fitness", "studio", "lab", "media", "alpha", "core", "flow"];

export function generateUsername(platform: SocialPlatform, niche: string): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const suffix = Math.floor(Math.random() * 9999);
  return `${adj}${noun}${suffix}`;
}

export function generatePassword(): string {
  return `Cdx!${Math.random().toString(36).slice(2, 10)}!${Math.floor(Math.random() * 9999)}`;
}

export function buildProfile(platform: SocialPlatform, niche: string, riskTier: RiskTier): ProfileRecord {
  const username = generateUsername(platform, niche);
  const password = generatePassword();
  return {
    id: uuidv4(),
    platform,
    username,
    password,
    riskTier,
    createdAt: new Date().toISOString(),
    status: "SIMULATED_CREATED"
  };
}
