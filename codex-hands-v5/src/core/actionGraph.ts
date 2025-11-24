// =============================================
// H5-CORE: ACTION GRAPH ENGINE
// =============================================

import { ActionNode, ExecutionChain, NodeType } from "../types.js";
import { generateId, timestamp } from "../utils.js";

export class ActionGraph {
  private chains: Map<string, ExecutionChain> = new Map();

  createChain(name: string, nodes: ActionNode[]): ExecutionChain {
    const chain: ExecutionChain = {
      id: generateId(),
      name,
      nodes: nodes.map(n => ({
        ...n,
        id: n.id || generateId(),
        status: "pending",
        retryCount: 0,
        maxRetries: n.maxRetries || 3
      })),
      status: "pending",
      createdAt: timestamp()
    };

    this.chains.set(chain.id, chain);
    return chain;
  }

  getChain(id: string): ExecutionChain | undefined {
    return this.chains.get(id);
  }

  updateNode(chainId: string, nodeId: string, updates: Partial<ActionNode>): void {
    const chain = this.chains.get(chainId);
    if (!chain) return;

    const node = chain.nodes.find(n => n.id === nodeId);
    if (node) {
      Object.assign(node, updates);
    }
  }

  updateChainStatus(chainId: string, status: ExecutionChain["status"]): void {
    const chain = this.chains.get(chainId);
    if (!chain) return;

    chain.status = status;
    if (status === "running" && !chain.startedAt) {
      chain.startedAt = timestamp();
    }
    if (status === "completed" || status === "failed") {
      chain.completedAt = timestamp();
    }
  }

  getExecutableNodes(chainId: string): ActionNode[] {
    const chain = this.chains.get(chainId);
    if (!chain) return [];

    return chain.nodes.filter(node => {
      if (node.status !== "pending") return false;

      // Check if all dependencies are satisfied
      if (node.dependsOn && node.dependsOn.length > 0) {
        const deps = node.dependsOn.map(depId => 
          chain.nodes.find(n => n.id === depId)
        );
        return deps.every(dep => dep?.status === "success");
      }

      return true;
    });
  }

  hasFailedNodes(chainId: string): boolean {
    const chain = this.chains.get(chainId);
    if (!chain) return false;
    return chain.nodes.some(n => n.status === "failed" && (n.retryCount || 0) >= (n.maxRetries || 3));
  }

  allNodesComplete(chainId: string): boolean {
    const chain = this.chains.get(chainId);
    if (!chain) return false;
    return chain.nodes.every(n => n.status === "success" || n.status === "skipped");
  }
}

export const actionGraph = new ActionGraph();
