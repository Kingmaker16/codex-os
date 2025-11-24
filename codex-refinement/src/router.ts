// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Refinement Layer v1 - API Router
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { REFINEMENT_VERSION, type RefinementRequest } from "./types.js";
import { refineContent } from "./refinementEngine.js";

export async function refinementRoutes(app: FastifyInstance) {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET /health - Service health check
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  app.get("/health", async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send({
      ok: true,
      service: "codex-refinement",
      version: REFINEMENT_VERSION,
      features: [
        "multi-llm-fusion",
        "content-improvement",
        "quality-scoring",
        "issue-detection",
      ],
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // POST /refine - Refine content using multi-LLM fusion
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  app.post(
    "/refine",
    async (
      request: FastifyRequest<{ Body: RefinementRequest }>,
      reply: FastifyReply
    ) => {
      try {
        const { sessionId, domain, input, metadata } = request.body;

        // Validate required fields
        if (!sessionId || !domain || !input) {
          reply.status(400);
          return {
            ok: false,
            error: "sessionId, domain, and input are required",
          };
        }

        // Perform refinement
        const result = await refineContent({
          sessionId,
          domain,
          input,
          metadata,
        });

        reply.send(result);
      } catch (err: any) {
        reply.status(500);
        return {
          ok: false,
          error: "refinement_error",
          message: err?.message || "Refinement failed",
        };
      }
    }
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // POST /refine/batch - Batch refine multiple items
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  app.post(
    "/refine/batch",
    async (
      request: FastifyRequest<{
        Body: { items: RefinementRequest[] };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { items } = request.body;

        if (!Array.isArray(items) || items.length === 0) {
          reply.status(400);
          return {
            ok: false,
            error: "items array is required",
          };
        }

        // Process all items in parallel
        const results = await Promise.all(
          items.map((item) =>
            refineContent(item).catch((err) => ({
              ok: false,
              sessionId: item.sessionId,
              domain: item.domain,
              improved: item.input,
              score: 0,
              issues: [err.message],
              suggestions: [],
              modelBreakdown: [],
            }))
          )
        );

        reply.send({
          ok: true,
          count: results.length,
          results,
        });
      } catch (err: any) {
        reply.status(500);
        return {
          ok: false,
          error: "batch_refinement_error",
          message: err?.message || "Batch refinement failed",
        };
      }
    }
  );
}
