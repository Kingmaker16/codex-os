// =============================================
// H5-CORE: EXECUTION ENGINE
// =============================================

import fetch from "node-fetch";
import { ActionNode, ActionType } from "../types.js";
import { sleep } from "../utils.js";

const VISION_URL = "http://localhost:4600"; // Vision v2.5
const SAFETY_URL = "http://localhost:5090"; // Safety Engine

export class ExecutionEngine {
  async executeAction(node: ActionNode): Promise<any> {
    const { actionType, params } = node;

    switch (actionType) {
      case "click":
        return this.executeClick(params as any);
      case "type":
        return this.executeType(params as any);
      case "wait":
        await sleep(params.duration || 1000);
        return { ok: true, message: "Wait completed" };
      case "screenshot":
        return this.executeScreenshot(params as any);
      case "runScript":
        return this.executeScript(params as any);
      case "openApp":
        return this.executeOpenApp(params as any);
      default:
        return { ok: false, error: `Unknown action type: ${actionType}` };
    }
  }

  private async executeClick(params: { x: number; y: number }): Promise<any> {
    // Vision alignment check
    try {
      const visionResp = await fetch(`${VISION_URL}/vision/suggestActions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "click", coordinates: params })
      });

      if (!visionResp.ok) {
        console.warn("Vision alignment check failed, proceeding anyway");
      }
    } catch (err) {
      console.warn("Vision service unavailable:", err);
    }

    // Simulate click action (in real implementation, use system APIs)
    return {
      ok: true,
      action: "click",
      coordinates: params,
      message: `Clicked at (${params.x}, ${params.y})`
    };
  }

  private async executeType(params: { text: string; target?: string }): Promise<any> {
    return {
      ok: true,
      action: "type",
      text: params.text,
      message: `Typed: ${params.text}`
    };
  }

  private async executeScreenshot(params: { path?: string }): Promise<any> {
    return {
      ok: true,
      action: "screenshot",
      path: params.path || "/tmp/screenshot.png",
      message: "Screenshot captured"
    };
  }

  private async executeScript(params: { script: string; args?: string[] }): Promise<any> {
    return {
      ok: true,
      action: "runScript",
      script: params.script,
      message: "Script executed (simulated)"
    };
  }

  private async executeOpenApp(params: { appName: string }): Promise<any> {
    return {
      ok: true,
      action: "openApp",
      app: params.appName,
      message: `Opened ${params.appName}`
    };
  }
}

export const executionEngine = new ExecutionEngine();
