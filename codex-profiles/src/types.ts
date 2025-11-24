export type SocialPlatform = "tiktok" | "instagram" | "youtube";

export type RiskTier = "SAFE" | "MEDIUM" | "EXPERIMENT";

export interface ProfileCreateRequest {
  sessionId: string;
  platform: SocialPlatform;
  niche: string;
  riskTier: RiskTier;
  language?: "en" | "es" | "ar";
}

export interface ProfileRecord {
  id: string;
  platform: SocialPlatform;
  username: string;
  password: string;
  email?: string;
  riskTier: RiskTier;
  createdAt: string;
  status: "SIMULATED_CREATED" | "PENDING_VERIFICATION" | "ACTIVE" | "BLOCKED";
}

export interface ProfileStatus {
  id: string;
  platform: SocialPlatform;
  username: string;
  riskTier: RiskTier;
  status: string;
  notes?: string;
}
