export type EngagementPlatform = "tiktok" | "youtube" | "instagram";

export interface EngagementContext {
  sessionId: string;
  platform: EngagementPlatform;
  accountId: string;
  riskTier: "SAFE" | "MEDIUM" | "EXPERIMENT";
  niche: string;
  contentType: "short-form" | "ugc-ad" | "long-form" | "carousel";
}

export interface CommentSample {
  id: string;
  text: string;
  sentiment: "positive" | "neutral" | "negative";
  likes: number;
  replies: number;
}

export interface EngagementPlan {
  id: string;
  strategy: string;
  moves: EngagementMove[];
}

export interface EngagementMove {
  id: string;
  type: "REPLY" | "ASK_QUESTION" | "PIN_COMMENT" | "CTA" | "THANK_YOU";
  template: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  riskTierAllowed: ("SAFE" | "MEDIUM" | "EXPERIMENT")[];
}

export interface EngagementRequest {
  context: EngagementContext;
  comments: CommentSample[];
}

export interface EngagementResponse {
  ok: boolean;
  plan: EngagementPlan;
}
