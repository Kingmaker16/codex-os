// Autonomy Engine v1 - Task Decomposer
// Breaks complex goals into actionable steps with dependency mapping

import { v4 as uuidv4 } from 'uuid';
import type { TaskDecomposition, TaskStep } from './types.js';

/**
 * Service capabilities mapping
 */
const SERVICE_CAPABILITIES: Record<string, string[]> = {
  'codex-strategy': ['planning', 'analysis', 'goal-setting', 'decision-making'],
  'codex-knowledge': ['research', 'data-retrieval', 'insights', 'learning'],
  'codex-brain-v2': ['memory', 'context', 'history', 'patterns'],
  'codex-hands-v5': ['social-posting', 'tiktok', 'instagram', 'automation'],
  'codex-vision-2.6': ['image-analysis', 'visual-content', 'OCR', 'detection'],
  'codex-social': ['engagement', 'comments', 'replies', 'social-monitoring'],
  'codex-distribution-v2': ['content-distribution', 'scheduling', 'multi-platform'],
  'codex-ecom': ['product-management', 'orders', 'inventory', 'e-commerce'],
  'codex-ops': ['system-operations', 'monitoring', 'health-checks', 'diagnostics'],
  'codex-creative-suite': ['content-creation', 'design', 'templates', 'assets'],
  'codex-campaign': ['campaign-management', 'tracking', 'optimization'],
  'codex-trends': ['trend-analysis', 'market-research', 'competitive-intel']
};

export class TaskDecomposer {
  /**
   * Decompose a complex goal into actionable steps
   */
  async decompose(goal: string, context?: string): Promise<TaskDecomposition> {
    const steps = this.generateSteps(goal, context);
    const dependencyGraph = this.buildDependencyGraph(steps);
    const parallelizableSteps = this.identifyParallelSteps(steps, dependencyGraph);
    const criticalPath = this.calculateCriticalPath(steps, dependencyGraph);
    const totalDuration = this.estimateTotalDuration(steps, parallelizableSteps);
    const riskAssessment = this.assessOverallRisk(steps);

    return {
      goal,
      steps,
      totalSteps: steps.length,
      estimatedDuration: totalDuration,
      dependencyGraph,
      parallelizableSteps,
      criticalPath,
      riskAssessment
    };
  }

