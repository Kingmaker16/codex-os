import type { StrategyQuestion, StrategyPlan, StrategyEvaluation, StrategyPlay } from "./types.js";
import { getModelSuggestions } from "./multiModelFusion.js";
import { buildPlaybookForQuestion } from "./playbookEngine.js";
import { mergePlays } from "./strategyKernel.js";
import fetch from "node-fetch";

// In-memory storage for plans (TODO: persist to Brain)
const planCache = new Map<string, StrategyPlan>();

const TRENDS_URL = "http://localhost:5060";

/**
 * Build a comprehensive strategy plan from a strategic question
 * Combines base playbooks + AI model suggestions + optional trend context
 */
export async function buildStrategyPlan(q: StrategyQuestion): Promise<StrategyPlan> {
  console.log(`[DecisionEngine] Building strategy plan for: ${q.goal}`);
  
  // Try to get trend context (non-blocking)
  let trendContext: string | undefined;
  try {
    trendContext = await getTrendContext(q);
    if (trendContext) {
      console.log(`[DecisionEngine] Enriched with trend context: ${trendContext.slice(0, 100)}...`);
    }
  } catch (error) {
    console.warn(`[DecisionEngine] Failed to get trend context:`, error);
    // Continue without trends
  }
  
  // Get AI model suggestions (GPT-4, Claude, Gemini, Grok)
  const modelResults = await getModelSuggestions(q);
  console.log(`[DecisionEngine] Received ${modelResults.plays.length} plays from ${modelResults.modelsUsed.length} models`);
  
  // Get base playbook plays enriched with Knowledge Engine
  const playbookPlays = await buildPlaybookForQuestion(q);
  console.log(`[DecisionEngine] Loaded ${playbookPlays.length} playbook plays`);
  
  // Merge and deduplicate plays
  const allPlays = mergePlays(playbookPlays, modelResults.plays);
  console.log(`[DecisionEngine] Merged to ${allPlays.length} total plays`);
  
  // Create the strategy plan
  const plan: StrategyPlan = {
    id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    sessionId: q.sessionId,
    domains: q.domain,
    goal: q.goal,
    horizonDays: q.horizonDays,
    plays: allPlays,
    createdAt: new Date().toISOString(),
    sourceModels: modelResults.modelsUsed,
    trendContext
  };
  
  // Cache the plan
  planCache.set(plan.id, plan);
  
  console.log(`[DecisionEngine] Created plan ${plan.id} with ${plan.plays.length} plays`);
  return plan;
}

/**
 * Fetch trend context from Trend Engine
 */
async function getTrendContext(q: StrategyQuestion): Promise<string | undefined> {
  try {
    // Extract niche from goal (simple heuristic)
    const goalLower = q.goal.toLowerCase();
    let niche = "general";
    
    if (goalLower.includes("fitness") || goalLower.includes("workout")) {
      niche = "home fitness";
    } else if (goalLower.includes("food") || goalLower.includes("recipe")) {
      niche = "food";
    } else if (goalLower.includes("tech") || goalLower.includes("gadget")) {
      niche = "tech";
    } else if (goalLower.includes("fashion") || goalLower.includes("style")) {
      niche = "fashion";
    } else if (goalLower.includes("beauty") || goalLower.includes("makeup")) {
      niche = "beauty";
    }
    
    const response = await fetch(`${TRENDS_URL}/trends/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: q.sessionId,
        platform: "all",
        niche: niche,
        language: "en"
      })
    });
    
    if (!response.ok) {
      return undefined;
    }
    
    const data: any = await response.json();
    return data.summary;
  } catch (error) {
    return undefined;
  }
}

/**
 * Retrieve a plan from cache
 */
export function getPlan(planId: string): StrategyPlan | undefined {
  return planCache.get(planId);
}

/**
 * Get all cached plans
 */
export function getAllPlans(): StrategyPlan[] {
  return Array.from(planCache.values());
}

/**
 * Evaluate strategy performance and recommend adjustments
 * TODO: Integrate with real analytics from Social, Ecomm, Monetization engines
 */
export async function evaluateStrategy(planId: string): Promise<StrategyEvaluation> {
  console.log(`[DecisionEngine] Evaluating strategy plan: ${planId}`);
  
  const plan = planCache.get(planId);
  
  if (!plan) {
    throw new Error(`Plan not found: ${planId}`);
  }
  
  // TODO: Implement real performance evaluation
  // - Query Social Engine for engagement metrics if social domain
  // - Query Ecomm Engine for revenue/conversion if ecomm domain
  // - Query Monetization Engine for profit metrics
  // - Analyze which plays were executed and their outcomes
  // - Use ML to predict which plays should continue/modify/drop
  
  // Stub evaluation for now
  const evaluation: StrategyEvaluation = {
    planId: planId,
    performanceSummary: `Evaluation stub — Plan ${planId} created ${Math.floor((Date.now() - Date.parse(plan.createdAt)) / 1000 / 60)} minutes ago. Real metrics integration pending.`,
    keepPlays: plan.plays.slice(0, Math.ceil(plan.plays.length / 2)).map(p => p.id),
    modifyPlays: plan.plays.slice(Math.ceil(plan.plays.length / 2), Math.ceil(plan.plays.length * 0.75)).map(p => p.id),
    dropPlays: plan.plays.slice(Math.ceil(plan.plays.length * 0.75)).map(p => p.id),
    nextActions: [
      `Execute the ${plan.plays.length} plays in the plan for ${plan.horizonDays} days`,
      "Track metrics daily: engagement (social), revenue (ecomm), execution rate",
      "Return here in 3 days for mid-point evaluation",
      "Prepare to adjust plays based on early signals"
    ]
  };
  
  console.log(`[DecisionEngine] Evaluation complete for ${planId}`);
  return evaluation;
}

/**
 * TODO: Advanced decision engine features
 * - Implement play sequencing (what order makes sense)
 * - Add prerequisite validation (don't suggest plays missing prereqs)
 - Implement confidence scoring for each play
 * - Add resource estimation (time, money, effort per play)
 * - Implement portfolio optimization (balance risk/reward across plays)
 * - Add historical performance lookup (which plays worked before)
 * - Implement automated A/B test suggestions
 * - Add market timing signals (when to execute each play)
 */
