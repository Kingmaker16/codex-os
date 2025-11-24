export type RiskTier = "SAFE" | "MEDIUM" | "EXPERIMENT";

export type Platform =
  | "tiktok"
  | "youtube"
  | "instagram";

export interface AccountProfile {
  id: string;
  platform: Platform;
  handle: string;
  riskTier: RiskTier;
  notes?: string;
  createdAt: string;
  lastReviewedAt?: string;
}

export interface AccountEvent {
  accountId: string;
  platform: Platform;
  type: "POST" | "LIKE" | "COMMENT" | "FOLLOW" | "BLOCK" | "WARNING" | "STRIKE" | "BAN" | "VIEW_DROP";
  timestamp: string;
  meta?: any;
}

export interface AccountRiskState {
  accountId: string;
  riskTier: RiskTier;
  riskScore: number;  // 0 - 100
  recentWarnings: number;
  recentStrikes: number;
  recentBans: number;
  status: "HEALTHY" | "WATCH" | "LIMITED" | "PAUSED";
}

export interface PostEvaluationRequest {
  accountId: string;
  platform: Platform;
  contentSummary: string;  // short description of what will be posted
  tags?: string[];
}

export interface PostEvaluationDecision {
  ok: boolean;
  accountId: string;
  platform: Platform;
  riskTier: RiskTier;
  riskScore: number;
  recommendedAction: "ALLOW" | "THROTTLE" | "USE_BACKUP_ACCOUNT" | "DENY";
  notes: string;
}

export interface AccountsSummary {
  safe: AccountRiskState[];
  medium: AccountRiskState[];
  experiment: AccountRiskState[];
}
