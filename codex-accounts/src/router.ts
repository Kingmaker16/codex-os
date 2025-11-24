import { FastifyInstance } from "fastify";
import { registerAccount, listAccounts, logEvent, getRiskStates } from "./state.js";
import { AccountEvent, PostEvaluationRequest } from "./types.js";
import { evaluatePost } from "./evaluator.js";

export async function accountsRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    ok: true,
    service: "codex-accounts",
    version: "1.0.0",
    mode: "ULTRA_SEGMENTED"
  }));

  app.post("/accounts/register", async (req, reply) => {
    const body = req.body as { platform: "tiktok" | "youtube" | "instagram"; handle: string; riskTier: "SAFE" | "MEDIUM" | "EXPERIMENT"; };
    const profile = registerAccount(body.platform, body.handle, body.riskTier);
    return { ok: true, profile };
  });

  app.get("/accounts/list", async () => ({
    ok: true,
    accounts: listAccounts()
  }));

  app.post("/accounts/event", async (req, reply) => {
    const body = req.body as AccountEvent;
    logEvent(body);
    return { ok: true };
  });

  app.get("/accounts/summary", async () => {
    const states = getRiskStates();
    return {
      ok: true,
      summary: {
        safe: states.filter(s => s.riskTier === "SAFE"),
        medium: states.filter(s => s.riskTier === "MEDIUM"),
        experiment: states.filter(s => s.riskTier === "EXPERIMENT")
      }
    };
  });

  app.post("/accounts/evaluatePost", async (req, reply) => {
    const body = req.body as PostEvaluationRequest;
    const decision = evaluatePost(body);
    return { ok: true, decision };
  });
}
