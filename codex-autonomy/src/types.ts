// Autonomy Engine v1 - Type Definitions

/**
 * Reasoning trace step for explainability
 */
export interface ReasoningTrace {
  step: number;
  phase: string;
  thought: string;
  confidence: number;
  timestamp: string;
}

/**
 * Memory context from Brain v2
 */
export interface MemoryContext {
  recentActions: string[];
  userPreferences: Record<string, any>;
  historicalPatterns: string[];
  relevantKnowledge: string[];
}

/**
 * Autonomy request for evaluation
 */
export interface AutonomyRequest {
  goal: string;
  context?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  domain?: string;
  memoryContext?: MemoryContext;
  userId?: string;
}

/**
 * Safety guard evaluation result
 */
export interface SafetyGuardResult {
  safe: boolean;
  riskScore: number; // 0-100
  guardrailsTriggered: string[];
  prohibitedActions: string[];
  recommendation: 'allow' | 'allow_with_caution' | 'block' | 'require_user_approval';
  reasoning: string;
}

/**
 * Autonomy decision
 */
export interface AutonomyDecision {
  action: 'allow' | 'allow_with_caution' | 'disallow' | 'require_user_approval';
  confidence: number; // 0-100
  reasoning: string;
  reasoningTrace: ReasoningTrace[];
  safetyGuard: SafetyGuardResult;
  suggestedNextSteps?: string[];
  estimatedDuration?: string;
}

/**
 * Task decomposition step
 */
export interface TaskStep {
  id: string;
  description: string;
  action: string;
  targetService?: string;
  dependencies: string[];
  estimatedDuration: string;
  riskLevel: 'low' | 'medium' | 'high';
  requiresApproval: boolean;
}

/**
 * Task decomposition result
 */
export interface TaskDecomposition {
  goal: string;
  steps: TaskStep[];
  totalSteps: number;
  estimatedDuration: string;
  dependencyGraph: Record<string, string[]>;
  parallelizableSteps: string[][];
  criticalPath: string[];
  riskAssessment: string;
}

/**
 * Delegation request
 */
export interface DelegationRequest {
  task: string;
  targetService: string;
  context?: string;
  parameters?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high';
  timeout?: number;
}

/**
 * Delegation result
 */
export interface DelegationResult {
  success: boolean;
  targetService: string;
  task: string;
  response?: any;
  error?: string;
  safetyCheck: SafetyGuardResult;
  executionTime: number;
  timestamp: string;
}

/**
 * Action plan for semi-autonomous execution
 */
export interface ActionPlan {
  id: string;
  goal: string;
  steps: TaskStep[];
  currentStep: number;
  status: 'pending' | 'in_progress' | 'paused' | 'completed' | 'failed';
  safetyStatus: 'safe' | 'caution' | 'blocked';
  continuationAllowed: boolean;
  requiresUserInput: boolean;
  reasoningTrace: ReasoningTrace[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Continuation request
 */
export interface ContinuationRequest {
  planId: string;
  userApproval?: boolean;
  additionalContext?: string;
}

/**
 * Continuation result
 */
export interface ContinuationResult {
  planId: string;
  continued: boolean;
  currentStep: number;
  totalSteps: number;
  status: string;
  nextAction?: string;
  awaitingApproval: boolean;
  reasoningTrace: ReasoningTrace[];
}

/**
 * Service endpoint mapping
 */
export interface ServiceEndpoint {
  name: string;
  port: number;
  capabilities: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Evaluation result for planning
 */
export interface EvaluationResult {
  goal: string;
  feasible: boolean;
  decision: AutonomyDecision;
  decomposition?: TaskDecomposition;
  estimatedCost?: string;
  alternativeApproaches?: string[];
}
