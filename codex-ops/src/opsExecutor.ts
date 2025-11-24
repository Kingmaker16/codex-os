// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Ops Engine v1 ULTRA - Task Executor
// Executes ops tasks with dependency tracking and error handling
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import fetch from "node-fetch";
import type { OpsTask, OpsStepResult } from "./types.js";
import { getServiceByName } from "./opsServiceMap.js";
import { logStepExecution } from "./opsBrainLogger.js";
import { selectProvider, getProviderModel } from "./opsLoadBalancer.js";

export async function executeTask(task: OpsTask): Promise<void> {
  task.status = "RUNNING";
  task.startedAt = new Date().toISOString();

  for (let i = task.currentStep; i < task.steps.length; i++) {
    const step = task.steps[i];
    task.currentStep = i;

    const startTime = Date.now();
    let result: OpsStepResult;

    try {
      const output = await executeStep(step, task);
      const latency = Date.now() - startTime;

      result = {
        step,
        status: "success",
        latency,
        output,
        timestamp: new Date().toISOString(),
      };

      await logStepExecution(step, "success", latency, task.sessionId, {
        taskId: task.taskId,
        output,
      });
    } catch (error: any) {
      const latency = Date.now() - startTime;

      result = {
        step,
        status: "failure",
        latency,
        error: error.message || "Step execution failed",
        timestamp: new Date().toISOString(),
      };

      await logStepExecution(step, "failure", latency, task.sessionId, {
        taskId: task.taskId,
        error: error.message,
      });

      task.results.push(result);
      task.error = `Failed at step ${i + 1}/${task.steps.length}: ${step}`;
      task.status = "FAILED";
      return;
    }

    task.results.push(result);
  }

  task.status = "COMPLETED";
  task.completedAt = new Date().toISOString();
}

async function executeStep(
  step: string,
  task: OpsTask
): Promise<any> {
  // Route step to appropriate service
  const stepRoutes: Record<string, () => Promise<any>> = {
    plan: () => callStrategy(task),
    generate_content: () => callCreativeSuite(task),
    content_plan: () => callStrategy(task),
    content_edit: () => callVision(task),
    distribute: () => callDistribution(task),
    engage: () => callEngagement(task),
    track_metrics: () => callTelemetry(task),
    analyze: () => callStrategy(task),
    post: () => callHands(task),
    simulate: () => callSimulation(task),
  };

  const executor = stepRoutes[step];

  if (!executor) {
    // Generic step - simulate success
    return { step, simulated: true, message: `Executed step: ${step}` };
  }

  return executor();
}

async function callStrategy(task: OpsTask): Promise<any> {
  const service = getServiceByName("strategy");
  if (!service) throw new Error("Strategy service not found");

  const response = await fetch(
    `http://localhost:${service.port}/strategy/analyze`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: task.sessionId,
        product: task.params?.product || "Unknown Product",
        niche: task.params?.niche || "general",
      }),
      signal: AbortSignal.timeout(10000),
    }
  );

  if (!response.ok) {
    throw new Error(`Strategy service failed: ${response.statusText}`);
  }

  return response.json();
}

async function callCreativeSuite(task: OpsTask): Promise<any> {
  const service = getServiceByName("creativeSuite");
  if (!service) throw new Error("Creative Suite not found");

  const response = await fetch(
    `http://localhost:${service.port}/creative/generate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: task.sessionId,
        product: task.params?.product || "Unknown Product",
        style: task.params?.style || "modern",
      }),
      signal: AbortSignal.timeout(15000),
    }
  );

  if (!response.ok) {
    throw new Error(`Creative Suite failed: ${response.statusText}`);
  }

  return response.json();
}

async function callVision(task: OpsTask): Promise<any> {
  const service = getServiceByName("vision");
  if (!service) throw new Error("Vision service not found");

  const response = await fetch(
    `http://localhost:${service.port}/vision/suggestEdits`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: task.sessionId,
        videoId: task.params?.videoId || "test-video",
      }),
      signal: AbortSignal.timeout(10000),
    }
  );

  if (!response.ok) {
    throw new Error(`Vision service failed: ${response.statusText}`);
  }

  return response.json();
}

async function callDistribution(task: OpsTask): Promise<any> {
  const service = getServiceByName("distribution");
  if (!service) throw new Error("Distribution service not found");

  const response = await fetch(
    `http://localhost:${service.port}/distribution/planCalendar`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `Ops Distribution - ${task.taskId}`,
        productName: task.params?.product || "Product",
        target: {
          platforms: ["tiktok", "youtube", "instagram"],
          niche: task.params?.niche || "general",
        },
      }),
      signal: AbortSignal.timeout(10000),
    }
  );

  if (!response.ok) {
    throw new Error(`Distribution service failed: ${response.statusText}`);
  }

  return response.json();
}

async function callEngagement(task: OpsTask): Promise<any> {
  const service = getServiceByName("engagement");
  if (!service) throw new Error("Engagement service not found");

  return {
    ok: true,
    message: "Engagement step simulated",
    service: service.name,
  };
}

async function callTelemetry(task: OpsTask): Promise<any> {
  const service = getServiceByName("telemetry");
  if (!service) throw new Error("Telemetry service not found");

  return {
    ok: true,
    message: "Telemetry tracking simulated",
    service: service.name,
  };
}

async function callHands(task: OpsTask): Promise<any> {
  const service = getServiceByName("hands");
  if (!service) throw new Error("Hands service not found");

  return {
    ok: true,
    message: "Hands automation simulated",
    service: service.name,
  };
}

async function callSimulation(task: OpsTask): Promise<any> {
  const service = getServiceByName("simulation");
  if (!service) throw new Error("Simulation service not found");

  return {
    ok: true,
    message: "Simulation step completed",
    service: service.name,
  };
}
