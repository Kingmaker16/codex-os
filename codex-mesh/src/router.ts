import { FastifyInstance } from "fastify";
import { MeshRequest } from "./types.js";
import { createInitialPlan } from "./core/meshPlanner.js";
import { addPlan, getPlan, listPlans, updatePlan } from "./core/meshState.js";
import { runNextMeshStep } from "./core/meshExecutor.js";

export async function meshRoutes(app: FastifyInstance) {

  app.get("/health", async () => ({
    ok: true,
    service: "codex-mesh",
    version: "1.0.0",
    mode: "SEMI_AUTONOMOUS_MESH"
  }));

  app.post("/mesh/create", async (req, reply) => {
    try {
      const body = req.body as MeshRequest;
      const plan = createInitialPlan(body);
      addPlan(plan);
      return { ok: true, plan };
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });

  app.post("/mesh/step", async (req, reply) => {
    const { planId } = req.body as any;
    const plan = getPlan(planId);
    if (!plan) {
      reply.status(404);
      return { ok: false, error: "Plan not found" };
    }
    const updated = await runNextMeshStep(plan);
    return { ok: true, plan: updated };
  });

  app.get("/mesh/plan", async (req, reply) => {
    const { id } = req.query as any;
    const plan = getPlan(id);
    if (!plan) {
      reply.status(404);
      return { ok: false, error: "Plan not found" };
    }
    return { ok: true, plan };
  });

  app.get("/mesh/plans", async () => ({
    ok: true,
    plans: listPlans()
  }));
}
