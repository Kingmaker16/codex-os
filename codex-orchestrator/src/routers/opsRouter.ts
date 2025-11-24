// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Orchestrator v3.0 - Ops Router (Hardened)
// Proxies all /ops/* requests to Ops Engine (port 5350)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { callService } from "../hardening/httpClient.js";
import { resolveMode } from "../execution/orchestratorModes.js";

export default async function opsRouter(app: FastifyInstance) {
  // Proxy all ops endpoints
  app.all("/ops/*", async (request: FastifyRequest, reply: FastifyReply) => {
    const path = (request.url || "").replace(/^\/ops/, "/ops");

    try {
      const body = request.body as any;
      const mode = resolveMode(body?.mode || (request.query as any)?.mode);

      const result = await callService(
        "ops",
        path,
        {
          method: request.method.toLowerCase(),
          headers: { "Content-Type": "application/json" },
          body: request.method !== "GET" && request.method !== "HEAD" ? JSON.stringify(request.body) : undefined
        },
        { mode }
      );

      reply.status(result.status).send(result.data);
    } catch (error: any) {
      reply.status(503).send({
        ok: false,
        error: "Ops Engine unavailable",
        message: error.message,
      });
    }
  });

  console.log('  ✅ Ops Router registered (/ops/*) [v3 hardened]');
}
