// Autonomy Engine v1 - Decision Engine
// Natural language → structured reasoning with multi-factor scoring

import { safetyEngine } from './safetyEngine.js';
import type {
  AutonomyRequest,
  AutonomyDecision,
  ReasoningTrace,
  MemoryContext
} from './types.js';

export class DecisionEngine {
  /**
   * Evaluate whether to proceed with a goal
   */
  async evaluate(request: AutonomyRequest): Promise<AutonomyDecision> {
    const reasoningTrace: ReasoningTrace[] = [];
    const startTime = Date.now();

    // Step 1: Parse and understand the goal
    reasoningTrace.push({
      step: 1,
      phase: 'Understanding',
      thought: `Analyzing goal: "${request.goal}"`,
      confidence: 95,
      timestamp: new Date().toISOString()
    });

    // Step 2: Safety evaluation
    const safetyGuard = safetyEngine.evaluate(
      request.goal,
      request.context,
      { domain: request.domain }
    );

    reasoningTrace.push({
      step: 2,
      phase: 'Safety Check',
      thought: `Safety assessment: ${safetyGuard.reasoning}. Risk score: ${safetyGuard.riskScore}/100`,
      confidence: 90,
      timestamp: new Date().toISOString()
    });

    // Step 3: Multi-factor scoring
    const scores = this.calculateScores(request, request.memoryContext);

    reasoningTrace.push({
      step: 3,
      phase: 'Multi-Factor Analysis',
      thought: `Context relevance: ${scores.contextRelevance}%, Urgency: ${scores.urgency}%, Domain importance: ${scores.domainImportance}%, Feasibility: ${scores.feasibility}%`,
      confidence: 85,
      timestamp: new Date().toISOString()
    });

    // Step 4: Memory context integration
    if (request.memoryContext) {
      const memoryInsights = this.analyzeMemoryContext(request.memoryContext, request.goal);
      reasoningTrace.push({
        step: 4,
        phase: 'Memory Context',
        thought: memoryInsights,
        confidence: 80,
        timestamp: new Date().toISOString()
      });
    }

    // Step 5: Make decision
    const { action, confidence, reasoning, suggestedNextSteps } = this.makeDecision(
      request,
      safetyGuard,
      scores,
      reasoningTrace
    );

    reasoningTrace.push({
      step: reasoningTrace.length + 1,
      phase: 'Final Decision',
      thought: reasoning,
      confidence,
      timestamp: new Date().toISOString()
    });

    // Estimate duration
    const estimatedDuration = this.estimateDuration(request.goal);

    return {
      action,
      confidence,
      reasoning,
      reasoningTrace,
      safetyGuard,
      suggestedNextSteps,
      estimatedDuration
    };
  }

  /**
   * Calculate multi-factor scores
   */
  private calculateScores(
    request: AutonomyRequest,
    memoryContext?: MemoryContext
  ): {
    contextRelevance: number;
    urgency: number;
    domainImportance: number;
    feasibility: number;
  } {
    // Context relevance (0-100)
    let contextRelevance = 50;
    if (request.context) {
      contextRelevance += 30;
    }
    if (memoryContext?.relevantKnowledge && memoryContext.relevantKnowledge.length > 0) {
      contextRelevance += 20;
    }

    // Urgency (0-100)
    const urgencyMap = {
      low: 25,
      medium: 50,
      high: 75,
      critical: 100
    };
    const urgency = urgencyMap[request.urgency || 'medium'];

    // Domain importance (0-100)
    const domainScores: Record<string, number> = {
      social: 85,
      ecommerce: 80,
      video: 75,
      strategy: 90,
      analytics: 70,
      operations: 65
    };
    const domainImportance = domainScores[request.domain || 'operations'] || 60;

    // Feasibility (0-100)
    let feasibility = 70;
    const goalLower = request.goal.toLowerCase();
    
    // Boost feasibility for common tasks
    if (goalLower.includes('post') || goalLower.includes('create')) feasibility += 15;
    if (goalLower.includes('analyze') || goalLower.includes('report')) feasibility += 10;
    
    // Reduce feasibility for complex tasks
    if (goalLower.includes('multiple') || goalLower.includes('complex')) feasibility -= 15;
    if (goalLower.includes('integration') || goalLower.includes('coordinate')) feasibility -= 10;

    feasibility = Math.max(0, Math.min(100, feasibility));

    return {
      contextRelevance,
      urgency,
      domainImportance,
      feasibility
    };
  }

