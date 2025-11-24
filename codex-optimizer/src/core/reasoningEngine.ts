import fetch from "node-fetch";

const BRIDGE_URL = "http://localhost:4000";

const MODELS = [
  { provider: "openai", model: "gpt-4o" },
  { provider: "claude", model: "claude-3-5-sonnet-20241022" },
  { provider: "gemini", model: "gemini-2.5-flash" },
  { provider: "grok", model: "grok-4-latest" }
];

export async function getLLMConsensus(prompt: string, maxTokens: number = 512): Promise<string> {
  const responses: string[] = [];

  for (const m of MODELS) {
    try {
      const resp = await fetch(
        `${BRIDGE_URL}/respond?provider=${m.provider}&model=${m.model}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            max_tokens: maxTokens
          })
        }
      );
      const data = await resp.json() as any;
      if (data.output) {
        responses.push(data.output);
      }
    } catch {}
  }

  if (responses.length === 0) {
    return "No LLM responses available.";
  }

  // Return longest response as consensus
  responses.sort((a, b) => b.length - a.length);
  return responses[0];
}

export async function generateOptimizationReasoning(
  domain: string,
  kpiSummary: string
): Promise<string> {
  const prompt = `You are an expert Codex OS optimizer analyzing ${domain} domain performance.

KPI Summary:
${kpiSummary}

Provide:
1. Top 3 optimization opportunities
2. Impact estimation (HIGH/MEDIUM/LOW)
3. Actionable recommendations
4. Risk assessment

Keep response under 400 words.`;

  return getLLMConsensus(prompt, 512);
}
