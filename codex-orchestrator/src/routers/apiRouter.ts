// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Orchestrator v2.0 - API Router
// Proxies all /api/* requests to Codex API Gateway (port 5150)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import axios from "axios";

const API_PORT = 5150;

export default async function apiRouter(app: FastifyInstance) {
  /**
   * Proxy all /api/* requests to Codex API Gateway
   */
  app.all("/api/*", async (request: FastifyRequest, reply: FastifyReply) => {
    const path = request.url;

    try {
      const response = await axios({
        method: request.method.toLowerCase() as any,
        url: `http://localhost:${API_PORT}${path}`,
        headers: {
          "Content-Type": "application/json",
        },
        data:
          request.method !== "GET" && request.method !== "HEAD"
            ? request.body
            : undefined,
        params: request.method === "GET" ? request.query : undefined,
        timeout: 60000, // 60s timeout for uploads
        validateStatus: () => true,
      });

      reply.status(response.status).send(response.data);
    } catch (error: any) {
      reply.status(503).send({
        ok: false,
        error: "Codex API Gateway unavailable",
        message: error.message,
      });
    }
  });
}
