import fetch from "node-fetch";
import type { StrategyQuestion, StrategyPlay, StrategyDomain } from "./types.js";

const ORCHESTRATOR_URL = "http://localhost:4200";

/**
 * Get strategic suggestions from multiple LLM models via Bridge
 * Fuses results from GPT-4, Claude, Gemini, and Grok
 */
export async function getModelSuggestions(q: StrategyQuestion): Promise<{ 
  plays: StrategyPlay[]; 
  modelsUsed: string[] 
}> {
  const prompt = buildStrategyPrompt(q);
  
  // Query multiple models in parallel
  const modelRequests = [
    queryModel("openai", "gpt-4o", prompt, q.domain[0]),
    queryModel("anthropic", "claude-sonnet-4-20250514", prompt, q.domain[0]),
    queryModel("google", "gemini-2.0-flash-exp", prompt, q.domain[0]),
    queryModel("xai", "grok-2-latest", prompt, q.domain[0])
  ];

  const results = await Promise.allSettled(modelRequests);
  
  const allPlays: StrategyPlay[] = [];
  const modelsUsed: string[] = [];

  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      allPlays.push(...result.value.plays);
      modelsUsed.push(result.value.model);
    }
  }

  // If all models failed, return stub plays
  if (allPlays.length === 0) {
    console.warn("[MultiModelFusion] All models failed, using stub plays");
    return {
      plays: getStubPlays(q.domain[0]),
      modelsUsed: ["stub"]
    };
  }

  return { plays: allPlays, modelsUsed };
}

/**
 * Build a strategic prompt for LLMs
 */
function buildStrategyPrompt(q: StrategyQuestion): string {
  return `You are a strategic advisor helping plan a ${q.horizonDays}-day business strategy.

Goal: ${q.goal}
Domains: ${q.domain.join(", ")}

Provide 3-5 specific, actionable tactical plays to achieve this goal. For each play:
1. Give a clear description (one sentence)
2. Explain the rationale (why this works)
3. Assess risk level (low/medium/high)
4. Note any prerequisites

Focus on high-leverage actions that can be executed within ${q.horizonDays} days.
Format each play as: [PLAY] description | [RATIONALE] reason | [RISK] level | [PREREQ] requirements`;
}

/**
 * Query a single model via Orchestrator → Bridge
 */
async function queryModel(
  provider: string, 
  model: string, 
  prompt: string,
  domain: StrategyDomain
): Promise<{ plays: StrategyPlay[]; model: string } | null> {
  try {
    // TODO: Implement real Bridge API call via Orchestrator
    // For now, stub the response
    
    /*
    const response = await fetch(`${ORCHESTRATOR_URL}/bridge/respond?provider=${provider}&model=${model}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a strategic business advisor." },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      console.warn(`[MultiModelFusion] Model ${model} returned error:`, response.status);
      return null;
    }

    const result = await response.json();
    const plays = parseModelResponse(result.content, domain, model);
    
    return { plays, model };
    */

    // Stub implementation
    return {
      plays: getStubPlays(domain, model),
      model: `${provider}/${model}`
    };
  } catch (error) {
    console.error(`[MultiModelFusion] Error querying ${provider}/${model}:`, error);
    return null;
  }
}

/**
 * Parse LLM response into StrategyPlay objects
 */
function parseModelResponse(content: string, domain: StrategyDomain, model: string): StrategyPlay[] {
  // TODO: Implement robust parsing of LLM responses
  // Look for [PLAY], [RATIONALE], [RISK], [PREREQ] markers
  // Extract structured data
  
  const plays: StrategyPlay[] = [];
  
  // For now, return empty (stub plays will be used)
  return plays;
}

/**
 * Stub plays for testing without real LLM calls
 */
function getStubPlays(domain: StrategyDomain, model?: string): StrategyPlay[] {
  const modelPrefix = model ? `${model.split('/')[0]}-` : "ai-";
  
  const stubPlaysByDomain: Record<StrategyDomain, StrategyPlay[]> = {
    social: [
      {
        id: `${modelPrefix}social-viral-hooks`,
        domain: "social",
        description: "Test 5 viral hook patterns in first 3 seconds of videos",
        rationale: "Hook quality determines 80% of retention. Testing reveals what resonates with your audience.",
        riskLevel: "low"
      },
      {
        id: `${modelPrefix}social-post-schedule`,
        domain: "social",
        description: "Post at 7am, 12pm, and 7pm daily to maximize engagement windows",
        rationale: "Timing posts during peak engagement hours increases initial velocity, signaling quality to algorithm.",
        riskLevel: "low"
      }
    ],
    ecomm: [
      {
        id: `${modelPrefix}ecomm-ad-testing`,
        domain: "ecomm",
        description: "Launch 5 ad variations with different value propositions",
        rationale: "Ad variation testing finds the winning angle faster than optimizing a single creative.",
        riskLevel: "medium"
      },
      {
        id: `${modelPrefix}ecomm-upsell`,
        domain: "ecomm",
        description: "Add one-click upsell at checkout for complementary product",
        rationale: "Post-purchase upsells have 30-40% conversion rate and immediately boost AOV.",
        riskLevel: "low"
      }
    ],
    trading: [
      {
        id: `${modelPrefix}trading-risk-management`,
        domain: "trading",
        description: "Set max 2% risk per trade with hard stop-loss rules",
        rationale: "Risk management prevents blow-up scenarios. 2% risk allows 50 losses before account wipeout.",
        riskLevel: "low"
      }
    ],
    kingmaker: [
      {
        id: `${modelPrefix}kingmaker-network`,
        domain: "kingmaker",
        description: "Reach out to 10 creators per day with personalized collaboration ideas",
        rationale: "Volume creates opportunities. 10/day = 70 touchpoints in 7 days, likely yielding 3-5 responses.",
        riskLevel: "low"
      }
    ],
    creative: [
      {
        id: `${modelPrefix}creative-template`,
        domain: "creative",
        description: "Build 3 content templates that can be reused with variable product/topic",
        rationale: "Templates reduce production time by 80% while maintaining quality and consistency.",
        riskLevel: "low"
      }
    ]
  };

  return stubPlaysByDomain[domain] || [];
}

/**
 * TODO: Complete Bridge integration
 * - Implement real HTTP calls to Bridge via Orchestrator
 * - Add retry logic for failed model queries
 * - Implement sophisticated response parsing (handle various LLM output formats)
 * - Add model-specific prompt engineering
 * - Add confidence scoring for each model's suggestions
 * - Implement voting/consensus mechanism when models disagree
 */
