import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";
import { Weakness, Pattern, Recommendation, Domain } from "./types.js";

const BRIDGE_URL = "http://localhost:4000";

const MODELS = [
  { provider: "openai", model: "gpt-4o" },
  { provider: "claude", model: "claude-3-5-sonnet-20241022" },
  { provider: "gemini", model: "gemini-2.5-flash" },
  { provider: "grok", model: "grok-4-latest" }
];

export async function generateRecommendations(
  domain: Domain,
  weaknesses: Weakness[],
  patterns: Pattern[],
  useLLM: boolean = true
): Promise<{ recommendations: Recommendation[]; llmConsensus?: string }> {
  const recommendations: Recommendation[] = [];

  // Rule-based recommendations
  for (const weakness of weaknesses) {
    const rec = generateRuleBasedRecommendation(domain, weakness);
    if (rec) recommendations.push(rec);
  }

  // Pattern-based recommendations
  for (const pattern of patterns) {
    const rec = generatePatternBasedRecommendation(domain, pattern);
    if (rec) recommendations.push(rec);
  }

  // LLM-enhanced recommendations
  let llmConsensus: string | undefined;
  if (useLLM && (weaknesses.length > 0 || patterns.length > 0)) {
    const prompt = buildRecommendationPrompt(domain, weaknesses, patterns);
    llmConsensus = await getLLMConsensus(prompt);
    
    const llmRecs = parseLLMRecommendations(llmConsensus);
    recommendations.push(...llmRecs);
  }

  return { recommendations, llmConsensus };
}

function generateRuleBasedRecommendation(
  domain: Domain,
  weakness: Weakness
): Recommendation | null {
  const metric = weakness.metric;
  const severity = weakness.severity;

  if (metric === "ctr") {
    return {
      id: uuidv4(),
      priority: severity,
      category: "Content Optimization",
      action: "Improve thumbnail and title optimization",
      rationale: `CTR is ${weakness.description}. Strong thumbnails and titles drive initial clicks.`,
      expectedImpact: "+0.2-0.5% CTR increase",
      requiresApproval: severity === "HIGH",
      estimatedEffort: "MEDIUM"
    };
  }

  if (metric === "engagement") {
    return {
      id: uuidv4(),
      priority: severity,
      category: "Engagement Strategy",
      action: "Enhance call-to-action and interactive elements",
      rationale: weakness.description,
      expectedImpact: "+15-25% engagement boost",
      requiresApproval: severity === "HIGH",
      estimatedEffort: "LOW"
    };
  }

  if (metric === "trendVelocity") {
    return {
      id: uuidv4(),
      priority: severity,
      category: "Trend Alignment",
      action: "Increase trend monitoring frequency and response time",
      rationale: weakness.description,
      expectedImpact: "+0.1-0.3 velocity improvement",
      requiresApproval: false,
      estimatedEffort: "LOW"
    };
  }

  if (metric === "watchTime") {
    return {
      id: uuidv4(),
      priority: severity,
      category: "Content Quality",
      action: "Optimize video pacing and hook strength",
      rationale: weakness.description,
      expectedImpact: "+5-10 seconds avg watch time",
      requiresApproval: severity === "HIGH",
      estimatedEffort: "HIGH"
    };
  }

  return null;
}

function generatePatternBasedRecommendation(
  domain: Domain,
  pattern: Pattern
): Recommendation | null {
  if (pattern.name.includes("Frequency Saturation")) {
    return {
      id: uuidv4(),
      priority: "MEDIUM",
      category: "Posting Strategy",
      action: "Reduce posting frequency by 20-30%",
      rationale: pattern.description,
      expectedImpact: "+30-40% engagement per post",
      requiresApproval: true,
      estimatedEffort: "LOW"
    };
  }

  if (pattern.name.includes("Monetization Efficiency")) {
    return {
      id: uuidv4(),
      priority: "HIGH",
      category: "Revenue Optimization",
      action: "Optimize ad placement and increase mid-roll frequency",
      rationale: pattern.description,
      expectedImpact: "+$2-3 RPM increase",
      requiresApproval: true,
      estimatedEffort: "MEDIUM"
    };
  }

  if (pattern.name.includes("Engagement-Revenue Gap")) {
    return {
      id: uuidv4(),
      priority: "HIGH",
      category: "Monetization Strategy",
      action: "Implement affiliate links and product placements",
      rationale: pattern.description,
      expectedImpact: "+25-40% revenue per engagement",
      requiresApproval: true,
      estimatedEffort: "MEDIUM"
    };
  }

  return null;
}

async function getLLMConsensus(prompt: string): Promise<string> {
  const responses: string[] = [];

  for (const model of MODELS) {
    try {
      const resp = await fetch(
        `${BRIDGE_URL}/respond?provider=${model.provider}&model=${model.model}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            max_tokens: 512
          })
        }
      );
      const data = await resp.json() as any;
      if (data.output) responses.push(data.output);
    } catch {}
  }

  // Return longest response as consensus
  responses.sort((a, b) => b.length - a.length);
  return responses[0] || "No LLM recommendations available";
}

function buildRecommendationPrompt(
  domain: Domain,
  weaknesses: Weakness[],
  patterns: Pattern[]
): string {
  const weaknessSummary = weaknesses
    .map(w => `- ${w.metric}: ${w.description} (${w.severity})`)
    .join("\n");

  const patternSummary = patterns
    .map(p => `- ${p.name}: ${p.description} (confidence: ${p.confidence})`)
    .join("\n");

  return `You are a performance optimization expert for ${domain} domain in Codex OS.

Identified Weaknesses:
${weaknessSummary}

Detected Patterns:
${patternSummary}

Provide:
1. Top 3 actionable recommendations
2. Expected impact for each
3. Implementation priority

Keep response under 400 words.`;
}

function parseLLMRecommendations(llmOutput: string): Recommendation[] {
  // Simplified parsing - in production, use structured output
  const recs: Recommendation[] = [];
  
  // Extract recommendations from LLM output
  if (llmOutput.includes("recommend") || llmOutput.includes("suggest")) {
    recs.push({
      id: uuidv4(),
      priority: "MEDIUM",
      category: "AI-Generated Strategy",
      action: "Review LLM consensus recommendations",
      rationale: llmOutput.slice(0, 200),
      expectedImpact: "Varies - see full consensus",
      requiresApproval: true,
      estimatedEffort: "MEDIUM",
      llmSource: "Multi-model consensus"
    });
  }

  return recs;
}
