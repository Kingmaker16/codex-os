import { v4 as uuidv4 } from "uuid";
import { Workflow, WorkflowCreateRequest, WorkflowStartRequest, WorkflowApproveStepRequest, WorkflowStep } from "./types.js";
import { addWorkflow, getWorkflow, updateWorkflow } from "./state.js";
import { callService } from "./integrations.js";

const ORCH_BASE = "http://localhost:4200";
const AUTONOMY_BASE = "http://localhost:5420";
const BRAIN_BASE = "http://localhost:4100";

async function logToBrain(workflow: Workflow, message: string) {
  try {
    await fetch(BRAIN_BASE + "/v2/memory/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: "ops",
        sessionId: "workflow-" + workflow.id,
        title: "Workflow update",
        content: message,
        tags: ["workflow","autonomy","project:"+workflow.projectId]
      })
    });
  } catch {}
}

export async function createWorkflow(req: WorkflowCreateRequest): Promise<Workflow> {
  const id = uuidv4();
  const now = new Date().toISOString();

  const wf: Workflow = {
    id,
    projectId: req.projectId,
    goal: req.goal,
    createdAt: now,
    updatedAt: now,
    status: "PLANNED",
    steps: [],
    reasoningTrace: []
  };

  // Ask Autonomy Engine to decompose this high-level goal
  const decompResp = await callService(AUTONOMY_BASE + "/autonomy/decompose", {
    sessionId: req.sessionId,
    goal: req.goal
  });

  if (decompResp.ok && Array.isArray((decompResp.data as any)?.steps)) {
    for (const s of (decompResp.data as any).steps) {
      const step: WorkflowStep = {
        id: uuidv4(),
        label: s.label ?? "step",
        service: s.service ?? "unknown",
        endpoint: s.endpoint ?? "/",
        payload: s.payload ?? {},
        mode: "LIVE",
        requiresApproval: s.requiresApproval ?? false,
        status: "PENDING"
      };
      wf.steps.push(step);
    }
    wf.reasoningTrace.push("Steps derived from Autonomy Engine decomposition.");
  } else {
    wf.reasoningTrace.push("Failed to decompose goal; workflow created with no steps.");
  }

  addWorkflow(wf);
  await logToBrain(wf, "Workflow created.");
  return wf;
}

export async function startWorkflow(req: WorkflowStartRequest): Promise<Workflow | null> {
  const wf = getWorkflow(req.workflowId);
  if (!wf) return null;
  wf.status = "RUNNING";
  updateWorkflow(wf);
  await logToBrain(wf, "Workflow started.");
  return wf;
}

export async function approveStep(req: WorkflowApproveStepRequest): Promise<Workflow | null> {
  const wf = getWorkflow(req.workflowId);
  if (!wf) return null;
  const step = wf.steps.find(s => s.id === req.stepId);
  if (!step) return wf;

  step.requiresApproval = false;
  if (step.status === "PENDING") {
    step.status = "IN_PROGRESS";
  }
  updateWorkflow(wf);
  await logToBrain(wf, `Step approved: ${step.label}`);
  return wf;
}

export async function runNextStep(workflowId: string): Promise<Workflow | null> {
  const wf = getWorkflow(workflowId);
  if (!wf) return null;
  if (wf.status !== "RUNNING") return wf;

  const next = wf.steps.find(s => s.status === "PENDING" && !s.requiresApproval);
  if (!next) {
    const allDone = wf.steps.every(s => s.status === "DONE");
    wf.status = allDone ? "COMPLETED" : "PAUSED";
    updateWorkflow(wf);
    await logToBrain(wf, "Workflow completed or paused (no next step).");
    return wf;
  }

  next.status = "IN_PROGRESS";
  updateWorkflow(wf);

  const targetUrl = ORCH_BASE + next.endpoint;
  const resp = await callService(targetUrl, next.payload);

  if (resp.ok) {
    next.status = "DONE";
    next.result = resp.data;
    await logToBrain(wf, `Step done: ${next.label}`);
  } else {
    next.status = "ERROR";
    next.error = (resp.data as any)?.error || `HTTP ${resp.status}`;
    wf.status = "FAILED";
    await logToBrain(wf, `Step failed: ${next.label} (${next.error})`);
  }

  updateWorkflow(wf);
  return wf;
}
