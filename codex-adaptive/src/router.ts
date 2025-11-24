import { FastifyInstance } from "fastify";
import { generateAdaptiveInsights } from "./adaptiveEngine.js";

export default async function router(app: FastifyInstance) {

  app.get("/health", async () => ({
    ok: true,
    service: "codex-adaptive",
    version: "1.0-ultra-xp",
    mode: "AIE-ULTRA-XP"
  }));

  app.post("/adaptive/run", async (req, reply) => {
    const body: any = req.body;

    const insights = await generateAdaptiveInsights({
      sessionId: body.sessionId,
      goal: body.goal,
      domain: body.domain,
      recentMetrics: body.recentMetrics || {}
    });

    return { ok: true, insights };
  });
}
