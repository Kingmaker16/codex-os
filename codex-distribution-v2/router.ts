import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { v4 as uuidv4 } from "uuid";
import {
  Platform,
  DistributionPlan,
  SafetyMode,
  Language,
  PublishRequest,
  RepurposeRequest
} from "./types.js";
import { CONFIG } from "./config.js";
import { stateManager } from "./state/stateManager.js";
import { distributionScheduler } from "./scheduler/distributionScheduler.js";
import { generateWeeklyCalendar, fillCalendarWithContent } from "./planners/calendarPlanner.js";
import { planLanguageDistribution } from "./planners/languagePlanner.js";
import { getVelocityProfile, calculateOptimalVelocity } from "./planners/velocityPlanner.js";
import { fetchTrendData, scoreSlotsWithTrends } from "./planners/trendPlanner.js";
import { selectAccount, getActiveAccounts } from "./routing/accountRouter.js";
import { selectOptimalPlatforms } from "./routing/platformRouter.js";
import { repurposeContent } from "./engines/repurposeEngine.js";
import { getLLMDistributionSuggestions } from "./engines/multiLLMEngine.js";
import { assessRisk, mitigateRisk } from "./engines/riskEngine.js";
import { enforceSafetyMode, validatePublishRequest, createSafetyReport } from "./engines/safetyEngine.js";
import { handlePublishFailure } from "./engines/fallbackEngine.js";
import { publishToSocial } from "./integrations/socialIntegration.js";
import { scoreContentVisibility } from "./integrations/visibilityIntegration.js";
import { logDistributionEvent } from "./integrations/brainIntegration.js";

