import { FastifyInstance } from "fastify";
import { storeAutonomyMemory, getRecent, getByDomain, getByOutcome } from "./memoryEngine.js";
import { AutonomyOutcome } from "./types.js";

export async function autonomyMemoryRoutes(app: FastifyInstance) {

  app.get("/health", async () => ({
    ok: true,
    service: "codex-autonomy-memory",
    version: "1.0.0",
    mode: "AUTONOMY_MEMORY_V1"
  }));

  app.post("/autonomy/memory/store", async (req, reply) => {
    try {
      const body = req.body as any;
      const rec = storeAutonomyMemory({
        sessionId: body.sessionId,
        workflowId: body.workflowId,
        goal: body.goal,
        domain: body.domain || [],
        decision: body.decision,
        outcome: body.outcome as AutonomyOutcome,
        approved: !!body.approved,
        notes: body.notes,
        metrics: body.metrics || {}
      });
      return { ok: true, record: rec };
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });

  app.get("/autonomy/memory/recent", async (req, reply) => {
    const limit = parseInt((req.query as any).limit || "50", 10);
    return { ok: true, records: getRecent(limit) };
  });

  app.get("/autonomy/memory/domain", async (req, reply) => {
    const domain = (req.query as any).domain;
    if (!domain) {
      reply.status(400);
      return { ok: false, error: "Missing ?domain=" };
    }
    return { ok: true, records: getByDomain(domain) };
  });

  app.get("/autonomy/memory/outcome", async (req, reply) => {
    const outcome = (req.query as any).outcome as AutonomyOutcome;
    if (!outcome) {
      reply.status(400);
      return { ok: false, error: "Missing ?outcome=" };
    }
    return { ok: true, records: getByOutcome(outcome) };
  });
}
