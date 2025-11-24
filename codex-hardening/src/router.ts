import { FastifyInstance } from "fastify";
import { HardeningCheckRequest } from "./types.js";
import { runHardeningCheck } from "./core/hardeningEngine.js";

export async function hardeningRoutes(app: FastifyInstance) {

  app.get("/health", async () => ({
    ok: true,
    service: "codex-hardening",
    version: "1.0.0",
    mode: "ULTRA_HARDENED"
  }));

  app.post("/hardening/check", async (req, reply) => {
    try {
      const body = req.body as HardeningCheckRequest;
      const decision = await runHardeningCheck(body);
      return decision;
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });
}
