export type RotationPlatform = "tiktok" | "youtube" | "instagram";

export interface RotationContext {
  platform: RotationPlatform;
  intent: "POST" | "ENGAGE" | "TEST" | "ADS";
  niche?: string;
  riskTolerance: "LOW" | "MEDIUM" | "HIGH";
}

export interface RotationDecision {
  ok: boolean;
  platform: RotationPlatform;
  accountId: string | null;
  riskTier: "SAFE" | "MEDIUM" | "EXPERIMENT" | null;
  reason: string;
}

export interface AccountRiskSnapshot {
  accountId: string;
  riskTier: "SAFE" | "MEDIUM" | "EXPERIMENT";
  riskScore: number;           // 0-100
  status: "HEALTHY" | "WATCH" | "LIMITED" | "PAUSED";
}

export interface VisibilitySnapshot {
  platform: RotationPlatform;
  accountId: string;
  reachScore: number;          // 0-100
  visibilityLevel: "HIGH" | "MEDIUM" | "LOW" | "CRITICAL";
}

export interface RotationRequest {
  context: RotationContext;
}
