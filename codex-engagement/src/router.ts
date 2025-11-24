import { FastifyInstance } from "fastify";
import { EngagementRequest } from "./types.js";
import { buildEngagementPlan } from "./planEngine.js";

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    ok: true,
    service: "codex-engagement",
    version: "1.0.0"
  }));

  app.post("/engagement/plan", async (req, reply) => {
    try {
      const body = req.body as EngagementRequest;
      const result = await buildEngagementPlan(body);
      return result;
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });
}
