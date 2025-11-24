import { v4 as uuid } from "uuid";
import { fuseInsights } from "./fusionEngine.js";
import { InsightProposal, ContextInput } from "./types.js";

export async function generateAdaptiveInsights(input: ContextInput): Promise<InsightProposal[]> {
  const prompt = `
You analyze multi-domain business operations.
Goal: ${input.goal}
Domains: ${input.domain.join(", ")}
Recent Metrics: ${JSON.stringify(input.recentMetrics)}

Return 3 actionable strategic insights with:
- title
- description
- confidence (0-1)
- impact (0-1)
- actions (array)
- requiresApproval (true for any action that changes strategy or affects risk)
  `;

  const responses = await fuseInsights(prompt);

  return responses.slice(0, 3).map((text, idx) => ({
    id: uuid(),
    title: `Insight ${idx + 1}`,
    description: text.trim().slice(0, 300),
    confidence: 0.7,
    impact: 0.8,
    requiresApproval: idx === 0,
    actions: ["Action placeholder"],
    sourceModels: ["openai", "claude", "gemini", "grok"]
  }));
}
