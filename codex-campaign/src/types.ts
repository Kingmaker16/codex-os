export type CampaignType = "SOCIAL_ORGANIC" | "SOCIAL_UGC" | "ECOM_LAUNCH";

export interface CampaignTarget {
  platforms: ("tiktok" | "youtube" | "instagram")[];
  niche: string;
  country?: string;
  language?: string;
}

export interface CampaignGoal {
  objective: "VIEWS" | "FOLLOWERS" | "CLICKS" | "ADD_TO_CART" | "PURCHASES";
  dailyBudget: number;
  durationDays: number;
  targetKPI?: string;
}

export interface CampaignCreative {
  id: string;
  title: string;
  script: string;
  templateId?: string;
  videoPath?: string;
  status: "PLANNED" | "GENERATED" | "UPLOADED";
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  productName?: string;
  storeId?: string;
  target: CampaignTarget;
  goal: CampaignGoal;
  creatives: CampaignCreative[];
  status: "DRAFT" | "PLANNED" | "RUNNING" | "PAUSED" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
}

export interface CampaignCreateRequest {
  name: string;
  type: CampaignType;
  productName?: string;
  storeId?: string;
  target: CampaignTarget;
  goal: CampaignGoal;
}

export interface CampaignPlanRequest {
  campaignId: string;
}

export interface CampaignStatus {
  campaignId: string;
  status: string;
  message: string;
}
