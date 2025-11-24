import { FastifyInstance } from "fastify";
import { OptimizationRequest } from "./types.js";
import { runOptimization } from "./core/optimizerEngine.js";
import { logOptimizationToBrain } from "./brainLogger.js";

export async function optimizerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    ok: true,
    service: "codex-optimizer",
    version: "1.0.0",
    mode: "SEMI_AUTONOMOUS",
    domains: ["social", "ecomm", "video", "trends", "monetization", "campaigns", "all"]
  }));

  app.post("/optimizer/run", async (req, reply) => {
    try {
      const body = req.body as OptimizationRequest;
      const result = await runOptimization(body);
      await logOptimizationToBrain(result);
      return result;
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });

  app.get("/optimizer/domains", async () => ({
    ok: true,
    domains: [
      { name: "social", description: "Social media accounts, engagement, content" },
      { name: "ecomm", description: "E-commerce stores, products, sales" },
      { name: "video", description: "Video generation, creative suite, templates" },
      { name: "trends", description: "Trend tracking, viral content, timing" },
      { name: "monetization", description: "Revenue streams, affiliate, pricing" },
      { name: "campaigns", description: "Content distribution, posting, reach" },
      { name: "all", description: "All domains combined analysis" }
    ]
  }));
}
