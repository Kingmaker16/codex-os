import { FastifyInstance } from "fastify";
import { AuditRequest, BatchAuditRequest } from "./types.js";
import { runAudit } from "./core/auditEngine.js";

const auditHistory: any[] = [];

export async function auditRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    ok: true,
    service: "codex-self-audit",
    version: "1.0.0",
    mode: "SEMI_AUTONOMOUS",
    capabilities: [
      "logic_validation",
      "multi_llm_validation",
      "safety_compliance",
      "consistency_checking",
      "quality_scoring"
    ]
  }));

  app.post("/audit/run", async (req, reply) => {
    try {
      const body = req.body as AuditRequest;
      const report = await runAudit(body);
      
      auditHistory.push({
        sessionId: report.sessionId,
        timestamp: report.timestamp,
        contentType: report.contentType,
        findingCount: report.findings.length,
        qualityScore: report.qualityScore.overall,
        shouldBlock: report.shouldBlock
      });

      // Keep last 100 audits
      if (auditHistory.length > 100) auditHistory.shift();

      return { ok: true, report };
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });

  app.post("/audit/batch", async (req, reply) => {
    try {
      const body = req.body as BatchAuditRequest;
      const reports = [];

      for (const item of body.items) {
        const report = await runAudit(item);
        reports.push(report);
      }

      const summary = {
        total: reports.length,
        passed: reports.filter(r => !r.shouldBlock && r.qualityScore.overall >= 70).length,
        warnings: reports.filter(r => !r.shouldBlock && r.qualityScore.overall < 70).length,
        blocked: reports.filter(r => r.shouldBlock).length
      };

      return { ok: true, reports, summary };
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });

  app.get("/audit/history", async (req) => {
    const query = req.query as any;
    const limit = parseInt(query.limit) || 20;

    return {
      ok: true,
      history: auditHistory.slice(-limit).reverse(),
      count: auditHistory.length
    };
  });
}
