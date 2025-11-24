import { FastifyInstance } from "fastify";
import { SimulationRequest } from "./types.js";
import { runSimulation } from "./simEngine.js";

export async function simRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    ok: true,
    service: "codex-sim",
    version: "1.0.0"
  }));

  app.post("/sim/run", async (req, reply) => {
    try {
      const body = req.body as SimulationRequest;
      const result = await runSimulation(body);
      return result;
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });
}
