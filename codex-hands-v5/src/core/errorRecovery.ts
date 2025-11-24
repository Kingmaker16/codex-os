// =============================================
// H5-CORE: ERROR RECOVERY
// =============================================

import { ActionNode, ExecutionChain } from "../types.js";
import { actionGraph } from "./actionGraph.js";
import { executionEngine } from "./executionEngine.js";
import { sleep } from "../utils.js";

export class ErrorRecovery {
  async handleNodeFailure(chainId: string, node: ActionNode, error: Error): Promise<boolean> {
    const retryCount = (node.retryCount || 0) + 1;
    const maxRetries = node.maxRetries || 3;

    console.log(`Node ${node.id} failed (attempt ${retryCount}/${maxRetries}):`, error.message);

    if (retryCount < maxRetries) {
      // Update retry count
      actionGraph.updateNode(chainId, node.id, {
        retryCount,
        status: "pending",
        error: error.message
      });

      // Exponential backoff
      await sleep(1000 * Math.pow(2, retryCount - 1));

      return true; // Will retry
    }

    // Max retries exceeded
    actionGraph.updateNode(chainId, node.id, {
      status: "failed",
      error: `Max retries exceeded: ${error.message}`
    });

    return false; // Cannot retry
  }

  async attemptRecovery(chainId: string, node: ActionNode): Promise<any> {
    // Recovery strategies based on action type
    switch (node.actionType) {
      case "click":
        // Try alternative coordinates or vision-guided click
        return this.recoverClick(node);
      case "type":
        // Clear and retry typing
        return this.recoverType(node);
      default:
        throw new Error("No recovery strategy available");
    }
  }

  private async recoverClick(node: ActionNode): Promise<any> {
    console.log(`Attempting click recovery for node ${node.id}`);
    // In real implementation, use Vision to find alternative coordinates
    return executionEngine.executeAction(node);
  }

  private async recoverType(node: ActionNode): Promise<any> {
    console.log(`Attempting type recovery for node ${node.id}`);
    // Clear field and retry
    return executionEngine.executeAction(node);
  }

  getFailureReport(chain: ExecutionChain): string {
    const failedNodes = chain.nodes.filter(n => n.status === "failed");
    if (failedNodes.length === 0) return "No failures";

    return failedNodes.map(n => 
      `Node ${n.id} (${n.actionType}): ${n.error}`
    ).join("\n");
  }
}

export const errorRecovery = new ErrorRecovery();
