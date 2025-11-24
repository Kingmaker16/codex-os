import { FastifyInstance } from "fastify";
import { SRLCheckRequest } from "./types.js";
import { runSelfRegulation } from "./core/srlEngine.js";

export async function srlRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    ok: true,
    service: "codex-srl",
    version: "1.0.0",
    mode: "SEMI_AUTONOMOUS"
  }));

  app.post("/srl/check", async (req, reply) => {
    try {
      const body = req.body as SRLCheckRequest;
      const decision = await runSelfRegulation(body);
      return decision;
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });
}
