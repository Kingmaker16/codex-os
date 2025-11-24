// Autonomy Engine v1 - API Router

import type { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { decisionEngine } from './decisionEngine.js';
import { taskDecomposer } from './taskDecomposer.js';
import { delegationEngine } from './delegationEngine.js';
import type {
  AutonomyRequest,
  DelegationRequest,
  ContinuationRequest,
  ActionPlan
} from './types.js';

// In-memory store for action plans
const actionPlans = new Map<string, ActionPlan>();

export function registerRoutes(fastify: FastifyInstance) {
  /**
   * Health check
   */
  fastify.get('/health', async () => {
    return {
      ok: true,
      service: 'codex-autonomy',
      version: '1.0.0',
      mode: 'SEMI-AUTONOMOUS',
      capabilities: [
        'decision-making',
        'task-decomposition',
        'safe-delegation',
        'workflow-continuation',
        'safety-enforcement'
      ]
    };
  });

  /**
   * Evaluate a decision
   */
  fastify.post<{ Body: AutonomyRequest }>('/autonomy/evaluate', async (request) => {
    const autonomyRequest = request.body;

    if (!autonomyRequest.goal) {
      return {
        error: 'Goal is required',
        action: 'disallow',
        confidence: 0
      };
    }

    const decision = await decisionEngine.evaluate(autonomyRequest);

    return {
      goal: autonomyRequest.goal,
      ...decision
    };
  });

  /**
   * Decompose a task
   */
  fastify.post<{ Body: { goal: string; context?: string } }>('/autonomy/decompose', async (request) => {
    const { goal, context } = request.body;

    if (!goal) {
      return {
        error: 'Goal is required'
      };
    }

    const decomposition = await taskDecomposer.decompose(goal, context);

    return decomposition;
  });

  /**
   * Delegate a task
   */
  fastify.post<{ Body: DelegationRequest }>('/autonomy/delegate', async (request) => {
    const delegationRequest = request.body;

    // Validate request
    const validation = delegationEngine.validateRequest(delegationRequest);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    const result = await delegationEngine.delegate(delegationRequest);

    return result;
  });

  /**
   * Create an action plan
   */
  fastify.post<{ Body: AutonomyRequest }>('/autonomy/plan', async (request) => {
    const autonomyRequest = request.body;

    if (!autonomyRequest.goal) {
      return {
        error: 'Goal is required'
      };
    }

    // Evaluate decision
    const decision = await decisionEngine.evaluate(autonomyRequest);

    // If not allowed, return decision
    if (decision.action === 'disallow') {
      return {
        error: 'Goal not allowed',
        decision
      };
    }

    // Decompose task
    const decomposition = await taskDecomposer.decompose(
      autonomyRequest.goal,
      autonomyRequest.context
    );

    // Create action plan
    const planId = uuidv4();
    const plan: ActionPlan = {
      id: planId,
      goal: autonomyRequest.goal,
      steps: decomposition.steps,
      currentStep: 0,
      status: decision.action === 'require_user_approval' ? 'pending' : 'in_progress',
      safetyStatus: decision.safetyGuard.safe ? 'safe' : 'caution',
      continuationAllowed: decision.action === 'allow' || decision.action === 'allow_with_caution',
      requiresUserInput: decision.action === 'require_user_approval',
      reasoningTrace: decision.reasoningTrace,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    actionPlans.set(planId, plan);

    return {
      planId,
      plan,
      decision,
      decomposition
    };
  });

  /**
   * Continue execution of an action plan
   */
  fastify.post<{ Body: ContinuationRequest }>('/autonomy/continue', async (request) => {
    const { planId, userApproval, additionalContext } = request.body;

    if (!planId) {
      return {
        error: 'Plan ID is required'
      };
    }

    const plan = actionPlans.get(planId);
    if (!plan) {
      return {
        error: 'Plan not found'
      };
    }

    // Check if user approval is required
    if (plan.requiresUserInput && !userApproval) {
      return {
        planId,
        continued: false,
        currentStep: plan.currentStep,
        totalSteps: plan.steps.length,
        status: 'awaiting_approval',
        awaitingApproval: true,
        reasoningTrace: plan.reasoningTrace,
        message: 'User approval required to continue'
      };
    }

    // Check if continuation is allowed
    if (!plan.continuationAllowed) {
      return {
        planId,
        continued: false,
        currentStep: plan.currentStep,
        totalSteps: plan.steps.length,
        status: 'blocked',
        awaitingApproval: false,
        reasoningTrace: plan.reasoningTrace,
        message: 'Continuation not allowed due to safety constraints'
      };
    }

    // Execute next step
    const currentStep = plan.steps[plan.currentStep];
    if (!currentStep) {
      return {
        planId,
        continued: false,
        currentStep: plan.currentStep,
        totalSteps: plan.steps.length,
        status: 'completed',
        awaitingApproval: false,
        reasoningTrace: plan.reasoningTrace,
        message: 'All steps completed'
      };
    }

    // Delegate if target service is specified
    let delegationResult;
    if (currentStep.targetService) {
      delegationResult = await delegationEngine.delegate({
        task: currentStep.description,
        targetService: currentStep.targetService,
        context: additionalContext,
        parameters: {}
      });

      // Check if delegation failed critically
      if (!delegationResult.success && delegationResult.safetyCheck.recommendation === 'block') {
        plan.status = 'failed';
        plan.safetyStatus = 'blocked';
        plan.updatedAt = new Date().toISOString();
        actionPlans.set(planId, plan);

        return {
          planId,
          continued: false,
          currentStep: plan.currentStep,
          totalSteps: plan.steps.length,
          status: 'failed',
          awaitingApproval: false,
          reasoningTrace: plan.reasoningTrace,
          error: delegationResult.error,
          message: 'Step failed due to safety block'
        };
      }
    }

    // Move to next step
    plan.currentStep += 1;
    plan.updatedAt = new Date().toISOString();

    // Check if more steps remain
    const hasMoreSteps = plan.currentStep < plan.steps.length;
    if (!hasMoreSteps) {
      plan.status = 'completed';
    }

    // Check if next step requires approval
    const nextStep = plan.steps[plan.currentStep];
    const needsApproval = nextStep?.requiresApproval || false;

    actionPlans.set(planId, plan);

    return {
      planId,
      continued: true,
      currentStep: plan.currentStep,
      totalSteps: plan.steps.length,
      status: plan.status,
      nextAction: nextStep?.description,
      awaitingApproval: needsApproval,
      reasoningTrace: plan.reasoningTrace,
      completedStep: currentStep.description,
      delegationResult
    };
  });

  /**
   * Get plan status
   */
  fastify.get<{ Params: { planId: string } }>('/autonomy/plan/:planId', async (request) => {
    const { planId } = request.params;

    const plan = actionPlans.get(planId);
    if (!plan) {
      return {
        error: 'Plan not found'
      };
    }

    return plan;
  });

  /**
   * Get available services
   */
  fastify.get('/autonomy/services', async () => {
    return {
      services: delegationEngine.getAvailableServices()
    };
  });

  /**
   * Get all active plans
   */
  fastify.get('/autonomy/plans', async () => {
    const plans = Array.from(actionPlans.values());
    return {
      count: plans.length,
      plans: plans.map(p => ({
        id: p.id,
        goal: p.goal,
        status: p.status,
        currentStep: p.currentStep,
        totalSteps: p.steps.length,
        safetyStatus: p.safetyStatus,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }))
    };
  });
}