  /**
   * Analyze memory context for insights
   */
  private analyzeMemoryContext(memoryContext: MemoryContext, goal: string): string {
    const insights: string[] = [];

    if (memoryContext.recentActions.length > 0) {
      insights.push(`Recent actions: ${memoryContext.recentActions.slice(0, 3).join(', ')}`);
    }

    if (memoryContext.historicalPatterns.length > 0) {
      insights.push(`Historical patterns suggest similar tasks were successful`);
    }

    if (memoryContext.userPreferences && Object.keys(memoryContext.userPreferences).length > 0) {
      insights.push(`User preferences indicate this aligns with established workflows`);
    }

    if (memoryContext.relevantKnowledge.length > 0) {
      insights.push(`Found ${memoryContext.relevantKnowledge.length} relevant knowledge entries`);
    }

    return insights.length > 0 
      ? insights.join('. ')
      : 'Limited memory context available for this goal.';
  }

  /**
   * Make the final decision
   */
  private makeDecision(
    request: AutonomyRequest,
    safetyGuard: any,
    scores: any,
    reasoningTrace: ReasoningTrace[]
  ): {
    action: AutonomyDecision['action'];
    confidence: number;
    reasoning: string;
    suggestedNextSteps: string[];
  } {
    // Safety overrides everything
    if (safetyGuard.recommendation === 'block') {
      return {
        action: 'disallow',
        confidence: 100,
        reasoning: `BLOCKED: ${safetyGuard.reasoning}`,
        suggestedNextSteps: ['Manual execution required', 'Review safety constraints']
      };
    }

    if (safetyGuard.recommendation === 'require_user_approval') {
      return {
        action: 'require_user_approval',
        confidence: 95,
        reasoning: `User approval required: ${safetyGuard.reasoning}`,
        suggestedNextSteps: ['Present plan to user', 'Wait for explicit approval']
      };
    }

    // Calculate overall confidence
    const avgScore = (
      scores.contextRelevance +
      scores.urgency +
      scores.domainImportance +
      scores.feasibility
    ) / 4;

    // Reduce confidence based on risk
    const riskPenalty = safetyGuard.riskScore * 0.5; // Max 50% penalty
    const confidence = Math.max(30, Math.min(100, avgScore - riskPenalty));

    // Decision logic based on confidence and safety
    if (safetyGuard.recommendation === 'allow_with_caution') {
      return {
        action: 'allow_with_caution',
        confidence,
        reasoning: `Proceeding with caution. ${safetyGuard.reasoning}. Confidence: ${Math.round(confidence)}%`,
        suggestedNextSteps: [
          'Decompose into monitored steps',
          'Log all actions',
          'Prepare rollback plan'
        ]
      };
    }

    if (confidence >= 70) {
      return {
        action: 'allow',
        confidence,
        reasoning: `Goal is feasible and safe for autonomous execution (confidence: ${Math.round(confidence)}%). Risk: ${safetyGuard.riskScore}/100.`,
        suggestedNextSteps: [
          'Decompose into steps',
          'Execute with monitoring',
          'Report results'
        ]
      };
    }

    if (confidence >= 50) {
      return {
        action: 'allow_with_caution',
        confidence,
        reasoning: `Moderate confidence (${Math.round(confidence)}%). Proceed with enhanced monitoring.`,
        suggestedNextSteps: [
          'Request additional context if needed',
          'Execute with step-by-step validation',
          'Be prepared to pause for user input'
        ]
      };
    }

    return {
      action: 'require_user_approval',
      confidence,
      reasoning: `Low confidence (${Math.round(confidence)}%). Need user guidance before proceeding.`,
      suggestedNextSteps: [
        'Request clarification from user',
        'Gather more context',
        'Propose alternative approaches'
      ]
    };
  }

  /**
   * Estimate duration for the goal
   */
  private estimateDuration(goal: string): string {
    const goalLower = goal.toLowerCase();

    if (goalLower.includes('analyze') || goalLower.includes('report')) {
      return '2-5 minutes';
    }

    if (goalLower.includes('post') && goalLower.match(/\d+/)) {
      const count = parseInt(goalLower.match(/\d+/)?.[0] || '1');
      return `${count * 30} seconds - ${Math.ceil(count / 2)} minutes`;
    }

    if (goalLower.includes('create') || goalLower.includes('generate')) {
      return '1-3 minutes';
    }

    if (goalLower.includes('multiple') || goalLower.includes('several')) {
      return '5-10 minutes';
    }

    return '1-2 minutes';
  }
}

// Singleton instance
export const decisionEngine = new DecisionEngine();
