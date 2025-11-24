export type Platform = "tiktok" | "instagram" | "youtube";
export type RiskTier = "SAFE" | "MEDIUM" | "EXPERIMENT";

export interface Persona {
  name: string;
  voice: string;
  niche: string;
  targetAudience: string;
  styleTraits: string[];
}

export interface IdentityRecord {
  id: string;
  profileId: string;
  platform: Platform;
  niche: string;
  persona: Persona;
  riskTier: RiskTier;
  createdAt: string;
  status: "ACTIVE" | "PAUSED" | "BLOCKED";
  projectBinding?: string;
}
