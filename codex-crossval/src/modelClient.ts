import fetch from "node-fetch";
import { ModelOutput } from "./types.js";

const PROVIDERS = [
  { provider: "openai",  model: "gpt-4o" },
  { provider: "claude",  model: "claude-3-5-sonnet-20241022" },
  { provider: "gemini",  model: "gemini-2.5-flash" },
  { provider: "grok",    model: "grok-4-latest" }
];

export async function callAllModels(prompt: string, maxTokens: number = 256): Promise<ModelOutput[]> {
  const calls = PROVIDERS.map(async p => {
    try {
      const resp = await fetch(
        `http://localhost:4000/respond?provider=${p.provider}&model=${p.model}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            max_tokens: maxTokens
          })
        }
      );
      const data = await resp.json().catch(() => ({}));
      return {
        provider: p.provider,
        model: p.model,
        rawOutput: (data as any).output ?? ""
      } as ModelOutput;
    } catch {
      return {
        provider: p.provider,
        model: p.model,
        rawOutput: ""
      };
    }
  });

  const results = await Promise.all(calls);
  return results;
}
