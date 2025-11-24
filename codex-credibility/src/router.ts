// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Credibility Engine v1 - API Router
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { CREDIBILITY_VERSION, type CredibilityRequest } from "./types.js";
import { analyzeCredibility } from "./fusionCredibility.js";

export async function registerRoutes(app: FastifyInstance) {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET /health - Service health check
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  app.get("/health", async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send({
      ok: true,
      service: "codex-credibility",
      version: CREDIBILITY_VERSION,
      features: [
        "multi-llm-fusion",
        "claim-verification",
        "trust-scoring",
        "proof-suggestions",
      ],
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // POST /credibility/check - Analyze content credibility
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  app.post(
    "/credibility/check",
    async (
      request: FastifyRequest<{ Body: CredibilityRequest }>,
      reply: FastifyReply
    ) => {
      try {
        const { sessionId, domain, content, meta } = request.body;

        // Validate required fields
        if (!sessionId || !domain || !content) {
          reply.status(400);
          return {
            ok: false,
            error: "sessionId, domain, and content are required",
          };
        }

        // Validate domain
        const validDomains = ["social", "ecomm", "ad", "script", "email"];
        if (!validDomains.includes(domain)) {
          reply.status(400);
          return {
            ok: false,
            error: `domain must be one of: ${validDomains.join(", ")}`,
          };
        }

        // Perform credibility analysis
        const result = await analyzeCredibility(sessionId, domain, content);

        reply.send(result);
      } catch (err: any) {
        reply.status(500);
        return {
          ok: false,
          error: "credibility_analysis_failed",
          message: err?.message || "Analysis failed",
        };
      }
    }
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // POST /credibility/batch - Batch analyze multiple items
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  app.post(
    "/credibility/batch",
    async (
      request: FastifyRequest<{
        Body: { items: CredibilityRequest[] };
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
            analyzeCredibility(item.sessionId, item.domain, item.content).catch(
              (err) => ({
                ok: false,
                sessionId: item.sessionId,
                domain: item.domain,
                content: item.content,
                improved: item.content,
                score: 0,
                issues: [
                  {
                    type: "UNCLEAR" as const,
                    message: err.message,
                    suggestion: "Try again",
                  },
                ],
              })
            )
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
          error: "batch_analysis_failed",
          message: err?.message || "Batch analysis failed",
        };
      }
    }
  );
}
