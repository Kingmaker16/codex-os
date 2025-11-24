import { FastifyInstance } from "fastify";
import { CrossValRequest } from "./types.js";
import { runCrossValidation } from "./crossValEngine.js";

export async function crossValRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    ok: true,
    service: "codex-crossval",
    version: "1.0.0",
    mode: "ULTRA",
    providers: ["openai","claude","gemini","grok"]
  }));

  app.post("/crossval/run", async (req, reply) => {
    try {
      const body = req.body as CrossValRequest;
      const result = await runCrossValidation(body);
      return result;
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });
}
