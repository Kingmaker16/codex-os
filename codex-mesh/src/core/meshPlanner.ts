import { v4 as uuidv4 } from "uuid";
import { MeshRequest, MeshPlan, MeshStep } from "../types.js";

export function createInitialPlan(req: MeshRequest): MeshPlan {
  const id = uuidv4();
  const now = new Date().toISOString();
  const mode = (req.mode ?? "LIVE").toUpperCase() as "SIMULATION" | "DRY_RUN" | "LIVE";

  const steps: MeshStep[] = [
    {
      id: uuidv4(),
      label: "Evaluate autonomy decision",
      service: "autonomy",
      endpoint: "/autonomy/evaluate",
      payload: { goal: req.goal, domain: req.domain },
      status: "PENDING"
    },
    {
      id: uuidv4(),
      label: "Run self-regulation (SRL)",
      service: "srl",
      endpoint: "/srl/check",
      payload: {
        sessionId: req.sessionId,
        domain: req.domain,
        contentSummary: req.goal,
        plannedActions: ["planned_step_1","planned_step_2"]
      },
      status: "PENDING"
    },
    {
      id: uuidv4(),
      label: "Run hardening check",
      service: "hardening",
      endpoint: "/hardening/check",
      payload: {
        sessionId: req.sessionId,
        domain: req.domain,
        actionSummary: req.goal,
        servicesInvolved: ["orchestrator","ops","social","distribution"]
      },
      status: "PENDING"
    },
    {
      id: uuidv4(),
      label: "Create workflow",
      service: "workflow",
      endpoint: "/workflow/create",
      payload: {
        projectId: req.domain + "-project",
        goal: req.goal,
        sessionId: req.sessionId
      },
      status: "PENDING"
    }
  ];

  const plan: MeshPlan = {
    id,
    sessionId: req.sessionId,
    domain: req.domain,
    goal: req.goal,
    mode,
    createdAt: now,
    updatedAt: now,
    steps
  };

  return plan;
}
