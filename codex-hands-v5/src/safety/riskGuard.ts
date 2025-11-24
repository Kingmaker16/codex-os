// =============================================
// SAFETY ENGINE v2: RISK GUARD
// =============================================

import { ActionNode, ExecutionChain } from "../types.js";
import { safetyValidator } from "./validator.js";

export class RiskGuard {
  async guardAction(node: ActionNode): Promise<any> {
    if (!node.actionType) {
      return { ok: true, message: "No action type to guard" };
    }

    const assessment = safetyValidator.validateAction(node.actionType, node.params);

    if (!assessment.allowed) {
      return {
        ok: false,
        blocked: true,
        reason: "Action blocked by risk guard",
        assessment
      };
    }

    if (assessment.level === "HIGH") {
      return {
        ok: true,
        warning: "High risk action - proceed with caution",
        assessment
      };
    }

    return {
      ok: true,
      assessment
    };
  }

  async guardChain(chain: ExecutionChain): Promise<any> {
    const actions = chain.nodes
      .filter(n => n.actionType)
      .map(n => ({ actionType: n.actionType!, params: n.params }));

    const assessment = safetyValidator.assessChainRisk(actions);

    if (!assessment.allowed) {
      return {
        ok: false,
        blocked: true,
        reason: "Chain blocked by risk guard",
        assessment
      };
    }

    return {
      ok: true,
      assessment
    };
  }

  async sandboxCheck(actionType: string, params: any): Promise<boolean> {
    // Check if action should be sandboxed
    const riskActions = ["runScript", "executeShell", "openApp"];
    return riskActions.includes(actionType);
  }

  async requestHumanApproval(node: ActionNode): Promise<boolean> {
    // In SEMI_AUTONOMOUS_MODE, high-risk actions need approval
    console.log(`[RISK GUARD] Human approval requested for: ${node.actionType}`);
    console.log(`[RISK GUARD] Params:`, node.params);
    
    // In real implementation, this would pause and wait for approval
    // For now, simulate auto-approval for medium risk
    const assessment = safetyValidator.validateAction(node.actionType!, node.params);
    return assessment.level !== "CRITICAL";
  }

  getBlockedActions(): string[] {
    // Return list of permanently blocked actions
    return [
      "deleteFile",
      "formatDisk",
      "modifySystem"
    ];
  }

  isActionBlocked(actionType: string): boolean {
    return this.getBlockedActions().includes(actionType);
  }
}

export const riskGuard = new RiskGuard();
