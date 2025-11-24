import fetch from "node-fetch";
import { SimulationRequest, SimulationResult, SimulationStepResult } from "./types.js";

const ORCH_URL = "http://localhost:4200/orchestrator/quickRun";

async function runOrchCommand(command: string, sessionId: string): Promise<SimulationStepResult> {
  try {
    const resp = await fetch(ORCH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, command })
    });
    const data = await resp.json() as any;
    return {
      step: command,
      ok: resp.ok,
      details: data
    };
  } catch (err: any) {
    return {
      step: command,
      ok: false,
      error: err.message
    };
  }
}

export async function runSimulation(req: SimulationRequest): Promise<SimulationResult> {
  const steps: SimulationStepResult[] = [];

  if (req.scenario === "social_ecomm_launch") {
    // 1) Plan strategy
    steps.push(await runOrchCommand(
      `Plan a 7-day strategy to grow TikTok and YouTube Shorts in the ${req.niche} niche and test product "${req.productName ?? "Product X"}" for ecomm.`,
      req.sessionId
    ));

    // 2) Simulate content creation (no actual posting)
    steps.push(await runOrchCommand(
      `Simulate generating 5 UGC ad scripts and 5 short-form video ideas for "${req.productName ?? "Product X"}" in ${req.niche}. Do not actually post.`,
      req.sessionId
    ));

    // 3) Simulate store creation
    steps.push(await runOrchCommand(
      `Simulate building a simple 1-product store for "${req.productName ?? "Product X"}" with basic landing page. Do not deploy.`,
      req.sessionId
    ));

    // 4) Simulate ad launch
    steps.push(await runOrchCommand(
      `Simulate launching a $5/day paid test across TikTok and Shorts for "${req.productName ?? "Product X"}". Do not hit real ad APIs.`,
      req.sessionId
    ));
  } else if (req.scenario === "content_only") {
    steps.push(await runOrchCommand(
      `Plan and simulate 7 days of TikTok and Shorts content in the ${req.niche} niche. Do not post.`,
      req.sessionId
    ));
  } else if (req.scenario === "store_only") {
    steps.push(await runOrchCommand(
      `Plan and simulate launching a simple ecomm store in niche ${req.niche} testing "${req.productName ?? "Product X"}". Do not deploy.`,
      req.sessionId
    ));
  }

  const failures = steps.filter(s => !s.ok).length;
  const summary = failures === 0
    ? "Simulation completed successfully. All steps reported ok=true."
    : `Simulation completed with ${failures} failed step(s). Review step details for more info.`;

  return {
    ok: failures === 0,
    scenario: req.scenario,
    sessionId: req.sessionId,
    steps,
    summary
  };
}
