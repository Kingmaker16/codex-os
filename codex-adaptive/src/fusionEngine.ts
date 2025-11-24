import fetch from "node-fetch";

export async function fuseInsights(prompt: string) {
  const models = [
    { provider: "openai", model: "gpt-4o" },
    { provider: "claude", model: "claude-3-5-sonnet-20241022" },
    { provider: "gemini", model: "gemini-2.5-flash" },
    { provider: "grok", model: "grok-4-latest" }
  ];

  const results: string[] = [];
  for (const m of models) {
    try {
      const res = await fetch(`http://localhost:4000/respond?provider=${m.provider}&model=${m.model}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500
        })
      });
      const data = await res.json() as any;
      results.push(data.output || "");
    } catch (err) {
      results.push(`Error from ${m.provider}: ${err}`);
    }
  }
  return results;
}
