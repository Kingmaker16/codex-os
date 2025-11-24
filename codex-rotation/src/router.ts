import { FastifyInstance } from "fastify";
import { RotationRequest } from "./types.js";
import { decideRotation } from "./rotationEngine.js";

export async function rotationRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    ok: true,
    service: "codex-rotation",
    version: "1.0.0"
  }));

  app.post("/rotation/decide", async (req, reply) => {
    try {
      const body = req.body as RotationRequest;
      const decision = await decideRotation(body.context);
      return decision;
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });
}
