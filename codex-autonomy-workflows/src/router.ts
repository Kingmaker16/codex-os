import { FastifyInstance } from "fastify";
import { WorkflowCreateRequest, WorkflowStartRequest, WorkflowApproveStepRequest } from "./types.js";
import { createWorkflow, startWorkflow, approveStep, runNextStep } from "./workflowEngine.js";
import { getWorkflow, listWorkflows } from "./state.js";

export async function workflowRoutes(app: FastifyInstance) {

  app.get("/health", async () => ({
    ok: true,
    service: "codex-autonomy-workflows",
    version: "1.0.0",
    mode: "SEMI_AUTONOMOUS"
  }));

  app.post("/workflow/create", async (req, reply) => {
    try {
      const body = req.body as WorkflowCreateRequest;
      const wf = await createWorkflow(body);
      return { ok: true, workflow: wf };
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });

  app.post("/workflow/start", async (req, reply) => {
    const body = req.body as WorkflowStartRequest;
    const wf = await startWorkflow(body);
    if (!wf) {
      reply.status(404);
      return { ok: false, error: "Workflow not found" };
    }
    return { ok: true, workflow: wf };
  });

  app.post("/workflow/continue", async (req, reply) => {
    const { workflowId } = req.body as any;
    const wf = await runNextStep(workflowId);
    if (!wf) {
      reply.status(404);
      return { ok: false, error: "Workflow not found" };
    }
    return { ok: true, workflow: wf };
  });

  app.post("/workflow/approveStep", async (req, reply) => {
    const body = req.body as WorkflowApproveStepRequest;
    const wf = await approveStep(body);
    if (!wf) {
      reply.status(404);
      return { ok: false, error: "Workflow not found" };
    }
    return { ok: true, workflow: wf };
  });

  app.get("/workflow/:id", async (req, reply) => {
    const { id } = req.params as any;
    const wf = getWorkflow(id);
    if (!wf) {
      reply.status(404);
      return { ok: false, error: "Not found" };
    }
    return { ok: true, workflow: wf };
  });

  app.get("/workflows", async () => ({
    ok: true,
    workflows: listWorkflows()
  }));
}