export async function registerRoutes(server: FastifyInstance) {
  server.get("/health", async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      ok: true,
      service: CONFIG.SERVICE_NAME,
      version: CONFIG.VERSION,
      safetyMode: CONFIG.SAFETY_MODE,
      port: CONFIG.PORT
    };
  });

  server.post("/distribution/create", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const { contentId, platforms, languages, velocity, trendWeighted } = body;

    const plan: DistributionPlan = {
      id: uuidv4(),
      contentId,
      platforms: platforms || ["tiktok", "youtube", "instagram"],
      languages: languages || ["en"],
      velocity: velocity || 1.0,
      trendWeighted: trendWeighted !== false,
      safetyMode: CONFIG.SAFETY_MODE,
      slots: [],
      createdAt: new Date().toISOString(),
      status: "DRAFT"
    };

    stateManager.createPlan(plan);

    await logDistributionEvent("plan_created", { planId: plan.id, contentId }, 0.7);

    return { ok: true, plan };
  });

  server.post("/distribution/plan", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const { planId } = body;

    const plan = stateManager.getPlan(planId);
    if (!plan) {
      return reply.status(404).send({ ok: false, error: "Plan not found" });
    }

    const trendData = await fetchTrendData(plan.platforms);
    const llmSuggestions = await getLLMDistributionSuggestions(plan.contentId, plan.platforms);

    let calendar = await generateWeeklyCalendar(plan.platforms);
    calendar = { ...calendar, slots: await scoreSlotsWithTrends(calendar.slots, trendData) };

    stateManager.updatePlan(planId, {
      slots: calendar.slots,
      status: "APPROVED"
    });

    stateManager.createCalendar(calendar);

    await logDistributionEvent("plan_generated", { planId, slotCount: calendar.slots.length }, 0.8);

    return {
      ok: true,
      plan: stateManager.getPlan(planId),
      calendar,
      trendData,
      llmSuggestions
    };
  });

  server.post("/distribution/run", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const { planId, simulate } = body;

    const plan = stateManager.getPlan(planId);
    if (!plan) {
      return reply.status(404).send({ ok: false, error: "Plan not found" });
    }

    stateManager.updatePlan(planId, { status: "EXECUTING" });

    const results = [];
    for (const slot of plan.slots.slice(0, 5)) {
      const account = await selectAccount(slot.platform, "LOW");
      if (!account) continue;

      const publishRequest: PublishRequest = {
        slotId: slot.id,
        accountId: account.id,
        contentId: plan.contentId,
        platform: slot.platform,
        safetyMode: plan.safetyMode,
        simulate: simulate || true
      };

      const validation = validatePublishRequest(publishRequest, plan.safetyMode);
      if (!validation.valid) {
        results.push({ slotId: slot.id, success: false, reason: validation.reason });
        continue;
      }

      const result = await publishToSocial(publishRequest);
      results.push(result);

      if (result.success) {
        stateManager.updateMetrics(1, true, slot.visibilityScore);
      }
    }

    stateManager.updatePlan(planId, { status: "COMPLETED" });

    await logDistributionEvent("plan_executed", { planId, results: results.length }, 0.9);

    return { ok: true, planId, results };
  });

  server.get("/distribution/status", async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as any;
    const { planId } = query;

    if (planId) {
      const plan = stateManager.getPlan(planId);
      return { ok: true, plan };
    }

    const allPlans = stateManager.getAllPlans();
    const metrics = stateManager.getMetrics();

    return { ok: true, plans: allPlans, metrics };
  });

  server.post("/distribution/calendar", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const { platforms, languages } = body;

    const calendar = await generateWeeklyCalendar(
      platforms || ["tiktok", "youtube", "instagram"]
    );

    stateManager.createCalendar(calendar);

    return { ok: true, calendar };
  });

  server.get("/distribution/slots", async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as any;
    const { calendarId, platform } = query;

    if (calendarId) {
      const calendar = stateManager.getCalendar(calendarId);
      if (!calendar) {
        return reply.status(404).send({ ok: false, error: "Calendar not found" });
      }

      let slots = calendar.slots;
      if (platform) {
        slots = distributionScheduler.filterSlotsByPlatform(slots, platform as Platform);
      }

      return { ok: true, slots };
    }

    return { ok: true, slots: [] };
  });

  server.post("/distribution/repurpose", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as RepurposeRequest;

    const results = await repurposeContent(body);

    await logDistributionEvent("content_repurposed", {
      contentId: body.contentId,
      platforms: body.targetPlatforms
    }, 0.6);

    return { ok: true, repurposedContent: results };
  });

  server.post("/distribution/language", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const { contentId, targetLanguages } = body;

    const content = { id: contentId, language: "en" as Language } as any;
    const distributions = await planLanguageDistribution(content, targetLanguages || ["en", "es", "ar"]);

    return { ok: true, distributions };
  });

  server.get("/distribution/velocity", async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as any;
    const { platform } = query;

    if (!platform) {
      return reply.status(400).send({ ok: false, error: "Platform required" });
    }

    const profile = getVelocityProfile(platform as Platform);
    const optimalVelocity = calculateOptimalVelocity(platform as Platform, 100000, 10);

    return { ok: true, profile, optimalVelocity };
  });

  server.post("/distribution/trends", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const { platforms } = body;

    const trendData = await fetchTrendData(platforms || ["tiktok", "youtube", "instagram"]);

    return { ok: true, trends: trendData };
  });

  server.get("/distribution/accounts", async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as any;
    const { platform } = query;

    if (!platform) {
      return reply.status(400).send({ ok: false, error: "Platform required" });
    }

    const accounts = await getActiveAccounts(platform as Platform);

    return { ok: true, accounts };
  });

  server.post("/distribution/platforms", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const { contentId, availablePlatforms } = body;

    const content = { id: contentId } as any;
    const optimal = await selectOptimalPlatforms(content, availablePlatforms || ["tiktok", "youtube", "instagram"]);

    return { ok: true, optimalPlatforms: optimal };
  });

  server.post("/distribution/publish", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as PublishRequest;

    const validation = validatePublishRequest(body, body.safetyMode);
    if (!validation.valid) {
      return reply.status(400).send({ ok: false, error: validation.reason });
    }

    const riskAssessment = await assessRisk(body.accountId, body.platform, body.contentId);
    if (riskAssessment.riskLevel === "CRITICAL") {
      return reply.status(403).send({ ok: false, error: "Risk too high for publication" });
    }

    const result = await publishToSocial(body);

    if (!result.success && result.error) {
      const slot = {
        id: body.slotId,
        platform: body.platform,
        datetime: new Date().toISOString(),
        accountId: body.accountId,
        contentId: body.contentId,
        contentType: "video" as any,
        language: "en" as Language,
        status: "FAILED" as any
      };
      const fallback = await handlePublishFailure(slot, result.error);
      return { ok: false, result, fallback };
    }

    await logDistributionEvent("content_published", {
      slotId: body.slotId,
      platform: body.platform,
      success: result.success
    }, 1.0);

    return { ok: true, result };
  });

  server.post("/distribution/simulate", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const { planId } = body;

    const plan = stateManager.getPlan(planId);
    if (!plan) {
      return reply.status(404).send({ ok: false, error: "Plan not found" });
    }

    const safetyReport = createSafetyReport(plan.slots, plan.safetyMode);
    const visibilityScores = await scoreContentVisibility(plan.contentId, plan.platforms);

    const simulation = {
      planId: plan.id,
      totalSlots: plan.slots.length,
      safetyReport,
      visibilityScores,
      estimatedReach: Object.values(visibilityScores).reduce((sum, score) => sum + score * 10000, 0),
      recommendedAction: safetyReport.riskySlots > 5 ? "REVIEW_REQUIRED" : "PROCEED"
    };

    await logDistributionEvent("simulation_run", { planId, simulation }, 0.5);

    return { ok: true, simulation };
  });
}
