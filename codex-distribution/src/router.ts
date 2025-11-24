import { FastifyInstance } from "fastify";
import { createPlan, listPlans, getPlan, updatePlan } from "./state.js";
import { computeRouting } from "./routingEngine.js";
import { repurposeContent } from "./repurposeEngine.js";
import { PlanCreateRequest, RepurposeRequest, BatchPublishRequest } from "./types.js";
import fetch from "node-fetch";

const SOCIAL_POST_URL = "http://localhost:4800/social/upload";

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    ok: true,
    service: "codex-distribution",
    version: "1.0.0",
    mode: "ULTRA"
  }));

  app.post("/distribution/planCalendar", async (req, reply) => {
    const body = req.body as PlanCreateRequest;
    const routing = await computeRouting(body.target.platforms);
    const plan = createPlan(body, routing);
    return { ok: true, plan };
  });

  app.get("/distribution/plans", async () => ({
    ok: true,
    plans: listPlans()
  }));

  app.get("/distribution/plan/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const plan = getPlan(id);
    if (!plan) {
      reply.status(404);
      return { ok: false, error: "Plan not found" };
    }
    return { ok: true, plan };
  });

  app.post("/distribution/repurpose", async (req, reply) => {
    const body = req.body as RepurposeRequest;
    const result = await repurposeContent(body);
    return result;
  });

  app.post("/distribution/publishBatch", async (req, reply) => {
    const body = req.body as BatchPublishRequest;
    const plan = getPlan(body.planId);
    if (!plan) {
      reply.status(404);
      return { ok: false, error: "Plan not found" };
    }

    const slotIds = body.slotIds ?? plan.slots.filter(s => s.status === "PLANNED").map(s => s.id);
    const posted: string[] = [];

    for (const slot of plan.slots) {
      if (!slotIds.includes(slot.id)) continue;

      const resp = await fetch(SOCIAL_POST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: slot.accountId,
          platform: slot.platform,
          scheduledFor: slot.scheduledFor,
          contentId: slot.contentId || "auto-generated"
        })
      });

      if (resp.ok) {
        slot.status = "POSTED";
        posted.push(slot.id);
      } else {
        slot.status = "FAILED";
      }
    }

    updatePlan(plan);
    return {
      ok: true,
      posted,
      plan
    };
  });
}
