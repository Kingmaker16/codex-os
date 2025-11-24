import fetch from "node-fetch";
import type { StrategyPlan, StrategyEvaluation } from "./types.js";

const BRAIN_URL = "http://localhost:4100";

/**
 * Log strategy plan to Brain for learning and retrieval
 */
export async function logPlan(plan: StrategyPlan): Promise<void> {
  try {
    const event = {
      sessionId: "codex-strategy-plans",
      timestamp: plan.createdAt,
      type: "strategy_plan_created",
      data: {
        planId: plan.id,
        originalSessionId: plan.sessionId,
        domains: plan.domains,
        goal: plan.goal,
        horizonDays: plan.horizonDays,
        playCount: plan.plays.length,
        plays: plan.plays.map(p => ({
          id: p.id,
          domain: p.domain,
          description: p.description,
          riskLevel: p.riskLevel
        })),
        sourceModels: plan.sourceModels
      }
    };
    
    const response = await fetch(`${BRAIN_URL}/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event)
    });
    
    if (!response.ok) {
      console.warn("[BrainLogger] Failed to log plan to Brain:", response.status);
    } else {
      console.log(`[BrainLogger] Logged plan ${plan.id} to Brain`);
    }
  } catch (error) {
    console.error("[BrainLogger] Error logging plan to Brain:", error);
  }
}

/**
 * Log strategy evaluation to Brain for learning
 */
export async function logEvaluation(evaluation: StrategyEvaluation): Promise<void> {
  try {
    const event = {
      sessionId: "codex-strategy-evals",
      timestamp: new Date().toISOString(),
      type: "strategy_evaluation",
      data: {
        planId: evaluation.planId,
        performanceSummary: evaluation.performanceSummary,
        keepPlaysCount: evaluation.keepPlays.length,
        modifyPlaysCount: evaluation.modifyPlays.length,
        dropPlaysCount: evaluation.dropPlays.length,
        keepPlays: evaluation.keepPlays,
        modifyPlays: evaluation.modifyPlays,
        dropPlays: evaluation.dropPlays,
        nextActions: evaluation.nextActions
      }
    };
    
    const response = await fetch(`${BRAIN_URL}/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event)
    });
    
    if (!response.ok) {
      console.warn("[BrainLogger] Failed to log evaluation to Brain:", response.status);
    } else {
      console.log(`[BrainLogger] Logged evaluation for plan ${evaluation.planId} to Brain`);
    }
  } catch (error) {
    console.error("[BrainLogger] Error logging evaluation to Brain:", error);
  }
}

/**
 * TODO: Enhanced Brain integration
 * - Implement plan retrieval from Brain (restore old plans)
 * - Query Brain for historical performance of similar plays
 * - Add feedback loop: Brain learns which plays work best
 * - Implement play recommendation engine based on Brain history
 * - Add user preference learning (which domains/risk levels user prefers)
 * - Track long-term strategy evolution over months
 */