  /**
   * Generate steps from natural language goal
   */
  private generateSteps(goal: string, context?: string): TaskStep[] {
    const goalLower = goal.toLowerCase();
    const steps: TaskStep[] = [];

    // Pattern: "Post X TikTok videos"
    if (goalLower.includes('post') && goalLower.includes('tiktok')) {
      const count = this.extractNumber(goalLower) || 3;

      steps.push({
        id: uuidv4(),
        description: 'Retrieve TikTok credentials from vault',
        action: 'vault_retrieve_credentials',
        targetService: 'codex-vault',
        dependencies: [],
        estimatedDuration: '10s',
        riskLevel: 'low',
        requiresApproval: false
      });

      steps.push({
        id: uuidv4(),
        description: 'Generate content strategy and themes',
        action: 'generate_content_strategy',
        targetService: 'codex-strategy',
        dependencies: [steps[0].id],
        estimatedDuration: '30s',
        riskLevel: 'low',
        requiresApproval: false
      });

      steps.push({
        id: uuidv4(),
        description: `Create ${count} video concepts`,
        action: 'create_video_concepts',
        targetService: 'codex-creative-suite',
        dependencies: [steps[1].id],
        estimatedDuration: '1m',
        riskLevel: 'low',
        requiresApproval: false
      });

      steps.push({
        id: uuidv4(),
        description: `Post ${count} videos to TikTok`,
        action: 'post_tiktok_videos',
        targetService: 'codex-hands-v5',
        dependencies: [steps[2].id],
        estimatedDuration: `${count * 20}s`,
        riskLevel: 'medium',
        requiresApproval: true
      });

      steps.push({
        id: uuidv4(),
        description: 'Monitor engagement and track performance',
        action: 'monitor_engagement',
        targetService: 'codex-social',
        dependencies: [steps[3].id],
        estimatedDuration: '30s',
        riskLevel: 'low',
        requiresApproval: false
      });
    }
    // Pattern: "Analyze X"
    else if (goalLower.includes('analyze') || goalLower.includes('report')) {
      steps.push({
        id: uuidv4(),
        description: 'Gather relevant data and context',
        action: 'gather_data',
        targetService: 'codex-knowledge',
        dependencies: [],
        estimatedDuration: '45s',
        riskLevel: 'low',
        requiresApproval: false
      });

      steps.push({
        id: uuidv4(),
        description: 'Analyze data and generate insights',
        action: 'analyze_data',
        targetService: 'codex-strategy',
        dependencies: [steps[0].id],
        estimatedDuration: '1m',
        riskLevel: 'low',
        requiresApproval: false
      });

      steps.push({
        id: uuidv4(),
        description: 'Generate report and recommendations',
        action: 'generate_report',
        targetService: 'codex-strategy',
        dependencies: [steps[1].id],
        estimatedDuration: '30s',
        riskLevel: 'low',
        requiresApproval: false
      });
    }
    // Pattern: "Create campaign"
    else if (goalLower.includes('campaign') || goalLower.includes('schedule')) {
      steps.push({
        id: uuidv4(),
        description: 'Define campaign objectives and targets',
        action: 'define_campaign',
        targetService: 'codex-strategy',
        dependencies: [],
        estimatedDuration: '1m',
        riskLevel: 'low',
        requiresApproval: false
      });

      steps.push({
        id: uuidv4(),
        description: 'Create content for campaign',
        action: 'create_campaign_content',
        targetService: 'codex-creative-suite',
        dependencies: [steps[0].id],
        estimatedDuration: '2m',
        riskLevel: 'low',
        requiresApproval: false
      });

      steps.push({
        id: uuidv4(),
        description: 'Schedule distribution across platforms',
        action: 'schedule_distribution',
        targetService: 'codex-distribution-v2',
        dependencies: [steps[1].id],
        estimatedDuration: '45s',
        riskLevel: 'medium',
        requiresApproval: true
      });

      steps.push({
        id: uuidv4(),
        description: 'Set up tracking and monitoring',
        action: 'setup_tracking',
        targetService: 'codex-campaign',
        dependencies: [steps[2].id],
        estimatedDuration: '30s',
        riskLevel: 'low',
        requiresApproval: false
      });
    }
    // Generic fallback
    else {
      steps.push({
        id: uuidv4(),
        description: 'Understand and validate goal',
        action: 'validate_goal',
        targetService: 'codex-strategy',
        dependencies: [],
        estimatedDuration: '30s',
        riskLevel: 'low',
        requiresApproval: false
      });

      steps.push({
        id: uuidv4(),
        description: 'Research and gather context',
        action: 'research_context',
        targetService: 'codex-knowledge',
        dependencies: [steps[0].id],
        estimatedDuration: '1m',
        riskLevel: 'low',
        requiresApproval: false
      });

      steps.push({
        id: uuidv4(),
        description: 'Execute primary action',
        action: 'execute_primary',
        targetService: this.inferTargetService(goalLower),
        dependencies: [steps[1].id],
        estimatedDuration: '1m',
        riskLevel: 'medium',
        requiresApproval: true
      });

      steps.push({
        id: uuidv4(),
        description: 'Validate results and report',
        action: 'validate_results',
        targetService: 'codex-ops',
        dependencies: [steps[2].id],
        estimatedDuration: '30s',
        riskLevel: 'low',
        requiresApproval: false
      });
    }

    return steps;
  }

  /**
   * Build dependency graph
   */
  private buildDependencyGraph(steps: TaskStep[]): Record<string, string[]> {
    const graph: Record<string, string[]> = {};

    for (const step of steps) {
      graph[step.id] = step.dependencies;
    }

    return graph;
  }

  /**
   * Identify steps that can run in parallel
   */
  private identifyParallelSteps(
    steps: TaskStep[],
    dependencyGraph: Record<string, string[]>
  ): string[][] {
    const parallelGroups: string[][] = [];
    const processed = new Set<string>();

    // Group steps by dependency level
    let currentLevel: string[] = [];
    
    for (const step of steps) {
      if (step.dependencies.length === 0) {
        currentLevel.push(step.id);
        processed.add(step.id);
      }
    }

    if (currentLevel.length > 0) {
      parallelGroups.push(currentLevel);
    }

    // Process remaining steps level by level
    while (processed.size < steps.length) {
      currentLevel = [];

      for (const step of steps) {
        if (!processed.has(step.id)) {
          const allDependenciesMet = step.dependencies.every(dep => processed.has(dep));
          if (allDependenciesMet) {
            currentLevel.push(step.id);
            processed.add(step.id);
          }
        }
      }

      if (currentLevel.length > 0) {
        parallelGroups.push(currentLevel);
      } else {
        break; // Prevent infinite loop if there are circular dependencies
      }
    }

    return parallelGroups;
  }

