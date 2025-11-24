// Autonomy Engine v1 - Safety Engine
// Enforces guardrails and risk assessment for semi-autonomous operations

import type { SafetyGuardResult } from './types.js';

/**
 * Prohibited actions that should never be executed autonomously
 */
const PROHIBITED_ACTIONS = [
  'delete account',
  'delete database',
  'drop table',
  'remove all',
  'format drive',
  'rm -rf',
  'shutdown system',
  'transfer funds',
  'purchase',
  'make payment',
  'deploy to production',
  'modify security settings',
  'change password',
  'revoke access',
  'delete credentials'
];

/**
 * Hard guardrails - absolute limits
 */
const HARD_GUARDRAILS = {
  maxCostPerAction: 100, // USD
  maxApiCallsPerMinute: 50,
  maxDataModificationMB: 100,
  maxAccountsAffected: 5,
  requireApprovalForExternalAPIs: true
};

/**
 * Soft guardrails - warnings but allowed with caution
 */
const SOFT_GUARDRAILS = {
  warnCostPerAction: 10, // USD
  warnApiCallsPerMinute: 20,
  warnDataModificationMB: 10,
  warnMultiServiceCalls: 3
};

/**
 * Risk factors and their weights
 */
interface RiskFactors {
  destructivePotential: number; // 0-25
  externalAPIUsage: number; // 0-20
  dataModification: number; // 0-20
  multiServiceCoordination: number; // 0-15
  userDataAccess: number; // 0-20
}

export class SafetyEngine {
  /**
   * Evaluate safety of an autonomous action
   */
  evaluate(goal: string, context?: string, parameters?: Record<string, any>): SafetyGuardResult {
    const riskFactors = this.assessRiskFactors(goal, context, parameters);
    const riskScore = this.calculateRiskScore(riskFactors);
    const prohibitedActions = this.detectProhibitedActions(goal);
    const guardrailsTriggered = this.checkGuardrails(goal, parameters);

    // Determine recommendation based on risk score and violations
    let recommendation: SafetyGuardResult['recommendation'];
    let reasoning: string;

    if (prohibitedActions.length > 0) {
      recommendation = 'block';
      reasoning = `Prohibited actions detected: ${prohibitedActions.join(', ')}. These actions require manual execution.`;
    } else if (riskScore >= 60) {
      recommendation = 'require_user_approval';
      reasoning = `High risk score (${riskScore}/100). Requires explicit user approval before proceeding.`;
    } else if (riskScore >= 30 || guardrailsTriggered.length > 0) {
      recommendation = 'allow_with_caution';
      reasoning = `Moderate risk (${riskScore}/100). Proceed with monitoring and logging. Guardrails: ${guardrailsTriggered.join(', ') || 'none'}.`;
    } else {
      recommendation = 'allow';
      reasoning = `Low risk (${riskScore}/100). Safe for autonomous execution within semi-autonomous constraints.`;
    }

    return {
      safe: recommendation === 'allow' || recommendation === 'allow_with_caution',
      riskScore,
      guardrailsTriggered,
      prohibitedActions,
      recommendation,
      reasoning
    };
  }

