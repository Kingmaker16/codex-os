// Autonomy Engine v1 - Delegation Engine
// Safe delegation to authorized services with semi-autonomous enforcement

import { safetyEngine } from './safetyEngine.js';
import type { DelegationRequest, DelegationResult } from './types.js';

/**
 * Service endpoints with risk levels
 */
const SERVICE_ENDPOINTS: Record<string, { port: number; riskLevel: 'low' | 'medium' | 'high' }> = {
  'codex-hands-v5': { port: 4300, riskLevel: 'medium' },
  'codex-vision-2.6': { port: 4660, riskLevel: 'low' },
  'codex-social': { port: 4800, riskLevel: 'medium' },
  'codex-distribution-v2': { port: 5301, riskLevel: 'medium' },
  'codex-ecom': { port: 5100, riskLevel: 'high' },
  'codex-ops': { port: 5350, riskLevel: 'low' }
};

export class DelegationEngine {
  /**
   * Delegate a task to a target service
   */
  async delegate(request: DelegationRequest): Promise<DelegationResult> {
    const startTime = Date.now();

    // Validate service exists and is authorized
    if (!SERVICE_ENDPOINTS[request.targetService]) {
      return {
        success: false,
        targetService: request.targetService,
        task: request.task,
        error: `Service ${request.targetService} is not authorized for delegation`,
        safetyCheck: {
          safe: false,
          riskScore: 100,
          guardrailsTriggered: ['unauthorized_service'],
          prohibitedActions: [request.targetService],
          recommendation: 'block',
          reasoning: 'Service not in authorized list'
        },
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }

    // Safety check
    const safetyCheck = safetyEngine.validateDelegation(request.targetService, request.task);

    if (!safetyCheck.safe) {
      return {
        success: false,
        targetService: request.targetService,
        task: request.task,
        error: `Safety check failed: ${safetyCheck.reasoning}`,
        safetyCheck,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }

    // Semi-autonomous rule: Never execute destructive actions
    if (this.isDestructive(request.task)) {
      return {
        success: false,
        targetService: request.targetService,
        task: request.task,
        error: 'Destructive actions not allowed in semi-autonomous mode',
        safetyCheck: {
          ...safetyCheck,
          safe: false,
          recommendation: 'block',
          reasoning: 'Destructive action detected - requires manual execution'
        },
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }

    // Simulate delegation (in production, would make actual HTTP request)
    try {
      const response = await this.executeDelegation(request);

      return {
        success: true,
        targetService: request.targetService,
        task: request.task,
        response,
        safetyCheck,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        targetService: request.targetService,
        task: request.task,
        error: error.message || 'Delegation failed',
        safetyCheck,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Execute the actual delegation (simulated for now)
   */
  private async executeDelegation(request: DelegationRequest): Promise<any> {
    const endpoint = SERVICE_ENDPOINTS[request.targetService];

    // In production, this would be:
    // const response = await fetch(`http://localhost:${endpoint.port}/execute`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     task: request.task,
    //     context: request.context,
    //     parameters: request.parameters
    //   })
    // });
    // return await response.json();

    // Simulation mode - return mock response
    return {
      status: 'simulated',
      service: request.targetService,
      task: request.task,
      message: `Task would be delegated to ${request.targetService} on port ${endpoint.port}`,
      parameters: request.parameters,
      riskLevel: endpoint.riskLevel,
      note: 'This is a simulation. In production, actual service call would be made.'
    };
  }

  /**
   * Check if task is destructive
   */
  private isDestructive(task: string): boolean {
    const destructiveKeywords = [
      'delete',
      'remove',
      'drop',
      'truncate',
      'destroy',
      'erase',
      'wipe',
      'purge',
      'revoke',
      'terminate'
    ];

    const taskLower = task.toLowerCase();
    return destructiveKeywords.some(keyword => taskLower.includes(keyword));
  }

  /**
   * Batch delegate multiple tasks
   */
  async delegateMany(requests: DelegationRequest[]): Promise<DelegationResult[]> {
    // Execute delegations in sequence to maintain safety monitoring
    const results: DelegationResult[] = [];

    for (const request of requests) {
      const result = await this.delegate(request);
      results.push(result);

      // Stop if any delegation fails critically
      if (!result.success && result.safetyCheck.recommendation === 'block') {
        console.warn(`[DelegationEngine] Batch stopped due to blocked delegation: ${request.task}`);
        break;
      }
    }

    return results;
  }

  /**
   * Get available services
   */
  getAvailableServices(): Array<{ name: string; port: number; riskLevel: string }> {
    return Object.entries(SERVICE_ENDPOINTS).map(([name, config]) => ({
      name,
      port: config.port,
      riskLevel: config.riskLevel
    }));
  }

  /**
   * Validate delegation request
   */
  validateRequest(request: DelegationRequest): { valid: boolean; error?: string } {
    if (!request.task || request.task.trim().length === 0) {
      return { valid: false, error: 'Task is required' };
    }

    if (!request.targetService || request.targetService.trim().length === 0) {
      return { valid: false, error: 'Target service is required' };
    }

    if (!SERVICE_ENDPOINTS[request.targetService]) {
      return { valid: false, error: `Unknown service: ${request.targetService}` };
    }

    return { valid: true };
  }
}

// Singleton instance
export const delegationEngine = new DelegationEngine();
