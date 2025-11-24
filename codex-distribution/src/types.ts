export type DistPlatform = "tiktok" | "youtube" | "instagram";

export interface DistributionTarget {
  platforms: DistPlatform[];
  niche: string;
  language?: string;
}

export interface AccountRouting {
  platform: DistPlatform;
  accountId: string;
  riskTier: "SAFE" | "MEDIUM" | "EXPERIMENT";
}

export interface ContentSlot {
  id: string;
  platform: DistPlatform;
  accountId: string;
  scheduledFor: string; // ISO datetime
  contentId: string;
  status: "PLANNED" | "READY" | "POSTED" | "FAILED";
}

export interface DistributionPlan {
  id: string;
  name: string;
  productName?: string;
  target: DistributionTarget;
  routing: AccountRouting[];
  slots: ContentSlot[];
  createdAt: string;
  updatedAt: string;
}

export interface PlanCreateRequest {
  name: string;
  productName?: string;
  target: DistributionTarget;
}

export interface RepurposeRequest {
  sourcePlatform: DistPlatform;
  targetPlatforms: DistPlatform[];
  contentId: string;
  strategyHint?: string;
}

export interface BatchPublishRequest {
  planId: string;
  slotIds?: string[]; // if omitted, publish all READY slots
}

export interface DistributionStatus {
  planId: string;
  summary: string;
  slots: ContentSlot[];
}
