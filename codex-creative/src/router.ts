import { FastifyInstance } from "fastify";
import { runCreativeEngine } from "./creativeEngine.js";
import { CreativeRequest } from "./types.js";

export async function creativeRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    ok: true,
    service: "codex-creative",
    version: "1.0.0"
  }));

  app.post("/creative/generate", async (req, reply) => {
    try {
      const body = req.body as CreativeRequest;
      const result = await runCreativeEngine(body);
      return result;
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });
}
