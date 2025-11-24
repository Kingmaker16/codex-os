import { CreativeRequest, CreativeConcept } from "./types.js";
import fetch from "node-fetch";
import { v4 as uuid } from "uuid";

export async function generateConcepts(req: CreativeRequest): Promise<CreativeConcept[]> {
  const providers = [
    { name: "openai", model: "gpt-4o" },
    { name: "claude", model: "claude-haiku-4-5-20251001" },
    { name: "gemini", model: "gemini-2.5-flash" },
    { name: "grok", model: "grok-4-latest" }
  ];

  const requests = providers.map(p =>
    fetch(`http://localhost:4000/respond?provider=${p.name}&model=${p.model}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a creative director who specializes in viral content structures." },
          { role: "user", content: `Generate 5 creative concepts for domain: ${req.domain}, niche: ${req.niche}, goal: ${req.goal}` }
        ]
      })
    }).then(r => r.json())
  );

  const results = await Promise.all(requests);

  const concepts: CreativeConcept[] = [];

  for (const r of results) {
    const result = r as any;
    if (!result.output) continue;

    const items = result.output.split("\n").filter((l: string) => l.trim().length > 3);

    items.slice(0, 5).forEach((i: string) => {
      concepts.push({
        id: uuid(),
        type: "video",
        title: i.slice(0, 64),
        description: i,
        confidence: Math.random() * 0.4 + 0.6,
        sourceModels: [result.model || "unknown"]
      });
    });
  }

  return concepts;
}
