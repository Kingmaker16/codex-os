import { CreativeRequest, CreativeResponse } from "./types.js";
import { generateConcepts } from "./fusionEngine.js";

export async function runCreativeEngine(req: CreativeRequest): Promise<CreativeResponse> {
  const concepts = await generateConcepts(req);

  const nicheInsights = `High-level creative insights for niche "${req.niche}" generated dynamically from multi-model fusion.`;

  return {
    ok: true,
    concepts,
    nicheInsights
  };
}
