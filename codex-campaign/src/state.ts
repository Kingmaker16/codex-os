import { Campaign, CampaignCreateRequest, CampaignCreative } from "./types.js";
import { v4 as uuid } from "uuid";

const campaigns: Map<string, Campaign> = new Map();

export function createCampaign(payload: CampaignCreateRequest): Campaign {
  const id = uuid();
  const now = new Date().toISOString();

  const campaign: Campaign = {
    id,
    name: payload.name,
    type: payload.type,
    productName: payload.productName,
    storeId: payload.storeId,
    target: payload.target,
    goal: payload.goal,
    creatives: [],
    status: "DRAFT",
    createdAt: now,
    updatedAt: now
  };

  campaigns.set(id, campaign);
  return campaign;
}

export function getCampaign(id: string): Campaign | undefined {
  return campaigns.get(id);
}

export function listCampaigns(): Campaign[] {
  return Array.from(campaigns.values());
}

export function updateCampaign(c: Campaign): void {
  c.updatedAt = new Date().toISOString();
  campaigns.set(c.id, c);
}

export function addCreative(campaignId: string, creative: CampaignCreative): Campaign | undefined {
  const campaign = campaigns.get(campaignId);
  if (!campaign) return undefined;
  campaign.creatives.push(creative);
  updateCampaign(campaign);
  return campaign;
}