  /**
   * Assess individual risk factors
   */
  private assessRiskFactors(goal: string, context?: string, parameters?: Record<string, any>): RiskFactors {
    const goalLower = goal.toLowerCase();
    const contextLower = context?.toLowerCase() || '';

    // Destructive potential (0-25)
    let destructivePotential = 0;
    if (goalLower.includes('delete') || goalLower.includes('remove')) destructivePotential += 15;
    if (goalLower.includes('modify') || goalLower.includes('update')) destructivePotential += 5;
    if (goalLower.includes('all') || goalLower.includes('multiple')) destructivePotential += 5;

    // External API usage (0-20)
    let externalAPIUsage = 0;
    const externalAPIs = ['tiktok', 'instagram', 'youtube', 'twitter', 'facebook', 'shopify', 'stripe'];
    for (const api of externalAPIs) {
      if (goalLower.includes(api)) externalAPIUsage += 5;
    }
    externalAPIUsage = Math.min(externalAPIUsage, 20);

    // Data modification (0-20)
    let dataModification = 0;
    if (goalLower.includes('create') || goalLower.includes('post')) dataModification += 8;
    if (goalLower.includes('edit') || goalLower.includes('change')) dataModification += 10;
    if (goalLower.includes('database') || goalLower.includes('storage')) dataModification += 12;

    // Multi-service coordination (0-15)
    let multiServiceCoordination = 0;
    const serviceCount = (parameters?.targetServices?.length || 0);
    if (serviceCount > 3) multiServiceCoordination = 15;
    else if (serviceCount > 1) multiServiceCoordination = 8;
    else if (goalLower.includes('multiple') || goalLower.includes('several')) multiServiceCoordination = 10;

    // User data access (0-20)
    let userDataAccess = 0;
    if (goalLower.includes('credential') || goalLower.includes('password')) userDataAccess += 20;
    if (goalLower.includes('personal') || goalLower.includes('private')) userDataAccess += 15;
    if (goalLower.includes('account') || goalLower.includes('profile')) userDataAccess += 8;

    return {
      destructivePotential: Math.min(destructivePotential, 25),
      externalAPIUsage: Math.min(externalAPIUsage, 20),
      dataModification: Math.min(dataModification, 20),
      multiServiceCoordination: Math.min(multiServiceCoordination, 15),
      userDataAccess: Math.min(userDataAccess, 20)
    };
  }

  /**
   * Calculate overall risk score (0-100)
   */
  private calculateRiskScore(factors: RiskFactors): number {
    const score = 
      factors.destructivePotential +
      factors.externalAPIUsage +
      factors.dataModification +
      factors.multiServiceCoordination +
      factors.userDataAccess;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Detect prohibited actions
   */
  private detectProhibitedActions(goal: string): string[] {
    const goalLower = goal.toLowerCase();
    const detected: string[] = [];

    for (const prohibited of PROHIBITED_ACTIONS) {
      if (goalLower.includes(prohibited)) {
        detected.push(prohibited);
      }
    }

    return detected;
  }

  /**
   * Check guardrails
   */
  private checkGuardrails(goal: string, parameters?: Record<string, any>): string[] {
    const triggered: string[] = [];

    // Check cost limits
    const estimatedCost = parameters?.estimatedCost || 0;
    if (estimatedCost > HARD_GUARDRAILS.maxCostPerAction) {
      triggered.push(`Cost exceeds limit: $${estimatedCost} > $${HARD_GUARDRAILS.maxCostPerAction}`);
    } else if (estimatedCost > SOFT_GUARDRAILS.warnCostPerAction) {
      triggered.push(`Cost warning: $${estimatedCost} (soft limit: $${SOFT_GUARDRAILS.warnCostPerAction})`);
    }

    // Check multi-service calls
    const serviceCount = parameters?.targetServices?.length || 0;
    if (serviceCount >= SOFT_GUARDRAILS.warnMultiServiceCalls) {
      triggered.push(`Multi-service warning: ${serviceCount} services involved`);
    }

    // Check external API requirement
    const usesExternalAPI = goal.toLowerCase().match(/tiktok|instagram|youtube|twitter|shopify|stripe/);
    if (usesExternalAPI && HARD_GUARDRAILS.requireApprovalForExternalAPIs) {
      triggered.push('External API usage requires approval');
    }

    return triggered;
  }

  /**
   * Validate delegation is safe
   */
  validateDelegation(targetService: string, task: string): SafetyGuardResult {
    // Add delegation-specific safety checks
    const result = this.evaluate(task, `Delegating to ${targetService}`, { targetServices: [targetService] });
    
    // Additional check: ensure service is in allowed list
    const allowedServices = [
      'codex-hands-v5',
      'codex-vision-2.6',
      'codex-social',
      'codex-distribution-v2',
      'codex-ecom',
      'codex-ops'
    ];

    if (!allowedServices.includes(targetService)) {
      return {
        ...result,
        safe: false,
        recommendation: 'block',
        reasoning: `Service ${targetService} is not authorized for delegation.`,
        prohibitedActions: [...result.prohibitedActions, `delegate_to_${targetService}`]
      };
    }

    return result;
  }
}

// Singleton instance
export const safetyEngine = new SafetyEngine();
