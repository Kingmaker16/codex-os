/**
 * Model Selector - Orchestrator Intelligence v2.0
 * 
 * Chooses which AI provider/model to use for planning and reasoning tasks.
 */

import type { OrchestratorTask } from "../intents/taskGraph.js";

export interface ModelSelection {
  provider: string;
  model: string;
}

/**
 * Select the best model for a given task type
 */
export function selectModelForTask(task: OrchestratorTask): ModelSelection {
  const type = task.type.toLowerCase();

  // Reasoning-heavy tasks (planning, analysis, complex decisions)
  if (
    type.includes("plan") ||
    type.includes("analyze") ||
    type.includes("research") ||
    type.includes("diagnose")
  ) {
    // Claude Sonnet 3.5 for complex reasoning
    return { provider: "claude", model: "claude-3-5-sonnet-20241022" };
  }

  // Creative text generation (captions, scripts, content)
  if (
    type.includes("caption") ||
    type.includes("script") ||
    type.includes("creative") ||
    type.includes("write")
  ) {
    // GPT-4o for creative tasks
    return { provider: "openai", model: "gpt-4o" };
  }

  // Code-related tasks
  if (
    type.includes("code") ||
    type.includes("debug") ||
    type.includes("implement")
  ) {
    // GPT-4o or DeepSeek for coding
    return { provider: "openai", model: "gpt-4o" };
    // TODO: Add DeepSeek when available in bridge
  }

  // Video/image generation tasks
  if (type.includes("video") || type.includes("image")) {
    // Use specialized models when available
    return { provider: "openai", model: "gpt-4o" };
  }

  // Default: GPT-4o for general tasks
  return { provider: "openai", model: "gpt-4o" };
}

/**
 * Select model for orchestration planning (interpreting user commands)
 */
export function selectPlanningModel(): ModelSelection {
  // Claude Sonnet 3.5 for complex task decomposition
  return { provider: "claude", model: "claude-3-5-sonnet-20241022" };
}

/**
 * Get model configuration with fallbacks
 * TODO: Query telemetry to check model availability and latency
 */
export function getModelWithFallback(preferred: ModelSelection): ModelSelection[] {
  const fallbacks: ModelSelection[] = [preferred];

  // Add fallback options
  if (preferred.provider === "claude") {
    fallbacks.push({ provider: "openai", model: "gpt-4o" });
  } else if (preferred.provider === "openai") {
    fallbacks.push({ provider: "claude", model: "claude-3-5-sonnet-20241022" });
  }

  // Always have a final fallback
  fallbacks.push({ provider: "openai", model: "gpt-4o-mini" });

  return fallbacks;
}

/**
 * Estimate cost for a model call
 * TODO: Integrate with monetization engine for real cost tracking
 */
export function estimateModelCost(model: ModelSelection, tokens: number): number {
  // Rough cost estimates (per 1M tokens)
  const costs: Record<string, number> = {
    "gpt-4o": 5.0,
    "gpt-4o-mini": 0.15,
    "claude-3-5-sonnet-20241022": 3.0,
    "claude-3-5-haiku-20241022": 1.0,
    "claude-3-opus-20240229": 15.0,
  };

  const costPer1M = costs[model.model] || 1.0;
  return (tokens / 1_000_000) * costPer1M;
}
