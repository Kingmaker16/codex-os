import { FastifyInstance } from "fastify";
import { RefinementRequest, HistoryRequest } from "./types.js";
import { runRefinement, calculateOverallHealth } from "./refinementEngine.js";
import { getProgressHistory, calculateTrend } from "./progressTracker.js";

export async function refinementRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    ok: true,
    service: "codex-performance-refinement",
    version: "1.0.0",
    mode: "SEMI_AUTONOMOUS",
    domains: ["social", "ecomm", "video", "strategy", "trends", "campaign", "monetization"]
  }));

  app.post("/refinement/run", async (req, reply) => {
    try {
      const body = req.body as RefinementRequest;
      const report = await runRefinement(body);
      const health = calculateOverallHealth(report);

      return {
        ok: true,
        report: {
          sessionId: report.sessionId,
          domain: report.domain,
          timestamp: report.timestamp,
          weaknessCount: report.weaknesses.length,
          patternCount: report.patterns.length,
          recommendationCount: report.recommendations.length,
          improvementScore: report.improvementScore,
          health,
          weaknesses: report.weaknesses,
          patterns: report.patterns,
          recommendations: report.recommendations,
          llmConsensus: report.llmConsensus
        }
      };
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });

  app.post("/refinement/history", async (req, reply) => {
    try {
      const body = req.body as HistoryRequest;
      const history = getProgressHistory(body.domain, body.days || 7);
      const trend = calculateTrend(history);

      return {
        ok: true,
        history: history.map(entry => ({
          date: entry.date,
          domain: entry.domain,
          improvementScore: entry.improvementScore,
          metricsSnapshot: entry.metrics
        })),
        trend,
        count: history.length
      };
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });

  app.get("/refinement/domains", async () => ({
    ok: true,
    domains: [
      { name: "social", description: "Social media performance" },
      { name: "ecomm", description: "E-commerce metrics" },
      { name: "video", description: "Video content performance" },
      { name: "strategy", description: "Strategic execution" },
      { name: "trends", description: "Trend alignment" },
      { name: "campaign", description: "Campaign effectiveness" },
      { name: "monetization", description: "Revenue optimization" }
    ]
  }));
}
