import fetch from "node-fetch";
import { Campaign, CampaignPlanRequest, CampaignCreative } from "./types.js";
import { getCampaign, updateCampaign, addCreative } from "./state.js";
import { v4 as uuid } from "uuid";

const CREATIVE_URL = "http://localhost:5200/creative/generate"; // codex-creative
const VIDEO_URL = "http://localhost:4700/video/ugc";            // codex-video
const SOCIAL_URL = "http://localhost:4800/social/plan";         // codex-social (v1.5)
const STRATEGY_URL = "http://localhost:5050/strategy/plan";     // codex-strategy
const TRENDS_URL = "http://localhost:5060/trends/summary";      // codex-trends

export async function planCampaign(req: CampaignPlanRequest): Promise<{ ok: boolean; campaign?: Campaign; error?: string }> {
  const campaign = getCampaign(req.campaignId);
  if (!campaign) {
    return { ok: false, error: "Campaign not found" };
  }

  // 1) Get high-level strategy from SIL
  const strategyResp = await fetch(STRATEGY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "campaign-" + campaign.id,
      domain: ["social","ecomm"],
      goal: `Launch campaign "${campaign.name}" for product "${campaign.productName ?? "N/A"}".`,
      horizonDays: campaign.goal.durationDays
    })
  });
  const strategyJson = strategyResp.ok ? await strategyResp.json() : { plan: { plays: [] } };

  // 2) Get trend summary
  const trendResp = await fetch(TRENDS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "campaign-" + campaign.id,
      platform: "all",
      niche: campaign.target.niche,
      language: campaign.target.language ?? "en"
    })
  });
  const trendJson = trendResp.ok ? await trendResp.json() : { summary: "No trend info.", items: [] };

  // 3) Generate creative concepts from Creative Engine
  const creativeResp = await fetch(CREATIVE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      domain: "social",
      niche: campaign.target.niche,
      product: campaign.productName,
      goal: `Support campaign "${campaign.name}" for ${campaign.goal.objective}`
    })
  });

  const creativeJson = creativeResp.ok ? (await creativeResp.json() as any) : { concepts: [] };

  const selectedConcepts = (creativeJson.concepts || []).slice(0, 3);

  // 4) Turn concepts into creatives for the campaign
  for (const concept of selectedConcepts) {
    const newCreative: CampaignCreative = {
      id: uuid(),
      title: concept.title,
      script: concept.description,
      templateId: concept.templateId,
      status: "PLANNED"
    };
    addCreative(campaign.id, newCreative);
  }

  campaign.status = "PLANNED";
  updateCampaign(campaign);

  return {
    ok: true,
    campaign
  };
}
