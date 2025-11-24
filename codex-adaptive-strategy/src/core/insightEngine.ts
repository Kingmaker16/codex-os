import { AdaptiveInsight } from "../types.js";
import { v4 as uuid } from "uuid";
import fetch from "node-fetch";

const PROVIDERS = [
  { provider: "openai", model: "gpt-4o" },
  { provider: "anthropic", model: "claude-3-5-sonnet-20241022" },
  { provider: "gemini", model: "gemini-2.0-flash-exp" },
  { provider: "openai", model: "gpt-4o-mini", label: "gpt-4o-mini" }
];

interface ProviderResult {
  provider: string;
  model: string;
  output: string | null;
  error?: any;
}

export async function generateInsights(goal: string, context: any): Promise<AdaptiveInsight[]> {
  const results: ProviderResult[] = [];

  const prompt = `As a strategic advisor, provide 2-3 concise strategic insights for this goal: "${goal}". 
Context: ${JSON.stringify(context || {})}

Format your response as bullet points with actionable insights.`;

  for (const p of PROVIDERS) {
    try {
      const resp = await fetch(`http://localhost:4000/respond?provider=${p.provider}&model=${p.model}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          max_tokens: 400
        })
      });

      const data: any = await resp.json();
      const output = data.choices?.[0]?.message?.content || data.content?.[0]?.text || data.output || null;

      results.push({ 
        provider: p.label || p.provider, 
        model: p.model,
        output 
      });

    } catch (err: any) {
      results.push({ 
        provider: p.label || p.provider, 
        model: p.model,
        output: null, 
        error: err.message 
      });
    }
  }

  return results.map((r, idx) => {
    const confidence = r.output ? (0.7 + (idx * 0.05)) : 0.3;
    
    return {
      id: uuid(),
      title: `Strategic Insight from ${r.provider}`,
      description: r.output || `Error: ${r.error || "No output"}`,
      confidence,
      impact: r.output ? (0.6 + (idx * 0.05)) : 0.2,
      requiresApproval: r.provider.includes("claude") || confidence < 0.5,
      sourceModels: [r.model],
      actionItems: r.output ? [
        "Review strategic insight",
        "Validate against business objectives",
        "Execute through Orchestrator if approved"
      ] : [
        "Review error details",
        "Retry with different provider"
      ]
    };
  });
}
