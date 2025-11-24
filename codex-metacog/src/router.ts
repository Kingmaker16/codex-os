import { FastifyInstance } from "fastify";
import { runMetaCognition } from "./engines/metacogEngine.js";
import { MetaAnalysisRequest } from "./types.js";

export async function registerRoutes(app: FastifyInstance) {

  app.get("/health", async () => ({
    ok: true,
    service: "codex-metacog",
    version: "1.0.0-ultra",
    mode: "META_COGNITION"
  }));

  app.post("/metacog/analyze", async (req, reply) => {
    try {
      const body = req.body as MetaAnalysisRequest;
      
      if (!body.text) {
        reply.status(400);
        return { ok: false, error: "Missing 'text' field in request body" };
      }
      
      const report = await runMetaCognition(body);
      return { ok: true, report };
    } catch (err: any) {
      app.log.error({ err }, "Meta-cognition analysis failed");
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });
}
