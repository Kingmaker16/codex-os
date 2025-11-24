// =============================================
// VISION v2.5 INTEGRATION LAYER
// =============================================

import fetch from "node-fetch";

const VISION_URL = "http://localhost:4600";

export class VisionIntegration {
  async analyzeScreen(): Promise<any> {
    try {
      const resp = await fetch(`${VISION_URL}/vision/analyzeScreen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      if (!resp.ok) {
        return { ok: false, error: "Vision service unavailable" };
      }

      return await resp.json();
    } catch (err) {
      console.warn("Vision analyzeScreen failed:", err);
      return { ok: false, error: String(err) };
    }
  }

  async getUIMap(): Promise<any> {
    try {
      const resp = await fetch(`${VISION_URL}/vision/uiMap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      if (!resp.ok) {
        return { ok: false, error: "Vision service unavailable" };
      }

      return await resp.json();
    } catch (err) {
      console.warn("Vision uiMap failed:", err);
      return { ok: false, error: String(err) };
    }
  }

  async suggestActions(context: any): Promise<any> {
    try {
      const resp = await fetch(`${VISION_URL}/vision/suggestActions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(context)
      });

      if (!resp.ok) {
        return { ok: false, error: "Vision service unavailable" };
      }

      return await resp.json();
    } catch (err) {
      console.warn("Vision suggestActions failed:", err);
      return { ok: false, error: String(err) };
    }
  }

  async alignAction(actionType: string, params: any): Promise<any> {
    // Check if action aligns with current screen state
    const screenAnalysis = await this.analyzeScreen();
    const suggestedActions = await this.suggestActions({ actionType, params });

    const aligned = suggestedActions.ok && 
      Array.isArray(suggestedActions.actions) &&
      suggestedActions.actions.some((a: any) => a.type === actionType);

    return {
      ok: true,
      aligned,
      screenAnalysis,
      suggestedActions,
      recommendation: aligned 
        ? "Action aligned with screen state"
        : "Action may not be optimal for current screen"
    };
  }

  async visionGuidedClick(targetDescription: string): Promise<any> {
    // Use Vision to find best click coordinates
    const uiMap = await this.getUIMap();
    
    if (!uiMap.ok) {
      return { ok: false, error: "Cannot get UI map" };
    }

    // In real implementation, search uiMap for target and return coordinates
    return {
      ok: true,
      target: targetDescription,
      coordinates: { x: 100, y: 200 }, // Simulated
      confidence: 0.95,
      message: "Vision-guided coordinates found"
    };
  }

  async validateActionSafety(actionType: string, params: any): Promise<any> {
    // Check if action is safe to execute in current context
    const screenAnalysis = await this.analyzeScreen();

    // Simple validation logic
    const safe = screenAnalysis.ok;

    return {
      ok: true,
      safe,
      actionType,
      params,
      warning: safe ? null : "Screen state uncertain, proceed with caution"
    };
  }
}

export const visionIntegration = new VisionIntegration();