  /**
   * Calculate critical path (longest dependency chain)
   */
  private calculateCriticalPath(
    steps: TaskStep[],
    dependencyGraph: Record<string, string[]>
  ): string[] {
    // Simple implementation: return the longest chain
    let longestPath: string[] = [];

    for (const step of steps) {
      const path = this.getPathToStep(step.id, steps, dependencyGraph);
      if (path.length > longestPath.length) {
        longestPath = path;
      }
    }

    return longestPath;
  }

  /**
   * Get full path to a step
   */
  private getPathToStep(
    stepId: string,
    steps: TaskStep[],
    dependencyGraph: Record<string, string[]>
  ): string[] {
    const step = steps.find(s => s.id === stepId);
    if (!step || step.dependencies.length === 0) {
      return [stepId];
    }

    // Get longest path from dependencies
    let longestPath: string[] = [];
    for (const depId of step.dependencies) {
      const depPath = this.getPathToStep(depId, steps, dependencyGraph);
      if (depPath.length > longestPath.length) {
        longestPath = depPath;
      }
    }

    return [...longestPath, stepId];
  }

  /**
   * Estimate total duration considering parallelization
   */
  private estimateTotalDuration(steps: TaskStep[], parallelGroups: string[][]): string {
    let totalSeconds = 0;

    for (const group of parallelGroups) {
      // For parallel groups, take the longest duration
      let maxGroupDuration = 0;

      for (const stepId of group) {
        const step = steps.find(s => s.id === stepId);
        if (step) {
          const seconds = this.parseDuration(step.estimatedDuration);
          maxGroupDuration = Math.max(maxGroupDuration, seconds);
        }
      }

      totalSeconds += maxGroupDuration;
    }

    return this.formatDuration(totalSeconds);
  }

  /**
   * Assess overall risk
   */
  private assessOverallRisk(steps: TaskStep[]): string {
    const highRiskSteps = steps.filter(s => s.riskLevel === 'high').length;
    const mediumRiskSteps = steps.filter(s => s.riskLevel === 'medium').length;
    const requiresApproval = steps.filter(s => s.requiresApproval).length;

    if (highRiskSteps > 0) {
      return `HIGH: ${highRiskSteps} high-risk step(s) detected. ${requiresApproval} step(s) require approval.`;
    } else if (mediumRiskSteps > 2) {
      return `MEDIUM: ${mediumRiskSteps} medium-risk steps. ${requiresApproval} step(s) require approval.`;
    } else {
      return `LOW: ${steps.length} steps planned. ${requiresApproval} step(s) require approval for safety.`;
    }
  }

  /**
   * Infer target service from goal
   */
  private inferTargetService(goal: string): string {
    if (goal.includes('post') || goal.includes('social')) return 'codex-hands-v5';
    if (goal.includes('analyze') || goal.includes('strategy')) return 'codex-strategy';
    if (goal.includes('image') || goal.includes('visual')) return 'codex-vision-2.6';
    if (goal.includes('shop') || goal.includes('product')) return 'codex-ecom';
    if (goal.includes('campaign')) return 'codex-campaign';
    if (goal.includes('distribute')) return 'codex-distribution-v2';
    return 'codex-ops';
  }

  /**
   * Extract number from text
   */
  private extractNumber(text: string): number | null {
    const match = text.match(/\d+/);
    return match ? parseInt(match[0]) : null;
  }

  /**
   * Parse duration string to seconds
   */
  private parseDuration(duration: string): number {
    if (duration.includes('m')) {
      return parseInt(duration) * 60;
    }
    return parseInt(duration);
  }

  /**
   * Format seconds to human-readable duration
   */
  private formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
}

// Singleton instance
export const taskDecomposer = new TaskDecomposer();
