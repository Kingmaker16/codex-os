import { FastifyInstance } from "fastify";
import { CampaignCreateRequest, CampaignPlanRequest } from "./types.js";
import { createCampaign, getCampaign, listCampaigns } from "./state.js";
import { planCampaign } from "./planEngine.js";

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    ok: true,
    service: "codex-campaign",
    version: "1.0.0"
  }));

  app.post("/campaign/create", async (req, reply) => {
    const body = req.body as CampaignCreateRequest;
    const campaign = createCampaign(body);
    return { ok: true, campaign };
  });

  app.post("/campaign/plan", async (req, reply) => {
    const body = req.body as CampaignPlanRequest;
    const result = await planCampaign(body);
    if (!result.ok) {
      reply.status(404);
      return result;
    }
    return result;
  });

  app.get("/campaign/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const campaign = getCampaign(id);
    if (!campaign) {
      reply.status(404);
      return { ok: false, error: "Not found" };
    }
    return { ok: true, campaign };
  });

  app.get("/campaigns", async () => ({
    ok: true,
    campaigns: listCampaigns()
  }));
}
