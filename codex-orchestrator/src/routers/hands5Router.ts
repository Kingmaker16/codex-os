// =============================================
// ORCHESTRATOR v2.0: HANDS5 ROUTER
// =============================================

import { FastifyInstance } from "fastify";

const HANDS5_URL = "http://localhost:4350";

export async function registerHands5Router(app: FastifyInstance) {
  // Proxy all /hands5/* requests to Hands v5.0 service
  app.all("/hands5/*", async (req, reply) => {
    const path = (req.url || "").replace(/^\/hands5/, "/hands5");
    const targetUrl = `${HANDS5_URL}${path}`;

    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: req.headers as any,
        body: req.method !== "GET" && req.method !== "HEAD" 
          ? JSON.stringify(req.body) 
          : undefined
      });

      const data = await response.json();
      reply.code(response.status).send(data);
    } catch (error: any) {
      reply.code(503).send({
        ok: false,
        error: "Hands v5.0 service unavailable",
        details: error.message
      });
    }
  });

  // Health check endpoint
  app.get("/hands5/health", async (req, reply) => {
    try {
      const response = await fetch(`${HANDS5_URL}/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      reply.code(503).send({
        ok: false,
        error: "Hands v5.0 service unavailable"
      });
    }
  });
}
